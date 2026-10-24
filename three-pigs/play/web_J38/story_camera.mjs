import {CAMERA_CUTS as OLD} from './story_camera_140base.mjs';
import {from140,ESCAPES} from './story_escape_150.mjs';
export const CAMERA_CUTS=[...new Set([...OLD.map(from140),...ESCAPES.flatMap(e=>[e.start,e.start+e.expose,e.start+e.surprise,e.start+e.depart,e.end])])].sort((a,b)=>a-b);
