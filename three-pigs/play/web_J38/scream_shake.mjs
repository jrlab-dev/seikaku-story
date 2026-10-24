export function screamShake(age){
 const duration=3.0,clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 const active=age>=0&&age<duration,envelope=active?smooth(age/.16)*smooth((duration-age)/.4):0;
 return{age,duration,active,envelope,house:envelope*Math.sin(2*Math.PI*2.4*age),textX:.006*envelope*Math.sin(2*Math.PI*6.3*age),textY:.004*envelope*Math.sin(2*Math.PI*7.1*age+.5),textRotation:.012*envelope*Math.sin(2*Math.PI*5.7*age)};
}
