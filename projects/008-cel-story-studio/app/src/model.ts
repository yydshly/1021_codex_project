export {FPS,actions,emotions,compileTimeline,getDuration} from '../scripts/storyboard.mjs';
import type {StyleId} from '../scripts/styles.mjs';
import type {WorldAction} from '../scripts/world-schema.mjs';
import type {StyleRecipe} from '../scripts/capabilities.mjs';
export type Action='observe'|'walk'|'hesitate'|'jump'|'float'|'fail'|'celebrate';
export type Emotion='curious'|'afraid'|'sad'|'determined'|'happy';
export type Point={x:number;y:number};
export type VectorShape={kind:'ellipse'|'rect'|'polygon'|'line';part:'body'|'head'|'armL'|'armR'|'legL'|'legR'|'detail';x:number;y:number;w:number;h:number;fill:string;stroke:string;points:Point[]};
export type WorldCharacter={id:string;name:string;description:string;scale:number;face:Point&{size:number};shapes:VectorShape[]};
export type WorldObject={id:string;name:string;description:string;shapes:VectorShape[]};
export type WorldScene={id:string;name:string;description:string;sky:string;ground:string;groundY:number;shapes:VectorShape[];items:{objectId:string;x:number;y:number}[]};
export type World={characters:WorldCharacter[];objects:WorldObject[];scenes:WorldScene[]};
export type MotionKey={t:number;x:number;y:number;rotation:number;armL:number;armR:number;head:number;propRotation:number};
export type ActorCue={characterId:string;action:WorldAction;emotion:Emotion;from:Point;to:Point;propId:string;recipientId:string;gesture?:string;motion?:MotionKey[];effect?:{kind:'none'|'water'|'grow'|'sparkle'|'steam';targetId:string}};
export type WorldShot={sceneId:string;framing:'wide'|'medium'|'close';cast:ActorCue[]};
export type Shot={id:string;caption:string;action:Action;emotion:Emotion;duration:number}&Partial<WorldShot>;
export type StoryProps={schemaVersion:2|3;style:StyleId;title:string;signature:string;character:'flame'|'drop'|'star';palette:'tomato'|'lake'|'violet';boil:number;sound:boolean;shots:Shot[];world?:World;recipe?:StyleRecipe};
export const defaults:StoryProps={
  schemaVersion:2,style:'cel-boil',title:'小小的我，也有光',signature:'把你的故事，画成光。',character:'flame',palette:'tomato',boil:1.2,sound:true,
  shots:[
    {id:'discover',caption:'远处的星星，还没有亮。',action:'observe',emotion:'curious',duration:2.5},
    {id:'approach',caption:'我想走近一点，试试看。',action:'walk',emotion:'determined',duration:2},
    {id:'fear',caption:'可是，这座山好像有点高。',action:'hesitate',emotion:'afraid',duration:1.5},
    {id:'leap',caption:'深呼吸，再勇敢一次。',action:'jump',emotion:'determined',duration:3},
    {id:'light',caption:'原来，小小的我也能带来光。',action:'celebrate',emotion:'happy',duration:3},
  ],
};
export const palettes={
  tomato:{main:'#ed5638',light:'#ffd14c',dark:'#963b2c',label:'番茄与日光'},
  lake:{main:'#559b92',light:'#efbf62',dark:'#2c625e',label:'湖水与麦田'},
  violet:{main:'#9c7bb0',light:'#f1b5a2',dark:'#624b7c',label:'暮色与桃子'},
};
export const presets:StoryProps[]=[defaults,{
  ...defaults,title:'跌倒以后，再试一次',signature:'慢慢来，也可以。',character:'star',palette:'violet',shots:[
    {id:'notice',caption:'我想去星星那边看看。',action:'observe',emotion:'curious',duration:2},
    {id:'walk',caption:'先往前走一小步。',action:'walk',emotion:'determined',duration:2},
    {id:'fail',caption:'哎呀，这一次没能跳过去。',action:'fail',emotion:'afraid',duration:2},
    {id:'pause',caption:'有点难过，先歇一会儿。',action:'observe',emotion:'sad',duration:1.5},
    {id:'retry',caption:'但我还想，再试一次。',action:'jump',emotion:'determined',duration:3},
    {id:'finish',caption:'看，我真的做到了！',action:'celebrate',emotion:'happy',duration:2.5},
  ],
},{...defaults,title:'柔软，也有力量',signature:'每一步，都算数。',character:'drop',palette:'lake',shots:[
  {id:'see',caption:'远方，有一颗等待的星星。',action:'observe',emotion:'curious',duration:2},
  {id:'float',caption:'轻轻地，也能翻过这座山。',action:'float',emotion:'happy',duration:4},
  {id:'shine',caption:'柔软的心，也能带来光。',action:'celebrate',emotion:'happy',duration:2},
]}];
