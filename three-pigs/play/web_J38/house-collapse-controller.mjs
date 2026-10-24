/** Common controller for approved Straw_Collapse_v2 and candidate Wood_Collapse_v1.
 * Pass the same THREE namespace used by the host. No placement or scene changes.
 * Put both loaded scenes below the host's SAME house placement parent first.
 */
export function createHouseCollapseController(THREE, { staticScene, collapseScene, animations, clipName }) {
  const clip = animations.find(c => c.name === clipName);
  if (!clip || Math.abs(clip.duration - 8) > 0.001) throw new Error(`Expected ${clipName}, duration 8 seconds`);
  const mixer = new THREE.AnimationMixer(collapseScene);
  const action = mixer.clipAction(clip);
  action.setLoop(THREE.LoopOnce, 1);
  action.clampWhenFinished = true;
  let seconds = 0, running = false, mode = 'intact';
  function evaluate(t) {
    action.enabled = true;
    action.paused = false;
    mixer.setTime(t);
    action.paused = true;
  }
  function reset() {
    running = false; seconds = 0; mode = 'intact';
    action.reset().play(); evaluate(0);
    collapseScene.visible = false; staticScene.visible = true;
  }
  function start() {
    reset(); staticScene.visible = false; collapseScene.visible = true;
    running = true; mode = 'playing';
  }
  function seek(time) {
    if (!Number.isFinite(time)) throw new TypeError('time must be finite');
    running = false; seconds = Math.max(0, Math.min(8, time));
    action.reset().play(); evaluate(seconds);
    staticScene.visible = false; collapseScene.visible = true;
    mode = seconds === 8 ? 'held' : 'paused';
  }
  function update(dt) {
    if (!running) return;
    if (!Number.isFinite(dt) || dt < 0) throw new TypeError('dt must be finite and nonnegative');
    seconds = Math.min(8, seconds + dt); evaluate(seconds);
    if (seconds === 8) { running = false; mode = 'held'; }
  }
  reset();
  return { start, reset, seek, update, get state() { return { seconds, running, mode }; } };
}
