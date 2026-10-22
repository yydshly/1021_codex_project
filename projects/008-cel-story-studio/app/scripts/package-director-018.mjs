import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {existsSync} from 'node:fs';
import {mkdir,cp,copyFile,readFile,writeFile,readdir,lstat,rm,rename,open} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {deflateRawSync} from 'node:zlib';
import {defaultFlagship,validateFlagship} from './flagship-schema.mjs';

const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const project=path.dirname(app),web=path.join(project,'web');
const skill=path.join(project,'skills/mg-story-director');
const output=path.join(web,'director-kit-018'),archive=path.join(web,'director-kit-018.zip');
const portable='assets/demo-project';
const slash=value=>value.split(path.sep).join('/');
const skip=new Set(['node_modules','.cache','.git','out']);
const safeChild=(base,target)=>{const resolved=path.resolve(target),relative=path.relative(path.resolve(base),resolved);if(!relative||relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))throw new Error(`路径超出预定目录：${resolved}`);return resolved;};

async function files(folder){
 const result=[];
 for(const item of (await readdir(folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
  if(skip.has(item.name))continue;
  const filename=path.join(folder,item.name),info=await lstat(filename);
  if(info.isSymbolicLink())throw new Error(`分发包不接收符号链接：${filename}`);
  if(info.isDirectory())result.push(...await files(filename));else if(info.isFile())result.push(filename);
 }
 return result;
}

const required=[
 [path.join(app,'src/flagship'),'src/flagship'],
 [path.join(app,'scripts/flagship-schema.mjs'),'scripts/flagship-schema.mjs'],
 [path.join(app,'scripts/flagship-schema.d.mts'),'scripts/flagship-schema.d.mts'],
 [path.join(app,'public/director-018'),'public/director-018'],
 [path.join(app,'public/paper.jpg'),'public/paper.jpg'],
 [path.join(app,'public/NotoSansSC.ttf'),'public/NotoSansSC.ttf'],
 [path.join(app,'public/OFL.txt'),'public/OFL.txt'],
 [path.join(project,'UPSTREAM-LICENSE.txt'),'UPSTREAM-LICENSE.txt'],
 [path.join(project,'assets/review-018/image-generation.json'),'ASSET-GENERATION.json'],
 [path.join(app,'node_modules/remotion/LICENSE.md'),'REMOTION-LICENSE.md'],
];

export async function checkDirectorPackage(){
 const missing=[...required.map(([src])=>src),path.join(skill,'SKILL.md'),path.join(skill,portable,'render.mjs'),path.join(skill,portable,'src/index.tsx'),path.join(app,'src/flagship/FlagshipFilm.tsx')].filter(filename=>!existsSync(filename));
 for(const name of ['react','react-dom','scheduler'])if(!existsSync(path.join(app,'node_modules',name,'LICENSE')))missing.push(path.join(app,'node_modules',name,'LICENSE'));
 if(missing.length)throw new Error('最终源码或素材尚未准备齐全，未打包：\n'+missing.map(filename=>slash(path.relative(project,filename))).join('\n'));
 const directorFiles=await files(path.join(app,'public/director-018'));
 if(!directorFiles.length)throw new Error('director-018 素材目录为空，未打包。');
 const sourceFiles=await files(path.join(app,'src/flagship'));
 const allowedModules=new Set(['react','react/jsx-runtime','remotion']);
 for(const filename of sourceFiles.filter(filename=>/\.(?:tsx?|m?js)$/.test(filename))){
  const source=await readFile(filename,'utf8');
  for(const match of source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){
   const specifier=match[1];
   if(!specifier.startsWith('.')){if(!allowedModules.has(specifier))throw new Error(`独立项目需要补充依赖 ${specifier}（${path.basename(filename)}）`);continue;}
   const resolved=path.resolve(path.dirname(filename),specifier);
   const candidates=[resolved,...['.ts','.tsx','.js','.mjs'].map(ext=>resolved+ext),path.join(resolved,'index.ts'),path.join(resolved,'index.tsx')];
   const target=candidates.find(candidate=>existsSync(candidate));
   if(!target)throw new Error(`源码引用不存在：${specifier}（${path.basename(filename)}）`);
   const inActors=path.relative(path.join(app,'src/flagship'),target);
   if(inActors==='..'||inActors.startsWith('..'+path.sep)||path.isAbsolute(inActors)){
    if(!['flagship-schema.mjs','flagship-schema.d.mts'].map(name=>path.join(app,'scripts',name)).includes(target))throw new Error(`源码依赖未纳入最小包：${specifier}（${path.basename(filename)}）`);
   }
  }
  for(const match of source.matchAll(/staticFile\(\s*['"]([^'"]+)['"]/g)){
   if(!(match[1].startsWith('director-018/')||['paper.jpg','NotoSansSC.ttf'].includes(match[1])))throw new Error(`需明确收集新素材：${match[1]}`);
   if(!existsSync(path.join(app,'public',match[1])))throw new Error(`影片引用素材缺失：${match[1]}`);
  }
 }
 const pkg=JSON.parse(await readFile(path.join(skill,portable,'package.json'),'utf8'));
 for(const [name,version] of Object.entries(pkg.dependencies))if((name==='remotion'||name.startsWith('@remotion/'))&&version!=='4.0.537')throw new Error('Remotion 依赖必须统一固定为4.0.537。');
 validateFlagship(defaultFlagship());
 return {sourceFiles:sourceFiles.length,assetFiles:directorFiles.length,composition:'FlagshipFilm',remotion:'4.0.537'};
}

const crcTable=Uint32Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
const crc32=buffer=>{let c=0xffffffff;for(const byte of buffer)c=crcTable[(c^byte)&255]^(c>>>8);return (c^0xffffffff)>>>0;};

// A ZIP32 archive with UTF-8 names and DEFLATE needs no platform-specific CLI.
// Exported so its output can be checked with an independent ZIP reader.
export async function createDirectorZip(folder,destination){
 const entries=await files(folder);if(entries.length>65535)throw new Error('分发文件数量超出ZIP32范围。');
 const handle=await open(destination,'w');let offset=0;const central=[];
 const append=async data=>{await handle.writeFile(data);offset+=data.length;if(offset>0xffffffff)throw new Error('分发包超出ZIP32范围。');};
 try{
  for(const filename of entries){
   const info=await lstat(filename),raw=await readFile(filename),packed=deflateRawSync(raw);
   if(raw.length>0xffffffff||packed.length>0xffffffff)throw new Error('单文件超出ZIP32范围。');
   const name=Buffer.from(`mg-story-director/${slash(path.relative(folder,filename))}`,'utf8');
   const date=info.mtime,year=Math.max(1980,Math.min(2107,date.getFullYear()));
   const dosTime=date.getHours()<<11|date.getMinutes()<<5|Math.floor(date.getSeconds()/2),dosDate=(year-1980)<<9|(date.getMonth()+1)<<5|date.getDate(),crc=crc32(raw),start=offset;
   const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x0800,6);local.writeUInt16LE(8,8);local.writeUInt16LE(dosTime,10);local.writeUInt16LE(dosDate,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(packed.length,18);local.writeUInt32LE(raw.length,22);local.writeUInt16LE(name.length,26);
   await append(local);await append(name);await append(packed);
   const header=Buffer.alloc(46);header.writeUInt32LE(0x02014b50);header.writeUInt16LE(20,4);header.writeUInt16LE(20,6);header.writeUInt16LE(0x0800,8);header.writeUInt16LE(8,10);header.writeUInt16LE(dosTime,12);header.writeUInt16LE(dosDate,14);header.writeUInt32LE(crc,16);header.writeUInt32LE(packed.length,20);header.writeUInt32LE(raw.length,24);header.writeUInt16LE(name.length,28);header.writeUInt32LE(start,42);
   central.push(header,name);
  }
  const centralStart=offset;for(const data of central)await append(data);
  const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(offset-centralStart,12);end.writeUInt32LE(centralStart,16);await append(end);
 }finally{await handle.close();}
}

export async function packageDirector(){
 const checked=await checkDirectorPackage();
 safeChild(web,output);safeChild(web,archive);
 const cache=path.join(app,'.cache'),stage=safeChild(cache,path.join(cache,`director-kit-stage-${randomUUID()}`));
 const zipTemp=safeChild(cache,path.join(cache,`director-kit-${randomUUID()}.zip`));
 await mkdir(cache,{recursive:true});
 try{
  await cp(skill,stage,{recursive:true,filter:filename=>!path.relative(skill,filename).split(path.sep).some(part=>skip.has(part))});
  const demo=path.join(stage,portable);
  for(const [src,relative] of required){const dest=safeChild(demo,path.join(demo,relative));await mkdir(path.dirname(dest),{recursive:true});if((await lstat(src)).isDirectory())await cp(src,dest,{recursive:true});else await copyFile(src,dest);}
  await writeFile(path.join(demo,'default-config.json'),JSON.stringify(defaultFlagship(),null,2));
  const notices=[];for(const name of ['react','react-dom','scheduler'])notices.push(`${name}\n${await readFile(path.join(app,'node_modules',name,'LICENSE'),'utf8')}`);
  await writeFile(path.join(demo,'THIRD-PARTY-NOTICES.txt'),notices.join('\n\n---\n\n'));
  const manifest=[];for(const filename of await files(stage)){const data=await readFile(filename);manifest.push({path:slash(path.relative(stage,filename)),bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
  await writeFile(path.join(stage,'package-manifest.json'),JSON.stringify({format:1,createdAt:new Date().toISOString(),assetPack:'ink-whale-018',...checked,files:manifest},null,2));
  await createDirectorZip(stage,zipTemp);
  await mkdir(web,{recursive:true});
  // Both recursive targets are verified children of the explicitly named output
  // and cache folders before replacing artifacts owned by this packaging script.
  await rm(safeChild(web,output),{recursive:true,force:true});await rename(stage,output);
  await copyFile(zipTemp,archive);
  console.log(`已生成 ${output}\n已生成 ${archive}\n完整运行与审片需另行执行；打包成功不等于影片质量已通过。`);
 }finally{
  await rm(safeChild(cache,stage),{recursive:true,force:true});await rm(safeChild(cache,zipTemp),{force:true});
 }
}

if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
 const args=process.argv.slice(2);
 if(args.length===1&&args[0]==='--check')console.log('只读预检通过：',await checkDirectorPackage());
 else if(args.length===0)await packageDirector();
 else throw new Error('用法：node scripts/package-director-018.mjs [--check]');
}
