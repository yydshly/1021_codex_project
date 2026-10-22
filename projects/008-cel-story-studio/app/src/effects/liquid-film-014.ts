/** Original 10 s liquid film: impact, crown, bridge, neck rupture and recoil.
 * The surface is art-directed 3D SDF geometry. There is no FLIP or fluid solver.
 */
import type {EffectConfig} from '../../scripts/effects.mjs';
import {clamp,smooth,text} from './math';
const vertex=`#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
const fragment=`#version 300 es
precision highp float;
out vec4 fragColor;
uniform float time,energy,detail,seed;
uniform int count;
uniform vec3 primary,secondary;
const float PI=3.14159265359;
float ease(float a,float b,float t){float x=clamp((t-a)/(b-a),0.,1.);return x*x*(3.-2.*x);}
float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
float capsule(vec3 p,vec3 a,vec3 b,float ra,float rb){vec3 ba=b-a;float h=clamp(dot(p-a,ba)/max(dot(ba,ba),.00001),0.,1.);return length(p-a-ba*h)-mix(ra,rb,h);}
float ellipsoid(vec3 p,vec3 r){float k0=length(p/r),k1=length(p/(r*r));return k0*(k0-1.)/max(k1,.0001);}
float torus(vec3 p,float radius,float thick){return length(vec2(length(p.xz)-radius,p.y))-thick;}
float roundCylinder(vec3 p,float radius,float halfH,float bevel){vec2 d=vec2(length(p.xz)-radius,abs(p.y)-halfH);return min(max(d.x,d.y),0.)+length(max(d,0.))-bevel;}
float ellipse2(vec2 p,vec2 r){float k0=length(p/r),k1=length(p/(r*r));return k0*(k0-1.)/max(k1,.0001);}
float rect(vec2 p,vec2 halfSize,float r){vec2 d=abs(p)-halfSize+r;return min(max(d.x,d.y),0.)+length(max(d,0.))-r;}
float bridgeRise(){return 1.37*ease(2.5,4.23,time);}
float bridgeY(float x){float a=x/1.67;float y=.83+bridgeRise()*(1.-a*a)*(1.+.075*a);float wake=sin(x*6.-time*5.)*(.018+.025*energy)*ease(3.,3.4,time)*(1.-ease(4.5,5.5,time));return y+wake;}
vec3 neckAnchor(){return vec3(.65,bridgeY(.65)-.015,.29);}
vec3 neckBulbAtSnap(){return vec3(.90,bridgeY(.65)-.83,1.02);}
float fluid(vec3 p){
 float d=100.;
 for(int i=0;i<2;i++){
  float side=i==0?-1.:1.,hit=i==0?1.05:1.25,fall=ease(.05+(i==0?0.:.16),hit,time),age=max(0.,time-hit),impact=exp(-age*7.)*sin(clamp(age*9.,0.,PI));
  vec3 centre=vec3(side*1.67,mix(3.45,.91,fall),0.);vec3 radii=vec3(.31+.21*fall,.49-.34*fall,.31+.20*fall);
  if(time>hit){centre.y=.77+exp(-age*6.)*.06;radii=vec3(.55+impact*.19,.15-impact*.065,.53+impact*.16);}
  d=smin(d,ellipsoid(p-centre,radii),.105);
  // A thin corrugated crown and rim, with visibly different thickness from the pool.
  float crown=ease(hit,hit+.18,time)*(1.-ease(hit+.48,hit+1.22,time));
  if(crown>.001){vec3 q=p-vec3(side*1.67,.72,0.);float a=atan(q.z,q.x),radius=.56+age*.33*crown,lobes=float(clamp(count,4,11)),height=(.12+(.24+.12*energy)*pow(.5+.5*sin(a*lobes+float(i)),2.))*crown;
   float wall=max(abs(length(q.xz)-radius)-(.026+.012*detail),abs(q.y-height*.5)-height*.5);d=smin(d,wall*.35,.025);
   vec3 rim=vec3(q.x,q.y-height,q.z);d=smin(d,torus(rim,radius,.025),.035);
   for(int k=0;k<11;k++){if(k>=clamp(count,4,11))break;float f=float(k),a2=(f*2.*PI+.9)/lobes,delay=.09,launch=max(0.,age-delay),r=radius+launch*.30,y=.78+height+.22*sin(clamp(launch*4.,0.,PI));vec3 bead=vec3(side*1.67+cos(a2)*r,y,sin(a2)*r);float rad=.035*crown;d=smin(d,length(p-bead)-rad,.018);}
  }
 }
 float grow=ease(2.12,3.19,time);
 if(grow>.001){float x=clamp(p.x,-1.67,1.67),a=x/1.67,load=pow(abs(a),1.65),tension=ease(2.5,4.23,time),slope=bridgeRise()*(-2.*a+.075- .225*a*a)/1.67,dy=(p.y-bridgeY(x))/sqrt(1.+slope*slope);
  // Volume gathers on the supports; the suspended centre is pulled into a narrower, thinner lens.
  float width=mix(.34,.59,load)*(1.-.22*tension*(1.-load));float pulse=sin(x*3.1-time*3.4)*(.018+.013*energy)*(1.-ease(4.7,6.,time));width+=pulse*(1.-load*.55);
  float thick=mix(.070,.17,load)*(1.-.20*tension*(1.-load));thick+=.008*sin(x*3.5+time*1.8)*(1.-ease(4.4,6.,time));
  float centreZ=.055*sin(x*1.85)*(1.-load)*tension;float z=p.z-centreZ;
  float crossY=dy-.026*sin(z*3.3+x*1.15)*(1.-load)*tension;
  float sheet=ellipse2(vec2(crossY,z),vec2(thick,width));float end=max(abs(p.x)-1.67,1.67*(1.-grow)-abs(p.x));sheet=-smin(-sheet,-end,.065);d=smin(d,sheet,.17);
  // Unequal menisci merge into the curved film; neither edge is a straight extruded rail.
  float edgeY=dy-.012*(1.-load),lip=length(vec2(edgeY,z-width*.94))-(.020+.013*load);lip=max(lip,end);d=smin(d,lip,.038);
  float backLip=length(vec2(dy+.008,z+width*.94))-(.015+.010*load);backLip=max(backLip,end);d=smin(d,backLip,.032);
 }
 if(time>4.5){vec3 A=neckAnchor();float pull=ease(4.65,5.98,time),born=ease(4.5,4.9,time);vec3 B=mix(A,neckBulbAtSnap(),pull);float bulbR=.17*born;
  if(time<6.){d=smin(d,length(p-B)-bulbR,.055);d=smin(d,capsule(p,A,B,mix(.10,.014,pull),.075*(1.-pull)+.014),.055);}
  else{
   float tau=time-6.,landing=.79,fall=max(0.,tau);B=neckBulbAtSnap();B.x=mix(B.x,1.65,ease(0.,.72,tau));B.z=mix(B.z,.0,ease(0.,.72,tau));B.y=max(landing,B.y-1.9*fall*fall);float recoil=exp(-tau*12.)*(.65+.35*cos(tau*35.));vec3 stub=A+normalize(B-A)*(.17*recoil);if(tau<.55){float f=1.-ease(.12,.55,tau);d=smin(d,capsule(p,A,stub,.065*f,.018*f),.045*f);}
   float merge=1.-ease(6.56,7.13,time);d=smin(d,ellipsoid(p-B,vec3(.17*(1.+(1.-merge)*1.2),max(.015,.17*merge),.17*(1.+(1.-merge)*1.2))),.065);
   if(tau<.7)d=smin(d,capsule(p,B,B+vec3(-.035,.18*exp(-tau*10.),-.035),.11,.018),.028);
   // The secondary bead follows 0.09 s later, then gives the landing a small delayed reply.
   float st=max(0.,tau-.09);vec3 S=neckBulbAtSnap()+vec3(-.05,.24,-.025);S.x=mix(S.x,1.65,ease(0.,.80,st));S.z=mix(S.z,0.,ease(0.,.80,st));S.y=max(.78,S.y-1.9*st*st);float satellite=.056*(1.-ease(6.85,7.18,time));d=smin(d,length(p-S)-satellite,.02);
   float land=ease(6.50,6.63,time)*(1.-ease(6.91,7.26,time));if(land>.001){vec3 q=p-vec3(1.65,.79,0.);d=smin(d,torus(q,.12+(time-6.5)*.65,.024*land),.035);}
  }
 }
 return d;
}
float opaque(vec3 p){float d=p.y+.055;for(int i=0;i<2;i++){float x=i==0?-1.67:1.67;d=min(d,roundCylinder(p-vec3(x,.29,0.),.61,.27,.055));}return d;}
vec2 field(vec3 p){float f=fluid(p),o=opaque(p);return f<o?vec2(f,1.):vec2(o,2.);}
vec3 normalFluid(vec3 p){vec2 e=vec2(.0015,-.0015);return normalize(e.xyy*fluid(p+e.xyy)+e.yyx*fluid(p+e.yyx)+e.yxy*fluid(p+e.yxy)+e.xxx*fluid(p+e.xxx));}
vec3 normalOpaque(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(opaque(p+e.xyy)-opaque(p-e.xyy),opaque(p+e.yxy)-opaque(p-e.yxy),opaque(p+e.yyx)-opaque(p-e.yyx)));}
vec3 sky(vec3 d){float h=clamp(d.y*.5+.5,0.,1.);return mix(vec3(.027,.044,.056),vec3(.07,.11,.12),h);}
vec3 studio(vec3 r){vec3 col=vec3(.025,.035,.039);float a=pow(max(0.,dot(r,normalize(vec3(-.7,1.2,1.4)))),8.),b=pow(max(0.,dot(r,normalize(vec3(1.1,.7,-.5)))),17.);col+=vec3(3.6,3.30,2.9)*a+vec3(.80,1.60,1.85)*b;float strip=exp(-pow((r.x+.43)/.12,2.))*ease(-.2,.15,r.y)*(1.-ease(.6,.95,r.y));col+=vec3(1.8,1.86,1.82)*strip;return col;}
float shadow(vec3 p,vec3 direction){float result=1.,t=.025;for(int i=0;i<18;i++){float h=field(p+direction*t).x;if(h<.002)return .15;result=min(result,9.*h/t);t+=clamp(h,.018,.33);if(t>5.)break;}return clamp(result,.15,1.);}
vec3 opaqueColor(vec3 p,vec3 n,bool shade){vec3 L=normalize(vec3(-.5,1.2,1.0));float sh=shade?shadow(p+n*.012,L):1.,diff=max(0.,dot(n,L));bool floor=p.y<.05;vec3 base=floor?vec3(.067,.106,.114):vec3(.77,.73,.62);float grain=fract(sin(dot(p.xz,vec2(127.1,311.7)))*43758.5453);base*=.995+grain*.01;float ao=1.;for(int i=0;i<2;i++){vec2 q=p.xz-vec2(i==0?-1.67:1.67,0.);ao-=exp(-dot(q,q)*1.5)*.16*float(floor);}vec3 col=base*(.30+diff*.70*sh)*ao;col+=vec3(.025,.04,.042)*max(0.,n.y);return col;}
vec3 refractedSet(vec3 start,vec3 direction){float travel=.01;for(int i=0;i<20;i++){vec3 p=start+direction*travel;float h=opaque(p);if(h<.003)return opaqueColor(p,normalOpaque(p),false);travel+=clamp(h,.02,.7);if(travel>12.)break;}return sky(direction);}
vec3 film(vec2 uv){
 float travel=ease(0.,2.5,time),macro=ease(4.5,5.4,time)*(1.-ease(6.2,7.7,time)),hero=ease(6.5,8.5,time);
 vec3 ro=mix(vec3(4.5,3.1,7.6),vec3(4.3,2.7,7.4),travel);ro=mix(ro,vec3(2.2,2.15,4.5),macro);ro=mix(ro,vec3(4.65,3.35,7.7),hero);
 vec3 target=mix(vec3(0.,1.65,0.),vec3(0.,1.12,0.),travel);target=mix(target,vec3(.60,1.30,.50),macro);target=mix(target,vec3(0.,1.05,0.),hero);
 if(time>=1.28&&time<2.4){float k=ease(1.28,2.4,time);ro=mix(vec3(-3.3,2.25,4.1),vec3(-3.0,2.1,4.25),k);target=vec3(-1.25,.95,0.);}
 vec3 fw=normalize(target-ro),rt=normalize(cross(fw,vec3(0,1,0))),up=cross(rt,fw);vec3 rd=normalize(fw*3.22+rt*uv.x+up*uv.y);float dist=0.;vec2 hit=vec2(0.);bool found=false;
 for(int i=0;i<145;i++){vec3 p=ro+rd*dist;hit=field(p);if(hit.x<.0018){found=true;break;}dist+=max(.0015,hit.x*.78);if(dist>35.)break;}
 if(!found)return sky(rd);vec3 p=ro+rd*dist;
 if(hit.y>1.5){vec3 lit=opaqueColor(p,normalOpaque(p),true);if(p.y<.05)return mix(sky(rd),lit,1.-ease(5.,12.,length(p.xz)));return lit;}
 vec3 n=normalFluid(p),V=-rd,L=normalize(vec3(-.5,1.2,1.0));float diff=max(0.,dot(n,L)),fres=.07+.53*pow(1.-max(0.,dot(n,V)),4.);vec3 base=pow(mix(primary,secondary,ease(-1.75,1.75,p.x)),vec3(2.2));
 vec3 refr=refract(rd,n,1./1.39);vec3 q=p+refr*.015;float thickness=.015;
 for(int i=0;i<14;i++){float h=fluid(q);if(h>.001)break;float stepSize=clamp(-h*.70,.008,.09);q+=refr*stepSize;thickness+=stepSize;}
 vec3 transmitted=refractedSet(q+refr*.018,refr);vec3 absorb=exp(-(vec3(1.)-base)*thickness*1.35);
 vec3 body=base*(.10+diff*.56)+sqrt(base)*.06;vec3 col=mix(body,transmitted*absorb+base*.11,.18);
 col+=studio(reflect(rd,n))*fres;float gloss=pow(max(0.,dot(reflect(-L,n),V)),42.+detail*32.);col+=vec3(1.35,1.32,1.24)*gloss*.62;
 // Thin film is a little brighter and less saturated than the large impact pools.
 col+=sqrt(base)*exp(-thickness*9.)*.035;return col;
}
void main(){vec2 uv=(gl_FragCoord.xy/vec2(1280.,720.)-.5)*vec2(3.555556,2.);vec3 col=film(uv);col=clamp((col*(2.51*col+.03))/(col*(2.43*col+.59)+.14),0.,1.);col=pow(col,vec3(1./2.2));float grain=fract(sin(dot(gl_FragCoord.xy,vec2(127.1,311.7))+seed)*43758.5453)-.5;fragColor=vec4(col+grain/800.,1.);}
`;
export function liquidState014(seconds:number,c:EffectConfig){const t=clamp(seconds/c.duration*10,0,10);return {time:t,phase:t<1.25?'impact':t<2.4?'crown':t<4.5?'bridge':t<6?'neck':t<7.3?'recoil':'resolve',snapAt:6,secondaryDelay:.09,bridgeGrowth:smooth(2.12,3.19,t),bridgeRise:1.37*smooth(2.5,4.23,t)};}
export function paintLiquidOverlay014(g:CanvasRenderingContext2D,c:EffectConfig,seconds:number){const {time:t,phase}=liquidState014(seconds,c);g.clearRect(0,0,1280,720);text(g,'BRIDGE / LIQUID IN MOTION',44,37,12,'#d8e5e5','left',500);text(g,({impact:'01 / 落下',crown:'02 / 回应',bridge:'03 / 连接',neck:'04 / 牵引',recoil:'05 / 释放',resolve:'06 / 留下连接'})[phase]??'06 / 留下连接',1235,37,12,'#afd5d7','right',500);
 const end=smooth(8.0,8.65,t);g.save();g.globalAlpha=end;text(g,c.title,50,629,46,'#f3eee1','left',650,1050);text(g,c.subtitle,54,669,18,'#b4ced0','left',450,1100);g.restore();}
export function createShader(canvas:HTMLCanvasElement,c:EffectConfig){const gl=canvas.getContext('webgl2',{antialias:false,preserveDrawingBuffer:true});if(!gl)throw new Error('液桥需要WebGL2。');const compile=(type:number,source:string)=>{const s=gl.createShader(type)!;gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'液桥shader编译失败');return s;};const vert=compile(gl.VERTEX_SHADER,vertex),frag=compile(gl.FRAGMENT_SHADER,fragment),program=gl.createProgram()!;gl.attachShader(program,vert);gl.attachShader(program,frag);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'液桥shader链接失败');gl.useProgram(program);const loc=(s:string)=>gl.getUniformLocation(program,s),rgb=(s:string)=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255);gl.uniform3fv(loc('primary'),rgb(c.primary));gl.uniform3fv(loc('secondary'),rgb(c.secondary));gl.uniform1f(loc('energy'),c.intensity);gl.uniform1f(loc('detail'),c.detail);gl.uniform1f(loc('seed'),c.seed);gl.uniform1i(loc('count'),c.count);const vao=gl.createVertexArray();gl.bindVertexArray(vao);return {overlay:paintLiquidOverlay014,draw(seconds:number){gl.viewport(0,0,1280,720);gl.uniform1f(loc('time'),liquidState014(seconds,c).time);gl.drawArrays(gl.TRIANGLES,0,3);gl.flush();},dispose(){gl.deleteVertexArray(vao);gl.deleteProgram(program);gl.deleteShader(vert);gl.deleteShader(frag);gl.getExtension('WEBGL_lose_context')?.loseContext();}};}
