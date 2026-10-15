-- ============================================================
--  TraceWise — Database Schema
--  Normal Forms Applied:
--    1NF  Each column holds one atomic value, no repeating groups.
--    2NF  Every non-key column fully depends on the whole primary key
--         (relevant for composite PKs — none used here, all PKs are
--         single UUID columns, so 2NF is trivially satisfied).
--    3NF  No transitive dependencies: every non-key column depends
--         only on the PK, not on another non-key column.
--         e.g. company_name is in `companies`, not duplicated in
--         `departments` or `documents`.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 1. companies ────────────────────────────────────────────
-- 1NF: each row is one company, all columns atomic.
-- 3NF: owner_id → profiles (no transitive deps here).
create table if not exists public.companies (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  owner_id   uuid not null,            -- FK set after profiles table
  created_at timestamptz default now()
);

-- ── 2. profiles ─────────────────────────────────────────────
-- 1NF: atomic columns, one row per auth user.
-- 3NF: role and company_id are direct attributes of the user;
--      company_name is NOT stored here (would be transitive via company_id).
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  company_id    uuid references public.companies(id) on delete set null,
  department_id uuid,                  -- FK added after departments table
  role          text not null check (role in ('owner','department_member')),
  full_name     text not null default '',
  created_at    timestamptz default now()
);

-- ── 3. departments ──────────────────────────────────────────
-- 1NF: one row per department, slug is atomic.
-- 2NF/3NF: company_id is the only non-key dependency; name/slug/email
--          all describe this specific department row directly.
create table if not exists public.departments (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  slug        text not null check (slug in ('sales','marketing','operations')),
  login_email text not null unique,    -- credential given to employee
  created_at  timestamptz default now(),
  unique (company_id, slug)            -- one dept per slug per company
);

-- Back-fill FK on profiles
alter table public.profiles
  add constraint fk_profile_department
  foreign key (department_id) references public.departments(id) on delete set null;

-- Back-fill FK on companies (owner is a profile)
alter table public.companies
  add constraint fk_company_owner
  foreign key (owner_id) references public.profiles(id) on delete restrict;

-- ── 4. documents ────────────────────────────────────────────
-- 1NF: atomic columns, one file per row.
-- 3NF: status/name depend only on this doc's PK, not on company or dept.
create table if not exists public.documents (
  id            uuid primary key default uuid_generate_v4(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  name          text not null,
  file_path     text,
  status        text not null default 'up-to-date'
                  check (status in ('up-to-date','review-needed','conflict')),
  created_by    uuid references public.profiles(id) on delete set null,
  updated_at    timestamptz default now(),
  created_at    timestamptz default now()
);

-- ── 5. document_links (dependency graph) ────────────────────
-- 1NF: one relationship per row (no arrays of targets).
-- 2NF: composite key would be (source_doc_id, target_doc_id); we use
--      a surrogate UUID PK instead — all attributes describe this link.
-- 3NF: reason and impact_level describe this specific link, not the docs.
create table if not exists public.document_links (
  id             uuid primary key default uuid_generate_v4(),
  company_id     uuid not null references public.companies(id) on delete cascade,
  source_doc_id  uuid not null references public.documents(id) on delete cascade,
  target_doc_id  uuid not null references public.documents(id) on delete cascade,
  impact_level   text not null check (impact_level in ('high','medium','low')),
  reason         text not null,
  created_at     timestamptz default now(),
  unique (source_doc_id, target_doc_id)
);

-- ── 6. approvals ────────────────────────────────────────────
-- 1NF: one approval decision per row.
-- 3NF: note/status/reviewed_by describe this approval event, not the link.
create table if not exists public.approvals (
  id                 uuid primary key default uuid_generate_v4(),
  company_id         uuid not null references public.companies(id) on delete cascade,
  document_link_id   uuid not null references public.document_links(id) on delete cascade,
  requested_by       uuid references public.profiles(id) on delete set null,
  reviewed_by        uuid references public.profiles(id) on delete set null,
  status             text not null default 'pending'
                       check (status in ('pending','approved','rejected')),
  note               text,
  created_at         timestamptz default now()
);

-- ── 7. notifications ────────────────────────────────────────
-- 1NF: one message per row; is_read is atomic boolean.
-- 3NF: title/message depend only on notification PK.
create table if not exists public.notifications (
  id            uuid primary key default uuid_generate_v4(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  title         text not null,
  message       text not null,
  is_read       boolean not null default false,
  created_at    timestamptz default now()
);

-- ============================================================
--  Row Level Security (RLS)
-- ============================================================
alter table public.companies      enable row level security;
alter table public.profiles       enable row level security;
alter table public.departments    enable row level security;
alter table public.documents      enable row level security;
alter table public.document_links enable row level security;
alter table public.approvals      enable row level security;
alter table public.notifications  enable row level security;

-- Helper: get company_id of the calling user
create or replace function public.my_company_id()
returns uuid language sql stable security definer as $$
  select company_id from public.profiles where id = auth.uid();
$$;

-- Helper: get role of the calling user
create or replace function public.my_role()
returns text language sql stable security definer as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── Policies ────────────────────────────────────────────────

-- profiles: users see/update only their own row
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or company_id = public.my_company_id());

create policy "profiles_insert" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update" on public.profiles
  for update using (id = auth.uid());

-- companies: owner full access; members of same company read-only
create policy "companies_select" on public.companies
  for select using (id = public.my_company_id());

create policy "companies_insert" on public.companies
  for insert with check (owner_id = auth.uid());

create policy "companies_update" on public.companies
  for update using (owner_id = auth.uid());

-- departments: owner CRUD; members read own dept
create policy "departments_select" on public.departments
  for select using (company_id = public.my_company_id());

create policy "departments_insert" on public.departments
  for insert with check (
    company_id = public.my_company_id() and public.my_role() = 'owner'
  );

create policy "departments_update" on public.departments
  for update using (
    company_id = public.my_company_id() and public.my_role() = 'owner'
  );

create policy "departments_delete" on public.departments
  for delete using (
    company_id = public.my_company_id() and public.my_role() = 'owner'
  );

-- documents: same company, dept members see only their dept docs
create policy "documents_select" on public.documents
  for select using (
    company_id = public.my_company_id() and (
      public.my_role() = 'owner'
      or department_id = (select department_id from public.profiles where id = auth.uid())
    )
  );

create policy "documents_insert" on public.documents
  for insert with check (company_id = public.my_company_id());

create policy "documents_update" on public.documents
  for update using (company_id = public.my_company_id());

create policy "documents_delete" on public.documents
  for delete using (
    company_id = public.my_company_id() and public.my_role() = 'owner'
  );

-- document_links, approvals, notifications: company-scoped
create policy "doc_links_select"   on public.document_links for select using (company_id = public.my_company_id());
create policy "doc_links_insert"   on public.document_links for insert with check (company_id = public.my_company_id());
create policy "approvals_select"   on public.approvals      for select using (company_id = public.my_company_id());
create policy "approvals_insert"   on public.approvals      for insert with check (company_id = public.my_company_id());
create policy "approvals_update"   on public.approvals      for update using (company_id = public.my_company_id());
create policy "notifications_sel"  on public.notifications  for select using (company_id = public.my_company_id());
create policy "notifications_upd"  on public.notifications  for update using (company_id = public.my_company_id());

-- ============================================================
--  Trigger: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'owner')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Add password_hash to profiles (FastAPI stores bcrypt hash here)
alter table public.profiles
  add column if not exists password_hash text,
  add column if not exists email text;

-- Add login_password_hash to departments
alter table public.departments
  add column if not exists login_password_hash text not null default '';

-- Add indexes for email lookups
create index if not exists idx_profiles_email    on public.profiles(email);
create index if not exists idx_depts_login_email on public.departments(login_email);