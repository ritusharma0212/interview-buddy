'use client';
import {useEffect,useRef,useState} from 'react';
export function CareerProfile(){
 const [text,setText]=useState('');
 const [url,setUrl]=useState('');
 const pdfInput=useRef<HTMLInputElement>(null);
 const [loading,setLoading]=useState(true);
 const [working,setWorking]=useState(false);
 const [message,setMessage]=useState('');
 const [saved,setSaved]=useState(false);
 useEffect(()=>{
  let live=true;
  fetch('/api/profile').then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);if(live){setText((d.profile?.profile_text??'').replace(/\\n/g,'\n'));setUrl(d.profile?.source_url??'');setSaved(Boolean(d.profile?.profile_text));}})
   .catch(e=>{if(live)setMessage(e.message||'Could not load profile')}).finally(()=>{if(live)setLoading(false)});
  return ()=>{live=false};
 },[]);
 async function importProfile(kind:'pdf'|'url',selectedFile?:File){
  setWorking(true);setMessage('');
  try{
   const form=new FormData();
   if(kind==='pdf'){if(!selectedFile)throw Error('Choose a PDF first');form.set('file',selectedFile)}
   else form.set('url',url);
   const r=await fetch('/api/profile/import',{method:'POST',body:form});
   const d=await r.json();
   if(!r.ok)throw Error(d.error||'Import failed');
   if(text.trim()&&!window.confirm('Replace the current editor text with the imported draft? Unsaved edits will be lost.'))return;
   setText(d.profile_text.replace(/\\n/g,'\n'));setSaved(false);
   setMessage('Draft imported. Review and edit the details, then click Save profile.');
  }catch(e){setMessage(e instanceof Error?e.message:'Import failed')}
  finally{setWorking(false)}
 }
 async function save(){
  setWorking(true);setMessage('');
  try{
   const r=await fetch('/api/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile_text:text,source_url:url})});
   const d=await r.json();
   if(!r.ok)throw Error(d.error||'Could not save');
   setSaved(true);setMessage('Profile saved. Future AI feedback and mock assessments can use your projects.');
  }catch(e){setMessage(e instanceof Error?e.message:'Could not save')}
  finally{setWorking(false)}
 }
 return <section className="surface career-profile">
  <h2>My Profile</h2>
  <p>Import your career background, review the draft, and save it to personalize suggested interview answers.</p>
  <div className="career-profile-import">
   <div>
    <label htmlFor="profile-pdf">LinkedIn or resume PDF</label>
    <input ref={pdfInput} id="profile-pdf" type="file" accept=".pdf,application/pdf" style={{display:'none'}} aria-label="Select resume or LinkedIn PDF" onChange={e=>{const selected=e.target.files?.[0];if(selected)void importProfile('pdf',selected);e.target.value=''}}/>
    <button type="button" onClick={()=>pdfInput.current?.click()} disabled={working||loading}>{working?'Importing…':'Choose & import PDF'}</button>
    <small>PDF only, maximum 5 MB. The PDF is processed for extraction but not stored.</small>
   </div>
   <div>
    <label htmlFor="profile-url">Personal website URL</label>
    <input id="profile-url" type="url" placeholder="https://sites.google.com/view/your-profile" value={url} onChange={e=>{setUrl(e.target.value);setSaved(false)}}/>
    <button type="button" onClick={()=>importProfile('url')} disabled={working||loading||!url.trim()}>Import website</button>
    <small>Supports public GitHub Pages and Google Sites pages. Private pages cannot be imported.</small>
   </div>
  </div>
  <label htmlFor="profile-editor">Your career profile — review and edit before saving</label>
  <textarea id="profile-editor" rows={18} maxLength={30000} value={text} onChange={e=>{setText(e.target.value);setSaved(false)}} placeholder="Summary\n\nExperience\n\nProjects and achievements\n\nSkills"/>
  <div className="career-profile-actions"><button type="button" onClick={save} disabled={working||loading}>{working?'Working…':'Save profile'}</button><span>{saved?'Saved profile':'Unsaved changes'}</span></div>
  {loading&&<p>Loading profile…</p>}
  {message&&<p role="status">{message}</p>}
  <p className="career-profile-note">Only include information you're comfortable sharing with the AI service. Verify imported achievements and metrics before saving. The profile is private to your signed-in account.</p>
 </section>;
}
