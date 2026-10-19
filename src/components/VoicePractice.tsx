'use client';
import {useEffect,useRef,useState} from 'react';

type SpeechResult={isFinal:boolean;0:{transcript:string}};
type SpeechEvent={resultIndex:number;results:ArrayLike<SpeechResult>};
type SpeechRecognitionLike={
 continuous:boolean;interimResults:boolean;lang:string;
 onresult:((event:SpeechEvent)=>void)|null;
 onerror:((event:{error:string})=>void)|null;
 onend:(()=>void)|null;
 start:()=>void;stop:()=>void;abort:()=>void;
};
type SpeechWindow=Window&{
 SpeechRecognition?:new()=>SpeechRecognitionLike;
 webkitSpeechRecognition?:new()=>SpeechRecognitionLike;
};

export function VoicePractice({value,onChange}:{value:string;onChange:(text:string)=>void}){
 const recognition=useRef<SpeechRecognitionLike|null>(null);
 const [supported,setSupported]=useState<boolean|null>(null);
 const [listening,setListening]=useState(false);
 const [interim,setInterim]=useState('');
 const [seconds,setSeconds]=useState(0);
 const [error,setError]=useState('');
 const finalText=useRef('');
 const latestValue=useRef(value);
 latestValue.current=value;
 useEffect(()=>{
  const browser=window as SpeechWindow;
  setSupported(Boolean(browser.SpeechRecognition||browser.webkitSpeechRecognition));
  return ()=>{recognition.current?.abort();recognition.current=null};
 },[]);
 useEffect(()=>{
  if(!listening)return;
  const timer=window.setInterval(()=>setSeconds(s=>s+1),1000);
  return ()=>window.clearInterval(timer);
 },[listening]);
 function start(){
  const browser=window as SpeechWindow;
  const SpeechRecognition=browser.SpeechRecognition||browser.webkitSpeechRecognition;
  if(!SpeechRecognition){setError('Speech recognition is unavailable in this browser. Try Chrome on a desktop computer.');return}
  setError('');setInterim('');finalText.current=latestValue.current.trim();
  const session=new SpeechRecognition();
  session.lang='en-US';session.continuous=true;session.interimResults=true;
  session.onresult=(event)=>{
   let partial='';
   for(let i=event.resultIndex;i<event.results.length;i++){
    const result=event.results[i];
    if(result.isFinal){
     const phrase=result[0].transcript.trim();
     if(phrase)finalText.current=(finalText.current+' '+phrase).trim();
    }else{partial+=result[0].transcript}
   }
   onChange(finalText.current);setInterim(partial);
  };
  session.onerror=(event)=>{
   const messages:Record<string,string>={
    'not-allowed':'Microphone access was denied. Allow microphone access in your browser and try again.',
    'audio-capture':'No microphone was detected. Check your microphone settings.',
    'network':'Speech recognition could not connect. Check your internet connection.',
    'no-speech':'No speech detected. Try speaking closer to the microphone.'
   };
   setError(messages[event.error]||'Speech recognition stopped: '+event.error);
  };
  session.onend=()=>{setListening(false);setInterim('');recognition.current=null};
  try{session.start();recognition.current=session;setListening(true)}
  catch{setError('Could not start the microphone. Check browser permissions.')}
 }
 function stop(){recognition.current?.stop();setListening(false)}
 function clear(){recognition.current?.abort();recognition.current=null;setListening(false);onChange('');setInterim('');finalText.current='';setSeconds(0);setError('')}
 const time=`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
 return <div style={{margin:'12px 0',padding:12,border:'1px solid #ccd6e0',borderRadius:8,background:'#f3f7fb'}}>
  {supported===false?<p>Voice transcription is not supported in this browser. Use Chrome on desktop, or switch to Type.</p>:<>
   <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
    <button type="button" onClick={start} disabled={listening||supported===null}>Start speaking</button>
    <span role="timer" aria-label="Speaking timer" style={{fontVariantNumeric:'tabular-nums',fontWeight:600,minWidth:46}}>{time}</span>
    <button type="button" onClick={stop} disabled={!listening}>Stop</button>
    <button type="button" onClick={clear} disabled={!value&&!interim&&!listening}>Clear</button>
   </div>
   {interim&&<p aria-live="polite" style={{color:'#667085'}}>Recognizing: {interim}</p>}
   {!listening&&value.trim().length>0&&<>
    <label htmlFor="voice-answer-transcript"><b>Review your spoken answer</b></label>
    <textarea id="voice-answer-transcript" rows={5} maxLength={12000}
     value={value} onChange={e=>onChange(e.target.value)}
     style={{display:'block',width:'100%',boxSizing:'border-box',marginTop:8}}/>
    <p style={{fontSize:12}}>Correct any transcription mistakes, then click Get AI feedback.</p>
   </>}
   {listening&&<p style={{fontSize:12}}>Speak naturally. Your transcript will be available to review after you stop.</p>}
  </>}
  {error&&<p role="alert" style={{color:'crimson'}}>{error}</p>}
  <p style={{fontSize:12,marginBottom:0}}>Your browser performs speech recognition; depending on the browser, audio may be processed by its speech service. Interview Buddy does not upload or store audio recordings. Only text you submit for AI feedback is saved.</p>
 </div>;
}
