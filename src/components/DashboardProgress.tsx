'use client';
import {useState} from 'react';
import {PracticeProgress} from './PracticeProgress';
import {MockInterviewProgress} from './MockInterviewProgress';
type Interview={id:string;company_name:string;role_title:string};
type Attempt={id:string;interview_id:string;question_set_id:string;question_index:number;created_at:string;feedback:{score:number}};
type Session={id:string;interview_id:string;status:string;started_at:string;assessment:{score?:number}|null};
export function DashboardProgress({attempts,interviews,sessions,practiceError,mockError}:{attempts:Attempt[];interviews:Interview[];sessions:Session[];practiceError:boolean;mockError:boolean}){
 const [selected,setSelected]=useState<'questions'|'mock'>('questions');
 return <section className="dashboard-progress">
  <div className="dashboard-progress-heading">
   <h2>Interview progress</h2>
   <div className="dashboard-progress-tabs" role="group" aria-label="Progress type">
    <button type="button" aria-pressed={selected==='questions'} onClick={()=>setSelected('questions')}>Question Practice</button>
    <button type="button" aria-pressed={selected==='mock'} onClick={()=>setSelected('mock')}>Mock Interview</button>
   </div>
  </div>
  {selected==='questions'?(practiceError?<p role="alert">Could not load practice progress.</p>:<PracticeProgress attempts={attempts} interviews={interviews}/>):(mockError?<p role="alert">Could not load mock interview progress.</p>:<MockInterviewProgress sessions={sessions} interviews={interviews}/>)}
 </section>;
}
