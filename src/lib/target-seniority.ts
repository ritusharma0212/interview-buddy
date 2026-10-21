export const TARGET_SENIORITIES=['Auto-detect from role','Senior Product Manager','Staff Product Manager','Principal Product Manager','Group Product Manager','Director of Product Management','Senior Director of Product Management','VP of Product'] as const;

export function inferredSeniority(role:string):string|null{
 const title=role.toLowerCase();
 // Specific seniority first; avoid confusing Executive Director with Director.
 if(/\b(executive director)\b/.test(title))return 'Executive Director';
 if(/\b(chief product officer|cpo)\b/.test(title))return 'Chief Product Officer';
 if(/\b(svp|senior vice president)\b/.test(title))return 'Senior VP of Product';
 if(/\b(vp|vice president)\b/.test(title))return 'VP of Product';
 if(/\b(senior director|sr\.? director)\b/.test(title))return 'Senior Director of Product Management';
 if(/\b(director|head of product)\b/.test(title))return 'Director of Product Management';
 if(/\b(group product manager|gpm)\b/.test(title))return 'Group Product Manager';
 if(/\b(principal)\b/.test(title))return 'Principal Product Manager';
 if(/\b(staff)\b/.test(title))return 'Staff Product Manager';
 if(/\b(senior|sr\.?)\b/.test(title)&&/\b(product|pm)\b/.test(title))return 'Senior Product Manager';
 if(/\b(lead)\b/.test(title)&&/\b(product|pm)\b/.test(title))return 'Lead Product Manager';
 if(/\b(product manager|product owner)\b/.test(title))return 'Product Manager';
 return null;
}
export function seniorityLabel(selected:string|undefined,role:string){
 if(selected&&selected!=='Auto-detect from role')return {label:selected,source:'selected' as const};
 const inferred=inferredSeniority(role);
 return inferred?{label:inferred,source:'inferred' as const}:{label:'Auto-detect from role',source:'unresolved' as const};
}
export function seniorityContext(selected:string|undefined,role:string){
 const level=selected&&selected!=='Auto-detect from role'?selected:(inferredSeniority(role)??role);
 return 'Target seniority: '+level+'. Tailor questions and evaluation to the target level. Director and above: emphasize portfolio strategy, executive influence, cross-team prioritization, leadership, and business outcomes. Principal and Staff: emphasize product depth, strategic influence and execution. Do not invent people management, budget authority, project ownership or metrics.';
}
