'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {TARGET_SENIORITIES} from '@/lib/target-seniority';

export type EditableInterview={id:string;company_name:string;role_title:string;interview_stage:string;target_seniority?:string;interview_at:string|null;job_description?:string|null;recruiter_instructions?:string|null};

function localDateTime(value:string|null){
 if(!value)return '';
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return '';
 const local=new Date(date.getTime()-date.getTimezoneOffset()*60000);
 return local.toISOString().slice(0,16);
}
export function EditInterview({interview}:{interview:EditableInterview}){
 const router=useRouter();
 const [open,setOpen]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 async function save(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError('');
  const data=new FormData(event.currentTarget);
  const payload=Object.fromEntries(data.entries());
  // A blank date means unscheduled. Keep the original UTC instant if the date field was untouched.
  const date=String(payload.interview_at??'');
  payload.interview_at=date?(date===localDateTime(interview.interview_at)&&interview.interview_at?interview.interview_at:new Date(date).toISOString()):'';
  try{
   const response=await fetch('/api/interviews/'+interview.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const result=await response.json();
   if(!response.ok)throw Error(result.error||'Could not update interview');
   setOpen(false);setNotice('Interview updated.');router.refresh();
  }catch(e){setError(e instanceof Error?e.message:'Could not update interview')}
  finally{setBusy(false)}
 }
 return <div className="edit-interview">
  <button type="button" onClick={()=>{setOpen(value=>!value);setError('')}} aria-expanded={open}>{open?'Cancel editing':'Edit interview'}</button>
  {notice&&!open&&<small role="status">{notice}</small>}
  {open&&<form className="edit-interview-form" onSubmit={save}>
   <h3>Edit interview details</h3>
   <label>Company<input name="company_name" required minLength={2} maxLength={160} defaultValue={interview.company_name}/></label>
   <label>Role title<input name="role_title" required minLength={2} maxLength={200} defaultValue={interview.role_title}/></label>
   <label>Target seniority<select name="target_seniority" defaultValue={interview.target_seniority??'Auto-detect from role'}>{TARGET_SENIORITIES.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
   <label>Interview type<select name="interview_stage" defaultValue={interview.interview_stage}>{Array.from(new Set(['Recruiter screen','Hiring manager','Product sense','Product execution','Product strategy','Behavioral','Other',interview.interview_stage])).map(s=><option key={s}>{s}</option>)}</select></label>
   <label>Interview date/time (your local timezone)<input type="datetime-local" name="interview_at" defaultValue={localDateTime(interview.interview_at)}/></label>
   <label>Job description<textarea name="job_description" required minLength={20} maxLength={60000} rows={6} defaultValue={interview.job_description??''}/></label>
   <label>Recruiter instructions (optional)<textarea name="recruiter_instructions" maxLength={12000} rows={3} defaultValue={interview.recruiter_instructions??''}/></label>
   <p className="edit-interview-hint">Your saved practice and mock interview history will be preserved. If you change the role or job description, regenerate AI questions to use the new details.</p>
   {error&&<p role="alert">{error}</p>}
   <div className="edit-interview-actions"><button type="submit" disabled={busy}>{busy?'Saving…':'Save changes'}</button><button type="button" disabled={busy} onClick={()=>setOpen(false)}>Cancel</button></div>
  </form>}
 </div>;
}
