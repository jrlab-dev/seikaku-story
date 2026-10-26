const RUN_MOTIONS=new Set(['paper_run','run_two_pose','run_spiral','run']);
export function isPigEscapeMotion(motion){return RUN_MOTIONS.has(motion);}
export function isPigEscaping(p){return !!p?.id?.startsWith('pig_')&&(isPigEscapeMotion(p.motion)||p.shelterRunner===true||(p.runAway===true&&p.motion==='walk'));}
export function applyPigEscapeRule(state){
 for(const p of state.actors??[]){
  if(!isPigEscaping(p))continue;
  p.motion='paper_run';
  p.spiralRunTime=state.time;
  for(const key of ['reactionPose','reactionBuild','stance','ownerDoor','encounterReaction','encounterClose'])delete p[key];
 }
 return state;
}
