# 0.18 故事导演演示 · 2026-10-22

- 《给你一片海》《给你一片星海》是新的绘本故事，使用原创Canvas狐狸/鲸/道具、共享笔尖路径、纸页空间变化和Remotion4.0.537时间轴。未照搬源库角色、题材或完整分镜。
- 两幅原创环境静帧由内置ImageGen生成，实际提示、原始输出路径及未披露模型/seed记录见 `../director-kit-018/assets/demo-project/ASSET-GENERATION.json`。不是AI直接输出二十秒视频。
- 音乐与动作声由本项目 `make-score-018.py` 固定seed程序合成。静帧、角色、动画和音轨的分工不混淆。
- `paper.jpg` 来自源库固定版本README明确列为CC0/公开领域的纸纹；代码的MIT与素材许可分开。Noto Sans SC字体保留OFL；Remotion使用其自身许可，未按MIT分发。
- 改写版采用一次真实本机AI返回的结构化配置，实际返回见 `../director-examples-018/ai-rewrite.json`。AI受狐狸/鲸/五事件资产约束，不生成任意新资产。

# 0.15 液态与HUD专项修订 · 2026-10-22

- 新入口：`src/effects/liquid-film-015.ts`、`hud-film-015.ts`。旧入口与0.14完整MP4/JPG/JSON保留，归档为`web/quality-before-015/`。
- 液态新增凹膜、开孔与厚边、圆润液舌接合、细颈回缩和厚度透色；采用1920×1080离屏渲染后缩采样至1280×720。程序光箱、单次近似光路和艺术化波纹，不是真实流体/焦散解算。
- HUD新增连续侵蚀海沟、程序岩层和细微凹凸、代码绘制的装甲蚀刻、扫描显隐、弯曲翼膜、延迟后缘与分节尾随。所有新增图形与纹理由本项目代码生成，无新增外部素材。
- 本轮液态音轨在本项目原创`score-liquid-014.wav`基础上补4.1–5.55秒开孔细音，声源为代码合成；HUD沿用原有逐镜事件音轨，仍随工作台镜头编排重排。
- 参考源库固定MIT提交`49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`的液态行为和HUD状态推进；没有复制其题材、模型或完整分镜。
- 三版完整影片对照与真实边界见`production-notes-015.html`。美术审看和技术核验分别记录，不主张测试通过等于质量达标。

以下保留前版来源记录。

## 0.14.0 当前作品与制作复核

- 十五项本轮成片保留修改前快照于 `quality-before-014/`；源片只作研究依据。主题、原画、镜头和新版模块由本项目独立制作。具体改动和可核实的机制见 `production-notes-014.html` / `craft-review-014.json`。
- 手绘014是原创八套Canvas角色姿态与独立表演，继续使用上游MIT压力描线引擎与纸纹；不是扫描的传统手绘摄影，也不是任意角色自动原画。
- 液态014为原创实时三维SDF液桥、法线/软阴影与有限光学近似，不是FLIP或路径追踪；旧Cycles三球/圆环仅历史保留。3D《磁场花开》仍是Blender/Cycles 96采样成片，014全300帧重渲；网页自定义快速预览边界不变。
- 玻璃014先合成完整场景，再让透镜采样中文/读数；这是屏幕空间折射，非体积路径追踪。波形、频率、HUD读数均为程序演示。
- `solar-atlas-014.png`由内置imagegen于2026-10-21新生成，三块产品图是示意设计，不是工程实物、结构认证或性能数据。没有复制源库手机/零件素材。来源文件、提示词和哈希见项目 `assets/review-014/generated-assets.json`。
- `score-*-014.wav`均为本项目确定性合成，不含第三方曲目/录音采样。已测响度和真峰值，未声称专业试听已通过。科普依据DOE官方光伏/储能说明；黄色标记代表能量路径，不是同一光子或电子，省略控制器和转换损耗。
- 完整源库创作会话、具体模型分工与人工投入未知；不会由提示词或代码注释推断其一次生成或具体迭代成本。

# 0.13 三套原创资产与可编排声音

《午夜频率》《月亮修理铺》《深蓝回声》的题材、主体造型、程序几何／像素资产、分镜、动作与文字版式由本项目新建。参考源库的视觉机制，不复制其影片、角色、模型、完整分镜、图片、HDRI或音乐；旧版列车、狐狸投递与NASA月面场景不作为这三支新片的主体。

- `src/effects/neon-film-013.ts`：机械磁带外壳、转轴、传输轮、磁头、代码绘制的铭牌、金属带、频率门框、摄影机轨迹与霓虹后期。采用 Three.js；张力与机构运动为确定性编舞，不是磁带物理解算。
- `src/effects/pixel-film-013.ts`：猫机械师、碎月、工具台、工坊、招牌、城市和星屑，均为原创程序像素资产；不是源作精灵表，也没有引入外部游戏图片。
- `src/effects/hud-film-013.ts`：机械蝠鲼、分层翼骨、翼面、海沟、扫描、分流、舒翼和Canvas仪表。读数为明确标示的程序演示，不是真实海洋观测或传感器数据。当前HUD不读取NASA月面贴图；旧版对比影片继续保留下文的来源说明。

三套新片无新增外部图像素材。九张网页关键帧均由 `package-trio-013.py` 从最终MP4提取，来源帧与哈希见项目 `assets/review-013/media.json`。

`make-trio-scores-013.py` 生成15个原创声音文件：`score-{synthwave,pixel,hud}-013-bed.wav` 三条音乐床，以及 `cue-{style}-{action}-013.wav` 十二条动作音效。脚本复用本项目 `make-hero-scores.py` 的混音工具，以模拟低音、锯齿／脉冲／三角波、FM共振及带限噪声确定性合成；无外部录音采样、现成曲目、第三方音效或声音克隆。

全部文件为双声道、44.1kHz、16-bit PCM。音乐床基准10秒，动作音效基准2.5秒，工作台按实际连续动作段的顺序与时长重排、映射；相邻同动作跨取景时共用一段声音，不重复触发。音频技术测量和逐文件来源在项目 `assets/review-013/scores.json`。技术测量不等同于人工试听结论。

Three.js 0.186.1（MIT）、Remotion 4.0.537、Noto Sans SC（SIL OFL）沿用下文声明。源库固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`，MIT；原作只在明确标识的参考区播放。旧版三份MP4/JPG/JSON归档 `quality-before-013/`，此前历史声明继续适用于对应旧文件。完整实现与边界见项目 `RECRAFT-013.md`。

---

## 0.12 新增素材与实现说明（历史记录）

本轮六项重新设计、七项专项改进。cafe-surprise-012.png 与 cafe-laugh-012.png 是通过内置 ImageGen、以本项目已有水豚咖啡师为身份参考生成的新照片。完整提示词见 generated-assets-012.json。它们是用于剪辑的静态素材，不是连续演员视频。

graphic-films-012.ts、prism-film.ts 与 liquid-scene.py 为原创程序图形、表面及分镜。液态 Cycles 256采样、连续融合表面与透射吸色；不是流体求解。玻璃为实时背景采样近似，不是物理路径追踪。月面继续采用下文注明的 NASA SVS 公开领域素材；手绘继续复用下文的 MIT 引擎与纸纹。

make-recraft-scores.py 的七条新配乐为原创确定性代码合成，无外部录音采样。其余专项修订保留已有逐片原创音乐。十三项前版、上一轮两支影片和源库原作保留。

---

# 夜间漫游 · 当前素材与技术声明

## 0.11 两支创意重制

《磁场花开》《声音制造局》的选题、几何模型、分镜、动画与声音为本项目原创。没有使用源库的城市、字形、胶囊模型、场景、HDRI、影片或配乐。前者由 magnetic-scene.py 以 Cycles / OPTIX 96 samples 渲染，后者由 isometric-film.ts 实时三维渲染。陶片、铜边、镜面核、唱机、机械工位和操作机器人均由代码生成。磁场与机械过程为确定性编舞，不是电磁学或工业物理求解。

score-magnetic.wav / score-soundworks.wav 由 make-hero-scores.py 原创合成，10 秒、44.1 kHz、立体声，不含外部采样。响度和事件时间表见项目 assets/hero-scores.json。设计、关键画面与实现记录见 HERO-RECRAFT-011.md。

## 0.10 十二支影片重制（历史记录）

本轮重制其余十二支的分镜、画面和声音；十五项完整短片、0.8 优化前文件及参数模板均保留。两张新增水豚照片使用内置 ImageGen，路径 night-cafe-v3-pour.png / night-cafe-v3-relax.png，完整提示词见项目 GENERATED-ASSETS-010.md；原图均保留。照片以取景、剪辑和花字呈现，不声称生成连续演员视频。

HUD 使用 NASA SVS CGI Moon Kit 的 LROC 颜色与 LOLA 高程图（nasa-lroc-color-2k.jpg / nasa-lola-height-1k.jpg），来源 https://svs.gsfc.nasa.gov/4720/；署名 NASA’s Scientific Visualization Studio，Ernie Wright (USRA)。SVS 未另注内容为公开领域，使用说明 https://svs.gsfc.nasa.gov/help/。图像为三维着色素材，不是原作影片；界面、轨道、扫描与读数为原创演示编排，非实测。

新增十二个 score-{style}.wav 由 make-collection-scores.py 原创代码合成，44.1 kHz 立体声，包含各片镜头事件音效；无外部采样。详细范围与边界见项目 COLLECTION-CRAFT.md。

## 0.9 材质与表演重制（历史记录）

本轮重制三维、玻璃与手绘三支影片，其余十二支沿用 0.8。三维使用本项目 studio-scene.py 生成的原创陶瓷带状雕塑、黄铜轨道、琥珀与瓷肋，并以 Blender 4.5.14 / Cycles / OPTIX 渲染。灯光和微纹理为程序生成，没有使用源作字形模型、HDRI 或成片。玻璃使用原创着色器与 Canvas 内容纹理；手绘角色、镜头与投递动作重新绘制，MIT 描线引擎与纸纹继续保留来源。

score-studio.wav、score-optical.wav 与 score-post.wav 为新的原创立体声合成配乐及镜头事件音效，44.1 kHz，无外部采样，脚本 make-film-scores.py。

## 十五支样片的素材基础（0.8）

0.8.0 的主题、插画、模型和分镜为本项目独立设计。代码参考源库的视觉机制，没有复制原作影片、原作角色或标题。

- `ocean-atlas-v2.png` 与 `night-cafe-v2.png` 使用内置 ImageGen 新生成；完整提示词、尺寸、来源文件和检查记录见项目 `GENERATED-ASSETS.md`。拼贴图集的四个对象独立运动，照片舞台上的字由 Canvas 绘制。
- `score-warm.wav`、`score-paper.wav`、`score-pulse.wav`、`score-rain.wav`、`score-cafe.wav` 为本项目原创代码合成，不含第三方采样。配乐可关闭；没有旁白和语音克隆。
- 手绘描线仍直接调用源库 MIT `inkStroke` / `inkLoop`，纸张素材继续保留原有公开领域声明。
- Three.js 0.186.1（MIT）用于定制三维模型、PBR 材质、透射、阴影与 Bloom；Remotion 4.0.537 用于时间轴与导出，授权见根目录 `REMOTION-LICENSE.md`；Noto Sans SC 为 SIL OFL，见 `OFL.txt`。

源库固定提交为 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`，MIT 声明见工作台根目录 `UPSTREAM-LICENSE.txt`。原作成片仅在明确标识的参考区播放。离线光线追踪已用于 0.9 三维成片；软体和流体物理解算尚未实现。

## 0.7.0 素材历史（当前样片不再使用）



原作参考：[Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`，MIT，许可证保留在工作台根目录 `UPSTREAM-LICENSE.txt`。

本项目的十五个独立模板位于 `app/src/effects/`。它们将源作的视觉机制转化成可配置的新实现，没有移植原作的完整影片、分镜、物理模拟和所有后期；原作媒体只在明确标注的左侧比较窗口播放。每个模板的实际技术、来源关系与边界记录在 `effect-library.json`。

## 直接复用

- 手绘引擎 `src/vendor/engine.js` 来自源库 `demos/05-cel-boil/js/engine.js`，MIT；新模板实际调用 `inkStroke` / `inkLoop`，纸纹沿用已引入的公开领域纸张素材。
- `portrait.png` ← `demos/06-collage/assets/gen/p_face.png`；源作预处理代码注明 Pierre Petit / The Met CC0 肖像。
- `flower.png` ← `demos/06-collage/assets/gen/rose_centi.png`。
- `butterfly.png` ← `demos/06-collage/assets/gen/bfly_a.png`。
- `bird.png` ← `demos/06-collage/assets/gen/bird_hawk.png`。
- `cat.jpg` ← `demos/18-hanazi/assets/white_dof.jpg`。

源库 README 的 License 段明确声明其照片为 CC0 或公开领域；后三类素材的单项原始作者未随仓库提供，本项目保留来源路径，不补造作者信息。素材原样复制，可根据固定提交核对。未引入源库的外部字体、字形轮廓、音色样本或 HDRI。

## 技术依赖

- Three.js 0.186.1，MIT；用于真实三维几何、PBR 材质、灯光、相机与投影。3D 模板是 WebGL 实时适配，非 Blender / Cycles 成片品质等价移植。
- Remotion 4.0.537，授权见 `REMOTION-LICENSE.md`；用于帧时间轴和 MP4 渲染。
- React 19.0.0、simplex-noise 4.0.3，MIT，声明见 `THIRD-PARTY-NOTICES.txt`。
- Noto Sans SC，SIL OFL，见根目录 `OFL.txt`。

本次新模板视频为无声画面。原作比较播放器默认静音。AI 故事、手动故事以及旧的组合能力保持独立；任意故事自动编译到全部原生效果模板尚未实现。


## 0.16 线条与科普重做

线条音乐会、花园故事、耳罩剖面、棱镜与图解均为本项目原创Canvas路径或程序几何，未复用原库题材或分镜。四份配乐由make-scores-016.py原创合成，按故事事件编排；未声称经过专业混音试听。旧版源码和媒体保留。

降噪机制与适用边界核对Bose官方原理说明：https://www.bose.com/stories/what-is-active-noise-cancellation 。色散知识核对OpenStax章节：https://openstax.org/books/college-physics-2e/pages/25-5-dispersion-the-rainbow-and-prisms 。仅事实核对与链接，未复制教材图片、表格或原文。光路依据斯涅尔定律计算，主图出射角差8倍示意放大，小窗保留计算方向；七条代表色不意味着光谱只有七种离散颜色。降噪是单频近似，非某产品工程剖面或降噪实测。


## 0.17 角色、轮廓与任务

手绘两角色及场景、两条形变对象链、调色和混音界面为本项目新设计，以Remotion/Canvas/WebGL确定性渲染。海岸照片`coast-017.png`为本项目通过内置image_gen生成，原始文件1536×1024；完整实际提示词、未知模型和种子、SHA256见[provenance-017.json](provenance-017.json)。没有把图片生成标作生成视频。

六支独立原创程序配乐在`make-scores-017.py`合成并测量响度，未宣称专业试听通过。手绘沿用上游MIT墨线引擎及本项目关节计算；形变使用自绘SVG轮廓；玻璃沿用本项目0.14场景合成器，内容任务与素材独立。两套有限故事不等同任意故事自动生成。
