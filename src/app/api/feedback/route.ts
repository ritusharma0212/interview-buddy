import {NextResponse} from 'next/server';
import {z} from 'zod';
import {serverSupabase} from '@/lib/supabase/server';

const schema=z.object({
 category:z.enum(['Bug report','Feature request','General feedback']),
 message:z.string().trim().max(4000).default(''),
 rating:z.number().int().min(1).max(5),
 page:z.string().max(120).optional()
});
export async function POST(request:Request){
 const db=await serverSupabase();
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user)return NextResponse.json({error:'Please sign in to send feedback'},{status:401});
 const parsed=schema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:'Please choose a rating from 1 to 5 stars'},{status:400});
 const {error}=await db.from('user_feedback').insert({user_id:user.id,...parsed.data});
 if(error)return NextResponse.json({error:'Could not save feedback. Please try again.'},{status:500});
 return NextResponse.json({ok:true},{status:201});
}
