# 文件来源与许可边界

- `src/flagship/`、故事配置及导演方法：本仓库 `008-cel-story-studio` 原创实践实现；包内不据此为未单独声明授权的原创内容授予 MIT。
- `public/director-018/workshop.png` 与 `ocean.png`：2026-10-22 通过内置 ImageGen 新生成的环境静帧；实际提示词与未知模型／种子记录见 `ASSET-GENERATION.json`。它们不是源库原片素材，也不是生成式视频。
- `public/director-018/*.wav`：`make-score-018.py` 为该原创示例编写的程序底乐和五段动作声音，无外部音乐采样。这里只记录制作来源，不声称已经专业试听通过。
- `public/paper.jpg`：源库 `Vincentwei1021/mg-styles-15`，研究版本 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c` 中的 `demos/05-cel-boil/assets/paper_base.jpg`。[该版本 README 的 License 段](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/README.md#license)将纸纹列为 CC0 或公开领域第三方素材，未提供逐项原始作者；不把上游代码的 MIT 改写为纸纹自身的许可。
- `public/NotoSansSC.ttf`：字体内部名称为 Noto Sans SC Thin，SIL Open Font License 1.1，文本见 `public/OFL.txt`，其 Adobe / Source 版权开头与 [Google Fonts 官方对应文本](https://github.com/google/fonts/blob/main/ofl/notosanssc/OFL.txt)一致。
- `remotion` 与所有 `@remotion/*`：固定4.0.537，适用其自身 Remotion License；文本见 `REMOTION-LICENSE.md`，不按 MIT 解释。
- React、React DOM、Scheduler：各依赖自身许可，随包摘录完整文本至 `THIRD-PARTY-NOTICES.txt`；其他安装的传递依赖保留其软件包原始许可。

`UPSTREAM-LICENSE.txt` 保留上游原创代码、提示词和作品的 MIT 声明，不覆盖第三方纸纹、字体和 Remotion。此清单区分来源，不构成统一的开源许可。图像创作的公开提示词记录随包提供；AI 登录、私人故事提示词与原始返回不进入分发包。
