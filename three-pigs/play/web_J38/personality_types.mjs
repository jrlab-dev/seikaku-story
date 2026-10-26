const ORDER=[['E',2,0,1],['N',4,2,3],['A',3,6,7],['C',1,4,5],['O',0,8,null]];
export function stanceFor(code){for(const[,i,hi,lo]of ORDER){const d=code[i];if(d==='5'&&hi!=null)return hi;if(d==='1'&&lo!=null)return lo;}return null;}

export function typesFor(code){const out=[];for(const[,i,hi,lo]of ORDER){const d=code[i];if(d==='5'&&hi!=null)out.push(hi);else if(d==='1'&&lo!=null)out.push(lo);}return out;}
export function castTypes(cast){const used=new Set(),out={};for(const role of ['pig_straw','pig_wood','pig_brick','wolf']){const code=cast[role];if(!code)continue;const opts=typesFor(code),pick=opts.find(k=>!used.has(k))??opts[0]??9;used.add(pick);out[role]=pick;}return out;}
