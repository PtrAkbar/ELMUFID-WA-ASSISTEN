-- Jalankan di Supabase Dashboard > SQL Editor > New query > Run.
-- Bikin tabel stock buat gantiin Google Sheets. Kolom "kode" (format BRG-001,
-- BRG-002, dst) dihasilkan otomatis dari id (angka urut anti-tabrakan bawaan
-- Postgres), jadi gak perlu logic antrian tulis manual kayak yang dipakai
-- Google Sheets sebelumnya buat hindari kode kembar.
create table if not exists stock (
  id bigint generated always as identity primary key,
  kode text generated always as ('BRG-' || lpad(id::text, 3, '0')) stored,
  nama text not null,
  harga numeric not null default 0,
  status text not null default 'masih' check (status in ('masih', 'habis')),
  stock_in timestamptz,
  stock_out timestamptz,
  created_at timestamptz default now()
);

-- RLS aktif tanpa policy apapun -- cuma bot (pakai service role key, otomatis
-- bypass RLS) yang boleh akses tabel ini. Dashboard TIDAK akses tabel ini
-- langsung ke Supabase, tapi lewat REST API bot (/api/stock), jadi memang
-- gak perlu policy buat role "authenticated" di sini.
alter table stock enable row level security;
