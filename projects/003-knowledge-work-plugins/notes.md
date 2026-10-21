# 研究记录

## 2026-10-20 · 岗位流程与需求参考

### 研究问题

用户希望从此仓库获得以后提出类似需求的参考，而不仅是安装方法或插件功能介绍。本次围绕角色、业务场景、输入、步骤、约束、交付与验收整理。

### 版本与覆盖

- 上游：`https://github.com/anthropics/knowledge-work-plugins`。
- Commit：`a266ab8c3c754a3ccf7a634044fc1595fc06e50e`，本次克隆得到的 HEAD 与先前在线核查一致。
- 日期：2026-10-20（Asia/Shanghai）。
- 许可证：根目录 Apache-2.0，已保存副本，未发现根级 `NOTICE` 文件。
- 环境：Windows PowerShell、Python、Git；上游克隆到系统临时目录，未放入研究仓库或运行任何上游代码。
- 编号：开始时 `projects/002-lark-agent-bridge/` 已存在，即使当时索引尚未登记也保留该编号，本项目使用 003。
- 协作边界：根 README、projects.json 与其他子项目存在任务前 / 并行变更；本次只新增 003，向当前元数据追加自身记录，并用 catalog 脚本更新自动区。

全量清点 17 个顶层插件的元数据与文件入口：181 个 `SKILL.md`、5 个独立命令文件。深入阅读每个顶层插件的代表性流程以及相关共享规则，不宣称对全部 181 个 Skill 做了逐行审计。市场共 123 条记录，其中 5 条指向 `partner-built/`，101 条指向外部仓库；这 106 条仅建立入口索引，未审核具体实现。

### 方法

1. 阅读总仓库 `AGENTS.md`、`docs/project-guide.md`、模板、索引生成器和现有项目。
2. 固定上游 Git 快照，清点顶层插件清单、Skill、Command、连接配置与许可证。
3. 建立 [source-index.json](source-index.json)，保存路径、固定链接、元数据、章节和规范化摘要；生成 [scenario-index.md](scenario-index.md)。
4. 按业务归纳所有顶层插件，深入分析 [workflows.md](workflows.md) 中 17 个代表流程及其引用文件。
5. 抽取约束分类，比较不同插件的审批和降级策略；把上游要求与本研究建议分别标注。
6. 编写需求卡、12 个模板、3 个跨岗位组合例子和效果验证方案。
7. 进行索引复现、链接 / 证据路径检查和总仓库规定检查。

### 关键发现与证据

| 发现 | 静态证据 | 解释与边界 |
| --- | --- | --- |
| 根 README 的 11 个插件与目录不一致 | [根 README][ROOT]；本项目 JSON 统计 | 以固定版本实际清单为准，不沿用首页数字 |
| 任务动作主要位于 Skill | 181 个 Skill，5 个 Command；[客服 README][SUPPORT] 与 [ticket-triage][TRIAGE] | 旧 `/triage` 示例不证明宿主存在该别名 |
| 插件不是全部纯文本 | [QC 脚本][QC]、[生产力 HTML][HTML]、[PDF MCP 配置][PDF] | 文本编排之外可包含脚本、模板与本地工具依赖 |
| MCP 配置存在占位 | [data/.mcp.json][MCP]、JSON 中各插件 `empty_url` | Snowflake / Databricks 等空 URL 不能算接通；非空也不等于可调用 |
| 审批不是全库一种策略 | [销售写回][UPDATE]、[小企业付款][PAY] | 用户授权与连接器权限、两道业务审批分别分析 |
| 状态写回要求读回 | [销售写回 Step 5][UPDATE] | 能提炼“请求成功后仍需核实结果”，但未验证实际工具行为 |
| 看板离线描述与实现不一致 | [看板 Skill][DASH] 中 CDN 引用和离线说明 | 默认模板不能保证首次离线加载图表；严格离线需打包依赖 |
| 无障碍清单混合级别 | [设计 Skill][A11Y] 将 2.5.5 放在 AA 参考表；[W3C 官方说明][W3C] 将其列为 AAA | 规范版本、级别与例外需独立核查；不能照抄速查表作合规结论 |
| 路由与执行职责分离 | [小企业路由][ROUTER] | 区分单次任务、组合业务链与建立自动化；路由 Skill 本身不执行下游工作 |
| 模板不等于岗位事实 | [人力绩效模板][HR]、[财务对账阈值][FIN] | 示例比例与金额需替换为组织标准，不应被模型自动当作事实 |

### 已完成验证

本次实际执行结果：

- `python projects/003-knowledge-work-plugins/app/catalog_upstream.py --source <固定快照>`：生成索引，得到 17 / 181 / 5 及 123 条市场记录。
- `python projects/003-knowledge-work-plugins/app/catalog_upstream.py --source <固定快照> --check`：通过，重新提取与已保存 JSON / Markdown 完全一致。
- 本地 Markdown 链接、固定 GitHub 文件路径、元数据与角色入口一致性：通过。检查了 28 个本地链接、227 次固定源码链接引用、17 个插件的文件计数、Skill 描述非空和引用式链接定义。源码链接是与本地固定检出核对，不是逐条 HTTP 请求。
- `python scripts/catalog.py --update-readme`：通过，登记 3 个项目并生成根 `_site/index.html`；保留当时已有 001、002 元数据。
- `python -m unittest discover -s tests`：6 项测试全部通过。
- `python scripts/catalog.py --check`：通过，登记 3 个项目，README 自动区与元数据一致。
- `git diff --check`：通过；该检查针对 Git 已跟踪差异，不代表对未跟踪研究文件做了业务测试。

### 未验证

- 没有安装 / 运行 Claude 插件，没有使用 Claude Cowork 或 Claude Code 执行这些业务。
- 没有认证任何 MCP，没有读取 CRM、邮箱、人事、财务或生产数据，也没有发送、支付、签署、部署。
- 没有运行生物分析依赖、数仓查询、PDF 服务或上游看板。
- 没有逐个验证市场外部插件、远程 URL 可用性、宿主命令注册或模型遵守约束的稳定性。
- 未实测耗时、成本、准确率、覆盖率或对比直接对话的收益。
- 财务、法律、人事等内容是流程研究，不是现行专业规则审计；除明示的 W3C 条目外，没有逐条核验专业标准。

### 2026-10-20：中文交互式网页

基于上述固定版本研究新增 [交互式网页](web/index.html)，由 `app/build.py` 从研究文档、源码索引和 `app/labels.json` 构建。网页覆盖 17 类角色 / 能力分类、181 个 Skill 入口、17 条详细示范流程、14 类约束和 13 份需求模板。普通 Skill 入口保留原始描述和源码链接，明确区分角色参考流程与该 Skill 的专属流程，避免把 17 条示范误称为 181 条实测业务流程。

已实现角色筛选、关键词检索、分页、流程详情、来源追溯、约束字典、模板切换、编辑、复制和恢复，以及 URL 哈希定位。模板编辑稿仅保留在当前页面会话中。静态资源全部随项目保存，没有远程 JavaScript、字体或样式依赖。

本次验证：

- 构建成功；核对 17 / 181 / 17 / 14 / 13 的覆盖数、Skill ID 唯一性、模板非空、流程来源和步骤完整性。
- `node --check projects/003-knowledge-work-plugins/app/app.js`：通过。
- 核对 HTML 本地资源、源码与导出文件一致性、许可证副本和四张截图；临时移动端检查页面已移除。
- 在本地 HTTP 预览中实际检查桌面页面及 390 像素窄屏布局；验证角色筛选、销售 36 条结果的分页、搜索与空结果、流程详情、模板切换 / 编辑 / 恢复、约束复制反馈。抽查浏览器错误日志为空。
- 点击复制后，页面在复制 API 返回成功后显示成功反馈；未验证跨应用粘贴。浏览器自动化的虚拟剪贴板与页面剪贴板不共享，不能据此声称已完成操作系统剪贴板端到端测试。
- `python scripts/catalog.py --update-readme`、`python scripts/catalog.py --check`：通过，当时登记 4 个项目，保留其他项目条目。
- `python -m unittest discover -s tests`：6 项测试通过；`git diff --check` 通过。

`assets/cover.png`、`assets/templates.png`、`assets/workflow-detail.png` 和 `assets/mobile-preview.png` 是本研究网页的实际预览截图，不是上游 Claude 产品运行截图。窄屏截图使用宽度为 390 像素的预览框。

验证边界：网页尚未发布；此次验证通过本地 HTTP 完成，自动化浏览器不允许 `file://` 导航，因此未直接验证双击 HTML 的浏览器行为。复制功能有兼容回退和失败时手动复制提示。网页的交互验证不改变此前“未安装上游插件、未执行真实业务”的结论。

### 后续实验（未执行）

从自己的真实高频任务中选择一项，例如开源库研究、工单分诊或周报。使用普通需求、详细流程直接对话、插件 / Skill 三种方式，在相同输入与权限下比较事实错误、遗漏、补充次数和返工成本。样本包含缺输入、冲突来源、权限拒绝和外部材料夹带指令；高后果写入使用沙箱。方案见 [request-playbook.md](request-playbook.md)。

[ROOT]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/README.md
[SUPPORT]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/customer-support/README.md
[TRIAGE]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/customer-support/skills/ticket-triage/SKILL.md
[QC]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/bio-research/skills/single-cell-rna-qc/scripts/qc_analysis.py
[HTML]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/productivity/skills/dashboard.html
[PDF]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/pdf-viewer/.mcp.json
[MCP]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/data/.mcp.json
[UPDATE]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/sales/skills/update-opportunity/SKILL.md
[PAY]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/small-business/skills/pay-the-bills/SKILL.md
[DASH]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/data/skills/build-dashboard/SKILL.md
[A11Y]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/design/skills/accessibility-review/SKILL.md
[W3C]: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
[ROUTER]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/small-business/skills/smb-router/SKILL.md
[HR]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/human-resources/skills/performance-review/SKILL.md
[FIN]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/finance/skills/reconciliation/SKILL.md

## 2026-10-21 · 具体业务控制与价值深化

### 研究范围与判断方法

继续使用 `a266ab8c3c754a3ccf7a634044fc1595fc06e50e`，未追踪上游新版本。对 W01–W17 的已有流程逐项补充具体业务、输入检查、异常处理、人工审批、验收用例及直接对话价值比较。181 个 Skill 的索引覆盖不变，其余 164 个入口不被标成已完成同等深读。

核对固定版本本地检出中的代表 Skill，重点追踪 call-prep 权限拒绝与来源动作、pay-the-bills / ap-processor 双门、reconciliation 复核、change-request 审批字段、PDF 外部服务配置、QC 脚本检查与过滤逻辑，以及插件创建的外部 CLI 校验与降级路径。证据链接与本地固定检出的 26 次文件引用逐一核对；未通过执行外部服务来验证。

结论分为三层：提示词约束表达模型应遵守的规则；程序静态证据只能说明特定实现逻辑；真实系统强制控制需要认证、对象权限、状态与版本校验和拒绝路径测试。本轮所有“系统强制控制”都是建议补齐的设计，未声称已经部署。未见程序实现的陈述限于核对的流程文件，不外推为外部连接器没有控制。

特别记录：付款的两次批准不能只靠对话历史维持，建议绑定具体发票与付款版本并配合幂等；现金缺失时增加例外审批是本研究增强建议，上游只明确要求披露缺口。销售并非所有写操作都重新询问。PDF 的批注、填表和签名图流程不能混成统一审批；QC 便利脚本会实际过滤，纯诊断应选模块化路径。

### 文档与网页更新

- 新增 `business-analysis.json` 作为 17 个流程深化内容来源，构建生成 `business-analysis.md`，网页与报告共用内容。
- 每条流程覆盖三层控制、上游 / 建议审批、异常分支、3 条参考验收和价值指标，共 51 条待执行验收用例。
- 增加“业务落地”页面，提供三层解释、A 普通提问 / B 完整流程直接对话 / C 插件三组比较方案和全部代表流程入口。
- 流程详情增加可展开的输入、控制、异常、审批、验收与价值栏目；关键词检索包含新分析。
- 17 份流程草稿、12 份场景模板合并具体业务要求；通用任务卡补充控制责任、异常与验收字段。简版 Markdown 模板保留并链接完整版。
- 新截图 `business-analysis.png`、`business-payment-controls.png`、`business-mobile.png` 均为本研究网页实际预览，不是上游运行截图。

### 实际验证结果

- 上游索引 `catalog_upstream.py --check` 通过：17 个顶层插件、181 个 Skill、5 个 Command、123 个市场条目，固定检出未被更改。
- `app/build.py` 构建与 `node --check app/app.js` 通过。检查 17 个流程映射、51 条验收、13 份补充模板、26 次固定来源引用、生成文档、静态资源与截图，均通过。
- 浏览器实际检查：新增总览、付款的三层控制与审批 / 异常 / 验收展开、PDF 手机详情、QC 程序证据链接、“幂等”关键词搜索、通用卡字段、对账模板编辑与恢复；抽查控制台无错误。
- 390×844 视口下检查导航、单列内容和 PDF 弹窗；测得页面宽度 375、弹窗滚动宽度 322，小于视口 390，没有横向溢出。检查后已恢复浏览器默认视口。
- 复制按钮得到浏览器复制 API 成功后的反馈；未新增跨应用粘贴测试，沿用此前说明的验证边界。
- `python scripts/catalog.py --update-readme` 和 `python scripts/catalog.py --check` 通过：当前登记 8 个项目，保留其他项目内容。
- `python -m unittest discover -s tests`：6 项通过；`git diff --check` 通过。

没有运行 51 条上游业务验收，没有连接真实账本、HR、CRM、支付或生产系统，没有执行价值对照实验，也没有发布网页。报告中的验收清单与价值指标是后续实践方案，不能与上述网页和构建检查的通过结果混淆。

## 2026-10-21 · 用具体工单演示实际流程

用户希望通过真实场景演示理解价值，随后确认暂时没有自己的业务材料。本轮构造虚构白屏工单、两条关联资料与三组事实，明确不称为真实客户事件。业务方法取自已固定的 `customer-support/skills/ticket-triage/SKILL.md`。

### Claude 调用尝试

发现本机 Claude Code 2.1.90 与已有 OAuth 登录记录后，实际运行普通对话 A 组请求。请求返回 401、OAuth access token has expired；A 未产生有效答案，B（相同 Skill 全文直接提示）与 C（临时加载客服 Skill 子集）未运行。没有声称完成 Claude 插件实测、没有捏造普通对话与插件差异，也没有修改认证、安装全局插件或接入业务 MCP。失败记录保存在 `demo/results.json` 和 `demo/A-response.md`；脚本 `app/run_live_demo.py` 保留后续复现配置。记录中没有凭据或认证调试文件。

### 实际完成的演示

新增 `app/demo_server.py`、`app/live-demo.js`，演示客户原话 → 补齐影响事实 → 查关联资料 → 分级和回复草稿 → 人工批准 → 本地分派 → 读回和去重。事实、分级和回复由公开的确定性演示程序生成，不能当作模型推理。批准无真实人员认证，仅用于验证版本与状态门。

新增服务端控制是本研究编写的程序，不是上游原有能力。未批准分派返回 403；旧版本返回 409；缺关键事实返回 422；更改事实或查重状态使批准失效；并发或重复提交同一批准内容仅产生一次分派。分派结果始终不表示已解决，客户回复始终未发送。

`app/record_demo.py` 对全新临时服务执行 15 次真实 HTTP POST，并最终 GET 读回；保存每步完整状态到 `demo/execution-record.json`。静态网页“实操演示”使用这些实际响应快照逐步回放，不伪装成现场调用。运行本地服务后可进行新的操作；停止服务仍可直接打开静态 HTML 回看。说明见 `demo/README.md`。

### 验证

- 15 次 HTTP 检查及最终读回通过，覆盖缺事实、未批准、旧版本、批准失效、重复去重、资料不可用与 P1 / P3 切换，记录保留 2 条分派且均未发送回复 / 未关闭工单。
- 5 项专项测试通过，另含 8 个并发重复分派仅写 1 条、跨源请求拒绝和非对象 JSON 拒绝。
- 浏览器实际操作确认 P1 → P3、403 拒绝、批准后变更再次拒绝、成功分派、重复去重和读回。检查中发现演示按钮的 `data-mode` 与全局场景筛选处理冲突，已限制全局处理范围并复核查询分支。
- 静态服务回放的选择步骤、上一 / 下一步及批准 / 分派数量变化符合保存记录，控制台无错误；390×844 窄屏页面滚动宽度 375，无横向溢出，已恢复默认视口。
- Python AST、两份 JS 语法、导出源码一致、15 个快照字段、批准失效与去重断言、文档链接和资源检查通过。
- 总仓库 6 项单元测试与 catalog 校验通过，保留当前 8 个项目；`git diff --check` 通过。
- `ticket-demo.png`、`ticket-demo-controls.png`、`ticket-demo-replay.png`、`ticket-demo-mobile.png` 均为研究网页的实际截图。

这些结果证明本地演示的相应程序行为，不证明 Claude 已遵守 Skill 或真实客服系统具备同等控制。没有生产部署或外部消息发送。预览与演示服务用于本轮检查，结束时停止；用户可按文档重新启动。

## 2026-10-21 · 一张能力全景图

按“本质 → 全部角色与场景 → 执行过程 → 工单演示 → 三层控制 → 意义”制作一张中文长图，明确本质为 Claude 插件集合，Skill 承载业务 SOP，模型配合工具执行。17 类均列出，181 项按业务归纳，不把所有 Skill 数当成互不重叠业务数，也不把岗位名当作权限角色。

图中保留具体案例的 P1 / P3 分流、403 拒绝、版本变更失效与 409、成功分派和重复去重；注明客户数据为虚构、分级由演示规则计算、本地程序为本研究新增。Claude 认证失败与模型对照未完成也写入图中，没有将示意流程升级为真实 Claude 能力证明。

交付 `assets/capability-map.svg`（2000×3140，可编辑）和 `assets/capability-map.png`（4000×6280）；`capability-map-preview.png` 为检查用低分辨率副本。生成源码 `app/draw_capability_map.py` 共用文字与坐标输出 SVG / PNG，读取固定索引与标签并校验 17 个角色、181 个 Skill 以及已保存演示状态码。本次使用 Pillow 11.3.0 和 Windows 微软雅黑。图形直接由代码绘制，无远程素材或生成模型。

网页新增“全景图”入口、高清 PNG / SVG 链接及工单实操入口，`build.py` 复制正式图到 `web/`。README 与工具说明同步更新，未修改上游研究版本或扩大市场审核范围。

验证：检查全部 17 个中文角色、关键范围与控制标签、SVG XML、PNG 尺寸和源 / 导出文件一致性；实际检查 SVG 在网页加载（自然尺寸 2000×3140）、中文排版、图示到工单回放的跳转，控制台无错误。390×844 窄屏页面宽度为 375，没有横向溢出，恢复默认视口。截图 `capability-map-page.png` 为本地网页实际预览。

`python -m unittest discover -s tests` 6 项通过，`catalog.py --update-readme` 和 `catalog.py --check` 通过，保留当前 8 个项目；JS 语法与 `git diff --check` 通过。以上为图示、网页与仓库检查，不是新的业务或模型效果测试。
