# 0.13：三套原创短片与可执行镜头编排

本轮集中重做此前较弱的霓虹、像素与 HUD。三项均更换题材、主体资产、事件线和声音，不再沿用列车、雨巷狐狸或月球场景调整参数。其余十二项保留现有成片。本记录说明实际实现、复现方法和仍存在的美术边界，不将程序检查通过作为作品优秀的评分。

参考来源仍是 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，固定研究提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`，MIT。保留其风格机制与原作研究页，没有复制源作题材、完整分镜、影片、角色、模型或配乐。

## 三支完整作品

| 风格与影片 | 四幕事件 | 本项目新增资产与实现 |
| --- | --- | --- |
| 霓虹《午夜频率》 | 磁芯苏醒 → 音轨展开 → 穿越频率舱 → 完整装置收束 | 原创机械磁带、双转轴与传输轮、磁头、铭牌、实体金属磁带、双边霓虹、频率门框；Three.js、平面反射、Bloom 与 4×MSAA |
| 像素《月亮修理铺》 | 接住碎月 → 工作台补月 → 星光升空 → 城市亮灯 | 原创猫机械师、碎月与补月姿态、屋顶工坊、工具台、像素城市、招牌与星屑；320×180 画布、整数像素取景、最近邻放大 |
| HUD《深蓝回声》 | 声呐寻迹 → 翼骨扫描 → 脊线解码 → 机械蝠鲼舒翼 | 原创机械蝠鲼、分层翼骨与翼面、海沟、探测光场、扫描切面、能量分流和同步 HUD；Three.js 与 Canvas 仪表叠加 |

三片均为 10 秒、1280×720、30 FPS 的完整作品，最终文件为 `web/effect-examples/{synthwave,pixel,hud}.mp4`，对应 JPG 与 JSON 同目录。九张网页关键画面均从最终 MP4 的精确帧提取，不使用独立设计图冒充成片。

观看入口：

- [30 秒三支新作](https://github.com/yydshly/1021_codex_project/releases/download/mg-styles-research-019/mg019-effect-examples--trio-reel-013.mp4)。
- [150 秒十五支完整作品集](https://github.com/yydshly/1021_codex_project/releases/download/mg-styles-research-019/mg019-effect-examples--quality-reel.mp4)。
- [45 秒十五种风格精选](https://github.com/yydshly/1021_codex_project/releases/download/mg-styles-research-019/mg019-effect-examples--after-hours-reel.mp4)。
- 本地工作台：<http://127.0.0.1:8048/#effects-design>；进入编辑可用 `#effects/synthwave`、`#effects/pixel`、`#effects/hud`。

## 画面审查与修订

先对照源库三项原作的四个时点，再检查本项目三片在开场、接片两侧、高潮和片尾的最终视频帧。逐项结论与实际接帧图见 [美术审片记录](assets/review-013/art-review.md)。审查未试听音轨，不将抽帧等同于逐帧检查或全片声画验收。

本轮修订包括：

- 霓虹首版存在过曝、光晕泛白、磁带过细；降低白光和 Bloom，强化实体金属带。穿越段原有镜像碎片、侧向空场和缺少消失点的问题，改为独立频率舱、连续圆角门框、双条实体导轨与真实前进镜头。
- 像素调整接月取景和字幕位置，保证猫脸与承接动作可辨；升空镜头保留完整 “MOON” 招牌，结尾回到月亮、工坊与亮窗的完整构图。
- HUD 增加蓄势、舒翼、抬头侧倾、浮升与尾迹；调整翼尖取景和粒子尺寸，避免结尾主体误裁与大面积泛白，仪表响应同一动作状态。

仍有具体可提升处：霓虹装置与频率舱之间采用硬切，空间转场的连续性和高潮构成可以更丰富；像素举锤接触、反应停顿与亮灯传播可以更明确；HUD 翼端延迟、薄片弯曲和近景材料仍有程序几何感。不能据本轮三片抽查，宣称十五种风格已达到相同水平或全面超过源作。

## 工作台新增的创作能力

霓虹、像素、HUD 各自拥有四个真实可执行事件，共十二项动作。工作台可以编排 2–8 个镜头，增删、复制、重排，选择事件、全景／近景、字幕和逐镜时长。每镜 0.5–8 秒，以 0.5 秒递增；总片长为 4–20 秒。改变事件会切换主体行为，改变取景会改变实际画面；修改字幕只改变文字。

镜头使用 `shots` 数据，与影片标题、配色、几何参数、种子、声音共同保存。预览、Remotion 导出和声音编排读取同一配置。默认十秒影片仍是四镜各 2.5 秒；改变总时长时按有界半秒刻度重分配。自由重排可能改变故事因果，可恢复原创分镜。

相邻镜头选择同一动作时，共享一段连续事件进度和声音，不会在切换取景时重新开始。例如连续两镜“补月”可分别用全景、近景观察同一次修补，月亮不会因切镜重新碎裂；镜头编号、字幕、取景与各自时长仍独立。这是相邻同动作的连续性，不是任意不同动作之间的通用世界状态追踪；把修补放在接月之前等不合理编排，仍需创作者审看。

新增交互包括：

- 可跳转的镜头时间线，以及相邻的实时画面与镜头设置。
- 最近 40 步撤销／重做。
- 最多 12 份本浏览器作品草稿；满额后阻止新增，保留已有作品。
- 完整 JSON 保存／导入；载入旧配置时不会继承另一份配置的镜头。
- 源库风格对照、当前完整影片与上一版对比，继续独立于编辑草稿。

旧版合法配置仍能预览和导出。旧配置若没有 `shots`，渲染端使用本风格默认事件并按原时长映射；非半秒刻度的旧片长不被自动覆盖，开启逐镜编辑前需明确对齐。完全未编辑的 0.12 默认效果可迁移到新片；自定义标题、参数、时长与静音选项保留。故事世界与效果草稿继续分别保存。

## AI 在这里实际做什么

本地服务新增 `POST /api/effects/plan`。用户提交创意和当前效果配置，真实本机 Codex 返回标题、短句、创意解释与 2–8 镜头方案；动作限定在当前资产组的词表，服务校验动作、取景、字幕、时长与总时长。合规镜头的总时长可以做有限修复，不能用修时机制放行不存在的动作。

方案生成后先显示待应用内容，不自动覆盖当前作品。用户应用时替换标题、镜头与总时长，并保留当前配色、种子、画面参数和声音设置。支持取消；切换风格或离开导演面板时取消相应待完成任务，迟到的提交结果也不写入已卸载的面板。

浏览器已实际完成像素方案生成、方案审阅、应用、草稿保存恢复与最终导出：6 镜、10 秒。相邻三镜补月连续性经实际导出接帧检查，2.5 与 4.5 秒没有重新碎裂。另通过网页导出 6 秒静音霓虹与 8 秒有声 HUD。三支新版及各自0.12旧片均完整播放至结束，30秒合集播放至结束，九张新关键帧加载；原有《阳台上的小花》、小禾五镜12秒与原效果草稿保留。证据见 `assets/review-013/browser.json`、`verification.json`、`custom-exports.json` 和 `ai-export.json`。

可直接查看实际网页产物：[AI 六镜补月](web/director-examples/ai-moon-story.mp4)（[配置](web/director-examples/ai-moon-story.json)）、[六秒静音霓虹](web/director-examples/neon-edit.mp4)、[八秒 HUD](web/director-examples/hud-edit.mp4)。这些是自定义编排验证片，不代替三支默认完整作品。

HUD 首次自定义导出在第184帧触发33秒等待超时。网页的组合选择与逐帧导出等待统一为90秒，与已有影片渲染脚本一致；用完全相同配置重试后完成240帧并全解码通过。这证明该配置现可完成导出，没有据此认定所有GPU停顿原因均已排除；长任务预热、资源竞争与任务恢复仍可继续优化。

AI 当前是在三套既有资产和可执行事件之间创作，不能根据任意故事自由生成新的三维角色、机械模型、精灵表或场景。其他十二项仍是参数化模板；原有 AI 故事世界是保留的独立路径。

## 声音随事件编排

`app/scripts/make-trio-scores-013.py` 生成 15 个原创声音文件：3 条独立音乐床和 12 条动作音效。全部由确定性代码合成，复用本项目 `make-hero-scores.py` 的混音工具；没有录音采样、现成曲目或外部声音素材。

音乐床为十秒；每条动作音效基准长 2.5 秒。`EffectScene` 中的 `ProgramAudio` 与 `programSegments` 按连续动作段安排音效，并映射到当前段的总时长；相邻同动作不因切镜重新触发声音。重排动作后不会继续播放旧片的固定事件顺序。文件为双声道、44.1 kHz、16-bit PCM；响度、真峰值、包络与文件哈希见 [声音技术记录](assets/review-013/scores.json)。这些信号检查不等同于人工试听评价。

## 版本对比与保留

0.12 的三份 MP4、JPG、JSON 已归档到 `web/quality-before-013/`，共九文件，SHA-256 记录在 [保留清单](assets/review-013/preserved-before.json)。放映窗口可直接切换上一版。更早的 `quality-before-012/`、`quality-before-011/`、`quality-before/` 和源库参考页继续保留。

本轮更新 30／150／45 秒三种连播；此前 [60 秒 0.12 连播](https://github.com/yydshly/1021_codex_project/releases/download/mg-styles-research-019/mg019-effect-examples--recraft-reel.mp4)和 [20 秒 0.11 双片](https://github.com/yydshly/1021_codex_project/releases/download/mg-styles-research-019/mg019-effect-examples--hero-reel.mp4)保持，核对结果在 [媒体报告](assets/review-013/media.json)。历史制作记录：[0.12](RECRAFT-012.md)、[0.11](HERO-RECRAFT-011.md)、[0.10](COLLECTION-CRAFT.md)。

## 代码入口与复现

| 层次 | 主要入口 |
| --- | --- |
| 三套画面 | `app/src/effects/neon-film-013.ts`、`pixel-film-013.ts`、`hud-film-013.ts` |
| 设计与能力元数据 | `app/scripts/{neon,pixel,hud}-design-013.mjs`、`directions-013.mjs` |
| 动作词表、时间映射与重分配 | `app/scripts/film-program.mjs`、`app/src/effects/film-cue.ts` |
| 校验、兼容与 AI 边界 | `app/scripts/effects.mjs`、`effect-draft.mjs`、`effect-ai.mjs` |
| 编辑与预览 | `app/src/EffectDirector.tsx`、`EffectDraftShelf.tsx`、`EffectWorkbench.tsx`、`EffectTheater.tsx`、`effects/EffectScene.tsx` |
| 导出服务 | `app/server.mjs`，`POST /api/effects/render` |
| 声音与媒体打包 | `app/scripts/make-trio-scores-013.py`、`package-trio-013.py` |

在项目 `app/` 目录运行：

```powershell
npm install
npm run typecheck
npm test
python scripts/make-trio-scores-013.py
node scripts/render-effects.mjs --styles=synthwave,pixel,hud --videos --variants --timeline
python scripts/package-trio-013.py
npm run build
npm start
```

声音脚本需要 NumPy、SciPy 与 FFmpeg；媒体打包需要 FFmpeg／ffprobe。渲染依赖可用的 Chrome／Edge 和 WebGL。旧版归档清单必须先保留，`package-trio-013.py` 会校验清单中的哈希、提取九帧、生成三种连播并全解码检查；它不会代替原创场景渲染，也不会自动创建旧版本归档。

AI 编排另需本机 Codex 命令可用并已完成登录；工作台会检查 `/api/ai/status` 后开放生成。静态页面可看成片与编辑预览，AI 和 MP4 导出需要本地服务。

本轮当前迭代已通过 64 项应用单元测试、TypeScript 检查和构建；新增行为测试覆盖重排后的动作、切点、时长重分配、非法动作拒绝、AI 参数保留、旧草稿迁移与相邻同动作连续性。媒体报告已验证三支完整片、九帧、三种连播与旧文件保留。最终浏览器与仓库检查仍以本轮汇总报告为准，不把这些检查扩展为审美评分。

3D 与液态仍沿用此前本地 Blender/Cycles 流程：默认材质片可缓存预览，改变材质／构成后是快速构图预览，最终导出重新计算。尚未加入自由软体、流体或磁带张力物理解算。

最终补充：12项动作的全景／近景已各渲染主体帧，共24帧，排除文字后均有真实取景差异（`framing.json`）。HUD苏醒的近景会截取高侧翼尖，全景保留完整翼展；近景用于主体细节，不宣称所有取景都展示全身。窄窗口保持纵向布局，桌面断点实际检查为预览与导演面板并排、无横向溢出，实况见 `assets/trio-workbench.png`。
