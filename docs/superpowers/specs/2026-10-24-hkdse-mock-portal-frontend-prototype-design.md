# HKDSE Mock Exam Portal Frontend Prototype

**Date:** 2026-11-01

**Status:** Updated to the confirmed product baseline; clickable prototype implemented and validated

## Purpose

Create a clickable, fake-data-driven web prototype to validate the main student journey and the minimum administration workflow for a direct-to-student HKDSE mock exam portal. The prototype is for product feedback only. It is not a production service and must not collect real student information or claim to conduct a real exam.

## Goals

- Demonstrate how a student discovers a sitting, selects an exam language, chooses a purchase option, takes a mock exam, and reviews results.
- Demonstrate the essential solo-operator tasks: preparing and publishing a paper, scheduling a sitting, reviewing operational summaries, and handling a sitting incident.
- Make important states and constraints visible, including payment confirmation, manual monthly bookings, exam deadlines, saved-answer status, and cancellation remedies.
- Work as a mobile-first responsive website on both mobile and desktop browsers.
- Support Traditional Chinese and English interface text.

## Non-goals

- No connection to Supabase, a payment processor, email, Telegram, or any production API.
- No real registration, payment, exam submission, result calculation, or notification delivery.
- No native iOS or Android application.
- No AI question generation, proctoring, or guarantee that browser copying or screenshots are prevented.
- No production database, RLS, authentication, scheduling, or security implementation.
- No final brand identity, actual prices, launch subject, payment provider, or production email provider.

## Users and roles

### Public visitor

Can view upcoming mock exam sittings, see indicative exam information, and enter the free demonstration flow. Registration and email verification in the prototype are simulated.

### Student

Can inspect sittings, select an exam language, simulate a single-exam purchase or subscription purchase, view a dashboard, take a simulated exam, and review simulated results.

### Administrator

The prototype opens on the administrator dashboard. The administrator monitors each exam's payment, registration, attempt, and result-processing status; manages papers and exams; inspects aggregate results; and manages notices. Student pages remain available as a separate preview, but the administrator does not take mock exams. The intended production design is a single administrator protected by MFA; the prototype only illustrates this boundary.

## Information architecture

### Public and student pages

1. **Home**
   - Upcoming sittings are the primary content.
   - Prominent actions: view sittings, try the free demonstration, sign in/register.
   - Lead with 「週末定時模擬考，為 HKDSE 數學做好準備。」 / “Scheduled weekend mocks for HKDSE Mathematics.” Explain that candidates can choose a Chinese or English paper and review results and answers afterwards.
   - Highlight bilingual papers and post-exam results/review below the hero. Keep single-sitting and monthly-plan details elsewhere.
2. **Sitting list and detail**
   - Show subject/paper, date and time, duration, registration deadline, available exam languages, and placeholder price.
   - Distinguish registration-open, registration-closed, and cancelled states. There is no seat cap or minimum enrollment; do not show a full state, waitlist, or capacity limit.
3. **Free demonstration**
   - Provide one fixed set of five bilingual questions without login or a timer.
   - Reveal the correct answer and a short explanation after a response; do not save answers or include them in statistics.
4. **Sign-in and registration**
   - Simulate email/password sign-in and email/password/confirmation registration. Require email verification before student features, checkout, or booking; verification links expire after one hour. An unverified account can only view the verification prompt and resend the link. Verification success does not sign in automatically.
   - Enforce a minimum of eight ASCII characters with at least one letter, digit, and symbol. Spaces are allowed but do not count as symbols; there is no mixed-case requirement.
   - Include current-password confirmation for password changes and a one-time email reset-link flow with a one-hour expiry. Reset requires signing in again. Explain that password changes send a security email, revoke other sessions, and retain the current session.
   - Use fictional sample values only; keep all entered values in transient page state and never transmit or persist credentials. Do not request real name, school, or HKID.
5. **Student dashboard**
   - Show confirmed bookings, subscription status, open sittings, and recent results.
   - Show the latest combined updates and unread count. The header uses an accessible bell icon with a badge (hidden at zero, up to 99, then `99+`) and a gear icon for account settings. Keep dashboard actions and page-title text labels.
   - A monthly booking can be cancelled before the sitting starts and replaced with another eligible booking; a single-sitting cancellation is irreversible, non-refundable, and non-transferable. Cancellation is unavailable at or after the sitting start.
6. **Purchase, payment, and subscription**
   - Trial prices: HK$29 per sitting and HK$99 for a 30-day term; displayed prices include provider fees.
   - Simulate PayMe and Octopus checkout choices. QFPay is only a provisional design assumption; the prototype is not connected to a provider.
   - Require one provider and one merchant account to support both wallets. The candidate selects a method in the portal before its method-specific hosted checkout.
   - Show a payment-pending state on browser return; only simulated trusted server confirmation may complete the purchase. Do not allow another unresolved payment or a method switch until the first is confirmed unpaid or expired.
   - A confirmed single-sitting payment automatically creates that sitting's registration. A 30-day subscription is paid manually, does not auto-renew, and requires the candidate to book each sitting manually.
   - Before simulated payment, show the candidate-initiated non-refundable cancellation policy and platform-cancellation remedy terms. Do not ask for or accept real payment credentials.
   - Include a sample platform-cancellation case: cash-paid single-sitting candidates choose a full original-method refund or voucher within 14 days of successful notice-email delivery. Do not issue a default voucher when delivery fails. Do not simulate refunds as real transactions.
7. **Exam waiting and attempt**
   - Show the 75-minute timer and common deadline, and explain the 15-minute late-start limit with no extra time.
   - Derive question count from the selected paper version. Forty-five questions is an advisory target only, not a publication requirement; the prototype may use five original sample questions, clearly labelled as a shortened prototype attempt.
   - Present one question at a time with previous/next navigation, question-number navigation, mark-for-review, answer selection, and save status.
   - Simulate debounced autosave and server acknowledgement.
   - Show an explicit connection-lost or save-failed state. Offline answering is not supported; recovery resumes from the last server-confirmed answer. Since no backend exists, this behavior is represented with deterministic mock state.
   - A single active device is a production requirement; the prototype may show a simulated device-session notice without implementing device security.
8. **Results and review**
   - Show score and platform-relative grade/percentile only after the applicable minimum sample threshold; never present a result as an HKEAA grade or HKDSE prediction.
   - Provide question-by-question selected and correct answers after simulated submission.
   - Show explanations only in the subscriber view, in the exam language selected for that sitting.
   - Include result-pending and score-only/no-grade-boundary states.
9. **Account and preferences**
   - Interface language: Traditional Chinese or English.
   - Exam language: selected for each registration; locks when the attempt starts.
   - Notification language: separate account preference.
   - Show optional, revocable Telegram consent for non-sensitive reminders without linking a real account.
   - Provide a simulated change-password form requiring the current password and the confirmed password policy; show that the current session remains active while other sessions would be revoked.
10. **Notification centre**
   - Available to signed-in portal accounts whether or not they have purchased or booked an exam.
   - The bell dropdown combines active announcements and personal notifications, sorted newest first, and shows the latest three. Its unread badge counts both categories. Opening an entry marks it read and navigates to the relevant content; “View all” opens the full centre.
   - The full centre defaults to a combined chronological feed and provides All, Announcements, and Personal notifications tabs. Announcement cards show their full text; opening an announcement locates it in the centre and marks it read. Personal notifications mark read and navigate to their related content.
   - Expired or unpublished notices are not shown to students. Keep announcement records separate from account notifications. Do not provide comments or email general announcements; formal exam and payment communications retain their existing workflows.

### Administrator pages

1. **Operations dashboard**
   - Default entry point, with a per-exam overview of pending payments, registrations, started/submitted/not-started attempts, and result-processing status.
   - Allow selecting a sitting to inspect completion rate, published average score and score distribution, and on-demand individual attempts with an audit-log indication.
2. **Paper management**
   - Simulate JSON import, validation errors, editing, bilingual preview, and manual publication.
   - Show draft, preview, published, and locked-version states.
3. **Exam management**
   - Simulate setting paper/version, start time, duration, registration cutoff, price, available languages, and publication. Derive and display question count from the selected paper version; do not make it editable at the sitting level.
   - Treat 45 questions as an advisory target only; a different count warns but does not block publication. Default to Saturday and Sunday at 09:00 HKT; create and publish each sitting separately, with no automatic recurring sitting creation.
   - Default registration opening is seven days before the sitting and cutoff is 30 minutes before it; administrators may override.
4. **Notice management**
   - Allow bilingual draft creation/editing, publication/withdrawal, and an expiry time. General notices are shown in the authenticated information centre only; do not email them.
5. **Incident controls**
   - Simulate pause, extend shared deadline, and void sitting.
   - Require a reason before confirming a consequential action.
   - Show a confirmation state for platform-wide cancellation/rescheduling, including the refund-or-voucher remedy and 14-day SES-delivery-based choice window; do not actually issue refunds or send messages.

## User flows

### New student exploring and using the free demonstration

Home → upcoming sitting list or public free sample → answer up to five fixed questions without login → reveal answers and explanations → return to sitting list.

### Student account and password recovery

Register with email and a policy-compliant password → simulate sending and opening a one-hour verification link → show verification success without auto-login → sign in. For recovery, request a one-time reset link → simulate opening it before expiry → set and confirm a compliant password → return to sign-in. Account settings also supports a current-password-confirmed change and shows the security/session outcome.

### Student purchasing and taking a one-off mock

Sitting detail → sign in → select exam language → review terms and price → select PayMe or Octopus → simulated hosted checkout → pending confirmation → simulated server confirmation → automatic single-sitting registration → dashboard → timed question-by-question attempt → submit or reach deadline → score and answer review with links to the next three bookable sittings.

### Student subscribing

Subscription details → review HK$99/30 days, manual payment/no auto-renew, and manual booking terms → simulated checkout and confirmation → dashboard showing the active term → select a sitting, choose its language, and book it manually.

### Administrator publishing a sitting

Admin dashboard → import/edit paper → view bilingual validation and preview → manually publish/lock paper version → create and preview sitting → publish sitting.

### Administrator handling an incident

Sitting operations view → choose pause, extend, or void → enter reason → review confirmation → see the platform-cancellation remedy, simulated notification outcome, and audit-log entry.

## Visual and interaction design

- Use a formal examination-service visual direction: blue, white, and grey; clear typography; restrained decoration; high contrast.
- Use a temporary text wordmark until a product name and logo are supplied.
- Mobile-first responsive layout, with desktop support for longer exam sessions. Do not present the portal as a native application.
- Provide a compact globe-icon language dropdown showing the current interface language, with Traditional Chinese and English options. Default the interface language from browser settings where practical and remember the user's manual selection. Interface, exam, and notification language remain separate settings.
- Use an accessible bell button with an unread badge and a gear button for account settings; retain text labels in page titles and dashboard actions.
- Exam timer, save state, question navigation, and primary actions must remain easy to find on small screens.
- Use text and icons in addition to color for status. Show keyboard focus and usable labels for controls.
- Errors, pending states, and unavailable actions must not appear as successful outcomes.

## Prototype data and safety

- Use fixed fixture data and deterministic mock interactions.
- Auth forms accept fictional sample values for simulation only. Keep values in transient component state; do not send or persist email/password values or request real personal details.
- Do not persist sensitive or realistic student information. If interface preferences are remembered locally, store only non-sensitive display preferences.
- Mark all sample prices, sessions, scores, and results as examples.
- Payment controls must never submit card data.
- Telegram and email actions must never contact real services.

## Acceptance criteria

1. A user can navigate the public home, sitting details, simulated registration/verification/sign-in, password recovery/change, free demo, student dashboard, purchase, exam attempt, and result review.
2. The administrator dashboard is the default entry and shows per-exam operational states; an exam can be selected to inspect its aggregate results and audited individual attempts.
3. A user can navigate paper and exam management, notice management, and incident controls.
4. The single-purchase and subscription language rules are presented consistently.
5. The prototype shows HK$29 per sitting, HK$99/30 days, PayMe and Octopus choices, one unresolved payment at a time, pending confirmation, auto-registration after confirmed single payment, and manual monthly bookings.
6. The exam view shows common timing, question navigation, review marking, and saved/unsaved or connection-error states.
7. The public sample is fixed, bilingual, no-login, untimed, unscored, and non-persistent; results show the candidate's answers and correct answers, with subscriber-only explanations and no HKEAA-grade claim.
8. At least one success path and relevant error/pending paths are reachable using controls in the prototype.
9. Traditional Chinese and English interface switching works, and the chosen interface preference is remembered without collecting personal data.
10. Core layouts remain usable at mobile and desktop widths, with keyboard focus and non-color-only status cues.
11. The UI derives question count from the selected paper version, shows a non-blocking advisory when it differs from 45, and retains the 75-minute default.
12. Visitors can use the fixed free sample without signing in. Student auth simulation enforces the password policy, one-hour verification/reset-link lifetimes, no auto-login on verification, and reauthentication after reset; no credential leaves transient page state. Admin can draft, edit, publish, withdraw, and expire bilingual notices.
13. A signed-in student sees an accessible bell with the combined unread count, a latest-three dropdown, and an All/Announcements/Personal notifications centre. Reading an item updates its unread state and opens its related content; announcement and personal-notification data remain separate.
14. The homepage retains the session list and primary buttons while clearly stating the scheduled weekend Mathematics mock proposition, bilingual-paper choice, and post-exam results/answer review.
15. The UI shows the 15-minute late start without extra time, weekend 09:00 sitting schedule, and registration window defaults.
16. No real backend, payment, email, Telegram, student information, or exam result is used.

## Deferred decisions

- Product name, logo, and final visual brand tokens.
- Final launch paper content and market validation of trial prices.
- Verification of a Hong Kong sole-proprietor merchant account that supports both wallets, signed payment/refund notifications, status queries, and full original-method refunds; QFPay remains provisional.
- Production email provider configuration and delivery verification.
- AI originality-checking method.
- Production implementation details, load-test results, and any Render deployment.
