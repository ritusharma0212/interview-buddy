'use client';
import {useEffect,useState} from 'react';
type Question={question:string;competency:string;why_this_matters:string;answer_guidance:string};
type QuestionSet={id:string;questions:Question[];created_at:string};
export function InterviewQuestions({interviewId}:{interviewId:string}){
 const [set,setSet]=useState<QuestionSet|null>(null);
 const [loading,setLoading]=useState(true);
 const [generating,setGenerating]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{
   let active=true;
   fetch(`/api/interviews/${interviewId}/questions`).then(async r=>{
     const data=await r.json();
     if(!r.ok)throw new Error(data.error||'Could not load questions');
     if(active)setSet(data.question_set);
   }).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});
   return ()=>{active=false};
 },[interviewId]);
 async function generate(){
   setGenerating(true);setError('');
   try{
     const res=await fetch(`/api/interviews/${interviewId}/questions`,{method:'POST'});
     const data=await res.json();
     if(!res.ok)throw new Error(data.error||'Generation failed');
     setSet(data.question_set);
   }catch(e){setError(e instanceof Error?e.message:'Generation failed')}
   finally{setGenerating(false)}
 }
 return <section style={{marginTop:12}}>
   <button type="button" onClick={generate} disabled={generating||loading}>
     {generating?'Generating questions…':set?'Regenerate AI questions':'Generate AI interview questions'}
   </button>
   {loading&&<p>Loading saved questions…</p>}
   {error&&<p role="alert" style={{color:'crimson'}}>{error}</p>}
   {set&&<div><p><small>AI-generated practice questions based on your saved job description and stage; not verified company interview questions.</small></p>
     <ol>{set.questions.map((q,index)=><li key={index} style={{marginBottom:18}}>
       <strong>{q.question}</strong><p><b>Competency:</b> {q.competency}</p>
       <details><summary>Why it matters and how to answer</summary>
         <p>{q.why_this_matters}</p><p>{q.answer_guidance}</p>
       </details>
     </li>)}</ol>
   </div>}
 </section>;
}