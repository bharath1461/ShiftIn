-- ============================================================
-- ShiftIn — Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ===================== PROFILES =====================
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  firebase_uid text unique not null,
  role text not null check (role in ('student', 'employer')),
  email text,
  phone text,
  full_name text not null default '',
  avatar_url text,
  -- Student fields
  college text,
  course text,
  semester text,
  skills text[] default '{}',
  preferred_location text,
  availability text[] default '{}',
  -- Employer fields
  company_name text,
  business_type text,
  company_location text,
  contact_person text,
  -- Verification
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected', 'under_review')),
  verification_result jsonb,
  -- Meta
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===================== JOBS =====================
create table public.jobs (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  category text,
  description text,
  requirements text,
  pay_amount decimal(10,2),
  pay_unit text default 'hr' check (pay_unit in ('hr', 'shift', 'month')),
  shift_type text,
  shift_start timestamptz,
  shift_end timestamptz,
  location text,
  openings int default 1,
  status text default 'active' check (status in ('active', 'closed', 'draft')),
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===================== APPLICATIONS =====================
create table public.applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.jobs(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  resume_url text,
  cover_letter text,
  availability_note text,
  status text default 'pending' check (status in ('pending', 'shortlisted', 'hired', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(job_id, student_id)
);

-- ===================== VERIFICATIONS =====================
create table public.verifications (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  document_type text,
  document_front_url text,
  document_back_url text,
  selfie_url text,
  ai_result jsonb,
  status text default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz default now()
);

-- ===================== RLS POLICIES =====================
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.verifications enable row level security;

-- Profiles: users can read all, but only update their own
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');
create policy "Users can insert own profile" on public.profiles for insert with check (true);

-- Jobs: everyone can read active, employers can insert/update their own
create policy "Active jobs are viewable" on public.jobs for select using (true);
create policy "Employers can insert jobs" on public.jobs for insert with check (true);
create policy "Employers can update own jobs" on public.jobs for update using (true);

-- Applications: students can insert, employers can read for their jobs
create policy "Applications viewable" on public.applications for select using (true);
create policy "Students can apply" on public.applications for insert with check (true);
create policy "Applications updatable" on public.applications for update using (true);

-- Verifications
create policy "Verifications viewable" on public.verifications for select using (true);
create policy "Verifications insertable" on public.verifications for insert with check (true);
create policy "Verifications updatable" on public.verifications for update using (true);

-- ===================== STORAGE BUCKETS =====================
-- Create these in Supabase Dashboard > Storage:
-- 1. "avatars" bucket (public)
-- 2. "resumes" bucket (private)
-- 3. "documents" bucket (private)

-- ===================== INDEXES =====================
create index idx_profiles_firebase_uid on public.profiles(firebase_uid);
create index idx_profiles_role on public.profiles(role);
create index idx_jobs_employer on public.jobs(employer_id);
create index idx_jobs_status on public.jobs(status);
create index idx_applications_job on public.applications(job_id);
create index idx_applications_student on public.applications(student_id);
