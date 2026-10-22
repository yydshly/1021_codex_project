export const W=1280,H=720;
export const clamp=(v:number,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export const smooth=(a:number,b:number,t:number)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};
export const back=(v:number,k=1.5)=>{const t=clamp(v)-1;return 1+(k+1)*t*t*t+k*t*t;};
export const hash=(i:number,seed=21)=>{const v=Math.sin(i*127.1+seed*311.7)*43758.5453123;return v-Math.floor(v);};
export const TAU=Math.PI*2;
export function rr(g:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r=12){g.beginPath();g.roundRect(x,y,w,h,r);}
export function text(g:CanvasRenderingContext2D,s:string,x:number,y:number,size=32,color='#252c2a',align:CanvasTextAlign='left',weight=700,maxWidth=1100){g.fillStyle=color;g.font=`${weight} ${size}px "Noto Sans SC",sans-serif`;g.textAlign=align;g.fillText(s,x,y,maxWidth);}
export function circle(g:CanvasRenderingContext2D,x:number,y:number,r:number,c:string){g.beginPath();g.arc(x,y,Math.max(.01,r),0,TAU);g.fillStyle=c;g.fill();}
export function star(g:CanvasRenderingContext2D,x:number,y:number,r:number,c:string,n=5,inner=.5,phase=-Math.PI/2){g.beginPath();for(let i=0;i<n*2;i++){const a=phase+i*Math.PI/n,rad=i%2?r*inner:r;g.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);}g.closePath();g.fillStyle=c;g.fill();}
export function paper(g:CanvasRenderingContext2D,seed:number,color='#f4eddf'){g.fillStyle=color;g.fillRect(0,0,W,H);g.fillStyle='#453d2b0a';for(let i=0;i<1800;i++)g.fillRect(hash(i,seed)*W,hash(i+1900,seed)*H,1.5,1.5);}
export function arrow(g:CanvasRenderingContext2D,x:number,y:number,xx:number,yy:number,c:string,w=5){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.lineTo(xx,yy);g.stroke();const a=Math.atan2(yy-y,xx-x);g.beginPath();g.moveTo(xx-18*Math.cos(a-.5),yy-18*Math.sin(a-.5));g.lineTo(xx,yy);g.lineTo(xx-18*Math.cos(a+.5),yy-18*Math.sin(a+.5));g.stroke();}
