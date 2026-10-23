import {NextResponse} from 'next/server';
import {serverSupabase} from '@/lib/supabase/server';
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';

function decode(value:string){
 return value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,entity:string)=>{
  const e=entity.toLowerCase();
  if(e.startsWith('#')){const n=e[1]==='x'?parseInt(e.slice(2),16):parseInt(e.slice(1),10);return Number.isFinite(n)&&n>0&&n<=0x10ffff?String.fromCodePoint(n):''}
  return ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '} as Record<string,string>)[e]??'';
 });
}
function clean(value:string){
 return decode(value.replace(/<\s*br\s*\/?\s*>/gi,'\n').replace(/<\/(p|li|div|h[1-6])\s*>/gi,'\n').replace(/<[^>]*>/g,' ').replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n\s*\n\s*\n/g,'\n\n')).trim();
}
function extract(html:string){
 const scripts=Array.from(html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
 const candidates:unknown[]=[];
 for(const match of scripts){try{const parsed=JSON.parse(match[1]);candidates.push(parsed)}catch{}}
 function findJob(value:unknown):Record<string,unknown>|null{
  if(!value||typeof value!=='object')return null;
  if(Array.isArray(value)){for(const v of value){const found=findJob(v);if(found)return found}return null}
  const obj=value as Record<string,unknown>;
  const type=obj['@type'];
  if((typeof type==='string'&&type.toLowerCase()==='jobposting')||(Array.isArray(type)&&type.includes('JobPosting')))return obj;
  return findJob(obj['@graph']);
 }
 const job=findJob(candidates);
 if(!job)return null;
 const org=job.hiringOrganization;
 const company=typeof org==='object'&&org!==null&&!Array.isArray(org)?(org as Record<string,unknown>).name:org;
 const title=typeof job.title==='string'?clean(job.title):'';
 const companyName=typeof company==='string'?clean(company):'';
 const description=typeof job.description==='string'?clean(job.description):'';
 return {company_name:companyName.slice(0,160),role_title:title.slice(0,200),job_description:description.slice(0,60000)};
}
// Never fetch local hosts, IP literals, or domains resolving to private networks.
async function isPublicHost(host:string){
 if(!host||host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||host.endsWith('.internal')||isIP(host))return false;
 try{
  const addresses=await lookup(host,{all:true,verbatim:true});
  return addresses.length>0&&addresses.every(({address,family})=>{
   if(family===4){
    const a=address.split('.').map(Number);
    return !(a[0]===0||a[0]===10||a[0]===127||a[0]>=224||(a[0]===169&&a[1]===254)||(a[0]===172&&a[1]>=16&&a[1]<=31)||(a[0]===192&&a[1]===168)||(a[0]===100&&a[1]>=64&&a[1]<=127)||(a[0]===192&&a[1]===0)||(a[0]===198&&a[1]>=18&&a[1]<=19)||(a[0]===192&&a[1]===0&&a[2]===0));
   }
   // Globally routable IPv6 addresses generally use 2000::/3.
   // Other ranges (loopback, link-local, ULA, mapped IPv4) are rejected.
   if(family===6){
    const first=parseInt(address.split(':')[0],16);
    return Number.isFinite(first)&&first>=0x2000&&first<=0x3fff;
   }
   return false;
  });
 }catch{return false}
}
export async function POST(request:Request){
 const db=await serverSupabase();
 const {data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:'Please sign in first.'},{status:401});
 const body=await request.json().catch(()=>null);
 if(typeof body?.url!=='string'||body.url.length>2048)return NextResponse.json({error:'Enter a valid job posting URL.'},{status:400});
 let url:URL;
 try{url=new URL(body.url)}catch{return NextResponse.json({error:'Enter a valid job posting URL.'},{status:400})}
 if(url.protocol!=='https:'||url.username||url.password||url.port||!await isPublicHost(url.hostname.toLowerCase()))
  return NextResponse.json({error:'Please use a valid public HTTPS job posting URL.'},{status:400});
 try{
  const response=await fetch(url.toString(),{redirect:'manual',signal:AbortSignal.timeout(10000),headers:{'User-Agent':'Mozilla/5.0 (compatible; InterviewBuddy/1.0)','Accept':'text/html'} ,cache:'no-store'});
  if([301,302,303,307,308].includes(response.status))
   return NextResponse.json({error:'This job site redirects to another page, which could not be imported automatically. Please paste the job details manually.'},{status:422});
  if([401,403,429,999].includes(response.status))
   return NextResponse.json({error:'The job site blocked automated access or requires sign-in. Please copy the company name, job title, and job description and paste them manually.'},{status:422});
  if(!response.ok)return NextResponse.json({error:'Could not retrieve this job posting. Please paste the company name, job title, and job description manually.'},{status:422});
  if(!(response.headers.get('content-type')??'').includes('text/html'))return NextResponse.json({error:'This link did not return a job posting. Please enter the details manually.'},{status:422});
  if(Number(response.headers.get('content-length')??0)>2_000_000)return NextResponse.json({error:'The posting is too large to import. Please enter it manually.'},{status:422});
  const html=await response.text();
  if(html.length>2_000_000)return NextResponse.json({error:'The posting is too large to import. Please enter it manually.'},{status:422});
  if(/the job you are trying to apply for has been filled|this job is no longer available|job posting has expired/i.test(html))
   return NextResponse.json({error:'This job posting appears to be closed or filled. Please paste a saved copy of the job description manually.'},{status:422});
  const extracted=extract(html);
  if(!extracted||!extracted.company_name||!extracted.role_title||extracted.job_description.length<20)
   return NextResponse.json({error:'This job page did not provide readable job details. It may be restricted, expired, or use an unsupported format. Please copy and paste the company name, job title, and job description manually.'},{status:422});
  return NextResponse.json(extracted);
 }catch{return NextResponse.json({error:'Could not connect to the job site. Import may be blocked or temporarily unavailable. Please paste the company name, job title, and job description manually.'},{status:422})}
}
