import {useEffect,useRef,useState} from 'react';
import {getEffect} from '../scripts/effects.mjs';
import {legacyExamples017} from '../scripts/legacy-effects-017.mjs';
import {legacyExamples013} from '../scripts/legacy-effects-013.mjs';
import {filmCollection} from './effects/collection';
import type {StyleId} from '../scripts/styles.mjs';
export function EffectTheater({id,onClose,onEdit}:{id:StyleId;onClose:()=>void;onEdit:()=>void}){
 const ref=useRef<HTMLDialogElement>(null),style=getEffect(id);
 const video=useRef<HTMLVideoElement>(null),[ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[error,setError]=useState('');
 const [previous,setPrevious]=useState(false),revised=true,materialRevision=id==='liquid'||id==='hud',storyRevision=id==='line-art'||id==='paperclip',performanceRevision=['cel-boil','morph','aurora-glass'].includes(id);
 const folder=previous?(performanceRevision?'quality-before-017':storyRevision?'quality-before-016':materialRevision?'quality-before-015':'quality-before-014'):'effect-examples';
 const oldStory=id==='line-art'?{title:'把海写成星空',subtitle:'让每一次呼吸，接续更远的世界'}:{title:'白天的光，夜里的灯',subtitle:'跟随一条能量路径，看见昼夜之间的联系'};
 const previousTitle=performanceRevision?legacyExamples017[id]!.title:storyRevision?oldStory.title:materialRevision?style.example[0]:legacyExamples013[id]?.title||style.example[0],previousDescription=performanceRevision?legacyExamples017[id]!.subtitle:storyRevision?oldStory.subtitle:materialRevision?style.example[1]:legacyExamples013[id]?.subtitle||style.example[1];
 useEffect(()=>{const d=ref.current;d?.showModal();return()=>{d?.close();};},[]);
 return <dialog className="effect-theater" ref={ref} onCancel={onClose} aria-label={`${style.example[0]}原创样片`}>
  <div className="theater-heading"><div><small>AFTER HOURS / ORIGINAL FILM</small><h2>{previous?previousTitle:style.example[0]}<span>{style.name} · 10 秒</span></h2></div><button aria-label="关闭样片放映" onClick={onClose}>×</button></div>
  <div className="theater-screen"><video key={folder} ref={video} autoPlay controls playsInline preload="auto" src={`${folder}/${id}.mp4?v=017`} poster={`${folder}/${id}.jpg?v=017`} aria-label={`${previous?previousTitle:style.example[0]}完整影片`} onCanPlay={()=>setReady(true)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setError('影片加载失败，请尝试单独下载观看。')}/>{!ready&&!error&&<span className="theater-loading" role="status">正在准备影片…</span>}{error&&<span className="theater-loading" role="alert">{error}</span>}</div>
  <div className="theater-footer"><p>{previous?previousDescription:style.example[1]}<small>{previous?(performanceRevision?'修改前 · 0.14完整影片':storyRevision?'修改前 · 0.14完整影片':materialRevision?'修改前 · 0.14工作台快照':'修改前 · 0.13工作台快照'):`当前成片 · ${filmCollection.find(f=>f.id===id)?.revision} 版本`} · {ready?'影片已就绪':'正在加载本地影片'}</small></p><button className="outline" disabled={!ready} onClick={()=>{if(playing)video.current?.pause();else void video.current?.play();}}>{playing?'暂停影片':'播放影片'}</button>{revised&&<button className="outline" onClick={()=>{video.current?.pause();setReady(false);setError('');setPrevious(p=>!p);}}>{previous?'返回本轮版本':'对比上一版作品'}</button>}{<a href={`quality-before/${id}.mp4`} target="_blank" rel="noreferrer">更早的 0.8 原型 ↗</a>}<button className="outline" onClick={onEdit}>编辑这个样例 ↗</button><a href={`${folder}/${id}.mp4`} download>下载 MP4 ↓</a></div>
 </dialog>;
}
