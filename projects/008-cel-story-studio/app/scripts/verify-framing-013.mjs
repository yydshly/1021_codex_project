// Reproducible camera check for the twelve programmable film actions.
// This renders the actual body engines through Remotion. Text overlays and
// canvas-text label generation are suppressed only in this verification entry.
import {bundle} from '@remotion/bundler';
import {renderStill,openBrowser} from '@remotion/renderer';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {effectDefaults,validateEffect} from './effects.mjs';
import {defaultShots} from './film-program.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.resolve(root,'../assets/review-013/framing');
const reportPath=path.resolve(out,'../framing.json');
const entry=path.join(root,'.cache/framing-013-entry.tsx');
const styles=['synthwave','pixel','hud'];
await mkdir(out,{recursive:true});await mkdir(path.dirname(entry),{recursive:true});
await writeFile(entry,`
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import type {EffectConfig} from '../scripts/effects.mjs';
import {effectDefaults} from '../scripts/effects.mjs';
import {createThree as createNeon} from '../src/effects/neon-film-013';
import {createThree as createHud} from '../src/effects/hud-film-013';
import {pixelFilm013} from '../src/effects/pixel-film-013';
function withoutCanvasText<T>(fn:()=>T):T{
 const p=CanvasRenderingContext2D.prototype,fill=p.fillText,stroke=p.strokeText;
 p.fillText=function(){};p.strokeText=function(){};
 try{return fn();}finally{p.fillText=fill;p.strokeText=stroke;}
}
function Body({config}:{config:EffectConfig}){
 const frame=useCurrentFrame(),canvas=useRef<HTMLCanvasElement>(null),engine=useRef<{draw:(seconds:number)=>void;dispose:()=>void}|null>(null),[ready,setReady]=useState(false);
 const [handle]=useState(()=>delayRender('镜头构图检查'));
 useEffect(()=>{
  try{engine.current=config.style==='pixel'?null:withoutCanvasText(()=>config.style==='hud'?createHud(canvas.current!,config):createNeon(canvas.current!,config));setReady(true);}
  catch(e){cancelRender(e instanceof Error?e:new Error(String(e)));}
  return()=>engine.current?.dispose();
 },[]);
 useLayoutEffect(()=>{if(!ready)return;try{
  if(config.style==='pixel')withoutCanvasText(()=>pixelFilm013(canvas.current!.getContext('2d')!,config,frame/30));else engine.current!.draw(frame/30);
  requestAnimationFrame(()=>requestAnimationFrame(()=>continueRender(handle)));
 }catch(e){cancelRender(e instanceof Error?e:new Error(String(e)));}},[frame,ready]);
 return <AbsoluteFill><canvas ref={canvas} width={1280} height={720}/></AbsoluteFill>;
}
registerRoot(()=> <Composition id="FramingCheck" component={Body} width={1280} height={720} fps={30} durationInFrames={300} defaultProps={{config:effectDefaults('pixel')}}/>);
`);
const serveUrl=await bundle({entryPoint:entry,publicDir:path.join(root,'public'),outDir:path.join(root,'.cache/framing-013-bundle')});
const browserExecutable=process.env.CHROME_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser=await openBrowser('chrome',{browserExecutable,chromeMode:'chrome-for-testing'});
const checks=[];
try{
 for(const style of styles){
  const shots=defaultShots(style);let start=0;
  for(let index=0;index<shots.length;index++){
   const shot=shots[index],seconds=start+shot.seconds*.5,frame=Math.round(seconds*30),files={};
   for(const framing of ['wide','close']){
    const config=validateEffect({...effectDefaults(style),sound:false,shots:shots.map((s,i)=>i===index?{...s,framing}:s)});
    const inputProps={config},file=`${style}-${shot.action}-${framing}.jpg`;files[framing]=file;
    const composition={id:'FramingCheck',width:1280,height:720,fps:30,durationInFrames:300,props:inputProps,defaultProps:inputProps};
    await renderStill({serveUrl,composition,inputProps,puppeteerInstance:browser,timeoutInMilliseconds:90000,frame,output:path.join(out,file),imageFormat:'jpeg',jpegQuality:94});
   }
   checks.push({style,action:shot.action,shotIndex:index,targetProgress:.5,renderedFrame:frame,renderedSeconds:frame/30,actionProgress:(frame/30-start)/shot.seconds,files});
   console.log(`${style}/${shot.action}: wide + close`);start+=shot.seconds;
  }
 }
}finally{await browser.close({silent:true});}
const report={version:'0.13',verifiedAt:new Date().toISOString(),scope:'十二种动作逐一只改变镜头的 wide/close，使用默认四镜时间轴的动作中点。输出24张主体帧，不合成视频，不操作网页。',textExclusion:'独立核验入口不绘制三维影片HUD/字幕；Canvas fillText/strokeText在构造纹理与绘制像素帧时临时禁用。主体差异另取x=360,y=135,w=620,h=400区域，避开像素MOON招牌字形。主体、相机与动作使用原模块；未改生产源码。',crop:{x:360,y:135,width:620,height:400},checks,visualReviewPending:true,limits:'这里只验证改变framing会改变主体取景；图像差异数值不代表艺术质量，也不保证任意动作顺序的世界状态连续。'};
await writeFile(reportPath,JSON.stringify(report,null,2));
const python=String.raw`
import json,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageChops,ImageStat
folder=Path(sys.argv[1]);report_file=Path(sys.argv[2]);r=json.loads(report_file.read_text(encoding='utf-8'));roi=r['crop'];box=(roi['x'],roi['y'],roi['x']+roi['width'],roi['y']+roi['height'])
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',18)
for c in r['checks']:
 a=Image.open(folder/c['files']['wide']).convert('RGB').crop(box);b=Image.open(folder/c['files']['close']).convert('RGB').crop(box);diff=ImageChops.difference(a,b);mean=sum(ImageStat.Stat(diff).mean)/3
 pixels=list(diff.getdata());ratio=sum(1 for p in pixels if sum(p)/3>20)/len(pixels)
 c['bodyDifference']={'meanAbsoluteRGB255':round(mean,3),'changedPixelRatioAbove20':round(ratio,4),'passed':mean>2 and ratio>.05}
for style in ['synthwave','pixel','hud']:
 sheet=Image.new('RGB',(1280,1552),'#07101a');d=ImageDraw.Draw(sheet)
 for row,c in enumerate(x for x in r['checks'] if x['style']==style):
  for col,framing in enumerate(['wide','close']):
   x=col*640;y=row*388;d.text((x+10,y+4),f"{style} / {c['action']} / {framing}",font=font,fill='#bce4e8');im=Image.open(folder/c['files'][framing]);im=im.resize((640,360));sheet.paste(im,(x,y+28))
 sheet.save(folder/f'{style}-contact.jpg',quality=94)
r['thresholdExplanation']='主体裁图平均RGB绝对差>2/255、超过20/255的像素比例>5%，仅排除镜头参数完全无效的情况，不是审美评分。'
r['allBodyDifferencesPassed']=all(c['bodyDifference']['passed'] for c in r['checks']);report_file.write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'passed':r['allBodyDifferencesPassed'],'checks':[{ 'style':c['style'],'action':c['action'],**c['bodyDifference']} for c in r['checks']]}))
`;
const proc=spawnSync('python',['-c',python,out,reportPath],{cwd:root,windowsHide:true,encoding:'utf8',maxBuffer:2000000});
if(proc.status!==0)throw new Error(proc.stderr||'主体构图差异统计失败');console.log(proc.stdout.trim());
const final=JSON.parse(await readFile(reportPath,'utf8'));if(!final.allBodyDifferencesPassed)process.exitCode=1;
