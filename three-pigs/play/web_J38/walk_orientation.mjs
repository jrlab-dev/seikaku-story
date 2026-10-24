export const WALK_STRIDE_METRES=1.15;
export const walkPhase=distance=>Math.PI*2*distance/WALK_STRIDE_METRES;
export function walkView(yaw,azimuth,nativeFacingX=1){
 const side=Math.sin(yaw-azimuth),towardCamera=Math.cos(yaw-azimuth);
 return {side,towardCamera,mirror:side*nativeFacingX<0,rear:towardCamera<0,sourceFacingX:nativeFacingX};
}

