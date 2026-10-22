import type {VectorShape,WorldCharacter,StoryProps,Emotion} from './model';
import {compileWorld,worldPose,objectsAt} from '../scripts/world-runtime.mjs';
import {getStyle,type StyleId} from '../scripts/styles.mjs';
import {fillShape,inkLoop,inkStroke} from './vendor/engine.js';

type C=CanvasRenderingContext2D;
const TAU=Math.PI*2;
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const dark=(color:string,k=.7)=>color==='none'?color:'#'+color.slice(1).match(/../g)!.map(s=>Math.round(parseInt(s,16)*k).toString(16).padStart(2,'0')).join('');
function points(s:VectorShape):number[][]{
  if(s.kind==='ellipse')return Array.from({length:32},(_,i)=>[s.x+Math.cos(i/32*TAU)*s.w/2,s.y+Math.sin(i/32*TAU)*s.h/2]);
  if(s.kind==='rect')return [[s.x,s.y],[s.x+s.w,s.y],[s.x+s.w,s.y+s.h],[s.x,s.y+s.h]];
  return s.points.map(p=>[p.x+s.x,p.y+s.y]);
}
function makePath(c:C,s:VectorShape,frame:number,style:StyleId){
  const pts=points(s);c.beginPath();
  pts.forEach(([xx,yy],i)=>{
    const x=xx+(style==='morph'?Math.sin(i*.8+frame*.08)*2:0),y=yy+(style==='liquid'?Math.sin(i*.5+frame*.1)*2:0);
    if(i)c.lineTo(x,y);else c.moveTo(x,y);
  });if(s.kind!=='line')c.closePath();
}
export function drawWorldShape(c:C,s:VectorShape,style:StyleId,frame:number,boil=1,seed=0){
  const outline=style==='line-art'||style==='hud',ink=style==='hud'?'#8de5e2':style==='synthwave'?'#f6c9fa':s.stroke==='none'?'#353232':s.stroke;
  c.save();c.lineJoin='round';c.lineCap='round';
  if(style==='cel-boil'){
    const pts=points(s),options={seed:seed+Math.floor(frame/2)%4,amp:boil*.7,w:s.kind==='line'?3:2.5,color:ink,jit:.18};
    if(s.kind!=='line'&&s.fill!=='none')fillShape(c,pts,s.fill,{seed:options.seed,amp:boil*.55});
    if(s.kind==='line')inkStroke(c,pts,options);else inkLoop(c,pts,options);
  }else{
    if(style==='paperclip'&&s.part==='body'){
      makePath(c,s,frame,style);c.strokeStyle='#fffdf7';c.lineWidth=12;c.shadowColor='#27211833';c.shadowBlur=7;c.stroke();c.shadowBlur=0;
    }
    if(style==='isometric'&&s.fill!=='none'){
      c.save();c.translate(6,5);makePath(c,s,frame,style);c.fillStyle=dark(s.fill,.65);c.fill();c.restore();
    }
    makePath(c,s,frame,style);
    if(!outline&&s.fill!=='none'&&s.kind!=='line'){
      if(style==='3d-render'||style==='aurora-glass'){
        const g=c.createLinearGradient(s.x-s.w/2,s.y-s.h/2,s.x+s.w/2+5,s.y+s.h/2+5);
        g.addColorStop(0,style==='aurora-glass'?'#ffffffa0':s.fill);g.addColorStop(1,style==='aurora-glass'?s.fill+'b0':dark(s.fill,.6));c.fillStyle=g;
      }else c.fillStyle=s.fill;
      if(style==='synthwave'){c.shadowColor=s.fill;c.shadowBlur=10;}
      c.fill();c.shadowBlur=0;
    }
    if(outline||s.stroke!=='none'||style==='synthwave'||s.kind==='line'){
      c.strokeStyle=ink;c.lineWidth=outline?2.4:s.kind==='line'?3:1.7;c.stroke();
    }
  }
  c.restore();
}
function text(c:C,value:string,x:number,y:number,size:number,color:string,align:CanvasTextAlign='left',weight=650,max=1160){c.font=`${weight} ${size}px "StorySans",sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(value,x,y,max);}
function stroke(c:C,pts:number[][],color:string,w=3){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();}
function drawFace(c:C,character:WorldCharacter,emotion:Emotion,action:string,t:number,ink:string){
  const f=character.face;c.save();c.translate(f.x,f.y);c.scale(f.size/42,f.size/42);
  for(const x of [-13,13]){
    if(emotion==='happy'||action==='sleep')stroke(c,[[x-5,-5],[x,-8],[x+5,-5]],ink,3);
    else if(emotion==='sad')stroke(c,[[x-5,-8],[x,-4],[x+5,-8]],ink,3);
    else{c.fillStyle=ink;c.beginPath();c.ellipse(x+(emotion==='curious'?2:0),-6,2.8,emotion==='afraid'?6:4,0,0,TAU);c.fill();}
    const d=emotion==='determined'?(x<0?3:-3):emotion==='afraid'?(x<0?-3:3):0;
    stroke(c,[[x-6,-17-d],[x+6,-17+d]],ink,2);
  }
  if(action==='talk'||emotion==='afraid'){
    c.beginPath();c.ellipse(0,9,4,action==='talk'?3+Math.abs(Math.sin(t*24))*6:7,0,0,TAU);c.strokeStyle=ink;c.lineWidth=2;c.stroke();
  }else stroke(c,[[-6,8],[0,emotion==='happy'?13:emotion==='sad'?4:8],[6,8]],ink,2.5);
  c.restore();
}
function drawActor(c:C,ch:WorldCharacter,cue:NonNullable<StoryProps['shots'][number]['cast']>[number],p:ReturnType<typeof worldPose>,style:StyleId,frame:number,boil:number){
  c.save();c.translate(p.x,p.y);c.rotate(p.rotation);c.scale(ch.scale*p.sx*p.direction,ch.scale*p.sy);
  for(let i=0;i<ch.shapes.length;i++){
    const s=ch.shapes[i];c.save();
    let px=0,py=0,a=0;
    if(s.part==='armL'){px=-38;py=-90;a=-p.stride*.35+p.arms*.7+p.armL;}
    if(s.part==='armR'){px=38;py=-90;a=p.stride*.35-p.arms*.9+p.armR;}
    if(s.part==='head'){px=ch.face.x;py=ch.face.y;a=p.head;}
    if(s.part==='legL'){px=-20;py=-25;a=p.stride*.25;}
    if(s.part==='legR'){px=20;py=-25;a=-p.stride*.25;}
    c.translate(px,py);c.rotate(a);c.translate(-px,-py);
    drawWorldShape(c,s,style,frame,boil,i*7);c.restore();
  }
  c.save();c.translate(ch.face.x,ch.face.y);c.rotate(p.head);c.translate(-ch.face.x,-ch.face.y);drawFace(c,ch,cue.emotion,cue.action,p.t,style==='hud'?'#b9faf0':style==='synthwave'?'#fff2fb':'#303336');c.restore();
  c.restore();
}
function styleBackdrop(c:C,style:StyleId,frame:number,sky:string,ground:string,groundY:number){
  const darkStyle=style==='hud'||style==='synthwave';
  c.fillStyle=darkStyle?style==='hud'?'#0b202b':'#251637':sky;c.fillRect(0,120,1280,500);
  if(['aurora-glass','liquid','3d-render'].includes(style))for(let j=0;j<4;j++){
    const x=150+j*330+Math.sin(frame*.01+j)*40,y=280+Math.cos(frame*.016+j)*70,g=c.createRadialGradient(x,y,3,x,y,230);
    g.addColorStop(0,['#d7b7e870','#9fdbe380','#f6cc9c80','#9fb4ee70'][j]);g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(x-230,y-230,460,460);
  }
  if(['hud','paperclip','bauhaus'].includes(style)){
    c.save();c.globalAlpha=.2;for(let x=0;x<1280;x+=style==='bauhaus'?120:36)stroke(c,[[x,135],[x,610]],darkStyle?'#6ee8dc':'#80958b',1);
    for(let y=135;y<610;y+=style==='bauhaus'?120:36)stroke(c,[[0,y],[1280,y]],darkStyle?'#6ee8dc':'#80958b',1);c.restore();
  }
  c.fillStyle=darkStyle?style==='hud'?'#133541':'#27123d':ground;c.fillRect(0,groundY,1280,620-groundY);stroke(c,[[0,groundY],[1280,groundY]],darkStyle?'#83aebb':'#79796770',1.7);
  if(style==='synthwave')for(let j=-6;j<=6;j++)stroke(c,[[640+j*30,groundY],[640+j*200,620]],'#ad64c5',1);
}
let pixelCanvas:HTMLCanvasElement|undefined;
export function paintWorld(c:C,frame:number,p:StoryProps,texture:HTMLImageElement){
  const world=p.world;if(!world)return;
  const timeline=compileWorld(p.shots,world),index=Math.max(0,timeline.findIndex(s=>frame<s.to)),shot=timeline[index];
  const style=p.style,t=Math.max(0,Math.min(1,(frame-shot.from)/(shot.durationFrames-1))),scene=shot.scene;
  const draw=(q:C)=>{
    q.save();q.beginPath();q.rect(0,125,1280,490);q.clip();styleBackdrop(q,style,frame,scene.sky,scene.ground,scene.groundY);
    const zoom=shot.framing==='close'?1.3:shot.framing==='medium'?1.12:1;
    const center=shot.cast.reduce((n,a)=>n+worldPose(a,t,frame).x,0)/Math.max(1,shot.cast.length);
    q.translate(640-center*zoom,385*(1-zoom));q.scale(zoom,zoom);
    // Keep wide shots in scene coordinates; medium shots follow the cast.
    if(zoom===1)q.translate(center-640,0);
    for(let j=0;j<scene.shapes.length;j++)drawWorldShape(q,scene.shapes[j],style,frame,p.boil,j*13);
    if(style==='cel-boil'||style==='collage'){
      q.save();q.globalAlpha=style==='cel-boil'?.15:.28;q.globalCompositeOperation='multiply';q.drawImage(texture,0,125,1280,490);q.restore();
    }
    const objectStates=objectsAt(shot,t,frame);
    const renderObject=(id:string)=>{
      const state=objectStates[id],asset=world.objects.find(o=>o.id===id);if(!state||!asset)return;
      if(state.holder&&!shot.cast.some(a=>a.characterId===state.holder)||!state.holder&&state.sceneId!==scene.id)return;
      q.save();q.translate(state.x,state.y);const holder=shot.cast.find(a=>a.characterId===state.holder);if(holder)q.rotate(worldPose(holder,t,frame).propRotation);q.scale(1,state.growth||1);for(let j=0;j<asset.shapes.length;j++)drawWorldShape(q,asset.shapes[j],style,frame,p.boil,200+j*7);q.restore();
    };
    for(const id of Object.keys(objectStates))if(!objectStates[id].holder)renderObject(id);
    for(const cue of [...shot.cast].sort((a,b)=>a.to.y-b.to.y)){
      const character=world.characters.find(a=>a.id===cue.characterId);if(!character)continue;
      const pose=worldPose(cue,t,frame);
      q.save();q.globalAlpha=.1;q.fillStyle='#243532';q.beginPath();q.ellipse(pose.x,cue.to.y,45*character.scale,7,0,0,TAU);q.fill();q.restore();
      drawActor(q,character,cue,pose,style,frame,p.boil);
      const state=objectStates[cue.propId];
      if(state&&['pickup','place','give','push'].includes(cue.action)&&Math.abs(state.x-pose.x)<210){
        stroke(q,[[pose.x+pose.direction*30,pose.y-100],[mix(pose.x+pose.direction*40,state.x,.9),mix(pose.y-90,state.y-15,.9)]],style==='hud'?'#98e6d7':'#45423d',6);
      }
      if(cue.action==='talk'){
        q.fillStyle=style==='hud'?'#cee8e3':'#fffcf0';q.beginPath();q.ellipse(pose.x+70,pose.y-175,40,24,0,0,TAU);q.fill();text(q,'···',pose.x+70,pose.y-171,26,'#54564d','center');
      }
      if(cue.action==='celebrate')for(let j=0;j<7;j++){
        const a=j*TAU/7+frame*.02,r=45+t*35;q.fillStyle=j%2?'#f3c74f':'#ed8672';q.fillRect(pose.x+Math.cos(a)*r,pose.y-110+Math.sin(a)*r,5,7);
      }
      const effect=cue.effect,target=effect&&objectStates[effect.targetId];
      if(cue.action==='perform'&&effect&&effect.kind!=='none'&&target){
        const source=objectStates[cue.propId]||{x:pose.x+60,y:pose.y-70};
        const asset=world.objects.find(o=>o.id===cue.propId),spout=asset?.shapes.flatMap(points).reduce((a,b)=>b[0]>a[0]?b:a,[0,-30])||[0,-30];
        const cos=Math.cos(pose.propRotation),sin=Math.sin(pose.propRotation),originX=source.x+spout[0]*cos-spout[1]*sin,originY=source.y+spout[0]*sin+spout[1]*cos;
        for(let j=0;j<22;j++){
          const u=((frame*.035+j/22)%1),ex=mix(originX,target.x,u),ey=mix(originY,target.y-42,u)+Math.sin(u*Math.PI)*10;
          q.save();q.globalAlpha=Math.sin(t*Math.PI)*.9;q.fillStyle=effect.kind==='water'?'#318fbd':effect.kind==='steam'?'#ffffff':'#efc85a';q.beginPath();q.ellipse(effect.kind==='water'?ex:target.x+Math.sin(j*3+frame*.04)*45,effect.kind==='water'?ey:target.y-40-u*120,effect.kind==='water'?2.5:4,effect.kind==='water'?5:4,0,0,TAU);q.fill();q.restore();
        }
      }
      if(style==='hud'){q.strokeStyle='#8be3d8';q.lineWidth=1;q.strokeRect(pose.x-70,pose.y-200,140,210);text(q,character.name,pose.x,pose.y-209,12,'#96e5dc','center');}
    }
    for(const id of Object.keys(objectStates))if(objectStates[id].holder)renderObject(id);
    q.restore();
    if(style==='synthwave'){q.save();q.globalAlpha=.05;for(let y=130;y<614;y+=4){q.fillStyle='#fff';q.fillRect(0,y,1280,1);}q.restore();}
  };
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,1280,720);const darkStyle=style==='hud'||style==='synthwave',bg=darkStyle?'#142633':'#faf6ed',ink=darkStyle?'#d6f4eb':'#373e38';c.fillStyle=bg;c.fillRect(0,0,1280,720);
  if(style==='pixel'){
    pixelCanvas??=document.createElement('canvas');pixelCanvas.width=320;pixelCanvas.height=180;const q=pixelCanvas.getContext('2d')!;q.scale(.25,.25);draw(q);c.save();c.imageSmoothingEnabled=false;c.drawImage(pixelCanvas,0,0,1280,720);c.restore();
  }else draw(c);
  text(c,getStyle(style).en,53,40,12,ink);text(c,p.title,53,92,29,ink,'left',800);text(c,`${scene.name} / ${index+1}·${timeline.length}`,1225,89,16,ink,'right');
  if(style==='hanazi'){
    c.font='850 36px "StorySans",sans-serif';c.textAlign='center';c.lineJoin='round';c.strokeStyle='#764b3c';c.lineWidth=11;c.strokeText(shot.caption,640,666,1140);c.strokeStyle='#fff';c.lineWidth=7;c.strokeText(shot.caption,640,666,1140);c.fillStyle='#d8803f';c.fillText(shot.caption,640,666,1140);
  }else text(c,shot.caption,640,662,25,ink,'center');
  if(index===timeline.length-1)text(c,p.signature,1225,40,15,ink,'right',500);
  c.fillStyle=ink+'25';c.fillRect(53,699,1174,3);c.fillStyle=ink;c.fillRect(53,699,1174*frame/timeline[timeline.length-1].to,3);
}
