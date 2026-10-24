import {GUSTS as OLD} from './story_gust_140base.mjs';
import {from140} from './story_escape_150.mjs';
import {branchId} from './branch_context.mjs';
export const GUSTS=OLD.map(g=>({...g,...Object.fromEntries(['inhale','exhale','emission','impact','end'].map(k=>[k,from140(g[k])]))}));
export function gustAt(t){if(branchId()==='peace')return null;const g=GUSTS.find(g=>t>=g.inhale&&t<g.end);return g?{...g,phase:t<g.exhale?'inhale':t<g.emission?'release':t<g.impact?'travel':'impact',front:Math.max(0,Math.min(1,(t-g.emission)/(g.impact-g.emission))),age:t-g.impact}:null;}
