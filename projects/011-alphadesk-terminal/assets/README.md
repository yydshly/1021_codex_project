# 截图来源

2026-10-22 实际浏览器截图：

| 文件 | 内容 |
| --- | --- |
| `cover.jpg` | 中文教学总览，虚构数据 |
| `mcp-lab.jpg` | 真实工具定义与教学响应 |
| `filings-reader.jpg` | 虚构公告阅读器 |
| `options-demo.jpg` | 合成期权展示 |
| `mobile-layout.jpg` | 390px CSS iframe，非手机硬件截图 |
| `original-account.jpg` | 上游 Account 实际运行，无供应商凭据 |
| `original-markets.jpg` | 上游 Markets 实际运行，显示缺少来源 |

`upstream/` 中 home、markets、chart、news、earnings、options 六张 JPG 来自 [固定提交 landing 目录](https://github.com/vigneshv1cky/alphadesk-terminal/tree/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/ui/public/landing)，保留 AGPL-3.0-only 许可。原作者模糊数值，这些是宣传资源，不是本次连接供应商的证据。构建复制到 `web/media/`。

第二阶段实际截图：`real-chart.jpg` 为 Yahoo 数据的原版图表，`real-markets.jpg` 为真实图表/单股报价看板（国债模块未入镜），`real-calendars.jpg` 为政府事件表与经济日历缺密钥提示（IPO 未入镜）。这些不是虚构数据，也不是上游宣传图；现已复制到 `web/media/`，作为研究专题的历史运行证据展示；不是实时数据。

研究专题截图：`research-cover.jpg` 为新的默认专题首屏，`research-architecture.jpg` 为交互架构区，`research-mobile.jpg` 为 390 × 844 CSS 视口响应式检查（非手机硬件）。截图由本次实际浏览器运行取得，不是设计稿。

`research-thinking.jpg`：七维度研究思考章节的实际浏览器截图，展示实现事实、设计启发与迁移边界。

`architecture-full.svg` / `architecture-full.png`：依据上游固定提交与本项目历史实测报告绘制的核心架构全景图，主体为代码绘制的架构示意，三张原版历史实跑截图嵌入行情、政策日历和组合研究对应行，非生成式模型图片。由 `app/build_architecture.py` 同时生成，分别为 2800 × 2630 与 5600 × 5260；遵循本项目 AGPL-3.0-only 许可。SVG 中源码标注可点击。

`architecture-browser.jpg`：全景 SVG 的实际浏览器完整渲染截图，用于验证中文、布局与图内完整内容；不代表新增供应商实测。

合图中的三张截图完整嵌入 SVG（原始 JPEG 字节保留），下载后无需外部图片依赖。PNG 由同一布局导出；原图没有补画或更换数据。能力说明区分截图可见内容与接口报告。

当前图按信息方向横向展开来源、获取、处理与呈现；顶部是精简核心架构。新闻与公司披露使用明确标注的功能示意，没有补画虚构新闻、公告或财务值。社交镜像作为独立 RSS 帖子流标注，不混入新闻文章处理链。
