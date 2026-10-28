import type {ReactNode} from 'react';
import {cameraAt, type FilmPlan} from './film-plan';

export const CameraRig = ({plan, frame, children}: {plan: FilmPlan; frame: number; children: ReactNode}) => {
  const {width, height} = plan.video;
  const camera = cameraAt(plan, frame);
  return <div style={{position:'absolute',width,height,transformOrigin:'0 0',transform:`translate(${width/2}px, ${height/2}px) scale(${camera.scale}) translate(${-camera.target.x}px, ${-camera.target.y}px)`}}>{children}</div>;
};
