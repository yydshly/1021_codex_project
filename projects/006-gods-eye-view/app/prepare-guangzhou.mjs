/** Build a bounded local 3D Tiles sample from an openly licensed Guangzhou database. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import earcut from './upstream/node_modules/earcut/src/earcut.js';

const app = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(app, 'data/guangzhou');
const commit = '8e985efd338e85692b78c28c163c77e3daf08342';
const source = `https://raw.githubusercontent.com/Tsdsj/guangzhou-3d/${commit}/`;
await fs.mkdir(path.join(out, 'tiles'), { recursive: true });
async function download(remote, local) {
  const target = path.join(out, local);
  try { if ((await fs.stat(target)).size) return; } catch {}
  execFileSync('curl.exe', ['-fsSL', '--retry', '2', '--connect-timeout', '15', '--max-time', '120', source + remote, '-o', target + '.part']);
  await fs.rename(target + '.part', target);
}
await download('data/guangzhou.json', 'source-guangzhou.json');
await download('data/guangzhou.bin.gz', 'source-guangzhou.bin.gz');
await download('README.md', 'SOURCE-README.md');
await download('LICENSE', 'SOURCE-CODE-LICENSE.txt');
const meta = JSON.parse(await fs.readFile(path.join(out, 'source-guangzhou.json'), 'utf8'));
const data = gunzipSync(await fs.readFile(path.join(out, 'source-guangzhou.bin.gz')));
function array(name) {
  const s = meta.sections[name];
  if (s.file !== 0) throw new Error('Unexpected source buffer');
  const copy = Uint8Array.from(data.subarray(s.offset, s.offset + s.length * 4)).buffer;
  return s.type === 'Float32Array' ? new Float32Array(copy) : new Uint32Array(copy);
}
const bm = array('bldMeta'), rings = array('bldRings'), points = array('bldPts');
const centerX = 2400, centerZ = -500, halfSize = 1800;
const lon = meta.origin.lon + centerX / meta.origin.kx;
const lat = meta.origin.lat - centerZ / meta.origin.kz;
const counts = new Map();
function ring(index) {
  const start = rings[index * 2], count = rings[index * 2 + 1];
  const result = [];
  for (let k = 0; k < count; k++) result.push([points[(start + k) * 2], points[(start + k) * 2 + 1]]);
  return result;
}
function triangle(tile, a, b, c, roof) {
  const u = b.map((v, i) => v - a[i]), v = c.map((n, i) => n - a[i]);
  const n = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
  const length = Math.hypot(...n);
  if (length < 1e-7) return;
  for (const p of [a, b, c]) {
    tile.positions.push(...p); tile.normals.push(...n.map(x => x / length));
    tile.colors.push(...(roof ? [0.72,0.79,0.8] : [0.57,0.7,0.75]));
  }
}
for (let i = 0; i < bm.length / 24; i++) {
  const o = i * 24, x = bm[o+16], z = bm[o+17];
  if (Math.abs(x-centerX) > halfSize || Math.abs(z-centerZ) > halfSize) continue;
  const key = `${Math.floor((x-centerX)/600)}_${Math.floor((z-centerZ)/600)}`;
  if (!counts.has(key)) counts.set(key, { positions: [], normals: [], colors: [], buildings: 0 });
  const tile = counts.get(key); tile.buildings++;
  const base = bm[o+2], top = bm[o+3];
  if (!(Number.isFinite(top) && top > base)) throw new Error(`Invalid building height ${i}`);
  const loops = Array.from({length:bm[o+1]}, (_,k)=>ring(bm[o]+k));
  const flat = [], holes = [];
  const p = (pt, height) => [pt[0]-centerX, height, pt[1]-centerZ];
  for (const [index, loop] of loops.entries()) {
    if (index) holes.push(flat.length / 2);
    for (let e=0;e<loop.length;e++) {
      const a=loop[e], b=loop[(e+1)%loop.length]; flat.push(...a);
      triangle(tile,p(a,base),p(b,base),p(b,top),false);
      triangle(tile,p(a,base),p(b,top),p(a,top),false);
    }
  }
  const tris = earcut(flat, holes);
  for (let t=0;t<tris.length;t+=3) {
    const coords = tris.slice(t,t+3).map(j=>p([flat[j*2],flat[j*2+1]],top));
    if ((coords[1][0]-coords[0][0])*(coords[2][2]-coords[0][2])-(coords[1][2]-coords[0][2])*(coords[2][0]-coords[0][0]) > 0) coords.reverse();
    triangle(tile,...coords,true);
  }
}
function glb(tile) {
  const pos = new Float32Array(tile.positions), norm = new Float32Array(tile.normals), color = new Float32Array(tile.colors);
  const min = [Infinity,Infinity,Infinity], max = [-Infinity,-Infinity,-Infinity];
  for (let i=0;i<pos.length;i++) { min[i%3]=Math.min(min[i%3],pos[i]);max[i%3]=Math.max(max[i%3],pos[i]); }
  const buffers = [pos,norm,color].map(a=>Buffer.from(a.buffer));
  const bin = Buffer.concat(buffers);
  const json = {asset:{version:'2.0',generator:'Gods Eye View research; OSM-derived Guangzhou sample',copyright:'OpenStreetMap contributors; Tsdsj/guangzhou-3d; ODbL 1.0'},
    scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0,NORMAL:1,COLOR_0:2},material:0}]}],
    materials:[{doubleSided:true,pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:0.9}}],buffers:[{byteLength:bin.length}],
    bufferViews:buffers.map((b,i)=>({buffer:0,byteOffset:i*pos.byteLength,byteLength:b.length,target:34962})),
    accessors:[{bufferView:0,componentType:5126,count:pos.length/3,type:'VEC3',min,max},... [1,2].map(i=>({bufferView:i,componentType:5126,count:pos.length/3,type:'VEC3'}))]};
  let j=Buffer.from(JSON.stringify(json));j=Buffer.concat([j,Buffer.alloc((4-j.length%4)%4,32)]);
  const header=Buffer.alloc(20);header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(28+j.length+bin.length,8);header.writeUInt32LE(j.length,12);header.writeUInt32LE(0x4e4f534a,16);
  const bh=Buffer.alloc(8);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);
  return {bytes:Buffer.concat([header,j,bh,bin]),min,max};
}
const children=[];
for (const [key,tile] of counts) {
  const result=glb(tile), uri=`tiles/${key}.glb`;
  await fs.writeFile(path.join(out,uri),result.bytes);
  const lo=[result.min[0],-result.max[2],result.min[1]], hi=[result.max[0],-result.min[2],result.max[1]];
  const c=lo.map((v,i)=>(v+hi[i])/2),r=lo.map((v,i)=>(hi[i]-v)/2);
  children.push({boundingVolume:{box:[...c,r[0],0,0,0,r[1],0,0,0,r[2]]},geometricError:0,content:{uri}});
}
// WGS84 East-North-Up frame. Source projection is a local linear approximation.
const l=lon*Math.PI/180, p=lat*Math.PI/180, a=6378137, e2=0.00669437999014;
const n=a/Math.sqrt(1-e2*Math.sin(p)**2);
const transform=[-Math.sin(l),Math.cos(l),0,0,-Math.sin(p)*Math.cos(l),-Math.sin(p)*Math.sin(l),Math.cos(p),0,Math.cos(p)*Math.cos(l),Math.cos(p)*Math.sin(l),Math.sin(p),0,n*Math.cos(p)*Math.cos(l),n*Math.cos(p)*Math.sin(l),n*(1-e2)*Math.sin(p),1];
const tileset={asset:{version:'1.1',copyright:'OpenStreetMap contributors / Tsdsj; ODbL 1.0'},geometricError:1000,root:{transform,boundingVolume:{box:[0,0,250,2200,0,0,0,2200,0,0,0,300]},geometricError:1000,refine:'ADD',children}};
await fs.writeFile(path.join(out,'tileset.json'),JSON.stringify(tileset));
await fs.writeFile(path.join(out,'LICENSE-DATA.md'),'# 数据许可\n\n© OpenStreetMap 贡献者，ODbL 1.0：https://opendatacommons.org/licenses/odbl/1-0/\n\n派生数据来源：https://github.com/Tsdsj/guangzhou-3d/tree/'+commit+'/data\n\n本地选取珠江新城周边建筑轮廓和高度，转换为简化 GLB 体块；不含上游填充地块、虚构车流或程序化立面。部分源高度为估计，不含航拍纹理。派生数据库遵循 ODbL。\n');
const files=[];
for (const local of ['source-guangzhou.json','source-guangzhou.bin.gz','SOURCE-README.md','SOURCE-CODE-LICENSE.txt','LICENSE-DATA.md','tileset.json',...children.map(c=>c.content.uri)]) {
  const bytes=await fs.readFile(path.join(out,local));files.push({path:local,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
const manifest={name:'广州 · 珠江新城简化建筑',source:'https://github.com/Tsdsj/guangzhou-3d',commit,license:'ODbL 1.0 (data); MIT (upstream code)',osmTimestamp:meta.osmTimestamp,center:[lon,lat],blocks:children.length,buildings:[...counts.values()].reduce((s,t)=>s+t.buildings,0),tileset:'/local-city-data/guangzhou/tileset.json',note:'真实 OSM 轮廓，部分高度为上游估计；平屋顶、单色立面，没有航拍纹理。局部投影近似，仅作可视化。',files};
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({blocks:manifest.blocks,buildings:manifest.buildings,center:manifest.center,bytes:files.reduce((s,f)=>s+f.bytes,0)},null,2));
