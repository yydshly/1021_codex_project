# GitHub 项目研究室

记录值得研究的 GitHub 项目与技术实践：从发现、理解，到运行、改造和总结。

这份 README 是研究成果的回顾入口：先用一句话找到项目，再看能力、原理与复用价值，最后进入研究记录或演示。每个子项目独立保存笔记、实践代码与素材。

**阶段状态：暂时归档（2026-10-23）。** 本阶段研究与索引整理告一段落，后续按具体需求继续。恢复入口、验证范围与待办见 [阶段归档记录](docs/archive-2026-10-23.md)。

[项目速览](#项目速览) · [详细索引](#详细索引) · [项目图览](#项目图览) · [维护与运行](#从这里开始)

## 项目索引

按编号升序排列。编号一经分配便保留，归档后也不重复使用。

<!-- PROJECT_INDEX:START -->
### 项目速览

- **[001 · Remotion 扁平矢量 MG](projects/001-remotion-flat-vector/README.md)**：用 Remotion 将几何图形、文字和声音编排为 10 秒原创动画，留下可复现的 MG 制作样例。
- **[002 · Lark Agent Bridge 原理研究](projects/002-lark-agent-bridge/README.md)**：把飞书消息接入本地编程 Agent，为聊天执行任务、多渠道接入和后续任务系统提供桥接思路。
- **[003 · Knowledge Work Plugins：Claude 岗位插件与业务 Skill](projects/003-knowledge-work-plugins/README.md)**：按岗位和业务场景组织 Claude 插件与 Skill，供我们复用业务 SOP、明确需求和交付标准。
- **[004 · Motion Atlas · 15 种 MG 风格原理研究](projects/004-mg-styles-explorer/README.md)**：拆解 15 套 MG 风格的提示词、源码与原片，为品牌、产品和知识内容选择视觉语言。
- **[005 · Storm-Breaker 浏览器权限研究](projects/005-storm-breaker/README.md)**：拆解网页获取环境、定位、相机和麦克风信息的机制，帮助我们理解浏览器权限与页面生命周期。
- **[006 · God’s Eye View：公开信息与三维地球研究](projects/006-gods-eye-view/README.md)**：把航班、船舶、卫星等公开信息呈现在三维地球上，帮助我们学习信息选型、来源接入和空间表达。
- **[007 · RealGrass 草地效果展示与对比](projects/007-realgrass-lab/README.md)**：对比 RealGrass 与自研 WebGL2 草地，理解自然形态、风动和云层的实现取舍，为草地效果选型提供依据。
- **[008 · 纸间故事 · 风格能力工作台](projects/008-cel-story-studio/README.md)**：把 15 种 MG 风格做成独立模板与有限故事工作台，沉淀从分镜、资产到输出和审片的短片制作方法。
- **[009 · LCM：AI 编程助手的外部项目记忆](projects/009-lcm-memory/README.md)**：为 AI 编程助手保存和检索外部项目记忆，探索跨会话研究、长期排错与决策追溯的方法。
- **[010 · 镜头手册：AI视频创作动作素材库](projects/010-melies-cinematic-guide/README.md)**：整理 424 项电影语言参考与 4 个实测题材，为 AI 视频的分镜设计、双语提示词和审片复盘提供素材。
- **[011 · AlphaDesk：金融研究工作台的能力、架构与扩展](projects/011-alphadesk-terminal/README.md)**：把行情、新闻、公司披露与事件组织成研究工作台，为我们学习多源信息处理和人 / AI 共用的数据接口提供样例。
- **[012 · three-freecam：基础相机交互封装](projects/012-three-freecam/README.md)**：封装 Three.js 的飞行、环绕和聚焦操作，节省相机控制开发时间，当前作为三维交互备用工具。
- **[013 · Mountain River：实时水流模拟与水面效果](projects/013-mountain-river/README.md)**：实时模拟山间河流并呈现反射、泡沫与飞溅，为自然场景、游戏水体和互动展示积累水效实现方法。
- **[014 · GPU 海岸模拟：关联此前 012 研究](projects/014-coastal-simulation-reference/README.md)**：关联旧仓库的 GPU 海岸模拟与礁石扩展成果，保留水体效果复用和地形交互的继续研究入口。
- **[015 · Autumn Line：秋日铁路场景与技术沉淀](projects/015-autumn-line/README.md)**：用程序化建模搭出可漫游的秋日铁路场景，为游戏环境、动画背景和分镜预演积累自然资产与渲染方法。

### 详细索引

**能力**看能做什么，**原理**看如何实现，**价值**看我们能复用什么，**边界**看验证范围与后续缺口。项目状态表示研究进展，具体可用程度以边界和研究记录为准。

演示栏的“—”表示未提供本仓库网页入口，相关成片或历史成果见该项目的研究记录。

| 编号 | 项目 / 研究记录 | 能力、原理与价值 | 状态 | 源仓库 / 网站 | 演示 |
| --- | --- | --- | --- | --- | --- |
| 001 | [Remotion 扁平矢量 MG](projects/001-remotion-flat-vector/README.md) | **能力**：已完成《从一点，到无限可能》10 秒原创 MG，包含矢量运动、转场与音画合成。<br>**原理**：SVG 绘制图形，按帧插值与弹簧控制运动，共享时间点对齐声音。<br>**价值**：复用动画编排、音画同步与逐帧渲染方法，作为品牌或产品短片的制作起点。<br>**边界**：已验证当前成片与本机渲染；跨平台运行、主观音质和性能基准未验证。 | 已完成 | [remotion](https://github.com/remotion-dev/remotion) | — |
| 002 | [Lark Agent Bridge 原理研究](projects/002-lark-agent-bridge/README.md) | **能力**：接收飞书任务与附件，关联 Agent 会话、安排运行并回传过程和结果。<br>**原理**：飞书事件进入 Bridge，适配器启动 Claude Code / Codex CLI 并归一化结构化输出。<br>**价值**：借鉴渠道接入、执行器适配与会话管理，复用本机工具形成聊天工作入口。<br>**边界**：仅完成文档与源码研究，真实飞书 / Agent 联调未验证；持久化任务与验收机制需另建。 | 已完成 | [lark-coding-agent-bridge](https://github.com/zarazhangrui/lark-coding-agent-bridge) | [打开](https://yydshly.github.io/1021_codex_project/projects/002-lark-agent-bridge/) |
| 003 | [Knowledge Work Plugins：Claude 岗位插件与业务 Skill](projects/003-knowledge-work-plugins/README.md) | **能力**：提供岗位插件与业务 Skill，覆盖会前准备、合同审阅、工单分诊等工作方法。<br>**原理**：插件包装能力，Skill 描述流程，Claude 按任务加载说明并在工具权限内执行。<br>**价值**：借鉴业务 SOP、需求模板、异常处理与验收规则，沉淀自己的高频工作流程。<br>**边界**：真实 Claude 业务效果未验证；系统权限与审批需另行实现，本地工单演示为本研究新增。 | 已完成 | [knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | [打开](https://yydshly.github.io/1021_codex_project/projects/003-knowledge-work-plugins/) |
| 004 | [Motion Atlas · 15 种 MG 风格原理研究](projects/004-mg-styles-explorer/README.md) | **能力**：查阅 15 支原作与完整提示词，观察手绘、三维材质、形变、玻璃折射等视觉机制。<br>**原理**：各作品按效果选用 Canvas、WebGL、Three.js 或 Blender，结合帧导出与音画合成。<br>**价值**：为视觉选型、风格规范和动画组件积累参考；后续制作实践见 008。<br>**边界**：源库是独立创作案例集合，统一参数模板与批量生成服务属于后续扩展。 | 已完成 | [mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15) | [打开](https://yydshly.github.io/1021_codex_project/projects/004-mg-styles-explorer/) |
| 005 | [Storm-Breaker 浏览器权限研究](projects/005-storm-breaker/README.md) | **能力**：梳理环境信息、定位、相机抓拍、分段录音与结果管理，并解释 22 项浏览器信息边界。<br>**原理**：浏览器标准接口按权限采集，HTTP 上传至 PHP 接收端；持续采集受授权与页面生命周期限制。<br>**价值**：为权限交互设计、隐私边界说明和浏览器安全教育提供具体案例。<br>**边界**：仅完成静态源码研究与原创解释网页，上游采集工具未运行；研究版本未发现主项目 LICENSE。 | 已完成 | [Storm-Breaker](https://github.com/ultrasecurity/Storm-Breaker) | [打开](https://yydshly.github.io/1021_codex_project/projects/005-storm-breaker/) |
| 006 | [God’s Eye View：公开信息与三维地球研究](projects/006-gods-eye-view/README.md) | **能力**：聚合航班、船舶、卫星、天气、事件与公开影像，支持三维浏览和跟踪。<br>**原理**：接口取数与参数推算提供状态，Cesium 按需加载地球、模型及空间图层。<br>**价值**：借鉴按问题选源、取数适配、缓存降级与空间表达，用于公开信息研究和事件展示。<br>**边界**：门户展示历史研究快照，原应用需本地运行；国内来源可用性按实测范围记录，区域迁移尚未实施。 | 已完成 | [gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view) | [打开](https://yydshly.github.io/1021_codex_project/projects/006-gods-eye-view/) |
| 007 | [RealGrass 草地效果展示与对比](projects/007-realgrass-lab/README.md) | **能力**：展示原库、自研草地与并排对照，支持风场、草高、云量等参数和局部拨草交互。<br>**原理**：原库用 GPU 逐叶状态与可见性筛选驱动草叶；自研版用 WebGL2 实例化和顶点风场。<br>**价值**：比较自然感、运动连续性与实现复杂度，为互动背景、自然场景和技术路线选型提供参考。<br>**边界**：自研版未完整复现原库形态与动力学，未做同条件性能基准；原库主项目许可证未确认。 | 已完成 | [RealGrass](https://github.com/SamG-Coder/RealGrass) | [打开](https://yydshly.github.io/1021_codex_project/projects/007-realgrass-lab/) |
| 008 | [纸间故事 · 风格能力工作台](projects/008-cel-story-studio/README.md) | **能力**：提供十五种风格模板、有限故事与镜头编排、编辑预览及已有影片下载。<br>**原理**：故事与分镜驱动资产和程序动画，再用 Remotion 逐帧合成；源库提供风格参照。<br>**价值**：复用导演方法、风格规则、资产与动作实现，按简报 → 选风格 → 分镜 → 补资产 → 输出 → 审片制作。<br>**边界**：已归档；AI 编排与新片渲染需本地服务，新角色、动作和任意故事仍需设计与实现。 | 已归档 | [mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15) | [打开](https://yydshly.github.io/1021_codex_project/projects/008-cel-story-studio/) |
| 009 | [LCM：AI 编程助手的外部项目记忆](projects/009-lcm-memory/README.md) | **能力**：捕获与恢复交互，保存原始来源和摘要，支持 AI 检索及主动写入记忆。<br>**原理**：Hooks 接入会话生命周期，SQLite 保存记录与分层摘要，MCP / CLI 提供检索入口。<br>**价值**：为跨会话研究、长期排错和决策追溯提供外部记忆，预期减少重复说明与排查。<br>**边界**：仅完成静态研究与示意演示；召回效果、压缩细节损失及实际成本收益尚未实测。 | 已完成 | [lcm](https://github.com/lossless-claude/lcm) | [打开](https://yydshly.github.io/1021_codex_project/projects/009-lcm-memory/) |
| 010 | [镜头手册：AI视频创作动作素材库](projects/010-melies-cinematic-guide/README.md) | **能力**：查阅原站视频 / 图片与中英提示词，设计和导入分镜，对照四个题材的实际成片与问题。<br>**原理**：从情绪目标选择参考，描述动作起止与接触状态，交给外部视频模型生成，再用证据帧复盘。<br>**价值**：积累动作描述、案例索引、提示词交接与验收方法，支持品牌短片、产品演示和人物叙事。<br>**边界**：已归档，来源为网站且未确认公开源码；424 项参考不等于已验证动作，生成效果仍需逐片复核。 | 已归档 | [Melies Cinematic Techniques](https://melies.co/cinematic-techniques) | [打开](https://yydshly.github.io/1021_codex_project/projects/010-melies-cinematic-guide/) |
| 011 | [AlphaDesk：金融研究工作台的能力、架构与扩展](projects/011-alphadesk-terminal/README.md) | **能力**：支持市场观察、公司研究与事件跟踪，向 React 网页及只读 MCP / REST 接口提供研究材料。<br>**原理**：FastAPI 连接来源适配、字段整理、缓存与确定性计算，共享研究函数供网页和外部 AI 调用。<br>**价值**：借鉴多源契约、数据口径和研究流程，探索 A 股、每日资讯与行业情报等扩展。<br>**边界**：公开来源仅部分实测，SEC 停用、商业源未配置；门户为静态专题，实时服务需本地启动，领域迁移未实施。 | 研究中 | [alphadesk-terminal](https://github.com/vigneshv1cky/alphadesk-terminal) | [打开](https://yydshly.github.io/1021_codex_project/projects/011-alphadesk-terminal/) |
| 012 | [three-freecam：基础相机交互封装](projects/012-three-freecam/README.md) | **能力**：提供自由飞行、转头、环绕、平移、推拉与物体聚焦。<br>**原理**：把键鼠输入、速度与惯性统一为 Three.js 相机的位置、朝向和观察中心更新。<br>**价值**：需要三维场景巡检、编辑器视口或自由漫游时，减少重复编写相机控制代码。<br>**边界**：对当前内容创作需求价值有限，暂不重点投入；没有新增建模或渲染能力，自动巡游为本演示另行实现。 | 已完成 | [three-freecam](https://github.com/hxtnv/three-freecam) | [打开](https://yydshly.github.io/1021_codex_project/projects/012-three-freecam/) |
| 013 | [Mountain River：实时水流模拟与水面效果](projects/013-mountain-river/README.md) | **能力**：模拟水深、流速及地形和岩石响应，表现反射、折射、泡沫、湿岩与飞溅。<br>**原理**：浅水网格求解与输运在 WebGPU 上运行，Three.js 读取共享缓冲绘制水面并管理分段河道。<br>**价值**：可提取水面材质、接触效果、求解器与 GPU 管线，用于自然场景、游戏水体和原理教学。<br>**边界**：属于浅水高度场；通用模块封装与跨项目适配尚未实施，完整物理回归与性能基准未复测。 | 已完成 | [MountainRIver](https://github.com/SamG-Coder/MountainRIver) | [打开](https://yydshly.github.io/1021_codex_project/projects/013-mountain-river/) |
| 014 | [GPU 海岸模拟：关联此前 012 研究](projects/014-coastal-simulation-reference/README.md) | **能力**：旧仓库已集成三维海岸演示、单处礁石扩展与独立二维地形实验。<br>**原理**：浅水高度场在 WebGPU 上计算，结合 Three.js 表现水面、泡沫、湿润与喷雾。<br>**价值**：沿用既有成果，继续探索三维地形接入、场景保存分享与可嵌入的海岸组件。<br>**边界**：已归档，仅关联 0927 仓库的 012；本次未重跑演示，二维实验与三维场景尚未共享状态。 | 已归档 | [coastal-simulation-cuda-webshader](https://github.com/SamG-Coder/coastal-simulation-cuda-webshader) | — |
| 015 | [Autumn Line：秋日铁路场景与技术沉淀](projects/015-autumn-line/README.md) | **能力**：实时呈现铁路、树林与山谷，支持卡通光影、描边、风动、落叶和自由漫游。<br>**原理**：植物模板、确定性随机与高度场生成场景，结合实例化绘制、卡通光照和屏幕空间描边。<br>**价值**：复用自然资产、布局规则、场景配置与镜头控制，作为可反复取景的虚拟外景地。<br>**边界**：视频 / 模型导出和通用组件需另行开发；场景面向特定构图，低配与手机 GPU 尚未验证。 | 已完成 | [autumn-line](https://github.com/ishuagrawal/autumn-line) | [打开](https://yydshly.github.io/1021_codex_project/projects/015-autumn-line/) |

### 项目图览

<details>
<summary>展开项目封面与总结图（14 项）</summary>

#### 001 · Remotion 扁平矢量 MG

用 Remotion 将几何图形、文字和声音编排为 10 秒原创动画，留下可复现的 MG 制作样例。

[![Remotion 扁平矢量 MG预览](projects/001-remotion-flat-vector/assets/cover.png)](projects/001-remotion-flat-vector/README.md)

#### 002 · Lark Agent Bridge 原理研究

把飞书消息接入本地编程 Agent，为聊天执行任务、多渠道接入和后续任务系统提供桥接思路。

[![Lark Agent Bridge 原理研究预览](projects/002-lark-agent-bridge/assets/understanding-map.png)](projects/002-lark-agent-bridge/README.md)

#### 003 · Knowledge Work Plugins：Claude 岗位插件与业务 Skill

按岗位和业务场景组织 Claude 插件与 Skill，供我们复用业务 SOP、明确需求和交付标准。

[![Knowledge Work Plugins：Claude 岗位插件与业务 Skill预览](projects/003-knowledge-work-plugins/assets/capability-map.png)](projects/003-knowledge-work-plugins/README.md)

#### 004 · Motion Atlas · 15 种 MG 风格原理研究

拆解 15 套 MG 风格的提示词、源码与原片，为品牌、产品和知识内容选择视觉语言。

[![Motion Atlas · 15 种 MG 风格原理研究预览](projects/004-mg-styles-explorer/assets/cover.jpg)](projects/004-mg-styles-explorer/README.md)

#### 005 · Storm-Breaker 浏览器权限研究

拆解网页获取环境、定位、相机和麦克风信息的机制，帮助我们理解浏览器权限与页面生命周期。

[![Storm-Breaker 浏览器权限研究预览](projects/005-storm-breaker/assets/storm-breaker-overview.png)](projects/005-storm-breaker/README.md)

#### 006 · God’s Eye View：公开信息与三维地球研究

把航班、船舶、卫星等公开信息呈现在三维地球上，帮助我们学习信息选型、来源接入和空间表达。

[![God’s Eye View：公开信息与三维地球研究预览](projects/006-gods-eye-view/assets/research-overview-20261022.png)](projects/006-gods-eye-view/README.md)

#### 007 · RealGrass 草地效果展示与对比

对比 RealGrass 与自研 WebGL2 草地，理解自然形态、风动和云层的实现取舍，为草地效果选型提供依据。

[![RealGrass 草地效果展示与对比预览](projects/007-realgrass-lab/assets/grass-effect-comparison.png)](projects/007-realgrass-lab/README.md)

#### 008 · 纸间故事 · 风格能力工作台

把 15 种 MG 风格做成独立模板与有限故事工作台，沉淀从分镜、资产到输出和审片的短片制作方法。

[![纸间故事 · 风格能力工作台预览](projects/008-cel-story-studio/assets/capability-map-019/mg-styles-capability-map.png)](projects/008-cel-story-studio/README.md)

#### 009 · LCM：AI 编程助手的外部项目记忆

为 AI 编程助手保存和检索外部项目记忆，探索跨会话研究、长期排错与决策追溯的方法。

[![LCM：AI 编程助手的外部项目记忆预览](projects/009-lcm-memory/assets/lcm-external-memory.png)](projects/009-lcm-memory/README.md)

#### 010 · 镜头手册：AI视频创作动作素材库

整理 424 项电影语言参考与 4 个实测题材，为 AI 视频的分镜设计、双语提示词和审片复盘提供素材。

[![镜头手册：AI视频创作动作素材库预览](projects/010-melies-cinematic-guide/assets/research-overview.png)](projects/010-melies-cinematic-guide/README.md)

#### 011 · AlphaDesk：金融研究工作台的能力、架构与扩展

把行情、新闻、公司披露与事件组织成研究工作台，为我们学习多源信息处理和人 / AI 共用的数据接口提供样例。

[![AlphaDesk：金融研究工作台的能力、架构与扩展预览](projects/011-alphadesk-terminal/assets/architecture-full.png)](projects/011-alphadesk-terminal/README.md)

#### 012 · three-freecam：基础相机交互封装

封装 Three.js 的飞行、环绕和聚焦操作，节省相机控制开发时间，当前作为三维交互备用工具。

[![three-freecam：基础相机交互封装预览](projects/012-three-freecam/assets/capability-value-summary.png)](projects/012-three-freecam/README.md)

#### 013 · Mountain River：实时水流模拟与水面效果

实时模拟山间河流并呈现反射、泡沫与飞溅，为自然场景、游戏水体和互动展示积累水效实现方法。

[![Mountain River：实时水流模拟与水面效果预览](projects/013-mountain-river/assets/core-value-summary-v2.png)](projects/013-mountain-river/README.md)

#### 015 · Autumn Line：秋日铁路场景与技术沉淀

用程序化建模搭出可漫游的秋日铁路场景，为游戏环境、动画背景和分镜预演积累自然资产与渲染方法。

[![Autumn Line：秋日铁路场景与技术沉淀预览](projects/015-autumn-line/assets/natural-scene-overview.png)](projects/015-autumn-line/README.md)

</details>
<!-- PROJECT_INDEX:END -->

## 从这里开始

- **浏览研究**：从上方索引进入子项目，查看原项目介绍、研究结论和运行方式。
- **新增研究**：阅读 [项目维护指南](docs/project-guide.md)，复制 [研究模板](templates/project/README.md)。
- **发布演示**：阅读 [GitHub Pages 部署指南](docs/deployment.md)，为每个 Web 应用分配独立路径。
- **查看图片**：每个子项目在自己的 `assets/` 目录保存截图，在研究 README 和首页索引中展示。

## 仓库结构

```text
.
├── README.md                 # 总索引与项目入口
├── projects.json             # 项目元数据，驱动首页索引和演示门户
├── projects/                 # 按 001-slug、002-slug 编号的研究项目
├── templates/project/        # 新研究项目模板
├── docs/                     # 维护规范、部署说明
├── scripts/catalog.py        # 校验索引、生成静态演示门户
├── tests/                    # 索引与发布边界检查
└── .github/workflows/        # 自动校验与手动 Pages 发布
```

## 维护命令

需要 Python 3.10 或更高版本，无第三方依赖。

```sh
# 编辑 projects.json 后，同步本页索引并生成本地静态站点
python scripts/catalog.py --update-readme

# 校验元数据、本页索引与静态站点构建
python scripts/catalog.py --check
python -m unittest discover -s tests

# 预览生成的门户；打开 http://localhost:8000
python -m http.server 8000 --directory _site
```

GitHub Pages 已启用，研究门户入口为：
[`yydshly.github.io/1021_codex_project/`](https://yydshly.github.io/1021_codex_project/)。

## 来源与授权

各研究页保留原仓库链接及其许可证说明。优先使用链接和可复现的操作说明；引入上游代码、图片或数据时，遵守原项目许可证并保留必要声明。本仓库目前未为原创内容选择统一开源许可证。
