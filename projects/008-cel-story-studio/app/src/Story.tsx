import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, Audio, Loop, Sequence, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {compileTimeline,FPS,getDuration,type StoryProps} from './model';
import {paintVisual} from './visuals';
import {getStyle} from '../scripts/styles.mjs';
import {paintWorld} from './world-paint';
import {paintCapabilities} from './capability-paint';

export const CelStory = (props:StoryProps) => {
  const frame=useCurrentFrame();
  const timeline=compileTimeline(props.shots);
  const total=getDuration(props.shots);
  const fade=Math.min(1,frame/6,(total-1-frame)/12);
  const cues=timeline.flatMap(shot=>{
    const active=props.world?[...new Set((shot.cast||[]).map(c=>c.action))]:[shot.action];
    return active.flatMap(action=>{
      if(action==='celebrate')return [{id:shot.id+'-light',from:shot.from+Math.round(shot.durationFrames*.1),file:'chime.wav',length:17}];
      if(!['jump','fail'].includes(action))return [];
      return [{id:shot.id+'-'+action+'-up',from:shot.from+Math.round(shot.durationFrames*.2),file:'jump.wav',length:6},
        {id:shot.id+'-'+action+'-down',from:shot.from+Math.round(shot.durationFrames*.8),file:action==='fail'?'fail.wav':'land.wav',length:action==='fail'?10:6}];
    });
  });
  const canvas=useRef<HTMLCanvasElement>(null);
  const released=useRef(false);
  const [assets,setAssets]=useState<HTMLImageElement|null>(null);
  const [handle]=useState(()=>delayRender('Loading local paper and Chinese font'));
  useEffect(()=>{
    let cancelled=false;
    const texture=new Image();
    const font=new FontFace('StorySans',`url("${staticFile('NotoSansSC.ttf')}")`,{weight:'100 900'});
    const imageReady=new Promise<void>((resolve,reject)=>{texture.onload=()=>resolve();texture.onerror=()=>reject(new Error('纸纹加载失败'));texture.src=staticFile('paper.jpg');});
    Promise.all([font.load(),imageReady]).then(([loaded])=>{
      if(cancelled)return;
      document.fonts.add(loaded);
      setAssets(texture);
    }).catch(error=>{if(!cancelled)cancelRender(error);});
    return()=>{cancelled=true;continueRender(handle);};
  },[handle]);
  useLayoutEffect(()=>{
    if(!assets||!canvas.current)return;
    const ctx=canvas.current.getContext('2d');
    if(ctx){
      if(props.world)paintWorld(ctx,frame,props,assets);else paintVisual(ctx,frame,props,assets);
      paintCapabilities(ctx,frame,props,assets);
      if(!released.current){continueRender(handle);released.current=true;}
    }
  },[frame,props,assets,handle]);
  return <AbsoluteFill style={{background:'#f4ebd5'}}>
    <canvas ref={canvas} width={1280} height={720} style={{width:'100%',height:'100%'}} aria-label={`${getStyle(props.style).name}故事画面`}/>
    {props.sound&&<>
      <Loop durationInFrames={FPS*8}><Audio src={staticFile('bed.wav')} volume={Math.max(0,fade)*.7}/></Loop>
      {cues.map(cue=><Sequence key={cue.id} from={cue.from} durationInFrames={Math.min(cue.length,total-cue.from)} layout="none"><Audio src={staticFile(cue.file)} volume={.8}/></Sequence>)}
    </>}
  </AbsoluteFill>;
};
