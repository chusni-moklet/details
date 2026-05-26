-- ============================================================
-- DETAILS SKI — Sasaran Kinerja Individu
-- Performance Management System
-- ============================================================

-- ─── Roles ───────────────────────────────────────────────────
create table if not exists public.ski_roles (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  level       integer not null, -- 1=super_admin, 2=management, 3=kepala_urusan, 4=pic, 5=staff
  description text,
  created_at  timestamptz not null default now()
);

insert into public.ski_roles (name, level, description) values
  ('super_admin',    1, 'Akses penuh ke seluruh sistem'),
  ('management',     2, 'Monitoring unit dan approval SKI'),
  ('kepala_urusan',  3, 'Membuat indikator SKI dan monitor PIC'),
  ('pic',            4, 'Update progress dan upload bukti'),
  ('staff',          5, 'Melihat SKI pribadi')
on conflict (name) do nothing;

-- ─── Organizational Units ────────────────────────────────────
create table if not exists public.organizational_units (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  parent_id   uuid references public.organizational_units(id) on delete set null,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

create index if not exists idx_org_units_parent on public.organizational_units(parent_id);

-- ─── User Positions ──────────────────────────────────────────
create table if not exists public.user_positions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  role_id       uuid not null references public.ski_roles(id),
  unit_id       uuid references public.organizational_units(id) on delete set null,
  supervisor_id uuid references auth.users(id) on delete set null,
  start_date    date not null default current_date,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  unique(user_id) -- one active position per user
);

create index if not exists idx_user_positions_user    on public.user_positions(user_id);
create index if not exists idx_user_positions_unit    on public.user_positions(unit_id);
create index if not exists idx_user_positions_supervisor on public.user_positions(supervisor_id);

-- ─── SKI Categories ──────────────────────────────────────────
create table if not exists public.ski_categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

-- ─── SKI Indicators ──────────────────────────────────────────
create type ski_status as enum (
  'draft', 'assigned', 'on_progress', 'submitted', 'approved', 'rejected', 'completed'
);

create table if not exists public.ski_indicators (
  id                    uuid primary key default uuid_generate_v4(),
  category_id           uuid references public.ski_categories(id) on delete set null,
  -- SKU
  sku                   text,
  weight_sku            numeric(5,2) default 0,
  -- Program
  program               text,
  weight_program        numeric(5,2) default 0,
  -- Target Waktu
  target_time_unit      text,           -- bulan, minggu, hari, dll
  target_time_value     integer,
  -- Target Output
  target_output_unit    text,           -- dokumen, kegiatan, orang, dll
  target_output_value   integer,
  -- Relations
  internal_relation     text,
  external_relation     text,
  notes                 text,
  -- Title & Description
  title                 text not null,
  description           text,
  -- Assignment
  assigned_to           uuid references auth.users(id) on delete set null,
  assigned_by           uuid references auth.users(id) on delete set null,
  period_year           integer not null default extract(year from now())::integer,
  period_semester       integer default 1, -- 1 or 2
  -- Status
  status                ski_status not null default 'draft',
  -- Metadata
  created_by            uuid references auth.users(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_ski_indicators_assigned_to on public.ski_indicators(assigned_to);
create index if not exists idx_ski_indicators_assigned_by on public.ski_indicators(assigned_by);
create index if not exists idx_ski_indicators_period      on public.ski_indicators(period_year);
create index if not exists idx_ski_indicators_status      on public.ski_indicators(status);

-- ─── SKI Progress ────────────────────────────────────────────
create type ski_progress_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.ski_progress (
  id                  uuid primary key default uuid_generate_v4(),
  indicator_id        uuid not null references public.ski_indicators(id) on delete cascade,
  user_id             uuid not null references auth.users(id),
  progress_percentage numeric(5,2) not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  progress_note       text,
  evidence_file       text,           -- Cloudinary URL
  submitted_at        timestamptz not null default now(),
  verified_by         uuid references auth.users(id),
  verification_note   text,
  status              ski_progress_status not null default 'pending'
);

create index if not exists idx_ski_progress_indicator on public.ski_progress(indicator_id);
create index if not exists idx_ski_progress_user      on public.ski_progress(user_id);

-- ─── SKI Logs ────────────────────────────────────────────────
create table if not exists public.ski_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id),
  activity    text not null,
  description text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_ski_logs_user on public.ski_logs(user_id);

-- ─── SKI Attachments ─────────────────────────────────────────
create table if not exists public.ski_attachments (
  id           uuid primary key default uuid_generate_v4(),
  indicator_id uuid not null references public.ski_indicators(id) on delete cascade,
  file_url     text not null,
  file_type    text,
  file_name    text,
  uploaded_by  uuid references auth.users(id),
  created_at   timestamptz not null default now()
);

-- ─── Enable RLS ──────────────────────────────────────────────
alter table public.ski_roles             enable row level security;
alter table public.organizational_units  enable row level security;
alter table public.user_positions        enable row level security;
alter table public.ski_categories        enable row level security;
alter table public.ski_indicators        enable row level security;
alter table public.ski_progress          enable row level security;
alter table public.ski_logs              enable row level security;
alter table public.ski_attachments       enable row level security;

-- ─── Helper: get SKI role level ──────────────────────────────
create or replace function public.get_ski_role_level(uid uuid default auth.uid())
returns integer language sql security definer stable as $$
  select r.level
  from public.user_positions p
  join public.ski_roles r on r.id = p.role_id
  where p.user_id = uid and p.is_active = true
  limit 1;
$$;

-- ─── Helper: get user's supervisor chain ─────────────────────
create or replace function public.get_subordinate_ids(manager_uid uuid)
returns setof uuid language sql security definer stable as $$
  with recursive subordinates as (
    select user_id from public.user_positions where supervisor_id = manager_uid and is_active = true
    union all
    select p.user_id from public.user_positions p
    join subordinates s on p.supervisor_id = s.user_id
    where p.is_active = true
  )
  select user_id from subordinates;
$$;

-- ─── RLS Policies ────────────────────────────────────────────

-- ski_roles: everyone can read
create policy "ski_roles_select" on public.ski_roles for select using (true);
create policy "ski_roles_manage" on public.ski_roles for all using (public.get_ski_role_level() <= 1);

-- organizational_units: everyone can read, only level<=2 can manage
create policy "org_units_select" on public.organizational_units for select using (auth.uid() is not null);
create policy "org_units_manage" on public.organizational_units for all using (public.get_ski_role_level() <= 2);

-- user_positions: hierarchical access
create policy "positions_select" on public.user_positions for select using (
  user_id = auth.uid()
  or supervisor_id = auth.uid()
  or public.get_ski_role_level() <= 2
);
create policy "positions_insert" on public.user_positions for insert with check (public.get_ski_role_level() <= 3);
create policy "positions_update" on public.user_positions for update using (public.get_ski_role_level() <= 2);
create policy "positions_delete" on public.user_positions for delete using (public.get_ski_role_level() <= 1);

-- ski_categories: level<=3 can manage, all can read
create policy "ski_cat_select" on public.ski_categories for select using (auth.uid() is not null);
create policy "ski_cat_manage" on public.ski_categories for all using (public.get_ski_role_level() <= 3);

-- ski_indicators: hierarchical visibility
create policy "ski_ind_select" on public.ski_indicators for select using (
  assigned_to = auth.uid()
  or assigned_by = auth.uid()
  or created_by = auth.uid()
  or public.get_ski_role_level() <= 2
  or assigned_to in (select public.get_subordinate_ids(auth.uid()))
);
create policy "ski_ind_insert" on public.ski_indicators for insert with check (public.get_ski_role_level() <= 3);
create policy "ski_ind_update" on public.ski_indicators for update using (
  created_by = auth.uid() or assigned_by = auth.uid() or public.get_ski_role_level() <= 2
);
create policy "ski_ind_delete" on public.ski_indicators for delete using (
  created_by = auth.uid() or public.get_ski_role_level() <= 2
);

-- ski_progress: own + supervisor
create policy "ski_prog_select" on public.ski_progress for select using (
  user_id = auth.uid()
  or verified_by = auth.uid()
  or public.get_ski_role_level() <= 2
  or user_id in (select public.get_subordinate_ids(auth.uid()))
);
create policy "ski_prog_insert" on public.ski_progress for insert with check (user_id = auth.uid());
create policy "ski_prog_update" on public.ski_progress for update using (
  user_id = auth.uid() or public.get_ski_role_level() <= 3
);

-- ski_logs: own + admin
create policy "ski_logs_select" on public.ski_logs for select using (
  user_id = auth.uid() or public.get_ski_role_level() <= 2
);
create policy "ski_logs_insert" on public.ski_logs for insert with check (user_id = auth.uid());

-- ski_attachments: indicator-based access
create policy "ski_attach_select" on public.ski_attachments for select using (
  uploaded_by = auth.uid() or public.get_ski_role_level() <= 3
);
create policy "ski_attach_insert" on public.ski_attachments for insert with check (uploaded_by = auth.uid());
create policy "ski_attach_delete" on public.ski_attachments for delete using (
  uploaded_by = auth.uid() or public.get_ski_role_level() <= 2
);

-- ─── Seed default categories ─────────────────────────────────
insert into public.ski_categories (name, description) values
  ('Pembelajaran',        'Indikator terkait kegiatan pembelajaran'),
  ('Pengembangan Diri',   'Indikator pengembangan kompetensi guru'),
  ('Administrasi',        'Indikator tugas administrasi'),
  ('Ekstrakurikuler',     'Indikator kegiatan ekstrakurikuler'),
  ('Penelitian',          'Indikator penelitian dan publikasi'),
  ('Pengabdian Masyarakat','Indikator pengabdian kepada masyarakat')
on conflict do nothing;
