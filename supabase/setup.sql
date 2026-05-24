-- ============================================================
-- DETAILS — Complete Database Setup
-- SMK Telkom Malang
--
-- CARA PAKAI:
-- 1. Buka Supabase SQL Editor
-- 2. Copy-paste SELURUH file ini
-- 3. Klik Run
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('teacher', 'admin_jurusan', 'super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type skill_level as enum ('beginner', 'intermediate', 'advanced', 'expert');
exception when duplicate_object then null; end $$;

do $$ begin
  create type portfolio_type as enum ('project', 'publication', 'award', 'other');
exception when duplicate_object then null; end $$;

-- ─── Tables ──────────────────────────────────────────────────

create table if not exists public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null unique,
  role       user_role not null default 'teacher',
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id   uuid primary key default uuid_generate_v4(),
  name text not null unique,
  icon text not null default '🎓'
);

create table if not exists public.teachers (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null unique references public.users(id) on delete cascade,
  slug          text not null unique,
  full_name     text not null,
  nickname      text,
  photo_url     text,
  bio           text,
  motto         text,
  department_id uuid references public.departments(id) on delete set null,
  subject       text,
  experience    integer check (experience >= 0),
  linkedin      text,
  github        text,
  website       text,
  instagram     text,
  created_at    timestamptz not null default now()
);

create table if not exists public.skills (
  id         uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  skill_name text not null,
  level      skill_level not null default 'intermediate'
);

create table if not exists public.certifications (
  id             uuid primary key default uuid_generate_v4(),
  teacher_id     uuid not null references public.teachers(id) on delete cascade,
  title          text not null,
  issuer         text not null,
  issue_date     date not null,
  expired_date   date,
  credential_url text,
  file_url       text,
  is_verified    boolean not null default false,
  created_at     timestamptz not null default now()
);

create table if not exists public.portfolios (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references public.teachers(id) on delete cascade,
  title       text not null,
  description text not null default '',
  media_url   text,
  type        portfolio_type not null default 'project',
  created_at  timestamptz not null default now()
);

create table if not exists public.achievements (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references public.teachers(id) on delete cascade,
  title       text not null,
  year        integer not null check (year >= 1900 and year <= 2100),
  description text not null default ''
);

create table if not exists public.profile_views (
  id         uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  visitor_ip text not null,
  viewed_at  timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────
create index if not exists idx_teachers_slug          on public.teachers(slug);
create index if not exists idx_teachers_user_id       on public.teachers(user_id);
create index if not exists idx_teachers_department_id on public.teachers(department_id);
create index if not exists idx_teachers_full_name     on public.teachers(full_name);
create index if not exists idx_skills_teacher_id      on public.skills(teacher_id);
create index if not exists idx_certs_teacher_id       on public.certifications(teacher_id);
create index if not exists idx_certs_is_verified      on public.certifications(is_verified);
create index if not exists idx_portfolios_teacher_id  on public.portfolios(teacher_id);
create index if not exists idx_achievements_teacher   on public.achievements(teacher_id);
create index if not exists idx_views_teacher_id       on public.profile_views(teacher_id);
create index if not exists idx_views_viewed_at        on public.profile_views(viewed_at);

-- ─── Enable RLS ──────────────────────────────────────────────
alter table public.users          enable row level security;
alter table public.departments    enable row level security;
alter table public.teachers       enable row level security;
alter table public.skills         enable row level security;
alter table public.certifications enable row level security;
alter table public.portfolios     enable row level security;
alter table public.achievements   enable row level security;
alter table public.profile_views  enable row level security;

-- ─── Drop all existing policies (clean slate) ────────────────
do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- ─── Helper: get role without recursive RLS ──────────────────
create or replace function public.get_my_role()
returns text language sql security definer stable as $$
  select role::text from public.users where id = auth.uid();
$$;

-- ─── RLS Policies ────────────────────────────────────────────

-- users
create policy "users_select"   on public.users for select using (true);
create policy "users_insert"   on public.users for insert with check (true);
create policy "users_update"   on public.users for update using (auth.uid() = id);
create policy "users_update_admin" on public.users for update using (
  public.get_my_role() = 'super_admin'
);

-- departments
create policy "depts_select"   on public.departments for select using (true);
create policy "depts_insert"   on public.departments for insert with check (true);
create policy "depts_update"   on public.departments for update using (true);
create policy "depts_delete"   on public.departments for delete using (true);

-- teachers
create policy "teachers_select" on public.teachers for select using (true);
create policy "teachers_insert" on public.teachers for insert with check (true);
create policy "teachers_update" on public.teachers for update using (user_id = auth.uid());
create policy "teachers_delete" on public.teachers for delete using (
  user_id = auth.uid() or public.get_my_role() in ('super_admin', 'admin_jurusan')
);

-- skills
create policy "skills_select" on public.skills for select using (true);
create policy "skills_all"    on public.skills for all using (
  exists (select 1 from public.teachers t where t.id = teacher_id and t.user_id = auth.uid())
);

-- certifications
create policy "certs_select"       on public.certifications for select using (true);
create policy "certs_insert"       on public.certifications for insert with check (
  exists (select 1 from public.teachers t where t.id = teacher_id and t.user_id = auth.uid())
);
create policy "certs_delete"       on public.certifications for delete using (
  exists (select 1 from public.teachers t where t.id = teacher_id and t.user_id = auth.uid())
);
create policy "certs_update_admin" on public.certifications for update using (
  public.get_my_role() in ('super_admin', 'admin_jurusan')
);

-- portfolios
create policy "portfolios_select" on public.portfolios for select using (true);
create policy "portfolios_all"    on public.portfolios for all using (
  exists (select 1 from public.teachers t where t.id = teacher_id and t.user_id = auth.uid())
);

-- achievements
create policy "achievements_select" on public.achievements for select using (true);
create policy "achievements_all"    on public.achievements for all using (
  exists (select 1 from public.teachers t where t.id = teacher_id and t.user_id = auth.uid())
);

-- profile_views
create policy "views_insert" on public.profile_views for insert with check (true);
create policy "views_select" on public.profile_views for select using (
  exists (select 1 from public.teachers t where t.id = teacher_id and t.user_id = auth.uid())
  or public.get_my_role() in ('super_admin', 'admin_jurusan')
);

-- ─── Seed Data ───────────────────────────────────────────────
insert into public.departments (name, icon) values
  ('Rekayasa Perangkat Lunak',       '💻'),
  ('Teknik Komputer dan Jaringan',   '🌐'),
  ('Multimedia',                     '🎨'),
  ('Teknik Elektronika Industri',    '⚡'),
  ('Teknik Otomasi Industri',        '🤖'),
  ('Akuntansi dan Keuangan Lembaga', '📊'),
  ('Manajemen Perkantoran',          '🏢'),
  ('Bisnis Daring dan Pemasaran',    '🛒')
on conflict (name) do nothing;

-- ─── Auto-create user on signup ──────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'teacher')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Set Super Admin ─────────────────────────────────────────
-- Uncomment dan ganti email setelah user pertama login:
-- UPDATE public.users SET role = 'super_admin' WHERE email = 'admin@smktelkom-mlg.sch.id';
