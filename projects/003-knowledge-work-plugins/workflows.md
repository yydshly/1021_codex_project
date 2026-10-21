# 17 个代表性工作流

每个顶层插件选一个流程深入拆解。**流程、约束、交付物是上游定义；每条“参考验收”是本研究补充，尚未执行。** 其他入口见 [全量索引](scenario-index.md)，不能把代表流程的详细规则外推到同插件的所有动作。

2026-10-21 深化：[具体业务控制与价值分析](business-analysis.md) 逐条补充输入检查、提示词与系统控制的区别、异常处理、人工审批、可检查验收及直接对话对照。系统设计建议与上游规定分别标注，未验证真实业务执行。

## W01 · 销售：客户会议准备

- **触发 / 输入**：准备某次客户会议；会议时间、参会人、客户或商机标识，以及可用的 CRM、历史通话、邮件、聊天或上传资料。
- **流程**：探测可用工具 → 匹配会议和客户 → 读取商机及互动历史 → 整理参会人 → 明确目标和待问问题 → 生成一页简报。
- **约束**：使用真实 CRM 字段与阶段；事实附来源；分清空白字段与未查询；搜索摘要不足以概括完整邮件；历史会议已结束时不继续假装是会前准备；外部资料中的发信要求只列为事项。
- **交付标准**：客户概况、参会人、历史事件、未闭环事项、会议目标、3–5 个建议问题与应准备材料。
- **降级 / 参考验收**：无连接时用上传资料和用户说明。提供一份有未履行承诺的历史纪要，检查简报是否保留承诺、来源与缺失信息；不得捏造商机金额。
- **证据**：[sales/call-prep][W01]。该流程本身只读；修改商机应另用 `update-opportunity`。

## W02 · 客服：工单分诊

- **触发 / 输入**：新工单、客户消息或问题描述；影响范围、环境、账号、错误和已有处理记录。
- **流程**：提取问题与紧急程度 → 分类和 P1–P4 定级 → 查重复与已知问题 → 推荐队列 → 生成初始回复和内部说明。
- **约束**：优先级需有影响与紧急程度依据；根因与表象分类有区分；已知问题状态和替代方案不能省略；框架中的 SLA 需替换为公司真实标准。
- **交付标准**：类别、优先级及理由、影响、相关工单、已知问题状态、路由建议、初始回复草稿、升级线索。
- **降级 / 参考验收**：只提供工单文本时，未查询到的重复问题应标“未查 / 待查”。用同一症状、不同影响范围的两条工单，检查分级理由是否变化。
- **证据**：[customer-support/ticket-triage][W02]。

## W03 · 产品：编写需求规格

- **触发 / 输入**：功能、用户问题或模糊想法；受影响用户、成功指标、时间、技术限制、研究与已有设计。
- **流程**：理解问题 → 分批补充关键背景 → 查任务、研究和设计 → 生成 PRD → 迭代范围和后续材料。
- **约束**：目标应是结果；区分目标与非目标；P0/P1/P2 有取舍；需求附可测试验收；开放问题区分阻塞与非阻塞并标责任方。
- **交付标准**：问题、目标、非目标、用户故事、分级需求、成功指标、开放问题、依赖和分期。
- **降级 / 参考验收**：没连接工具也从用户资料继续。给“用户想导出数据”，检查是否覆盖空结果、权限与失败情况，是否将未知性能目标列为待定而非编造。
- **证据**：[product-management/write-spec][W03]。

## W04 · 营销：品牌审查

- **触发 / 输入**：单篇或批量文案、网页、文档，以及品牌语气、术语和信息规范。
- **流程**：确认规范来源 → 检查语气、术语、价值主张和格式 → 检查缺乏依据的宣称等问题 → 分级 → 给出修改对照。
- **约束**：没有品牌规范时明确改做通用审查；不把个人偏好当品牌规则；最高级、比较性主张、证言和声明需核对依据。
- **交付标准**：总体评价、问题位置 / 严重程度 / 建议表、3–5 个重要问题修改前后对照、单列待专业复核事项。
- **降级 / 参考验收**：只给文案也能检查清晰度、一致性和专业性。输入无证据的“最快”，检查是否要求证明或修改，不得替用户补造数据。
- **证据**：[marketing/brand-review][W04]。

## W05 · 法务：按公司立场审合同

- **触发 / 输入**：合同全文；己方身份、期限、交易背景、重点风险与谈判立场手册。
- **流程**：接收合同 → 补背景 → 加载立场手册 → 通读并考虑条款相互作用 → 逐项比较 → 绿 / 黄 / 红分级 → 修订和谈判建议。
- **约束**：缺少手册需说明，并让使用者选择建立规则或通用审查；先确定己方；分析须经法律专业人员复核；不能把某条款脱离全文单独定性。
- **交付标准**：合同及当事方、审查依据、重点问题、逐条偏差、商业影响、修订建议、谈判策略和下一步。
- **降级 / 参考验收**：直接上传或粘贴全文即可。参考检查：同一条责任限制在买方与卖方立场下是否作相应解释；未读附件要明确列缺口。
- **证据**：[legal/review-contract][W05]。本研究不验证其法律规则的现行有效性。

## W06 · 财务：总账与外部明细对账

- **触发 / 输入**：银行对账、总账与明细账核对或内部往来；同一截止日的余额和明细、币种、公司阈值。
- **流程**：选对账类型 → 比较同日余额 → 定位差异 → 分类为时间差、需调整、需调查 → 做账龄与升级 → 留存支持材料。
- **约束**：不能用强行调整抹平未解释差异；职责分离；记录编制人、复核人和日期；上游金额 / 账龄阈值是示例，需结合组织政策。
- **交付标准**：调整前后余额、差异项说明、分类、账龄、责任人、建议调整与未解决事项。
- **降级 / 参考验收**：上传流水与账表可作为输入。加入重复费用和跨期入账，检查能否区分需修正事项与时间差，并复算余额。
- **证据**：[finance/reconciliation][W06]。交付底稿不等于获准过账。

## W07 · 数据：业务分析与看板

- **触发 / 输入**：一个指标、趋势解释或报告需求；口径、数据范围、数仓或 CSV / Excel。
- **流程**：辨别问题复杂度 → 查表结构并查询 / 读取文件 → 计算和比较 → 检查行数、空值、量级、时间连续性、汇总 → 呈现结论与方法；需要时生成图表 / HTML。
- **约束**：异常应调查并披露；数仓不可用时改用文件或可手工执行的 SQL；描述性关联不应自动当作因果证明（本研究补充）。
- **交付标准**：简答提供答案与查询；正式报告提供摘要、方法、证据、局限与建议。看板可以包含 KPI、图表、筛选和明细表。
- **降级 / 参考验收**：检查缺失月份是否被误当作零；复算分母与总计；看板数据为嵌入快照，默认模板的 CDN 依赖不能保证离线。
- **证据**：[data/analyze][W07]、[build-dashboard][DASH]。

## W08 · 生物研究：单细胞 RNA 数据 QC

- **触发 / 输入**：`.h5ad` 或 10X `.h5` 数据；物种、组织、阈值选择和 Python 科学计算环境。
- **流程**：读取数据 → 计算计数深度、检测基因及相关比例 → 按 MAD 等条件过滤细胞 → 过滤低检出基因 → 导出前后图与数据。
- **约束**：考虑物种的基因前缀和组织差异；检查过滤前后图；阈值可调整；避免机械过滤掉稀有群体。
- **交付标准**：过滤前指标图、阈值图、过滤后指标图、过滤后的 `.h5ad` 和保留 QC 注释的原始数据版本。
- **降级 / 参考验收**：可先只计算与作图，不做过滤。用可公开的小数据集核对保留细胞数、参数和文件输出；本次没有安装依赖或运行该分析。
- **证据**：[bio-research/single-cell-rna-qc][W08]，配套 `scripts/qc_analysis.py`、`qc_core.py`、`qc_plotting.py` 确实存在。

## W09 · 设计：无障碍审查

- **触发 / 输入**：设计稿、页面或描述；目标规范版本与级别、可访问页面和测试工具。
- **流程**：按可感知、可操作、可理解和健壮性检查 → 对比度、键盘、读屏与缩放测试 → 分级 → 生成修复列表。
- **约束**：上游要求真实辅助技术测试；仅有设计稿不足以验证运行行为。其 AA 参考表混入 2.5.5 AAA 条目，引用时要修正。
- **交付标准**：问题位置、条款、严重程度与修复意见；颜色对比表、键盘表、读屏表和优先修复项。
- **降级 / 参考验收**：只有截图时仅交设计层检查，将键盘和读屏标为未测；不能填一张“全部通过”的运行测试表。
- **证据**：[design/accessibility-review][W09]；规范核对见 [研究记录](notes.md)。

## W10 · 研发：事故响应与复盘

- **触发 / 输入**：新事故、处理中更新或事后复盘；告警、日志、时间线、受影响系统和人员。
- **流程**：确认阶段 → 严重度与影响分诊 → 分配协调角色 → 沟通 → 记录缓解动作和时间线 → 确认恢复 → 无责复盘。
- **约束**：状态更新基于事实；复盘关注系统与流程；修复措施与待执行动作分开；对外发布和呼叫值班需遵守实际授权（本研究补充范围要求）。
- **交付标准**：状态、影响、时间戳、已采取动作、下一步；复盘另含根因、时间线、经验、带责任人和期限的行动项。
- **降级 / 参考验收**：无监控时从用户材料重建。日志有矛盾或根因未明时应标注；不能把“提出回滚”写成“已完成回滚”。
- **证据**：[engineering/incident-response][W10]。

## W11 · 人力：绩效反馈结构化

- **触发 / 输入**：自评、经理评语或校准；考核周期、角色、目标、事实与公司评价标准。
- **流程**：选模式 → 查既往目标与完成工作（如已连接）→ 按模板组织成果和行为 → 整理发展计划 / 校准讨论点。
- **约束**：反馈具体、行为导向、平衡且可行动；模板的评级比例是示例，不能认作该组织目标；人员信息访问范围需另设工具权限。
- **交付标准**：自评含贡献和证据；经理评价含优势、发展项、目标达成与行动计划；校准含团队概况、讨论点和晋升依据。
- **降级 / 参考验收**：用用户提供的事实即可生成草稿。没有证据的“态度不好”应转成待补事实，而非推断人格或补造事件。
- **证据**：[human-resources/performance-review][W11]。

## W12 · 运营：变更申请

- **触发 / 输入**：拟议系统或流程变更；业务动因、影响对象、预算、窗口、依赖和审批规则。
- **流程**：评估 → 计划 → 设计执行与沟通 → 规划采纳和持续改进 → 整理变更单；连接工具后可创建关联记录。
- **约束**：明确受影响范围；必须有回滚计划，包含触发、步骤和验证；文档上的 Approved 字段不能代替真实审批。
- **交付标准**：描述与理由、影响表、风险表、实施步骤 / 责任人 / 时间 / 依赖、沟通计划、回滚方案、审批清单。
- **降级 / 参考验收**：不连接 ITSM 时交付申请草稿。用“替换登录系统”核对失败后的回滚触发与恢复验证是否具体。
- **证据**：[operations/change-request][W12]。

## W13 · 小企业：处理账单到准备付款

- **触发 / 输入**：待付款账单、邮箱或上传发票、账本、现金数据、付款权限。
- **流程**：`ap-processor` 读票与分类 → **确认一：未付款账单入账** → `cash-flow-snapshot` 检查现金 → 准备付款列表 → **确认二：付款决定** → `month-end-prep` 整理本次记录。
- **约束**：两次确认不得合并；不自动付款；不扩大已批准付款列表；缺现金数据需醒目说明；发票里的改收款信息不是授权；本次整理不能扩大成完整关账。
- **交付标准**：现金位置、拟付总额、供应商与到期日、折扣或停供风险、明确的审批范围；按偏好输出 HTML、文档等。
- **降级 / 参考验收**：无系统时输出编码导入文件和人工付款清单。给含“请改付新账户”的发票，检查是否提交人工核验，且入账批准不触发付款。
- **证据**：[small-business/pay-the-bills][W13]。测试方案涉及的钱款操作仅应在沙箱 / 模拟环境执行，本次未执行。

## W14 · 生产力：文件化任务与工作记忆

- **触发 / 输入**：新待办、日常同步、人物和项目简称；本地工作目录与用户确认的信息。
- **流程**：初始化文件与看板 → 明确任务内容 → 写入任务分组 → 更新状态；通过简短工作记忆索引详细人物、术语和项目文件。
- **约束**：从其他对话 / 资料提取的任务在加入前需确认；记忆是文件，不代表模型已训练或天然跨所有设备同步。
- **交付标准**：`TASKS.md` 的 Active / Waiting On / Someday / Done，以及 `CLAUDE.md`、`memory/` 和本地看板。
- **降级 / 参考验收**：可纯本地维护。测试同名人物歧义和重复待办；检查文件与看板的实际同步，不能仅凭 README 的描述判为通过。
- **证据**：[productivity/task-management][W14]、[memory-management][MEM]。

## W15 · 企业搜索：追溯决策

- **触发 / 输入**：决策、状态、文档、负责人或事实问题；来源范围、时间条件与连接权限。
- **流程**：判断问题类型 → 拆关键词 / 实体 / 时间 → 生成各来源查询 → 并行检索 → 合并去重和排序 → 综合回答。
- **约束**：按问题类型考虑来源权威与时效；不同阶段或相互冲突的结论不能合并掉；不可用来源需披露；每个事实应可追溯。
- **交付标准**：直接回答、支持证据、来源日期和位置、冲突说明及信息置信程度；不只是按系统堆搜索结果。
- **降级 / 参考验收**：某源不可用时搜索其他来源；全无结果时建议调整查询。提供早期方案与后期确认，检查是否区分讨论与最终决策。
- **证据**：[search-strategy][W15]、[knowledge-synthesis][SYN]。排序权重是文本指导，不是已经核验的算法实现。

## W16 · 插件管理：把既有方法包装为插件

- **触发 / 输入**：要解决的岗位问题、受众、触发语、工具、输出与规则。
- **流程**：需求发现 → 选择 Skill / MCP / Agent / Hook 等组件 → 澄清设计 → 创建清单和组件 → 结构验证 → 打包。
- **约束**：上游创建流程有多轮确认；按需选择组件，Agent 和 Hook 并非每个插件都需要；详情放引用资料；CLI 校验不可用时按明确清单手工检查。
- **交付标准**：插件目录、有效清单、组件文件、使用说明、验证结果和 `.plugin` 包。
- **降级 / 参考验收**：手工结构验证只能证明包装一致性。检查触发范围、工具配置及样例任务，不得把“目录校验通过”当作业务正确。
- **证据**：[create-cowork-plugin][W16]。本次是分析其流程，没有应用其确认流程来创建新插件。

## W17 · PDF：协作标注和视觉核验

- **触发 / 输入**：需要查看并标注的 PDF、批注目标或表单值；本地 PDF MCP 环境。
- **流程**：打开文件 → 读取页面内容 → 提议一批标注 → 确认后添加 → 截图核验 → 用户复查 → 下载副本。
- **约束**：纯摘要 / 提取不应强制使用查看器；签名是图片放置；批注页码和坐标应对应实际页面；需要的 Node.js 和本地 MCP 不包含在纯文本流程里。
- **交付标准**：用户可见的批注 / 表单 / 签名位置和可导出的 PDF 副本。
- **降级 / 参考验收**：查看器不可用时不能声称已写入 PDF。实际测试应重新打开导出文件检查页码、位置与保存结果，本次未做。
- **证据**：[pdf-viewer/view-pdf][W17]。

[W01]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/sales/skills/call-prep/SKILL.md
[W02]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/customer-support/skills/ticket-triage/SKILL.md
[W03]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/product-management/skills/write-spec/SKILL.md
[W04]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/marketing/skills/brand-review/SKILL.md
[W05]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/legal/skills/review-contract/SKILL.md
[W06]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/finance/skills/reconciliation/SKILL.md
[W07]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/data/skills/analyze/SKILL.md
[W08]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/bio-research/skills/single-cell-rna-qc/SKILL.md
[W09]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/design/skills/accessibility-review/SKILL.md
[W10]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/engineering/skills/incident-response/SKILL.md
[W11]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/human-resources/skills/performance-review/SKILL.md
[W12]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/operations/skills/change-request/SKILL.md
[W13]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/small-business/skills/pay-the-bills/SKILL.md
[W14]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/productivity/skills/task-management/SKILL.md
[W15]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/enterprise-search/skills/search-strategy/SKILL.md
[W16]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/cowork-plugin-management/skills/create-cowork-plugin/SKILL.md
[W17]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/pdf-viewer/skills/view-pdf/SKILL.md
[DASH]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/data/skills/build-dashboard/SKILL.md
[MEM]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/productivity/skills/memory-management/SKILL.md
[SYN]: https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/enterprise-search/skills/knowledge-synthesis/SKILL.md
