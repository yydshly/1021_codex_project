import {actions,emotions} from './storyboard.mjs';
import {validateStyle} from './styles.mjs';
import {validateWorld,validateWorldShot} from './world-schema.mjs';
import {compileWorld} from './world-runtime.mjs';
import {validateRecipe} from './capabilities.mjs';
const text=(value,max,label)=>{
  if(typeof value!=='string'||!value.trim()||Array.from(value).length>max||/[\r\n\x00-\x1f]/.test(value))throw new Error(`${label} 必须为 1–${max} 字的单行文字。`);
  return value.trim();
};
const option=(value,options,label)=>{
  if(!options.includes(value))throw new Error(`${label} 选项无效。`);return value;
};
export function validateStory(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('需要完整的故事配置。');
  if(input.schemaVersion!==undefined&&![1,2,3].includes(input.schemaVersion))throw new Error('不支持这个故事配置版本。');
  const world=input.schemaVersion===3?validateWorld(input.world):null;
  const result={schemaVersion:world?3:2,title:text(input.title,18,'故事标题'),signature:text(input.signature,18,'结尾短句')};
  if(world)result.world=world;
  result.style=validateStyle(input.style);
  const recipe=validateRecipe(input.recipe);if(recipe)result.recipe=recipe;
  result.character=option(input.character,['flame','drop','star'],'角色');
  result.palette=option(input.palette,['tomato','lake','violet'],'配色');
  if(typeof input.boil!=='number'||!Number.isFinite(input.boil)||input.boil<0||input.boil>2.5)throw new Error('线条呼吸感超出范围。');
  if(typeof input.sound!=='boolean')throw new Error('声音选项无效。');
  result.boil=input.boil;result.sound=input.sound;
  let shots=input.shots;
  if(!Object.hasOwn(input,'shots')&&input.schemaVersion!==2){
    const motion=option(input.motion,['jump','float'],'旧版动作');
    shots=[
      {id:'legacy-opening',caption:text(input.opening,24,'第一幕'),action:'observe',emotion:'curious',duration:3},
      {id:'legacy-challenge',caption:text(input.challenge,24,'第二幕'),action:motion,emotion:'determined',duration:4},
      {id:'legacy-ending',caption:text(input.ending,24,'第三幕'),action:'celebrate',emotion:'happy',duration:5},
    ];
  }
  if(!Array.isArray(shots)||shots.length<1||shots.length>10)throw new Error('故事需要 1–10 个镜头。');
  const ids=new Set();
  result.shots=shots.map((s,i)=>{
    if(!s||typeof s!=='object'||Array.isArray(s))throw new Error(`镜头 ${i+1} 格式无效。`);
    if(typeof s.id!=='string'||! /^[\w-]{1,64}$/.test(s.id)||ids.has(s.id))throw new Error('镜头编号无效或重复。');
    ids.add(s.id);
    if(typeof s.duration!=='number'||!Number.isFinite(s.duration)||s.duration<1||s.duration>6||!Number.isInteger(s.duration*2))throw new Error('每镜时长须为 1–6 秒，以 0.5 秒调整。');
    return {id:s.id,caption:text(s.caption,24,`镜头 ${i+1} 字幕`),action:option(s.action,Object.keys(actions),'动作'),emotion:option(s.emotion,Object.keys(emotions),'情绪'),duration:s.duration,...(world?validateWorldShot(s,world):{})};
  });
  if(world)compileWorld(result.shots,world,true);
  return result;
}
