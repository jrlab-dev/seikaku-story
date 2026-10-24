export function createStoryBuildings({straw,wood=null,construction=null,doors=null,invalidate}){
 let last=null;
 return{
  capabilities(){return{straw:true,wood:!!wood,brickIntact:true};},
  record(){return{requested:last?JSON.parse(last):null,wood:wood?.state??null,construction:construction?.record()??null,doors:doors?.record()??null};},
  apply(states){const key=JSON.stringify(states);if(key===last)return;last=key;
   if(states.straw.intact)straw.reset();else straw.seek(states.straw.time);
   if(wood){if(states.wood.intact)wood.reset();else wood.seek(states.wood.time);}
   wood?.deform?.(states.wood.deform??0);straw.deform?.(states.straw.deform??0);construction?.apply(states);doors?.apply(states);invalidate();
  },
  timeline(state){construction?.timeline(state);},
  reset(){last=null;straw.reset();wood?.reset();construction?.reset();invalidate();},
  dispose(){wood?.dispose?.();}
 };
}
