'use client';
import {useState} from 'react';

type Feedback={score:number;strengths:string[];improvements:string[];improved_answer:string};
export type PracticeAttempt={id:string;question_index:number;answer_text:string;feedback:Feedback;created_at:string};

function FeedbackDetails({attempt}:{attempt:PracticeAttempt}){
 return <>
  <details><summary>View your submitted answer</summary><p style={{whiteSpace:'pre-wrap'}}>{attempt.answer_text}</p></details>
  <p><b>Strengths</b></p><ul>{attempt.feedback.strengths.map((s,j)=><li key={j}>{s}</li>)}</ul>
  <p><b>How to improve</b></p><ul>{attempt.feedback.improvements.map((s,j)=><li key={j}>{s}</li>)}</ul>
  <details><summary>Improved example answer</summary><p style={{whiteSpace:'pre-wrap'}}>{attempt.feedback.improved_answer}</p></details>
 </>;
}

export function PracticeFeedbackHistory({attempts}:{attempts:PracticeAttempt[]}){
 const [historyOpen,setHistoryOpen]=useState(false);
 const latest=attempts[0];
 if(!latest)return null;
 return <section aria-label="Practice feedback" style={{borderTop:'1px solid #ddd',marginTop:12,paddingTop:10}}>
  <p style={{marginTop:0}}><b>Latest feedback</b> · <b>Score: {latest.feedback.score}/10</b></p>
  <p style={{fontSize:12,color:'#475467'}}>Attempt #{attempts.length} of {attempts.length} · {new Date(latest.created_at).toLocaleString()}</p>
  <FeedbackDetails key={latest.id} attempt={latest}/>
  {attempts.length>1&&<div style={{marginTop:14}}>
   <button type="button" aria-expanded={historyOpen} onClick={()=>setHistoryOpen(v=>!v)}>
    {historyOpen?'Hide prior answers':`View prior answers (${attempts.length-1})`}
   </button>
   {historyOpen&&<div style={{marginTop:10}}>
    <p style={{fontSize:13,margin:'0 0 8px'}}>Expand an earlier attempt to review its answer and feedback:</p>
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
     {attempts.slice(1).map((a,i)=><details key={a.id} style={{border:'1px solid #cbd5e1',borderRadius:6,background:'white',padding:10}}>
      <summary style={{cursor:'pointer',fontWeight:600}}>
       Attempt #{attempts.length-i-1} · {new Date(a.created_at).toLocaleString()} · Score: {a.feedback.score}/10
      </summary>
      <div style={{padding:'8px 4px 4px'}}>
       <FeedbackDetails attempt={a}/>
      </div>
     </details>)}
    </div>
   </div>}
  </div>}
 </section>;
}
