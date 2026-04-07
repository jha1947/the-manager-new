-- Supabase schema for The Manager housing society platform

create extension if not exists pgcrypto;

-- Societies
create table if not exists societies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_by uuid references users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Society Structure
create table if not exists wings (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default now()
);

create table if not exists floors (
  id uuid primary key default gen_random_uuid(),
  wing_id uuid not null references wings(id) on delete cascade,
  floor_number int not null,
  created_at timestamp with time zone default now()
);

create table if not exists flats (
  id uuid primary key default gen_random_uuid(),
  floor_id uuid not null references floors(id) on delete cascade,
  flat_number text not null,
  created_at timestamp with time zone default now()
);

-- Users (application-level users; auth handled separately)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  name text not null,
  mobile text unique not null,
  role text not null check (role in ('platform_owner','admin','sub_admin','manager','resident')),
  resident_type text check (resident_type in ('owner','tenant')),
  society_id uuid references societies(id) on delete set null,
  wing_id uuid references wings(id) on delete set null,
  floor_id uuid references floors(id) on delete set null,
  flat_id uuid references flats(id) on delete set null,
  profile_photo text,
  bio text,
  experience text,
  is_active boolean not null default true,
  is_verified boolean not null default false,
  otp_verified boolean not null default false,
  created_by uuid references users(id) on delete set null,
  created_at timestamp with time zone default now(),
  removed_by uuid references users(id) on delete set null,
  removed_at timestamp with time zone,
  removal_reason text,
  removed_from_society uuid references societies(id) on delete set null
);

-- Maintenance Bills
create table if not exists maintenance_bills (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null,
  amount_per_flat numeric not null,
  total_amount numeric not null,
  generated_by uuid references users(id) on delete set null,
  generated_at timestamp with time zone default now()
);

-- Custom Bills
create table if not exists custom_bills (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  bill_type text not null,
  amount numeric not null,
  party_name text,
  description text,
  date date not null,
  generated_by uuid references users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Maintenance Payments
create table if not exists maintenance_payments (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references maintenance_bills(id) on delete cascade,
  resident_id uuid not null references users(id) on delete cascade,
  flat_id uuid references flats(id) on delete set null,
  amount numeric not null,
  payment_proof_url text,
  paid_at timestamp with time zone default now(),
  verified_by uuid references users(id) on delete set null,
  verified_at timestamp with time zone,
  status text not null check (status in ('pending','paid','verified')) default 'pending'
);

-- Complaints
create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  raised_by uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  mobile_shared text,
  attachments jsonb,
  assigned_to uuid references users(id) on delete set null,
  deadline timestamp with time zone,
  status text not null check (status in ('open','in_progress','completed','verified')) default 'open',
  created_at timestamp with time zone default now()
);

create table if not exists complaint_updates (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  updated_by uuid not null references users(id) on delete cascade,
  status text,
  note text,
  updated_at timestamp with time zone default now()
);

create table if not exists complaint_reviews (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  reviewer_id uuid not null references users(id) on delete cascade,
  manager_id uuid not null references users(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  review_text text,
  created_at timestamp with time zone default now()
);

-- Daily Work and Logs
create table if not exists daily_works (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  assigned_to uuid not null references users(id) on delete cascade,
  assigned_by uuid not null references users(id) on delete set null,
  title text not null,
  description text,
  category text not null check (category in ('cleaning','water_tank','light_check','lift_check','other')),
  status text not null check (status in ('pending','in_progress','completed')) default 'pending',
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists work_logs (
  id uuid primary key default gen_random_uuid(),
  daily_work_id uuid not null references daily_works(id) on delete cascade,
  manager_id uuid not null references users(id) on delete cascade,
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  description text,
  voice_note_url text,
  proof_image_url text,
  created_at timestamp with time zone default now()
);

-- Tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  assigned_by uuid not null references users(id) on delete set null,
  assigned_to uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  deadline timestamp with time zone,
  status text not null check (status in ('pending','in_progress','done')) default 'pending',
  created_at timestamp with time zone default now()
);

-- Expenses
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  type text not null check (type in ('common','wing')),
  wing_id uuid references wings(id) on delete set null,
  title text not null,
  amount numeric not null,
  description text,
  receipt_url text,
  added_by uuid not null references users(id) on delete set null,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  rejection_reason text,
  created_at timestamp with time zone default now()
);

create table if not exists expense_approvals (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  sub_admin_id uuid not null references users(id) on delete cascade,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  rejection_reason text,
  reviewed_at timestamp with time zone
);

-- Proposals and Voting
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  created_by uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  status text not null check (status in ('pending','accepted','rejected')) default 'pending',
  rejection_reason text,
  reviewed_by uuid references users(id) on delete set null,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  created_by uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  options jsonb not null,
  deadline timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists vote_responses (
  id uuid primary key default gen_random_uuid(),
  vote_id uuid not null references votes(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  selected_option text not null,
  voted_at timestamp with time zone default now()
);

-- Reports and Assets
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  type text not null check (type in ('income','expense','asset')),
  title text not null,
  amount numeric not null,
  description text,
  month int check (month between 1 and 12),
  year int,
  added_by uuid not null references users(id) on delete set null,
  verified_by uuid references users(id) on delete set null,
  verified_at timestamp with time zone,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  rejection_reason text,
  created_at timestamp with time zone default now()
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  category text not null check (category in ('deposit','furniture','scrap','equipment','other')),
  title text not null,
  quantity int not null default 1,
  value numeric not null,
  description text,
  added_by uuid not null references users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Payment info, Wallets, and Tips
create table if not exists payment_info (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  upi_id text,
  qr_code_url text,
  updated_by uuid references users(id) on delete set null,
  updated_at timestamp with time zone default now()
);

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  balance numeric not null default 0,
  updated_at timestamp with time zone default now()
);

create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references wallets(id) on delete cascade,
  type text not null check (type in ('credit','debit','redeem')),
  amount numeric not null,
  reason text,
  reference_id uuid,
  created_at timestamp with time zone default now()
);

create table if not exists manager_tips (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references users(id) on delete cascade,
  given_by uuid not null references users(id) on delete cascade,
  amount numeric not null,
  note text,
  created_at timestamp with time zone default now()
);

create table if not exists personal_service_requests (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references users(id) on delete cascade,
  manager_id uuid not null references users(id) on delete cascade,
  description text,
  mobile_shared text,
  status text not null check (status in ('pending','accepted','done')) default 'pending',
  tip_given boolean not null default false,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

create table if not exists manager_daily_logs (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references users(id) on delete cascade,
  society_id uuid not null references societies(id) on delete cascade,
  login_time timestamp with time zone,
  logout_time timestamp with time zone,
  complaints_handled int not null default 0,
  tasks_completed int not null default 0,
  daily_works_done int not null default 0,
  personal_services_done int not null default 0,
  date date not null
);

-- Haat Bazaar categories
create table if not exists haat_bazaar_categories (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  name text not null,
  icon text,
  created_by uuid not null references users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  location text,
  organizer_id uuid not null references users(id) on delete cascade,
  category text not null check (category in ('social','maintenance','meeting','celebration','other')) default 'other',
  max_attendees int,
  is_cancelled boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Event RSVPs
create table if not exists event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  status text not null check (status in ('attending','maybe','declined')) default 'attending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(event_id, user_id)
);
