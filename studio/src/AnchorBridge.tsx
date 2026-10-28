import {interpolate} from 'remotion';
import {objectPoseAt, type FilmPlan} from './film-plan';

const clamp = {extrapolateLeft:'clamp', extrapolateRight:'clamp'} as const;

export const AnchorBridge = ({plan, frame, shotId, color}: {plan: FilmPlan; frame: number; shotId: string; color: string}) => {
  const shot = plan.shots.find((s) => s.id === shotId);
  if (!shot || shot.transitionOut.kind !== 'anchor-bridge') return null;
  const world = plan.worlds.find((w) => w.id === shot.worldId)!;
  const {anchorObjectId, targetObjectId, durationFrames, clearFrame} = shot.transitionOut;
  const from = objectPoseAt(world.objects.find((o) => o.id === anchorObjectId)!, shot.endFrame);
  const to = objectPoseAt(world.objects.find((o) => o.id === targetObjectId)!, shot.endFrame + durationFrames);
  const startY = from.y + 80, dy = to.y - startY;
  const drawn = interpolate(frame,[shot.endFrame,shot.endFrame + durationFrames],[0,1],clamp);
  const opacity = interpolate(frame,[clearFrame - durationFrames,clearFrame],[1,0],clamp);
  // shortcut: one downward cubic bridge; use a path planner for other travel directions.
  const path = `M ${from.x} ${startY} C ${from.x-90} ${startY+dy*.36} ${to.x-140} ${to.y-dy*.23} ${to.x} ${to.y}`;
  return <svg width={plan.video.width} height={plan.video.height} style={{position:'absolute',inset:0,opacity,pointerEvents:'none'}}>
    <path d={path} pathLength={1} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray="1" strokeDashoffset={1-drawn} />
  </svg>;
};
