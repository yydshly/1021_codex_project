import type {Shot,Action,Emotion} from '../src/model';
export const FPS: number;
export const actions: Record<Action,{label:string;icon:string;hint:string}>;
export const emotions: Record<Emotion,string>;
export type TimedShot = Shot & {from:number;to:number;durationFrames:number;startX:number;endX:number;litBefore:boolean};
export function getDuration(shots:Shot[]):number;
export function compileTimeline(shots:Shot[]):TimedShot[];
export function poseAt(shot:TimedShot,localFrame:number):{x:number;y:number;sx:number;sy:number;rotation:number;stride:number;arms:number;hold:number;frame:number;progress:number};
