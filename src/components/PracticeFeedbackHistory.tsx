'use client';
import {useEffect,useState} from 'react';

type Feedback={score:number;strengths:string[];improvements:string[];improved_answer:string};
export type PracticeAttempt={id:string;question_index:number;answer_text:string;feedback:Feedback;created_at:string};

export function PracticeFeedbackHistory({attempts}:{attempts:PracticeAttempt[]}){
 const [historyOpen,setHistoryOpen]=useState(false);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const latest=attempts[0];
 const selected=attempts.find(a=>a.id===selectedId)??latest;
 useEffect(()=>{setSelectedId(null)},[latest?.id]);
 if(!latest)return null;
 const selectedNumber=attempts.length-attempts.findIndex(a=>a.id===selected.id);
 return <section aria-label="Practice feedback" style={{borderTop:'1px solid #ddd',marginTop:12,paddingTop:10}}>
  <p style={{marginTop:0}}><b>{selected.id===latest.id?'Latest feedback':`Previous feedback · Attempt #${selectedNumber}`}</b> · <b>Score: {selected.feedback.score}/10</b></p>
  <p style={{fontSize:12,color:'#475467'}}>Attempt #{selectedNumber} of {attempts.length} · {new Date(selected.created_at).toLocaleString()}</p>
  <details><summary>View your submitted answer</summary><p style={{whiteSpace:'pre-wrap'}}>{selected.answer_text}</p></details>
  <p><b>Strengths</b></p><ul>{selected.feedback.strengths.map((s,j)=><li key={j}>{s}</li>)}</ul>
  <p><b>How to improve</b></p><ul>{selected.feedback.improvements.map((s,j)=><li key={j}>{s}</li>)}</ul>
  <details key={selected.id}><summary>Improved example answer</summary><p style={{whiteSpace:'pre-wrap'}}>{selected.feedback.improved_answer}</p></details>
  {attempts.length>1&&<div style={{marginTop:14}}>
   <button type="button" aria-expanded={historyOpen} onClick={()=>setHistoryOpen(v=>!v)}>
    {historyOpen?'Hide prior answers':`View prior answers (${attempts.length-1})`}
   </button>
   {historyOpen&&<div style={{marginTop:10}}>
    <p style={{fontSize:13,margin:'0 0 8px'}}>Select an earlier attempt to see its feedback:</p>
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
     {attempts.slice(1).map((a,i)=><button key={a.id} type="button"
      aria-pressed={selected.id===a.id}
      onClick={()=>setSelectedId(a.id)}
      style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',textAlign:'left',padding:10,border:'1px solid #cbd5e1',borderRadius:6,background:selected.id===a.id?'#dbeafe':'white',color:'#172554'}}>
      <span>Attempt #{attempts.length-i-1} · {new Date(a.created_at).toLocaleString()}</span>
      <strong>{a.feedback.score}/10</strong>
     </button>)}
    </div>
    {selected.id!==latest.id&&<button type="button" style={{marginTop:10}} onClick={()=>setSelectedId(null)}>Back to latest feedback</button>}
   </div>}
  </div>}
 </section>;
}
