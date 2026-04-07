-- Supabase schema for The Manager housing society platform

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Users extension table for profile data
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  mobile text unique,
  name text,
  role text check (role in ('platform_owner', 'admin', 'sub_admin', 'manager', 'resident')) default 'resident',
  society_id uuid,
  wing_id uuid,
  floor_id uuid,
  flat_id uuid,
  otp_verified boolean default false,
  twilio_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.users is 'Extended user profiles with roles and society hierarchy';

-- Enable RLS
alter table public.users enable row level security;

create table if not exists public.societies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.wings (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references public.societies(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add more tables from schema.sql as needed

