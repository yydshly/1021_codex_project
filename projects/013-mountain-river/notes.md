# 研究记录

## 2026-10-22 · 中文能力说明与真实场景展示

### 目标与版本

回答“核心是不是水流算法”，让用户直接看到效果、操作原版，区分水流计算、视觉着色和区段管理。

GitHub API 查询 main 为 `ed17b133ce37f8c97e93262681041d2aded2d8e2`，从该提交的 codeload archive 导入 `app/upstream/`。未修改原版源码，未安装 npm 依赖。阅读 LICENSE、CREDITS.md、CUDA WebShader PROVENANCE.md 与 Three.js 文件头检查版权。

### 代码证据

| 文件 | 说明 |
| --- | --- |
| `src/coastal-kernels.cu` | 交错速度输运、重力/压力、界面通量、流出量限制、水深积分、泡沫输运 |
| `src/river.cu` | 河床、岩石、边界、区段连接、水面重建、湿岩与程序化场景 |
| `src/impacts.cu` | 随湿流条件生成的视觉粒子，保持出生/寿命/速度状态 |
| `src/solver.js` | 193×441 网格，120 Hz 固定步长，每四步更新输运场 |
| `src/scene.js` | GPU 缓冲区与 Three.js 网格/实例共享 |
| `src/materials.js` | 深度相关折射/颜色、天空反射、阳光高光、流动细节 |
| `src/sections.js` | 十个资源槽位、附近三段持续模拟、预加载与边界交换 |

### 实机素材

在 Windows 的 Codex 内置浏览器中，以 localhost HTTP 运行固定版本。初始化成功后出现河道、岩石、瀑布、植被和流动水面。

- `river-interface.png`：默认河道视角及操作界面。
- `river.png`：默认视角，H 隐藏主界面，仍保留上游 FPS 标识。
- `overlook.png`：View 切换 Overlook 后隐藏界面。
- `waterline.png`：View 切换 Waterline、Light 切换 Golden hour 后隐藏界面。
- `cover.png`：新增中文说明页首屏。

三张场景图均为实机截图。不同视角/光照不构成同参数画质对比。截图中约 60 FPS 仅为瞬时界面读数，未做标准化性能测试。当前上游 tree 没有 README 提及的截图，因此自行运行采集。

### 页面与边界

无构建依赖 HTML/CSS/JS，通过 `build.py` 导出研究页和原版到 `web/scene/`。用户主动启动才创建 iframe，读取同源原版 ready 状态与错误提示。退出或切换截图移除 iframe，释放场景；三分钟超时回到截图并允许重试。资料不依赖 CDN。

已验证原版实际渲染、三种视角与暖色光照切换、24 个入口编译、JS 语法、截图与算法步骤切换。未复测完整上游物理回归、长距离压力测试、其他 GPU/浏览器兼容性或工程计算精度。

后续页面验收与仓库检查追加于文末。

### 最终验收

- 桌面页面：截图选择切换图片、说明与选中状态；计算水流和绘制水面步骤切换内容与固定版本源码链接。
- 内嵌原版：启动成功显示“原版正在运行”，原版 Pause water 按钮切为 Resume water；退出后移除 iframe 并恢复截图。
- 响应式：使用 `app/preview-mobile.html` 的 390px 宽 iframe 检查首屏和体验区，修正标题孤字换行；此为窄视口验证，不代表真机兼容性测试。
- 所有 HTML 本地 src/href 目标均存在；`web/scene/` 文件与上游快照逐字节一致。
- `node --check projects/013-mountain-river/app/app.js` 通过。
- `python -m unittest discover -s tests`：8 项通过。
- `python scripts/catalog.py --update-readme` 与 `python scripts/catalog.py --check` 成功。总仓库存在其他工作中的项目，保留它们的变更，未回滚或覆盖。
- 无 WebGPU 提示和三分钟超时路径已实现但未在禁用 GPU 的浏览器中实测；完整上游物理回归仍未执行。

说明页与实际原版效果均已可用。未提交、推送或部署。

## 2026-10-22 · 突出核心价值与可复用技术

将网页首屏、能力说明、项目 README 和索引摘要的重点统一为“实时水流模拟 + 水面视觉效果”。说明算法计算的是水深、水位、流速及通量，工程价值在于将模拟、视觉效果与 GPU 场景调度整合为可运行实现。

新增水面材质、接触效果、浅水求解器、GPU/场景管线四组复用说明，给出原始源码入口、输入依赖与适配要求。建议先迁移材质和接触效果，再按需求引入模拟与分段加载。尚未实施独立组件封装或其他项目接入，开发效率与性能收益也尚未量化。

使用 imagegen 内置工具，以 assets/river.png 与 waterline.png 为参考素材生成总结图。首版 core-value-summary.png 为草稿；最终采用 core-value-summary-v2.png（1536×1024），修正流入量文字并增加“原理示意”标签。完整提示词在 core-value-summary-prompt.txt。原始截图未改动；生成图中的画面是基于截图的视觉整理，不作为新的原版实测证据。

网页提供查看大图与下载入口，README 嵌入同一最终图。build.py 将图复制进 web/assets，projects.json 使用该图作为项目索引封面。

### 本次变更验证

- 最终总结图已逐项目视检查，1536×1024；修正“流入量”文字并添加“原理示意”。
- 构建成功；源码与 web 页面/样式/脚本逐字节一致，图已复制至 web/assets。
- HTML 本地资源与锚点检查通过；新增下载、大图、复用说明的目标存在。
- 原版 web/scene 与固定上游副本逐字节一致，本次未改变水流模拟和场景代码。
- `python -m unittest discover -s tests`：8 项通过；`python scripts/catalog.py --update-readme`、`--check` 通过。
- 本次未进行新的浏览器布局和交互复测：此前浏览器安全策略阻止访问该标签页，未绕过该限制。旧版运行验证保留，但不把它当作本次新布局的验证结果。

## 2026-10-22 · 远端发布整理

摘要统一说明三个层次：在浏览器 GPU 上呈现会响应地形与岩石的实时山间河流；可提取浅水求解器、水面材质、接触效果、共享缓冲与分段加载；后续可用于三维自然场景、互动展陈、游戏浅水环境和原理教学。新增具体适配事项，明确移动障碍更新、教学矢量显示等属于待开发功能。

使用生成的 core-value-summary-v2.png 作为项目索引封面、README 引导图及网页一图总结。发布通过总仓库既有 GitHub Pages 工作流进行；基于 origin/main 创建独立工作树，仅带入 013 子项目与对应索引，不带入其他未提交项目。

### 发布结果与线上验证

- 发布提交：`a23ad341f3b15af3ed4e2d668c0d53d1665b2c54`，已推送至远端 main。
- 公开网页：https://yydshly.github.io/1021_codex_project/projects/013-mountain-river/
- 部署记录：https://github.com/yydshly/1021_codex_project/actions/runs/39800099164
- 远端校验：https://github.com/yydshly/1021_codex_project/actions/runs/39800080051 ，成功。
- 发布工作树基于远端版本的 6 项测试通过，原工作区的 8 项测试通过；两处索引检查均通过。测试数量不同源于原工作区还有其他项目的未发布校验扩展。
- 线上说明页、CSS、JS、总结图、原版入口、main.js、river.cu、Three.js WebGPU 模块与 LICENSE 共 9 项资源返回 HTTP 200，并与发布提交内容逐字节一致。
- 门户含 013 条目，并使用 core-value-summary-v2.png 引导图。完整 HTTP 校验结果见 assets/publication-validation.json。
- 本次线上验证范围为静态发布与文件完整性；没有在公网重新进行 GPU 运行、帧率或完整物理回归。原版实机运行证据来自之前本地验证。
- 发布副本位于 E 盘独立工作树，未合入其他本地未提交项目。后续远端更新已保留本次 013 条目。
