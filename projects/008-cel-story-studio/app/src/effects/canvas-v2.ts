import type {EffectConfig} from '../../scripts/effects.mjs';
import {W,H,TAU,hash,lerp,clamp,smooth,back,text,circle,star,rr,paper,arrow} from './math';
import {inkStroke,inkLoop} from '../vendor/engine.js';
import {morphContours} from './geometry';
import type {EffectAssets} from './canvas';
import {handFilm} from './hand-film';
const cream='#f2ecdc',ink='#182d30';
const ease=(t:number,start=0,d=.8)=>Math.max(.001,back((t-start)/d,1.3));
function stroke(g:CanvasRenderingContext2D,points:number[][],color:string,w=2){g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.stroke();}
function grain(g:CanvasRenderingContext2D,c:EffectConfig,dark=false){g.fillStyle=dark?'#ffffff08':'#17272b0b';for(let i=0;i<1500;i++)g.fillRect(hash(i,c.seed)*W,hash(i+1800,c.seed)*H,1,1);}
export function masthead(g:CanvasRenderingContext2D,c:EffectConfig,t:number,kicker:string,color=cream){
 g.save();g.globalAlpha=smooth(0,.6,t);text(g,'AFTER HOURS / MOTION STUDIES',56,43,12,color,'left',500);text(g,kicker,1224,43,12,color,'right',500);g.strokeStyle=color+'44';g.lineWidth=1;g.beginPath();g.moveTo(56,60);g.lineTo(1224,60);g.stroke();g.restore();
}
export function filmFooter(g:CanvasRenderingContext2D,c:EffectConfig,t:number,color=cream){
 text(g,c.title,56,638,36,color,'left',850,1080);text(g,c.subtitle,58,671,16,color,'left',400,1000);
 const p=clamp(t/10);g.fillStyle=color+'35';g.fillRect(1095,665,130,2);g.fillStyle=color;g.fillRect(1095,665,130*p,2);text(g,`${String(Math.min(c.words.length,1+Math.floor(p*c.words.length))).padStart(2,'0')} / ${String(c.words.length).padStart(2,'0')}`,1224,638,12,color,'right',500);
}
function wordTag(g:CanvasRenderingContext2D,c:EffectConfig,t:number,x:number,y:number,fg=cream,bg=ink){const i=Math.min(c.words.length-1,Math.floor(t/10*c.words.length));g.fillStyle=bg;rr(g,x,y-26,Math.min(390,32+Array.from(c.words[i]).length*22),44,22);g.fill();text(g,c.words[i],x+18,y+4,20,fg,'left',700,350);}
function posterText(g:CanvasRenderingContext2D,lines:string[],x:number,y:number,size:number,color:string,leading=1.0){lines.forEach((s,i)=>text(g,s,x,y+i*size*leading,size,color,'left',950,1100));}

function flat(g:CanvasRenderingContext2D,c:EffectConfig,t:number){
 paper(g,c.seed,cream);const reveal=smooth(0,1.5,t);g.fillStyle=c.primary;g.fillRect(640+(1-reveal)*700,0,640,H);g.save();g.translate(-20*(1-reveal),0);posterText(g,['NIGHT','MARKET'],48,248,140,ink,.94);text(g,'热气腾腾 / 不必匆忙',58,477,23,ink,'left',650);g.restore();
 const bx=941,by=435,turn=Math.sin(t*1.6)*.025*c.intensity;g.save();g.translate(bx,by+(1-ease(t,.35,1))*280);g.rotate(turn);
 // Noodle bowl: separate ingredients, chopsticks and steam are choreographed into one hero object.
 g.fillStyle=c.secondary;g.beginPath();g.ellipse(0,22,219,67,0,0,TAU);g.fill();g.fillStyle=cream;g.beginPath();g.moveTo(-215,28);g.bezierCurveTo(-160,240,160,240,215,28);g.closePath();g.fill();g.fillStyle=ink;g.beginPath();g.ellipse(0,20,205,58,0,0,TAU);g.fill();
 for(let i=0;i<c.count+8;i++){const x=-155+i*310/(c.count+7);g.beginPath();g.moveTo(x,27);g.bezierCurveTo(x-55,-30,x+55,-27,x+22,30);g.strokeStyle=i%2?'#f7ce67':c.secondary;g.lineWidth=5+c.detail*3;g.stroke();}
 for(let i=0;i<5;i++){const x=-125+i*62;g.save();g.translate(x,-2+Math.sin(t+i)*3);g.rotate(i*.7);g.fillStyle=c.secondary;g.fillRect(-13,-7,26,14);g.restore();}
 circle(g,81,-7,39,cream);circle(g,81,-7,20,'#e5a437');circle(g,-83,1,5,ink);circle(g,-42,5,5,ink);stroke(g,[[-80,31],[-62,43],[-42,31]],ink,4);
 for(const x of [70,100]){g.save();g.translate(x,-75);g.rotate(.55);g.fillStyle=ink;rr(g,-5,-166,10,245,5);g.fill();g.restore();}
 for(let i=0;i<3;i++){g.beginPath();const x=-105+i*75,y=-100;g.moveTo(x,y);g.bezierCurveTo(x-48,y-55,x+40,y-83,x-10,y-145-Math.sin(t*2+i)*20*c.intensity);g.strokeStyle=cream+'bf';g.lineWidth=6;g.stroke();}g.restore();
 for(let i=0;i<c.count;i++){const a=i*TAU/c.count+t*.07,x=948+Math.cos(a)*255,y=350+Math.sin(a)*205;if(x>675&&y>95&&y<580)star(g,x,y,8+i%3*4,ink,4,.35,a);}
 wordTag(g,c,t,64,540,cream,ink);masthead(g,c,t,'01 / NIGHT MARKET',ink);filmFooter(g,c,t,ink);grain(g,c);
}
function lineArt(g:CanvasRenderingContext2D,c:EffectConfig,t:number){
 paper(g,c.seed,'#e9e5d8');masthead(g,c,t,'02 / A LETTER IN THE WIND',ink);posterText(g,['WIND','LETTER'],56,205,91,ink,1.0);
 // Arc-length reveals turn a field of thin ink curves into a moving fabric of wind.
 const paths=c.count+9,reach=smooth(.2,6.5,t);for(let j=0;j<paths;j++){const pts:number[][]=[];for(let k=0;k<=150*reach;k++){const u=k/150,x=420+u*805,y=295+j*12+Math.sin(u*TAU*1.1+t*.32+j*.11)*(40+c.intensity*53)+Math.sin(u*TAU*.5)*-110;pts.push([x,y]);}stroke(g,pts,j%4===0?c.primary:'#516e6b',.8+c.detail*1.4);}
 const u=smooth(.8,7.7,t),x=430+u*735,y=270+Math.sin(u*TAU*1.1+t*.32)*80-Math.sin(u*Math.PI)*130;g.save();g.translate(x,y);g.rotate(-.38+Math.cos(u*TAU)*.22);g.fillStyle=c.secondary;g.beginPath();g.moveTo(-42,-19);g.lineTo(52,0);g.lineTo(-42,29);g.lineTo(-12,0);g.closePath();g.fill();stroke(g,[[-42,-19],[-12,0],[52,0]],ink,1.5);g.restore();
 for(let i=0;i<4;i++){const xx=470+i*220;g.strokeStyle='#4d69674d';g.beginPath();g.arc(xx,475,35,0,TAU);g.stroke();text(g,['N','E','S','W'][i],xx,480,15,ink,'center',500);}
 wordTag(g,c,t,58,530,cream,ink);filmFooter(g,c,t,ink);grain(g,c);
}
function hand(g:CanvasRenderingContext2D,c:EffectConfig,t:number,a:EffectAssets){
 paper(g,c.seed,'#e6dcc6');if(a.paper){g.globalAlpha=.19;g.drawImage(a.paper,0,0,W,H);g.globalAlpha=1;}const q=Math.floor(t*12),qt=q/12;
 const draw=(p:number[][],color=ink,w=3,closed=false)=>{const o={seed:c.seed+q*19,amp:c.detail*2.2,w,color};if(closed)inkLoop(g,p,o);else inkStroke(g,p,o);};
 circle(g,1010,195,104,'#f1cc86');g.fillStyle='#cbd0b6';g.beginPath();g.moveTo(0,505);g.bezierCurveTo(270,290,430,525,710,410);g.bezierCurveTo(960,300,1100,500,1280,395);g.lineTo(1280,720);g.lineTo(0,720);g.fill();
 // House, lit window and post box are designed for this postal story.
 g.fillStyle=c.secondary;g.fillRect(1015,355,165,160);g.beginPath();g.moveTo(989,365);g.lineTo(1098,274);g.lineTo(1208,365);g.closePath();g.fill();g.fillStyle='#eac581';g.fillRect(1075,390,47,65);draw([[1098,390],[1098,455]],ink,2);g.fillStyle=c.primary;rr(g,956,436,45,68,8);g.fill();draw([[976,502],[976,546]],ink,5);draw([[962,454],[993,454]],ink,3);
 draw([[0,548],[240,552],[505,543],[740,551],[995,545],[1280,549]],ink,3);
 const x=165+smooth(.2,7,t)*680,y=492;g.save();g.translate(x,y);const leg=Math.sin(qt*9)*9*c.intensity;
 for(const xx of [-53,56]){g.beginPath();g.arc(xx,28,30,0,TAU);g.strokeStyle=ink;g.lineWidth=3;g.stroke();for(let k=0;k<6;k++){const an=k*TAU/6-qt*5;draw([[xx,28],[xx+Math.cos(an)*28,28+Math.sin(an)*28]],ink,1);}}
 draw([[-53,28],[-12,-12],[15,28],[-53,28],[44,-21],[56,28],[15,28]],c.primary,4);draw([[44,-21],[43,-35],[63,-35]],ink,3);
 g.fillStyle=c.secondary;rr(g,-24,-88,48,68,16);g.fill();draw([[-18,-26],[-5,3+leg],[15,17]],ink,5);draw([[12,-27],[22,2-leg],[4,17]],ink,5);draw([[14,-70],[47,-44],[58,-34]],ink,5);
 g.fillStyle=cream;g.beginPath();g.ellipse(-2,-110,28,32,0,0,TAU);g.fill();draw([[-19,-132],[-28,-161],[-16,-163],[-6,-139]],ink,3);draw([[4,-139],[16,-167],[25,-160],[16,-132]],ink,3);g.beginPath();g.ellipse(-2,-110,28,32,0,0,TAU);g.strokeStyle=ink;g.lineWidth=3;g.stroke();circle(g,9,-115,3,ink);circle(g,22,-104,4,c.primary);
 g.fillStyle=c.primary;rr(g,-40,-69,27,34,4);g.fill();g.restore();
 const deliver=smooth(7,8.4,t);if(deliver>0){g.save();g.translate(lerp(x+46,978,deliver),lerp(408,456,deliver)-Math.sin(deliver*Math.PI)*100);g.rotate(deliver*.3);g.fillStyle=cream;g.fillRect(-22,-15,44,30);draw([[-22,-15],[0,3],[22,-15]],ink,1.3);g.restore();}
 for(let i=0;i<c.count*3;i++){const xx=hash(i,c.seed)*W,yy=(hash(i+60,c.seed)*430+qt*70)%470+65;draw([[xx,yy],[xx-3,yy+13]],'#56746c',.8);}
 masthead(g,c,t,'05 / THE LAST MOON POST',ink);text(g,'THE MOON',56,180,66,ink,'left',850);text(g,'HAS MAIL.',56,246,66,ink,'left',850);filmFooter(g,c,t,ink);
}
function atlas(g:CanvasRenderingContext2D,im:HTMLImageElement|undefined,index:number,x:number,y:number,w:number,h:number,angle=0){
 if(!im)return;const boxes=[[20,0,602,537],[672,15,566,530],[35,540,630,701],[730,548,468,695]];const [sx,sy,sw,sh]=boxes[index],scale=Math.min(w/sw,h/sh);g.save();g.translate(x,y);g.rotate(angle);g.drawImage(im,sx,sy,sw,sh,-sw*scale/2,-sh*scale/2,sw*scale,sh*scale);g.restore();
}
function collage(g:CanvasRenderingContext2D,c:EffectConfig,t:number,a:EffectAssets){
 paper(g,c.seed,'#143b62');const qt=Math.floor(t*8)/8;const phase=smooth(0,1.2,t);g.save();g.translate((1-phase)*100,0);g.fillStyle='#e5d9ba';g.beginPath();for(let i=0;i<120;i++){const ang=i*TAU/120,r=225+(hash(i,c.seed)-.5)*(5+c.detail*14);g.lineTo(850+Math.cos(ang)*r,338+Math.sin(ang)*r);}g.closePath();g.fill();g.restore();
 posterText(g,['TUNE INTO','THE DEEP.'],50,174,85,cream,1.05);text(g,'M I D N I G H T  R A D I O',58,310,17,'#d5be8d','left',550);
 for(let i=0;i<c.count*5;i++){const x=40+hash(i,c.seed)*1200,y=100+hash(i+99,c.seed)*470;g.fillStyle='#efe5cb25';g.fillRect(x,y,2,2);}
 const im=a.atlas;atlas(g,im,1,1008,248,330,330,-.15+Math.sin(qt)*.035*c.intensity);atlas(g,im,2,500,450,350,350,-.2+Math.sin(qt*1.5)*.07*c.intensity);atlas(g,im,0,825,432+(1-ease(t,.3,1))*400,435,355,Math.sin(qt*.9)*.04*c.intensity);atlas(g,im,3,1136,430,262,360,.07-Math.sin(qt)*.05*c.intensity);
 for(let i=0;i<3;i++){g.beginPath();g.arc(785,335,38+i*30+(qt*15)%30,-2.8,-1.2);g.strokeStyle=c.primary;g.lineWidth=2.5;g.stroke();}
 g.save();g.translate(218,440);g.rotate(-.09);g.fillStyle=c.primary;g.fillRect(-144,-29,288,58);text(g,c.words[Math.min(c.words.length-1,Math.floor(t/10*c.words.length))],0,9,29,ink,'center',900,265);g.restore();
 masthead(g,c,t,'06 / FM 23:59',cream);filmFooter(g,c,t);grain(g,c,true);
}
function morph(g:CanvasRenderingContext2D,c:EffectConfig,t:number){
 paper(g,c.seed,cream);g.fillStyle='#183b38';g.fillRect(600,0,680,H);masthead(g,c,t,'08 / FORM TO FLORA',ink);posterText(g,['FORM','INTO','FLORA.'],56,205,86,ink,1.05);
 const phase=Math.min(2.999,t/10*3),index=Math.floor(phase),u=smooth(0,1,phase-index),sourceCurves=morphContours(c.count,c.detail),curves=[sourceCurves[0],sourceCurves[1],sourceCurves[2],sourceCurves[2]],rot=t*.12*c.intensity+hash(0,c.seed)*.15;const pts=curves[index].map((p,i)=>{const q=curves[index+1][i],x=lerp(p[0],q[0],u)*195,y=lerp(p[1],q[1],u)*195;return [945+x*Math.cos(rot)-y*Math.sin(rot),340+x*Math.sin(rot)+y*Math.cos(rot)];});
 for(let k=8;k>=0;k--){g.save();g.translate(k*-8,k*7);g.beginPath();pts.forEach(p=>g.lineTo(p[0],p[1]));g.closePath();if(k){g.strokeStyle=k%2?c.primary+'66':cream+'55';g.lineWidth=1.5;g.stroke();}else{g.fillStyle=c.primary;g.fill();}g.restore();}circle(g,945,340,24+c.detail*12,c.secondary);
 wordTag(g,c,t,60,532,cream,ink);filmFooter(g,c,t,ink);grain(g,c);
}
function bauhaus(g:CanvasRenderingContext2D,c:EffectConfig,t:number){
 paper(g,c.seed,'#eae7d9');masthead(g,c,t,'09 / RHYTHM DEPARTMENT',ink);posterText(g,['RHYTHM','DEPT.'],50,236,109,ink,.97);text(g,'几何即节拍 / 结构即旋律',58,427,19,ink,'left',550);wordTag(g,c,t,58,518,cream,ink);
 const n=Math.round(c.count/3)+2,size=530/n,x0=665,y0=113,cs=[c.primary,c.secondary,ink,'#c3b48c'];for(let row=0;row<n;row++)for(let col=0;col<n;col++){const i=row*n+col,x=x0+col*size,y=y0+row*size,ph=(t*.38+row*.11+col*.075)%1;g.save();rr(g,x+1,y+1,size-2,size-2,0);g.clip();g.fillStyle=i%3===0?c.secondary:'#ddd8c6';g.fillRect(x,y,size,size);g.translate(x+size/2,y+size/2);g.rotate(Math.floor(hash(i,c.seed)*4)*Math.PI/2+smooth(.1,.75,ph)*Math.PI/2*c.intensity);g.scale(Math.max(.08,Math.abs(Math.cos(ph*Math.PI))*.25+.75),1);const rad=size*(.33+c.detail*.12);g.fillStyle=cs[i%4];if(i%3===0){g.beginPath();g.arc(0,0,rad,0,Math.PI);g.closePath();g.fill();}else if(i%3===1){g.fillRect(-rad,-rad,rad*2,rad*2);circle(g,rad*.3,-rad*.3,rad*.65,'#eae7d9');}else for(let k=0;k<4;k++){g.beginPath();g.arc(0,0,rad*.3+k*rad*.23,0,Math.PI*1.5);g.lineWidth=size*.045;g.strokeStyle=cs[i%4];g.stroke();}g.restore();}
 filmFooter(g,c,t,ink);grain(g,c);
}
function hanazi(g:CanvasRenderingContext2D,c:EffectConfig,t:number,a:EffectAssets){
 const im=a.photo;g.fillStyle='#142e2d';g.fillRect(0,0,W,H);if(im){const z=1.025+Math.sin(t*.4)*.018,scale=Math.max(W/im.width,H/im.height)*z;g.drawImage(im,(W-im.width*scale)/2,(H-im.height*scale)/2,im.width*scale,im.height*scale);}const shade=g.createLinearGradient(0,0,850,0);shade.addColorStop(0,'#071c1dc9');shade.addColorStop(1,'#071c1d00');g.fillStyle=shade;g.fillRect(0,0,W,H);
 masthead(g,c,t,'12 / THE SLOW BARISTA');text(g,'夜班营业中',65,122,18,'#d4b68a','left',500);
 const index=Math.min(c.words.length-1,Math.floor(t/10*c.words.length)),age=t-index*10/c.words.length,word=c.words[index];const chars=Array.from(word),size=Math.min(134,475/chars.length);
 chars.forEach((ch,i)=>{const pop=ease(age,i*.09,.5);g.save();g.translate(60+(i+.45)*size,338+Math.sin(t*2+i)*4*c.intensity);g.rotate((i%2?1:-1)*.045);g.scale(pop,pop);g.font=`950 ${size}px "Noto Sans SC"`;g.textAlign='center';g.lineJoin='round';g.strokeStyle='#081d22';g.lineWidth=18+c.detail*12;g.strokeText(ch,5,7);g.strokeStyle=cream;g.lineWidth=8+c.detail*6;g.strokeText(ch,0,0);g.fillStyle=i%2?cream:c.primary;g.fillText(ch,0,0);g.restore();});
 g.save();g.translate(232,430);g.rotate(-.045);g.fillStyle=cream;rr(g,-172,-26,345,54,10);g.fill();g.beginPath();g.moveTo(140,20);g.lineTo(181,45);g.lineTo(169,12);g.fill();text(g,['咖啡可以等，快乐也是。','暂时离线，正在闻香。','慢一点，也很好。'][index%3],0,7,18,ink,'center',700,321);g.restore();
 for(let i=0;i<c.count;i++){const a=i*TAU/c.count+t*.1,x=900+Math.cos(a)*235,y=315+Math.sin(a)*230;if(y>90&&y<570&&x>610)star(g,x,y,7+i%3*3,c.primary,4,.35,a);}filmFooter(g,c,t);grain(g,c,true);
}
function paperclip(g:CanvasRenderingContext2D,c:EffectConfig,t:number){
 paper(g,c.seed,'#e6e3ce');masthead(g,c,t,'13 / THE JOURNEY OF SOUND',ink);posterText(g,['听见，','世界的回声。'],52,157,63,ink,1.05);
 const y=394,centers=[245,650,1050];g.strokeStyle='#596e5925';g.lineWidth=1;for(let x=30;x<W;x+=34){g.beginPath();g.moveTo(x,283);g.lineTo(x,555);g.stroke();}
 // Three actual diagram mechanisms: speaker membrane, travelling wave and receiving ear.
 centers.forEach((x,i)=>{const pop=Math.max(.001,back((t-i*.5)/.8,.5+c.intensity*2));g.save();g.translate(x,y+(1-pop)*210);g.scale(pop,pop);g.rotate((i%2?1:-1)*.045*c.detail);g.shadowColor='#2b372a35';g.shadowBlur=13;g.shadowOffsetY=8;g.fillStyle=cream;rr(g,-115,-112,230,236,17);g.fill();g.shadowColor='transparent';g.strokeStyle='#fffaf0';g.lineWidth=10;g.stroke();
  if(i===0){g.fillStyle=c.primary;rr(g,-62,-82,124,164,10);g.fill();circle(g,0,22,43,ink);circle(g,0,22,27+Math.sin(t*7)*3*c.intensity,'#61756a');circle(g,0,-48,12,ink);}else if(i===1){for(let k=0;k<c.count;k++){g.beginPath();const r=10+((k*8+t*15)%84);g.arc(0,0,r,-1.25,1.25);g.strokeStyle=k%2?c.primary:c.secondary;g.lineWidth=2.5;g.stroke();}}else{g.beginPath();g.moveTo(-19,76);g.bezierCurveTo(-91,-17,-51,-90,19,-73);g.bezierCurveTo(83,-54,61,20,26,42);g.bezierCurveTo(9,54,17,78,-19,76);g.strokeStyle=c.secondary;g.lineWidth=15;g.stroke();g.beginPath();g.moveTo(10,26);g.bezierCurveTo(-20,12,-34,-32,1,-42);g.bezierCurveTo(25,-53,40,-30,19,-10);g.strokeStyle=ink;g.lineWidth=7;g.stroke();}
  text(g,`0${i+1}`,0,-133,14,ink,'center',600);g.restore();text(g,c.words[i%c.words.length],x,554,24,ink,'center',750,230);});
 for(let i=0;i<2;i++){const x=centers[i]+135,xx=centers[i+1]-137;g.globalAlpha=smooth(1+i*.6,2+i*.6,t);arrow(g,x,y,xx,y,c.secondary,3);g.globalAlpha=1;}
 filmFooter(g,c,t,ink);grain(g,c);
}
const buffers=new WeakMap<CanvasRenderingContext2D,HTMLCanvasElement>();
function pixel(g:CanvasRenderingContext2D,c:EffectConfig,t:number){
 t=Math.floor(t*12)/12;let cv=buffers.get(g);if(!cv){cv=document.createElement('canvas');cv.width=320;cv.height=180;buffers.set(g,cv);}const q=cv.getContext('2d')!;q.fillStyle='#111d33';q.fillRect(0,0,320,180);
 const glow=q.createRadialGradient(240,85,0,240,85,130);glow.addColorStop(0,'#405360');glow.addColorStop(1,'#111d33');q.fillStyle=glow;q.fillRect(0,0,320,180);
 for(let layer=0;layer<3;layer++){for(let i=0;i<c.count+3;i++){const width=18+hash(i+layer*10,c.seed)*25,xx=Math.floor((i*37-t*(layer+1)*1.5+380)%380)-30,h=22+hash(i+40,c.seed)*55,y=131-h;q.fillStyle=['#20283d','#293849','#344953'][layer];q.fillRect(xx,y,width,h+18);if(layer===2){q.fillStyle='#152d3d';q.fillRect(xx-2,y-3,width+4,3);for(let wy=y+7;wy<130;wy+=11)for(let wx=xx+4;wx<xx+width-3;wx+=8){q.fillStyle=hash(wx+wy,c.seed)>.36?'#d8ab66':'#4d6c72';q.fillRect(Math.floor(wx),Math.floor(wy),3,5);}}}}
 q.fillStyle='#162f3b';q.fillRect(0,135,320,45);for(let i=0;i<60;i++){const x=Math.floor(hash(i,c.seed)*320),yy=141+Math.floor(hash(i+3,c.seed)*35);q.fillStyle=i%3?'#52747066':'#bc936f55';q.fillRect(x,yy,5+Math.floor(hash(i+40,c.seed)*12),1);}
 const xx=Math.round(35+smooth(.2,7,t)*220),yy=130-Math.abs(Math.sin(t*5))*2*c.intensity,step=Math.floor(t*7)%2;
 q.fillStyle=c.primary;q.fillRect(xx-5,yy-18,10,9);q.fillRect(xx-5,yy-22,3,5);q.fillRect(xx+3,yy-22,3,5);q.fillStyle='#f2dec0';q.fillRect(xx-2,yy-14,8,4);q.fillStyle='#182b3a';q.fillRect(xx+3,yy-17,1,2);q.fillStyle=c.secondary;q.fillRect(xx-5,yy-9,9,10);q.fillStyle='#dbc39a';q.fillRect(xx-9,yy-8,5,7);q.fillStyle='#101d2e';q.fillRect(xx-5,yy,3,3+step);q.fillRect(xx+2,yy,3,4-step);
 q.fillStyle='#bd6058';q.fillRect(277,112,12,23);q.fillRect(279,106,8,9);q.fillStyle='#e6be7d';q.fillRect(279,115,8,2);if(t>7.3){q.fillStyle='#fff0ba';q.fillRect(270+Math.round(smooth(7.3,8.2,t)*12),111,6,4);}
 for(let i=0;i<30+Math.round(c.detail*100);i++){const x=Math.floor(hash(i,c.seed)*320),y=Math.floor((hash(i+180,c.seed)*180+t*45)%180);q.fillStyle='#adc6c944';q.fillRect(x,y,1,3);}
 g.imageSmoothingEnabled=false;g.drawImage(cv,0,0,W,H);g.imageSmoothingEnabled=true;masthead(g,c,t,'14 / RAINY DELIVERY');text(g,'RAINY',56,190,75,cream,'left',900);text(g,'DELIVERY',56,260,75,cream,'left',900);filmFooter(g,c,t);
}
const painters:Record<string,(g:CanvasRenderingContext2D,c:EffectConfig,t:number,a:EffectAssets)=>void>={'flat-vector':flat,'line-art':lineArt,'cel-boil':handFilm,collage,morph,bauhaus,hanazi,paperclip,pixel};
export function paintCanvasV2(g:CanvasRenderingContext2D,c:EffectConfig,seconds:number,a:EffectAssets){g.clearRect(0,0,W,H);g.save();painters[c.style]?.(g,c,seconds/c.duration*10,a);g.restore();}
