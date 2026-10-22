import type {EffectConfig} from '../../scripts/effects.mjs';
import {filmCue} from './film-cue';
import {hash,smooth,clamp,text,lerp} from './math';

// Original, code-authored pixel art. All art is painted at 320 × 180 before
// nearest-neighbour enlargement; no image, game sprite or font atlas is sampled.
type G=CanvasRenderingContext2D;
const PW=320,PH=180;
const P={ink:'#101a31',deep:'#15213e',sky:'#202951',violet:'#363760',haze:'#53506f',
  far:'#2b3655',mid:'#344761',edge:'#526578',teal:'#6b9e9b',light:'#a5cbc0',
  timber:'#694c52',wood:'#a66b59',copper:'#cf8b68',gold:'#f3bb64',cream:'#fff0bd',
  blue:'#668ba4',roof:'#27414d',darkTeal:'#233c48',red:'#b95757',muted:'#81516a'};
let sceneBuffer:HTMLCanvasElement|undefined;
const R=(g:G,x:number,y:number,w:number,h:number,color:string)=>{if(w<=0||h<=0)return;g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
function line(g:G,x:number,y:number,xx:number,yy:number,color:string,width=1){x=Math.round(x);y=Math.round(y);xx=Math.round(xx);yy=Math.round(yy);const dx=Math.abs(xx-x),sx=x<xx?1:-1,dy=-Math.abs(yy-y),sy=y<yy?1:-1;let err=dx+dy;for(let i=0;i<1000;i++){R(g,x,y,width,width,color);if(x===xx&&y===yy)break;const e=2*err;if(e>=dy){err+=dy;x+=sx;}if(e<=dx){err+=dx;y+=sy;}}}
function disk(g:G,x:number,y:number,r:number,color:string){for(let yy=-Math.ceil(r);yy<=Math.ceil(r);yy++){const w=Math.floor(Math.sqrt(Math.max(0,r*r-yy*yy)));if(Math.abs(yy)<=r)R(g,x-w,y+yy,w*2+1,1,color);}}
function ring(g:G,x:number,y:number,r:number,color:string){for(let i=0;i<Math.ceil(r*7);i++){const a=i/Math.ceil(r*7)*Math.PI*2;R(g,x+Math.cos(a)*r,y+Math.sin(a)*r,1,1,color);}}
function star(g:G,x:number,y:number,size:number,color:string){R(g,x-size,y,size*2+1,1,color);R(g,x,y-size,1,size*2+1,color);if(size>2){R(g,x-1,y-1,3,3,color);}}
const glyphs:Record<string,string[]>={
 M:['10001','11011','10101','10101','10001'],O:['01110','10001','10001','10001','01110'],
 N:['10001','11001','10101','10011','10001'],R:['11110','10001','11110','10100','10010'],
 E:['11111','10000','11110','10000','11111'],P:['11110','10001','11110','10000','10000'],
 A:['01110','10001','11111','10001','10001'],I:['111','010','010','010','111'],
 S:['01111','10000','01110','00001','11110'],H:['10001','10001','11111','10001','10001'],
 T:['11111','00100','00100','00100','00100'],L:['10000','10000','10000','10000','11111'],
 U:['10001','10001','10001','10001','01110'],D:['11110','10001','10001','10001','11110'],
};
function label(g:G,s:string,x:number,y:number,color:string){for(const ch of s){const a=glyphs[ch];if(a){a.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]==='1')R(g,x+i,y+j,1,1,color);});x+=a[0].length+1;}else x+=3;}}

function sky(g:G,c:EffectConfig,time:number,lit:number,shift:number){
 const bands=['#18203d','#1d2547','#252b50','#303356','#3c3b5e','#484463','#554b67'];
 for(let y=0;y<PH;y++){const k=Math.min(bands.length-1,Math.floor(y/20));R(g,0,y,PW,1,bands[k]);if(y%20>15&&k<bands.length-1)for(let x=(y%2)*2;x<PW;x+=4)R(g,x,y,1,1,bands[k+1]);}
 // A dithered lilac cloud belt remains below the moon, giving the skyline depth.
 for(let j=0;j<4;j++){const y=51+j*12;for(let x=-20;x<350;x+=2){const wave=Math.sin((x+shift*.08+j*23)*.028)*3+Math.sin(x*.07+j)*2;if(hash(x+j*300,c.seed)>.38)R(g,x,y+wave,2,j%2?2:1,j%2?'#4b4263':'#3b375a');}}
 for(let i=0;i<30+c.count*3+c.detail*40;i++){const x=Math.floor(hash(i,c.seed)*320),y=Math.floor(hash(i+380,c.seed)*103);const tw=Math.floor((time*.8+hash(i+60,c.seed)*5)%4);if(tw!==0)R(g,x,y,1,1,i%5===0?P.cream:i%3===0?P.teal:'#8993ac');if(i%17===0&&tw===3)star(g,x,y,2,P.light);}
 for(let layer=0;layer<3;layer++){
  const baseline=[128,139,150][layer],baseW=[20,26,34][layer],sc=[.06,.13,.25][layer];
  for(let i=-2;i<20;i++){const id=i+layer*91,x=Math.floor(i*baseW-shift*sc),w=baseW-2+Math.floor(hash(id+2,c.seed)*4),h=16+hash(id+110,c.seed)*(layer===0?29:43),top=Math.round(baseline-h);R(g,x,top,w,h,[P.far,P.mid,P.darkTeal][layer]);R(g,x-1,top-1,w+2,2,layer===2?P.edge:'#4b526c');
   if(i%4===0){R(g,x+w/2-1,top-10,2,10,P.far);R(g,x+w/2-3,top-11,6,1,P.edge);}
   if(layer>0){for(let row=0;row<Math.floor(h/8)-1;row++)for(let col=0;col<Math.floor(w/6)-1;col++){const threshold=hash(id*37+row*23+col+72,c.seed),wave=smooth(.05,.8,lit-(x/320)*.25);const on=threshold<(lit>.03?.1+wave*.85:.09);R(g,x+4+col*6,top+5+row*8,2,3,on?(threshold>.45?P.gold:'#a5bcad'):'#253b51');if(on&&layer===2)R(g,x+4+col*6,top+8+row*8,2,1,P.wood);}}
   if(layer===2&&i%3===1){R(g,x+4,top+6,2,Math.max(1,h-10),P.roof);for(let yy=top+8;yy<baseline-3;yy+=7)R(g,x+3,yy,5,1,P.edge);}
  }
 }
 // Suspended tram cables and tiny signals; the workshop is part of a lived-in city.
 for(let x=0;x<320;x++)R(g,x,76+Math.sin((x+20)*.009)*8,1,1,'#394563');
 for(const x of [29,113,282]){R(g,x,57,1,47,'#515b71');R(g,x-2,58,5,1,P.blue);if(lit>.5)R(g,x,57,1,1,c.primary);}
}

function workshop(g:G,c:EffectConfig,time:number,lit:number){
 // Rooftop left: an attic workshop, copper guttering and a warm open doorway.
 R(g,10,106,87,40,P.timber);R(g,15,110,77,35,P.wood);for(let j=0;j<5;j++){R(g,16,112+j*7,75,1,P.timber);for(let i=0;i<8;i++)if((i+j)%3===0)R(g,19+i*10,114+j*7,2,1,P.copper);}
 for(let y=0;y<13;y++){const x=5+y*2;R(g,x,106-y,97-y*4,1,y%3===0?P.teal:P.roof);}
 R(g,19,95,68,2,P.light);R(g,24,85,7,10,P.timber);R(g,22,83,11,3,P.edge);R(g,25,82,5,1,P.copper);
 R(g,57,109,29,36,P.ink);R(g,60,111,24,33,lit>.3?'#d99763':'#a76c58');R(g,63,114,18,30,'#edc48a');R(g,64,116,6,27,'#c99470');R(g,81,126,2,2,P.cream);
 R(g,21,111,27,24,P.ink);R(g,23,113,23,19,'#ca9669');R(g,24,114,9,8,'#f2d09a');R(g,35,114,9,8,'#e7b977');R(g,24,124,20,6,'#d29d6a');R(g,22,122,25,2,P.timber);R(g,33,113,2,20,P.timber);R(g,18,135,33,3,P.copper);
 // Art sign, hanging from two bolts, is actual integer-pixel lettering.
 R(g,38,75,47,14,P.ink);R(g,40,77,43,10,P.gold);label(g,'MOON',43,79,P.ink);R(g,44,73,1,3,P.copper);R(g,77,73,1,3,P.copper);
 // Giant adjustable anglepoise with articulated joints illuminates the repair.
 R(g,141,137,12,4,P.edge);line(g,147,137,145,102,P.copper,2);disk(g,145,103,3,P.gold);line(g,145,103,164,88,P.edge,2);line(g,148,105,167,90,P.light);disk(g,165,89,3,P.copper);line(g,165,89,184,95,P.copper,2);R(g,180,94,13,4,P.teal);R(g,183,98,9,2,P.cream);
 for(let i=0;i<11;i++)R(g,179-i,100+i*2,17+i*2,1,'#ffe0a00a');
 // A lathe-like moon cradle, riveted bench and drawer full of little tools.
 R(g,181,125,65,5,P.copper);R(g,179,123,69,3,P.gold);R(g,186,130,6,16,P.timber);R(g,237,130,6,16,P.timber);R(g,194,130,38,12,P.timber);R(g,196,132,34,7,P.wood);R(g,209,134,8,2,P.gold);
 R(g,203,119,27,4,P.edge);R(g,207,115,3,5,P.light);R(g,225,115,3,5,P.light);R(g,208,121,20,2,P.teal);
 R(g,247,130,16,14,P.timber);R(g,249,132,12,10,P.copper);R(g,250,133,3,5,P.gold);R(g,255,134,3,6,P.edge);R(g,249,142,12,2,P.ink);
 // Right-side rooftop gear, potted fern and observatory telescope.
 R(g,279,135,17,10,P.timber);R(g,280,134,15,3,P.copper);for(let i=0;i<8;i++){const xx=286+Math.sin(i*1.9)*7,yy=133-i*2;line(g,287,136,xx,yy,P.teal);R(g,xx,yy,3,1,P.light);}
 line(g,309,145,306,125,P.edge,2);line(g,297,145,306,125,P.edge,2);R(g,301,119,15,6,P.teal);R(g,298,120,4,4,P.gold);R(g,313,117,5,10,P.light);R(g,314,119,3,6,P.ink);
 // Rooftop lip, brickwork, a dangling pennant string and foreground chimney.
 R(g,0,146,320,5,P.edge);R(g,0,151,320,2,P.light);R(g,0,153,320,27,P.ink);for(let row=0;row<4;row++)for(let i=-1;i<20;i++){const x=i*22+(row%2)*11;R(g,x+1,155+row*7,20,5,row%2?P.deep:'#243447');R(g,x+3,156+row*7,15,1,'#304459');}
 for(let x=95;x<130;x++){const y=118+Math.sin((x-95)/35*Math.PI)*4;R(g,x,y,1,1,P.blue);if(x%7===0){R(g,x,y+2,3,3,P.muted);R(g,x+1,y+5,1,1,P.red);}}
 R(g,4,131,8,16,P.roof);R(g,2,129,12,3,P.edge);R(g,5,133,2,10,P.blue);
 // A slow exhaust gives quiet frames life without randomized or stateful simulation.
 for(let i=0;i<4;i++){const phase=(time*.35+i*.25)%1;const x=27+Math.sin(i+phase*3)*2,y=78-phase*15;R(g,x,y,3+i%2,2,'#77718b45');}
}

function moon(g:G,c:EffectConfig,x:number,y:number,r:number,damage:number,charge:number,time:number){
 const d=Math.round(damage*7),craters=[[-.34,-.22,.17],[.24,.15,.23],[-.05,.60,.1],[.43,-.45,.12],[-.52,.37,.11]];
 if(charge>.01){for(let i=3;i>=1;i--)ring(g,x,y,r+i*(1+charge*2),'#f3bb64'+Math.round(10+charge*(16-i*2)).toString(16).padStart(2,'0'));}
 for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){
  if(xx*xx+yy*yy>r*r)continue;
  const sector=(Math.atan2(yy,xx)+Math.PI*2+.25)%(Math.PI*2),side=Math.floor(sector/(Math.PI*2/3)),a=(side+.5)*Math.PI*2/3-.25;
  const dx=Math.round(Math.cos(a)*d),dy=Math.round(Math.sin(a)*d),edge=(xx+yy*.45)/r;
  let color=edge<-.6?P.copper:edge<-.3?c.primary:edge<.58?P.gold:P.cream;
  for(const [cx,cy,cr] of craters.slice(0,2+Math.round(c.detail*3))){const dist=Math.hypot(xx/r-cx,yy/r-cy);if(dist<cr)color=dist<cr*.7?(xx<cx*r?P.copper:'#e2a967'):'#ffe0a0';}
  if((xx+yy)%7===0&&hash(xx*20+yy,c.seed)>1-c.detail*.4)color=edge<.1?P.gold:P.cream;
  R(g,x+xx+dx,y+yy+dy,1,1,color);
 }
 if(damage>.05){const col=P.ink;line(g,x-4-d,y-r+2,x+3-d,y-9,col);line(g,x+3-d,y-9,x-2-d,y+1,col);line(g,x-2-d,y+1,x+7-d,y+8,col);line(g,x+7-d,y+8,x+4-d,y+r-1,col);line(g,x-2-d,y+1,x-r+2-d,y+7,col);}
 if(charge>.02){const flash=Math.floor(time*12)%4;star(g,x+r*.5,y-r*.65,flash===0?3:2,P.cream);R(g,x-r*.47,y-r*.15,2,2,P.cream);}
}

const catHead=[
 '..oo........oo..',
 '..occo....occo..',
 '..occcooooccco..',
 '.occcccccccccco.',
 '.occcccccccccco.',
 'occcbbccccbbccco',
 'occclbcccclbccco',
 'occccccrccccccco',
 '.occcqqqqqqccco.',
 '..ocqqqqqqqqco..',
 '...oqqqqqqqo....',
 '....ooooooo.....',
];
function cat(g:G,c:EffectConfig,x:number,y:number,pose:string,phase:number,time:number){
 x=Math.round(x);y=Math.round(y);const bob=pose==='hammer'?Math.round(Math.sin(time*9)*.8):0,headY=y-30+bob;
 const colors:Record<string,string>={o:P.ink,c:c.secondary,q:P.light,b:P.ink,l:P.cream,r:P.red};
 // Tail is always behind the character and follows the arm action by a few frames.
 const sway=Math.round(Math.sin(time*3)*2);line(g,x-6,y-11,x-15,y-15+sway,c.secondary,3);line(g,x-15,y-15+sway,x-16,y-20+sway,P.light,2);
 R(g,x-6,y-17+bob,12,15,P.roof);R(g,x-4,y-17+bob,8,13,P.teal);R(g,x-4,y-12+bob,8,6,P.copper);R(g,x-3,y-14+bob,2,2,P.gold);R(g,x+3,y-14+bob,2,2,P.gold);
 const stride=pose==='catch'?Math.round(Math.sin(time*11)*2):0;R(g,x-6,y-3,4,5+stride,P.ink);R(g,x+2,y-3,4,5-stride,P.ink);R(g,x-7,y+2+stride,6,2,P.timber);R(g,x+1,y+2-stride,7,2,P.timber);
 catHead.forEach((row,j)=>{for(let i=0;i<row.length;i++){const color=colors[row[i]];if(color)R(g,x+i-8,headY+j,1,1,color);}});
 // Copper goggles and overalls establish a mechanic rather than a generic mascot.
 R(g,x-7,headY+3,14,2,P.copper);R(g,x-5,headY+3,4,3,P.gold);R(g,x+2,headY+3,4,3,P.gold);R(g,x-4,headY+4,2,1,P.cream);R(g,x+3,headY+4,2,1,P.cream);
 line(g,x-6,y-15,x-10,y-10,c.secondary,3);R(g,x-11,y-10,3,3,P.light);
 if(pose==='hammer'){
  // Five distinct 12 fps poses: anticipation, lift, swing, impact, recovery.
  const hit=phase%1,angles=[-.95,-1.3,-1.65,-.35,.15],a=angles[Math.min(4,Math.floor(hit*5))],hx=x+8+Math.cos(a)*15,hy=y-17+Math.sin(a)*15;
  line(g,x+5,y-16,x+11,y-19,c.secondary,3);line(g,x+11,y-19,hx,hy,P.timber,2);R(g,hx-4,hy-3,9,5,P.edge);R(g,hx-4,hy-3,8,1,P.light);R(g,x+9,y-20,3,3,P.light);
 }else if(pose==='wave'){const yy=y-21-Math.round(Math.sin(time*7)*2);line(g,x+5,y-15,x+10,yy,c.secondary,3);R(g,x+9,yy-3,4,4,P.light);}
 else if(pose==='launch'){line(g,x+5,y-16,x+15,y-15,c.secondary,3);R(g,x+14,y-17,3,4,P.light);}
 else{line(g,x+5,y-16,x+14,y-21,c.secondary,3);R(g,x+13,y-23,4,4,P.light);}
}

function fragments(g:G,c:EffectConfig,x:number,y:number,time:number,amount:number,spread:number){
 for(let i=0;i<Math.round(c.count*2+4);i++){const a=hash(i+100,c.seed)*Math.PI*2,r=hash(i+35,c.seed)*spread,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r+Math.sin(time*3+i)*2;const visible=hash(i+38,c.seed)<amount;if(visible)star(g,xx,yy,i%4===0?2:1,i%3?c.primary:P.cream);}
}

export function pixelFilm013(g:G,c:EffectConfig,seconds:number){
 if(!sceneBuffer){sceneBuffer=document.createElement('canvas');sceneBuffer.width=PW;sceneBuffer.height=PH;}
 const p=sceneBuffer.getContext('2d')!,cue=filmCue(c,seconds),u=Math.floor(clamp(cue.progress)*30)/30,
  time=Math.floor(seconds*12)/12,action=cue.action,close=cue.framing==='close';
 const isCatch=action==='catch',isRepair=action==='repair',isLaunch=action==='launch',isEnd=action==='illuminate';
 const lit=isEnd?smooth(.05,.73,u):isLaunch?smooth(.55,1,u)*.35:0;
 p.clearRect(0,0,PW,PH);sky(p,c,time,lit,(isCatch?u*10:isEnd?-u*7:0)*(c.intensity+.5));
 workshop(p,c,time,lit);
 let moonX=217,moonY=100,r=22,damage=0,charge=0;
 if(isCatch){const fall=smooth(0,.65,u);moonX=lerp(249,217,fall);moonY=lerp(19,100,fall)-Math.sin(fall*Math.PI)*(3+c.intensity*8);damage=1-smooth(.78,1,u)*.12;fragments(p,c,moonX,moonY,time,1-smooth(.45,.85,u),24+c.intensity*20);const swing=Math.sin(u*Math.PI*2)*(1+c.intensity*4);
  // Pulley lowers a crescent-catching net onto the moon cradle.
  line(p,255,52,255,105,P.copper,2);line(p,252,52,260,52,P.light,2);ring(p,255,56,5,P.gold);line(p,255,58,moonX+9,moonY+18,P.edge);line(p,moonX-22,moonY+14,moonX+22,moonY+14,P.teal);for(let i=-3;i<=3;i++)line(p,moonX+i*6,moonY+14,moonX+i*4+swing,moonY+27,P.teal);
  cat(p,c,172+Math.round(smooth(0,.6,u)*4),139-Math.round(Math.sin(smooth(.25,.65,u)*Math.PI)*6),'catch',u,time);
 }else if(isRepair){damage=1-smooth(.08,.88,u);charge=smooth(.5,1,u)*.3;const beat=u*3,impact=(beat%1)>.58&&(beat%1)<.76;
  cat(p,c,180,139,'hammer',beat,time);
  if(impact){for(let i=0;i<8+c.count;i++){const a=hash(i+30,c.seed)*Math.PI*2,dist=4+hash(i+1,c.seed)*(9+c.intensity*22);star(p,199+Math.cos(a)*dist,105+Math.sin(a)*dist,1,i%3?P.cream:c.primary);}line(p,194,98,189,92,P.cream);line(p,196,96,196,89,P.cream);}
 }else if(isLaunch){damage=0;charge=1;const ascent=smooth(.29,.9,u);moonY=lerp(100,43,ascent);moonX=lerp(217,230,ascent);r=Math.round(lerp(22,25,ascent));cat(p,c,178,139,'launch',u,time);
  // A solid star column breaks into little ascending pixels as the repaired moon rises.
  for(let i=0;i<42+c.count*3;i++){const h=hash(i+90,c.seed),dy=((u*130+h*90)%96),xx=217+(hash(i+180,c.seed)-.5)*(10+dy*.25),yy=122-dy;if(u>.12&&u<.93&&yy>moonY+r-3)R(p,xx,yy,1+i%2,2+i%3,h>.5?P.gold:P.cream);}
  for(let i=0;i<3;i++){const radius=10+((u*2+i/3)%1)*48;if(u>.22&&u<.83){for(let j=0;j<42;j++){const a=j/42*Math.PI*2;R(p,217+Math.cos(a)*radius,123+Math.sin(a)*radius*.2,2,1,'#f3bb6440');}}}
  fragments(p,c,moonX,moonY,time,smooth(.3,.75,u),24+u*14);
 }else{
  moonX=230;moonY=43;r=25;charge=1;cat(p,c,177,139,'wave',u,time);fragments(p,c,moonX,moonY,time,.35,37);
  // Window-light wave has reached the workshop. Tiny celebratory fireflies give a held end frame life.
  for(let i=0;i<12+c.count;i++){const x=30+hash(i+800,c.seed)*260,y=95+Math.sin(time*1.4+i)*7-hash(i+210,c.seed)*35;if(hash(i+600,c.seed)<u)star(p,x,y,i%7===0?2:1,i%2?P.cream:c.secondary);}
 }
 moon(p,c,Math.round(moonX),Math.round(moonY),r,damage,charge,time);
 // Two small rivets and sparks in front of the moon provide a readable contact plane.
 if(isRepair){R(p,205,121,3,2,P.cream);R(p,225,120,2,3,P.light);}
 // Camera choices select a genuinely different frame, without smoothing the art pixels.
 let sx=0,sy=0,sw=320,sh=180;
 if(close){sw=160;sh=90;sx=isEnd?137:isCatch?139:135;sy=isEnd?8:isCatch?20:61;
  // The close catch keeps the mechanic's face and receiving hand in frame;
  // 256 × 144 enlarges by exactly five, retaining the hard pixel grid.
  if(isCatch){sw=256;sh=144;sx=24;sy=16;}
  if(isLaunch)sy=Math.round(lerp(61,6,smooth(.3,.9,u)));
 }else if(isLaunch){sw=256;sh=144;sx=24;sy=0;}
 g.save();g.imageSmoothingEnabled=false;g.drawImage(sceneBuffer,sx,sy,sw,sh,0,0,1280,720);g.restore();
 // Lettering is an editorial layer, set at output resolution, while the artwork remains hard-edged pixels.
 g.save();text(g,'MOON REPAIR / 月亮修理铺',40,37,12,'#e4dec8','left',550);text(g,`0${cue.index+1} / ${isCatch?'接住碎月':isRepair?'补好裂缝':isLaunch?'放回夜空':'点亮一座城'}`,1240,37,12,'#e4dec8','right',500);
 const final=cue.index===(c.shots?.length||4)-1;
 if(final){const a=smooth(.05,.3,u);g.globalAlpha=a;text(g,c.title,close?40:52,close?105:220,close?38:49,P.cream,'left',800,close?490:575);text(g,c.subtitle,close?42:54,close?139:263,close?16:20,'#a5cbc0','left',450,close?490:566);g.globalAlpha=1;}
 const caption=cue.caption;
 if(caption){g.font='550 19px "Noto Sans SC",sans-serif';const w=Math.min(850,g.measureText(caption).width+34);g.fillStyle='#101a31d9';g.fillRect(40,650,w,35);R(g,40,650,3,35,c.primary);text(g,caption,57,674,19,P.cream,'left',550,810);}
 g.restore();
}
