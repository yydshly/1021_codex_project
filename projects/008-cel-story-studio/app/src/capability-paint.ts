import {compileTimeline,emotions,palettes,type StoryProps} from './model';
import {poseAt} from '../scripts/storyboard.mjs';
import {compileWorld,worldPose} from '../scripts/world-runtime.mjs';

type C=CanvasRenderingContext2D;
const TAU=Math.PI*2;
const clamp=(x:number)=>Math.min(1,Math.max(0,x));
const stage={x:0,y:125,w:1280,h:490};

function contextAt(frame:number,p:StoryProps){
  const timeline=compileTimeline(p.shots),index=Math.max(0,timeline.findIndex(s=>frame<s.to)),shot=timeline[index];
  const t=clamp((frame-shot.from)/Math.max(1,shot.durationFrames-1));
  let emotion=shot.emotion,action:string=shot.action,color=palettes[p.palette].main;
  let position=(u:number)=>{const q=poseAt(shot,u*(shot.durationFrames-1));return {x:q.x,y:q.y-70,ground:570};};
  if(p.world){
    const worldShot=compileWorld(p.shots,p.world)[index],cue=worldShot.cast[0];
    emotion=cue.emotion;action=cue.action==='perform'?(cue.gesture||'表演'):cue.action;
    color=p.world.characters.find(c=>c.id===cue.characterId)?.shapes.find(s=>s.fill!=='none')?.fill||color;
    position=(u:number)=>{
      const q=worldPose(cue,u,frame),zoom=worldShot.framing==='close'?1.3:worldShot.framing==='medium'?1.12:1;
      const center=worldShot.cast.reduce((n,a)=>n+worldPose(a,t,frame).x,0)/worldShot.cast.length;
      return {x:zoom===1?q.x:640+(q.x-center)*zoom,y:385+(q.y-85-385)*zoom,ground:385+(worldShot.scene.groundY-385)*zoom};
    };
  }else if(p.style==='isometric'){
    position=(u:number)=>{const q=poseAt(shot,u*(shot.durationFrames-1));return {x:110+q.x*.84,y:485-(500-q.y)-q.x*.025-60,ground:550-q.x*.025};};
  }
  return {t,index,total:timeline.length,frame,position,emotion,action,color};
}
function line(c:C,x1:number,y1:number,x2:number,y2:number,color:string,width=2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function ring(c:C,x:number,y:number,rx:number,ry:number,color:string,width=2){c.beginPath();c.ellipse(x,y,Math.max(1,rx),Math.max(1,ry),0,0,TAU);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function text(c:C,s:string,x:number,y:number,color:string,size=22){c.font=`700 ${size}px "StorySans",sans-serif`;c.fillStyle=color;c.fillText(s,x,y);}
let stageCopy:HTMLCanvasElement|undefined;

/** Optional modules share stage coordinates and never mutate story actions or assets. */
export function paintCapabilities(c:C,frame:number,p:StoryProps,paper:HTMLImageElement){
  const settings=p.recipe?.components.filter(s=>s.amount>0);if(!settings?.length)return;
  const state=contextAt(frame,p),anchor=state.position(state.t);
  c.save();c.setTransform(1,0,0,1,0,0);c.beginPath();c.rect(stage.x,stage.y,stage.w,stage.h);c.clip();
  const push=settings.find(s=>s.id==='camera-push');
  let zoom=1,cx=640,cy=370;
  if(push){
    zoom=1+push.amount*.1*(state.t*state.t*(3-2*state.t));cx=clamp(anchor.x/1280)*700+290;cy=370;
    stageCopy??=document.createElement('canvas');stageCopy.width=1280;stageCopy.height=720;
    stageCopy.getContext('2d')!.drawImage(c.canvas,0,0);
    c.save();c.translate(cx*(1-zoom),cy*(1-zoom));c.scale(zoom,zoom);c.drawImage(stageCopy,0,0);c.restore();
  }
  const screen=(q:ReturnType<typeof state.position>)=>({x:cx+(q.x-cx)*zoom,y:cy+(q.y-cy)*zoom,ground:cy+(q.ground-cy)*zoom});
  const a=screen(anchor),u=state.t,ink=['hud','synthwave'].includes(p.style)?'#a9f5eb':'#5b5248';
  for(const setting of settings){
    const k=setting.amount;c.save();c.globalAlpha=k;c.lineCap='round';c.lineJoin='round';
    switch(setting.id){
      case 'paper-grain':
        c.globalAlpha=k*.42;c.globalCompositeOperation='multiply';c.drawImage(paper,0,125,1280,490);break;
      case 'ink-border':
        for(let i=0;i<45;i++){
          const x=28+i*28,j=Math.sin(i*4+Math.floor(frame/3)) *2.5;
          line(c,x,143+j,x+23,143-j,ink,1.5);line(c,x,599-j,x+23,599+j,ink,1.5);
          if(i%3===0)line(c,x,584,x+13,595,ink,1);
        }break;
      case 'focus-halo':{
        const g=c.createRadialGradient(a.x,a.y,25,a.x,a.y,175);g.addColorStop(0,'#fff3bc70');g.addColorStop(1,'#fff3bc00');c.fillStyle=g;c.fillRect(a.x-175,a.y-175,350,350);ring(c,a.x,a.y,111+Math.sin(frame*.035)*6,111+Math.sin(frame*.035)*6,state.color,1.5);break;
      }
      case 'line-trail':{
        c.setLineDash([6,8]);c.beginPath();
        for(let j=0;j<=24;j++){const q=screen(state.position(u*j/24));if(j)c.lineTo(q.x,q.y+65);else c.moveTo(q.x,q.y+65);}
        c.strokeStyle=state.color;c.lineWidth=3;c.stroke();c.setLineDash([]);
        const start=screen(state.position(0));ring(c,start.x,start.y+65,7,7,state.color);ring(c,a.x,a.y+65,10,10,state.color);break;
      }
      case 'iso-grid':
        c.globalAlpha=k*.4;for(let x=-1100;x<1800;x+=95){line(c,x,470,x+400,615,ink,1);line(c,x,615,x+400,470,ink,1);}break;
      case 'soft-spotlight':{
        const g=c.createRadialGradient(a.x,a.y-20,40,a.x,a.y-20,600);g.addColorStop(0,'#fff2d600');g.addColorStop(.45,'#fff2d610');g.addColorStop(1,'#27203a9a');c.fillStyle=g;c.fillRect(0,125,1280,490);ring(c,a.x,a.ground,83,11,'#ffffff80',2);break;
      }
      case 'collage-note':
        c.translate(1080,182);c.rotate(-.055+Math.sin(Math.floor(frame/4)*.5)*.01);c.shadowColor='#3d302f33';c.shadowBlur=9;c.shadowOffsetY=6;c.fillStyle='#fff1c7';c.fillRect(-105,-27,210,64);c.shadowBlur=0;c.fillStyle='#d2b88e80';c.fillRect(-24,-38,48,19);text(c,`${emotions[state.emotion]}的一刻`,-82,12,'#6d4d34',23);break;
      case 'ripple':
        for(let j=0;j<3;j++){const t=(frame/60+j/3)%1;c.globalAlpha=k*(1-t)*.7;ring(c,a.x,a.ground,28+t*100,5+t*17,state.color,2.4);}break;
      case 'shape-echo':
        for(let j=0;j<5;j++){
          const angle=j*TAU/5+frame*.008,r=115+Math.sin(frame*.03+j)*15,x=a.x+Math.cos(angle)*r,y=a.y+Math.sin(angle)*r;
          c.beginPath();for(let n=0;n<12;n++){const phi=n/12*TAU,rr=9+Math.sin(frame*.05+n*TAU/3)*4,px=x+Math.cos(phi)*rr,py=y+Math.sin(phi)*rr;if(n)c.lineTo(px,py);else c.moveTo(px,py);}c.closePath();c.fillStyle=j%2?state.color:'#eec75d';c.fill();
        }break;
      case 'geometric-beat':
        for(let j=0;j<6;j++){c.save();c.translate(65+j*44,171);c.rotate(Math.floor(frame/12+j)%4*Math.PI/2);c.fillStyle=[state.color,'#d3ac36','#37566d'][j%3];if(j%2){c.fillRect(-12,-12,24,24);}else{c.beginPath();c.arc(0,0,17,0,Math.PI);c.fill();}c.restore();}break;
      case 'neon-scan':{
        const y=150+(frame*2.4)%440;c.shadowColor='#5ff6e5';c.shadowBlur=15;line(c,24,y,1256,y,'#8affef',2);for(let j=0;j<8;j++)line(c,25,175+j*52,34+(j%3)*8,175+j*52,'#dd9fff',3);break;
      }
      case 'aurora-veil':
        for(let j=0;j<3;j++){const x=200+j*430+Math.sin(frame*.012+j)*90,y=260+Math.cos(frame*.015+j)*50,g=c.createRadialGradient(x,y,0,x,y,240);g.addColorStop(0,['#d2c1ef90','#9cddd890','#ffd4b490'][j]);g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(x-240,y-240,480,480);}break;
      case 'emotion-tag':{
        const s=1+Math.exp(-u*9)*Math.sin(u*28)*.2;
        c.translate(Math.min(1120,Math.max(160,a.x+120)),Math.max(185,a.y-100));c.rotate(-.08);c.scale(s,s);c.font='850 30px "StorySans",sans-serif';c.textAlign='center';c.strokeStyle='#fff9e9';c.lineWidth=11;c.strokeText(emotions[state.emotion],0,0);c.strokeStyle='#553b36';c.lineWidth=6;c.strokeText(emotions[state.emotion],0,0);c.fillStyle='#eaa447';c.fillText(emotions[state.emotion],0,0);break;
      }
      case 'step-badge':
        c.fillStyle='#fffaf0e8';c.beginPath();c.roundRect(35,157,190,49,10);c.fill();text(c,`STEP ${String(state.index+1).padStart(2,'0')} / ${String(state.total).padStart(2,'0')}`,53,189,'#6b624c',21);break;
      case 'pixel-sparks':
        for(let j=0;j<12;j++){const t=(frame/45+j/12)%1,x=Math.round((a.x+Math.sin(j*7)*110*t)/8)*8,y=Math.round((a.y+50-t*175)/8)*8;c.globalAlpha=k*(1-t);c.fillStyle=j%2?state.color:'#efcf58';c.fillRect(x,y,j%3?8:16,8);}break;
      case 'tracking-frame':{
        const w=94,h=118;c.strokeStyle=ink;c.lineWidth=2;
        for(const sx of [-1,1])for(const sy of [-1,1]){const x=a.x+sx*w,y=a.y+sy*h;line(c,x-sx*23,y,x,y,ink);line(c,x,y,x,y-sy*23,ink);}
        text(c,`${state.action.toUpperCase()} · ${Math.round(u*100)}%`,Math.max(35,a.x-w),Math.max(157,a.y-h-13),ink,15);break;
      }
      case 'camera-push':break;
    }
    c.restore();
  }
  c.restore();
}
