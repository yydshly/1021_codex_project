# 本轮新生成的素材与提示词

使用内置 **ImageGen**，未使用 CLI/API 回退。生成日期：2026-10-21。下列文件已复制进项目，运行和构建不依赖生成目录，也没有沿用源库的肖像、猫或拼贴主题。

## 深海电台图集

- 保存文件：[app/public/effects/ocean-atlas-v2.png](app/public/effects/ocean-atlas-v2.png)
- 1254×1254，RGBA，真正透明背景。
- 用途：四个独立剪贴对象，Canvas 按其实际透明轮廓边界取图；保留原图，不另行修改生成图像。
- 消费代码：`app/src/effects/canvas-v2.ts` 的 `atlas` 与 `collage`。
- 原始生成文件：`D:/codex/home/generated_images/01a15988-0b1f-7a13-8f07-462ca3ad89f3/exec-00c8cf1f-0cd8-4853-9df2-2e903a10fb2c.png`，已保留。

完整提示词：

> Use case: stylized-concept. Production asset for an original animated collage titled Midnight Ocean Radio. Create a transparent sprite atlas in a precise 2 by 2 grid, equal square cells, large isolated objects each centered inside its own cell with at least 12% clear padding. Top left: richly detailed vintage red-orange portable radio with chrome knobs and woven speaker. Top right: luminous nautilus seashell with pearlescent chambers. Bottom left: surreal cobalt blue jellyfish, delicate trailing tentacles fully contained. Bottom right: a tiny silver space-suited deep-sea diver holding a glowing amber lantern. Exquisite tactile photographic paper-cut collage objects with thin irregular cream paper borders, analog magazine halftone details, convincing dimensional materials, art-directed surreal editorial quality. Each object a separate clean silhouette. No text, no labels, no shared shadows, no backgrounds. Entire canvas genuinely transparent; no checkerboard.

检查：实际对象没有严格落在等大四格内；已经根据透明连通域边界调整取图，避免把相邻对象裁入。没有把图集当作整张静态视频背景，四个对象分别定位、旋转和进入画面。

## 夜班水豚咖啡馆

- 保存文件：[app/public/effects/night-cafe-v2.png](app/public/effects/night-cafe-v2.png)
- 1672×941，RGB。
- 用途：花字短片背景，留出左侧文字区域；代码控制取景、微推进、文字和情绪符号。
- 原始生成文件：`D:/codex/home/generated_images/01a15988-0b1f-7a13-8f07-462ca3ad89f3/exec-a7033441-3f13-486a-919d-ed7bf0effaa8.png`，已保留。

完整提示词：

> Use case: photorealistic-natural. Production background plate for an original light-hearted motion typography film about a sleepy night-shift cafe called One More Cup. A charming realistic capybara wearing a small indigo canvas apron sits behind a beautifully crafted walnut espresso bar, gently cradling a small ceramic espresso cup in its front paws. It looks very relaxed with a subtly amused expression, eyes and face clearly visible. Editorial cinematography with exceptionally tactile fur, ceramic glaze, weathered wood, warm amber practical lights, deep emerald shadows, a rainy window with bokeh in the background. Subject occupies right half of a widescreen 16:9 composition, left half has dark soft-focus cafe negative space for animated typography. Medium close portrait, face near upper-right third, camera at eye height. Rich cinematic contrast, warm copper and cream highlights, slight 35mm film grain. No text, no watermarks, no letters on cup. Standalone single image, not storyboard, not multiple panels.

检查：主体脸部和杯子完整，文字区域有足够对比度；最终叠加的文字均由 Canvas 绘制，不依赖图片内文字。

## 配乐

`app/scripts/make-effect-scores.py` 生成五种原创合成音乐，文件为 `score-warm.wav`、`score-paper.wav`、`score-pulse.wav`、`score-rain.wav`、`score-cafe.wav`，位于 `app/public/effects/`。只使用确定性正弦、泛音、包络和种子噪声，不引入第三方音频样本。配乐可关闭，旧配置没有 `sound` 时保持无声。
