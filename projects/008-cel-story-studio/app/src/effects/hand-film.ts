import type {EffectConfig} from '../../scripts/effects.mjs';
import type {EffectAssets} from './canvas';
import {inkStroke,inkLoop} from '../vendor/engine.js';
import {W,H,TAU,hash,lerp,smooth,text,circle,paper} from './math';
const dark='#2b3433',cream='#f0e5cb';
type P=number[][];
export function handFilm(g:CanvasRenderingContext2D,c:EffectConfig,t:number,assets:EffectAssets){
 const q=Math.floor(t*12),qt=q/12;let serial=0;
 const line=(pts:P,color=dark,w=3,closed=false)=>{const opts={seed:c.seed+q*29+serial++*17,amp:.5+c.detail*1.1,w,color};closed?inkLoop(g,pts,opts):inkStroke(g,pts,opts);};
 const shape=(pts:P,fill:string,w=3)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=fill;g.fill();line(pts,dark,w,true);};
 const ellipse=(x:number,y:number,rx:number,ry:number,fill:string,w=3,rotation=0)=>{const p=Array.from({length:36},(_,i)=>{const a=i*TAU/36;return [x+Math.cos(a)*rx*Math.cos(rotation)-Math.sin(a)*ry*Math.sin(rotation),y+Math.cos(a)*rx*Math.sin(rotation)+Math.sin(a)*ry*Math.cos(rotation)];});shape(p,fill,w);};
 const hatch=(x:number,y:number,w:number,h:number,spacing=7,color='#35413c77')=>{for(let k=0;k<w/spacing;k++){const xx=x+k*spacing;line([[xx,y+h],[Math.min(x+w,xx+h*.45),y]],color,.7);}};
 const envelope=(x:number,y:number,s=1,ang=0)=>{g.save();g.translate(x,y);g.rotate(ang);g.scale(s,s);shape([[-30,-20],[30,-20],[30,20],[-30,20]],'#f0d9a3',2);line([[-30,-20],[0,3],[30,-20]],dark,1.5);line([[-30,20],[-10,0]],dark,1);line([[30,20],[10,0]],dark,1);circle(g,0,2,4,c.primary);g.restore();};
 const phase=t<2.35?0:t<6.3?1:2;
 // The camera is designed per shot; details remain drawn in world space.
 paper(g,c.seed,'#ded7bd');if(assets.paper){g.save();g.globalAlpha=.48;g.globalCompositeOperation='multiply';g.drawImage(assets.paper,0,0,W,H);g.restore();}
 const tint=g.createLinearGradient(0,0,0,H);tint.addColorStop(0,'#eec87420');tint.addColorStop(1,'#d8bc7f05');g.fillStyle=tint;g.fillRect(0,0,W,H);
 const cameraX=phase===0?300:phase===1?lerp(70,250,smooth(2.35,6.3,t)):520;
 const cameraScale=phase===0?1.72:phase===1?1.03:1.45;
 g.save();g.translate(640-cameraX*cameraScale,360-330*cameraScale);g.scale(cameraScale,cameraScale);
 // Screen printed moon, etched clouds, distant rooftops and a layered wet road.
 circle(g,1020,105,73,'#e5bd69');for(let k=0;k<5;k++)line([[935+k*16,60],[982+k*6,45]],'#786f483c',1);
 for(let j=0;j<3;j++){const y=180+j*65;g.fillStyle=['#b6bfcd','#8c9eb9','#6c83a1'][j];g.beginPath();g.moveTo(-500,700);for(let x=-500;x<1800;x+=55)g.lineTo(x,y+Math.sin(x*.006+j)*35+Math.cos(x*.015+j)*18);g.lineTo(1800,700);g.fill();}
 for(let i=0;i<9;i++){
  const x=-180+i*185-(phase===1?(t-2.35)*12:0),h=120+hash(i+15,c.seed)*95,y=465-h;
  shape([[x,y+h],[x,y],[x+58,y-46],[x+116,y],[x+116,y+h]],i%2?'#a4b4c2':'#d7d1bd',1.3);
  for(let j=0;j<2;j++){const xx=x+24+j*55;shape([[xx,y+35],[xx+23,y+35],[xx+23,y+67],[xx,y+67]],'#e9c77a',1);line([[xx+11,y+35],[xx+11,y+67]],dark,.8);}
  hatch(x+5,y+h-28,100,24,10,'#344a3a33');
 }
 shape([[-500,465],[1600,465],[1600,900],[-500,900]],'#abb09b',1.5);
 for(let j=0;j<32;j++){const x=hash(j,c.seed)*1900-300,y=490+hash(j+65,c.seed)*170;line([[x,y],[x+18+hash(j+3,c.seed)*65,y]],'#4b665955',1);}
 line([[-500,463],[1600,463]],dark,3);
 // The post box is a character-sized prop, with seams, hatch and a lit aperture.
 const bx=815,by=372;shape([[bx-41,by-60],[bx+41,by-60],[bx+48,by+60],[bx-48,by+60]],c.primary,3.5);ellipse(bx,by-60,41,17,c.primary,3.5);
 shape([[bx-39,by-41],[bx+39,by-41],[bx+39,by+49],[bx-39,by+49]],c.primary,1.8);shape([[bx-29,by-28],[bx+29,by-28],[bx+29,by-15],[bx-29,by-15]],'#273c37',2);
 for(const x of [bx-20,bx+20])line([[x,by+59],[x,465]],dark,6);
 text(g,'POST',bx,by+13,13,cream,'center',800,60);hatch(bx+26,by-9,13,57,4);line([[bx-40,by+42],[bx+39,by+42]],'#e6ab78',2);
 // Rabbit courier silhouette, cloth and acting are several ink layers, not a tiny icon.
 const riderX=phase===0?305:phase===1?lerp(210,640,smooth(2.35,6.3,t)):668;
 const pedal=Math.sin(qt*9)*c.intensity,stop=phase===2?smooth(6.3,6.8,t):0;
 g.save();g.translate(riderX,328);const bob=phase===2?0:Math.sin(qt*9)*2;g.translate(0,bob);g.rotate(-Math.sin(smooth(2.8,4.5,t)*Math.PI)*.07*c.intensity);
 const wheel=(x:number)=>{ellipse(x,86,51,51,'#c9c5aa',3.5);ellipse(x,86,46,46,'#a4ae9855',1.1);for(let k=0;k<12;k++){const a=k*TAU/12-(phase===2?6:qt*4);line([[x,86],[x+Math.cos(a)*44,86+Math.sin(a)*44]],'#2e4039',.9);}ellipse(x,86,4,4,cream,1);};
 wheel(-76);wheel(91);line([[-76,86],[-17,8],[24,86],[-76,86],[63,8],[91,86],[24,86]],'#9a4c3b',7);line([[-24,5],[1,5]],dark,8);line([[63,8],[64,-12],[88,-12]],dark,5);line([[24,86],[37,88]],dark,3);
 line([[-60,52],[-94,48],[-105,22],[-52,22],[-47,50]],dark,4);hatch(-101,25,49,21,7);line([[-90,28],[-80,43],[-61,29]],dark,1);
 // Long ears, helmet, head and cheek retain a recognisable silhouette in all shots.
 g.save();g.translate(-20,-80);g.rotate(phase===2?Math.sin(smooth(6.6,8.8,t)*Math.PI)*.10:Math.sin(qt*2)*.025);g.translate(20,80);
 shape([[-50,-88],[-59,-154],[-49,-169],[-39,-156],[-29,-91]],cream,3);shape([[-19,-91],[-11,-157],[2,-166],[10,-151],[4,-84]],cream,3);
 line([[-48,-145],[-40,-111]],c.primary,4);line([[-1,-143],[-6,-106]],c.primary,4);
 ellipse(-20,-80,43,45,cream,3.7,-.12);ellipse(13,-61,21,17,cream,2.8);circle(g,10,-88,4,dark);line([[5,-99],[18,-98]],dark,2.1);circle(g,30,-66,4,dark);
 const blink=Math.sin(qt*2.2)>.987;if(blink){g.fillStyle=cream;g.fillRect(4,-95,15,15);line([[5,-87],[17,-87]],dark,2);}
 ellipse(4,-55,8,5,'#c57e6255',0.7);line([[14,-47],[22,-50]],dark,1.5);for(let k=0;k<3;k++)line([[28,-59],[48,-65+k*6]],dark,.8);
 shape([[-63,-94],[-59,-109],[-38,-120],[-7,-119],[17,-106],[16,-95]],'#596f65',2.6);hatch(-50,-116,30,13,5);line([[-60,-95],[22,-96]],dark,4);g.restore();
 // Coat, articulated legs and messenger bag with stitched flap.
 shape([[-50,-37],[-13,-41],[12,-5],[6,40],[-51,38],[-62,4]],c.secondary,3.4);hatch(-57,8,17,27,5);line([[-28,-32],[-26,33]],'#a8b2a2',1.5);circle(g,-20,-12,2,cream);circle(g,-21,4,2,cream);
 const leg1=pedal*(1-stop)*16,leg2=-leg1;line([[-34,35],[-22,60+leg1],[17,83+leg1]],dark,11);line([[-7,34],[20,54+leg2],[36,81+leg2]],'#4c5c52',10);line([[9,84+leg1],[27,84+leg1]],dark,7);line([[31,82+leg2],[46,82+leg2]],dark,7);
 shape([[-66,-32],[-30,-28],[-32,17],[-72,17]],'#a66b46',3);shape([[-71,-32],[-32,-30],[-36,-12],[-65,-10]],'#bd8755',2);line([[-50,-12],[-51,7]],'#ead3a2',1.8);line([[-61,-36],[-25,5]],dark,3);hatch(-70,-1,14,15,4);
 const reach=phase===2?smooth(6.7,7.55,t)*(1-smooth(8.1,8.7,t)):0;
 const catching=smooth(3.9,4.5,t)*(1-smooth(5,5.6,t));
 const handX=lerp(64,147,reach)+catching*71,handY=lerp(-14,16,reach)-catching*80;line([[-8,-24],[26,-4],[handX,handY]],c.secondary,12);line([[4,-22],[29,-11],[handX-2,handY-6]],dark,2);ellipse(handX,handY,11,8,cream,2);
 // Scarf has delayed secondary motion, separate from the body.
 shape([[-42,-42],[-6,-43],[-7,-30],[-39,-28]],c.primary,2);shape([[-39,-33],[-76-8*Math.sin(qt),-44],[-99,-28+Math.sin(qt*2)*9],[-65,-20],[-39,-24]],c.primary,2);
 if(phase===2&&t<8.3){const u=smooth(6.7,7.9,t);envelope(lerp(60,147,u),lerp(-26,16,u),.65,-.2+u*.2);}
 if(phase===1&&t>2.9&&t<5.6){const fly=smooth(2.9,4.5,t),returning=smooth(5,5.6,t);envelope(lerp(-45,135,fly)*(1-returning)+64*returning,lerp(-22,-94,fly)-Math.sin(fly*Math.PI)*132+returning*80,.68,Math.sin(fly*Math.PI)*1.7);}
 g.restore();
 if(t>2.8&&t<4.7){for(let i=0;i<4;i++){const x=-500+(t-2.8)*720+i*160;line([[x,140+i*37],[x+140,127+i*37],[x+270,150+i*37]],'#f8ecd080',2);}}
 // Envelope follows the hand, then crosses the slot and disappears inside it.
 if(phase===2&&t>=8.3&&t<8.65){g.save();g.beginPath();g.rect(bx-35,by-50,70,28);g.clip();envelope(bx,by-23-(t-8.3)*45,.65);g.restore();}
 if(t>8.5){const h=smooth(8.5,9,t);line([[bx-37,by-19],[bx+36,by-19]],'#f5d98b',2+h*2);for(let k=0;k<5;k++){const a=k*TAU/5;line([[bx+Math.cos(a)*62,by-20+Math.sin(a)*56],[bx+Math.cos(a)*72,by-20+Math.sin(a)*67]],'#b98541',2);}}
 g.restore();
 // Foreground rain and paper fibres bind the illustration into a printed frame.
 for(let i=0;i<c.count*6;i++){const x=hash(i,c.seed)*W,y=(hash(i+90,c.seed)*H+qt*90)%H;line([[x,y],[x-7,y+26]],'#e8dfbf88',.9);}
 g.save();g.globalCompositeOperation='multiply';g.globalAlpha=.16;if(assets.paper)g.drawImage(assets.paper,0,0,W,H);g.restore();
 text(g,'THE LAST MOON POST / 手绘短片',40,41,13,dark,'left',600);text(g,`SC. 0${phase+1}`,1238,41,12,dark,'right',500);
 const caption=c.words[phase%c.words.length];
 g.fillStyle='#eee5ceee';g.fillRect(0,662,W,58);text(g,t>9.1?c.title:caption,640,699,t>9.1?26:22,dark,'center',phase===2?650:500,1180);
}
