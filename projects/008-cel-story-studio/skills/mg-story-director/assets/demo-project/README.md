# 独立 Remotion 示例

《给你一片海》的配置与专门制作的狐狸、小鲸美术共同驱动画面。这个工程用于独立预览、编辑与渲染同一套有限资产，不包含工作台网页、本机 AI 服务或任意新角色生成器。

## 运行

使用 Node.js 20 或更高版本。在本目录运行：

```sh
npm ci
npm run typecheck
npm run check
npm run studio
```

`package-lock.json` 固定安装依赖，所有 Remotion 直接依赖统一为4.0.537。`npm run studio` 打开 Remotion Studio。默认配置来自 `scripts/flagship-schema.mjs`。完整渲染：

```sh
npm run render
npm run render -- default-config.json out/another-film.mp4
npm run render -- default-config.json out/keyframe.jpg --still=420
```

修改 `default-config.json` 再运行第二条命令。影片输出为 1920×1080、30 FPS、H.264 MP4，并保存实际使用的配置侧文件。第三条命令只渲染第420帧（14秒处），输出 JPG；帧号必须位于影片内，PNG 也可用。首次渲染可能下载 Remotion 所需浏览器；也可通过 `CHROME_PATH` 指定本机已安装的兼容 Chromium 可执行文件。工程不携带浏览器或依赖目录。

仅校验数据、不启动渲染：`node render.mjs default-config.json --check`。此检查不能证明动作、材料或完整作品质量。

## 可以改什么

标题、概述、称呼、强调色、声音、五镜的景别、情绪、字幕、时长，以及专门制作的海洋或星海结尾。每镜1.5–8秒、半秒步长，全片12–30秒。完整约束见上层 Skill 的 `references/example-contract.md` 及实际 schema。

五个事件 `notice → draw → unfold → leap → farewell` 是本故事的依赖关系。替换为别的故事时应重新设计资产、动作与事件契约；不要把狐狸改名为其他角色便声称生成了新的造型或交互。

## 分发内容

完整下载包应包含 `src/flagship/`、`scripts/flagship-schema.mjs` 及类型、`default-config.json`、`public/director-018/`、`public/paper.jpg`、字体与各许可文本，并附带 `package-manifest.json` 的文件哈希。

仓库中的本目录是打包骨架；发布脚本会从最终已完成的影片源码与素材补入这些文件。若下载包缺少上述内容，先取得完整包，不要将缺失文件视为已运行的示例。

## 来源与许可

导演方法与原创示例属于 `008-cel-story-studio` 实践项目。两个环境静帧由内置 ImageGen 新生成，公开创作提示词见 `ASSET-GENERATION.json`；音轨由 `make-score-018.py` 程序合成。纸纹来自参考库 `Vincentwei1021/mg-styles-15` 固定版本 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`，按其 README 的第三方素材声明保留 CC0／公开领域来源，详见 `LICENSES.md`；Noto Sans SC 见 `public/OFL.txt`。示例不包含源库的完整原片或十五个作品。

Remotion 固定为 **4.0.537**，使用其自身许可证，**不是 MIT**；随包 `REMOTION-LICENSE.md` 与 [Remotion 官方许可说明](https://www.remotion.dev/docs/license) 分别提供固定版本文本和当前说明。React 等各依赖保留自身许可，见 `THIRD-PARTY-NOTICES.txt`。上游参考库的 MIT 不会替代这些许可或替本项目未单独声明授权的内容授予 MIT。具体文件对应见 `LICENSES.md`。
