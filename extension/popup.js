const button=document.getElementById('import'),status=document.getElementById('status'),input=document.getElementById('url');
chrome.storage.local.get('appUrl').then(v=>{if(v.appUrl)input.value=v.appUrl});
button.addEventListener('click',async()=>{
 button.disabled=true;status.textContent='Reading job description…';
 try{
  const app=new URL(input.value.trim());
  if(app.protocol!=='https:'||!(app.hostname==='interview-breakthrough.vercel.app'||app.hostname.endsWith('.vercel.app')))throw Error('Enter the Interview Breakthrough Vercel URL.');
  const allowed=await chrome.permissions.request({origins:[app.origin+'/*']});
  if(!allowed)throw Error('App access was not approved.');
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab?.id||!/^https?:/.test(tab.url||''))throw Error('Open a job posting first.');
  const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>{
   let description=String(window.getSelection()||'').trim();
   for(const selector of ['.jobs-description__content','.jobs-box__html-content','.jobs-description-content__text','.show-more-less-html__markup','[data-testid="job-description"]','[class*="job-description"]']){
    if(description.length>=20)break;
    const el=document.querySelector(selector);if(el?.innerText?.trim().length>=20)description=el.innerText.trim();
   }
   return {description:description.slice(0,60000),url:location.href};
  }});
  const job=result[0]?.result;
  if(!job||job.description.length<20)throw Error('Select the job description on the page and try again.');
  if(!confirm('Send '+job.description.length+' characters of job text to Interview Breakthrough?')){status.textContent='Cancelled.';return}
  await chrome.storage.local.set({appUrl:app.origin});
  status.textContent='Transferring job to Interview Breakthrough…';
  const response=await chrome.runtime.sendMessage({type:'IMPORT_JOB',origin:app.origin,job});
  if(!response?.ok)throw Error(response?.error||'Transfer failed.');
  status.textContent='Transferred. Review the new tab.';
 }catch(e){status.textContent=e.message||'Import failed.'}
 finally{button.disabled=false}
});