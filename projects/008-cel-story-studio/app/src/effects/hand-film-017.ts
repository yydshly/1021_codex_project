import type {EffectConfig} from '../../scripts/effects.mjs';
import type {EffectAssets} from './canvas';
import {inkStroke,inkLoop} from '../vendor/engine.js';
import {curve} from './engraving-016';
import {clamp,hash,lerp,smooth,text,TAU} from './math';
type P=[number,number];type G=CanvasRenderingContext2D;
const INK='#243f3f',PAPER='#eee5cc',IVORY='#fff8df',GOLD='#e8bb56';
export function twoBone017(shoulder:P,target:P,a=71,b=76,bend=1){const dx=target[0]-shoulder[0],dy=target[1]-shoulder[1],dist=Math.hypot(dx,dy),d=clamp(dist,Math.abs(a-b)+.01,a+b-.01),theta=Math.atan2(dy,dx),off=Math.acos(clamp((a*a+d*d-b*b)/(2*a*d),-1,1))*bend;return {elbow:[shoulder[0]+Math.cos(theta+off)*a,shoulder[1]+Math.sin(theta+off)*a] as P,end:[shoulder[0]+Math.cos(theta)*d,shoulder[1]+Math.sin(theta)*d] as P,error:Math.max(0,dist-(a+b))};}
function toolkit(g:G,c:EffectConfig,t:number){let serial=0;const drawing=Math.floor(t*12)%3;
 const stroke=(p:number[][],col=INK,w=3)=>inkStroke(g,p,{color:col,w,seed:c.seed+drawing*83+serial++*31,amp:.25+c.detail*.65,heavy:.25,t0:3,t1:5});
 const shape=(d:string,fill:string,w=2.8)=>{g.fillStyle=fill;g.fill(new Path2D(d));if(w)inkLoop(g,curve(d).p.filter((_,i)=>i%3===0),{color:INK,w,seed:c.seed+drawing*67+serial++*29,amp:.3+c.detail*.5,heavy:.2});};
 const oval=(x:number,y:number,rx:number,ry:number,col:string,w=0)=>{g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);g.fillStyle=col;g.fill();if(w){g.strokeStyle=INK;g.lineWidth=w;g.stroke();}};
 return {stroke,shape,oval};
}
type Actor={kind:'rabbit'|'bear';x:number;y:number;scale:number;crouch:number;air:number;look:P;left:P;right:P;grip:boolean;walk:number;surprise:number;relief:number};
function actor(g:G,c:EffectConfig,t:number,a:Actor){
 const {stroke,shape,oval}=toolkit(g,c,t),{x,y,scale:sc,kind}=a,bear=kind==='bear',w=bear?70:51,squat=a.crouch*33,qt=Math.floor(t*12)/12;
 const local=(p:P):P=>[(p[0]-x)/sc,(p[1]-y)/sc];
 const hand=(p:P,angle:number,grip:boolean)=>{g.save();g.translate(...p);g.rotate(angle);shape(grip?'M-12 5 Q-19 -7 -9 -15 Q-1 -23 7 -14 Q18 -12 17 1 L14 16 Q-3 23 -12 5 Z':'M-13 11 Q-24 0 -21 -9 Q-18 -16 -11 -8 L-9 -21 Q-2 -29 3 -19 L5 -9 L12 -18 Q22 -22 23 -13 L18 -1 Q31 0 24 12 Q11 26 -3 20 Z',bear?'#c99b61':IVORY,2);if(grip)stroke([[-7,1],[1,-3],[10,2]],INK,1.4);g.restore();};
 const arm=(left:boolean,target:P)=>{const s:P=[left?-w:w,-155+squat],end=local(target),ik=twoBone017(s,end,71,76,left?1:-1);stroke([s,ik.elbow,ik.end],INK,bear?22:18);stroke([s,ik.elbow,ik.end],bear?c.primary:IVORY,bear?16:12);const angle=Math.atan2(ik.end[1]-ik.elbow[1],ik.end[0]-ik.elbow[0])+Math.PI/2;hand(ik.end,angle,a.grip);};
 g.save();g.translate(x,y);g.scale(sc,sc);
 const phase=qt*9,step=Math.sin(phase)*a.walk,air=a.air;
 for(const side of [-1,1]){const sx=side*w*.55,fx=side*(35+air*18)+step*side*24,fy=-Math.max(0,Math.sin(phase+side*Math.PI/2))*a.walk*18-air*(side<0?35:13);const knee:P=[side*(39+air*12),-29+squat*.12];stroke([[sx,-64+squat*.3],knee,[fx,fy-4]],INK,20);stroke([[sx,-64+squat*.3],knee,[fx,fy-4]],bear?'#c99b61':IVORY,13);shape(`M${fx-19} ${fy-10} Q${fx+6} ${fy-16} ${fx+29} ${fy-1} Q${fx+24} ${fy+9} ${fx-22} ${fy+7} Z`,c.secondary,2);}
 arm(true,a.left);
 const body=`M${-w} ${-166+squat} C${-w-19} ${-140+squat} ${-w-19} -72 ${-w-11} -44 Q0 -18 ${w+12} -44 C${w+17} -77 ${w+17} ${-139+squat} ${w} ${-166+squat} Q0 ${-186+squat} ${-w} ${-166+squat} Z`;
 shape(body,bear?c.secondary:c.primary,3.5);stroke([[0,-157+squat],[4,-111+squat*.4],[2,-46]],'#102e3450',1.8);
 shape(`M${-w+8} -98 L-8 -96 L-10 -60 Q${-w+9} -54 ${-w+8} -98 Z`,bear?'#3f625b':'#cf714e',1.4);for(let i=0;i<3;i++)oval(14,-135+squat+i*31,3,3,GOLD);
 const headY=-215+squat,headTilt=(a.surprise*.1-a.relief*.05)+Math.sin(qt*1.7)*.012;g.save();g.translate(0,headY);g.rotate(headTilt);
 if(bear){oval(-60,-45,25,27,'#c99b61',2);oval(59,-45,25,27,'#c99b61',2);oval(-60,-44,13,15,'#a87650');oval(59,-44,13,15,'#a87650');}
 else for(const side of [-1,1]){g.save();g.translate(side*29,-40);g.rotate(side*(.09+a.surprise*.08)+Math.sin(qt*3-side*.4)*(.03+air*.08));shape('M-14 0 C-25 -23 -23 -102 -7 -119 C13 -123 29 -35 14 0 Z',IVORY,2.8);shape('M-5 -14 Q-13 -68 -6 -101 Q10 -71 6 -13 Z','#dfa88b',0);g.restore();}
 shape(bear?'M-65 -39 Q-38 -79 13 -67 Q64 -65 76 -20 Q91 29 50 50 Q6 70 -42 49 Q-83 25 -65 -39 Z':'M-53 -35 Q-28 -69 15 -59 Q54 -57 66 -22 L79 0 Q85 19 65 25 Q46 58 3 58 Q-47 55 -61 22 Q-72 -9 -53 -35 Z',bear?'#c99b61':IVORY,3.3);
 if(bear)oval(27,20,32,25,'#e7c395');
 const look=local(a.look),gx=clamp((look[0]-10)*.025,-5,6),gy=clamp((look[1]-headY)*.025,-5,5),blink=Math.floor(qt*12)%53===41;
 for(const ex of [-18,28]){if(blink||a.relief>.65){stroke([[ex-8,-7],[ex,-13],[ex+8,-7]],INK,2.5);}else{oval(ex,-9,7,10+a.surprise*3,INK);oval(ex+gx*.48-1,-12+gy*.5,2.1,3,IVORY);}}
 stroke([[-30,-30-a.surprise*5],[-17,-34-a.surprise*8],[-9,-31-a.surprise*5]],INK,2);stroke([[18,-33-a.surprise*7],[31,-35-a.surprise*9],[38,-30]],INK,2);
 oval(58,bear?10:12,bear?9:7,bear?6:4.5,INK);if(a.surprise>.6)oval(21,31,6,9,INK);else stroke([[14,30],[25,36+a.relief*2],[37,28]],INK,2);
 oval(-29,15,11,6,c.primary+'70');g.restore();
 // Scarf has its own delayed drawing, rather than rotating with the whole actor.
 const sway=Math.sin(qt*4-1)*7*(.3+a.walk+air)*(.55+c.intensity*.7);shape(`M-44 ${-167+squat} Q-12 ${-151+squat} 42 ${-164+squat} L46 ${-143+squat} Q0 ${-124+squat} -48 ${-146+squat} Z`,bear?GOLD:c.secondary,2);
 shape(`M-33 ${-146+squat} Q-78 ${-133+squat} ${-116-sway} ${-158+squat} L${-126-sway} ${-140+squat} Q-76 ${-111+squat} -20 ${-135+squat} Z`,bear?GOLD:c.secondary,2);
 arm(false,a.right);g.restore();
}
function moon(g:G,c:EffectConfig,t:number){
 const {stroke,shape,oval}=toolkit(g,c,t),qt=Math.floor(t*12)/12,approach=smooth(1.65,3.7,qt),settle=smooth(4.5,5.15,qt),carry=smooth(5.1,6.85,qt),lit=smooth(6.9,7.65,qt),ending=smooth(7.8,8.6,t);
 const x=lerp(lerp(420,625,approach),885,carry),air=Math.sin(smooth(2.9,4.55,qt)*Math.PI),y=613-air*88*(.7+c.intensity*.46)+Math.sin(settle*Math.PI)*4,crouch=Math.sin(smooth(2.1,3.2,qt)*Math.PI)*.65+Math.sin(settle*Math.PI)*.62;
 // Both the loose piece and held piece meet the same world point at contact.
 const free=smooth(.25,3.7,qt),freeX=lerp(1057,665,free),freeY=lerp(124,y-155,free)+Math.sin(free*Math.PI)*50;
 const held:P=[x+40,y-155],placing=smooth(6.25,6.9,qt),heldTarget:P=[lerp(held[0],945,placing),lerp(held[1],441,placing)];
 const light:P=t<3.7?[freeX,freeY]:t<6.9?heldTarget:[945,lerp(441,506,smooth(6.9,7.45,qt))];
 const reach=smooth(1.8,3.65,qt),target:P=[lerp(x+80,light[0],reach),lerp(y-73,light[1]+15,reach)],release=smooth(6.88,7.4,qt),right:P=[lerp(target[0]+9,x+72,release),lerp(target[1]+1,y-73,release)],left:P=[lerp(target[0]-12,x-70,release),lerp(target[1]+11,y-68,release)];
 // Move closer for the contact, then return to the lantern and final title.
 const close=smooth(2.1,3.25,t)*(1-smooth(4.5,5.3,t)),zoom=1+close*.22;
 g.save();g.translate(640-lerp(640,650,close)*zoom,360-lerp(360,416,close)*zoom);g.scale(zoom,zoom);
 g.fillStyle=PAPER;g.fillRect(0,0,1280,720);shape('M635 -80 Q1160 -180 1400 288 L1370 740 Q1075 705 734 648 Q542 391 635 -80 Z',c.secondary,0);
 oval(1055,130,73,73,GOLD);g.save();g.translate(1057,124);g.rotate(-.25);shape('M-22 -8 Q8 -31 25 2 Q8 7 -4 26 Q-1 0 -22 -8 Z',c.secondary,0);g.restore();
 for(let i=0;i<28+c.count;i++){const sx=694+hash(i,c.seed)*570,sy=58+hash(i+70,c.seed)*510;oval(sx,sy,hash(i+30,c.seed)*1.5+.8,1.1,IVORY+'a0');}
 for(let i=0;i<4;i++){const bx=78+i*260;shape(`M${bx} 659 L${bx} ${571-i%2*29} L${bx+107} ${542-i%2*29} L${bx+183} ${574-i%2*29} L${bx+183} 670 Z`,i%2?'#8e9d8c':'#bcc2a3',0);}
 shape('M-40 630 Q395 593 781 620 Q1060 629 1340 593 L1380 800 L-80 800 Z','#c3c5a4',0);stroke([[0,637],[356,615],[681,630]],'#61766b80',1.4);
 oval(x,621,61*(1-air*.45),6,INK+'20');
 // Lantern is constructed before the action, so placing has a stable destination.
 g.save();g.translate(945,507);const glow=g.createRadialGradient(0,0,0,0,0,173);glow.addColorStop(0,`rgba(255,211,100,${lit*.7})`);glow.addColorStop(1,'#ffdf7b00');g.fillStyle=glow;g.fillRect(-180,-190,360,380);
 shape('M-40 -66 Q0 -85 40 -66 L53 56 Q0 84 -53 56 Z',lit>.01?'#eed29a':'#b7bba5',2.8);stroke([[-21,-68],[-28,-107],[0,-123],[28,-107],[21,-68]],INK,3);stroke([[-35,-63],[-39,54],[0,64],[39,54],[35,-63]],INK,2);stroke([[0,-65],[0,59]],'#8e764a',2);shape('M-56 59 Q0 79 56 59 L47 80 Q0 96 -47 80 Z',c.secondary,2);g.restore();
 const walking=(t>1.9&&t<2.9?.6:0)+(t>5.15&&t<6.65?.55:0);
 actor(g,c,qt,{kind:'rabbit',x,y,scale:1,crouch,air,look:light,left,right,grip:t>3.7&&t<7.05,walk:walking,surprise:1-smooth(3.7,5.2,t),relief:lit});
 if(t<7.5){g.save();g.translate(...light);g.rotate(-.25+Math.sin(qt*3)*.13*(1-carry));g.shadowColor='#fbe5a1';g.shadowBlur=14;shape('M-22 -8 Q8 -31 25 2 Q8 7 -4 26 Q-1 0 -22 -8 Z',GOLD,2.1);g.restore();}
 if(t>6.9){g.save();g.globalAlpha=lit;stroke([[944,503],[1000,387],[1090,316]],GOLD,2);oval(1090,306,28,28,GOLD);oval(1100,296,26,27,c.secondary);g.restore();}
 if(t>3.05&&t<3.3){for(let i=0;i<3;i++)stroke([[x-110,530+i*17],[x-85,522+i*17],[x-55,531+i*17]],c.primary,6-i);}
 g.restore();
 if(ending>0){g.save();g.globalAlpha=ending;text(g,c.title,57,203,58,INK,'left',800,680);text(g,c.subtitle,61,252,23,INK,'left',500,680);stroke([[62,284],[282,284]],c.primary,4);text(g,'A LITTLE LIGHT. HELD WITH BOTH HANDS.',64,315,12,INK,'left',550,650);g.restore();}
 else{const phase=t<3.7?0:t<6.7?1:2;text(g,`0${phase+1} / ${c.words[phase]||['发现','接住','点亮'][phase]}`,57,96,21,INK,'left',600,600);}
}
function shelter(g:G,c:EffectConfig,t:number){
 const {stroke,shape,oval}=toolkit(g,c,t),qt=Math.floor(t*12)/12,lift=smooth(2.5,4.5,qt),toward=smooth(4.7,6.8,qt),ending=smooth(7.6,8.55,t),x=lerp(lerp(470,640,smooth(.8,2.4,qt)),690,toward),y=614,crouch=Math.sin(smooth(1.6,3.1,qt)*Math.PI)*1.2;
 const handle:P=[lerp(760,850,lift),lerp(575,455,lift)],angle=lerp(1.3,-.02,lift)+toward*(.07+c.intensity*.08),flat=lerp(.12,1,lift),reach=smooth(1.7,2.5,qt),hand:P=[lerp(x+79,handle[0],reach),lerp(y-73,handle[1],reach)];
 const close=smooth(1.85,2.8,t)*(1-smooth(4.4,5.15,t)),zoom=1+close*.16;
 g.save();g.translate(640-lerp(640,760,close)*zoom,360-lerp(360,441,close)*zoom);g.scale(zoom,zoom);
 g.fillStyle=PAPER;g.fillRect(0,0,1280,720);shape('M-30 373 Q211 184 583 295 Q1015 134 1370 316 L1340 709 L-40 708 Z','#acbfb4',0);shape('M-50 532 Q398 402 698 516 Q1080 426 1370 495 L1380 775 L-70 779 Z','#748f82',0);shape('M-50 631 Q340 595 657 623 Q1040 583 1340 630 L1340 790 L-50 790 Z','#b6bca0',0);
 // Rain stops at the umbrella canopy rather than continuing through the sheltered bird.
 const cover=smooth(4.1,4.8,t);for(let i=0;i<70+c.count*3;i++){const xx=hash(i,c.seed)*1390-60,yy=(hash(i+120,c.seed)*850+qt*(230+hash(i+80,c.seed)*80))%850-90;if(cover>.5&&xx>710&&xx<1100&&yy>335&&yy<600)continue;stroke([[xx,yy],[xx-9,yy+28]],'#315b5b68',1.3);}
 const birdX=lerp(1040,956,toward),birdY=535-Math.sin(toward*Math.PI)*30;
 const bird=()=>{g.save();g.translate(birdX,birdY);g.rotate((1-cover)*.08*Math.sin(qt*18));shape('M-25 7 Q-42 -25 -15 -44 Q12 -61 34 -34 L41 -10 L58 -2 L39 6 Q19 39 -11 29 L-34 34 Z',IVORY,2);shape('M-21 -9 Q4 -23 17 1 Q3 15 -16 14 Z',c.primary,1.5);oval(23,-20,3.2,3.2,INK);stroke([[-9,28],[-11,48],[-23,49]],INK,2);stroke([[15,27],[19,47],[31,47]],INK,2);g.restore();};
 bird();actor(g,c,qt,{kind:'bear',x,y,scale:1.07,crouch,air:0,look:[birdX,birdY-20],left:[x-98,y-68],right:hand,grip:t>2.5,walk:t>1.7&&t<4.7?.45:0,surprise:1-cover,relief:toward});
 // Stem/hand anchor is shared through pickup, lifting and final tilt.
 g.save();g.translate(...handle);g.scale(1,flat);g.rotate(angle);
 stroke([[0,0],[27,-100],[64,-193]],INK,7);stroke([[0,0],[27,-100],[64,-193]],'#adc183',3);
 g.translate(0,-40);
 shape('M64 -155 C-37 -233 -155 -195 -170 -105 C-125 -122 -122 -76 -82 -107 C-66 -69 -37 -86 -10 -113 C15 -75 55 -85 70 -112 C113 -78 147 -93 158 -118 C201 -85 238 -117 264 -132 C238 -219 130 -248 64 -155 Z','#527866',3.2);
 stroke([[-166,-109],[-41,-137],[65,-154],[261,-135]],'#c1cd9c',2.3);for(let i=0;i<7;i++){const xx=-120+i*53;stroke([[xx,-128],[xx+14,-164],[xx+12,-190]],'#c1cd9c',1.3);}
 g.restore();
 if(t>4.2){for(const side of [-1,1]){const drop=(qt*1.7+.3)%1;oval(900+side*208,314+drop*190,2.3,6,'#e2e7cf');}}
 g.restore();
 if(ending>0){g.save();g.globalAlpha=ending;text(g,c.title,57,196,66,INK,'left',800,610);text(g,c.subtitle,61,245,25,INK,'left',500,610);stroke([[62,278],[246,278]],c.primary,4);text(g,'BEFORE THE RAIN ENDS, MAKE ROOM.',64,311,12,INK,'left',550);g.restore();}
 else{const phase=t<2.7?0:t<5?1:2;text(g,`0${phase+1} / ${c.words[phase]||['看见','举起','靠近'][phase]}`,57,94,21,INK,'left',600);}
}
export function handFilm017(g:G,c:EffectConfig,t:number,assets:EffectAssets){g.save();if(c.storyId==='shelter')shelter(g,c,t);else moon(g,c,t);g.save();g.globalCompositeOperation='multiply';if(assets.paper){g.globalAlpha=.15;g.drawImage(assets.paper,0,0,1280,720);}g.globalAlpha=1;for(let i=0;i<1600+c.detail*1500;i++){g.fillStyle=i%2?'#2039360a':'#fff9d311';g.fillRect(hash(i,c.seed)*1280,hash(i+1600,c.seed)*720,1.2,1);}g.restore();text(g,'纸间 / 逐帧手作',35,36,12,INK,'left',550);text(g,'HOLD SOMETHING GENTLY / 017',1245,36,11,c.storyId==='shelter'?INK:IVORY,'right',450);g.restore();}
