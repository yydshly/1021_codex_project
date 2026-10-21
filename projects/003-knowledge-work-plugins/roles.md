# 角色与业务地图

本页以固定快照中的顶层插件和 Skill 为依据。所有“能力 / 交付”均为上游声明或流程预期，本次未做业务实测。中文业务分组是本研究归纳；详细入口、原文描述及固定版本链接见 [全量索引](scenario-index.md)。

## 角色总览

| 角色 / 使用者 | 插件 | 业务范围 | 主要输入 | 典型交付 | Skill / Command |
| --- | --- | --- | --- | --- | ---: |
| 销售代表、销售经理、客户成功 | `sales` | 找线索、研究客户、会前会后、推进交易、预测与续约 | CRM、日历、往来邮件、通话记录、客户表 | 简报、销售预测、账户计划、获授权的记录更新 | 36 / 0 |
| 客服与支持负责人 | `customer-support` | 工单分诊、问题研究、回复、升级、知识沉淀 | 工单、客户信息、知识库、缺陷记录 | 分诊结果、回复草稿、升级材料、KB 文章 | 5 / 0 |
| 产品经理 | `product-management` | 发现机会、需求、路线图、迭代、研究、指标与沟通 | 用户问题、研究记录、任务、设计、指标 | PRD、路线图、研究综合、利益相关方更新 | 8 / 1 |
| 市场与内容团队 | `marketing` | 内容、活动、品牌、邮件、竞品、SEO、效果 | 受众、品牌规范、渠道数据、内容材料 | 文案、活动计划、品牌审查、表现报告 | 8 / 0 |
| 企业法务 | `legal` | 合同、NDA、合规、风险、供应商、签署与会议支持 | 合同、公司立场、交易背景、法律团队规则 | 条款差异、修订建议、风险分级、会议简报 | 9 / 0 |
| 财务、会计、内控 | `finance` | 分录、对账、报表、差异、关账与审计 | 总账、明细账、银行流水、预算、内控证据 | 分录草案、对账底稿、报表、差异与审计材料 | 8 / 0 |
| 数据分析师、业务分析者 | `data` | 查询、探索、可视化、统计、验证、看板、业务上下文 | 数据表结构、指标口径、文件或数仓 | SQL、图表、数据质量报告、HTML 看板 | 10 / 0 |
| 生命科学研究者 | `bio-research` | 文献与研究工具、单细胞、测序流程、仪器格式、选题 | 研究问题、测序数据、仪器数据、实验背景 | QC 图与数据、分析产物、格式转换、选题判断材料 | 6 / 0 |
| 设计师、设计系统与用户研究人员 | `design` | 设计评审、系统管理、交付、UX 文案、无障碍、研究 | 设计稿、页面、组件、访谈和任务目标 | 评审意见、组件规范、交付规格、研究与文案 | 7 / 0 |
| 工程师、技术负责人、值班团队 | `engineering` | 审查、调试、架构、故障、部署准备、测试、技术债 | 代码、PR、日志、监控、架构背景 | 审查意见、ADR、故障复盘、测试与部署清单 | 10 / 0 |
| 招聘、人力与管理者 | `human-resources` | 招聘流程、面试、Offer、入职、绩效、薪酬、政策、组织 | 岗位要求、人员资料、目标与事实、公司政策 | 面试计划、Offer 草稿、入职表、绩效与组织分析 | 9 / 0 |
| 运营、采购与变更负责人 | `operations` | 供应商、流程、变更、产能、状态、Runbook、风险、合规 | 合同、流程记录、资源与工作量、审批规则 | SOP、变更单、容量方案、风险与状态报告 | 9 / 0 |
| 小企业经营者 | `small-business` | 钱款、增长、营销、客户、招聘、库存和经营简报 | 账务、CRM、邮箱、订单、公司背景 | 组合业务流程、审批材料、报告与草稿 | 44 / 0 |
| 任意知识工作者 | `productivity` | 个人任务与工作记忆 | 待办、人物、术语、项目、外部活动 | `TASKS.md`、`CLAUDE.md`、`memory/`、HTML 看板 | 4 / 0 |
| 企业内部信息使用者 | `enterprise-search` | 跨源搜索、综合、摘要、来源管理 | 问题、时间与范围、已连接信息源 | 去重且带来源的回答或信息摘要 | 5 / 0 |
| 插件作者、内部工具管理员 | `cowork-plugin-management` | 创建或定制插件 | 岗位目标、业务规则、工具与触发条件 | 插件文件、配置、验证报告、打包产物 | 2 / 0 |
| 需要协作审阅 PDF 的人员 | `pdf-viewer` | 查看、标注、填表、放置签名图 | PDF、批注要求、字段值或签名图片 | 交互预览与可下载的标注副本 | 1 / 4 |

## 各岗位可参考的业务拆分

### 销售：36 个入口贯穿客户生命周期

- 初始化与背景：`setup`、`rep-context`、`account-context`。
- 客户与线索：`account-research`、`account-tiering`、`lead-triage`、`route-lead`、`stakeholder-map`。
- 沟通与会议：`draft-outreach`、`schedule-meeting`、`call-prep`、`call-summary`、`handle-objection`、`create-an-asset`、`competitive-intelligence`。
- 商机推进：`account-plan`、`close-plan`、`deal-review`、`deal-advance-gap`、`deal-signals`、`deal-slip-scenario`、`update-opportunity`、`log-activity`、`crm-hygiene-check`。
- 团队与节奏：`pipeline-review`、`team-pipeline`、`forecast`、`daily-briefing`、`inbox-sweep`、`end-of-day`、`weekly-wrap`。
- 客户延续与反馈：`customer-health`、`renewal-radar`、`expansion-whitespace`、`customer-voice`、`win-loss-review`。

参考价值：同一客户的事实采集可以复用，但会前准备、写回记录和预测是不同任务。不能因一次读取邮件就自动发送邮件或改商机。

### 客服：5 个任务组成问题处理链

`ticket-triage` → `customer-research` → `draft-response`；超出支持权限时转 `customer-escalation`，解决后用 `kb-article` 沉淀。分类、优先级和升级标准需要映射到本公司的队列与服务约定；源文件示例 SLA 不是本公司承诺。

### 产品：从问题发现到交付沟通

`product-brainstorming` 用于发散与挑战假设；`synthesize-research` 汇总证据；`write-spec` 定义范围与验收；`roadmap-update` 和 `sprint-planning` 安排优先级；`stakeholder-update` 同步进展；`metrics-review` 与 `competitive-brief` 支持判断。另有独立 `commands/brainstorm.md`，与 Skill 不能简单相加为互不重叠场景。

### 营销：制作、校验和复盘分开

`content-creation` 是内容知识，`draft-content` 是起草任务；`brand-review` 检查品牌一致性；`campaign-plan`、`email-sequence` 设计活动；`competitive-brief`、`seo-audit`、`performance-report` 支持调研与复盘。没有品牌规范时，通用质量审查不应被描述为已符合公司品牌。

### 法务：按任务与风险分流

`review-contract` 做合同与立场手册对照；`triage-nda` 做 NDA 分诊；`compliance-check`、`legal-risk-assessment`、`vendor-check` 做合规与风险辅助；`legal-response` 起草模板答复；`brief`、`meeting-briefing` 支持简报；`signature-request` 支持签署流程。法域、专业结论与签署授权必须在具体任务中另行确定，本研究不验证法律判断正确性。

### 财务：账务、管理和审计

`journal-entry` 与 `journal-entry-prep` 包含重叠的分录任务 / 方法；`reconciliation` 对账；`financial-statements` 报表；`variance-analysis` 差异解释；`close-management` 关账组织；`audit-support`、`sox-testing` 审计与控制测试。需要明确实体、账期、币种、重大性阈值与复核人，源文件中的金额示例不能直接变成公司政策。

### 数据：分析任务与底层知识配套

任务包括 `analyze`、`explore-data`、`write-query`、`create-viz`、`build-dashboard`、`validate-data`；方法包括 `sql-queries`、`statistical-analysis`、`data-visualization`；`data-context-extractor` 用于提取业务数据上下文。提出需求时应补充口径、分母、粒度、时间范围和可执行权限。

### 生命科学：分析脚本与外部研究服务并存

`start` 发现可用工具；`single-cell-rna-qc`、`scvi-tools`、`nextflow-development` 面向单细胞与测序分析；`instrument-data-to-allotrope` 转换仪器数据；`scientific-problem-selection` 支持研究选题。文献、化合物与靶点能力也依赖 MCP 服务，不能仅按 Skill 数衡量。部分流程含真实 Python 脚本，需要额外环境与数据，不能按普通文案模板处理。

### 设计：从输入证据决定能审到哪一层

`design-critique`、`design-system`、`design-handoff`、`ux-copy`、`accessibility-review`、`user-research`、`research-synthesis` 覆盖评审到交付。截图足以讨论视觉问题，却不能证明真实页面的键盘和读屏行为；验收要区分设计层与运行层。

### 研发：分析与操作范围需要分别定义

`standup` 汇总活动；`code-review` 审查；`debug` 排错；`architecture`、`system-design` 做决策与设计；`incident-response` 协调故障；`deploy-checklist` 准备部署；`documentation`、`tech-debt`、`testing-strategy` 支持长期工程工作。创建事故、通知值班和发布状态均是外部动作，不应与生成分析文档混为一项默认权限。

### 人力：模板必须落到具体事实

`recruiting-pipeline`、`interview-prep`、`draft-offer`、`onboarding` 覆盖人才进入；`performance-review`、`comp-analysis` 支持绩效和薪酬；`policy-lookup` 查政策；`org-planning`、`people-report` 做组织分析。绩效模板中的分布比例是示例，不能直接作为强制分布或人事决策依据。

### 运营：把重复工作变成可执行的组织流程

`vendor-review`、`process-doc`、`process-optimization`、`change-request`、`capacity-plan`、`status-report`、`runbook`、`risk-assessment`、`compliance-tracking`。重点不是“报告写得像”，而是流程步骤、责任人、前置条件、回滚与验证能够被接手人使用。

### 小企业：44 个 Skill，强调跨职能组合

| 业务组 | 入口 |
| --- | --- |
| 财务与钱款（12） | `ap-processor`、`cash-flow-snapshot`、`close-month`、`invoice-chase`、`month-end-prep`、`pay-the-bills`、`payroll-prep`、`plan-payroll`、`report-builder`、`report-pack`、`tax-prep`、`tax-season-organizer` |
| 销售线索（8） | `call-list`、`crm-autopilot`、`grow-pipeline`、`lead-finder`、`lead-triage`、`outreach-composer`、`reactivate`、`speed-to-lead` |
| 营销（8） | `ad-manager`、`canva-creator`、`content-strategy`、`growth-pulse`、`marketing-monday`、`review-reputation`、`seo-ai-visibility`、`social-content-engine` |
| 客户与提案（4） | `contract-review`、`grant-rfp-writer`、`proposal-builder`、`ticket-deflector` |
| 运营与招聘（5） | `hiring-screener`、`inbox-manager`、`inventory-planner`、`job-post-builder`、`restock` |
| 经营简报（2） | `business-pulse`、`monday-brief` |
| 配置与构建（5） | `smb-onboard`、`smb-router`、`brand-style`、`build-agent`、`build-connector` |

其路由先区分“完成一次任务”与“建立重复执行机制”，再选择单步 Skill 或组合流程。税务等任务带地区假设，不能直接照搬到中国业务；定时执行也依赖宿主调度，不因 Markdown 出现“每周”就自动运行。

### 四种通用能力

- **生产力**：`start`、`update` 加任务和记忆管理；以文件保存待办与工作术语，适合减少重复说明背景。
- **企业搜索**：`search`、`digest` 加检索策略、知识综合、来源管理；适合跨源事实核对。
- **插件管理**：`create-cowork-plugin`、`cowork-plugin-customizer`；把已明确的方法包装成可复用工具包。
- **PDF**：一个 `view-pdf` Skill，加 `open`、`annotate`、`fill-form`、`sign` 四个命令；签名图片是视觉标记，不能等同于加密数字签名。

## 合作伙伴范围

本研究对 17 个顶层插件进行以上职能整理。市场中的 5 个仓内合作伙伴入口与 101 个外部入口保留在全量索引和 JSON 中，仅核实市场记录存在；没有逐个审阅实现、认证、条款或运行效果。后续研究特定业务时，应按该入口记录的仓库和版本另开核查范围。
