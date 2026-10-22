import type {EffectConfig} from '../../scripts/effects.mjs';
import type {EffectAssets} from './canvas';
import {inkStroke,inkLoop,spline,fillShape} from '../vendor/engine.js';
import {W,H,TAU,hash,lerp,smooth,clamp,text,paper} from './math';

// Original cel performance. Drawings, exposure, acting and FX have separate clocks.
// Coordinates below are designed poses, rather than a single body with cycling limbs.
type P=number[][];
type Pose='curious'|'inhale'|'compressed'|'blow'|'recoil'|'tumble'|'reach'|'hang';
const INK='#203b36',PAPER='#f3e9d1',WHITE='#fff9e8',GOLD='#e9bd55';
const poses:Record<Pose,{body:P;face:number[];arm:P;back:P;legs:P[]}>={
 curious:{body:[[-60,-76],[-59,-120],[-34,-141],[-21,-165],[-7,-148],[17,-163],[26,-138],[56,-122],[81,-104],[105,-94],[100,-79],[73,-73],[77,-20],[65,43],[59,104],[25,133],[-28,130],[-62,101],[-80,46],[-77,-18]],face:[37,-105],arm:[[54,-22],[95,5],[111,-23]],back:[[-58,-21],[-90,19],[-81,44]],legs:[[[-34,103],[-39,145],[-60,150]],[[33,110],[55,140],[77,140]]]},
 inhale:{body:[[-82,-74],[-71,-123],[-49,-141],[-34,-169],[-15,-150],[7,-165],[15,-142],[43,-122],[54,-101],[69,-89],[61,-77],[83,-44],[112,15],[101,86],[62,129],[-6,139],[-63,119],[-105,72],[-112,13],[-98,-39]],face:[22,-107],arm:[[72,-22],[99,24],[131,28]],back:[[-87,-20],[-129,13],[-143,5]],legs:[[[-58,110],[-64,146],[-99,150]],[[54,111],[79,145],[105,146]]]},
 compressed:{body:[[-95,-15],[-96,-62],[-64,-75],[-50,-102],[-35,-88],[-10,-110],[0,-81],[45,-68],[89,-51],[124,-40],[121,-22],[89,-17],[98,28],[84,74],[52,103],[-11,112],[-79,104],[-116,75],[-120,29],[-111,0]],face:[45,-47],arm:[[70,29],[99,73],[131,83]],back:[[-90,25],[-130,76],[-153,83]],legs:[[[-67,93],[-89,122],[-123,124]],[[50,96],[93,123],[127,123]]]},
 blow:{body:[[-95,-49],[-70,-99],[-43,-115],[-32,-139],[-12,-122],[8,-140],[20,-112],[63,-92],[96,-77],[151,-64],[155,-45],[105,-41],[75,-10],[39,36],[10,83],[-31,112],[-73,101],[-93,63],[-99,19],[-103,-18]],face:[66,-74],arm:[[28,8],[-8,51],[-51,50]],back:[[-69,-6],[-110,23],[-143,18]],legs:[[[-59,88],[-90,134],[-123,136]],[[0,84],[43,119],[82,121]]]},
 recoil:{body:[[-64,-89],[-83,-129],[-58,-149],[-57,-179],[-33,-161],[-13,-177],[0,-148],[19,-130],[31,-104],[72,-74],[65,-56],[35,-60],[48,-8],[79,49],[68,108],[25,137],[-30,119],[-73,73],[-92,19],[-85,-39]],face:[-5,-119],arm:[[39,-24],[101,-49],[135,-80]],back:[[-70,-42],[-120,-72],[-141,-103]],legs:[[[-34,102],[-87,114],[-114,92]],[[44,110],[80,154],[112,160]]]},
 tumble:{body:[[-73,-77],[-85,-110],[-51,-129],[-29,-151],[-16,-130],[9,-145],[15,-124],[49,-109],[67,-83],[80,-57],[64,-43],[40,-48],[62,-2],[91,47],[70,88],[25,102],[-24,101],[-65,79],[-88,42],[-95,-15]],face:[17,-90],arm:[[45,-5],[94,-21],[108,-58]],back:[[-69,-20],[-111,0],[-127,34]],legs:[[[-33,78],[-82,58],[-96,18]],[[52,72],[89,55],[116,21]]]},
 reach:{body:[[-44,-97],[-48,-143],[-20,-160],[-16,-189],[1,-169],[23,-187],[29,-161],[51,-140],[62,-115],[92,-99],[83,-81],[59,-84],[59,-31],[50,32],[34,100],[4,134],[-33,128],[-59,87],[-66,25],[-59,-46]],face:[25,-123],arm:[[40,-45],[63,-133],[91,-208]],back:[[-48,-51],[-101,-13],[-126,-31]],legs:[[[-28,110],[-53,158],[-83,166]],[[25,109],[44,170],[63,181]]]},
 hang:{body:[[-51,-82],[-54,-126],[-26,-146],[-13,-174],[3,-154],[26,-170],[30,-143],[53,-120],[68,-93],[92,-73],[81,-59],[55,-65],[52,-19],[51,35],[34,91],[4,118],[-35,111],[-61,78],[-71,28],[-63,-32]],face:[28,-103],arm:[[40,-29],[76,-120],[82,-225]],back:[[-47,-24],[-92,1],[-119,-16]],legs:[[[-25,95],[-62,139],[-99,148]],[[26,92],[62,131],[91,132]]]}
};
export function handFilm014(g:CanvasRenderingContext2D,c:EffectConfig,t:number,assets:EffectAssets){
 const qt=Math.floor(t*(t>8?8:12))/(t>8?8:12),drawing=Math.floor(qt*12)%3,windStrength=.55+c.intensity*.7;let serial=0;
 const stroke=(p:P,color=INK,w=3)=>inkStroke(g,p,{color,w,seed:c.seed+drawing*113+serial++*19,amp:.42+c.detail*.8,heavy:.35,t0:5,t1:7});
 const shape=(p:P,color:string,w=3,offset=0)=>{const dense=spline(p,true,4);fillShape(g,dense,color,{seed:c.seed+drawing*37+serial*13,amp:.6+c.detail*.5,dx:offset,dy:offset*.55});if(w)inkLoop(g,dense,{color:INK,w,seed:c.seed+drawing*71+serial++*23,amp:.5+c.detail*.5,heavy:.3});};
 const oval=(x:number,y:number,rx:number,ry:number,color:string,w=0,a=0)=>shape(Array.from({length:14},(_,i)=>{const b=i*TAU/14;return [x+Math.cos(b)*rx*Math.cos(a)-Math.sin(b)*ry*Math.sin(a),y+Math.cos(b)*rx*Math.sin(a)+Math.sin(b)*ry*Math.cos(a)];}),color,w);
 const cross=(x:number,y:number,s:number,color=GOLD)=>{shape([[x,y-s],[x+s*.19,y-s*.18],[x+s,y],[x+s*.2,y+s*.2],[x,y+s],[x-s*.19,y+s*.17],[x-s,y],[x-s*.2,y-s*.2]],color,1);};
 const mitten=(x:number,y:number,a:number,open=true)=>{g.save();g.translate(x,y);g.rotate(a);shape(open?[[-10,7],[-19,-1],[-21,-10],[-16,-15],[-8,-7],[-6,-21],[1,-25],[6,-20],[4,-10],[13,-18],[20,-17],[22,-10],[16,-3],[23,0],[25,7],[17,17],[4,20],[-5,16]]:[[-13,4],[-13,-10],[-6,-17],[3,-15],[9,-17],[16,-11],[19,0],[15,14],[4,19],[-8,15]],WHITE,2.5);stroke([[-5,4],[1,0],[8,1]],INK,1.5);g.restore();};
 const arm=(p:P,open=true)=>{stroke(p,INK,17);stroke(p,WHITE,12);const [x,y]=p[p.length-1],prev=p[p.length-2];mitten(x,y,Math.atan2(y-prev[1],x-prev[0])+Math.PI/2,open);};
 const character=(x:number,y:number,scale:number,pose:Pose,a=0,from?:Pose,mix=1,lift=0)=>{
  const target=poses[pose],origin=from?poses[from]:target,blend=(a:P,b:P)=>b.map((point,i)=>point.map((v,j)=>lerp(a[i][j],v,mix)));
  const p={body:blend(origin.body,target.body),face:target.face.map((v,i)=>lerp(origin.face[i],v,mix)),arm:blend(origin.arm,target.arm),back:blend(origin.back,target.back),legs:target.legs.map((p,i)=>blend(origin.legs[i],p))},fx=p.face[0],fy=p.face[1];
  const grounded=t>=1.05&&t<3.45;if(grounded)y=644-scale*Math.max(...p.legs.map(leg=>leg[leg.length-1][1]+8))-lift;
  g.save();g.translate(x,y);g.rotate(a);g.scale(scale,scale);
  arm(p.back);for(const [i,leg] of p.legs.entries()){stroke(leg,INK,17);stroke(leg,GOLD,11);const end=leg[leg.length-1];shape([[end[0]-17,end[1]-8],[end[0]+17,end[1]-9],[end[0]+25,end[1]+5],[end[0]-23,end[1]+8]],c.secondary,2.4);if(i===0)stroke([[end[0]-15,end[1]],[end[0]+12,end[1]-1]],WHITE,1);}
  shape(p.body,WHITE,3.4,2);
  // The knitted vest is a separate, clipped drawing, with a stitched pocket.
  g.save();const b=spline(p.body,true,4);g.beginPath();b.forEach(([xx,yy]:number[],i:number)=>i?g.lineTo(xx,yy):g.moveTo(xx,yy));g.closePath();g.clip();
  shape([[-115,-4],[-45,-24],[27,-10],[106,-31],[133,133],[-111,153]],GOLD,0,3);stroke([[-100,3],[-25,5],[57,-4],[113,-12]],INK,2.2);
  for(let i=0;i<8;i++)stroke([[-83+i*23,37],[-77+i*23,116]],'#b8823659',1);stroke([[-26,39],[14,40],[11,72],[-24,73],[-26,39]],INK,1.4);stroke([[-22,44],[9,46]],WHITE,2);g.restore();
  // A scarf follows the action on a delayed arc; its direction changes with the pose.
  const tail=pose==='blow'?[[10,-34],[-76,-56],[-170,-103],[-185,-84],[-148,-57],[-70,-35]]:pose==='inhale'?[[7,-39],[-71,-40],[-150,-52],[-151,-32],[-103,-19],[-29,-20]]:pose==='hang'?[[12,-45],[-49,-22],[-135,-38],[-172,-76],[-163,-91],[-114,-63],[-58,-59]]:[[11,-42],[-44,-50],[-116,-83],[-136,-64],[-102,-41],[-49,-28]];
  shape(tail,c.primary,2.2,2);shape([[-65,-53],[-9,-60],[50,-49],[43,-28],[-6,-33],[-62,-34]],c.primary,2.4);stroke([[-40,-45],[-17,-42],[12,-45]],WHITE,1.8);
  const shut=pose==='inhale'||pose==='blow'||pose==='compressed';
  if(shut){stroke([[fx-25,fy-5],[fx-16,fy-1],[fx-9,fy-7]],INK,3);stroke([[fx+9,fy-10],[fx+17,fy-6],[fx+24,fy-14]],INK,3);}else{
   oval(fx-17,fy-4,10,15,INK);oval(fx+16,fy-8,9,14,INK);const look=pose==='reach'?-5:pose==='tumble'?0:3;oval(fx-14,fy-10+look,3.4,5.5,WHITE);oval(fx+19,fy-14+look,3,5,WHITE);
  }
  oval(fx+39,fy+13,12,7,c.primary,0,-.3);
  if(pose==='blow'){oval(fx+58,fy+26,8,12,INK,2);oval(fx+58,fy+24,3,6,WHITE);stroke([[fx+11,fy+23],[fx+19,fy+31]],INK,2);}else if(pose==='inhale'){stroke([[fx+35,fy+29],[fx+44,fy+27]],INK,3);oval(fx+14,fy+24,13,12,'#e9bd5555');}else if(pose==='recoil'||pose==='tumble'){oval(fx+11,fy+31,12,18,INK);oval(fx+12,fy+41,6,5,c.primary);}else{stroke([[fx-10,fy+24],[fx+3,fy+34],[fx+18,fy+23]],INK,2.5);}
  stroke([[fx-27,fy-26],[fx-15,fy-28]],INK,2);stroke([[fx+7,fy-31],[fx+24,fy-29]],INK,2);
  arm(p.arm,pose!=='hang');g.restore();
 };
 const seed=(x:number,y:number,s:number,a:number,full=true)=>{g.save();g.translate(x,y);g.rotate(a);g.scale(s,s);stroke([[0,60],[0,6],[2,-12]],INK,2);oval(0,65,5,15,c.secondary,1.4,-.2);if(s>1.4)shape([[-54,-14],[-41,-43],[-20,-58],[0,-62],[24,-56],[45,-40],[55,-13],[31,-22],[0,0],[-30,-22]],c.secondary,1.2);for(let i=0;i<(full?11:7);i++){const angle=Math.PI*1.08+i*Math.PI*.84/(full?10:6),xx=Math.cos(angle)*50,yy=Math.sin(angle)*44-14;stroke([[0,1],[xx*.6,yy*.8],[xx,yy]],s>1.4?WHITE:INK,1.4);for(let j=-1;j<=1;j++)stroke([[xx-9,yy+3+j*3],[xx+2,yy-8+j*3],[xx+9,yy-3+j*3]],WHITE,2.7);}g.restore();};
 const flower=(x:number,y:number,r:number,burst:number)=>{stroke([[x-18,681],[x+9,531],[x,y]],c.secondary,13);stroke([[x-18,681],[x+9,531],[x,y]],INK,2);
  shape([[x-5,586],[x-111,536],[x-137,558],[x-61,595]],c.secondary,2);stroke([[x-16,589],[x-111,557]],INK,1.5);
  for(let i=0;i<30;i++){const angle=i*TAU/30,delay=hash(i,c.seed)*.27,release=smooth(delay,.8+delay,burst);g.save();g.translate(x+release*480,y-release*(130+hash(i+45,c.seed)*110));g.rotate(angle+release*.7);const rr=r*(1+release*.08);stroke([[release*rr*.6,0],[rr*.5,0],[rr,0]],INK,1.3);for(let j=-2;j<=2;j++)stroke([[rr-7,j*3],[rr+12,j*5],[rr+21,j*10]],i%3?WHITE:GOLD,3);g.restore();}
  oval(x,y,18,19,GOLD,3);
 };
 const grains=()=>{g.save();g.globalCompositeOperation='multiply';if(assets.paper){g.globalAlpha=.19;g.drawImage(assets.paper,0,0,W,H);}g.fillStyle='#203b3610';for(let i=0;i<1800+c.detail*1400;i++)g.fillRect(hash(i,c.seed)*W,hash(i+3200,c.seed)*H,hash(i+7200,c.seed)*2+.5,1);g.restore();};
 paper(g,c.seed,PAPER);
 // A simple screenprint world leaves room for the character's changing silhouette.
 const darkStage=t>=3.45&&t<4.65; if(darkStage){g.fillStyle=c.secondary;g.fillRect(0,0,W,H);}else{
  oval(1020,127,233,220,GOLD);shape([[-110,650],[242,562],[585,626],[891,568],[1370,645],[1380,800],[-100,800]],'#d3d4ac',0);
  stroke([[-70,644],[220,568],[488,606]],'#6c835377',1.4);stroke([[1046,602],[1172,587],[1340,628]],'#6c835377',1.4);
 }
 // Shot 1: the nose, eyes and airborne seed are the opening hook.
 if(t<1.05){
  const inq=Math.floor(t*12)/12;g.save();g.translate(-145,-5);character(470,520,1.72,'curious',-.03+Math.sin(inq*5)*.012);g.restore();
  seed(810-250*smooth(0,.83,inq),247+Math.sin(inq*6)*32,.9,-.35+inq*.4);
  stroke([[934,292],[1040,250],[1152,275]],'#778f6977',2);text(g,'一点点风，也许就够了。',882,571,24,INK,'center',500,620);
  for(let i=0;i<3;i++)stroke([[741+i*18,319-i*10],[752+i*18,307-i*10]],c.primary,2);
 }else if(t<3.45){
  const before=t<2.18,blow=smooth(2.18,3.38,qt),antic=smooth(1.05,2.06,qt);
  flower(1000,339,140,blow);
  if(t<1.7){character(384,453,1.18,'inhale',-.13*antic,'curious',smooth(1.05,1.58,qt));}else if(t<2.18){character(369,501,1.32,'compressed',-.05,'inhale',smooth(1.7,1.94,qt));}else{
   const smear=t>=2.18&&t<2.247,launch=smooth(3.17,3.45,t);character(378+310*launch,453,1.18+.12*launch,t>3.17?'recoil':'blow',.04-.54*launch,t>3.17?'blow':'compressed',t>3.17?smooth(3.17,3.45,qt):smooth(2.18,2.38,qt),64*launch);
   if(smear){for(let i=0;i<3;i++)stroke([[510,330+i*34],[719,299+i*34],[934,281+i*36]],WHITE,16-i*3);}
   for(let i=0;i<5;i++){const yy=394+(i-2)*34*windStrength,xx=605+blow*235;stroke([[590,395],[738,yy-25],[xx+204,yy+Math.sin(qt*4+i)*26*windStrength]],i%2?WHITE:c.primary,5-i*.5);}
   for(let i=0;i<8;i++){const p=(blow+i*.11)%1;seed(1020+p*260,339-110*Math.sin(p*Math.PI)+Math.sin(i*3)*100,.35+i*.012,-p*.9);}
  }
  text(g,c.words[0]||'攒足一口勇气',52,85,20,INK,'left',600,560);
  const breath=1+antic*.8;for(let i=0;i<3&&before;i++)stroke([[165-i*25,325-i*35],[218-i*27,302-i*33],[264-i*29,313-i*28]],c.secondary,1.5*breath);
 }else if(t<4.65){
  const u=clamp((qt-3.45)/1.2),rot=-.5-u*TAU+Math.sin(u*Math.PI)*(.65-c.intensity)*.5;
  for(let i=0;i<9;i++){const yy=70+i*75;stroke([[-170+u*320,yy+110],[310+u*350,yy-60],[1380,yy-120]],i%3?WHITE:GOLD,2+i%3);}
  oval(796,348,243,227,GOLD);character(688-120*u,362+Math.sin(u*Math.PI)*35+Math.pow(u,3)*150,1.3,u<.18?'recoil':'tumble',rot);
  for(let i=0;i<14;i++){const a=i*2.4,rr=260+i*17;seed(650+Math.cos(a+u*3)*rr,350+Math.sin(a+u*3)*rr*.7,.33+i%3*.13,a+u*2);}
  cross(246,180,24,WHITE);cross(1096,532,37,c.primary);text(g,'哎——风比想象中大！',72,663,24,WHITE,'left',650,1050);
 }else if(t<5.55){
  const u=smooth(4.65,5.45,qt),yy=512-u*22;character(580+u*35,yy,1.05,'reach',-.15+u*.2,'compressed',smooth(4.65,5.08,qt));
  seed(720-u*10,185-u*14,1.7,-.1);for(let i=0;i<3;i++)stroke([[467-i*16,525+i*20],[449-i*16,577+i*20]],c.primary,2);
  cross(808,171,19);cross(484,273,11,c.primary);
 }else if(t<7.9){
  const u=smooth(5.55,7.9,qt),x=623.5+u*141.5,y=508.6-u*88.6,sc=1.05-u*.15,angle=lerp(.05,-.09,u)+Math.sin(qt*2)*.018*u;
  // Grip is attached to the seed stem in world coordinates, not a disconnected prop.
  g.save();g.translate(x,y);g.rotate(angle);g.scale(sc,sc);seed(66,-325,1.62,-.15);character(0,0,1,'hang');g.restore();
  for(let i=0;i<12+c.count;i++){const xx=(hash(i,c.seed)*1650-150-qt*24)%1550,yy=hash(i+90,c.seed)*560;seed(xx,yy,.22+hash(i+60,c.seed)*.35,-.25+Math.sin(qt+i)*.12);}
  text(g,c.words[1]||'抓住一点可能',68,169,28,INK,'left',600,560);stroke([[71,188],[290,188]],c.primary,4);
 }else{
  // The final image is a composed illustration with a long, readable hold.
  const settle=smooth(7.9,8.45,t),x=942+Math.sin(qt*1.3)*4,y=452+Math.sin(qt*1.4)*5;
  g.save();g.translate(x,y);g.rotate(-.08);g.scale(.79,.79);seed(66,-325,1.62,-.15);character(0,0,1,'hang');g.restore();
  const title=c.title||'借一点风';g.save();g.translate(80,278+18*(1-settle));g.rotate(-.045);g.globalAlpha=settle;
  g.font=`900 ${title.length>7?78:100}px "Noto Sans SC",sans-serif`;g.textAlign='left';g.lineWidth=7;g.strokeStyle=INK;g.strokeText(title,3,3,730);g.fillStyle=c.primary;g.fillText(title,0,0,730);stroke([[5,30],[247,44],[566,22]],INK,3);
  text(g,'BORROW A LITTLE WIND',4,83,17,INK,'left',650,710);text(g,c.subtitle,4,155,22,INK,'left',500,710);g.restore();
  for(let i=0;i<9;i++){const xx=200+hash(i,c.seed)*1100,yy=65+hash(i+11,c.seed)*570;if(xx<790&&yy>180&&yy<500)continue;seed(xx,yy,.23+hash(i+22,c.seed)*.22,-.3);}
  cross(774,298,26,c.primary);cross(1124,541,17);text(g,'一口勇气 · 一场意外 · 一次新的出发',81,650,16,INK,'left',500,1030);
 }
 grains();
 text(g,'纸间 / 逐帧手作',36,36,12,darkStage?WHITE:INK,'left',500,360);text(g,'WIND STUDY 01',1244,36,12,darkStage?WHITE:INK,'right',500,360);
}
