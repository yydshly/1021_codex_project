import {TAU,lerp} from './math';
export type Point=[number,number];
export function resampleClosed(points:Point[],n:number):Point[]{
 const p=[...points,points[0]],lengths=[0];for(let i=1;i<p.length;i++)lengths.push(lengths[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));
 const total=lengths.at(-1)!;let j=0;return Array.from({length:n},(_,i)=>{const d=total*i/n;while(j<points.length-1&&lengths[j+1]<d)j++;const u=(d-lengths[j])/(lengths[j+1]-lengths[j]||1);return [lerp(p[j][0],p[j+1][0],u),lerp(p[j][1],p[j+1][1],u)];});
}
export function alignCyclic(a:Point[],b:Point[]):Point[]{
 let best=Infinity,shift=0;for(let s=0;s<a.length;s++){let sum=0;for(let i=0;i<a.length;i++){const p=a[i],q=b[(i+s)%b.length];sum+=(p[0]-q[0])**2+(p[1]-q[1])**2;if(sum>best)break;}if(sum<best){best=sum;shift=s;}}
 return b.map((_,i)=>b[(i+shift)%b.length]);
}
let key='',cached:Point[][]=[];
export function morphContours(count:number,roundness:number):Point[][]{
 const next=`${count}/${roundness}`;if(next===key)return cached;
 const raw=(kind:number):Point[]=>Array.from({length:240},(_,i)=>{const a=i*TAU/240;let r=kind===0?1:kind===1?.68+(.32-roundness*.14)*Math.cos(Math.round(count/2)*a):kind===2?.83+(.17-roundness*.08)*Math.cos(count*a):.78/Math.max(Math.abs(Math.cos(a)),Math.abs(Math.sin(a)));return [Math.cos(a)*r,Math.sin(a)*r];});
 cached=[resampleClosed(raw(0),180)];for(let i=1;i<4;i++)cached.push(alignCyclic(cached[i-1],resampleClosed(raw(i),180)));key=next;return cached;
}
