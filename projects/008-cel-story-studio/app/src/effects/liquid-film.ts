import type {EffectConfig} from '../../scripts/effects.mjs';
import {createShader as compile} from './shaders';
import {createOptical} from './prism-film';
const body=`
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float field(vec3 p){float split=smoothstep(1.5,3.2,time)*(1.-smoothstep(4.1,5.9,time));float ring=smoothstep(5.6,7.5,time);float turn=time*(.08+energy*.15);p.xz=rot(turn)*p.xz;vec3 q=p;q.y-=.12;float sphere=length(q*vec3(1.,1.+sin(time*1.4)*.04,1.))-.66;
 float lobes=10.;for(int i=0;i<3;i++){float a=float(i)*6.283185/3.;vec3 center=vec3(cos(a)*(.33+split*.72),sin(a)*(.24+split*.45),sin(a+turn)*.17);lobes=smin(lobes,length(q-center)-(.42-split*.10),.16+detail*.18);}float d=mix(sphere,lobes,smoothstep(.3,1.7,time));
 vec3 r=q;r.xy=rot(time*.06)*r.xy;r.yz=rot(.35+sin(time*.25)*.15)*r.yz;float tor=length(vec2(length(r.xy)-.75,r.z))-.21;d=mix(d,tor,ring);
 for(int i=0;i<14;i++){if(i>=count)break;float f=float(i),a=f*6.283185/float(count)-turn;vec3 pos=vec3(cos(a)*(1.12+sin(f+time)*.08),sin(a)*(.88+ring*.14),sin(f*2.+turn)*.3);float rad=(.025+hash(f)*.045)*smoothstep(.5,2.5,time);d=smin(d,length(q-pos)-rad,.025+detail*.04);}return d;}
float panel(vec2 uv,vec2 center,vec2 halfSize,float softness){vec2 q=abs(uv-center)-halfSize;return 1.-smoothstep(-softness,softness,max(q.x,q.y));}
vec3 studio(vec3 d){vec3 col=mix(vec3(.012,.006,.035),vec3(.16,.04,.23),smoothstep(-.5,.7,d.y));
 vec2 uv=d.xy/max(.1,abs(d.z));float face=smoothstep(-.1,.2,d.z);col+=vec3(3.3,3.5,3.4)*panel(uv,vec2(-.75,.8),vec2(.42,.85),.05)*face;
 col+=vec3(1.8,2.2,2.5)*panel(uv,vec2(.85,.6),vec2(.085,1.3),.035)*face;
 vec2 top=d.xz/max(.15,abs(d.y));col+=primary*1.7*panel(top,vec2(.2,.1),vec2(.8,.13),.04)*smoothstep(.3,.8,d.y);
 col+=secondary*.5*pow(max(0.,dot(d,normalize(vec3(-.8,-.4,.3)))),14.);return col;}
vec3 normal(vec3 p){vec2 e=vec2(.001,0.);return normalize(vec3(field(p+e.xyy)-field(p-e.xyy),field(p+e.yxy)-field(p-e.yxy),field(p+e.yyx)-field(p-e.yyx)));}
vec3 shade(vec3 pos,vec3 rd){vec3 n=normal(pos),ref=reflect(rd,n);float fr=pow(1.-max(0.,dot(-rd,n)),3.);vec3 base=mix(primary,secondary,smoothstep(-.6,.6,pos.y));vec3 refr=refract(rd,n,1./1.45);float thickness=max(.03,-field(pos+rd*.35))*2.8;vec3 transmitted=studio(refr)*exp(-thickness*(vec3(1.)-base)*2.8);vec3 col=mix(transmitted*.60+base*.20,studio(ref)*(.8+base*.30),.16+fr*.84);float ao=clamp(field(pos+n*.09)/.09,.4,1.);vec3 spectrum=.5+.5*cos(vec3(0.,2.,4.)+dot(-rd,n)*8.+pos.y*2.);return col*ao+base*.10+spectrum*fr*.25;}
bool march(vec3 ro,vec3 rd,out vec3 p){float travel=0.;for(int i=0;i<100;i++){p=ro+rd*travel;float d=field(p);if(d<.0009)return true;travel+=max(.0005,d*.8);if(travel>9.)break;}return false;}
void main(){vec2 p=(uv-.5)*vec2(3.555556,2.);float zoom=mix(1.0,1.45,smoothstep(.1,1.5,time))*(1.-smoothstep(7.4,8.5,time)*.1);vec3 ro=vec3(0.,.18,4.2),rd=normalize(vec3(p/zoom,-3.));vec3 pos,col=vec3(.011,.004,.028)+primary*.025*exp(-length(p-vec2(-1.,.2))*1.4)+secondary*.045*exp(-length(p-vec2(.8,-.2))*1.4);
 if(march(ro,rd,pos)){col=shade(pos,rd);}else{float ft=(-1.12-ro.y)/rd.y;if(ft>0.&&ft<20.){vec3 floorPos=ro+rd*ft;float shadow=exp(-length(floorPos.xz)*1.8);col=vec3(.022,.006,.030)*(1.-shadow*.5)+mix(primary,secondary,.6)*.017*exp(-length(floorPos.xz)*.7);vec3 reflected=reflect(rd,vec3(0.,1.,0.)),rp;if(march(floorPos+vec3(0.,.002,0.),reflected,rp))col=mix(col,shade(rp,reflected),.19*exp(-length(floorPos.xz)*.2));}}
 col=col/(col+vec3(.75));col=pow(max(col,0.),vec3(.4545));float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.98,78.23)))*43758.54)-.5;fragColor=vec4(col+grain*.004,1.);}`;
export function createShader(canvas:HTMLCanvasElement,c:EffectConfig){if(c.style==='aurora-glass')return createOptical(canvas,c);const e=compile(canvas,c,body);return {draw(seconds:number){e.draw(seconds/c.duration*10);},dispose:e.dispose};}
