import {NextResponse} from 'next/server';
import {serverSupabase} from '@/lib/supabase/server';
export async function POST(request:Request){const db=await serverSupabase();await db.auth.signOut();return NextResponse.redirect(new URL('/login',request.url),303)}
