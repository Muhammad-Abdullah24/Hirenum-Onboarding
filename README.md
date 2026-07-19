# Hirenum onboarding site

Standalone Next.js app for the internship/hiring application flow, styled to
match the Hirenum design system (dark-first, cyan/magenta brand accents,
glass cards, glow orbs). Built as the front door for the onboarding
automation — the applicant-facing form plus a minimal HR dashboard for
shortlisting. n8n workflow is **not** included here on purpose; this app
just needs to write clean data to Supabase for n8n to pick up.

## What's implemented

- Public landing page (`/`) — hero, open roles, process overview
- Application form (`/apply`) — name, phone, email, domain, CNIC photo
  upload, writes to Supabase
- Success page (`/apply/success`)
- HR dashboard (`/admin`) — lists applicants, filter by status, one-click
  shortlist/reject, protected by Supabase auth
- Admin login (`/admin/login`)
- Full design system from the theme doc: light/dark tokens, Outfit +
  Inter fonts, glow orbs, glass cards, gradient buttons, hover utilities,
  giant footer wordmark, reduced-motion support

## What's intentionally left for you / Claude Code

- The n8n workflow itself (email to Bin Aslam, his terms form, offer
  letter template merge, e-signature dispatch)
- CNIC OCR (vision AI extracting `cnic_number` from the uploaded photo —
  the field already exists on the table, just unpopulated)
- Offer letter templates per domain
- Proper HR user provisioning (see below, currently manual)
- Internship domain list in `src/lib/domains.ts` is a placeholder guess
  based on Hirenum's public site — edit to match the real categories

## Setup

1. `npm install`
2. Create a Supabase project (or use the existing one already running your
   scheduler).
3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. In Supabase Storage, create a bucket named `cnic-photos`. For a quick
   start, set it public; for production, switch to private + signed URLs
   since CNIC photos are sensitive.
5. Create at least one HR user under Authentication -> Users in the
   Supabase dashboard (email + password) so `/admin` is reachable. There's
   no self-serve signup page by design — HR accounts should be provisioned
   manually or invited.
6. Copy `.env.example` to `.env.local` and fill in your Supabase project
   URL and anon key (Project Settings -> API).
7. `npm run dev` and open `http://localhost:3000`.

## Handoff point to n8n

The dashboard's "Shortlist" button flips `applicants.status` to
`shortlisted`. That's the trigger n8n should watch for — set up a Supabase
Database Webhook (Database -> Webhooks) on `applicants`, event `UPDATE`,
and point it at an n8n webhook node. From there, n8n owns everything else:
emailing Bin Aslam, his terms-collection form, the offer letter merge, and
e-signature dispatch. This app doesn't need to know any of that happens —
it just reads and writes `applicants` rows.

## Notes on the design system

- Dark mode is the default (`defaultTheme="dark"` in
  `ThemeProviderWrapper`), matching the brand's dark-first identity.
- All colors route through CSS variables in `globals.css` — no hardcoded
  hex outside the two brand constants and their glow/shadow variants, so
  both themes stay correct automatically.
- Fonts: Outfit for headings/buttons, Inter for body — loaded via
  `next/font/google` in `src/app/layout.tsx`.
- Component building blocks live in `src/components/ui` and
  `src/components/layout` — reuse `GlassCard`, `Eyebrow`, `Nav`, `Footer`,
  `GlowOrbs` rather than writing new one-off styles when adding pages.
