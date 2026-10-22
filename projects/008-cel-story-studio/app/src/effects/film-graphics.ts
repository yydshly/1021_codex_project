import type {EffectConfig} from '../../scripts/effects.mjs';
import {W,H,text,rr,circle,hash,smooth,clamp,TAU} from './math';
export type G=CanvasRenderingContext2D;
export const ink='#203f3c',cream='#f2ead8';
export function fill(g:G,c:string){g.fillStyle=c;g.fillRect(0,0,W,H);}
export function path(g:G,p:number[][],color:string,width=2,close=false){g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(close)g.closePath();g.strokeStyle=color;g.lineWidth=width;g.stroke();}
export function ellipse(g:G,x:number,y:number,rx:number,ry:number,c:string){g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);g.fillStyle=c;g.fill();}
export function polygon(g:G,p:number[][],c:string){g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=c;g.fill();}
export function badge(g:G,s:string,x:number,y:number,color=ink,bg=cream){g.font='600 14px "Noto Sans SC"';const w=g.measureText(s).width+30;g.fillStyle=bg;rr(g,x,y-22,w,32,16);g.fill();text(g,s,x+15,y,14,color,'left',600);}
let grain:HTMLCanvasElement|undefined;
export function texture(g:G,alpha=.09){if(!grain){grain=document.createElement('canvas');grain.width=512;grain.height=512;const a=grain.getContext('2d')!,im=a.createImageData(512,512);for(let i=0;i<im.data.length;i+=4){const v=hash(i,171)> .5?255:0;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=Math.floor(hash(i+1,171)*90);}a.putImageData(im,0,0);}g.save();g.globalAlpha=alpha;g.fillStyle=g.createPattern(grain,'repeat')!;g.fillRect(0,0,W,H);g.restore();}
export function signature(g:G,c:EffectConfig,t:number,color=ink){text(g,'AFTER HOURS / 原创短片',36,35,11,color,'left',500);text(g,`${c.style.toUpperCase()} · ${String(Math.min(299,Math.floor(t*30))).padStart(3,'0')}`,1244,35,11,color,'right',500);}
export function ending(g:G,c:EffectConfig,t:number,color=ink,y=620){g.save();g.globalAlpha=smooth(8.1,8.65,t);text(g,c.title,640,y,40,color,'center',800,1120);text(g,c.subtitle,640,y+37,17,color,'center',450,1140);g.restore();}
export function node(c:EffectConfig,t:number){return c.words[Math.min(c.words.length-1,Math.floor(clamp(t/10)*c.words.length))];}
export function strokeTitle(g:G,s:string,x:number,y:number,size:number,fg:string,edge:string,rotation=0,thickness=.18){g.save();g.translate(x,y);g.rotate(rotation);g.font=`900 ${size}px "Noto Sans SC"`;g.textAlign='center';g.lineJoin='round';g.strokeStyle=edge;g.lineWidth=size*thickness;g.strokeText(s,0,0,1140);g.fillStyle=fg;g.fillText(s,0,0,1140);g.restore();}
export function cover(g:G,im:HTMLImageElement,zoom=1,cx=.5,cy=.5){const ratio=Math.max(W/im.width,H/im.height)*zoom,w=im.width*ratio,h=im.height*ratio;g.drawImage(im,W/2-w*cx,H/2-h*cy,w,h);}
export function fade(g:G,t:number,color=cream){const a=1-smooth(0,.22,t);if(a){g.save();g.globalAlpha=a;fill(g,color);g.restore();}}
export {W,H,text,rr,circle,hash,smooth,clamp,TAU};
