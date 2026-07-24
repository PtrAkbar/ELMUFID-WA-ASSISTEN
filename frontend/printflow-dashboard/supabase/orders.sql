create table orders (
  id bigint generated always as identity primary key,
  nama_customer text not null,
  nomor_wa text,
  detail text not null,
  total numeric not null default 0,
  status text not null default 'belum' check (status in ('belum', 'proses', 'selesai')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table orders enable row level security;

create policy "Authenticated users can view orders"
  on orders for select
  to authenticated
  using (true);

create policy "Authenticated users can insert orders"
  on orders for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update orders"
  on orders for update
  to authenticated
  using (true);

create policy "Authenticated users can delete orders"
  on orders for delete
  to authenticated
  using (true);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_set_updated_at
before update on orders
for each row execute function set_updated_at();

alter publication supabase_realtime add table orders;
