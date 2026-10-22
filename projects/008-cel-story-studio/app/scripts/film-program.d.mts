import type {EffectConfig,EffectShot} from './effects.mjs';
export type FilmAction={id:string;name:string;description:string;caption:string};
export const filmPrograms:Record<string,{name:string;subject:string;actions:FilmAction[]}>;
export function defaultShots(style:string):EffectShot[]|undefined;
export function retimeShots(shots:EffectShot[],duration:number):EffectShot[];
export function validateShots(shots:unknown,style:string,duration:number):EffectShot[]|undefined;
export function programCue(config:EffectConfig,seconds:number):{action:string;progress:number;index:number;framing:'wide'|'close';caption:string;localSeconds:number};
export function programSegments(config:EffectConfig):{id:string;action:string;seconds:number}[];
