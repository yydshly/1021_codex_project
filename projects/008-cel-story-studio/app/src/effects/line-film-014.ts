import type {EffectConfig} from '../../scripts/effects.mjs';
import type {Point} from './geometry';
import {clamp,hash,lerp,smooth,text,TAU} from './math';

type G=CanvasRenderingContext2D;
type Curve={points:Point[];clock:number[];total:number};
const NAVY='#071827',CREAM='#f4e8cb';
function cubic(a:Point,b:Point,c:Point,d:Point,n=60):Point[]{return Array.from({length:n},(_,i)=>{const t=i/(n-1),u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];});}
function sample(d:string,n=480):Point[]{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);const length=p.getTotalLength();return Array.from({length:n},(_,i)=>{const q=p.getPointAtLength(i/(n-1)*length);return [q.x,q.y];});}
function curve(points:Point[]):Curve{
 const clock=[0];for(let i=1;i<points.length;i++){
  const p=points[i],a=points[i-1],b=points[Math.min(points.length-1,i+2)],z=points[Math.max(0,i-3)];
  const turn=Math.atan2(p[1]-z[1],p[0]-z[0])-Math.atan2(b[1]-a[1],b[0]-a[0]);
  const angle=Math.abs(Math.atan2(Math.sin(turn),Math.cos(turn))),d=Math.hypot(p[0]-a[0],p[1]-a[1]);
  clock.push(clock[i-1]+d*(1+Math.min(4,angle*4.5)));
 }return {points,clock,total:clock.at(-1)!};
}
function cursor(c:Curve,u:number){const target=clamp(u)*c.total;let lo=0,hi=c.clock.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(c.clock[m]<target)lo=m;else hi=m;}const f=(target-c.clock[lo])/(c.clock[hi]-c.clock[lo]||1);return {index:lo,f,point:[lerp(c.points[lo][0],c.points[hi][0],f),lerp(c.points[lo][1],c.points[hi][1],f)] as Point};}
function path(g:G,p:Point[],closed=false){g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(closed)g.closePath();}
function line(g:G,p:Point[],color:string,w:number){if(p.length<2)return;path(g,p);g.strokeStyle=color;g.lineWidth=w;g.stroke();}
function dot(g:G,p:Point[],r:number,color:string){g.fillStyle=color;g.beginPath();g.arc(p[0][0],p[0][1],Math.max(.01,r),0,TAU);g.fill();}
function part(points:Point[],c:Curve,u:number){const tip=cursor(c,u);return [...points.slice(0,tip.index+1),[lerp(points[tip.index][0],points[tip.index+1][0],tip.f),lerp(points[tip.index][1],points[tip.index+1][1],tip.f)] as Point];}

let whale:Curve|undefined,spine:Curve|undefined,sky:Curve|undefined,moon:Point[]|undefined,finShape:Point[]|undefined;
function drawings(){if(whale&&spine&&sky&&moon)return {whale,spine,sky,moon};
 whale=curve(sample('M-270 0 C-218 -47 -130 -89 -61 -76 Q-46 -82 -38 -95 Q-27 -84 0 -83 C78 -105 171 -108 230 -66 C284 -52 320 -25 330 7 C312 51 231 72 165 61 C105 60 80 90 10 103 C-92 130 -201 89 -270 45 L-335 104 C-340 58 -330 30 -307 13 C-345 -5 -368 -38 -366 -73 L-270 0 Z'));
 spine=curve(sample('M-270 0 C-218 -47 -130 -89 -61 -76 Q-46 -82 -38 -95 Q-27 -84 0 -83 C78 -105 171 -108 230 -66',190));
 sky=curve(sample('M738 230 C774 196 772 120 820 102 L920 160 L872 245 L1038 294 L1123 210 L1060 92 L930 58 L820 102 C873 48 979 56 1070 75 C1010 60 995 160 1070 190 C1025 150 1040 105 1070 75',580));
 moon=sample('M1070 75 C1010 60 995 160 1070 190 C1025 150 1040 105 1070 75 Z',180);
 return {whale,spine,sky,moon};
}
function bodyState(c:EffectConfig,t:number){const jump=smooth(2.5,5.7,t),lift=Math.sin(jump*Math.PI),settle=smooth(5.7,8.25,t);
 return {x:lerp(522,445,settle),y:430-lift*(145+c.intensity*70)+settle*16,scale:lerp(.88,.73,settle),angle:-lift*.17+settle*.025,breach:lift,settle};
}
function deform(p:Point,c:EffectConfig,t:number):Point{
 let [x,y]=p;const s=bodyState(c,t),f=clamp((-x-185)/155),a=(Math.sin(t*3.1)*(.08+c.intensity*.13)-s.breach*.29)*f;
 if(f>0){const xx=x+205,yy=y-16;x=-205+xx*Math.cos(a)-yy*Math.sin(a);y=16+xx*Math.sin(a)+yy*Math.cos(a);}
 const belly=Math.sin(clamp((x+270)/600)*Math.PI);y+=belly*(Math.sin(t*2.9)*3+s.breach*Math.sin(t*3.8)*6);
 return [x,y];
}
function world(p:Point,c:EffectConfig,t:number):Point{const [x,y]=deform(p,c,t),s=bodyState(c,t);return [s.x+(x*Math.cos(s.angle)-y*Math.sin(s.angle))*s.scale,s.y+(x*Math.sin(s.angle)+y*Math.cos(s.angle))*s.scale];}
function skyPoints(c:EffectConfig,t:number){const a=drawings().sky.points,start=world([228,-65],c,t),dx=start[0]-a[0][0],dy=start[1]-a[0][1];return a.map(([x,y],i)=>{const influence=1-smooth(0,.23,i/(a.length-1));return [x+dx*influence,y+dy*influence] as Point;});}
function waterLead(c:EffectConfig,t:number){const to=world([-270,0],c,t);return curve(cubic([50,535],[167,548],[195,421],to,110));}
function pen(c:EffectConfig,t:number):Point{const d=drawings();
 if(t<.42){const a=waterLead(c,t);return cursor(a,smooth(0,.42,t)).point;}
 if(t<2.75)return world(cursor(d.whale,smooth(.42,2.75,t)).point,c,t);
 if(t<3.35)return world(cursor(d.spine,smooth(2.75,3.35,t)).point,c,t);
 const points=skyPoints(c,t),cur=cursor(d.sky,smooth(3.35,8.1,t));return [lerp(points[cur.index][0],points[cur.index+1][0],cur.f),lerp(points[cur.index][1],points[cur.index+1][1],cur.f)];
}
function camera(c:EffectConfig,t:number){const end=smooth(2.25,3.8,t),zoom=lerp(1.65,1,end)*(1-smooth(8.2,9.25,t)*.04);
 const p0=pen(c,Math.max(0,t-.08)),p1=pen(c,t),p2=pen(c,Math.min(10,t+.08)),x=(p0[0]+p1[0]*2+p2[0])/4,y=(p0[1]+p1[1]*2+p2[1])/4;
 const body=bodyState(c,t),follow=smooth(.48,1.12,t)*.3;
 return {x:lerp(lerp(x+58,body.x,follow),640,end),y:lerp(lerp(y,body.y,follow),360,end),zoom};
}

/** Tide-written line film. The pen, reveal, body deformation and camera share one deterministic clock. */
export function lineFilm014(g:G,c:EffectConfig,t:number){
 t=clamp(t,0,10);const d=drawings(),cam=camera(c,t),s=bodyState(c,t),draw=smooth(.42,2.75,t),starU=smooth(3.35,8.1,t),end=smooth(8.35,9.05,t);
 const gold=c.primary,aqua=c.secondary,width=1.8+c.detail*1.2;
 g.save();g.fillStyle=NAVY;g.fillRect(0,0,1280,720);g.lineCap='round';g.lineJoin='round';
 const light=g.createRadialGradient(790,320,30,790,320,650);light.addColorStop(0,'#17354b8a');light.addColorStop(1,'#07182700');g.fillStyle=light;g.fillRect(0,0,1280,720);
 g.save();g.translate(640,360);g.scale(cam.zoom,cam.zoom);g.translate(-cam.x,-cam.y);
 // Quiet chart stars remain secondary until the drawn constellation reaches them.
 for(let i=0;i<35+c.count*5;i++){const x=hash(i,c.seed)*1350,y=hash(i+300,c.seed)*510;g.globalAlpha=.09+starU*.18;dot(g,[[x,y]],(.45+hash(i+30,c.seed)*.7)/cam.zoom,CREAM);}g.globalAlpha=1;
 // Ocean bands bunch under the breach and relax into the end poster. They are not a fixed sine wallpaper.
 for(let row=0;row<8;row++){
  const pts:Point[]=[];for(let x=-120;x<=1410;x+=10){const swell=Math.exp(-(((x-s.x)/210)**2))*s.breach*(18+row*3),y=548+row*15+Math.sin(x*.009+t*.75+row*.5)*(3+row*.4)-swell;pts.push([x,y]);}
  line(g,pts,row===0?gold+'85':aqua+(row%2?'2b':'42'),(row===0?1.35:.75)/cam.zoom);
 }
 const lead=waterLead(c,t);line(g,part(lead.points,lead,smooth(0,.42,t)),gold,width/cam.zoom);
 const body=d.whale.points.map(p=>world(p,c,t));
 if(draw>.9){g.save();g.globalAlpha=smooth(.9,1,draw);path(g,body,true);g.fillStyle='#091d2c';g.fill();g.restore();}
 // The live body includes a flexible tail peduncle and a deforming belly/back, not just a group rotation.
 g.save();g.shadowColor=gold;g.shadowBlur=4;line(g,part(body,d.whale,draw),gold,width/cam.zoom);g.restore();
 const details=smooth(.78,1,draw);
 if(details>0){g.save();g.globalAlpha=details;
  const mouth=cubic([329,8],[265,37],[202,27],[170,23],58).map(p=>world(p,c,t));line(g,mouth,gold+'b0',1.1/cam.zoom);
  dot(g,[world([264,-8],c,t)],2.6/cam.zoom,CREAM);
  // The long pectoral fin opens on the rise and trails on the return.
  const finAngle=Math.sin(t*2.2)*.10-s.breach*(.27+c.intensity*.24),anchor:Point=[88,65];
  finShape??=sample('M88 65 C65 116 -49 212 -114 160 C-72 142 -4 93 28 77',78);
  const fin=finShape.map(([x,y])=>{const xx=x-anchor[0],yy=y-anchor[1];return world([anchor[0]+xx*Math.cos(finAngle)-yy*Math.sin(finAngle),anchor[1]+xx*Math.sin(finAngle)+yy*Math.cos(finAngle)],c,t);});
  line(g,fin,gold,1.65/cam.zoom);
  for(let i=0;i<5+Math.round(c.count/2);i++){const f=i/(4+Math.round(c.count/2)),fold=cubic([319-f*12,17+f*26],[210-f*25,40+f*36],[70-f*85,62+f*36],[10-f*40,69+f*32],50).map(p=>world(p,c,t));line(g,fold,aqua+'a0',.75/cam.zoom);}
  g.restore();
 }
 if(t>=2.75&&t<3.6){g.save();g.globalAlpha=1-smooth(3.35,3.6,t);line(g,part(d.spine.points.map(p=>world(p,c,t)),d.spine,smooth(2.75,3.35,t)),CREAM,2.1/cam.zoom);g.restore();}
 // Water strokes share the tail's departure arc and continue upward into the same sky space.
 const splash=smooth(2.9,3.8,t)*(1-smooth(5.2,6,t));
 if(splash>0)for(let i=0;i<7+c.count;i++){const f=i/(6+c.count),u=clamp((t-2.85-f*.27)/2.45),a=world([-130+f*230,90],c,t),x=a[0]+(f-.5)*u*280,y=550-Math.sin(u*Math.PI)*(100+hash(i,c.seed)*120);g.save();g.globalAlpha=splash*(1-u);line(g,[[x,y],[x+(f-.5)*12,y+13+u*10]],aqua,1.1/cam.zoom);g.restore();}
 const stars=skyPoints(c,t),skyTip=cursor(d.sky,starU);if(starU>0){
  line(g,part(stars,d.sky,starU),gold+'d0',1.05/cam.zoom);
  const slots=[82,146,208,263,323,379];for(let i=0;i<slots.length;i++){const k=slots[i];if(k>skyTip.index)continue;const at=stars[k],r=(i===2||i===4?3.3:2.1)/cam.zoom;
   g.save();g.shadowColor=gold;g.shadowBlur=i===2?15:7;dot(g,[at],r,CREAM);g.restore();
   if(i%2===0){line(g,[[at[0]-8/cam.zoom,at[1]],[at[0]+8/cam.zoom,at[1]]],gold+'b0',.6/cam.zoom);line(g,[[at[0],at[1]-8/cam.zoom],[at[0],at[1]+8/cam.zoom]],gold+'b0',.6/cam.zoom);}
  }
 }
 // The pen finishes by closing the crescent; its fill grows from the same anchor, rather than appearing elsewhere.
 const fill=smooth(8.08,8.7,t);if(fill>0){g.save();path(g,d.moon,true);g.clip();const foil=g.createLinearGradient(1015,70,1080,190);foil.addColorStop(0,CREAM);foil.addColorStop(.5,gold);foil.addColorStop(1,'#a98c4d');g.fillStyle=foil;g.fillRect(1000,190-130*fill,110,140);g.restore();}
 if(t<8.55){
  const p=pen(c,t),vis=1-smooth(8.1,8.55,t);
  g.save();g.globalAlpha=vis;g.shadowColor=gold;g.shadowBlur=16;dot(g,[p],3.2/cam.zoom,CREAM);g.shadowBlur=0;
  // A short speed-aware exposure trail; not a stack of complete whale outlines.
  for(let i=1;i<=5;i++){const q=pen(c,Math.max(0,t-i/110));g.globalAlpha=vis*(1-i/6)*.22;dot(g,[q],1.3/cam.zoom,gold);}g.restore();
 }
 g.restore();
 // The reveal lands in an authored sea-and-sky poster, preserving room for the live animal and the chart.
 text(g,'PELAGIC / 远海来信',45,42,12,CREAM,'left',500);text(g,'DRAWN BY THE TIDE',1234,42,11,aqua,'right',450);
 if(end>0){g.save();g.globalAlpha=end;text(g,c.title,65,620,c.title.length>10?40:50,CREAM,'left',750,830);text(g,c.subtitle,68,660,20,aqua,'left',450,890);text(g,'海与星空，原来共用一条线。',1214,652,12,gold,'right',450,280);g.restore();}
 else{const word=t<2.75?c.words[0]:t<5.7?c.words[Math.min(1,c.words.length-1)]:c.words.at(-1);g.save();g.globalAlpha=smooth(.3,.8,t)*(1-smooth(8,8.5,t));text(g,word||'听潮',68,654,23,CREAM,'left',500,900);g.restore();}
 g.restore();
}
