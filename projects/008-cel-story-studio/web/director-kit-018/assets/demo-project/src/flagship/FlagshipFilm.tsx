import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {AbsoluteFill,Audio,Loop,Sequence,cancelRender,continueRender,delayRender,staticFile,useCurrentFrame} from 'remotion';
import type {FlagshipConfig} from '../../scripts/flagship-schema.mjs';
import {paintFlagship018,type Assets018} from './paint-018';
let assetsPromise:Promise<Assets018>|undefined;
function loadAssets(){return assetsPromise??=(async()=>{const images=await Promise.all(['director-018/workshop.png','director-018/ocean.png','paper.jpg'].map(async(path)=>{const im=new Image();im.src=staticFile(path);await im.decode();return im;}));const font=await new FontFace('Noto Sans SC',`url("${staticFile('NotoSansSC.ttf')}")`,{weight:'100 900'}).load();document.fonts.add(font);return {workshop:images[0],ocean:images[1],paper:images[2]};})();}
export function FlagshipFilm({config}:{config:FlagshipConfig}){
 const frame=useCurrentFrame(),canvas=useRef<HTMLCanvasElement>(null);
 const [assets,setAssets]=useState<Assets018|null>(null),[error,setError]=useState('');
 const [handle]=useState(()=>delayRender('载入原创绘本场景与字体'));
 useEffect(()=>{let disposed=false;loadAssets().then(a=>{if(!disposed)setAssets(a);}).catch(e=>{setError(String(e));cancelRender(e);});return()=>{disposed=true;continueRender(handle);};},[handle]);
 useLayoutEffect(()=>{if(!assets||!canvas.current)return;try{paintFlagship018(canvas.current.getContext('2d')!,config,frame/30,assets);continueRender(handle);}catch(e){setError(String(e));cancelRender(e);}},[assets,config,frame,handle]);
 const total=config.shots.reduce((n,s)=>n+s.seconds,0);let at=0;
 return <AbsoluteFill style={{background:'#efe2c6'}}><canvas ref={canvas} width={1920} height={1080} style={{width:'100%',height:'100%'}} aria-label="原创手绘故事影片"/>{error&&<div role="alert">{error}</div>}
 {config.sound&&<><Loop durationInFrames={900}><Audio src={staticFile('director-018/bed.wav')} volume={.65*Math.min(1,frame/20,Math.max(0,(total*30-frame)/25))}/></Loop>{config.shots.map(s=>{const from=Math.round(at*30);at+=s.seconds;return <Sequence key={s.id} from={from} durationInFrames={Math.round(s.seconds*30)} layout="none"><Audio src={staticFile(`director-018/cue-${s.event}.wav`)} playbackRate={3/s.seconds} volume={.6}/></Sequence>;})}</>}
 </AbsoluteFill>;
}
