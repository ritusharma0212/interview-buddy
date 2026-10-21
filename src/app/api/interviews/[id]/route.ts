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
