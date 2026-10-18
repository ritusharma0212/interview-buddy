# Interview Buddy

Company-specific PM interview preparation platform — production-oriented foundation.

## Included
- Next.js / TypeScript app with Supabase email/password authentication
- Interview creation and persistent dashboard
- PostgreSQL schema with RLS, company interview profiles, research source provenance, round templates, mock sessions, and prep events
- Vercel-compatible deployment configuration

## Not yet implemented
- Fresh company research and verified profile refresh
- AI mock interview experience and scoring
- Resume upload, adaptive preparation plan
- Google Calendar OAuth and scheduling
- Production tests, rate limiting, monitoring

## Configure
1. Create a Supabase project and run `supabase/migrations/0001_foundation.sql` in the SQL editor.
2. Copy `.env.example` to `.env.local` and supply your Supabase project URL and anon/publishable key.
3. Set Supabase Auth redirect URLs to include `http://localhost:3000/auth/callback` and your Vercel deployment's `/auth/callback`.
4. Run `npm install`, `npm run typecheck`, `npm run dev`.
5. Import the repository into Vercel, set environment variables, and verify login and database writes.

Do not commit secrets, tokens, or user documents. Company interview data must be source-backed; no sample company profiles are represented as verified.
