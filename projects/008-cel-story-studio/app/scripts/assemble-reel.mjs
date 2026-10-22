import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const items=JSON.parse(await readFile(path.join(project,'assets/styles-renders.json'),'utf8'));
const list=path.join(project,'app/.cache/styles-list.txt');
await writeFile(list,items.map(r=>`file '${path.join(project,'web',r.video).replaceAll('\\','/').replaceAll("'","'\\''")}'`).join('\n'));
const result=spawnSync('ffmpeg',['-nostdin','-y','-v','error','-f','concat','-safe','0','-i',list,
  '-vf','setpts=N/(24*TB)','-af','asetpts=N/SR/TB','-t',String(items.length*3),
  '-c:v','libx264','-preset','veryfast','-crf','21','-c:a','aac','-movflags','+faststart',path.join(project,'web/all-styles.mp4')],{stdio:'inherit',windowsHide:true});
if(result.status!==0)throw new Error('风格连播合成失败；请确认 FFmpeg 已安装。');
console.log(`Assembled ${items.length} styles / ${items.length*3} seconds`);
