"use strict";

// Original educational model. No live LCM data or network requests.
const phases = {
  capture: ["保存交互记录", "原始消息进入本地 SQLite", "01", "“之前发生过什么？”", "Hooks 在指定事件触发，读取并保存捕获的会话内容。"],
  organize: ["压缩并关联来源", "历史 → 摘要 → 更高层摘要", "02", "“当时得出了什么结论？”", "摘要替换当前上下文引用，原始记录仍可通过来源关系查回。"],
  recall: ["把相关线索带回来", "检索排序 → 少量片段 → 当前上下文", "03", "“需要细节，再查原文。”", "Hook 自动提供候选线索，AI 也能通过 MCP 或 CLI 主动查询。"]
};
const phaseTargets = ["machine-title", "machine-sub", "machine-count", "machine-result", "machine-caption"];
document.querySelectorAll("[data-phase]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-phase]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    phases[button.dataset.phase].forEach((value, index) => { document.getElementById(phaseTargets[index]).textContent = value; });
  });
});

const layers = {
  raw: ["messages / message_parts", "保留捕获的会话内容", "按项目、会话与消息顺序存储。正文、角色、token 数，以及解析到的工具输入输出等结构化内容进入数据库。", "尝试 A → 出现错误 → 尝试 B → 测试通过。", "入库内容受解析、脱敏与捕获是否成功影响；不能把“无损”理解为任意输入都逐字完整保存。"],
  working: ["context_items / summaries", "把历史折叠成当前可用的上下文", "保留最近消息原文，把较早消息整理成叶级摘要；摘要可以继续汇总。context_items 保存当前使用的消息和摘要引用。", "[历史摘要：A 失败，B 成功] + [最近 8 条消息原文]", "默认保护 8 条消息，不是 8 轮对话。LCM 管理的上下文如何注入宿主，取决于客户端与触发事件。"],
  promoted: ["promoted / promoted_fts", "把值得复用的内容单独登记", "摘要筛选、被动事件处理和主动 store 都可以写入长期记忆。条目包含内容、标签、来源、时间和置信度等元数据。", "这个问题采用 B 方案；记录选择原因、适用条件和来源。", "摘要提升路径通常复制符合规则的摘要，不保证每条都经过独立事实提炼；保存时间长也不保证结论仍正确。"]
};
const layerTargets = ["layer-table", "layer-title", "layer-description", "layer-example", "layer-boundary"];
document.querySelectorAll("[data-layer]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-layer]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    layers[button.dataset.layer].forEach((value, index) => { document.getElementById(layerTargets[index]).textContent = value; });
  });
});

const ageInput = document.getElementById("age");
const usageInput = document.getElementById("usage");
function scoreMemory(match, ageHours, affinity, uses) {
  return match * Math.pow(0.5, ageHours / 24) * affinity * (1 + 0.75 * uses / (uses + 1));
}
function updateScores() {
  const age = Number(ageInput.value);
  const uses = Number(usageInput.value);
  document.getElementById("age-value").textContent = `${age} 小时`;
  const rows = [
    { id: "A", name: "并发写入修复记录", note: "串行写入与测试结果", match: 12, age, affinity: 0.85, uses },
    { id: "B", name: "最近的数据库讨论", note: "本会话的 SQLite 背景", match: 5, age: 1, affinity: 1, uses: 0 },
    { id: "C", name: "早期存储选型", note: "SQLite 与其他方案对比", match: 8, age: 120, affinity: 0.85, uses: 1 }
  ].map(item => ({ ...item, score: scoreMemory(item.match, item.age, item.affinity, item.uses) })).sort((a, b) => b.score - a.score);
  const tbody = document.getElementById("score-rows");
  tbody.replaceChildren();
  rows.forEach(item => {
    const row = document.createElement("tr");
    const title = document.createElement("td");
    title.append(document.createTextNode(`${item.id} · ${item.name}`));
    const note = document.createElement("small"); note.textContent = item.note; title.append(note);
    const match = document.createElement("td"); match.textContent = String(item.match);
    const timing = document.createElement("td"); timing.textContent = `${item.age}h / ${item.affinity === 1 ? "同会话" : "跨会话"}`;
    const score = document.createElement("td"); score.className = `score${item.score < 2 ? " dim" : ""}`; score.textContent = item.score.toFixed(2);
    const status = document.createElement("td"); const badge = document.createElement("span"); badge.className = `result-pill${item.score < 2 ? " excluded" : ""}`; badge.textContent = item.score >= 2 ? "通过门槛" : "低于门槛"; status.append(badge);
    row.append(title, match, timing, score, status); tbody.append(row);
  });
  const a = rows.find(item => item.id === "A");
  const conclusion = a.score < 2 ? "A 已低于自动提示门槛，但原记录仍保存在库中，可通过主动搜索查找。" : rows[0].id === "A" ? (uses > 0 ? "A 暂时排在前面；较高的匹配分与使用反馈共同提高了优先级。" : "A 暂时排在前面；当前没有使用反馈加成，较高的匹配分在衰减后仍占优势。") : "较新的 B 排在 A 前面；最近发生的讨论不一定比旧修复记录更有用。";
  document.getElementById("score-explanation").textContent = `A 得分 ${a.score.toFixed(2)}。${conclusion} 通过门槛也不保证最终注入，还受其他筛选与预算约束。`;
}
ageInput.addEventListener("input", updateScores);
usageInput.addEventListener("change", updateScores);
document.getElementById("reset-lab").addEventListener("click", () => { ageInput.value = "24"; usageInput.value = "0"; updateScores(); });
updateScores();

// Scripted narrative: these records and outcomes are invented for explanation.
const caseSteps = [
  { kind: "会话记录 / 示例", title: "先把问题与解决过程说清楚", record: "用户：批量写入偶尔报 database is locked。\n助手：尝试串行写入，回归测试通过。\n用户：先保留这个方案，并记录适用条件。", owner: "宿主编程工具记录对话与操作；LCM 通过接入路径捕获。", output: "一段包含问题、尝试、结果的会话历史。", risk: "这里的修复和测试是虚构情节，不是对 SQLite 的通用修复建议。", source: "README.md" },
  { kind: "messages / 持久保存", title: "让过程能够在会话结束后被查到", record: "conversation_id：示例会话 C1\n消息 M1：报告错误\n消息 M2：尝试串行写入与测试结果\n消息 M3：确认暂时采用该方案", owner: "捕获流程读取并解析会话；存储层写入 SQLite。", output: "有角色、顺序与正文的消息，以及可解析的结构化操作信息。", risk: "接入失败、解析不支持或脱敏都会影响留存内容，需要对照实际原文检查。", source: "src/db/migration.ts" },
  { kind: "summaries / 压缩", title: "把过程整理成一段可追溯的摘要", record: "摘要 S1（示例）：\n项目遇到批量写入冲突；尝试串行写入后，\n该次回归测试通过，决定暂时保留。\n来源关系：S1 → M1、M2、M3", owner: "配置的摘要模型生成文本；LCM 保存摘要及来源关系。", output: "context_items 中的旧消息引用可由摘要替代，原始消息仍可查。", risk: "摘要可能省略测试范围或环境细节；需要时沿来源关系展开。此处省略了压缩触发门槛。", source: "src/compaction.ts" },
  { kind: "promoted / 主动登记", title: "把复用结论单独保存", record: "主动 store 的示例条目：\n当前项目暂用串行写入处理该批任务，\n已通过本次回归；并发压力尚未验证。\n标签：type:solution、scope:project", owner: "本案例选择由 AI 主动 store；另有摘要规则筛选与事件提升入口。", output: "一条跨会话使用的记忆，包含原因与适用边界。", risk: "store 可以直接存入条目；不保证自动核验事实。摘要提升路径也不一定进行这种逐条提炼。", source: "src/daemon/routes/store.ts" },
  { kind: "prompt-search / 候选线索", title: "新问题触发一次相关记忆检索", record: "新问题：SQLite 写入冲突，上次怎么处理？\n可能的提示（假定命中且通过筛选）：\n[记忆 ID] 该批任务曾采用串行写入……\n[来源 ID] 对应历史记录与测试背景……", owner: "Hook 提交本次问题；后端检索、评分、去重并裁剪。", output: "少量带来源标识的上下文片段。是否补充历史层依赖客户端。", risk: "这里展示的是可能的输出形状，不是真实运行结果；旧记忆也可能因分数或预算被排除。", source: "src/daemon/routes/prompt-search.ts" },
  { kind: "search → expand → 核对", title: "查清当时的条件，再决定今天怎样做", record: "AI 可以继续：\n1. 搜索错误文本与相关决定。\n2. 展开原始记录，核对版本和测试范围。\n3. 检查是否有后续替代方案。\n4. 用当前证据判断，再执行与验证。", owner: "AI 组织查询并结合当前证据判断；LCM 返回历史材料。", output: "有来源与适用条件的回答；如果证据不足，应继续查证。", risk: "这是一种建议的使用方式，不是 MCP 强制执行的步骤。记住旧结论不代表旧结论仍然有效。", source: "src/guidance.ts" }
];
let caseIndex = 0;
function showCase(index) {
  caseIndex = Math.max(0, Math.min(caseSteps.length - 1, index));
  const step = caseSteps[caseIndex];
  for (const key of ["kind", "title", "record", "owner", "output", "risk"]) document.getElementById(`case-${key}`).textContent = step[key];
  document.getElementById("case-source").href = "SOURCE/" + step.source;
  document.getElementById("case-position").textContent = `${caseIndex + 1} / ${caseSteps.length}`;
  document.getElementById("case-prev").disabled = caseIndex === 0;
  document.getElementById("case-next").disabled = caseIndex === caseSteps.length - 1;
  document.querySelectorAll("[data-case]").forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.case) === caseIndex)));
}
document.querySelectorAll("[data-case]").forEach(button => button.addEventListener("click", () => showCase(Number(button.dataset.case))));
document.getElementById("case-prev").addEventListener("click", () => showCase(caseIndex - 1));
document.getElementById("case-next").addEventListener("click", () => showCase(caseIndex + 1));

const queryExamples = {
  specific: ["“SQLite 的 database is locked，上次采取了什么办法？”", "SQLite 和具体错误文本提供了可匹配的词汇。是否命中仍取决于记录内容、筛选规则和输出预算。", "先查错误文本，再展开相关记录，确认当时的版本、操作和测试范围。", "词汇匹配并不证明同一错误具有相同原因，也不保证历史办法适用于当前环境。"],
  vague: ["“上次那个问题，最后怎么解决的？”", "本次问题缺少具体对象。自动处理不会先结合完整对话把“那个问题”改写成 SQLite 写入冲突。", "如果当前上下文足以明确对象，AI 可以用“SQLite database is locked 修复”再次查询；仍不明确时应向用户澄清。", "自动提示为空不代表历史没有保存。也不能把含有“解决”二字的任意记录当作目标。"],
  changed: ["“之前选 A，后来又改 B，现在应该采用哪个？”", "文本相关性可能同时命中新旧决定；创建时间和去重规则不能单独证明哪条结论当前有效。", "查询两次决定的来源，核对时间、修改原因和适用范围，并结合当前代码或文档判断。", "保留旧版本不等于自动维护事实有效期；找到一条高分记录也不能替代冲突核验。"]
};
const queryTargets = ["query-example", "query-auto", "query-followup", "query-limit"];
document.querySelectorAll("[data-query]").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll("[data-query]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  queryExamples[button.dataset.query].forEach((text, index) => { document.getElementById(queryTargets[index]).textContent = text; });
}));
