-- Run this in the Supabase SQL editor for your project.

create table if not exists applicants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  phone text not null,
  email text not null,
  guardian text not null
    check (guardian in ('father', 'relative', 'other')),
  cnic_photo_url text,
  cnic_number text,
  status text not null default 'applied'
    check (status in ('applied', 'shortlisted', 'offer_sent', 'completed', 'rejected')),
  stipend numeric,
  contract_period text,
  notes text
);

-- Migration: the form used to collect a "domain" (role applying for) field,
-- now replaced with "guardian". Run this against an existing table that
-- still has the old column:
--   alter table applicants add column if not exists guardian text
--     check (guardian in ('father', 'relative', 'other'));
--   update applicants set guardian = 'other' where guardian is null;
--   alter table applicants alter column guardian set not null;
--   alter table applicants drop column if exists domain;

alter table applicants enable row level security;

-- RLS policies (below) only decide WHICH rows a role can touch -- Postgres
-- still requires the base table grants below before a role can run insert/
-- select/update on the table at all. Without these, every insert fails
-- with "permission denied for table applicants" even though the RLS
-- policy itself is correct.
grant insert on applicants to anon, authenticated;
grant select, update on applicants to authenticated;

-- Public applicants can insert their own application (form is unauthenticated).
-- "to public" (not just "to anon") matters: if whoever is submitting happens
-- to have an unrelated logged-in Supabase session in the same browser (e.g.
-- an admin testing the form while still signed into /admin), Supabase sends
-- that session's "authenticated" token instead of the anon key on every
-- request -- an anon-only policy would then reject a perfectly legitimate
-- submission with "row violates row-level security policy".
create policy "Anyone can submit an application"
  on applicants for insert
  to public
  with check (true);

-- Only authenticated (HR/admin) users can read or update applicant records.
create policy "Authenticated users can view applicants"
  on applicants for select
  to authenticated
  using (true);

create policy "Authenticated users can update applicants"
  on applicants for update
  to authenticated
  using (true);

-- Storage: create a public bucket for CNIC photos via the dashboard
-- (Storage -> New bucket -> name it "cnic-photos", public = true for MVP).
-- For production, prefer a private bucket + signed URLs instead of public
-- access, since CNIC images are sensitive personal data.

-- n8n integration point:
-- Add a Database Webhook (Database -> Webhooks in the Supabase dashboard)
-- on the "applicants" table, event = UPDATE, condition = status changed to
-- 'shortlisted'. Point it at an n8n webhook trigger URL to kick off the
-- "email Bin Aslam" step of the pipeline.


-- =====================================================================
-- Employee onboarding (separate from the hiring "applicants" flow above)
-- =====================================================================
-- This collects full employee paperwork (CNIC, bank/IBAN, nominee info)
-- for people who have ALREADY been hired. It is materially more
-- sensitive than the applicants table above, so it gets its own table,
-- its own private storage bucket, and access locked to exactly the
-- three admin emails below (not "any authenticated user").
--
-- Update ADMIN_EMAILS in both policies below if the allow-list ever
-- changes.

create table if not exists onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- 'pending' means the client wrote its form fields but hasn't finished
  -- uploading/attaching documents yet -- see the "pending row first" note
  -- on the update policy below for why this exists.
  status text not null default 'pending'
    check (status in ('pending', 'submitted', 'reviewed')),

  -- Identity & personal details
  full_name text not null,
  guardian_name text not null,
  cnic_number text not null,
  -- Document path columns are nullable: the client inserts the row as
  -- 'pending' with these still null, then fills them in and flips status
  -- to 'submitted' once uploads finish. This means a submission attempt
  -- is visible in this table the instant it starts, even if the browser
  -- never completes the uploads (e.g. backgrounded/killed mid-upload on
  -- mobile) -- previously nothing was written until every upload and the
  -- insert had already succeeded, so a failed attempt left no trace at all.
  cnic_front_path text,
  cnic_back_path text,
  date_of_birth date not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  marital_status text not null
    check (marital_status in ('single', 'married', 'divorced', 'widowed')),
  nationality text not null,
  passport_photo_path text,
  posts_photo_path text,

  -- Contact information
  phone text not null,
  guardian_phone text not null,
  email text not null,
  current_address text not null,
  permanent_address text not null,
  emergency_contact_1_name text not null,
  emergency_contact_1_relationship text not null,
  emergency_contact_1_phone text not null,
  emergency_contact_2_name text,
  emergency_contact_2_relationship text,
  emergency_contact_2_phone text,

  -- Payroll & tax
  bank_name text not null,
  bank_branch text not null,
  account_title text not null,
  account_number text not null,
  iban text not null,
  fbr_filer_status text not null
    check (fbr_filer_status in ('filer', 'non_filer', 'not_sure')),

  -- Statutory & benefits
  nominee_name text not null,
  nominee_cnic text not null,
  nominee_relationship text not null,
  blood_group text not null,

  -- Employment & education (also nullable -- see the comment on the
  -- identity document paths above)
  offer_letter_path text,
  university_proof_path text,
  degree_certificate_paths text[] not null default '{}',

  notes text
);

alter table onboarding_submissions enable row level security;

-- See the note above the "applicants" grants for why these are needed in
-- addition to the RLS policies below. "select" and "update" are granted to
-- anon too (not just authenticated): the client writes its own row as
-- 'pending' then updates it in place with document paths once uploads
-- finish. SELECT is required even though anon never reads submissions back
-- -- Postgres needs it to evaluate the WHERE/RLS conditions ("id = ..." and
-- "status = 'pending'") on UPDATE, not just to return rows. The "Anyone can
-- complete their own pending submission" policy below is the RLS layer that
-- actually restricts which rows/columns this grant lets anon touch -- the
-- grant alone doesn't let anon read arbitrary rows, since every row anon
-- could target this way is one whose id it already generated client-side.
grant insert, select, update on onboarding_submissions to anon, authenticated;

-- New hires fill this out unauthenticated, same as the /apply form.
-- "to public" (not just "to anon") matters: see the matching note above the
-- "applicants" insert policy -- an unrelated logged-in admin session in the
-- same browser would otherwise get incorrectly rejected here too.
create policy "Anyone can submit onboarding paperwork"
  on onboarding_submissions for insert
  to public
  with check (true);

-- Only Bin Aslam, Noor, and this project's owner account can read
-- onboarding submissions -- deliberately NOT "any authenticated user".
create policy "Only onboarding admins can view submissions"
  on onboarding_submissions for select
  to authenticated
  using (
    auth.jwt() ->> 'email' in (
      'noor@hirenum.com',
      'muhammad@hirenum.com',
      'abdullahkaleem0163@gmail.com'
    )
  );

create policy "Only onboarding admins can update submissions"
  on onboarding_submissions for update
  to authenticated
  using (
    auth.jwt() ->> 'email' in (
      'noor@hirenum.com',
      'muhammad@hirenum.com',
      'abdullahkaleem0163@gmail.com'
    )
  );

-- Lets an unauthenticated submitter finish writing document paths onto the
-- 'pending' row they just created (see the status column comment above),
-- without opening up access to rows that are already submitted/reviewed --
-- those stay admin-only via the policy above. "to public" for the same
-- reason as the insert policy above.
create policy "Anyone can complete their own pending submission"
  on onboarding_submissions for update
  to public
  using (status = 'pending')
  with check (status in ('pending', 'submitted'));

-- Private storage bucket for onboarding documents (CNIC, offer letter,
-- degree certs, photos). Unlike "cnic-photos" above, this is NOT public --
-- admins view files via short-lived signed URLs generated on demand.
insert into storage.buckets (id, name, public)
values ('onboarding-documents', 'onboarding-documents', false)
on conflict (id) do nothing;

-- "to public" (not just "to anon") matters: see the matching note above the
-- "applicants" insert policy -- an unrelated logged-in admin session in the
-- same browser would otherwise get incorrectly rejected here too.
create policy "Anyone can upload onboarding documents"
  on storage.objects for insert
  to public
  with check (bucket_id = 'onboarding-documents');

create policy "Only onboarding admins can read onboarding documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'onboarding-documents'
    and auth.jwt() ->> 'email' in (
      'noor@hirenum.com',
      'muhammad@hirenum.com',
      'abdullahkaleem0163@gmail.com'
    )
  );
