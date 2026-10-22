import type {FlagshipConfig} from '../../scripts/flagship-schema.mjs';
export type Point018=[number,number];
export const clamp018=(n:number,a=0,b=1)=>Math.min(b,Math.max(a,n));
export const mix018=(a:number,b:number,u:number)=>a+(b-a)*u;
export const ease018=(n:number)=>{const u=clamp018(n);return u*u*(3-2*u);};
export function cue018(config:FlagshipConfig,seconds:number){let start=0;for(let i=0;i<config.shots.length;i++){const shot=config.shots[i],last=i===config.shots.length-1;if(seconds<start+shot.seconds||last)return {shot,index:i,progress:clamp018((seconds-start)/shot.seconds),start,local:Math.max(0,seconds-start)};start+=shot.seconds;}throw new Error('缺少镜头。');}
export function phases018(config:FlagshipConfig,seconds:number){let at=0;return Object.fromEntries(config.shots.map(s=>{const progress=clamp018((seconds-at)/s.seconds);at+=s.seconds;return [s.event,progress];})) as Record<'notice'|'draw'|'unfold'|'leap'|'farewell',number>;}
// The ink and the brush sample this same path; an independently animated pointer would drift.
export function inkTip018(u:number):Point018{const p=ease018(u),q=1-p;return [q*q*q*783+3*q*q*p*824+3*q*p*p*867+p*p*p*946,q*q*q*551+3*q*q*p*497+3*q*p*p*580+p*p*p*526];}
export function whaleJourney018(progress:number,joy:number){const hesitation=joy<.3?.13:0,p=clamp018((progress-hesitation)/(1-hesitation)),enter=ease018(clamp018(p/.45)),open=ease018(clamp018((p-.35)/.65));const x=mix018(mix018(890,1055,enter),1040,open),y=mix018(mix018(452,532,enter)-Math.sin(enter*Math.PI)*(70+joy*120),402,open);return {x,y,scale:mix018(.225,.95,open),rotation:Math.sin(enter*Math.PI)*(-.3-joy*.2)*(1-open),portal:ease018((p-.21)/.67)};}
