"""Original optical liquid study. Metaball surface choreography, not a fluid solver."""
import bpy,math,json,sys,argparse
from pathlib import Path
from mathutils import Vector
ap=argparse.ArgumentParser();ap.add_argument('--config',required=True);ap.add_argument('--out',required=True);ap.add_argument('--frames',default='');ap.add_argument('--samples',type=int,default=96)
a=ap.parse_args(sys.argv[sys.argv.index('--')+1:]);c=json.loads(Path(a.config).read_text(encoding='utf8'));c=c.get('config',c);out=Path(a.out).resolve();out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True);sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.samples=a.samples;sc.cycles.use_denoising=True;sc.cycles.denoiser='OPTIX';bpy.context.view_layer.cycles.use_denoising=True;sc.cycles.max_bounces=16;sc.cycles.transmission_bounces=12;sc.cycles.glossy_bounces=8;sc.cycles.adaptive_threshold=.025
try:
 p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='OPTIX';p.get_devices()
 for d in p.devices:d.use=d.type=='OPTIX'
 sc.cycles.device='GPU'
except Exception:sc.cycles.device='CPU'
sc.render.resolution_x=1280;sc.render.resolution_y=720;sc.render.resolution_percentage=100;sc.render.fps=30;sc.frame_start=0;sc.frame_end=round(c['duration']*30)-1;sc.render.image_settings.file_format='JPEG';sc.render.image_settings.quality=97;sc.render.use_persistent_data=True
sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast';sc.view_settings.exposure=.5
def rgb(h):
 vals=[int(h.lstrip('#')[i:i+2],16)/255 for i in (0,2,4)];return tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in vals)+(1,)
def smooth(a,b,t):
 v=max(0,min(1,(t-a)/(b-a)));return v*v*(3-2*v)
def mix(a,b,u):return a+(b-a)*u
sc.world=bpy.data.worlds.new('optical studio world');sc.world.use_nodes=True;sc.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.08,.04,.13,1);sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.24
glass=bpy.data.materials.new('transmitting liquid glass');glass.use_nodes=True;n=glass.node_tree.nodes;p=n.get('Principled BSDF');p.inputs['Base Color'].default_value=(.93,.90,.98,1);p.inputs['Roughness'].default_value=.018+c['detail']*.02;p.inputs['Transmission Weight'].default_value=1;p.inputs['IOR'].default_value=1.46;p.inputs['Coat Weight'].default_value=.20
tex=n.new('ShaderNodeTexCoord');sep=n.new('ShaderNodeSeparateXYZ');ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=rgb(c['primary']);ramp.color_ramp.elements[1].color=rgb(c['secondary']);absorb=n.new('ShaderNodeVolumeAbsorption');absorb.inputs['Density'].default_value=.35
links=glass.node_tree.links;links.new(tex.outputs['Generated'],sep.inputs[0]);links.new(sep.outputs['X'],ramp.inputs[0]);links.new(ramp.outputs['Color'],absorb.inputs['Color']);links.new(ramp.outputs['Color'],p.inputs['Base Color']);links.new(absorb.outputs[0],n['Material Output'].inputs['Volume'])
meta=bpy.data.metaballs.new('continuous liquid surface');meta.resolution=.075;meta.render_resolution=.028;meta.threshold=.62;obj=bpy.data.objects.new('LIQUID / surface',meta);sc.collection.objects.link(obj);obj.data.materials.append(glass)
core=[meta.elements.new() for _ in range(3)];ring=[meta.elements.new() for _ in range(24)];sat=[meta.elements.new() for _ in range(max(3,c['count']))]
for e in core+ring+sat:e.stiffness=2
floor=bpy.data.materials.new('plum graphite stage');floor.use_nodes=True;f=floor.node_tree.nodes['Principled BSDF'];f.inputs['Base Color'].default_value=rgb('#683d71');f.inputs['Roughness'].default_value=.32;f.inputs['Metallic'].default_value=.35
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.02));bpy.context.object.data.materials.append(floor)
def area(name,loc,power,size,color,shape='DISK',size_y=None):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color[:3];d.shape=shape;d.size=size
 if size_y is not None:d.size_y=size_y
 o=bpy.data.objects.new(name,d);sc.collection.objects.link(o);o.location=loc;o.visible_transmission=False;o.rotation_euler=(Vector((0,0,1.6))-o.location).to_track_quat('-Z','Y').to_euler()
area('long white window',(-3,-4,6),750,.65,(1,.88,.72,1),'RECTANGLE',5.0)
area('white ribbon',(4,-2,4),550,.35,(.8,.9,1,1),'RECTANGLE',4)
area('violet backbox',(-2,4,4.5),1000,3,(.54,.20,1,1),'RECTANGLE',4)
area('orange rim',(4,3,2.6),700,3,(1,.30,.08,1),'RECTANGLE',3)
bpy.ops.object.camera_add();cam=bpy.context.object;sc.camera=cam;cam.data.lens=58;cam.data.dof.use_dof=True;cam.data.dof.aperture_fstop=8
focus=bpy.data.objects.new('camera focus',None);sc.collection.objects.link(focus);focus.location=(0,0,1.8);cam.data.dof.focus_object=focus
def state(frame):
 t=frame/30*10/c['duration'];split=smooth(1.4,3.4,t)*(1-smooth(4.0,5.6,t));tor=smooth(5.8,7.8,t);spin=t*(.10+c['intensity']*.12)
 for i,e in enumerate(core):
  ang=i*math.tau/3+spin;e.co=(math.cos(ang)*split*1.36,math.sin(ang)*split*.40,1.95+math.sin(ang)*split*.84);e.radius=mix(1.12,.001,tor)
 for i,e in enumerate(ring):
  ang=i*math.tau/24+spin;xx=math.cos(ang)*.95;zz=math.sin(ang)*.95;e.co=(xx,math.sin(spin*.65)*xx*.32,1.92+zz);e.radius=.001+tor*(.42+c['detail']*.06)
 for i,e in enumerate(sat):
  ang=i*math.tau/len(sat)-spin*1.6;r=2.15+.12*math.sin(t+i);e.co=(math.cos(ang)*r,math.sin(ang)*.42,2+math.sin(ang)*1.65);e.radius=(.08+(i%3)*.035)*smooth(.6,2.1,t)
 u=smooth(0,2.1,t);v=smooth(6.2,9.1,t);cam.location=(mix(3.4,4.8,u)-v*1.0,mix(-6.4,-9.0,u)+v*.7,mix(2.7,4.0,u)+v*.5);look=Vector((0,0,1.9));cam.rotation_euler=(look-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=mix(65,55,u)
frames=[int(f) for f in a.frames.split(',')] if a.frames else range(sc.frame_end+1)
for frame in frames:
 dest=out/f'{frame:04d}.jpg'
 if dest.exists():continue
 state(frame);sc.frame_set(frame);sc.render.filepath=str(dest);bpy.ops.render.render(write_still=True);print('STUDIO_FRAME',frame,flush=True)
