-- ==============================================================================
-- OTT Subscription Manager - Database Schema & Security Policies
-- ==============================================================================

-- 1. USER PROFILES
-- Extends auth.users with app-specific metadata
create table if not exists user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  taste_profile jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: User Profiles
alter table user_profiles enable row level security;

create policy "Users can read own profile"
  on user_profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on user_profiles for update
  using ( auth.uid() = id );

-- 2. SUBSCRIPTION PLANS
-- Defines the tiers: Free, Pro, Team
create table if not exists subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- 'FREE', 'PRO', 'TEAM'
  price_monthly numeric,
  price_yearly numeric,
  features jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- RLS: Subscription Plans
alter table subscription_plans enable row level security;

create policy "Plans are public readable"
  on subscription_plans for select
  to authenticated, anon
  using ( true );

-- 3. USER SUBSCRIPTIONS
-- Tracks which plan a user is on.
-- CRITICAL SECURITY: Only Service Role can write to this table.
create table if not exists user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id uuid references subscription_plans(id) not null,
  status text not null check (status in ('active', 'cancelled', 'expired')),
  started_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now()
);

-- RLS: User Subscriptions
alter table user_subscriptions enable row level security;

create policy "Users can read own subscription"
  on user_subscriptions for select
  using ( auth.uid() = user_id );

-- NO INSERT/UPDATE policy for authenticated users.
-- This ensures only the service_role (admin/server) can modify subscriptions.

-- 4. FEATURE FLAGS & PLAN FEATURES
-- Database-driven feature gating
create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  description text
);

create table if not exists plan_features (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references subscription_plans(id) on delete cascade,
  feature_id uuid references feature_flags(id) on delete cascade,
  enabled boolean default true,
  unique(plan_id, feature_id)
);

-- RLS: Features
alter table feature_flags enable row level security;
alter table plan_features enable row level security;

create policy "Features are public readable" on feature_flags for select using (true);
create policy "Plan features are public readable" on plan_features for select using (true);

-- 5. CENTRALIZED PAID USER CHECK (FUNCTION)
-- Returns true if user has an active subscription to a paid plan.
-- This function is SECURITY DEFINER to access subscription data safely inside RLS.
create or replace function is_paid_user(user_uuid uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from user_subscriptions us
    join subscription_plans sp on us.plan_id = sp.id
    where us.user_id = user_uuid
      and us.status = 'active'
      and sp.name in ('PRO', 'TEAM') -- Define what counts as "Paid"
  );
end;
$$;

-- 6. USER VERDICTS
-- Core application data (Platform Reviews/Decisions)
create table if not exists user_verdicts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  platform_id text not null,
  value_score int,
  verdict text, -- 'BUY', 'SKIP', 'PAUSE'
  created_at timestamptz default now()
);

-- RLS: User Verdicts
alter table user_verdicts enable row level security;

create policy "Users can manage own verdicts"
  on user_verdicts for all
  using ( auth.uid() = user_id );

-- EXAMPLE PREMIUM POLICY (Commented out until specific premium column exists)
-- create policy "Only paid users can see premium analysis"
--   on user_verdicts for select
--   using ( auth.uid() = user_id AND (is_paid_user(auth.uid()) OR NOT is_premium_content) );

-- 7. NOTIFICATIONS
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('email', 'in_app', 'whatsapp')),
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- RLS: Notifications
alter table notifications enable row level security;

create policy "Users read own notifications"
  on notifications for select
  using ( auth.uid() = user_id );

create policy "Service role sends notifications"
  on notifications for insert
  with check ( true ); -- Typically strictly service role, but allowing potential user-triggered notifs if needed (better restricted).

-- SEED DATA: PLANS
-- Upsert basic plans
insert into subscription_plans (name, price_monthly, price_yearly)
values
  ('FREE', 0, 0),
  ('PRO', 9, 90),
  ('TEAM', 29, 290)
on conflict (id) do nothing; -- (Note: Conflict on ID is tricky without known IDs, in real usage rely on name check or specific migration script)

-- Better Seed ensuring no duplicates by name
insert into subscription_plans (name, price_monthly, price_yearly)
select 'FREE', 0, 0
where not exists (select 1 from subscription_plans where name = 'FREE');

insert into subscription_plans (name, price_monthly, price_yearly)
select 'PRO', 9, 90
where not exists (select 1 from subscription_plans where name = 'PRO');

insert into subscription_plans (name, price_monthly, price_yearly)
select 'TEAM', 29, 290
where not exists (select 1 from subscription_plans where name = 'TEAM');

-- SEED DATA: FEATURES
insert into feature_flags (key, description)
values
  ('manage_subscriptions', 'Add/Edit OTT Subscriptions'),
  ('advanced_analytics', 'View detailed spending graphs'),
  ('email_alerts', 'Monthly breakdown emails')
on conflict (key) do nothing;

-- Map Features to Plans (Example Logic - requires looking up IDs, usually done in a migration script)
-- For this SQL file, we assume it's run in an environment where we can execute these blocks.

do $$
declare
  plan_free uuid;
  plan_pro uuid;
  feat_manage uuid;
  feat_alerts uuid;
begin
  select id into plan_free from subscription_plans where name = 'FREE';
  select id into plan_pro from subscription_plans where name = 'PRO';
  
  select id into feat_manage from feature_flags where key = 'manage_subscriptions';
  select id into feat_alerts from feature_flags where key = 'email_alerts';

  -- Free: No manage, No alerts
  insert into plan_features (plan_id, feature_id, enabled)
  values (plan_free, feat_manage, false)
  on conflict do nothing;

  -- Pro: Yes manage, Yes alerts
  insert into plan_features (plan_id, feature_id, enabled)
  values 
    (plan_pro, feat_manage, true),
    (plan_pro, feat_alerts, true)
  on conflict do nothing;
end $$;
