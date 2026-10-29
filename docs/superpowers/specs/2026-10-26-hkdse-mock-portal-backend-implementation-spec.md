# HKDSE Mock Exam Portal Backend Implementation Specification

**Date:** 2026-10-26  
**Status:** Draft for implementation planning  
**Decision baseline:** Product and system rules confirmed in conversations on 2026-10-26, 2026-10-27, and 2026-10-29
**Scope:** First production backend for the HKDSE mock-exam portal

This specification translates the confirmed product decisions into a provider-neutral backend design. It does not authorize production deployment or select payment, email, or legal/compliance providers. Items labelled **Open before implementation** must be decided before the relevant feature is coded.

The existing [frontend prototype design](./2026-10-24-hkdse-mock-portal-frontend-prototype-design.md) remains a fake-data prototype specification. Where it describes auto-enrollment or subscription-dependent behavior that conflicts with this document, this newer backend specification is the current product baseline. The prototype itself is not changed by this document.

## 1. Product and operational baseline

- Initial product: weekly HKDSE Mathematics Paper 2 multiple-choice mock examinations, with Traditional Chinese and English paper language options.
- Sales: single-exam purchase and an unlimited 30-day monthly subscription.
- Trial prices: HK$29 per sitting and HK$99 per 30-day subscription. Both are hypotheses to validate, not final price commitments.
- Monthly subscriptions are manually renewed and never auto-renew. Early renewal appends 30 days to the current expiry; a purchase after expiry starts a new 30-day term at payment time.
- Monthly subscribers manually select and confirm each sitting. A sitting is eligible if registration is open and its scheduled start falls within the effective subscription period. Confirmed bookings remain valid after subscription expiry.
- A monthly booking may be cancelled before the sitting starts and replaced by another eligible booking. A single-purchase booking may also be cancelled before the sitting starts, but cancellation is irreversible, non-refundable, and non-transferable; joining another sitting requires a new purchase. Neither type can be cancelled at or after the sitting start.
- All paid candidates can view their score and correct options after common result release. A monthly-covered sitting additionally grants explanations, topic analysis, and cross-week progress; those detailed results remain accessible after expiry.
- A sitting has one formal attempt. The server closes attempts at the common deadline using the latest server-confirmed answers. Offline answering is unsupported.
- 500 simultaneous active candidates is the initial load-test target; it is not a capacity guarantee until tested.

## 2. System architecture

```text
Student / administrator browser
        |
        +-- React + Vite static application
        |       +-- Cloudflare Pages
        |
        +-- Supabase
                +-- Auth: email OTP; administrator MFA
                +-- PostgreSQL: data, RLS, transactional RPCs
                +-- Edge Functions: protected workflows and integrations
                +-- Private Storage: incident evidence and paper assets
                +-- Cron / scheduled functions: deadlines, publication, retries

Hosted checkout -- verified webhook --> Edge Function --> PostgreSQL
PostgreSQL notification outbox --> email provider
                              \--> Telegram reminder when linked
```

### 2.1 Platform boundaries

- Host the static React application on Cloudflare Pages.
- Use a dedicated Supabase project in Singapore for each environment. Development and production must not share data, credentials, or redirect URLs.
- Use Supabase Auth for email OTP. Enforce MFA for administrator accounts and invite administrators rather than allowing public administrator registration.
- Use PostgreSQL Row Level Security (RLS) for row ownership. Use narrow Postgres functions for atomic state changes and Edge Functions for authenticated workflows, webhooks, scheduled work, and external integrations.
- Store all secrets in Supabase/Cloudflare secret configuration. Never expose a service-role key or payment secret to browser code.
- Keep payment and email integrations behind provider adapters until vendors are chosen. No card details are stored by the portal.
- Use Asia/Hong_Kong for user-facing schedules and store timestamps as `timestamptz` in UTC.

### 2.2 Responsibility split

| Component | Responsibilities |
|---|---|
| React client | Display public sittings; collect user choices; show exam state; debounce answer saves; display server acknowledgements and errors |
| RLS-protected Supabase API | Read permitted student-owned data and public published sitting metadata |
| Postgres RPCs | Atomic answer save, booking/cancellation checks, attempt finalization, scoring state transitions |
| Edge Functions | Hosted checkout creation, verified webhooks, admin actions, account deletion, incident workflow, batch cancellation, result publication, notification dispatch |
| Scheduled jobs | Finalize due attempts, process result-release jobs, retry outbox delivery, detect stuck workflows |
| Cloudflare Pages | Serve the static frontend only; no server-side business secrets |

## 3. Data model

Use UUID primary keys, foreign keys with deliberate deletion behavior, `timestamptz` timestamps, database constraints, and unique idempotency keys for externally retried operations. The identifiers below are proposed names and can be adjusted to the repository's migration conventions.

### 3.1 Accounts and administration

**`profiles`**

- `id`: stable internal profile UUID used by portal records.
- `auth_user_id`: nullable unique reference to `auth.users`; set to null on account deletion.
- `account_status`: `active` or `deleted`.
- `interface_language`, `notification_language`.
- `created_at`, `deleted_at`.
- Do not store date of birth, age, HKID, school, or other unapproved profile data.

**`admin_memberships`**

- `profile_id`, `role`, `invited_by`, `created_at`, `revoked_at`.
- Server-side admin actions must verify both this membership and the authenticated MFA assurance level.
- A profile cannot grant itself an administrator role.

Keep authentication PII in the authentication provider rather than copying email addresses into attempts, answers, or result rows. If the account is deleted, remove authentication credentials and direct PII, null `auth_user_id`, and retain the minimal profile tombstone with `account_status='deleted'`.

### 3.2 Exam content and sittings

**`papers`**, **`paper_versions`**, **`paper_imports`**, **`questions`**, **`choices`**, **`answer_keys`**, **`explanations`**, **`course_taxonomies`**, **`topics`**, **`taxonomy_crosswalks`**

- A published paper version is immutable. Edits create a new version.
- Store bilingual question and choice content with explicit language fields.
- Keep answer keys in a private schema or otherwise inaccessible to `anon` and ordinary authenticated clients.
- Store explanation language and topic mapping separately from the answer key.
- `course_taxonomies` identify imported, externally defined HKDSE Mathematics syllabus/framework versions. `topics` contain stable internal IDs, exact Traditional Chinese and English official labels, and parent-child relationships for main topics and subtopics.
- Questions are authored outside the portal and imported as versioned strict JSON. The source schema contains paper content and course/taxonomy version only; sitting schedule, prices, and registration settings are configured separately in the portal.
- Each question's source JSON contains bilingual prompt, choices, correct answer, explanation, main-topic name, and subtopic name. Topic labels must be exact bilingual values from the applicable taxonomy version; an explicit `unclassified` sentinel is allowed when the generator cannot assign a topic. Preserve the original source JSON, schema version, and converter version.
- The portal validates the entire file before creating a draft. Structural or required-field errors reject the complete import; no partial paper is created. Valid input is transformed into the portal's canonical paper format.
- Topic assignment is completed outside the portal and supplied in the generated JSON; the portal does not call an AI service or semantically review labels. Valid labels normalize to internal topic IDs. An explicit `unclassified` value permanently excludes that question from topic analytics, but not scoring. A non-empty label outside the applicable allowlist is an import validation error.
- Save subtopic labels for question-bank management/filtering, but first-release student analytics use main topics only.
- An administrator checks transformation fidelity by comparing the first, middle, and last questions' source JSON with the converted portal representation. This is not a content/answer review; question quality checks and corrections happen outside the portal. The portal does not provide in-app content editing.
- If the sample check finds a conversion mismatch, block publication of the complete import. Fix the source outside the portal or fix the converter, then upload again. Every upload creates a new draft/import record, including an identical file; retain the source and conversion record for each import.
- Cross-version topic mappings are defined outside the portal and imported as versioned tri-state decisions (`equivalent`, `not_equivalent`, `uncertain`). The portal validates schema, taxonomy versions, and referenced topics but trusts the supplied semantic decision and does not call AI or modify it. Only `equivalent` mappings may combine historical topic data; the others remain separate. Preserve the mapping version used by each published aggregate.
- Paper assets, if any, use private Storage with short-lived signed URLs.

**`paper_imports`**

- `id`, administrator, source file reference, content hash, source schema version, converter version, status, validation report, created draft/paper version, and timestamps.
- The content hash is provenance metadata, not a deduplication key. Every upload creates a distinct import and draft, even when the file is identical.
- A failed schema validation or transformation sample check cannot create a publishable partial paper.

**`taxonomy_imports`**

- Store each externally prepared taxonomy or crosswalk JSON with its schema version, source/destination course taxonomy versions, content hash, validation report, import status, and timestamp.
- Validate the complete file and all referenced taxonomy versions/topic IDs before applying it. Any structural error or missing reference rejects the entire import; no partial taxonomy or crosswalk is applied.
- Treat the semantic `equivalent` / `not_equivalent` / `uncertain` values as trusted external decisions. The portal does not reclassify them.

**`exam_sittings`**

- `id`, `paper_version_id`, `starts_at`, `ends_at`, `registration_cutoff_at`.
- `status`: draft, published, registration open/closed, in progress, results pending, results published, cancelled.
- `available_languages`, `single_price_minor`, `currency`.
- `result_release_at`, `created_by`, `published_at`.
- No seat cap or waitlist in the first release.

### 3.3 Orders, payments, and entitlements

**`orders`**

- `id`, `student_profile_id`, `product_kind` (`single_sitting` or `monthly_30_day`), optional `sitting_id`, `amount_minor`, `currency`, `status`, timestamps.
- The student account owns the order even if another person pays.
- Record provider references, not card numbers or security codes.

**`payment_events`**

- Normalized provider event ID, order ID, event type, amount/currency, verified timestamp, and processing result.
- Enforce a unique provider event ID. Webhook retries must be idempotent.
- Do not trust checkout redirects or client-submitted payment status.

**`monthly_subscriptions`**

- One account-level entitlement record with effective `starts_at`, `expires_at`, and state.
- On a successful monthly payment, append 30 days to the current expiry if still active; otherwise start a new 30-day term at the successful payment time.
- A transactional ledger entry is required for each payment and adjustment.

**`subscription_ledger`**

- Immutable entry for paid term, individual-incident extension, platform-cancellation extension, or termination.
- Include source order/case/cancellation, days added, previous and resulting expiry, actor, and idempotency key.
- A monthly extension adds 7 days to the current expiry if active; if already expired, it grants a full 7 days from approval/processing time.
- Repeated qualifying events stack. Each source event may be applied only once.

### 3.4 Registrations, attempts, and results

**`registrations`**

- `id`, `student_profile_id`, `sitting_id`, `selected_exam_language`, `status`, `booked_at`, `cancelled_at`.
- Snapshot `access_source` (`single_purchase`, `monthly_subscription`, `voucher`, or `free_promotion`) and the source entitlement/order/voucher ID at booking time.
- This snapshot determines result privileges and incident/cancellation remedies, even if the account later buys another product.
- Enforce at most one active registration for a student and sitting.

**`attempts`**

- One formal attempt per registration, with `started_at`, `deadline_at`, `submitted_at`, `status`, submission source (`manual`, `deadline`, `account_deletion`), score fields, and scoring-version reference.
- Create an attempt when the candidate actually starts. A registration that never starts is not a valid submission and is excluded from statistics.
- A started attempt with no answers is still valid when it is submitted or deadline-finalized.

**`attempt_question_state`**

- Unique `(attempt_id, question_id)`.
- `selected_choice_id` nullable, `marked_for_review` boolean, `updated_at`, and a monotonically increasing revision or equivalent concurrency guard.
- Missing answer rows are treated as unanswered and incorrect for scoring/statistics.
- Return a save acknowledgement only after the transaction commits.

**`results`** and **`sitting_statistics`**

- Store finalized score snapshots and published aggregate outputs with the paper version and scoring version used.
- Store counts and thresholds used to decide whether each aggregate is visible.
- Preserve prior result versions when a voided question causes a uniform rescore; record the correction reason and audit history.

**`student_topic_progress`** (or equivalent derived view/materialization)

- Include only valid submissions from registrations whose access source was a monthly subscription.
- Retain detailed analysis for monthly-covered sittings after subscription expiry, consistent with the entitlement snapshot.
- Store per-sitting main-topic numerator/denominator and cumulative item-weighted numerator/denominator. Do not count permanently unclassified questions in topic analytics.
- Draw a per-topic weekly/sitting trend only when at least two sittings contain data for that topic. Always expose correct count and question count alongside the rate.
- Cumulative accuracy is `sum(correct tagged answers) / sum(tagged questions)` across all eligible monthly-covered valid submissions. It is item-weighted, not an average of sitting percentages.
- Rebuilds caused by a new crosswalk must create a new aggregate version; never silently rewrite an already published snapshot.

### 3.5 Incidents, vouchers, cancellation batches, and notices

**`incident_cases`**

- Student, affected registration/attempt, submitted time, evidence references, status, decision, reason, administrator, and remedy.
- Reject submissions more than seven days after the common sitting end time.
- Evidence files are private, access-controlled, and retained only according to the reviewed retention policy.

**`vouchers`**

- Account-bound, non-transferable, one-use entitlement; no cash value.
- Redemption must create a registration for one future paid sitting by the voucher expiry.
- Voucher expires one month after issuance; the sitting itself may occur after that expiry.
- Record issuance source, student, expiry, redemption, and cancellation state.

**`sitting_cancellation_batches`** and **`remedy_applications`**

- Preview a stable list of affected registrations and proposed remedies before confirmation.
- Single/free/promotion registrations receive the applicable free voucher; monthly-covered registrations receive a 7-day extension per cancelled booked sitting.
- Confirmation applies the batch once, records before/after expiry or voucher IDs, and prevents duplicate compensation.

**`notification_outbox`**

- Event type, recipient profile, channel, payload template/version, delivery state, attempts, and provider response metadata.
- Email is the formal notification channel. If Telegram is linked, send an additional reminder.
- Business transactions must commit independently from notification delivery. Failed notices remain visible and retryable.

**`audit_log`**

- Append-only actor, action, affected resource, reason, timestamp, and relevant before/after values.
- Required for result correction, admin decisions, voucher issuance, subscription extensions, batch cancellations, account deletion, and role changes.

## 4. Authorization and data exposure

### 4.1 RLS policy matrix

| Data | Anonymous | Student | Administrator |
|---|---|---|---|
| Published sitting metadata | Read permitted public fields | Read | Read/manage |
| Draft paper and answer key | None | None during exam | Manage through protected server workflow |
| Own orders/payments | None | Read own; create through function | Read authorized operational data |
| Own registration/attempt | None | Read own; state changes through RPC/function | Read on-demand with audit |
| Other students' answers/results | None | None | No bulk export; on-demand access with audit |
| Aggregated sitting statistics | Only when explicitly published | Read published aggregates | Read/manage |
| Incidents/evidence | None | Create/read own case | Read and decide |
| Audit log | None | None | Restricted read |

### 4.2 Security rules

- Deny by default. RLS is enabled on every table exposed through Supabase APIs.
- Sensitive transitions are not direct client updates. Use RPCs/Edge Functions that verify identity, ownership, current server time, sitting status, entitlement, and idempotency.
- Never return an answer key or explanation while the sitting is in progress.
- After common result release, return score and correct options to paid candidates. Return explanations and detailed personal analysis only where the registration's entitlement snapshot grants them.
- Admin detail views require an elevated server-side check and create an audit event. Aggregate reporting is the default.
- Use private Storage buckets for incident evidence and protected exam assets.
- Apply Auth rate limits and abuse controls for OTP requests and answer-save endpoints.

## 5. Core workflows

### 5.1 Sign-in and account deletion

1. Student signs in with email OTP.
2. Administrator accounts are invitation-only and must have MFA.
3. On deletion, atomically disable the profile, terminate access, cancel future registrations, and finalize any started active attempt from the latest server-confirmed answers.
4. Do not refund unused monthly time or cancelled future registrations.
5. Remove authentication credentials and direct PII, null the auth link, and retain the `Deleted` profile tombstone plus linked exam data under the approved retention policy.

### 5.2 Checkout and entitlement creation

1. Authenticated student creates an order through a server function.
2. Server creates a hosted-checkout session and returns only the checkout URL.
3. Verified webhook updates payment state and grants entitlement in a database transaction.
4. Duplicate webhook events return the prior result without creating another entitlement.
5. Failed/pending events do not grant registration or subscription rights.

### 5.3 Booking and cancellation

`book_sitting` must check:

- Authenticated active profile.
- Published sitting and registration still open according to server time.
- Selected language is available.
- Single order/voucher is valid for that sitting, or the monthly entitlement is active and the sitting starts within its effective period.
- No existing active registration for the same sitting.

Monthly booking is manually confirmed; there is no automatic enrollment. A monthly booking may be cancelled before the sitting starts without refund or credit accounting, then another eligible sitting may be selected. A single-purchase registration may be cancelled before the sitting starts, but the cancellation is irreversible: there is no refund, transfer, or reactivation, and joining any sitting requires a new purchase. At or after the start time, cancellation is unavailable.

### 5.4 Attempt start, save, and deadline finalization

1. `start_attempt` creates the unique attempt only when the sitting is in progress and the registration is valid.
2. The client presents one question at a time and debounces answer saves.
3. `save_answer` checks ownership, attempt status, question membership, and server deadline, then upserts answer/mark state atomically.
4. The client distinguishes saving, saved, and failed; it must not claim saved until acknowledged.
5. At the deadline, the scheduler finalizes every started attempt from committed server data, including attempts with no answers. Registrations that never started have no attempt and do not count as valid submissions.
6. If the student deletes the account while an attempt is active, finalize using the same server-confirmed state and mark the submission source accordingly.

Use server time as the source of truth. Define a single transaction boundary for a save arriving at the deadline so it cannot be ambiguously accepted or lost.

### 5.5 Scoring, statistics, and grade display

- A valid submission is a started attempt that is manually submitted or deadline-finalized. A started, fully blank attempt is valid; a registration that never starts is not.
- Blank answers score incorrect and remain in the per-item rate denominator.
- Percentile and relative-grade displays require at least 30 valid submissions. Per-item correct-rate display requires at least 10.
- Item statistics show correct rate only; do not expose option distribution.
- Use mid-rank percentile: `100 * (count(scores lower than score) + 0.5 * count(scores equal to score)) / valid_submission_count`.
- Relative grade bands use that percentile, with equal scores receiving equal percentile and grade:
  - 5**: percentile >= 97
  - 5*: percentile >= 90 and < 97
  - 5: percentile >= 75 and < 90
  - 4: percentile >= 55 and < 75
  - 3: percentile >= 35 and < 55
  - 2: percentile >= 20 and < 35
  - 1: percentile >= 10 and < 20
  - U: percentile < 10
- If every valid submission has the same score, mid-rank yields the 50th percentile and all candidates receive grade 3, per the confirmed policy.
- Label this as a platform **same-sitting relative mock grade**, not an HKEAA grade or HKDSE prediction. The HKEAA reporting system is standards-referenced, not a fixed cohort quota.
- Publish results automatically after the common sitting cutoff and successful completion of scoring/statistics jobs. There is no routine administrator approval gate before publication.
- For monthly-covered valid submissions, calculate personal main-topic accuracy by sitting and cumulatively. Show correct count/total tagged questions; show a trend line only after at least two sittings contain data for that topic. The cumulative rate is question-weighted across all monthly-covered valid submissions.
- Do not show personal topic analytics to single-purchase candidates. Subtopic labels remain available for question-bank management but are not used in student analytics in the first release.
- Permanently unclassified questions remain part of exam scoring but are excluded from topic-specific numerator and denominator.
- When a cross-version topic crosswalk changes, preserve published aggregate versions and use the new mapping only in a separately versioned recalculation.

### 5.6 Invalid question and rescore

An authorized administrator records the affected sitting, question, reason, evidence, and decision. Before execution, the system previews the number of affected candidates and old-versus-new scores. After the administrator confirms, an idempotent, versioned, auditable job removes the voided question from the score and maximum possible score, then recalculates normalized percentages for every affected attempt. Preserve the prior result snapshot and the correction reason; notify affected candidates after the corrected results are committed. The single-owner administrator model does not require a second administrator.

### 5.7 Individual incident compensation

1. Accept a case only within seven days of the sitting end.
2. Store server-side evidence and candidate evidence separately.
3. Administrator reviews server records as primary evidence and candidate material as supporting evidence; administrator records decision and reason.
4. For a monthly-covered registration, approval applies one idempotent 7-day subscription extension using the confirmed expiry rule.
5. For a single booking, approval issues one account-bound free voucher.
6. Write an email notification to the outbox and a Telegram reminder if linked.

### 5.8 Platform cancellation

1. Administrator marks the sitting cancellation and supplies a reason.
2. Server generates a preview of every confirmed registration and its source-based remedy.
3. Administrator confirms the preview.
4. Apply one voucher to each eligible non-monthly registration, including free/promotion registrations; apply one 7-day extension for each monthly-covered cancelled registration.
5. Commit the batch and audit events atomically or through an idempotent resumable job.
6. Notify by email and optional Telegram reminder.

### 5.9 Result and analysis access

- Score and correct options become available to every paid candidate after common result release.
- Detailed explanations, topic analysis, and cross-week progress are available for monthly-covered registrations.
- Detailed results for a monthly-covered sitting remain accessible after subscription expiry, while the account remains active.
- Cohort statistics are published only after the relevant minimum sample threshold.

## 6. Background jobs and operational monitoring

Required scheduled or retryable jobs:

- Finalize due attempts and detect any sitting whose deadline job did not complete.
- Release scores and build aggregate statistics after the common cutoff.
- Process payment webhooks and reconcile orders with provider status.
- Deliver and retry notification outbox records.
- Find stale checkout orders, pending incident cases, and incomplete cancellation batches.
- Recompute affected results after an approved invalid-question decision.

Monitor at minimum:

- Answer-save success/error rates, latency, and stale client revisions.
- Active attempts and deadline finalization backlog.
- Payment webhook verification failures and paid-order reconciliation.
- Result publication and rescore job status.
- Notification backlog and repeated delivery failures.
- Admin actions, RLS denials, and unusual OTP/booking rates.

Production backups and a tested restore procedure are required. The recovery objectives are RPO no greater than 5 minutes and RTO no greater than 4 hours; validate them with a restore exercise before launch. Confirm the selected Supabase plan's backup/recovery capabilities and cost before implementation.

## 7. Verification plan

### 7.1 Automated tests

- RLS ownership and cross-account denial for every student-owned table.
- Admin MFA/role checks and audit creation.
- Versioned source JSON schema validation, bilingual conversion, all-or-nothing imports, fixed first/middle/last conversion preview, failure blocking, and distinct drafts for duplicate identical uploads.
- Payment webhook signature verification, duplicate delivery, failure, and out-of-order event handling.
- Monthly term purchase, early renewal, expiry, 7-day stacking, and expired-at-approval behavior.
- Registration eligibility at cutoff/term boundaries, source snapshot, single-booking irreversible cancellation, monthly cancellation/rebooking, voucher redemption, and duplicate booking.
- Answer-save ownership, deadline boundary races, duplicate writes, and offline/failure UI states.
- Manual submit, deadline submit, full-blank attempt, and never-started registration behavior.
- Percentile, tie, grade-band, all-scores-equal, and sample-threshold calculations.
- Taxonomy-version label validation, bilingual JSON normalization, permanent-unclassified handling, external crosswalk tri-state import and reference validation, entitlement-filtered topic progress, per-sitting minimums, and item-weighted cumulative accuracy.
- Result visibility by purchase source and after subscription expiry.
- Incident approval, batch cancellation preview/confirmation, duplicate protection, and notification failures.
- Account deletion during an active attempt, future booking cancellation, PII unlinking, and retained tombstone/result data.
- Invalid-question rescore with immutable before/after snapshots.

### 7.2 Load and resilience tests

Before claiming support for 500 concurrent candidates, run a production-like test with synchronized answer saves and a synchronized exam deadline. Measure save latency and failure rate, database resource pressure, finalization backlog, and recovery after transient failures.

**Acceptance gate:** 500 concurrent active attempts for a representative session; answer-save acknowledgement P95 no greater than 1 second; answer-save error rate below 0.1%; no acknowledged answer lost; and every started attempt finalized within 2 minutes after the common deadline. Do not treat the target headcount alone as proof of readiness or as a capacity guarantee.

### 7.3 Deployment controls

- Store schema changes as reviewed SQL migrations.
- Deploy to the isolated development project first.
- Run migrations and targeted tests before production.
- Require a human approval for production deployment.
- Keep rollback/recovery steps and the current schema version visible to the operator.
- Do not use production student data in development or load tests.

## 8. Open items and implementation gates

### Provider and legal gates

1. Select hosted payment provider and verify current Hong Kong fees, supported payment methods, webhook behavior, settlement, and refund capabilities.
2. Select transactional email provider and configure OTP deliverability, domain authentication, and notification monitoring.
3. Obtain Hong Kong privacy/consumer-law review for minors, mandatory statistical use notice, indefinite pseudonymous answer retention, no-refund terms, voucher terms, and Singapore-region data processing.

### Reliability and operations gates

1. Confirm backup retention and restore process against the selected service plan, and demonstrate RPO <= 5 minutes and RTO <= 4 hours in a restore exercise.
2. Verify automated result publication and the administrator's preview/confirmation process for corrected results.

## 9. Suggested delivery sequence

1. **Foundation:** environment separation, migrations, Auth, profiles, administrator MFA, RLS tests.
2. **Content and sittings:** immutable paper versions, bilingual content, sitting publication and registration rules.
3. **Orders and entitlements:** provider-neutral order model, hosted checkout adapter, verified webhooks, monthly term ledger, bookings, cancellations, vouchers.
4. **Exam engine:** attempt start, transactional answer save, deadline finalization, save-status UX.
5. **Results:** score snapshot, statistics thresholds, relative grade calculation, answer/explanation access control.
6. **Operations:** incidents, admin audit, platform-cancellation preview/apply, notifications, account deletion.
7. **Hardening:** load tests, failure recovery, backups/restore, privacy review, production deployment rehearsal.

Do not connect a live payment provider, send real notifications, or deploy production migrations until the provider and legal gates are closed.

AI question generation and topic labeling run outside the portal. Choosing the external authoring tool/provider is a separate content workflow decision, not a portal backend integration gate.
