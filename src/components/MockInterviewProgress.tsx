'use client';
import {useMemo,useState} from 'react';

type Interview={id:string;company_name:string;role_title:string};
type Session={id:string;interview_id:string;status:string;started_at:string;assessment:{score?:number}|null};
export function MockInterviewProgress({sessions,interviews}:{sessions:Session[];interviews:Interview[]}){
 const [filter,setFilter]=useState('all');
 const rows=useMemo(()=>sessions.filter(s=>s.status==='completed'&&(filter==='all'||s.interview_id===filter))
  .filter(s=>Number.isFinite(s.assessment?.score)&&Number(s.assessment?.score)>=1&&Number(s.assessment?.score)<=10)
  .sort((a,b)=>new Date(a.started_at).getTime()-new Date(b.started_at).getTime()),[sessions,filter]);
 const count=rows.length;
 const avg=count?(rows.reduce((sum,s)=>sum+Number(s.assessment?.score),0)/count).toFixed(1):'—';
 const latest=count?Number(rows[count-1].assessment?.score):null;
 const first=count?Number(rows[0].assessment?.score):null;
 const delta=count>1&&latest!==null&&first!==null?latest-first:null;
 const recent=rows.slice(-20);
 const grouped=interviews.map(i=>{
  const group=rows.filter(s=>s.interview_id===i.id);
  return {...i,count:group.length,average:group.length?(group.reduce((sum,s)=>sum+Number(s.assessment?.score),0)/group.length).toFixed(1):'—',latest:group.length?Number(group[group.length-1].assessment?.score):null};
 }).filter(i=>i.count>0);
 return <section className="mock-progress surface" aria-label="Mock interview progress dashboard">
  <h2>Mock Interview Progress</h2>
  <p style={{fontSize:13,color:'#526681'}}>Track your completed mock interview assessments. Scores are AI estimates, not official interview results.</p>
  <label htmlFor="mock-progress-filter"><b>Interview: </b></label>
  <select id="mock-progress-filter" value={filter} onChange={e=>setFilter(e.target.value)}>
   <option value="all">All interviews</option>
   {interviews.map(i=><option key={i.id} value={i.id}>{i.company_name} — {i.role_title}</option>)}
  </select>
  <div className="mock-progress-metrics">
   {[
    ['Completed mocks',String(count)],
    ['Average score',count?avg+'/10':'—'],
    ['Latest score',latest===null?'—':latest+'/10'],
    ['First-to-latest change',delta===null?'—':(delta>0?'+':'')+delta+' pts']
   ].map(([label,value])=><div key={label} className="mock-progress-metric"><div>{label}</div><strong>{value}</strong></div>)}
  </div>
  {count===0?<p>No completed mock interviews with scores yet.</p>:<>
   <h3>Recent score trend</h3>
   <div role="img" aria-label={`Mock interview scores over time, oldest to newest: ${recent.map(s=>s.assessment?.score).join(', ')} out of 10`} className="mock-progress-chart">
    {recent.map((s,i)=><div key={s.id} title={`Mock interview ${rows.length-recent.length+i+1}: ${s.assessment?.score}/10 · ${new Date(s.started_at).toLocaleString()}`} className="mock-progress-bar" style={{height:`${Number(s.assessment?.score)*10}%`,background:i===recent.length-1?'#315fa8':'#a9c4e9'}}>
     <span>{s.assessment?.score}</span>
    </div>)}
   </div>
   <p style={{fontSize:12,color:'#526681'}}>Oldest → newest · last {recent.length} completed mock interviews · scores out of 10.</p>
   {filter==='all'&&grouped.length>0&&<>
    <h3>Progress by interview</h3>
    <div style={{overflowX:'auto'}}><table>
     <thead><tr><th scope="col">Interview</th><th scope="col">Completed</th><th scope="col">Average</th><th scope="col">Latest</th></tr></thead>
     <tbody>{grouped.map(i=><tr key={i.id}><td>{i.company_name} — {i.role_title}</td><td>{i.count}</td><td>{i.average}/10</td><td>{i.latest}/10</td></tr>)}</tbody>
    </table></div>
   </>}
  </>}
  <p style={{fontSize:12,color:'#526681'}}>Refresh the dashboard after finishing a mock interview to update these statistics.</p>
 </section>;
}
