create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  logo_url text,
  address text,
  phone text,
  email text,
  website text,
  currency text not null default 'NGN' check (currency in ('NGN','USD','GBP','EUR','GHS','KES')),
  tax_rate numeric(7,4) not null default 0 check (tax_rate >= 0 and tax_rate <= 100),
  bank_details jsonb not null default '{}'::jsonb,
  invoice_prefix text not null default 'INV',
  next_number bigint not null default 1 check (next_number > 0),
  default_notes text,
  default_terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,business_id)
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  default_price numeric(14,2) not null default 0 check (default_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  client_id uuid,
  type text not null check (type in ('invoice','quote','receipt')),
  number text not null,
  status text not null default 'draft' check (status in ('draft','sent','viewed','partially_paid','paid','overdue')),
  issue_date date not null default current_date,
  due_date date,
  currency text not null default 'NGN' check (currency in ('NGN','USD','GBP','EUR','GHS','KES')),
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  discount numeric(14,2) not null default 0 check (discount >= 0),
  tax numeric(14,2) not null default 0 check (tax >= 0),
  total numeric(14,2) not null default 0 check (total >= 0),
  notes text,
  terms text,
  public_token text unique,
  viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,number),
  unique (id,business_id),
  constraint documents_client_business_fk foreign key (client_id,business_id)
    references public.clients(id,business_id) on delete set null (client_id)
);

create table public.document_items (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null,
  business_id uuid not null,
  description text not null,
  quantity numeric(12,3) not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null default 0 check (unit_price >= 0),
  amount numeric(14,2) not null default 0 check (amount >= 0),
  created_at timestamptz not null default now(),
  constraint document_items_document_business_fk foreign key (document_id,business_id)
    references public.documents(id,business_id) on delete cascade
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null,
  business_id uuid not null,
  amount numeric(14,2) not null check (amount > 0),
  paid_at timestamptz not null default now(),
  method text not null check (method in ('transfer','cash','card','other')),
  note text,
  created_at timestamptz not null default now(),
  constraint payments_document_business_fk foreign key (document_id,business_id)
    references public.documents(id,business_id) on delete cascade
);

create index businesses_owner_id_idx on public.businesses(owner_id);
create index clients_business_id_idx on public.clients(business_id);
create index items_business_id_idx on public.items(business_id);
create index documents_business_created_idx on public.documents(business_id,created_at desc);
create index documents_status_due_idx on public.documents(status,due_date);
create index document_items_document_id_idx on public.document_items(document_id);
create index payments_document_id_idx on public.payments(document_id);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.clients enable row level security;
alter table public.items enable row level security;
alter table public.documents enable row level security;
alter table public.document_items enable row level security;
alter table public.payments enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid())=id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);

create policy businesses_select_own on public.businesses for select to authenticated using ((select auth.uid())=owner_id);
create policy businesses_insert_own on public.businesses for insert to authenticated with check ((select auth.uid())=owner_id);
create policy businesses_update_own on public.businesses for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy businesses_delete_own on public.businesses for delete to authenticated using ((select auth.uid())=owner_id);

create policy clients_select_owned_business on public.clients for select to authenticated using (exists(select 1 from public.businesses b where b.id=clients.business_id and b.owner_id=(select auth.uid())));
create policy clients_insert_owned_business on public.clients for insert to authenticated with check (exists(select 1 from public.businesses b where b.id=clients.business_id and b.owner_id=(select auth.uid())));
create policy clients_update_owned_business on public.clients for update to authenticated using (exists(select 1 from public.businesses b where b.id=clients.business_id and b.owner_id=(select auth.uid()))) with check (exists(select 1 from public.businesses b where b.id=clients.business_id and b.owner_id=(select auth.uid())));
create policy clients_delete_owned_business on public.clients for delete to authenticated using (exists(select 1 from public.businesses b where b.id=clients.business_id and b.owner_id=(select auth.uid())));

create policy items_select_owned_business on public.items for select to authenticated using (exists(select 1 from public.businesses b where b.id=items.business_id and b.owner_id=(select auth.uid())));
create policy items_insert_owned_business on public.items for insert to authenticated with check (exists(select 1 from public.businesses b where b.id=items.business_id and b.owner_id=(select auth.uid())));
create policy items_update_owned_business on public.items for update to authenticated using (exists(select 1 from public.businesses b where b.id=items.business_id and b.owner_id=(select auth.uid()))) with check (exists(select 1 from public.businesses b where b.id=items.business_id and b.owner_id=(select auth.uid())));
create policy items_delete_owned_business on public.items for delete to authenticated using (exists(select 1 from public.businesses b where b.id=items.business_id and b.owner_id=(select auth.uid())));

create policy documents_select_owned_business on public.documents for select to authenticated using (exists(select 1 from public.businesses b where b.id=documents.business_id and b.owner_id=(select auth.uid())));
create policy documents_insert_owned_business on public.documents for insert to authenticated with check (exists(select 1 from public.businesses b where b.id=documents.business_id and b.owner_id=(select auth.uid())));
create policy documents_update_owned_business on public.documents for update to authenticated using (exists(select 1 from public.businesses b where b.id=documents.business_id and b.owner_id=(select auth.uid()))) with check (exists(select 1 from public.businesses b where b.id=documents.business_id and b.owner_id=(select auth.uid())));
create policy documents_delete_owned_business on public.documents for delete to authenticated using (exists(select 1 from public.businesses b where b.id=documents.business_id and b.owner_id=(select auth.uid())));

create policy document_items_select_owned_business on public.document_items for select to authenticated using (exists(select 1 from public.businesses b where b.id=document_items.business_id and b.owner_id=(select auth.uid())));
create policy document_items_insert_owned_business on public.document_items for insert to authenticated with check (exists(select 1 from public.businesses b where b.id=document_items.business_id and b.owner_id=(select auth.uid())));
create policy document_items_update_owned_business on public.document_items for update to authenticated using (exists(select 1 from public.businesses b where b.id=document_items.business_id and b.owner_id=(select auth.uid()))) with check (exists(select 1 from public.businesses b where b.id=document_items.business_id and b.owner_id=(select auth.uid())));
create policy document_items_delete_owned_business on public.document_items for delete to authenticated using (exists(select 1 from public.businesses b where b.id=document_items.business_id and b.owner_id=(select auth.uid())));

create policy payments_select_owned_business on public.payments for select to authenticated using (exists(select 1 from public.businesses b where b.id=payments.business_id and b.owner_id=(select auth.uid())));
create policy payments_insert_owned_business on public.payments for insert to authenticated with check (exists(select 1 from public.businesses b where b.id=payments.business_id and b.owner_id=(select auth.uid())));
create policy payments_update_owned_business on public.payments for update to authenticated using (exists(select 1 from public.businesses b where b.id=payments.business_id and b.owner_id=(select auth.uid()))) with check (exists(select 1 from public.businesses b where b.id=payments.business_id and b.owner_id=(select auth.uid())));
create policy payments_delete_owned_business on public.payments for delete to authenticated using (exists(select 1 from public.businesses b where b.id=payments.business_id and b.owner_id=(select auth.uid())));

grant select,insert,update,delete on public.profiles,public.businesses,public.clients,public.items,public.documents,public.document_items,public.payments to authenticated;
