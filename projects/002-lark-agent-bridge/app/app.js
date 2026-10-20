"use strict";

const steps = [
  {
    layer: "通信层", title: "本机主动连接，飞书推送事件。",
    description: "Bridge 通过飞书通道建立长连接。你向机器人发送消息后，消息事件沿连接到达本机，进入访问控制与消息处理流程。",
    label: "通信路径 · 示意",
    code: "飞书客户端\n    ↓ 消息\n飞书开放平台\n    ↓ 已建立的 WebSocket 连接\n本机 Bridge",
    note: "长连接通常不要求本机拥有公网 IP；运行环境仍须能访问飞书服务。",
    source: "#source-2", sourceText: "查看接入层依据 ↗"
  },
  {
    layer: "上下文与策略", title: "先决定，这一轮在哪里、以什么条件执行。",
    description: "根据聊天范围确定工作目录，评估访问与运行策略，查找 agent、目录和权限条件兼容的历史会话。消息与附件被整理为执行输入。",
    label: "运行上下文 · 示意，不是真实任务",
    code: "scope       → 当前聊天 / 话题范围\ncwd         → 已选择的项目目录\nagent       → profile 配置的 agent\nsession     → 可兼容的历史会话\npermissions → 本轮权限条件",
    note: "历史上下文主要由 agent 维护，Bridge 保存聊天与会话标识的关联。",
    source: "#source-3", sourceText: "查看 startRunFlow ↗"
  },
  {
    layer: "运行调度", title: "同一范围按轮次执行，总量受并发限制。",
    description: "PendingQueue 合并连续消息。已有运行时，普通消息积累到下一轮。RunExecutor 预留当前 scope，再从运行池申请并发名额。",
    label: "排队关系 · 示意",
    code: "同一 scope\n  运行 A ── 执行中\n  消息 B + C ── 等待合并\n       ↓ A 结束后\n  下一轮运行 B+C\n\n不同 scope → 共享配置的并发名额",
    note: "这是会话范围的串行化与并发限制，不自动解决两个会话修改同一目录的冲突。",
    source: "#source-3", sourceText: "查看队列与运行池 ↗"
  },
  {
    layer: "Agent 适配", title: "启动一个 CLI 进程，把任务写入标准输入。",
    description: "执行器调用适配器的 prepareRun / run。适配器组装参数和环境，启动 claude 或 codex，并通过 stdin 写入任务文本。",
    label: "调用链 · 参数已简化",
    code: "RunExecutor.submit(input)\n  → adapter.prepareRun(options)\n  → adapter.run(options)\n      → spawnProcess(binary, args, { cwd })\n      → child.stdin.end(prompt)\n      ← AgentRun { events, stop, waitForExit }",
    note: "通过非交互式 CLI 执行；任务完成需要 agent 自己调用模型与工具。",
    source: "#source-4", sourceText: "查看适配器实现 ↗"
  },
  {
    layer: "事件转换与展示", title: "把不同的输出，翻译成统一执行事件。",
    description: "适配器逐行解析 stdout 的 JSON。Claude 和 Codex 使用不同解析器，转换后的文本、工具状态和结果交给 Bridge 展示。",
    label: "事件归一化 · 示意",
    code: "CLI 原始 JSON / JSONL\n    ↓ 对应 agent 的解析器\ntext        → 回复文本\ntool_use    → 工具调用\ntool_result → 工具结果\ndone/error  → 结束状态\n    ↓ 飞书消息 / 卡片更新",
    note: "显示出来的过程依赖 CLI 实际输出；不等于可以读取或控制 agent 的所有内部步骤。",
    source: "#source-5", sourceText: "查看事件转换代码 ↗"
  },
  {
    layer: "生命周期", title: "本轮结束，保留继续对话的线索。",
    description: "系统事件中出现的会话标识会被记录。运行结束后维护活动运行记录、清理资源并处理进程退出，让后续消息能够继续执行。",
    label: "运行结束之后 · 示意",
    code: "记录 agent sessionId / threadId\n    ↓\n接收 done 或 error\n    ↓\n清理运行、处理进程退出\n    ↓\n后续消息使用兼容会话继续",
    note: "运行 done 是本轮结束信号；是否修好登录问题，仍需测试与验收。",
    source: "#source-3", sourceText: "查看运行收尾与会话记录 ↗"
  }
];

let currentStep = 0;
const stepButtons = [...document.querySelectorAll("[data-step]")];
function renderStep(index) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));
  const item = steps[currentStep];
  const values = {
    "step-count": `STEP ${String(currentStep + 1).padStart(2, "0")} / 06`,
    "step-layer": item.layer,
    "step-title": item.title,
    "step-description": item.description,
    "code-label": item.label,
    "step-code": item.code,
    "step-note": item.note,
    "step-source": item.sourceText
  };
  Object.entries(values).forEach(([id, value]) => { document.getElementById(id).textContent = value; });
  document.getElementById("step-source").setAttribute("href", item.source);
  document.getElementById("step-prev").disabled = currentStep === 0;
  document.getElementById("step-next").disabled = currentStep === steps.length - 1;
  document.getElementById("step-progress-fill").style.width = `${(currentStep + 1) / steps.length * 100}%`;
  stepButtons.forEach((button, i) => {
    button.classList.toggle("active", i === currentStep);
    button.setAttribute("aria-pressed", String(i === currentStep));
  });
}
stepButtons.forEach(button => button.addEventListener("click", () => renderStep(Number(button.dataset.step))));
document.getElementById("step-prev").addEventListener("click", () => renderStep(currentStep - 1));
document.getElementById("step-next").addEventListener("click", () => renderStep(currentStep + 1));

const scopes = {
  current: {
    badge: "已阅读源码", title: "围绕聊天范围，组织一轮轮运行。",
    items: [
      ["消息合并与等待", "同一范围内的消息合并为一批；运行期间的普通新消息等下一轮处理。"],
      ["会话关联与恢复", "匹配聊天范围、agent、目录和权限条件，带着会话 ID 继续执行。"],
      ["并发限制与中断", "同一范围防重复运行，通过运行池控制并发；停止指令交给运行句柄处理。"],
      ["结束与资源清理", "消费结束或错误事件，维护活动运行记录并清理；pending 队列使用内存存储。"]
    ],
    foot: "这些属于会话与运行管理。仅凭这条核心链路，不能认定已有持久化任务队列、任务依赖和自动验收系统。"
  },
  future: {
    badge: "架构建议 · 非现成功能", title: "让任务有目标、有记录、有恢复与验收。",
    items: [
      ["独立 Task 与持久化状态", "将目标、约束、消息、每次 Run 和产物关联起来；进程重启后仍可查询待处理工作。"],
      ["调度与项目资源隔离", "明确优先级和依赖；对同一项目使用互斥或独立工作区，避免并发修改相互覆盖。"],
      ["补充指令与失败恢复", "区分新任务、澄清和紧急纠正；重试前核对已执行的操作，避免重复副作用。"],
      ["可验证的完成条件", "把“进程结束”与“目标达成”分开；记录测试、产物检查和必要的人工验收证据。"]
    ],
    foot: "这是本次讨论提出的进一步设计，不是上游已具备能力的声明。如何落地还需要设计、实现与故障实验。"
  }
};
const scopeButtons = [...document.querySelectorAll("[data-scope]")];
scopeButtons.forEach(button => button.addEventListener("click", () => {
  const key = button.dataset.scope;
  const item = scopes[key];
  scopeButtons.forEach(other => {
    other.classList.toggle("selected", other === button);
    other.setAttribute("aria-pressed", String(other === button));
  });
  const badge = document.getElementById("scope-badge");
  badge.textContent = item.badge;
  badge.classList.toggle("pending", key === "future");
  document.getElementById("scope-title").textContent = item.title;
  document.getElementById("scope-foot").textContent = item.foot;
  document.getElementById("scope-items").replaceChildren(...item.items.map(([title, description]) => {
    const entry = document.createElement("div");
    const heading = document.createElement("strong");
    const paragraph = document.createElement("p");
    heading.textContent = title;
    paragraph.textContent = description;
    entry.append(heading, paragraph);
    return entry;
  }));
}));

const agents = {
  claude: {
    command: "claude -p --output-format stream-json",
    input: "通过 stdin 写入任务；追加系统提示通过临时文件传入。",
    resume: "带上 --resume <sessionId> 恢复会话。",
    output: "逐行解析 stream-json，转换文本、工具调用、结果和结束事件。"
  },
  codex: {
    command: "codex exec --json … -",
    input: "将带 Bridge 提示的任务写入 stdin；图片路径通过 --image 参数传入。",
    resume: "使用 exec resume … <threadId> - 恢复会话。",
    output: "解析 JSONL，将 thread、item、turn 等事件映射为统一执行事件。"
  }
};
const agentButtons = [...document.querySelectorAll("[data-agent]")];
agentButtons.forEach(button => button.addEventListener("click", () => {
  const item = agents[button.dataset.agent];
  agentButtons.forEach(other => {
    other.classList.toggle("selected", other === button);
    other.setAttribute("aria-pressed", String(other === button));
  });
  ["command", "input", "resume", "output"].forEach(key => {
    document.getElementById(`agent-${key}`).textContent = item[key];
  });
}));

const navigation = [...document.querySelectorAll(".section-nav a")];
const sections = navigation.map(link => document.querySelector(link.getAttribute("href")));
let scrollPending = false;
function highlightSection() {
  const current = [...sections].reverse().find(section => section.getBoundingClientRect().top <= 160) || sections[0];
  navigation.forEach(link => {
    const active = link.getAttribute("href") === `#${current.id}`;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  scrollPending = false;
}
window.addEventListener("scroll", () => {
  if (!scrollPending) {
    scrollPending = true;
    window.requestAnimationFrame(highlightSection);
  }
}, { passive: true });
highlightSection();
