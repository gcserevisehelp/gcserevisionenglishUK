# NEON ENGLISH v2 — GitHub Pages GCSE English Course Platform

This is a complete redesign of NEON ENGLISH with a **white, professional learning-platform layout** and neon-green / violet accents. All files remain at the repository root for simple GitHub Pages deployment.

## What changed in v2

### Learner site
- White professional homepage and course storefront
- Course finder / “what do you want to work on?” routes
- Five course tiers from the business spreadsheet
- Standard — Literature — £4.99 — 14 days
- Pro — Language — £5.99 — 21 days
- Plus — mixed essentials — £7.99 — 30 days
- Premium — both, condensed — £9.99 — 60 days
- Plus-Premium — full detail + every extra — £14.99 — 180 days
- English Language taught through the NEON revision route **Q5 → Q4 → Q3 → Q2 → Q1**
- Paper 2 Q5 **Presently → Personally → Publicly → Predictably** lesson
- Original Q5 layout image built into the Q5 lesson
- Interactive P4 Q5 planner
- Literature paragraph builder
- Original practice-question generator
- Focus timer + word count + self-checklists
- Six revision games
- Glossary
- Learner-created flashcards
- Bookmarks
- Private lesson notes
- Weekly revision planner
- Lesson search
- Progress bars
- XP and study streaks
- Achievements
- Accessibility settings: larger text, reduced motion and focus mode

### Profile
The new **Profile** area includes:
- display name
- year group
- target grade
- daily revision goal
- mock/exam date
- personal revision note
- completed lesson count
- XP
- study streak
- practice-session count
- achievements
- recent activity
- accessibility preferences

### Control Room
`admin.html` now includes:
- overview / analytics
- course price editing
- course access-duration editing
- payment-link field for each course
- show/hide courses
- lesson manager
- add/edit/delete database lesson overrides
- learner list
- grant timed course access by email
- order viewer
- revenue totals
- announcements
- coupon manager
- public site settings
- payment-security guidance

## GitHub setup

1. Unzip the package.
2. Upload **every file directly to the repository root**. Do not create folders.
3. In GitHub open **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Choose `main` and `/ (root)`.
6. Save.

Your site will be similar to:

`https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`

## Supabase — important if you already used v1

The included `setup.sql` is designed to work as both a **fresh install and a v1 → v2 upgrade**.

Run the whole `setup.sql` in **Supabase → SQL Editor**. It uses `CREATE ... IF NOT EXISTS` and `ALTER ... ADD COLUMN IF NOT EXISTS`; it does not drop your existing learner data.

The new v2 features add tables for:
- `learner_progress`
- `notes`
- `bookmarks`
- `activity_log`
- `coupons`
- `site_settings`

It also adds Profile fields and v2 course/lesson fields while keeping compatibility with the original schema.

## Make your account the owner/admin

First create your account through the NEON learner site. Then run this in the Supabase SQL Editor, replacing the email with the email used for that account:

```sql
update public.profiles
set is_admin = true
where lower(email) = lower('YOUR-ADMIN-EMAIL@example.com');
```

Then open:

`admin.html`

and log in with that account.

Admin accounts automatically pass the website's course-access check, so the owner can open every course.

## Configuration

`config.js` is already filled with the Supabase URL and publishable key supplied for this project.

A publishable / anon key can be used in a browser when Row Level Security is correctly configured. **Never** put a Supabase `service_role` key, Stripe secret, PayPal secret or any other secret credential into GitHub Pages.

## Payments

The course cards and Control Room are **payment-ready**, but v2 intentionally does not fake secure payment processing in browser JavaScript.

Each course has a `payment_url` field in the Control Room. Later you can connect a supported payment provider and place its hosted checkout/payment link there.

For **automatic** enrolment after payment, use a secure server-side webhook such as a Supabase Edge Function. The webhook should:

1. receive a verified successful-payment event from the payment provider;
2. verify the event using the provider's secret on the server;
3. create/update the `orders` row;
4. grant the matching course for its configured number of days.

Do not trust a browser redirect such as `?paid=true` to grant access.

Because the business owner is under 18, use the payment provider only with the parent/guardian involvement required by that provider's terms.

## Course-content security note

GitHub Pages is a static host. Anything placed directly inside `data.js` can technically be inspected by somebody who knows how to view website source files, even if the UI marks it as locked.

For a real paid launch, the strongest setup is to move the full paid lesson bodies into Supabase and keep only public previews in the static files. The included Supabase lesson RLS is already structured so database lesson overrides can be restricted to course members/admins.

## Q5 framework

The learner site includes the provided Paper 2 Q5 layout image as `q5-layout.png` and teaches:

**Presently → Personally → Publicly → Predictably**

The site also explains that **Q5 → Q4 → Q3 → Q2 → Q1 is NEON's revision route**, not an AQA rule requiring that order in the actual exam.

## Copyright / exam-board note

NEON ENGLISH is independent and is not affiliated with or endorsed by AQA. Avoid publishing AQA logos, complete copyrighted exam papers, mark schemes, modern-text extracts or anthology poems without permission. The included practice prompts are original.
