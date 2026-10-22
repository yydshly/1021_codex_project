import {circlePts, fillShape, hs, inkLoop, inkStroke, spline} from './vendor/engine.js';
import {palettes, compileTimeline, FPS, type StoryProps} from './model';
import {poseAt} from '../scripts/storyboard.mjs';

const ink = '#28251f';
const paper = '#f4ebd5';
const clamp = (v:number) => Math.min(1,Math.max(0,v));
const smooth = (v:number) => {const x=clamp(v); return x*x*(3-2*x);};
const lerp = (a:number,b:number,t:number) => a+(b-a)*t;
const starPoints = (x:number,y:number,r:number) => Array.from({length:10},(_,i)=>{
  const a=i*Math.PI/5-Math.PI/2; const d=i%2?r*.46:r;
  return [x+Math.cos(a)*d,y+Math.sin(a)*d];
});

export function paint(ctx:CanvasRenderingContext2D, frame:number, props:StoryProps, texture:HTMLImageElement) {
  const pal=palettes[props.palette];
  const timeline=compileTimeline(props.shots);
  const index=Math.max(0,timeline.findIndex(s=>frame<s.to));
  const shot=timeline[index];
  const pose=poseAt(shot,frame-shot.from);
  const f=pose.frame;
  const seed=Math.floor(f/pose.hold)%4;
  const t=pose.progress;
  const amp=props.boil*1.8;
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,1280,720);
  ctx.fillStyle=paper;ctx.fillRect(0,0,1280,720);
  ctx.save();ctx.globalAlpha=.32;ctx.globalCompositeOperation='multiply';ctx.drawImage(texture,0,0,1280,720);ctx.restore();
  const shape=(points:number[][],color:string,id:number,width=5)=>{
    fillShape(ctx,points,color,{seed:seed+id,amp,dx:2.5,dy:1.4});
    inkLoop(ctx,points,{seed:seed+id,amp,w:width,color:ink,jit:.34,splits:2});
  };
  const line=(points:number[][],id:number,color=ink,w=4)=>{
    inkStroke(ctx,points,{seed:seed+id,amp,w,color,jit:.32});
  };
  const text=(value:string,x:number,y:number,size:number,color=ink,weight=850,align:CanvasTextAlign='left')=>{
    ctx.fillStyle=color;ctx.font=`${weight} ${size}px "StorySans", sans-serif`;
    ctx.textAlign=align;ctx.fillText(value,x,y);
  };
  const sparkle=(x:number,y:number,r:number,id:number,color=pal.light)=>{
    shape(starPoints(x,y,r),color,id,3);
  };
  const burst=(x:number,y:number,p:number)=>{
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6;const d=lerp(28,160,p);
      line([[x+Math.cos(a)*d,y+Math.sin(a)*d],[x+Math.cos(a)*(d+30*(1-p)),y+Math.sin(a)*(d+30*(1-p))]],i+90,i%2?pal.main:ink,4*(1-p)+1);
    }
  };
  const character=(x:number,y:number,sx=1,sy=1,rotation=0)=>{
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(sx,sy);
    let body:number[][];
    if(props.character==='flame'){
      body=spline([[-75,45],[-105,-15],[-78,-83],[-45,-112],[-15,-182],[28,-146],[40,-94],[76,-133],[104,-35],[75,48],[0,67]],true);
    }else if(props.character==='drop'){
      body=spline([[0,-174],[37,-116],[88,-40],[92,20],[53,63],[-25,67],[-87,27],[-85,-35],[-35,-108]],true);
    }else body=spline(starPoints(0,-37,126),true,4);
    // Legs and arms are separate strokes, so the silhouette remains readable.
    line([[-40,48],[-51+pose.stride*19,88],[-76+pose.stride*28,91]],41,ink,8);
    line([[37,48],[49-pose.stride*19,87],[76-pose.stride*28,86]],42,ink,8);
    line([[-78,-3],[-116,7-pose.arms*60+pose.stride*15],[-129,-19-pose.arms*67+pose.stride*20]],43,ink,7);
    line([[77,-3],[114,-16-pose.arms*45-pose.stride*15],[128,-41-pose.arms*55-pose.stride*20]],44,ink,7);
    shape(body,pal.main,20,7);
    if(props.character==='flame')shape(spline([[-31,41],[-37,2],[-15,-34],[4,-69],[31,-5],[26,39]],true),pal.light,21,2);
    const emotion=shot.emotion;
    const blink=(Math.floor(f/2)%41===29);
    for(const xx of [-31,32]){
      const side=xx<0?-1:1;
      if(blink||emotion==='happy')line([[xx-9,-62],[xx,-69],[xx+9,-62]],xx+51,ink,5);
      else if(emotion==='sad')line([[xx-10,-64],[xx,-59],[xx+10,-64]],xx+51,ink,5);
      else{
        ctx.fillStyle=ink;ctx.beginPath();ctx.ellipse(xx+(emotion==='curious'?4:0),-64,emotion==='afraid'?8:6,emotion==='afraid'?15:11,0,0,Math.PI*2);ctx.fill();
      }
      const brow=emotion==='determined'?-side*8:emotion==='sad'||emotion==='afraid'?side*8:emotion==='curious'?side*4:0;
      line([[xx-12,-88-brow],[xx+11,-88+brow]],xx+74,ink,4);
    }
    if(emotion==='afraid'||emotion==='curious'){
      ctx.beginPath();ctx.ellipse(1,-31,emotion==='afraid'?11:7,emotion==='afraid'?14:8,0,0,Math.PI*2);ctx.strokeStyle=ink;ctx.lineWidth=4;ctx.stroke();
    }else if(emotion==='sad')line([[-13,-25],[0,-34],[15,-25]],62,ink,4);
    else if(emotion==='determined')line([[-12,-29],[14,-32]],62,ink,4);
    else line([[-18,-34],[0,-20],[19,-34]],62,ink,5);
    ctx.globalAlpha=.52;ctx.fillStyle=pal.light;
    for(const xx of [-49,52]){ctx.beginPath();ctx.ellipse(xx,-38,12,7,0,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  };
  text('CEL STORY / 纸间故事',66,53,13,ink,650);
  text(`${String(index+1).padStart(2,'0')} / ${String(timeline.length).padStart(2,'0')}`,1212,53,14,ink,600,'right');
  line([[64,67],[1215,67]],171,'#b4aa93',1.5);
  text(props.title,68,117,28,pal.dark,750);
  if(index===timeline.length-1)text(props.signature,1210,116,19,pal.dark,650,'right');
  // One continuous stage: positions and the star's light survive each cut.
  const ground=spline([[60,578],[230,570],[440,580],[650,572],[880,581],[1218,570]],false);
  line(ground,110,ink,3.5);
  for(let i=0;i<7;i++){
    const x=94+i*175;line([[x,575],[x-9,561],[x,575],[x+5,553]],190+i,pal.dark,2);
  }
  const hill=spline([[485,575],[518,510],[568,470],[623,460],[687,497],[735,576]],false);
  shape([...hill,[485,575]],'#dbd0b6',120,5);
  for(let i=0;i<5;i++)line([[535+i*29,535+i%2*10],[550+i*28,555]],125+i,'#a99d83',2);
  const light=shot.litBefore?1:shot.action==='celebrate'?smooth(t/.4):0;
  if(light>0){
    ctx.save();ctx.globalAlpha=.32*light;fillShape(ctx,circlePts(1100,285,110),pal.light,{seed:seed+210,amp:6});ctx.restore();
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3; sparkle(1100+Math.cos(a)*110,285+Math.sin(a)*110,7*light,230+i,i%2?paper:pal.light);
    }
  }
  sparkle(1100,285,34+light*11,85,light?pal.light:'#d7ccb3');
  line([[1090,345],[1083,369],[1089,387]],84,'#b5a68b',2);
  if(shot.action==='celebrate'&&t<.4)burst(1100,285,clamp(t/.4));
  ctx.save();ctx.globalAlpha=.12;ctx.fillStyle=ink;ctx.beginPath();ctx.ellipse(pose.x,575,58-(500-pose.y)*.06,8,0,0,Math.PI*2);ctx.fill();ctx.restore();
  if(['jump','float','fail'].includes(shot.action)&&t>.25&&t<.75){
    for(let i=0;i<3;i++)line([[pose.x-105-i*8,pose.y+i*20-35],[pose.x-148-i*12,pose.y+i*20-22]],144+i,pal.dark,2.5);
  }
  character(pose.x,pose.y,pose.sx*.78,pose.sy*.78,pose.rotation);
  if(shot.emotion==='afraid'){
    line([[pose.x-99,pose.y-133],[pose.x-109,pose.y-146],[pose.x-104,pose.y-160]],175,pal.dark,3);
    line([[pose.x+104,pose.y-122],[pose.x+116,pose.y-137],[pose.x+110,pose.y-148]],176,pal.dark,3);
  }
  if(shot.emotion==='curious')text('?',pose.x+95,pose.y-146,37,pal.dark,600);
  if(shot.emotion==='sad')shape(spline([[pose.x+36,pose.y-28],[pose.x+43,pose.y-10],[pose.x+30,pose.y-10]],true),'#8caeb5',179,1.8);
  if(['jump','fail'].includes(shot.action)&&t>.8&&t<.98){
    const p=(t-.8)/.18;
    for(let i=0;i<5;i++){ctx.save();ctx.globalAlpha=1-p;shape(circlePts(pose.x+(i-2)*25*(1+p),566-p*25,8+p*10),paper,150+i,2);ctx.restore();}
  }
  ctx.fillStyle='#eee3c9';ctx.fillRect(63,620,1154,61);
  line([[64,619],[1215,619]],245,'#b6aa91',1.4);
  text(shot.caption,640,660,25,ink,600,'center');
  text(`${timeline[timeline.length-1].to/FPS} 秒 · 一笔一帧`,1213,704,10,'#80755e',500,'right');
  // Sparse, seeded ink flecks stay fixed within each held drawing.
  ctx.save();ctx.globalAlpha=.065;ctx.fillStyle=ink;
  for(let i=0;i<260;i++){const x=hs(i,45)*1280,y=hs(i,92)*720;ctx.fillRect(x,y,hs(i,8)*1.6+.4,.8);}
  ctx.restore();
}
