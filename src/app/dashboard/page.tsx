import {redirect} from 'next/navigation';
import {serverSupabase} from '@/lib/supabase/server';
import {NewInterview} from '@/components/NewInterview';
import {SavedInterviewWorkspace} from '@/components/SavedInterviewWorkspace';
import {PracticeProgress} from '@/components/PracticeProgress';
import {PreparationModes} from '@/components/PreparationModes';
export default async function Dashboard(){const db=await serverSupabase();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');const {data,error}=await db.from('interviews').select('id,company_name,role_title,interview_stage,interview_at').order('created_at',{ascending:false}).limit(100);const {data:history, error:historyError}=await db.from('interview_practice_attempts').select('id,interview_id,question_set_id,question_index,created_at,feedback').eq('user_id',user.id).order('created_at',{ascending:false}).limit(500);
const workspace=<><h2>Saved interview workspaces</h2>{error&&<p role="alert">{error.message}</p>}{!data?.length&&<p>No interviews yet.</p>}{data?.map(x=><SavedInterviewWorkspace key={x.id} interview={x}/>)}</>;
return <PreparationModes interviews={data??[]}
 dashboard={<><div className="page-intro"><h1>Your interviews</h1><p>Signed in as {user.email}</p></div>{historyError?<p role="alert">Could not load practice progress. Check that migration 0003 has been applied.</p>:<PracticeProgress attempts={history??[]} interviews={data??[]}/>}<div className="surface" style={{marginTop:20}}>{workspace}</div></>}
 practice={<div className="workspace-grid"><div className="surface form-card"><NewInterview/></div><div className="surface practice-workspaces">{workspace}</div></div>}
/>}
