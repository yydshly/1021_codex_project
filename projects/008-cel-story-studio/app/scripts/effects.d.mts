import type {StyleId} from './styles.mjs';
export type EffectShot={id:string;action:string;seconds:number;caption:string;framing:'wide'|'close'};
export type EffectConfig={kind:'effect-template';version:1;style:StyleId;title:string;subtitle:string;words:string[];primary:string;secondary:string;count:number;intensity:number;detail:number;seed:number;duration:number;sound?:boolean;shots?:EffectShot[];storyId?:string};
export type EffectTemplate={id:StyleId;slug:string;name:string;en:string;engine:string;features:string;principle:string;modules:string[];useCases:string;controls:string[];example:string[];primary:string;secondary:string;boundary:string;next:string;source:{repository:string;commit:string;relationship:string;features?:string}};
export const effectTemplates:EffectTemplate[];
export const SOURCE_COMMIT:string;
export function getEffect(id:string):EffectTemplate;
export function effectDefaults(id?:StyleId):EffectConfig;
export function validateEffect(x:unknown):EffectConfig;
