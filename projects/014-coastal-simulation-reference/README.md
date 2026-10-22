# 014 · GPU 海岸模拟：既有研究关联

> 本库已在 `0927_codex_project` 的 **012 · coastal-simulation GPU 海岸能力研究**中完成研究、演示集成和小型扩展。本条仅保留成果入口与后续方向，状态为“已归档”，不重复研究或复制运行代码。这里的历史 012 与本仓库的 012 · three-freecam 是不同项目。

[之前的 012 项目与完整记录](https://github.com/yydshly/0927_codex_project/tree/main/projects/012-coastal-simulation-cuda-webshader) · [中文展示页](https://yydshly.github.io/0927_codex_project/012-coastal-simulation-cuda-webshader/#summary) · [三维场景与礁石对照实验台](https://yydshly.github.io/0927_codex_project/012-coastal-simulation-cuda-webshader/extensions.html)

| 项目 | 内容 |
| --- | --- |
| 当前索引编号 | 014（既有研究关联） |
| 历史成果 | 0927_codex_project / 012-coastal-simulation-cuda-webshader |
| 上游仓库 | [SamG-Coder/coastal-simulation-cuda-webshader](https://github.com/SamG-Coder/coastal-simulation-cuda-webshader) |
| 原始项目 | [iamtechartist/coastal-simulation](https://github.com/iamtechartist/coastal-simulation) |
| 上游许可证 | MIT；Three.js、CUDA WebShader 等组件许可与归属见上游 CREDITS.md 及历史集成记录 |
| 历史集成版本 | `e5a80fe42b4eeba6c01de1467035bafd69592d3e` |
| 历史研究日期 | 2026-09-27 |
| 本次核对日期 | 2026-10-22；上游 main 仍指向同一提交 |
| 当前状态 | 已归档：已有关联成果，不重复立项 |

## 已经完成的内容

| 内容 | 已有成果 | 能力边界 |
| --- | --- | --- |
| 原理与能力整理 | 中文导览、算法拆解、能力总图、实际运行截图和来源记录 | 总图中的生成示意与实测截图分开标注 |
| 完整三维演示集成 | 打包固定版本的海岸场景、CUDA WebShader 与 Three.js 运行资源，支持视角和海况控制 | 核心求解与渲染来自上游，不计为自研水体引擎 |
| 单处礁石扩展 | 可切换原版与新增礁石；同一岩石定义进入可见几何、GPU 障碍、湿润与喷雾 | 小型启动补丁；CUDA 求解内核未修改，切换需要重新初始化 |
| 独立二维地形实验 | 灰度高度图导入、障碍编辑、海况预设保存、三档网格及 P50/P95 帧时间记录 | 使用独立简化 WGSL 模型；与上游三维场景不共享状态，帧间隔不等于 GPU 内核耗时 |
| 验证与发布 | 历史记录包含本地与公网运行核验、原版/新增礁石切换、二维诊断及编译检查 | 未重跑上游硬件 GPU 数值套件和性能基准；没有工程预测精度验证 |

证据：[集成与补丁说明](https://github.com/yydshly/0927_codex_project/blob/main/projects/012-coastal-simulation-cuda-webshader/web/upstream/INTEGRATION.md)、[研究与验证记录](https://github.com/yydshly/0927_codex_project/blob/main/projects/012-coastal-simulation-cuda-webshader/notes/research.md)、[历史发布记录](https://github.com/yydshly/0927_codex_project/blob/main/projects/012-coastal-simulation-cuda-webshader/notes/deployment.md)。

## 后续可扩展方向

以下均为候选方向，尚未作为完整产品实现；继续开发时沿用之前的 012 成果。

1. **把可编辑地形接入真实三维场景。** 将高度图和障碍编辑统一接入上游海床、求解障碍与可见几何，核对水流、湿润、喷雾及初始状态；这是现有二维实验与三维演示之间最直接的缺口。
2. **场景配置、保存与分享。** 从二维海况预设扩展为地形、礁石、海况、光照和相机的完整场景配置，增加导入导出、版本和分享入口。
3. **提取可嵌入的海岸组件。** 整理初始化、参数更新、暂停、销毁和错误处理接口，供互动背景、展陈或教学页面复用；处理固定 Three.js 版本的互操作依赖。
4. **建立设备适配与可重复验证。** 固定设备、视角、分辨率、输入和采样方法，测量加载时间、帧时间与 GPU 耗时，检查数值稳定性，再决定质量分级。
5. **按需引入新的物理或视觉模型。** 船体浮力与双向作用、地形侵蚀、翻卷浪腔或完整三维流体需要额外模型和验证，不能仅靠现有参数获得。

当前主体是水与固定海岸、礁石的浅水高度场互动；岩石不会被水推动，短波、泡沫和喷雾包含视觉近似。

## 访问与运行

直接使用上方历史展示页和三维实验台。三维演示及二维 GPU 实验需要支持 WebGPU 的浏览器。

如需本地复现，在旧仓库 `0927_codex_project` 根目录执行历史记录中的命令：

```powershell
python projects/012-coastal-simulation-cuda-webshader/web/build.py
python -m http.server 4328 --bind 127.0.0.1 --directory dist
```

打开 `http://127.0.0.1:4328/012-coastal-simulation-cuda-webshader/`。本条未复制程序，也未在本次重新运行上述演示；历史验证与本次核对的区别见 [notes.md](notes.md)。

## 来源与授权

历史项目保留原始项目、移植作者及依赖的许可。后续复用源码或资源时沿用其归属与许可文件：[固定版本 CREDITS.md](https://github.com/SamG-Coder/coastal-simulation-cuda-webshader/blob/e5a80fe42b4eeba6c01de1467035bafd69592d3e/CREDITS.md)、[LICENSE](https://github.com/SamG-Coder/coastal-simulation-cuda-webshader/blob/e5a80fe42b4eeba6c01de1467035bafd69592d3e/LICENSE)。本条仅新增文字和链接。
