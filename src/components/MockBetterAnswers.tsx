'use client';
type BetterAnswer={question:string;yourAnswer:string;betterAnswer:string;whyBetter:string};
export function MockBetterAnswers({answers}:{answers?:BetterAnswer[]}){
 if(!answers?.length)return null;
 return <section style={{marginTop:18}}>
  <h3>Better example answers</h3>
  <p style={{fontSize:13,color:'#475569'}}>Compare your response with a stronger version based only on the experience you shared. Add real examples and metrics where suggested.</p>
  {answers.map((a,i)=><details key={i} style={{border:'1px solid #e2e8f0',borderRadius:8,padding:12,margin:'10px 0'}}>
   <summary style={{cursor:'pointer',lineHeight:1.5}}><strong>Question {i+1}:</strong> {a.question}</summary>
   <div style={{marginTop:12}}>
    <p><b>Your answer</b></p><p style={{whiteSpace:'pre-wrap'}}>{a.yourAnswer}</p>
    <p><b>Better example answer</b></p><p style={{whiteSpace:'pre-wrap'}}>{a.betterAnswer}</p>
    <p><b>Why this is stronger</b></p><p style={{whiteSpace:'pre-wrap'}}>{a.whyBetter}</p>
   </div>
  </details>)}
 </section>;
}
