import {clamp,lerp,TAU} from './math';
export type G=CanvasRenderingContext2D;
type Dot=[number,number];
type Curve={p:Dot[];length:number;cumulative:number[]};
const cache=new Map<string,Curve>();
export function curve(d:string):Curve{
 const found=cache.get(d);if(found)return found;
 const el=document.createElementNS('http://www.w3.org/2000/svg','path');el.setAttribute('d',d);const length=el.getTotalLength(),n=Math.max(20,Math.ceil(length/2));
 const p:Dot[]=Array.from({length:n+1},(_,i)=>{const q=el.getPointAtLength(length*i/n);return [q.x,q.y];});
 const cumulative=[0];for(let i=1;i<p.length;i++)cumulative.push(cumulative[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));
 const value={p,length:cumulative.at(-1)!,cumulative};cache.set(d,value);return value;
}
// Arc-length, not control-point index, determines tip and visible line.
export function engrave(g:G,d:string,u=1,color='#e5c587',w=1.8,tip=false){
 if(u<=0)return;const a=curve(d),at=clamp(u)*a.length;g.beginPath();g.moveTo(...a.p[0]);let last=a.p[0];
 for(let i=1;i<a.p.length;i++){if(a.cumulative[i]>at){const f=(at-a.cumulative[i-1])/(a.cumulative[i]-a.cumulative[i-1]);last=[lerp(a.p[i-1][0],a.p[i][0],f),lerp(a.p[i-1][1],a.p[i][1],f)];g.lineTo(...last);break;}g.lineTo(...a.p[i]);last=a.p[i];}
 g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.stroke();
 if(tip&&u<1){g.save();g.shadowColor=color;g.shadowBlur=15;g.fillStyle='#fff5d4';g.beginPath();g.arc(last[0],last[1],3.2,0,TAU);g.fill();g.restore();}
}
export function wash(g:G,d:string,color:string,alpha:number){g.save();g.globalAlpha=alpha;g.fillStyle=color;g.fill(new Path2D(d));g.restore();}
export function path(g:G,d:string,color:string,w=2){g.strokeStyle=color;g.lineWidth=w;g.stroke(new Path2D(d));}
export function poly(g:G,p:number[][],color:string,w=2,fill?:string){g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(fill){g.closePath();g.fillStyle=fill;g.fill();}g.strokeStyle=color;g.lineWidth=w;g.stroke();}
export function ellipse(g:G,x:number,y:number,rx:number,ry:number,color:string,fill=false,a=0){g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),a,0,TAU);if(fill){g.fillStyle=color;g.fill();}else{g.strokeStyle=color;g.stroke();}}
