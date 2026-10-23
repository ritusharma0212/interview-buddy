'use client';
import {useEffect,useState} from 'react';
import {VoicePractice} from './VoicePractice';
import {InterviewerVoice} from './InterviewerVoice';
import {MockBetterAnswers} from './MockBetterAnswers';

type Turn={role:'interviewer'|'candidate';text:string};
type Assessment={score:number;strengths:string[];improvements:string[];summary:string;betterAnswers?:{question:string;yourAnswer:string;betterAnswer:string;whyBetter:string}[]};
type Session={id:string;status:'active'|'completed';started_at:string;ended_at:string|null;turns:Turn[];assessment:Assessment|null};
export function MockInterview({interviewId}:{interviewId:string}){
 const [sessions,setSessions]=useState<Session[]>([]);
 const [current,setCurrent]=useState<Session|null>(null);
 const [answer,setAnswer]=useState('');
 const [mode,setMode]=useState<'type'|'speak'>('speak');
 const [now,setNow]=useState(Date.now());
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const url=`/api/interviews/${interviewId}/mock`;
 useEffect(()=>{
  let active=true;
  fetch(url).then(async r=>{const data=await r.json();if(!r.ok)throw Error(data.error||'Could not load sessions');if(active){setSessions(data.sessions??[]);setCurrent((data.sessions??[]).find((s:Session)=>s.status==='active')??null)}})
   .catch(e=>{if(active)setError(e.message)});
  return ()=>{active=false};
 },[url]);
 useEffect(()=>{const t=window.setInterval(()=>setNow(Date.now()),1000);return ()=>window.clearInterval(t)},[]);
 const remaining=current?.status==='active'?Math.max(0,30*60-Math.floor((now-new Date(current.started_at).getTime())/1000)):0;
 const time=`${Math.floor(remaining/60).toString().padStart(2,'0')}:${(remaining%60).toString().padStart(2,'0')}`;
 async function act(endpoint:string,body?:unknown){
  setBusy(true);setError('');
  try{
   const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body??{})});
   const data=await res.json();if(!res.ok)throw Error(data.error||'Request failed');
   setCurrent(data.session);setSessions(prev=>[data.session,...prev.filter(s=>s.id!==data.session.id)]);
   if(body&&typeof body==='object'&&'answer' in body)setAnswer('');
  }catch(e){setError(e instanceof Error?e.message:'Request failed')}
  finally{setBusy(false)}
 }
 const active=current?.status==='active';
 const expired=Boolean(active&&remaining===0);
 const answered=Boolean(current?.turns.some(t=>t.role==='candidate'));
 const lastQuestion=active?[...current.turns].reverse().find(t=>t.role==='interviewer')?.text:null;
 return <section style={{padding:14,border:'1px solid #cbd5e1',borderRadius:8,marginTop:12}}>
  <p><b>Mock Interview</b> · 30 minutes · AI interviewer</p>
  {error&&<p role="alert" style={{color:'crimson'}}>{error}</p>}
  {!active&&<button type="button" disabled={busy} onClick={()=>act(url)}>{busy?'Starting…':'Start 30-minute mock interview'}</button>}
  {active&&<>
   <p role="timer" style={{fontSize:22,fontWeight:700,fontVariantNumeric:'tabular-nums'}}>Time remaining: {time}</p>
   {expired&&<div role="status" style={{marginBottom:12}}><p>This mock interview session has expired.</p>
    {!answered?<button type="button" disabled={busy} onClick={()=>act(url)}>{busy?'Starting…':'Start new mock interview'}</button>:<p>Finish this session to receive your assessment before starting another.</p>}
   </div>}
   <p><b>Interviewer:</b> {lastQuestion}</p>
   <InterviewerVoice question={lastQuestion??''} enabled={remaining>0}/>
   {remaining>0&&<>
    <div style={{display:'flex',gap:8,marginBottom:8}}>
     <button type="button" aria-pressed={mode==='type'} onClick={()=>setMode('type')}>Type</button>
     <button type="button" aria-pressed={mode==='speak'} onClick={()=>setMode('speak')}>Speak</button>
    </div>
    {mode==='type'?<textarea aria-label="Your interview answer" rows={5} maxLength={12000} value={answer} onChange={e=>setAnswer(e.target.value)} style={{width:'100%',boxSizing:'border-box'}}/>:
     <VoicePractice value={answer} onChange={setAnswer} onSubmit={text=>{if(!busy&&current?.status==='active'&&remaining>0)void act(`${url}/${current.id}`,{answer:text})}}/>}
    <button type="button" disabled={busy||answer.trim().length<20} onClick={()=>act(`${url}/${current.id}`,{answer})}>{busy?'Thinking…':'Submit answer'}</button>
   </>}
   {(!expired||answered)&&<button type="button" style={{marginLeft:8}} disabled={busy} onClick={()=>act(`${url}/${current.id}/finish`)}>Finish interview & get assessment</button>}
   <details style={{marginTop:12}}><summary>Interview transcript ({current.turns.length} messages)</summary>
    {current.turns.map((t,i)=><p key={i}><b>{t.role==='interviewer'?'Interviewer':'You'}:</b> {t.text}</p>)}
   </details>
  </>}
  {current?.status==='completed'&&current.assessment&&<div style={{marginTop:12}}>
   <h3>Final assessment · {current.assessment.score}/10</h3>
   <p>{current.assessment.summary}</p>
   <b>Strengths</b><ul>{current.assessment.strengths.map((s,i)=><li key={i}>{s}</li>)}</ul>
   <b>Areas to improve</b><ul>{current.assessment.improvements.map((s,i)=><li key={i}>{s}</li>)}</ul>
   <MockBetterAnswers answers={current.assessment.betterAnswers}/>
   <details><summary>Full interview transcript</summary>{current.turns.map((t,i)=><p key={i}><b>{t.role==='interviewer'?'Interviewer':'You'}:</b> {t.text}</p>)}</details>
  </div>}
  {sessions.filter(s=>s.status==='completed').length>0&&<details style={{marginTop:12}}><summary>Previous mock interviews</summary>
   {sessions.filter(s=>s.status==='completed').map(s=><details key={s.id} style={{padding:8,borderBottom:'1px solid #ddd'}}>
    <summary>{new Date(s.started_at).toLocaleString()} · Score: {s.assessment?.score??'—'}/10</summary>
    <p>{s.assessment?.summary}</p><MockBetterAnswers answers={s.assessment?.betterAnswers}/><details><summary>Transcript</summary>{s.turns.map((t,i)=><p key={i}><b>{t.role==='interviewer'?'Interviewer':'You'}:</b> {t.text}</p>)}</details>
   </details>)}
  </details>}
  <p style={{fontSize:12,color:'#475467'}}>AI-generated interview simulation. Speech recognition is provided by your browser. Session time is enforced by the server.</p>
 </section>;
}
