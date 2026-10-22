import {AbsoluteFill,Img,OffthreadVideo,staticFile,useCurrentFrame} from 'remotion';
import type {EffectConfig} from '../../scripts/effects.mjs';
export function StudioFilm({config,studioFrames}:{config:EffectConfig;studioFrames?:string}){
 const f=useCurrentFrame(),t=f/30/config.duration*10,liquid=config.style==='liquid';
 const end=Math.max(0,Math.min(1,(t-8.1)/.8)),intro=Math.max(0,1-t/2.5);
 return <AbsoluteFill>
  {studioFrames?<Img src={`${studioFrames}/${String(f).padStart(4,'0')}.jpg`} style={{width:'100%',height:'100%'}}/>:<OffthreadVideo muted src={staticFile(`effects/studio-${liquid?'liquid':'magnetic'}-plate.mp4`)} playbackRate={10/config.duration} style={{width:'100%',height:'100%'}}/>}
  <AbsoluteFill style={{fontFamily:'Noto Sans SC',color:'#f2e9d7',padding:48,background:'linear-gradient(180deg,#071b2b10,transparent 35%,transparent 70%,#071b2b38)'}}>
   <div style={{display:'flex',justifyContent:'space-between',fontSize:13,letterSpacing:3}}>{liquid?'TIDAL / OPTICAL MATTER':'MAGNETIC BLOOM · ORIGINAL FILM'} <span>{liquid?'ABSORPTION / TRANSMISSION / FORM':'PORCELAIN / COPPER / FORCE'}</span></div>
   <div style={{opacity:intro,marginTop:34,fontSize:23,fontWeight:500}}>{liquid?'一滴光，正在聚合。':'无形的力，正在发生。'}</div>
   <div style={{marginTop:'auto',opacity:end,transform:`translateY(${(1-end)*18}px)`}}><div style={{fontSize:46,fontWeight:700,letterSpacing:5}}>{config.title}</div><div style={{fontSize:17,marginTop:10,letterSpacing:2}}>{config.subtitle}</div></div>
   <div style={{position:'absolute',right:49,bottom:48,fontSize:12,letterSpacing:2}}>{config.words[Math.min(config.words.length-1,Math.floor(t/10*config.words.length))]} · {String(Math.min(300,Math.floor(t*30)+1)).padStart(3,'0')}</div>
  </AbsoluteFill>
 </AbsoluteFill>;
}
