import{a as g,c as n,h as c}from"./chunk-L6YMH5X2.js";import"./chunk-Y6SLVHK3.js";var E=`#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`,w=`#version 300 es
precision highp float;
out vec4 fragColor;
uniform float time,energy,detail,seed;
uniform vec2 resolution;
uniform int count;
uniform vec3 primary,secondary;
const float PI=3.14159265359;
float ease(float a,float b,float t){float x=clamp((t-a)/(b-a),0.,1.);return x*x*(3.-2.*x);}
float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
float capsule(vec3 p,vec3 a,vec3 b,float ra,float rb){vec3 ba=b-a;float h=clamp(dot(p-a,ba)/max(dot(ba,ba),.00001),0.,1.);return length(p-a-ba*h)-mix(ra,rb,h);}
float ellipsoid(vec3 p,vec3 r){float k0=length(p/r),k1=length(p/(r*r));return k0<.0001?-min(r.x,min(r.y,r.z)):k0*(k0-1.)/k1;}
float torus(vec3 p,float radius,float thick){return length(vec2(length(p.xz)-radius,p.y))-thick;}
float roundCylinder(vec3 p,float radius,float halfH,float bevel){vec2 d=vec2(length(p.xz)-radius,abs(p.y)-halfH);return min(max(d.x,d.y),0.)+length(max(d,0.))-bevel;}
float ellipse2(vec2 p,vec2 r){float k0=length(p/r),k1=length(p/(r*r));return k0<.0001?-min(r.x,r.y):k0*(k0-1.)/k1;}
float rect(vec2 p,vec2 halfSize,float r){vec2 d=abs(p)-halfSize+r;return min(max(d.x,d.y),0.)+length(max(d,0.))-r;}
float bridgeRise(){return 1.31*ease(2.18,4.15,time);}
float bridgeY(float x){float a=x/1.67,load=1.-a*a;float breathing=sin(time*2.1-x*2.5)*.035*ease(3.,4.,time);return .80+bridgeRise()*load*(1.+.065*a)+breathing*load;}
float holeRadius(){return .40*ease(4.10,5.60,time);}
float filmWidth(float x){float a=abs(x/1.67);return mix(.69,.51,pow(a,1.2))+.042*sin(x*3.6-time*3.2+(seed-21.)*.31)*ease(2.7,4.,time)+.022*sin(x*7.+time*2.7+(seed-21.)*.23);}
vec3 neckAnchor(){return vec3(.48,bridgeY(.48)-.035,filmWidth(.48)*.92);}
vec3 neckBulbAtSnap(){return vec3(.70,bridgeY(.48)-.91,.93);}
float fluid(vec3 p){
 float d=100.;
 for(int i=0;i<2;i++){
  float side=i==0?-1.:1.,hit=i==0?1.05:1.25,fall=ease(.05+(i==0?0.:.16),hit,time),age=max(0.,time-hit),impact=exp(-age*7.)*sin(clamp(age*9.,0.,PI));
  vec3 centre=vec3(side*1.67,mix(3.45,.91,fall),0.);vec3 radii=vec3(.31+.21*fall,.49-.34*fall,.31+.20*fall);
  if(time>hit){centre.y=.77+exp(-age*6.)*.06;radii=vec3(.55+impact*.19,.15-impact*.065,.53+impact*.16);}
  d=smin(d,ellipsoid(p-centre,radii),.105);
  // A thin corrugated crown and rim, with visibly different thickness from the pool.
  float crown=ease(hit,hit+.18,time)*(1.-ease(hit+.48,hit+1.22,time));
  if(crown>.001){vec3 q=p-vec3(side*1.67,.72,0.);float a=atan(q.z,q.x),radius=.56+age*.33*crown,lobes=float(clamp(count,4,11)),height=(.12+(.24+.12*energy)*pow(.5+.5*sin(a*lobes+float(i)+(seed-21.)*.51),2.))*crown;
   float taper=1.-clamp(q.y/max(height,.01),0.,1.);float radiusAtHeight=radius+.045*sin(a*3.+time*3.)*crown+q.y*.12;float wall=max(abs(length(q.xz)-radiusAtHeight)-(.009+.012*taper+.004*detail),abs(q.y-height*.5)-height*.5);d=smin(d,wall*.48,.018);
   vec3 rim=vec3(q.x,q.y-height,q.z);d=smin(d,torus(rim,radius,.025),.035);
   for(int k=0;k<11;k++){if(k>=clamp(count,4,11))break;float f=float(k),a2=(f*2.*PI+.9)/lobes,delay=.09,launch=max(0.,age-delay),r=radius+launch*.30,bh=(.12+(.24+.12*energy)*pow(.5+.5*sin(a2*lobes+float(i)),2.))*crown,y=.78+bh+.22*sin(clamp(launch*4.,0.,PI));vec3 bead=vec3(side*1.67+cos(a2)*r,y,sin(a2)*r);float rad=(.028+.012*fract(f*.618))*crown;d=smin(d,length(p-bead)-rad,.014);}
  }
 }
 float grow=ease(2.02,3.18,time);
 if(grow>.001){float x=clamp(p.x,-1.67,1.67),a=x/1.67,load=pow(abs(a),1.65),tension=ease(2.5,4.23,time),slope=bridgeRise()*(-2.*a+.075- .225*a*a)/1.67,dy=(p.y-bridgeY(x))/sqrt(1.+slope*slope);
  // Volume gathers on the supports; the suspended centre is pulled into a narrower, thinner lens.
  float width=filmWidth(x),thick=mix(.020+.012*detail,.13+.03*detail,load);float z=p.z-.032*sin(x*2.2-time*1.6)*(1.-load);
  // The membrane is concave between thick, moving menisci. It is not an extruded band.
  float sag=.085*(1.-pow(clamp(abs(z)/width,0.,1.),2.))*(1.-load);
  float wave=.022*sin(x*5.3-time*4.1+z*3.)+.012*sin(z*8.-time*3.1);
  float crossY=dy+sag-wave*(1.-load);
  float sheet=ellipse2(vec2(crossY,z),vec2(thick,width));
  float inner=1.67*(1.-grow),dx=max(max(inner-abs(p.x),abs(p.x)-1.67),0.);
  float end=length(vec2(dx,z))-width;sheet=max(sheet,end);
  // A real opening develops through the sheet; displaced material collects in its rim.
  vec2 holeP=vec2((x-.03-.05*sin((seed-21.)*1.3))/1.27,(z+.035));float hr=holeRadius();float aperture=length(holeP)-hr;
  if(hr>.005)sheet=max(sheet,-aperture);
  d=smin(d,sheet,.105);
  float rimThickness=mix(.039,.056,ease(-.1,.1,z))+.027*load+.008*sin(x*6.-time*4.);
  float perimeter=length(vec2(dy-.004,end))-rimThickness;
  d=smin(d,perimeter,.035);
  if(hr>.005){float rimR=.020+.024*ease(4.1,5.1,time);float rim=length(vec2(aperture,crossY)) - rimR;d=smin(d,max(rim,end),.020);}
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
float opaque(vec3 p){float d=p.y-.54;for(int i=0;i<2;i++){float x=i==0?-1.67:1.67;vec3 q=p-vec3(x,0.,0.);float dish=roundCylinder(q-vec3(0.,.602,0.),.66,.025,.036);d=min(d,dish);}return d;}
vec2 field(vec3 p){float f=fluid(p),o=opaque(p);return f<o?vec2(f,1.):vec2(o,2.);}
vec3 normalFluid(vec3 p){vec2 e=vec2(.0015,-.0015);return normalize(e.xyy*fluid(p+e.xyy)+e.yyx*fluid(p+e.yyx)+e.yxy*fluid(p+e.yxy)+e.xxx*fluid(p+e.xxx));}
vec3 normalOpaque(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(opaque(p+e.xyy)-opaque(p-e.xyy),opaque(p+e.yxy)-opaque(p-e.yxy),opaque(p+e.yyx)-opaque(p-e.yyx)));}
vec3 sky(vec3 d){float h=clamp(d.y*.5+.5,0.,1.);return mix(vec3(.018,.035,.051),vec3(.055,.10,.125),h);}
vec3 studio(vec3 r){vec3 col=sky(r)*.65;float a=pow(max(0.,dot(r,normalize(vec3(-.7,1.2,1.4)))),18.),b=pow(max(0.,dot(r,normalize(vec3(1.1,.7,-.5)))),28.),c=pow(max(0.,dot(r,normalize(vec3(-.4,.85,-.9)))),12.);col+=vec3(4.,3.65,3.0)*a+vec3(.55,1.5,1.8)*b+vec3(3.8,3.9,4.0)*c;float strip=exp(-pow((r.x+.43)/.065,2.))*ease(-.2,.15,r.y)*(1.-ease(.6,.95,r.y));col+=vec3(1.4,1.5,1.5)*strip;return col;}
float shadow(vec3 p,vec3 direction){float result=1.,t=.025;for(int i=0;i<18;i++){float h=field(p+direction*t).x;if(h<.002)return .15;result=min(result,9.*h/t);t+=clamp(h,.018,.33);if(t>5.)break;}return clamp(result,.15,1.);}
vec3 opaqueColor(vec3 p,vec3 n,bool shade){vec3 L=normalize(vec3(-.5,1.2,1.0));float sh=shade?shadow(p+n*.012,L):1.,diff=max(0.,dot(n,L));bool floor=p.y<.55;vec3 base=floor?vec3(.025,.063,.083):vec3(.16,.24,.27);float grain=fract(sin(dot(p.xz,vec2(127.1,311.7)))*43758.5453);base*=.99+grain*.02;float ao=1.;for(int i=0;i<2;i++){vec2 q=p.xz-vec2(i==0?-1.67:1.67,0.);ao-=exp(-dot(q,q)*1.5)*.16*float(floor);}vec3 col=base*(.36+diff*.64*sh)*ao;
 if(floor){float caustic=0.;for(int j=0;j<2;j++){vec2 q=p.xz-vec2(j==0?-1.67:1.67,0.);float r=length(q),a=atan(q.y,q.x);caustic+=pow(.5+.5*sin(r*16.-time*1.5+sin(a*3.+time*.5)),14.)*exp(-r*r*.6);}col+=mix(primary,secondary,ease(-2.,2.,p.x))*caustic*.045*ease(1.,2.,time);}
 else col+=studio(reflect(normalize(vec3(.2,-.5,-1.)),n))*.12;
 return col;}
vec3 refractedSet(vec3 start,vec3 direction){float travel=.01;for(int i=0;i<20;i++){vec3 p=start+direction*travel;float h=opaque(p);if(h<.003)return opaqueColor(p,normalOpaque(p),false);travel+=clamp(h,.02,.7);if(travel>12.)break;}return sky(direction);}
vec3 film(vec2 uv){
 float travel=ease(0.,2.5,time),macro=ease(3.8,4.7,time)*(1.-ease(6.2,7.7,time)),hero=ease(6.5,8.5,time);
 vec3 ro=mix(vec3(4.5,3.6,7.6),vec3(4.3,3.6,7.4),travel);ro=mix(ro,vec3(1.4,4.2,4.4),macro);ro=mix(ro,vec3(4.65,4.4,7.7),hero);
 vec3 target=mix(vec3(0.,1.65,0.),vec3(0.,1.12,0.),travel);target=mix(target,vec3(.25,1.45,.10),macro);target=mix(target,vec3(0.,1.05,0.),hero);
 if(time>=1.28&&time<2.4){float k=ease(1.28,2.4,time);ro=mix(vec3(-3.3,2.25,4.1),vec3(-3.0,2.1,4.25),k);target=vec3(-1.25,.95,0.);}
 vec3 fw=normalize(target-ro),rt=normalize(cross(fw,vec3(0,1,0))),up=cross(rt,fw);vec3 rd=normalize(fw*3.22+rt*uv.x+up*uv.y);float dist=0.;vec2 hit=vec2(0.);bool found=false;
 for(int i=0;i<145;i++){vec3 p=ro+rd*dist;hit=field(p);if(hit.x<.0018){found=true;break;}dist+=max(.0015,hit.x*.78);if(dist>35.)break;}
 if(!found)return sky(rd);vec3 p=ro+rd*dist;
 if(hit.y>1.5){vec3 lit=opaqueColor(p,normalOpaque(p),true);if(p.y<.55)return mix(sky(rd),lit,1.-ease(5.,12.,length(p.xz)));return lit;}
 vec3 n=normalFluid(p),V=-rd,L=normalize(vec3(-.5,1.2,1.0));float diff=max(0.,dot(n,L)),fres=.023+.977*pow(1.-max(0.,dot(n,V)),5.);vec3 base=pow(mix(primary,secondary,ease(-1.3,1.3,p.x+.08*sin(time*2.+p.z*4.))),vec3(2.2));
 vec3 refr=refract(rd,n,1./1.39);vec3 q=p+refr*.015;float thickness=.015;
 for(int i=0;i<24;i++){float h=fluid(q);if(h>.001)break;float stepSize=clamp(-h*.70,.004,.09);q+=refr*stepSize;thickness+=stepSize;}
 vec3 exitN=normalFluid(q),exitDir=refract(refr,-exitN,1.39);if(length(exitDir)<.01)exitDir=refr;
 vec3 transmitted=refractedSet(q+exitDir*.025,exitDir);vec3 absorb=exp(-(vec3(1.)-base)*thickness*4.0);
 // Pigmented liquid: a clear thin middle, coloured thick rims and pools, with visible background transmission.
 float thin=exp(-thickness*8.);vec3 body=base*(.08+diff*.31)+sqrt(base)*.075;
 vec3 col=mix(body,transmitted*absorb*mix(vec3(1.),sqrt(base),.35),.30+.32*thin);
 col+=studio(reflect(rd,n))*mix(vec3(1.),sqrt(base),.16)*(.016+fres*.22);
 vec2 vn=vec2(dot(n,rt),dot(n,up));float softbox=exp(-pow((vn.x+.34)/.10,4.)-pow((vn.y-.40)/.28,4.));float fillbox=exp(-pow((vn.x-.45)/.07,4.)-pow((vn.y-.12)/.36,4.));col+=vec3(.8,.9,1.)*softbox*.85+vec3(1.,.74,.43)*fillbox*.30;
 float gloss=pow(max(0.,dot(reflect(-L,n),V)),85.+detail*60.);col+=vec3(1.15,1.1,.98)*gloss*.42;
 return col;
}
void main(){vec2 uv=(gl_FragCoord.xy/resolution-.5)*vec2(3.555556,2.);vec3 col=film(uv);col=clamp((col*(2.51*col+.03))/(col*(2.43*col+.59)+.14),0.,1.);col=pow(col,vec3(1./2.2));float grain=fract(sin(dot(gl_FragCoord.xy,vec2(127.1,311.7))+seed)*43758.5453)-.5;fragColor=vec4(col+grain/800.,1.);}
`;function y(r,t){let e=g(r/t.duration*10,0,10);return{time:e,phase:e<1.25?"impact":e<2.4?"crown":e<4.1?"bridge":e<6?"neck":e<7.3?"recoil":"resolve",snapAt:6,secondaryDelay:.09,bridgeGrowth:n(2.02,3.18,e),bridgeRise:1.31*n(2.18,4.15,e),aperture:.4*n(4.1,5.6,e)}}function k(r,t,e){let{time:s,phase:f}=y(e,t);r.clearRect(0,0,1280,720),c(r,"BRIDGE / LIQUID IN MOTION",44,37,12,"#d8e5e5","left",500),c(r,{impact:"01 / \u843D\u4E0B",crown:"02 / \u56DE\u5E94",bridge:"03 / \u8FDE\u63A5",neck:"04 / \u7275\u5F15",recoil:"05 / \u91CA\u653E",resolve:"06 / \u7559\u4E0B\u8FDE\u63A5"}[f]??"06 / \u7559\u4E0B\u8FDE\u63A5",1235,37,12,"#afd5d7","right",500);let d=n(8,8.65,s);r.save(),r.globalAlpha=d,c(r,t.title,50,629,46,"#f3eee1","left",650,1050),c(r,t.subtitle,54,669,18,"#b4ced0","left",450,1100),r.restore()}function T(r,t){let e=r.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0});if(!e)throw new Error("\u6DB2\u6865\u9700\u8981WebGL2\u3002");let s=(o,x)=>{let l=e.createShader(o);if(e.shaderSource(l,x),e.compileShader(l),!e.getShaderParameter(l,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(l)||"\u6DB2\u6865shader\u7F16\u8BD1\u5931\u8D25");return l},f=s(e.VERTEX_SHADER,E),d=s(e.FRAGMENT_SHADER,w),i=e.createProgram();if(e.attachShader(i,f),e.attachShader(i,d),e.linkProgram(i),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(i)||"\u6DB2\u6865shader\u94FE\u63A5\u5931\u8D25");e.useProgram(i);let a=o=>e.getUniformLocation(i,o),m=o=>[1,3,5].map(x=>parseInt(o.slice(x,x+2),16)/255);e.uniform3fv(a("primary"),m(t.primary)),e.uniform3fv(a("secondary"),m(t.secondary)),e.uniform1f(a("energy"),t.intensity),e.uniform1f(a("detail"),t.detail),e.uniform1f(a("seed"),t.seed),e.uniform1i(a("count"),t.count);let p=1920,u=1080,h=e.createTexture(),v=e.createFramebuffer();if(e.bindTexture(e.TEXTURE_2D,h),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,p,u,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,v),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,h,0),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)throw new Error("\u6DB2\u6865\u9AD8\u5206\u8FA8\u7387\u7F13\u51B2\u521D\u59CB\u5316\u5931\u8D25");e.uniform2f(a("resolution"),p,u);let b=e.createVertexArray();return e.bindVertexArray(b),{overlay:k,draw(o){e.uniform3fv(a("primary"),m(t.primary)),e.uniform3fv(a("secondary"),m(t.secondary)),e.uniform1f(a("energy"),t.intensity),e.uniform1f(a("detail"),t.detail),e.uniform1f(a("seed"),t.seed),e.uniform1i(a("count"),t.count),e.bindFramebuffer(e.FRAMEBUFFER,v),e.viewport(0,0,p,u),e.uniform1f(a("time"),y(o,t).time),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.READ_FRAMEBUFFER,v),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.blitFramebuffer(0,0,p,u,0,0,1280,720,e.COLOR_BUFFER_BIT,e.LINEAR),e.flush()},dispose(){e.deleteFramebuffer(v),e.deleteTexture(h),e.deleteVertexArray(b),e.deleteProgram(i),e.deleteShader(f),e.deleteShader(d),e.getExtension("WEBGL_lose_context")?.loseContext()}}}export{T as createShader,y as liquidState015,k as paintLiquidOverlay015};
