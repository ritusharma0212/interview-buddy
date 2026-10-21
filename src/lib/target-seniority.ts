export const TARGET_SENIORITIES=['Auto-detect from role','Senior Product Manager','Staff Product Manager','Principal Product Manager','Group Product Manager','Director of Product Management','Senior Director of Product Management','VP of Product'] as const;
export function seniorityContext(selected:string|undefined,role:string){
 const level=selected&&selected!=='Auto-detect from role'?selected:role;
 return 'Target seniority: '+level+'. Tailor questions and evaluation to the target level. Director and above: emphasize portfolio strategy, executive influence, cross-team prioritization, leadership, and business outcomes. Principal and Staff: emphasize product depth, strategic influence and execution. Do not invent people management, budget authority, project ownership or metrics.';
}
