# Olmem Technical Services — Vercel Website

A production-ready Next.js website for Olmem Technical Services, with SMTP email
and an internal lead dashboard at `/admin`.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Copy `.env.example` to `.env.local` first.

## Deploy to Vercel

1. Create a new GitHub repository and copy this project into it.
2. Push to GitHub.
3. In Vercel, choose **Add New → Project**, import the repository, and deploy.
4. Add your production domain in **Project Settings → Domains**.
5. Add the environment variables below in **Project Settings → Environment Variables**.

No build customization is required. Vercel should detect Next.js automatically.

## Contact form — SMTP (not Resend)

The form posts to `/app/api/contact/route.js`, which does two independent things
per submission:

1. **Stores the inquiry as a lead** in Postgres, so it appears in `/admin`.
2. **Emails you a notification** over SMTP through Nodemailer (`lib/mailer.js`).

Neither can sink the other — if mail is down the lead is still captured, and if
the database is down the email still goes out. The visitor only sees an error
when *both* failed, so "sent" always means the request actually went somewhere.

Required variables:

| Variable | Notes |
| --- | --- |
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `465` for SSL, `587` for STARTTLS |
| `SMTP_SECURE` | `true` for port 465 |
| `SMTP_USER` | mailbox that sends |
| `SMTP_PASS` | Gmail/Workspace: a 16-character **App Password**, not the account password |
| `SMTP_FROM` | from address |
| `CONTACT_TO_EMAIL` | where requests are delivered (comma-separate for several) |

Resend is deliberately not used — this matches the Olmem Technical Solutions site,
so both properties run on one email service.

## Admin lead dashboard — `/admin`

Sign in at `/admin/login`. Every request under `/admin` is gated twice: an edge
check in `middleware.js` bounces anyone without a session cookie, and the
`app/admin/(protected)/layout.js` server layout verifies the cookie's HMAC
signature before any lead data is read. `/admin` is excluded from `robots.txt`
and marked `noindex`.

What it does:

- **Dashboard** — active lead count, new/unworked, awaiting follow-up, won, and
  a pipeline breakdown by stage.
- **Leads** — every website inquiry, filterable by stage, plus an archive view.
- **Lead detail** — full request, editable stage/priority/quoted amount/internal
  notes, an archive toggle, and a contact log for recording calls and emails.
  Logging a contact **records only** — it never sends anything to the customer.

Required variables:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string |
| `SESSION_SECRET` | signing key for the admin cookie — `openssl rand -hex 32` |
| `ADMIN_USER` / `ADMIN_PASS` | the single administrator login |
| `ADMIN_EMAIL` | optional; recorded as the author on follow-up entries |

### Database

Connect a Neon store in **Vercel → Storage → Connect Project** using the custom
prefix `DATABASE`, so the pooled string is injected as `DATABASE_URL`. Tables
(`ots_leads`, `ots_lead_follow_ups`) are created automatically on first use —
there is no migration step.

The `ots_` prefix means this site can share one Neon database with the Olmem
Technical Solutions site without the two lead pipelines mixing. Point
`DATABASE_URL` at a separate Neon database if you would rather keep them fully
isolated.

Without `DATABASE_URL` the site still runs: the contact form falls back to
email-only, and the dashboard reports that no database is connected.

## Branding / content

- Logo: `/public/olmem-technical-services-logo.png`
- Site-wide styling: `/app/globals.css`; admin styling: `/app/admin.css`
- Homepage: `/app/(site)/page.js`
- Services: `/app/(site)/services/page.js`
- About: `/app/(site)/about/page.js`
- Service Area: `/app/(site)/service-area/page.js`
- Contact: `/app/(site)/contact/page.js`

`(site)` is a Next.js route group — it does not appear in URLs. It exists so the
public pages get the marketing header/footer while `/admin` renders its own
chrome.

## Important

The site intentionally describes Olmem Technical Services as an independent
maintenance provider rather than an OEM-authorized service center.
