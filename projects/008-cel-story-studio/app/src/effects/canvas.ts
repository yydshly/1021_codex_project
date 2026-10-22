import type {EffectConfig} from '../../scripts/effects.mjs';
import {W,H,clamp,lerp,smooth,back,hash,TAU,rr,text,circle,star,paper,arrow} from './math';
import {inkStroke,inkLoop} from '../vendor/engine.js';
import {morphContours} from './geometry';
export type EffectAssets=Record<string,HTMLImageElement>;
const ink='#252e2b',cream='#f4eddf';
function label(g:CanvasRenderingContext2D,c:EffectConfig,t:number,dark=false){
 const col=dark?'#edf3ef':ink;g.save();g.globalAlpha=smooth(0,.6,t);text(g,c.title,65,100,52,col,'left',850,1000);text(g,c.subtitle,68,146,20,dark?'#b8c8cf':'#61675f','left',450);g.restore();
 const phase=Math.min(c.words.length-1,Math.floor(t/c.duration*c.words.length));text(g,`${String(phase+1).padStart(2,'0')} / ${c.words[phase]}`,68,675,14,dark?'#a6c4c5':'#77816b','left',500,900);
 text(g,`${String(Math.floor(t*30)).padStart(3,'0')} / ${Math.round(c.duration*30)}`,1210,675,14,dark?'#96a3ac':'#767e72','right',500);
}
function flat(g:CanvasRenderingContext2D,c:EffectConfig,t:number){
 paper(g,c.seed,'#f7f1e3');const cols=[c.primary,c.secondary,'#f2c759','#73aa8d'];
 for(let i=0;i<c.count;i++){const col=i%4,row=Math.floor(i/4),x=118+col*283,y=225+row*Math.min(128,360/Math.ceil(c.count/4));const u=back((t-i*.12)/.8,2*c.intensity);g.save();g.translate(x+50,y+48);g.scale(Math.max(.001,u),Math.max(.001,1-(1-u)*.65));g.rotate(Math.sin(t*1.5+i)*.04*c.intensity+(hash(i,c.seed)-.5)*.1);const r=(32+c.detail*20)*Math.min(1,3/Math.ceil(c.count/4));
 if(i%4===0){circle(g,0,0,r,cols[i%4]);circle(g,0,0,r*.35,cream);}else if(i%4===1)star(g,0,0,r,cols[i%4],4,.48);else {rr(g,-48,-35,96,70,c.detail*32);g.fillStyle=cols[i%4];g.fill();}g.restore();
 if(i<4){text(g,c.words[i%c.words.length],x+113,y+43,23,ink,'left',750,148);text(g,`0${i+1} / IDEAS`,x+113,y+72,12,'#7c8072','left',500);}}
 const x=65,y=615,w=1150;g.fillStyle=c.secondary;rr(g,x,y,w,8,4);g.fill();circle(g,x+w*smooth(0,c.duration,t),y+4,14,c.primary);label(g,c,t);
}
// Each sample belongs to one continuous path: draw order and the moving tip share its arc-length table.
export function makeLine(c:EffectConfig){const pts:[number,number][]=[];const add=(x:number,y:number)=>pts.push([x,y]);
 for(let i=0;i<=180;i++){const u=i/180;add(40+u*250,505+Math.sin(u*TAU*1.3)*35*c.intensity);}
 for(let i=0;i<=110;i++){const u=i/110;add(290+Math.sin(u*TAU)*46*(1-u),505-u*200);}
 add(340,505);for(let i=0;i<c.count;i++){const x=340+i*47,h=42+hash(i,c.seed)*160*(.35+c.intensity);add(x,505);add(x,505-h);add(x+31,505-h-10);add(x+31,505);}
 const end=340+c.count*47;for(let i=0;i<=100;i++){const u=i/100;add(lerp(end,1170,u),505+Math.sin(u*TAU*2)*28*c.intensity);}
 return pts;}
function line(g:CanvasRenderingContext2D,c:EffectConfig,t:number){
 g.fillStyle='#142d2c';g.fillRect(0,0,W,H);const pts=makeLine(c),dist=[0];for(let i=1;i<pts.length;i++)dist.push(dist[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const reach=dist.at(-1)!*smooth(.1,c.duration*.76,t);g.strokeStyle=c.primary;g.lineWidth=2+c.detail*5;g.lineCap='round';g.lineJoin='round';g.beginPath();let tip=pts[0];g.moveTo(...tip);for(let i=1;i<pts.length;i++){if(dist[i]>reach){const u=clamp((reach-dist[i-1])/(dist[i]-dist[i-1]||1));tip=[lerp(pts[i-1][0],pts[i][0],u),lerp(pts[i-1][1],pts[i][1],u)];g.lineTo(...tip);break;}tip=pts[i];g.lineTo(...tip);}g.stroke();g.shadowColor=c.primary;g.shadowBlur=25;circle(g,...tip,6,c.primary);g.shadowBlur=0;
 c.words.forEach((w,i)=>{g.globalAlpha=smooth(1+i*1.5,2+i*1.5,t);text(g,w,190+i*(870/(c.words.length-1)),590,25,'#dfd8b8','center',500);});g.globalAlpha=1;label(g,c,t,true);
}
function hand(g:CanvasRenderingContext2D,c:EffectConfig,t:number,a:EffectAssets){
 paper(g,c.seed);if(a.paper){g.globalAlpha=.16;g.drawImage(a.paper,0,0,W,H);g.globalAlpha=1;}
 const q=Math.floor(t*12);
 const draw=(pts:[number,number][],color=ink,width=4,close=false)=>{const options={seed:c.seed+q*17,amp:c.detail*3,w:width,color};if(close)inkLoop(g,pts,options);else inkStroke(g,pts,options);};
 draw([[30,570],[200,566],[360,575],[610,566],[850,574],[1250,568]],ink,3);
 for(let i=0;i<c.count;i++){const x=110+i*103,y=570,r=15+hash(i,c.seed)*10,h=(35+hash(i+10,c.seed)*90)*back((t-1-i*.22)/1,1);draw([[x,y],[x+Math.sin(t*2+i)*6*c.intensity,y-h]],c.secondary,3);const yy=y-h;for(let k=0;k<5;k++){const ang=k*TAU/5+Math.sin(q*.12+i)*.06;circle(g,x+Math.cos(ang)*r*.8,yy+Math.sin(ang)*r*.8,r*.57,c.primary);}circle(g,x,yy,r*.45,'#f5c252');}
 const x=250+smooth(.5,6,t)*650,y=510-Math.abs(Math.sin(q*.25))*23*c.intensity;g.save();g.translate(x,y);g.rotate(Math.sin(q*.22)*.05*c.intensity);g.fillStyle=c.primary;g.beginPath();g.ellipse(0,0,47,57,0,0,TAU);g.fill();const outline:[number,number][]=[];for(let i=0;i<=36;i++)outline.push([Math.cos(i*TAU/36)*47,Math.sin(i*TAU/36)*57]);draw(outline,ink,3,true);circle(g,-14,-14,4,ink);circle(g,14,-14,4,ink);draw([[-12,9],[0,16],[14,8]],ink,3);const leg=Math.sin(q*.45)*16*c.intensity;draw([[-22,50],[-25+leg,75],[-45+leg,75]],ink,4);draw([[22,50],[25-leg,75],[45-leg,75]],ink,4);draw([[-45,-1],[-69,-20]],ink,4);draw([[45,-1],[70,-35-Math.sin(q*.3)*15]],ink,4);g.restore();
 const step=Math.min(c.words.length-1,Math.floor(t/c.duration*c.words.length));text(g,c.words[step],640,645,30,ink,'center',650);label(g,c,t);
}
function collage(g:CanvasRenderingContext2D,c:EffectConfig,t:number,a:EffectAssets){
 paper(g,c.seed,'#ded0b2');const qt=Math.floor(t*8)/8;const cuts=['portrait','flower','butterfly','eye'];
 for(let i=0;i<c.count;i++){const x=180+(i%4)*285,y=335+Math.floor(i/4)*94;const u=back((t-.15*i)/.7,1.8);g.save();g.translate(x,y+(1-u)*500);g.rotate((hash(i,c.seed)-.5)*.4+Math.sin(qt*4+i)*.07*c.intensity);g.scale(Math.max(.001,u),Math.max(.001,u));g.shadowColor='#493d2444';g.shadowBlur=15;g.shadowOffsetY=7;g.fillStyle=i%2?c.primary:c.secondary;g.beginPath();for(let k=0;k<24;k++){const xx=-95+k*190/23,yy=-87+(hash(k+i*25,c.seed)-.5)*(8+c.detail*20);g.lineTo(xx,yy);}g.lineTo(98,90);g.lineTo(-98,90);g.closePath();g.fill();g.shadowColor='transparent';const im=a[cuts[(i+c.seed)%cuts.length]];if(im){const r=Math.min(180/im.width,210/im.height);g.drawImage(im,-im.width*r/2,-im.height*r/2,im.width*r,im.height*r);}if(i<3){g.fillStyle='#f9efda';g.fillRect(-85,60,170,40);text(g,c.words[i%c.words.length],0,88,23,ink,'center',800,156);}g.restore();}
 g.save();g.translate(1090,590);g.rotate(-.18);g.strokeStyle=c.primary;g.lineWidth=4;g.strokeRect(-100,-25,200,55);text(g,'OPEN YOUR MIND',0,10,17,c.primary,'center',800);g.restore();label(g,c,t);
}
function morph(g:CanvasRenderingContext2D,c:EffectConfig,t:number){
 paper(g,c.seed);const phase=t/c.duration*3,part=Math.min(2,Math.floor(phase)),u=smooth(0,1,phase-part),contours=morphContours(c.count,c.detail),n=contours[0].length;
 const pts:[number,number][]=[];const rot=Math.sin(t)*.12*c.intensity+(hash(0,c.seed)-.5)*.3;
 for(let i=0;i<n;i++){const a=contours[part][i],b=contours[part+1][i],x=lerp(a[0],b[0],u)*172,y=lerp(a[1],b[1],u)*172;pts.push([640+x*Math.cos(rot)-y*Math.sin(rot),404+x*Math.sin(rot)+y*Math.cos(rot)]);}
 for(let k=3;k>=0;k--){g.save();g.translate(k*18,k*9);g.globalAlpha=k?.08:1;g.fillStyle=k?c.secondary:c.primary;g.beginPath();pts.forEach(p=>g.lineTo(...p));g.closePath();g.fill();g.restore();}circle(g,640,404,22*(1-c.detail),cream);
 c.words.forEach((w,i)=>{circle(g,270+i*(740/(c.words.length-1)),626,6,part===i?c.primary:'#b7bdab');text(g,w,270+i*(740/(c.words.length-1)),661,20,ink,'center',600);});label(g,c,t);
}
function bauhaus(g:CanvasRenderingContext2D,c:EffectConfig,t:number){
 paper(g,c.seed);const cols=Math.round(c.count/2)+2,size=Math.min(150,1140/cols),rows=3,x0=(W-cols*size)/2;const cs=[c.primary,c.secondary,'#e3ba3f',ink];
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const i=row*cols+col,x=x0+col*size,y=212+row*size;g.save();rr(g,x+2,y+2,size-4,size-4,0);g.clip();g.translate(x+size/2,y+size/2);const turn=smooth(0,1,(t*.42+row*.16+col*.09)%1)*Math.PI*.5*c.intensity;g.rotate(Math.floor(hash(i,c.seed)*4)*Math.PI/2+turn);const s=size*(.5+c.detail*.44);g.fillStyle=cs[i%4];if(i%3===0){g.beginPath();g.arc(0,0,s*.7,0,Math.PI);g.closePath();g.fill();}else if(i%3===1){g.fillRect(-s*.5,-s*.5,s,s);circle(g,s*.2,-s*.2,s*.3,cream);}else {for(let k=0;k<4;k++){g.beginPath();g.arc(0,0,s*.18+k*s*.16,0,Math.PI*1.5);g.strokeStyle=cs[i%4];g.lineWidth=s*.07;g.stroke();}}g.restore();}label(g,c,t);
}
function captions(g:CanvasRenderingContext2D,c:EffectConfig,t:number,a:EffectAssets){
 g.fillStyle='#edceaf';g.fillRect(0,0,W,H);const im=a.photo;if(im){const r=Math.max(W/im.width,H/im.height),ww=im.width*r,hh=im.height*r;g.save();g.translate(W/2,H/2);g.scale(1+Math.sin(t*.5)*.025,1+Math.sin(t*.5)*.025);g.drawImage(im,-ww/2,-hh*.23,ww,hh);g.restore();}
 const grad=g.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#17120d99');grad.addColorStop(.45,'#00000000');grad.addColorStop(1,'#17120d99');g.fillStyle=grad;g.fillRect(0,0,W,H);
 for(let i=0;i<c.count;i++){const x=hash(i,c.seed)*W,y=190+hash(i+10,c.seed)*400,r=(13+hash(i+90,c.seed)*20)*back((t-i*.08)/.5,2);star(g,x,y,r,i%2?c.primary:'#fff6dc',4,.4,t*.7);}
 const words=c.words[Math.min(c.words.length-1,Math.floor(t/c.duration*c.words.length))];const chars=Array.from(words),size=Math.min(115,950/chars.length);chars.forEach((ch,i)=>{const age=(t%(c.duration/c.words.length))-.1*i,scale=back(age/.45,1+c.intensity*3);g.save();g.translate(640+(i-(chars.length-1)/2)*size*1.1,475+Math.sin(t*2+i)*8*c.intensity);g.rotate((i%2?1:-1)*.08);g.scale(Math.max(.001,scale),Math.max(.001,scale));g.font=`950 ${size}px "Noto Sans SC"`;g.textAlign='center';g.lineJoin='round';g.strokeStyle='#26212d';g.lineWidth=15+c.detail*15;g.strokeText(ch,0,0);g.strokeStyle='#fff7e3';g.lineWidth=8+c.detail*8;g.strokeText(ch,0,0);g.fillStyle=i%2?c.primary:c.secondary;g.fillText(ch,0,0);g.restore();});label(g,c,t,true);
}
function paperclip(g:CanvasRenderingContext2D,c:EffectConfig,t:number){
 paper(g,c.seed,'#f3ead8');g.strokeStyle='#7a99851b';g.lineWidth=1;for(let x=0;x<W;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}for(let y=0;y<H;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
 const n=c.words.length;for(let i=0;i<n;i++){const x=110+i*(1040/(n-1)),y=350+(i%2?90:0),u=back((t-i*.6)/.6,2*c.intensity);if(i){g.globalAlpha=smooth(i*.6,i*.6+.6,t);arrow(g,x-1040/(n-1)+84,y+(i%2?-70:70),x-35,y,c.secondary);g.globalAlpha=1;}g.save();g.translate(x,y+(1-u)*120);g.rotate((i%2?1:-1)*c.detail*.12);g.scale(Math.max(.001,u),Math.max(.001,u));g.shadowColor='#352e1925';g.shadowBlur=15;g.shadowOffsetY=8;rr(g,-65,-80,175,190,8);g.strokeStyle='#fffef6';g.lineWidth=9;g.stroke();g.fillStyle=i%2?'#fffaf1':'#f6d88f';g.fill();g.shadowColor='transparent';circle(g,-32,-48,21,c.primary);text(g,String(i+1),-32,-40,21,'#fff','center');text(g,c.words[i],22,20,25,ink,'center',800,155);text(g,'一步，让想法更清晰',22,68,11,'#6f796b','center',500,155);g.restore();}
 for(let i=0;i<c.count;i++){const x=70+hash(i,c.seed)*1140,y=590+hash(i+50,c.seed)*50;star(g,x,y,8+hash(i+1,c.seed)*10,i%2?c.primary:c.secondary,4,.45,t*.1);}label(g,c,t);
}
function pixel(g:CanvasRenderingContext2D,c:EffectConfig,t:number){
 t=Math.floor(t*12)/12;
 // Offscreen buffer is native pixel resolution; nearest-neighbour scaling happens exactly once.
 const tiny=document.createElement('canvas');tiny.width=320;tiny.height=180;const q=tiny.getContext('2d')!;q.fillStyle='#20354a';q.fillRect(0,0,320,180);
 for(let i=0;i<65;i++){q.fillStyle=i%3?'#a4c7c6':'#ffe5af';q.fillRect(Math.floor(hash(i,c.seed)*320),Math.floor(hash(i+90,c.seed)*110),i%7?1:2,1);}
 q.fillStyle='#345766';for(let i=0;i<c.count;i++){const x=i*320/c.count,h=20+hash(i,c.seed)*45;q.fillRect(Math.round(x),140-h,Math.ceil(320/c.count)+1,h);}
 q.fillStyle=c.primary;q.fillRect(0,143,320,6);q.fillStyle='#536851';q.fillRect(0,149,320,31);for(let i=0;i<80;i++){q.fillStyle=i%2?'#64764b':'#3b5147';q.fillRect(Math.floor(hash(i,c.seed)*320/4)*4,150+Math.floor(hash(i+7,c.seed)*7)*4,4,4);}
 const x=Math.round(35+((t/c.duration)*240)),y=Math.round(128-Math.abs(Math.sin(t*2.5))*35*c.intensity),s=1+c.detail*.5;q.save();q.translate(x,y);q.scale(s,s);q.fillStyle=c.secondary;q.fillRect(-6,-16,12,12);q.fillStyle='#f7d79c';q.fillRect(-5,-11,10,8);q.fillStyle='#202b40';q.fillRect(0,-10,2,2);q.fillStyle=c.primary;q.fillRect(-6,-3,11,10);q.fillStyle='#dce4c7';q.fillRect(-6,7,4,3);q.fillRect(2,7,4,3);q.restore();
 for(let i=0;i<6;i++){const xx=55+i*43,yy=105-Math.sin(t*2+i)*3;if(x<xx+8){q.fillStyle='#f6d773';q.fillRect(xx,yy,5,8);q.fillStyle='#fff7b0';q.fillRect(xx+1,yy,2,6);}}
 g.imageSmoothingEnabled=false;g.drawImage(tiny,0,0,W,H);g.imageSmoothingEnabled=true;label(g,c,t,true);text(g,c.words[Math.min(c.words.length-1,Math.floor(t/c.duration*c.words.length))],640,650,28,'#fff2c7','center',750);
}
export function paintCanvas(g:CanvasRenderingContext2D,c:EffectConfig,t:number,a:EffectAssets){g.clearRect(0,0,W,H);g.save();({ 'flat-vector':flat,'line-art':line,'cel-boil':hand,collage,morph,bauhaus,hanazi:captions,paperclip,pixel } as Record<string,(g:CanvasRenderingContext2D,c:EffectConfig,t:number,a:EffectAssets)=>void>)[c.style]?.(g,c,t,a);g.restore();}
export {label as paintLabel};
