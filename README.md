# Chargely

**Send professional invoices in 60 seconds.**

Chargely is a mobile-first invoicing workspace for freelancers and small businesses across Nigeria and West Africa.

## Built with

- Next.js App Router and TypeScript
- Tailwind CSS
- Supabase Auth and PostgreSQL
- Supabase Row Level Security
- Vercel deployment target

## Implemented

- Marketing landing page
- Email/password signup and login
- Business onboarding and profile settings
- Client records (create, list, delete)
- Saved products and services (create, list, delete)
- Dashboard overview
- Invoice creation with line items, discounts and tax
- Atomic invoice numbering and total calculation in PostgreSQL
- Invoice detail and list views
- Public invoice links with random high-entropy tokens
- WhatsApp sharing and copy-link action
- Browser print / Save as PDF
- Manual payment recording with partial and full payment status
- Payment history and outstanding balance

## Deploy with Vercel

1. Open Vercel and choose **Add New → Project**.
2. Import the `koboby/Chargely` GitHub repository.
3. Keep the framework preset as **Next.js** and the root directory as `./`.
4. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_APP_URL` in Vercel Project Settings → Environment Variables. Use your real Supabase project URL and publishable key; set the app URL to your Vercel production domain.
5. Deploy. Add the Vercel production and preview URLs to Supabase Authentication → URL Configuration → Redirect URLs, and set the production Site URL.
6. Future pushes to the connected GitHub branch trigger Vercel deployments automatically. GitHub Actions in this repository are only checks; they do not deploy the app.

## Local development

1. Install Node.js 20 or newer.
2. Clone this repository.
3. Copy `.env.example` to `.env.local`.
4. Add the Supabase project URL and publishable key.
5. Run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Set `NEXT_PUBLIC_APP_URL` to the deployed HTTPS domain before sending invoice links. Never commit `.env.local`, Supabase service-role keys, Paystack secret keys, or other credentials.

## Supabase

The connected Chargely Supabase project already has the foundation schema and invoice/payment RPC functions applied. The matching reproducible SQL is in `supabase/migrations`.

Enable email/password authentication in Supabase Auth. Configure the Site URL and allowed redirect URLs for local development and your production domain.

Every tenant-owned table has Row Level Security. Access is scoped through the authenticated user's business ownership. Public invoice access is through a 256-bit random token and a narrowly scoped RPC that returns only invoice display fields.

## Build roadmap

1. **Foundation:** authentication, business profile, clients, saved items.
2. **Core invoicing:** invoice creation, PDF/print, public links, WhatsApp sharing and manual payment tracking.
3. **Commercial release:** Paystack subscriptions, server-enforced plan limits, 10+ invoice templates, email reminders, PWA, CSV export, legal pages and SEO.
4. **Growth:** payment links, teams, multi-business support and reports.

Subscription pricing planned: Free (5 documents/month), Pro (₦2,500/month), Business (₦6,000/month). Plan enforcement and Paystack integration are not enabled yet.

## Product principles

- Mobile-first and simple to use.
- No interest-based late fees or automatic penalty charges.
- No payment or subscription is considered successful until verified server-side.
- Never trust client-side plan limits or payment status.
