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
 useEffect(()=>{
  function receive(){
   const raw=sessionStorage.getItem('interview-breakthrough-extension-import');
   if(!raw)return;
   sessionStorage.removeItem('interview-breakthrough-extension-import');
   try{
    const data=JSON.parse(raw);
    if(typeof data.description!=='string'||data.description.trim().length<20||data.description.length>60000)return;
    if(typeof data.url!=='string'||!data.url.startsWith('https://'))return;
    setDescription(data.description);
    setJobUrl(data.url.slice(0,2048));
    setShowPaste(true);
    setImportMessage('Job description received from extension. Extract company and role, then review before saving.');
   }catch{}
  }
  receive();
  window.addEventListener('interview-breakthrough-extension-import',receive);
  return ()=>window.removeEventListener('interview-breakthrough-extension-import',receive);
 },[]);

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
   <details className="extension-install-guide">
    <summary>Import from LinkedIn or HiringCafe with Chrome extension</summary>
    <p>One-time setup required.</p>
    
    <ol>
     <li><a href="https://github.com/ritusharma0212/interview-buddy/archive/refs/heads/feature/chrome-extension-job-import.zip" target="_blank" rel="noopener noreferrer">Download the extension ZIP</a> and unzip it.</li>
     <li>Open <code>chrome://extensions</code>, enable Developer mode, and click Load unpacked.</li>
     <li>Select the <code>extension</code> folder in the download.</li>
     <li>Open a LinkedIn or HiringCafe job and click the extension to import.</li>
    </ol>
    
   </details>
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
