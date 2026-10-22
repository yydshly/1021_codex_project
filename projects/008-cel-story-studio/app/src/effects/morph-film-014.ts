import type {EffectConfig} from '../../scripts/effects.mjs';
import {alignCyclic,type Point} from './geometry';
import {clamp,hash,lerp,smooth,text,TAU} from './math';

type G=CanvasRenderingContext2D;
const paper='#f4efd9',ink='#183f49',yellow='#f3c75a',white='#fff9e8';
const N=240;
type Asset={body:Point[];attachment:Point[];ribs:Point[][];ties:Point[][]};
let assetKey='',assets:Asset[]=[];

// Curves are authored as objects, then sampled once. More samples do not stand in for original artwork.
function sample(d:string,n=N):Point[]{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);const length=path.getTotalLength();return Array.from({length:n},(_,i)=>{const p=path.getPointAtLength(i/(n-1)*length);return [p.x,p.y];});}
function cubic(a:Point,b:Point,c:Point,d:Point,n=42):Point[]{return Array.from({length:n},(_,i)=>{const t=i/(n-1),u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];});}
function mixPoints(a:Point[],b:Point[],u:number):Point[]{return a.map((p,i)=>[lerp(p[0],b[i][0],u),lerp(p[1],b[i][1],u)]);}
function trace(g:G,p:Point[],closed=true){g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(closed)g.closePath();}
function stroke(g:G,p:Point[],color:string,width=3){trace(g,p,false);g.strokeStyle=color;g.lineWidth=width;g.stroke();}
function colorMix(a:string,b:string,u:number){const x=parseInt(a.slice(1),16),y=parseInt(b.slice(1),16);return '#'+[16,8,0].map(s=>Math.round(lerp((x>>s)&255,(y>>s)&255,u)).toString(16).padStart(2,'0')).join('');}
function ellipse(g:G,x:number,y:number,rx:number,ry:number,color:string){g.fillStyle=color;g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);g.fill();}
function makeAssets(detail:number){
 if(assetKey===String(detail))return assets;assetKey=String(detail);
 const scallop=17+detail*10;
 const bodies=[
  'M0 -128 C16 -87 68 -48 68 7 C68 82 -68 82 -68 7 C-68 -48 -16 -87 0 -128 Z',
  `M0 -158 C125 -158 229 -66 264 36 C218 ${-scallop} 176 ${-scallop} 132 36 C89 ${-scallop} 44 ${-scallop} 0 36 C-44 ${-scallop} -89 ${-scallop} -132 36 C-176 ${-scallop} -218 ${-scallop} -264 36 C-229 -66 -125 -158 0 -158 Z`,
  `M0 -266 C${235+detail*24} -266 220 -18 65 126 L32 157 L-32 157 L-65 126 C-220 -18 ${-235-detail*24} -266 0 -266 Z`,
  'M0 -245 C3 -244 177 -63 190 -45 C183 -32 14 150 0 157 C-13 151 -169 -27 -190 -45 C-178 -62 -4 -243 0 -245 Z',
 ];
 const hooks=[
  'M0 59 C1 59 2 60 2 61 C2 63 -2 63 -2 61 C-2 60 -1 59 0 59 Z',
  'M-6 31 L6 31 L6 176 C6 218 -58 218 -58 177 L-44 177 C-44 199 -8 199 -8 176 L-8 31 Z',
  'M-46 174 L46 174 L36 231 Q0 247 -36 231 Z',
  'M-5 151 C-21 187 55 197 35 233 C13 271 -42 259 -26 305 L-11 302 C-27 270 30 278 48 239 C72 190 -7 181 7 151 Z',
 ];
 assets=bodies.map((d,k)=>({body:sample(d),attachment:sample(hooks[k]),ribs:Array.from({length:9},(_,i)=>{
  const f=(i-4)/4;
  if(k===0)return cubic([0,-128],[f*28,-60],[f*62,-13],[f*30,54]);
  if(k===1)return cubic([0,-158],[f*125,-158],[f*229,-66],[f*264,36]);
  if(k===2)return [...cubic([0,-266],[f*(235+detail*24),-266],[f*220,-18],[f*65,126],38),...cubic([f*65,126],[f*54,137],[f*43,148],[f*32,157],5).slice(1)];
  // Each cloth panel keeps its identity as the round envelope becomes a taut kite.
  return [...cubic([0,-245],[f*3,-244],[f*177,-63],[f*190,-45],21),...cubic([f*190,-45],[f*183,-32],[f*14,150],[0,157],22).slice(1)];
 }),ties:[
  k===0?cubic([0,59],[0,59],[0,60],[0,61]):k===1?cubic([0,36],[0,86],[0,136],[0,177]):k===2?cubic([-65,126],[-62,142],[-43,159],[-35,179]):cubic([-190,-45],[-80,-69],[90,-69],[190,-45]),
  k===0?cubic([0,59],[0,59],[0,60],[0,61]):k===1?cubic([0,36],[0,86],[0,136],[0,177]):k===2?cubic([65,126],[62,142],[43,159],[35,179]):cubic([0,-245],[0,-100],[0,67],[0,157]),
 ]}));
 for(let i=1;i<assets.length;i++){assets[i].body=alignCyclic(assets[i-1].body,assets[i].body);assets[i].attachment=alignCyclic(assets[i-1].attachment,assets[i].attachment);}
 return assets;
}
function geometry(c:EffectConfig,t:number){const a=makeAssets(c.detail);let from=0,to=1,u=smooth(.44,1.45,t);
 if(t>=2.22){from=1;to=2;u=smooth(2.22,4.24,t);}if(t>=5.24){from=2;to=3;u=smooth(5.24,6.94,t);}
 return {from,to,u,body:mixPoints(a[from].body,a[to].body,u),attachment:mixPoints(a[from].attachment,a[to].attachment,u),ribs:a[from].ribs.map((p,i)=>mixPoints(p,a[to].ribs[i],u)),ties:a[from].ties.map((p,i)=>mixPoints(p,a[to].ties[i],u))};
}
let grain:HTMLCanvasElement|undefined;
function printFinish(g:G){if(!grain){grain=document.createElement('canvas');grain.width=320;grain.height=240;const a=grain.getContext('2d')!,im=a.createImageData(320,240);for(let i=0;i<im.data.length;i+=4){const v=hash(i,514)>.54?255:0;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=hash(i+7,98)*45;}a.putImageData(im,0,0);}g.save();g.globalAlpha=.09;g.fillStyle=g.createPattern(grain,'repeat')!;g.fillRect(0,0,1280,720);g.restore();}

function rainAndWeather(g:G,c:EffectConfig,t:number,inflate:number,fly:number){
 const amount=Math.round(16+c.count*3),rain=Math.max(0,1-smooth(1.8,3.55,t));
 g.save();g.lineCap='round';
 for(let i=0;i<amount;i++){
  const x=70+hash(i,c.seed)*1140,y=(hash(i+90,c.seed)*800+t*(150+hash(i+31,c.seed)*50))%800-70;
  const hit=1-smooth(360,385,y);g.globalAlpha=rain*.35*(x>350&&x<930?hit:1);stroke(g,[[x,y],[x-9,y+28]],c.secondary,1.6);
 }
 // Wind lanes are drawn as broad, designed arcs; the hero's movement shares their direction.
 const wind=smooth(2.1,4.2,t)*(1-smooth(8,8.8,t));g.globalAlpha=wind*.27;
 for(let i=0;i<3;i++){g.beginPath();g.moveTo(-100,620-i*65);g.bezierCurveTo(230,750-i*90,530,20+i*60,1390,100+i*80);g.strokeStyle=i===1?yellow:white;g.lineWidth=i===1?2:1;g.stroke();}
 g.globalAlpha=1;
 for(let i=0;i<5;i++){const x=70+i*270-(t-3)*22,y=110+hash(i+80,c.seed)*100;g.globalAlpha=inflate*.18*(1-fly*.3);g.strokeStyle=white;g.lineWidth=1;g.beginPath();g.ellipse(x,y,50+hash(i,c.seed)*20,13,0,0,TAU);g.stroke();}
 g.restore();
}

/** One continuous original object chain. t is the film's normalized 0–10 second clock. */
export function morphFilm014(g:G,c:EffectConfig,t:number){
 t=clamp(t,0,10);const shape=geometry(c,t),open=smooth(.44,1.45,t),inflate=smooth(2.22,4.24,t),fly=smooth(5.24,6.94,t),poster=smooth(7.75,9,t);
 const fall=smooth(0,.62,t),lift=smooth(3.9,5.2,t),flight=smooth(6.45,8.05,t);
 const x=lerp(640+Math.sin(t*1.4)*5,925,poster)+Math.sin(flight*Math.PI)*60;
 const y=lerp(lerp(175,362,fall)-Math.sin(smooth(.65,1.55,t)*Math.PI)*16*c.intensity-lift*65-flight*12,360,poster);
 const size=lerp(1-lift*.12,.79,poster),sway=lerp(lerp(-.05+Math.sin(t*2.1)*.025,.06+Math.sin(t*1.8)*.035,inflate),-.23+Math.sin(t*3.2)*.065*c.intensity,fly)*(1-poster*.65);
 g.save();g.lineCap='round';g.lineJoin='round';g.fillStyle=paper;g.fillRect(0,0,1280,720);
 // Sky colour grows out from the inflating object, not from a cut or a dissolve.
 const sky=smooth(3.65,4.5,t);if(sky>0){g.fillStyle=c.secondary;g.beginPath();g.arc(x,y-130,sky*1500,0,TAU);g.fill();}
 if(poster>0){const edge=1450-poster*3200;g.fillStyle=paper;g.beginPath();g.moveTo(edge,-100);g.lineTo(1500,-100);g.lineTo(1500,850);g.lineTo(edge+650,850);g.bezierCurveTo(edge+450,520,edge+270,100,edge,-100);g.fill();}
 rainAndWeather(g,c,t,inflate,fly);
 // The shadow loosens and shrinks as the balloon leaves the wet ground.
 g.save();g.globalAlpha=(1-lift)*.12*(1-poster);ellipse(g,638,605,210*(.45+open*.55),13*(1-inflate*.4),c.secondary);g.restore();
 const darkBackground=sky>.58&&poster<.72;
 const fg=darkBackground?paper:ink;
 g.save();g.globalAlpha=1-Math.sin(poster*Math.PI)*.9;text(g,'晴天放映室 / WEATHER PLAY',48,43,13,fg,'left',650);
 text(g,'A LITTLE WEATHER. A LOT OF WONDER.',1233,43,10,fg,'right',500);g.restore();

 // Genuine body and subpart morphing: canopy → balloon cloth → kite cloth;
 // umbrella hook → basket → wind ribbon. No whole-object opacity substitution.
 g.save();g.translate(x,y);g.rotate(sway);const anticipation=1-Math.sin(smooth(2.0,2.4,t)*Math.PI)*.055*c.intensity;
 const stretch=1+Math.sin(smooth(.45,1.35,t)*Math.PI)*.12*c.intensity;
 g.scale(size*stretch*anticipation,size/stretch/anticipation);
 g.save();trace(g,shape.body);g.clip();g.fillStyle=c.primary;g.fillRect(-400,-360,800,800);
 const umbrellaColors=[c.primary,c.primary,white,c.primary,c.primary,white,c.primary,c.primary],balloonColors=[c.primary,c.primary,white,c.primary,yellow,white,c.primary,c.primary],kiteColors=[c.primary,c.primary,yellow,white,c.primary,c.primary,yellow,c.primary];
 for(let i=0;i<8;i++){
  const a=shape.from===0?c.primary:shape.from===1?umbrellaColors[i]:balloonColors[i],b=shape.to===1?umbrellaColors[i]:shape.to===2?balloonColors[i]:kiteColors[i];
  trace(g,[...shape.ribs[i],...shape.ribs[i+1].slice().reverse()]);g.fillStyle=colorMix(a,b,shape.u);g.fill();
 }
 // A soft ink shadow follows a designed fold, not a screen-space glow or a repeated silhouette.
 trace(g,[...shape.ribs[4],...shape.ribs[6].slice().reverse()]);g.fillStyle='#142d3f12';g.fill();
 g.restore();
 // Structural lines stay visible throughout their corresponding cloth transformation.
 g.save();trace(g,shape.body);g.clip();for(let i=1;i<8;i++){g.save();g.globalAlpha=open*(.15+(i===4?.12:0));stroke(g,shape.ribs[i],ink,1.15+c.detail*.7);g.restore();}g.restore();
 g.save();g.globalAlpha=.18;trace(g,shape.body);g.strokeStyle=white;g.lineWidth=1.1;g.stroke();g.restore();
 const seams=shape.ties.map(p=>p.map(([xx,yy])=>[xx,yy] as Point)),structure=colorMix(ink,white,sky*(1-fly));for(const p of seams)stroke(g,p,structure,2.3);
 const attachment=shape.attachment.map(([xx,yy])=>{const v=Math.max(0,(yy-155)/150);return [xx+Math.sin(t*4-v*6)*22*v*c.intensity*fly,yy] as Point;});
 trace(g,attachment);g.fillStyle=colorMix(ink,c.primary,inflate*(1-fly*.55));g.fill();
 // Basket weave becomes small print seams on the ribbon. Its lines interpolate with the material.
 const weave=inflate*(1-fly);if(weave>0){g.save();trace(g,attachment);g.clip();g.strokeStyle=white;g.globalAlpha=.48;g.lineWidth=1.4;
  for(let i=0;i<5;i++){const yy=183+i*11;stroke(g,[[lerp(0,-50,weave),yy],[lerp(0,50,weave),yy]],white,1.4);}g.restore();}
 // This taut string is inherited from the basket's left tether as flight develops.
 if(fly>0){const line=cubic([0,38],[-35*fly,130],[-180*fly,250],[-330*fly,300+Math.sin(t*3)*8]);stroke(g,line.slice(0,Math.max(2,Math.round(line.length*fly))),darkBackground?white:ink,1.3);}
 // Three cloth tabs travel with the kite instead of being disconnected decorative copies.
 for(let i=0;i<3;i++){const v=fly,yy=188+i*42,xx=Math.sin(t*4-i)*10*c.intensity;
  const w=(9+i*2)*v;g.beginPath();g.moveTo(xx-w,yy);g.lineTo(xx,yy+5*v);g.lineTo(xx+w,yy-7*v);g.lineTo(xx+w,yy+13*v);g.lineTo(xx,yy+5*v);g.lineTo(xx-w,yy+17*v);g.closePath();g.fillStyle=i%2?yellow:white;g.fill();}
 g.restore();

 // Contact accents: rain hits the opened cloth; inflation sends a few paper pieces upward.
 if(t>.8&&t<1.9){const a=smooth(.8,1.1,t)*(1-smooth(1.5,1.9,t));g.save();g.globalAlpha=a;for(const side of [-1,1])for(let i=0;i<3;i++){const xx=x+side*(245+i*18),yy=y+30+i*7;stroke(g,[[xx,yy],[xx+side*(11+10*a),yy-13-8*i]],c.primary,2);}g.restore();}
 const release=smooth(6.2,7.6,t)*(1-poster);for(let i=0;i<c.count;i++){const f=hash(i+10,c.seed),a=i*2.399+f,rad=115+f*180;
  const xx=x+Math.cos(a)*rad,yy=y-90+Math.sin(a)*rad*.75;g.save();g.globalAlpha=release*.75;g.translate(xx,yy);g.rotate(t*.5+a);g.fillStyle=i%3===0?yellow:i%3===1?white:c.primary;g.fillRect(-3,-6,6,12);g.restore();}

 // Editorial composition is specific to this film. The final cloth object and type share one poster grid.
 if(poster<1){const phase=t<2.22?0:t<5.24?1:2,word=c.words[Math.min(phase,c.words.length-1)]||['撑开','升起','放飞'][phase];
  const pos=phase===1?{x:75,y:551}:{x:75,y:567};g.save();g.globalAlpha=1-smooth(0,.45,poster);text(g,`0${phase+1} / ${['SHELTER','RISE','WONDER'][phase]}`,pos.x,pos.y-53,12,fg,'left',600);text(g,word,pos.x,pos.y,42,fg,'left',800,420);g.restore();
 }
 if(poster>0){g.save();g.globalAlpha=smooth(.6,1,poster);
  text(g,'为风，留一片天空。',76,195,18,ink,'left',500,525);
  text(g,c.title,73,291,c.title.length>9?54:68,ink,'left',850,600);
  text(g,c.subtitle,78,337,21,ink,'left',450,548);
  stroke(g,[[78,384],[511,384]],ink,1);text(g,'RAIN  →  AIR  →  PLAY',78,416,13,ink,'left',650);
  text(g,'把普通天气，变成一次出游。',78,558,15,ink,'left',500,530);
  for(let i=0;i<3;i++)ellipse(g,90+i*29,592,7,7,[c.primary,c.secondary,yellow][i]);g.restore();}
 // Small technical-free timing marks read as festival print furniture.
 stroke(g,[[48,661],[1232,661]],fg+'65',.7);const step=t<2.22?0:t<5.24?1:2;
 for(let i=0;i<3;i++){g.fillStyle=i===step?c.primary:fg+'40';g.fillRect(49+i*28,674,i===step?20:11,3);}text(g,poster>.9?'晴天，随时出发。':'KEEP YOUR IMAGINATION OPEN',1230,680,11,fg,'right',500);
 printFinish(g);g.restore();
}
