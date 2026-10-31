import {CENTERS} from './endings/strategy.mjs';
import {houseCamera,roomPig,followHousePath,HOUSE_DOOR_X} from './endings/strategy_house_raid.mjs';
const clamp=x=>Math.max(0,Math.min(1,x)),SITES=['straw','wood','brick'];
export function applyHouseOccupancy(s,t){
 const entry=t>=58.5&&t<62.5?0:t>=80&&t<84?1:t>=106.5&&t<114.7?2:-1;
 if(entry<0&&!(t>=114.7&&t<131))return false;
 if(s.houseOccupancy)return true;
 const i=entry<0?0:entry,site=SITES[i],c=CENTERS[site],u=entry<0?10:t-[58.5,80,106.5][i];
 for(const a of s.actors){a.visible=false;for(const k of ['ownerDoor','encounterClose','encounterReaction','reactionBuild','stance','puzzleEntry','buildFacingAz','buildMirror','worldY','strategyWorldY','reactionPose'])delete a[k];}
 const pig=roomPig(s,site,i);let inside=u>=3.1,opening=0;
 if(u<3.1){const v=clamp((u-.3)/2.6);followHousePath(pig,[[c[0]+HOUSE_DOOR_X,c[2]+4.3],[c[0]+HOUSE_DOOR_X,c[2]+.5]],v);pig.worldY=c[1]+.34*clamp((4.1-(pig.z-c[2]))/1.6);opening=clamp(u/.25);}
 else opening=1-clamp((u-3.1)/.6);
 const f={revision:3,site,phase:u,inside,rearOpen:0,fire:0,steam:0};
 s.houseOccupancy=f;if(t>=121.5)s.strategyPrelude=f;
 Object.assign(s.houses[site],{intact:true,constructionStage:5,doorOpen:entry<0?0:opening,doorSwing:'inward',security:null});
 for(const k of ['build','completion','encounter','shelter','egress','enterHouse','escape','travel','arrivalFix','comic','intro','drama','personalityWindow'])s[k]=null;
 s.effects=[];s.camera=houseCamera(site,inside);s.movementMode='house_entry';
 const label=['長男','次男','三男'][i],cap=entry<0?'長男は家の中で戸締まりを確認。狼が外から近づいてきます。':inside?label+'は家の中へ入り、内側から玄関の戸を閉めました。':label+'は完成した家の玄関を開けて、中へ入ります。';
 s.scene={...s.scene,caption:cap};s.branch={...s.branch,caption:{...s.branch?.caption,text:cap}};
 return true;
}
