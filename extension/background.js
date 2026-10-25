chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
 if(message?.type!=='IMPORT_JOB')return;
 (async()=>{
  const {job,origin}=message;
  if(typeof origin!=='string'||!/^https:\/\/[-a-z0-9.]+\.vercel\.app$/.test(origin))throw Error('Invalid preview URL');
  if(typeof job?.description!=='string'||job.description.length<20||job.description.length>60000)throw Error('Invalid description');
  if(typeof job.url!=='string'||!job.url.startsWith('https://'))throw Error('Invalid source URL');
  const key='interview-breakthrough-extension-import';
  const destination=await chrome.tabs.create({url:origin+'/dashboard?import=extension'});
  // The background worker remains active after the popup closes. Retry until the app is ready.
  for(let attempt=0;attempt<30;attempt++){
   await new Promise(resolve=>setTimeout(resolve,700));
   try{
    const result=await chrome.scripting.executeScript({target:{tabId:destination.id},world:'MAIN',func:(data,k)=>{
     if(location.pathname!=='/dashboard'||!document.querySelector('.new-interview'))return false;
     sessionStorage.setItem(k,JSON.stringify(data));
     window.dispatchEvent(new Event('interview-breakthrough-extension-import'));
     return true;
    },args:[job,key]});
    if(result?.[0]?.result)return;
   }catch{}
  }
  throw Error('App did not become ready. Keep the new tab open and retry.');
 })().then(()=>sendResponse({ok:true}),error=>sendResponse({ok:false,error:String(error.message||error)}));
 return true;
});