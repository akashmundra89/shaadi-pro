-- Weddings
create table public.weddings (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  date text not null default '',
  venue text not null default '',
  city text not null default '',
  total_budget integer,
  created_at timestamptz default now()
);
alter table public.weddings enable row level security;
create policy "Users manage own weddings" on public.weddings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Ceremonies
create table public.ceremonies (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wedding_id bigint references public.weddings(id) on delete cascade not null,
  name text not null,
  date text not null default '',
  time text not null default '',
  location text not null default '',
  guests integer not null default 0,
  side text not null default '',
  status text not null default 'upcoming',
  created_at timestamptz default now()
);
alter table public.ceremonies enable row level security;
create policy "Users manage own ceremonies" on public.ceremonies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Vendors
create table public.vendors (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wedding_id bigint references public.weddings(id) on delete cascade not null,
  name text not null,
  category text not null default '',
  city text not null default '',
  amount integer not null default 0,
  pay_status text not null default 'pending',
  phone text not null default '',
  detail text not null default '',
  created_at timestamptz default now()
);
alter table public.vendors enable row level security;
create policy "Users manage own vendors" on public.vendors
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Guests
create table public.guests (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wedding_id bigint references public.weddings(id) on delete cascade not null,
  name text not null,
  side text not null default 'Both',
  relation text not null default '',
  ceremonies text not null default 'All',
  rsvp text not null default 'Awaited',
  transport text not null default '',
  food text not null default 'Veg',
  phone text default '',
  room_number text default '',
  checked_in boolean not null default false,
  created_at timestamptz default now()
);
alter table public.guests enable row level security;
create policy "Users manage own guests" on public.guests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Budget Categories
create table public.budget_categories (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wedding_id bigint references public.weddings(id) on delete cascade not null,
  category text not null,
  spent integer not null default 0,
  total integer not null default 0,
  created_at timestamptz default now()
);
alter table public.budget_categories enable row level security;
create policy "Users manage own budget" on public.budget_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tasks
create table public.tasks (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wedding_id bigint references public.weddings(id) on delete cascade not null,
  type text not null default 'pre',
  label text not null,
  who text not null default '',
  done boolean not null default false,
  created_at timestamptz default now()
);
alter table public.tasks enable row level security;
create policy "Users manage own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Vendor Library
create table public.vendor_library (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null default '',
  city text not null default '',
  phone text not null default '',
  detail text not null default '',
  rating integer not null default 0,
  used_in text[] not null default '{}',
  created_at timestamptz default now()
);
alter table public.vendor_library enable row level security;
create policy "Users manage own vendor library" on public.vendor_library
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Timeline
create table public.timeline (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wedding_id bigint references public.weddings(id) on delete cascade not null,
  day text not null default 'main',
  time text not null default '',
  text text not null default '',
  sub text not null default '',
  color text not null default '#C2486E',
  sort_order integer not null default 0,
  created_at timestamptz default now()
);
alter table public.timeline enable row level security;
create policy "Users manage own timeline" on public.timeline
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
