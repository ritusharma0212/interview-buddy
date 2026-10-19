# Mock Interview setup

Mock Interview is available to all signed-in users, without paid access.

1. Run `supabase/migrations/0004_mock_interviews.sql` in Supabase SQL Editor after migrations 0001–0003.
2. Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel server-only environment variables. Never commit, share, or prefix it with `NEXT_PUBLIC_`.
3. Redeploy and test creating, answering, finishing and resuming a 30-minute interview.
4. Verify signed-out users and users accessing another person's interview are denied. Confirm Question Practice remains intact.

The interviewer displays text questions; candidates may type or use browser speech-to-text. Gemini quota applies. Billing is deferred.
