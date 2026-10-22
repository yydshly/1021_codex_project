import type {EffectConfig} from '../../scripts/effects.mjs';
import type {EffectAssets} from './canvas';
import {createShader,glassState014} from './prism-film-014';
import {clamp,lerp,smooth,text,rr,TAU,hash} from './math';
type G=CanvasRenderingContext2D;const WHITE='#f5f1ff',MUTED='#bbcae6';
export function glassState017(seconds:number,c:EffectConfig){
 const base=glassState014(seconds,c),t=base.time,open=smooth(0,1.4,t),work=smooth(1.8,3.2,t),out=smooth(6.9,8.6,t),mix=c.storyId==='rainmix';
 const main={x:lerp(lerp(670,568,work),880,out),y:lerp(lerp(390,356,open),368,out),w:lerp(lerp(930,860,open),690,out),h:lerp(630,565,out),angle:lerp(-.035,.035,out),alpha:smooth(0,.55,t)};
 const cards=[main,{x:lerp(1160,1114,work)+out*220,y:lerp(180,190,work),w:220,h:184,angle:-.04,alpha:smooth(1,2,t)*(1-out)}, {x:lerp(1120,1110,work)+out*200,y:lerp(485,472,work),w:250,h:278,angle:.035,alpha:smooth(1.9,3.1,t)*(1-out)}];
 const lens={x:lerp(mix?393:1084,mix?666:735,smooth(3.1,4.7,t)),y:lerp(mix?375:439,mix?458:325,smooth(3.1,4.7,t)),w:190,h:132,angle:.02*Math.sin(t),alpha:smooth(2.7,3.2,t)*(1-smooth(5.5,6.5,t)),magnification:1.25+c.detail*.11};
 return {...base,cards,lens,reveal:out,time:t};
}
function txt(g:G,s:string,x:number,y:number,size=24,color=WHITE,weight=500,max=930){text(g,s,x,y,size,color,'left',weight,max);}
function line(g:G,p:number[][],color:string,w=2){g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.strokeStyle=color;g.lineWidth=w;g.stroke();}
function dot(g:G,x:number,y:number,r:number,col:string|CanvasGradient){g.beginPath();g.arc(x,y,r,0,TAU);g.fillStyle=col;g.fill();}
function pane(g:G,x:number,y:number,w:number,h:number,color='#ffffff12',r=16){g.fillStyle=color;rr(g,x,y,w,h,r);g.fill();}
function photo(g:G,im:HTMLImageElement,x:number,y:number,w:number,h:number,grade:number){g.save();rr(g,x,y,w,h,12);g.clip();const scale=Math.max(w/im.width,h/im.height),dw=im.width*scale,dh=im.height*scale;g.filter=`brightness(${lerp(.74,1,grade)}) saturate(${lerp(.58,1.08,grade)}) contrast(${lerp(.90,1.02,grade)})`;g.drawImage(im,x-(dw-w)*.5,y-(dh-h)*.5,dw,dh);g.filter='none';g.globalCompositeOperation='source-atop';g.fillStyle=`rgba(45,78,139,${(1-grade)*.23})`;g.fillRect(x,y,w,h);g.restore();}
function drawDarkroom(g:G,c:EffectConfig,t:number,im:HTMLImageElement){
 const grade=smooth(2.35,4.65,t)*clamp(c.intensity/.65),compare=smooth(4.7,5.1,t)*(1-smooth(6.1,6.7,t)),out=smooth(6.9,8.45,t),sweep=(.5+Math.sin(t*.7)*.15)*compare;
 txt(g,out>.5?'COAST / COLLECTION 017':'LUMA / A SMALL DARKROOM',48,61,19,MUTED,550);txt(g,t<2?'海岸来信':t<6.8?'让照片，找回光。':'这一刻，可以收藏。',48,117,37,WHITE,650);
 const image={x:48,y:156,w:928,h:452};photo(g,im,image.x,image.y,image.w,image.h,grade);
 if(compare>0){g.save();g.beginPath();g.rect(image.x,image.y,image.w*sweep,image.h);g.clip();photo(g,im,image.x,image.y,image.w,image.h,0);g.restore();const xx=image.x+image.w*sweep;line(g,[[xx,image.y],[xx,image.y+image.h]],'#f5f0d8',2.4);dot(g,xx,image.y+image.h*.5,16,'#f5efd8');txt(g,'原片',image.x+17,image.y+34,17,WHITE,600);txt(g,'晨光',Math.max(xx+24,820),image.y+34,17,WHITE,600);}
 txt(g,out>.5?'LIGHT KEPT. MEMORY MADE.':c.subtitle,50,657,24,MUTED,450,900);
 pane(g,48,695,156,44,'#ffffff14',22);txt(g,c.words[t<2.3?0:t<6.8?1:2]||'收藏',73,726,20,WHITE,600);txt(g,t<6.8?'DISPLAY TRANSFORM / 演示':'EDITION 017 / ORIGINAL IMAGE',652,726,14,MUTED,500,330);
 for(let i=0;i<c.count*4;i++){const xx=50+i/(c.count*4-1)*922;line(g,[[xx,621],[xx,621+(i%4===0?8:3)]],'#c3d8eb60',1);}
 g.save();g.translate(1024,0);txt(g,'风格预设',29,48,27,MUTED,500,450);txt(g,'晨光',30,109,47,WHITE,650);for(let i=0;i<4;i++){const col=['#7e99c0','#ecc17a','#cc846e','#67a6a8'][i];pane(g,30+i*111,162,87,98,col,10);if(i===1){g.strokeStyle=WHITE;g.lineWidth=4;rr(g,26+i*111,158,95,106,13);g.stroke();}}txt(g,t<2.35?'选择一个光的方向':'预设已应用',30,328,20,MUTED,450,430);g.restore();
 g.save();g.translate(1024,384);txt(g,'调色',30,44,25,MUTED,500);txt(g,'暖意',30,110,22,WHITE,500);txt(g,`${Math.round(grade*100)}%`,326,110,23,WHITE,500,130);line(g,[[31,149],[477,149]],'#e3deff55',5);line(g,[[31,149],[31+446*grade,149]],c.secondary,5);dot(g,31+446*grade,149,11,WHITE);
 txt(g,'曝光显示',30,218,22,MUTED,450);txt(g,`+${Math.log2(lerp(.74,1,grade)/.74).toFixed(1)} EV`,282,218,24,WHITE,500,195);txt(g,t<4.7?'保留蓝色阴影':'按住比较原片',30,304,20,MUTED,450,430);g.restore();
}
function signal(x:number,t:number,k:number){return k===0?(Math.sin(x*31+t*2)+.4*Math.sin(x*83-t*3))*.4:k===1?Math.sin(x*62-t*4)*Math.exp(-((x*5)%1)*2):Math.sin(x*15-t*2)*.65;}
function gains(c:EffectConfig,t:number){const u=smooth(2.4,5.5,t)*clamp(c.intensity/.65);return [lerp(.9,.48,u),lerp(.2,.72,u),lerp(.15,.55,u)];}
function drawRainmix(g:G,c:EffectConfig,t:number){
 const out=smooth(6.9,8.4,t),levels=gains(c,t),selected=t<2.2?0:t<4.3?1:2;
 txt(g,out>.6?'AFTER RAIN / MASTER':'AFTER RAIN / THREE VOICES',48,61,19,MUTED,550);txt(g,t<6.9?'让声音，找到彼此。':'把这一夜，留在唱片里。',48,115,36,WHITE,650);
 const names=['雨 / RAIN','铃 / BELL','低音 / BASS'],colors=[c.secondary,'#edc282','#a5a9fa'];
 if(out<1){g.save();g.globalAlpha=1-out;for(let k=0;k<3;k++){
  const y=164+k*145;pane(g,45,y,934,126,k===selected?'#ffffff16':'#ffffff08',15);txt(g,names[k],64,y+39,20,colors[k],600);line(g,[[268,y+63],[945,y+63]],'#dde4ff20',1);
  const n=120+c.count*15,points=Array.from({length:n},(_,i)=>{const x=i/(n-1);return [271+x*672,y+65+signal(x,t,k)*35*levels[k]];});line(g,points,colors[k],2.2);dot(g,64+160*levels[k],y+79,7,colors[k]);line(g,[[64,y+79],[218,y+79]],'#dbe7ff40',2);
 }g.restore();}
 // A new output layout replaces the tracks; it is not a fourth static card.
 if(out>0){g.save();g.globalAlpha=out;const x=264,y=359,r=174;pane(g,48,160,928,453,'#101a2d7a',20);g.translate(x,y);const grad=g.createRadialGradient(-40,-40,5,0,0,r);grad.addColorStop(0,'#58508d');grad.addColorStop(.55,'#171c3a');grad.addColorStop(1,'#070f20');dot(g,0,0,r,grad as unknown as string);for(let i=0;i<22;i++){g.beginPath();g.arc(0,0,48+i*5.5,0,TAU);g.strokeStyle=i%2?'#bca9e529':'#98c6df26';g.lineWidth=.8;g.stroke();}dot(g,0,0,47,c.secondary);dot(g,0,0,8,'#132337');g.restore();
  g.save();g.globalAlpha=out;txt(g,'AFTER',501,299,64,WHITE,650,460);txt(g,'RAIN',501,371,64,WHITE,650,460);txt(g,'雨 · 铃 · 低音',505,424,23,MUTED,450);line(g,[[505,461],[899,461]],'#f8f4ff69',1);txt(g,'THREE VOICES. ONE NIGHT.',505,501,16,MUTED,550,460);g.restore();
 }
 txt(g,`${c.words[t<2.4?0:t<6.9?1:2]||'混合'} / ${t<6.9?'混合预览':'已生成封面'}`,50,657,25,WHITE,550);const sum=Array.from({length:260},(_,i)=>{const x=i/259;return [50+x*920,713+[0,1,2].reduce((v,k)=>v+signal(x,t,k)*levels[k],0)*17];});line(g,sum,c.secondary,2);
 g.save();g.translate(1024,0);txt(g,'声部',30,45,27,MUTED,500);for(let k=0;k<3;k++){pane(g,27,76+k*83,455,64,k===selected?'#ffffff1c':'#ffffff08',12);txt(g,names[k],47,116+k*83,24,colors[k],550);}g.restore();
 g.save();g.translate(1024,384);txt(g,'混合比例',29,47,26,MUTED,500);for(let k=0;k<3;k++){txt(g,['RAIN','BELL','BASS'][k],29,105+k*81,18,colors[k],550);line(g,[[148,99+k*81],[466,99+k*81]],'#dae4ff40',5);line(g,[[148,99+k*81],[148+318*levels[k],99+k*81]],colors[k],5);dot(g,148+318*levels[k],99+k*81,9,WHITE);}g.restore();
}
export function paintGlassOverlay017(g:G,c:EffectConfig,seconds:number){const t=seconds/c.duration*10,out=smooth(7.4,8.45,t);g.clearRect(0,0,1280,720);text(g,'纸间 / 光的工作室',36,34,12,'#dfe3fb','left',500);text(g,'A CHANGE YOU CAN SEE / 017',1243,34,11,'#c3d6e7','right',450);if(out>0){g.save();g.globalAlpha=out;text(g,c.title,52,272,c.title.length>10?45:55,WHITE,'left',650,510);text(g,c.subtitle,56,325,22,MUTED,'left',450,465);line(g,[[58,367],[428,367]],'#c5dbec60',1);text(g,c.storyId==='rainmix'?'MIX. LISTEN. KEEP.':'SEE. COMPARE. KEEP.',58,403,12,'#c7d8e6','left',550);g.restore();}}
export function createGlass017(canvas:HTMLCanvasElement,c:EffectConfig,assets:EffectAssets){const im=assets.glassPhoto;if(!im)throw new Error('照片素材尚未加载。');return createShader(canvas,c,{state:glassState017,overlay:paintGlassOverlay017,content:(g,config,t)=>{g.clearRect(0,0,1536,768);if(config.storyId==='rainmix')drawRainmix(g,config,t);else drawDarkroom(g,config,t,im);}});}
