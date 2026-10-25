'use client';
import {useEffect,useState} from 'react';
import {TARGET_SENIORITIES} from '@/lib/target-seniority';
export function NewInterview(){
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [importing,setImporting]=useState(false);
 const [jobUrl,setJobUrl]=useState('');
 const [importMessage,setImportMessage]=useState('');
 const [company,setCompany]=useState('');
 const [title,setTitle]=useState('');
 const [description,setDescription]=useState('');
 const [showPaste,setShowPaste]=useState(false);
 const [extracting,setExtracting]=useState(false);
 const [extractMessage,setExtractMessage]=useState('');
 const [bookmarkletMessage,setBookmarkletMessage]=useState('');
 useEffect(()=>{
  function hydrate(){
   const raw=sessionStorage.getItem('interview-breakthrough-job-import');
   if(!raw)return;
   sessionStorage.removeItem('interview-breakthrough-job-import');
   try{
    const item=JSON.parse(raw);
    if(typeof item.description!=='string'||item.description.length<20)return;
    setDescription(item.description.slice(0,60000));
    setShowPaste(true);
    if(typeof item.url==='string')setJobUrl(item.url);
    setImportMessage('Job text received. Extract company and role, then review before saving.');
   }catch{}
  }
  hydrate();
  window.addEventListener('interview-breakthrough-import',hydrate);
  return ()=>window.removeEventListener('interview-breakthrough-import',hydrate);
 },[]);
 async function copyBookmarklet(){
  const origin=window.location.origin;
  const script=`javascript:(function(){var origin=${JSON.stringify(origin)};var url=location.href;var text=String(window.getSelection()||'').trim();var selectors=['.jobs-description__content','.jobs-box__html-content','.jobs-description-content__text','.show-more-less-html__markup','[data-testid="job-description"]','[class*="job-description"]'];for(var i=0;!text&&i<selectors.length;i++){var el=document.querySelector(selectors[i]);if(el&&el.innerText&&el.innerText.trim().length>=20)text=el.innerText.trim()}if(!text){alert('Select the job description on this page and try again.');return}text=text.slice(0,60000);if(!confirm('Share '+text.length+' characters of job text with Interview Breakthrough?'))return;var popup=window.open(origin+'/dashboard?import=bookmarklet','_blank');if(!popup){alert('Allow pop-ups for this site and try again.');return}function receive(e){if(e.source!==popup||e.origin!==origin||!e.data||e.data.type!=='INTERVIEW_BREAKTHROUGH_READY')return;window.removeEventListener('message',receive);popup.postMessage({type:'INTERVIEW_BREAKTHROUGH_JOB',description:text,url:url},origin)}window.addEventListener('message',receive);setTimeout(function(){window.removeEventListener('message',receive)},60000)})();`;
  try{await navigator.clipboard.writeText(script);setBookmarkletMessage('Copied! Create a bookmark and paste the code into its URL field. Then click it while viewing a job posting.');}
  catch{setBookmarkletMessage('Could not copy. Allow clipboard access and try again.')}
 }
 async function extractPasted(){
  setExtracting(true);setExtractMessage('');
  try{
   const response=await fetch('/api/interviews/extract',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({job_description:description})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||'Could not extract details.');
   if(data.company_name)setCompany(data.company_name);
   if(data.role_title)setTitle(data.role_title);
   setExtractMessage(data.company_name&&data.role_title?'Company and role extracted. Review before saving.':'Some details were not found. Enter any missing fields manually.');
  }catch(e){setExtractMessage(e instanceof Error?e.message:'Could not extract details. Enter them manually.')}
  finally{setExtracting(false)}
 }
 async function importJob(){
  setImporting(true);setImportMessage('');setError('');
  try{
   const response=await fetch('/api/interviews/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:jobUrl})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||'Could not import the posting.');
   setCompany(data.company_name);setTitle(data.role_title);setDescription(data.job_description);setShowPaste(false);
   setImportMessage('Job details imported. Review and edit them before saving.');
  }catch(e){setShowPaste(true);setImportMessage(e instanceof Error?e.message:'Could not import the posting. Paste the job description below.')}
  finally{setImporting(false)}
 }
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError('');
  try{
   const form=new FormData(e.currentTarget);const payload=Object.fromEntries(form.entries());
   const res=await fetch('/api/interviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   if(!res.ok)throw new Error((await res.json()).error||'Could not save interview');
   const created=await res.json();
   try{sessionStorage.setItem('interview-buddy-new-interview',created.id)}catch{}
   window.location.reload();
  }catch(e){setError(e instanceof Error?e.message:'Could not save interview');setBusy(false)}
 }
 return <div className="new-interview">
  <div className="job-import">
   <p><strong>Import from LinkedIn or HiringCafe</strong></p>
   <button type="button" onClick={()=>void copyBookmarklet()}>Copy job import bookmarklet</button>
   <p>Create a browser bookmark named “Send to Interview Breakthrough” and paste the copied code into its URL field. On a job posting, select its description if needed and click the bookmark. You will approve what is shared.</p>
   {bookmarkletMessage&&<p role="status">{bookmarkletMessage}</p>}
   <label htmlFor="job-posting-url">Job posting URL (any public careers site)</label>
   <div className="job-import-row"><input id="job-posting-url" type="url" value={jobUrl} onChange={e=>setJobUrl(e.target.value)} placeholder="https://company.com/careers/job/..." aria-describedby="job-import-note"/><button type="button" disabled={importing||!jobUrl.trim()} onClick={()=>void importJob()}>{importing?'Importing…':'Import job details'}</button></div>
   <p id="job-import-note">We’ll try to fill in the company, job title, and description from a public job posting. You can also enter everything manually.</p>
   {importMessage&&<p role="status" className="job-import-message">{importMessage}</p>}
   <button type="button" onClick={()=>setShowPaste(v=>!v)}>{showPaste?'Hide paste option':'Paste job description manually'}</button>
   {showPaste&&<div className="job-import">
    <label htmlFor="pasted-job-description">Paste the complete job description</label>
    <textarea id="pasted-job-description" rows={8} maxLength={60000} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Paste the job description here…"/>
    <button type="button" disabled={extracting||description.trim().length<20} onClick={()=>void extractPasted()}>{extracting?'Extracting…':'Extract company & role'}</button>
    {extractMessage&&<p role="status">{extractMessage}</p>}
   </div>}
  </div>
  <form onSubmit={submit} style={{display:'grid',gap:10,maxWidth:650}}>
   <h2>Add an interview</h2>
   <input name="company_name" placeholder="Company" required minLength={2} maxLength={160} value={company} onChange={e=>setCompany(e.target.value)}/>
   <input name="role_title" placeholder="Role title" required minLength={2} maxLength={200} value={title} onChange={e=>setTitle(e.target.value)}/>
   <label>Target seniority<select name="target_seniority" defaultValue="Auto-detect from role">{TARGET_SENIORITIES.map(level=><option key={level} value={level}>{level}</option>)}</select></label>
   <select name="interview_stage" aria-label="Interview type"><option>Recruiter screen</option><option>Hiring manager</option><option>Product sense</option><option>Product execution</option><option>Product strategy</option><option>Behavioral</option><option>Other</option></select>
   <textarea name="job_description" placeholder="Paste the actual job description" required minLength={20} maxLength={60000} rows={6} value={description} onChange={e=>setDescription(e.target.value)}/>
   <textarea name="recruiter_instructions" placeholder="Recruiter instructions (optional)" rows={3}/>
   <label>Interview date/time (optional)<input type="datetime-local" name="interview_at"/></label>
   <button disabled={busy||importing||extracting}>{busy?'Saving…':'Save interview'}</button>
   {error&&<p role="alert">{error}</p>}
  </form>
 </div>
}
