/** 0.14 optical film. The lens samples a completed scene, including the text.
 * It is a screen-space refractive compositor, not a volumetric path tracer.
 */
import type {EffectConfig} from '../../scripts/effects.mjs';
import {clamp,lerp,smooth,TAU,text,rr} from './math';
type G=CanvasRenderingContext2D;
type Options={disableLens?:boolean;state?:typeof glassState014;content?:(g:G,c:EffectConfig,t:number)=>void;overlay?:(g:G,c:EffectConfig,t:number)=>void};
const WIDTH=1280,HEIGHT=720;
const vertex=`#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
const head=`#version 300 es
precision highp float;
out vec4 fragColor;
uniform float time,detail,energy,seed;
uniform vec3 primary,secondary;
vec2 pixel(){return vec2(gl_FragCoord.x,720.-gl_FragCoord.y);}
vec2 texUV(vec2 p){return vec2(p.x/1280.,1.-p.y/720.);}
float sdBox(vec2 q,vec2 b,float r){vec2 d=abs(q)-b+r;return length(max(d,0.))+min(max(d.x,d.y),0.)-r;}
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float noise(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+seed*.19)*43758.5453);}
`;
const background=head+`
void main(){vec2 p=pixel(),q=(p-vec2(640.,360.))/720.;float t=time*.12;
 vec2 a=q-vec2(-.52+sin(t*.7)*.07,-.23+cos(t*.8)*.06),b=q-vec2(.51+cos(t*.6)*.06,.19+sin(t*.9)*.07);
 vec3 col=vec3(.018,.023,.072)+primary*exp(-dot(a*vec2(.88,1.2),a*vec2(.88,1.2))*2.8)*.55+secondary*exp(-dot(b*vec2(1.15,1.25),b*vec2(1.15,1.25))*3.4)*.37;
 float arc=exp(-pow((q.y+.10*sin(q.x*2.8-t)+.16)*9.,2.))*exp(-q.x*q.x*.65);col+=mix(primary,secondary,.24)*arc*.09;
 for(int i=0;i<18;i++){float f=float(i),x=noise(vec2(f,1.))*1220.+30.,y=noise(vec2(f,2.))*620.+40.;vec2 d=p-vec2(x+sin(time*.13+f)*9.,y+cos(time*.11+f)*7.);float glow=exp(-dot(d,d)/18.);col+=vec3(.55,.67,.94)*glow*.025;}
 float threadY=394.+88.*sin(p.x*.0045+time*.055);float thread=exp(-pow((p.y-threadY)/1.4,2.));col+=vec3(.31,.55,.76)*thread*.10;col+=(noise(p)-.5)/255.;fragColor=vec4(col,1.);
}`;
const cards=head+`
uniform sampler2D uBackground,uContent;
uniform vec4 uCards[3];
uniform vec3 uPose[3];
vec3 bgAt(vec2 p){return texture(uBackground,texUV(p)).rgb;}
vec3 blurAt(vec2 p,float radius){vec3 col=bgAt(p)*.2;for(int i=0;i<16;i++){float a=float(i)*6.2831853/16.;col+=bgAt(p+vec2(cos(a),sin(a))*radius)*.05;}return col;}
void main(){vec2 p=pixel();vec3 col=bgAt(p);
 for(int i=2;i>=0;i--){vec4 c=uCards[i];vec3 pose=uPose[i];vec2 q=rot(pose.x)*(p-c.xy);float r=i==0?27.:23.,d=sdBox(q,c.zw*.5,r),sh=sdBox(q-vec2(0.,17.),c.zw*.5,r+6.);
  float shadow=(1.-smoothstep(-9.,32.,sh))*.17*pose.y;col*=1.-shadow;
  if(d<1.1){vec2 e=vec2(.8,0.);vec2 n=normalize(vec2(sdBox(q+e.xy,c.zw*.5,r)-sdBox(q-e.xy,c.zw*.5,r),sdBox(q+e.yx,c.zw*.5,r)-sdBox(q-e.yx,c.zw*.5,r))+vec2(.0001));
   float rim=exp(-abs(d)*.55),bevel=exp(-abs(d+1.5)*1.5),edge=exp(-max(0.,-d)*.12);vec2 bent=p+n*(2.+detail*4.)*edge;
   vec3 glass=blurAt(bent,14.+detail*15.)*.94+vec3(.15,.18,.29)*.10;
   float facing=max(0.,dot(n,normalize(vec2(-.5,-.9))));glass+=vec3(.55,.67,.92)*rim*(.14+facing*.35)+vec3(.58,.68,.96)*bevel*.14;
   glass+=mix(primary,secondary,clamp(q.y/c.w+.5,0.,1.))*edge*.035;
   float sheen=exp(-pow((q.x+q.y*.48-(time*66.-470.))* .025,2.));glass+=vec3(.37,.46,.74)*sheen*.055;
   vec2 uv=q/c.zw+.5;vec2 ct=i==0?vec2(uv.x*(2./3.),1.-uv.y):i==1?vec2(2./3.+uv.x/3.,1.-uv.y*.5):vec2(2./3.+uv.x/3.,.5-uv.y*.5);
   vec4 ink=texture(uContent,ct);glass=mix(glass,ink.rgb,ink.a);
   float cover=(1.-smoothstep(-.7,1.,d))*pose.y;col=mix(col,glass,cover);
  }
 }
 fragColor=vec4(col,1.);
}`;
const optical=head+`
uniform sampler2D uScene;
uniform vec4 uLens;
uniform vec4 uOptics;
vec3 sceneAt(vec2 p){return texture(uScene,texUV(p)).rgb;}
void main(){vec2 p=pixel(),C=uLens.xy,b=uLens.zw*.5;float on=uOptics.x,mag=uOptics.y,angle=uOptics.z;vec2 q=rot(angle)*(p-C);float radius=min(b.y*.68,62.),sd=sdBox(q,b,radius);vec3 col=sceneAt(p);
 if(on>.001){float shadow=sdBox(rot(angle)*(p-C-vec2(8.,15.)),b,radius+2.);col*=1.-(1.-smoothstep(-8.,23.,shadow))*.105*on;
  if(sd<1.2){
   vec2 e=vec2(.75,0.);vec2 g=vec2(sdBox(q+e.xy,b,radius)-sdBox(q-e.xy,b,radius),sdBox(q+e.yx,b,radius)-sdBox(q-e.yx,b,radius));
   vec2 outward=normalize(g+vec2(.0001));float edge=1.-smoothstep(1.,31.,-sd),slope=pow(edge,.72)*.79;vec3 N=normalize(vec3(outward*slope,1.-slope*.45));
   vec2 core=q/mag;vec3 bent=vec3(0.);
   for(int channel=0;channel<3;channel++){
    float IOR=1.46+(float(channel)-1.)*(.012+detail*.006);vec3 R=refract(vec3(0.,0.,-1.),N,1./IOR);vec2 d=R.xy/max(.32,-R.z)*(29.+detail*9.);
    vec2 sampleP=C+rot(-angle)*(core+d);vec3 sampleC=sceneAt(sampleP);
    if(channel==0)bent.r=sampleC.r;else if(channel==1)bent.g=sampleC.g;else bent.b=sampleC.b;
   }
   // The centre remains clear enough to read the genuinely magnified letters.
   bent=bent*.985+vec3(.025,.036,.064)*.10;float rim=exp(-abs(sd)*.65),inner=exp(-abs(sd+3.4)*.7);
   float lit=max(0.,dot(outward,normalize(vec2(-.55,-.84))));bent+=vec3(.76,.88,1.)*rim*(.13+lit*.48)+vec3(.44,.59,.88)*inner*.12;
   vec2 highlight=(q/b-vec2(-.56,-.52))*vec2(2.,3.);bent+=vec3(.82,.9,1.)*exp(-dot(highlight,highlight)*6.)*.035;
   float cover=(1.-smoothstep(-.8,1.,sd))*on;col=mix(col,bent,cover);
  }
 }
 float vignette=1.-.09*smoothstep(.4,.98,length((p-vec2(640.,350.))/vec2(850.,610.)));col*=vignette;
 fragColor=vec4(col+(noise(p)-.5)/650.,1.);
}`;

/** Screen-space choreography shared by rendering and the key-frame audit. */
export function glassState014(seconds:number,c:EffectConfig){
 const t=clamp(seconds/c.duration*10,0,10),settle=smooth(0,2.2,t),reveal=smooth(6.6,8.25,t);
 const zoom=lerp(1.27,1,settle),focus={x:lerp(380,640,settle),y:lerp(220,360,settle)},target={x:lerp(600,640,settle),y:lerp(310,360,settle)};
 const screen=(x:number,y:number)=>({x:(x-focus.x)*zoom+target.x,y:(y-focus.y)*zoom+target.y});
 const main=screen(lerp(570,568,reveal),lerp(350,329,reveal));
 const cardData=[
  {x:main.x,y:main.y,w:lerp(780,752,reveal)*zoom,h:450*zoom,angle:lerp(-.018,.012,reveal),alpha:1},
  {...screen(1070,lerp(230,226,reveal)+Math.sin(t*.48)*3),w:246*zoom,h:188*zoom,angle:-.027+Math.sin(t*.4)*.006,alpha:.65+.35*smooth(.2,1.4,t)},
  {...screen(1080,lerp(475,457,reveal)+Math.cos(t*.46)*3),w:246*zoom,h:188*zoom,angle:.026+Math.cos(t*.4)*.006,alpha:.65+.35*smooth(.45,1.65,t)},
 ];
 const scan=smooth(3.12,4.74,t),handoff=smooth(4.74,5.32,t),depart=smooth(6.15,7.68,t),presence=smooth(2.85,3.3,t);
 // Read the title, then the tuning value; never spend the middle act magnifying empty space.
 const x=lerp(lerp(244,450,scan),861+Math.sin(t*.8)*4,handoff),y=lerp(232+Math.sin(scan*Math.PI)*6,313,handoff);
 const lens={x:lerp(x,1072,depart),y:lerp(y,493,depart),w:lerp(244,145,depart),h:lerp(184,116,depart),angle:.025*Math.sin(t*.9),alpha:presence,magnification:lerp(1.36+.10*c.intensity,1.18,depart)};
 return {time:t,cards:cardData,lens,scan,depart,reveal};
}
function drawContent(g:G,c:EffectConfig,t:number){
 g.clearRect(0,0,1536,768);const fg='#f3f4ff',muted='#b7c5e8',active=smooth(.8,2.8,t),phase=t*(1.2+c.intensity*.8),tune=96.8-(1-smooth(1.1,3.05,t))*3.6;
 const txt=(s:string,x:number,y:number,size:number,color=fg,weight=500,align:CanvasTextAlign='left',max=920)=>text(g,s,x,y,size,color,align,weight,max);
 txt('PRISM / SIGNAL ARCHIVE',64,66,20,muted,550);g.fillStyle='#90f3e2';g.beginPath();g.arc(952,57,5,0,TAU);g.fill();
 txt(c.title,61,194,c.title.length>10?58:c.title.length>6?72:88,fg,650,'left',850);
 txt(c.subtitle,66,245,24,muted,450,'left',880);
 txt(t>6.6?'SIGNAL FOUND':'FIND YOUR FREQUENCY',66,317,15,muted,550);
 txt(tune.toFixed(1),955,333,56,fg,400,'right',250);txt('MHz',954,357,17,muted,400,'right');
 g.strokeStyle='#a4b6ed24';g.lineWidth=1;
 for(let i=0;i<5;i++){g.beginPath();g.moveTo(66,389+i*43);g.lineTo(958,389+i*43);g.stroke();}
 for(let i=0;i<7;i++){g.beginPath();g.moveTo(66+i*148.6,385);g.lineTo(66+i*148.6,565);g.stroke();}
 for(let line=0;line<4;line++){
  g.strokeStyle=line===0?'#f2f2ff':line===1?c.secondary:line===2?'#b9a6fa':'#c3b8fb';g.globalAlpha=line===0?.92:.28;g.lineWidth=line===0?2.8:1.4;g.beginPath();
  for(let i=0;i<=400;i++){const x=66+i*892/400,envelope=Math.sin(i/400*Math.PI)**1.3,y=477+Math.sin(i*.042-phase+line*.43)*(31+active*30)*envelope+Math.sin(i*.014+phase*.4)*17+line*6;(i?g.lineTo(x,y):g.moveTo(x,y));}g.stroke();
 }
 g.globalAlpha=1;const play=66+((t*.08)%1)*892;g.strokeStyle='#c9ecff90';g.lineWidth=1.3;g.beginPath();g.moveTo(play,385);g.lineTo(play,569);g.stroke();g.fillStyle='#d5f5ff';g.beginPath();g.arc(play,385,3,0,TAU);g.fill();
 g.strokeStyle='#c5d2ff32';g.beginPath();g.moveTo(66,609);g.lineTo(958,609);g.stroke();g.fillStyle='#f2f5ff1c';rr(g,64,644,68,68,34);g.fill();g.fillStyle=fg;g.beginPath();g.moveTo(91,664);g.lineTo(91,692);g.lineTo(112,678);g.fill();
 txt(c.words[0]||'播放',155,676,27,fg,600);txt(t>6.6?'ON AIR / 已调频':'STEREO / 正在调频',155,710,17,muted,450);txt(`00:${String(Math.floor(t)).padStart(2,'0')} / LIVE`,955,688,22,muted,450,'right');
 g.save();g.translate(1024,0);
 txt(c.words[Math.min(1,c.words.length-1)]||'频率',35,47,26,muted,500,'left',430);txt(tune.toFixed(1),35,127,73,fg,350,'left',430);
 const bars=16+c.count*2;for(let i=0;i<bars;i++){const h=15+Math.sin(i*.27-phase*.6)**2*(58+active*73),x=36+i*442/bars;g.fillStyle=i%4===0?c.secondary:'#dae0ffb8';rr(g,x,321-h,Math.max(4,300/bars),h,2.5);g.fill();}txt('FREQUENCY RESPONSE',37,355,14,muted,500,'left',430);g.restore();
 g.save();g.translate(1024,384);txt(c.words.at(-1)||'共鸣',35,47,26,muted,500,'left',430);g.translate(256,215);
 for(let i=0;i<4;i++){g.beginPath();const r=63+i*21,ang=phase*.12+i*.13;g.arc(0,0,r,-Math.PI*.9+ang,Math.PI*.8+ang);g.strokeStyle=i===0?c.secondary:'#c6d6ff78';g.lineWidth=i===0?3:1.3;g.stroke();}
 txt('FM',0,13,42,fg,550,'center',200);g.restore();txt('LIGHT CARRIES A SIGNAL',1280,736,15,muted,500,'center',450);
}

export function paintGlassOverlay014(g:G,c:EffectConfig,seconds:number){const t=seconds/c.duration*10;g.clearRect(0,0,WIDTH,HEIGHT);text(g,'PRISM / 折光电台',43,37,12,'#d8ddf3','left',550);text(g,'LISTEN THROUGH LIGHT',1237,37,11,'#a8c3e0','right',500);
 const end=smooth(7.9,8.75,t);if(end){g.save();g.globalAlpha=end;text(g,c.title,54,635,43,'#f4f5ff','left',650,900);text(g,c.subtitle,57,671,17,'#b8c9ed','left',450,1080);g.restore();}
}
export function createShader(canvas:HTMLCanvasElement,c:EffectConfig,options:Options={}){
 const gl=canvas.getContext('webgl2',{antialias:false,preserveDrawingBuffer:true});if(!gl)throw new Error('折光电台需要 WebGL2。');
 const shaders:WebGLShader[]=[],programs:WebGLProgram[]=[],textures:WebGLTexture[]=[],buffers:WebGLFramebuffer[]=[];
 const compile=(type:number,source:string)=>{const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'光学shader编译失败');shaders.push(shader);return shader;};
 const makeProgram=(source:string)=>{const program=gl.createProgram()!;gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,source));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'光学shader链接失败');programs.push(program);return program;};
 const bgProgram=makeProgram(background),cardProgram=makeProgram(cards),lensProgram=makeProgram(optical);
 const uniforms=new Map<WebGLProgram,Map<string,WebGLUniformLocation|null>>();
 const loc=(p:WebGLProgram,name:string)=>{if(!uniforms.has(p))uniforms.set(p,new Map());const m=uniforms.get(p)!;if(!m.has(name))m.set(name,gl.getUniformLocation(p,name));return m.get(name)!;};
 const makeTexture=(w:number,h:number)=>{const texture=gl.createTexture()!;textures.push(texture);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return texture;};
 const target=()=>{const texture=makeTexture(WIDTH,HEIGHT),framebuffer=gl.createFramebuffer()!;buffers.push(framebuffer);gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('光学离屏场景无法建立');return {texture,framebuffer};};
 const bgTarget=target(),sceneTarget=target(),contentTexture=makeTexture(1536,768),atlas=document.createElement('canvas');atlas.width=1536;atlas.height=768;const context=atlas.getContext('2d')!;
 const rgb=(v:string)=>[1,3,5].map(i=>parseInt(v.slice(i,i+2),16)/255);
 const bind=(program:WebGLProgram,t:number)=>{gl.useProgram(program);gl.uniform1f(loc(program,'time'),t);gl.uniform1f(loc(program,'detail'),c.detail);gl.uniform1f(loc(program,'energy'),c.intensity);gl.uniform1f(loc(program,'seed'),c.seed);gl.uniform3fv(loc(program,'primary'),rgb(c.primary));gl.uniform3fv(loc(program,'secondary'),rgb(c.secondary));};
 const textureAt=(program:WebGLProgram,name:string,texture:WebGLTexture,index:number)=>{gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(loc(program,name),index);};
 const vao=gl.createVertexArray();gl.bindVertexArray(vao);
 return {overlay:options.overlay||paintGlassOverlay014,draw(seconds:number){
  const s=(options.state||glassState014)(seconds,c),t=s.time;(options.content||drawContent)(context,c,t);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,contentTexture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,0);gl.viewport(0,0,WIDTH,HEIGHT);
  gl.bindFramebuffer(gl.FRAMEBUFFER,bgTarget.framebuffer);bind(bgProgram,t);gl.drawArrays(gl.TRIANGLES,0,3);
  gl.bindFramebuffer(gl.FRAMEBUFFER,sceneTarget.framebuffer);bind(cardProgram,t);textureAt(cardProgram,'uBackground',bgTarget.texture,0);textureAt(cardProgram,'uContent',contentTexture,1);gl.uniform4fv(loc(cardProgram,'uCards[0]'),s.cards.flatMap(a=>[a.x,a.y,a.w,a.h]));gl.uniform3fv(loc(cardProgram,'uPose[0]'),s.cards.flatMap(a=>[a.angle,a.alpha,0]));gl.drawArrays(gl.TRIANGLES,0,3);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);bind(lensProgram,t);textureAt(lensProgram,'uScene',sceneTarget.texture,0);gl.uniform4fv(loc(lensProgram,'uLens'),[s.lens.x,s.lens.y,s.lens.w,s.lens.h]);gl.uniform4fv(loc(lensProgram,'uOptics'),[options.disableLens?0:s.lens.alpha,s.lens.magnification,s.lens.angle,0]);gl.drawArrays(gl.TRIANGLES,0,3);gl.flush();
 },dispose(){textures.forEach(a=>gl.deleteTexture(a));buffers.forEach(a=>gl.deleteFramebuffer(a));programs.forEach(a=>gl.deleteProgram(a));shaders.forEach(a=>gl.deleteShader(a));gl.deleteVertexArray(vao);gl.getExtension('WEBGL_lose_context')?.loseContext();}};
}
export const createOptical=createShader;
