import {Composition} from 'remotion';
import {Animatic} from './Animatic';
import {samplePlan} from './sample-plan';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GENCAN-ContextThread"
        component={Animatic}
        durationInFrames={samplePlan.video.durationFrames}
        fps={samplePlan.video.fps}
        width={samplePlan.video.width}
        height={samplePlan.video.height}
      />
    </>
  );
};
