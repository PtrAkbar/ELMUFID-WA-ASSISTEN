
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('menunggu_bayar', 'belum', 'proses', 'selesai'));

2. Konfigurasi QRIS toko 
create table if not exists qris_config (
  id int primary key default 1,
  gambar_url text,
  updated_at timestamptz default now(),
  constraint qris_config_singleton check (id = 1)
);
alter table qris_config enable row level security;
drop policy if exists "authenticated akses qris" on qris_config;
create policy "authenticated akses qris" on qris_config for all to authenticated using (true) with check (true);

3. Daftar rekening bank toko 
create table if not exists rekening_config (
  id bigint generated always as identity primary key,
  nama_bank text not null,
  nomor_rekening text not null,
  atas_nama text,
  created_at timestamptz default now()
);
alter table rekening_config enable row level security;
drop policy if exists "authenticated akses rekening" on rekening_config;
create policy "authenticated akses rekening" on rekening_config for all to authenticated using (true) with check (true);

4. Daftar nomor yang pernah chat ke bot 
create table if not exists kontak_pernah_chat (
  nomor text primary key,
  pertama_kali timestamptz default now()
);
alter table kontak_pernah_chat enable row level security;
drop policy if exists "authenticated baca kontak" on kontak_pernah_chat;
create policy "authenticated baca kontak" on kontak_pernah_chat for select to authenticated using (true);
