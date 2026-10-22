"""磁场花开: an original kinetic porcelain film, rendered with Blender / Cycles.
All trajectories are deterministic art-directed fields; this is not an electromagnetic solver.
Geometry and choreography are authored here. No upstream models, textures or scene files.
"""
import bpy,math,json,sys,argparse,random
from pathlib import Path
from mathutils import Vector,Euler,Quaternion

ap=argparse.ArgumentParser();ap.add_argument('--config',required=True);ap.add_argument('--out',required=True)
ap.add_argument('--frames',default='');ap.add_argument('--samples',type=int,default=48)
args=ap.parse_args(sys.argv[sys.argv.index('--')+1:]);c=json.loads(Path(args.config).read_text(encoding='utf8'));c=c.get('config',c)
out=Path(args.out).resolve();out.mkdir(parents=True,exist_ok=True);bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.samples=args.samples;sc.cycles.use_denoising=True
sc.cycles.adaptive_threshold=.025;sc.cycles.use_adaptive_sampling=True;sc.cycles.max_bounces=8;sc.cycles.diffuse_bounces=3;sc.cycles.glossy_bounces=5
sc.cycles.sample_clamp_indirect=4
bpy.context.view_layer.cycles.use_denoising=True;sc.cycles.denoiser='OPTIX'
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
 prefs.compute_device_type='OPTIX';prefs.get_devices()
 for dev in prefs.devices:dev.use=dev.type=='OPTIX'
 sc.cycles.device='GPU'
except Exception:sc.cycles.device='CPU'
sc.render.resolution_x=1280;sc.render.resolution_y=720;sc.render.resolution_percentage=100
sc.render.fps=30;sc.frame_start=0;sc.frame_end=round(c['duration']*30)-1
sc.render.image_settings.file_format='JPEG';sc.render.image_settings.quality=97
sc.render.use_persistent_data=True;sc.render.use_motion_blur=True;sc.render.motion_blur_shutter=.38
sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast';sc.view_settings.exposure=.15

def srgb(h):
 rgb=[int(h.lstrip('#')[i:i+2],16)/255 for i in (0,2,4)]
 return tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in rgb)+(1,)
def mat(name,col,rough=.25,metal=0,coat=0,micro=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;p=n.get('Principled BSDF')
 p.inputs['Base Color'].default_value=srgb(col);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;p.inputs['Coat Weight'].default_value=coat
 if micro:
  tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=210;tex.inputs['Detail'].default_value=3
  bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.14;bump.inputs['Distance'].default_value=micro
  m.node_tree.links.new(tex.outputs['Fac'],bump.inputs['Height']);m.node_tree.links.new(bump.outputs['Normal'],p.inputs['Normal'])
 return m
porcelain=mat('warm porcelain shell','#ece3d0',.28,0,.35,.004)
coral=mat('coral enamel',c['primary'],.13+c['detail']*.18,.08,.6,.002)
mint=mat('sea glass enamel',c['secondary'],.12+c['detail']*.18,.08,.6,.002)
copper=mat('polished copper petal edge','#d59d61',.18,.88,.3,.001)
chrome=mat('polished platinum core','#cbd9de',.08,.99)
navy=mat('midnight blue lacquer','#112c43',.23,.48,.3,.002)
deep=mat('deep blue velvet floor','#071b2b',.48,.12,0,.004)

def mesh(name,verts,faces,mats,indices=None):
 data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update()
 obj=bpy.data.objects.new(name,data);sc.collection.objects.link(obj)
 for m in mats:obj.data.materials.append(m)
 for i,p in enumerate(data.polygons):p.use_smooth=True;p.material_index=indices[i] if indices else 0
 return obj
def curve(name,pts,r,material,closed=False):
 d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.resolution_u=16;d.bevel_depth=r;d.bevel_resolution=3
 s=d.splines.new('POLY');s.points.add(len(pts)-1)
 for p,v in zip(s.points,pts):p.co=(*v,1)
 s.use_cyclic_u=closed;o=bpy.data.objects.new(name,d);sc.collection.objects.link(o);o.data.materials.append(material);return o
def sphere(name,r,material):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=32,radius=r);o=bpy.context.object;o.name=name;o.data.materials.append(material)
 for f in o.data.polygons:f.use_smooth=True
 return o
def make_petal(layer,length):
 nu,nv=30,8;v=[];faces=[];mi=[]
 def point(u,a,back=False):
  width=.025+(.29-layer*.025)*math.sin(math.pi*u)**.72*(.76+.35*u)
  return (width*a,u*length,.16*math.sin(math.pi*u)+.34*u**3+.18*a*a*math.sin(math.pi*u)-(.035 if back else 0))
 for back in [False,True]:
  for i in range(nu+1):
   for j in range(nv+1):v.append(point(i/nu,j/nv*2-1,back))
 n=(nu+1)*(nv+1)
 for side in [0,1]:
  for i in range(nu):
   for j in range(nv):
    a=side*n+i*(nv+1)+j;f=(a,a+1,a+nv+2,a+nv+1)
    faces.append(f if side==0 else tuple(reversed(f)));mi.append(1 if side else 0)
 for i in range(nu):
  for j in [0,nv]:
   a=i*(nv+1)+j;b=(i+1)*(nv+1)+j;faces.append((a,b,b+n,a+n));mi.append(2)
 for i in [0,nu]:
  for j in range(nv):
   a=i*(nv+1)+j;faces.append((a,a+n,a+n+1,a+1));mi.append(2)
 top=mint if layer==1 else coral
 proto=mesh('porcelain petal master '+str(layer),v,faces,[top,porcelain,copper],mi)
 # An actual fine metal rim catches the studio light, rather than a painted line.
 outline=[point(i/nu,-1) for i in range(nu+1)]+[point(i/nu,1) for i in range(nu,-1,-1)]
 edge=curve('copper rim master '+str(layer),outline,.008,copper,True)
 return proto,edge

floor=mesh('infinite indigo stage',[(-100,-100,-.08),(100,-100,-.08),(100,100,-.08),(-100,100,-.08)],[(0,1,2,3)],[deep])
core=sphere('mirror core',.49,chrome);core.location=(0,0,2.35)
# A small copper inset inside the reflective core makes the central scale legible.
heart=sphere('coral magnetic seed',.18,coral)
petals=[];rng=random.Random(c['seed']);lengths=[1.8,1.45,1.05];radial=[.42,.39,.35]
for layer in range(3):
 n=max(4,c['count']*2+4-layer*4);proto,edge=make_petal(layer,lengths[layer])
 for j in range(n):
  a=j*math.tau/n+layer*.19;group=bpy.data.objects.new('petal %d-%02d'%(layer,j),None);sc.collection.objects.link(group)
  o=proto.copy();o.data=proto.data;sc.collection.objects.link(o);o.parent=group
  e=edge.copy();e.data=edge.data;sc.collection.objects.link(e);e.parent=group
  start_a=a+rng.uniform(-.35,.35);r=2.0+rng.random()*2.4
  start=Vector((math.cos(start_a)*r,math.sin(start_a)*r,.10+rng.random()*.08));scatter_a=a+.4+rng.random()*.8
  petals.append(dict(o=group,a=a,layer=layer,phase=j/n,start=start,spin=rng.uniform(-2,2),scatter=Vector((math.cos(scatter_a),math.sin(scatter_a),rng.uniform(-.25,.45))),delay=(j%n)/n*.35+layer*.12,fault=layer==0 and j in [int(n*.70),int(n*.85)]))
 bpy.data.objects.remove(proto,do_unlink=True);bpy.data.objects.remove(edge,do_unlink=True)

# Small copper grains trace the same force; they are accents, never a repeated ground carpet.
grains=[]
for i in range(72):
 a=rng.random()*math.tau;r=1+rng.random()*4;o=sphere('copper dust %02d'%i,.014+rng.random()*.018,copper if i%4 else mint)
 grains.append((o,a,r,rng.random()))
# Porcelain chips on the stage provide a visible reference for levitation.
chips=[]
for i in range(14):
 a=rng.random()*math.tau;r=2.6+rng.random()*2.2
 verts=[(-.08,-.10,0),(.11,-.06,0),(.02,.17,.018),(-.08,-.10,.038),(.11,-.06,.038),(.02,.17,.056)]
 o=mesh('fallen shard %02d'%i,verts,[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)],[porcelain,copper],[0,0,1,1,1])
 o.location=(math.cos(a)*r,math.sin(a)*r,.025);o.rotation_euler=(0,0,a);chips.append((o,o.location.copy(),a))

world=bpy.data.worlds.new('blue studio environment');world.use_nodes=True;sc.world=world
world.node_tree.nodes.get('Background').inputs['Color'].default_value=srgb('#56768b');world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.25
def area(name,pos,power,size,tint,target=(0,0,2),height=None):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=srgb(tint)[:3];d.shape='RECTANGLE';d.size=size;d.size_y=height or size
 o=bpy.data.objects.new(name,d);sc.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
area('warm silk key',(-4,-5,8),1800,4.5,'#fff1dc',height=6)
area('mint edge softbox',(4,1,6),1350,1.0,'#b3fff0',height=5)
area('coral rear strip',(-4,4,4),700,2.5,'#ffa086',height=4)
area('front eye light',(0,-7,3),250,3,'#e4f0ff',height=2)
area('overhead reflection',(0,1,9),700,3.0,'#fbf8ee',height=2)
spot_data=bpy.data.lights.new('pool of blue','AREA');spot_data.energy=450;spot_data.shape='DISK';spot_data.size=3;spot_data.color=srgb('#568bd4')[:3]
pool=bpy.data.objects.new('pool of blue',spot_data);sc.collection.objects.link(pool);pool.location=(0,0,5.5)
bpy.ops.object.camera_add();camera=bpy.context.object;sc.camera=camera;camera.data.lens=52;camera.data.sensor_width=36
camera.data.dof.use_dof=True;camera.data.dof.aperture_fstop=5.6
focus=bpy.data.objects.new('cinematic focus target',None);sc.collection.objects.link(focus);camera.data.dof.focus_object=focus

def smooth(a,b,t):
 u=min(1,max(0,(t-a)/(b-a)));return u*u*(3-2*u)
def mix(a,b,u):return a+(b-a)*u
def mixv(a,b,u):return Vector(a).lerp(Vector(b),u)
def petal_state(p,t):
 layer,a=p['layer'],p['a'];g=p['o'];delay=p['delay'];gather=smooth(.35+delay,2.7+delay,t)
 # The first small piece jumps toward the lens: motion begins in frame one.
 lift=math.sin(min(1,gather)*math.pi)*(.6+c['intensity']*.9)
 target=Vector((math.cos(a)*radial[layer],math.sin(a)*radial[layer],2.35-layer*.045))
 loc=p['start'].lerp(target,gather);loc.z+=lift
 closed=1.25;pitch=mix(.02,closed,gather)
 # Gathering rotates in the direction of the invisible force, then nearly stops.
 theta=a-math.pi/2+(1-gather)*p['spin']+smooth(1.0,3.8,t)*.75
 tension=smooth(2.8,4.0,t)*(1-smooth(4.0,4.25,t));loc.z+=math.sin(t*42+a*8)*.016*tension
 burst=smooth(4.08+layer*.035,4.65+layer*.035,t)*(1-smooth(5.15,6.20,t))
 loc+=p['scatter']*burst*(.75+c['intensity']*.75);loc.z+=burst*(.18+math.sin(a*2)*.17)
 theta+=burst*.6;pitch-=burst*.55
 # Separate the crown's pause from the fast inhale and the slower unfurling.
 opening=smooth(5.4+layer*.11,7.1+layer*.11,t);pitch=mix(pitch,[.10,.35,.60][layer],opening)
 loc.z+=opening*.11*math.sin(a*2+t*.6);loc.z-=opening*.16*max(0,-math.sin(a))*(layer==2);theta+=opening*.24
 fault=smooth(4.15,4.65,t)*(1-smooth(5.18,5.8,t)) if p['fault'] else 0
 loc+=Vector((math.cos(a)*.7,math.sin(a)*.7,-1.65))*fault;pitch-=fault*.9
 breathe=math.sin((t-7)*1.6)*.018*smooth(7.1,8.2,t);pitch+=breathe
 g.location=loc;g.rotation_euler=(0,0,theta);q=Euler((pitch,fault*.8,0),'XYZ').to_quaternion();q=Euler((0,0,theta),'XYZ').to_quaternion()@q;g.rotation_mode='QUATERNION';g.rotation_quaternion=q
 scale=.78+.22*gather;length_scale=1-.32*gather*(1-opening);g.scale=(scale,scale*length_scale,scale)

def state(f):
 t=f/(c['duration']*30)*10
 for p in petals:petal_state(p,t)
 core.location=(0,0,mix(.58,2.35,smooth(.15,2.4,t))+.035*math.sin(t*4)*(1-smooth(7,8,t))+.25*smooth(6.4,7.4,t))
 core.rotation_euler=(t*.25,t*.17,t*.1);heart.location=(0,-.46,core.location.z);heart.scale=(.40,.40,.40)
 for o,a,r,phase in grains:
  fly=smooth(.6+phase*.8,3,t);burst=smooth(4.1,4.7,t)*(1-smooth(5.2,6.1,t));rad=mix(r,.75+phase*1.8,fly)+burst*.7
  clock=t-min(.5,max(0,t-4.65));ang=a+fly*clock*.17;o.location=(math.cos(ang)*rad,math.sin(ang)*rad,mix(.04,.9+phase*2.5,fly)+burst*.4)
 for o,start,a in chips:
  u=smooth(5.25,5.65,t)*(1-smooth(6.1,7.2,t));o.location=start+Vector((0,0,u*(.08+c['intensity']*.18)));o.rotation_euler=(u*.2,0,a)
 # Four deliberate shots: near-floor hook, tense bud, burst portrait, full bloom reveal.
 if t<2.6:
  u=smooth(0,2.6,t);pos=mixv((3.8,-5.8,1.25),(4.9,-7.6,4.3),u);look=mixv((.5,-.6,.6),(0,0,2.65),u);lens=mix(60,52,u)
 elif t<5.2:
  u=smooth(2.6,5.2,t);pos=mixv((4.9,-7.6,4.3),(4.8,-8.8,5.8),u);look=mixv((0,0,2.65),(0,0,2.0),smooth(3.8,4.7,t));lens=mix(52,54,smooth(4.8,5.2,t))
 elif t<7.9:
  u=smooth(5.2,7.9,t);pos=mixv((4.8,-8.8,5.8),(4.0,-6.5,6.8),u);look=Vector((0,0,2.0));lens=mix(54,48,u)
 else:
  u=smooth(7.9,10,t);pos=mixv((4.0,-6.5,6.8),(3.7,-6.8,6.6),u);look=Vector((0,0,2.1));lens=48
 camera.location=pos;camera.rotation_euler=(look-pos).to_track_quat('-Z','Y').to_euler();camera.data.lens=lens
 camera.data.dof.aperture_fstop=5.6 if t<5.3 else 7.1;focus.location=look

# Sampling trajectories at every frame gives Cycles physical shutter motion blur.
animated=[p['o'] for p in petals]+[core,heart,camera,focus]+[q[0] for q in grains]+[q[0] for q in chips]
for f in range(-1,sc.frame_end+2):
 state(f)
 for o in animated:
  o.keyframe_insert('location',frame=f);o.keyframe_insert('scale',frame=f)
  o.keyframe_insert('rotation_quaternion' if o.rotation_mode=='QUATERNION' else 'rotation_euler',frame=f)
 camera.data.keyframe_insert('lens',frame=f);camera.data.dof.keyframe_insert('aperture_fstop',frame=f)
for o in animated:
 if o.animation_data and o.animation_data.action:
  for fc in o.animation_data.action.fcurves:
   for k in fc.keyframe_points:k.interpolation='LINEAR'
frames=[int(x) for x in args.frames.split(',')] if args.frames else range(sc.frame_end+1)
for f in frames:
 dest=out/f'{f:04d}.jpg'
 if dest.exists():continue
 sc.frame_set(f);sc.render.filepath=str(dest);bpy.ops.render.render(write_still=True);print('STUDIO_FRAME',f,flush=True)
