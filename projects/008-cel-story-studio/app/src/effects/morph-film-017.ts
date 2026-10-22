import type {EffectConfig} from '../../scripts/effects.mjs';
import {alignCyclic,type Point} from './geometry';
import {curve} from './engraving-016';
import {clamp,hash,lerp,smooth,text,TAU} from './math';
type G=CanvasRenderingContext2D;type Asset={body:string;part:string;hole:string;hole2?:string;lines:Point[][]};
const INK='#183d43',PAPER='#f2ead5',WHITE='#fff7e4',GOLD='#eebc55',N=200;
const circle=(x:number,y:number,r:number)=>`M${x} ${y-r} A${r} ${r} 0 1 1 ${x-.01} ${y-r} Z`;
const voyage:Asset[]=[
 {body:'M-230 -143 Q0 -160 230 -143 L232 144 Q0 158 -232 144 Z',part:'M-229 -139 L0 20 L229 -139 L0 -193 Z',hole:'M122 -111 L183 -111 L183 -57 L122 -57 Z',lines:[[[-230,-143],[0,20],[230,-143]],[[-232,144],[0,-13],[232,144]],[[120,-112],[180,-113],[180,-59]]] },
 {body:'M-255 22 Q0 57 258 19 L155 139 Q0 178 -160 139 Z',part:'M-4 -218 Q-94 -113 -205 -5 L-4 -5 L-4 -218 L147 -6 L14 -6 Z',hole:circle(93,86,20),lines:[[[0,-216],[0,-5],[0,37]],[[-255,22],[0,64],[258,19]],[[-184,-17],[-91,-107],[-18,-197]]] },
 {body:'M-262 21 Q-186 -17 -132 -84 Q-68 -140 -36 -119 L-23 -158 L17 -122 Q96 -131 172 -99 Q268 -73 277 -31 L276 31 Q241 113 128 120 Q-52 169 -184 89 L-259 53 Q-216 37 -262 21 Z',part:'M-212 48 Q-289 -36 -340 -67 Q-335 24 -279 50 Q-325 106 -321 162 Q-248 139 -212 48 Z',hole:circle(202,-21,6),lines:[[[-149,83],[-45,105],[134,93]],[[-2,23],[56,65],[1,121]],[[159,41],[214,51],[270,32]]] },
 {body:'M-280 112 Q-183 65 -118 19 Q-47 -82 58 -30 Q140 19 195 58 Q255 58 282 112 Q0 162 -280 112 Z',part:'M-149 21 Q-144 -85 -119 -137 Q-158 -180 -211 -150 Q-211 -197 -141 -192 Q-151 -239 -96 -263 Q-107 -198 -106 -187 Q-48 -244 3 -209 Q-74 -170 -103 -157 Q-77 -133 -16 -137 Q-38 -95 -118 -136 Q-134 -73 -127 24 Z',hole:'M109 31 L135 31 L135 67 L109 67 Z',lines:[[[-278,115],[-15,148],[281,112]],[[99,33],[118,12],[151,33]],[[-132,-13],[-127,-70],[-117,-137]]] }
];
const weekend:Asset[]=[
 {body:circle(0,0,165),part:'M-38 -160 L-39 -201 Q0 -245 39 -201 L38 -160 L23 -160 L23 -194 Q0 -214 -23 -194 L-23 -160 Z',hole:circle(0,0,133),hole2:circle(0,-190,9),lines:[[[0,-111],[0,0],[73,41]],[[-16,-175],[0,-181],[16,-175]],[[-128,0],[0,0],[126,0]]] },
 {body:circle(167,86,104),part:circle(-167,86,104),hole:circle(167,86,80),hole2:circle(-167,86,80),lines:[[[-167,86],[-68,-55],[47,86],[-167,86],[47,86],[122,-58],[167,86]],[[-101,-56],[-51,-56],[-28,-67]],[[122,-58],[105,-111],[151,-111]]] },
 {body:circle(0,-6,205),part:'M-18 -7 L18 -7 L88 237 L65 237 L0 34 L-65 237 L-88 237 Z',hole:circle(0,-6,177),hole2:'M-1 35 L1 35 L6 49 L-6 49 Z',lines:[[[0,-6],[-11,9],[0,-6],[12,-3],[0,-6],[15,4],[0,-6]],[[-92,237],[0,237],[92,237]],[[0,-6],[0,-6],[0,-6]]] }
];
type Sampled={body:Point[];part:Point[];hole:Point[];hole2:Point[];lines:Point[][]};
const cache=new Map<string,Sampled[]>();
function samplePath(d:string){const el=document.createElementNS('http://www.w3.org/2000/svg','path');el.setAttribute('d',d);const length=el.getTotalLength();return Array.from({length:N},(_,i)=>{const p=el.getPointAtLength(i/N*length);return [p.x,p.y] as Point;});}
function resampleLine(p:Point[],n=36){const ds=p.slice(1).map((q,i)=>Math.hypot(q[0]-p[i][0],q[1]-p[i][1])),len=ds.reduce((a,b)=>a+b,0);return Array.from({length:n},(_,i)=>{let d=i/(n-1)*len;for(let k=0;k<ds.length;k++){if(d<=ds[k])return [lerp(p[k][0],p[k+1][0],d/(ds[k]||1)),lerp(p[k][1],p[k+1][1],d/(ds[k]||1))] as Point;d-=ds[k];}return p.at(-1)!;});}
function assets(id:string){if(cache.has(id))return cache.get(id)!;const data=(id==='weekend'?weekend:voyage).map(a=>({body:samplePath(a.body),part:samplePath(a.part),hole:samplePath(a.hole),hole2:samplePath(a.hole2||circle(0,0,.01)),lines:a.lines.map(p=>resampleLine(p))}));for(let i=1;i<data.length;i++)for(const key of ['body','part','hole','hole2'] as const)data[i][key]=alignCyclic(data[i-1][key],data[i][key]);cache.set(id,data);return data;}
const mix=(a:Point[],b:Point[],u:number)=>a.map((p,i)=>[lerp(p[0],b[i][0],u),lerp(p[1],b[i][1],u)] as Point);
function trace(g:G,p:Point[],close=true){g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(close)g.closePath();}
function stroke(g:G,p:Point[],color:string,w=2){trace(g,p,false);g.lineCap='round';g.lineJoin='round';g.strokeStyle=color;g.lineWidth=w;g.stroke();}
function fill(g:G,p:Point[],color:string,w=0){trace(g,p);g.fillStyle=color;g.fill();if(w){g.strokeStyle=INK;g.lineWidth=w;g.stroke();}}
function oval(g:G,x:number,y:number,rx:number,ry:number,color:string){g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);g.fillStyle=color;g.fill();}
function blend(a:string,b:string,u:number){const aa=parseInt(a.slice(1),16),bb=parseInt(b.slice(1),16);return '#'+[16,8,0].map(s=>Math.round(lerp((aa>>s)&255,(bb>>s)&255,u)).toString(16).padStart(2,'0')).join('');}
export function morphFilm017(g:G,c:EffectConfig,t:number){
 const isWeekend=c.storyId==='weekend',data=assets(isWeekend?'weekend':'voyage');
 const transitions=isWeekend?[[1.28,2.92],[4.15,6.1]]:[[1.15,2.5],[3.65,5.05],[6.0,7.45]];
 let from=0,to=1,u=smooth(...transitions[0] as [number,number],t);for(let i=1;i<transitions.length;i++)if(t>=transitions[i][0]){from=i;to=i+1;u=smooth(...transitions[i] as [number,number],t);}
 const a=data[from],b=data[to],body=mix(a.body,b.body,u),part=mix(a.part,b.part,u),hole=mix(a.hole,b.hole,u),hole2=mix(a.hole2,b.hole2,u),lines=a.lines.map((p,i)=>mix(p,b.lines[i],u));
 const event=Math.sin(u*Math.PI),final=smooth(7.7,8.8,t),sea=isWeekend?smooth(4.4,6.6,t):smooth(1.6,3.3,t),lift=isWeekend?smooth(4.15,6.1,t):smooth(6,7.45,t);
 const x=lerp(640+Math.sin(t*.8)*19+Math.sin(u*TAU)*event*35*c.intensity,965,final),y=lerp(isWeekend?340:344+Math.sin(t*3.4)*9*(1-lift),345,final),z=lerp(1,.77,final),angle=(Math.sin(t*2.3)*.025+event*Math.sin(u*TAU)*.11*c.intensity)*(1-final);
 g.save();g.fillStyle=PAPER;g.fillRect(0,0,1280,720);
 if(isWeekend){g.fillStyle=c.secondary;g.beginPath();g.arc(940,325,455*sea,0,TAU);g.fill();}else{const top=lerp(772,-90,sea);g.fillStyle=c.secondary;g.beginPath();g.moveTo(-30,top);for(let j=0;j<80;j++){const xx=j*18-45;g.lineTo(xx,top+Math.sin(xx*.006-t*1.4)*22);}g.lineTo(1320,770);g.lineTo(-30,770);g.closePath();g.fill();}
 const dark=!isWeekend&&sea>.22;const fg=dark?WHITE:INK;
 if(!isWeekend){for(let i=0;i<5;i++){const points=Array.from({length:80},(_,j)=>{const xx=j*18-70;return [xx,514+i*32+Math.sin(xx*.009-t*2.1+i*.7)*(7+i*2)] as Point;});g.save();g.globalAlpha=sea*(.2-i*.025);stroke(g,points,WHITE,1.2);g.restore();}}
 else{g.save();g.globalAlpha=smooth(2.6,3.2,t)*(1-smooth(4.1,4.5,t));stroke(g,[[90,533],[1210,533]],INK,3);for(let i=0;i<6;i++)stroke(g,[[90+i*260-t*95%260,558],[178+i*260-t*95%260,558]],INK+'55',2);g.restore();}
 g.save();g.translate(x,y);g.rotate(angle);g.scale(z*(1-event*.09*c.intensity),z*(1+event*.11*c.intensity));
 // All three closed shapes and structural lines inherit corresponding points.
 const whale=smooth(3.65,5.05,t)*(1-smooth(6,7.45,t));
 fill(g,body,c.primary,1.6);fill(g,part,isWeekend?c.primary:blend(GOLD,c.primary,whale),1.5);fill(g,hole,isWeekend?PAPER:INK,0);if(isWeekend)fill(g,hole2,PAPER);
 if(!isWeekend&&whale>0){g.save();g.globalAlpha=whale;g.fillStyle=blend(c.primary,INK,.24);g.fill(new Path2D('M-9 20 Q64 37 80 119 Q17 108 -9 20 Z'));g.restore();}
 if(isWeekend){
  const bike=smooth(2.5,2.95,t)*(1-smooth(4.15,4.85,t)),wheel=smooth(5.15,6.15,t);g.save();g.globalAlpha=bike;
  for(const center of [-167,167]){for(let i=0;i<12;i++){const angle=i*TAU/12+t*3.2;stroke(g,[[center,86],[center+Math.cos(angle)*87,86+Math.sin(angle)*87]],INK,1.2);}oval(g,center,86,10,10,INK);}g.restore();
  // Watch markings are carried into spokes, not left as a second opaque icon.
  for(let i=0;i<12;i++){const first=smooth(1.28,2.92,t),p=i*TAU/12,r=lerp(lerp(143,87,first),188,lift),q=p+t*wheel*.35,cx=lerp(lerp(0,i%2?-167:167,first),0,lift),cy=lerp(86*first,-6,lift),xx=Math.cos(q)*r,yy=Math.sin(q)*r;g.save();g.globalAlpha=1-bike;stroke(g,[[cx+xx*.88,cy+yy*.88],[cx+xx,cy+yy]],INK,2);g.restore();}
  if(wheel>0){g.save();g.globalAlpha=wheel;const cabins=Math.round(c.count);for(let i=0;i<cabins;i++){const ang=i*TAU/cabins+(t-6)*.24*c.intensity,xx=Math.cos(ang)*188,yy=-6+Math.sin(ang)*188;stroke(g,[[0,-6],[xx,yy]],INK,1.7);g.fillStyle=i%2?c.secondary:GOLD;g.fillRect(xx-19,yy-7,38,29);g.strokeStyle=INK;g.lineWidth=1.2;g.strokeRect(xx-19,yy-7,38,29);g.fillStyle=WHITE;g.fillRect(xx-12,yy-1,24,9);}oval(g,0,-6,17,17,GOLD);g.restore();}
 }else{
  // Printed folds become sail seams, belly contours and an island shoreline.
  g.save();trace(g,body);g.clip();g.globalAlpha=.13;for(let i=0;i<c.count+7;i++){const xx=-280+i*34;stroke(g,[[xx,-180],[xx+55,170]],WHITE,1.2);}g.restore();
  const blow=smooth(4.8,5.2,t)*(1-smooth(5.7,6.1,t));if(blow>0){g.save();g.globalAlpha=blow;for(const side of [-1,1])stroke(g,[[54,-111],[60+side*14,-169],[77+side*47,-188]],WHITE,2);g.restore();}
  const island=smooth(7.05,7.55,t);if(island>0){g.save();g.globalAlpha=island;g.fillStyle=WHITE;g.fillRect(94,19,57,49);fill(g,[[83,23],[121,-12],[163,23]],c.primary,1.5);g.fillStyle=INK;g.fillRect(110,41,14,27);g.restore();}
 }
 g.save();g.globalAlpha=1-event*.65;for(const p of lines)stroke(g,p,isWeekend?INK:WHITE,isWeekend?3.1:2.2);g.restore();
 g.restore();
 // A few contact accents exist only at the pressure/release event.
 if(event>.7){for(let side of [-1,1]){g.save();g.globalAlpha=(event-.7)*2.2;stroke(g,[[x+side*285,y+61],[x+side*306,y+49]],c.primary,3);stroke(g,[[x+side*280,y+83],[x+side*314,y+89]],GOLD,2);g.restore();}}
 if(final>0){g.save();g.globalAlpha=final;g.fillStyle=PAPER;g.beginPath();g.moveTo(0,0);g.lineTo(665,0);g.quadraticCurveTo(786,360,655,720);g.lineTo(0,720);g.fill();text(g,c.title,62,283,62,INK,'left',800,650);text(g,c.subtitle,65,335,23,INK,'left',450,625);stroke(g,[[67,383],[502,383]],INK,1);text(g,isWeekend?'FROM DEADLINES TO DAYDREAMS.':'A LETTER. AN OCEAN. AN OPEN END.',66,416,12,INK,'left',600,595);for(let i=0;i<3;i++)oval(g,76+i*26,459,6,6,[c.primary,c.secondary,GOLD][i]);g.restore();}
 else{const phase=t<transitions[0][1]?0:t<transitions.at(-1)![0]?1:2;g.save();g.globalAlpha=1-smooth(7.4,7.7,t);text(g,`0${phase+1} / ${c.words[phase]||'变化'}`,57,608,35,fg,'left',700,700);text(g,isWeekend?'TIME CAN TAKE ANOTHER SHAPE.':'FOLD THE DISTANCE.',61,640,12,fg,'left',500);g.restore();}
 text(g,'纸间 / 形状的叙事',35,36,12,!isWeekend&&sea>.93&&final<.5?WHITE:INK,'left',550);text(g,'SAME PARTS. A DIFFERENT POSSIBILITY.',1245,36,11,sea>.8?WHITE:INK,'right',450);
 for(let i=0;i<1200+c.detail*1800;i++){g.fillStyle=i%2?'#152e380b':'#fff7df0a';g.fillRect(hash(i,c.seed)*1280,hash(i+3000,c.seed)*720,1,1);}g.restore();
}
