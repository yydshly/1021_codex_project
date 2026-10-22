import type {EffectConfig} from '../../scripts/effects.mjs';
import {createShader as compile} from './shaders';
import {text,rr,circle} from './math';
function content(c:EffectConfig){
 const cv=document.createElement('canvas');cv.width=3072;cv.height=640;const g=cv.getContext('2d')!;
 for(let i=0;i<3;i++){g.save();g.translate(i*1024,0);const fg='#f8f7ff',muted='#c9c8ee';
  text(g,i===0?'PRISM / LIVE SESSION':i===1?'THE FREQUENCIES':'ON AIR',56,67,19,muted,'left',550);circle(g,950,59,6,'#8bffdb');
  text(g,i===0?c.title:i===1?c.words[Math.min(1,c.words.length-1)]:c.words.at(-1)!,54,153,i===0?58:48,fg,'left',650,840);
  if(i===0){text(g,'A little light. A new frequency.',57,203,22,muted,'left',400);for(let n=0;n<6;n++){g.strokeStyle=n%2?'#ffffff65':'#b7d5ff80';g.lineWidth=2;g.beginPath();for(let j=0;j<250;j++){const x=56+j*3.6,y=333+n*13+Math.sin(j*.046+n*.37)*Math.sin(j*.012)*68;j?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}g.strokeStyle='#ffffff35';g.lineWidth=2;g.beginPath();g.moveTo(56,474);g.lineTo(968,474);g.stroke();circle(g,98,552,32,'#ffffff22');g.fillStyle=fg;g.beginPath();g.moveTo(91,540);g.lineTo(91,563);g.lineTo(111,551);g.fill();text(g,c.words[0],156,546,24,fg,'left',650);text(g,'STEREO / 48 kHz',156,579,16,muted);text(g,'03:24',964,563,28,fg,'right',450);}
  else if(i===1){for(let n=0;n<c.count*4;n++){const h=58+Math.sin(n*.15)**2*210;g.fillStyle=n%5?fg:c.primary;rr(g,56+n*910/(c.count*4),504-h,Math.max(6,620/(c.count*4)),h,7);g.fill();}text(g,'LOW',56,569,17,muted);text(g,'HIGH',962,569,17,muted,'right');}
  else{for(let n=0;n<5;n++){g.strokeStyle=n%2?c.secondary:'#ffffffa0';g.lineWidth=3;g.beginPath();g.ellipse(512,357,94+n*30,94+n*30,0,-2.35,.8);g.stroke();}circle(g,512,357,59,'#ffffff18');text(g,'FM',512,366,33,fg,'center',700);text(g,'89.6 / AFTER DARK',512,571,23,fg,'center',500);}g.restore();
 }return cv;
}
const body=`
uniform sampler2D contentTex;
mat3 ry(float a){return mat3(cos(a),0.,-sin(a),0.,1.,0.,sin(a),0.,cos(a));}
mat3 rx(float a){return mat3(1.,0.,0.,0.,cos(a),sin(a),0.,-sin(a),cos(a));}
vec3 field(vec2 p){float t=time*(.12+energy*.13);vec2 q=p+vec2(sin(p.y*1.7+t),cos(p.x*1.2-t))*.15;
 vec2 a=(q-vec2(-.75+sin(t)*.26,.2))*vec2(.78,1.4),b=(q-vec2(.6,-.35+cos(t)*.15))*vec2(1.25,1.6);
 float ribbon=exp(-pow((p.y-.21*sin(p.x*2.+t)-.20)*7.,2.))*exp(-pow(p.x*.5,2.));
 return vec3(.007,.008,.033)+primary*exp(-dot(a,a))*.58+secondary*exp(-dot(b,b))*.48+vec3(.25,.12,.65)*ribbon*.25+vec3(.43,.18,.35)*exp(-dot(p-vec2(-1.4,-.45),p-vec2(-1.4,-.45))*3.)*.28;}
vec3 blurField(vec2 p,float r){vec3 col=field(p)*.2;for(int j=0;j<12;j++){float a=float(j)*6.283185/12.;col+=field(p+vec2(cos(a),sin(a))*r)*(.8/12.);}return col;}
float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
void main(){vec2 p=(uv-.5)*vec2(3.555556,2.);float macro=1.-smoothstep(.1,2.2,time),outro=smoothstep(8.,9.25,time);p*=mix(1.,.66,macro);p.x-=macro*.42;vec3 col=field(p),ro=vec3(0.,0.,4.),rd=normalize(vec3(p,-3.1));
 for(int i=2;i>=0;i--){float f=float(i),arrive=smoothstep(f*.55,.95+f*.55,time),dock=smoothstep(3.4,4.4,time);vec2 sz=i==0?vec2(.91,.57):vec2(.46,.40);vec3 C=i==0?vec3(-.34,0.,.14):i==1?vec3(1.15,.37,-.18):vec3(1.20,-.50,0.);C.y+=(1.-arrive)*-1.75;C.x+=(1.-dock)*(i==0?-.05:.32);C+=vec3(sin(time*.5+f)*.014,cos(time*.6+f)*.024,0.);C.xy*=1.-outro*.45;sz*=1.-outro*.6;
 mat3 R=ry((i==0?-.08:.12)+sin(time*.45+f)*.026+(1.-dock)*.08)*rx(.035+cos(time*.4+f)*.025);vec3 N=R*vec3(0,0,1),U=R*vec3(1,0,0),V=R*vec3(0,1,0);float ray=dot(C-ro,N)/dot(rd,N);vec3 pos=ro+rd*ray;vec2 L=vec2(dot(pos-C,U),dot(pos-C,V));float d=box(L,sz,.055),shadow=box(L-vec2(.012,-.04),sz,.065);col*=1.-.22*exp(-abs(shadow)*24.)*(1.-outro);
 if(d<0.){vec2 n=normalize(L+vec2(.0001));float edge=exp(d*53.),bevel=exp(d*118.);vec2 bend=p+L*.025+n*(.014+detail*.048)*edge;vec3 glass=blurField(bend,.035+detail*.16),split=vec3(field(bend+n*.016).r,field(bend).g,field(bend-n*.016).b);glass=mix(glass,split,.28);glass=mix(glass,vec3(.42,.48,.70),.09);float rim=max(0.,dot(n,normalize(vec2(-.5,.8))));glass+=vec3(.72,.83,1.)*edge*.16+vec3(.9,.94,1.)*bevel*(.14+rim*.64)+mix(primary,secondary,n.y*.5+.5)*bevel*.24;glass+=vec3(.6,.7,1.)*exp(-pow((L.x+L.y*.48-(-1.8+time*.57))*19.,2.))*.16;
 vec2 local=L/(sz*2.)+.5;vec4 tx=texture(contentTex,vec2((f+local.x)/3.,local.y));glass=mix(glass,tx.rgb,tx.a*smoothstep(.9+f*.5,1.5+f*.5,time)*(1.-outro));if(i==0&&abs(local.y-.258)<.0018&&local.x<.06+mod(time*.07,.84))glass+=vec3(.45,.9,1.)*.7;col=mix(col,glass,1.-outro*.7);}}
 float u=smoothstep(4.5,6.8,time),radius=.065+sin(u*3.14159)*.014;vec2 center=vec2(mix(-1.02,1.38,u),sin(u*6.283)*.25-.22);float orb=length(p-center);if(orb<radius){vec2 q=(p-center)/radius;float z=sqrt(max(0.,1.-dot(q,q)));col=field(p+q*.16)*1.4+vec3(.55,.9,1.)*pow(max(0.,dot(normalize(vec3(q,z)),normalize(vec3(-.5,.6,1.)))),18.);}col+=secondary*.03*exp(-pow(length(p-center)*11.,2.));fragColor=vec4(pow(max(col,0.),vec3(.72)),1.);}`;
export function createOptical(canvas:HTMLCanvasElement,c:EffectConfig){const e=compile(canvas,c,body,content(c));return {draw(t:number){e.draw(t/c.duration*10);},dispose:e.dispose};}
