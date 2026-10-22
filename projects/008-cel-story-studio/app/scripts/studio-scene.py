"""Original kinetic ceramic / amber study. Blender 4.5+, Cycles, no upstream scene assets.
Deterministic choreography, not a soft-body solver. CLI values come from validated JSON.
"""
import bpy, math, json, sys, argparse, random
from pathlib import Path
from mathutils import Vector

ap=argparse.ArgumentParser()
ap.add_argument('--config',required=True);ap.add_argument('--out',required=True)
ap.add_argument('--frames',default='');ap.add_argument('--samples',type=int,default=48)
args=ap.parse_args(sys.argv[sys.argv.index('--')+1:])
c=json.loads(Path(args.config).read_text(encoding='utf8')); c=c.get('config',c)
out=Path(args.out).resolve();out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.samples=args.samples
sc.cycles.use_denoising=True;sc.cycles.adaptive_threshold=.035
sc.cycles.max_bounces=8;sc.cycles.transmission_bounces=6;sc.cycles.diffuse_bounces=3
sc.cycles.sample_clamp_indirect=4;sc.cycles.use_adaptive_sampling=True
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
 prefs.compute_device_type='OPTIX';prefs.get_devices()
 for device in prefs.devices:device.use=device.type=='OPTIX'
 sc.cycles.device='GPU'
except Exception:sc.cycles.device='CPU'
sc.render.resolution_x=1280;sc.render.resolution_y=720;sc.render.resolution_percentage=100
sc.render.fps=30;sc.frame_start=0;sc.frame_end=round(c['duration']*30)-1
sc.render.use_persistent_data=True;sc.render.use_motion_blur=True;sc.render.motion_blur_shutter=.38
sc.render.image_settings.file_format='JPEG';sc.render.image_settings.quality=97
sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
sc.view_settings.exposure=-.15

def color(h):
 rgb=[int(h.lstrip('#')[i:i+2],16)/255 for i in (0,2,4)]
 return tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in rgb)+(1,)
def material(name,hex,rough=.3,metal=0,micro=0):
 m=bpy.data.materials.new(name);m.use_nodes=True
 n=m.node_tree.nodes;p=n.get('Principled BSDF');p.inputs['Base Color'].default_value=color(hex)
 p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 if micro:
  noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=150;noise.inputs['Detail'].default_value=3
  bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.2;bump.inputs['Distance'].default_value=micro
  m.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);m.node_tree.links.new(bump.outputs['Normal'],p.inputs['Normal'])
 return m
ivory=material('warm unglazed porcelain','#e5dec9',.5,0,.018)
jade=material('celadon glaze',c['secondary'],.12+c['detail']*.16,.08,.008)
jade.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.48
brass=material('brushed champagne brass','#b68a42',.24,.93,.004)
stone=material('fine honed limestone','#d2c5aa',.67,0,.035)
ink=material('dark emerald enamel','#163b34',.22,.35,.008)
amber=material('amber optical glass',c['primary'],.07,0,.002)
aprin=amber.node_tree.nodes.get('Principled BSDF');aprin.inputs['Transmission Weight'].default_value=.93;aprin.inputs['IOR'].default_value=1.46
vol=amber.node_tree.nodes.new('ShaderNodeVolumeAbsorption');vol.inputs['Color'].default_value=color(c['primary']);vol.inputs['Density'].default_value=.22
amber.node_tree.links.new(vol.outputs['Volume'],amber.node_tree.nodes.get('Material Output').inputs['Volume'])

def mesh(name,verts,faces,mat):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
 o=bpy.data.objects.new(name,me);sc.collection.objects.link(o);o.data.materials.append(mat)
 for p in me.polygons:p.use_smooth=True
 return o
def bevel(o,width=.06):
 mod=o.modifiers.new('hand finished edge','BEVEL');mod.width=width;mod.segments=4
 o.modifiers.new('weighted surface normals','WEIGHTED_NORMAL')
def cube(name,loc,scale,mat,edge=.06):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 if edge:bevel(o,edge)
 return o
def ball(name,loc,r,mat):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=32,radius=r,location=loc);o=bpy.context.object;o.name=name;o.data.materials.append(mat)
 for f in o.data.polygons:f.use_smooth=True
 return o
def curve(name,pts,r,mat,cyclic=False):
 cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=24;cu.bevel_depth=r;cu.bevel_resolution=5
 sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1);sp.use_cyclic_u=cyclic
 for p,co in zip(sp.bezier_points,pts):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,cu);sc.collection.objects.link(o);o.data.materials.append(mat);return o

# Sculpted porcelain ribbons: a deliberately asymmetric continuous trefoil.
def ribbon(name,phase,mat):
 pts=[]
 for i in range(30):
  a=i*math.tau/30;rad=1.10+.22*math.cos(3*a+phase)
  pts.append((rad*math.cos(a),.28*math.sin(2*a+phase),rad*math.sin(a)))
 o=curve(name,pts,.16,mat,True);o.location=(0,0,2.26);return o
hero=ribbon('three lobed celadon ribbon',.2,jade)
inner=ribbon('porcelain companion',1.2,ivory);inner.scale=(.77,.77,.77);inner.rotation_euler=(0,0,.7)
base=cube('floating limestone slab',(0,0,.18),(7.6,5.8,.36),stone,.12)
cube('emerald plinth',(0,.1,.43),(4.5,3.6,.16),ink,.08)
cube('warm studio cyclorama',(0,0,-.12),(200,200,.18),ivory,.01)

# Closely spaced ceramic fins have real geometry, occlusion and material roughness.
ribs=[]
for i in range(95):
 x=-3.5+i*7/94
 rib=cube('porcelain fluting %03d'%i,(x,0,.48),(.035,5.2,.16),ivory,.017)
 ribs.append(rib)
# Elliptical paired brass rails carry the amber sphere.
for offset in [-.045,.045]:
 pts=[(math.cos(i*math.tau/96)*(2.0+offset),math.sin(i*math.tau/96)*(1.45+offset),.76+.21*math.sin(i*math.tau/96)) for i in range(96)]
 curve('brass track',pts,.019,brass,True)
hero_ball=ball('amber traveller',(2,0,1.17),.41,amber)
beads=[];rng=random.Random(c['seed'])
for i in range(c['count']):
 a=i*math.tau/c['count'];rad=2.5+rng.random()*.35
 b=ball('satellite %02d'%i,(math.cos(a)*rad,math.sin(a)*2,.8),.055+rng.random()*.065,brass if i%2 else jade)
 beads.append((b,a,rad))
# Minute machined markings make the perimeter legible in macro shots.
for i in range(100):
 a=i*math.tau/100
 o=cube('engraved index',(math.cos(a)*2.83,math.sin(a)*2.15,.378),(.015,.1 if i%5==0 else .045,.008),brass,.003);o.rotation_euler.z=a+math.pi/2

world=bpy.data.worlds.new('cream studio');world.use_nodes=True;sc.world=world
world.node_tree.nodes.get('Background').inputs['Color'].default_value=(.6,.68,.7,1)
world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.22
def area(name,loc,power,size,tint,target=(0,0,1),size_y=None):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color(tint)[:3];data.shape='RECTANGLE';data.size=size;data.size_y=size_y or size
 o=bpy.data.objects.new(name,data);sc.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('large silk key',(-3,-4,7),1050,5,'#fff2d7',size_y=4)
area('vertical reflection strip',(4,1,5),900,1.6,'#e2f5ed',size_y=5)
area('warm edge',(-3,4,3),650,3,'#ffd49c',size_y=2)
area('front fill',(0,-7,3),180,5,'#e6eff1')
bpy.ops.object.camera_add();camera=bpy.context.object;sc.camera=camera
camera.data.lens=61;camera.data.sensor_width=36;camera.data.dof.use_dof=True;camera.data.dof.aperture_fstop=5.6
focus=bpy.data.objects.new('focus pull',None);sc.collection.objects.link(focus);camera.data.dof.focus_object=focus

def smooth(a,b,x):
 u=max(0,min(1,(x-a)/(b-a)));return u*u*(3-2*u)
def mix(a,b,u):return tuple(x+(y-x)*u for x,y in zip(a,b))
def state(f):
 t=f/(c['duration']*30)*10;a=-.65+t*(.24+c['intensity']*.16)
 bp=(math.cos(a)*2,math.sin(a)*1.45,.76+.21*math.sin(a)+.405)
 hero_ball.location=bp;hero_ball.rotation_euler=(0,t*1.8,t*.3)
 hero.rotation_euler=(math.sin(t*.6)*.08,math.sin(t*.4)*.1,t*.15)
 inner.rotation_euler=(.13*math.sin(t*.5),.1,.7-t*.1)
 # A local travelling compression is a designed response to the rolling sphere.
 for i,rib in enumerate(ribs):
  x=-3.5+i*7/94;wave=math.exp(-((x-bp[0])/.8)**2)*(.5+.5*math.sin(t*3-i*.2))
  rib.location.z=.47+wave*.055*c['intensity']
 for b,an,rad in beads:
  b.location=(math.cos(an+t*.07)*rad,math.sin(an+t*.07)*2,.8+.09*math.sin(an+t))
 # Continuous macro -> wide -> material portrait -> final wide, no stationary poster.
 macro=(bp[0]+2.1,bp[1]-3.6,2.5);wide=(7.2,-10.7,7.1)
 u=smooth(.3,3.2,t);pos=mix(macro,wide,u);look=mix(bp,(0,0,1.5),u)
 close=smooth(5.7,7.1,t)*(1-smooth(7.9,9.2,t))
 pos=mix(pos,(3.2,-5.0,3.6),close*.7);look=mix(look,(.1,0,2.1),close*.45)
 camera.location=pos;camera.rotation_euler=(Vector(look)-camera.location).to_track_quat('-Z','Y').to_euler();focus.location=look
 camera.data.dof.aperture_fstop=4.2+u*2.2

# Key the continuous motion for true shutter motion blur.
for f in range(-1,sc.frame_end+2):
 state(f)
 for o in [hero_ball,hero,inner,camera,focus]+ribs+[q[0] for q in beads]:
  o.keyframe_insert('location',frame=f)
 for o in [hero_ball,hero,inner,camera]:o.keyframe_insert('rotation_euler',frame=f)
 camera.data.dof.keyframe_insert('aperture_fstop',frame=f)
frames=[int(x) for x in args.frames.split(',')] if args.frames else range(sc.frame_end+1)
for f in frames:
 dest=out/f'{f:04d}.jpg'
 if dest.exists():continue
 sc.frame_set(f);sc.render.filepath=str(dest);bpy.ops.render.render(write_still=True)
 print('STUDIO_FRAME',f,flush=True)
