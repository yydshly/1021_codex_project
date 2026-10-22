import type {EffectConfig} from '../../scripts/effects.mjs';
import {storyFilm016} from '../../scripts/story-films-016.mjs';
import {engrave,poly,ellipse,type G} from './engraving-016';
import {clamp,lerp,smooth,text,rr,TAU,hash} from './math';
const PAPER='#f4f0e5',INK='#173b3e',MUTED='#6e807b';
function label(g:G,s:string,x:number,y:number,align:CanvasTextAlign='left',color=INK,size=15){text(g,s,x,y,size,color,align,550,1100);}
function line(g:G,p:number[][],color=INK,w=1.5){poly(g,p,color,w);}
function dot(g:G,x:number,y:number,r:number,color:string){ellipse(g,x,y,r,r,color,true);}
function tag(g:G,s:string,x:number,y:number,color=INK){g.font='550 12px "Noto Sans SC"';const w=g.measureText(s).width+23;g.fillStyle=PAPER;rr(g,x,y-19,w,27,4);g.fill();label(g,s,x+11,y,'left',color,12);}
function leader(g:G,p:number[][],s:string,color=INK,align:CanvasTextAlign='left'){line(g,p,color+'80',1);dot(g,p[0][0],p[0][1],3,color);const q=p.at(-1)!;label(g,s,q[0]+(align==='right'?-9:9),q[1]+5,align,color,13);}
function layer(g:G,x:number,y:number,rx:number,ry:number,depth:number,colors:string[],kind:string,c:EffectConfig,t:number){
 g.save();const grad=g.createLinearGradient(x-rx,y-ry,x+rx+depth,y+ry);grad.addColorStop(0,colors[0]);grad.addColorStop(.38,colors[1]);grad.addColorStop(1,colors[2]);g.fillStyle=grad;
 g.beginPath();g.ellipse(x+depth,y,rx,ry,0,-Math.PI/2,Math.PI/2);g.lineTo(x,y+ry);g.ellipse(x,y,rx,ry,0,Math.PI/2,Math.PI*1.5);g.closePath();g.fill();
 const face=g.createLinearGradient(x-rx,y,x+rx,y);face.addColorStop(0,colors[2]);face.addColorStop(.3,colors[1]);face.addColorStop(1,colors[0]);g.fillStyle=face;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();g.lineWidth=1.5;ellipse(g,x,y,rx,ry,'#fff8e89c');
 if(kind==='pad'){ellipse(g,x-1,y,rx*.60,ry*.72,'#162c32',true);ellipse(g,x-1,y,rx*.45,ry*.64,'#041c24',true);for(let i=0;i<21;i++){const a=i*TAU/21;line(g,[[x+Math.cos(a)*rx*.83,y+Math.sin(a)*ry*.86],[x+Math.cos(a)*rx*.91,y+Math.sin(a)*ry*.91]],'#e3d5ba50',1);}}
 if(kind==='driver'){ellipse(g,x,y,rx*.77,ry*.82,'#2b4546',true);for(let i=0;i<12;i++)ellipse(g,x,y,rx*(.22+i*.043),ry*(.23+i*.044),i%2?'#e8b66d':'#856844');ellipse(g,x+Math.sin(t*24)*2*c.intensity,y,rx*.28,ry*.32,'#e6d6ac',true);}
 if(kind==='board'){for(let i=0;i<7;i++){line(g,[[x-rx*.65,y-ry*.73+i*ry*.22],[x+rx*.1,y-ry*.73+i*ry*.22],[x+rx*.4,y-ry*.6+i*ry*.22]],'#d5c180',1);dot(g,x+rx*.43,y-ry*.6+i*ry*.22,2,'#d6c384');}g.fillStyle='#183c35';g.fillRect(x-13,y-25,26,50);for(let i=0;i<8;i++){line(g,[[x-17,y-21+i*6],[x-12,y-21+i*6]],'#d6c384',1.8);line(g,[[x+12,y-21+i*6],[x+17,y-21+i*6]],'#d6c384',1.8);}}
 if(kind==='shell'){for(let i=0;i<7;i++)ellipse(g,x-1,y,rx*(.32+i*.071),ry*(.33+i*.072),'#837b6833');g.fillStyle='#102f34';rr(g,x-9,y-32,18,64,8);g.fill();dot(g,x,y-19,2.2,c.primary);}
 if(kind==='foam'){ellipse(g,x,y,rx*.75,ry*.8,'#426368');for(let i=0;i<160;i++){const a=hash(i,21)*TAU,r=Math.sqrt(hash(i+300,21))*.92;dot(g,x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r,.7,'#d0d9ca70');}}
 if(c.detail>0){g.save();g.globalAlpha=c.detail*.18;for(let i=0;i<40+c.count*5;i++){const a=hash(i,c.seed)*TAU,r=Math.sqrt(hash(i+700,c.seed))*.94;dot(g,x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r,.55,'#f5f3df');}g.restore();}
 g.restore();
}
function earcup(g:G,c:EffectConfig,t:number,small=0){
 const spread=smooth(1.5,3.35,t),z=lerp(1,.61,small),offset=lerp(0,430,small);g.save();g.translate(offset,lerp(0,38,small));g.scale(z,z);
 const center=868,y=365;g.save();g.shadowColor='#13333325';g.shadowBlur=26;ellipse(g,890,573,217+spread*50,17,'#27453b25',true);g.restore();
 // Separated objects retain ordering through the exploded-view transition.
 const rows=[{k:'pad',dx:140,rx:58,ry:158,d:37,col:['#e5d9bf','#a49b84','#5f625b']},{k:'foam',dx:48,rx:42,ry:140,d:15,col:['#9aa99c','#50777b','#234951']},{k:'driver',dx:-37,rx:42,ry:132,d:22,col:['#efd79b','#b18c53','#736344']},{k:'board',dx:-113,rx:35,ry:119,d:12,col:['#77a29a','#346c65','#224740']},{k:'shell',dx:-193,rx:52,ry:156,d:35,col:['#e8dec5','#b8aa8f','#857761']}];
 for(const r of rows){const x=center+r.dx*spread+(r.k==='pad'?25:0);layer(g,x,y,r.rx,r.ry,r.d,r.col,r.k,c,t);}
 if(spread>.05){g.save();g.globalAlpha=spread;line(g,[[651,365],[1054,365]],'#8c9a9160',1);for(let i=0;i<4;i++){const x=718+i*85;line(g,[[x,211],[x+12,211]],'#b6a77d',3);}g.restore();}
 if(t>2.1&&t<4.45){g.save();g.globalAlpha=smooth(2.1,2.8,t)*(1-smooth(4.05,4.45,t));leader(g,[[680,345],[598,289],[486,289]],'外侧麦克风',c.secondary,'right');leader(g,[[753,387],[711,565],[615,565]],'计算反相信号',c.secondary,'right');leader(g,[[837,337],[834,175],[947,175]],'驱动单元发声',c.primary);leader(g,[[1028,364],[1120,421],[1165,421]],'耳垫密封',INK,'right');g.restore();}
 g.restore();
}
function wave(g:G,x:number,y:number,width:number,amp:number,phase:number,color:string,progress=1,dash=false){g.save();if(dash)g.setLineDash([5,5]);g.beginPath();const n=320;for(let i=0;i<=Math.floor(n*progress);i++){const xx=i/n*width,yy=y+Math.sin(i/n*TAU*3+phase)*amp;i?g.lineTo(x+xx,yy):g.moveTo(x,yy);}g.strokeStyle=color;g.lineWidth=3;g.stroke();g.restore();}
function anc(g:G,c:EffectConfig,t:number){
 const focus=smooth(4.0,4.8,t),end=smooth(7.8,8.75,t);earcup(g,c,t,focus*(1-end));
 if(t<4.5){g.save();g.globalAlpha=1-smooth(3.9,4.5,t);text(g,'多一道声，',61,224,67,INK,'left',800,610);text(g,'少一点噪。',61,308,67,c.secondary,'left',800,610);label(g,'ACTIVE NOISE CANCELLATION',65,352,'left',MUTED,13);
 const amp=24+Math.sin(t*2)*4*c.intensity;for(let i=0;i<3;i++){g.globalAlpha=(1-i*.22)*(1-smooth(3.9,4.5,t));wave(g,63,448+i*31,510,amp,t*6+i*.4,c.primary,.95);}
 if(t<1.65)tag(g,'不是把声音关掉，而是发出抵消信号。',62,574,c.secondary);g.restore();}
 if(focus>0&&end<1){g.save();g.globalAlpha=focus*(1-end);const merge=smooth(5,6.6,t),amp=56,phase=-t*5.5;
  g.fillStyle=PAPER;g.fillRect(43,139,752,478);text(g,'反相，发生在同一个时刻。',62,190,33,INK,'left',750,730);
  label(g,'噪声声压',63,234,'left',c.primary,14);label(g,'反相信号',65,440,'left',c.secondary,14);
  const y1=lerp(294,352,merge),y2=lerp(389,352,merge);line(g,[[68,352],[736,352]],'#536e6740',1);wave(g,72,y1,650,amp,phase,c.primary);wave(g,72,y2,650,-amp*.92,phase+.06,c.secondary,1,true);
  const sum=smooth(5.7,6.9,t);g.save();g.globalAlpha=sum;line(g,[[70,527],[736,527]],'#536e6740',1);g.beginPath();for(let i=0;i<=320;i++){const a=i/320*TAU*3+phase,v=Math.sin(a)*amp-Math.sin(a+.06)*amp*.92;const x=72+i/320*650,y=527+v;i?g.lineTo(x,y):g.moveTo(x,y);}g.strokeStyle=INK;g.lineWidth=4;g.stroke();label(g,'在耳边叠加 → 残余声压更小',65,580,'left',INK,21);g.restore();
  tag(g,'简化单频信号 · 非消除所有声音',65,646,MUTED);g.restore();}
 if(end>0){g.save();g.globalAlpha=end;g.fillStyle=PAPER;g.fillRect(38,126,575,462);text(g,c.title,62,220,c.title.length>10?43:53,INK,'left',800,600);text(g,'安静，不是静音。',65,294,36,c.secondary,'left',700,580);label(g,c.subtitle,66,345,'left',MUTED,21);
  for(let i=0;i<3;i++){dot(g,77,417+i*43,4,i===0?c.primary:c.secondary);label(g,[c.words[0]||'拾音',c.words[1]||'反相',c.words[2]||'叠加'][i],95,423+i*43,'left',INK,19);}label(g,'持续低频通常更容易降低；突发声与高频更难。',65,585,'left',MUTED,15);g.restore();}
 label(g,'声波曲线表示声压随位置的示意，非空气粒子行进轨迹。实际效果受频率、延迟和佩戴影响。',42,675,'left',MUTED,12);
}
type P=[number,number];
function norm(a:P):P{const n=Math.hypot(...a);return [a[0]/n,a[1]/n];}
function refract(i:P,n:P,ratio:number):P{const cos=-(i[0]*n[0]+i[1]*n[1]),k=1-ratio*ratio*(1-cos*cos);return norm([ratio*i[0]+(ratio*cos-Math.sqrt(Math.max(0,k)))*n[0],ratio*i[1]+(ratio*cos-Math.sqrt(Math.max(0,k)))*n[1]]);}
function rayInPrism(n:number){
 const A:P=[0,-175],B:P=[140,155],C:P=[-140,155],entry:P=[-140*(205/330),30],inside=refract([1,0],norm([-330,-140]),1/n);
 // Intersection of entry+s*inside with A+u*(B-A).
 const v:P=[140,330],cross=(a:P,b:P)=>a[0]*b[1]-a[1]*b[0],delta:P=[A[0]-entry[0],A[1]-entry[1]],s=cross(delta,v)/cross(inside,v);
 const exit:P=[entry[0]+s*inside[0],entry[1]+s*inside[1]],outside=refract(inside,norm([-330,140]),n);
 return {entry,exit,outside};
}
function prism(g:G,c:EffectConfig,t:number){
 const focus=smooth(1.7,3.2,t),spread=smooth(3.4,5.8,t),end=smooth(7.8,8.8,t),z=lerp(lerp(.91,1.15,focus),.92,end),cx=lerp(lerp(856,590,focus),915,end),cy=lerp(360,355,focus);
 g.save();g.translate(cx,cy);g.scale(z,z);
 g.save();g.shadowColor='#183b3e38';g.shadowBlur=30;ellipse(g,31,186,183,15,'#25464a22',true);g.restore();
 const glass=g.createLinearGradient(-170,-160,180,180);glass.addColorStop(0,'#ddecee');glass.addColorStop(.38,'#f2faf4');glass.addColorStop(.75,'#8caeb0');glass.addColorStop(1,'#f2e7cf');
 poly(g,[[0,-175],[34,-188],[174,142],[140,155]],'#b6cecc',1,'#9ab9b9');poly(g,[[-140,155],[0,-175],[140,155]],'#63878a',1.6);g.fillStyle=glass;g.fill(new Path2D('M-140 155 L0 -175 L140 155 Z'));
 poly(g,[[-132,149],[0,-161],[132,149]],'#ffffff9c',1.5);line(g,[[3,-161],[130,141]],'#ffffff',2);line(g,[[-125,141],[130,141]],'#e5efe4',2);
 const colors=['#f04e49','#ef8b41','#e8b63e','#69a874','#4296b5','#666bcb','#9866bb'];
 const shoot=smooth(.1,1.2,t),trace=smooth(2,3.5,t);const base=rayInPrism(1.52),x0=-600,entry=base.entry;
 g.save();g.shadowColor='#f7cf84';g.shadowBlur=16*(1+(c.intensity-.65));line(g,[[x0,30],[lerp(x0,entry[0],shoot),30]],'#b89961',8);line(g,[[x0,30],[lerp(x0,entry[0],shoot),30]],'#fff6d9',3);g.restore();
 for(let i=0;i<colors.length;i++){
  const n=lerp(1.514,1.532,i/6),r=rayInPrism(n),col=colors[i],len=660*spread;
  g.save();g.globalAlpha=.4+spread*.5;line(g,[r.entry,[lerp(r.entry[0],r.exit[0],trace),lerp(r.entry[1],r.exit[1],trace)]],col,.8+spread*.5);g.restore();
  if(spread>0){const ref=rayInPrism(1.514).outside,refAngle=Math.atan2(ref[1],ref[0]),angle=refAngle+(Math.atan2(r.outside[1],r.outside[0])-refAngle)*8,dest:P=[r.exit[0]+Math.cos(angle)*len,r.exit[1]+Math.sin(angle)*len];g.save();g.shadowColor=col;g.shadowBlur=5*(1+(c.intensity-.65));line(g,[r.exit,dest],col,3);g.globalAlpha=.12;line(g,[r.exit,dest],col,7);g.restore();}
 }
 // Magnified comparison below uses the same computed exit rays.
 if(t>5.2){g.save();g.globalAlpha=smooth(5.2,6.3,t)*(1-end);const px=247,py=-99;g.fillStyle='#183b3e';rr(g,px,py,240,178,10);g.fill();label(g,'出射方向 / 示意',px+19,py+31,'left','#d9e4db',12);
  const red=rayInPrism(1.514).outside,blue=rayInPrism(1.532).outside;line(g,[[px+20,py+65],[px+200,py+65]],'#f8e8c840',1);line(g,[[px+20,py+65],[px+20+red[0]*170,py+65+red[1]*170]],colors[0],2.5);line(g,[[px+20,py+65],[px+20+blue[0]*170,py+65+blue[1]*170]],colors[6],2.5);label(g,'实际角差 / 紫光偏折较多',px+15,py+155,'left','#f2e9d3',12);g.restore();}
 g.restore();
 if(t<2.2){g.save();g.globalAlpha=1-smooth(1.55,2.2,t);text(g,'白光里，',62,225,74,INK,'left',800,610);text(g,'藏着彩虹？',62,318,74,c.secondary,'left',800,610);label(g,'A PRISM DOES NOT ADD COLOUR.',66,365,'left',MUTED,13);tag(g,'让一束白光穿过三棱镜。',65,546,c.secondary);g.restore();}
 if(t>=2.2&&t<8.4){g.save();g.globalAlpha=smooth(2.2,2.6,t)*(1-smooth(7.8,8.4,t));text(g,t<4?'进入玻璃，先转一次弯。':'离开玻璃，颜色逐渐分开。',62,147,31,INK,'left',750);label(g,t<4?'空气 → 玻璃 / 折射':'不同颜色的折射率不同 / 色散',65,184,'left',MUTED,16);g.restore();}
 if(end>0){g.save();g.globalAlpha=end;g.fillStyle=PAPER;g.fillRect(40,109,525,470);text(g,c.title,62,207,c.title.length>10?42:51,INK,'left',800,550);text(g,'颜色，本来就在光里。',65,275,31,c.secondary,'left',700,550);label(g,c.subtitle,66,329,'left',MUTED,20);for(let i=0;i<7;i++){g.fillStyle=colors[i];g.fillRect(65+i*58,396,45,13);}label(g,'白光 → 两次折射 → 分离的色谱',65,473,'left',INK,21);g.restore();}
 label(g,'按斯涅尔定律计算；主图出射角差 × 8 放大，右侧小窗保留计算角差。非指定玻璃的实测光谱。',42,675,'left',MUTED,12);
}
export function scienceFilm016(g:G,c:EffectConfig,t:number){
 g.save();g.fillStyle=PAPER;g.fillRect(0,0,1280,720);
 const grid=48-c.count;for(let x=39;x<1280;x+=grid)for(let y=82;y<665;y+=grid){g.fillStyle='#173b3e10';g.fillRect(x,y,1,1);}
 for(let i=0;i<c.detail*1900;i++){g.fillStyle='#173b3e08';g.fillRect(hash(i,c.seed)*1280,hash(i+900,c.seed)*720,1,1);}
 if(storyFilm016(c.style,c.storyId)?.id==='prism')prism(g,c,t);else anc(g,c,t);
 line(g,[[39,58],[1241,58]],'#173b3e55',1);line(g,[[39,695],[1241,695]],'#173b3e55',1);
 label(g,'纸间解释所 / 看见机制',40,36,'left',INK,12);label(g,'A QUESTION. A MECHANISM. AN ANSWER.',1240,36,'right',MUTED,11);
 const phase=t<2?0:t<4.4?1:t<7.8?2:3;for(let i=0;i<4;i++){g.fillStyle=i===phase?c.primary:'#173b3e25';g.fillRect(1153+i*23,707,17,3);}g.restore();
}
