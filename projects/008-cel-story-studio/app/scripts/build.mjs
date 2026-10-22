import {build} from 'esbuild';
import {mkdir,copyFile,cp,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {capabilityStyles,components,recommendedRecipe} from './capabilities.mjs';
import {effectTemplates} from './effects.mjs';
import './build-craft-review-014.mjs';
import './build-material-review-015.mjs';
import './build-quality-review-016.mjs';
import './build-performance-review-017.mjs';
import './build-director-notes-018.mjs';
import {publishSummary019} from './publish-summary-019.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.resolve(root,'../web');
await mkdir(out,{recursive:true});
await build({entryPoints:[path.join(root,'src/App.tsx')],outdir:out,entryNames:'app',chunkNames:'chunks/[name]-[hash]',splitting:true,bundle:true,minify:true,format:'esm',platform:'browser',define:{'process.env.NODE_ENV':'"production"'},target:['chrome110']});
await copyFile(path.join(root,'../assets/review-012/generated-assets.json'),path.join(root,'public/effects/generated-assets-012.json'));
await copyFile(path.join(root,'index.html'),path.join(out,'index.html'));
await cp(path.join(root,'public'),out,{recursive:true});
// Keep the original fifteen examples available in the studio's static export.
// Reuse the verified research site, including local media and its MIT/OFL notices.
const referenceOut=path.join(out,'reference-effects');
await cp(path.resolve(root,'../../004-mg-styles-explorer/web'),referenceOut,{recursive:true});
const referenceIndex=path.join(referenceOut,'index.html');
const referenceHtml=await readFile(referenceIndex,'utf8');
await writeFile(referenceIndex,referenceHtml.replace('<nav aria-label="主导航">','<nav aria-label="主导航"><a href="../#overview">返回研究总结 ↗</a><a href="../#styles">风格模板与编辑 ↗</a>'));
const library={version:1,description:'本项目的风格表达规则、可运行组件与扩展储备；原作作为研究依据，基础画法均为探索原型。',styles:capabilityStyles,components};
await writeFile(path.join(out,'capability-library.json'),JSON.stringify(library,null,2));
await writeFile(path.join(out,'effect-library.json'),JSON.stringify({version:1,description:'0.19汇总归档的十五套独立模板。各有素材、事件与引擎边界；五类有两套故事，三类可在已有事件内由AI编排。原作、历史成片与质量余项保留，研究结论见RESEARCH-SUMMARY.md。',templates:effectTemplates},null,2));
const effectGuide=['# 十五种独立效果模板\n','当前0.17重做手绘、形变与玻璃，各两套故事。0.16线条与科普的两套故事继续保留。工作台选择故事方案后可继续编辑并导出；配置使用可选storyId。有限资产，不是任意故事自动生成。详见PERFORMANCE-017.md与production-notes-017.html；十五项缺口依据见QUALITY-016.md。\n',"第十五版进一步重做液态与HUD，详见MATERIALS-015.md；其他十三支保持0.14。第十四版制作记录：手绘《借一点风》、形变《把晴天放飞》、包豪斯《纸上游乐场》、线条《把海写成星空》、液态《流动的桥》重新组织原画和事件；拼贴、花字、科普补材料关系与完整剪辑；3D/2.5D/霓虹/像素/HUD逐项补前段识别、机位、接片、表演与状态。十五项保留本轮修改前的0.13工作台快照。作品成立与否以实际影片和审片为依据，不用测试数量或评分代替。进入production-notes-014.html看原作/修改前/本轮三版对照与方法总结。3D默认使用Cycles材质成片，修改材质重新离线渲染；液态014改为实时三维SDF曲面，不再调用旧三球圆环的Cycles缓存。\n",'## 统一复用接口\n','`{kind:"effect-template", version:1, style, title, subtitle, words, primary, secondary, count, intensity, detail, seed, duration, sound?, shots?}`。文字、颜色、节点与种子是数据，不能执行代码或指定外部路径。`count` 3–14，`intensity/detail` 0–1，`seed` 1–9999，`duration` 4–20 秒，输出 1280×720 / 30 FPS MP4。新配置默认带原创合成配乐，可关闭；旧配置没有 sound 时保持无声。每个模板用自己的参数含义解释三个数值。支持保存、导入、浏览器草稿、保留内容跨模板切换，以及取用当前故事的标题与字幕节点；霓虹、像素、HUD新增 `shots:[{id,action,seconds,caption,framing}]`，全片4–20秒、每镜0.5–8秒、总和须匹配duration。`POST /api/effects/plan`使用现有本机AI，仅在当前资产的动作词表内编排，方案审阅后应用；尚无任意模型生成。其他十二模板仍未连接完整故事动作。\n','## 原作到工作台的对应\n',...effectTemplates.map(s=>`### ${s.name} · ${s.id}\n\n- 原作：[${s.slug}](${s.source.repository}/tree/${s.source.commit}/demos/${s.slug})\n- 设计机制：${s.features}。${s.principle}\n- 我们的实现：${s.engine}\n- 可调用模块：${s.modules.join('、')}\n- 参数：${s.controls.join(' / ')}\n- 使用价值与场景：${s.useCases}\n- 来源关系：${s.source.relationship}\n- 当前边界：${s.boundary}\n- 扩展方向（尚未实现）：${s.next}\n- 新内容实际样片：[MP4](web/effect-examples/${s.id}.mp4) · [配置](web/effect-examples/${s.id}.json)\n`),'## 扩展方法\n','1. 在 `app/scripts/effects.mjs` 添加视觉机制、参数契约、默认内容、来源与边界。\n2. 可复用渲染入口为 `app/src/effects/EffectScene.tsx`；本轮Canvas分发在 `canvas-v3.ts`，各风格独立影片在 `*-film-014.ts`，等点数轮廓与循环匹配在 `geometry.ts`，机械微缩世界在 `isometric-film.ts`，霓虹与HUD在 `neon-film-014.ts` / `hud-film-014.ts`，像素新片在 `pixel-film-014.ts`；镜头契约在 `film-program.mjs`，其余三维场景在 `three-v3.ts`，液体SDF在 `liquid-film-014.ts`、完整场景折射在 `prism-film-014.ts`。\n3. 在结构化参数边界内加入品牌图形、素材组、产品数据或字幕时间轴，再增加对应控件；外部资产导入需要独立的尺寸、授权和路径约束，目前没有开放。\n4. 复用原理继续添加组件时，同时实现参数、预览与导出；本轮 Blender 入口为 magnetic-scene-014.py / studio-render.mjs（liquid-scene.py仅保留历史工艺）（旧 studio-scene.py 保留），任务有材质渲染与合成阶段；后续加入流体物理时，也应新增引擎和任务状态，不得把二维近似标成原生三维。\n5. 运行 `npm run typecheck`、`npm test`、`npm run build`，再用 `npm run render:effects` 生成十五份默认片和内容/参数/运动对照帧。\n','## 技术边界\n','这里是十五个可复用的效果模板，覆盖对应设计机制，不是源作全部影片代码和全部工艺的等价移植。已接入原创三维场景的 Cycles 渲染；软体解算、完整字形建模、任意故事的自动风格化、自由资产上传与语音字幕仍需后续扩展。完整来源与素材声明见 `app/public/effects/CREDITS.md`。\n'].join('\n');
await writeFile(path.join(root,'../EFFECT-TEMPLATES.md'),effectGuide);
await writeFile(path.join(out,'EFFECT-TEMPLATES.md'),effectGuide.replaceAll('](web/',']('));
const guide=['# 风格能力库\n','以故事表达为目标，沉淀视觉语言、运动方法和可复用组件。15 种基础画法均为探索原型；下列扩展项尚未实现。\n','## 工作台复用\n','打开「风格能力库」→ 研究风格 → 采用推荐组合或只切换基础画法 → 选择共享组件、调整强度 → 预览并导出。组合可以保存到本浏览器，完整故事 JSON 同时保存 recipe；载入故事会保留组合，导入配置则恢复该配置自己的组合。AI 创作接收表达规则与选定组件，不得自行更换组合。\n',`配置示例：\n\n\`\`\`json\n${JSON.stringify({style:'cel-boil',recipe:recommendedRecipe('cel-boil')},null,2)}\n\`\`\`\n`,'每个故事最多 6 个附加组件，强度为 0–1。未提供 recipe 的旧故事保持原有表现；不执行模型生成的代码。\n','## 可执行组件\n',...components.map(c=>`### ${c.name} · ${c.id}\n\n- 状态：已接入；${c.engine}\n- 原理：${c.principle}\n- 价值：${c.value}\n- 边界：${c.scope}\n`),'## 十五种风格储备\n',...capabilityStyles.map(s=>`### ${s.name}\n\n- 成熟度：${s.maturity}\n- 设计原理：${s.principle}\n- 表达价值：${s.expression}\n- 使用场景：${s.useCases}\n- 视觉语言：${s.dna.join('；')}\n- 可复用组件：${s.modules.map(id=>components.find(c=>c.id===id).name).join('、')}\n- 当前实现：${s.implementation}；${s.scope}\n- 表达时避免：${s.avoid}\n- 待扩展：${s.next.join('；')}\n- 研究来源：[上游源码](${s.source.repository}/tree/${s.source.commit}/demos/${s.slug})，MIT。\n`)].join('\n');
await writeFile(path.join(root,'../STYLE-CAPABILITIES.md'),guide);
await writeFile(path.join(out,'STYLE-CAPABILITIES.md'),guide);
await copyFile(path.join(root,'../UPSTREAM-LICENSE.txt'),path.join(out,'UPSTREAM-LICENSE.txt'));
await copyFile(path.join(root,'node_modules/remotion/LICENSE.md'),path.join(out,'REMOTION-LICENSE.md'));
const notices=[];
for(const name of ['react','react-dom','scheduler','simplex-noise','three']){
  notices.push(`${name}\n${await readFile(path.join(root,'node_modules',name,'LICENSE'),'utf8')}`);
}
await writeFile(path.join(out,'THIRD-PARTY-NOTICES.txt'),notices.join('\n\n---\n\n'));
await publishSummary019(root,out);
console.log(`Built ${out}`);
