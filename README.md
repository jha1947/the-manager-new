# The Manager — Housing Society Management PWA

A full-stack Next.js 14 App Router project scaffold for a role-based housing society management platform. The app is designed for Supabase backend integration, OTP login, PWA support with `next-pwa`, and a role-aware dashboard experience.

## Tech stack

- Frontend: Next.js 14 App Router + Tailwind CSS
- Backend: Supabase (PostgreSQL, Auth, Storage, Realtime)
- Auth: Supabase OTP via phone number
- PWA: `next-pwa` service worker + manifest
- Deployment: Vercel-ready

## Getting started

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Install dependencies:

```bash
npm install
```

4. Run development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Project structure

- `app/`: Next.js App Router pages and layouts
- `components/`: shared UI components and auth guard
- `lib/`: Supabase client and role theme utilities
- `public/`: PWA manifest and icon assets

## Notes

- `app/login/page.tsx` contains OTP sign-in flow using Supabase.
- `app/dashboard/` contains starter dashboard pages for all roles.
- `app/reports/page.tsx` provides a reports overview stub.
- `middleware.ts` adds protection for dashboard and report routes.
- `app/api/seed-platform-owner/route.ts` seeds the initial platform owner using the Supabase service role key.
- `lib/supabaseServer.ts` provides a server-side Supabase client for elevated operations.
- `lib/userProfile.ts` handles user profile sync between Supabase Auth and app-level users table.
- `lib/dashboardData.ts` fetches role-based dashboard statistics and activity data.
- `components/ProfileSync.tsx` automatically syncs user profiles on dashboard access.
- `app/dashboard/profile/page.tsx` provides a functional profile management interface.

## Next steps

- Add Supabase schema and RLS policy scripts.
- Implement role-aware middleware and secure routes.
- Connect actual society, billing, complaint, wallet, and approval flows.
- Extend PWA offline caching and notifications.
