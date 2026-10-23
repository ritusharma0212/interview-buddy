'use client';
import {useEffect,useRef,useState} from 'react';

export function InterviewerVoice({question,enabled}:{question:string;enabled:boolean}){
 const [supported,setSupported]=useState(false);
 const [autoSpeak,setAutoSpeak]=useState(false);
 const [speaking,setSpeaking]=useState(false);
 const lastSpoken=useRef('');
 const autoRef=useRef(false);
 const speakRef=useRef<(text:string)=>void>(()=>{});
 useEffect(()=>{
  setSupported(typeof window!=='undefined'&&'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window);
  return ()=>{if('speechSynthesis' in window)window.speechSynthesis.cancel()};
 },[]);
 function speak(text:string){
  if(!supported||!enabled)return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang='en-US';utterance.rate=0.95;
  utterance.onstart=()=>setSpeaking(true);
  utterance.onend=()=>setSpeaking(false);
  utterance.onerror=()=>setSpeaking(false);
  lastSpoken.current=text;
  window.speechSynthesis.speak(utterance);
 }
 speakRef.current=speak;
 useEffect(()=>{
  if(!enabled){if(supported)window.speechSynthesis.cancel();setSpeaking(false);return}
  if(autoRef.current&&supported&&question&&lastSpoken.current!==question)speakRef.current(question);
 },[question,enabled,supported]);
 function toggleAuto(){
  if(autoSpeak){
   setAutoSpeak(false);autoRef.current=false;window.speechSynthesis.cancel();setSpeaking(false);
  }else{
   setAutoSpeak(true);autoRef.current=true;speak(question);
  }
 }
 if(!supported)return <p style={{fontSize:12,color:'#475569'}}>Spoken questions are not supported in this browser. You can still read the questions.</p>;
 return <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',margin:'10px 0'}}>
  <button type="button" onClick={toggleAuto} disabled={!enabled}>{autoSpeak?'Turn off auto-read':'Enable spoken questions'}</button>
  <button type="button" onClick={()=>{if(speaking){window.speechSynthesis.cancel();setSpeaking(false)}else{speak(question)}}} disabled={!enabled||!question}>{speaking?'Stop replay':'Replay question'}</button>
  <span style={{fontSize:12,color:'#475569'}}>{speaking?'Interviewer speaking…':autoSpeak?'New questions will be read aloud':'Audio is off'}</span>
 </div>;
}
