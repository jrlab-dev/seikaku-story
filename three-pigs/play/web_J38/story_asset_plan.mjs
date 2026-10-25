let current=null;
export function getStoryAssetPlan(){return current;}

export function prepareStoryAssetPlan(sample,duration,sites,ending){
 const collapse=new Set(),doors=new Set(),security=new Set(),effects=new Set(),reactions=new Set(),fullImages=new Set(),motions={},wolf={frontRun:false,rearRun:false,hotJump:false,tail:false};
 for(let i=0;i<=Math.ceil(duration*10);i++){
  const s=sample(Math.min(duration,i/10));
  for(const [site,h] of Object.entries(s.houses||{})){
   if(h.intact===false)collapse.add(site);
   if((h.doorOpen??0)>.05)doors.add(site);
   if(h.security!=null)security.add(site);
  }
  for(const p of [].concat(s.puzzleEffect||[]).filter(Boolean))effects.add(p.kind);
  if(s.fullImage)fullImages.add(s.fullImage.key);
  for(const a of s.actors||[]){
   if(a.id==='wolf'){if(['startled','run_spiral'].includes(a.motion))wolf[a.runAway?'rearRun':'frontRun']=true;if(a.singleHotJump)wolf.hotJump=true;if(a.tailFlame?.active)wolf.tail=true;}
   (motions[a.id]??=new Set()).add(a.motion||'idle');
   if(a.bombPose!=null)reactions.add('bomb_'+a.id);
   if(a.reactionPose!=null||a.reactionBuild)reactions.add('react_'+a.id);
   if(a.stance!=null)reactions.add('stance_'+a.id);
  }
 }
 current={ending:ending.id,sites,wolf,collapse:[...collapse],doors:[...doors],security:[...security],effects:[...effects],reactions:[...reactions],fullImages:[...fullImages],motions:Object.fromEntries(Object.entries(motions).map(([k,v])=>[k,[...v]]))};
 sample(0);
 return current;
}
