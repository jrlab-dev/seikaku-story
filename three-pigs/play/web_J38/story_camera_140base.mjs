import {CAMERA_CUTS as OLD} from './story_camera_116base.mjs';
import {INSERTS,fromBaseTime} from './story_drama_140.mjs';
export const CAMERA_CUTS=[...new Set([...OLD.map(t=>fromBaseTime(t)),...INSERTS.flatMap(i=>[i.start,i.end]),19.7,35.1,50.6,71.5,72.3,86.3,87.1,103.7,104.7])].sort((a,b)=>a-b);
