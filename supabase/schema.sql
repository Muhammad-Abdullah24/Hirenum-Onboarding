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

-- Public applicants can insert their own application (form is unauthenticated).
create policy "Anyone can submit an application"
  on applicants for insert
  to anon
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
  status text not null default 'submitted'
    check (status in ('submitted', 'reviewed')),

  -- Identity & personal details
  full_name text not null,
  guardian_name text not null,
  cnic_number text not null,
  cnic_front_path text not null,
  cnic_back_path text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  marital_status text not null
    check (marital_status in ('single', 'married', 'divorced', 'widowed')),
  nationality text not null,
  passport_photo_path text not null,
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

  -- Employment & education
  offer_letter_path text not null,
  university_proof_path text not null,
  degree_certificate_paths text[] not null default '{}',

  notes text
);

alter table onboarding_submissions enable row level security;

-- New hires fill this out unauthenticated, same as the /apply form.
create policy "Anyone can submit onboarding paperwork"
  on onboarding_submissions for insert
  to anon
  with check (true);

-- Only Bin Aslam, Noor, and this project's owner account can read/update
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

-- Private storage bucket for onboarding documents (CNIC, offer letter,
-- degree certs, photos). Unlike "cnic-photos" above, this is NOT public --
-- admins view files via short-lived signed URLs generated on demand.
insert into storage.buckets (id, name, public)
values ('onboarding-documents', 'onboarding-documents', false)
on conflict (id) do nothing;

create policy "Anyone can upload onboarding documents"
  on storage.objects for insert
  to anon
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
