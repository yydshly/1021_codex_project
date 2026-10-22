import type {EffectConfig} from '../../scripts/effects.mjs';
import {createShader as compile} from './shaders';
import {text,rr,hash} from './math';
function content(c:EffectConfig){
 const cv=document.createElement('canvas');cv.width=1536;cv.height=640;const g=cv.getContext('2d')!;
 for(let i=0;i<3;i++){
  g.save();g.translate(i*512,0);g.scale(.5,.5);
  text(g,['S O N I C   A R C H I V E','S P E C T R U M   /   0 2','L I S T E N I N G   R O O M'][i],65,100,24,'#e4efe7','left',500,880);
  text(g,i===0?c.title:c.words[i%c.words.length],65,225,70,'#f1edda','left',650,880);
  text(g,['A moment worth keeping.','Every frequency has a colour.','Leave room for a little quiet.'][i],70,289,24,'#bed4d0','left',400,880);
  g.strokeStyle='#c7e7dc35';g.lineWidth=2;g.beginPath();g.moveTo(65,340);g.lineTo(960,340);g.stroke();
  if(i===1){const bands=c.count*4;for(let k=0;k<bands;k++){const h=40+Math.sin(k*.19)**2*220+hash(k,c.seed)*80;g.fillStyle=k%6?c.primary:'#dceee3';rr(g,70+k*875/bands,765-h,Math.max(4,450/bands),h,4);g.fill();}}
  else{for(let row=0;row<5;row++){g.beginPath();for(let k=0;k<220;k++){const x=70+k*4,y=500+row*35+Math.sin(k*.065+row*.9)*Math.sin(k*.018)*75;g.lineTo(x,y);}g.strokeStyle=row%2?'#ddbd84aa':'#b8e5cf88';g.lineWidth=2.5;g.stroke();}}
  text(g,['FIELD RECORDING','BAND WIDTH','HEADPHONES ON'][i],70,930,21,'#b5c9c4','left',400);
  text(g,['23 : 59','48 kHz / 24 bit','•••'][i],945,930,25,'#f3e4c3','right',500);
  g.fillStyle='#eff5e6';rr(g,70,1050,875,8,4);g.fill();g.fillStyle=c.primary;rr(g,70,1050,590,8,4);g.fill();
  text(g,c.words[i%c.words.length],70,1150,28,'#e5dfc8','left',500,850);
  g.restore();
 }
 return cv;
}
const body=`
uniform sampler2D contentTex;
mat3 rotY(float a){return mat3(cos(a),0.,-sin(a),0.,1.,0.,sin(a),0.,cos(a));}
mat3 rotX(float a){return mat3(1.,0.,0.,0.,cos(a),sin(a),0.,-sin(a),cos(a));}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(dot(i,vec2(17.,59.))),hash(dot(i+vec2(1,0),vec2(17.,59.))),f.x),mix(hash(dot(i+vec2(0,1),vec2(17.,59.))),hash(dot(i+vec2(1,1),vec2(17.,59.))),f.x),f.y);}
vec3 field(vec2 p){float tt=time*(.025+energy*.13);vec2 q=p+vec2(sin(p.y*1.3+tt),cos(p.x*.8-tt))*.22;float n=noise(q*1.2+tt);float a=exp(-dot((q-vec2(.8,-.45))*vec2(.7,1.2),(q-vec2(.8,-.45))*vec2(.7,1.2)));float b=exp(-dot((q-vec2(-.9,.1))*vec2(1.,1.5),(q-vec2(-.9,.1))*vec2(1.,1.5)));float caustic=pow(.5+.5*sin(q.x*3.+q.y*1.6+n*3.-tt),6.);vec3 col=vec3(.018,.056,.065)+mix(secondary*.28,vec3(.11,.39,.33),.65)*a*1.8+mix(primary,vec3(.63,.28,.10),.6)*b*.75;col+=vec3(.20,.41,.33)*caustic*a*.4;float wave=p.y-sin(p.x*2.+time*.18)*.13;col+=vec3(.33,.55,.45)*exp(-pow((wave+.38)*160.,2.))*.15;return col;}
vec3 blurField(vec2 p,float radius){vec3 col=field(p)*.2;for(int j=0;j<8;j++){float a=float(j)*6.283185/8.;col+=field(p+vec2(cos(a),sin(a))*radius)*.1;}float wave=p.y-sin(p.x*2.+time*.18)*.13;col+=vec3(.33,.55,.45)*exp(-pow((wave+.38)*160.,2.))*.15;return col;}
float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
void main(){vec2 p=(uv-.5)*vec2(3.55556,2.);float focus=smoothstep(4.4,5.6,time)*(1.-smoothstep(7.1,8.7,time));float zoom=mix(1.4,1.,smoothstep(.1,2.8,time))*(1.-.23*focus-.04*smoothstep(8.7,9.8,time));p*=zoom;p.y-=focus*.05;vec3 col=field(p);vec3 ro=vec3(0.,0.,4.0),rd=normalize(vec3(p,-3.3));
 for(int i=2;i>=0;i--){float fi=float(i);float enter=smoothstep(fi*.37,.9+fi*.37,time);float yoff=(1.-enter)*-1.5;float stagger=i==0?-.16:i==1?.18:-.02;vec3 C=vec3((fi-1.)*.91+(i==2?.20:0.),stagger+sin(time*.35+fi)*.045+yoff,-fi*.24);mat3 R=rotY((fi-1.)*-.17+sin(time*.3+fi)*.045+(fi-1.)*focus*.30)*rotX(.07+cos(time*.2)*.035+focus*.12);vec3 N=R*vec3(0,0,1),U=R*vec3(1,0,0),V=R*vec3(0,1,0);float ray=dot(C-ro,N)/dot(rd,N);vec3 pos=ro+rd*ray;vec2 L=vec2(dot(pos-C,U),dot(pos-C,V));vec2 halfSize=vec2(.53,.70);float d=box(L,halfSize,.09);
  float shadow=box(L-vec2(.02,-.045),halfSize,.09);col*=1.-.21*exp(-abs(shadow)*18.);
  if(d<.0){vec2 an=normalize(L+vec2(.00001));float edge=exp(d*29.);float bevel=exp(d*67.);vec2 bent=p+an*(.012+detail*.065)*edge+L*.025;float frost=.06+detail*.1;vec3 glass=blurField(bent,frost);vec3 dispersion=vec3(field(bent+an*.009).r,field(bent).g,field(bent-an*.009).b);glass=mix(glass,dispersion,.22);glass=mix(glass,vec3(.21,.31,.30),.11);glass+=vec3(.49,.64,.58)*edge*.12;float rim=max(0.,dot(an,normalize(vec2(-.5,.8))));glass+=vec3(.8,.88,.72)*bevel*rim*.5;glass*=1.-bevel*(1.-rim)*.18;float sheen=pow(max(0.,1.-abs(L.x+L.y*.45-sin(time*.5+fi)*.65)*4.),30.);glass+=vec3(.45,.57,.49)*sheen*.12;
   vec2 local=L/(halfSize*2.)+.5;vec4 tx=texture(contentTex,vec2((fi+local.x)/3.,local.y));glass=mix(glass,tx.rgb,tx.a*smoothstep(1.1+fi*.35,1.8+fi*.35,time)*.93);col=glass;
  }
 }
 float glow=exp(-pow((p.x+p.y*.7-sin(time*.4)*1.3)*3.,2.))*.025;col+=vec3(.6,.45,.25)*glow;col=pow(max(col,0.),vec3(.89));col+=(noise(gl_FragCoord.xy)-.5)*.006;fragColor=vec4(col,1.);}`;
export function createOptical(canvas:HTMLCanvasElement,c:EffectConfig){const e=compile(canvas,c,body,content(c));return {draw(t:number){e.draw(t/c.duration*10);},dispose:e.dispose};}
