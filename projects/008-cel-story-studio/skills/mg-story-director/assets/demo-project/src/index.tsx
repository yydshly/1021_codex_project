import {Composition,registerRoot} from 'remotion';
import {FlagshipFilm} from './flagship/FlagshipFilm';
import {defaultFlagship,validateFlagship,durationFlagship} from '../scripts/flagship-schema.mjs';

const FPS=30;
const Root=()=> <Composition id="FlagshipFilm" component={FlagshipFilm} width={1920} height={1080} fps={FPS}
 durationInFrames={Math.round(durationFlagship(defaultFlagship())*FPS)} defaultProps={{config:defaultFlagship()}}
 calculateMetadata={({props})=>{const config=validateFlagship(props.config);return {props:{config},durationInFrames:Math.round(durationFlagship(config)*FPS)};}}/>;
registerRoot(Root);
