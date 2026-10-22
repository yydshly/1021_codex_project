import type {EffectConfig} from '../../scripts/effects.mjs';
import {storyFilm016} from '../../scripts/story-films-016.mjs';
import {engrave,wash,path,poly,ellipse,type G} from './engraving-016';
import {clamp,lerp,smooth,text,hash,TAU} from './math';

const CREAM='#fff0ca';
const violin='M0 -204 C-25 -209 -57 -195 -62 -173 C-68 -151 -58 -126 -34 -112 C-57 -97 -60 -79 -53 -63 C-39 -61 -33 -49 -38 -36 C-48 -19 -79 -27 -89 -6 C-119 54 -93 123 -45 148 C-18 162 18 162 45 148 C93 123 119 54 89 -6 C79 -27 48 -19 38 -36 C33 -49 39 -61 53 -63 C60 -79 57 -97 34 -112 C58 -126 68 -151 62 -173 C57 -195 25 -209 0 -204 Z';
const fHole='M-53 -27 C-75 -46 -73 -11 -56 -12 C-37 -11 -66 60 -65 79 C-63 98 -44 85 -47 74';
function violinDrawing(g:G,c:EffectConfig,t:number){
 const u=smooth(.45,2.65,t),res=smooth(2.45,3.9,t),gold=c.primary,foil=smooth(6.4,7.7,t);
 g.save();g.translate(396,386);g.rotate(-.15);wash(g,violin,gold,res*.035+foil*.63);engrave(g,violin,u,gold,2.7,true);
 g.save();g.scale(.91,.97);engrave(g,violin,smooth(1.1,2.95,t),gold+'70',1.1);g.restore();
 engrave(g,'M-11 -181 L-12 -310 C-12 -339 27 -341 26 -319 C26 -299 -2 -302 -1 -320 C-1 -329 11 -333 17 -325',smooth(.2,1.75,t),CREAM,2,true);
 engrave(g,'M11 -182 L12 -301',smooth(.2,1.75,t),gold,2);
 for(let i=0;i<4;i++)engrave(g,`M${-8+i*5} -305 C${-8+i*5} -160 ${-8+i*5+Math.sin(t*36+i)*1.8*res} -34 ${-8+i*5} 102`,smooth(0,.85,t),i%2?CREAM:gold,1.1,i===1);
 for(let i=0;i<4;i++){const y=-290+i*18;engrave(g,`M${i%2?-11:11} ${y} L${i%2?-25:25} ${y-3}`,u,gold,3);ellipse(g,i%2?-29:29,y-3,5,3,gold,true);}
 engrave(g,fHole,smooth(1.5,3,t),gold,3);g.save();g.scale(-1,1);engrave(g,fHole,smooth(1.8,3.2,t),gold,3);g.restore();
 if(foil>0){g.save();g.globalAlpha=foil;engrave(g,fHole,1,c.secondary,3);g.scale(-1,1);engrave(g,fHole,1,c.secondary,3);g.restore();}
 wash(g,'M-17 50 Q0 44 17 50 L8 131 Q0 140 -8 131 Z',CREAM,res*.2);engrave(g,'M-20 28 Q0 13 20 28 L17 37 Q0 31 -17 37 Z',u,CREAM,2);
 for(let i=0;i<19;i++){const x=-81+i*9,d=`M${x} 60 Q${x*1.06} 106 ${x*.58} 141`;engrave(g,d,u,gold+'38',.8);if(foil>0){g.save();g.globalAlpha=foil;engrave(g,d,1,c.secondary+'50',.8);g.restore();}}
 if(foil>0){g.save();g.globalAlpha=foil;path(g,'M-18 -169 Q-40 -180 -48 -158 M21 -165 Q43 -175 50 -153 M-61 9 Q-83 54 -66 95 M63 9 Q84 54 66 95',CREAM,.8);g.restore();}
 const bow=smooth(2.45,3.1,t)*(1-smooth(4.0,4.5,t));if(bow>0){g.save();g.globalAlpha=bow;const move=Math.sin(smooth(2.6,4.1,t)*Math.PI)*93*c.intensity;g.translate(move,15);g.rotate(-.52);engrave(g,'M-223 0 Q-80 -13 201 0 L207 9 Q-63 1 -223 8 Z',1,gold,2);path(g,'M-220 13 L201 13',CREAM,1.4);wash(g,'M-221 -6 L-182 -6 L-182 17 L-221 17 Z',gold,.7);g.restore();}
 g.restore();
}
function concert(g:G,c:EffectConfig,t:number){
 const p=smooth(.3,3.2,t),final=smooth(7,8.5,t),z=lerp(2.65,1,p)-final*.12,cx=lerp(410,615,p),cy=lerp(385,365,p);
 g.save();g.translate(640-cx*z,360-cy*z);g.scale(z,z);violinDrawing(g,c,t);
 // The bow's contact point is the beginning of the shared lead into the brass section.
 const lead='M426 399 C536 373 573 264 643 289 C712 314 595 390 621 452 C655 535 752 477 735 409 C718 346 797 281 857 337';
 engrave(g,lead,smooth(3.05,5.5,t),c.primary,2,true);
 g.save();g.translate(872,380);g.rotate(-.16);
 const horn='M-77 -20 C-136 -42 -130 55 -59 51 C-4 49 -34 -20 -68 -11 C-88 -4 -84 25 -61 21 C-33 17 -35 68 -91 70 C-164 72 -175 -58 -86 -48 L44 -61 C77 -65 94 -107 118 -136 L148 -112 C112 -83 110 -28 68 -18 Z';
 wash(g,horn,c.primary,.06*smooth(4.6,5.5,t));engrave(g,horn,smooth(4.2,5.8,t),c.primary,2.5,true);engrave(g,'M-81 -34 L59 -45 M-65 -19 L53 -31',smooth(4.6,5.9,t),CREAM,1);
 for(let i=0;i<3;i++){const x=-45+i*27;engrave(g,`M${x} -44 L${x} -78 M${x-7} -80 L${x+7} -80 M${x+5} -44 L${x+5} -71`,smooth(4.7,5.9,t),c.primary,2);}
 if(t>4.7){g.save();g.globalAlpha=smooth(4.7,5.8,t);ellipse(g,134,-125,20,7,c.primary,false,-.8);g.restore();}g.restore();
 // Five genuine staff lines widen into an architectural canopy for the ensemble.
 for(let i=0;i<5;i++){const y=480+i*17;engrave(g,`M189 ${y} C460 ${y+93} 782 ${y-244} 1102 ${y-148}`,smooth(5.15+i*.1,7+i*.06,t),i===2?CREAM:c.primary+'72',i===2?1.8:.85);}
 const curtain=smooth(5.9,7.6,t);for(let i=0;i<7+c.count;i++){
  const q=i/(6+c.count),x=230+q*810,y=515-220*q+Math.sin(q*TAU)*29;const appear=smooth(6+i*.045,6.7+i*.045,t);
  g.save();g.globalAlpha=appear*.9;const lift=Math.sin(t*2.2+q*8)*4*c.intensity*curtain;ellipse(g,x,y+lift,7,4.5,c.primary,true,-.4);engrave(g,`M${x+6} ${y+lift} L${x+6} ${y-39+lift} Q${x+19} ${y-29+lift} ${x+19} ${y-16+lift}`,1,c.primary,1.5);g.restore();
 }
 // A rosette is built by individual arcs; the music reveals it instead of a last-frame cut.
 g.save();g.translate(983,196);for(let i=0;i<24;i++){const a=i*TAU/24;g.save();g.rotate(a);engrave(g,'M0 -64 C27 -43 27 -20 0 -11 C-27 -20 -27 -43 0 -64',smooth(6.3+i*.025,7.3+i*.025,t),c.primary+'80',.9);g.restore();}if(t>6.4){g.globalAlpha=smooth(6.4,7.3,t);ellipse(g,0,0,11,11,CREAM,true);}g.restore();
 engrave(g,'M170 605 Q619 657 1114 564',smooth(6.65,7.7,t),c.primary+'65',1);g.restore();
 if(t<3.8){g.save();g.globalAlpha=smooth(1.4,2.1,t)*(1-smooth(3.3,3.8,t));text(g,'01 / 一根弦，先让空气振动。',61,622,19,CREAM,'left',500);g.restore();}
 if(t>=3.8&&t<7){g.save();g.globalAlpha=smooth(3.8,4.2,t)*(1-smooth(6.55,7,t));text(g,c.words[t<5.5?1:2]||'共鸣',66,615,32,CREAM,'left',550);text(g,t<5.5?'LINE BECOMES SOUND':'SOUND BECOMES A WORLD',66,645,11,c.primary,'left',450);g.restore();}
 if(final>0){g.save();g.globalAlpha=final;text(g,c.title,62,622,47,CREAM,'left',650,1120);text(g,c.subtitle,65,661,19,c.primary,'left',450,1100);text(g,'CHAMBER 016 / OPUS FOR A SINGLE LINE',1217,663,10,c.primary,'right',400);g.restore();}
}
function garden(g:G,c:EffectConfig,t:number){
 const pull=smooth(.8,3.25,t),final=smooth(7,8.55,t),z=lerp(1.8,.96,pull),cx=lerp(815,670,pull),cy=lerp(272,366,pull);
 g.save();g.translate(640-cx*z,360-cy*z);g.scale(z,z);
 g.save();g.translate(862,253);g.rotate(-.1-smooth(.7,1.8,t)*.28+smooth(3,4,t)*.2);
 const can='M-46 -58 Q1 -78 56 -48 L48 64 Q4 91 -52 61 L-62 -23 L-153 -61 L-164 -36 L-69 20 Z';
 engrave(g,can,smooth(0,1.0,t),c.primary,2.4,true);wash(g,can,c.primary,smooth(.6,1.8,t)*.055);engrave(g,'M47 -39 C146 -93 144 66 51 54 M56 -24 C122 -58 119 39 57 36',smooth(.4,1.5,t),c.primary,2);
 engrave(g,'M-42 -57 Q4 -130 53 -48 M-32 -62 Q6 -109 43 -51',smooth(.6,1.7,t),CREAM,1.4);engrave(g,'M-44 52 Q0 75 47 52 M-52 -42 Q0 -20 55 -35',smooth(.7,1.8,t),c.primary+'80',1);
 for(let i=0;i<9;i++)engrave(g,`M${-39+i*10} -27 Q${-32+i*8} 12 ${-33+i*9} 56`,smooth(.9,1.9,t),c.primary+'30',.8);g.restore();
 const canAngle=-.1-smooth(.7,1.8,t)*.28+smooth(3,4,t)*.2,sx=862-164*Math.cos(canAngle)+36*Math.sin(canAngle),sy=253-164*Math.sin(canAngle)-36*Math.cos(canAngle);
 const water=`M${sx} ${sy} C${sx-65} ${sy+15} 605 453 650 548`;engrave(g,water,smooth(1,2.4,t),CREAM,1.3,true);
 for(let i=0;i<7;i++){const q=(t*.7+i*.19)%1,u=1-q;if(t>1.1&&t<3.7){g.save();g.globalAlpha=smooth(1.1,1.5,t)*(1-smooth(3.1,3.7,t));const x=u*u*u*sx+3*u*u*q*(sx-65)+3*u*q*q*605+q*q*q*650,y=u*u*u*sy+3*u*u*q*(sy+15)+3*u*q*q*453+q*q*q*548;ellipse(g,x,y,2,5,CREAM,true,.2);g.restore();}}
 engrave(g,'M172 550 Q410 522 650 548 Q844 568 1121 542',smooth(1.7,2.9,t),c.primary+'75',1.2);
 // Roots precede the shoot; branches inherit the stem's actual endpoint.
 for(let i=0;i<9;i++){const sign=i%2?1:-1,dx=45+i*13;engrave(g,`M650 548 C${650+sign*dx*.3} ${568+i*3} ${650+sign*dx*.4} ${565+i*8} ${650+sign*dx} ${577+i*6} M${650+sign*dx*.7} ${565+i*7} l${sign*18} 23`,smooth(2.25+i*.06,3.6+i*.06,t),c.primary+'b0',1.1);}
 const stem='M650 548 C678 487 600 453 642 387 C663 349 682 301 663 247';engrave(g,stem,smooth(3.05,5.15,t),CREAM,2.2,true);
 const leaves=[{x:650,y:496,a:-.9,s:1},{x:637,y:436,a:2.6,s:.95},{x:655,y:370,a:-.7,s:.8},{x:673,y:305,a:2.3,s:.62}];
 leaves.forEach((p,i)=>{const u=smooth(3.5+i*.32,4.5+i*.32,t);g.save();g.translate(p.x,p.y);g.rotate(p.a);g.scale(p.s,p.s*u);const d='M0 0 C26 -55 76 -64 113 -52 C92 -12 50 14 0 0 Z';wash(g,d,c.primary,.075);engrave(g,d,u,c.primary,1.6);engrave(g,'M0 0 Q51 -33 113 -52',u,CREAM,1);for(let j=1;j<6;j++)engrave(g,`M${j*15} ${-j*6} l${-3+j} -${18+j*2}`,u,c.primary+'75',.7);g.restore();});
 const bloom=smooth(5.1,6.9,t);g.save();g.translate(663,247);
 for(let layer=0;layer<2;layer++)for(let i=0;i<12;i++){
  const a=i*TAU/12+layer*Math.PI/12,local=smooth(5.1+i*.035+layer*.2,6.2+i*.035+layer*.25,t);g.save();g.rotate(a+Math.sin(t*1.3)*.014*bloom);g.scale(1,local);const length=layer?94:130;
  const petal=`M-5 -19 C-28 -${length*.48} -23 -${length} 0 -${length} C23 -${length} 28 -${length*.48} 5 -19 Z`;wash(g,petal,c.primary,local*(layer?.42:.2));engrave(g,petal,local,layer?CREAM:c.primary,layer?1.4:1.1);engrave(g,`M0 -23 Q-8 -${length*.5} 0 -${length-9}`,local,c.primary+'85',.7);g.restore();
 }if(t>5.1){g.globalAlpha=smooth(5.1,5.8,t);for(let i=0;i<40;i++){const a=i*2.4,r=Math.sqrt(i)*3.5;ellipse(g,Math.cos(a)*r,Math.sin(a)*r,1.3,1.3,c.primary,true);}}g.restore();
 // An independently articulated butterfly leaves the flower, rather than translating it.
 const fly=smooth(6.5,8.6,t),bx=lerp(677,1030,fly),by=250-Math.sin(fly*Math.PI)*135;
 if(t>6.45){engrave(g,`M677 247 C803 121 920 103 1030 250`,fly,c.primary+'40',.8);g.save();g.translate(bx,by);g.rotate(.2+fly*.5);const flap=.22+Math.abs(Math.sin(t*13))*.78*(1+(c.intensity-.65));g.scale(flap,1);for(const s of [-1,1]){g.save();g.scale(s,1);engrave(g,'M0 0 C15 -45 68 -57 59 -12 C70 22 25 47 0 0 Z',1,CREAM,1.5);engrave(g,'M0 0 Q38 -13 53 -30 M0 0 Q32 16 47 17',1,c.primary,1);g.restore();}g.restore();}
 if(t>6.2){g.save();g.globalAlpha=smooth(6.2,7,t)*.65;for(let i=0;i<c.count;i++){const q=(t*.15+hash(i,c.seed))%1,a=hash(i+30,c.seed)*TAU,x=663+Math.cos(a)*(125+q*90),y=247+Math.sin(a)*90-q*36;ellipse(g,x,y,1.3,1.3,c.primary,true);}g.restore();}
 g.restore();
 if(final>0){g.save();g.globalAlpha=final;text(g,c.title,64,618,49,CREAM,'left',650,1100);text(g,c.subtitle,67,659,20,c.primary,'left',450);text(g,'A LITTLE WATER. A WHOLE NEW SEASON.',1215,663,10,c.primary,'right',400);g.restore();}
 else{const phase=t<2.5?0:t<5.1?1:2;text(g,`0${phase+1} / ${c.words[phase]||['落水','生根','盛放'][phase]}`,62,650,21,CREAM,'left',450);}
}
export function lineFilm016(g:G,c:EffectConfig,t:number){
 g.save();g.fillStyle=c.secondary;g.fillRect(0,0,1280,720);
 const glow=g.createRadialGradient(710,320,15,680,360,800);glow.addColorStop(0,'#789c9123');glow.addColorStop(1,'#000d173f');g.fillStyle=glow;g.fillRect(0,0,1280,720);
 // Fine, fixed grain avoids temporal flicker and keeps the engraved line readable.
 for(let i=0;i<1400+c.detail*1800;i++){g.fillStyle=i%2?'#fff0c907':'#0000000c';g.fillRect(hash(i,c.seed)*1280,hash(i+1800,c.seed)*720,1,1);}
 if(storyFilm016(c.style,c.storyId)?.id==='garden')garden(g,c,t);else concert(g,c,t);
 text(g,'纸间 / 一线造物',37,35,12,c.primary,'left',500);text(g,'DRAWN IN TIME / 016',1243,35,11,c.primary,'right',450);
 poly(g,[[37,54],[1243,54]],c.primary+'35',.8);g.restore();
}
