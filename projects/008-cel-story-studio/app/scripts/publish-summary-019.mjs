import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
/** Publish only the research documents and non-sensitive evidence linked by the summary. */
export async function publishSummary019(app,out){
 const project=path.dirname(app);
 const docs=['RESEARCH-SUMMARY.md','NEXT-VIDEO.md','PAGES-PUBLICATION-019.md','DIRECTOR-018.md','PERFORMANCE-017.md','QUALITY-016.md','MATERIALS-015.md','CRAFT-014.md','RECRAFT-013.md','RECRAFT-012.md','HERO-RECRAFT-011.md','notes.md'];
 const proof=['media.json','browser-playback.json','portable-proof.json','art-review.md','image-generation.json'];
 await mkdir(path.join(out,'research-evidence-018'),{recursive:true});
 for(const name of proof)await copyFile(path.join(project,'assets/review-018',name),path.join(out,'research-evidence-018',name));
 await mkdir(path.join(out,'research-evidence-019'),{recursive:true});
 await copyFile(path.join(project,'assets/review-019/verification.json'),path.join(out,'research-evidence-019/verification.json'));
 const source='https://github.com/yydshly/1021_codex_project/blob/main/projects/008-cel-story-studio/';
 const normalize=s=>s.replaceAll('](web/','](').replaceAll('](app/public/','](').replaceAll('](skills/mg-story-director/SKILL.md)','](director-kit-018/SKILL.md)').replaceAll('](../004-mg-styles-explorer/README.md)','](reference-effects/index.html)').replaceAll('](assets/review-018/','](research-evidence-018/').replaceAll('](assets/review-019/','](research-evidence-019/').replaceAll('](assets/capability-map-019/','](research-map-019/').replace(/\]\((README\.md|start-workbench\.cmd)(#[^)]*)?\)/g,(_,name,anchor)=>`](${source}${name}${anchor||''})`);
 for(const name of docs)await writeFile(path.join(out,name),normalize(await readFile(path.join(project,name),'utf8')));
}
