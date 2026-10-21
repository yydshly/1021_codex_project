import { DEFAULTS, clamp, createField, cameraBasis, groundHit } from './model.js';

// All geometry, shaders and interactions below are independently authored for this study.
// A shared 2D cloud field deliberately trades volumetric depth for a smaller renderer.
const noise = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed * 0.013) * 43758.5453); }
float valueNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float result = 0.0, amplitude = 0.55;
  for (int i=0; i<4; i++) { result += valueNoise(p)*amplitude; p = mat2(1.6, 1.2, -1.2, 1.6)*p+7.1; amplitude *= 0.48; }
  return result;
}
float cloudField(vec2 p) {
  float n = fbm(p*0.035 + vec2(uTime*0.022, uTime*0.008));
  return smoothstep(0.76-uClouds*0.44, 0.92-uClouds*0.36, n) * min(1.0, uClouds*5.0);
}
float shadowAt(vec2 p) { return 1.0 - cloudField(p + vec2(18.0, -10.0))*0.43; }
`;
const uniforms = `
uniform vec3 uEye, uForward, uRight, uUp;
uniform float uAspect, uTime, uWind, uHeight, uClouds, uMoisture, uSeed;
uniform vec3 uBrush;
vec4 projectPoint(vec3 p) {
  vec3 d = p-uEye;
  float z = dot(d,uForward);
  return vec4(dot(d,uRight)/(0.57735027*uAspect), dot(d,uUp)/0.57735027, 1.00028575*z-0.10001429, z);
}
`;
const fullVertex = `#version 300 es
precision highp float;
out vec2 vScreen;
void main() {
  vec2 p = vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));
  vScreen = p*2.0-1.0;
  gl_Position = vec4(vScreen, 0, 1);
}`;
const worldFragment = `#version 300 es
precision highp float;
in vec2 vScreen;
out vec4 fragColor;
${uniforms}
${noise}
void main() {
  vec3 ray = normalize(uForward + vScreen.x*uRight*uAspect*0.57735027 + vScreen.y*uUp*0.57735027);
  vec3 sun = normalize(vec3(-0.5,0.75,-0.42));
  vec3 sky = mix(vec3(0.76,0.84,0.82), vec3(0.24,0.48,0.69), pow(max(ray.y,0.0),0.47));
  sky += vec3(1.0,0.82,0.54)*pow(max(dot(ray,sun),0.0),70.0)*0.23;
  gl_FragDepth = 1.0;
  if (ray.y > 0.008) {
    vec2 at = uEye.xz + ray.xz*(max(1.0,16.0-uEye.y)/ray.y);
    float c = cloudField(at);
    float lighting = cloudField(at+vec2(-3.0,2.0));
    vec3 cloudColor = mix(vec3(0.63,0.70,0.72),vec3(1.0,0.98,0.91), clamp(1.2-lighting,0.0,1.0));
    sky = mix(sky,cloudColor,c*smoothstep(0.008,0.07,ray.y));
  }
  if (ray.y < -0.0001) {
    float distanceToGround = -uEye.y/ray.y;
    vec3 p = uEye + ray*distanceToGround;
    float habitat = fbm(p.xz*0.27);
    float detail = valueNoise(p.xz*12.0);
    vec3 ground = mix(vec3(0.27,0.30,0.10),vec3(0.32,0.41,0.13),habitat);
    ground = mix(ground,vec3(0.36,0.30,0.16), (1.0-uMoisture)*0.6);
    ground *= (0.78+detail*0.22)*shadowAt(p.xz);
    float distanceFade = 1.0-exp(-distanceToGround*0.006);
    ground = mix(ground,vec3(0.54,0.62,0.40),distanceFade*0.76);
    sky = ground;
    vec4 clip = projectPoint(p);
    gl_FragDepth = clamp((clip.z/clip.w)*0.5+0.5,0.0,0.9999999);
  }
  fragColor = vec4(sky,1);
}`;
const bladeVertex = `#version 300 es
precision highp float;
layout(location=0) in vec4 aRoot;
layout(location=1) in vec4 aStyle;
out float vLevel, vHue, vEdge;
out vec3 vPosition;
${uniforms}
${noise}
void main() {
  int segment = gl_VertexID/6;
  int corner = gl_VertexID%6;
  float row = (corner==2 || corner==4 || corner==5) ? 1.0 : 0.0;
  float side = (corner==1 || corner==3 || corner==4) ? 1.0 : -1.0;
  float t = (float(segment)+row)/4.0;
  float h = aRoot.z*uHeight;
  vec2 direction = vec2(cos(aRoot.w),sin(aRoot.w));
  float wave = sin(aRoot.x*0.19+aRoot.y*0.24-uTime*1.5);
  float flutter = sin(aStyle.x+uTime*3.2+aRoot.y*0.4)*0.12;
  float gust = 0.55+0.45*sin(aRoot.x*0.08-aRoot.y*0.11-uTime*0.7);
  float cloudGust = 1.0+cloudField(aRoot.xy+vec2(18,-10))*0.5;
  vec2 bend = vec2(1.0,0.38)*uWind*(0.17+gust*gust*0.3+wave*0.07+flutter*0.15)*cloudGust;
  vec2 toBrush = aRoot.xy-uBrush.xy;
  float touch = max(0.0,1.0-length(toBrush)/2.7)*uBrush.z;
  bend += normalize(toBrush+vec2(0.0001))*touch*1.7;
  vec2 curl = direction*(0.12+aStyle.y*0.23);
  vec2 xz = aRoot.xy+(bend+curl)*t*t*h;
  float width = aStyle.w*(1.0-t*0.97);
  vec3 p = vec3(xz.x,h*t*(1.0-min(0.3,length(bend)*0.12)*t),xz.y);
  p.xz += direction*width*side;
  vLevel=t; vHue=aStyle.y; vEdge=side; vPosition=p;
  gl_Position=projectPoint(p);
}`;
const bladeFragment = `#version 300 es
precision highp float;
in float vLevel, vHue, vEdge;
in vec3 vPosition;
out vec4 fragColor;
${uniforms}
${noise}
void main() {
  vec3 base = mix(vec3(0.15,0.24,0.055),vec3(0.46,0.57,0.15),vHue);
  base = mix(base,vec3(0.61,0.49,0.22),(1.0-uMoisture)*(0.35+vHue*0.45));
  vec3 color = base*(0.38+0.72*sqrt(vLevel))*(0.86+0.14*(1.0-abs(vEdge)));
  color += vec3(0.16,0.18,0.035)*pow(vLevel,3.0);
  color *= shadowAt(vPosition.xz);
  float fade=1.0-exp(-length(vPosition-uEye)*0.006);
  color=mix(color,vec3(0.54,0.62,0.40),fade*0.76);
  fragColor=vec4(color,1);
}`;
const flowerVertex = `#version 300 es
precision highp float;
layout(location=0) in vec4 aRoot;
layout(location=1) in vec4 aStyle;
out vec2 vFlower;
out float vHue;
out vec3 vPosition;
${uniforms}
${noise}
void main() {
  int c=gl_VertexID;
  vec2 p=vec2((c==1 || c==3 || c==4)?1.0:-1.0,(c==2 || c==4 || c==5)?1.0:-1.0);
  float gust=0.55+0.45*sin(aRoot.x*0.08-aRoot.y*0.11-uTime*0.7);
  float wave=sin(aRoot.x*0.19+aRoot.y*0.24-uTime*1.5);
  float flutter=sin(aStyle.x+uTime*3.2+aRoot.y*0.4)*0.12;
  float cg=1.0+cloudField(aRoot.xy+vec2(18,-10))*0.5;
  vec2 bend=vec2(1.0,0.38)*uWind*(0.17+gust*gust*0.3+wave*0.07+flutter*0.15)*cg;
  vec2 d=aRoot.xy-uBrush.xy;
  bend+=normalize(d+vec2(0.0001))*max(0.0,1.0-length(d)/2.7)*uBrush.z*1.7;
  vec2 curl=vec2(cos(aRoot.w),sin(aRoot.w))*(0.12+aStyle.y*0.23);
  float h=aRoot.z*uHeight;
  vec3 center=vec3(aRoot.x+(bend.x+curl.x)*h,h*(1.0-min(0.3,length(bend)*0.12)),aRoot.y+(bend.y+curl.y)*h);
  vPosition=center; vFlower=p; vHue=aStyle.y;
  gl_Position=projectPoint(center+(uRight*p.x+uUp*p.y)*(0.085+aStyle.y*0.065));
}`;
const flowerFragment = `#version 300 es
precision highp float;
in vec2 vFlower;
in float vHue;
in vec3 vPosition;
out vec4 fragColor;
${uniforms}
${noise}
void main() {
  float angle=atan(vFlower.y,vFlower.x);
  float edge=0.62+0.22*cos(angle*5.0);
  float radius=length(vFlower);
  if(radius>edge)discard;
  vec3 petals=vHue>0.5?vec3(0.91,0.62,0.65):vec3(0.97,0.78,0.24);
  petals=mix(petals*0.76,petals,radius);
  if(radius<0.18)petals=vec3(0.87,0.55,0.10);
  petals*=shadowAt(vPosition.xz);
  fragColor=vec4(petals,1);
}`;

export class Meadow {
  constructor(canvas, onStats, onError) {
    this.canvas=canvas; this.onStats=onStats; this.onError=onError;
    this.settings={...DEFAULTS};
    this.camera={x:0,y:1.9,z:12,yaw:0,pitch:-0.075};
    this.brush={x:1000,z:1000,strength:0};
    this.time=0; this.frames=0; this.last=0; this.sampleTime=0; this.active=false;
    this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
    if(!this.gl)throw new Error('当前浏览器未提供 WebGL2，请使用支持硬件加速的 Chrome 或 Edge。');
    this.programs=[
      this.program(fullVertex,worldFragment),
      this.program(bladeVertex,bladeFragment),
      this.program(flowerVertex,flowerFragment)
    ];
    this.emptyVao=this.gl.createVertexArray();
    this.bladeGeometry=this.geometry(); this.flowerGeometry=this.geometry();
    this.regenerate();
    this.frame=this.frame.bind(this);
    this.bindInput();
    canvas.addEventListener('webglcontextlost',e=>{
      e.preventDefault();this.setActive(false);onError('图形上下文已丢失，请点击“重新启动自研演示”。');
    });
  }
  program(vertex,fragment) {
    const gl=this.gl;
    const compile=(type,source)=>{
      const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
    const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    const names=['Eye','Forward','Right','Up','Aspect','Time','Wind','Height','Clouds','Moisture','Seed','Brush'];
    return {program,locations:Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(program,'u'+name)]))};
  }
  geometry() {
    const gl=this.gl,vao=gl.createVertexArray(),buffer=gl.createBuffer();
    gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    for(let i=0;i<2;i++){
      gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,4,gl.FLOAT,false,32,i*16);gl.vertexAttribDivisor(i,1);
    }
    return {vao,buffer};
  }
  regenerate() {
    const gl=this.gl;
    this.field=createField(this.settings.seed,this.settings.density);
    for(const [geometry,data] of [[this.bladeGeometry,this.field.blades],[this.flowerGeometry,this.field.blooms]]){
      gl.bindBuffer(gl.ARRAY_BUFFER,geometry.buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    }
    this.instanceBytes=this.field.blades.byteLength+this.field.blooms.byteLength;
    this.report();
  }
  set(name,value) {
    this.settings[name]=value;
    if(name==='seed'||name==='density')this.regenerate();
  }
  preset(name) {
    Object.assign(this.camera,name==='overhead'?{x:0,y:24,z:18,yaw:0,pitch:-0.95}:name==='close'?{x:0,y:0.85,z:6,yaw:0.18,pitch:-0.1}:{x:0,y:1.9,z:12,yaw:0,pitch:-0.075});
  }
  setActive(active) {
    if(active===this.active)return;
    this.active=active;
    if(active){this.last=0;this.frames=0;this.sampleTime=0;this.raf=requestAnimationFrame(this.frame);}
    else cancelAnimationFrame(this.raf);
  }
  bindInput() {
    const canvas=this.canvas;
    let drag=null;
    canvas.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;
      canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY};
      if(e.shiftKey)this.pointBrush(e);
    });
    canvas.addEventListener('pointermove',e=>{
      if(e.shiftKey){this.pointBrush(e);return;}
      if(!drag)return;
      this.camera.yaw-=(e.clientX-drag.x)*0.004;
      this.camera.pitch=clamp(this.camera.pitch-(e.clientY-drag.y)*0.003,-1.4,0.55);
      drag={x:e.clientX,y:e.clientY};
    });
    const release=()=>{drag=null;};
    canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
    canvas.addEventListener('wheel',e=>{
      e.preventDefault();
      const distance=clamp(e.deltaY*0.012,-2,2),basis=cameraBasis(this.camera.yaw,this.camera.pitch);
      this.camera.x=clamp(this.camera.x+basis.forward[0]*distance,-18,18);
      this.camera.z=clamp(this.camera.z+basis.forward[2]*distance,-25,18);
    },{passive:false});
    canvas.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d','W','A','S','D'].includes(e.key))return;
      e.preventDefault();
      const key=e.key.toLowerCase(),basis=cameraBasis(this.camera.yaw,this.camera.pitch);
      if(key==='arrowleft')this.camera.yaw+=0.06;
      else if(key==='arrowright')this.camera.yaw-=0.06;
      else {
        const dir=(key==='a'||key==='d')?basis.right:basis.forward;
        const sign=['s','a','arrowdown'].includes(key)?-1:1;
        this.camera.x=clamp(this.camera.x+dir[0]*sign,-18,18);
        this.camera.z=clamp(this.camera.z+dir[2]*sign,-25,18);
      }
    });
  }
  pointBrush(event) {
    const rect=this.canvas.getBoundingClientRect();
    const hit=groundHit((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2,this.camera,rect.width/rect.height);
    if(hit)Object.assign(this.brush,{x:hit.x,z:hit.z,strength:1});
  }
  use(bundle,basis) {
    const gl=this.gl,u=bundle.locations,s=this.settings;
    gl.useProgram(bundle.program);
    gl.uniform3f(u.Eye,this.camera.x,this.camera.y,this.camera.z);
    gl.uniform3fv(u.Forward,basis.forward);gl.uniform3fv(u.Right,basis.right);gl.uniform3fv(u.Up,basis.up);
    gl.uniform1f(u.Aspect,this.canvas.width/this.canvas.height);
    for(const [key,value] of Object.entries({Time:this.time,Wind:s.wind,Height:s.height,Clouds:s.clouds,Moisture:s.moisture,Seed:s.seed}))gl.uniform1f(u[key],value);
    gl.uniform3f(u.Brush,this.brush.x,this.brush.z,this.brush.strength);
  }
  frame(now) {
    if(!this.active)return;
    try{
      const dt=Math.min((now-(this.last||now))/1000,0.05);this.last=now;
      if(!this.settings.paused){this.time+=dt;this.brush.strength*=Math.exp(-dt*2.8);}
      const gl=this.gl,rect=this.canvas.getBoundingClientRect(),scale=Math.min(devicePixelRatio||1,1.5);
      const width=Math.max(1,Math.round(rect.width*scale)),height=Math.max(1,Math.round(rect.height*scale));
      if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
      gl.viewport(0,0,width,height);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.ALWAYS);
      const basis=cameraBasis(this.camera.yaw,this.camera.pitch);
      this.use(this.programs[0],basis);gl.bindVertexArray(this.emptyVao);gl.drawArrays(gl.TRIANGLES,0,3);
      gl.depthFunc(gl.LESS);
      this.use(this.programs[1],basis);gl.bindVertexArray(this.bladeGeometry.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,24,this.field.count);
      if(this.settings.flowers){
        this.use(this.programs[2],basis);gl.bindVertexArray(this.flowerGeometry.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,6,this.field.flowerCount);
      }
      this.frames++;
      if(!this.sampleTime)this.sampleTime=now;
      if(now-this.sampleTime>800){this.fps=Math.round(this.frames*1000/(now-this.sampleTime));this.frames=0;this.sampleTime=now;this.report();}
      this.raf=requestAnimationFrame(this.frame);
    }catch(error){this.setActive(false);this.onError(error.message);}
  }
  report() {
    this.onStats({fps:this.fps||null,count:this.field.count,flowers:this.settings.flowers?this.field.flowerCount:0,bytes:this.instanceBytes,draws:this.settings.flowers?3:2,time:this.time});
  }
  destroy() {
    this.setActive(false);
    for(const p of this.programs)this.gl.deleteProgram(p.program);
    for(const geometry of [this.bladeGeometry,this.flowerGeometry]){this.gl.deleteBuffer(geometry.buffer);this.gl.deleteVertexArray(geometry.vao);}
    this.gl.deleteVertexArray(this.emptyVao);
  }
}
