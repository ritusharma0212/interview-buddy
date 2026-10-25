import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(items: CookieToSet[]) {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data: { user } } = await db.auth.getUser();
  const path = request.nextUrl.pathname;
  // Create a guest only on app entry; never during login or API calls.
  if (!user && (path === '/' || path === '/dashboard')) {
    const { error } = await db.auth.signInAnonymously();
    if (error) {
      console.error('[guest-auth] Anonymous sign-in failed:', error.message);
      return NextResponse.redirect(new URL('/login?error=guest', request.url));
    }
  }
  return response;
}
