"use strict";

// Every view displays one region of the same source-grounded SVG poster.
const memoryMapViews = {
  all: { height: 4220, title: "把历史保存到模型外部，再让相关材料回到当前上下文。", body: "LCM 负责项目档案与查询。Hooks 随宿主事件自动触发，MCP / CLI 供 AI 主动调用，模型最终读取返回材料并作出判断。", limit: "保存完整 → 找回相关 → 依据有效 → AI 正确使用。图中收益为机制预期，尚未运行上游实测。", caption: "一图全貌。绿色箭头表示请求 / 写入，橙色箭头表示返回结果；各客户端的自动化能力不同。" },
  architecture: { height: 1385, title: "AI 的记忆存放在模型外部，由宿主工具接入。", body: "Hooks 随事件自动运行；MCP / CLI 允许 AI 主动查询和存储。两条路径都连接到同一个记忆后端，后端负责真正的数据与检索工作。", limit: "当前上下文只是模型本轮能直接读取的材料，数据库保存更多历史。保存了内容、检索到了内容和正确使用了内容，需要分别判断。", caption: "绿色箭头是请求 / 写入，橙色箭头是返回结果。Hooks 和 MCP 都能读写；模型在当前上下文中使用返回内容。" },
  lifecycle: { height: 450, title: "从过程记录到复用线索，存储与整理各有职责。", body: "捕获后解析与脱敏，存入项目数据库；较早内容生成分层摘要，另有规则或主动写入来登记长期条目，再供检索使用。", limit: "图中是功能关系，不保证按同一固定顺序同步执行。主动 store 可直接保存；摘要是否提升取决于规则。", caption: "正常压缩替换当前上下文引用，并保留消息和摘要来源关系；不能把“无损”理解为摘要没有信息损失。" },
  retrieval: { height: 700, title: "启动恢复、自动提示、主动追查解决不同的问题。", body: "启动恢复先给背景；问题提交后自动检索少量片段；AI 需要更多证据时，主动组织查询并沿来源展开。", limit: "自动提示主要依赖文本匹配与规则，不能保证理解模糊指代。主动搜索不套自动提示的新鲜度衰减公式。", caption: "历史层与长期条目都有检索入口。客户端参数、评分、冷却与字节预算会共同影响实际注入。" },
  scenarios: { height: 530, title: "价值集中在需要翻阅以前工作记录的任务。", body: "持续研究找回约束，长期排错查失败与修复，决策追溯看取舍，受支持客户端接续时使用同一后端记录。", limit: "这些是基于机制推导的适用场景。跨会话与跨客户端连续性需要实际接入和检索成功，不是自动保证。", caption: "场景 → 可取回的材料 → 预期意义。最终收益需在真实任务中测量，不能用存储条数或命中数替代。" },
  limits: { height: 650, title: "外部记忆的能力由整条链路共同决定。", body: "捕获缺失会影响留存，词汇和预算会影响召回，摘要和旧结论需要核对，模型能否正确使用仍要验证。", limit: "数据库本地保存；使用外部模型生成摘要时，处理后的内容仍会发送给对应提供商，并可能产生费用。", caption: "存储完整性、检索相关性、依据有效性和任务完成质量，需要分别验证。" }
};
document.querySelectorAll("[data-map]").forEach(button => button.addEventListener("click", () => {
  const key = button.dataset.map;
  const view = memoryMapViews[key];
  document.querySelectorAll("[data-map]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  const img = document.getElementById("memory-map-image");
  img.src = "./media/lcm-external-memory.svg" + (key === "all" ? "" : `#${key}`);
  img.height = view.height;
  img.style.aspectRatio = `2400 / ${view.height}`;
  img.alt = `LCM 外部记忆图解：${button.textContent}。${view.title}`;
  document.getElementById("map-caption").textContent = view.caption;
  document.getElementById("map-reading-title").textContent = view.title;
  document.getElementById("map-reading-body").textContent = view.body;
  document.getElementById("map-reading-limit").textContent = view.limit;
}));
