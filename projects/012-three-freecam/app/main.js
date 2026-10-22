import * as THREE from 'three';
import { FreeCam } from 'three-freecam';

const $ = (selector) => document.querySelector(selector);
const viewport = $('#viewport');
const loading = $('#loading');
const info = $('#info');
let returnFocus;
$('#about').onclick = $('#help').onclick = () => {
  returnFocus = document.activeElement;
  info.showModal();
  viewport.dispatchEvent(new Event('pause-camera'));
};
$('#close-info').onclick = () => info.close();
info.addEventListener('click', (event) => { if (event.target === info) { const r = info.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) info.close(); } });
info.addEventListener('close', () => returnFocus?.focus());

try { init(); } catch (error) {
  console.error(error);
  loading.hidden = false;
  loading.textContent = '三维场景暂时无法启动。请使用支持 WebGL 2 的桌面浏览器，并检查硬件加速是否开启。';
  for (const control of document.querySelectorAll('.experiment, .scene-actions button, .landmarks button, .settings input, #reset-settings')) control.disabled = true;
}

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  viewport.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dfe8df');
  scene.fog = new THREE.Fog('#dfe8df', 145, 310);
  const camera = new THREE.PerspectiveCamera(41, 1, 0.1, 500);
  const start = new THREE.Vector3(76, 60, 84);
  const center = new THREE.Vector3(0, 6, 0);
  camera.position.copy(start);
  camera.lookAt(center);

  scene.add(new THREE.HemisphereLight('#f8fbe8', '#758e7a', 2.3));
  const sun = new THREE.DirectionalLight('#fff2d7', 3);
  sun.position.set(-38, 70, 35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 200 });
  sun.shadow.normalBias = 0.08;
  sun.shadow.bias = -0.0001;
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun);

  const colors = { ground: '#c7d3b9', base: '#b6c6ad', cream: '#eee8cf', pale: '#f7f2dc', coral: '#bb7659', coralLight: '#d69c7c', sage: '#72977e', dark: '#3c6650', leaf: '#8d9f6c', gold: '#c4a461', path: '#e2dec2', metal: '#55715d' };
  const materials = Object.fromEntries(Object.entries(colors).map(([key, color]) => [key, new THREE.MeshStandardMaterial({ color, roughness: 0.84 })]));
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  function box(parent, x, y, z, w, h, d, material = 'cream') {
    const mesh = new THREE.Mesh(unitBox, materials[material]);
    mesh.position.set(x, y, z); mesh.scale.set(w, h, d);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh); return mesh;
  }
  function cylinder(parent, x, y, z, radius, height, material, segments = 24) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), materials[material]);
    mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function tree(x, z, size = 1) {
    const treeGroup = new THREE.Group(); treeGroup.position.set(x, 0.15, z); treeGroup.scale.setScalar(size);
    cylinder(treeGroup, 0, 2.1, 0, 0.3, 4.2, 'coral', 8);
    for (const [px, py, pz, r, color] of [[0,5.6,0,2.5,'leaf'],[-1.1,4.5,0.3,1.8,'sage'],[1,5,0.3,1.7,'leaf']]) {
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), materials[color]); crown.position.set(px,py,pz); crown.castShadow = true; treeGroup.add(crown);
    }
    scene.add(treeGroup);
  }
  function arch(parent, x, z, width, height, depth, material) {
    const radius = width * 0.31;
    const spring = height - radius - 1.1;
    // Open-bottom arch uses a single contour, avoiding a hole that touches the outer edge.
    const outline = new THREE.Shape();
    outline.moveTo(-width/2,0); outline.lineTo(-width/2,height); outline.lineTo(width/2,height); outline.lineTo(width/2,0);
    outline.lineTo(radius,0); outline.lineTo(radius,spring); outline.absarc(0,spring,radius,0,Math.PI,false); outline.lineTo(-radius,0); outline.closePath();
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(outline, { depth, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.07, bevelThickness: 0.07, curveSegments: 20 }), materials[material]);
    mesh.position.set(x,0,z-depth/2); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2000,2000), new THREE.MeshStandardMaterial({ color:'#dfe8df', roughness:1 }));
  floor.rotation.x = -Math.PI/2; floor.position.y = -2.5; floor.receiveShadow = true; scene.add(floor);
  box(scene,0,-1.3,0,78,2.3,62,'base');
  box(scene,0,-0.08,0,78,0.18,62,'ground');
  box(scene,0,-2.25,0,73,0.5,57,'dark');
  // Pale pedestrian paths make translation and perspective changes easy to read.
  box(scene,0,0.03,10,70,0.08,5,'path');
  box(scene,-2,0.03,-2,5,0.08,52,'path');
  for (let i=0;i<13;i++) box(scene,-32+i*5.3,0.09,10,0.045,0.02,5,'base');
  for (let i=0;i<10;i++) box(scene,-2,0.09,-25+i*5.3,5,0.02,0.045,'base');
  // Tower, gallery and ring are separate Object3D groups for real FreeCam.focus().
  const targets = {};
  function landmark(name, position) { const group = new THREE.Group(); group.name = name; group.position.copy(position); scene.add(group); targets[name] = group; return group; }
  const tower = landmark('tower', new THREE.Vector3(15,0,-10));
  box(tower,0,0.5,0,14,1,14,'cream');
  box(tower,0,1.2,0,12,0.4,12,'coralLight');
  for (const x of [-4.6,4.6]) for (const z of [-4.6,4.6]) box(tower,x,13.5,z,1.45,25,1.45,'coral');
  for (const y of [8,16,24]) {
    box(tower,0,y,0,11.5,0.85,11.5,'coralLight');
    box(tower,0,y+0.6,-4.8,9,0.45,0.4,'coral');
    box(tower,-4.8,y+0.6,0,0.4,0.45,9,'coral');
  }
  box(tower,0,27.1,0,13.6,1.3,13.6,'sage');
  box(tower,0,26.1,0,12,0.6,12,'dark');
  box(tower,0,28,0,6,0.4,6,'pale');
  // Stair treads inside the open tower, visible while flying through it.
  for (let i=0;i<15;i++) box(tower,-2,1.8+i*0.42,4-i*0.51,3,0.32,0.8,'cream');
  const gallery = landmark('gallery', new THREE.Vector3(-20,0,-12));
  box(gallery,0,0.25,0,24,0.5,15,'cream');
  const arcade = new THREE.Group(); arcade.position.y = 0.5; gallery.add(arcade);
  for (const x of [-7.8,0,7.8]) { arch(arcade,x,5.1,7.8,10,1.2,'cream'); arch(arcade,x,-5.1,7.8,10,1.2,'cream'); }
  box(gallery,0,11,0,25,1,15.5,'sage');
  box(gallery,0,11.65,0,23.5,0.3,14,'ground');
  for (const x of [-9,-3,3,9]) box(gallery,x,0.65,0,0.045,0.02,11,'base');
  const ring = landmark('ring', new THREE.Vector3(17,0,19));
  cylinder(ring,0,0.35,0,9.3,0.7,'cream',64);
  cylinder(ring,0,0.8,0,7.9,0.25,'pale',64);
  const sculpture = new THREE.Mesh(new THREE.TorusGeometry(5.4,1.25,20,80),materials.gold); sculpture.position.set(0,7.3,0); sculpture.castShadow = true; sculpture.receiveShadow = true; ring.add(sculpture);
  box(ring,0,1.4,0,4,1,3,'coralLight');
  for (const [x,z,s] of [[-31,20,1.1],[-23,24,.85],[-32,-25,.8],[-9,-24,.75],[31,-23,.9],[32,-3,.85],[33,22,.7],[-12,22,.8],[-31,1,.65]]) tree(x,z,s);
  // Quiet planting beds, benches and lamps give close-up views a sense of scale.
  for (const [x,z] of [[-26,20],[-12,19],[29,-8]]) { box(scene,x,.65,z,4,.4,1.2,'coral'); box(scene,x-1.3,.3,z,.3,.6,.9,'dark'); box(scene,x+1.3,.3,z,.3,.6,.9,'dark'); }
  for (const [x,z] of [[-33,6],[3,6],[33,6],[-6,-23],[-6,23]]) { cylinder(scene,x,2.2,z,.12,4.4,'metal',8); cylinder(scene,x,4.5,z,.5,.35,'cream',12); }
  for (const [x,z,w,d] of [[-25,24,18,1.4],[-35,-10,1.7,20],[33,-20,6,1.5]]) box(scene,x,.45,z,w,.8,d,'sage');
  function groundLabel(text,x,z) {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#6f816b'; ctx.font = '500 69px monospace'; ctx.textAlign = 'center'; ctx.fillText(text,128,88);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(5,2.5),new THREE.MeshBasicMaterial({ map:texture,transparent:true,depthWrite:false })); mesh.rotation.x = -Math.PI/2; mesh.position.set(x,.14,z); scene.add(mesh);
  }
  groundLabel('01',15,1); groundLabel('02',-20,-1); groundLabel('03',17,29);

  const controls = new FreeCam(camera, renderer.domElement, { moveSpeed:16, damping:0, pointerLock:true, keys:{focus:[]} });
  const pickables = Object.values(targets);
  const names = {tower:'观景塔',gallery:'连廊',ring:'圆环'};
  let selected = null;
  let selectionBox = null;
  let touring = false;
  let tourTime = 0;
  let noticeTimer;
  let lastTime = performance.now();
  let statsTime = lastTime, frames = 0;
  let dragging = false, pressX=0, pressY=0;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const tourPosition = new THREE.Vector3();
  const tourLook = new THREE.Vector3();

  function notify(message) { $('#notice').textContent = message; $('#notice').hidden = false; clearTimeout(noticeTimer); noticeTimer = setTimeout(()=>$('#notice').hidden=true,3200); }
  function setMode(mode, hint) {
    for (const button of document.querySelectorAll('[data-mode]')) { const active = button.dataset.mode === mode; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); }
    $('#mode-label').textContent = {fly:'自由飞行',orbit:'围绕物体',focus:'一键聚焦',tour:'自动巡游'}[mode];
    $('#mode-hint').textContent = hint;
  }
  function stopTour() { touring = false; $('#tour').setAttribute('aria-pressed','false'); $('#tour-label').textContent='自动演示'; $('#tour-icon').textContent='▷'; $('#tour-caption').hidden=true; }
  function select(name, showNotice=true) {
    selected = name;
    if (selectionBox) { scene.remove(selectionBox); selectionBox.geometry.dispose(); selectionBox.material.dispose(); }
    selectionBox = new THREE.BoxHelper(targets[name], '#738c57'); selectionBox.material.transparent=true; selectionBox.material.opacity=.45; scene.add(selectionBox);
    for (const button of document.querySelectorAll('[data-target]')) { button.classList.toggle('selected',button.dataset.target===name); button.setAttribute('aria-pressed',String(button.dataset.target===name)); }
    if (showNotice) notify(`已选中${names[name]} · 按 F 聚焦`);
  }
  function focusSelected() {
    stopTour(); if (!selected) select('tower',false);
    // The upstream framing formula uses vertical FOV only. Supply a distance on
    // portrait screens so wide objects also fit the narrower horizontal FOV.
    if (camera.aspect < 1) {
      const sphere = new THREE.Box3().setFromObject(targets[selected]).getBoundingSphere(new THREE.Sphere());
      const halfFov = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*camera.aspect);
      controls.focus(targets[selected],sphere.radius*1.6/Math.tan(halfFov));
    } else controls.focus(targets[selected]);
    controls.update(0);
    setMode('focus',`${names[selected]} · Alt + 左键绕着看看`);
    viewport.focus({preventScroll:true});
  }
  function resetView() {
    stopTour(); controls.placeAt(start,center); controls.update(0);
    setMode('fly','点击场景，用 WASD 出发');
    viewport.focus({preventScroll:true});
  }
  // The upstream library listens on window. Scope its keys to this viewport so
  // sliders, links and dialogs retain their normal keyboard behavior.
  const cameraKeys = new Set(['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyF']);
  window.addEventListener('keydown',event=>{
    if (!cameraKeys.has(event.code)) return;
    if (document.activeElement!==viewport || info.open) { event.stopImmediatePropagation(); return; }
    event.preventDefault();
    if (touring) { stopTour(); setMode('fly','自由飞行 · 右键转头'); }
    if (event.code==='KeyF') { event.stopImmediatePropagation(); focusSelected(); }
  },true);
  // Clearing held keys uses the library's documented blur listener, including
  // when focus goes to a slider or a dialog while a movement key is held.
  function clearInput() { window.dispatchEvent(new Event('blur')); }
  viewport.addEventListener('blur',clearInput);
  viewport.addEventListener('pause-camera',()=>{ stopTour(); clearInput(); });
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) { stopTour(); clearInput(); } lastTime=performance.now(); });
  renderer.domElement.addEventListener('pointerdown',event=>{
    if (touring) { stopTour(); setMode('fly','自由飞行 · 右键转头'); }
    viewport.focus({preventScroll:true}); dragging=false; pressX=event.clientX; pressY=event.clientY;
  },true);
  window.addEventListener('pointermove',event=>{if(Math.hypot(event.clientX-pressX,event.clientY-pressY)>5) dragging=true;});
  renderer.domElement.addEventListener('click',event=>{
    if (dragging || event.altKey || event.button!==0) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(mouse,camera);
    const hit=raycaster.intersectObjects(pickables,true)[0];
    if(hit) {let object=hit.object; while(object.parent && !pickables.includes(object)) object=object.parent; if(pickables.includes(object)) select(object.name);}
  });
  renderer.domElement.addEventListener('wheel',()=>{if(touring){stopTour();setMode('fly','滚轮推近 / 拉远');}},true);
  // Prevent a denied pointer-lock request from causing an unhandled rejection;
  // ordinary dragging remains usable in browsers that restrict pointer lock.
  const originalLock = renderer.domElement.requestPointerLock?.bind(renderer.domElement);
  if(originalLock) renderer.domElement.requestPointerLock=()=>{try{return originalLock()?.catch(()=>notify('此浏览器未允许鼠标锁定，仍可拖动观察'));}catch{notify('鼠标锁定不可用，仍可拖动观察');}};
  for (const button of document.querySelectorAll('[data-mode]')) button.onclick=()=>{
    stopTour(); const mode=button.dataset.mode;
    if(mode==='fly') resetView();
    if(mode==='orbit') { select(selected || 'tower',false); focusSelected(); setMode('orbit',`${names[selected]} · 按住 Alt + 左键拖动`); notify('按住 Alt + 左键拖动，围绕物体观察'); }
    if(mode==='focus') { select(selected || 'ring',false); focusSelected(); notify('已自动取景 · 点击其他建筑，再按 F'); }
  };
  for (const button of document.querySelectorAll('[data-target]')) button.onclick=()=>{select(button.dataset.target,false);focusSelected();};
  $('#reset-view').onclick=resetView;
  $('#speed').oninput=event=>{controls.moveSpeed=Number(event.target.value);syncSettings();};
  $('#damping').oninput=event=>{controls.damping=Number(event.target.value);syncSettings();};
  $('#reset-settings').onclick=()=>{controls.moveSpeed=16;controls.damping=0;syncSettings();};
  function syncSettings() {$('#speed-value').innerHTML=`${controls.moveSpeed.toFixed(0)} <em>u/s</em>`; $('#speed').value=String(controls.moveSpeed); $('#damping-value').textContent=controls.damping.toFixed(2); $('#damping').value=String(controls.damping);}
  $('#tour').onclick=()=>{
    if(touring) {stopTour();setMode('fly','演示已暂停 · 可接着自由探索');viewport.focus({preventScroll:true});return;}
    clearInput();touring=true;tourTime=0;$('#tour').setAttribute('aria-pressed','true');$('#tour-label').textContent='暂停演示';$('#tour-icon').textContent='Ⅱ';$('#tour-caption').hidden=false;setMode('tour','环绕 → 近看 → 穿行');
  };
  // Automatic tour is application choreography, implemented through placeAt().
  // Catmull-Rom interpolation creates a continuous route; manual input interrupts.
  const route = new THREE.CatmullRomCurve3([
    start.clone(),new THREE.Vector3(72,43,-40),new THREE.Vector3(1,36,-69),new THREE.Vector3(-57,27,-26),new THREE.Vector3(-25,7,24),new THREE.Vector3(-20,5,2),new THREE.Vector3(-20,5,-21),new THREE.Vector3(-41,22,-33),new THREE.Vector3(-40,28,41),new THREE.Vector3(21,17,47),start.clone()
  ],false,'centripetal');
  const lookRoute = new THREE.CatmullRomCurve3([center.clone(),center.clone(),new THREE.Vector3(0,9,-7),new THREE.Vector3(-20,7,-12),new THREE.Vector3(-20,5,-9),new THREE.Vector3(-20,5,-18),new THREE.Vector3(-20,5,-35),new THREE.Vector3(-10,8,-8),new THREE.Vector3(9,8,9),new THREE.Vector3(17,7,19),center.clone()],false,'centripetal');
  const resize=new ResizeObserver(()=>{
    const {width,height}=viewport.getBoundingClientRect(); if(!width || !height) return;
    renderer.setSize(width,height);camera.aspect=width/height;
    camera.fov=Math.min(78,THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(41)/2)*Math.max(1,1.25/camera.aspect))));
    camera.updateProjectionMatrix();
  });resize.observe(viewport);
  renderer.setAnimationLoop(now=>{
    const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;
    if(!info.open && !document.hidden) {
      if(touring) {tourTime+=dt;const t=Math.min(tourTime/42,1);route.getPoint(t,tourPosition);lookRoute.getPoint(t,tourLook);controls.placeAt(tourPosition,tourLook);if(t>=1){stopTour();setMode('fly','巡游结束 · 现在由你掌镜');}}
      controls.update(dt);
    }
    renderer.render(scene,camera);
    frames++;
    if(now-statsTime>300){const p=camera.position;$('#position').textContent=`X ${p.x.toFixed(1)} · Y ${p.y.toFixed(1)} · Z ${p.z.toFixed(1)}`;$('#fps').textContent=`${Math.round(frames*1000/(now-statsTime))} FPS`;statsTime=now;frames=0;syncSettings();}
  });
  loading.hidden=true;
  if(matchMedia('(pointer:coarse)').matches) setMode('fly','触屏可用预设与自动演示；飞行需鼠标键盘');
  window.addEventListener('pagehide',()=>{controls.dispose();renderer.setAnimationLoop(null);resize.disconnect();renderer.dispose();},{once:true});
}
