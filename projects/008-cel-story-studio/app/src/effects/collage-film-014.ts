import type {EffectConfig} from '../../scripts/effects.mjs';
import type {EffectAssets} from './canvas';
import {hash,smooth,clamp,lerp,text,TAU} from './math';
import {texture} from './film-graphics';

type G=CanvasRenderingContext2D;
type V={x:number;y:number};
type Parts={atlas:HTMLImageElement;radio:HTMLCanvasElement;dial:HTMLCanvasElement;shell:HTMLCanvasElement;helmet:HTMLCanvasElement;body:HTMLCanvasElement;lamp:HTMLCanvasElement;bell:HTMLCanvasElement;tentacles:HTMLCanvasElement;cloth:HTMLCanvasElement};
const W=1280,H=720,cream='#eee3c9',ink='#182e35',paperWhite='#fff2d3',navy='#123b4a';
const radioX=610,radioY=365,radioScale=1.05,cone={x:235,y:325,r:150};
const left=radioX-602/2*radioScale,top=radioY-537/2*radioScale;
const focus={x:left+cone.x*radioScale,y:top+cone.y*radioScale};
let cache:Parts|undefined;
const off=(w:number,h:number)=>{const v=document.createElement('canvas');v.width=w;v.height=h;return v;};
function poly(g:G,pts:number[][],fill:string,edge?:string,width=2){g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();if(edge){g.strokeStyle=edge;g.lineWidth=width;g.lineJoin='round';g.stroke();}g.fillStyle=fill;g.fill();}
function stroke(g:G,pts:number[][],col:string,w=2){g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.strokeStyle=col;g.lineWidth=w;g.lineJoin='round';g.lineCap='round';g.stroke();}
function disk(g:G,x:number,y:number,r:number,c:string){g.beginPath();g.arc(x,y,Math.max(.001,r),0,TAU);g.fillStyle=c;g.fill();}
function hex(x:number,y:number,r:number){return Array.from({length:6},(_,i)=>[x+Math.cos(-Math.PI/6+i*TAU/6)*r,y+Math.sin(-Math.PI/6+i*TAU/6)*r]);}
function shadow(g:G,lift=0,alpha=.32){g.shadowColor=`rgba(12,25,29,${alpha})`;g.shadowOffsetX=3+lift*15;g.shadowOffsetY=4+lift*18;g.shadowBlur=3+lift*18;}
function clearShadow(g:G){g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetX=0;g.shadowOffsetY=0;}
function crop(im:CanvasImageSource,x:number,y:number,w:number,h:number){const c=off(w,h);c.getContext('2d')!.drawImage(im,x,y,w,h,0,0,w,h);return c;}
function masked(im:HTMLCanvasElement,pts:number[][]){const c=off(im.width,im.height),g=c.getContext('2d')!;poly(g,pts,'white');g.globalCompositeOperation='source-in';g.drawImage(im,0,0);return c;}
function getParts(atlas:HTMLImageElement):Parts{
 if(cache?.atlas===atlas)return cache;
 const radio=crop(atlas,20,0,602,537),shell=off(602,537),s=shell.getContext('2d')!;s.drawImage(radio,0,0);s.globalCompositeOperation='destination-out';poly(s,hex(cone.x,cone.y,cone.r-2),'black');
 const diver=crop(atlas,730,548,468,695);
 const helmet=masked(diver,[[124,0],[365,0],[419,93],[404,176],[350,235],[272,259],[161,219],[119,138]]);
 const body=masked(diver,[[176,210],[315,202],[367,238],[368,367],[338,484],[196,484],[156,422],[148,288]]);
 const lamp=masked(crop(diver,0,240,185,295),[[58,0],[103,0],[105,18],[135,29],[145,60],[165,78],[174,120],[164,185],[154,245],[142,267],[47,278],[22,259],[20,224],[10,183],[5,119],[20,68],[47,42],[58,30]]),jelly=crop(atlas,35,540,630,701);
 const bell=masked(jelly,[[0,0],[630,0],[630,328],[515,322],[366,318],[214,301],[90,300],[0,322]]);
 const tentacles=masked(jelly,[[0,245],[630,245],[630,701],[0,701]]);
 const cloth=off(96,96),cg=cloth.getContext('2d')!;cg.fillStyle='#d7cab0';cg.fillRect(0,0,96,96);cg.filter='saturate(0.25) brightness(1.1)';cg.drawImage(diver,335,280,65,85,0,0,96,96);
 const dial=off(132,132),dg=dial.getContext('2d')!;disk(dg,66,66,63,'white');dg.globalCompositeOperation='source-in';dg.drawImage(radio,452,190,132,132,0,0,132,132);
 return cache={atlas,radio,dial,shell,helmet,body,lamp,bell,tentacles,cloth};
}
function torn(g:G,x:number,y:number,w:number,h:number,color:string,seed:number,rough=8){const pts:number[][]=[];for(let i=0;i<=32;i++)pts.push([x+i*w/32,y-hash(i,seed)*rough]);for(let i=0;i<=12;i++)pts.push([x+w+hash(i+50,seed)*rough,y+i*h/12]);for(let i=32;i>=0;i--)pts.push([x+i*w/32,y+h+hash(i+80,seed)*rough]);for(let i=12;i>=0;i--)pts.push([x-hash(i+130,seed)*rough,y+i*h/12]);poly(g,pts,color);}
function news(g:G,c:EffectConfig,x:number,y:number,w:number,h:number,angle=0){g.save();g.translate(x,y);g.rotate(angle);shadow(g,.1,.15);torn(g,0,0,w,h,'#d8d3bd',c.seed+Math.round(x),4);clearShadow(g);g.fillStyle='#34433c50';for(let row=0;row<h/5-2;row++)for(let col=0;col<3;col++){const xx=8+col*w/3,yy=8+row*5,l=w/3-12-(hash(row+col*27,c.seed)>.8?10:0);g.fillRect(xx,yy,l,1);}g.restore();}
function page(g:G,c:EffectConfig){g.fillStyle='#c8bb9d';g.fillRect(0,0,W,H);torn(g,20,24,1240,674,cream,c.seed,10);news(g,c,33,55,185,620,-.035);news(g,c,1074,55,155,320,.055);g.save();g.globalAlpha=.12;disk(g,640,355,270,c.primary);g.restore();}
function paperHand(g:G,c:EffectConfig,x:number,y:number,t:number,angle:number,scale=1){
 g.save();g.translate(x,y);g.rotate(angle);g.scale(scale,scale);const jitter=Math.floor(t*12);g.translate((hash(jitter,c.seed)-.5)*1.5,(hash(jitter+19,c.seed)-.5)*1.5);
 const pts=[[0,-9],[15,-20],[120,-27],[144,-43],[172,-40],[191,-22],[211,-13],[238,18],[267,57],[325,85],[290,158],[230,135],[192,96],[139,92],[98,77],[59,55],[37,32],[16,20],[-2,10]];
 shadow(g,.3,.27);poly(g,pts,'#e3d2a8',paperWhite,10);clearShadow(g);stroke(g,[[0,-8],[131,-15],[151,-26],[173,-22]],ink,2.4);stroke(g,[[40,24],[74,29],[102,47],[140,59]],ink,2);stroke(g,[[93,3],[123,8],[153,29],[165,47]],ink,2);stroke(g,[[139,61],[177,62],[201,78]],ink,2);stroke(g,[[199,19],[182,35],[179,54]],ink,1.5);
 for(let i=0;i<17;i++)stroke(g,[[198+i*5,82+i*1.6],[188+i*5,104+i*1.6]],'#403e3445',1);
 g.restore();
}
function knob(g:G,p:Parts,t:number){const turn=t<.65?-.7:t<1.1?-.1:t<1.55?.55:.95;g.save();g.translate(518,255);g.rotate(turn);shadow(g,.02,.3);g.drawImage(p.dial,-66,-66);clearShadow(g);stroke(g,[[0,-53],[0,-42]],paperWhite,3);g.restore();}
function petals(g:G,p:Parts,c:EffectConfig,opening:number,t:number){
 const corners=hex(cone.x,cone.y,cone.r);
 for(let i=0;i<6;i++){const a=corners[i],b=corners[(i+1)%6],hx=(a[0]+b[0])/2,hy=(a[1]+b[1])/2,angle=Math.atan2(hy-cone.y,hx-cone.x),u=clamp(opening-i*.022),radial=Math.cos(u*Math.PI),lift=Math.sin(u*Math.PI);
  g.save();g.translate(hx,hy);g.rotate(angle);g.scale(Math.abs(radial)<.018?(radial<0?-.018:.018):radial,1);g.rotate(-angle);g.translate(-hx,-hy);
  shadow(g,lift,.42);poly(g,[[cone.x,cone.y],a,b],u<.5?'#b99b61':'#dfd5b8',paperWhite,5);clearShadow(g);
  g.save();g.beginPath();g.moveTo(cone.x,cone.y);g.lineTo(...a as [number,number]);g.lineTo(...b as [number,number]);g.closePath();g.clip();
  if(u<.5)g.drawImage(p.radio,0,0);else{g.fillStyle='#d8c7a4';g.fillRect(60,140,370,370);for(let k=0;k<22;k++){const yy=160+k*14;stroke(g,[[75,yy],[415,yy+25]],'#35505766',.7+c.detail*.6);}}
  g.restore();stroke(g,[a,b],paperWhite,3.4);g.restore();
 }
}
function limb(g:G,p:Parts,a:V,b:V,width:number,fore=false){
 const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len*width/2,ny=dx/len*width/2;
 const pts=[[a.x+nx,a.y+ny],[b.x+nx*.8,b.y+ny*.8],[b.x-nx*.8,b.y-ny*.8],[a.x-nx,a.y-ny]];
 shadow(g,.06,.24);poly(g,pts,'#c8b88f',paperWhite,5);clearShadow(g);
 g.save();g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();g.fillStyle=g.createPattern(p.cloth,'repeat')!;g.fillRect(a.x-len-width,a.y-len-width,len*2+width*2,len*2+width*2);g.restore();
 stroke(g,[[a.x+nx*.7,a.y+ny*.7],[b.x+nx*.5,b.y+ny*.5]],'#5b5145',1.1);disk(g,a.x,a.y,fore?6:7,'#9c7646');disk(g,a.x-1,a.y-1,2,'#dfc995');
}
function chain(g:G,p:Parts,start:V,end:V,l1:number,l2:number,width:number,bend:number){
 const dx=end.x-start.x,dy=end.y-start.y,d=clamp(Math.hypot(dx,dy),1,l1+l2-.1),base=Math.atan2(dy,dx),v=clamp((d*d+l1*l1-l2*l2)/(2*d*l1),-1,1),a=base+Math.acos(v)*bend;
 const joint={x:start.x+Math.cos(a)*l1,y:start.y+Math.sin(a)*l1};limb(g,p,start,joint,width);limb(g,p,joint,end,width*.82,true);
}
function boot(g:G,x:number,y:number){shadow(g,.05,.2);poly(g,[[x-22,y-12],[x+10,y-12],[x+21,y-4],[x+23,y+4],[x-29,y+4],[x-31,y-2]],'#343936',paperWhite,4);clearShadow(g);stroke(g,[[x-24,y+1],[x+20,y+1]],'#b59b68',3);stroke(g,[[x-10,y-9],[x+8,y-9]],'#c6b698',2);}
function glove(g:G,x:number,y:number){disk(g,x,y,9,paperWhite);disk(g,x,y,7,'#323a35');stroke(g,[[x-5,y-2],[x+4,y-2]],'#9b9777',1.1);}
function diver(g:G,c:EffectConfig,p:Parts,t:number){
 const climb=clamp(t-3.2,0,2.4),step=Math.floor((climb+.00001)/.8),u=climb-step*.8,
  bodyY=-150+step*64+64*smooth(.25,.68,u),cx=160+(hash(Math.floor(t*6),c.seed)-.5)*1.1,
  awake=smooth(5.55,6.2,t),handY=-190+step*64+64*smooth(0,.2,u),
  footA=step*64+64*smooth(.65,.8,u),footB=(step-1)*64+64*smooth(.05,.25,u);
 const leftHand={x:82,y:handY},rightHand={x:cx+80,y:bodyY-35-awake*(35+c.intensity*20)},leftFoot={x:76,y:footA},rightFoot={x:52,y:footB};
 chain(g,p,{x:cx-17,y:bodyY+53},leftFoot,65,66,24,-1);chain(g,p,{x:cx+20,y:bodyY+53},rightFoot,69,69,25,1);boot(g,leftFoot.x,leftFoot.y);boot(g,rightFoot.x,rightFoot.y);
 chain(g,p,{x:cx-36,y:bodyY-36},leftHand,47,55,25,-1);chain(g,p,{x:cx+38,y:bodyY-32},rightHand,49,53,26,1);
 g.save();g.translate(cx,bodyY);g.rotate(-.035-awake*.025);g.scale(.45,.45);shadow(g,.06,.30);g.drawImage(p.body,-275,-340);clearShadow(g);g.restore();
 g.save();g.translate(cx,bodyY-83.25);g.rotate(-awake*.16);g.scale(.45,.45);shadow(g,.03,.24);g.drawImage(p.helmet,-275,-155);clearShadow(g);g.restore();
 // The lantern hangs from a real loop in the free hand; the other hand remains on its rung.
 g.save();g.translate(rightHand.x,rightHand.y);g.rotate(Math.sin(t*3)*.04*(1-awake));shadow(g,.13,.25);g.drawImage(p.lamp,-92*.35,-14*.35,185*.35,295*.35);clearShadow(g);g.restore();
 glove(g,leftHand.x,leftHand.y);glove(g,rightHand.x,rightHand.y);
 const lamp={x:rightHand.x-1,y:rightHand.y+59};
 return {lamp,awake,bodyY};
}
function jelly(g:G,c:EffectConfig,p:Parts,x:number,y:number,width:number,phase:number,awake:number,t:number){
 const pulse=Math.floor(t*8+phase)%4,stretch=[.96,1.04,1.02,.98][pulse],s=width/630;
 g.save();g.translate(x,y);g.rotate(Math.sin(t*.7+phase)*.025);g.scale(s,s);
 g.globalAlpha=.55+awake*.45;
 // The tentacles bend separately; the bell contracts without scaling the whole animal.
 g.save();g.transform(1,0,Math.sin(t*2+phase)*.035*(.4+awake*.6),1,0,0);shadow(g,.06,.18);g.drawImage(p.tentacles,-315,-150);clearShadow(g);g.restore();
 g.save();g.translate(0,-35);g.scale(1+(1-stretch)*.8,stretch);shadow(g,.05,.22);g.drawImage(p.bell,-315,-115);clearShadow(g);g.restore();
 if(awake>.01){g.globalCompositeOperation='screen';g.globalAlpha=awake*(.12+pulse*.012);g.fillStyle=c.secondary;g.beginPath();g.ellipse(0,-20,230,125,0,0,TAU);g.fill();}
 g.restore();
}
function ladder(g:G,c:EffectConfig,t:number){
 for(const x of [20,82]){shadow(g,.05,.22);torn(g,x-6,-480,12,1000,'#cdb88e',c.seed+x,2);clearShadow(g);stroke(g,[[x-3,-480],[x-3,520]],paperWhite,1.3);}
 for(let i=-8;i<9;i++){const y=i*64;shadow(g,.035,.23);poly(g,[[17,y-5],[86,y-5],[88,y+5],[17,y+5]],'#b79660',paperWhite,2.7);clearShadow(g);disk(g,22,y,2,ink);disk(g,81,y,2,ink);if(i%2===0)text(g,String(i+8).padStart(2,'0'),-4,y+4,8,'#b3c3b5','right',600);}
}
function sea(g:G,c:EffectConfig,p:Parts,t:number){
 const awake=smooth(5.55,6.2,t),returning=smooth(7.45,8.45,t),track=120*(1-smooth(3.5,5.2,t))-32*smooth(5.2,6.0,t);
 g.save();g.translate(0,track);g.fillStyle=navy;g.fillRect(-700,-700,1400,1400);
 // This is a set of physical torn-paper shelves, with their own edges and occlusion.
 const layers=['#52818a','#376979','#234d60','#143a4b'];
 for(let j=0;j<4;j++){g.save();const shift=returning*(j%2?1:-1)*50;g.translate(shift,0);g.rotate((j-1.5)*.04);shadow(g,.05+j*.02,.24);torn(g,-520,-390+j*135,1040,175,layers[j],c.seed+j*19,12);clearShadow(g);g.restore();}
 for(let i=0;i<c.count*3+8;i++){const x=(hash(i,c.seed)-.5)*780,y=(hash(i+51,c.seed)-.5)*800;g.save();g.globalAlpha=.15;disk(g,x,y,1+hash(i+21,c.seed)*2,paperWhite);g.restore();}
 // Folded seams and print hatching establish flat stock, rather than a painted ocean gradient.
 for(let j=0;j<3;j++){stroke(g,[[-390,-220+j*180],[-170,-234+j*180],[90,-208+j*180],[390,-230+j*180]],'#deebd744',1.2);}
 ladder(g,c,t);
 const d=diver(g,c,p,t);
 if(awake>.01){g.save();g.globalAlpha=.10*awake;poly(g,[[d.lamp.x,d.lamp.y],[-340,-220],[-340,235]],'#ffe6a4');g.restore();}
 jelly(g,c,p,-235,-95,185,0,awake,t);jelly(g,c,p,-210,130,120,1.3,awake,t);jelly(g,c,p,-70,-150,105,2.1,awake,t);
 if(c.count>8)jelly(g,c,p,278,-255,85,3.2,awake,t);
 // Printed ripple bands answer the lamp, then converge back to the speaker for the exit.
 if(awake>.01){for(let i=0;i<5;i++){const u=((t-5.55)*.45+i*.2)%1,r=65+u*230;g.save();g.globalAlpha=awake*(1-u)*.6;g.strokeStyle=i%2?c.primary:paperWhite;g.lineWidth=1.3;g.beginPath();g.ellipse(-170,-40,r,r*.66,0,-.6,.75);g.stroke();g.restore();}}
 if(returning>.01){g.save();g.globalAlpha=returning*.55;for(let i=0;i<5;i++){const x=-340+i*150;stroke(g,[[x,-290],[x+80,-50],[x+35,300]],paperWhite,1);}g.restore();}
 g.restore();
}
function coverPage(g:G,c:EffectConfig,p:Parts,t:number){
 const enter=smooth(8.65,9.05,t);if(enter<=0)return;
 g.save();g.translate(W,0);g.scale(Math.max(.02,enter),1);g.translate(-W,0);shadow(g,(1-enter)*2,.34);torn(g,0,0,W,H,cream,c.seed+2,7);clearShadow(g);
 news(g,c,24,30,180,650,-.025);disk(g,368,343,269,c.primary);
 g.save();g.translate(366,391);g.rotate(-.055);shadow(g,.15,.32);g.drawImage(p.radio,-290,-258,580,516);clearShadow(g);g.restore();
 g.save();g.translate(730,73);g.rotate(.018);shadow(g,.04,.2);torn(g,0,0,492,570,navy,c.seed+44,5);clearShadow(g);g.restore();
 text(g,'DEEP SEA',765,171,61,paperWhite,'left',900,430);text(g,'RADIO',762,254,98,paperWhite,'left',950,430);
 stroke(g,[[766,286],[1179,286]],c.primary,8);text(g,'FM 89.6 / AFTER THE NOISE',766,322,13,paperWhite,'left',550,430);
 text(g,c.title,763,439,60,paperWhite,'left',850,430);text(g,c.subtitle,766,482,18,'#bed0c4','left',450,420);
 text(g,c.words.join(' / '),766,564,22,paperWhite,'left',700,420);
 text(g,'一张纸，也可以很深。',80,685,19,ink,'left',650,600);text(g,'ISSUE 014 / ORIGINAL COLLAGE',1210,685,11,ink,'right',550);
 g.restore();
}

export function collageFilm014(g:G,c:EffectConfig,t:number,assets:EffectAssets){
 const atlas=assets.atlas;if(!atlas){g.fillStyle=cream;g.fillRect(0,0,W,H);return;}
 const p=getParts(atlas),qt=Math.floor(clamp(t,0,10)*12)/12;
 page(g,c);
 const enter=smooth(1.8,3.55,qt),exit=smooth(7.4,8.65,qt),zoom=1+3.3*enter*(1-exit),
  focusMix=enter*(1-exit),cx=lerp(640,focus.x,focusMix),cy=lerp(360,focus.y,focusMix),
  opening=smooth(1.65,2.8,qt)*(1-smooth(7.55,8.6,qt));
 g.save();g.translate(640-cx*zoom,360-cy*zoom);g.scale(zoom,zoom);g.translate(left,top);g.scale(radioScale,radioScale);
 // The ocean sits behind an actual six-sided hole in the radio shell. Each triangular
 // speaker face is hinged on its outside edge, rather than a circular reveal mask.
 g.save();g.beginPath();hex(cone.x,cone.y,cone.r).forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();
 g.fillStyle='#061d29';g.fillRect(75,160,320,330);g.translate(cone.x,cone.y);g.scale(cone.r/400,cone.r/400);sea(g,c,p,qt);g.restore();
 shadow(g,.07,.35);g.drawImage(p.shell,0,0);clearShadow(g);stroke(g,[...hex(cone.x,cone.y,cone.r),hex(cone.x,cone.y,cone.r)[0]],'#171f1d',4);
 petals(g,p,c,opening,qt);knob(g,p,qt);g.restore();
 if(qt<1.8){const slide=1-smooth(0,.3,qt),leaving=smooth(1.55,1.8,qt),turn=qt<.65?-.7:qt<1.1?-.1:qt<1.55?.55:.95,
   knobX=left+518*radioScale,knobY=top+255*radioScale;
  paperHand(g,c,knobX+35+slide*420+leaving*450,knobY-25+slide*70,qt,turn*.18,.95);
  text(g,'世界太吵，',75,175,41,ink,'left',850,300);text(g,'换个频道。',75,229,41,ink,'left',850,300);text(g,c.words[0],79,348,25,ink,'left',650,240);
 }
 if(qt>3.5&&qt<7.5){g.save();g.translate(43,610);g.rotate(-.035);shadow(g,.08,.25);torn(g,0,0,430,60,cream,c.seed+71,5);clearShadow(g);text(g,qt<5.6?(c.words[1]||'下潜'):(c.words[2]||'回响'),22,41,30,ink,'left',850,380);g.restore();}
 if(qt<8.65){text(g,'DEEP SEA FREQUENCY / 深海电台',40,36,12,qt<2?ink:paperWhite,'left',600);text(g,'89.6 / THE OCEAN IS LISTENING',1240,36,11,qt<2?ink:paperWhite,'right',500);}
 coverPage(g,c,p,qt);texture(g,.12+c.detail*.10);
}
