import type {EffectConfig} from '../../scripts/effects.mjs';
import {hash,smooth,clamp,lerp,text,TAU} from './math';
import {texture} from './film-graphics';

type G=CanvasRenderingContext2D;
const W=1280,H=720,M=80,ivory='#f4edde',black='#17191a',yellow='#f5bf26';
const quad=(u:number)=>{u=clamp(u);return u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;};
const rect=(g:G,x:number,y:number,w:number,h:number,col:string)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
function disk(g:G,x:number,y:number,r:number,col:string){g.beginPath();g.arc(x,y,Math.max(.001,r),0,TAU);g.fillStyle=col;g.fill();}
function polygon(g:G,pts:number[][],col:string){g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=col;g.fill();}
function stroke(g:G,pts:number[][],col:string,width:number){g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.lineWidth=width;g.strokeStyle=col;g.lineCap='butt';g.lineJoin='miter';g.stroke();}
function quarter(g:G,x:number,y:number,r:number,angle:number,col:string){g.save();g.translate(x,y);g.rotate(angle);g.beginPath();g.moveTo(0,0);g.arc(0,0,r,0,Math.PI/2);g.closePath();g.fillStyle=col;g.fill();g.restore();}
function annulus(g:G,x:number,y:number,r:number,width:number,col:string){g.beginPath();g.arc(x,y,r,0,TAU);g.strokeStyle=col;g.lineWidth=width;g.stroke();}
function grid(g:G,c:EffectConfig,t:number){g.save();g.globalAlpha=.075+c.detail*.04;g.strokeStyle=black;g.lineWidth=.75;const reveal=smooth(0,.5,t);for(let x=40;x<W;x+=M){g.beginPath();g.moveTo(x,80);g.lineTo(x,80+560*reveal);g.stroke();}for(let y=80;y<=640;y+=M){g.beginPath();g.moveTo(40,y);g.lineTo(40+1200*reveal,y);g.stroke();}g.restore();}
function beat(t:number,c:EffectConfig,phase=0){const b=t*2+phase,i=Math.floor(b),f=b-i;return i+quad(f/(.90-c.intensity*.45));}
function marks(g:G,c:EffectConfig,t:number,stage:string){
 stroke(g,[[40,63],[1240,63]],black,1.1);stroke(g,[[40,657],[1240,657]],black,1.1);
 text(g,'PAPER PLAYGROUND / 纸上游乐场',40,40,12,black,'left',600);
 text(g,stage,1240,40,12,black,'right',550);
 text(g,'CIRCLE · TRIANGLE · A LITTLE CURIOSITY',40,685,11,black,'left',550);
 text(g,`${String(Math.min(20,Math.floor(t*2)+1)).padStart(2,'0')} / 20`,1240,685,12,black,'right',650);
 for(let i=0;i<4;i++)rect(g,590+i*24,674,16,10,[yellow,c.primary,c.secondary,black][i]);
}
function stripe(g:G,x:number,y:number,w:number,h:number,color:string,c:EffectConfig){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();for(let i=-4;i<w/12+5;i++)stroke(g,[[x+i*12,y+h],[x+i*12+h,y]],color,2+c.detail*2);g.restore();}
function ball(g:G,x:number,y:number,r:number,c:EffectConfig,accent=false){disk(g,x+2,y+2,r,black);disk(g,x,y,r,yellow);if(accent){disk(g,x-r*.18,y-r*.18,r*.22,ivory);stroke(g,[[x-r*.55,y+r*.18],[x+r*.55,y+r*.18]],black,2);}}

function staircase(g:G,c:EffectConfig,t:number){
 // The huge quarter turns about a corner, while the ball moves between exact module centres.
 quarter(g,1200,640,480,Math.PI+quad(smooth(1.0,1.8,t))*Math.PI/2,c.primary);
 rect(g,1040,240,160,400,c.primary);rect(g,880,400,160,240,black);rect(g,720,560,160,80,c.secondary);
 rect(g,1040,240,160,12,black);rect(g,880,400,160,12,c.secondary);rect(g,720,560,160,12,black);
 stripe(g,1060,280,120,320,ivory,c);
 const a=clamp(t/.5),b=clamp((t-.5)/.5),d=clamp((t-1)/.5),e=clamp((t-1.5)/.5);
 let x=lerp(1120,1040,quad(a)),y=200;
 if(t>.5){x=lerp(1040,960,quad(b));y=lerp(200,360,b*b);}
 if(t>1){x=lerp(960,880,quad(d));y=360;}
 if(t>1.5){x=lerp(880,800,quad(e));y=lerp(360,520,e*e);}
 ball(g,x,y,40,c);
 for(let i=0;i<3;i++){rect(g,80+i*88,520-i*80,72,120+i*80,[c.secondary,black,yellow][i]);disk(g,116+i*88,520-i*80,36,[c.secondary,black,yellow][i]);}
 text(g,'把规则',80,180,59,black,'left',850,460);text(g,'玩起来。',80,249,59,black,'left',850,460);
 text(g,c.words[0]||'入场',83,330,25,c.secondary,'left',650,340);
 text(g,'01 / THE FIRST MOVE',83,370,12,black,'left',550);
}

function seesaw(g:G,c:EffectConfig,t:number){
 const local=t-2,turn=quad(smooth(0,.65,local)),tilt=lerp(0,-Math.PI/4,turn)+smooth(1.1,1.6,local)*Math.PI/2;
 const lift=quad(smooth(0,.5,local)),pivotX=640+80*lift,pivotY=580-160*lift;
 // The support and lever are a shared mechanical pivot; the circle stays on the beam.
 polygon(g,[[pivotX,pivotY],[pivotX-160,640],[pivotX+160,640]],yellow);polygon(g,[[pivotX,pivotY+70],[pivotX-100,640],[pivotX+100,640]],ivory);
 g.save();g.translate(pivotX,pivotY);g.rotate(tilt);rect(g,-320,-20,640,40,c.secondary);rect(g,-320,8,640,12,black);ball(g,160-quad(smooth(.75,1.65,local))*320,-60,40,c);g.restore();
 disk(g,pivotX,pivotY,25,black);disk(g,pivotX,pivotY,8,ivory);
 // Edge-pivot quarter circles answer the central pivot in counterphase.
 for(let i=0;i<3;i++){const u=quad(smooth(.15+i*.15,.60+i*.15,local));quarter(g,80+i*160,560,160,-u*Math.PI/2,i%2?c.primary: black);}
 const b=beat(t,c);for(let i=0;i<3;i++)quarter(g,1040,160+i*160,120,(i%2?1:-1)*b*Math.PI/2,i%2?c.secondary:c.primary);
 text(g,c.words[Math.min(1,c.words.length-1)]||'启动',80,145,54,black,'left',850,490);
 text(g,'ONE PIVOT. A DIFFERENT VIEW.',83,185,13,black,'left',550);
 text(g,'02',1210,613,104,black,'right',800);
}

function cabin(g:G,c:EffectConfig,x:number,y:number,size:number,index:number,seed:number){
 const col=[c.primary,c.secondary,yellow,black][(index+seed)%4],s=size;
 rect(g,x-s*.5,y-s*.32,s,s*.58,col);disk(g,x,y-s*.32,s*.5,col);rect(g,x-s*.34,y-s*.29,s*.68,s*.32,ivory);rect(g,x-s*.36,y+s*.26,s*.72,6,black);
 stroke(g,[[x,y-s*.82],[x,y-s*.64]],black,3);
}
function wheel(g:G,c:EffectConfig,cx:number,cy:number,r:number,angle:number,assembly=1,scale=1){
 g.save();g.translate(cx,cy);g.scale(scale,scale);
 const support=smooth(0,.4,assembly);polygon(g,[[0,0],[-r*.62*support,r*1.22],[r*.62*support,r*1.22]],c.secondary);polygon(g,[[0,36],[-r*.31,r*1.22],[r*.31,r*1.22]],ivory);rect(g,-r*.76,r*1.15,r*1.52,14,black);
 const ring=smooth(0,.45,assembly);if(ring>0){annulus(g,0,0,r*ring,17,c.primary);annulus(g,0,0,r*.79*ring,3,black);}
 const spokes=4+Math.round(c.detail*4);for(let i=0;i<spokes*2;i++){const a=i*TAU/(spokes*2)+angle,rad=r*smooth(.12,.55,assembly);stroke(g,[[0,0],[Math.cos(a)*rad,Math.sin(a)*rad]],black,i%2?2:5);}
 disk(g,0,0,36,black);disk(g,0,0,18,yellow);
 const offset=Math.floor(hash(92,c.seed)*4);for(let i=0;i<4;i++){const on=smooth(.22+i*.14,.4+i*.14,assembly),a=-Math.PI/2+i*Math.PI/2+angle,x=Math.cos(a)*r,y=Math.sin(a)*r;g.save();g.translate(x,y-(1-on)*120);g.scale(on,on);cabin(g,c,0,34,70,i,offset);g.restore();}
 g.restore();
}

function assemble(g:G,c:EffectConfig,t:number){
 const u=smooth(4,5.8,t),angle=quad(smooth(4.25,5.6,t))*Math.PI/2;
 // A crop-sized wheel becomes a whole machine; the surrounding page prepares the next reveal.
 quarter(g,1040,160,480,Math.PI/2,c.secondary);rect(g,1040,160,160,480,c.secondary);
 for(let i=0;i<3;i++)rect(g,1100,200+i*120,40,80,ivory);
 wheel(g,c,520,340,220,angle,u,1);
 if(t<4.58){const transfer=quad(smooth(4,4.58,t));ball(g,lerp(649.29,520,transfer),lerp(264.44,340,transfer)-Math.sin(transfer*Math.PI)*45,lerp(40,18,transfer),c);}
 text(g,'圆，也可以',80,155,45,black,'left',800,390);text(g,'带你去兜风。',80,209,45,black,'left',800,390);
 text(g,c.words[Math.min(2,c.words.length-1)]||'一起玩',1120,613,27,ivory,'right',650,320);
 text(g,'03 / THE WHEEL COMES ALIVE',80,600,12,black,'left',550);
}

function arches(g:G,c:EffectConfig,t:number,x:number,y:number){
 const n=3+Math.round((c.count-3)/3),size=Math.min(104,480/n),b=beat(t,c);
 for(let i=0;i<n;i++){const a=quad(smooth(0,.65,(t*2-i*.22)%2)),h=160+(i%2)*80;g.save();g.translate(x+i*size,y);const col=i%2?c.primary:c.secondary;
  rect(g,0,-h+size/2,size,h-size/2,col);disk(g,size/2,-h+size/2,size/2,col);rect(g,size*.29,-h+size*.62,size*.42,h-size*.62,ivory);
  const rotation=(Math.floor(b+i)%4+a)*Math.PI/2;quarter(g,size/2,-h+size/2,size*.5,rotation,i%2?yellow:black);g.restore();}
}

function panorama(g:G,c:EffectConfig,t:number){
 const angle=beat(t-6,c)*Math.PI/2;
 // Four independent facilities now share the same page and baseline: the visual climax.
 quarter(g,40,80,400,0,yellow);quarter(g,1240,640,400,Math.PI,c.primary);
 wheel(g,c,350,337,200,angle,1,1);
 arches(g,c,t,700,600);
 rect(g,700,600,480,24,black);for(let i=0;i<6;i++)rect(g,720+i*80,624,40,16,black);
 const row=4+Math.round(c.count/2);for(let i=0;i<row;i++){const x=700+i*480/row,y=90+(i%2)*80;quarter(g,x,y,80,(beat(t,c,i*.18)%4)*Math.PI/2,i%3===0?black:i%3===1?c.primary:c.secondary);}
 const u=(t-6)/2,pathX=720+clamp(u)*400,pathY=440-Math.sin(clamp(u)*Math.PI)*100;ball(g,pathX,pathY,27,c,true);
 // An intentional label strip sits on the grid, rather than explanatory subtitles over the art.
 rect(g,700,230,480,70,ivory);text(g,'规则相同，玩法不同。',714,278,34,black,'left',850,450);
}

function endPoster(g:G,c:EffectConfig,t:number){
 const u=quad(smooth(8,8.6,t)),a=beat(t-8,c)*Math.PI/6;
 // The close is a new, deliberately composed poster, with a living wheel emblem.
 rect(g,40,80,560,560,c.primary);disk(g,320,340,236,ivory);wheel(g,c,320,325,176,a,1,.99);
 quarter(g,40,80,160,0,black);quarter(g,600,640,160,Math.PI,yellow);
 for(let i=0;i<3;i++){rect(g,88+i*160,600,112,12,ivory);rect(g,88+i*160,620,32,12,black);}
 g.save();g.beginPath();g.rect(660,80,580,560);g.clip();g.translate((1-u)*160,0);
 text(g,'PAPER',680,195,107,black,'left',900,550);text(g,'PLAYGROUND',680,298,78,black,'left',900,550);
 rect(g,684,328,112,12,yellow);rect(g,796,328,112,12,c.secondary);rect(g,908,328,112,12,c.primary);rect(g,1020,328,112,12,black);
 text(g,c.title,680,433,62,black,'left',850,550);text(g,c.subtitle,684,478,21,black,'left',450,530);
 stroke(g,[[684,525],[1218,525]],black,1.2);
 text(g,c.words.join(' / '),684,570,23,c.secondary,'left',650,530);
 text(g,'SAME RULES. MORE WAYS TO PLAY.',684,616,11,black,'left',600,530);
 g.restore();
}

export function bauhausFilm014(g:G,c:EffectConfig,t:number){
 t=clamp(t,0,10);rect(g,0,0,W,H,ivory);grid(g,c,t);
 const stage=t<2?0:t<4?1:t<6?2:t<8?3:4;
 g.save();g.beginPath();g.rect(40,80,1200,560);g.clip();
 if(stage===0)staircase(g,c,t);else if(stage===1)seesaw(g,c,t);else if(stage===2)assemble(g,c,t);else if(stage===3)panorama(g,c,t);else endPoster(g,c,t);
 g.restore();marks(g,c,t,['01 / COME IN','02 / FIND A PIVOT','03 / BUILD A RIDE','04 / EVERYONE PLAYS','05 / TAKE A POSTER'][stage]);
 texture(g,.055+c.detail*.035);
}
