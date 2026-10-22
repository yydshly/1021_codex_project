/** Original ten-second miniature: a sound factory secretly lives on a record.
 * All motion is a deterministic function of the timeline; no external models or textures.
 */
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {SSAARenderPass} from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import type {EffectConfig} from '../../scripts/effects.mjs';
import {TAU,hash,smooth,clamp,lerp,back} from './math';

type Update=(t:number)=>void;
export function createThree(canvas:HTMLCanvasElement,c:EffectConfig){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(1280,720,false);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 const scene=new T.Scene();scene.background=new T.Color('#e6dfcf');scene.fog=new T.Fog('#e6dfcf',46,95);
 const camera=new T.OrthographicCamera(-10,10,5.625,-5.625,.1,130),updates:Update[]=[];
 const cream='#f4e9d1',navy='#183b48',coral=c.primary,mint=c.secondary;
 const physical=(color:string,roughness=.4,metalness=0)=>new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:metalness>.5?.32:.2,clearcoatRoughness:.2});
 const porcelain=physical(cream,.42),lacquer=physical(navy,.24,.32),red=physical(coral,.25,.12),green=physical(mint,.34,.16),brass=physical('#bd9452',.27,.85),rubber=physical('#253b43',.68),black=physical('#122a36',.27,.3),silver=physical('#bac6bf',.22,.8);
 const luminous=(color:string,power=.8)=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:power,roughness:.35});
 const warmGlow=luminous('#ffd99c',.75),mintGlow=luminous(mint,1.8),redGlow=luminous(coral,1.1);
 const mesh=(geometry:T.BufferGeometry,material:T.Material,x=0,y=0,z=0,parent:T.Object3D=scene)=>{const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const box=(w:number,h:number,d:number,m:T.Material,x=0,y=0,z=0,parent:T.Object3D=scene,r=.045)=>mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w*.32,h*.32,d*.32)),m,x,y,z,parent);
 const cyl=(r:number,h:number,m:T.Material,x=0,y=0,z=0,parent:T.Object3D=scene,segments=64)=>mesh(new T.CylinderGeometry(r,r,h,segments),m,x,y,z,parent);
 const sphere=(r:number,m:T.Material,x=0,y=0,z=0,parent:T.Object3D=scene)=>mesh(new T.SphereGeometry(r,32,24),m,x,y,z,parent);
 const torus=(r:number,thick:number,m:T.Material,x=0,y=0,z=0,parent:T.Object3D=scene)=>mesh(new T.TorusGeometry(r,thick,10,120),m,x,y,z,parent);
 const tube=(points:T.Vector3[],r:number,m:T.Material,parent:T.Object3D=scene)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(40,points.length*12),r,8,false),m,0,0,0,parent);
 const group=(x=0,y=0,z=0,parent:T.Object3D=scene)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
 const gear=(r:number,teeth:number,m:T.Material,parent:T.Object3D)=>{const shape=new T.Shape();for(let i=0;i<teeth*4;i++){const a=i*TAU/(teeth*4),radius=r*(i%4===1||i%4===2?1:.89);const x=Math.cos(a)*radius,y=Math.sin(a)*radius;i?shape.lineTo(x,y):shape.moveTo(x,y);}shape.closePath();const hole=new T.Path();hole.absarc(0,0,r*.5,0,TAU,true);shape.holes.push(hole);return mesh(new T.ExtrudeGeometry(shape,{depth:.14,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.025,bevelThickness:.025}),m,0,0,0,parent);};
 const bolt=(x:number,y:number,z:number,parent:T.Object3D)=>{const o=cyl(.035,.035,silver,x,y,z,parent,8);return o;};
 const pop=(o:T.Object3D,start:number,duration=.6)=>{updates.push(t=>{const u=back(smooth(start,start+duration,t),.72);o.scale.setScalar(Math.max(.001,u));});};

 // Broad studio sources, contact shadows and four-sample antialiasing keep the little machines tactile.
 scene.add(new T.HemisphereLight('#fff4d6','#778c8b',.6));
 const key=new T.DirectionalLight('#fff1d1',2.4);key.position.set(-7,13,8);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-15,right:15,top:15,bottom:-15,near:.1,far:45});key.shadow.bias=-.00015;key.shadow.normalBias=.012;key.shadow.radius=4;scene.add(key);
 const fill=new T.DirectionalLight('#b8e6e1',1.05);fill.position.set(9,6,-6);scene.add(fill);
 const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pm.fromScene(room,.055);scene.environment=environment.texture;scene.environmentIntensity=.32;room.dispose();pm.dispose();
 const ground=mesh(new T.PlaneGeometry(180,180),physical('#e6dfcf',.85));ground.rotation.x=-Math.PI/2;ground.position.y=-1.13;ground.castShadow=false;

 // The reveal is built into the set: the factory rides on an actual grooved record.
 const turntable=group(0,0,0),record=group(-1.15,.06,0,turntable);
 box(15.4,.7,11.6,porcelain,0,-.57,0,turntable,.22);box(15.18,.18,11.38,lacquer,0,-.18,0,turntable,.14);
 box(15.38,.1,11.58,brass,0,-.88,0,turntable,.12);
 for(const x of [-5.8,5.8])for(const z of [-4.3,4.3])cyl(.47,.22,rubber,x,-1.02,z,turntable);
 const platter=cyl(5.02,.24,silver,0,.02,0,record);cyl(4.9,.11,black,0,.19,0,record);cyl(4.55,.03,physical('#193b45',.36,.25),0,.26,0,record);
 for(let i=0;i<84;i++){const r=1.25+i*.041;const groove=torus(r,.0045,physical('#2d4a56',.42,.42),0,.289,0,record);groove.rotation.x=Math.PI/2;}
 const recordLabel=cyl(1.23,.035,red,0,.295,0,record),recordHub=cyl(.25,.08,brass,0,.34,0,record),recordPin=cyl(.075,.45,silver,0,.55,0,record);const centerCover=cyl(1.24,.035,porcelain,0,.315,0,record);
 // Front control panel makes the final object unmistakably a record player.
 for(let i=0;i<3;i++){const knob=cyl(.22,.16,i===0?red:silver,4.15+i*.8,.02,4.35,turntable);for(let j=0;j<8;j++){const a=j*TAU/8;box(.025,.02,.08,lacquer,4.15+i*.8+Math.cos(a)*.29,-.015,4.35+Math.sin(a)*.29,turntable);}}
 const pilot=sphere(.065,redGlow,3.35,.04,4.35,turntable);for(let i=0;i<19;i++)box(.022,.015,1.0,silver,5.75+i*.075,-.06,-2.0,turntable);
 const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=192;const lg=labelCanvas.getContext('2d')!;lg.fillStyle='#e8dfc4';lg.fillRect(0,0,512,192);lg.fillStyle=navy;lg.font='700 44px sans-serif';lg.fillText('SOUND WORKS',34,78);lg.font='24px monospace';lg.fillText('33 ⅓ RPM   /   SIDE A',36,132);const labelTexture=new T.CanvasTexture(labelCanvas);labelTexture.colorSpace=T.SRGBColorSpace;const label=mesh(new T.PlaneGeometry(2.4,.9),new T.MeshStandardMaterial({map:labelTexture,roughness:.7}),3.95,-.065,-4.05,turntable);label.rotation.x=-Math.PI/2;
 const armPivot=group(5.95,.38,2.15,turntable);cyl(.53,.44,silver,0,-.1,0,armPivot);cyl(.32,.56,lacquer,0,.22,0,armPivot);const arm=group(0,.52,0,armPivot);
 tube([new T.Vector3(.6,0,.42),new T.Vector3(-.7,0,.1),new T.Vector3(-2.8,0,-1.1),new T.Vector3(-3.5,0,-1.75)],.082,silver,arm);const head=box(.7,.18,.42,red,-3.48,-.02,-1.8,arm,.055);head.rotation.y=-.42;const needle=box(.024,.21,.025,brass,-3.57,-.2,-1.9,arm);const counter=cyl(.26,.55,brass,.7,.02,.47,arm);counter.rotation.z=Math.PI/2;
 updates.push(t=>{const land=smooth(7.15,8.15,t);armPivot.rotation.y=lerp(-.5,.16,land);arm.rotation.z=lerp(-.12,0,land);armPivot.position.y=.38+.47*(1-land);});

 const coverPlates:T.Mesh[]=[];for(let i=0;i<12;i++){const plate=mesh(new T.RingGeometry(1.02,4.72,18,1,i*TAU/12,TAU/12-.008),i%3===0?physical('#d7e0c8',.67):porcelain,0,.307,0,record);plate.rotation.x=-Math.PI/2;coverPlates.push(plate);}updates.push(t=>{const u=smooth(6.62,7.58,t);coverPlates.forEach((plate,i)=>{const local=smooth(6.62+i*.025,7.28+i*.025,t);plate.scale.setScalar(Math.max(.001,1-local));plate.visible=local<.995;});armPivot.visible=t>6.5;recordLabel.visible=recordHub.visible=recordPin.visible=t>6.62;centerCover.visible=t<7.6;centerCover.scale.setScalar(Math.max(.001,1-u));});
 const factory=group(0,.3,0,record);
 // A continuous brass guide rail links the four machines; the sound particle follows it.
 const routePoints=[new T.Vector3(-3.4,.66,2.58),new T.Vector3(-2.65,.66,1.7),new T.Vector3(-2.4,.66,.36),new T.Vector3(-1.45,.66,-.85),new T.Vector3(.2,.66,-1.2),new T.Vector3(1.55,.76,-.6),new T.Vector3(2.45,1.08,.35),new T.Vector3(1.25,1.65,-1.55),new T.Vector3(.15,2.5,-1.6)];
 const route=new T.CatmullRomCurve3(routePoints);for(const side of [-1,1]){const pts=Array.from({length:100},(_,i)=>{const u=i/99,p=route.getPoint(u),n=route.getTangent(u);return new T.Vector3(p.x+n.z*.14*side,p.y-.23,p.z-n.x*.14*side);});tube(pts,.026,brass,factory);}
 const signal=sphere(.225,red,-3.4,.66,2.58,factory);const signalRing=torus(.24,.012,warmGlow,0,0,0,signal);signalRing.rotation.x=Math.PI/2;
 updates.push(t=>{const u=t<2.35?lerp(0,.25,smooth(.25,2.35,t)):t<4.1?lerp(.25,.63,smooth(2.35,4.1,t)):lerp(.63,1,smooth(4.1,5.75,t)),p=route.getPoint(u),move=smooth(0,.18,t);signal.position.copy(p);signal.scale.setScalar(Math.max(.001,move*(1-smooth(5.65,6.1,t))));signal.rotation.z=-t*3;});

 // 1. A miniature conveyor and pressure station. The piston does one clear squash/release.
 const conveyor=group(-2.55,0,1.5,factory);const belt=box(1.45,.24,2.85,lacquer,0,.28,0,conveyor,.12);for(const x of [-.68,.68])box(.07,.12,2.85,brass,x,.48,0,conveyor);
 const rollers:T.Mesh[]=[];for(let i=0;i<15;i++){const o=box(1.18,.06,.08,green,0,.45,-1.25+i*.18,conveyor,.018);rollers.push(o);}
 for(const x of [-.5,.5])for(const z of [-1.05,1.05])box(.13,.3,.13,silver,x,.08,z,conveyor);
 updates.push(t=>rollers.forEach((o,i)=>o.position.z=-1.25+((i*.18+t*(.5+c.intensity*.7))%2.7)));
 const press=group(-2.4,0,.1,factory);pop(press,.65,.65);box(1.9,.26,1.35,porcelain,0,.14,0,press,.1);
 for(const x of [-.7,.7]){box(.23,1.85,.28,lacquer,x,1.16,-.27,press);cyl(.06,1.95,silver,x,1.22,.27,press);}
 box(1.92,.36,.75,red,0,2.23,0,press,.08);cyl(.22,.45,brass,0,2.55,0,press);cyl(.13,.16,silver,0,2.84,0,press);const piston=group(0,1.7,0,press);box(1.33,.19,.72,silver,0,0,0,piston);cyl(.1,.68,brass,0,.4,0,piston);
 box(.62,.56,.15,green,-.05,1.6,-.48,press);for(let i=0;i<3;i++)sphere(.055,i===0?redGlow:warmGlow,-.23+i*.18,1.6,-.575,press);
 for(const x of [-.7,.7])for(const z of [-.42,.42])bolt(x,.3,z,press);
 updates.push(t=>{const strike=smooth(2.1,2.37,t)*(1-smooth(2.42,2.9,t));piston.position.y=1.7-strike*.9;signal.scale.y*=1-strike*.34;});
 const impactRings:T.Mesh[]=[];for(let i=0;i<3;i++){const r=torus(.3,.015,redGlow.clone(),-2.4,.34,.1,factory);r.rotation.x=Math.PI/2;impactRings.push(r);}
 updates.push(t=>impactRings.forEach((r,i)=>{const u=(t-2.38-i*.06)/.6;r.visible=u>0&&u<1;r.scale.setScalar(.8+clamp(u)*3);(r.material as T.MeshStandardMaterial).opacity=1-clamp(u);(r.material as T.MeshStandardMaterial).transparent=true;}));

 // 2. Exposed wheels transmit that impulse instead of rotating from frame one.
 const wheels=group(1.65,0,1.1,factory);pop(wheels,1.35,.7);box(2.3,.25,1.52,porcelain,0,.15,0,wheels,.12);const wheel=group(-.15,1.27,.17,wheels);gear(1.02,28,green,wheel);const inner=torus(.51,.06,brass,0,0,.16,wheel);cyl(.15,.35,brass,0,0,0,wheel).rotation.x=Math.PI/2;
 for(let i=0;i<6;i++){const a=i*TAU/6,spoke=box(.12,.96,.12,brass,Math.cos(a)*.33,Math.sin(a)*.33,.12,wheel);spoke.rotation.z=a-Math.PI/2;}
 const little=group(1.05,.78,.19,wheels);gear(.5,18,red,little);sphere(.13,silver,0,0,.16,little);box(.17,1.13,.18,lacquer,-.15,.72,-.13,wheels);box(.17,.7,.18,lacquer,1.05,.4,-.13,wheels);
 const crank=group(-.15,1.27,.36,wheels);box(.16,.7,.12,silver,0,.28,0,crank);sphere(.12,red,0,.66,0,crank);
 updates.push(t=>{const on=smooth(2.4,3.4,t),a=(t-2.4)*(1.7+c.intensity*2.2)*on;wheel.rotation.z=-a;little.rotation.z=a*2.04;crank.rotation.z=-a;});

 // 3. A tall organ tower is the hero silhouette. Its three barrels fire in ascending order.
 const organ=group(-.1,0,-1.68,factory);pop(organ,1.7,.85);cyl(1.05,.27,porcelain,0,.16,0,organ);const drum=cyl(.82,1.16,lacquer,0,.82,0,organ);const drim=torus(.83,.05,brass,0,.44,0,organ);drim.rotation.x=Math.PI/2;const drim2=torus(.83,.045,brass,0,1.32,0,organ);drim2.rotation.x=Math.PI/2;
 const pipes:T.Group[]=[];for(let i=0;i<3;i++){const p=group((i-1)*.67,1.3,0,organ),height=1.75+(.5-Math.abs(i-1)*.27)+c.detail*.52;cyl(.25,height,i===1?red:green,0,height/2,0,p);for(const y of [.18,height-.18]){const r=torus(.255,.035,brass,0,y,0,p);r.rotation.x=Math.PI/2;}cyl(.30,.12,porcelain,0,height+.04,0,p);const glow=sphere(.19,mintGlow,0,height+.13,0,p);box(.18,.35,.018,black,0,.5,.252,p,.016);pipes.push(p);updates.push(t=>{const u=smooth(4.3+i*.32,4.65+i*.32,t),b=Math.sin((t-4.3-i*.32)*11)*Math.exp(-Math.max(0,t-4.3-i*.32)*2.8);p.scale.y=.35+u*.65+u*b*.08*c.intensity;glow.scale.setScalar(.2+u*.8);});}
 for(let i=0;i<11;i++){const a=i*TAU/11,tick=box(.07,.54,.035,brass,Math.cos(a)*.827,.82,Math.sin(a)*.827,organ);tick.rotation.y=-a+Math.PI/2;}

 // 4. The brass horn opens like a flower as the whole factory finally sounds.
 const hornBase=group(2.0,0,-1.45,factory);pop(hornBase,2.55,.7);cyl(.65,.22,porcelain,0,.13,0,hornBase);cyl(.24,.85,red,0,.61,0,hornBase);const horn=group(0,1.12,0,hornBase);
 const profile=[new T.Vector2(.15,0),new T.Vector2(.18,.28),new T.Vector2(.27,.55),new T.Vector2(.48,.8),new T.Vector2(.8,1.02),new T.Vector2(.92,1.1),new T.Vector2(.94,1.14),new T.Vector2(.89,1.16),new T.Vector2(.73,1.08),new T.Vector2(.43,.84),new T.Vector2(.23,.55),new T.Vector2(.13,.26),new T.Vector2(.11,0)];
 const bell=mesh(new T.LatheGeometry(profile,64),brass,0,0,0,horn);horn.rotation.set(.72,0,-.58);const rim=torus(.92,.035,porcelain,0,1.12,0,horn);rim.rotation.x=Math.PI/2;const center=sphere(.13,redGlow,0,.3,0,horn);
 const hornWaves:T.Mesh[]=[];for(let i=0;i<4;i++){const r=torus(1,.018,warmGlow.clone(),0,1.1,0,horn);r.rotation.x=Math.PI/2;hornWaves.push(r);}
 updates.push(t=>hornWaves.forEach((r,i)=>{const u=((t-5.45)*.85+i*.25)%1;r.visible=t>5.45;r.position.y=1.2+u*2.5;r.scale.setScalar(.8+u*.6);(r.material as T.MeshStandardMaterial).transparent=true;(r.material as T.MeshStandardMaterial).opacity=(1-u)*.65;}));

 // Bespoke details: service stairs, striped barriers, handrails, copper ducts and musical crates.
 for(let i=0;i<3;i++)box(.8,.12,.25,silver,-3.5,.05+i*.11,-.6-i*.22,factory,.02);
 const ductPts=[new T.Vector3(-1.6,.45,-.4),new T.Vector3(-1.1,.52,-.8),new T.Vector3(-.8,.52,-1.2)];tube(ductPts,.085,brass,factory);
 for(let i=0;i<Math.max(4,c.count);i++){const a=i*TAU/Math.max(4,c.count)+.3,r=3.8+hash(i,c.seed)*.28,detail=group(Math.cos(a)*r,.12,Math.sin(a)*r,factory);box(.35,.35,.35,i%3===0?red:porcelain,0,.17,0,detail,.035);for(let k=0;k<3;k++)box(.018,.018,.31,brass,0,.355,-.1+k*.1,detail);detail.rotation.y=a;pop(detail,.6+i*.12,.4);}
 for(let i=0;i<14;i++){const a=-.1+i*.11,r=3.95,x=Math.cos(a)*r,z=Math.sin(a)*r;box(.035,.45,.035,silver,x,.49,z,factory);if(i<13){const aa=a+.055;const rail=box(.035,.035,.46,red,Math.cos(aa)*r,.72,Math.sin(aa)*r,factory);rail.rotation.y=-aa;}}

 // A working world has a scale: two original half-unit maintenance robots attend the machines.
 const makeOperator=(x:number,z:number,yaw:number,start:number,coat:T.Material)=>{
  const bot=group(x,0,z,factory),home=new T.Vector3(x,0,z);bot.rotation.y=yaw;
  const body=group(0,0,0,bot);box(.18,.19,.13,coat,0,.235,0,body,.035);box(.112,.115,.016,porcelain,0,.25,.075,body,.015);
  for(const side of [-1,1])box(.014,.12,.018,brass,side*.047,.25,.087,body,.004);
  box(.10,.022,.025,lacquer,0,.17,.081,body,.006);
  const head=group(0,.345,0,body);box(.155,.12,.135,porcelain,0,.029,0,head,.035);box(.128,.043,.016,lacquer,0,.033,.073,head,.012);
  for(const side of [-1,1])sphere(.012,mintGlow,side*.033,.033,.086,head);
  const helmet=mesh(new T.SphereGeometry(.103,20,12,0,TAU,0,Math.PI/2),coat,0,.083,0,head);cyl(.119,.022,coat,0,.085,.005,head,24);box(.035,.018,.145,brass,0,.178,-.005,head,.006);
  const arms:T.Group[]=[],legs:T.Group[]=[];
  for(const side of [-1,1]){
   const arm=group(side*.115,.30,0,body);sphere(.031,brass,0,0,0,arm);box(.047,.135,.047,porcelain,0,-.071,0,arm,.018);sphere(.033,brass,0,-.15,0,arm);arms.push(arm);
   const leg=group(side*.052,.135,0,body);box(.05,.105,.052,lacquer,0,-.049,0,leg,.016);box(.065,.035,.095,rubber,0,-.115,.018,leg,.012);legs.push(leg);
  }
  updates.push(t=>{
   const enter=smooth(start,start+.65,t),walk=Math.sin((t-start)*18)*(1-enter),strike=smooth(2.02,2.30,t)*(1-smooth(2.5,3.0,t)),choir=smooth(5.55,5.95,t)*(1-smooth(6.65,7.15,t));
   bot.visible=t>=start;bot.position.copy(home).add(new T.Vector3((x<0?-1:1)*.8*(1-enter),0,.36*(1-enter)));body.position.y=Math.abs(walk)*.015+choir*Math.sin(t*9)*.012;
   const target=t<5.7?signal.position:new T.Vector3(-.1,2.8,-1.68);const aim=Math.atan2(target.x-home.x,target.z-home.z)-yaw;head.rotation.y=clamp(Math.atan2(Math.sin(aim),Math.cos(aim)),-.68,.68);head.rotation.x=-choir*.15;
   arms[0].rotation.x=walk*.45-choir*1.8;arms[1].rotation.x=-walk*.45-(x<0?strike*1.95:choir*2.0);arms[0].rotation.z=-.08;arms[1].rotation.z=.08;
   legs[0].rotation.x=walk*.28;legs[1].rotation.x=-walk*.28;
  });return bot;
 };
 makeOperator(-3.55,.35,Math.PI/2,.82,red);makeOperator(2.95,-2.25,-Math.PI/2,1.25,green);
 const console=group(-3.22,0,.42,factory);box(.25,.055,.24,lacquer,0,.03,0,console,.025);box(.045,.32,.045,silver,0,.2,0,console,.012);const consoleTop=box(.24,.11,.21,green,0,.40,0,console,.03);consoleTop.rotation.z=.12;sphere(.027,redGlow,-.1,.436,.02,console);sphere(.019,warmGlow,-.10,.426,.075,console);
 // A pressure gauge, live needle and a secondary feed line explain the transmission of the impulse.
 const gauge=group(-.88,1.05,.28,press);const gaugeCase=cyl(.123,.047,brass,0,0,0,gauge,32);gaugeCase.rotation.x=Math.PI/2;const gaugeFace=cyl(.105,.006,porcelain,0,0,.027,gauge,32);gaugeFace.rotation.x=Math.PI/2;torus(.108,.009,silver,0,0,.033,gauge);
 for(let i=0;i<13;i++){const a=-Math.PI*.2+i*Math.PI*1.4/12,r=.080,tick=box(.004,.018,.003,lacquer,Math.cos(a)*r,Math.sin(a)*r,.034,gauge,.001);tick.rotation.z=a-Math.PI/2;}
 const gaugeNeedle=group(0,0,.039,gauge);box(.006,.074,.004,red,0,.033,0,gaugeNeedle,.002);sphere(.012,brass,0,0,.003,gaugeNeedle);
 updates.push(t=>{gaugeNeedle.rotation.z=-.85+smooth(2.0,2.38,t)*(1-smooth(2.5,3.5,t))*1.7+smooth(5.7,6.1,t)*Math.sin(t*10)*.10;});
 tube([new T.Vector3(-3.12,.30,-.33),new T.Vector3(-3.23,.30,-1.05),new T.Vector3(-2.85,.30,-1.82),new T.Vector3(-1.55,.30,-2.48),new T.Vector3(-.72,.38,-2.24)],.055,green,factory);
 const valve=group(-2.85,.43,-1.82,factory);cyl(.025,.18,brass,0,0,0,valve,12);const valveWheel=group(0,.10,0,valve);const valveRing=torus(.11,.016,red,0,0,0,valveWheel);valveRing.rotation.x=Math.PI/2;for(let i=0;i<4;i++){const a=i*TAU/4,spoke=box(.016,.018,.18,brass,0,0,0,valveWheel,.004);spoke.rotation.y=a;}
 updates.push(t=>valveWheel.rotation.y=smooth(2.42,3.2,t)*1.1);

 // One distinct climax: the pressure opens into a rising crown of music, then travels across the disc.
 const music=group(0,0,0,factory);const notes:T.Group[]=[];
 for(let i=0;i<c.count+7;i++){const n=group(0,0,0,music),s=.10+hash(i+40,c.seed)*.07;sphere(s,i%2?green:red,0,0,0,n);box(.032,s*2.7,.028,brass,s*.7,s*1.1,0,n,.01);const flag=box(s*.95,.045,.025,i%2?green:red,s*1.1,s*2.3,0,n,.014);flag.rotation.z=-.3;notes.push(n);}
 const crownRings:T.Mesh[]=[];for(let i=0;i<4;i++){const r=torus(1,.019,(i%2?mintGlow:warmGlow).clone(),0,.36,0,factory);r.rotation.x=Math.PI/2;crownRings.push(r);}
 updates.push(t=>{const release=smooth(5.72,6.05,t),settle=smooth(7.05,8.4,t);notes.forEach((n,i)=>{const a=i*TAU/notes.length+t*.4,r=(1.2+hash(i,c.seed)*2.8)*release;n.position.set(Math.cos(a)*r,(1.4+Math.sin(i*2.4)*.8+Math.sin(clamp((t-5.72)/2)*Math.PI)*2.3)*release,Math.sin(a)*r);n.scale.setScalar(Math.max(.001,release*(1-settle)));n.rotation.z=Math.sin(t*3+i)*.3;});crownRings.forEach((r,i)=>{const u=(t-5.9-i*.13)/1.3;r.visible=u>0&&u<1;r.scale.setScalar(.3+clamp(u)*5.3);(r.material as T.MeshStandardMaterial).transparent=true;(r.material as T.MeshStandardMaterial).opacity=(1-clamp(u))*.55;});});

 // Ortho camera is part of the story: no turntable in the opening, full object only at the reveal.
 updates.push(t=>{const build=smooth(.7,3.1,t),reveal=smooth(6.55,8.65,t),impact=Math.sin(clamp((t-5.85)/.4)*Math.PI)*.10*c.intensity;
  const start=new T.Vector3(-3.6,4.0,7.8),mid=new T.Vector3(10.5,10.6,13.5),end=new T.Vector3(14.5,16.0,18.5);
  const p=start.lerp(mid,build).lerp(end,reveal);camera.position.copy(p);const target=new T.Vector3(-3.8,.92,1.8).lerp(new T.Vector3(-.8,1.5,-.2),build).lerp(new T.Vector3(0,-.15,0),reveal);camera.lookAt(target);
  camera.zoom=lerp(3.7,1.37,build);camera.zoom=lerp(camera.zoom,.89,reveal)+impact;camera.updateProjectionMatrix();
  record.rotation.y=(t*.012+smooth(7.4,10,t)*.16)*(1-reveal*.25);pilot.scale.setScalar(.8+Math.sin(t*6)*.12);});

 const composer=new EffectComposer(renderer);const aa=new SSAARenderPass(scene,camera);aa.sampleLevel=2;aa.unbiased=true;composer.addPass(aa);
 composer.addPass(new UnrealBloomPass(new T.Vector2(1280,720),.13,.35,1.1));composer.addPass(new OutputPass());
 return {draw(seconds:number){const t=seconds/c.duration*10;updates.forEach(fn=>fn(t));composer.render();},dispose(){const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Points){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const v of Object.values(m))if(v instanceof T.Texture)textures.add(v);}}});geometries.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());textures.forEach(x=>x.dispose());environment.dispose();key.shadow.dispose();composer.passes.forEach(x=>x.dispose());composer.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
