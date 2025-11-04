-- tenants (brands) and membership

create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key,        -- matches auth.users.id
  email text unique not null,
  created_at timestamptz default now()
);

create table brand_memberships (
  brand_id uuid references brands(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text check (role in ('owner','admin','member')) default 'member',
  primary key (brand_id, user_id)
);

-- metrics and values

create table metrics (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  name text not null,                 -- e.g. "Website Visitors"
  data_source text,                   -- e.g. "Google Analytics"
  created_at timestamptz default now()
);

create table metric_values (
  id uuid primary key default gen_random_uuid(),
  metric_id uuid not null references metrics(id) on delete cascade,
  year int not null,                  -- e.g. 2025
  month int not null check (month between 1 and 12),
  value numeric not null,
  unique (metric_id, year, month)
);

-- RLS

alter table brands enable row level security;
alter table brand_memberships enable row level security;
alter table metrics enable row level security;
alter table metric_values enable row level security;
alter table profiles enable row level security;

-- Profiles

create policy "read own profile" on profiles for select
  using (id = auth.uid());

create policy "insert own profile" on profiles for insert
  with check (id = auth.uid());

-- A helper: can the current user access a brand?

create or replace view v_user_brand_access as
select bm.brand_id, bm.user_id from brand_memberships bm;

-- Brand access

create policy "brand accessible to members" on brands for select
  using (exists (select 1 from brand_memberships bm
                 where bm.brand_id = brands.id and bm.user_id = auth.uid()));

-- Membership access

create policy "memberships visible to self" on brand_memberships for select
  using (user_id = auth.uid());

-- Metrics access

create policy "metrics by membership" on metrics for select using (
  exists (select 1 from brand_memberships bm
          where bm.brand_id = metrics.brand_id and bm.user_id = auth.uid())
);

create policy "insert metrics by members" on metrics for insert with check (
  exists (select 1 from brand_memberships bm
          where bm.brand_id = brand_id and bm.user_id = auth.uid())
);

-- Metric values access

create policy "values by membership" on metric_values for select using (
  exists (select 1 from metrics m
          join brand_memberships bm on bm.brand_id = m.brand_id
          where m.id = metric_values.metric_id and bm.user_id = auth.uid())
);

create policy "insert/update values by members" on metric_values
for insert with check (
  exists (select 1 from metrics m
          join brand_memberships bm on bm.brand_id = m.brand_id
          where m.id = metric_id and bm.user_id = auth.uid())
);

create policy "update values by members" on metric_values
for update using (
  exists (select 1 from metrics m
          join brand_memberships bm on bm.brand_id = m.brand_id
          where m.id = metric_values.metric_id and bm.user_id = auth.uid())
);


