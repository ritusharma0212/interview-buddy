'use client';
import {useState,type ReactNode} from 'react';
import {MockInterview} from './MockInterview';
type Interview={id:string;company_name:string;role_title:string;interview_stage:string};
export function PreparationModes({practice,interviews,isPro}:{practice:ReactNode;interviews:Interview[];isPro:boolean}){
 const [mode,setMode]=useState<'practice'|'mock'>('practice');
 return <div>
  <h2>Choose your preparation mode</h2>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginBottom:20}}>
   <button type="button" aria-pressed={mode==='practice'} onClick={()=>setMode('practice')}
    style={{padding:16,textAlign:'left',border:'2px solid '+(mode==='practice'?'#2563eb':'#cbd5e1'),borderRadius:10,background:'white',color:'#111827'}}>
    <strong>Question Practice</strong><span style={{display:'block',marginTop:6}}>Self-paced answers, AI feedback and progress</span>
   </button>
   <button type="button" aria-pressed={mode==='mock'} onClick={()=>setMode('mock')}
    style={{padding:16,textAlign:'left',border:'2px solid '+(mode==='mock'?'#2563eb':'#cbd5e1'),borderRadius:10,background:'white',color:'#111827'}}>
    <strong>Mock Interview · PRO</strong><span style={{display:'block',marginTop:6}}>30-minute interviewer-led conversation</span>
   </button>
  </div>
  <div hidden={mode!=='practice'}>{practice}</div>
  {mode==='mock'&&<section>
   <h2>Mock Interview <span style={{fontSize:13}}>PRO</span></h2>
   {!isPro?<p>Mock Interview is available to PRO subscribers. Subscription checkout is not available yet; access will be enabled when billing is connected.</p>:
    interviews.length===0?<p>Create an interview workspace under Question Practice first.</p>:
    interviews.map(i=><details key={i.id} style={{border:'1px solid #cbd5e1',borderRadius:8,padding:14,margin:'10px 0'}}>
     <summary style={{cursor:'pointer'}}><b>{i.company_name} — {i.role_title}</b> · {i.interview_stage}</summary>
     <MockInterview interviewId={i.id}/>
    </details>)}
  </section>}
 </div>;
}
