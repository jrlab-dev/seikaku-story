const cache=new WeakMap();
export function restoreRoofRattle(root){
 const data=root&&cache.get(root);if(!data?.base)return;
 data.nodes.forEach((n,i)=>n.position.copy(data.base[i]));data.base=null;
}
export function applyRoofRattle(root,clipTime,kind){
 if(!root)return;let data=cache.get(root);
 if(!data){const nodes=[];root.traverse(o=>{if(kind==='straw'?['flying','bound_batten','rafter'].includes(o.userData.role):/Roof_/.test(o.name))nodes.push(o);});data={nodes,base:null};cache.set(root,data);}
 const nodes=data.nodes;data.base=nodes.map(n=>n.position.clone());
 const duration=kind==='straw'?.48:1.35,u=Math.max(0,Math.min(1,clipTime/duration)),envelope=Math.sin(Math.PI*u),wave=Math.sin(clipTime*31)*envelope;
 for(let i=0;i<nodes.length;i++){const n=nodes[i],sign=i%2?1:-1;n.position.y+=wave*(kind==='straw'?.035:.023)*sign;n.position.x+=Math.sin(clipTime*24+i)*envelope*.012;}
}
