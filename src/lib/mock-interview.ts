import {createClient} from '@supabase/supabase-js';
import {serverSupabase} from '@/lib/supabase/server';
import {NextResponse} from 'next/server';

export const MOCK_DURATION_MS=30*60*1000;
export async function mockContext(interviewId:string){
 const db=await serverSupabase();
 const {data:{user}}=await db.auth.getUser();
 if(!user)return {error:NextResponse.json({error:'Please sign in'},{status:401})};
 const {data:interview}=await db.from('interviews')
  .select('id,company_name,role_title,interview_stage,job_description,recruiter_instructions')
  .eq('id',interviewId).eq('user_id',user.id).maybeSingle();
 if(!interview)return {error:NextResponse.json({error:'Interview not found'},{status:404})};
 const {data:entitlement}=await db.from('user_entitlements').select('plan').eq('user_id',user.id).maybeSingle();
 if(entitlement?.plan!=='pro')return {error:NextResponse.json({error:'Mock Interview requires an active PRO plan.'},{status:403})};
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY)return {error:NextResponse.json({error:'Mock Interview storage is not configured.'},{status:503})};
 const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:false,persistSession:false}});
 return {user,interview,admin};
}
export type Turn={role:'interviewer'|'candidate';text:string};
export async function askGemini(instruction:string,content:unknown){
 const key=process.env.GEMINI_API_KEY;
 if(!key)throw Error('Gemini API key is missing');
 const model=process.env.GEMINI_MODEL||'gemini-3.5-flash-lite';
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),45000);
 try{
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
   method:'POST',signal:controller.signal,
   headers:{'x-goog-api-key':key,'Content-Type':'application/json'},
   body:JSON.stringify({systemInstruction:{parts:[{text:instruction}]},
    contents:[{role:'user',parts:[{text:JSON.stringify(content)}]}],
    generationConfig:{temperature:0.5,responseMimeType:'application/json'}})
  });
  if(!res.ok){console.error('Mock Gemini failure',res.status);throw Error(res.status===429?'Gemini quota reached. Please try later.':'Gemini request failed. Please retry.')}
  const body=await res.json();
  return JSON.parse((body.candidates?.[0]?.content?.parts??[]).map((p:{text?:string})=>p.text??'').join(''));
 }finally{clearTimeout(timeout)}
}
