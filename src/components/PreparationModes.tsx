'use client';
import {useState,type ReactNode} from 'react';
import {MockInterview} from './MockInterview';
import {MockInterviewProgress} from './MockInterviewProgress';
type Interview={id:string;company_name:string;role_title:string;interview_stage:string};
type MockSession={id:string;interview_id:string;status:string;started_at:string;assessment:{score?:number}|null};
export function PreparationModes({dashboard,practice,addInterview,interviews,mockSessions}:{dashboard:ReactNode;practice:ReactNode;addInterview:ReactNode;interviews:Interview[];mockSessions:MockSession[]}){
 const [mode,setMode]=useState<'dashboard'|'practice'|'mock'>('dashboard');
 const [showAddInterview,setShowAddInterview]=useState(false);
 return <>
  <header className="app-header">
   <div className="app-header-inner">
    <div className="app-brand"><span className="app-brand-mark" aria-hidden="true">✦</span>Interview Buddy</div>
    <nav className="app-nav" aria-label="Preparation navigation">
     <button type="button" aria-pressed={mode==='dashboard'} onClick={()=>{setMode('dashboard');setShowAddInterview(false)}}>Dashboard</button>
     <button type="button" aria-pressed={mode==='mock'} onClick={()=>{setMode('mock');setShowAddInterview(false)}}>Mock Interview</button>
     <button type="button" aria-pressed={mode==='practice'} onClick={()=>{setMode('practice');setShowAddInterview(false)}}>Question Practice</button>
    </nav>
    <form className="app-signout" action="/api/auth/signout" method="post"><button>Sign out</button></form>
   </div>
  </header>
  <div className="app-shell">
   <div hidden={mode!=='dashboard'} className="mode-panel">{showAddInterview?<><div className="page-intro"><button type="button" onClick={()=>setShowAddInterview(false)}>Dashboard</button></div>{addInterview}</>:<><div className="dashboard-actions"><button type="button" onClick={()=>setShowAddInterview(true)}>+ Add interview</button></div>{dashboard}</>}</div>
   <div hidden={mode!=='practice'} className="mode-panel">
    {practice}
   </div>
   {mode==='mock'&&<section className="mode-panel mock-panel">
    <h2>Mock Interview</h2>
    <MockInterviewProgress sessions={mockSessions} interviews={interviews}/>
    {interviews.length===0?<p>Create an interview workspace under Question Practice first.</p>:
     interviews.map(i=><details key={i.id}>
      <summary><b>{i.company_name} — {i.role_title}</b> · {i.interview_stage}</summary>
      <MockInterview interviewId={i.id}/>
     </details>)}
   </section>}
  </div>
 </>;
}
