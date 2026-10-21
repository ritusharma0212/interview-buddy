'use client';
import {useEffect,useState} from 'react';

const steps=[
 {title:'Start with your interview details',description:'Add the company, job title, interview round and job description so Interview Buddy can tailor your preparation.',target:'add-interview',action:'Add interview'},
 {title:'Personalize your answers',description:'Set up My Profile with your resume, LinkedIn details or work experience. This helps the AI suggest stronger answers based on your real achievements.',target:'profile',action:'Go to My Profile'},
 {title:'When to use Question Practice',description:'Practice one question at a time, improve your stories and get targeted AI feedback. Use this when preparing and refining specific answers.',target:'practice',action:'Go to Question Practice'},
 {title:'When to use Mock Interview',description:'Rehearse a realistic interview conversation and review overall feedback. Use this when you are ready to practice the full experience.',target:'mock',action:'Go to Mock Interview'}
] as const;

export function GuidedTour({userId,onNavigate}:{userId:string;onNavigate:(target:string)=>void}){
 const key='interview-buddy-onboarding-v1:'+userId;
 const [step,setStep]=useState<number|null>(null);
 const [position,setPosition]=useState<{top:number;left:number;width:number;height:number}|null>(null);
 useEffect(()=>{try{if(localStorage.getItem(key)!=='done')setStep(0)}catch{setStep(0)}},[key]);
 const current=step===null?null:steps[step];
 useEffect(()=>{
  if(!current)return;
  function update(){const el=document.querySelector('[data-tour="'+current!.target+'"]');if(!el){setPosition(null);return}const r=el.getBoundingClientRect();setPosition({top:r.top,left:r.left,width:r.width,height:r.height})}
  update();window.addEventListener('resize',update);window.addEventListener('scroll',update,true);
  return()=>{window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true)};
 },[current]);
 function close(){try{localStorage.setItem(key,'done')}catch{}setStep(null);setPosition(null)}
 function next(){if(step===null)return;if(step===steps.length-1)close();else setStep(step+1)}
 if(step===null||!current)return null;
 return <div className="tour-backdrop" role="dialog" aria-modal="true" aria-label="Welcome to Interview Buddy" onKeyDown={e=>{if(e.key==='Escape')close()}}>
  <div className="tour-shade" aria-hidden="true"/>
  {position&&<div className="tour-highlight" aria-hidden="true" style={{top:position.top-5,left:position.left-5,width:position.width+10,height:position.height+10}}/>}
  <div className="tour-card">
   <div className="tour-count">GETTING STARTED · {step+1} OF {steps.length}</div>
   <h2>{current.title}</h2><p>{current.description}</p>
   <div className="tour-actions">
    <button type="button" className="tour-skip" onClick={close}>Skip tour</button>
    <button type="button" className="tour-go" onClick={()=>{onNavigate(current.target);next()}}>{current.action}</button>
    <button type="button" className="tour-next" onClick={next}>{step===steps.length-1?'Finish':'Next →'}</button>
   </div>
  </div>
 </div>;
}
