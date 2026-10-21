# 来源与授权边界

## RealGrass

- 仓库：https://github.com/SamG-Coder/RealGrass
- 研究 Commit：`f68b918796bbe3409d399e9640ca1f63164d7d26`。
- 此版本递归文件树未发现主项目 LICENSE；GitHub 仓库 API 返回 `license: null`。未取得主项目的明确再分发许可。
- 本研究仅阅读源码、说明原理，并通过 iframe 引用作者维护的在线演示。未把上游源码、编译器、运行时、材质、文档图片打包到本项目。
- 嵌入站点由上游运营，运行要求、可用性和内容可能变化。

## cuda-webshader

- 仓库：https://github.com/SamG-Coder/cuda-webshader
- RealGrass 子模块固定版本：`d1abd25c32b93d40ce13c7757fccdd0ce6e2f01a`。
- 该子模块采用 MIT，版权归 SamG-Coder and CUDA WebShader contributors。
- 原始许可证：https://github.com/SamG-Coder/cuda-webshader/blob/d1abd25c32b93d40ce13c7757fccdd0ce6e2f01a/LICENSE
- 本项目没有复制或使用该子模块代码。子模块的 MIT 许可证不等于 RealGrass 主项目获得了同样授权。

## 自研演示与截图

`app/` 和 `web/` 中的草地生成、WebGL2 着色器、页面与交互为本研究独立实现。草叶、花、地面和云由代码生成，无第三方模型、字体或运行时依赖。`assets/cover.png` 与 `assets/mobile.png` 是实际运行截图。

`assets/grass-effect-comparison.png` 为图像模型生成的原创效果示意，用于网页引导、README 和项目索引封面；已在图片和页面标注 AI 生成。它参考原库与独立实现的画面特征，不是原库截图、保真度测量或性能证据。原库参考截图仅在本次制作过程中临时使用，未分发到本项目。

## 技术参考

Three.js、MDN、Epic 和 AMD GPUOpen 文档仅用于能力核对及链接引用，没有复制其代码示例、插图或大段文字。具体链接见 `sources.json`。
