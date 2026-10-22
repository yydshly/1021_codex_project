import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateStory} from './input-schema.mjs';
import {compileWorld,worldPose} from './world-runtime.mjs';
const results=[];
for(const name of ['rabbit','robot','fox','water']){
  const raw=JSON.parse(await readFile(new URL(`../../web/world-examples/${name}.json`,import.meta.url),'utf8'));
  const story=validateStory(raw),timeline=compileWorld(story.shots,story.world,true);
  const curves=timeline.flatMap(shot=>shot.cast.filter(c=>c.action==='perform').map(c=>{
    const samples=[0,.25,.5,.75,1].map(t=>worldPose(c,t,Math.round(t*24)));
    if(!samples.every(p=>Object.values(p).every(Number.isFinite)))throw new Error('Non-finite pose');
    return {gesture:c.gesture,keyframes:c.motion.length,effect:c.effect,samples};
  }));
  results.push({name,title:story.title,frames:timeline.at(-1).to,sound:story.sound,
    characterNames:story.world.characters.map(c=>c.name),sceneNames:story.world.scenes.map(s=>s.name),objectNames:story.world.objects.map(o=>o.name),
    geometryHash:createHash('sha256').update(JSON.stringify(story.world)).digest('hex'),
    stateTrace:timeline.map(s=>({scene:s.sceneId,from:s.from,to:s.to,before:s.objectsBefore,after:s.objectsAfter})),curves,
    ai:{provider:raw.creative.provider,generatedAt:raw.creative.generatedAt},
  });
}
process.stdout.write(JSON.stringify(results));
