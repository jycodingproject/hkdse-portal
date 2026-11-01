# HKDSE Mock Exam Portal Backend Implementation Specification

**Date:** 2026-11-01
**Status:** Draft for implementation planning  
**Decision baseline:** Product and system rules confirmed in conversations on 2026-10-26 through 2026-11-01
**Scope:** First production backend for the HKDSE mock-exam portal

This specification translates the confirmed product decisions into a backend design. Amazon SES in Singapore is the selected transactional-email provider. QFPay is a provisional design assumption for both PayMe and Octopus, not a confirmed or contracted provider; launch is blocked until merchant eligibility, both payment methods, refunds, authenticated notifications, status queries, and commercial terms are verified. It does not authorize production deployment. Items labelled **Open before implementation** must be decided before the relevant feature is coded.

The existing [frontend prototype design](./2026-10-24-hkdse-mock-portal-frontend-prototype-design.md) remains a fake-data prototype specification. Where it describes auto-enrollment or subscription-dependent behavior that conflicts with this document, this newer backend specification is the current product baseline. The prototype itself is not changed by this document.

## 1. Product and operational baseline

- Initial product: twice-weekly HKDSE Mathematics Paper 2 multiple-choice mock examinations, with Traditional Chinese and English paper language options.
- Sales: single-exam purchase and an unlimited 30-day monthly subscription.
- Prototype and market-test prices: HK$29 per sitting and HK$99 per 30-day subscription. Display them as trial prices; they may change before launch. Prices include provider fees; candidates pay no separate payment surcharge. Reassess net revenue after receiving actual provider quotes.
- Do not offer promotional codes or referral rewards in the first release. Vouchers are limited to incident and platform-cancellation compensation.
- Launch payment methods are PayMe and Octopus; FPS and credit/debit-card support are not required. Both methods must be supported by the same provider and merchant account; do not split them across providers. The portal presents the method choice first, then routes the candidate to the corresponding provider checkout. If no single provider meets all requirements, delay launch.
- QFPay is the provisional provider assumption for design and prototype work. The assumption is not verified: confirm Hong Kong sole-proprietor eligibility, activation of both wallets under one account, method-specific checkout flows, authenticated server-side notifications, status queries, full original-method refunds, and commercial terms before launch. If QFPay fails, evaluate another provider only if it can meet the same single-provider requirement; among qualified providers, prioritize local support and brand familiarity, then total cost. Otherwise delay launch. Do not pursue the direct PayMe for Business API as a separate launch route; the owner will not apply for HSBC Business Internet Banking.
- Every payment must support trusted server-side confirmation or status lookup. Do not rely on browser redirects or manual reconciliation. A provider must support full refunds to the original payment method and verifiable refund status.
- Anyone preparing for HKDSE may register from any location if they can use PayMe or Octopus. Do not verify school or candidate identity. One verified email maps to one account; do not attempt cross-account identity deduplication. Students use email/password authentication and must verify email before student features or booking. No guardian consent is required by the product policy.
- Students must sign in before checkout. A parent may pay through their own PayMe or Octopus account, but the order and portal receipt belong to the student account; do not collect separate payer identity or email.
- Accept only HKD for prices, payments, and refunds.
- Monthly subscriptions are manually renewed and never auto-renew. Early renewal appends 30 days to the current expiry; a purchase after expiry starts a new 30-day term at payment time.
- Monthly subscribers manually select and confirm each sitting. A sitting is eligible if registration is open and its scheduled start falls within the effective subscription period. Confirmed bookings remain valid after subscription expiry.
- The regular schedule target is one sitting each Saturday and Sunday at 09:00 Asia/Hong_Kong. Administrators create, review, and publish each sitting individually; templates may be reused, but the system does not auto-generate recurring sittings. They may skip a session for holidays or operational reasons. Each weekend sitting uses a different, independently authored paper; candidates may book one or both.
- Derive question count from the selected immutable paper version. Forty-five questions is an advisory target only and never blocks publication; verify the latest HKEAA format before publishing ([2027 Mathematics Assessment Framework](https://www.hkeaa.edu.hk/DocLibrary/HKDSE/Subject_Information/math/2027hkdse-e-math.pdf)). The default duration is 75 minutes. The portal does not require the two weekly papers to share topic coverage or difficulty. Each sitting is scored and statistically reported independently.
- Registration defaults to opening seven days before the sitting and closing 30 minutes before it; an administrator may adjust either time for an individual sitting.
- A monthly booking may be cancelled before the sitting starts and replaced by another eligible booking. A candidate-initiated single-purchase booking may also be cancelled before the sitting starts, but cancellation is irreversible, non-refundable, and non-transferable; joining another sitting requires a new purchase. Neither type can be cancelled at or after the sitting start. Platform-wide cancellation or platform-problem rescheduling follows the separate refund/remedy policy below.
- All paid candidates can view their score and correct options after common result release. A monthly-covered sitting additionally grants explanations, topic analysis, and cross-week progress; those detailed results remain accessible after expiry.
- Include pseudonymized valid answers in group statistics after clear notice; candidates cannot opt out. Accounts are not identity-verified, so statistics are account-based. Keep the approved per-sitting topic trends and cumulative percentages even though weekly papers are not blueprint-matched; add no extra comparability disclaimer.
- A sitting has one formal attempt. Candidates select the paper language at registration; it is locked when the attempt starts. Use a trust-based exam model without webcam or identity monitoring. The server closes attempts at the common deadline using the latest server-confirmed answers. Offline answering is unsupported.
- Candidates may start up to 15 minutes after the scheduled start, with no extra time; no new attempt may start later. They may navigate freely, change answers until the deadline, mark questions for review, or submit early after a confirmation prompt. Early submission locks the attempt permanently. All candidates see the same question and choice order. Each question is worth one point; wrong and blank answers score zero.
- Do not provide live human support or an in-exam issue-report entry. Candidates may submit incident appeals within seven days after the sitting ends.
- General inquiries go to a support email inbox with no response-time commitment. Payment exceptions and exam incidents use their structured workflows.
- A platform-wide cancellation or platform-problem reschedule gives a cash-paid single-sitting candidate the choice of a full refund to the original method or a voucher. The choice is available for 14 days from successful SES email delivery; if delivery never succeeds, do not start the deadline or issue a default voucher, and alert the administrator. Voucher-funded bookings receive a replacement voucher; monthly bookings retain the existing 7-day extension remedy. Individual incident appeals do not receive refunds.
- Show scores and reports only inside the authenticated portal; do not provide report export, public leaderboard, or share links in the first release. After manual or automatic submission, show links to the next three published sessions that are open for registration; do not auto-register.
- Provide one fixed set of five public bilingual sample questions, available without login and without a timer. Show the correct answers and short explanations after each response; do not persist sample answers or include them in statistics.
- 500 simultaneous active candidates is the initial load-test target; it is not a capacity guarantee until tested.

## 2. System architecture

```text
Student / administrator browser
        |
        +-- React + Vite static application
        |       +-- Cloudflare Pages
        |
        +-- Supabase
                +-- Auth: email/password, verification and reset links via Amazon SES; administrator MFA
                +-- PostgreSQL: data, RLS, transactional RPCs
                +-- Edge Functions: protected workflows and integrations
                +-- Private Storage: incident evidence and paper assets
                +-- Cron / scheduled functions: deadlines, publication, retries

PayMe / Octopus checkout (provisional QFPay) -- verified webhook --> Edge Function --> PostgreSQL
PostgreSQL notification outbox --> Amazon SES (Singapore)
                              \--> Telegram reminder when linked
```

### 2.1 Platform boundaries

- Host the static React application on Cloudflare Pages.
- Use a dedicated Supabase project in Singapore for each environment. Development and production must not share data, credentials, or redirect URLs.
- Use Supabase Auth for email/password sign-in. Send one-hour email-verification and one-time password-reset links through Amazon SES in Singapore. Do not create a student session when verification succeeds; require an explicit sign-in. Require a verified email for all student features, checkout, and booking, and restrict unverified accounts to the verification prompt and link-resend action.
- Enforce this password policy on registration, password change, and password reset: at least eight characters; ASCII letters, digits, and symbols only; at least one of each; no mixed-case requirement. Spaces are allowed but do not count as symbols. Store credentials only in Supabase Auth's managed password storage; never log or copy plaintext passwords.
- Password change requires the current password, sends a short security notification, revokes the user's other sessions, and retains the current session. A password reset consumes a one-time link, expires after one hour, sends a short security notification without credentials or login links, and requires the student to sign in again (revoke existing sessions).
- Email changes retain the existing policy: verify both the existing and new address before changing the account email. Enforce MFA for administrator accounts and invite administrators rather than allowing public administrator registration.
- Use PostgreSQL Row Level Security (RLS) for row ownership. Use narrow Postgres functions for atomic state changes and Edge Functions for authenticated workflows, webhooks, scheduled work, and external integrations.
- Store all secrets in Supabase/Cloudflare secret configuration. Never expose a service-role key or payment secret to browser code.
- Keep the combined PayMe/Octopus integration behind a provider adapter. Both methods must use the same provider and merchant account; no card details are stored by the portal.
- Configure SES with a verified sending domain, SPF/DKIM/DMARC, production sending access, and delivery/bounce/complaint monitoring before live email is enabled.
- Use Asia/Hong_Kong for user-facing schedules and store timestamps as `timestamptz` in UTC.

### 2.2 Responsibility split

| Component | Responsibilities |
|---|---|
| React client | Display published sittings and the fixed public sample; collect user choices; show exam state and payment-pending state; debounce answer saves; display server acknowledgements and errors; show the next three bookable sittings after submission |
| RLS-protected Supabase API | Read permitted student-owned data and public published sitting metadata |
| Postgres RPCs | Atomic answer save, booking/cancellation checks, attempt finalization, scoring state transitions |
| Edge Functions | Provider-specific checkout and refund requests, verified payment/refund webhooks, server-side payment status queries, admin actions, account deletion, incident workflow, batch cancellation, result publication, notification dispatch |
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
- Do not store passwords in `profiles`; Supabase Auth owns credential storage. Do not store date of birth, age, HKID, school, or other unapproved profile data.
- Email changes require OTP verification of both the existing and new address. Do not manually change an account email if the candidate cannot verify the existing address.

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
- Do not detect or block question reuse across paper versions; external authors manage reuse.
- A failed schema validation or transformation sample check cannot create a publishable partial paper.
- Original source JSON, non-reconstructable paper assets, and import/conversion records are retained indefinitely in the primary Supabase Storage/database service. No independent file backup is planned; the owner accepts that deletion or corruption of a Storage object may make that file unrecoverable.

**`taxonomy_imports`**

- Store each externally prepared taxonomy or crosswalk JSON with its schema version, source/destination course taxonomy versions, content hash, validation report, import status, and timestamp.
- Validate the complete file and all referenced taxonomy versions/topic IDs before applying it. Any structural error or missing reference rejects the entire import; no partial taxonomy or crosswalk is applied.
- Treat the semantic `equivalent` / `not_equivalent` / `uncertain` values as trusted external decisions. The portal does not reclassify them.

**`exam_sittings`**

- `id`, `paper_version_id`, `starts_at`, `ends_at`, `registration_opens_at`, `registration_cutoff_at`.
- `status`: draft, published, registration open/closed, in progress, results pending, results published, cancelled.
- `available_languages`, `single_price_minor`, `currency`.
- `result_release_at`, `created_by`, `published_at`.
- The default schedule target is Saturday and Sunday at 09:00 Asia/Hong_Kong. Administrators create and publish each sitting individually and may skip a week or copy a sitting as a template. Each weekend sitting has a different paper version and is independently bookable; a candidate may book both.
- Derive question count from the selected `paper_version_id`; do not store an independently editable count on the sitting. Forty-five is an advisory target, not a publication constraint. `ends_at` is 75 minutes after `starts_at` by default; administrators may override the duration.
- Default `registration_opens_at` is seven days before `starts_at`; default `registration_cutoff_at` is 30 minutes before `starts_at`. Per-sitting overrides are allowed.
- No seat cap or waitlist in the first release.

### 3.3 Orders, payments, and entitlements

**`orders`**

- `id`, `student_profile_id`, `product_kind` (`single_sitting` or `monthly_30_day`), optional `sitting_id`, `payment_method` (`payme` or `octopus`), `payment_provider`, `amount_minor`, `currency`, `status`, `checkout_expires_at`, timestamps.
- The student account owns the order even if another person pays.
- Only an authenticated student account can create an order; guest checkout is not supported. A parent may pay from their own payment account. Send the portal receipt only to the student's verified account email and do not collect separate payer identity or contact details.
- Record provider references, not card numbers or security codes.
- The portal offers the PayMe/Octopus choice first, then creates a method-specific checkout with the same provider and merchant account. QFPay is only a provisional design assumption; the provider is not selected until the launch gates pass.
- Both PayMe and Octopus are offered for both single-sitting and monthly-subscription purchases. Accept HKD only. Listed prices include provider fees; do not add a candidate-facing payment surcharge.
- For a single-sitting purchase, the candidate selects a specific sitting and language before checkout. After verified payment success, create that sitting's registration automatically. A monthly order grants the 30-day entitlement; monthly candidates still book each sitting manually.
- Allow only one unresolved pending payment for a given student and purchase. To change method or retry, query the existing checkout and confirm it is unpaid/expired first.
- Mark an order paid only after a trusted provider notification or server-side status query confirms the expected order reference, payment method, amount, and currency. Process duplicate notifications idempotently. Manual reconciliation is not an acceptable launch path.
- Require the same provider/merchant account to support both wallets, signed server-side payment notifications, transaction status queries, and full refunds to the original payment method with verifiable refund status. If no single provider passes all gates, delay launch; do not split providers or use manual reconciliation.
- Use the provider's checkout-session expiry. Before expiring an order, query provider status; mark it expired only after confirmation that it is unpaid or expired. After confirmed expiry, the student may start a new checkout.
- If a late or separate duplicate payment succeeds and cannot safely fulfil the order, move it to `payment_review`, prevent another attempt for that order, notify the student, and alert the administrator immediately. Do not automatically refund; the administrator decides each case, with a one-business-day handling target and priority for cases near registration cutoff. Record the decision in the audit log.
- On checkout return, show `payment_pending` until the backend receives or retrieves trusted success; do not show success or permit another payment based on the browser redirect alone.
- If the provider is unavailable, pause new checkouts for both methods. Preserve existing orders and continue status checks/webhook processing; do not automatically switch providers or ask candidates to pay manually.

**`payment_events`**

- Normalized provider event ID, order ID, event type, amount/currency, verified timestamp, and processing result.
- Enforce a unique provider event ID. Webhook retries must be idempotent.
- Do not trust checkout redirects or client-submitted payment status.
- A duplicate successful charge or a success that cannot fulfil its order must enter the order's payment-review workflow; it must not grant a second entitlement automatically.
- Refund requests are idempotent and target the original payment method. Track provider refund references and verified refund status; alert administrators on failed or ambiguous outcomes.

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
- Snapshot `access_source` (`single_purchase`, `monthly_subscription`, or `voucher`) and the source entitlement/order/voucher ID at booking time.
- This snapshot determines result privileges and incident/cancellation remedies, even if the account later buys another product.
- Enforce at most one active registration for a student and sitting.
- Do not impose a one-sitting-per-week limit; a candidate may register for both the Saturday and Sunday papers.

**`attempts`**

- One formal attempt per registration, with `started_at`, `deadline_at`, `submitted_at`, `status`, submission source (`manual`, `deadline`, `account_deletion`), score fields, and scoring-version reference.
- Create an attempt when the candidate actually starts. A registration that never starts is not a valid submission and is excluded from statistics.
- A started attempt with no answers is still valid when it is submitted or deadline-finalized.
- Permit attempt start from `starts_at` through `starts_at + 15 minutes`; late candidates receive no additional time. No attempt may start after that grace period.
- Candidates may submit early after confirmation; an early submission permanently locks the attempt. Otherwise, finalize at the common `ends_at`.
- The paper language is fixed from registration when the attempt starts. Candidate navigation and answer changes remain available through the deadline; question and choice order is the same for every candidate.
- Each question is worth one point. Correct answers score one; wrong and blank answers score zero.

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
- Evidence files are private and access-controlled. The retention target is 90 days after case closure unless an appeal or legal hold is active. The administrator manually checks and deletes expired evidence monthly, so actual retention may extend to approximately 120 days. Retain only the decision/audit summary after evidence deletion. This retention policy remains subject to Hong Kong privacy/legal review.
- Incident evidence is not independently backed up. Supabase database backups/PITR do not include Storage file objects.

**`vouchers`**

- Account-bound, non-transferable, one-use entitlement; no cash value.
- Redemption must create a registration for one future paid sitting by the voucher expiry.
- Voucher expires one month after issuance; the sitting itself may occur after that expiry.
- Record issuance source, student, expiry, redemption, and cancellation state.

**`sitting_cancellation_batches`** and **`remedy_applications`**

- Preview a stable list of affected registrations and proposed remedies before confirmation.
- For a platform-wide cancellation or platform-problem reschedule, cash-paid single-sitting candidates may choose a full refund to the original payment method or a voucher. Voucher-funded registrations receive a replacement voucher; monthly-covered registrations receive a 7-day extension per cancelled booked sitting.
- A cash-paid candidate has 14 days from successful SES delivery of the cancellation/reschedule notice to choose a refund or voucher. If SES never reports successful delivery, do not start the deadline or issue a default voucher; alert the administrator and keep the case pending. If no choice is made within 14 days, issue the voucher.
- Once the candidate selects a refund, issue one idempotent full-amount refund to the original method. Failed or ambiguous results enter an administrator queue and trigger an SES alert; do not silently issue a voucher or submit a duplicate refund.
- Confirmation applies each remedy once, records the candidate's choice and before/after expiry, voucher, or refund references, and prevents duplicate compensation. Individual incident appeals do not receive refunds.

**`portal_notices`** and **`portal_notice_reads`**

- `portal_notices` stores bilingual title and body, draft/published state, publisher, publication timestamp, expiry timestamp, and created/updated timestamps. Administrators may create and edit drafts, publish or withdraw notices, and set an expiry.
- The authenticated notification centre is available to every signed-in portal account, whether or not the account has purchased or booked an exam. Show currently published, unexpired notices newest first; hide withdrawn and expired notices from students while retaining them for administrators.
- `portal_notice_reads` stores `(notice_id, account_id, read_at)` with a unique `(notice_id, account_id)` constraint. The notification centre and student dashboard show the account's combined unread count and allow marking notices as read.
- General notices are in-portal only: no comments and no general announcement email. Formal exam, payment, and incident messages continue through the existing notification workflows. Keep these announcement records and read receipts separate from critical `in_app_notifications`, while presenting both in a unified chronological student feed.
- The bell dropdown shows the newest three combined entries and the unread count across active announcements and retained personal notifications; the full centre defaults to All and has Announcements and Personal notifications filters. Opening an entry marks it read and navigates to its related portal content.
- Enforce signed-in read access and administrator-only write access with database policies. Audit administrative publish, edit, withdrawal, and expiry changes.

**`notification_outbox`**

- Event type, recipient profile, channel, payload template/version, delivery state, attempts, and provider response metadata.
- Send formal email through Amazon SES in Singapore for email verification, password reset, email-change OTP verification, password security alerts, payment outcome, registration/cancellation, sitting changes, result publication, and incident decisions/remedies. Minimize email content; require portal sign-in for sensitive details. Password-change/reset security alerts contain no passwords or login links.
- Telegram is optional, requires explicit consent, and can be unlinked/disabled at any time without affecting the account or email notices. The candidate must start/link the bot before it can send a private message. Send only non-sensitive reminders; never send scores, answers, payment details, or incident content. Do not treat a successful Bot API send as proof of delivery or reading, and respect Telegram's rate limits.
- Create a minimal in-portal notification center for critical payment, registration, sitting-change, result, and incident/remedy events.
- Retry failed SES email delivery with exponential backoff for up to 72 hours, then mark undelivered and alert the administrator. Preserve the in-portal notification; never present a failed email as delivered.
- Begin a platform-remedy choice deadline only after SES reports the relevant email as delivered. If delivery remains unsuccessful after retries, alert the administrator and keep the choice pending without defaulting to a voucher.
- Send immediate SES alerts and create admin-queue items for payment-review orders, refund failures/ambiguous states, and payment-provider outages. Target administrator handling of payment exceptions within one business day, prioritizing cases near a registration cutoff.
- Business transactions must commit independently from notification delivery. Failed notices remain visible and retryable.
- General customer inquiries use a separate support mailbox; no response-time commitment is made. Payment exceptions and exam incidents are submitted and tracked through their portal workflows.

**`in_app_notifications`**

- Persist critical payment, registration/cancellation, sitting-change, result, and incident/remedy notifications for the student's portal notification centre. Include a category, creation time, read time, and safe destination/resource reference.
- Scope reads and updates to the owning account. Marking a personal notification read must not mutate the underlying business transaction.
- Retain notification copies for 90 days, independently of the retention period for the underlying business records.

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
- Require confirmed email for student-owned data and all student feature functions. An unverified account may only access verification status/resend operations; enforce this on the server as well as in the client.
- Sensitive transitions are not direct client updates. Use RPCs/Edge Functions that verify identity, ownership, current server time, sitting status, entitlement, and idempotency.
- Never return an answer key or explanation while the sitting is in progress.
- After common result release, return score and correct options to paid candidates. Return explanations and detailed personal analysis only where the registration's entitlement snapshot grants them.
- Admin detail views require an elevated server-side check and create an audit event. Aggregate reporting is the default.
- Use private Storage buckets for incident evidence and protected exam assets.
- Apply Auth rate limits and abuse controls for sign-in attempts, verification/resend and password-reset requests, email-change verification, and answer-save endpoints. Validate password-policy requirements on every password-creation/update path.

## 5. Core workflows

### 5.1 Sign-in and account deletion

1. Registration accepts email, password, and password confirmation. Validate the agreed password policy server-side before creating the Supabase Auth account; send a one-hour email-verification link.
2. Before verification, do not allow student sessions or student features. The account can only view the verification prompt and request a replacement link. Rate-limit resends.
3. Consume the verification link once, confirm the email without leaving an authenticated session, and show success. The candidate must explicitly sign in with email/password.
4. Sign-in requires a confirmed email and valid password. Apply rate limits and abuse monitoring; do not reveal whether an unverified or nonexistent email is registered.
5. Password change requires the authenticated candidate's current password and the new password twice. Validate the policy, update the Auth credential, email a short security notice, revoke other sessions, and preserve the current session.
6. Password recovery returns a non-enumerating response, sends a single-use reset link expiring after one hour, and applies the same password policy. After successful reset, send a security notice, revoke existing sessions, and require a fresh sign-in.
7. Email changes retain verification of both the existing and new address. Administrator accounts are invitation-only and must have MFA.
8. On deletion, atomically disable the profile, terminate access, cancel future registrations, and finalize any started active attempt from the latest server-confirmed answers.
9. Do not refund unused monthly time or cancelled future registrations.
10. Remove authentication credentials and direct PII, null the auth link, and retain the `Deleted` profile tombstone plus linked exam data under the approved retention policy.

### 5.2 Checkout and entitlement creation

1. Authenticated student creates an order through a server function.
2. Server creates a provider-specific payment request and returns only the required redirect, deep-link, or QR presentation data.
3. Verified provider notification or server-side status lookup updates payment state and grants entitlement in a database transaction.
4. Duplicate webhook events return the prior result without creating another entitlement.
5. Failed/pending events do not grant registration or subscription rights.
6. Use the provider checkout expiry. Query status before marking an order expired; after confirmed unpaid expiry, the student may start a new checkout.
7. A late or separate duplicate success that cannot fulfil its order enters `payment_review`; lock further attempts on that order, notify the student, and alert the administrator. The administrator decides the case, with a one-business-day handling target; no automatic refund is issued.
8. For a single-sitting order, the candidate selects a specific sitting and language before checkout; verified payment success automatically creates the registration.
9. A candidate may have only one unresolved payment for a given purchase. To change method or retry, first confirm through the provider that the prior attempt is failed or expired.
10. On browser return without trusted confirmation, show `payment_pending` and query status from the backend. Do not mark the order paid or permit another payment based on the redirect.
11. If the unified provider is unavailable, pause new checkouts for both methods. Keep existing orders pending and continue webhook/status processing; do not fail over to another provider or request manual payment.

### 5.3 Booking and cancellation

`book_sitting` must check:

- Authenticated active profile.
- Published sitting and registration still open according to server time.
- Selected language is available.
- A valid voucher is available for that sitting, or the monthly entitlement is active and the sitting starts within its effective period. A single-sitting purchase automatically creates its registration after verified payment; it is not a reusable ticket.
- No existing active registration for the same sitting.

Monthly booking is manually confirmed; there is no automatic enrollment. A monthly booking may be cancelled before the sitting starts without refund or credit accounting, then another eligible sitting may be selected. A candidate-initiated single-purchase cancellation before the sitting starts is irreversible, non-refundable, and non-transferable; joining another sitting requires a new purchase. At or after the start time, candidate-initiated cancellation is unavailable. Platform-wide cancellation or platform-problem rescheduling follows the separate remedy rules in section 5.8.

### 5.4 Attempt start, save, and deadline finalization

1. `start_attempt` creates the unique attempt only when the sitting is in progress, the registration is valid, and server time is no later than 15 minutes after the scheduled start. Late starters receive no extra time; no attempt can start after this grace period.
2. The client presents one question at a time and debounces answer saves.
3. `save_answer` checks ownership, attempt status, question membership, and server deadline, then upserts answer/mark state atomically.
4. The client distinguishes saving, saved, and failed; it must not claim saved until acknowledged.
5. Candidates may move freely between questions, change answers through the common deadline, and mark questions for review. Every candidate sees the same question and choice order. The selected language is fixed from registration when the attempt starts.
6. Candidates may submit early after a confirmation prompt. An early submission permanently locks the attempt; otherwise the scheduler finalizes every started attempt at the common deadline from committed server data, including attempts with no answers. Registrations that never started have no attempt and do not count as valid submissions.
7. If the student deletes the account while an attempt is active, finalize using the same server-confirmed state and mark the submission source accordingly.

Use server time as the source of truth. Define a single transaction boundary for a save arriving at the deadline so it cannot be ambiguously accepted or lost.

### 5.5 Scoring, statistics, and grade display

- A valid submission is a started attempt that is manually submitted or deadline-finalized. A started, fully blank attempt is valid; a registration that never starts is not.
- Each question is worth one point. Correct answers score one; wrong and blank answers score zero. Blank answers remain in the per-item rate denominator.
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
- Show candidates their own selected answers, correct answers, and per-question correctness. Do not expose a public leaderboard; show individual percentile and relative grade only in the authenticated candidate's own result page after the sample threshold is met.
- Show the raw correct count/total and percentage. After manual or deadline submission, show links to the next three published sittings open for registration; links navigate to booking and do not automatically register.
- For monthly-covered valid submissions, calculate personal main-topic accuracy by sitting and cumulatively. Show correct count/total tagged questions; show a trend line only after at least two sittings contain data for that topic. The cumulative rate is question-weighted across all monthly-covered valid submissions.
- Keep the approved trend line and cumulative values even though the weekend papers are not matched by topic blueprint or difficulty; do not add an extra comparability disclaimer.
- Do not show personal topic analytics to single-purchase candidates. Subtopic labels remain available for question-bank management but are not used in student analytics in the first release.
- Permanently unclassified questions remain part of exam scoring but are excluded from topic-specific numerator and denominator.
- When a cross-version topic crosswalk changes, preserve published aggregate versions and use the new mapping only in a separately versioned recalculation.

### 5.6 Invalid question and rescore

An authorized administrator records the affected sitting, question, reason, evidence, and decision. Before execution, the system previews the number of affected candidates and old-versus-new scores. After the administrator confirms, an idempotent, versioned, auditable job removes the voided question from the score and maximum possible score, then recalculates normalized percentages for every affected attempt. Preserve the prior result snapshot and the correction reason; notify affected candidates after the corrected results are committed. The single-owner administrator model does not require a second administrator.

### 5.7 Individual incident compensation

1. Do not offer real-time support or an in-exam issue-report entry. Accept a formal case only within seven days of the sitting end.
2. Store server-side evidence and candidate evidence separately.
3. Administrator reviews server records as primary evidence and candidate material as supporting evidence; administrator records decision and reason.
4. For a monthly-covered registration, approval applies one idempotent 7-day subscription extension using the confirmed expiry rule.
5. For a single booking, approval issues one account-bound free voucher.
6. Write an SES email notification to the outbox and a Telegram reminder if linked.

### 5.8 Platform cancellation

1. A reschedule after confirmed registrations is treated as cancellation of the original sitting followed by a separately published sitting. A sitting with no registrations may have its schedule edited directly.
2. Administrator marks the sitting cancellation/reschedule and supplies a reason.
3. Server generates a preview of every confirmed registration and its source-based remedy.
4. Administrator confirms the preview.
5. For each cash-paid single-sitting registration, notify the candidate of the full-refund or voucher choice. Start the 14-day choice window only after SES reports delivery. If no choice is made within that window, issue the voucher. If SES never reports delivery, keep the case pending and alert the administrator without starting the window or issuing a default voucher.
6. For each voucher-funded single-sitting registration, issue one replacement voucher. For each monthly-covered registration, apply one 7-day extension.
7. When a cash-paid candidate selects a refund, automatically submit one idempotent full-amount refund to the original payment method. If submission or status is failed/ambiguous, alert the administrator and keep the case in the review queue. Individual incident appeals do not receive refunds.
8. Commit remedies and audit events atomically or through an idempotent resumable job.
9. Notify by SES email and optional Telegram reminder.

### 5.9 Result and analysis access

- Score and correct options become available to every paid candidate after common result release.
- Detailed explanations, topic analysis, and cross-week progress are available for monthly-covered registrations.
- Detailed results for a monthly-covered sitting remain accessible after subscription expiry, while the account remains active.
- Cohort statistics are published only after the relevant minimum sample threshold.
- Candidates are clearly notified that pseudonymized valid answers are included in group statistics; there is no opt-out. Do not generate downloadable or publicly shareable result reports in the first release.

## 6. Background jobs and operational monitoring

Required scheduled or retryable jobs:

- Finalize due attempts and detect any sitting whose deadline job did not complete.
- Release scores and build aggregate statistics after the common cutoff.
- Process payment webhooks and reconcile orders with provider status.
- Expire checkout orders only after provider status confirms unpaid/expired; alert administrators about payment-review orders.
- Deliver and retry notification outbox records.
- Find stale checkout orders, pending incident cases, and incomplete cancellation batches.
- Recompute affected results after an approved invalid-question decision.

Incident evidence cleanup is a manual monthly administrator task; do not build a dedicated automatic lifecycle scheduler for it in the first release. Record evidence case closure date and deletion completion in the case/audit record.

Monitor at minimum:

- Answer-save success/error rates, latency, and stale client revisions.
- Active attempts and deadline finalization backlog.
- Payment webhook verification failures and paid-order reconciliation.
- Result publication and rescore job status.
- Notification backlog and repeated delivery failures.
- Notification-center retention expiry and email retry/undelivered state.
- Admin actions, RLS denials, and unusual sign-in, verification/reset-link, and booking rates.

Temporary production recovery baseline: use the Supabase Pro plan's default daily database backups, currently retained for 7 days. The owner accepts that recovery may roll data back by close to a day. PITR and its retention window are deferred for later review; RPO <= 5 minutes and RTO <= 4 hours are not approved requirements or guarantees. There is no backup/PITR decision gate before collecting real data. Revisit the tradeoff as operational usage and risk become clearer.

Supabase database backups/PITR do not include Storage object bytes ([Supabase backup documentation](https://supabase.com/docs/guides/platform/backups)). The current file-recovery decision is to use Supabase Storage only, with no independent object backup; the owner accepts that deleted or corrupted original paper JSON/images may be unrecoverable. If this risk changes, select a managed external backup service before production.

## 7. Verification plan

### 7.1 Automated tests

- RLS ownership and cross-account denial for every student-owned table.
- Admin MFA/role checks and audit creation.
- Email/password registration and sign-in; server-side password-policy validation including ASCII-only, required character classes, spaces not counting as symbols, and confirmation mismatch.
- Verification-link expiry/resend and no-auto-login behavior; rejection of student feature access before verification.
- Password change with current-password verification, security-email enqueue, current-session preservation, and revocation of other sessions.
- Non-enumerating password-reset request, one-time link consumption and one-hour expiry, policy-compliant reset, security-email enqueue, and required fresh sign-in after reset.
- Versioned source JSON schema validation, bilingual conversion, all-or-nothing imports, fixed first/middle/last conversion preview, failure blocking, and distinct drafts for duplicate identical uploads.
- Unified-provider eligibility gates for both PayMe and Octopus on one merchant account; signed payment/refund notification verification, duplicate delivery, failure, and out-of-order event handling.
- Provider-session expiry, status query before expiry, retry after confirmed unpaid expiry, one unresolved checkout per purchase, pending-return UX, late/duplicate successful payment review, locked retry, outage pause/no-failover, and administrator alert/decision.
- Single-sitting verified-payment auto-registration; monthly payment entitlement followed by manual booking.
- Platform cancellation/reschedule remedy preview; 14-day choice window from SES delivery; no window/default voucher on undelivered email; full original-method refund idempotency/status; voucher-funded replacement; monthly extension; and refund failure/ambiguous state alerting.
- Monthly term purchase, early renewal, expiry, 7-day stacking, and expired-at-approval behavior.
- Registration eligibility at cutoff/term boundaries, source snapshot, single-booking irreversible cancellation, monthly cancellation/rebooking, voucher redemption, and duplicate booking.
- Saturday/Sunday schedule defaults, per-sitting 45-question/75-minute targets, 15-minute late-start limit, registration opening/cutoff defaults and administrator overrides; no automatic recurring sitting creation.
- Registration for one or both weekend sittings, independent paper versions and per-sitting statistics; no cross-paper pooling.
- Answer-save ownership, deadline boundary races, duplicate writes, and offline/failure UI states.
- Language lock at attempt start, question navigation, review markers, early-submit lock, deadline submit, full-blank attempt, and never-started registration behavior.
- Percentile, tie, grade-band, all-scores-equal, and sample-threshold calculations.
- Taxonomy-version label validation, bilingual JSON normalization, permanent-unclassified handling, external crosswalk tri-state import and reference validation, entitlement-filtered topic progress, per-sitting minimums, and item-weighted cumulative accuracy.
- Result visibility by purchase source and after subscription expiry.
- Private answer/correct-answer review, no public leaderboard/export/share, next-three-session links after submission, and required notice/inclusion of pseudonymized valid submissions in group statistics.
- Fixed five-question bilingual public sample, no authentication requirement, no persistence, and no inclusion in statistics.
- Combined announcement/personal-notification feed ordering, unread counts across both sources, latest-three dropdown, read-state updates, destinations, and All/Announcements/Personal notifications filtering without merging their stored records.
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

1. QFPay is a provisional design assumption only. Before launch, verify that one Hong Kong sole-proprietor merchant account can enable both PayMe and Octopus, create method-specific checkout after the candidate selects a method in the portal, and provide authenticated payment/refund notifications, status queries, and full refunds to the original method. Test both methods and refunds end to end; obtain fees and settlement terms. Do not apply for HSBC BIB or split the methods across providers. If QFPay fails, evaluate another provider only if it meets the same single-provider requirement; otherwise delay launch. Payment Asia or PayDollar may be considered only after confirming both methods under one merchant account.
2. Configure Amazon SES in Singapore for account verification, password recovery, email-change verification, security alerts, and all formal transactional email. Obtain production sending access, authenticate the sending domain, and verify delivery, bounce, complaint, retry, and alert handling before live use.
3. Keep the existing legal/compliance review item for minors, statistical-use notice, answer retention, candidate-initiated no-refund terms, platform-cancellation refund/voucher terms, and Singapore-region data processing.

### Reliability and operations gates

1. Revisit whether to enable PITR and select a retention window based on actual production usage, risk, and cost; this is not a pre-launch gate.
2. If RPO/RTO objectives are adopted later, demonstrate them in a restore exercise; Supabase PITR restore temporarily makes the project unavailable and does not guarantee a specific RTO.
3. Verify the manual monthly incident-evidence deletion procedure and automated result publication/correction workflows during operations.

## 9. Suggested delivery sequence

1. **Foundation:** environment separation, migrations, Auth, profiles, administrator MFA, RLS tests.
2. **Content and sittings:** immutable paper versions, bilingual content, sitting publication and registration rules.
3. **Orders and entitlements:** unified PayMe/Octopus provider adapter, verified payment/refund webhooks and queries, monthly term ledger, automatic single-sitting registration, monthly bookings, cancellations, refunds, and vouchers.
4. **Exam engine:** attempt start, transactional answer save, deadline finalization, save-status UX.
5. **Results:** score snapshot, statistics thresholds, relative grade calculation, answer/explanation access control.
6. **Operations:** incidents, admin audit, platform-cancellation preview/apply, notifications, account deletion.
7. **Hardening:** load tests, failure recovery, backups/restore, privacy review, production deployment rehearsal.

Do not connect a live payment provider, send real notifications, or deploy production migrations until the provider and legal gates are closed and the database recovery plan is approved.

AI question generation and topic labeling run outside the portal. Choosing the external authoring tool/provider is a separate content workflow decision, not a portal backend integration gate.
