-- ============================================================
-- SKI Fix — jalankan ini jika ski-schema.sql gagal
-- ============================================================

-- Drop policies yang mungkin sudah terbuat sebagian
do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public'
             and tablename in ('ski_roles','organizational_units','user_positions',
                               'ski_categories','ski_indicators','ski_progress',
                               'ski_logs','ski_attachments')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Drop functions jika ada
drop function if exists public.get_ski_role_level(uuid);
drop function if exists public.get_subordinate_ids(uuid);

-- Recreate helper functions (fixed)
create or replace function public.get_ski_role_level(uid uuid default auth.uid())
returns integer language sql security definer stable as $$
  select r.level
  from public.user_positions p
  join public.ski_roles r on r.id = p.role_id
  where p.user_id = uid and p.is_active = true
  limit 1;
$$;

create or replace function public.get_subordinate_ids(manager_uid uuid)
returns setof uuid language sql security definer stable as $$
  with recursive subordinates as (
    select user_id from public.user_positions
    where supervisor_id = manager_uid and is_active = true
    union all
    select p.user_id from public.user_positions p
    join subordinates s on p.supervisor_id = s.user_id
    where p.is_active = true
  )
  select user_id from subordinates;
$$;

-- Recreate all RLS policies (fixed — no uid column reference)

-- ski_roles
create policy "ski_roles_select" on public.ski_roles for select using (true);
create policy "ski_roles_manage" on public.ski_roles for all using (public.get_ski_role_level() <= 1);

-- organizational_units
create policy "org_units_select" on public.organizational_units for select using (auth.uid() is not null);
create policy "org_units_manage" on public.organizational_units for all using (public.get_ski_role_level() <= 2);

-- user_positions
create policy "positions_select" on public.user_positions for select using (
  user_id = auth.uid() or supervisor_id = auth.uid() or public.get_ski_role_level() <= 2
);
create policy "positions_insert" on public.user_positions for insert with check (public.get_ski_role_level() <= 3);
create policy "positions_update" on public.user_positions for update using (public.get_ski_role_level() <= 2);
create policy "positions_delete" on public.user_positions for delete using (public.get_ski_role_level() <= 1);

-- ski_categories
create policy "ski_cat_select" on public.ski_categories for select using (auth.uid() is not null);
create policy "ski_cat_manage" on public.ski_categories for all using (public.get_ski_role_level() <= 3);

-- ski_indicators
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

-- ski_progress
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

-- ski_logs
create policy "ski_logs_select" on public.ski_logs for select using (
  user_id = auth.uid() or public.get_ski_role_level() <= 2
);
create policy "ski_logs_insert" on public.ski_logs for insert with check (user_id = auth.uid());

-- ski_attachments
create policy "ski_attach_select" on public.ski_attachments for select using (
  uploaded_by = auth.uid() or public.get_ski_role_level() <= 3
);
create policy "ski_attach_insert" on public.ski_attachments for insert with check (uploaded_by = auth.uid());
create policy "ski_attach_delete" on public.ski_attachments for delete using (
  uploaded_by = auth.uid() or public.get_ski_role_level() <= 2
);

-- Seed roles if not exists
insert into public.ski_roles (name, level, description) values
  ('super_admin',    1, 'Akses penuh ke seluruh sistem'),
  ('management',     2, 'Monitoring unit dan approval SKI'),
  ('kepala_urusan',  3, 'Membuat indikator SKI dan monitor PIC'),
  ('pic',            4, 'Update progress dan upload bukti'),
  ('staff',          5, 'Melihat SKI pribadi')
on conflict (name) do nothing;

-- Seed categories if not exists
insert into public.ski_categories (name, description) values
  ('Pembelajaran',         'Indikator terkait kegiatan pembelajaran'),
  ('Pengembangan Diri',    'Indikator pengembangan kompetensi guru'),
  ('Administrasi',         'Indikator tugas administrasi'),
  ('Ekstrakurikuler',      'Indikator kegiatan ekstrakurikuler'),
  ('Penelitian',           'Indikator penelitian dan publikasi'),
  ('Pengabdian Masyarakat','Indikator pengabdian kepada masyarakat')
on conflict do nothing;

select 'SKI setup complete' as status;
