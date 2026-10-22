import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {AbsoluteFill,Audio,Loop,Sequence,cancelRender,getRemotionEnvironment,continueRender,delayRender,staticFile,useCurrentFrame} from 'remotion';
import type {EffectConfig} from '../../scripts/effects.mjs';
import {getEffect} from '../../scripts/effects.mjs';
import type {EffectAssets} from './canvas';
import {paintCanvasV3} from './canvas-v3';
import {filmOverlay} from './film-overlay';
import {W,H,text,circle,rr,smooth} from './math';
import {StudioFilm} from './StudioFilm';
import {hasStudioPlate} from './studio-model';
import {hasMaterialPlate} from '../../scripts/material-cache.mjs';
import {filmPrograms,programSegments} from '../../scripts/film-program.mjs';
import {storyFilm016} from '../../scripts/story-films-016.mjs';
type Engine={draw:(t:number)=>void;dispose:()=>void;overlay?:(g:CanvasRenderingContext2D,c:EffectConfig,t:number)=>void};
const threeStyles=new Set(['3d-render','isometric','synthwave','hud']);
const shaderStyles=new Set(['liquid','aurora-glass']);
let fontReady:Promise<void>|undefined;
function fonts(){if(!fontReady)fontReady=(async()=>{const font=await new FontFace('Noto Sans SC',`url("${staticFile('NotoSansSC.ttf')}")`,{weight:'100 900'}).load();document.fonts.add(font);})();return fontReady;}
async function loadAssets(style:string):Promise<EffectAssets>{const urls:Record<string,string>=style==='collage'?{atlas:'effects/ocean-atlas-v2.png'}:style==='hanazi'?{photo:'effects/cafe-surprise-012.png',pour:'effects/night-cafe-v3-pour.png',relax:'effects/cafe-laugh-012.png'}:style==='cel-boil'?{paper:'paper.jpg'}:style==='aurora-glass'?{glassPhoto:'effects/coast-017.png'}:{};return Object.fromEntries(await Promise.all(Object.entries(urls).map(async([key,path])=>{const im=new Image();im.src=staticFile(path);await im.decode();return [key,im];})));}
function overlay(g:CanvasRenderingContext2D,c:EffectConfig,seconds:number){
 const t=seconds/c.duration*10;g.clearRect(0,0,W,H);const light=false,fg=light?'#183533':'#efe9d6';
 if(c.style==='aurora-glass'){g.save();g.globalAlpha=smooth(0,.6,t);text(g,'PRISM / 折光电台',44,40,13,'#ddd8fa','left',500);text(g,'LIGHT IN MOTION',1236,40,12,'#b5bcea','right',450);g.restore();const end=smooth(8.3,9.3,t);g.save();g.globalAlpha=end;text(g,c.title,640,356,76,'#f8f6ff','center',750,1100);text(g,c.subtitle,640,417,25,'#e4e4ff','center',450,1100);g.restore();return;}
 if(c.style==='3d-render'){const fg='#efe7d5';text(g,'MAGNETIC BLOOM / 磁场花开',45,42,13,fg,'left',500);const end=smooth(8.1,8.8,t);g.save();g.globalAlpha=end;text(g,c.title,48,622,46,fg,'left',700);text(g,c.subtitle,48,661,17,fg,'left',400);g.restore();return;}
 filmOverlay(g,c,t);
}
export function EffectScene({config,studioFrames}:{config:EffectConfig;studioFrames?:string}){
 const frame=useCurrentFrame(),t=frame/30;
 const craftedScore=true;
 const storyScore=storyFilm016(config.style,config.storyId);
 const base=useRef<HTMLCanvasElement>(null),top=useRef<HTMLCanvasElement>(null),engine=useRef<Engine|null>(null);
 const engineConfig=useRef<EffectConfig>({...config});
 const [assets,setAssets]=useState<EffectAssets|null>(null),[error,setError]=useState('');
 const [handle]=useState(()=>delayRender('加载效果模板、字体与本地素材'));
 const released=useRef(false),[ready,setReady]=useState(false);
 const plate=Boolean(studioFrames)||hasMaterialPlate(config);
 const signature=JSON.stringify(config),gpu=!plate&&(threeStyles.has(config.style)||shaderStyles.has(config.style));
 const rendererKey=JSON.stringify(config.style==='liquid'?[config.style,plate,studioFrames]:[config.style,config.primary,config.secondary,config.count,config.intensity,config.detail,config.seed,config.duration,plate,studioFrames,...(config.style==='aurora-glass'?[config.title,config.subtitle,config.words,config.storyId]:[])]);
 useEffect(()=>{
  let disposed=false;setReady(false);setAssets(null);setError('');
  (async()=>{
   const [images,module]=await Promise.all([loadAssets(config.style),plate?Promise.resolve(null):config.style==='3d-render'?import('./magnetic-preview'):config.style==='isometric'?import('./isometric-film-014'):config.style==='synthwave'?import('./neon-film-014'):config.style==='hud'?import('./hud-film-015'):config.style==='aurora-glass'?import('./glass-film-017'):config.style==='liquid'?import('./liquid-film-015'):threeStyles.has(config.style)?import('./three-v3'):Promise.resolve(null),fonts()]);
   if(disposed)return;
   if(base.current&&module){engineConfig.current={...config};engine.current='createGlass017' in module?module.createGlass017(base.current,engineConfig.current,images):'createThree' in module?module.createThree(base.current,engineConfig.current,images):module.createShader(base.current,engineConfig.current);if('paintNeonOverlay' in module)engine.current.overlay=module.paintNeonOverlay as NonNullable<Engine['overlay']>;if('paintHudOverlay' in module)engine.current.overlay=module.paintHudOverlay as NonNullable<Engine['overlay']>;if('paintGlassOverlay014' in module)engine.current.overlay=module.paintGlassOverlay014 as NonNullable<Engine['overlay']>;}
   setAssets(images);setReady(true);
  })().catch(e=>{if(!disposed){if(getRemotionEnvironment().isRendering)cancelRender(e);setError(e instanceof Error?e.message:String(e));continueRender(handle);}});
  return()=>{disposed=true;engine.current?.dispose();engine.current=null;continueRender(handle);};
 },[rendererKey,handle]);
 useLayoutEffect(()=>{
  if(!ready||!assets||!base.current||!top.current)return;
  try{
   Object.assign(engineConfig.current,config,{shots:config.shots});
   if(plate){/* The rendered plate is decoded by Remotion; text and score remain live. */}else if(gpu){engine.current?.draw(t);const g=top.current.getContext('2d')!;if(engine.current?.overlay){g.clearRect(0,0,W,H);engine.current.overlay(g,config,t);}else overlay(g,config,t);}else paintCanvasV3(base.current.getContext('2d')!,config,t,assets);
   if(!released.current){released.current=true;requestAnimationFrame(()=>requestAnimationFrame(()=>continueRender(handle)));}
  }catch(e){if(getRemotionEnvironment().isRendering)cancelRender(e);setError(e instanceof Error?e.message:String(e));continueRender(handle);}
 },[ready,assets,t,signature,handle,gpu,plate]);
 return <AbsoluteFill style={{background:'#f4eddf'}} data-effect={config.style}>
  {plate&&<StudioFilm config={config} studioFrames={studioFrames}/>}
  <canvas key={rendererKey} ref={base} width={1280} height={720} style={{position:'absolute',width:'100%',height:'100%',display:plate?'none':'block'}} aria-label={`${getEffect(config.style).name}独立效果模板`}/>
  <canvas ref={top} width={1280} height={720} style={{position:'absolute',width:'100%',height:'100%',display:gpu?'block':'none',pointerEvents:'none'}} aria-hidden="true"/>
  {config.sound&&(filmPrograms[config.style]?<ProgramAudio config={config}/>:<Loop durationInFrames={craftedScore?Math.round(config.duration*30):300}><Audio playbackRate={craftedScore?10/config.duration:1} src={staticFile(storyScore?`effects/score-${config.style}-${storyScore.id}-${['cel-boil','morph','aurora-glass'].includes(config.style)?'017':'016'}.wav`:`effects/score-${config.style==='3d-render'?'magnetic':config.style==='isometric'?'isometric-014':config.style==='aurora-glass'?'prism-014':config.style==='cel-boil'?'wind-014':config.style==='morph'?'morph-014':config.style==='bauhaus'?'bauhaus-014':config.style==='hanazi'?'hanazi-014':config.style==='flat-vector'?'citrus-014':config.style==='line-art'?'line-014':config.style==='paperclip'?'solar-014':config.style==='collage'?'collage-014':config.style==='liquid'?'liquid-015':config.style}.wav`)} volume={Math.min(1,frame/12,Math.max(0,(config.duration*30-1-frame)/25))*.7}/></Loop>)}
  {error?<div role="alert" style={{position:'absolute',inset:0,background:'#f4eddf',padding:70,fontSize:28,color:'#7d2525'}}>效果渲染失败：{error}</div>:!ready?<div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',background:'#f4eddf',color:'#47544b',fontSize:24}}>正在准备本地效果…</div>:null}
 </AbsoluteFill>;
}
function ProgramAudio({config}:{config:EffectConfig}){const frame=useCurrentFrame(),segments=programSegments(config),total=segments.reduce((n,s)=>n+s.seconds,0);let at=0;return <><Loop durationInFrames={300}><Audio src={staticFile(`effects/score-${config.style}-013-bed.wav`)} volume={Math.min(1,frame/12,Math.max(0,(config.duration*30-1-frame)/20))*.6}/></Loop>{segments.map(shot=>{const from=Math.round(at/total*config.duration*30);at+=shot.seconds;const durationInFrames=Math.round(at/total*config.duration*30)-from;return <Sequence key={shot.id} from={from} durationInFrames={durationInFrames} layout="none"><Audio src={staticFile(`effects/cue-${config.style}-${shot.action}-013.wav`)} playbackRate={2.5/(durationInFrames/30)} volume={.6}/></Sequence>;})}</>;}
