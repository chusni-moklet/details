-- Tambah kolom baru ke tabel portfolios
-- Jalankan di Supabase SQL Editor

alter table public.portfolios
  add column if not exists year        integer,
  add column if not exists organizer   text,
  add column if not exists level       text,
  add column if not exists certificate_url text;
