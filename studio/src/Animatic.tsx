import type {CSSProperties} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {objectPoseAt, shotAt, type WorldObject} from './film-plan';
import {samplePlan} from './sample-plan';
import {CameraRig} from './CameraRig';
import {AnchorBridge} from './AnchorBridge';

const palette = {bg:'#0a1420', line:'#355768', cyan:'#79e1d5', paper:'#f5f0e5', muted:'#9ab1bd', orange:'#e6a36c'};
const clamp = {extrapolateLeft:'clamp', extrapolateRight:'clamp'} as const;

const ObjectLayer = ({object, frame}: {object: WorldObject; frame: number}) => {
  const pose = objectPoseAt(object, frame);
  const style: CSSProperties = {position:'absolute', zIndex: object.kind === 'save-slot' ? 0 : object.kind === 'thought' ? 1 : 2, left:pose.x, top:pose.y, opacity:pose.opacity, transform:`translate(-50%, -50%) scale(${pose.scale})`};
  if (object.kind === 'thought') return <div style={style}>
    <div style={{width:315,height:315,borderRadius:'50%',border:`2px solid ${palette.cyan}`,boxShadow:`0 0 80px #79e1d544, inset 0 0 55px #79e1d529`,display:'grid',placeItems:'center',background:'radial-gradient(circle, #1c4850 0%, #102c38 55%, #0c202d 100%)'}}>
      <div style={{width:190,height:190,borderRadius:'50%',border:'1px solid #b5fff1aa',display:'grid',placeItems:'center'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:palette.cyan,boxShadow:`0 0 40px ${palette.cyan}`}} />
      </div>
    </div>
    <div style={{textAlign:'center',fontSize:42,fontWeight:700,letterSpacing:6,marginTop:28,color:palette.paper,opacity:Math.min(interpolate(frame,[180,235],[1,0],clamp),interpolate(frame,[330,380],[0,1],clamp))}}>思路</div>
  </div>;
  if (object.kind === 'notification') return <div style={{...style,width:350,padding:'27px 34px',borderRadius:26,background:'#2e2524',border:`2px solid ${palette.orange}`,boxShadow:'0 24px 90px #0009'}}>
    <div style={{fontSize:24,color:palette.orange,letterSpacing:3}}>新消息</div>
    <div style={{fontSize:58,fontWeight:800,color:palette.paper,marginTop:4}}>在吗？</div>
  </div>;
  if (object.kind === 'save-slot') return <div style={{...style,width:580,height:250,borderRadius:34,border:`3px dashed ${palette.cyan}`,background:'#102b35bb',boxSizing:'border-box'}}><div style={{position:'absolute',top:-55,right:8,fontSize:30,letterSpacing:4,color:palette.cyan}}>线索保存位</div></div>;
  if (object.kind === 'saved-row') return <div style={{...style,width:500,padding:'19px 28px',borderRadius:18,background:palette.paper,color:palette.bg,fontSize:36,fontWeight:700,boxShadow:'0 15px 45px #0008'}}>已保存 · 当前问题</div>;
  throw new Error(`No animatic renderer for ${object.kind}`);
};

const World = ({frame}: {frame: number}) => {
  return <>
    <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(#5b8b8b12 1px, transparent 1px), linear-gradient(90deg,#5b8b8b12 1px,transparent 1px)',backgroundSize:'90px 90px'}} />
    <div style={{position:'absolute',left:95,top:650,width:890,height:780,border:'1px solid #36525b77',borderRadius:40}} />
    <AnchorBridge plan={samplePlan} frame={frame} shotId="s02" color={palette.cyan} />
    {samplePlan.worlds[0].objects.map((object) => <ObjectLayer key={object.id} object={object} frame={frame} />)}
  </>;
};

export const Animatic = () => {
  const frame = useCurrentFrame();
  const shot = shotAt(samplePlan, frame);
  const local = frame-shot.startFrame;
  const captionOpacity = Math.min(interpolate(local,[0,12],[0,1],clamp),interpolate(frame,[shot.endFrame-14,shot.endFrame],[1,0],clamp));
  const spotlight = interpolate(frame,[0,34,90],[0.15,0.36,0.2],clamp);
  return <AbsoluteFill style={{background:palette.bg,fontFamily:'Microsoft YaHei, PingFang SC, Arial, sans-serif',overflow:'hidden'}}>
    <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 50% 47%,#20414a 0%,#0a1420 58%)'}} />
    <CameraRig plan={samplePlan} frame={frame}>
      <World frame={frame} />
      <div style={{position:'absolute',left:170,top:520,width:740,height:740,borderRadius:'50%',pointerEvents:'none',background:`radial-gradient(circle,#9affdf${Math.round(spotlight*35).toString(16).padStart(2,'0')} 0%,transparent 68%)`}} />
    </CameraRig>
    <div style={{position:'absolute',left:82,top:115,right:82}}>
      <div style={{fontSize:25,letterSpacing:7,color:palette.cyan,fontWeight:700}}>GENCAN · VISUAL STORY</div>
      <div style={{fontSize:91,lineHeight:1.14,fontWeight:900,color:palette.paper,marginTop:26}}>把思路<br/>接回来</div>
      <div style={{width:90,height:5,background:palette.orange,marginTop:34}} />
    </div>
    <div style={{position:'absolute',left:82,right:82,bottom:200,minHeight:170,display:'flex',alignItems:'center',borderTop:'1px solid #8db8be55'}}>
      <div style={{fontSize:45,lineHeight:1.45,fontWeight:700,color:palette.paper,opacity:captionOpacity}}>{shot.caption}</div>
    </div>
    <div style={{position:'absolute',left:82,right:82,bottom:100,height:4,background:'#49606a'}}>
      <div style={{height:'100%',width:`${(frame/450)*100}%`,background:palette.cyan}} />
    </div>
  </AbsoluteFill>;
};
