import * as T from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {Reflector} from 'three/examples/jsm/objects/Reflector.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import type {EffectConfig} from '../../scripts/effects.mjs';
import {filmCue} from './film-cue';
import {hash,lerp,smooth,TAU,text} from './math';

// MIDNIGHT FREQUENCY 014: cassette -> folded magnetic surface -> frequency chamber -> reel.
// All positions are functions of the selected shot, so frame seeking and reordering are deterministic.
export function createThree(canvas:HTMLCanvasElement,c:EffectConfig){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(1280,720,false);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;
 const scene=new T.Scene();scene.background=new T.Color('#070419');scene.fog=new T.FogExp2('#100520',.012);
 const camera=new T.PerspectiveCamera(38,16/9,.05,250);
 const material=(color:string,roughness=.3,metalness=.6)=>new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:.65,clearcoatRoughness:.18});
 const luminous=(color:string,strength=2)=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:strength,metalness:.3,roughness:.25});
 const black=material('#14142c',.25,.8),steel=material('#b0adc8',.27,.92),gold=material('#d2a162',.24,.83),pink=luminous(c.primary,1.55),cyan=luminous(c.secondary,1.5);
 const mesh=(geo:T.BufferGeometry,mat:T.Material,x=0,y=0,z=0,parent:T.Object3D=scene)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;};
 const box=(w:number,h:number,d:number,mat:T.Material,x=0,y=0,z=0,parent:T.Object3D=scene,r=.045)=>mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),mat,x,y,z,parent);
 const ring=(r:number,width:number,mat:T.Material,x:number,y:number,z:number,parent:T.Object3D=scene)=>mesh(new T.TorusGeometry(r,width,8,100),mat,x,y,z,parent);
 const cylinder=(r:number,d:number,mat:T.Material,x:number,y:number,z:number,parent:T.Object3D)=>{const m=mesh(new T.CylinderGeometry(r,r,d,64),mat,x,y,z,parent);m.rotation.x=Math.PI/2;return m;};
 const line=(points:T.Vector3[],color:string,opacity=.4)=>{const m=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color,transparent:true,opacity}));scene.add(m);return m;};
 scene.add(new T.HemisphereLight('#a892d5','#13071f',.55));
 for(const [color,x,y,z,power] of [[c.primary,-7,9,6,32],[c.secondary,7,5,4,35],['#d9dfff',0,10,-5,20]] as const){const l=new T.PointLight(color,power,45,1.5);l.position.set(x,y,z);scene.add(l);}
 const key=new T.DirectionalLight('#dbe5ff',1.1);key.position.set(-7,10,8);scene.add(key);
 const amberKey=new T.PointLight('#ffb269',26,40,1.4);amberKey.position.set(-2,9,8);scene.add(amberKey);
 const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pm.fromScene(room,.05);scene.environment=environment.texture;scene.environmentIntensity=.25;room.dispose();pm.dispose();

 // A genuine planar reflection anchors the floating mechanical object in the stage.
 const mirror=new Reflector(new T.PlaneGeometry(160,160),{textureWidth:1280,textureHeight:720,color:0x42314e,clipBias:.003});mirror.rotation.x=-Math.PI/2;mirror.position.y=-.1;scene.add(mirror);
 const floorLines=new T.Group();scene.add(floorLines);
 for(let i=-16;i<=16;i++){const a=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(i*2.5,-.06,-45),new T.Vector3(i*2.5,-.06,45)]),new T.LineBasicMaterial({color:c.secondary,transparent:true,opacity:.08}));floorLines.add(a);const b=a.clone();b.rotation.y=Math.PI/2;floorLines.add(b);}
 // Edge lights establish a designed room rather than an empty infinite grid.
 for(const x of [-13,13]){box(.22,12,.55,black,x,5.7,-8);box(.035,10.8,.04,x<0?pink:cyan,x,5.7,-7.7);box(.35,.12,18,steel,x,.1,-1);}
 for(let i=0;i<3+Math.floor(c.count/2);i++){const r=5.6+i*.52;ring(r,.012,luminous(i%2?c.secondary:c.primary,.9),0,6.1,-17-i*.02);}

 const tape=new T.Group();tape.position.y=3.8;scene.add(tape);
 // Smoked polycarbonate shell, aluminium perimeter, recessed tape transport and printed foil.
 box(8.7,5.35,.78,black,0,0,-.35,tape,.3);
 const inset=material('#281b43',.32,.58);box(8.1,4.8,.12,inset,0,0,.08,tape,.18);
 for(const side of [-1,1]){box(.11,4.6,.14,steel,side*4.09,0,.24,tape);box(7.9,.09,.14,steel,0,side*2.32,.24,tape);}
 box(7.78,.91,.1,material('#bdb5d2',.5,.2),0,1.77,.32,tape,.08);
 // Printed foil is generated from typography and fine rules; no external image or upstream pixels.
 const label=document.createElement('canvas');label.width=1536;label.height=220;const lg=label.getContext('2d')!;
 lg.fillStyle='#c2bfd2';lg.fillRect(0,0,1536,220);lg.fillStyle='#15152c';lg.font='700 71px sans-serif';lg.fillText('MIDNIGHT FREQUENCY',38,88);lg.font='500 28px monospace';lg.fillText('STEREO  /  CHROME  /  90 MIN',42,153);lg.fillText('SIDE A',1260,153);
 lg.fillStyle=c.primary;lg.fillRect(1090,26,155,27);lg.fillStyle=c.secondary;lg.fillRect(1090,66,330,27);lg.fillStyle='#604ec4';lg.fillRect(1090,106,60,25);
 const labelTexture=new T.CanvasTexture(label);labelTexture.colorSpace=T.SRGBColorSpace;labelTexture.anisotropy=4;mesh(new T.PlaneGeometry(7.55,1.08),new T.MeshStandardMaterial({map:labelTexture,roughness:.72,metalness:.08}),0,1.7,.401,tape);
 for(const [x,y] of [[-3.72,-2],[-3.72,2],[3.72,-2],[3.72,2]] as const){cylinder(.13,.07,steel,x,y,.42,tape);box(.15,.024,.015,black,x,y,.465,tape);}
 const spools:T.Group[]=[];
 for(const side of [-1,1]){
  const spool=new T.Group();spool.position.set(side*1.92,.05,.19);tape.add(spool);spools.push(spool);
  cylinder(1.34,.16,material('#160e25',.45,.4),0,0,0,spool);
  for(let k=0;k<20;k++)ring(.68+k*.028,.008,k%4===0?gold:material('#5a354d',.25,.6),0,0,.1,spool);
  cylinder(.67,.13,steel,0,0,.13,spool);cylinder(.48,.04,black,0,0,.22,spool);
  for(let j=0;j<6;j++){const a=j*TAU/6;const spoke=box(.13,.49,.05,steel,Math.sin(a)*.41,Math.cos(a)*.41,.27,spool);spoke.rotation.z=-a;}
  cylinder(.16,.07,gold,0,0,.29,spool);ring(.175,.018,side<0?pink:cyan,0,0,.34,spool);
  ring(1.39,.035,side<0?pink:cyan,0,0,.2,spool);
 }
 // Narrow front straps preserve the view of the internal reel mechanics.
 const glass=new T.MeshPhysicalMaterial({color:'#9c8eba',metalness:.1,roughness:.08,transmission:.45,thickness:.2,transparent:true,opacity:.28,clearcoat:1,depthWrite:false});
 box(7.3,.72,.09,glass,0,-.9,.52,tape,.2);box(1.35,2.3,.08,glass,0,.02,.55,tape,.15);
 for(const side of [-1,1]){cylinder(.24,.16,black,side*2.85,-1.77,.27,tape);cylinder(.17,.1,steel,side*2.85,-1.77,.39,tape);ring(.22,.013,side<0?pink:cyan,side*2.85,-1.77,.49,tape);}
 box(3.2,.65,.28,black,0,-1.8,.31,tape,.1);box(.75,.38,.14,steel,0,-1.7,.51,tape);box(.56,.1,.04,gold,0,-1.68,.6,tape);
 for(let i=0;i<8;i++)box(.065,.29,.05,gold,-1.4+i*.4,-2,.51,tape);
 for(const side of [-1,1])box(.09,.1,.07,cyan,side*3.65,-1.25,.43,tape);
 const tapeLine=new T.CatmullRomCurve3([new T.Vector3(-2.85,2.03,.5),new T.Vector3(-1.5,1.87,.5),new T.Vector3(0,2.15,.55),new T.Vector3(1.5,1.87,.5),new T.Vector3(2.85,2.03,.5)]);
 mesh(new T.TubeGeometry(tapeLine,80,.045,5,false),gold);
 // Thick copper strip, not just a set of glowing lines. Edge tubes provide the neon optical language.
 const route=new T.CatmullRomCurve3([
  new T.Vector3(2.85,2.03,.5),new T.Vector3(5.5,1.5,2.5),new T.Vector3(9.4,3,-1),new T.Vector3(7.5,7,-8),new T.Vector3(.5,10,-13),new T.Vector3(-7.5,8,-10),new T.Vector3(-10,3.8,-3),new T.Vector3(-5,1.3,5),new T.Vector3(3.5,2.3,8.5),new T.Vector3(10,6,3.3),new T.Vector3(8,11,-6),new T.Vector3(.5,12,-12.5),new T.Vector3(-6,9,-8),new T.Vector3(-6,4,-2),new T.Vector3(-2.85,2.03,.5)
 ],false,'catmullrom',.5);
 const segments=720,verts:number[]=[],uvs:number[]=[],indices:number[]=[],frames=route.computeFrenetFrames(segments,false),edgeA:T.Vector3[]=[],edgeB:T.Vector3[]=[];
 for(let i=0;i<=segments;i++){const u=i/segments,p=route.getPointAt(u),n=frames.normals[i].clone().multiplyScalar(.24+c.detail*.2);const a=p.clone().add(n),b=p.clone().sub(n);verts.push(a.x,a.y,a.z,b.x,b.y,b.z);uvs.push(u,0,u,1);edgeA.push(a);edgeB.push(b);if(i<segments){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}
 const stripGeo=new T.BufferGeometry();stripGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));stripGeo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));stripGeo.setIndex(indices);stripGeo.computeVertexNormals();
 const strip=mesh(stripGeo,new T.MeshPhysicalMaterial({color:'#b450a7',emissive:c.primary,emissiveIntensity:.09,metalness:.72,roughness:.24,clearcoat:1,side:T.DoubleSide}));
 const makeEdge=(points:T.Vector3[],mat:T.Material)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),segments,.022,5,false),mat);
 const edgeOne=makeEdge(edgeA,pink),edgeTwo=makeEdge(edgeB,cyan);
 const pulse=mesh(new T.SphereGeometry(.11,16,12),luminous('#fff3dd',3.3));
 const particles=new T.Group();scene.add(particles);const particleData:{mesh:T.Mesh;u:number}[]=[];
 for(let i=0;i<40+c.count*6;i++){const m=mesh(new T.SphereGeometry(.012+hash(i,c.seed)*.022,5,4),i%3?cyan:pink,0,0,0,particles);particleData.push({mesh:m,u:hash(i,c.seed)});}
 // The ride enters the tape's own frequency chamber. Keep the exterior reflection
 // out of this view: it used to fragment the track and obscure the vanishing point.
 const exterior=new T.Group();for(const object of [...scene.children])if(!(object instanceof T.Light))exterior.add(object);scene.add(exterior);
 const chamber=new T.Group();scene.add(chamber);
 const bend=(z:number)=>Math.sin(z*.024)*.8;
 const gateShape=new T.Shape(),gw=7.3,gh=4.7,gr=.7;
 gateShape.absarc(gw/2-gr,gh/2-gr,gr,0,Math.PI/2,false);gateShape.absarc(-gw/2+gr,gh/2-gr,gr,Math.PI/2,Math.PI,false);gateShape.absarc(-gw/2+gr,-gh/2+gr,gr,Math.PI,Math.PI*1.5,false);gateShape.absarc(gw/2-gr,-gh/2+gr,gr,Math.PI*1.5,TAU,false);gateShape.closePath();
 const gateCurve=new T.CatmullRomCurve3(gateShape.getPoints(72).map(p=>new T.Vector3(p.x,p.y,0)),true,'catmullrom',.1);
 const gateGeometry=new T.TubeGeometry(gateCurve,96,.026,6,true),braceGeometry=new T.TubeGeometry(gateCurve,96,.095,6,true);
 const spacing=lerp(3.8,2.7,(c.count-3)/11),gateCount=Math.ceil(150/spacing),gates:{mesh:T.Mesh;material:T.MeshStandardMaterial;z:number}[]=[];
 for(let i=0;i<gateCount;i++){
  const z=5-i*spacing,m=luminous(i%3===0?c.primary:c.secondary,1.15),gate=mesh(gateGeometry,m,bend(z),3.8,z,chamber);gates.push({mesh:gate,material:m,z});
  if(i%3===0){const brace=mesh(braceGeometry,black,bend(z),3.8,z-.13,chamber);brace.scale.set(1.025,1.025,1);}
  // Readable solid blocks form a travelling stereo envelope on the two walls.
  for(const side of [-1,1]){const h=.3+hash(i*2+(side+1),c.seed)*1.6;box(.11,h,.35,i%3===0?pink:cyan,bend(z)+side*3.55,3.8,z,chamber);}
 }
 const railPoints=(side:number,edge:number)=>Array.from({length:180},(_,i)=>{const z=12-i*1.08;return new T.Vector3(bend(z)+side*1.83+edge,1.47,z);});
 for(const side of [-1,1]){
  const points=railPoints(side,0),railGeometry=new T.BufferGeometry(),positions:number[]=[],ids:number[]=[];
  points.forEach((p,i)=>{positions.push(p.x-.48,p.y,p.z,p.x+.48,p.y,p.z);if(i<points.length-1){const n=i*2;ids.push(n,n+1,n+2,n+1,n+3,n+2);}});
  railGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));railGeometry.setIndex(ids);railGeometry.computeVertexNormals();mesh(railGeometry,material(side<0?'#442047':'#174858',.28,.75),0,0,0,chamber);
  for(const edge of [-.49,.49])mesh(new T.TubeGeometry(new T.CatmullRomCurve3(railPoints(side,edge)),180,.018,5,false),side<0?pink:cyan,0,0,0,chamber);
 }
 const flightSparks:{mesh:T.Mesh;z:number;x:number;y:number}[]=[];
 for(let i=0;i<85;i++){const z=-hash(i+350,c.seed)*150,x=(hash(i+70,c.seed)-.5)*5.8,y=1.7+hash(i+170,c.seed)*4.2,m=box(.014,.014,.18,i%4?cyan:pink,x,y,z,chamber);flightSparks.push({mesh:m,z,x,y});}
 // A folded magnetic strip physically occludes the lens at the change of scale.
 // The camera-space surface is a shot bridge, not a whole-image dissolve.
 const foil=document.createElement('canvas');foil.width=1536;foil.height=512;const fg=foil.getContext('2d')!;
 const copper=fg.createLinearGradient(0,0,0,512);copper.addColorStop(0,'#3e2031');copper.addColorStop(.18,'#e6ba7b');copper.addColorStop(.27,'#6f3b41');copper.addColorStop(.68,'#a8674d');copper.addColorStop(.86,'#f8d495');copper.addColorStop(1,'#432437');fg.fillStyle=copper;fg.fillRect(0,0,1536,512);
 for(let i=0;i<360;i++){fg.fillStyle=i%7?'#10062216':'#fff0bd30';fg.fillRect(0,i*1.42,1536,.7);}
 fg.fillStyle='#1b1327';fg.font='700 55px monospace';fg.fillText('MAGNETIC / SIGNAL TRANSFER',70,170);fg.font='26px monospace';fg.fillText('MIDNIGHT FREQUENCY   //   90 MIN   //   SIDE A',74,224);
 for(let i=0;i<45;i++){fg.fillStyle=i%5?c.secondary:'#fee0a7';fg.fillRect(65+i*32,360,i%5?2:5,i%5?38:64);}
 const foilTexture=new T.CanvasTexture(foil);foilTexture.colorSpace=T.SRGBColorSpace;
 const foilMaterial=new T.MeshPhysicalMaterial({map:foilTexture,color:'#f8e0c7',emissive:'#b8783c',emissiveIntensity:.15,metalness:.64,roughness:.26,clearcoat:1,side:T.DoubleSide});
 const foldGeometry=new T.PlaneGeometry(8,3.6,70,8),foldBase=Float32Array.from(foldGeometry.attributes.position.array),fold=mesh(foldGeometry,foilMaterial,0,0,-.35);camera.add(fold);scene.add(camera);fold.rotation.z=-.19;fold.scale.setScalar(.28);
 // The departure gate rounds and closes into a metal reel. On the other side,
 // that same projected disc contracts onto the actual right spool of the cassette.
 const irisCount=128,irisPositions=new Float32Array((irisCount+1)*2*3),irisUV=new Float32Array((irisCount+1)*4),irisIndices:number[]=[];
 for(let i=0;i<=irisCount;i++){irisUV.set([i/irisCount,0,i/irisCount,1],i*4);if(i<irisCount){const k=i*2;irisIndices.push(k,k+1,k+2,k+1,k+3,k+2);}}
 const irisGeometry=new T.BufferGeometry();irisGeometry.setAttribute('position',new T.BufferAttribute(irisPositions,3));irisGeometry.setAttribute('uv',new T.BufferAttribute(irisUV,2));irisGeometry.setIndex(irisIndices);
 const reelFoil=document.createElement('canvas');reelFoil.width=1536;reelFoil.height=512;const rf=reelFoil.getContext('2d')!;
 rf.fillStyle='#a77b4b';rf.fillRect(0,0,1536,512);
 for(let i=0;i<128;i++){rf.fillStyle=i%4?'#4a294722':'#f2d6a66b';rf.fillRect(0,i*4,1536,i%4?.7:1.5);}
 for(let i=0;i<6;i++){rf.fillStyle='#342639';rf.fillRect(i*256+70,8,35,500);rf.fillStyle='#f2d5a0';rf.fillRect(i*256+78,8,6,500);}
 rf.fillStyle='#e1bd84';rf.fillRect(0,22,1536,6);rf.fillRect(0,92,1536,3);rf.fillRect(0,160,1536,5);
 const reelTexture=new T.CanvasTexture(reelFoil);reelTexture.colorSpace=T.SRGBColorSpace;
 const irisMaterial=new T.MeshPhysicalMaterial({map:reelTexture,color:'#ead0ad',emissive:'#bf783f',emissiveIntensity:.1,metalness:.75,roughness:.37,clearcoat:.55,side:T.DoubleSide,transparent:true});
 const iris=mesh(irisGeometry,irisMaterial,0,0,-.30);camera.add(iris);
 const lipPositions=new Float32Array(irisCount*3),lipGeometry=new T.BufferGeometry();lipGeometry.setAttribute('position',new T.BufferAttribute(lipPositions,3));const lip=new T.LineLoop(lipGeometry,new T.LineBasicMaterial({color:'#ffe5ae',toneMapped:false}));camera.add(lip);lip.position.z=-.2994;
 function aperture(morph:number,outer:number,inner:number,x=0,y=0){
  for(let i=0;i<=irisCount;i++){const a=i/irisCount*TAU,cs=Math.cos(a),sn=Math.sin(a),rx=Math.sign(cs)*Math.abs(cs)**.36,ry=Math.sign(sn)*Math.abs(sn)**.36;
   for(let side=0;side<2;side++){const radius=side?outer:inner,xx=(lerp(rx*1.53,cs,morph)*radius+x)*.1,yy=(lerp(ry,sn,morph)*radius+y)*.1;irisPositions.set([xx,yy,0],(i*2+side)*3);if(!side&&i<irisCount)lipPositions.set([xx,yy,0],i*3);}
  }irisGeometry.attributes.position.needsUpdate=true;irisGeometry.computeVertexNormals();irisGeometry.computeBoundingSphere();lipGeometry.attributes.position.needsUpdate=true;lipGeometry.computeBoundingSphere();
 }
 const target=new T.WebGLRenderTarget(1280,720,{samples:4,type:T.HalfFloatType});
 const composer=new EffectComposer(renderer,target);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new T.Vector2(1280,720),.24,.3,1));composer.addPass(new OutputPass());
 const look=new T.Vector3(),cam=new T.Vector3();
 return {
  draw(seconds:number){
   const cue=filmCue(c,seconds),p=cue.progress,e=smooth(0,1,p),action=cue.action;
   const turns=action==='spool'?p*2:action==='unspool'?2+p*3:action==='ride'?5+p*5:10+p;
   spools.forEach((s,i)=>s.rotation.z=(i?-1:1)*turns*(1+c.intensity));
   tape.position.set(0,3.8,0);tape.rotation.set(0,0,0);
   const reveal=action==='spool'?0:action==='unspool'?smooth(.02,.95,p):1;
   strip.geometry.setDrawRange(0,Math.floor(segments*reveal)*6);
   for(const edge of [edgeOne,edgeTwo])edge.geometry.setDrawRange(0,Math.floor(segments*reveal)*5*6);
   const riding=action==='ride',inChamber=riding&&p>=.102;exterior.visible=!inChamber;chamber.visible=inChamber;particles.visible=reveal>.05;floorLines.visible=!inChamber;
   fold.visible=riding&&p<.225;iris.visible=riding&&p>.78||action==='resolve'&&p<.34;lip.visible=iris.visible;
   amberKey.intensity=action==='resolve'?26+smooth(.2,.8,p)*18:22;
   const trackU=action==='unspool'?Math.max(.001,reveal*.99):riding?.06+.77*e:Math.min(.99,.1+p*.7);
   pulse.position.copy(route.getPointAt(trackU));pulse.visible=reveal>.01;
   particleData.forEach(({mesh:m,u},i)=>{const point=route.getPointAt((u+p*.12)%1),a=i*2.399;m.position.copy(point).add(new T.Vector3(Math.cos(a)*.36,Math.sin(a)*.4,Math.sin(a*.7)*.2));m.visible=u<reveal;});
   if(action==='spool'){
    // Crossing from the reel centre to the cassette face makes the first reveal feel earned.
    cam.set(lerp(-2.2,-.6,e),lerp(4.15,4.7,e),lerp(3.05,7.7,e));look.set(-1.55,3.8,.05);camera.fov=cue.framing==='close'?34:40;
   }else if(action==='unspool'){
    const outward=smooth(0,.60,p),enter=smooth(.62,1,p);
    cam.set(lerp(lerp(-.6,14,outward),1.92,enter),lerp(lerp(4.7,8.4,outward),3.85,enter),lerp(lerp(7.7,19,outward),2.35,enter));
    look.set(lerp(lerp(-1.55,1,outward),1.92,enter),lerp(lerp(3.8,4.8,outward),3.85,enter),lerp(lerp(.05,-2,outward),.48,enter));camera.fov=cue.framing==='close'?34:40;
   }else if(riding){
    const travelP=smooth(.15,.83,p),travel=(58+c.intensity*18)*(travelP*.64+travelP*travelP*.36),z=8-travel;
    if(!inChamber){const approach=smooth(0,.105,p);cam.set(1.92,3.85,lerp(2.35,.93,approach));look.set(1.92,3.85,.48);camera.fov=34;}
    else{cam.set(bend(z)+Math.sin(travelP*TAU)*.11,3.8+Math.sin(travelP*Math.PI)*.14,z);look.set(bend(z-22),3.86,z-22);camera.fov=cue.framing==='close'?53:66;}
    camera.up.set(Math.sin(p*TAU)*.025,1,0);
    gates.forEach(({mesh:m,material:mat,z:gateZ},i)=>{const pulse=Math.exp(-(((gateZ-z+12)/5)**2));mat.emissiveIntensity=1.05+pulse*1.3;m.scale.set(1,1+Math.sin(i*.7+p*TAU*3)*.025*c.intensity,1);});
    flightSparks.forEach(({mesh:m,z:baseZ,x,y},i)=>{const zz=8-((8-baseZ+travel*.15)%150);m.position.set(x+bend(zz),y,zz);m.scale.z=1+p*2;});
   }else{
    const pull=smooth(0,.8,p);cam.set(lerp(1.92,9.5,pull),lerp(3.85,7.4,pull),lerp(2.35,21,pull));look.set(lerp(1.92,-1.1,pull),lerp(3.85,5.3,pull),lerp(.48,-2.4,pull));camera.fov=cue.framing==='close'?34:40;
    // The object tilts just enough to catch the cyan softbox and reveal its machined edges.
    tape.rotation.y=lerp(-.15,.15,e);
   }
   if(!riding)camera.up.set(0,1,0);
   camera.position.copy(cam);camera.lookAt(look);camera.updateProjectionMatrix();camera.updateMatrixWorld();
   if(fold.visible){const u=smooth(0,.225,p),positions=foldGeometry.attributes.position;
    fold.position.x=p<.09?lerp(-1.45,-.85,smooth(0,.09,p)):p<.14?lerp(-.85,.85,smooth(.09,.14,p)):lerp(.85,1.45,smooth(.14,.225,p));fold.rotation.y=lerp(-.09,.09,u);
    for(let i=0;i<positions.count;i++){const x=foldBase[i*3],y=foldBase[i*3+1],curl=smooth(.6,3.9,x);positions.setXYZ(i,x,y,Math.sin(curl*Math.PI)*.65+Math.sin(y*1.6+p*12)*.03);}positions.needsUpdate=true;foldGeometry.computeVertexNormals();}
   irisMaterial.opacity=1;
   if(riding&&p>.78){const u=smooth(.78,1,p),round=smooth(0,.63,u),close=smooth(.35,1,u);aperture(round,lerp(.94,6,u),lerp(.87,0,close));}
   if(action==='resolve'&&p<.34){
    const u=1-(1-smooth(0,.30,p))**2,world=tape.localToWorld(new T.Vector3(1.92,.05,.53)),eye=world.applyMatrix4(camera.matrixWorldInverse),scale=3/-eye.z,r=1.39*scale;
    aperture(1,lerp(6,r,u),lerp(0,r*.96,smooth(.10,.28,p)),eye.x*scale*u,eye.y*scale*u);irisMaterial.opacity=1-smooth(.28,.34,p);
   }
   composer.render();
  },
  dispose(){
   const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
   scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Points){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const value of Object.values(m))if(value instanceof T.Texture)textures.add(value);}}});
   geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();mirror.dispose();composer.passes.forEach(p=>p.dispose());composer.dispose();renderer.dispose();renderer.forceContextLoss();
  }
 };
}

export function paintNeonOverlay(g:CanvasRenderingContext2D,c:EffectConfig,seconds:number){
 const cue=filmCue(c,seconds),p=cue.progress,end=cue.index===(c.shots?.length||4)-1;g.clearRect(0,0,1280,720);g.save();
 const vignette=g.createRadialGradient(640,340,170,640,360,800);vignette.addColorStop(0,'#05031200');vignette.addColorStop(1,'#05031299');g.fillStyle=vignette;g.fillRect(0,0,1280,720);
 g.globalAlpha=.65;g.fillStyle='#e6d8ff';for(let y=0;y<720;y+=4){g.globalAlpha=.022;g.fillRect(0,y,1280,1);}g.globalAlpha=1;
 text(g,'MF / MIDNIGHT FREQUENCY',45,42,13,'#e0d8f5','left',600);text(g,'CHROME • 90',1236,42,12,c.secondary,'right',500);
 const plate=g.createLinearGradient(0,430,0,720);plate.addColorStop(0,'#07041900');plate.addColorStop(.58,'#070419ad');plate.addColorStop(1,'#070419f5');g.fillStyle=plate;g.fillRect(0,430,1280,290);
 if(end){
  const arrival=smooth(.2,.49,p);g.globalAlpha=arrival;
  text(g,'AFTER MIDNIGHT  /  PLAY IT LOUD',59,481,13,'#f5c78c','left',550);
  g.save();g.transform(1,0,-.10,1,70,lerp(24,0,arrival));g.font=`850 ${c.title.length>9?82:c.title.length>6?108:150}px "Noto Sans SC",sans-serif`;g.textAlign='left';g.lineJoin='round';g.lineWidth=.95;g.strokeStyle='#fff0cf';
  const chrome=g.createLinearGradient(0,489,0,634);chrome.addColorStop(0,'#fff4cd');chrome.addColorStop(.27,'#e5b674');chrome.addColorStop(.41,'#fff4d1');chrome.addColorStop(.44,'#342044');chrome.addColorStop(.54,c.secondary);chrome.addColorStop(.78,'#db8ca5');chrome.addColorStop(1,'#ffdfb0');
  g.shadowColor=c.primary;g.shadowBlur=10;g.fillStyle=chrome;g.fillText(c.title,40,628,1110);g.shadowBlur=0;g.strokeText(c.title,40,628,1110);g.restore();
  const glint=smooth(.45,.82,p);g.save();g.globalAlpha=arrival*.8;g.fillStyle='#eab778';g.fillRect(58,646,Math.max(1,glint*630),1);for(let i=0;i<38;i++){g.globalAlpha=arrival*(i%4?.36:.8);g.fillRect(1008+i*5,604,i%3?1:2,i%5?26:35);}g.restore();
  text(g,c.subtitle,59,683,20,'#e6d9d2','left',450,950);text(g,'90 MIN / SIDE A',1195,660,12,c.secondary,'right',500);
 }
 else {g.globalAlpha=smooth(0,.12,p)*(1-smooth(.87,1,p));if(cue.caption)text(g,cue.caption,55,653,24,'#f0e6fc','left',500,1120);}
 g.globalAlpha=.6;text(g,`${String(cue.index+1).padStart(2,'0')} / STEREO`,1236,680,11,'#d8d0ec','right',500);g.restore();
}
