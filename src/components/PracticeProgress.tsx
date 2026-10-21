'use client';
import {useMemo,useState} from 'react';

type Attempt={id:string;interview_id:string;question_set_id:string;question_index:number;created_at:string;feedback:{score:number}};
type Interview={id:string;company_name:string;role_title:string};
export function PracticeProgress({attempts,interviews}:{attempts:Attempt[];interviews:Interview[]}){
 const [filter,setFilter]=useState('all');
 const rows=useMemo(()=>attempts.filter(a=>filter==='all'||a.interview_id===filter)
  .filter(a=>Number.isFinite(a.feedback?.score)&&a.feedback.score>=1&&a.feedback.score<=10)
  .sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime()),[attempts,filter]);
 const total=rows.length;
 const average=total?(rows.reduce((sum,a)=>sum+a.feedback.score,0)/total).toFixed(1):'—';
 const latest=total?rows[total-1].feedback.score:null;
 const first=total?rows[0].feedback.score:null;
 const delta=latest!==null&&first!==null&&total>1?latest-first:null;
 const recent=rows.slice(-20);
 const grouped=interviews.map(i=>{
  const r=rows.filter(a=>a.interview_id===i.id);
  return {...i,count:r.length,average:r.length?(r.reduce((s,a)=>s+a.feedback.score,0)/r.length).toFixed(1):'—',latest:r.length?r[r.length-1].feedback.score:null};
 }).filter(i=>i.count>0);
 return <section aria-label="Practice progress dashboard" style={{padding:16,margin:0,border:'1px solid #d0d5dd',borderRadius:10,background:'#f8fafc'}}>
  <label htmlFor="progress-filter"><b>Interview: </b></label>
  <select id="progress-filter" value={filter} onChange={e=>setFilter(e.target.value)} style={{maxWidth:'100%',padding:6}}>
   <option value="all">All interviews</option>
   {interviews.map(i=><option key={i.id} value={i.id}>{i.company_name} — {i.role_title}</option>)}
  </select>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginTop:14}}>
   {[
    ['Practice attempts',String(total)],
    ['Average score',total?average+'/10':'—'],
    ['Latest score',latest===null?'—':latest+'/10'],
    ['First-to-latest change',delta===null?'—':(delta>0?'+':'')+delta+' pts']
   ].map(([label,value])=><div key={label} style={{padding:12,border:'1px solid #e0e4e9',background:'var(--surface)',borderRadius:8}}>
    <div style={{fontSize:12,color:'var(--muted)'}}>{label}</div><div style={{fontSize:24,fontWeight:700}}>{value}</div>
   </div>)}
  </div>
  {total===0?<p>No scored practice attempts yet. Answer an interview question and click Get AI feedback to start tracking your progress.</p>:<>
   <h3>Recent score trend</h3>
   <div role="img" aria-label={`Scores over time, oldest to newest: ${recent.map(a=>a.feedback.score).join(', ')} out of 10`} style={{display:'flex',alignItems:'flex-end',gap:5,height:155,padding:'10px 8px 0',borderBottom:'1px solid #98a2b3',background:'var(--surface)',overflowX:'auto'}}>
    {recent.map((a,i)=><div key={a.id} title={`Attempt ${rows.length-recent.length+i+1}: ${a.feedback.score}/10 · ${new Date(a.created_at).toLocaleString()}`} style={{flex:'1 0 14px',maxWidth:45,minWidth:14,height:`${a.feedback.score*10}%`,background:'#2563eb',borderRadius:'4px 4px 0 0',position:'relative'}}>
     <span style={{position:'absolute',top:-19,left:0,right:0,textAlign:'center',fontSize:11,color:'var(--ink)'}}>{a.feedback.score}</span>
    </div>)}
   </div>
   <p style={{fontSize:12,color:'#475467'}}>Oldest → newest · last {recent.length} attempts · scores out of 10. Scores across different questions may not be directly comparable.</p>
   {filter==='all'&&grouped.length>0&&<>
    <h3>Progress by interview</h3>
    <div style={{overflowX:'auto'}}>
     <table style={{width:'100%',borderCollapse:'collapse',textAlign:'left'}}>
      <thead><tr><th scope="col">Interview</th><th scope="col">Attempts</th><th scope="col">Average</th><th scope="col">Latest</th></tr></thead>
      <tbody>{grouped.map(i=><tr key={i.id} style={{borderTop:'1px solid #ddd'}}>
       <td style={{padding:'8px 4px'}}>{i.company_name} — {i.role_title}</td>
       <td>{i.count}</td><td>{i.average}/10</td><td>{i.latest}/10</td>
      </tr>)}</tbody>
     </table>
    </div>
   </>}
  </>}
  <p style={{fontSize:12,color:'#475467'}}>Showing up to 500 most recent saved attempts. Refresh the dashboard after submitting an answer to update these statistics.</p>
 </section>;
}
