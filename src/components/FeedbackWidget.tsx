'use client';
import {useState} from 'react';

type Category='Bug report'|'Feature request'|'General feedback';
export function FeedbackWidget(){
 const [open,setOpen]=useState(false);
 const [category,setCategory]=useState<Category>('General feedback');
 const [message,setMessage]=useState('');
 const [rating,setRating]=useState<number|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [sent,setSent]=useState(false);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(rating===null){setError('Please select a star rating.');return}setBusy(true);setError('');
  try{
   const response=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({category,message,rating,page:window.location.pathname})});
   const result=await response.json();
   if(!response.ok)throw Error(result.error||'Could not send feedback');
   setSent(true);setMessage('');setRating(null);
  }catch(e){setError(e instanceof Error?e.message:'Could not send feedback')}
  finally{setBusy(false)}
 }
 return <>
  <button type="button" className="feedback-trigger" onClick={()=>{setOpen(true);setSent(false);setError('')}}>💬 Send feedback</button>
  {open&&<div className="feedback-overlay" onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false)}}>
   <div className="feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
    <div className="feedback-heading"><h2 id="feedback-title">Help improve Interview Buddy</h2><button type="button" aria-label="Close feedback" onClick={()=>setOpen(false)}>✕</button></div>
    {sent?<div className="feedback-success" role="status"><h3>Thank you for your feedback!</h3><p>Your feedback has been saved. We appreciate you helping make Interview Buddy better.</p><button type="button" onClick={()=>setOpen(false)}>Done</button><button type="button" onClick={()=>setSent(false)}>Send another</button></div>:
    <form className="feedback-form" onSubmit={submit}>
     <label><span className="sr-only">Feedback category</span><select value={category} onChange={event=>setCategory(event.target.value as Category)}><option>General feedback</option><option>Bug report</option><option>Feature request</option></select></label>
     <label><span className="sr-only">Written feedback (optional)</span><textarea rows={5} maxLength={4000} value={message} onChange={event=>setMessage(event.target.value)} placeholder="Tell us what worked, what didn't, or what you'd like to see…"/></label>
     <fieldset><legend>How would you rate your experience? <span>(required)</span></legend><div className="feedback-stars">{[1,2,3,4,5].map(n=><button key={n} type="button" aria-label={n+' out of 5 stars'} aria-pressed={rating===n} onClick={()=>setRating(n)}>{n<=(rating??0)?'★':'☆'}</button>)}</div></fieldset>
     <p className="feedback-privacy">Your feedback is linked to your account and is not visible to other users. Please avoid including passwords or sensitive personal information.</p>
     {error&&<p role="alert" className="feedback-error">{error}</p>}
     <div className="feedback-actions"><button type="button" onClick={()=>setOpen(false)}>Cancel</button><button type="submit" disabled={busy||rating===null}>{busy?'Sending…':'Submit feedback'}</button></div>
    </form>}
   </div>
  </div>}
 </>;
}
