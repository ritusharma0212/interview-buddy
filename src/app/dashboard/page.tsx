import {redirect} from 'next/navigation';
import {serverSupabase} from '@/lib/supabase/server';
import {NewInterview} from '@/components/NewInterview';
import {SavedInterviewWorkspace} from '@/components/SavedInterviewWorkspace';
import {DashboardProgress} from '@/components/DashboardProgress';
import {PreparationModes} from '@/components/PreparationModes';
export default async function Dashboard(){const db=await serverSupabase();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');const {data,error}=await db.from('interviews').select('id,company_name,role_title,interview_stage,interview_at').order('created_at',{ascending:false}).limit(100);const {data:history, error:historyError}=await db.from('interview_practice_attempts').select('id,interview_id,question_set_id,question_index,created_at,feedback').eq('user_id',user.id).order('created_at',{ascending:false}).limit(500);
const {data:mockSessions,mockError}=await (async()=>{const result=await db.from('mock_interview_sessions').select('id,interview_id,status,started_at,assessment').eq('user_id',user.id).limit(1000);return {data:result.data,mockError:result.error}})();
const {data:questionSets}=await db.from('interview_question_sets')
 .select('id,interview_id,questions,created_at').eq('user_id',user.id)
 .order('created_at',{ascending:false}).limit(1000);
const latestSets=new Map<string,{id:string;questions:unknown}>();
for(const set of questionSets??[]){if(!latestSets.has(set.interview_id))latestSets.set(set.interview_id,set)}
const attemptedBySet=new Map<string,Set<number>>();
for(const attempt of history??[]){
 const indices=attemptedBySet.get(attempt.question_set_id)??new Set<number>();
 indices.add(attempt.question_index);attemptedBySet.set(attempt.question_set_id,indices);
}
const practiceStatus=(id:string):'Not started'|'In progress'|'Complete'=>{
 const latest=latestSets.get(id);
 if(!latest)return 'Not started';
 const total=Array.isArray(latest.questions)?latest.questions.length:0;
 const answered=attemptedBySet.get(latest.id)?.size??0;
 if(total>0&&answered>=total)return 'Complete';
 return answered>0?'In progress':'Not started';
};
const mockStatus=(id:string):'Not started'|'In progress'|'Complete'=>{
 const sessions=(mockSessions??[]).filter(s=>s.interview_id===id);
 if(sessions.some(s=>s.status==='completed'&&s.assessment))return 'Complete';
 return sessions.length?'In progress':'Not started';
};
const workspace=<><h2>Saved interview workspaces</h2>{error&&<p role="alert">{error.message}</p>}{!data?.length&&<p>No interviews yet.</p>}{data?.map(x=><SavedInterviewWorkspace key={x.id} interview={x} status={practiceStatus(x.id)}/>)}</>;
return <PreparationModes interviews={data??[]} mockSessions={mockSessions??[]} mockStatuses={Object.fromEntries((data??[]).map(i=>[i.id,mockStatus(i.id)]))}
 dashboard={<><div className="page-intro"><h1>Your interviews</h1><p>Signed in as {user.email}</p></div><DashboardProgress attempts={history??[]} interviews={data??[]} sessions={mockSessions??[]} practiceError={Boolean(historyError)} mockError={Boolean(mockError)}/><div className="surface" style={{marginTop:20}}>{workspace}</div></>}
 addInterview={<div className="workspace-grid"> <div className="surface form-card"><NewInterview/></div><div className="surface practice-workspaces">{workspace}</div></div>}
 practice={<div className="surface practice-workspaces">{workspace}</div>}
/>}
