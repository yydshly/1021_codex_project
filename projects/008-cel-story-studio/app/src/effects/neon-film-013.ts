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

// MIDNIGHT FREQUENCY: an original cassette becomes a physical light track.
// All positions are functions of the selected shot, so frame seeking and reordering are deterministic.
export function createThree(canvas:HTMLCanvasElement,c:EffectConfig){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(1280,720,false);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;
 const scene=new T.Scene();scene.background=new T.Color('#070419');scene.fog=new T.FogExp2('#100520',.012);
 const camera=new T.PerspectiveCamera(38,16/9,.05,250);
 const material=(color:string,roughness=.3,metalness=.6)=>new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:.65,clearcoatRoughness:.18});
 const luminous=(color:string,strength=2)=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:strength,metalness:.3,roughness:.25});
 const black=material('#14142c',.25,.8),steel=material('#9da6c3',.27,.92),gold=material('#b28d67',.3,.8),pink=luminous(c.primary,1.55),cyan=luminous(c.secondary,1.5);
 const mesh=(geo:T.BufferGeometry,mat:T.Material,x=0,y=0,z=0,parent:T.Object3D=scene)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;};
 const box=(w:number,h:number,d:number,mat:T.Material,x=0,y=0,z=0,parent:T.Object3D=scene,r=.045)=>mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),mat,x,y,z,parent);
 const ring=(r:number,width:number,mat:T.Material,x:number,y:number,z:number,parent:T.Object3D=scene)=>mesh(new T.TorusGeometry(r,width,8,100),mat,x,y,z,parent);
 const cylinder=(r:number,d:number,mat:T.Material,x:number,y:number,z:number,parent:T.Object3D)=>{const m=mesh(new T.CylinderGeometry(r,r,d,64),mat,x,y,z,parent);m.rotation.x=Math.PI/2;return m;};
 const line=(points:T.Vector3[],color:string,opacity=.4)=>{const m=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color,transparent:true,opacity}));scene.add(m);return m;};
 scene.add(new T.HemisphereLight('#a892d5','#13071f',.55));
 for(const [color,x,y,z,power] of [[c.primary,-7,9,6,32],[c.secondary,7,5,4,35],['#d9dfff',0,10,-5,20]] as const){const l=new T.PointLight(color,power,45,1.5);l.position.set(x,y,z);scene.add(l);}
 const key=new T.DirectionalLight('#dbe5ff',1.1);key.position.set(-7,10,8);scene.add(key);
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
   const riding=action==='ride';exterior.visible=!riding;chamber.visible=riding;particles.visible=reveal>.05;floorLines.visible=!riding;
   const trackU=action==='unspool'?Math.max(.001,reveal*.99):riding?.06+.77*e:Math.min(.99,.1+p*.7);
   pulse.position.copy(route.getPointAt(trackU));pulse.visible=reveal>.01;
   particleData.forEach(({mesh:m,u},i)=>{const point=route.getPointAt((u+p*.12)%1),a=i*2.399;m.position.copy(point).add(new T.Vector3(Math.cos(a)*.36,Math.sin(a)*.4,Math.sin(a*.7)*.2));m.visible=u<reveal;});
   if(action==='spool'){
    // Crossing from the reel centre to the cassette face makes the first reveal feel earned.
    cam.set(lerp(-2.2,-.6,e),lerp(4.15,4.7,e),lerp(3.05,7.7,e));look.set(-1.55,3.8,.05);camera.fov=cue.framing==='close'?34:40;
   }else if(action==='unspool'){
    cam.set(lerp(4.5,14,e),lerp(4.5,8.4,e),lerp(10,19,e));look.set(1,4.8,-2);camera.fov=cue.framing==='close'?32:40;
   }else if(riding){
    const travel=(58+c.intensity*18)*(p*.64+p*p*.36),z=8-travel;
    cam.set(bend(z)+Math.sin(p*TAU)*.11,3.8+Math.sin(p*Math.PI)*.14,z);look.set(bend(z-22),3.86,z-22);camera.fov=cue.framing==='close'?53:66;
    camera.up.set(Math.sin(p*TAU)*.025,1,0);
    gates.forEach(({mesh:m,material:mat,z:gateZ},i)=>{const pulse=Math.exp(-(((gateZ-z+12)/5)**2));mat.emissiveIntensity=1.05+pulse*1.3;m.scale.set(1,1+Math.sin(i*.7+p*TAU*3)*.025*c.intensity,1);});
    flightSparks.forEach(({mesh:m,z:baseZ,x,y},i)=>{const zz=8-((8-baseZ+travel*.15)%150);m.position.set(x+bend(zz),y,zz);m.scale.z=1+p*2;});
   }else{
    cam.set(lerp(13,9,e),lerp(8,6,e),lerp(22,18,e));look.set(0,5.2,-2.4);camera.fov=cue.framing==='close'?31:39;
    // The object tilts just enough to catch the cyan softbox and reveal its machined edges.
    tape.rotation.y=lerp(-.15,.15,e);
   }
   if(!riding)camera.up.set(0,1,0);
   camera.position.copy(cam);camera.lookAt(look);camera.updateProjectionMatrix();composer.render();
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
 const plate=g.createLinearGradient(0,510,0,720);plate.addColorStop(0,'#07041900');plate.addColorStop(1,'#070419ee');g.fillStyle=plate;g.fillRect(0,510,1280,210);
 if(end){
  g.globalAlpha=smooth(.03,.3,p);text(g,'AFTER MIDNIGHT / PLAY IT LOUD',57,548,11,c.secondary,'left',500);
  g.save();g.transform(1,0,-.12,1,75,0);g.font=`850 ${c.title.length>9?55:72}px "Noto Sans SC",sans-serif`;g.textAlign='left';g.lineJoin='round';g.lineWidth=1;g.strokeStyle='#fee8fb';
  const chrome=g.createLinearGradient(0,562,0,624);chrome.addColorStop(0,'#effbff');chrome.addColorStop(.32,c.secondary);chrome.addColorStop(.48,'#f8f6ff');chrome.addColorStop(.51,'#693b81');chrome.addColorStop(.72,c.primary);chrome.addColorStop(1,'#f2c8d9');
  g.shadowColor=c.primary;g.shadowBlur=16;g.fillStyle=chrome;g.fillText(c.title,54,620,1090);g.shadowBlur=0;g.strokeText(c.title,54,620,1090);g.restore();
  text(g,c.subtitle,57,659,20,'#d3c8e5','left',450,1100);
 }
 else {g.globalAlpha=smooth(0,.12,p)*(1-smooth(.87,1,p));if(cue.caption)text(g,cue.caption,55,653,24,'#f0e6fc','left',500,1120);}
 g.globalAlpha=.6;text(g,`${String(cue.index+1).padStart(2,'0')} / STEREO`,1236,680,11,'#d8d0ec','right',500);g.restore();
}
