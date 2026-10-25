'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {VoicePractice} from './VoicePractice';
import {PracticeFeedbackHistory} from './PracticeFeedbackHistory';
type Question={question:string;competency:string;why_this_matters:string;answer_guidance:string};
type QuestionSet={id:string;questions:Question[];created_at:string};
type Feedback={score:number;strengths:string[];improvements:string[];improved_answer:string;why_better?:string[];reusable_method?:string};
type Attempt={id:string;question_index:number;answer_text:string;feedback:Feedback;created_at:string};
export function InterviewQuestions({interviewId}:{interviewId:string}){
 const router=useRouter();
 const [set,setSet]=useState<QuestionSet|null>(null);
 const [loading,setLoading]=useState(true);
 const [generating,setGenerating]=useState(false);
 const [error,setError]=useState('');
 const [answers,setAnswers]=useState<Record<number,string>>({});
 const [answerModes,setAnswerModes]=useState<Record<number,'type'|'speak'>>({});
 const [attempts,setAttempts]=useState<Attempt[]>([]);
 const [evaluating,setEvaluating]=useState<number|null>(null);
 const [practiceError,setPracticeError]=useState<Record<number,string>>({});
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
 useEffect(()=>{
   if(!set){setAttempts([]);return}
   let active=true;
   fetch(`/api/interviews/${interviewId}/practice?question_set_id=${encodeURIComponent(set.id)}`)
    .then(async res=>{const data=await res.json();if(!res.ok)throw new Error(data.error||'Could not load practice history');if(active)setAttempts(data.attempts??[])})
    .catch(e=>{if(active)setError(e instanceof Error?e.message:'Could not load practice history')});
   return ()=>{active=false};
 },[interviewId,set?.id]);
 async function evaluate(index:number){
   if(!set)return;
   setEvaluating(index);setPracticeError(p=>({...p,[index]:''}));
   try{
    const res=await fetch(`/api/interviews/${interviewId}/practice`,{
     method:'POST',headers:{'Content-Type':'application/json'},
     body:JSON.stringify({question_set_id:set.id,question_index:index,answer_text:answers[index]??''})
    });
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||'Feedback failed');
    setAttempts(prev=>[data.attempt,...prev]);
    // Refresh server-derived interview status after saving the attempt.
    router.refresh();
   }catch(e){setPracticeError(p=>({...p,[index]:e instanceof Error?e.message:'Feedback failed'}))}
   finally{setEvaluating(null)}
 }
 return <section style={{marginTop:12}}>
   <button type="button" onClick={generate} disabled={generating||loading}>
     {generating?'Generating questions…':set?'Regenerate AI questions':'Generate AI interview questions'}
   </button>
   {loading&&<p>Loading saved questions…</p>}
   {error&&<p role="alert" style={{color:'crimson'}}>{error}</p>}
   {set&&<div><p><small>AI-generated practice questions based on your saved job description and stage; not verified company interview questions.</small></p>
     <ol style={{paddingLeft:24}}>{set.questions.map((q,index)=><li key={index} style={{marginBottom:10}}>
       <details className="saved-question-card" style={{border:'1px solid var(--line)',borderRadius:8,padding:'12px 14px',background:'var(--surface)',color:'var(--ink)'}}>
        <summary style={{cursor:'pointer',fontWeight:600,lineHeight:1.5}}>{q.question}</summary>
        <div style={{marginTop:12}}>
       <p><b>Competency:</b> {q.competency}</p>
       <details><summary>Why it matters and how to answer</summary>
         <p>{q.why_this_matters}</p><p>{q.answer_guidance}</p>
       </details>
       <div style={{marginTop:12,padding:12,background:'var(--soft)',border:'1px solid var(--line)',borderRadius:6}}>
        <p style={{fontWeight:600,margin:'0 0 8px'}}>How would you like to answer?</p>
        <div role="group" aria-label={`Answer method for question ${index+1}`} style={{display:'flex',gap:8,marginBottom:10}}>
         <button type="button" aria-pressed={(answerModes[index]??'type')==='type'}
          onClick={()=>setAnswerModes(p=>({...p,[index]:'type'}))}
          style={{padding:'7px 14px',borderRadius:6,background:(answerModes[index]??'type')==='type'?'var(--soft)':'var(--surface)',border:'1px solid #94a3b8'}}>⌨️ Type</button>
         <button type="button" aria-pressed={answerModes[index]==='speak'}
          onClick={()=>setAnswerModes(p=>({...p,[index]:'speak'}))}
          style={{padding:'7px 14px',borderRadius:6,background:answerModes[index]==='speak'?'var(--soft)':'var(--surface)',border:'1px solid #94a3b8'}}>🎙️ Speak</button>
        </div>
        {(answerModes[index]??'type')==='type'?<>
         <label htmlFor={`practice-${interviewId}-${index}`}><b>Type your answer</b></label>
         <textarea id={`practice-${interviewId}-${index}`} rows={5} maxLength={12000}
          placeholder="Type your interview answer here (at least 20 characters)…"
          value={answers[index]??''} onChange={e=>setAnswers(p=>({...p,[index]:e.target.value}))}
          style={{display:'block',width:'100%',boxSizing:'border-box',margin:'8px 0'}}/>
        </>:<VoicePractice key={`${set.id}-${index}`} value={answers[index]??''}
         onChange={text=>setAnswers(p=>({...p,[index]:text}))}/>}
        <button type="button" disabled={evaluating!==null||(answers[index]??'').trim().length<20}
         onClick={()=>evaluate(index)}>{evaluating===index?'Evaluating…':'Get AI feedback'}</button>
        {practiceError[index]&&<p role="alert" style={{color:'crimson'}}>{practiceError[index]}</p>}
        <PracticeFeedbackHistory key={`${set.id}-${index}`} attempts={attempts.filter(a=>a.question_index===index)}/>
       </div>
        </div>
       </details>
     </li>)}</ol>
   </div>}
 </section>;
}