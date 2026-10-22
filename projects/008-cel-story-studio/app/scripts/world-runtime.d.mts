import type {Shot,World,WorldScene,ActorCue} from '../src/model';
export type ObjectState={x:number;y:number;holder:string;sceneId:string;growth?:number};
export type TimedWorldShot=Shot&{scene:WorldScene;cast:(ActorCue&{inherited:boolean})[];from:number;to:number;durationFrames:number;objectsBefore:Record<string,ObjectState>;objectsAfter:Record<string,ObjectState>;warnings:string[]};
export function compileWorld(shots:Shot[],world:World,strict?:boolean):TimedWorldShot[];
export function worldPose(cue:ActorCue,t:number,frame:number):{x:number;y:number;rotation:number;arms:number;stride:number;sx:number;sy:number;direction:number;t:number;armL:number;armR:number;head:number;propRotation:number};
export function objectsAt(shot:TimedWorldShot,t:number,frame:number):Record<string,ObjectState>;
