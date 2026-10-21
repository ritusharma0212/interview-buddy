import {NextResponse} from 'next/server';
import {z} from 'zod';
import {serverSupabase} from '@/lib/supabase/server';

type Context={params:Promise<{id:string}>};
export async function DELETE(_request:Request,{params}:Context){
 const {id}=await params;
 if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:'Invalid interview ID'},{status:400});
 const db=await serverSupabase();
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user)return NextResponse.json({error:'Please sign in'},{status:401});
 const {data:interview,error:lookupError}=await db.from('interviews').select('id').eq('id',id).eq('user_id',user.id).maybeSingle();
 if(lookupError)return NextResponse.json({error:'Could not verify interview'},{status:500});
 if(!interview)return NextResponse.json({error:'Interview not found'},{status:404});
 // Remove dependent data before the parent; all operations are scoped to the signed-in user.
 // Any error stops deletion rather than leaving a parent pointing to orphaned data.
 for(const table of ['interview_practice_attempts','mock_interview_sessions','interview_question_sets'] as const){
  const {error}=await db.from(table).delete().eq('interview_id',id).eq('user_id',user.id);
  if(error)return NextResponse.json({error:'Could not remove associated interview history. Interview was not deleted.'},{status:500});
 }
 const {data:deleted,error}=await db.from('interviews').delete().eq('id',id).eq('user_id',user.id).select('id').maybeSingle();
 if(error)return NextResponse.json({error:'Could not delete interview'},{status:500});
 if(!deleted)return NextResponse.json({error:'Interview not found'},{status:404});
 return NextResponse.json({ok:true});
}

import {TARGET_SENIORITIES} from '@/lib/target-seniority';

const editSchema=z.object({
 company_name:z.string().trim().min(2).max(160),
 role_title:z.string().trim().min(2).max(200),
 interview_stage:z.string().min(2).max(100),
 target_seniority:z.enum(TARGET_SENIORITIES),
 job_description:z.string().min(20).max(60000),
 recruiter_instructions:z.string().max(12000),
 interview_at:z.string().nullable().optional()
});
export async function PATCH(request:Request,{params}:Context){
 const {id}=await params;
 if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:'Invalid interview ID'},{status:400});
 const db=await serverSupabase();
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user)return NextResponse.json({error:'Please sign in'},{status:401});
 const parsed=editSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:'Please check the interview details'},{status:400});
 const {interview_at,...details}=parsed.data;
 const date=interview_at?new Date(interview_at):null;
 if(date&&Number.isNaN(date.getTime()))return NextResponse.json({error:'Invalid interview date'},{status:400});
 const {data,error}=await db.from('interviews').update({...details,interview_at:date?.toISOString()??null}).eq('id',id).eq('user_id',user.id).select('id').maybeSingle();
 if(error)return NextResponse.json({error:'Could not update interview'},{status:500});
 if(!data)return NextResponse.json({error:'Interview not found'},{status:404});
 return NextResponse.json({ok:true});
}
