import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function serverSupabase() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(items: CookieToSet[]) {
          try {
            items.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Server Components cannot write cookies.
          }
        },
      },
    },
  );
}
