# Supabase Setup for The Manager

This directory contains the database schema and RLS policies for the housing society management platform.

## Files

- `schema.sql`: Create tables for societies, users, bills, complaints, tasks, finances, reports, wallets, and Haat Bazaar.
- `policies.sql`: Enable row level security and define access controls based on role and society.

## How to use

1. Open Supabase SQL editor.
2. Run `schema.sql` to create the database objects.
3. Run `policies.sql` to enable RLS and apply policies.

## Notes

- Auth is expected to be handled by Supabase Auth.
- App-level `users` table stores profile and role data.
- Use JWT claims for `user_id`, `role`, and `society_id` in the policy context.
