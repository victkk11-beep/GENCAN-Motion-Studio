import assert from 'node:assert/strict';
import test from 'node:test';
import {cameraAt, objectPoseAt, validateFilmPlan} from './film-plan.ts';
import {samplePlan} from './sample-plan.ts';

const clone = () => structuredClone(samplePlan);

test('one plan covers the film with continuous camera and persistent object', () => {
  assert.equal(validateFilmPlan(samplePlan).shots.length, 4);
  assert.deepEqual(cameraAt(samplePlan, 89), cameraAt(samplePlan, 90));
  assert.deepEqual(cameraAt(samplePlan, 179), cameraAt(samplePlan, 180));
  const thought = samplePlan.worlds[0].objects.find((o) => o.id === 'thought')!;
  assert.equal(objectPoseAt(thought, 0).x, objectPoseAt(thought, 450).x);
  assert.ok(objectPoseAt(thought, 260).scale < objectPoseAt(thought, 0).scale);
});

test('rejects timeline gaps and a camera jump', () => {
  const gap = clone();
  gap.shots[1].startFrame += 1;
  assert.throws(() => validateFilmPlan(gap), /gap or overlap/);
  const jump = clone();
  jump.shots[1].camera[0].pose.target.x += 10;
  assert.throws(() => validateFilmPlan(jump), /Camera jumps/);
});

test('rejects broken references and premature voice lock', () => {
  const missing = clone();
  missing.shots[0].focusObjectId = 'missing';
  assert.throws(() => validateFilmPlan(missing), /Unknown focus/);
  const voice = clone();
  voice.audio.status = 'voice-locked';
  assert.throws(() => validateFilmPlan(voice), /requires an audio asset/);
  const bridge = clone();
  bridge.shots[1].transitionOut = {kind:'anchor-bridge',anchorObjectId:'thought',targetObjectId:'missing',durationFrames:65,clearFrame:390};
  assert.throws(() => validateFilmPlan(bridge), /Unknown transition anchor/);
  const beat = clone();
  beat.shots[1].beatId = 'focus';
  assert.throws(() => validateFilmPlan(beat), /mistimed beat/);
});

test('cross-world shots require an explicit cut or object match', () => {
  const plan = clone();
  plan.worlds.push({id:'history',objects:[{id:'history-node',kind:'thought',label:'历史线索',keys:[
    {frame:0,x:540,y:875,scale:1,opacity:1},
    {frame:450,x:540,y:875,scale:1,opacity:1},
  ]}]});
  plan.shots[2].worldId = 'history';
  plan.shots[2].focusObjectId = 'history-node';
  plan.shots[2].transitionOut = {kind:'cut'};
  plan.shots[1].transitionOut = {kind:'continuous'};
  assert.throws(() => validateFilmPlan(plan), /crosses worlds/);
  plan.shots[1].transitionOut = {kind:'object-match',anchorObjectId:'thought',targetObjectId:'history-node'};
  assert.equal(validateFilmPlan(plan).shots[2].worldId, 'history');
  plan.shots[1].transitionOut = {kind:'object-match',anchorObjectId:'thought',targetObjectId:'missing'};
  assert.throws(() => validateFilmPlan(plan), /Unknown object match/);
});
