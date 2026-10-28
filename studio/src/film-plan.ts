import {z} from 'zod';

const point = z.object({x: z.number(), y: z.number()}).strict();
const pose = point.extend({scale: z.number().positive(), opacity: z.number().min(0).max(1)}).strict();
const cameraPose = z.object({target: point, scale: z.number().positive()}).strict();
const key = pose.extend({frame: z.number().int().nonnegative()}).strict();

export const filmPlanSchema = z.object({
  version: z.literal(1),
  id: z.string().min(1),
  brief: z.object({title: z.string().min(1), audience: z.string().min(1), learningGoal: z.string().min(1)}).strict(),
  video: z.object({width: z.number().int().positive(), height: z.number().int().positive(), fps: z.number().int().positive(), durationFrames: z.number().int().positive()}).strict(),
  audio: z.object({status: z.enum(['placeholder', 'voice-locked']), asset: z.string().nullable()}).strict(),
  beats: z.array(z.object({id: z.string().min(1), startFrame: z.number().int().nonnegative(), endFrame: z.number().int().positive(), before: z.string().min(1), change: z.string().min(1), after: z.string().min(1)}).strict()).min(1),
  worlds: z.array(z.object({id: z.string().min(1), objects: z.array(z.object({id: z.string().min(1), kind: z.string().min(1), label: z.string().min(1), keys: z.array(key).min(2)}).strict()).min(1)}).strict()).min(1),
  markers: z.array(z.object({id: z.string().min(1), frame: z.number().int().nonnegative(), kind: z.enum(['narration', 'action', 'sfx']), text: z.string().min(1)}).strict()),
  shots: z.array(z.object({
    id: z.string().min(1), beatId: z.string().min(1), worldId: z.string().min(1),
    startFrame: z.number().int().nonnegative(), endFrame: z.number().int().positive(),
    purpose: z.string().min(1), focusObjectId: z.string().min(1), caption: z.string().min(1),
    camera: z.array(z.object({frame: z.number().int().nonnegative(), pose: cameraPose, easing: z.enum(['hold', 'linear', 'smooth'])}).strict()).min(2),
    transitionOut: z.discriminatedUnion('kind', [
      z.object({kind: z.literal('continuous')}).strict(),
      z.object({kind: z.literal('cut')}).strict(),
      z.object({kind: z.literal('anchor-bridge'), anchorObjectId: z.string().min(1), targetObjectId: z.string().min(1), durationFrames: z.number().int().positive(), clearFrame: z.number().int().positive()}).strict(),
      z.object({kind: z.literal('object-match'), anchorObjectId: z.string().min(1), targetObjectId: z.string().min(1)}).strict(),
    ]),
  }).strict()).min(1),
}).strict();

export type FilmPlan = z.infer<typeof filmPlanSchema>;
export type WorldObject = FilmPlan['worlds'][number]['objects'][number];
export type Pose = z.infer<typeof pose>;
type CameraPose = z.infer<typeof cameraPose>;

const unique = (values: string[]) => new Set(values).size === values.length;
const sameCamera = (a: CameraPose, b: CameraPose) =>
  a.target.x === b.target.x && a.target.y === b.target.y && a.scale === b.scale;

export const validateFilmPlan = (raw: unknown): FilmPlan => {
  const plan = filmPlanSchema.parse(raw);
  const {durationFrames} = plan.video;
  if (plan.audio.status === 'voice-locked' && !plan.audio.asset) throw new Error('Voice-locked plan requires an audio asset');
  if (!unique(plan.beats.map((b) => b.id)) || !unique(plan.shots.map((s) => s.id)) || !unique(plan.markers.map((m) => m.id))) throw new Error('Duplicate beat, shot or marker ID');
  const objectIds = plan.worlds.flatMap((w) => w.objects.map((o) => o.id));
  if (!unique(plan.worlds.map((w) => w.id)) || !unique(objectIds)) throw new Error('Duplicate world or object ID');

  const covers = (items: {startFrame: number; endFrame: number}[], name: string) => {
    if (items[0]?.startFrame !== 0 || items.at(-1)?.endFrame !== durationFrames) throw new Error(`${name} must cover the full film`);
    for (let i = 0; i < items.length; i++) {
      if (items[i].endFrame <= items[i].startFrame || (i > 0 && items[i].startFrame !== items[i - 1].endFrame)) throw new Error(`${name} has a gap or overlap`);
    }
  };
  covers(plan.beats, 'Beats');
  covers(plan.shots, 'Shots');
  for (const marker of plan.markers) if (marker.frame >= durationFrames) throw new Error(`Marker ${marker.id} is outside the film`);

  for (const world of plan.worlds) for (const object of world.objects) {
    const keys = object.keys;
    if (keys[0].frame !== 0 || keys.at(-1)?.frame !== durationFrames) throw new Error(`Object ${object.id} lacks endpoint keys`);
    for (let i = 1; i < keys.length; i++) if (keys[i].frame <= keys[i - 1].frame) throw new Error(`Object ${object.id} has unordered keys`);
  }

  for (let i = 0; i < plan.shots.length; i++) {
    const shot = plan.shots[i];
    const world = plan.worlds.find((w) => w.id === shot.worldId);
    if (!plan.beats.some((b) => b.id === shot.beatId && shot.startFrame >= b.startFrame && shot.endFrame <= b.endFrame)) throw new Error(`Unknown or mistimed beat in ${shot.id}`);
    if (!world?.objects.some((o) => o.id === shot.focusObjectId)) throw new Error(`Unknown focus object in ${shot.id}`);
    const keys = shot.camera;
    if (keys[0].frame !== shot.startFrame || keys.at(-1)?.frame !== shot.endFrame) throw new Error(`Camera keys do not cover ${shot.id}`);
    for (let j = 1; j < keys.length; j++) if (keys[j].frame <= keys[j - 1].frame) throw new Error(`Camera keys are unordered in ${shot.id}`);
    const next = plan.shots[i + 1];
    if (shot.transitionOut.kind === 'anchor-bridge') {
      const {anchorObjectId, targetObjectId, durationFrames, clearFrame} = shot.transitionOut;
      if (!world.objects.some((o) => o.id === anchorObjectId) || !world.objects.some((o) => o.id === targetObjectId)) throw new Error(`Unknown transition anchor in ${shot.id}`);
      if (shot.endFrame + durationFrames > clearFrame || clearFrame > plan.video.durationFrames) throw new Error(`Invalid transition timing in ${shot.id}`);
      // shortcut: bridges stay within one world; add world-to-world mapping when a real episode needs it.
      if (!next || next.worldId !== shot.worldId) throw new Error(`Anchor bridge needs a shared world after ${shot.id}`);
    }
    if (shot.transitionOut.kind === 'object-match') {
      const {anchorObjectId, targetObjectId} = shot.transitionOut;
      const targetWorld = plan.worlds.find((w) => w.id === next?.worldId);
      if (!next || !world.objects.some((o) => o.id === anchorObjectId) || !targetWorld?.objects.some((o) => o.id === targetObjectId)) throw new Error(`Unknown object match in ${shot.id}`);
    }
    if (next && shot.worldId !== next.worldId && shot.transitionOut.kind === 'continuous') throw new Error(`Continuous transition crosses worlds after ${shot.id}`);
    if (next && shot.worldId === next.worldId && (shot.transitionOut.kind === 'continuous' || shot.transitionOut.kind === 'anchor-bridge') && !sameCamera(keys.at(-1)!.pose, next.camera[0].pose)) throw new Error(`Camera jumps after ${shot.id}`);
  }
  return plan;
};

const ease = (t: number, kind: 'hold' | 'linear' | 'smooth') => kind === 'hold' ? 0 : kind === 'smooth' ? t * t * (3 - 2 * t) : t;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const objectPoseAt = (object: WorldObject, frame: number): Pose => {
  const keys = object.keys;
  if (frame <= keys[0].frame) return keys[0];
  if (frame >= keys.at(-1)!.frame) return keys.at(-1)!;
  const right = keys.findIndex((k) => k.frame > frame);
  const a = keys[right - 1], b = keys[right];
  const t = ease((frame - a.frame) / (b.frame - a.frame), 'smooth');
  return {x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), scale: lerp(a.scale, b.scale, t), opacity: lerp(a.opacity, b.opacity, t)};
};

export const shotAt = (plan: FilmPlan, frame: number) => plan.shots.find((s) => frame >= s.startFrame && frame < s.endFrame) ?? plan.shots.at(-1)!;

export const cameraAt = (plan: FilmPlan, frame: number): CameraPose => {
  const keys = shotAt(plan, frame).camera;
  if (frame <= keys[0].frame) return keys[0].pose;
  if (frame >= keys.at(-1)!.frame) return keys.at(-1)!.pose;
  const right = keys.findIndex((k) => k.frame > frame);
  const a = keys[right - 1], b = keys[right];
  const t = ease((frame - a.frame) / (b.frame - a.frame), b.easing);
  return {target: {x: lerp(a.pose.target.x, b.pose.target.x, t), y: lerp(a.pose.target.y, b.pose.target.y, t)}, scale: lerp(a.pose.scale, b.pose.scale, t)};
};
