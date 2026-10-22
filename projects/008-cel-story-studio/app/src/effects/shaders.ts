import type {EffectConfig} from '../../scripts/effects.mjs';
const vs=`#version 300 es
in vec2 aPosition;out vec2 uv;void main(){uv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
const common=`#version 300 es
precision highp float;
in vec2 uv;out vec4 fragColor;
uniform float time,energy,detail,seed;uniform int count;uniform vec3 primary,secondary;
float hash(float n){return fract(sin(n*127.1+seed*311.7)*43758.5453);}
vec3 bg(vec2 p){return mix(vec3(.96,.94,.89),vec3(.82,.86,.94),smoothstep(-.7,.8,p.y));}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
`;
const liquid=`
float field(vec3 p){float d=10.;for(int i=0;i<14;i++){if(i>=count)break;float f=float(i),a=f*6.283185/float(count)+time*(.15+energy*.28);vec3 c=vec3(cos(a)*(.42+sin(time*.4+f)*.16),sin(a)*(.35+cos(time*.5+f)*.13)-.12,sin(f+time*.3)*.14);float r=.13+hash(f)*.12;d=smin(d,length(p-c)-r,.07+detail*.27);}return d;}
void main(){vec2 p=(uv-.5)*vec2(3.55556,2.);vec3 col=bg(p);vec3 ro=vec3(p,3.),rd=vec3(0.,0.,-1.);float travel=0.;bool hit=false;vec3 pos;
for(int j=0;j<48;j++){pos=ro+rd*travel;float d=field(pos);if(d<.001){hit=true;break;}travel+=max(.002,d*.85);if(travel>5.)break;}
if(hit){vec2 e=vec2(.002,0.);vec3 n=normalize(vec3(field(pos+e.xyy)-field(pos-e.xyy),field(pos+e.yxy)-field(pos-e.yxy),field(pos+e.yyx)-field(pos-e.yyx)));vec3 l=normalize(vec3(-.6,.9,1.8));float diff=max(0.,dot(n,l));float spec=pow(max(0.,dot(reflect(-l,n),-rd)),55.);float fres=pow(1.-max(0.,dot(n,-rd)),3.);vec3 base=mix(primary,secondary,smoothstep(-.5,.5,pos.y));col=base*(.45+.55*diff)+vec3(1.,.93,.9)*spec*.9+vec3(.6,.75,1.)*fres*.32;col=mix(col,vec3(1.),pow(max(0.,dot(n,normalize(vec3(.45,.5,1.)))),95.)*.5);}
else{float shadow=field(vec3(p+vec2(.02,.12),0.));col*=1.-.12*exp(-max(0.,shadow)*9.);}
fragColor=vec4(col,1.);}`;
const glass=`
vec3 aurora(vec2 p){float t=time*(.08+energy*.24)+seed*.07;vec3 base=vec3(.94,.95,.98);float a=exp(-length((p-vec2(sin(t)*.6,cos(t*.7)*.2))*vec2(.8,1.2))*1.6);float b=exp(-length((p-vec2(cos(t*.8)*.8,-.3+sin(t)*.2))*vec2(1.,1.5))*1.7);base=mix(base,primary*.6+vec3(.35),a*.7);base=mix(base,secondary*.6+vec3(.35),b*.65);return base;}
float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return min(max(q.x,q.y),0.)+length(max(q,0.))-r;}
void main(){vec2 p=(uv-.5)*vec2(3.55556,2.);vec3 col=aurora(p);int total=min(6,2+count/3);for(int i=0;i<6;i++){if(i>=total)break;float f=float(i),n=float(total);vec2 center=vec2((f-(n-1.)*.5)*.52,sin(f*1.7+time*.5)*.13-.13);vec2 q=p-center;float d=box(q,vec2(.34,.35),.08);float shadow=box(q-vec2(.025,-.035),vec2(.34,.35),.08);col*=1.-.08*exp(-abs(shadow)*30.);if(d<.0){float bend=(.015+detail*.10)*exp(d*9.);vec2 normal=normalize(q+vec2(.0001));vec2 refr=p+normal*bend;vec3 refracted=vec3(aurora(refr+normal*.008).r,aurora(refr).g,aurora(refr-normal*.008).b);float rim=exp(d*80.);col=mix(refracted,vec3(1.),.13)+vec3(.3)*rim;float top=exp(-abs(q.y-.31)*150.)*smoothstep(.35,.1,abs(q.x));col+=top*.3;}}
float orb=length(p-vec2(sin(time*.8)*.6,cos(time*.6)*.3-.1))-.17;if(orb<0.){vec2 q=(p-vec2(sin(time*.8)*.6,cos(time*.6)*.3-.1))/.17;col=aurora(p+q*.12)*(.7+.3*sqrt(max(0.,1.-dot(q,q))))+pow(max(0.,1.-length(q-vec2(-.4,.5))),10.)*.6;}
fragColor=vec4(col,1.);}`;
export function createShader(canvas:HTMLCanvasElement,c:EffectConfig,body?:string,content?:HTMLCanvasElement){
 const gl=canvas.getContext('webgl2',{antialias:false,preserveDrawingBuffer:true});if(!gl)throw new Error('此浏览器无法启动 WebGL2，请使用支持硬件加速的浏览器。');
 const shader=(type:number,source:string)=>{const s=gl.createShader(type)!;gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(`着色器编译失败：${message}`);}return s;};
 const vert=shader(gl.VERTEX_SHADER,vs),frag=shader(gl.FRAGMENT_SHADER,common+(body||(c.style==='liquid'?liquid:glass))),program=gl.createProgram()!;gl.attachShader(program,vert);gl.attachShader(program,frag);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('着色器链接失败。');gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 const uniforms=Object.fromEntries(['time','energy','detail','seed','count','primary','secondary'].map(n=>[n,gl.getUniformLocation(program,n)]));
 const rgb=(v:string)=>[1,3,5].map(i=>parseInt(v.slice(i,i+2),16)/255);
 gl.uniform3fv(uniforms.primary,rgb(c.primary));gl.uniform3fv(uniforms.secondary,rgb(c.secondary));gl.uniform1f(uniforms.energy,c.intensity);gl.uniform1f(uniforms.detail,c.detail);gl.uniform1f(uniforms.seed,c.seed);gl.uniform1i(uniforms.count,c.count);
 let texture:WebGLTexture|null=null;if(content){texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,content);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(gl.getUniformLocation(program,'contentTex'),0);}
 return {draw(t:number){gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(uniforms.time,t);gl.drawArrays(gl.TRIANGLES,0,6);gl.flush();},dispose(){if(texture)gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vert);gl.deleteShader(frag);gl.getExtension('WEBGL_lose_context')?.loseContext();}};
}
