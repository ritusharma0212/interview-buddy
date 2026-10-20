'use client';
import {useState,type ReactNode} from 'react';
import {MockInterview} from './MockInterview';
type Interview={id:string;company_name:string;role_title:string;interview_stage:string};
export function PreparationModes({dashboard,practice,interviews}:{dashboard:ReactNode;practice:ReactNode;interviews:Interview[]}){
 const [mode,setMode]=useState<'dashboard'|'practice'|'mock'>('dashboard');
 return <>
  <header className="app-header">
   <div className="app-header-inner">
    <div className="app-brand"><span className="app-brand-mark" aria-hidden="true">✦</span>Interview Buddy</div>
    <nav className="app-nav" aria-label="Preparation navigation">
     <button type="button" aria-pressed={mode==='dashboard'} onClick={()=>setMode('dashboard')}>Dashboard</button>
     <button type="button" aria-pressed={mode==='mock'} onClick={()=>setMode('mock')}>Mock Interview</button>
     <button type="button" aria-pressed={mode==='practice'} onClick={()=>setMode('practice')}>Question Practice</button>
    </nav>
    <form className="app-signout" action="/api/auth/signout" method="post"><button>Sign out</button></form>
   </div>
  </header>
  <div className="app-shell">
   <div hidden={mode!=='dashboard'} className="mode-panel">{dashboard}</div>
   <div hidden={mode!=='practice'} className="mode-panel">
    <h2>Choose your preparation mode</h2>
    <div className="workspace-grid" style={{marginBottom:20}}>
     <button type="button" aria-pressed={mode==='practice'} className="surface" onClick={()=>setMode('practice')} style={{textAlign:'left'}}><strong>Question Practice</strong><span style={{display:'block',marginTop:6}}>Self-paced answers, AI feedback and progress</span></button>
     <button type="button" aria-pressed={mode==='mock'} className="surface" onClick={()=>setMode('mock')} style={{textAlign:'left'}}><strong>Mock Interview</strong><span style={{display:'block',marginTop:6}}>30-minute interviewer-led conversation</span></button>
    </div>
    {practice}
   </div>
   {mode==='mock'&&<section className="mode-panel mock-panel">
    <h2>Mock Interview</h2>
    {interviews.length===0?<p>Create an interview workspace under Question Practice first.</p>:
     interviews.map(i=><details key={i.id}>
      <summary><b>{i.company_name} — {i.role_title}</b> · {i.interview_stage}</summary>
      <MockInterview interviewId={i.id}/>
     </details>)}
   </section>}
  </div>
 </>;
}
