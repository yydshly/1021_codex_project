import * as T from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type {EffectConfig} from '../../scripts/effects.mjs';
import type {EffectAssets} from './canvas';
import {filmCue} from './film-cue';
import {hash,clamp,smooth,lerp,TAU,text} from './math';

/** An original, deterministic science-fiction observation film. All readings are simulated. */
type G=CanvasRenderingContext2D;
type State={action:string;u:number;index:number;caption:string;close:boolean;camera:T.Vector3;target:T.Vector3;position:T.Vector3;rotation:T.Euler;scan:number;energy:number;flap:number;light:number;time:number;localSeconds:number};
const stages=['ping','inspect','decode','awaken'];
function state(c:EffectConfig,seconds:number):State{
 const q=filmCue(c,seconds),u=clamp(q.progress),stage=stages.includes(q.action)?q.action:'ping',close=q.framing==='close';
 let camera=new T.Vector3(11,6,16),target=new T.Vector3(0,0,0),scan=6-14*u,energy=.07,flap=.04,light=.5;
 const position=new T.Vector3(0,.15,0),rotation=new T.Euler(.02,-.16,.02);
 if(stage==='ping'){camera.set(lerp(12,9,u),lerp(7.7,6.2,u),lerp(18,15,u));energy=.05+smooth(.48,.9,u)*.2;light=.23+smooth(.35,.9,u)*.6;flap=.02;}
 if(stage==='inspect'){camera.set(lerp(8,6.5,u),lerp(4.8,5.5,u),lerp(8,5,u));target.set(1.1,0,.2-u*1.2);scan=4-10*u;energy=.22;light=1.15;flap=.02;}
 if(stage==='decode'){camera.set(lerp(3.8,6,u),lerp(8.7,7.3,u),lerp(8,11,u));target.set(0,.1,-.7);energy=smooth(.08,.7,u);light=.8+energy*.4;scan=-10;flap=.025+energy*.07;}
 if(stage==='awaken'){
  const gather=smooth(0,.17,u),stroke=smooth(.16,.59,u),settle=smooth(.62,.96,u);
  camera.set(lerp(6,8,u),lerp(5.2,6.7,u),lerp(12,18.8,u));target.set(-.3*stroke,lerp(.25,2.5,u),-.2);
  energy=.88+.08*stroke;light=1.17;scan=-10;
  // Fold down in anticipation, then make an unmistakable upstroke and hold the living silhouette.
  flap=.035+gather*.12-stroke*(.44+c.intensity*.15)+settle*.11;
  position.set(-.55*stroke,.2-gather*.16+stroke*2.35,.65*stroke);
  rotation.set(.02-stroke*.13+settle*.04,-.16+stroke*.82-settle*.12,.02-stroke*.25+settle*.08);
 }
 if(close){const d=camera.clone().sub(target);camera=target.clone().add(d.multiplyScalar(stage==='inspect'?.86:stage==='ping'?.9:.78));}
 return {action:stage,u,index:q.index,caption:q.caption,close,camera,target,position,rotation,scan,energy,flap,light,time:seconds,localSeconds:q.localSeconds};
}
function configureCamera(camera:T.PerspectiveCamera,s:State){camera.position.copy(s.camera);camera.lookAt(s.target);camera.updateMatrixWorld();}
function wingPoint(u:number,v:number,lift=0){const front=2.55-1.3*u-1.2*u*u,back=-2.65+1.3*u+1.2*u*u;return new T.Vector3(.66+5.8*u,.12+Math.sin(u*Math.PI)*.35+Math.sin(v*Math.PI)*.21+lift,lerp(front,back,v));}
function wingPatch(u0:number,u1:number,v0:number,v1:number,lift=0){
 const positions:number[]=[],uv:number[]=[],indices:number[]=[],nx=6,nz=6;
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const p=wingPoint(lerp(u0,u1,i/nx),lerp(v0,v1,j/nz),lift);positions.push(p.x,p.y,p.z);uv.push(i/nx,j/nz);}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,d=a+nx+1,e=d+1;indices.push(a,d,b,b,d,e);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
export function createThree(canvas:HTMLCanvasElement,c:EffectConfig,_assets:EffectAssets={}){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setSize(1280,720,false);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 const scene=new T.Scene();scene.background=new T.Color('#020d18');scene.fog=new T.FogExp2('#031521',.018);
 const camera=new T.PerspectiveCamera(39,16/9,.1,160);
 const lights:T.Light[]=[];const addLight=(color:string,intensity:number,x:number,y:number,z:number)=>{const l=new T.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l);lights.push(l);return l;};
 const key=addLight('#92dcea',3.2,-5,9,9),rim=addLight(c.primary,3.2,4,4,-8),warm=addLight(c.secondary,1.8,-9,2,-4);scene.add(new T.HemisphereLight('#448097','#011018',.9));key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-18;key.shadow.camera.right=18;key.shadow.camera.top=18;key.shadow.camera.bottom=-18;key.shadow.normalBias=.025;
 const material=(color:string,roughness=.4,metalness=.68)=>new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:roughness>.8?0:.45,clearcoatRoughness:.28,side:T.DoubleSide});
 const dark=material('#122e3b',.48,.65),panelA=material('#426977',.38,.7),panelB=material('#254a59',.48,.6),edgeMat=material('#80a6a7',.32,.8),bronze=material('#846b42',.42,.77);
 const emissive=(color:string,intensity=.8)=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.35,metalness:.2});
 const cyan=emissive(c.primary,1),amber=emissive(c.secondary,.8),softCyan=emissive(c.primary,.3);
 
 const mesh=(geo:T.BufferGeometry,mat:T.Material,parent:T.Object3D=scene)=>{const m=new T.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const sphere=(x:number,y:number,z:number,sx:number,sy:number,sz:number,mat:T.Material,parent:T.Object3D=scene)=>{const m=mesh(new T.SphereGeometry(1,40,24),mat,parent);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;};
 const box=(w:number,h:number,d:number,mat:T.Material,x:number,y:number,z:number,parent:T.Object3D=scene)=>{const m=mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.06,w/4,h/4,d/4)),mat,parent);m.position.set(x,y,z);return m;};
 const tube=(pts:T.Vector3[],rad:number,mat:T.Material,parent:T.Object3D=scene)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),Math.max(24,pts.length*5),rad,6,false),mat,parent);
 const line=(pts:T.Vector3[],color:string,opacity=.5,parent:T.Object3D=scene)=>{const m=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color,transparent:true,opacity}));parent.add(m);return m;};
 // The seafloor is a landscape rather than a decorative grid. Fine contour cuts sit below the target.
 const groundGeo=new T.PlaneGeometry(180,180,70,70);groundGeo.rotateX(-Math.PI/2);const gp=groundGeo.getAttribute('position');for(let i=0;i<gp.count;i++){const x=gp.getX(i),z=gp.getZ(i);gp.setY(i,Math.sin(x*.13+z*.07)*Math.cos(z*.19)*.3);}groundGeo.computeVertexNormals();const seabed=mesh(groundGeo,material('#10232b',.98,.1));seabed.position.y=-4.5;
 for(let i=0;i<46;i++){const a=hash(i,c.seed)*TAU,rad=9+hash(i+50,c.seed)*28,h=1+hash(i+100,c.seed)*7;const rg=new T.DodecahedronGeometry(1,1),rp=rg.getAttribute('position');for(let j=0;j<rp.count;j++){const x=rp.getX(j),y=rp.getY(j),z=rp.getZ(j),r=1+.15*Math.sin(x*5+y*2+z*3)+.08*Math.cos(z*6+x*3);rp.setXYZ(j,x*r,y*r,z*r);}rg.computeVertexNormals();const rm=material(i%2?'#17313a':'#1e3c43',1,0);rm.flatShading=true;const rock=mesh(rg,rm);rock.position.set(Math.cos(a)*rad,-4.5+h*.4,Math.sin(a)*rad);rock.scale.set(1.5+hash(i+200,c.seed)*3,h,1.3+hash(i+250,c.seed)*2);rock.rotation.set(i,.4*i,.12);}
 const contours=new T.Group();scene.add(contours);for(let i=0;i<14;i++){const r=3+i*1.7;line(Array.from({length:160},(_,j)=>{const a=j/159*TAU;return new T.Vector3(Math.cos(a)*r,-4.43+Math.sin(a*3+i)*.015,Math.sin(a)*r*.68);}),c.primary,.055,contours);}
 // The remotely operated vehicle at lower left establishes scale and is the source of the ping.
 const rov=new T.Group();rov.position.set(-7,-2.7,3.1);rov.rotation.y=.4;scene.add(rov);box(1.15,.62,.85,bronze,0,0,0,rov);box(.85,.2,1.07,dark,0,-.23,0,rov);box(.78,.28,.05,panelA,0,.04,.45,rov);for(const side of [-1,1]){const engine=mesh(new T.CylinderGeometry(.21,.21,.8,16),dark,rov);engine.rotation.x=Math.PI/2;engine.position.set(side*.72,-.06,0);mesh(new T.TorusGeometry(.18,.035,8,20),edgeMat,rov).position.set(side*.72,-.06,.42);sphere(side*.36,.05,.5,.085,.085,.045,cyan,rov);}tube([new T.Vector3(0,.3,-.4),new T.Vector3(-.7,1.1,-1),new T.Vector3(-1.5,.7,-2.4)],.018,bronze,rov);
 // Independent plated wings, ribs, cephalic horns and articulated tail make a recognisable mechanical ray.
 const manta=new T.Group();scene.add(manta);sphere(0,.05,-.2,.9,.55,2.55,dark,manta);sphere(0,.22,.45,.68,.33,1.65,panelA,manta);sphere(0,-.14,1.77,.65,.26,.55,edgeMat,manta);box(.32,.24,2.5,bronze,0,.48,-.6,manta);box(.12,.07,2.65,cyan,0,.63,-.6,manta);
 const wings:T.Group[]=[],wingPanels:T.Mesh[][]=[],ribs=5+Math.round(c.detail*4);
 for(const side of [-1,1]){
  const wing=new T.Group();wing.scale.x=side;manta.add(wing);wings.push(wing);const panels:T.Mesh[]=[];wingPanels.push(panels);
  const under=mesh(wingPatch(0,1,0,1,-.12),dark,wing);under.material=dark;
  for(let i=0;i<ribs;i++)for(let j=0;j<3;j++){const u0=i/ribs+.007,u1=(i+1)/ribs-.008,v0=j/3+.013,v1=(j+1)/3-.012;const panel=mesh(wingPatch(u0,u1,v0,v1,.015),i%3===0?panelA:panelB,wing);panels.push(panel);const outline=new T.LineSegments(new T.EdgesGeometry(panel.geometry,30),new T.LineBasicMaterial({color:'#83a6ad',transparent:true,opacity:.32}));panel.add(outline);}
  for(let i=0;i<=ribs;i++){const u=i/ribs;const pts=Array.from({length:16},(_,j)=>wingPoint(u,j/15,.045));tube(pts,i%2?.018:.026,edgeMat,wing);}
  for(const v of [0,1]){const points=Array.from({length:35},(_,i)=>wingPoint(i/34,v,.035));tube(points,.034,edgeMat,wing);tube(points,.016,cyan,wing);}
  for(let j=1;j<=2;j++)tube(Array.from({length:36},(_,i)=>wingPoint(i/35,j/3,.04)),.013,j===1?cyan:amber,wing);
  // Close-spaced gill vanes cast their own silhouette in the inspection shot.
  for(let k=0;k<7;k++){const fin=box(.09,.16,.38,bronze,side*.74,.27,1.4-k*.27,manta);fin.rotation.z=side*.4;}
  const horn=[new T.Vector3(side*.42,-.04,2),new T.Vector3(side*.68,-.12,2.65),new T.Vector3(side*.82,.13,3.05),new T.Vector3(side*.63,.28,3.1)];tube(horn,.12,panelA,manta);tube(horn,.025,cyan,manta);sphere(side*.52,.22,1.91,.09,.075,.11,cyan,manta);
 }
 const tail=new T.Group();manta.add(tail);for(let i=0;i<12;i++){const z=-2.3-i*.52,x=Math.sin(i*.22)*.25,rad=.115*(1-i/14);const seg=mesh(new T.CylinderGeometry(rad*.8,rad,.59,10),i%3?dark:bronze,tail);seg.position.set(x,.02+i*.025,z);seg.rotation.x=Math.PI/2;box(.026,.045,.46,cyan,x,.1+i*.025,z,tail);}tube(Array.from({length:25},(_,i)=>new T.Vector3(Math.sin(i*.11)*.25,.15+i*.012,-2.3-i*.25)),.017,cyan,tail);
 const core=sphere(0,.64,-.1,.23,.09,.38,amber,manta);for(let i=0;i<6;i++){const band=mesh(new T.TorusGeometry(.35+i*.035,.013,6,80),i%2?cyan:bronze,manta);band.rotation.x=Math.PI/2;band.position.set(0,.42,-.16);}
 // Scan volume intersects the modeled body, while animated edge strips report the same scan location.
 const scanMat=new T.MeshBasicMaterial({color:c.primary,transparent:true,opacity:.07,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending});const scan=mesh(new T.PlaneGeometry(16,8),scanMat);line([new T.Vector3(-7,-3,0),new T.Vector3(-7,3,0),new T.Vector3(7,3,0),new T.Vector3(7,-3,0)],c.primary,.55,scan);
 const scanLight=new T.PointLight(c.primary,5,12,2);scan.add(scanLight);
 const pingMats:T.MeshBasicMaterial[]=[],pings:T.Mesh[]=[];for(let i=0;i<3;i++){const mat=new T.MeshBasicMaterial({color:c.primary,transparent:true,opacity:.25,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending});pingMats.push(mat);const o=mesh(new T.TorusGeometry(1,.008,6,120),mat);o.rotation.x=-Math.PI/2;o.position.set(-7,-4.35,3.1);pings.push(o);}
 // Three thin wake ribbons are reconstructed from the flight's past poses, never simulated incrementally.
 const wakeSamples=52;
 const wakes=[-1,1,0].map(side=>{
  const positions=new Float32Array(wakeSamples*2*3),colors=new Float32Array(wakeSamples*2*3),indices:number[]=[];
  const col=new T.Color(side===1?c.secondary:c.primary);
  for(let i=0;i<wakeSamples;i++){const fade=(1-i/(wakeSamples-1))**1.7;for(let v=0;v<2;v++){const j=(i*2+v)*3;colors[j]=col.r*fade;colors[j+1]=col.g*fade;colors[j+2]=col.b*fade;}if(i<wakeSamples-1){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));geo.setAttribute('color',new T.BufferAttribute(colors,3));geo.setIndex(indices);
  const mat=new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:side===0?.23:.36,side:T.DoubleSide,blending:T.AdditiveBlending,depthWrite:false});const ribbon=mesh(geo,mat);ribbon.castShadow=false;ribbon.receiveShadow=false;ribbon.frustumCulled=false;
  return {side,positions,geo,ribbon};
 });
 // Streamline packets follow actual wing surfaces, no accumulated particle simulation.
 const packets:T.Mesh[]=[];for(let i=0;i<Math.max(18,c.count*4);i++)packets.push(sphere(0,0,0,.045,.03,.045,i%4?cyan:amber,manta));
 const dustGeo=new T.BufferGeometry(),dustPositions:number[]=[];for(let i=0;i<460+c.count*16;i++)dustPositions.push((hash(i,c.seed)-.5)*65,hash(i+1000,c.seed)*26-5,(hash(i+2000,c.seed)-.5)*70);dustGeo.setAttribute('position',new T.Float32BufferAttribute(dustPositions,3));const dust=new T.Points(dustGeo,new T.PointsMaterial({color:'#9ccdd4',size:.045,transparent:true,opacity:.34,depthWrite:false}));scene.add(dust);
 // Faint down-light cones give depth without pretending to be a volumetric fluid solver.
 const shaftMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,vertexShader:'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv; void main(){float a=pow(sin(vUv.x*3.14159),4.0)*pow(sin(vUv.y*3.14159),2.0); gl_FragColor=vec4(.2,.65,.74,a*.018);}'});for(let i=0;i<3;i++){const shaft=mesh(new T.ConeGeometry(3.5,35,24,1,true),shaftMat);shaft.position.set(-12+i*13,10,-13-i*3);shaft.rotation.z=-.22;}
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new T.Vector2(1280,720),.32,.45,.85));composer.addPass(new OutputPass());
 return {draw(seconds:number){
  const s=state(c,seconds);configureCamera(camera,s);manta.position.copy(s.position);manta.rotation.copy(s.rotation);key.intensity=3.2*s.light;rim.intensity=2.2+s.energy*1.7;warm.intensity=.9+s.energy*.9;cyan.emissiveIntensity=.3+s.energy*1.7;amber.emissiveIntensity=.25+s.energy*1.7;softCyan.emissiveIntensity=.2+s.energy*.6;
  wings.forEach((w,i)=>{w.rotation.z=(i===0?1:-1)*(s.flap+Math.sin(seconds*1.6+i*.2)*.018*c.intensity);wingPanels[i].forEach((p,j)=>{p.position.y=s.action==='inspect'?Math.sin(s.u*Math.PI)*.055*(j%3):0;});});tail.rotation.y=Math.sin(seconds*.9)*.04*c.intensity+(s.action==='awaken'?Math.sin(s.u*Math.PI)*.19:0);tail.rotation.x=s.action==='awaken'?-Math.sin(s.u*Math.PI)*.055:0;core.scale.set(.23*(1+s.energy*.3),.09,.38*(1+s.energy*.12));
  scan.visible=s.action==='inspect'||s.action==='ping';scan.position.set(0,s.position.y,s.scan);scanMat.opacity=s.action==='inspect'?.055:.022;scanLight.intensity=s.action==='inspect'?8:2;
  pings.forEach((p,i)=>{const phase=(s.u*1.25+i/3)%1;p.visible=s.action==='ping'||s.action==='awaken';p.position.set(s.action==='ping'?-7:0,-4.35,s.action==='ping'?3.1:0);p.scale.setScalar(1+phase*19);pingMats[i].opacity=(1-phase)*.24;});
  wakes.forEach(({side,positions,geo,ribbon})=>{
   ribbon.visible=s.action==='awaken'&&s.u>.05;
   if(!ribbon.visible)return;
   for(let i=0;i<wakeSamples;i++){
    const age=i/(wakeSamples-1),lag=age*Math.min(1.25,s.localSeconds),past=state(c,Math.max(0,seconds-lag));
    const q=side===0?new T.Vector3(0,.3,-7.9):wingPoint(.985,.58,.075);
    if(side!==0){q.x*=side;q.applyAxisAngle(new T.Vector3(0,0,1),(side===-1?1:-1)*past.flap);}
    q.applyEuler(past.rotation).add(past.position);q.z-=lag*(side===0?2.6:1.65);q.y-=age*.16;
    const width=(side===0?.026:.045)*(1-age*.75)*smooth(.03,.3,s.u);
    const view=camera.position.clone().sub(q).normalize(),tangent=new T.Vector3(.1,.7,2),normal=tangent.cross(view).normalize().multiplyScalar(width);
    for(let v=0;v<2;v++){const j=(i*2+v)*3,sign=v?1:-1;positions[j]=q.x+normal.x*sign;positions[j+1]=q.y+normal.y*sign;positions[j+2]=q.z+normal.z*sign;}
   }
   geo.getAttribute('position').needsUpdate=true;
  });
  packets.forEach((p,i)=>{const side=i%2?1:-1,u=(s.u*(.8+c.intensity*.5)+i/packets.length)%1,v=i%3===0?1/3:2/3;const q=wingPoint(u,v,.10);q.x*=side;q.applyAxisAngle(new T.Vector3(0,0,1),wings[side===-1?0:1].rotation.z);p.position.copy(q);p.visible=s.action==='decode'||s.action==='awaken';const amp=.6+s.energy*.9;p.scale.set(.045*amp,.03*amp,.045*amp);});dust.position.y=-(seconds*.075%1);rov.position.y=-2.7+Math.sin(seconds*.8)*.04;contours.rotation.y=.025*Math.sin(seconds*.1);composer.render();
 },dispose(){const gs=new Set<T.BufferGeometry>(),ms=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Points){gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])ms.add(m);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());lights.forEach(l=>{if(l instanceof T.DirectionalLight)l.shadow.dispose();});composer.passes.forEach(p=>p.dispose());composer.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
function path(g:G,points:number[][],color:string,width=1){g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.strokeStyle=color;g.lineWidth=width;g.stroke();}
function mono(g:G,value:string,x:number,y:number,size=11,color='#74b3bb',align:CanvasTextAlign='left'){g.fillStyle=color;g.font=`500 ${size}px Consolas,monospace`;g.textAlign=align;g.fillText(value,x,y);}
function projected(s:State,p:T.Vector3){const cam=new T.PerspectiveCamera(39,16/9,.1,160);configureCamera(cam,s);p.applyEuler(s.rotation).add(s.position).project(cam);return {x:(p.x*.5+.5)*1280,y:(.5-p.y*.5)*720};}
export function paintHudOverlay(g:G,c:EffectConfig,seconds:number){
 const s=state(c,seconds),u=s.u,fg='#d6edef',cyan=c.primary,amber=c.secondary;g.clearRect(0,0,1280,720);g.save();
 // Edge shading protects the data without putting a large opaque dashboard across the creature.
 const shade=g.createLinearGradient(0,0,1280,0);shade.addColorStop(0,'#020e1aec');shade.addColorStop(.22,'#020e1a18');shade.addColorStop(.77,'#020e1a00');shade.addColorStop(1,'#020e1acb');g.fillStyle=shade;g.fillRect(0,0,1280,720);
 path(g,[[40,59],[40,38],[63,38]],cyan,1.2);path(g,[[1240,59],[1240,38],[1217,38]],cyan,1.2);path(g,[[40,661],[40,682],[63,682]],cyan,1.2);path(g,[[1240,661],[1240,682],[1217,682]],cyan,1.2);
 mono(g,'BATHYS / ABYSSAL OBSERVATORY',65,48,11,fg);mono(g,'MISSION 013  /  ROV-07',1217,48,11,cyan,'right');path(g,[[65,64],[1217,64]],'#4b9ba242',.8);
 const stageLabels:Record<string,string>={ping:'01 / 广域声呐',inspect:'02 / 近距断层扫描',decode:'03 / 能量回路解析',awaken:'04 / 自主运动确认'};
 text(g,stageLabels[s.action],65,101,15,cyan,'left',550);mono(g,'HADAL ZONE / M-07',65,125,10,'#8ba5b0');
 text(g,'深度',65,192,11,'#85a6ad','left',400);mono(g,(3812.4+s.position.y*-.7).toFixed(1),64,237,39,fg);mono(g,'METRES  /  SIM',66,257,10,cyan);
 path(g,[[65,280],[250,280]],'#4b9ba260');
 const rise=s.position.y-.2;const measurements=[['RANGE',`${(s.camera.distanceTo(s.position)*3.8).toFixed(2)} M`],['SPAN',`${(12.92*Math.cos(s.flap)).toFixed(2)} M`],[s.action==='awaken'?'ASCENT':'SCAN Z',`${(s.action==='awaken'?rise:s.scan).toFixed(2)} M`],['POWER',`${Math.round(s.energy*100)} %`]];
 measurements.forEach(([k,v],i)=>{mono(g,k,65,307+i*27,10,'#79a6ad');mono(g,v,249,307+i*27,12,fg,'right');});
 // A small plan view shows the same scan crossing a manta-shaped silhouette.
 const ox=1144,oy=191;g.strokeStyle=cyan+'65';g.lineWidth=.8;g.beginPath();g.arc(ox,oy,67,0,TAU);g.stroke();g.beginPath();g.arc(ox,oy,43,0,TAU);g.stroke();path(g,[[ox-73,oy],[ox+73,oy]],cyan+'35');path(g,[[ox,oy-73],[ox,oy+73]],cyan+'35');
 g.save();g.translate(ox,oy);g.rotate(s.action==='awaken'?-s.rotation.y*.4:0);g.scale(s.action==='awaken'?Math.cos(s.flap):1,1);g.beginPath();g.moveTo(0,-27);g.bezierCurveTo(12,-20,24,-13,53,7);g.lineTo(12,18);g.lineTo(0,53);g.lineTo(-12,18);g.lineTo(-53,7);g.bezierCurveTo(-24,-13,-12,-20,0,-27);g.fillStyle=cyan+'18';g.fill();g.strokeStyle=cyan+'9c';g.stroke();const sy=clamp((4-s.scan)/12)*92-42;path(g,[[-60,sy],[60,sy]],amber,1.5);g.restore();
 mono(g,'TARGET / MANTA-07',1144,288,10,fg,'center');mono(g,s.action==='ping'?'ECHO RETURN':s.action==='inspect'?'STRUCTURE MAPPED':s.action==='decode'?'CIRCUIT LIVE':u<.28?'MOVEMENT DETECTED':'SELF-PROPELLED',1144,311,10,s.action==='awaken'?amber:cyan,'center');
 if(s.action==='awaken'){
  const motion=smooth(.10,.32,u);g.globalAlpha=motion;
  path(g,[[474,95],[489,83],[790,83],[805,95],[790,107],[489,107],[474,95]],amber+'b0',1);
  mono(g,u<.47?'MOTION DETECTED / 运动响应':'SELF-PROPELLED / 自主舒翼',640,99,11,amber,'center');
  mono(g,'ASCENT PROFILE',65,456,10,amber);
  path(g,[[65,501],[248,501]],cyan+'50',.8);
  const pts:number[][]=[];for(let i=0;i<54;i++){const phase=i/53,local=clamp(phase*(u+.15));const ascent=-smooth(0,.17,local)*.16+smooth(.16,.59,local)*2.35;pts.push([65+i*3.4,499-ascent*15]);}path(g,pts,amber,1.3);mono(g,`+${rise.toFixed(2)} M / ACTIVE`,65,524,11,amber);g.globalAlpha=1;
 }
 // Brackets really track the 3D body rather than pointing to unrelated screen coordinates.
 const a=projected(s,new T.Vector3(0,.3,.5)),r=s.action==='ping'?lerp(130,70,smooth(.25,.9,u)):52;const cx=clamp(a.x,325,960),cy=clamp(a.y,170,480);g.globalAlpha=s.action==='ping'?smooth(.2,.7,u):.65;
 for(const sx of [-1,1])for(const sy of [-1,1])path(g,[[cx+sx*(r-12),cy+sy*r],[cx+sx*r,cy+sy*r],[cx+sx*r,cy+sy*(r-12)]],s.action==='awaken'?amber:cyan,1.2);g.globalAlpha=1;
 path(g,[[cx+r,cy],[cx+r+34,cy],[cx+r+48,cy-17]],cyan+'80',.8);mono(g,'M-07',cx+r+51,cy-20,10,cyan);
 // The spectrum is driven by the same energy envelope as the luminous wing packets.
 mono(g,'RESONANCE / ENERGY RESPONSE',1039,386,10,cyan);for(let i=0;i<37;i++){const h=4+Math.sin(i*.43+seconds*3)**2*(7+s.energy*38)+Math.exp(-(((i-21)/6)**2))*s.energy*22;g.fillStyle=i>18&&i<25?amber:cyan+'80';g.fillRect(1040+i*4.8,466-h,2.3,h);}path(g,[[1038,473],[1219,473]],cyan+'55',.8);
 for(let i=0;i<5;i++){const y=500+i*19;mono(g,['MESH','PHASE','ECHO','LINK','CORE'][i],1040,y,9,'#6e9ca7');mono(g,i===0?'042 / 042':i===1?`${(s.energy*TAU).toFixed(3)}`:i===2?`${(18+s.energy*46).toFixed(1)} DB`:i===3?'STABLE':s.energy>.75?'ONLINE':'STANDBY',1217,y,10,i===4&&s.energy>.75?amber:fg,'right');}
 // A quiet baseline and four edit-aware blocks give the full sequence a readable progression.
 path(g,[[65,620],[1217,620]],'#6abcc74a',.8);for(let i=0;i<4;i++){g.fillStyle=i===s.index?cyan:'#4e7a8544';g.fillRect(65+i*30,610,i===s.index?23:16,3);}mono(g,`SHOT ${String(s.index+1).padStart(2,'0')}  /  ${s.close?'DETAIL':'WIDE'}`,204,614,10,cyan);
 const ending=s.index===(c.shots?.length||4)-1;if(ending){const alpha=smooth(.12,.48,u);g.globalAlpha=alpha;text(g,c.title,640,548,40,fg,'center',700,650);text(g,c.subtitle,640,578,15,'#9fcbd2','center',400,720);if(s.caption&&s.caption!==c.subtitle)text(g,s.caption,640,604,14,cyan,'center',450,650);g.globalAlpha=1;}else if(s.caption){text(g,s.caption,640,590,22,fg,'center',500,650);}
 mono(g,'SIMULATED OBSERVATION / 程序观测示意',65,657,10,'#6ea4ad');mono(g,`T+${seconds.toFixed(2).padStart(5,'0')}  /  30 FPS`,1217,657,10,'#6ea4ad','right');g.restore();
}
