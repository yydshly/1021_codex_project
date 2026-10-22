import * as T from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import type {EffectConfig} from '../../scripts/effects.mjs';
import {hash,smooth,lerp,TAU} from './math';

/** A shaped, closed shell. The two surfaces and rolled copper edge are genuine geometry. */
function petalGeometry(length:number,width:number,curl:number){
 const longitudinal=30,lateral=14,positions:number[]=[],indices:number[]=[],groups:{start:number;count:number;materialIndex:number}[]=[];
 const stride=lateral+1,layer=(longitudinal+1)*stride;
 const surface=(u:number,v:number,side:number)=>{
  const profile=.035+Math.pow(Math.sin(Math.PI*u),.72)*width;
  const x=v*profile;
  const y=curl*u*u+.15*v*v*Math.sin(Math.PI*u)+side*.023;
  return [x,y,u*length];
 };
 for(let side=0;side<2;side++)for(let i=0;i<=longitudinal;i++)for(let j=0;j<=lateral;j++)positions.push(...surface(i/longitudinal,j/lateral*2-1,side===0?1:-1));
 for(let side=0;side<2;side++){
  const start=indices.length;
  for(let i=0;i<longitudinal;i++)for(let j=0;j<lateral;j++){
   const a=side*layer+i*stride+j,b=a+stride;
   if(side===0)indices.push(a,b,a+1,a+1,b,b+1);else indices.push(a,a+1,b,a+1,b+1,b);
  }
  groups.push({start,count:indices.length-start,materialIndex:side});
 }
 const edgeStart=indices.length;
 const seam=(a:number,b:number)=>indices.push(a,a+layer,b,b,a+layer,b+layer);
 for(let i=0;i<longitudinal;i++){seam(i*stride,(i+1)*stride);seam((i+1)*stride+lateral,i*stride+lateral);}
 for(let j=0;j<lateral;j++){seam(j+1,j);seam(longitudinal*stride+j,longitudinal*stride+j+1);}
 groups.push({start:edgeStart,count:indices.length-edgeStart,materialIndex:2});
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);groups.forEach(g=>geometry.addGroup(g.start,g.count,g.materialIndex));geometry.computeVertexNormals();return geometry;
}

type Petal={o:T.Mesh;scatter:T.Vector3;scatterQ:T.Quaternion;a:number;layer:number;index:number;phase:number};

/** Fast, deterministic material/construction preview for the Cycles magnetic-flower film. */
export function createThree(canvas:HTMLCanvasElement,c:EffectConfig){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setSize(1280,720,false);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 const scene=new T.Scene();scene.background=new T.Color('#102333');scene.fog=new T.Fog('#102333',25,60);
 const camera=new T.PerspectiveCamera(35,16/9,.05,150);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.05);scene.environment=environment.texture;scene.environmentIntensity=.5;room.dispose();pmrem.dispose();
 const porcelain=(color:string,roughness:number,metalness=0)=>new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:.65,clearcoatRoughness:.13,side:T.FrontSide});
 const inner=[porcelain(c.primary,.13+c.detail*.22),porcelain('#e4dfd0',.16+c.detail*.19),porcelain(c.secondary,.12+c.detail*.22)];
 const outer=porcelain('#ece9dd',.21+c.detail*.19),copper=porcelain('#d6a06b',.22,.94),chrome=porcelain('#d4e0e2',.075,1),dark=porcelain('#173747',.5,.25);
 const mesh=(geometry:T.BufferGeometry,material:T.Material|T.Material[],x=0,y=0,z=0,parent:T.Object3D=scene)=>{const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const ground=mesh(new T.PlaneGeometry(180,180),new T.MeshStandardMaterial({color:'#0b2237',roughness:.48,metalness:.12}),0,-.035,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 const petals:Petal[]=[];
 const dimensions=[[1.8,.36,.24],[1.45,.31,.21],[1.05,.255,.19]];
 for(let layer=0;layer<3;layer++){
  const total=Math.max(6,c.count*2+4-layer*4),[length,width,curl]=dimensions[layer],geometry=petalGeometry(length,width,curl);
  for(let i=0;i<total;i++){
   const id=layer*100+i,a=i*TAU/total+layer*.34,scatterA=hash(id+400,c.seed)*TAU,scatterR=.7+Math.sqrt(hash(id+800,c.seed))*3.0;
   const scatter=new T.Vector3(Math.cos(scatterA)*scatterR,.085+layer*.035,Math.sin(scatterA)*scatterR);
   const scatterQ=new T.Quaternion().setFromEuler(new T.Euler((hash(id+1000,c.seed)-.5)*.15,hash(id+1200,c.seed)*TAU,(hash(id+1400,c.seed)-.5)*.09,'YXZ'));
   const o=mesh(geometry,[inner[layer],outer,copper]);o.position.copy(scatter);o.quaternion.copy(scatterQ);
   petals.push({o,scatter,scatterQ,a,layer,index:i,phase:hash(id+1600,c.seed)*TAU});
  }
 }
 const core=mesh(new T.SphereGeometry(.39,64,48),chrome,0,.43,0);
 const coreSocket=mesh(new T.TorusGeometry(.31,.035,12,80),copper,0,.43,0);coreSocket.rotation.x=Math.PI/2;
 const nucleus=mesh(new T.SphereGeometry(.092,32,24),new T.MeshStandardMaterial({color:c.secondary,emissive:c.secondary,emissiveIntensity:1.5}),0,.43,0);nucleus.visible=false;
 const pearlMaterial=porcelain(c.secondary,.17+c.detail*.15,.12),pearlGeometry=new T.SphereGeometry(.042,12,8),pearls:T.Mesh[]=[];
 for(let i=0;i<64;i++){
  const a=hash(i+41,c.seed)*TAU,r=.9+hash(i+101,c.seed)*2.9;const o=mesh(pearlGeometry,i%3?pearlMaterial:copper,Math.cos(a)*r,.06,Math.sin(a)*r);o.userData={a,r,phase:hash(i+241,c.seed)*TAU};pearls.push(o);
 }
 const fluxMaterial=new T.LineBasicMaterial({color:c.secondary,transparent:true,opacity:.11,depthWrite:false});const flux:T.Line[]=[];
 for(let i=0;i<7;i++){
  const points:T.Vector3[]=[];for(let j=0;j<=120;j++){const a=j*TAU/120,rad=1.1+.4*Math.cos(a);points.push(new T.Vector3(Math.sin(a)*rad,1.8+Math.cos(a)*1.8,Math.sin(a*2)*.18));}
  const line=new T.Line(new T.BufferGeometry().setFromPoints(points),fluxMaterial);line.rotation.y=i*TAU/7;scene.add(line);flux.push(line);
 }
 const waveMaterial=new T.MeshBasicMaterial({color:c.primary,transparent:true,opacity:0,depthWrite:false}),waves:T.Mesh[]=[];
 for(let i=0;i<3;i++){const o=mesh(new T.TorusGeometry(1,.008,6,160),waveMaterial,0,.055,0);o.rotation.x=Math.PI/2;o.castShadow=false;waves.push(o);}
 scene.add(new T.HemisphereLight('#bad9e0','#071525',.45));
 const key=new T.DirectionalLight('#fff2de',2.8);key.position.set(-4,8,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7});key.shadow.camera.near=.1;key.shadow.camera.far=25;key.shadow.normalBias=.018;key.shadow.bias=-.00015;scene.add(key);
 const edge=new T.DirectionalLight('#91e1db',1.65);edge.position.set(5,4,-4);scene.add(edge);
 const fill=new T.DirectionalLight('#eaa185',.65);fill.position.set(-5,1,-2);scene.add(fill);
 const coreLight=new T.PointLight(c.secondary,0,7,2);coreLight.position.set(0,2.35,0);scene.add(coreLight);
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new T.Vector2(1280,720),.12,.4,.94));composer.addPass(new OutputPass());
 const target=new T.Vector3(),closed=new T.Vector3(),rot=new T.Quaternion(),euler=new T.Euler(0,0,0,'YXZ'),up=new T.Vector3();
 function draw(seconds:number){
  const t=seconds/c.duration*10,lift=smooth(.05,2.35,t),explode=smooth(4.08,4.65,t)*(1-smooth(5.15,5.95,t)),opening=smooth(5.6,7.55,t),spin=.12+smooth(1.5,4.1,t)*2.1+smooth(5.25,7.15,t)*1.65;
  const cy=lerp(.43,2.35,lift)+Math.sin(t*2)*.018*smooth(6.5,8,t);core.position.set(0,cy+.25*smooth(6.4,7.4,t),0);core.rotation.y=t*.4;coreSocket.position.y=core.position.y;coreSocket.rotation.z=explode*.5;coreSocket.rotation.y=spin*.5;
  coreLight.position.y=core.position.y;coreLight.intensity=(smooth(.15,2,t)*.22+explode*.35)*(1-smooth(7.1,9,t)*.6);
  for(const p of petals){
   const n=Math.max(6,c.count*2+4-p.layer*4),phase=p.index/n,begin=p.layer===0&&p.index===3?.10:p.layer===0&&[2,4].includes(p.index)?.65:1.50+p.layer*.20+phase*.45,end=p.layer===0&&p.index===3?1.25:p.layer===0&&[2,4].includes(p.index)?1.70:2.65+p.layer*.15+phase*.45;const u=smooth(begin,end,t),staggered=smooth(5.65+p.layer*.11+p.index*.009,7.35+p.layer*.12,t);
   const total=Math.max(6,c.count*2+4-p.layer*4),fault=p.layer===0&&(p.index===Math.floor(total*.7)||p.index===Math.floor(total*.85))?smooth(4.15,4.65,t)*(1-smooth(5.18,5.8,t)):0;
   const theta=p.a+spin,baseRadius=lerp(.18+p.layer*.035,[.42,.39,.35][p.layer],staggered),burst=(.65+c.intensity*1.3)*explode;
   closed.set(Math.sin(theta)*baseRadius,cy-.11-p.layer*.07,Math.cos(theta)*baseRadius);
   const radialAngle=theta+.12*Math.sin(p.phase);closed.x+=Math.sin(radialAngle)*burst;closed.z+=Math.cos(radialAngle)*burst;
   closed.y+=explode*(.23+Math.sin(p.phase)*.55);
   closed.x+=Math.sin(theta)*.7*fault;closed.z+=Math.cos(theta)*.7*fault;closed.y-=1.65*fault;
   if(p.layer===2)closed.y-=staggered*.16*Math.max(0,-Math.cos(theta));
   p.o.position.lerpVectors(p.scatter,closed,u);p.o.scale.z=lerp(1,lerp(.68,1,staggered),u);
   const arc=Math.sin(Math.PI*u);p.o.position.y+=arc*(.85+hash(p.index+p.layer*15,c.seed)*.65);
   p.o.position.x+=arc*Math.cos(theta+p.phase)*.48;p.o.position.z+=arc*Math.sin(theta+p.phase)*.48;
   const tilt=lerp(-1.24-p.layer*.045,[-.1,-.32,-.64][p.layer],staggered)+explode*(.30+Math.sin(p.phase)*.22);
   euler.set(tilt+fault*.9,theta,explode*Math.sin(p.phase)*.32+fault*.8,'YXZ');rot.setFromEuler(euler);p.o.quaternion.slerpQuaternions(p.scatterQ,rot,u);
   const anticipation=Math.sin(t*70+p.phase)*.009*(1-smooth(.15,.7,t));p.o.position.y+=anticipation;
   const breath=Math.sin(t*1.25+p.layer*.3)*.015*opening;p.o.position.y+=breath;
  }
  pearls.forEach((o,i)=>{
   const {a,r,phase}=o.userData as {a:number;r:number;phase:number},wake=smooth(.55+i*.012,2.8+i*.012,t),rad=r*(1-wake*.3)+explode*.5;
   o.position.set(Math.cos(a+spin*wake*.25)*rad,.06+wake*(.25+Math.sin(t*1.2+phase)*.1)+explode*(.3+hash(i,c.seed)*.5),Math.sin(a+spin*wake*.25)*rad);
   o.scale.setScalar(1+smooth(5.3,6,t)*Math.sin(i+1)*.15);
  });
  fluxMaterial.opacity=.09*smooth(.3,1.3,t)*(1-smooth(6.4,8,t))+.055*explode;flux.forEach((l,i)=>{l.rotation.y=i*TAU/7+spin*.1;l.scale.setScalar(.8+lift*.2+explode*.12);});
  const wave=smooth(5.12,5.7,t),finish=smooth(6.2,7.4,t);waveMaterial.opacity=wave*(1-finish)*.32;waves.forEach((w,i)=>{w.visible=waveMaterial.opacity>.001;w.scale.setScalar(Math.max(.01,.15+(t-5.15-i*.06)*7));});
  // The opening camera stays near the first lifted scale, before revealing the global force.
  const focusPetal=petals[3],macro=focusPetal.scatter.clone().add(new T.Vector3(1.35,1.0,-2.0));
  const wide=new T.Vector3(6.4,6.2,-10.6),macroLook=focusPetal.scatter.clone().add(new T.Vector3(0,.13,-.5));
  const reveal=smooth(.35,2.85,t);camera.position.lerpVectors(macro,wide,reveal);target.lerpVectors(macroLook,new T.Vector3(0,2.05,0),reveal);
  const tension=smooth(3.7,4.35,t)*(1-smooth(5.15,5.75,t));up.set(4.5,3.5,-7.4);camera.position.lerp(up,tension*.52);target.y+=tension*.55;
  const finale=smooth(6.0,8.35,t);up.set(4,6.8,-6.5);camera.position.lerp(up,finale);target.lerp(new T.Vector3(0,1.95,0),finale);camera.lookAt(target);camera.fov=lerp(35,24,finale);camera.updateProjectionMatrix();
  composer.render();
 }
 return {draw,dispose(){
  const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());key.shadow.dispose();environment.dispose();composer.passes.forEach(p=>p.dispose());composer.dispose();renderer.dispose();renderer.forceContextLoss();
 }};
}
