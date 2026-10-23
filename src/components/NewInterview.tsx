'use client';
import {useState} from 'react';
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
 async function importJob(){
  setImporting(true);setImportMessage('');setError('');
  try{
   const response=await fetch('/api/interviews/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:jobUrl})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||'Could not import the posting.');
   setCompany(data.company_name);setTitle(data.role_title);setDescription(data.job_description);
   setImportMessage('Job details imported. Review and edit them before saving.');
  }catch(e){setImportMessage(e instanceof Error?e.message:'Could not import the posting. Please enter details manually.')}
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
  <div className="job-import"><label htmlFor="job-posting-url">Job posting URL (any public careers site)</label>
   <div className="job-import-row"><input id="job-posting-url" type="url" value={jobUrl} onChange={e=>setJobUrl(e.target.value)} placeholder="https://company.com/careers/job/..." aria-describedby="job-import-note"/><button type="button" disabled={importing||!jobUrl.trim()} onClick={()=>void importJob()}>{importing?'Importing…':'Import job details'}</button></div>
   <p id="job-import-note">We’ll try to fill in the company, job title, and description from a public job posting. You can also enter everything manually.</p>
   {importMessage&&<p role="status" className="job-import-message">{importMessage}</p>}
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
   <button disabled={busy||importing}>{busy?'Saving…':'Save interview'}</button>
   {error&&<p role="alert">{error}</p>}
  </form>
 </div>
}
