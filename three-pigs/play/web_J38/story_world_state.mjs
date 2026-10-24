export const NORMAL_RESOLUTION={
 id:'normal-116-v1',
 source:'pigs_normal_personality_116_v1',
 plots:[
  {id:'plot-center',legacyView:'straw',installedAsset:'straw',workAnchor:'straw_work'},
  {id:'plot-west',legacyView:'wood',installedAsset:'wood',workAnchor:'wood_work'},
  {id:'plot-east',legacyView:'brick',installedAsset:'brick',workAnchor:'brick_work'}
 ],
 decisions:[
  {projectId:'home-a',ownerId:'pig1',plotId:'plot-center',material:'straw',workPlan:'rapid-thatch',
   candidateMaterials:['straw','wood','brick'],reason:'自由な屋根を早く形にしたい',tradeoff:'結束の仕上げより遊びを優先'},
  {projectId:'home-b',ownerId:'pig2',plotId:'plot-west',material:'wood',workPlan:'timber-with-help',
   candidateMaterials:['straw','wood','brick'],reason:'扱い慣れた木を順に組みたい',tradeoff:'自宅の補強を後回しにして弟を手伝う'},
  {projectId:'home-c',ownerId:'pig3',plotId:'plot-east',material:'brick',workPlan:'checked-masonry',
   candidateMaterials:['straw','wood','brick'],reason:'風への備えと接合を確かめたい',tradeoff:'確認を繰り返して作業が止まる'}
 ],
 cooperation:{helperProjectId:'home-b',recipientProjectId:'home-c',decide:24,depart:26,arrive:29.6,resume:32.3,finish:35.5}
};
export const WORK_PLANS={
 'rapid-thatch':{material:'straw',steps:[[10,1],[10.8,2],[12.4,3],[13.8,4],[14.7,5]],bindingComplete:false,reinforcementComplete:false},
 'timber-with-help':{material:'wood',steps:[[18,1],[18.8,2],[20.7,3],[21.8,4],[22.8,5]],bindingComplete:true,reinforcementComplete:false},
 'checked-masonry':{material:'brick',steps:[[26.4,1],[27.4,2],[32.3,3],[34.4,4],[35.5,5]],bindingComplete:true,reinforcementComplete:true}
};
function requireValue(condition,message){if(!condition)throw Error(message);}
export function resolveWorld(resolution=NORMAL_RESOLUTION){
 const input=structuredClone(resolution),projects={},owners=new Set(),plots=new Set();
 for(const d of input.decisions){
  const plot=input.plots.find(p=>p.id===d.plotId),plan=WORK_PLANS[d.workPlan];
  requireValue(plot,'Unknown plot '+d.plotId);requireValue(plan,'Unknown work plan '+d.workPlan);
  requireValue(plan.material===d.material,'Work plan does not match selected material');
  requireValue(!projects[d.projectId]&&!owners.has(d.ownerId)&&!plots.has(d.plotId),'Duplicate project, owner, or plot');
  requireValue(d.candidateMaterials.includes(d.material),'Chosen material absent from candidate materials');
  owners.add(d.ownerId);plots.add(d.plotId);
  projects[d.projectId]={...d,plot:{...plot},plan:structuredClone(plan)};
 }
 requireValue(projects[input.cooperation.helperProjectId]&&projects[input.cooperation.recipientProjectId],'Missing cooperation project');
 const c=input.cooperation;
 requireValue(c.decide<=c.depart&&c.depart<c.arrive&&c.arrive<=c.resume&&c.resume<c.finish,'Invalid cooperation order');
 return{resolutionId:input.id,projects,cooperation:c,actorProjects:Object.fromEntries(Object.values(projects).map(p=>[p.ownerId,p.projectId]))};
}
export const NORMAL_WORLD=resolveWorld();
export function constructionStateAt(seconds,world=NORMAL_WORLD){
 requireValue(Number.isFinite(seconds),'Construction time must be finite');
 const t=Math.max(0,seconds),c=world.cooperation;
 const cooperation={...c,helperId:world.projects[c.helperProjectId].ownerId,recipientId:world.projects[c.recipientProjectId].ownerId,
  phase:t<c.decide?'own_work':t<c.depart?'deciding':t<c.arrive?'travelling':t<c.resume?'sharing_plan':t<c.finish?'building_together':'complete'};
 const projects={};
 for(const p of Object.values(world.projects)){
  let stage=p.plan.steps.reduce((n,[at,s])=>t>=at?s:n,0);
  const waitsForHelp=p.projectId===c.recipientProjectId;
  if(waitsForHelp&&t<c.resume)stage=Math.min(stage,2);
  const completed=stage===5;
  projects[p.projectId]={projectId:p.projectId,ownerId:p.ownerId,plotId:p.plotId,material:p.material,workPlan:p.workPlan,
   stage,completed,bindingComplete:completed&&p.plan.bindingComplete,reinforcementComplete:completed&&p.plan.reinforcementComplete,
   checking:waitsForHelp&&t>=c.depart&&t<c.arrive,waitingForHelp:waitsForHelp&&t>=c.depart&&t<c.resume,
   reason:p.reason,tradeoff:p.tradeoff};
 }
 return{resolutionId:world.resolutionId,time:t,projects,cooperation,actorProjects:{...world.actorProjects}};
}
export function rendererHouseStates(state,world=NORMAL_WORLD){
 const out={};
 for(const p of Object.values(world.projects)){
  requireValue(p.material===p.plot.installedAsset,'No installed '+p.material+' visual at '+p.plotId);
  const s=state.projects[p.projectId];requireValue(s,'Missing project state '+p.projectId);
  out[p.plot.legacyView]={intact:true,time:0,door:'closed',constructionStage:s.stage,
   projectId:s.projectId,ownerId:s.ownerId,material:s.material,plotId:s.plotId};
 }
 return out;
}

