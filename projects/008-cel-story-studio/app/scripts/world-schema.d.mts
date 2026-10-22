import type {World,Shot,WorldShot} from '../src/model';
export type WorldAction='observe'|'walk'|'run'|'jump'|'float'|'fail'|'celebrate'|'wave'|'talk'|'pickup'|'place'|'give'|'push'|'sit'|'sleep'|'dance'|'perform';
export const worldActions:Record<WorldAction,string>;
export const MAX_BYTES:number;
export function validateWorld(input:unknown):World;
export function validateWorldShot(input:unknown,world:World):WorldShot;
