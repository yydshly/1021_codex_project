"use strict";
// Explanatory UI only; never queries or requests device permissions.
const flowDetails = [
  ["01 / 入口", "页面外观提供一个“允许访问”的理由。", "上游提供天气、附近服务、相机等页面模板。天气页的“更改位置”和附近页的“继续”会触发定位请求。页面用途的包装属于社会工程学；不等于技术上突破浏览器权限。"],
  ["02 / 边界", "基础信息与敏感权限，走两条不同的路径。", "环境信息通常无需权限弹窗；相机、麦克风和位置需要对应有效授权。已有保留授权时可能不再次弹窗。HTTPS、安全策略、操作系统权限和设备可用性也影响结果。"],
  ["03 / 采集", "浏览器接口决定数据与精度的上限。", "ClientJS 与 navigator 提供环境信息；getCurrentPosition 获取位置；getUserMedia 提供相机或麦克风媒体流。相机模板设计为间隔截帧，录音脚本分段导出 WAV。实现包含潜在异常，运行效果尚未实测。"],
  ["04 / 传输", "获得数据后，通过普通网络请求提交。", "JavaScript 使用 AJAX / XMLHttpRequest 向 PHP 接口发起 HTTP POST。图片以 Base64 提交后解码，录音以文件表单提交。通常没有统一的额外“允许上传”弹窗；网络、浏览器策略和服务端均可能让请求失败。"],
  ["05 / 结果", "服务端保存文件，面板轮询结果。", "PHP 将媒体存入 images / sounds，消息写入模板的 result.txt。面板约每 2 秒读取并清空消息。停止面板监听只停止轮询，不向访客发送停止采集命令；关页也不会删除此前已上传的文件。"]
];
const flowButtons = [...document.querySelectorAll("[data-step]")];
flowButtons.forEach(button => button.addEventListener("click", () => {
  flowButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle("selected", active);
    item.setAttribute("aria-pressed", String(active));
  });
  const detail = flowDetails[Number(button.dataset.step)];
  ["flow-label", "flow-title", "flow-text"].forEach((id, i) => {
    document.getElementById(id).textContent = detail[i];
  });
}));

let activeFilter = "all";
const rows = [...document.querySelectorAll("#permission-table tbody tr")];
const search = document.getElementById("permission-search");
const filters = [...document.querySelectorAll("[data-filter]")];
function filterRows() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  rows.forEach(row => {
    const visible = (activeFilter === "all" || row.dataset.level === activeFilter) &&
      row.textContent.toLocaleLowerCase().includes(query);
    row.hidden = !visible;
    if (visible) count += 1;
  });
  document.getElementById("result-count").textContent = `显示 ${count} / ${rows.length} 项边界说明`;
  document.getElementById("no-results").hidden = count !== 0;
}
filters.forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filters.forEach(item => {
    const active = item === button;
    item.classList.toggle("selected", active);
    item.setAttribute("aria-pressed", String(active));
  });
  filterRows();
}));
search.addEventListener("input", filterRows);
filterRows();

let pageState = "open";
const permission = document.getElementById("saved-permission");
const stateButtons = [...document.querySelectorAll("[data-state]")];
function renderLifecycle() {
  const granted = permission.checked;
  let title, capture, description;
  if (pageState === "closed") {
    title = "真正关页后，停止从该页面采集新数据。";
    capture = "停止";
    description = granted
      ? "即使浏览器保存了授权，也不代表页面继续运行。页面卸载时媒体源停止；定位脚本和定时采集随页面结束。已有请求可能完成、已上传数据仍在服务器。"
      : "页面已关闭且无有效敏感权限。此页面不能继续拍照、录音或取得新位置；这并不删除此前上传的数据。";
  } else if (!granted) {
    title = "没有有效敏感权限，需重新获得授权。";
    capture = "敏感采集不可直接进行";
    description = "相机、麦克风和位置不能直接获取；是否弹出询问还取决于阻止设置、用户操作和当前页面状态。只要页面仍可运行，基础信息仍可能收集。撤销一项权限不代表撤销其他权限。";
  } else if (pageState === "background") {
    title = "切到后台，不保证已有采集停止。";
    capture = "可能继续 / 可能受限";
    description = "已经开始的媒体采集可能继续。浏览器与操作系统可能限制后台计时器、暂停相机或冻结页面，移动设备表现尤其不同。拥有权限也不保证能从后台新启动采集。";
  } else if (pageState === "reopen") {
    title = "授权仍有效时，可能不再弹窗。";
    capture = "可能重新开始";
    description = "重新加载页面会重新运行脚本。在同一来源已有有效授权、系统许可与安全上下文满足时，可再次调用对应接口；无需用户再次点击允许并不等于绕过了权限。";
  } else {
    title = "具备采集条件，仍需接口调用成功。";
    capture = "可能采集";
    description = "代码运行、设备可用、系统许可与安全上下文均满足时，页面可调用获准接口；已有授权不代表每次都重新弹窗。基础信息通常不依赖这些敏感权限。";
  }
  document.getElementById("life-title").textContent = title;
  document.getElementById("life-capture").textContent = capture;
  document.getElementById("life-permission").textContent = granted ? "有（假设）" : "无 / 已撤销";
  document.getElementById("life-text").textContent = description;
}
stateButtons.forEach(button => button.addEventListener("click", () => {
  pageState = button.dataset.state;
  stateButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle("selected", active);
    item.setAttribute("aria-pressed", String(active));
  });
  renderLifecycle();
}));
permission.addEventListener("change", renderLifecycle);

const navLinks = [...document.querySelectorAll(".sidebar nav a")];
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
      }
    });
  }, {rootMargin: "-10% 0px -70% 0px", threshold: 0});
  document.querySelectorAll("main>.section").forEach(section => observer.observe(section));
}
