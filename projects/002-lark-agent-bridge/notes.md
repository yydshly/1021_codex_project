# 研究记录

## 2026-10-20 · 从聊天桥接到会话与运行管理

### 研究范围

用户先后讨论了项目用途、飞书提供的能力、agent 的外部调用方式、跨 agent / 跨平台适配，以及任务管理与适配器的职责。本次将这些理解整理为独立研究子项目和静态网页。

发现 `projects/001-remotion-flat-vector/` 已被其他工作占用，尽管当时尚未进入索引，仍保留其编号，采用 `002-lark-agent-bridge`。

### 版本与证据

- 上游：[zarazhangrui/lark-coding-agent-bridge](https://github.com/zarazhangrui/lark-coding-agent-bridge)。
- 研究快照：`589868119ce9a0a860aaf4936b5f9bac14e72681`，提交说明 `feat: update channel`。
- `package.json`：包名 `lark-channel-bridge`，版本 `0.7.1`，Node.js 要求 `>=20.12.0`。
- 许可证：MIT，版权声明 `Copyright (c) 2026 Lark Channel Bridge contributors`。
- 通过 GitHub API 核实 main 对应 Commit，并读取 README、许可证、版本文件与核心实现。
- 源码仅用于阅读，没有安装上游依赖或启动上游程序。

以下链接均固定到该快照：

| 证据 | 观察到的事实 |
| --- | --- |
| [README.zh.md](https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/589868119ce9a0a860aaf4936b5f9bac14e72681/README.zh.md) | 官方功能、运行方式、权限默认值、工作目录边界；描述本身不等于本次实测 |
| [channel.ts](https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/589868119ce9a0a860aaf4936b5f9bac14e72681/src/bot/channel.ts) | 创建飞书通道，连接消息、权限、附件、队列与展示逻辑 |
| [pending-queue.ts](https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/589868119ce9a0a860aaf4936b5f9bac14e72681/src/bot/pending-queue.ts) | 按 scope 的消息合并、block / unblock；Map 与 Set 存于内存 |
| [run-flow.ts](https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/589868119ce9a0a860aaf4936b5f9bac14e72681/src/bot/run-flow.ts) | 校验目录与运行策略，匹配 agent / cwd / 策略兼容会话，将 system 事件中的会话标识写入关联 |
| [run-executor.ts](https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/589868119ce9a0a860aaf4936b5f9bac14e72681/src/runtime/run-executor.ts) | scope 预留、并发名额、prepareRun / run、事件分发、停止与收尾 |
| [process-pool.ts](https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/589868119ce9a0a860aaf4936b5f9bac14e72681/src/bot/process-pool.ts) | FIFO 等待与可配置并发限额 |
| [agent/types.ts](https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/589868119ce9a0a860aaf4936b5f9bac14e72681/src/agent/types.ts) | 统一 AgentAdapter / AgentRun / AgentEvent 接口 |
| [claude/adapter.ts](https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/589868119ce9a0a860aaf4936b5f9bac14e72681/src/agent/claude/adapter.ts) | 启动子进程，stdin 输入，stream-json 输出，resume 参数，停止与退出等待 |
| [codex/adapter.ts](https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/589868119ce9a0a860aaf4936b5f9bac14e72681/src/agent/codex/adapter.ts) | 子进程输入输出、环境设置、逐行解析与停止 |
| [codex/argv.ts](https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/589868119ce9a0a860aaf4936b5f9bac14e72681/src/agent/codex/argv.ts) | exec --json、会话恢复、目录、图片与权限参数 |
| [claude/stream-json.ts](https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/589868119ce9a0a860aaf4936b5f9bac14e72681/src/agent/claude/stream-json.ts) | Claude 原始事件到文本、工具、结果和结束事件的映射 |
| [codex/jsonl.ts](https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/589868119ce9a0a860aaf4936b5f9bac14e72681/src/agent/codex/jsonl.ts) | Codex thread / item / turn 输出到统一事件的映射 |

补充资料：

- [飞书长连接文档](https://open.feishu.cn/document/ukTMukTMukTM/uYDNxYjL2QTM24iN0EjN/event-subscription-configure-)：本机主动连接，通常不要求公网 IP 或域名；仍需要公网访问能力。
- [飞书消息卡片文档](https://open.feishu.cn/document/common-capabilities/message-card/introduction-of-message-cards?lang=zh-CN)：结构化展示与卡片交互。
- [企业微信机器人 SDK](https://github.com/WecomTeam/aibot-node-sdk)：提供 WebSocket、消息收发、流式回复等；这是接入可行性的资料，不是已完成迁移的证据。

### 从讨论中保留的关键区分

1. **通信与执行**：飞书 ↔ Bridge 是网络通信，Bridge ↔ CLI 是进程输入输出。
2. **本地执行与模型推理**：在本机操作文件，不意味着推理离线或在本地完成。
3. **会话与任务**：会话保存上下文线索；独立任务需要目标、约束、状态和验收。
4. **运行与完成**：Run 的结束事件不能单独证明用户目标已经达成。
5. **适配与调度**：适配器管理一次执行的接入与生命周期；优先级、依赖和验收属于上层策略。
6. **控制边界**：启动、读取、恢复、停止不等于能任意控制 agent 内部步骤；普通插话在本实现中排到下一轮。
7. **隔离边界**：按聊天范围隔离会话，不自动阻止不同会话同时修改同一项目；cwd 也不是沙箱。
8. **扩展边界**：更多 agent 可通过 CLI、SDK、API 接入，但需实现接口并接通配置等分支；迁移聊天平台还涉及飞书卡片、身份和回调逻辑。

### 架构推论（不是现成功能）

从已阅读的核心链路，不能推定已有完整持久化任务系统。未来可以将 Message、Task、Run、Session 分开建模，加入：

- 独立任务 ID、目标、验收条件、关联消息和多次运行记录。
- 持久化队列、优先级、依赖与按项目的资源隔离。
- 对紧急纠正、普通补充、新任务进行明确处理。
- 重试前核对执行事实，避免重复副作用。
- 根据测试、产物或人工结果判断完成状态。

此处没有实现上述任务引擎，也没有对上游做完整审计。网页的比较面板明确标注为架构建议。

### 网页实现

- `app/index.html`：内容、原生语义结构、源码引用占位。
- `app/styles.css`：研究手册式响应布局、桌面侧栏、手机导航、打印和减少动画偏好。
- `app/app.js`：六步链路、管理范围切换、agent 切换、滚动导航状态。
- `app/build.py`：标准库构建，固定源码链接，复制静态资源到 `web/`。
- 没有第三方前端库、遥测、凭据、真实 agent 调用或远程资源加载。
- 截图为本地研究网页真实渲染，不使用上游演示图片或合成截图。

### 验证记录

| 检查 | 结果 |
| --- | --- |
| `python projects/002-lark-agent-bridge/app/build.py` | 通过；静态导出与固定源码链接生成成功，CSS/JS 附带内容哈希查询参数以更新缓存 |
| `node --check projects/002-lark-agent-bridge/web/app.js` | 通过 |
| `python -m unittest discover -s tests` | 6 项测试全部通过 |
| `python scripts/catalog.py --check` | 通过，包含 001 与 002 共 2 项；保留其他工作登记的项目 |
| `git diff --check` | 通过；Git 仅提示已有文件的 CRLF / LF 规范化 |
| 静态结构检查 | 36 个 ID 无重复；37 个链接均有目标，页内锚点完整；2 个本地资源存在，无外部运行时资源 |
| 门户输出 | `_site/projects/002-lark-agent-bridge/index.html` 与子项目网页内容一致 |
| 桌面浏览器 | 检查首屏及适配器等章节，实际操作管理范围切换、agent 切换、步骤按钮与说明展开 |
| 窄屏布局 | 390 / 320 像素 iframe 的内容区分别为 375 / 305 像素（扣除滚动条），scrollWidth 与 clientWidth 相等；修复手机标题单字换行 |
| 窄屏交互 | 在 364 像素宽的浏览器视口中逐一检查六个步骤、最后一步禁用“下一步”、管理范围切换、agent 切换和回到顶部 |
| 真实截图 | `assets/cover.png` 为桌面适配器章节；`assets/mobile.png` 为窄屏首屏 |

上述浏览器检查属于桌面浏览器与窄视口验证，不是实体手机测试。预览工具曾记录两条不带源文件地址的 MutationObserver 错误，页面自身未使用该 API；没有据此声明浏览器日志完全无错误，来源未定位。已操作的页面功能均返回预期状态。

临时窄屏 QA 页面已删除，不进入发布目录。本次未推送、提交或触发 GitHub Pages 部署。

### 未验证项

- 上游安装、扫码绑定、收发真实飞书消息与 agent 文件修改。
- 上游测试套件、跨平台兼容性、吞吐量和长期稳定性。
- 断线重连后的任务恢复、停止时的子进程行为和重复执行处理。
- 多会话共用项目目录时的并发安全。
- 其他 agent / 平台的完整适配和兼容性。
- GitHub Pages 线上部署与公开访问。

### 后续实验建议

先用独立测试项目验证消息到产物的完整链路，再做运行中插话、停止、重启和并发操作实验。只有在记录了执行事实和验收证据后，才能把“文档或代码支持”升级为“实际运行已验证”。

## 2026-10-20 · 一图总结

用户要求把讨论整理成一张可分享的图片，包含库的能力、图解原理、适配器职责与后续价值。

- 图形结构：四模块信息图；原理模块区分网络接口与进程输入输出，并将项目工具与模型服务分别画出。
- 明确边界：会话与运行管理是已阅读实现；持久化任务、项目隔离、故障恢复、产物验收标为未来设计。
- 内置 imagegen 两次调用均因网络错误失败，未产生可用图片。最终改用原创程序化矢量排版，没有调用 API/CLI 生图备选，也不需要密钥。
- 产物：`assets/understanding-map.png`（2880 × 2040）和同内容的 `assets/understanding-map.svg`。
- 源码：`app/generate_infographic.py`。使用 Pillow、Windows 系统字体；没有嵌入或再分发字体文件。
- 已查看实际 PNG，确认四个模块、中文文字、正反向箭头、模型服务边界与未来设计标记可读。图为原理解释，不是上游运行截图。
- 复现：在安装 Pillow 的 Windows 环境，从根目录运行 `python projects/002-lark-agent-bridge/app/generate_infographic.py`。

## 2026-10-20 · 整理摘要与发布交付

- 将仓库摘要、项目说明和网页首屏统一为四个问题：能力、原理、本质、对我们的意义。
- 明确本质是适配器调用 Agent 对外提供的非交互式 CLI、会话恢复和结构化输出能力；Bridge 负责聊天接入、会话关联与运行组织。
- 将生成的 `understanding-map.png` 作为索引封面和网页引导图，支持打开高清原图、下载 PNG / SVG。
- 构建将两种图片导出到 `web/assets/`，以相对地址适配 GitHub Pages 子路径。
- 使用独立 worktree 准备本项目提交，只合入 002 的文件与对应索引条目，保留共享工作区其他研究项目的未提交内容。
- 发布目标：[研究网页](https://yydshly.github.io/1021_codex_project/projects/002-lark-agent-bridge/)；通过总仓库 `Deploy GitHub Pages` 工作流部署。
- 网页发布不涉及安装或运行上游 Bridge，也不改变此前“真实飞书 / Agent 联调未验证”的结论。
