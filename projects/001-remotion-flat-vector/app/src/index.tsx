import {Composition, registerRoot} from 'remotion';
import {OneDot} from './OneDot';

const Root = () => (
  <Composition id="OneDot" component={OneDot} width={1920} height={1080}
    fps={30} durationInFrames={300} />
);

registerRoot(Root);
