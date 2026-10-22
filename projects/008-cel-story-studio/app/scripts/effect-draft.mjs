import {effectDefaults,validateEffect} from './effects.mjs';
import {legacyExamples011} from './legacy-effects-011.mjs';
import {legacyExamples012} from './legacy-effects-012.mjs';
import {legacyExamples017} from './legacy-effects-017.mjs';
import {legacyExamples013} from './legacy-effects-013.mjs';
const legacy={
 isometric:{title:'午夜温室',subtitle:'当城市睡去，一座花园开始呼吸',words:['亮灯','舒展','呼吸'],primary:'#e5b675',secondary:'#7aa989'},
 '3d-render':{title:'琥珀轨道',subtitle:'陶瓷、金属与一颗不愿停下的琥珀',words:['升起','环绕','共振'],primary:'#e5a855',secondary:'#7eb7a4'},
};
// Only untouched old examples move to the new creative direction. Every user edit is preserved.
export function migrateEffectDraft(raw){const c=validateEffect(raw),old017=legacyExamples017[c.style];if(old017&&Object.keys(c).length===Object.keys(old017).length&&Object.entries(old017).every(([k,v])=>JSON.stringify(c[k])===JSON.stringify(v)))return effectDefaults(c.style);const prior=legacyExamples013[c.style];if(prior&&Object.keys(c).length===Object.keys(prior).length&&Object.entries(prior).every(([k,v])=>JSON.stringify(c[k])===JSON.stringify(v)))return effectDefaults(c.style);const last=legacyExamples012[c.style];if(last&&Object.keys(c).length===Object.keys(last).length&&Object.entries(last).every(([k,v])=>JSON.stringify(c[k])===JSON.stringify(v)))return effectDefaults(c.style);const recent=legacyExamples011[c.style];if(recent&&Object.entries(recent).every(([k,v])=>JSON.stringify(c[k])===JSON.stringify(v)))return effectDefaults(c.style);const old=legacy[c.style];if(!old)return c;
 const expected={...old,count:8,intensity:.65,detail:.55,seed:21,duration:10,sound:true};
 return Object.entries(expected).every(([k,v])=>JSON.stringify(c[k])===JSON.stringify(v))?effectDefaults(c.style):c;
}
