// Event-level verification of the installed upstream library, without replacing
// its movement implementation. Browser pointer-lock permission is not tested.
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3, BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
import { FreeCam } from 'three-freecam';
globalThis.window = new EventTarget();
globalThis.document = new EventTarget();
const surface = new EventTarget();
const camera = new PerspectiveCamera(41, 1.5, .1, 500);
camera.position.set(0, 3, 20);
const cam = new FreeCam(camera, surface, { moveSpeed: 10, pointerLock: false });
function event(target, type, values = {}) { const e = new Event(type, { cancelable: true }); Object.assign(e, values); target.dispatchEvent(e); }
function near(a,b) { assert.ok(Math.abs(a-b)<1e-6, `${a} should equal ${b}`); }
let checks = 0;
event(window,'keydown',{code:'KeyW'}); cam.update(.5); event(window,'keyup',{code:'KeyW'}); near(camera.position.z,15); checks++;
const rotation = camera.quaternion.clone();
event(surface,'pointerdown',{button:2}); event(window,'pointermove',{movementX:80,movementY:20}); cam.update(0); event(window,'pointerup',{button:2}); assert.ok(rotation.angleTo(camera.quaternion)>.1); checks++;
cam.focus(new Vector3(0,4,0),20); cam.update(0);
const pivot = cam.pivot.clone(), beforeOrbit = camera.position.clone();
event(surface,'pointerdown',{button:0,altKey:true}); event(window,'pointermove',{movementX:100,movementY:30}); cam.update(0); event(window,'pointerup',{button:0});
near(camera.position.distanceTo(pivot),20); assert.ok(camera.position.distanceTo(beforeOrbit)>1); checks++;
const beforePan = camera.position.clone();
event(surface,'pointerdown',{button:1}); event(window,'pointermove',{movementX:50,movementY:10}); cam.update(0); event(window,'pointerup',{button:1}); assert.ok(camera.position.distanceTo(beforePan)>1); checks++;
const beforeDolly = camera.position.clone(); event(surface,'wheel',{deltaY:-100}); cam.update(0); assert.ok(camera.position.distanceTo(beforeDolly)>0); checks++;
const speed = cam.moveSpeed; event(surface,'pointerdown',{button:2}); event(surface,'wheel',{deltaY:-100}); event(window,'pointerup',{button:2}); assert.ok(cam.moveSpeed>speed); checks++;
const object = new Mesh(new BoxGeometry(8,10,6),new MeshBasicMaterial()); object.position.set(20,5,0); object.updateMatrixWorld(true); cam.focus(object); cam.update(0); near(cam.pivot.distanceTo(object.position),0); checks++;
cam.damping=.9; event(window,'keydown',{code:'KeyW'}); cam.update(.1); event(window,'keyup',{code:'KeyW'}); const beforeCoast=camera.position.clone(); cam.update(.1); assert.ok(camera.position.distanceTo(beforeCoast)>0); checks++;
cam.enabled=false; const frozen=camera.position.clone(); cam.update(1); near(camera.position.distanceTo(frozen),0); checks++;
cam.dispose(); object.geometry.dispose(); object.material.dispose();
console.log(`PASS: ${checks} upstream event checks (flight, look, orbit, pan, dolly, speed, focus, damping, disabled). Pointer lock remains a browser/manual check.`);
