# PRO Mock Interview setup (PR #17)

1. In Supabase SQL Editor, run `supabase/migrations/0004_mock_interviews.sql` after migrations 0001–0003.
2. In Vercel Project Settings → Environment Variables, add `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project's server-side service-role key. **Never** prefix it with `NEXT_PUBLIC_`, expose it in client code, commit it to GitHub, or paste it into chat.
3. Redeploy after adding the environment variable.
4. Billing is **not yet integrated**. All users are Free by default. For internal testing only, an authorized administrator can grant PRO to a known user in Supabase SQL Editor:
   ```sql
   insert into public.user_entitlements (user_id,plan)
   select id,'pro' from auth.users where email='REPLACE_WITH_TEST_ACCOUNT_EMAIL'
   on conflict (user_id) do update set plan='pro',updated_at=now();
   ```
   Use a real test email only in your own Supabase SQL Editor, not in this file. This is not a payment workflow.
5. Confirm a Free account sees the PRO lock and receives HTTP 403 from mock API endpoints. Confirm a PRO test account can start, answer, finish, and revisit saved mock sessions.
6. Confirm 30-minute server time limit, refresh/resume, and existing Question Practice are working before production rollout.

The first version is text-based interviewer questions with browser speech-to-text for candidate answers; it does not speak questions aloud. Each follow-up and final assessment uses Gemini quota. There is no billing, Stripe webhook, or automated entitlement provisioning in this PR.
