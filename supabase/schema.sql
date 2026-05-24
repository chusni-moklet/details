-- ============================================================
-- DETAILS — Supabase Database Schema
-- SMK Telkom Malang
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

create type user_role as enum ('teacher', 'admin_jurusan', 'super_admin');
create type skill_level as enum ('beginner', 'intermediate', 'advanced', 'expert');
create type portfolio_type as enum ('project', 'publication', 'award', 'other');

-- ─── TABLES ──────────────────────────────────────────────────────────────────

-- Users (mirrors auth.users)
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  role        user_role not null default 'teacher',
  created_at  timestamptz not null default now()
);

-- Departments / Program Keahlian
create table public.departments (
  id    uuid primary key default uuid_generate_v4(),
  name  text not null unique,
  icon  text not null default '🎓'
);

-- Teachers
create table public.teachers (
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

-- Skills
create table public.skills (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references public.teachers(id) on delete cascade,
  skill_name  text not null,
  level       skill_level not null default 'intermediate'
);

-- Certifications
create table public.certifications (
  id              uuid primary key default uuid_generate_v4(),
  teacher_id      uuid not null references public.teachers(id) on delete cascade,
  title           text not null,
  issuer          text not null,
  issue_date      date not null,
  expired_date    date,
  credential_url  text,
  file_url        text,
  is_verified     boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Portfolios
create table public.portfolios (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references public.teachers(id) on delete cascade,
  title       text not null,
  description text not null default '',
  media_url   text,
  type        portfolio_type not null default 'project',
  created_at  timestamptz not null default now()
);

-- Achievements
create table public.achievements (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references public.teachers(id) on delete cascade,
  title       text not null,
  year        integer not null check (year >= 1900 and year <= 2100),
  description text not null default ''
);

-- Profile Views
create table public.profile_views (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references public.teachers(id) on delete cascade,
  visitor_ip  text not null,
  viewed_at   timestamptz not null default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

create index idx_teachers_slug          on public.teachers(slug);
create index idx_teachers_user_id       on public.teachers(user_id);
create index idx_teachers_department_id on public.teachers(department_id);
create index idx_teachers_full_name     on public.teachers(full_name);
create index idx_skills_teacher_id      on public.skills(teacher_id);
create index idx_certs_teacher_id       on public.certifications(teacher_id);
create index idx_certs_is_verified      on public.certifications(is_verified);
create index idx_portfolios_teacher_id  on public.portfolios(teacher_id);
create index idx_achievements_teacher   on public.achievements(teacher_id);
create index idx_views_teacher_id       on public.profile_views(teacher_id);
create index idx_views_viewed_at        on public.profile_views(viewed_at);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

alter table public.users          enable row level security;
alter table public.departments    enable row level security;
alter table public.teachers       enable row level security;
alter table public.skills         enable row level security;
alter table public.certifications enable row level security;
alter table public.portfolios     enable row level security;
alter table public.achievements   enable row level security;
alter table public.profile_views  enable row level security;

-- ── users ──
create policy "Users can read own record"
  on public.users for select
  using (auth.uid() = id);

create policy "Admins can read all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('super_admin', 'admin_jurusan')
    )
  );

create policy "Service role can insert users"
  on public.users for insert
  with check (true);

create policy "Users can insert own record"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Admins can update user roles"
  on public.users for update
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'super_admin'
    )
  );

-- ── departments ──
create policy "Anyone can read departments"
  on public.departments for select
  using (true);

create policy "Admins can manage departments"
  on public.departments for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('super_admin', 'admin_jurusan')
    )
  );

-- ── teachers ──
create policy "Anyone can read teachers"
  on public.teachers for select
  using (true);

create policy "Teachers can update own profile"
  on public.teachers for update
  using (user_id = auth.uid());

create policy "Authenticated users can insert own teacher profile"
  on public.teachers for insert
  with check (user_id = auth.uid());

create policy "Admins can manage all teachers"
  on public.teachers for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('super_admin', 'admin_jurusan')
    )
  );

-- ── skills ──
create policy "Anyone can read skills"
  on public.skills for select
  using (true);

create policy "Teachers can manage own skills"
  on public.skills for all
  using (
    exists (
      select 1 from public.teachers t
      where t.id = teacher_id and t.user_id = auth.uid()
    )
  );

-- ── certifications ──
create policy "Anyone can read certifications"
  on public.certifications for select
  using (true);

create policy "Teachers can manage own certifications"
  on public.certifications for insert
  with check (
    exists (
      select 1 from public.teachers t
      where t.id = teacher_id and t.user_id = auth.uid()
    )
  );

create policy "Teachers can delete own certifications"
  on public.certifications for delete
  using (
    exists (
      select 1 from public.teachers t
      where t.id = teacher_id and t.user_id = auth.uid()
    )
  );

create policy "Admins can verify certifications"
  on public.certifications for update
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('super_admin', 'admin_jurusan')
    )
  );

-- ── portfolios ──
create policy "Anyone can read portfolios"
  on public.portfolios for select
  using (true);

create policy "Teachers can manage own portfolios"
  on public.portfolios for all
  using (
    exists (
      select 1 from public.teachers t
      where t.id = teacher_id and t.user_id = auth.uid()
    )
  );

-- ── achievements ──
create policy "Anyone can read achievements"
  on public.achievements for select
  using (true);

create policy "Teachers can manage own achievements"
  on public.achievements for all
  using (
    exists (
      select 1 from public.teachers t
      where t.id = teacher_id and t.user_id = auth.uid()
    )
  );

-- ── profile_views ──
create policy "Anyone can insert profile views"
  on public.profile_views for insert
  with check (true);

create policy "Teachers can read own profile views"
  on public.profile_views for select
  using (
    exists (
      select 1 from public.teachers t
      where t.id = teacher_id and t.user_id = auth.uid()
    )
  );

create policy "Admins can read all profile views"
  on public.profile_views for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('super_admin', 'admin_jurusan')
    )
  );

-- ─── SEED DATA ────────────────────────────────────────────────────────────────

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

-- ─── FUNCTION: auto-create user on auth signup ───────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'teacher')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
