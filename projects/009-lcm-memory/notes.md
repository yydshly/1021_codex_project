# LCM 研究记录

研究日期：2026-10-21（Asia/Shanghai）。固定提交：`0c17dbffda452cf7fae46929af427dff355aeaa3`。

## 从讨论到网页

讨论顺序为：库有什么能力 → 自带记忆之外的价值 → 如何接入 → 如何保存 → 如何检索 → 汇总为研究网页。页面沿相同问题链组织，不将 README 宣传语直接当作验证结果。

核心结论：外部存储与整理让历史可查，检索与上下文注入让部分历史进入当前推理。这里没有改变模型参数，也没有无限上下文保证。

## 源码证据地图

以下相对路径均位于 [固定研究提交](https://github.com/lossless-claude/lcm/tree/0c17dbffda452cf7fae46929af427dff355aeaa3)。

| 研究点 | 源码入口 | 已确认行为 |
| --- | --- | --- |
| 项目标识 | `src/daemon/project.ts` | 规范化项目目录的 SHA-256 用于存储目录 |
| 数据结构 | `src/db/migration.ts` | conversations、messages、message_parts、summaries、context_items、promoted 及关系表 |
| 压缩 | `src/compaction.ts`、`src/store/summary-store.ts` | 生成摘要、关联来源、替换上下文引用；正常压缩不删除原始消息 |
| 默认保护范围 | `src/db/config.ts` | 最后 8 条消息；叶级块预算 20000 tokens；高层摘要目标 900 tokens，都是可配置参数 |
| 摘要提升 | `src/promotion/detector.ts`、`src/daemon/routes/promote.ts` | 关键词、架构模式、层级和压缩比规则；复制合格摘要正文 |
| 事件提升 | `src/daemon/routes/promote-events.ts` | 按事件优先级及重复证据处理；部分模式要求 3 次出现且跨 2 个会话 |
| 去重 | `src/promotion/dedup.ts` | BM25 匹配，保留主要条目，合并标签与置信度，其余归档 |
| 自动提示 | `src/daemon/routes/prompt-search.ts` | 查询长期条目、规则评分、冷却、可选历史补充、按预算选取 |
| 历史层 | `src/search/native-history.ts` | 原文与摘要分别检索、按会话融合名次、控制分布与摘要份额 |
| 提示渲染 | `src/hooks/memory-context.ts` | 片段去重、字节预算、memory-context 块与来源 ID |
| 主动查询 | `src/daemon/routes/search.ts` | 默认查询 episodic 与 promoted；支持可选 pivotQuery；不套自动提示时间衰减 |
| 恢复 | `src/daemon/restore/index.ts`、`src/daemon/restore/memory.ts` | 客户端与触发原因决定恢复路径；180 天是其中长期条目恢复的筛选条件 |
| 客户端区别 | `src/hooks/codex.ts`、`src/hooks/user-prompt.ts`、`hooks/lcm-hooks.ts`、`hooks/omp/lcm.ts` | Codex / OMP 的 prompt-search 开启 nativeHistory；当前 Claude 路径未开启 |

## 评分示例设计

示例不访问数据库，不执行 FTS5，不使用真实用户会话。候选文本与匹配分均为人工设定。

计算部分为：

```text
base = |BM25 rank| × 0.5^(ageHours / 24) × sessionAffinity
usageBoost = 1 + 0.75 × n / (n + 1)
示例得分 = base × usageBoost
```

跨会话权重为 0.85；同会话为 1；示例使用默认提示门槛 2。没有模拟无使用惩罚、陈旧惩罚、冷却、历史补充或字节裁剪，页面明确说明这些限制。

已观察的控件结果：A 在 24 小时、0 次使用下为 5.10；168 小时、0 次使用下约 0.08；168 小时、3 次使用下约 0.12。重置恢复 24 小时与 0 次使用。

## 网页验证

- 已运行 `app/build.py`，产物位于 `web/`，固定版本链接已展开。
- `node --check web/main.js` 通过。
- 本地 HTTP 预览正常，实际浏览器截图保存到 `assets/cover.png`。
- 浏览器验证：阶段切换、长期记忆详情切换、高层摘要及叶级来源展开、检索锚点导航、年龄滑块、使用次数选择、重置均有可见结果。
- 浏览器错误日志查询未返回错误。
- HTML 片段链接、重复 ID、本地资源检查通过；HTTP 返回 200。
- `python -m unittest discover -s tests`：6 项测试通过。
- `python scripts/catalog.py --check`：通过，9 个项目索引有效。
- `git diff --check`：通过。
- 直接 file URL 被内置浏览器协议策略拒绝；未绕过该限制，页面验证通过本地 HTTP 完成。
- `assets/retrieval.png` 保存检索演示区域的实际截图。
- 实际浏览器检查为桌面视口；实现了窄屏布局、横向表格滚动、键盘焦点与减少动态效果样式，未宣称移动真机已验证。

## 未完成的上游实测

- 未安装 LCM 或启用客户端 Hook / MCP。
- 未复现上游检索或摘要基准。
- 未测中文连续文本、指代、省略、跨语言查询的召回。
- 未测旧结论被新决定取代后的冲突处理。
- 未验证外部模型费用、摘要质量、脱敏覆盖、历史捕获完整性。

后续应选用有明确预期答案的中文项目会话，分别评估“保存了什么”“找回了什么”“AI 是否正确引用”。目前不报告实际收益百分比。


## 第二轮补充（2026-10-21）

- 增加六步虚构排错案例，显示每一步的处理方、产物、限制与固定版本源码链接。以主动 store 为案例入口，避免把规则提升误写成必然自动提炼事实。
- 分开解释启动 restore、问题 prompt-search、AI 主动 search 三条路径，注明评分控件仅示意第二条路径。
- 增加明确对象、模糊指代和新旧冲突三种提问情境。均为预设解释，不运行真实 FTS5 或 AI 查询。
- 增加五项可核对证据的待实测方案、三类效果指标和八项术语速查；没有将待执行方案标成实验结论。
- 扩大正文阅读字号，补充案例、检索路径、验证表格的窄屏布局。
- 修正零次使用反馈时仍暗示有反馈加成的说明；表头改为“示例得分”，避免暗示这是完整生产评分。

### 本轮验证记录

- 浏览器实际观察宽度约 702 像素：主导航、案例六按钮、堆叠内容与提问情境排列正常；不代表手机真机测试。
- 六步案例逐个前进得到 2/6、3/6、4/6、5/6、6/6；末步下一步禁用；返回得到 5/6；直接选择第三步显示对应摘要。
- 案例链接随步骤更新并包含固定提交；页面没有把 SOURCE 占位符送入链接。
- 模糊指代与新旧冲突切换显示对应解释；术语表能够展开。
- 评分年龄最大值后重置回到 5.10；零反馈说明正确；浏览器未捕获控制台错误。
- 新截图：`assets/case-study.png`、`assets/query-examples.png`。`assets/cover.png` 保留首版桌面首屏记录。
- 本轮 HTML ID、锚点、本地资源、源码链接占位符检查通过；HTTP 200。
- 本轮 JavaScript 语法检查通过；仓库 6 项单元测试通过；9 个项目索引校验与 git diff --check 通过。


## 第三轮：外部记忆一图全解（2026-10-22）

### 交付物

- `assets/lcm-external-memory.svg`、`assets/lcm-external-memory.png`：同一张原创技术解释图，2400 × 4220。
- `app/create_overview.py`：使用 Pillow 测量与绘制文本，同时输出矢量 SVG；依赖 Windows 微软雅黑字体。网页运行不依赖绘图环境。
- `app/src/overview.html`、`overview.js`：独立总图页；主网页新增一图模块。
- 构建时将总图复制到 `web/media/`，无需访问上层目录，适合仓库静态门户部署。

### 信息架构

1. 本质：外部项目记忆，交互记录保存与相关上下文回流。
2. 交互：宿主触发 Hooks，模型经 MCP / CLI 主动调用，两者都能读写。
3. 后端：原始历史、工作上下文引用与摘要、长期条目；模型生成摘要并保留来源关系。
4. 功能链路：捕获、保存、摘要、长期登记、检索、使用；注明并非固定同步顺序，store 可直接写入。
5. 召回路径：启动恢复、问题自动提示、AI 主动追查；图区分评分适用范围与客户端差异。
6. 场景与意义：持续研究、排错复用、决策追溯、受支持客户端接续；均注明收益为机制预期。
7. 成立条件：捕获、召回、有效性、模型使用，以及脱敏、外部模型与成本限制。

### 本轮验证

- 总图 PNG 已进行视觉检查；SVG 使用 view 元素定义五个模块视图，保持同一份图形来源。
- 浏览器确认独立图页的全图与五个模块切换，图片地址、说明文字同步改变；主网页模块切换和文字版展开通过。
- 浏览器控制台未捕获错误。实际页面截图：`assets/overview-module.png`。
- HTML、跨页锚点、SVG 模块片段、媒体文件一致性、HTTP 200、Python 与 JavaScript 语法检查通过。
- `python -m unittest discover -s tests`：6 项通过；`python scripts/catalog.py --check`：9 个项目通过；`git diff --check` 通过。

未运行上游 LCM，没有新增真实效果数据。所有来源仍固定为 0c17dbf。


## 远端提交与网页部署（2026-10-22）

- 从远端最新 main 建立独立发布工作区，只提交 009 子项目及其索引，保留已发布项目与本地并行研究。
- 发布提交：`c93c03ef33779dbeb9f81e743c0f0a12073b7011`。
- 项目名称：LCM：AI 编程助手的外部项目记忆。
- 索引摘要直接说明外部记忆能力、Hooks / MCP / CLI 接入、SQLite 与分层摘要原理、持续研究 / 排错 / 决策追溯场景和预期价值；未将收益表述成实测结果。
- 引导图：`assets/lcm-external-memory.png`，使用本研究生成的总图。
- 发布工作区：6 项单元测试通过；6 个远端索引条目校验通过；JavaScript 语法与暂存差异检查通过。
- [提交校验 CI](https://github.com/yydshly/1021_codex_project/actions/runs/39640016913)：成功。
- [GitHub Pages 部署](https://github.com/yydshly/1021_codex_project/actions/runs/39640020426)：成功。
- [在线研究网页](https://yydshly.github.io/1021_codex_project/projects/009-lcm-memory/) 与 [独立图解](https://yydshly.github.io/1021_codex_project/projects/009-lcm-memory/overview.html) 返回 HTTP 200。
- 在线 main.js、overview.js、SVG、PNG、门户封面资源均返回 HTTP 200；PNG 与本地生成图的 SHA-256 一致。
- 门户 HTML 已核对能力摘要与生成总图路径；浏览器验证图解切换、年龄衰减、重置至 5.10，未捕获控制台错误。
- 实际线上截图：`assets/deployed-page-20261022.png`。

本次发布的是研究网页和解释图，仍未运行上游 LCM 做收益实测。
