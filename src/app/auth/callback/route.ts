import {NextRequest,NextResponse} from 'next/server';
import {serverSupabase} from '@/lib/supabase/server';
export async function GET(req:NextRequest){const url=new URL(req.url);const code=url.searchParams.get('code');if(code){const db=await serverSupabase();const {error}=await db.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/dashboard',url.origin))}return NextResponse.redirect(new URL('/login?error=confirmation',url.origin))}
