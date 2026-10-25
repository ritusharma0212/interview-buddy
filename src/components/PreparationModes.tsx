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
import {browserSupabase} from '@/lib/supabase/browser';
type Interview={id:string;company_name:string;role_title:string;interview_stage:string;target_seniority?:string;interview_at:string|null;job_description?:string|null;recruiter_instructions?:string|null};
type MockSession={id:string;interview_id:string;status:string;started_at:string;assessment:{score?:number}|null};
type InterviewStatus='Not started'|'In progress'|'Complete';
export function PreparationModes({dashboard,practice,addInterview,interviews,mockSessions,mockStatuses,userId,isGuest=false}:{dashboard:ReactNode;practice:ReactNode;addInterview:ReactNode;interviews:Interview[];mockSessions:MockSession[];mockStatuses:Record<string,InterviewStatus>;userId:string;isGuest?:boolean}){
 const router=useRouter();
 const [showUpgrade,setShowUpgrade]=useState(false);
 const [upgradeEmail,setUpgradeEmail]=useState('');
 const [upgradePassword,setUpgradePassword]=useState('');
 const [upgradeBusy,setUpgradeBusy]=useState(false);
 const [upgradeMessage,setUpgradeMessage]=useState('');
 const [upgradeSent,setUpgradeSent]=useState(false);
 async function upgradeGuest(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(upgradePassword.length<8){setUpgradeMessage('Use at least 8 characters for your password.');return}
  setUpgradeBusy(true);setUpgradeMessage('');
  const db=browserSupabase();
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError||!user?.is_anonymous){
   setUpgradeMessage('Guest session not found. Refresh and try again without signing out.');
   setUpgradeBusy(false);return;
  }
  // Update the existing identity rather than signing up a second user.
  const {error}=await db.auth.updateUser(
   {email:upgradeEmail.trim(),password:upgradePassword},
   {emailRedirectTo:window.location.origin+'/auth/callback'}
  );
  setUpgradeBusy(false);
  if(error){setUpgradeMessage(error.message);return}
  setUpgradePassword('');setUpgradeSent(true);
  setUpgradeMessage('Check your email for the verification link. Your guest work remains saved on this device. After verification, you can sign in with your email and password.');
 }
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
 useEffect(()=>{
  if(new URLSearchParams(window.location.search).get('import')!=='extension')return;
  setMode('dashboard');setShowAddInterview(true);
  window.history.replaceState(null,'',window.location.pathname);
 },[]);

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
    <div className="app-header-actions"><FeedbackWidget/><ThemeToggle/>{isGuest?<><button type="button" onClick={()=>{setShowUpgrade(true);setUpgradeSent(false);setUpgradeMessage('')}}>Save my progress</button><a href="/login">Sign In</a></>:<form className="app-signout" action="/api/auth/signout" method="post"><button>Sign out</button></form>}</div>
   </div>
  </header>
  {isGuest&&showUpgrade&&<div className="feedback-overlay" onMouseDown={event=>{if(event.target===event.currentTarget)setShowUpgrade(false)}}>
   <div className="feedback-dialog" role="dialog" aria-modal="true" aria-label="Save your guest progress">
    <div className="feedback-heading"><h2>Save your progress</h2><button type="button" aria-label="Close" onClick={()=>setShowUpgrade(false)}>✕</button></div>
    <p>Link an email and password to this guest profile. Your interviews and practice history will stay with this account.</p>
    {upgradeSent?<><p role="status">{upgradeMessage}</p><button type="button" onClick={()=>setShowUpgrade(false)}>Done</button></>:
    <form className="feedback-form" onSubmit={upgradeGuest}>
     <label>Email<input type="email" autoComplete="email" required value={upgradeEmail} onChange={e=>setUpgradeEmail(e.target.value)}/></label>
     <label>Password (at least 8 characters)<input type="password" autoComplete="new-password" minLength={8} required value={upgradePassword} onChange={e=>setUpgradePassword(e.target.value)}/></label>
     <p>Already have an account? Use Sign In instead. Existing account data is not merged with guest data.</p>
     {upgradeMessage&&<p role="alert">{upgradeMessage}</p>}
     <div className="feedback-actions"><button type="button" onClick={()=>setShowUpgrade(false)}>Cancel</button><button type="submit" disabled={upgradeBusy}>{upgradeBusy?'Saving…':'Link email and save'}</button></div>
    </form>}
   </div>
  </div>}
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
