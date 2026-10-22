// Package the static research site without changing any individual film or poster.
// Run after `npm run build`. Full reel compilations are preserved byte-for-byte
// as GitHub Release assets, while Pages keeps all individual comparison films.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {mkdir,readdir,stat,readFile,writeFile,copyFile,unlink} from 'node:fs/promises';

const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const project=path.dirname(app);
const repo=path.resolve(project,'../..');
const web=path.join(project,'web');
// This publication checkout lives on D:. Never trim the original F: research tree.
if(process.platform==='win32'&&!/^D:\\/i.test(web))throw Error('请在D盘发布副本中执行；不修改F盘原始研究目录。');
const releaseDir=path.resolve(repo,'../release-assets');
const tag='mg-styles-research-019';
const releaseBase=`https://github.com/yydshly/1021_codex_project/releases/download/${tag}/`;
const publicIndex=path.join(web,'pages-media-019.json');
const reportFile=path.join(project,'assets/review-019/pages-packaging.json');
const textExt=new Set(['.html','.js','.css','.json','.md','.mjs','.ts','.tsx','.mts','.txt']);
const slash=s=>s.split(path.sep).join('/');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const escaped=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
async function files(folder){const out=[];for(const row of await readdir(folder,{withFileTypes:true})){const f=path.join(folder,row.name);if(row.isDirectory())out.push(...await files(f));else if(row.isFile())out.push(f);else throw Error(`发布目录包含非普通文件：${f}`);}return out;}
async function sizeOf(folder){let bytes=0,count=0;for(const f of await files(folder)){bytes+=(await stat(f)).size;count++;}return {bytes,files:count,MiB:Number((bytes/1048576).toFixed(2))};}
const before=await sizeOf(web);
await mkdir(releaseDir,{recursive:true});

// Keep the prior map for repeated build -> package runs after files left Pages.
let prior=[];
try{const j=JSON.parse(await readFile(publicIndex,'utf8'));if(j.tag!==tag)throw Error('Release tag mismatch');prior=j.assets;}catch(error){if(error.code!=='ENOENT')throw error;}
const groups=new Map(prior.map(row=>[row.sha256,{...row,originals:[...row.originals]}]));
const reelFiles=(await files(web)).filter(f=>/reel[^/\\]*\.mp4$/i.test(f));
for(const file of reelFiles){
 const data=await readFile(file),sha256=hash(data),original=slash(path.relative(web,file));
 let row=groups.get(sha256);
 if(!row){row={sha256,bytes:data.length,asset:'',url:'',originals:[]};groups.set(sha256,row);}
 if(!row.originals.includes(original))row.originals.push(original);
}
const priority=s=>(s.startsWith('effect-examples/')?0:s.startsWith('story-examples-')?1:2);
for(const row of groups.values()){
 row.originals.sort((a,b)=>priority(a)-priority(b)||a.localeCompare(b));
 if(!row.asset)row.asset=`mg019-${row.originals[0].replaceAll('/','--')}`;
 row.url=releaseBase+row.asset;
 const payload=path.join(releaseDir,row.asset);
 let valid=false;
 try{valid=hash(await readFile(payload))===row.sha256;}catch(error){if(error.code!=='ENOENT')throw error;}
 if(!valid){
  let source;
  for(const rel of row.originals){try{const candidate=path.join(web,rel);if(hash(await readFile(candidate))===row.sha256){source=candidate;break;}}catch(error){if(error.code!=='ENOENT')throw error;}}
  if(!source)throw Error(`原始合集与Release备份均不可用：${row.asset}`);
  await copyFile(source,payload);
 }
 if(hash(await readFile(payload))!==row.sha256)throw Error(`Release备份校验失败：${row.asset}`);
}
const assets=[...groups.values()].sort((a,b)=>a.asset.localeCompare(b.asset));
const index={version:1,tag,release:`https://github.com/yydshly/1021_codex_project/releases/tag/${tag}`,description:'完整合集迁至GitHub Release，字节与SHA256不变；所有单支影片、原作、截图和新旧对比保留在Pages。',assets};
// Persist the recovery map before any output is trimmed; failed/repeated runs
// must still know the original aliases after compilations leave the site.
await writeFile(publicIndex,JSON.stringify(index,null,2));
const uploads=assets.map(row=>({...row,localFile:path.join(releaseDir,row.asset)}));
await writeFile(path.join(releaseDir,'upload-manifest.json'),JSON.stringify({tag,repository:'yydshly/1021_codex_project',uploads},null,2));
const replacements=assets.flatMap(row=>row.originals.map(original=>({original,url:row.url}))).sort((a,b)=>b.original.length-a.original.length);
const changed=[];
const dynamicCandidates=[];
for(const file of await files(web)){
 if(file===publicIndex||!textExt.has(path.extname(file).toLowerCase()))continue;
 const original=await readFile(file,'utf8');let body=original;
 const rel=slash(path.relative(web,file)),folder=path.posix.dirname(rel);
 for(const row of replacements){
  // Match complete URL/path tokens, including normalized and original Markdown
  // `web/` prefixes. Do not rewrite matching text inside an unrelated URL.
  const full=new RegExp(`(^|["'\x60(=\\s])(?:(?:\\./)?|(?:\\.\\./)?web/)${escaped(row.original)}(?=[?"'\x60)\\s<>]|$)`,'g');
  body=body.replace(full,(_,prefix)=>prefix+row.url);
  if(path.posix.dirname(row.original)===folder){
   const name=path.posix.basename(row.original);
   const local=new RegExp(`(^|["'\x60(=\\s])(?:\\./)?${escaped(name)}(?=[?"'\x60)\\s<>]|$)`,'g');
   body=body.replace(local,(_,prefix)=>prefix+row.url);
  }
 }
 if(body!==original){await writeFile(file,body);changed.push(rel);}
 // Compilations currently have literal URLs. Flag any future template expression
 // that constructs a reel URL so a packaging change cannot silently break it.
 if(path.extname(file)==='.js'||path.extname(file)==='.mjs'){
  for(const token of body.matchAll(/`([^`]*reel[^`]*\.mp4[^`]*)`/g))if(token[1].includes('${'))dynamicCandidates.push({file:rel,expression:token[1]});
 }
 for(const row of replacements)if(body.includes(row.original))throw Error(`尚有未改写的合集路径：${rel} -> ${row.original}`);
}
if(dynamicCandidates.length)throw Error(`出现动态合集链接，需显式处理：${JSON.stringify(dynamicCandidates)}`);

// Only now remove verified Release copies from the D: static output.
for(const file of reelFiles){
 const original=slash(path.relative(web,file));
 const row=assets.find(a=>a.originals.includes(original));
 if(!row||hash(await readFile(path.join(releaseDir,row.asset)))!==row.sha256)throw Error(`拒绝移除没有已验证备份的合集：${original}`);
 await unlink(file);
}

// esbuild leaves old hashed chunks in an existing output directory. Follow the
// current entry imports recursively; do not touch movie directories or assets.
const reachable=new Set(),queue=['app.js','app.css'];
while(queue.length){
 const rel=queue.pop();if(reachable.has(rel))continue;
 const file=path.join(web,rel);let body;
 try{body=await readFile(file,'utf8');}catch(error){if(error.code==='ENOENT')throw Error(`当前代码入口缺失：${rel}`);throw error;}
 reachable.add(rel);
 for(const match of body.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)(["'])([^"']+\.(?:js|css))(?:\?[^"']*)?\1/g)){
  const target=match[2];if(/^(?:https?:|data:|\/)/.test(target))continue;
  const next=path.posix.normalize(path.posix.join(path.posix.dirname(rel),target));
  if(next.startsWith('../'))throw Error(`代码分包越出站点：${next}`);
  if(next.startsWith('chunks/'))queue.push(next);
 }
}
const removedChunks=[];
for(const file of await files(path.join(web,'chunks'))){
 const rel=slash(path.relative(web,file));
 if(!reachable.has(rel)){removedChunks.push({file:rel,bytes:(await stat(file)).size});await unlink(file);}
}
const after=await sizeOf(web);
const report={date:new Date().toISOString(),tag,before,after,uniqueReels:assets.length,reelPaths:replacements.length,releaseBytes:assets.reduce((n,a)=>n+a.bytes,0),removedReelFilesThisRun:reelFiles.length,changedTextFiles:changed,removedChunks,reachableCode:[...reachable].sort(),dynamicCandidates,checks:{releaseCopiesSha256:true,allIndividualFilmsAndPostersRetained:true,unrewrittenReelPaths:0},manifest:'web/pages-media-019.json',uploadManifest:'发布目录外release-assets/upload-manifest.json'};
await mkdir(path.dirname(reportFile),{recursive:true});
await writeFile(reportFile,JSON.stringify(report,null,2));
console.log(JSON.stringify({before,after,uniqueReels:assets.length,reelPaths:replacements.length,releaseBytes:report.releaseBytes,removedChunks:removedChunks.length,changedTextFiles:changed.length,uploadManifest:path.join(releaseDir,'upload-manifest.json')},null,2));
