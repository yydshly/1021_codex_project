import type {EffectConfig} from '../../scripts/effects.mjs';
import {type G,signature,text,texture,hash,smooth,clamp} from './film-graphics';
let buffer:HTMLCanvasElement|undefined;
const foxRows=[
'......oo........oo......',
'......oddo....oddo.......',
'......odddoooodddo.......',
'.....odddddddddddo......',
'.....oddddddddddddo.....',
'....oddbddddddbdddo.....',
'....oddbddddddbdddo.....',
'....odddddddddddddo.....',
'.....oddccbbccddo.......',
'......occcccccco........',
'.......occcccco.........',
'.......orrrrrro.........',
'......orrrrrrrro........',
'......obbbbbbbbo........',
'.....obbbbbbbbbo........',
'.....obbbbbbbbyyo.......',
'.....obbbbbbyyyyo.......',
'......obbbbbyyyyo.......',
'......obbbbbbbbo........',
'.......obbbbbbo.........',
];
function rect(g:G,x:number,y:number,w:number,h:number,c:string){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
function fox(g:G,x:number,y:number,frame:number,c:EffectConfig,delivery=false){const palette:Record<string,string>={o:'#1c2831',d:c.primary,c:'#ecd3a4',b:'#384b59',r:'#b75751',y:'#c5a16b'};g.save();g.translate(Math.round(x),Math.round(y));for(let row=0;row<foxRows.length;row++)for(let col=0;col<foxRows[row].length;col++){const color=palette[foxRows[row][col]];if(color)rect(g,col-12,row-27,1,1,color);}const step=[-2,0,2,0][frame%4];rect(g,-4, -7,3,8+step,'#1c2831');rect(g,2,-7,3,8-step,'#1c2831');rect(g,-5,step,5,2,'#253342');rect(g,2,-step,5,2,'#253342');for(let i=0;i<8;i++)rect(g,-9-i,-11+Math.floor(i*.5),3,3,i>5?'#ecd3a4':c.primary);if(delivery){rect(g,7,-16,12,3,c.primary);rect(g,15,-19,8,6,'#e9dfbf');rect(g,17,-18,4,1,'#b1b29e');}else{rect(g,7,-19,2,17,'#8f9690');for(let i=-19;i<=19;i++)rect(g,i,-41+Math.floor((i*i)/65),2,2,i%6<3?c.secondary:'#426373');rect(g,-18,-33,36,2,c.secondary);}g.restore();}
export function pixelFilm(g:G,c:EffectConfig,t:number){if(!buffer){buffer=document.createElement('canvas');buffer.width=320;buffer.height=180;}const p=buffer.getContext('2d')!,time=Math.floor(t*12)/12,walk=smooth(0,6.8,t),cam=walk*235,del=smooth(6.8,7.8,t);p.fillStyle='#20224d';p.fillRect(0,0,320,180);
 for(let layer=0;layer<3;layer++){const sc=[.2,.5,1][layer],base=[94,124,146][layer];for(let i=-3;i<17;i++){const x=Math.floor(i*43-cam*sc),h=25+hash(i+layer*40,c.seed)*65,w=34+hash(i+40,c.seed)*12;rect(p,x,base-h,w,h,['#34346e','#3e4c87','#525987'][layer]);rect(p,x-2,base-h-3,w+4,3,'#1d2e3c');for(let row=0;row<Math.floor(h/12);row++)for(let k=0;k<3;k++){const lit=hash(i*8+k+row*35+layer,c.seed)>.42;rect(p,x+5+k*10,base-h+7+row*12,5,7,lit?layer<2?'#b983af':'#e9a561':'#2b345b');if(lit&&layer===2){rect(p,x+6+k*10,base-h+8+row*12,1,5,'#e3bd7d');}}if(layer===2){rect(p,x+5,base-23,14,23,'#253442');rect(p,x+6,base-21,11,17,'#526564');rect(p,x-1,base-29,w+2,5,i%2?'#6e6c66':'#7c5750');for(let k=0;k<w;k+=4)rect(p,x+k,base-28,2,8,i%2?'#9b9d8a':'#bd8070');rect(p,x+25,base-22,7,11,'#25323e');}}}
 rect(p,0,145,320,35,'#222b50');rect(p,0,146,320,2,'#82918d');for(let i=0;i<60;i++){const x=(hash(i,c.seed)*500-cam*.9+500)%500-80,y=150+hash(i+100,c.seed)*29;rect(p,x,y,3+hash(i+200,c.seed)*12,1,i%3?'#63746b':'#947c62');}
 for(let k=-1;k<5;k++){const x=k*122+70-cam;rect(p,x,68,2,78,'#b2b29a');rect(p,x-7,67,16,2,'#a3aca0');rect(p,x-9,69,6,8,'#ffdfa2');for(let j=0;j<15;j++){rect(p,x-8-j,148+j*2,7+j*2,1,'#ba995b'+Math.max(10,70-j*4).toString(16));}rect(p,x-5,142,12,5,'#172d3a');}
 const mailboxX=440-cam;rect(p,mailboxX,119,16,27,c.secondary);rect(p,mailboxX+2,116,12,4,c.secondary);rect(p,mailboxX+2,123,12,3,'#1b3440');rect(p,mailboxX+2,129,12,1,'#dae1c1');rect(p,mailboxX+5,145,3,9,'#172d3a');
 const fx=lerpPixel(87,mailboxX-27,walk),jump=Math.sin(smooth(3.1,4.1,t)*Math.PI)*(9+c.intensity*12),fy=146-jump+(t<6.8?Math.floor(Math.sin(time*9)*(.3+c.intensity*1.5)):0);fox(p,fx,fy,Math.floor(time*8),c,t>7.15);
 if(t>7.2&&t<8.4){const u=smooth(7.2,8.3,t);rect(p,fx+16+(mailboxX-fx-16)*u,fy-19-u*3,8,5,'#f2e2b8');}
 for(let i=0;i<70+c.count*5;i++){const x=(hash(i,c.seed)*340-time*27+680)%340-10,y=(hash(i+400,c.seed)*210+time*90)%210-15;rect(p,x,y,1,3+c.detail*3,'#a0bcc340');}
 // Open in a close-up; follow the courier, then let the destination hold.
 g.imageSmoothingEnabled=false;const z=t<1.5?lerpPixel(2.6,1.6,smooth(.3,1.5,t)):t<5.1?1.6:lerpPixel(1.6,1.2,smooth(5.1,6.5,t));g.drawImage(buffer,0,0,320,180,clamp(430-fx*4*z,1280-1280*z,0),clamp(600-fy*4*z,720-720*z,0),1280*z,720*z);g.imageSmoothingEnabled=true;
 if(t<6.8){g.save();g.fillStyle='#142a36b8';g.fillRect(40,58,360,50);text(g,t<2.3?c.words[0]:c.words[Math.min(1,c.words.length-1)],62,91,22,'#e6d2a7','left',600);g.restore();}else{g.save();g.globalAlpha=smooth(8.3,8.9,t);g.fillStyle='#142a36e0';g.fillRect(250,70,780,135);text(g,c.title,640,129,42,'#e6d2a7','center',800);text(g,c.subtitle,640,172,19,'#a8c4bf','center',500);g.restore();}signature(g,c,t,'#dae0c8');}
function lerpPixel(a:number,b:number,t:number){return a+(b-a)*t;}
