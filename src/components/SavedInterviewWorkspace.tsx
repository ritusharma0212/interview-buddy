'use client';
import {useEffect,useState} from 'react';
import {InterviewQuestions} from '@/components/InterviewQuestions';

type Interview={id:string;company_name:string;role_title:string;interview_stage:string;interview_at:string|null};

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
 return <details style={{border:'1px solid #ddd',borderRadius:8,padding:14,margin:'10px 0',background:'white'}}>
  <summary style={{cursor:'pointer',lineHeight:1.6}}>
   <strong>{interview.company_name} — {interview.role_title}</strong>
   <span style={{display:'block',marginLeft:18,fontSize:14}}>
    {interview.interview_stage} · <InterviewDate timestamp={interview.interview_at}/> <span className={`interview-status interview-status-${status.toLowerCase().replace(' ','-')}`}>{status}</span>
   </span>
  </summary>
  <div style={{marginTop:14,borderTop:'1px solid #e5e7eb',paddingTop:12}}>
   <InterviewQuestions interviewId={interview.id}/>
  </div>
 </details>;
}
