
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


alter table stock enable row level security;
