'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
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
 const [newInterviewId,setNewInterviewId]=useState<string|null>(null);
 const choicesRef=useRef<HTMLElement|null>(null);
 const [focusInterviewId,setFocusInterviewId]=useState<string|null>(null);
 useEffect(()=>{
  try{const id=sessionStorage.getItem('interview-buddy-new-interview');if(id&&interviews.some(i=>i.id===id)){sessionStorage.removeItem('interview-buddy-new-interview');setNewInterviewId(id)}}catch{}
 },[interviews]);
 useEffect(()=>{if(newInterviewId){window.scrollTo(0,0);choicesRef.current?.focus({preventScroll:true})}},[newInterviewId]);
 useEffect(()=>{
  if(!focusInterviewId)return;
  const selector=mode==='mock'?'.mock-panel details':'.mode-panel:not([hidden]) details[data-interview-id]';
  const el=Array.from(document.querySelectorAll<HTMLDetailsElement>(selector)).find(x=>mode==='mock'?x.getAttribute('data-interview-id')===focusInterviewId:x.getAttribute('data-interview-id')===focusInterviewId);
  if(el){el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'})}
  setFocusInterviewId(null);
 },[focusInterviewId,mode]);
 function choosePreparation(next:'mock'|'practice'){
  if(!newInterviewId)return;
  setFocusInterviewId(newInterviewId);setMode(next);setShowAddInterview(false);setNewInterviewId(null);
 }
 return <>
  <header className="app-header">
   <div className="app-header-inner">
    <div className="app-brand"><img className="app-brand-mark" src="/interview-buddy-logo.svg" alt="" aria-hidden="true"/>Interview Breakthrough</div>
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
   {newInterviewId&&<section ref={choicesRef} tabIndex={-1} className="post-create-choices" aria-labelledby="post-create-title">
    <div className="post-create-eyebrow">Interview created successfully</div>
    <h2 id="post-create-title">How would you like to prepare?</h2>
    <div className="post-create-options">
     <button type="button" onClick={()=>choosePreparation('mock')}><span className="post-create-icon" aria-hidden="true">🎙️</span><strong>Mock Interview</strong><span>Simulate a real interview with AI questions, follow-ups, and performance feedback.</span><span className="post-create-link">Start mock interview →</span></button>
     <button type="button" onClick={()=>choosePreparation('practice')}><span className="post-create-icon" aria-hidden="true">📖</span><strong>Question Practice</strong><span>Practice one question at a time, at your own pace, with targeted feedback.</span><span className="post-create-link">Practice questions →</span></button>
    </div>
   </section>}
   <div hidden={Boolean(newInterviewId)||mode!=='dashboard'} className="mode-panel dashboard-home">{showAddInterview?<><div className="page-intro"><button type="button" onClick={()=>setShowAddInterview(false)}>Dashboard</button></div>{addInterview}</>:<><div className="dashboard-actions"><button data-tour="add-interview" type="button" onClick={()=>setShowAddInterview(true)}>+ Add interview</button></div>{dashboard}</>}</div>
   <div hidden={Boolean(newInterviewId)||mode!=='practice'} className="mode-panel">
    {practice}
   </div>
   {!newInterviewId&&mode==='profile'&&<CareerProfile/>}
   {!newInterviewId&&mode==='mock'&&<section className="mode-panel mock-panel">
    <h2>Mock Interview</h2>
    {interviews.length===0?<p>Create an interview workspace under Question Practice first.</p>:
     interviews.map(i=><details key={i.id} data-interview-id={i.id}>
      <summary><b>{i.company_name} — {i.role_title}</b> <span className="interview-stage-pill">{i.interview_stage}</span> <span className="seniority-pill">{seniorityLabel(i.target_seniority,i.role_title).label} · {seniorityLabel(i.target_seniority,i.role_title).source==='inferred'?'Inferred':seniorityLabel(i.target_seniority,i.role_title).source==='selected'?'Selected':'Auto'}</span> <span className={`interview-status interview-status-${(mockStatuses[i.id]??'Not started').toLowerCase().replace(' ','-')}`}>{mockStatuses[i.id]??'Not started'}</span></summary>
      <MockInterview interviewId={i.id}/>
      <div className="interview-delete-actions"><EditInterview interview={{...i,interview_at:i.interview_at??null}}/><button type="button" className="interview-delete-button" disabled={deletingId===i.id} onClick={()=>setConfirmDeleteId(i.id)}>{deletingId===i.id?'Deleting…':'Delete interview'}</button>{deleteError[i.id]&&<span role="alert">{deleteError[i.id]}</span>}</div>
      {confirmDeleteId===i.id&&<div className="delete-confirm-backdrop" role="presentation"><div className="delete-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="mock-delete-title" aria-describedby="mock-delete-desc"><h3 id="mock-delete-title">Delete this interview?</h3><p id="mock-delete-desc">Permanently delete <strong>{i.company_name} — {i.role_title}</strong> and all its practice and mock interview history? This cannot be undone.</p><div className="delete-confirm-actions"><button type="button" onClick={()=>setConfirmDeleteId(null)}>Cancel — keep interview</button><button type="button" className="delete-confirm-danger" onClick={()=>void deleteInterview(i)}>Yes, delete permanently</button></div></div></div>}
     </details>)}
   </section>}
  </div>
  {!newInterviewId&&<GuidedTour userId={userId} onNavigate={tourNavigate}/>}
 </>;
}
