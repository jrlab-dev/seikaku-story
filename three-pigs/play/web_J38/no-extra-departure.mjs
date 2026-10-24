export function createBlowawayDeparture(THREE,scene,clip,wind) {
  if (!clip?.name?.endsWith('_VillageTopple_J59')) throw new Error('No-extra-departure adapter requires a NearTopple_v1 clip');
  return Object.freeze({before(){},apply(){},reset(){}});
}
