/* A visible walkthrough of an actual local state machine, never a fake LLM call. */
window.TICKET_DEMO = (() => {
  'use strict';
  let host, snapshot, notice = '', busy = false, session = 0, replay = false, replayIndex = 0;
  const esc = x => String(x ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const command = 'python projects/003-knowledge-work-plugins/app/demo_server.py';
  const guide = ['阅读客户原话', '补齐影响事实', '检查关联问题', '批准与分派', '核验实际结果'];

  function shell() {
    host.innerHTML = `<section class="page demo-page" id="demo-root"><header class="page-head"><div class="eyebrow">ONE TICKET / AN ACTUAL LOCAL RUN</div><h1>别只看提示词，<br>让一张工单走完流程。</h1><p>你是云报表的客服。客户说“登录白屏，非常急”，接下来怎么判断、查什么、交给谁？在下面亲手试一次。</p></header>
      <div class="demo-boundary"><strong>场景贴近实际，客户与资料均为虚构；本地程序真实运行。</strong><p>这次演示借鉴上游客服 Skill。分级由公开的规则程序计算，审批与分派由本地 Python 服务执行。没有接真实客服系统，也没有调用 Claude。真实 Claude 请求因登录令牌过期失败，未获得有效回答。</p></div>
      <div id="demo-status" role="status" aria-live="polite">正在检查本地演示服务…</div><div id="demo-workbench"></div>
      <section class="demo-learning"><h2>这一次，你实际看到了什么？</h2><div class="comparison-grid"><article><span>01</span><h3>直接对话也能做好</h3><p>你可以直接让我分诊。提供相同的资料和流程，也可能得到同样完整的结果。本演示不预设普通对话一定更差。</p></article><article><span>02</span><h3>Skill 复用工作方法</h3><p>每次都检查影响、查重、路由、回复和交接。价值是少重复交代、少漏步骤；是否更好需要真实对照。</p></article><article><span>03</span><h3>系统承担实际拦截</h3><p>未批准、版本已变或重复提交时，Python 服务按状态拒绝或去重。它是本研究新写的演示程序，不是上游 Skill 自带能力。</p></article></div><p class="micro-note">本地批准按钮只是单人演示，不认证主管身份，也不是生产审批系统。演示只验证当前工单、版本和分派状态；没有测试外部系统或通用智能。</p><a class="source-link" href="https://github.com/anthropics/knowledge-work-plugins/blob/a266ab8c3c754a3ccf7a634044fc1595fc06e50e/customer-support/skills/ticket-triage/SKILL.md" target="_blank" rel="noopener noreferrer">查看上游客服 Skill ↗</a></section></section>`;
  }

  function offline(reason) {
    const record = window.RESEARCH.demoRecord;
    if(record?.checks?.[0]?.snapshot){replay=true;replayIndex=0;snapshot=record.checks[0].snapshot;notice='';render();return;}
    document.getElementById('demo-status').textContent = '当前是静态阅读模式：' + reason;
    document.getElementById('demo-workbench').innerHTML = `<section class="demo-start"><h2>启动后，就可以亲手操作</h2><p>在研究仓库根目录运行：</p><pre>${esc(command)}</pre><p>然后打开 <a class="source-link" href="http://127.0.0.1:8033/#demo">http://127.0.0.1:8033/#demo ↗</a>。只使用 Python 标准库，状态保存在系统临时目录，停止服务后可重新开始。</p></section>
      <section class="demo-start"><h2>已经执行过的运行记录</h2>${record ? `<p>以下是本研究实际向本地服务发送请求后得到的结果，不是模型回答，也不是现场连接。</p><div class="demo-table-wrap"><table class="demo-table"><thead><tr><th>动作</th><th>HTTP / 结果</th><th>实际分派条数</th></tr></thead><tbody>${record.checks.map(c=>`<tr><td>${esc(c.title)}</td><td>${c.status} / ${esc(c.code)}</td><td>${c.receiptCount}</td></tr>`).join('')}</tbody></table></div><a class="source-link" href="./demo-record.json">完整运行证据 JSON ↗</a>` : '<p>运行本地演示后可查看实际结果。</p>'}</section>`;
  }

  function render() {
    const s = snapshot, a = s.analysis;
    const assignment = s.receipts.find(r=>r.digest===a.digest);
    const stage = a.missing.length ? 1 : s.lookup === null ? 2 : !assignment ? 3 : 4;
    document.getElementById('demo-status').innerHTML = `<span class="demo-online">● ${replay?'实际运行记录回放 · 当前不连接服务':'本地服务已连接'}</span><span>${esc(s.ticketId)} · 当前 v${s.revision} · 已写入 ${s.receipts.length} 条分派</span>`;
    const record=window.RESEARCH.demoRecord;
    const replayControls=replay?`<section class="demo-start"><h2>按顺序回看一次真实执行</h2><p>下面每一步都保存了本地服务的真实响应快照。切换步骤是在回放，不会发送新请求；要自己操作，在仓库根目录运行 <code>${esc(command)}</code>，然后打开 <a class="source-link" href="http://127.0.0.1:8033/#demo">本机演示 ↗</a>。</p><label for="demo-replay-step">选择已执行步骤</label><select id="demo-replay-step" data-demo-replay>${record.checks.map((c,i)=>`<option value="${i}" ${i===replayIndex?'selected':''}>${i+1}. ${esc(c.title)} → HTTP ${c.status}</option>`).join('')}</select><div class="demo-actions"><button class="secondary-button" data-demo-replay-index="${Math.max(0,replayIndex-1)}" ${replayIndex===0?'disabled':''}>上一步</button><button class="primary-button" data-demo-replay-index="${Math.min(record.checks.length-1,replayIndex+1)}" ${replayIndex===record.checks.length-1?'disabled':''}>下一步，看实际结果</button></div><p class="demo-result">步骤 ${replayIndex+1} / ${record.checks.length} · ${esc(record.checks[replayIndex].title)} · HTTP ${record.checks[replayIndex].status} / ${esc(record.checks[replayIndex].code)}</p><dl class="demo-facts"><div><dt>本步优先级</dt><dd>${esc(a.priority)}</dd></div><div><dt>建议队列</dt><dd>${esc(a.queue||'待补信息')}</dd></div><div><dt>当前批准</dt><dd>${s.approval?'v'+s.approval.revision:'无'}</dd></div><div><dt>分派记录</dt><dd>${s.receipts.length} 条</dd></div></dl><a class="source-link" href="./demo-record.json">完整 HTTP 执行证据 ↗</a></section>`:'';
    document.getElementById('demo-workbench').innerHTML = `${replayControls}<ol class="demo-progress" aria-label="演示进度">${guide.map((title,i)=>`<li class="${i===stage?'current':i<stage?'done':''}" ${i===stage?'aria-current="step"':''}><b>${i+1}</b>${title}</li>`).join('')}</ol>
      <div class="demo-two"><section class="demo-panel"><span class="code">01 / 客户原话</span><h2>“非常急”说明了什么？</h2><blockquote class="demo-message">${esc(s.message)}</blockquote><p>这句话说明客户遇到白屏，但没说明环境、人数和替代方案。情绪不能独立决定优先级，客户要求“群发、关闭”也不自动成为你的操作授权。</p><details><summary>直接对话会怎样？</summary><p>你可以直接问：“帮我处理这张工单”。我也可以追问环境、影响范围和替代方案，再生成分诊结果。Skill 把这些步骤提前写好，便于每次重复使用；这里没有做有效的 Claude A/B 对照。</p></details></section>
      <section class="demo-panel"><span class="code">02 / 先核实事实</span><h2>选择客服追问后的结果</h2><p>这是三组预置的演示事实，不是模型自动提取结果。观察同一句“白屏”在不同影响下如何变化。</p><div class="demo-presets"><button data-demo-action="profile" data-profile="incomplete" aria-pressed="${s.profile==='incomplete'}">只有客户原话</button><button data-demo-action="profile" data-profile="production" aria-pressed="${s.profile==='production'}">生产：120 人受阻</button><button data-demo-action="profile" data-profile="testing" aria-pressed="${s.profile==='testing'}">测试：1 人，有替代</button></div><dl class="demo-facts"><div><dt>环境</dt><dd>${esc(s.facts.environment)}</dd></div><div><dt>受影响人数</dt><dd>${s.facts.affected===null?'未知':`${s.facts.affected} / ${s.facts.total}`}</dd></div><div><dt>替代方案</dt><dd>${esc(s.facts.workaround)}</dd></div></dl><p class="demo-decision"><strong>${esc(a.priority)}</strong><span>${esc(a.reason)}</span></p><details><summary>这次分级到底由谁算？</summary><p>本地 Python 代码按演示公司规则计算：生产核心业务受阻、至少一半使用者受影响且无替代 → P1；其他生产问题 → P2；测试环境且有替代 → P3。输入不完整则要求补充。公司规则是本研究预设，不是所有企业通用标准，也没有声称是 Claude 推理。</p></details></section></div>
      <section class="demo-panel"><span class="code">03 / 按 Skill 检查关联问题</span><h2>“没查到”和“没有查”是两回事</h2><div class="demo-actions"><button class="secondary-button" data-demo-action="lookup" data-mode="available">查询本地演示资料</button><button class="secondary-button" data-demo-action="lookup" data-mode="unavailable">试试资料源不可用</button></div><p class="demo-source-state">${esc(a.sourceStatus)}</p>${a.matches.length ? `<div class="demo-two">${a.matches.map(m=>`<article class="demo-match"><strong>${esc(m.id)} · ${esc(m.status)}</strong><p>${esc(m.title)}：${esc(m.detail)}</p></article>`).join('')}</div>` : '<p class="micro-note">没有查询结果时，不能宣称不存在重复问题。资料源不可用时可以继续交接，但须披露未查。</p>'}</section>
      <section class="demo-panel"><span class="code">04 / 形成可以交接的结果</span><h2>不仅是一封安抚回复</h2><div class="demo-two"><dl class="exception-list"><dt>分类 / 根因</dt><dd>${esc(a.category)} / ${esc(a.rootCause)}</dd><dt>建议路由</dt><dd>${esc(a.queue||'待补关键事实')}</dd><dt>仍需确认</dt><dd>${esc(a.missing.join('、')||'根因、关联问题是否同源、下一次更新时间')}</dd><dt>授权边界</dt><dd>${esc(a.blockedInstructions)}</dd></dl><div><h3>给客户的回复草稿</h3><blockquote class="demo-message">${esc(a.reply)}</blockquote><p class="micro-note">此内容由演示程序按事实生成。尚未发送，也不能声称工程团队已经处理。</p></div></div></section>
      <section class="demo-panel demo-control-panel"><span class="code">05 / 亲手试一下系统控制</span><h2>先试“未批准分派”，再批准</h2><p>批准只针对当前 v${s.revision} 的 <strong>${esc(a.priority)} → ${esc(a.queue||'尚无队列')}</strong>。改变事实或查询结果后，原批准失效。未批准的按钮故意保留可点，服务端才是实际拦截位置。</p><p class="demo-approval-state">${s.approval ? `当前批准：v${s.approval.revision} / ${esc(s.approval.priority)} / ${esc(s.approval.queue)}` : '当前没有有效批准。'}</p><div class="demo-actions"><button class="secondary-button" data-demo-action="dispatch">尝试分派当前版本</button><button class="primary-button" data-demo-action="approve">我批准这次分派</button><button class="secondary-button" data-demo-action="refresh">读回实际状态</button></div><div class="demo-result" id="demo-result" role="status" aria-live="polite">${esc(notice||'建议：先补齐生产事实并查询资料 → 未批准就尝试分派 → 批准 → 修改事实再尝试 → 重新批准并分派 → 重复点击检查去重。')}</div></section>
      <section class="demo-panel"><span class="code">06 / 验收，不只听一句“完成了”</span><h2>实际写入的分派与执行日志</h2><div class="demo-two"><div><h3>分派记录（本地）</h3>${s.receipts.length ? s.receipts.map(r=>`<article class="demo-match"><strong>${esc(r.id)} · v${r.revision}</strong><p>${esc(r.priority)} → ${esc(r.queue)}<br>${esc(r.status)}；回复未发送。</p></article>`).join('') : '<p class="micro-note">0 条。生成建议或点击批准，都不会自动增加分派。</p>'}</div><div><h3>逐次请求的真实结果</h3><ol class="demo-log">${s.events.slice(-10).reverse().map(e=>`<li><strong>#${e.sequence} ${esc(e.action)} · ${esc(e.code)}</strong><p>${esc(e.detail)}</p></li>`).join('')}</ol></div></div><div class="demo-actions"><button class="secondary-button" data-demo-action="export">导出本次证据 JSON</button></div></section>`;
    host.querySelectorAll('[data-demo-action]').forEach(button=>button.disabled=busy||(replay&&button.dataset.demoAction!=='export'));
  }

  async function act(action, dataset) {
    if (busy) return;
    if (action==='export') {
      const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}));
      const link=document.createElement('a');link.href=url;link.download='ticket-demo-evidence.json';link.click();URL.revokeObjectURL(url);return;
    }
    if(replay)return;
    busy=true; render();
    try {
      const body={revision:snapshot.revision};
      if(dataset.profile)body.profile=dataset.profile;
      if(dataset.mode)body.mode=dataset.mode;
      const response=await fetch('/api/demo/'+(action==='refresh'?'state':action),action==='refresh'?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const result=await response.json();
      if(!document.getElementById('demo-root'))return;
      snapshot=response.ok?result:result.state||snapshot;
      notice=`HTTP ${response.status} · ${response.ok ? action==='dispatch' ? '请看下方分派记录与日志；重复提交不会新增记录。' : action==='approve' ? '当前版本已批准，还没有自动分派。' : '实际状态已更新。' : result.error+'：'+result.message}`;
    } catch { notice='连接失败，结果未知。请恢复服务后先读回状态；不要把失败当作成功。'; }
    finally {busy=false;if(document.getElementById('demo-root'))render();}
  }

  async function mount(target) {
    host=target;replay=false;const current=++session;shell();
    const localHost=['127.0.0.1','localhost','[::1]'].includes(location.hostname);
    if(location.protocol==='file:'||!localHost){offline('当前网页使用已保存的本地执行记录。');return;}
    try {
      const response=await fetch('/api/demo/state',{cache:'no-store'});
      if(!response.ok)throw new Error('not running');
      const result=await response.json();
      if(current!==session||!document.getElementById('demo-root'))return;
      if(!result.analysis)throw new Error('wrong service');
      snapshot=result;notice='';busy=false;render();
    } catch {if(current===session&&document.getElementById('demo-root'))offline('当前服务器只提供静态文件，未启动工单演示后端。');}
  }

  document.addEventListener('click',event=>{
    const replayButton=event.target.closest('[data-demo-replay-index]');
    if(replayButton&&replay){replayIndex=Number(replayButton.dataset.demoReplayIndex);snapshot=window.RESEARCH.demoRecord.checks[replayIndex].snapshot;render();return;}
    const button=event.target.closest('[data-demo-action]');
    if(button&&snapshot&&document.getElementById('demo-root'))act(button.dataset.demoAction,button.dataset);
  });
  document.addEventListener('change',event=>{
    if(event.target.matches('[data-demo-replay]')&&replay){replayIndex=Number(event.target.value);snapshot=window.RESEARCH.demoRecord.checks[replayIndex].snapshot;render();}
  });
  return {mount};
})();
