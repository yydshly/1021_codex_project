/** Original picture-book actors. Poses use world coordinates, with no story clock. */
export type Point018 = [number, number];
export type Emotion018 = 'hesitant' | 'focused' | 'joyful' | 'gentle';
export type FoxPose018 = {
  x:number; y:number; scale:number; facing:1|-1; crouch:number;
  headTilt:number; gaze:Point018; hand:Point018; emotion:Emotion018;
  wave:number; gait:number;
};
export type WhalePose018 = {
  x:number; y:number; scale:number; rotation:number; tail:number;
  fin:number; emotion:Emotion018; gaze:Point018;
};
type G = CanvasRenderingContext2D;
const INK='#334741', CREAM='#f9eacd', FUR='#ce7843', DARK_FUR='#8f4d32';
const clamp=(n:number,a=0,b=1)=>Math.min(b,Math.max(a,n));
const lerp=(a:number,b:number,u:number)=>a+(b-a)*u;
const TAU=Math.PI*2;
const hash=(i:number)=>{const n=Math.sin(i*127.1+743.83)*43758.5453;return n-Math.floor(n);};
function mix(a:string,b:string,u:number){
  if(!/^#[\da-f]{6}$/i.test(b))return a;
  const aa=parseInt(a.slice(1),16),bb=parseInt(b.slice(1),16);
  return '#'+[16,8,0].map(s=>Math.round(lerp(aa>>s&255,bb>>s&255,u)).toString(16).padStart(2,'0')).join('');
}
function path(g:G,d:string,fill:string|CanvasGradient,stroke=INK,width=2.2){
  const p=new Path2D(d);g.fillStyle=fill;g.fill(p);
  if(width){g.strokeStyle=stroke;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.stroke(p);}
}
function line(g:G,d:string,color=INK,width=1.8){
  g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.stroke(new Path2D(d));
}
function oval(g:G,x:number,y:number,rx:number,ry:number,fill:string|CanvasGradient,stroke='',width=1.5){
  g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);
  g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}
}
function wash(g:G,x0:number,y0:number,x1:number,y1:number,a:string,b:string){
  const p=g.createLinearGradient(x0,y0,x1,y1);p.addColorStop(0,a);p.addColorStop(1,b);return p;
}
/** The endpoint always equals the authored palm, including distant preview poses. */
function elbow(s:Point018,end:Point018,a=65,b=72,bend=1):Point018{
  const dx=end[0]-s[0],dy=end[1]-s[1],d=Math.max(.001,Math.hypot(dx,dy));
  // Slightly extend the arm rather than leaving a visible gap to the prop anchor.
  const aa=Math.max(a,d*.48+.1),bb=Math.max(b,d*.52+.1);
  const theta=Math.atan2(dy,dx),cos=clamp((aa*aa+d*d-bb*bb)/(2*aa*d),-1,1);
  const angle=theta+Math.acos(cos)*bend;
  return [s[0]+Math.cos(angle)*aa,s[1]+Math.sin(angle)*aa];
}
function arm(g:G,s:Point018,end:Point018,fur:string,bend=1,sleeve=true){
  const k=elbow(s,end,65,72,bend);
  const d=`M${s[0]} ${s[1]} Q${k[0]} ${k[1]-5} ${k[0]} ${k[1]} Q${k[0]} ${k[1]+5} ${end[0]} ${end[1]}`;
  line(g,d,INK,20);line(g,d,fur,15.2);
  if(sleeve){const x=lerp(s[0],k[0],.38),y=lerp(s[1],k[1],.38);line(g,`M${s[0]} ${s[1]} L${x} ${y}`,'#365b50',23);line(g,`M${x-6} ${y-3} L${x+5} ${y+4}`,'#81907a',1.2);}
  const angle=Math.atan2(end[1]-k[1],end[0]-k[0]);
  g.save();g.translate(end[0],end[1]);g.rotate(angle);
  path(g,'M-9 -9 Q0 -15 9 -9 Q17 -8 15 3 Q11 15 0 13 Q-12 13 -12 3 Z',fur,INK,1.7);
  line(g,'M3 -7 Q9 -5 7 1 M5 3 Q10 5 6 9',DARK_FUR,1.1);g.restore();
}

/** Feet remain on y=0 when gait=0; crouch changes the knees, torso and head. */
export function drawFox018(g:G,pose:FoxPose018,t:number,accent='#d2a35b'){
  const sc=Math.max(.01,pose.scale),face=pose.facing,qt=Math.floor(t*12)/12;
  const crouch=clamp(pose.crouch),sink=crouch*27,lean=crouch*10;
  const effort=pose.emotion==='focused',joy=pose.emotion==='joyful',soft=pose.emotion==='gentle';
  const fur=mix(FUR,accent,.12),furLight=mix('#e39a57',accent,.07);
  const local=(p:Point018):Point018=>[(p[0]-pose.x)/(sc*face),(p[1]-pose.y)/sc];
  const hand=local(pose.hand),gaze=local(pose.gaze);
  const walk=clamp(Math.abs(pose.gait)),phase=qt*7.5,step=Math.sin(phase)*walk;
  g.save();g.translate(pose.x,pose.y);g.scale(sc*face,sc);
  // Big soft tail lives behind the body; it has a separate delayed hinge.
  g.save();g.translate(-32,-75+sink*.15);g.rotate(-.08+Math.sin(qt*2.6-.8)*(.035+walk*.08)+crouch*.06);
  const tail='M12 12 C-37 27 -115 5 -146 -53 C-174 -103 -142 -144 -104 -143 C-83 -103 -54 -86 -33 -67 C-10 -49 13 -23 12 12 Z';
  path(g,tail,wash(g,-140,-126,5,13,'#e29c5c',fur),INK,2.5);
  path(g,'M-144 -117 Q-134 -141 -104 -143 Q-88 -115 -71 -101 L-92 -100 L-89 -83 L-112 -91 L-120 -70 Q-135 -81 -145 -97 Z',CREAM,INK,1.6);
  line(g,'M-115 -46 Q-81 -8 -30 2','#a55b3655',1.5);
  line(g,'M-112 -37 Q-93 -18 -76 -12 M-95 -55 Q-77 -30 -57 -23','#f3c18b66',1.5);g.restore();

  // Trousers and planted shoes have their own knee articulation.
  for(const side of [-1,1]){
    const lift=Math.max(0,Math.sin(phase+(side<0?0:Math.PI)))*walk*13;
    const footX=side*24+step*side*18,footY=-lift;
    const hipX=side*19+lean*.3,kneeX=side*(25+crouch*13)+step*side*6;
    line(g,`M${hipX} ${-74+sink*.5} Q${kneeX} ${-40+sink*.25} ${footX} ${footY-12}`,INK,23);
    line(g,`M${hipX} ${-74+sink*.5} Q${kneeX} ${-40+sink*.25} ${footX} ${footY-12}`,'#52665a',17.5);
    path(g,`M${footX-15} ${footY-18} Q${footX} ${footY-23} ${footX+10} ${footY-12} L${footX+22} ${footY-8} Q${footX+28} ${footY+2} ${footX+18} ${footY+3} L${footX-19} ${footY+3} Q${footX-24} ${footY-4} ${footX-15} ${footY-18} Z`,'#354b42',INK,2);
    line(g,`M${footX-17} ${footY} L${footX+20} ${footY}`,'#aeb59a',1.4);
  }

  const shoulderL:Point018=[-39+lean,-158+sink],shoulderR:Point018=[43+lean,-155+sink];
  const wave=clamp(pose.wave),rest:Point018=[-49+lean,-92+sink*.3];
  const free:Point018=[lerp(rest[0],-77,wave),lerp(rest[1],-227+Math.sin(qt*7)*11,wave)];
  arm(g,shoulderL,free,fur,1);
  if(wave>.02){g.save();g.translate(...free);g.rotate(-.3+Math.sin(qt*7)*.1);path(g,'M-8 5 L-15 -6 Q-18 -13 -13 -15 L-7 -7 L-7 -21 Q-4 -27 0 -20 L2 -9 L8 -19 Q13 -23 15 -16 L11 -4 Q19 -10 22 -4 Q24 2 15 12 Q4 22 -8 5 Z',fur,INK,1.5);g.restore();}

  // Under-shirt and apron have different value and edge weights.
  const torso=`M${-39+lean} ${-171+sink} Q${lean+4} ${-183+sink} ${44+lean} ${-167+sink} C${58+lean} ${-143+sink} 58 -83 41 -65 Q4 -49 -43 -68 C-55 -99 ${-56+lean} ${-145+sink} ${-39+lean} ${-171+sink} Z`;
  path(g,torso,wash(g,-34,-164,43,-65,'#d18a4e','#aa603d'),INK,2.7);
  path(g,`M${-27+lean} ${-171+sink} L${-15+lean} ${-135+sink} Q2 ${-121+sink} ${23+lean} ${-139+sink} L${31+lean} ${-170+sink} L${43+lean} ${-162+sink} L39 -116 L46 -70 Q-1 -49 -48 -70 L-41 -116 L${-40+lean} ${-164+sink} Z`,wash(g,-40,-169,48,-55,'#4c7663','#294f46'),INK,2.4);
  line(g,`M${-22+lean} ${-166+sink} L${-12+lean} ${-139+sink} M${27+lean} ${-166+sink} L${20+lean} ${-141+sink}`,'#a0aa88',1.3);
  path(g,'M-19 -105 Q4 -98 25 -106 L23 -80 Q4 -70 -18 -80 Z','#426b5b',INK,1.5);
  line(g,'M-14 -101 Q5 -96 21 -102','#b5b69477',1.2);
  line(g,`M-36 -88 Q-32 -77 -29 -73 M34 -93 Q31 -79 28 -73`,'#152e2859',1.5);
  oval(g,-20+lean,-145+sink,3,3,accent,INK,1);oval(g,27+lean,-145+sink,3,3,accent,INK,1);
  path(g,'M3 -97 L10 -93 L6 -86 L0 -89 Z',accent,INK,1);

  // Right forearm is drawn in front of the apron and ends at the world prop grip.
  arm(g,shoulderR,hand,fur,1);

  const headX=5+lean,headY=-222+sink,tilt=pose.headTilt+Math.sin(qt*1.45)*.008;
  g.save();g.translate(headX,headY);g.rotate(tilt);
  const earLag=Math.sin(qt*3.3-.6)*(.017+walk*.025);
  for(const side of [-1,1]){
    g.save();g.translate(side*39,-42);g.rotate(side*(effort?.08:joy?-.07:.015)+earLag);
    path(g,side<0?'M-19 18 L-30 -48 Q-26 -60 -18 -48 L17 -4 Z':'M-18 -3 L19 -53 Q29 -61 28 -45 L21 23 Z',fur,INK,2.4);
    path(g,side<0?'M-13 3 L-23 -34 L4 -6 Z':'M-4 -7 L19 -37 L13 6 Z','#e9ba8b',INK,1.1);g.restore();
  }
  const head='M-60 -30 Q-51 -63 -9 -62 Q29 -65 52 -35 L68 -3 L91 13 Q99 22 85 30 L65 34 Q44 63 9 60 L-2 70 L-13 61 Q-46 59 -60 33 L-76 32 L-64 17 L-77 15 L-65 1 Q-70 -17 -60 -30 Z';
  path(g,head,wash(g,-45,-48,73,48,furLight,fur),INK,2.6);
  // Pale cheek remains part of the silhouette; the nose has room to project.
  path(g,'M-58 4 Q-34 18 -16 9 Q-3 0 6 -14 Q17 9 43 9 Q58 10 67 -1 L83 15 Q94 20 83 27 L63 31 Q43 58 11 56 Q-25 62 -48 42 L-59 30 L-68 29 L-59 18 L-69 15 Z',wash(g,-34,12,75,52,'#fff3d7','#ead8b7'),INK,1.25);
  line(g,'M-48 25 Q-39 38 -27 40 M-40 27 Q-31 38 -22 38','#b0916c77',1.0);
  const co=Math.cos(-tilt),si=Math.sin(-tilt),dx=gaze[0]-headX,dy=gaze[1]-headY;
  const gx=clamp((dx*co-dy*si)*.025,-4,4),gy=clamp((dx*si+dy*co)*.025,-3,3);
  const blink=Math.floor(qt*12)%61===49,eyesClosed=blink||(soft&&wave>.5);
  for(const [ex,ey,r] of [[-19,-13,5.9],[31,-12,5.2]]){
    if(eyesClosed)line(g,`M${ex-6} ${ey+1} Q${ex} ${ey-5} ${ex+6} ${ey}`,INK,2.0);
    else{oval(g,ex,ey,r,joy?6.8:effort?8.4:9.2,INK);oval(g,ex+gx*.43-1.1,ey-3+gy*.4,1.8,2.7,'#fff5df');}
  }
  if(pose.emotion==='hesitant'){
    line(g,'M-30 -33 Q-22 -40 -12 -36 M23 -34 Q31 -34 38 -29',INK,1.8);
    line(g,'M45 39 Q50 37 56 39',INK,1.6);
  }else if(effort){
    line(g,'M-30 -32 Q-20 -35 -12 -29 M22 -29 Q31 -35 39 -34',INK,1.8);
    line(g,'M44 37 Q51 40 58 35',INK,1.6);
  }else{
    line(g,'M-29 -34 Q-21 -38 -12 -34 M23 -34 Q31 -38 39 -33',INK,1.7);
    line(g,joy?'M40 34 Q50 47 61 33':'M43 36 Q52 43 60 34',INK,1.8);
  }
  path(g,'M81 12 Q91 10 94 16 Q96 23 87 25 L81 21 Z','#2c403b',INK,1.3);
  line(g,'M84 14 Q88 12 90 15','#b5c0a5',1.1);
  oval(g,-33,17,10,4.9,'#bd5d3a36');oval(g,43,19,7.5,4.3,'#bd5d3a29');
  line(g,'M-17 -53 Q-9 -58 -1 -53 M-22 -49 Q-15 -53 -10 -51','#f1c08299',1.1);
  g.restore();g.restore();
}

/** Grip and the final bristle point are the exact world anchors supplied by the director. */
export function drawBrush018(g:G,grip:Point018,tip:Point018){
  const dx=tip[0]-grip[0],dy=tip[1]-grip[1],length=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
  g.save();g.translate(grip[0],grip[1]);g.rotate(angle);
  const ferrule=Math.max(0,length-24),wood=wash(g,0,-5,0,6,'#e3b56a','#9b683e');
  path(g,`M-47 -2 Q-53 0 -47 3 L${ferrule-7} 5.5 L${ferrule-7} -5.5 Z`,wood,INK,1.4);
  line(g,`M-39 -1.3 L${ferrule-12} -3`,'#f3d49b',1.3);
  path(g,`M${ferrule-10} -6 L${ferrule+4} -5 L${ferrule+4} 5 L${ferrule-10} 6 Z`,wash(g,0,-6,0,6,'#d9ddc1','#889a8e'),INK,1.1);
  line(g,`M${ferrule-6} -5 L${ferrule-6} 5 M${ferrule} -5 L${ferrule} 5`,'#637d70',.8);
  path(g,`M${ferrule+3} -4.6 Q${length-6} -8 ${length} 0 Q${length-6} 6 ${ferrule+3} 4.6 Z`,'#3a6a70',INK,1.0);
  for(let i=0;i<3;i++)line(g,`M${ferrule+5} ${-2+i*2} Q${length-7} ${-3+i*2} ${length} 0`,i===0?'#a3b8a3':'#25565c',.65);
  // Foreground finger folds wrap around the shaft instead of floating next to it.
  path(g,'M-8 -7 Q-3 -13 3 -9 L8 -5 Q12 -7 15 -2 Q18 4 11 9 L4 12 Q-3 12 -5 7 L-1 3 L-8 -1 Z',FUR,INK,1.4);
  line(g,'M2 -6 Q8 -2 4 3 M7 -2 Q12 2 8 6 M-4 5 Q0 8 5 7',DARK_FUR,1.0);
  g.restore();
}

/** A blunt-headed baleen-whale silhouette with separate tail and pectoral fin. */
export function drawWhale018(g:G,pose:WhalePose018,t:number,accent='#caa461'){
  const qt=Math.floor(t*12)/12,sc=Math.max(.001,pose.scale),tail=clamp(pose.tail,-1,1),fin=clamp(pose.fin,-1,1);
  const blue=mix('#709eaa',accent,.065),deep=mix('#3d7383',accent,.04);
  g.save();g.translate(pose.x,pose.y);g.rotate(pose.rotation);g.scale(sc,sc);
  g.save();g.translate(-113,9);g.rotate(tail*.36+Math.sin(qt*2.2-.7)*.018);
  path(g,'M14 -21 C-14 -25 -38 -38 -63 -63 Q-75 -72 -76 -59 Q-76 -22 -43 1 C-71 13 -85 39 -90 62 Q-91 71 -80 65 C-45 54 -21 39 9 20 Z',wash(g,-70,-60,12,40,'#83acb4',deep),INK,2.2);
  line(g,'M-64 -48 Q-54 -18 -33 1 Q-49 15 -68 43','#a8c4c5',1.35);g.restore();
  const body='M-125 -14 C-103 -46 -67 -58 -34 -64 Q-41 -81 -26 -87 Q-23 -74 -7 -69 C42 -78 112 -65 148 -44 C176 -30 183 -7 178 21 C174 53 133 72 80 78 C-3 92 -78 69 -111 40 Q-126 25 -125 -14 Z';
  path(g,body,wash(g,-60,-70,65,81,'#91b7bd',deep),INK,2.55);
  // A low-contrast painted wash creates volume, with only sparse local pigment.
  g.save();g.clip(new Path2D(body));
  g.globalAlpha=.1;g.fillStyle=blue;for(let i=0;i<60;i++){const x=-115+hash(i)*285,y=-69+hash(i+81)*148;oval(g,x,y,1+hash(i+170)*2.7,.7+hash(i+312)*1.3,i%3?'#d7dfc8':'#214e61');}
  g.globalAlpha=1;g.restore();
  path(g,'M-99 31 Q-39 65 36 62 C105 62 152 42 177 14 Q177 57 114 72 Q21 99 -53 68 Q-82 56 -99 31 Z',wash(g,0,30,0,86,'#e6e6cf','#b8cbc0'),INK,1.3);
  for(let i=0;i<4;i++)line(g,`M${148-i*8} ${32+i*4} Q${109-i*9} ${59+i*2} ${57-i*10} ${62+i*1.4}`,'#668c8c8c',1.0);
  line(g,'M-92 -28 Q-30 -66 55 -59 Q107 -56 137 -41','#d2e1d055',2);
  line(g,'M-75 -36 Q-59 -43 -44 -45 M65 -55 Q84 -52 98 -48','#edf0d488',1.1);

  g.save();g.translate(21,32);g.rotate(-.11+fin*.49+Math.sin(qt*2.2-.5)*.014);
  path(g,'M-17 -6 C4 -16 33 -2 59 20 Q74 32 77 45 Q66 53 47 45 C16 36 -6 20 -17 -6 Z',wash(g,0,-7,67,45,'#72a0a8','#4a7e8b'),INK,2.0);
  line(g,'M-5 0 Q25 17 63 38','#b7d0c5',1.2);g.restore();

  const co=Math.cos(-pose.rotation),si=Math.sin(-pose.rotation),dx=(pose.gaze[0]-pose.x)/sc,dy=(pose.gaze[1]-pose.y)/sc;
  const gx=clamp((dx*co-dy*si-113)*.018,-2.4,2.4),gy=clamp((dx*si+dy*co+5)*.018,-2,2);
  const blink=Math.floor(qt*12)%67===54,closed=blink||pose.emotion==='gentle'&&fin>.55;
  if(closed)line(g,'M108 -5 Q114 -11 121 -5',INK,2.1);
  else{oval(g,115,-7,5.0,pose.emotion==='hesitant'?6.1:5.1,INK);oval(g,114+gx*.48,-9+gy*.5,1.65,1.9,'#fff4d7');}
  if(pose.emotion==='hesitant')line(g,'M107 -24 Q114 -30 122 -25',INK,1.4);
  else line(g,'M108 -23 Q115 -25 122 -21','#42666a',1.35);
  line(g,pose.emotion==='joyful'?'M127 19 Q148 31 169 13':'M128 19 Q148 25 170 13',INK,1.65);
  oval(g,126,8,8.5,3.4,'#d6b09a29');
  line(g,'M63 -65 Q67 -67 72 -65',INK,1.6);
  g.restore();
}
