import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import type {EffectConfig} from '../../scripts/effects.mjs';
import {hash,TAU,smooth,back} from './math';
export function createThree(canvas:HTMLCanvasElement,c:EffectConfig){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,alpha:false});renderer.setSize(1280,720,false);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 const scene=new THREE.Scene();const dark=c.style==='hud'||c.style==='synthwave';scene.background=new THREE.Color(dark?'#101522':c.style==='isometric'?'#e1eee5':'#e4dce9');
 const camera=c.style==='synthwave'?new THREE.PerspectiveCamera(52,16/9,.1,200):new THREE.OrthographicCamera(-9,9,5.0625,-5.0625,.1,100);
 camera.position.set(11,9,13);camera.lookAt(0,1,0);
 scene.add(new THREE.HemisphereLight('#ffffff','#b2a4a9',1.1));const light=new THREE.DirectionalLight('#fff4e8',3);light.position.set(-5,9,5);scene.add(light);
 const updates:((t:number)=>void)[]=[];const ownedTextures:THREE.Texture[]=[];let envTarget:THREE.WebGLRenderTarget|undefined;
 const material=(color:string,rough=.5,metal=0)=>new THREE.MeshPhysicalMaterial({color,roughness:rough,metalness:metal,clearcoat:.3,clearcoatRoughness:.2});
 const mesh=(geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0,parent:THREE.Object3D=scene)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;};
 if(!dark){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-12;light.shadow.camera.right=12;light.shadow.camera.top=12;light.shadow.camera.bottom=-12;light.shadow.normalBias=.03;light.shadow.bias=-.00015;const floor=mesh(new THREE.PlaneGeometry(100,100),material(c.style==='isometric'?'#d9e6df':'#e4dce9',.85));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();envTarget=pmrem.fromScene(room,.05);scene.environment=envTarget.texture;room.dispose();pmrem.dispose();}
 if(c.style==='3d-render'){
  camera.position.set(10,8.5,13);camera.lookAt(0,.7,0);
  const base=mesh(new RoundedBoxGeometry(12,.65,7,3,.28),material('#c8c2d4',.75),0,.32,0);base.receiveShadow=true;base.castShadow=true;
  for(let i=0;i<28;i++){const x=(i%7-3)*1.6,z=(Math.floor(i/7)-1.5)*1.55;const stem=mesh(new THREE.CapsuleGeometry(.32,.5,4,12),material(i%3?c.secondary:'#f0d7b6',.55),x,1,z);stem.castShadow=true;updates.push(t=>{const u=smooth(i*.015,.8+i*.015,t);stem.scale.y=.3+.7*u;stem.position.y=.65+stem.scale.y*.45;});}
  for(let i=0;i<c.count;i++){
   const x=(i%4-1.5)*2.45+(hash(i,c.seed)-.5)*.35,z=(Math.floor(i/4)-(Math.ceil(c.count/4)-1)/2)*2+(hash(i+90,c.seed)-.5)*.35;const geometry=i%3===0?new THREE.TorusGeometry(.6,.28,16,40):i%3===1?new THREE.SphereGeometry(.85,32,24):new RoundedBoxGeometry(1.45,1.45,1.45,4,.3);const m=mesh(geometry,material(i%3===1?'#b9c0ce':i%2?c.secondary:c.primary,.07+c.detail*.82,i%3===1?.94:.05),x,1.8,z);m.castShadow=true;m.receiveShadow=true;
   updates.push(t=>{const age=t-.4-i*.14;const fall=1-smooth(0,.8,age);const bounce=age<.8?0:Math.abs(Math.sin((age-.8)*5))*Math.exp(-(age-.8)*1.3)*c.intensity*2;m.position.y=1.8+fall*7+bounce;const squish=age>.7&&age<1?Math.sin((age-.7)*Math.PI/.3)*.2*c.intensity:0;m.scale.set(1+squish,1-squish,1+squish);m.rotation.set(t*.12+i+hash(i,c.seed)*.5,age*.18+i*.7,i%3===0?Math.PI*.35:0);});
  }
  updates.push(t=>{camera.position.x=10+Math.sin(t*.25)*1.8*c.intensity;camera.lookAt(0,.8,0);});
 }else if(c.style==='isometric'){
  camera.position.set(12,12,12);camera.lookAt(0,.6,0);
  const island=mesh(new RoundedBoxGeometry(12,.8,9,2,.2),material('#b2cbbb',.8),0,.4,0);island.receiveShadow=true;island.castShadow=true;
  for(let i=0;i<3;i++){mesh(new THREE.BoxGeometry(12,.02,.5),material('#7d938c',.9),0,.82,-2.5+i*2.5);mesh(new THREE.BoxGeometry(.55,.025,9),material('#7d938c',.9),-3.8+i*3.8,.83,0);}
  for(let i=0;i<c.count;i++){const x=(i%5-2)*2.1,z=(Math.floor(i/5)-1)*2.5;const h=(.8+hash(i,c.seed)*2.8)*(.3+c.detail*1.4);const group=new THREE.Group();group.position.set(x,.84,z);scene.add(group);const b=mesh(new RoundedBoxGeometry(1.5,h,1.7,2,.07),material(i%3?c.secondary:c.primary,.7),0,h/2,0,group);b.castShadow=true;b.receiveShadow=true;mesh(new THREE.BoxGeometry(1.65,.15,1.85),material('#e9eee7',.8),0,h+.08,0,group);
   for(let k=0;k<Math.floor(h/.5);k++)for(let j=0;j<2;j++)mesh(new THREE.BoxGeometry(.25,.22,.035),material('#345d64',.35),-.4+j*.8,.45+k*.45,.87,group);
   updates.push(t=>{const u=Math.max(.001,back((t-i*.11)/1,1+c.intensity));group.scale.y=u;});
  }
  for(let i=0;i<12;i++){const x=-5.2+(i%6)*2.1,z=i<6?-3.7:3.8;const trunk=mesh(new THREE.CylinderGeometry(.08,.1,.6,6),material('#8c7863'),x,1.15,z);const crown=mesh(new THREE.IcosahedronGeometry(.42,1),material(c.primary,.9),x,1.7,z);trunk.castShadow=true;crown.castShadow=true;}
  updates.push(t=>{camera.zoom=.9+smooth(0,6,t)*.12;camera.updateProjectionMatrix();});
 }else if(c.style==='synthwave'){
  scene.fog=new THREE.FogExp2('#19172e',.016);camera.position.set(0,2.3,10);camera.lookAt(0,1,-25);const floor=mesh(new THREE.PlaneGeometry(180,240),new THREE.MeshBasicMaterial({color:'#151325'}),0,-.1,-80);floor.rotation.x=-Math.PI/2;
  const grid=new THREE.GridHelper(180,60,c.primary,c.secondary);grid.position.z=-55;scene.add(grid);updates.push(t=>{grid.position.z=-55+(t*(2+c.intensity*9))%3;});
  for(let side=-1;side<=1;side+=2)for(let i=0;i<c.count;i++){const z=-i*11-12,x=side*(9+hash(i,c.seed)*14),h=3+hash(i+20,c.seed)*12*(.2+c.detail);const geo=new THREE.ConeGeometry(3+hash(i,c.seed)*4,h,4);const m=mesh(geo,new THREE.MeshBasicMaterial({color:i%2?'#302039':'#382641',wireframe:false}),x,h/2,z);const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:c.primary,transparent:true,opacity:.65}));m.add(edge);updates.push(t=>{m.position.z=z+(t*(2+c.intensity*9))%11;});}
  for(let i=0;i<c.count;i++){for(const side of [-1,1]){const m=mesh(new THREE.BoxGeometry(.09,.04,7),new THREE.MeshBasicMaterial({color:side===1?c.primary:c.secondary}),side*3,.02,-i*12);updates.push(t=>{m.position.z=-i*12+(t*(2+c.intensity*9))%12;});}}
  // Each disc strip is geometry, so the setting sun remains behind the road and mountain silhouettes.
  const sunCanvas=document.createElement('canvas');sunCanvas.width=256;sunCanvas.height=256;const sg=sunCanvas.getContext('2d')!;const grad=sg.createLinearGradient(0,0,0,256);grad.addColorStop(0,'#ffe188');grad.addColorStop(.5,'#f79999');grad.addColorStop(1,c.primary);sg.fillStyle=grad;sg.beginPath();sg.arc(128,128,125,0,TAU);sg.fill();sg.globalCompositeOperation='destination-out';for(let i=0;i<8;i++)sg.fillRect(0,145+i*15,256,3+i*.8);const tex=new THREE.CanvasTexture(sunCanvas);tex.colorSpace=THREE.SRGBColorSpace;ownedTextures.push(tex);mesh(new THREE.PlaneGeometry(32,32),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,fog:false,toneMapped:false}),0,13,-100);
 }else if(c.style==='hud'){
  camera.position.set(0,1,14);camera.lookAt(0,1,0);const globe=new THREE.Group();globe.position.set(0,.7,0);scene.add(globe);
  const mat=new THREE.LineBasicMaterial({color:c.primary,transparent:true,opacity:.37});
  for(let i=1;i<12;i++){const lat=-Math.PI/2+i*Math.PI/12,r=Math.cos(lat)*2.6,y=Math.sin(lat)*2.6;const pts=Array.from({length:97},(_,j)=>new THREE.Vector3(Math.cos(j*TAU/96)*r,y,Math.sin(j*TAU/96)*r));globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat));}
  for(let i=0;i<16;i++){const a=i*TAU/16,pts=Array.from({length:97},(_,j)=>{const b=j*TAU/96;return new THREE.Vector3(Math.cos(b)*Math.cos(a)*2.6,Math.sin(b)*2.6,Math.cos(b)*Math.sin(a)*2.6);});globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat));}
  mesh(new THREE.SphereGeometry(2.55,24,16),new THREE.MeshBasicMaterial({color:'#102e36',transparent:true,opacity:.45}),0,0,0,globe);
  for(let i=0;i<c.count;i++){const group=new THREE.Group();group.rotation.set(i*.35+c.detail+hash(i,c.seed)*.4,i*.8,.4+i*.1);globe.add(group);const pts=Array.from({length:97},(_,j)=>new THREE.Vector3(Math.cos(j*TAU/96)*3.2,0,Math.sin(j*TAU/96)*3.2));group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:i%2?c.secondary:c.primary,transparent:true,opacity:.3})));const orb=mesh(new THREE.OctahedronGeometry(.08),new THREE.MeshBasicMaterial({color:c.secondary}),0,0,0,group);updates.push(t=>{const a=i*1.7+t*(.2+c.intensity*.6);orb.position.set(Math.cos(a)*3.2,0,Math.sin(a)*3.2);});}
  updates.push(t=>{globe.rotation.y=t*(.06+c.intensity*.12);globe.rotation.z=.1+Math.sin(t*.25)*c.detail*.1;});
 }
 return {draw(t:number){updates.forEach(fn=>fn(t));renderer.render(scene,camera);},dispose(){const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());ownedTextures.forEach(t=>t.dispose());envTarget?.dispose();light.shadow.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
