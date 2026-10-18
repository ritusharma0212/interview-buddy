import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
export async function serverSupabase(){const store=await cookies();return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll(){return store.getAll()},setAll(items){try{items.forEach(({name,value,options})=>store.set(name,value,options))}catch{ /* Server Components cannot set cookies */ }}}})}
