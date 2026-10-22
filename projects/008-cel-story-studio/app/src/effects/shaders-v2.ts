import type {EffectConfig} from '../../scripts/effects.mjs';
import {createShader as compile} from './shaders';
import {createOptical} from './optical';
const metal=`
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float field(vec3 p){p.x-=.64;p.xy=rot(time*.12)*p.xy;float a=time*(.3+energy*.65);float d=10.;
 for(int i=0;i<3;i++){float f=float(i),th=f*6.283185/3.+a;vec3 c=vec3(cos(th)*.35,sin(th)*.35,sin(th+a)*.2);float r=.38+.07*sin(a+f);d=smin(d,length(p-c)-r,.17+detail*.17);}
 for(int i=0;i<14;i++){if(i>=count)break;float f=float(i),th=f*6.283185/float(count)-a*.45;vec3 c=vec3(cos(th)*(.73+.06*sin(a+f)),sin(th)*(.59+.07*cos(a+f)),sin(th*2.+a)*.28);float r=.065+hash(f)*.075;d=smin(d,length(p-c)-r,.03+detail*.10);}return d;}
vec3 environment(vec3 d){vec3 col=vec3(.025,.045,.05);float panel=pow(max(0.,dot(d,normalize(vec3(-.6,.8,1.1)))),24.);float strip=pow(max(0.,dot(d,normalize(vec3(.9,.3,.5)))),45.);float bottom=pow(max(0.,dot(d,normalize(vec3(-.4,-.8,.2)))),9.);col+=vec3(3.5,3.8,3.5)*panel;col+=secondary*2.2*strip;col+=primary*.65*bottom;return col;}
void main(){vec2 p=(uv-.5)*vec2(3.55556,2.);vec3 col=mix(vec3(.018,.043,.047),vec3(.035,.085,.085),exp(-length(p-vec2(.65,0.))*1.4));vec3 ro=vec3(p,3.),rd=vec3(0.,0.,-1.),pos;float travel=0.;bool hit=false;
 for(int i=0;i<62;i++){pos=ro+rd*travel;float d=field(pos);if(d<.0016){hit=true;break;}travel+=max(.0015,d*.85);if(travel>5.)break;}
 if(hit){float e=.002,d=field(pos);vec3 n=normalize(vec3(field(pos+vec3(e,0.,0.))-d,field(pos+vec3(0.,e,0.))-d,field(pos+vec3(0.,0.,e))-d));float facing=max(0.,dot(n,-rd));vec3 ref=reflect(rd,n);float fr=pow(1.-facing,2.5);vec3 spectral=.5+.5*cos(vec3(0.,2.,4.)+facing*8.+pos.y*2.+time*.08);vec3 base=mix(primary,secondary,smoothstep(-.7,.7,pos.y));col=environment(ref)*(.65+base*.55)+base*.09+spectral*fr*.34;col+=pow(max(0.,dot(n,normalize(vec3(-.4,.8,1.)))),90.)*1.7;col=pow(max(col,0.),vec3(.85));}
 else {float d=field(vec3(p+vec2(.02,.16),0.));col*=1.-.7*exp(-max(0.,d)*7.);}
 float noise=fract(sin(dot(gl_FragCoord.xy,vec2(12.98,78.23)))*43758.54)-.5;col+=noise*.007;fragColor=vec4(col,1.);}`;
const crystal=`
mat2 rotate(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
vec3 printField(vec2 p){float a=time*(.04+energy*.12)+seed*.013;vec3 col=vec3(.91,.91,.85);float wave=p.y-sin(p.x*2.+a)*.28;float ribbon=exp(-pow(wave*3.3,2.));vec3 rainbow=.55+.45*cos(vec3(0.,2.,4.)+p.x*2.2+wave*4.);col=mix(col,mix(primary,rainbow,.55),ribbon*.85);float lines=pow(.5+.5*cos((p.y+sin(p.x*2.+a)*.11)*85.),18.);col=mix(col,vec3(.13,.29,.29),lines*.16*smoothstep(-.3,1.,p.x));return col;}
float rbox(vec2 q,vec2 b,float r){vec2 v=abs(q)-b+r;return min(max(v.x,v.y),0.)+length(max(v,0.))-r;}
void main(){vec2 p=(uv-.5)*vec2(3.55556,2.);vec3 col=printField(p);int n=min(5,2+count/4);for(int i=4;i>=0;i--){if(i>=n)continue;float f=float(i);vec2 center=vec2(.60+f*.13,-.02+f*.025);float ang=-.12+f*.13+sin(time*.35)*.035;vec2 q=rotate(ang)*(p-center);float reveal=smoothstep(f*.12,f*.12+.8,time);float d=rbox(q,vec2(.39,.61)*max(.01,reveal),.10);float shadow=rbox(q-vec2(.025,-.045),vec2(.39,.61)*max(.01,reveal),.10);col*=1.-.12*exp(-abs(shadow)*23.);if(d<0.){float edge=exp(d*32.);vec2 normal=normalize(q+vec2(.0001));vec2 refr=center+rotate(-ang)*(q*(.85-detail*.14)+normal*(.018+detail*.06)*edge);vec3 glass=vec3(printField(refr+normal*.012).r,printField(refr).g,printField(refr-normal*.012).b);col=mix(glass,vec3(.98),.05)+edge*vec3(.18,.22,.17);float highlight=pow(max(0.,1.-abs(q.x+q.y*.38+.1)*4.),22.);col+=highlight*.10;col=mix(col,secondary*.25,exp(-abs(d)*110.)*.14);}}
 float no=fract(sin(dot(gl_FragCoord.xy,vec2(12.98,78.23)))*43758.54)-.5;fragColor=vec4(col+no*.004,1.);}`;
export function createShader(canvas:HTMLCanvasElement,c:EffectConfig){
 if(c.style==='aurora-glass')return createOptical(canvas,c);
 const engine=compile(canvas,c,c.style==='liquid'?metal:crystal);
 return {draw(seconds:number){engine.draw(seconds/c.duration*10);},dispose:engine.dispose};
}
