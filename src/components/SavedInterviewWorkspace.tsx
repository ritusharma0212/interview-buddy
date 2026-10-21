'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {InterviewQuestions} from '@/components/InterviewQuestions';
import {EditInterview} from '@/components/EditInterview';
import {seniorityLabel} from '@/lib/target-seniority';

type Interview={id:string;company_name:string;role_title:string;interview_stage:string;interview_at:string|null;target_seniority?:string;job_description?:string|null;recruiter_instructions?:string|null};

function InterviewDate({timestamp}:{timestamp:string|null}){
 const [formatted,setFormatted]=useState<string|null>(null);
 useEffect(()=>{
  if(!timestamp){setFormatted(null);return}
  const date=new Date(timestamp);
  if(Number.isNaN(date.getTime())){setFormatted(null);return}
  setFormatted(new Intl.DateTimeFormat(undefined,{
   weekday:'long',year:'numeric',month:'long',day:'numeric',
   hour:'numeric',minute:'2-digit',second:'2-digit',timeZoneName:'long'
  }).format(date));
 },[timestamp]);
 if(!timestamp)return <span>Not scheduled</span>;
 return <span><time dateTime={timestamp}>{formatted??timestamp}</time></span>;
}

export function SavedInterviewWorkspace({interview,status='Not started'}:{interview:Interview;status?:'Not started'|'In progress'|'Complete'}){
 const router=useRouter();
 const [deleting,setDeleting]=useState(false);
 const [deleteError,setDeleteError]=useState('');
 async function deleteInterview(){
  if(!window.confirm('Permanently delete '+interview.company_name+' — '+interview.role_title+'? This also deletes its generated questions, practice answers, feedback and mock interview history. This cannot be undone.'))return;
  setDeleting(true);setDeleteError('');
  try{const response=await fetch('/api/interviews/'+interview.id,{method:'DELETE'});const result=await response.json();if(!response.ok)throw Error(result.error||'Delete failed');router.refresh();}
  catch(error){setDeleteError(error instanceof Error?error.message:'Could not delete interview');setDeleting(false)}
 }
 return <details className="saved-interview-card" style={{border:'1px solid var(--line)',borderRadius:8,padding:14,margin:'10px 0',background:'var(--surface)'}}>
  <summary style={{cursor:'pointer',lineHeight:1.6}}>
   <strong>{interview.company_name} — {interview.role_title}</strong>
   <span className="interview-summary-meta"><span className="interview-stage-pill">{interview.interview_stage}</span> <span className="interview-date-meta"><InterviewDate timestamp={interview.interview_at}/></span> <span className="seniority-pill">{seniorityLabel(interview.target_seniority??'Auto-detect from role',interview.role_title).label} · {seniorityLabel(interview.target_seniority??'Auto-detect from role',interview.role_title).source==='inferred'?'Inferred':seniorityLabel(interview.target_seniority??'Auto-detect from role',interview.role_title).source==='selected'?'Selected':'Auto'}</span> <span className={`interview-status interview-status-${status.toLowerCase().replace(' ','-')}`}>{status}</span>
   </span>
  </summary>
  <div style={{marginTop:14,borderTop:'1px solid #e5e7eb',paddingTop:12}}>

   <InterviewQuestions interviewId={interview.id}/>
   <div className="interview-delete-actions"><EditInterview interview={interview}/><button type="button" className="interview-delete-button" disabled={deleting} onClick={deleteInterview}>{deleting?'Deleting…':'Delete interview'}</button>{deleteError&&<span role="alert">{deleteError}</span>}</div>
  </div>
 </details>;
}
