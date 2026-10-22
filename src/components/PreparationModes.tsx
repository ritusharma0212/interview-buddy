'use client';
import {useState,type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {MockInterview} from './MockInterview';
import {EditInterview} from './EditInterview';
import {CareerProfile} from './CareerProfile';
import {ThemeToggle} from './ThemeToggle';
import {FeedbackWidget} from './FeedbackWidget';
import {GuidedTour} from './GuidedTour';
import {seniorityLabel} from '@/lib/target-seniority';
type Interview={id:string;company_name:string;role_title:string;interview_stage:string;target_seniority?:string;interview_at:string|null;job_description?:string|null;recruiter_instructions?:string|null};
type MockSession={id:string;interview_id:string;status:string;started_at:string;assessment:{score?:number}|null};
type InterviewStatus='Not started'|'In progress'|'Complete';
export function PreparationModes({dashboard,practice,addInterview,interviews,mockSessions,mockStatuses,userId}:{dashboard:ReactNode;practice:ReactNode;addInterview:ReactNode;interviews:Interview[];mockSessions:MockSession[];mockStatuses:Record<string,InterviewStatus>;userId:string}){
 const router=useRouter();
 function tourNavigate(target:string){if(target==='add-interview'){setMode('dashboard');setShowAddInterview(true)}else{setMode(target as 'profile'|'practice'|'mock');setShowAddInterview(false)}}
 const [deletingId,setDeletingId]=useState<string|null>(null);
 const [confirmDeleteId,setConfirmDeleteId]=useState<string|null>(null);
 const [deleteError,setDeleteError]=useState<Record<string,string>>({});
 async function deleteInterview(i:Interview){
  setConfirmDeleteId(null);
  setDeletingId(i.id);setDeleteError(previous=>({...previous,[i.id]:''}));
  try{const response=await fetch('/api/interviews/'+i.id,{method:'DELETE'});const result=await response.json();if(!response.ok)throw Error(result.error||'Delete failed');router.refresh();}
  catch(error){setDeleteError(previous=>({...previous,[i.id]:error instanceof Error?error.message:'Could not delete interview'}));setDeletingId(null)}
 }
 const [mode,setMode]=useState<'dashboard'|'practice'|'mock'|'profile'>('dashboard');
 const [showAddInterview,setShowAddInterview]=useState(false);
 return <>
  <header className="app-header">
   <div className="app-header-inner">
    <div className="app-brand"><span className="app-brand-mark" aria-hidden="true">✦</span>Interview Buddy</div>
    <nav className="app-nav" aria-label="Preparation navigation">
     <button type="button" aria-pressed={mode==='dashboard'} onClick={()=>{setMode('dashboard');setShowAddInterview(false)}}>Dashboard</button>
     <button data-tour="mock" type="button" aria-pressed={mode==='mock'} onClick={()=>{setMode('mock');setShowAddInterview(false)}}>Mock Interview</button>
     <button data-tour="practice" type="button" aria-pressed={mode==='practice'} onClick={()=>{setMode('practice');setShowAddInterview(false)}}>Question Practice</button>
     <button data-tour="profile" type="button" aria-pressed={mode==='profile'} onClick={()=>{setMode('profile');setShowAddInterview(false)}}>My Profile</button>
    </nav>
    <div className="app-header-actions"><FeedbackWidget/><ThemeToggle/><form className="app-signout" action="/api/auth/signout" method="post"><button>Sign out</button></form></div>
   </div>
  </header>
  <div className="app-shell">
   <div hidden={mode!=='dashboard'} className="mode-panel dashboard-home">{showAddInterview?<><div className="page-intro"><button type="button" onClick={()=>setShowAddInterview(false)}>Dashboard</button></div>{addInterview}</>:<><div className="dashboard-actions"><button data-tour="add-interview" type="button" onClick={()=>setShowAddInterview(true)}>+ Add interview</button></div>{dashboard}</>}</div>
   <div hidden={mode!=='practice'} className="mode-panel">
    {practice}
   </div>
   {mode==='profile'&&<CareerProfile/>}
   {mode==='mock'&&<section className="mode-panel mock-panel">
    <h2>Mock Interview</h2>
    {interviews.length===0?<p>Create an interview workspace under Question Practice first.</p>:
     interviews.map(i=><details key={i.id}>
      <summary><b>{i.company_name} — {i.role_title}</b> <span className="interview-stage-pill">{i.interview_stage}</span> <span className="seniority-pill">{seniorityLabel(i.target_seniority,i.role_title).label} · {seniorityLabel(i.target_seniority,i.role_title).source==='inferred'?'Inferred':seniorityLabel(i.target_seniority,i.role_title).source==='selected'?'Selected':'Auto'}</span> <span className={`interview-status interview-status-${(mockStatuses[i.id]??'Not started').toLowerCase().replace(' ','-')}`}>{mockStatuses[i.id]??'Not started'}</span></summary>
      <MockInterview interviewId={i.id}/>
      <div className="interview-delete-actions"><EditInterview interview={{...i,interview_at:i.interview_at??null}}/><button type="button" className="interview-delete-button" disabled={deletingId===i.id} onClick={()=>setConfirmDeleteId(i.id)}>{deletingId===i.id?'Deleting…':'Delete interview'}</button>{deleteError[i.id]&&<span role="alert">{deleteError[i.id]}</span>}</div>
      {confirmDeleteId===i.id&&<div className="delete-confirm-backdrop" role="presentation"><div className="delete-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="mock-delete-title" aria-describedby="mock-delete-desc"><h3 id="mock-delete-title">Delete this interview?</h3><p id="mock-delete-desc">Permanently delete <strong>{i.company_name} — {i.role_title}</strong> and all its practice and mock interview history? This cannot be undone.</p><div className="delete-confirm-actions"><button type="button" onClick={()=>setConfirmDeleteId(null)}>Cancel — keep interview</button><button type="button" className="delete-confirm-danger" onClick={()=>void deleteInterview(i)}>Yes, delete permanently</button></div></div></div>}
     </details>)}
   </section>}
  </div>
  <GuidedTour userId={userId} onNavigate={tourNavigate}/>
 </>;
}
