-- RLS Policies for The Manager

-- Users table policies
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Enable RLS on societies
alter table public.societies enable row level security;

create policy "Platform owners can manage all societies" on public.societies for all using (
  exists (
    select 1 from public.users where id = auth.uid() and role = 'platform_owner'
  )
);
create policy "Society members can view their society" on public.societies for select using (
  exists (
    select 1 from public.users 
    where id = auth.uid() and society_id = id
  )
);

-- Similar policies for wings, complaints, events, etc.
-- Add more from policies.sql

-- Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger handle_updated_users 
  before update on public.users
  for each row execute procedure public.handle_updated_at();

