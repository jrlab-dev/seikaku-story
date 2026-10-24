import {CAMERA_CUTS as OLD} from './story_camera_84.mjs';
import {INTRO_CUTS} from './personality_intro.mjs';
export const CAMERA_CUTS=[...new Set([...INTRO_CUTS,...OLD.filter(t=>t>=8).map(t=>t+32)])].sort((a,b)=>a-b);

