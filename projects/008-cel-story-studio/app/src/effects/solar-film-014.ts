import type {EffectConfig} from '../../scripts/effects.mjs';
import type {EffectAssets} from './canvas';
import {text,rr,circle,smooth,clamp,hash,TAU,lerp} from './math';
import {texture} from './film-graphics';
const PAPER='#f6f2e7',INK='#193e40';
const wire=[[570,655],[840,655],[1020,535],[1400,535],[1660,586],[1900,586],[2080,690],[2440,690],[2460,570]];
const distance=wire.slice(1).map((p,i)=>Math.hypot(p[0]-wire[i][0],p[1]-wire[i][1]));
const total=distance.reduce((a,b)=>a+b,0);
function onWire(u:number){let d=clamp(u)*total;for(let i=0;i<distance.length;i++){if(d<=distance[i])return [lerp(wire[i][0],wire[i+1][0],d/distance[i]),lerp(wire[i][1],wire[i+1][1],d/distance[i])];d-=distance[i];}return wire.at(-1)!;}
let cachedAtlas:HTMLImageElement|undefined,stickers:HTMLCanvasElement[]=[],masks:HTMLCanvasElement[]=[];
function prepare(atlas:HTMLImageElement){if(cachedAtlas===atlas)return;cachedAtlas=atlas;stickers=[0,1,2].map(i=>{const cell=atlas.width/3,cv=document.createElement('canvas');cv.width=cell+40;cv.height=atlas.height+40;const g=cv.getContext('2d')!;g.drawImage(atlas,i*cell,0,cell,atlas.height,20,20,cell,atlas.height);return cv;});masks=stickers.map(im=>{const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d')!;g.drawImage(im,0,0);g.globalCompositeOperation='source-in';g.fillStyle=PAPER;g.fillRect(0,0,cv.width,cv.height);return cv;});}
export function solarFilm014(g:CanvasRenderingContext2D,c:EffectConfig,t:number,assets:EffectAssets){
 const atlas=assets.solar;if(!atlas)return;prepare(atlas);
 const label=(s:string,x:number,y:number,size=28,color=INK)=>text(g,s,x,y,size,color,'left',700,850);
 const line=(p:number[][],color:string,width=3)=>{g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.stroke();};
 const sticker=(n:number,x:number,y:number,w:number,ang:number,enter=1)=>{const im=stickers[n],h=w*im.height/im.width,lift=(1-enter)*28;g.save();g.translate(x,y-lift);g.rotate(ang*(1.2-enter*.2));g.scale(.96+enter*.04,.96+enter*.04);
  // A white alpha silhouette is offset around the photo, then the photo is laid on top.
  const cut=masks[n];
  g.shadowColor='#122c413b';g.shadowOffsetX=3+lift*.4;g.shadowOffsetY=8+lift*.65;g.shadowBlur=7+lift*.6;
  for(let i=0;i<8;i++){const a=i*TAU/8,edge=6+c.detail*4;g.drawImage(cut,-w/2+Math.cos(a)*edge,-h/2+Math.sin(a)*edge,w,h);}g.shadowColor='transparent';g.drawImage(im,-w/2,-h/2,w,h);g.restore();
 };
 const badge=(s:string,x:number,y:number,bg=PAPER,fg=INK)=>{g.font='650 20px "Noto Sans SC"';const w=g.measureText(s).width+34;g.fillStyle=bg;rr(g,x,y-28,w,42,8);g.fill();text(g,s,x+17,y,20,fg,'left',650);};
 // A single 3000px world: the camera visits anchors, never replaces whole slides.
 let cx=2460,cy=365,z=1.30;
 if(t>=1.15&&t<2.25){const u=smooth(1.15,2.25,t);cx=lerp(2460,520,u);cy=lerp(365,450,u);z=lerp(1.30,1.06,u);}
 else if(t>=2.25&&t<4.05){cx=520;cy=450;z=1.06+smooth(2.25,4.05,t)*.06;}
 else if(t>=4.05&&t<5.85){const u=smooth(4.05,4.7,t);cx=lerp(520,1490,u);cy=lerp(450,440,u);z=lerp(1.12,1.14,u);}
 else if(t>=5.85&&t<7.35){const u=smooth(5.85,6.5,t);cx=lerp(1490,2460,u);cy=lerp(440,435,u);z=lerp(1.14,1.04,u);}
 else if(t>=7.35){const u=smooth(7.35,8.5,t);cx=lerp(2460,1490,u);cy=lerp(435,480,u);z=lerp(1.04,.415,u);}
 g.fillStyle=PAPER;g.fillRect(0,0,1280,720);g.save();g.translate(640-cx*z,360-cy*z);g.scale(z,z);
 const sky=g.createLinearGradient(1600,0,2150,0);sky.addColorStop(0,PAPER);sky.addColorStop(1,c.secondary);g.fillStyle=sky;g.fillRect(-1800,-900,6600,2800);
 for(let x=-200;x<3400;x+=42)for(let y=-100;y<1200;y+=42){g.fillStyle=x<1800?'#183a401b':'#fff5dc20';g.fillRect(x,y,1.5,1.5);}
 for(let i=0;i<24;i++){circle(g,2040+hash(i,c.seed)*1120,60+hash(i+24,c.seed)*450,1+hash(i+60,c.seed)*2,'#fff8e6a0');}
 // The same circuit and its marker stay visible as spatial anchors between shots.
 line(wire,'#8c8e8190',4);line(wire,c.primary,2);
 const u=t<1.15?1:t<2.25?1-smooth(1.15,2.25,t):t<4.05?lerp(0,.38,smooth(2.25,4.05,t)):t<5.85?lerp(.38,.67,smooth(4.05,5.85,t)):lerp(.67,1,smooth(5.85,7.35,t));
 const marker=onWire(u);g.save();g.shadowColor=c.primary;g.shadowBlur=24+16*c.intensity;circle(g,marker[0],marker[1],13,c.primary);g.restore();circle(g,marker[0]-3,marker[1]-3,3.5,PAPER);
 if(t>7.5)for(let i=0;i<c.count;i++){const p=onWire((i/c.count+(t-7.5)*.07)%1);circle(g,p[0],p[1],6,c.primary);}
 label('01 / 白天：光变成电',190,193,38);label('光伏材料吸收光能，转成电能',190,235,22,'#56726d');
 sticker(0,515,463,570,-.04,smooth(1.9,2.65,t));
 circle(g,786,162,39,c.primary);for(let i=0;i<12;i++){const a=i*TAU/12;line([[786+Math.cos(a)*52,162+Math.sin(a)*52],[786+Math.cos(a)*64,162+Math.sin(a)*64]],c.primary,2);}
 for(let i=0;i<5;i++){const f=(t*.9+i*.19)%1,xx=lerp(760,570+i*22,f),yy=lerp(215,398+i*15,f);line([[xx,yy],[xx-10,yy+17]],c.primary,3+c.intensity*3);}
 badge(c.words[0]||'光 → 电',295,767);line([[540,588],[573,629],[573,655]],INK,2);
 label('02 / 电池：化学能暂存',1197,186,38);label('充电与放电，是不同方向的能量转换',1197,229,22,'#56726d');
 sticker(1,1490,459,520,.035,smooth(4.1,4.8,t));
 const stored=smooth(4.65,5.55,t);g.save();g.globalAlpha=.16+stored*.35;g.fillStyle=c.primary;rr(g,1385,358,210,208,18);g.fill();g.restore();
 line([[1530,319],[1720,287],[1754,287]],INK,1.5);badge('概念剖面 · 非真实电量',1690,281);badge(c.words[Math.min(1,c.words.length-1)]||'电 → 化学能',1325,767);
 label('03 / 夜里：电变成光',2145,144,38,PAPER);label('储存的能量，回到这一盏灯',2145,186,22,'#e9e5cf');
 const lit=t<1.15||t>6.45?1:smooth(6.2,6.65,t);g.save();g.globalAlpha=lit;const glow=g.createRadialGradient(2490,434,25,2490,434,230);glow.addColorStop(0,c.primary+'80');glow.addColorStop(1,c.primary+'00');g.fillStyle=glow;g.fillRect(2220,200,560,510);g.restore();
 sticker(2,2460,454,515,.015,smooth(6,6.6,t));g.save();g.globalAlpha=lit*(.08+c.intensity*.15);g.fillStyle=c.primary;g.beginPath();g.moveTo(2470,455);g.lineTo(2230,770);g.lineTo(2720,770);g.fill();g.restore();
 line([[2460,620],[2460,760]],'#bac5bd',7);g.fillStyle='#bac5bd';g.fillRect(2420,759,80,8);badge(c.words.at(-1)||'电 → 光',2308,824,PAPER,c.secondary);
 for(let i=0;i<5;i++){const x=2190+i*143;g.fillStyle='#102b4e';g.fillRect(x,820-70-i%2*25,100,170);for(let j=0;j<3;j++)for(let k=0;k<3;k++){g.fillStyle=lit&&t>6.5+i*.06?c.primary:'#27486d';g.fillRect(x+12+j*28,770+k*34-i%2*25,12,15);}}
 g.restore();
 if(t<1.15){text(g,'夜里的这盏灯，',57,549,46,PAPER,'left',850);text(g,'白天的光去了哪里？',57,612,46,c.primary,'left',850);}
 if(t>=7.7){g.save();g.globalAlpha=smooth(7.7,8.6,t);g.fillStyle=PAPER;g.fillRect(0,605,1280,115);text(g,c.title,52,98,48,INK,'left',850,1176);text(g,c.subtitle,55,139,22,INK,'left',500,1140);text(g,'光能 → 电能 → 化学能 → 电能 → 光能',640,640,24,INK,'center',750,1160);text(g,'概念能量路径；黄色标记不是同一颗光子或电子。省略控制器与转换损耗。',640,684,13,INK,'center',500,1180);g.restore();}
 else text(g,'黄色标记表示能量传递 · 示意结构，不是产品实测',36,690,13,t<2.1||t>6.4?PAPER:INK,'left',500,1150);
 texture(g,.065);text(g,'纸间科普 / 跟随一束光',32,32,12,t<2.1||t>6.4&&t<7.9?PAPER:INK,'left',650);
}
