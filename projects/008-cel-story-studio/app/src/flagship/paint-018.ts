import type {FlagshipConfig} from '../../scripts/flagship-schema.mjs';
import {drawFox018,drawWhale018,drawBrush018,type Point018} from './actors-018';
import {clamp018 as clamp,mix018 as mix,ease018 as ease,cue018,phases018,inkTip018,whaleJourney018} from './performance-018';
export type Assets018={workshop:HTMLImageElement;ocean:HTMLImageElement;paper:HTMLImageElement};
type G=CanvasRenderingContext2D;
const tau=Math.PI*2;
function ellipse(g:G,x:number,y:number,rx:number,ry:number,c:string){g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,tau);g.fillStyle=c;g.fill();}
function polygon(g:G,p:Point018[]){g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();}
function ink(g:G,p:number,t:number,width=5){
 g.beginPath();for(let i=0;i<=90;i++){const a=inkTip018(p*i/90);i?g.lineTo(...a):g.moveTo(...a);}g.lineCap='round';g.lineJoin='round';g.lineWidth=width;g.strokeStyle='#234e62';g.stroke();
 if(p>0){g.save();g.globalAlpha=.25;g.lineWidth=width+3;g.stroke();g.restore();}
}
function seaLines(g:G,t:number,opening:number,night:boolean){
 g.save();g.globalAlpha=.25*opening;g.strokeStyle=night?'#c2d5e9':'#f7e5bd';g.lineCap='round';
 for(let j=0;j<22;j++){g.beginPath();const y=385+j*15,x0=(j*217.3)%1190-100,len=70+(j%5)*37;for(let x=x0;x<x0+len;x+=8){const yy=y+Math.sin(x*.015+t*.8+j*.6)*(3+j*.17);x===x0?g.moveTo(x,yy):g.lineTo(x,yy);}g.lineWidth=j%3===0?1.7:.7;g.stroke();}g.restore();
}
function stars(g:G,t:number,a:number){
 g.save();g.globalAlpha=a;const shade=g.createLinearGradient(0,0,0,720);shade.addColorStop(0,'#142641dd');shade.addColorStop(.65,'#243e6655');shade.addColorStop(1,'#102e5144');g.fillStyle=shade;g.fillRect(0,0,1280,720);
 for(let i=0;i<50;i++){const x=(i*197.33+73)%1280,y=35+(i*91.7)%295,r=i%7===0?2:1;ellipse(g,x,y,r,r,`rgba(255,237,184,${.4+.4*Math.sin(t*1.4+i)})`);if(i%7===0){g.strokeStyle='#ffe6a7';g.lineWidth=1;g.beginPath();g.moveTo(x-5,y);g.lineTo(x+5,y);g.moveTo(x,y-5);g.lineTo(x,y+5);g.stroke();}}
 for(let i=0;i<10;i++)ellipse(g,780+Math.sin(i*2.4+t*.24)*90,460+i*17,4+i*.8,.8,'#e9d3a766');g.restore();
}
/** World coordinates are shared by character, brush contact, growing stroke and whale trajectory. */
export function paintFlagship018(g:G,c:FlagshipConfig,t:number,a:Assets018){
 const cue=cue018(c,t),phase=phases018(c,t),p=cue.progress,qt=Math.floor(t*12)/12;
 const joy=cue.shot.emotion==='joyful'?1:cue.shot.emotion==='hesitant'?.2:.6;
 const travel=whaleJourney018(phase.leap,joy),opening=travel.portal;
 const night=c.ending==='starlight',total=c.shots.reduce((n,s)=>n+s.seconds,0);
 const late=ease((phase.farewell-.36)/.35),event=cue.shot.event;
 g.save();g.scale(1.5,1.5);g.clearRect(0,0,1280,720);g.fillStyle='#eee3c9';g.fillRect(0,0,1280,720);
 // Each framing is a real camera crop around the event, not a cosmetic label.
 const focus:Record<string,Point018>={notice:[797,455],draw:[821,534],unfold:[876,544],leap:[803,451],farewell:[694,407]};
 const [fx,fy]=focus[event],worldZoom=cue.shot.framing==='close'?1.22:cue.shot.framing==='medium'?1.07:1;
 const zoom=(cue.shot.framing==='close'?1.34:cue.shot.framing==='medium'?1.1:1)*(1-opening)+worldZoom*opening;
 const cx=clamp(mix(fx,event==='farewell'?965:900,opening),640/zoom,1280-640/zoom),cy=clamp(mix(fy,405,opening),360/zoom,720-360/zoom);
 g.translate(640,360);g.scale(zoom,zoom);g.translate(-cx,-cy);
 g.drawImage(a.workshop,0,0,1280,720);
 const corners:Point018[]=[[725,466],[1150,469],[1128,599],[660,578]];
 const bounds:Point018[]=[[-80,-60],[1360,-60],[1360,780],[-80,780]];
 const paper=corners.map((q,i)=>[mix(q[0],bounds[i][0],opening),mix(q[1],bounds[i][1],opening)] as Point018);
 g.save();g.shadowColor='#392f284f';g.shadowBlur=14;g.shadowOffsetY=7;polygon(g,paper);g.fillStyle='#f8eed9';g.fill();g.restore();
 g.save();polygon(g,paper);g.clip();g.globalAlpha=.22;g.drawImage(a.paper,400,350,900,500);g.restore();
 const wash=ease(phase.unfold),wet=ease((phase.unfold-.14)/.8);
 if(wash>0||opening>0){
  g.save();polygon(g,paper);g.clip();
  // Ink visibly opens outward from the end of the painted line.
  g.beginPath();const rx=Math.max(1,mix(14,570,wash)+opening*1000),ry=Math.max(1,mix(4,160,wash)+opening*800);
  for(let i=0;i<=120;i++){const ang=i/120*tau,r=1+Math.sin(ang*17)*.035+Math.sin(ang*31+.4)*.018;const x=946+Math.cos(ang)*rx*r,y=526+Math.sin(ang)*ry*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.clip();
  g.globalAlpha=mix(.35,1,wet);g.drawImage(a.ocean,mix(670,0,opening),mix(460,0,opening),mix(495,1280,opening),mix(140,720,opening));
  seaLines(g,t,wet,night);if(night)stars(g,t,wet*.9);g.restore();
 }
 if(phase.draw>0&&opening<.45){g.save();g.globalAlpha=(1-ease(opening/.45))*(1-ease(wash));ink(g,phase.draw,t,4.8);g.restore();}
 // Ceramic ink dish: back rim, character, front lip, with a coherent release point.
 const bowlAlpha=1-ease(opening/.22);
 g.save();g.globalAlpha=bowlAlpha;ellipse(g,890,482,102,23,'#3f3b3540');
 g.fillStyle='#c7b38c';g.beginPath();g.moveTo(797,463);g.bezierCurveTo(804,525,978,525,983,463);g.closePath();g.fill();
 ellipse(g,890,463,96,28,'#f2e3c1');ellipse(g,890,461,83,20,'#264851');ellipse(g,880,457,63,10,'#50747766');g.restore();
 const foxX=mix(643+ease(phase.draw)*82,235,opening),foxY=mix(585,707,opening),foxScale=mix(1,.69,opening);
 const tip=inkTip018(phase.draw),lift=ease(phase.unfold)*45;
 const prepare=ease((phase.notice-.6)/.4);
 const grip:Point018=event==='notice'?[mix(foxX+99,681,prepare),mix(foxY-120,496,prepare)]:[tip[0]-102,tip[1]-55-lift];
 const finalHand:Point018=[foxX+72,foxY-73];
 const baseFoxX=643+ease(phase.draw)*82;
 const hand:Point018=[foxX+mix(grip[0]-baseFoxX,72,opening),foxY+mix(grip[1]-585,-73,opening)];
 const brushTip:Point018=[foxX+mix(tip[0]-baseFoxX,100,opening),foxY+mix(tip[1]-lift-585,15,opening)];
 if(event==='notice'){brushTip[0]=mix(grip[0]+72,783,prepare);brushTip[1]=mix(grip[1]+95,551,prepare);}
 // A small curled page edge remains as the fox's physical place in the opened world.
 if(opening>.01){g.save();g.globalAlpha=ease(opening/.3);g.fillStyle='#f5e6c6';g.beginPath();g.moveTo(-100,780);g.lineTo(-100,foxY-80);g.bezierCurveTo(foxX-60,foxY-74,foxX+60,foxY-22,foxX+140,780);g.closePath();g.fill();g.strokeStyle='#c9b894';g.lineWidth=2;g.stroke();g.restore();}
 const gaze:Point018=event==='draw'?tip:[travel.x,travel.y];
 ellipse(g,foxX,foxY+4,foxScale*55,foxScale*7,'#2a3f3633');
 drawFox018(g,{x:foxX,y:foxY,scale:foxScale,facing:1,crouch:event==='draw'?.22:event==='notice'?.12:0,headTilt:event==='notice'?-.08:event==='draw'?.13:Math.sin(qt*1.3)*.025,gaze,hand,emotion:cue.shot.emotion,wave:phase.farewell>.05?ease(phase.farewell/.2):0,gait:event==='draw'?.15:0},t,c.accent);
 drawBrush018(g,hand,brushTip);
 const whaleX=phase.farewell>0?1040+ease(phase.farewell)*75:travel.x;
 const whaleY=phase.farewell>0?402-ease(phase.farewell)*43:travel.y;
 const whaleScale=mix(travel.scale,.5,ease(phase.farewell));
 drawWhale018(g,{x:whaleX,y:whaleY+Math.sin(qt*2.7)*2,scale:whaleScale,rotation:travel.rotation+Math.sin(qt*1.3)*.018,tail:Math.sin(qt*(cue.shot.emotion==='hesitant'?3:5.5)),fin:Math.sin(qt*3.4),emotion:cue.shot.emotion,gaze:event==='farewell'?[foxX,foxY-180]:[whaleX+100,whaleY-10]},t,c.accent);
 if(phase.leap<.14){g.save();g.globalAlpha=bowlAlpha;g.strokeStyle='#e9d8b4';g.lineWidth=9;g.beginPath();g.ellipse(890,463,92,24,0,0,Math.PI);g.stroke();g.strokeStyle='#a5937466';g.lineWidth=2;g.beginPath();g.ellipse(890,466,95,27,0,.05,Math.PI-.05);g.stroke();g.restore();}
 if(phase.leap>0&&phase.leap<.6){g.save();g.globalAlpha=Math.sin(clamp(phase.leap/.6)*Math.PI);for(let i=0;i<6;i++){const ang=-Math.PI*.9+i*.38;ellipse(g,890+Math.cos(ang)*(28+phase.leap*65),465+Math.sin(ang)*(18+phase.leap*95),2,3,'#bfdbe4');}g.restore();}
 if(opening>.25){
  const immersion=ease((opening-.25)/.65),waterY=whaleY+whaleScale*43;
  g.save();g.globalAlpha=immersion;g.beginPath();g.moveTo(whaleX-whaleScale*222,waterY);
  g.bezierCurveTo(whaleX-90,waterY-9+Math.sin(t*2)*4,whaleX+68,waterY+12,whaleX+whaleScale*210,waterY-2);
  g.lineTo(whaleX+whaleScale*210,waterY+110);g.lineTo(whaleX-whaleScale*222,waterY+110);g.closePath();g.clip();
  g.drawImage(a.ocean,mix(670,0,opening),mix(460,0,opening),mix(495,1280,opening),mix(140,720,opening));seaLines(g,t,wet,night);if(night)stars(g,t,wet*.9);g.restore();
  g.save();g.globalAlpha=immersion*.7;g.strokeStyle='#e6ead3';g.lineWidth=1.8;g.beginPath();g.moveTo(whaleX-150*travel.scale,waterY+3);g.bezierCurveTo(whaleX-45,waterY+9,whaleX+80,waterY-9,whaleX+185*travel.scale,waterY);g.stroke();g.restore();
 }
 // Fine paper fibers unify procedurally drawn actors with the painted environment.
 g.save();g.globalAlpha=.075;g.globalCompositeOperation='multiply';g.drawImage(a.paper,0,0,1280,720);g.restore();
 g.restore();
 if(late>0){g.save();g.scale(1.5,1.5);g.globalAlpha=late;g.textAlign='center';g.fillStyle='#fff0d1';g.shadowColor='#122f4c88';g.shadowBlur=15;g.font='600 44px "Noto Sans SC"';g.fillText(c.title,640,184);g.shadowBlur=0;g.font='400 14px "Noto Sans SC"';g.fillStyle='#f1e3c4';g.fillText(`${c.heroName} × ${c.companionName}`,640,216);g.restore();}
 if(cue.shot.caption){const fade=Math.min(ease(p/.12),ease((1-p)/.13));g.save();g.scale(1.5,1.5);g.globalAlpha=fade;g.font='400 23px "Noto Sans SC"';g.textAlign='center';g.shadowColor='#173a43';g.shadowBlur=12;g.fillStyle='#fff4df';g.fillText(cue.shot.caption,640,680);g.restore();}
 // Short fades provide proper opening and closing handles.
 const fade=Math.max(1-ease(t/.35),ease((t-total+.45)/.45));if(fade>0){g.fillStyle=`rgba(23,40,41,${fade})`;g.fillRect(0,0,1920,1080);}
}
