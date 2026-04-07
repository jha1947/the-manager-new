-- Row Level Security policies for The Manager platform

-- Enable RLS on all tables
alter table if exists societies enable row level security;
alter table if exists wings enable row level security;
alter table if exists floors enable row level security;
alter table if exists flats enable row level security;
alter table if exists users enable row level security;
alter table if exists maintenance_bills enable row level security;
alter table if exists custom_bills enable row level security;
alter table if exists maintenance_payments enable row level security;
alter table if exists complaints enable row level security;
alter table if exists complaint_updates enable row level security;
alter table if exists complaint_reviews enable row level security;
alter table if exists daily_works enable row level security;
alter table if exists work_logs enable row level security;
alter table if exists tasks enable row level security;
alter table if exists expenses enable row level security;
alter table if exists expense_approvals enable row level security;
alter table if exists proposals enable row level security;
alter table if exists votes enable row level security;
alter table if exists vote_responses enable row level security;
alter table if exists reports enable row level security;
alter table if exists assets enable row level security;
alter table if exists payment_info enable row level security;
alter table if exists wallets enable row level security;
alter table if exists wallet_transactions enable row level security;
alter table if exists manager_tips enable row level security;
alter table if exists personal_service_requests enable row level security;
alter table if exists manager_daily_logs enable row level security;
alter table if exists haat_bazaar_categories enable row level security;

-- Policy helpers
create or replace function is_platform_owner() returns boolean stable language sql as $$
  select current_setting('request.jwt.claims.role', true) = 'platform_owner';
$$;

create or replace function current_user_id() returns uuid stable language sql as $$
  select current_setting('request.jwt.claims.user_id', true)::uuid;
$$;

create or replace function current_user_role() returns text stable language sql as $$
  select current_setting('request.jwt.claims.role', true);
$$;

create or replace function current_user_society() returns uuid stable language sql as $$
  select current_setting('request.jwt.claims.society_id', true)::uuid;
$$;

-- Societies
create policy if not exists "Platform owner full access" on societies
  for all using (is_platform_owner()) with check (is_platform_owner());

-- Wings/Floors/Flats
create policy if not exists "Society members can read structure" on wings
  for select using (current_user_role() in ('platform_owner','admin','sub_admin','manager','resident') and society_id = current_user_society());
create policy if not exists "Society members can read structure" on floors
  for select using (exists (select 1 from wings where wings.id = floor_id and wings.society_id = current_user_society()));
create policy if not exists "Society members can read structure" on flats
  for select using (exists (select 1 from floors join wings on floors.wing_id = wings.id where flats.floor_id = floors.id and wings.society_id = current_user_society()));

-- Users
create policy if not exists "Platform owner sees all users" on users
  for select using (is_platform_owner());
create policy if not exists "Society members can see own society users" on users
  for select using (current_user_role() != 'platform_owner' and society_id = current_user_society());
create policy if not exists "Users manage own profile" on users
  for update using (auth.uid() = id);
create policy if not exists "Admins create users in society" on users
  for insert with check (current_user_role() in ('platform_owner','admin') or (auth.uid() = auth.uid()));

-- Maintenance bills
create policy if not exists "Society access to maintenance bills" on maintenance_bills
  for all using (society_id = current_user_society()) with check (current_user_role() in ('platform_owner','admin') or society_id = current_user_society());

-- Custom bills
create policy if not exists "Society access to custom bills" on custom_bills
  for all using (society_id = current_user_society()) with check (current_user_role() in ('platform_owner','admin') or society_id = current_user_society());

-- Maintenance payments
create policy if not exists "Resident payments access" on maintenance_payments
  for select using (resident_id = current_user_id() or current_user_role() in ('platform_owner','admin','sub_admin','manager'));
create policy if not exists "Resident payments modify" on maintenance_payments
  for update using (current_user_role() in ('platform_owner','admin','sub_admin') or resident_id = current_user_id());
create policy if not exists "Resident payments insert" on maintenance_payments
  for insert using (resident_id = current_user_id());

-- Complaints
create policy if not exists "Complaint access for society members" on complaints
  for select using (
    society_id = current_user_society() and (
      raised_by = current_user_id() or current_user_role() in ('platform_owner','admin','sub_admin','manager')
    )
  );
create policy if not exists "Complaint insert by resident" on complaints
  for insert using (raised_by = current_user_id() and current_user_role() = 'resident');
create policy if not exists "Complaint update by assigned or admin" on complaints
  for update using (
    current_user_role() in ('platform_owner','admin') or assigned_to = current_user_id() or raised_by = current_user_id()
  );

-- Complaint updates and reviews
create policy if not exists "Complaint updates belong to visible complaint" on complaint_updates
  for all using (exists (select 1 from complaints where complaints.id = complaint_updates.complaint_id and society_id = current_user_society()));
create policy if not exists "Complaint reviews visible to society" on complaint_reviews
  for all using (exists (select 1 from complaints where complaints.id = complaint_reviews.complaint_id and society_id = current_user_society()));

-- Daily works and work logs
create policy if not exists "Daily works access" on daily_works
  for all using (society_id = current_user_society() and (current_user_role() in ('platform_owner','admin','sub_admin') or assigned_to = current_user_id()));
create policy if not exists "Work logs access" on work_logs
  for all using (exists (select 1 from daily_works where daily_works.id = work_logs.daily_work_id and daily_works.society_id = current_user_society()));

-- Tasks
create policy if not exists "Tasks access" on tasks
  for all using (
    society_id = current_user_society() and (assigned_to = current_user_id() or assigned_by = current_user_id() or current_user_role() in ('platform_owner','admin','sub_admin'))
  );

-- Expenses
create policy if not exists "Expenses access" on expenses
  for all using (society_id = current_user_society());
create policy if not exists "Expense approvals access" on expense_approvals
  for all using (exists (select 1 from expenses where expenses.id = expense_approvals.expense_id and expenses.society_id = current_user_society()));

-- Proposals and votes
create policy if not exists "Proposals access" on proposals
  for all using (society_id = current_user_society());
create policy if not exists "Votes access" on votes
  for all using (society_id = current_user_society());
create policy if not exists "Vote responses access" on vote_responses
  for all using (exists (select 1 from votes where votes.id = vote_responses.vote_id and votes.society_id = current_user_society()));

-- Reports and assets
create policy if not exists "Reports access" on reports
  for all using (
    society_id = current_user_society() and current_user_role() in ('platform_owner','admin','sub_admin','resident')
  );
create policy if not exists "Assets access" on assets
  for all using (society_id = current_user_society());

-- Payment info and wallet
create policy if not exists "Payment info access" on payment_info
  for all using (society_id = current_user_society());
create policy if not exists "Wallet access" on wallets
  for all using (user_id = current_user_id() or current_user_role() in ('platform_owner','admin'));
create policy if not exists "Wallet transactions access" on wallet_transactions
  for all using (exists (select 1 from wallets where wallets.id = wallet_transactions.wallet_id and (wallets.user_id = current_user_id() or current_user_role() in ('platform_owner','admin'))));

-- Manager tips and service requests
create policy if not exists "Manager tips access" on manager_tips
  for all using (manager_id = current_user_id() or given_by = current_user_id() or current_user_role() in ('platform_owner','admin'));
create policy if not exists "Personal service requests access" on personal_service_requests
  for all using (resident_id = current_user_id() or manager_id = current_user_id() or current_user_role() in ('platform_owner','admin'));

-- Manager daily logs
create policy if not exists "Manager daily logs access" on manager_daily_logs
  for all using (society_id = current_user_society() and (manager_id = current_user_id() or current_user_role() in ('platform_owner','admin','sub_admin')));

-- Haat Bazaar categories
create policy if not exists "Haat bazaar categories access" on haat_bazaar_categories
  for all using (society_id = current_user_society());
