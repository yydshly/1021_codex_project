import {paint as paintCel} from './paint';
import {palettes,compileTimeline,actions,emotions,type StoryProps} from './model';
import {poseAt} from '../scripts/storyboard.mjs';
import {getStyle} from '../scripts/styles.mjs';

type C=CanvasRenderingContext2D;
type Point=[number,number];
const TAU=Math.PI*2;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const ease=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
function path(c:C,pts:Point[],close=true){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(close)c.closePath();}
function polygon(c:C,pts:Point[],fill:string,stroke?:string,w=2){path(c,pts);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function line(c:C,pts:Point[],color:string,w=2){path(c,pts,false);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();}
function circle(c:C,x:number,y:number,r:number,fill:string,stroke?:string,w=2){c.beginPath();c.arc(x,y,Math.max(0,r),0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function rect(c:C,x:number,y:number,w:number,h:number,fill:string,r=0,stroke?:string){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function label(c:C,text:string,x:number,y:number,size=20,color='#25252c',weight=600,align:CanvasTextAlign='left',max=1150){
  c.fillStyle=color;c.textAlign=align;c.font=`${weight} ${size}px "StorySans", sans-serif`;c.fillText(text,x,y,max);
}
function star(x:number,y:number,r:number):Point[]{return Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,d=i%2?r*.44:r;return [x+Math.cos(a)*d,y+Math.sin(a)*d];});}
function bodyPath(c:C,kind:StoryProps['character']){
  c.beginPath();
  if(kind==='star'){path(c,star(0,-37,78));return;}
  c.moveTo(0,-125);
  if(kind==='drop'){c.bezierCurveTo(20,-86,65,-50,65,-8);c.bezierCurveTo(65,62,-65,62,-65,-8);c.bezierCurveTo(-65,-50,-20,-86,0,-125);}
  else{c.bezierCurveTo(33,-104,15,-74,37,-65);c.lineTo(52,-87);c.bezierCurveTo(115,34,36,56,0,47);c.bezierCurveTo(-83,60,-78,-36,-40,-66);c.quadraticCurveTo(-17,-81,0,-125);}
  c.closePath();
}
function face(c:C,emotion:string,ink:string){
  const happy=emotion==='happy',sad=emotion==='sad';
  for(const x of [-22,22]){
    if(happy||sad)line(c,[[x-7,-41],[x,-41+(sad?5:-5)],[x+7,-41]],ink,4);
    else{c.fillStyle=ink;c.beginPath();c.ellipse(x+(emotion==='curious'?3:0),-41,4,emotion==='afraid'?10:7,0,0,TAU);c.fill();}
    const k=emotion==='determined'?(x<0?5:-5):sad?(x<0?-5:5):0;
    line(c,[[x-8,-59-k],[x+8,-59+k]],ink,3);
  }
  if(emotion==='curious'||emotion==='afraid')circle(c,0,-19,emotion==='afraid'?8:5,'',ink,3);
  else line(c,[[-10,-19],[0,-19+(sad?-6:emotion==='happy'?8:0)],[10,-19]],ink,3);
  if(sad)polygon(c,[[36,-35],[43,-21],[30,-21]],'#71adc8');
}
type State=ReturnType<typeof state>;
function state(frame:number,p:StoryProps){
  const timeline=compileTimeline(p.shots),i=Math.max(0,timeline.findIndex(s=>frame<s.to)),shot=timeline[i];
  const pose=poseAt(shot,frame-shot.from),t=pose.progress;
  return {frame,p,pal:palettes[p.palette],timeline,i,shot,pose,t,light:shot.litBefore?1:shot.action==='celebrate'?ease(t/.4):0};
}
function avatar(c:C,s:State,mode:'flat'|'line'|'volume'|'glass'|'neon'|'sticker'|'collage'='flat',x=s.pose.x,y=s.pose.y,scale=1,inkOverride?:string){
  const {p,pose,pal,shot}=s,ink=inkOverride||(mode==='neon'?'#8ff9fc':mode==='line'?'#254775':'#242637');
  c.save();c.translate(x,y);c.rotate(pose.rotation);c.scale(pose.sx*scale,pose.sy*scale);
  if(mode==='sticker'||mode==='collage'){c.shadowColor='#29233340';c.shadowBlur=mode==='sticker'?8:14;c.shadowOffsetY=8;bodyPath(c,p.character);c.strokeStyle='#fffdf6';c.lineWidth=mode==='sticker'?21:12;c.stroke();c.shadowColor='transparent';}
  if(mode==='neon'){c.shadowColor=pal.main;c.shadowBlur=22;}
  line(c,[[-29,31],[-40+pose.stride*17,61],[-55+pose.stride*24,61]],ink,mode==='line'?3:6);
  line(c,[[29,31],[40-pose.stride*17,61],[55-pose.stride*24,61]],ink,mode==='line'?3:6);
  line(c,[[-56,-8],[-90,2-pose.arms*40+pose.stride*12],[-99,-14-pose.arms*45]],ink,mode==='line'?3:6);
  line(c,[[56,-8],[90,-4-pose.arms*40-pose.stride*12],[99,-26-pose.arms*45]],ink,mode==='line'?3:6);
  bodyPath(c,p.character);
  let fill:string|CanvasGradient=pal.main;
  if(mode==='volume'){const g=c.createRadialGradient(-28,-65,5,18,-7,125);g.addColorStop(0,'#fff0d5');g.addColorStop(.34,pal.main);g.addColorStop(1,pal.dark);fill=g;}
  if(mode==='glass'){const g=c.createLinearGradient(-60,-100,65,50);g.addColorStop(0,'#ffffffcf');g.addColorStop(.5,pal.main+'80');g.addColorStop(1,'#c8d5ff60');fill=g;}
  if(mode==='neon')fill='#271944';
  if(mode!=='line'){c.fillStyle=fill;c.fill();}
  c.strokeStyle=mode==='volume'?'#ffffff50':mode==='glass'?'#fff':ink;c.lineWidth=mode==='line'?3:mode==='sticker'?3:2.5;c.stroke();c.shadowBlur=0;
  if(mode==='volume'||mode==='glass'){
    c.save();bodyPath(c,p.character);c.clip();c.globalAlpha=.35;line(c,[[-40,-83],[-49,-57],[-50,-32]],'#fff',10);c.restore();
  }
  if(mode==='collage'){c.save();bodyPath(c,p.character);c.clip();for(let j=0;j<18;j++)line(c,[[-100,j*9-130],[100,j*9-200]],'#342c2929',1);c.restore();}
  face(c,shot.emotion,ink);
  if(shot.emotion==='curious')label(c,'?',90,-100,30,ink,800);
  if(shot.emotion==='afraid'){line(c,[[-95,-85],[-104,-100],[-97,-112]],ink,3);line(c,[[95,-85],[104,-100],[97,-112]],ink,3);}
  c.restore();
}
function shadow(c:C,s:State,y=567){c.save();c.globalAlpha=.13;c.fillStyle='#292738';c.beginPath();c.ellipse(s.pose.x,y,Math.max(18,58-(500-s.pose.y)*.09),10,0,0,TAU);c.fill();c.restore();}
function target(c:C,s:State,x=1100,y=270,color=s.pal.light){
  if(s.light){const g=c.createRadialGradient(x,y,5,x,y,105);g.addColorStop(0,color+'65');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-105,y-105,210,210);}
  polygon(c,star(x,y,35+8*s.light),s.light?color:'#a8a3ab',undefined);
  if(s.shot.action==='celebrate')for(let j=0;j<10;j++){const a=j*TAU/10+s.t,d=60+Math.sin(s.t*Math.PI)*70;circle(c,x+Math.cos(a)*d,y+Math.sin(a)*d,2+3*s.light,j%2?color:s.pal.main);}
}
function standardGround(c:C,s:State,fill='#dce2d1',stroke?:string){
  rect(c,0,570,1280,150,fill);polygon(c,[[490,570],[610,410],[745,570]],fill,stroke);if(stroke)line(c,[[40,570],[1240,570]],stroke,2);
}
function chrome(c:C,s:State,fg='#2c2b34',bg='#f7f3ea',caption=true){
  const style=getStyle(s.p.style);
  label(c,style.en,55,49,12,fg,700);label(c,`${String(s.i+1).padStart(2,'0')} / ${String(s.timeline.length).padStart(2,'0')}`,1225,49,13,fg,500,'right');
  label(c,s.p.title,55,103,28,fg,800);
  if(caption){rect(c,44,620,1192,65,bg,12);label(c,s.shot.caption,640,662,27,fg,650,'center',1120);}
  if(s.i===s.timeline.length-1)label(c,s.p.signature,1225,110,18,fg,500,'right',480);
  // Actual shot progress, shared by all visual languages.
  rect(c,55,700,1170,3,fg+'25');rect(c,55,700,1170*clamp(s.frame/s.timeline[s.timeline.length-1].to),3,fg);
}
function flat(c:C,s:State){
  rect(c,0,0,1280,720,'#fbf5e8');circle(c,1120,228,170,s.pal.light+'35');
  rect(c,55,143,91,8,s.pal.main,4);standardGround(c,s,'#e1e8d7');
  polygon(c,[[490,570],[610,410],[745,570]],s.pal.main+'45');shadow(c,s);target(c,s);avatar(c,s);
  if(['jump','float','fail'].includes(s.shot.action))for(let j=0;j<3;j++)line(c,[[s.pose.x-100-j*15,s.pose.y-10+j*20],[s.pose.x-135-j*15,s.pose.y-10+j*20]],s.pal.main,4);
  chrome(c,s);
}
function lineArt(c:C,s:State){
  rect(c,0,0,1280,720,'#f5f8fc');const ink='#254775';
  line(c,[[55,570],[490,570],[610,410],[745,570],[1225,570]],ink,2.5);
  c.save();c.setLineDash([9,12]);line(c,[[140,380],[320,380],[450,310],[640,310],[800,250],[1100,250]],'#a6bad0',2);c.restore();
  c.save();c.beginPath();c.rect(60,180,1140*ease(s.t),260);c.clip();
  line(c,[[140,380],[320,380],[450,310],[640,310],[800,250],[1100,250]],ink,3);c.restore();
  circle(c,140+960*ease(s.t),380-130*ease(s.t),6,s.pal.main);target(c,s);avatar(c,s,'line');
  for(const x of [140,450,800,1100])circle(c,x,x===140?380:x===450?310:250,13,'#f5f8fc',ink,2);
  chrome(c,s,ink,'#e6edf6');
}
function isoBox(c:C,x:number,y:number,w:number,d:number,h:number,top:string,left:string,right:string){
  const a:Point=[x,y-h],b:Point=[x+w*.866,y-w*.5-h],z:Point=[x+(w+d)*.866,y+(d-w)*.5-h],e:Point=[x+d*.866,y+d*.5-h];
  polygon(c,[a,b,z,e],top);
  polygon(c,[a,e,[e[0],e[1]+h],[x,y]],left);
  polygon(c,[e,z,[z[0],z[1]+h],[e[0],e[1]+h]],right);
}
function isometric(c:C,s:State){
  rect(c,0,0,1280,720,'#eaf4f1');
  // Parallel vectors on every face preserve an orthographic, isometric space.
  for(let row=0;row<3;row++)for(let col=0;col<8;col++){
    const x=80+col*122+row*35,y=490+row*35-col*4;
    isoBox(c,x,y,88,35,12,'#d6e8e0','#b3cebf','#9cb8aa');
  }
  for(let j=0;j<3;j++)isoBox(c,462+j*60,485-j*4,66,28,38+j*31,s.pal.light,'#bc8871',s.pal.dark);
  const x=110+s.pose.x*.84,y=485-(500-s.pose.y)-s.pose.x*.025;
  c.save();c.globalAlpha=.18;c.fillStyle='#243e36';c.beginPath();c.ellipse(x,550-s.pose.x*.025,45,12,-.1,0,TAU);c.fill();c.restore();
  isoBox(c,985,360,105,40,65,'#fff2bb','#d9b574','#ab8e59');target(c,s,1060,250);avatar(c,s,'flat',x,y,.84);
  chrome(c,s,'#284d46','#f6fcf9');
}
function volume(c:C,s:State){
  const bg=c.createLinearGradient(0,0,0,720);bg.addColorStop(0,'#d5c8ef');bg.addColorStop(.65,'#f2e9f5');bg.addColorStop(1,'#bcb1d5');c.fillStyle=bg;c.fillRect(0,0,1280,720);
  c.save();c.shadowColor='#6c588955';c.shadowBlur=38;c.shadowOffsetY=25;
  const g=c.createLinearGradient(0,450,0,590);g.addColorStop(0,'#fff7ff');g.addColorStop(1,'#a190bf');c.fillStyle=g;c.beginPath();c.ellipse(640,551,566,62,0,0,TAU);c.fill();c.restore();
  isoBox(c,500,521,105,45,75,'#e7d6f4','#b79dcf','#947cae');
  c.save();c.shadowColor='#47304e44';c.shadowBlur=22;shadow(c,s,552);c.restore();
  target(c,s,1100,275);avatar(c,s,'volume');
  chrome(c,s,'#4b395e','#f4eef9');
}
function torn(c:C,x:number,y:number,w:number,h:number,fill:string,seed=0){
  const pts:Point[]=[];for(let i=0;i<=20;i++)pts.push([x+i*w/20,y+Math.sin(i*3.6+seed)*5]);for(let i=20;i>=0;i--)pts.push([x+i*w/20,y+h+Math.cos(i*4.7+seed)*7]);
  c.save();c.shadowColor='#30241d2e';c.shadowBlur=9;c.shadowOffsetY=7;polygon(c,pts,fill);c.restore();
}
function collage(c:C,s:State,texture:HTMLImageElement){
  rect(c,0,0,1280,720,'#d4c4a5');c.save();c.globalAlpha=.6;c.globalCompositeOperation='multiply';c.drawImage(texture,0,0,1280,720);c.restore();
  torn(c,55,170,390,350,'#f4ecd5');
  for(let j=0;j<13;j++){label(c,'STORIES / 小小的勇气 / EVERY LITTLE STEP',75,200+j*23,10,'#4c514e',450);}
  c.save();c.translate(750,240);c.rotate(-.12);torn(c,-90,-66,430,240,'#8d9d88',3);label(c,actions[s.shot.action].label,-58,10,44,'#f9ecd0',850);label(c,emotions[s.shot.emotion],-55,64,16,'#f9ecd0');c.restore();
  torn(c,0,555,1280,165,'#eee4ca',7);polygon(c,[[480,560],[610,417],[750,565]],'#45565b');
  for(let j=0;j<7;j++)line(c,[[520+j*22,525],[550+j*22,554]],'#f6ecc0',2);
  c.save();c.translate(s.pose.x,s.pose.y);c.rotate(Math.sin(Math.floor(s.frame/2)*1.7)*.018);avatar(c,s,'collage',0,0);c.restore();
  target(c,s);chrome(c,s,'#352e2a','#f4eddb');
}
let fieldCanvas:HTMLCanvasElement|undefined;
const smoothMin=(a:number,b:number,k:number)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
function liquid(c:C,s:State){
  rect(c,0,0,1280,720,'#e9f5fa');
  for(let j=0;j<7;j++)circle(c,110+j*170,235+Math.sin(j*2+s.frame*.02)*50,12+j%3*9,'#a8d4e538');
  standardGround(c,s,'#d4e9ed');target(c,s);
  fieldCanvas??=document.createElement('canvas');fieldCanvas.width=256;fieldCanvas.height=144;
  const f=fieldCanvas.getContext('2d')!;const img=f.createImageData(256,144);
  const speed=['jump','float','fail','walk'].includes(s.shot.action)?1:0;
  const balls=[{x:s.pose.x,y:s.pose.y-35,r:68},...Array.from({length:5},(_,j)=>({x:s.pose.x-30-j*27*speed+Math.sin(s.frame*.07+j)*14,y:s.pose.y-25+Math.sin(s.frame*.09-j*.5)*22+j*4,r:20-j*2}))];
  const rgb=s.pal.main.match(/\w\w/g)!.map(x=>parseInt(x,16));
  for(let yy=26;yy<116;yy++)for(let xx=0;xx<256;xx++){
    let d=10000;for(const b of balls)d=smoothMin(d,Math.hypot(xx*5-b.x,yy*5-b.y)-b.r,35);
    if(d>3)continue;const i=(yy*256+xx)*4,shade=.83+.17*clamp((s.pose.y+30-yy*5)/130);
    img.data[i]=rgb[0]*shade;img.data[i+1]=rgb[1]*shade;img.data[i+2]=rgb[2]*shade;img.data[i+3]=255*clamp((3-d)/5);
  }
  f.putImageData(img,0,0);c.drawImage(fieldCanvas,0,0,1280,720);
  c.save();c.translate(s.pose.x,s.pose.y);face(c,s.shot.emotion,'#244e66');c.globalAlpha=.75;c.scale(.22,.22);c.translate(0,-300);bodyPath(c,s.p.character);c.strokeStyle='#fff';c.lineWidth=7;c.stroke();c.restore();
  chrome(c,s,'#244e66','#f7fcff');
}
function contour(kind:string,n=80):Point[]{
  return Array.from({length:n},(_,i)=>{
    const a=i/n*TAU-Math.PI/2;
    let r=75;
    if(kind==='star'){const phase=(i/n*5)%1;r=phase<.5?mix(90,40,phase*2):mix(40,90,(phase-.5)*2);}
    if(kind==='drop')r=66+24*Math.cos(a+Math.PI/2);
    if(kind==='flame')r=70+18*Math.sin(a*3)+10*Math.sin(a*5);
    if(kind==='diamond')r=90/(Math.abs(Math.cos(a))+Math.abs(Math.sin(a)));
    return [Math.cos(a)*r,Math.sin(a)*r-37];
  });
}
function morph(c:C,s:State){
  rect(c,0,0,1280,720,'#f0eafa');standardGround(c,s,'#dfd5ed');
  const phase=ease((Math.sin(s.t*TAU-Math.PI/2)+1)/2),a=contour(s.p.character),b=contour(s.shot.action==='celebrate'?'star':s.shot.action==='hesitate'?'diamond':'circle');
  const points=a.map(([x,y],i)=>[mix(x,b[i][0],phase),mix(y,b[i][1],phase)] as Point);
  c.save();c.translate(s.pose.x,s.pose.y);c.rotate(s.pose.rotation);c.scale(s.pose.sx,s.pose.sy);
  for(let j=3;j>0;j--){c.save();c.translate(-j*13,j*4);c.globalAlpha=.13;polygon(c,points,'',s.pal.main,3);c.restore();}
  polygon(c,points,s.pal.main);face(c,s.shot.emotion,'#332448');
  c.save();c.globalAlpha=.4;for(let j=0;j<80;j+=8)circle(c,points[j][0],points[j][1],3,'#fff');c.restore();c.restore();
  target(c,s);chrome(c,s,'#49325f','#fbf8ff');
}
function bauhaus(c:C,s:State){
  rect(c,0,0,1280,720,'#f4eddb');const colors=[s.pal.main,'#eec83b','#2b4865','#23231f'];
  for(let row=0;row<2;row++)for(let col=0;col<8;col++){
    const x=60+col*145,y=176+row*158,beat=Math.floor(s.frame/12+col+row)%4;
    c.save();c.translate(x+68,y+68);c.rotate(beat*Math.PI/2);
    if((col+row)%3===0){c.beginPath();c.arc(0,0,57,0,Math.PI);c.closePath();c.fillStyle=colors[(col+row)%4];c.fill();}
    else if((col+row)%3===1)rect(c,-56,-56,112,112,'',0,colors[(col+row)%4]);
    else polygon(c,[[-52,45],[52,45],[-52,-55]],colors[(col+row)%4]);
    c.restore();
  }
  rect(c,50,488,1180,95,'#f4eddb');line(c,[[55,570],[1225,570]],'#292b26',4);polygon(c,[[490,570],[610,437],[745,570]],'#2b4865');
  avatar(c,s);target(c,s);chrome(c,s,'#292b26','#e9dfc8');
}
function synthwave(c:C,s:State){
  const g=c.createLinearGradient(0,0,0,720);g.addColorStop(0,'#100d2c');g.addColorStop(.6,'#402057');g.addColorStop(1,'#0f102b');c.fillStyle=g;c.fillRect(0,0,1280,720);
  const sun=c.createLinearGradient(0,160,0,400);sun.addColorStop(0,'#ffd690');sun.addColorStop(1,'#ff4c98');
  circle(c,870,293,123,'#fb79a0');c.save();c.beginPath();c.arc(870,293,123,0,TAU);c.clip();c.fillStyle=sun;c.fillRect(730,160,280,270);for(let j=0;j<9;j++)rect(c,730,284+j*15,280,3+j*.8,'#35153f');c.restore();
  polygon(c,[[0,450],[170,330],[320,450],[465,350],[620,450],[760,380],[930,450],[1110,350],[1280,450],[1280,600],[0,600]],'#13112d','#7a408c',2);
  c.save();c.shadowColor='#f656cd';c.shadowBlur=12;
  for(let j=-9;j<=9;j++)line(c,[[640+j*12,430],[640+j*150,615]],'#a64ca1',1.4);
  for(let j=0;j<12;j++){const t=((j+s.frame*.025)%12)/12,y=430+t*t*185;line(c,[[0,y],[1280,y]],'#a64ca1',1.2);}
  polygon(c,[[490,570],[610,410],[745,570]],'#201836','#f687dd',2);target(c,s,1100,270,'#75ebfa');avatar(c,s,'neon');c.restore();
  c.save();c.globalAlpha=.05;for(let y=0;y<720;y+=5)rect(c,0,y,1280,1,'#fff');c.restore();chrome(c,s,'#f6e4fd','#241634');
}
function aurora(c:C,s:State){
  rect(c,0,0,1280,720,'#e9eafb');
  for(let j=0;j<4;j++){
    const x=180+j*330+Math.sin(s.frame*.012+j)*100,y=270+Math.cos(s.frame*.015+j*2)*120,r=270;
    const g=c.createRadialGradient(x,y,10,x,y,r);g.addColorStop(0,[s.pal.main+'85','#b0c2ff80','#81dcce80','#e8a6d185'][j]);g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
  }
  c.save();c.shadowColor='#6f629925';c.shadowBlur=24;c.shadowOffsetY=15;rect(c,75,155,1130,430,'#ffffff38',30,'#ffffffba');c.restore();
  for(let j=0;j<3;j++)rect(c,125+j*340,195,160,8,'#ffffff6a',4);
  rect(c,110,549,1060,12,'#ffffffa0',6);polygon(c,[[490,549],[610,410],[745,549]],'#ffffff66','#ffffffc0',2);
  target(c,s);avatar(c,s,'glass');chrome(c,s,'#4a476d','#ffffff9e');
}
function hanazi(c:C,s:State){
  rect(c,0,0,1280,720,'#fff4cc');const x=640,y=360;
  for(let j=0;j<22;j++){const a=j*TAU/22,b=(j+.6)*TAU/22;polygon(c,[[x,y],[x+Math.cos(a)*1000,y+Math.sin(a)*1000],[x+Math.cos(b)*1000,y+Math.sin(b)*1000]],j%2?'#fff4cc':'#ffdf7955');}
  const heroY=520-(500-s.pose.y)*.45;
  standardGround(c,s,'#f2d69d');target(c,s);avatar(c,s,'sticker',s.pose.x,heroY);
  const chars=Array.from(s.shot.caption),size=Math.min(53,1000/Math.min(chars.length,12)),rows=chars.length>12?2:1;
  for(let row=0;row<rows;row++){
    const part=rows===1?chars:chars.slice(row*12,(row+1)*12),w=part.length*size;
    part.forEach((ch,j)=>{
      const z=clamp(s.t*10-j*.11-row*.9),spring=1-Math.exp(-z*6)*Math.cos(z*11);
      c.save();c.translate(640-w/2+(j+.5)*size,200+row*size*1.2);c.rotate(Math.sin(j*2)*.06);c.scale(Math.max(.01,spring),Math.max(.01,spring));
      c.font=`900 ${size}px "StorySans",sans-serif`;c.textAlign='center';c.lineJoin='round';c.strokeStyle='#52362e';c.lineWidth=13;c.strokeText(ch,0,0);c.strokeStyle='#fff';c.lineWidth=8;c.strokeText(ch,0,0);c.fillStyle=j%2?s.pal.main:'#df863a';c.fillText(ch,0,0);c.restore();
    });
  }
  const ex=s.shot.emotion==='afraid'?'啊？！':s.shot.emotion==='sad'?'呜…':s.shot.emotion==='happy'?'耶！':s.shot.emotion==='determined'?'冲呀！':'咦？';
  c.save();c.translate(Math.min(1130,s.pose.x+125),Math.max(355,heroY-75));c.rotate(-.12);polygon(c,star(0,0,69),'#fff','#52362e',2);label(c,ex,0,9,24,'#a65337',850,'center',100);c.restore();
  chrome(c,s,'#674a31','#fff9e8',false);label(c,`${actions[s.shot.action].label} · ${emotions[s.shot.emotion]}`,640,659,21,'#674a31',650,'center');
}
function paperclip(c:C,s:State){
  rect(c,0,0,1280,720,'#f6f5e9');
  for(let x=0;x<1280;x+=32)line(c,[[x,132],[x,605]],'#d9dfcf',1);for(let y=132;y<610;y+=32)line(c,[[0,y],[1280,y]],'#d9dfcf',1);
  c.save();c.translate(260,234);c.rotate(-.05);rect(c,-160,-65,320,130,'#fff4b0',2);rect(c,-42,-80,84,25,'#b6c6b3b0');label(c,`STEP ${String(s.i+1).padStart(2,'0')}`,-130,-30,13,'#7e8254',750);label(c,actions[s.shot.action].label,-130,15,31,'#355849',850);label(c,`此刻：${emotions[s.shot.emotion]}`,-130,47,15,'#6e7854');c.restore();
  c.save();c.setLineDash([8,8]);line(c,[[445,278],[610,278],[610,348]],'#78966d',3);c.restore();polygon(c,[[601,338],[610,353],[619,338]],'#78966d');
  polygon(c,[[490,570],[610,414],[745,570]],'#bcd1b4','#fff',10);line(c,[[60,570],[1220,570]],'#78966d',3);target(c,s);avatar(c,s,'sticker');
  c.save();c.translate(1110,192);c.rotate(.25);c.beginPath();c.moveTo(-13,0);c.lineTo(-13,-44);c.bezierCurveTo(-13,-65,15,-65,15,-44);c.lineTo(15,10);c.bezierCurveTo(15,38,-23,38,-23,10);c.lineTo(-23,-37);c.strokeStyle='#678978';c.lineWidth=5;c.stroke();c.restore();
  chrome(c,s,'#365c4c','#fffdf0');
}
let pixelCanvas:HTMLCanvasElement|undefined;
const sprite={flame:['000100000','001110000','001110100','011111100','011111110','111111111','111111111','011111110','001111100'],drop:['000010000','000111000','001111100','001111100','011111110','111111111','111111111','011111110','001111100'],star:['000010000','000111000','111111111','011111110','001111100','011111110','011101110','110000011','100000001']};
function pixel(c:C,s:State){
  pixelCanvas??=document.createElement('canvas');pixelCanvas.width=320;pixelCanvas.height=180;
  const q=pixelCanvas.getContext('2d')!;rect(q,0,0,320,180,'#c6d9b0');
  for(let j=0;j<5;j++){const x=(j*83-s.frame*.05+340)%350;q.fillStyle='#e6edca';q.fillRect(x,41+j%2*12,23,5);q.fillRect(x+5,38+j%2*12,13,5);}
  q.fillStyle='#557653';q.fillRect(0,142,320,38);q.fillStyle='#94ac6d';q.fillRect(0,142,320,3);
  for(let row=0;row<3;row++)for(let col=0;col<20;col++){q.fillStyle=(row+col)%2?'#678152':'#628052';q.fillRect(col*16+row%2*8,148+row*9,14,7);}
  for(let row=0;row<8;row++){q.fillStyle=row%2?'#7e925e':'#738c57';q.fillRect(125+row*2,142-row*3,59-row*5,3);}
  const x=Math.round(s.pose.x/4),y=Math.round(s.pose.y/4),scale=3;
  const pixels=sprite[s.p.character];
  pixels.forEach((row,yy)=>Array.from(row).forEach((v,xx)=>{if(v==='1'){q.fillStyle=s.pal.main;q.fillRect(x+(xx-4)*scale,y+(yy-7)*scale,scale,scale);}}));
  q.fillStyle='#263c32';q.fillRect(x-6,y-14,2,s.shot.emotion==='happy'?2:4);q.fillRect(x+6,y-14,2,s.shot.emotion==='afraid'?5:3);
  q.fillRect(x-3,y-6,s.shot.emotion==='sad'?4:7,2);
  if(s.shot.emotion==='determined'){q.fillRect(x-8,y-19,4,2);q.fillRect(x+5,y-18,4,2);}
  if(s.shot.emotion==='curious'){q.fillRect(x-8,y-20,4,2);q.fillRect(x+5,y-22,4,2);}
  const stride=Math.round(s.pose.stride*3);q.fillRect(x-9+stride,y+5,6,3);q.fillRect(x+5-stride,y+5,6,3);
  q.fillRect(x-17,y-9-Math.round(s.pose.arms*10),6,3);q.fillRect(x+13,y-9-Math.round(s.pose.arms*10),6,3);
  const goal=star(275,68,10);polygon(q,goal,s.light?'#ffe16e':'#8ea27d');
  if(s.light)for(let j=0;j<4;j++){q.fillStyle='#ffe16e';q.fillRect(275+Math.round(Math.cos(j*Math.PI/2+s.frame*.04)*17),68+Math.round(Math.sin(j*Math.PI/2+s.frame*.04)*17),2,2);}
  c.save();c.imageSmoothingEnabled=false;c.drawImage(pixelCanvas,0,0,1280,720);c.restore();chrome(c,s,'#29452f','#e5edce');
}
function hud(c:C,s:State){
  const cyan='#68dedb';rect(c,0,0,1280,720,'#0b1b26');
  for(let x=0;x<1280;x+=40)line(c,[[x,130],[x,609]],'#163542',1);for(let y=130;y<610;y+=40)line(c,[[0,y],[1280,y]],'#163542',1);
  line(c,[[55,570],[490,570],[610,410],[745,570],[1225,570]],'#43818a',2);
  rect(c,60,158,247,160,'#0b2633',5,'#2d5964');label(c,'SUBJECT / 01',80,188,13,cyan);label(c,actions[s.shot.action].label,80,227,26,'#effffe',800);label(c,`情绪 / ${emotions[s.shot.emotion]}`,80,261,16,'#88aeb5');
  label(c,`X ${s.pose.x.toFixed(0)}    Y ${s.pose.y.toFixed(0)}`,80,292,13,cyan,450);
  c.save();c.setLineDash([5,7]);line(c,[[s.pose.x,s.pose.y-25],[1100,270]],'#3b6f7a',1);c.restore();
  avatar(c,s,'line',s.pose.x,s.pose.y,1,cyan);
  const x=s.pose.x,y=s.pose.y-37,w=94,h=115;
  for(const [xx,yy,dx,dy] of [[x-w,y-h,1,1],[x+w,y-h,-1,1],[x-w,y+h,1,-1],[x+w,y+h,-1,-1]])line(c,[[xx,yy+dy*23],[xx,yy],[xx+dx*23,yy]],cyan,2);
  target(c,s,1100,270,cyan);circle(c,1100,270,70,'','#397582',1);c.save();c.translate(1100,270);c.rotate(s.frame*.027);c.beginPath();c.arc(0,0,80,.2,Math.PI*1.2);c.strokeStyle=cyan;c.lineWidth=3;c.stroke();c.restore();
  label(c,s.light?'TARGET / LIT':'TARGET / WAIT',1100,383,13,cyan,550,'center');
  rect(c,42,130+(s.frame*2)%470,1196,1,'#68dedb30');chrome(c,s,'#a8e9e5','#102f3d');
}

export function paintVisual(c:C,frame:number,p:StoryProps,texture:HTMLImageElement){
  if(!p.style||p.style==='cel-boil'){paintCel(c,frame,p,texture);return;}
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,1280,720);c.save();
  const s=state(frame,p);
  switch(p.style){
    case 'flat-vector':flat(c,s);break;
    case 'line-art':lineArt(c,s);break;
    case 'isometric':isometric(c,s);break;
    case '3d-render':volume(c,s);break;
    case 'collage':collage(c,s,texture);break;
    case 'liquid':liquid(c,s);break;
    case 'morph':morph(c,s);break;
    case 'bauhaus':bauhaus(c,s);break;
    case 'synthwave':synthwave(c,s);break;
    case 'aurora-glass':aurora(c,s);break;
    case 'hanazi':hanazi(c,s);break;
    case 'paperclip':paperclip(c,s);break;
    case 'pixel':pixel(c,s);break;
    case 'hud':hud(c,s);break;
  }
  c.restore();
}
