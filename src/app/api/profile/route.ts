import {NextResponse} from 'next/server';
import {z} from 'zod';
import {serverSupabase} from '@/lib/supabase/server';
export const runtime='nodejs';
const schema=z.object({profile_text:z.string().max(30000),source_url:z.string().max(2000).nullable().optional()});
async function auth(){
 const db=await serverSupabase();
 const {data:{user}}=await db.auth.getUser();
 return {db,user};
}
export async function GET(){
 const {db,user}=await auth();
 if(!user)return NextResponse.json({error:'Please sign in'},{status:401});
 const {data,error}=await db.from('career_profiles').select('profile_text,source_url,updated_at').eq('user_id',user.id).maybeSingle();
 if(error)return NextResponse.json({error:'Could not load profile. Run migration 0005.'},{status:500});
 return NextResponse.json({profile:data??{profile_text:'',source_url:null}});
}
export async function PUT(request:Request){
 const {db,user}=await auth();
 if(!user)return NextResponse.json({error:'Please sign in'},{status:401});
 let input:unknown;
 try{input=await request.json()}catch{return NextResponse.json({error:'Invalid JSON'},{status:400})}
 const parsed=schema.safeParse(input);
 if(!parsed.success)return NextResponse.json({error:'Profile is too long or invalid'},{status:400});
 const {error}=await db.from('career_profiles').upsert({user_id:user.id,profile_text:parsed.data.profile_text,source_url:parsed.data.source_url??null,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(error)return NextResponse.json({error:'Could not save profile. Run migration 0005.'},{status:500});
 return NextResponse.json({ok:true});
}
