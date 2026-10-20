import {redirect} from 'next/navigation';
import {serverSupabase} from '@/lib/supabase/server';
import {NewInterview} from '@/components/NewInterview';
import {SavedInterviewWorkspace} from '@/components/SavedInterviewWorkspace';
import {DashboardProgress} from '@/components/DashboardProgress';
import {PreparationModes} from '@/components/PreparationModes';
export default async function Dashboard(){const db=await serverSupabase();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');const {data,error}=await db.from('interviews').select('id,company_name,role_title,interview_stage,interview_at').order('created_at',{ascending:false}).limit(100);const {data:history, error:historyError}=await db.from('interview_practice_attempts').select('id,interview_id,question_set_id,question_index,created_at,feedback').eq('user_id',user.id).order('created_at',{ascending:false}).limit(500);
const {data:mockSessions,mockError}=await (async()=>{const result=await db.from('mock_interview_sessions').select('id,interview_id,status,started_at,assessment').eq('user_id',user.id).limit(1000);return {data:result.data,mockError:result.error}})();
const practicedIds=new Set((history??[]).map(a=>a.interview_id));
const completedIds=new Set((mockSessions??[]).filter(s=>s.status==='completed').map(s=>s.interview_id));
const startedIds=new Set((mockSessions??[]).map(s=>s.interview_id));
const interviewStatus=(id:string):'Not started'|'In progress'|'Complete'=>completedIds.has(id)?'Complete':(practicedIds.has(id)||startedIds.has(id))?'In progress':'Not started';
const workspace=<><h2>Saved interview workspaces</h2>{error&&<p role="alert">{error.message}</p>}{!data?.length&&<p>No interviews yet.</p>}{data?.map(x=><SavedInterviewWorkspace key={x.id} interview={x} status={interviewStatus(x.id)}/>)}</>;
return <PreparationModes interviews={data??[]} mockSessions={mockSessions??[]}
 dashboard={<><div className="page-intro"><h1>Your interviews</h1><p>Signed in as {user.email}</p></div><DashboardProgress attempts={history??[]} interviews={data??[]} sessions={mockSessions??[]} practiceError={Boolean(historyError)} mockError={Boolean(mockError)}/><div className="surface" style={{marginTop:20}}>{workspace}</div></>}
 addInterview={<div className="workspace-grid"> <div className="surface form-card"><NewInterview/></div><div className="surface practice-workspaces">{workspace}</div></div>}
 practice={<div className="surface practice-workspaces">{workspace}</div>}
/>}
