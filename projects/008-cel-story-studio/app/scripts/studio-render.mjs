import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function blenderPath(){return [process.env.BLENDER_PATH,path.join(root,'.cache/blender/blender-4.5.14-windows-x64/blender.exe'),'C:/Program Files/Blender Foundation/Blender 4.5/blender.exe'].find(p=>p&&existsSync(p));}
export async function renderStudio(config,folder,onProgress=()=>{}){
 const executable=blenderPath();if(!executable)throw new Error('三维成片需要 Blender 4.5+。请通过 BLENDER_PATH 指定 blender.exe 后重启服务。网页快速预览仍可使用。');
 await mkdir(folder,{recursive:true});const configFile=path.join(folder,'config.json');await writeFile(configFile,JSON.stringify(config));
 await new Promise((resolve,reject)=>{
  const child=spawn(executable,['-b','--factory-startup','-t','4','-P',path.join(root,config.style==='liquid'?'scripts/liquid-scene.py':'scripts/magnetic-scene-014.py'),'--','--config',configFile,'--out',folder,'--samples',config.style==='liquid'?'256':'96'],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let pending='',tail='';child.stdout.on('data',chunk=>{pending+=chunk.toString();const lines=pending.split(/\r?\n/);pending=lines.pop()||'';for(const line of lines){const m=/STUDIO_FRAME\s+(\d+)/.exec(line);if(m)onProgress((Number(m[1])+1)/(config.duration*30));}tail=(tail+chunk).slice(-2500);});
  child.stderr.on('data',d=>{tail=(tail+d).slice(-2500);});child.on('error',reject);child.on('close',code=>code===0&&existsSync(path.join(folder,`${String(Math.round(config.duration*30)-1).padStart(4,'0')}.jpg`))?resolve():reject(new Error(`Cycles 渲染未完成：${tail}`)));
 });
}
