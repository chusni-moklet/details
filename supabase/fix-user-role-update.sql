-- Allow super_admin to update any user's role
-- Jalankan di Supabase SQL Editor

drop policy if exists "users_update_admin" on public.users;
drop policy if exists "users_update" on public.users;

-- User can update own record
create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- Super admin can update any user's role
create policy "users_update_admin"
  on public.users for update
  using (public.get_my_role() = 'super_admin');
