# 001 · Remotion 扁平矢量 MG 试片

以「一个想法，从一点开始」为主题，制作 10 秒的原创 MG 动画《ONE DOT / 从一点，到无限可能》。参考 mg-styles-15 的扁平矢量风格，用 Remotion 重新实现画面与时间控制。

| 项目 | 内容 |
| --- | --- |
| 研究编号 | 001 |
| 主技术仓库 | https://github.com/remotion-dev/remotion |
| 风格参考仓库 | https://github.com/Vincentwei1021/mg-styles-15 |
| Remotion 研究版本 | 4.0.537，依赖固定于 `app/package-lock.json` |
| 风格参考版本 | `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c` |
| 上游许可证 | Remotion License；mg-styles-15 自有内容为 MIT |
| 输出目标 | 1920 × 1080、30 fps、300 帧、10 秒、H.264 / AAC |
| 状态 | 已完成：成片渲染、关键帧抽查与完整解码通过 |

## 成片与源码

- 成片：`web/one-dot.mp4`
- 封面：`assets/cover.png`
- 动画：`app/src/OneDot.tsx`
- 统一时间点：`app/src/cues.json`
- 原创音频生成：`app/scripts/audio.py`

![成片封面](assets/cover.png)

[打开 MP4 成片](web/one-dot.mp4) · [查看实际成片的关键帧](assets/contact-sheet.jpg)

## 创意与分镜

| 时间 | 画面 | 动作 |
| --- | --- | --- |
| 0–2 秒 | 奶油白背景、圆点与拱形，「一点灵感，就够了」 | 下落、挤压、回弹；文字错峰进入 |
| 2–4 秒 | 群青背景、几何人物与植物，「让想法开始生长」 | 圆形遮罩转场、人物挥手、枝叶与花朵生长 |
| 4–7 秒 | 珊瑚橙背景，「让想法，成形」 | 点、曲线、方形依节拍出现，形态组合 |
| 7–10 秒 | 奶油白片尾，「从一点，到无限可能」 | 几何模块聚合、文字落版，末尾保留轻微运动 |

画面使用 SVG 纯色图形，无外部图片、生成图或视频片段。全部运动由帧号确定，使用 Remotion 的 spring 与插值；配乐为 Python 标准库合成的原创短循环与音效，固定随机种子，按同一份 cues.json 对齐。

## 本地运行

本次环境：Windows、Node.js 22.15.0、npm 10.9.2、Python 3.10、Google Chrome、FFmpeg 6.1。

```powershell
cd projects/001-remotion-flat-vector/app
npm ci
npm start
```

导出视频（Chrome 安装在其他位置时修改路径；也可省略该参数使用 Remotion 管理的浏览器）：

```powershell
npx remotion render src/index.tsx OneDot ../web/one-dot.mp4 --codec=h264 --crf=16 --pixel-format=yuv420p --image-format=png --color-space=bt709 --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"
npx remotion still src/index.tsx OneDot ../assets/cover.png --frame=265 --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"
npm run typecheck
```

配乐文件已随源码保留，普通渲染不需要运行 Python。重新合成配乐需要 Python 和 PATH 中的 FFmpeg：

```powershell
npm run audio
```

字体是随项目保存的 Noto Sans SC 子集，重命名为 MotionSans，授权见 `app/public/OFL.txt`。若增加当前子集不包含的文字，需要下载完整字体并重新执行 `app/scripts/subset_font.py`（需要 fonttools），或换用另一份覆盖所需字形的授权字体。

## 验证

实际视频为 1920×1080、30 fps、300 帧，画面时长 10.000 秒；AAC 末包使容器时长显示为 10.005 秒。立体声 48 kHz，成片约 1.36 MB。完整解码无错误，blackdetect 未发现黑帧；抽查 11 个时间点，未见缺字或文字裁切。音轨实测约 -16.06 LUFS，真峰值 -1.15 dBTP。

具体过程记录在 [notes.md](notes.md)。未进行跨平台运行、主观音质评审或性能基准测试。

## 来源与授权

- [Remotion](https://github.com/remotion-dev/remotion)：使用其运行时与渲染器，遵循其对应版本的 [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)，不是 MIT。
- [mg-styles-15 扁平矢量提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/prompts/01-flat-vector.md)：用于理解纯色几何、弹性运动、错峰入场、形状转场等风格特征。未复制其动画代码、音轨和成片。
- [Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc)：SIL Open Font License 1.1；保留完整许可，子集字体内部名称为 MotionSans。
- 本项目的文案、SVG 图形、动画编排与合成音频脚本为本次实践创建。
