# HKDSE Mock Exam Portal Frontend Prototype

**Date:** 2026-10-24  
**Status:** Approved design; prototype implementation not started

## Purpose

Create a clickable, fake-data-driven web prototype to validate the main student journey and the minimum administration workflow for a direct-to-student HKDSE mock exam portal. The prototype is for product feedback only. It is not a production service and must not collect real student information or claim to conduct a real exam.

## Goals

- Demonstrate how a student discovers a sitting, selects an exam language, chooses a purchase option, takes a mock exam, and reviews results.
- Demonstrate the essential solo-operator tasks: preparing and publishing a paper, scheduling a sitting, reviewing operational summaries, and handling a sitting incident.
- Make important states and constraints visible, including saved-answer status, exam deadlines, subscription auto-enrollment, and purchase/refund terms.
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

Uses a separate prototype route or role switch to inspect business summaries, import and review paper content, publish a paper, create a sitting, inspect registrations/results, and simulate incident controls. The intended production design is a single administrator protected by MFA; the prototype only illustrates this boundary.

## Information architecture

### Public and student pages

1. **Home**
   - Upcoming sittings are the primary content.
   - Prominent actions: view sittings, try the free demonstration, sign in/register.
   - Include concise service information without turning the page into a long marketing site.
2. **Sitting list and detail**
   - Show subject/paper, date and time, duration, registration deadline, available exam languages, and placeholder price.
   - Distinguish registration-open, registration-closed, and cancelled states. There is no seat cap or minimum enrollment; do not show a full state, waitlist, or capacity limit.
3. **Free demonstration**
   - Simulate sign-in and verified-email gating.
   - Use a short sample set with no timer and no score.
   - Allow answering questions and revealing each correct answer individually.
4. **Sign-in and registration**
   - Simulated email/password form, verification state, and validation/error feedback.
   - Use a placeholder username; do not request real name, school, or HKID.
5. **Student dashboard**
   - Prioritize upcoming exams, subscription status, eligible sittings, and recent results.
6. **Purchase and subscription**
   - Simulate one-off purchase and monthly subscription options.
   - Before simulated payment, show the price, non-refundable student-cancellation policy, and relevant terms.
   - Subscription payment is manual and does not auto-renew. The term lasts one month from payment.
   - The subscription page does not enumerate every automatically enrolled sitting; it must clearly explain that eligible sittings are enrolled automatically while the subscription is active.
   - Explain that eligibility depends on the sitting's start time falling within the active term and registration still being open. At expiry, unstarted subscription-based registrations are cancelled; the student may purchase an individual seat before that sitting's registration cutoff.
   - Simulate payment success and failure states. Do not ask for or accept real card details.
7. **Exam waiting and attempt**
   - Show the common scheduled start/deadline and countdown.
   - Present one question at a time with previous/next navigation, question-number navigation, mark-for-review, answer selection, and save status.
   - Simulate debounced autosave and server acknowledgement.
   - Show an explicit connection-lost or save-failed state. Offline answering is not supported; recovery resumes from the last server-confirmed answer. Since no backend exists, this behavior is represented with deterministic mock state.
   - A single active device is a production requirement; the prototype may show a simulated device-session notice without implementing device security.
8. **Results and review**
   - Show total score and a predicted HKDSE grade only when the mock paper has configured grade boundaries.
   - Provide question-by-question answers after simulated result publication.
   - Show explanations only in the subscriber view, in the exam language selected for that sitting.
   - Include result-pending and score-only/no-grade-boundary states.
9. **Account and preferences**
   - Interface language: Traditional Chinese or English.
   - Exam language: per-sitting selection for one-off purchases; subscription preference applied to auto-enrolled sittings, with a per-sitting change allowed until the registration deadline.
   - Notification language: separate account preference.
   - Show simulated Telegram connection/consent status without linking a real account.

### Administrator pages

1. **Operations dashboard**
   - Summary cards for revenue, registrations, completion rate, free-demo-to-paid conversion, and subscriptions, using clearly identified placeholder data.
2. **Paper management**
   - Simulate JSON import, validation errors, editing, bilingual preview, and manual publication.
   - Show draft, preview, published, and locked-version states.
3. **Sitting management**
   - Simulate setting paper/version, start time, duration, registration cutoff, price, available languages, and publication.
4. **Registration and results**
   - Default to aggregate views.
   - Show an on-demand individual-attempt detail state and an audit-log indication; no bulk export control.
5. **Incident controls**
   - Simulate pause, extend shared deadline, and void sitting.
   - Require a reason before confirming a consequential action.
   - Show a confirmation state indicating affected candidates can choose a refund or transfer after organizer cancellation/rescheduling; do not actually issue refunds or send messages.

## User flows

### New student exploring and using the free demonstration

Home → upcoming sitting list or free demo → simulated sign-in/email verification → answer sample questions → reveal answers individually → return to sitting list.

### Student purchasing and taking a one-off mock

Sitting detail → sign in → select exam language → review terms and price → simulated checkout → payment success → dashboard → waiting room → timed question-by-question attempt → submit or reach deadline → result-pending state → published score and answer review.

### Student subscribing

Subscription details → choose subscription exam-language preference → review price, manual monthly payment/no auto-renew, and auto-enrollment terms → simulated checkout → dashboard showing subscription status and eligible sittings. The prototype must state that the preferred language is applied to automatic registrations and can be changed for an individual sitting until its registration cutoff. The checkout does not list each sitting.

### Administrator publishing a sitting

Admin dashboard → import/edit paper → view bilingual validation and preview → manually publish/lock paper version → create and preview sitting → publish sitting.

### Administrator handling an incident

Sitting operations view → choose pause, extend, or void → enter reason → review confirmation → see simulated notification outcome and audit-log entry.

## Visual and interaction design

- Use a formal examination-service visual direction: blue, white, and grey; clear typography; restrained decoration; high contrast.
- Use a temporary text wordmark until a product name and logo are supplied.
- Mobile-first responsive layout, with desktop support for longer exam sessions. Do not present the portal as a native application.
- Provide a visible language switcher. Default the interface language from browser settings where practical and remember the user's manual selection. Interface, exam, and notification language remain separate settings.
- Exam timer, save state, question navigation, and primary actions must remain easy to find on small screens.
- Use text and icons in addition to color for status. Show keyboard focus and usable labels for controls.
- Errors, pending states, and unavailable actions must not appear as successful outcomes.

## Prototype data and safety

- Use fixed fixture data and deterministic mock interactions.
- Do not request real email addresses, passwords, phone numbers, payment credentials, or other personal data.
- Do not persist sensitive or realistic student information. If interface preferences are remembered locally, store only non-sensitive display preferences.
- Mark all sample prices, sessions, scores, and results as examples.
- Payment controls must never submit card data.
- Telegram and email actions must never contact real services.

## Acceptance criteria

1. A user can navigate the public home, sitting details, simulated sign-in, free demo, student dashboard, purchase, exam attempt, and result review.
2. A user can navigate the administrator paper workflow, sitting workflow, operations summary, and incident controls.
3. The single-purchase and subscription language rules are presented consistently.
4. Subscription manual payment, no auto-renew, auto-enrollment eligibility, expiry behavior, and the non-refundable student-cancellation policy are clearly disclosed before simulated purchase.
5. The exam view shows common timing, question navigation, review marking, and saved/unsaved or connection-error states.
6. Results distinguish score, configured predicted grade, answer review, and subscriber-only explanations.
7. At least one success path and relevant error/pending paths are reachable using controls in the prototype.
8. Traditional Chinese and English interface switching works, and the chosen interface preference is remembered without collecting personal data.
9. Core layouts remain usable at mobile and desktop widths, with keyboard focus and non-color-only status cues.
10. No real backend, payment, email, Telegram, student information, or exam result is used.

## Deferred decisions

- Product name, logo, and final visual brand tokens.
- Launch subject and paper content.
- Actual one-off and subscription prices.
- Payment processor and production email provider.
- AI originality-checking method.
- Production implementation details, load-test results, and any Render deployment.
