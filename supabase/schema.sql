-- ==============================================================================
-- Abilolo Database Schema & Storage Setup for Supabase
-- Copy and run this script in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. Create Profiles Table (syncs with Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  prefecture text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Items Table (Gifting Listings)
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  category text not null,
  sub_category text,
  condition text not null check (condition in ('新品・未使用', '未使用に近い', '目立った傷や汚れなし', 'やや傷や汚れあり')),
  description text not null,
  target_age text,
  images text[] not null default '{}',
  location text not null,
  shipping_method text not null,
  estimated_shipping_fee text,
  giver_name text not null,
  status text not null default 'available' check (status in ('available', 'claimed')),
  views integer not null default 0,
  likes integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Claims Table (Recipient Shipping Claims)
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete set null,
  recipient_name text not null,
  prefecture text not null,
  postal_code text not null,
  address text not null,
  phone text not null,
  agreed_cod boolean not null default true,
  status text not null default 'pending' check (status in ('pending', 'shipped', 'delivered')),
  created_at timestamptz default now()
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.claims enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using (true);

create policy "Users can update own profile."
  on public.profiles for update
  using (auth.uid() = id);

-- Items Policies
create policy "Items are viewable by everyone."
  on public.items for select
  using (true);

create policy "Authenticated users can create items."
  on public.items for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update their own items."
  on public.items for update
  using (auth.uid() = user_id or auth.uid() is not null);

-- Claims Policies
create policy "Authenticated users can create claims."
  on public.claims for insert
  with check (auth.role() = 'authenticated');

create policy "Users can view their own claims or claims on their items."
  on public.claims for select
  using (
    auth.uid() = recipient_id
    or exists (
      select 1 from public.items
      where items.id = claims.item_id and items.user_id = auth.uid()
    )
  );

-- 5. Storage Bucket Setup (for Item Photos)
-- Run in Storage section or via SQL:
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

create policy "Public Access to Item Images"
  on storage.objects for select
  using (bucket_id = 'item-images');

create policy "Authenticated Users can upload Item Images"
  on storage.objects for insert
  with check (bucket_id = 'item-images' and auth.role() = 'authenticated');
