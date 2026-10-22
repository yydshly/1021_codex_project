/* Native, dependency-free interactions. Data is embedded by build.py for offline use. */
(() => {
  'use strict';
  const styles = window.STYLES;
  const commit = '49052d80bfaf9fa8412cc9710530e5e95a3b8d8c';
  const repo = 'https://github.com/Vincentwei1021/mg-styles-15';
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const source = (path) => `${repo}/${path.includes('.') ? 'blob' : 'tree'}/${commit}/${path}`;
  const list = (items) => `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
  let filter = '全部';
  let selected = 0;
  let detailTab = 0;
  let previousFocus = null;
  const dialog = $('style-dialog');
  document.querySelectorAll('[data-source]').forEach(a => {
    a.href = source(a.dataset.source); a.target = '_blank'; a.rel = 'noreferrer';
  });

  function renderGallery() {
    const query = $('search').value.trim().toLocaleLowerCase();
    const visible = styles.filter(s => (filter === '全部' || s.category === filter) &&
      [s.name, s.en, s.description, s.category, ...s.technicalPrinciples, ...s.useCases].join(' ').toLocaleLowerCase().includes(query));
    $('style-grid').innerHTML = visible.map(s => `
      <article class="style-card"><button data-open="${esc(s.slug)}" aria-label="观看${esc(s.name)}并查看原理">
        <div class="card-media ${s.slug === '18-hanazi' ? 'portrait' : ''}">
          <img src="media/${esc(s.slug)}.jpg" alt="${esc(s.work)}原作封面" loading="lazy" width="1280" height="800">
          <span class="card-number">${s.id}</span><span class="card-play" aria-hidden="true">▶</span>
        </div><div class="card-topline"><h3>${esc(s.name)}</h3><span aria-hidden="true">↗</span></div>
        <p class="card-en">${esc(s.en)}</p><p class="card-description">${esc(s.description)}</p>
        <span class="card-category">${esc(s.category)} <span aria-hidden="true">/</span> 原作 · 原理 · 应用</span>
      </button></article>`).join('');
    $('result-count').textContent = `显示 ${visible.length} / 15 个案例`;
    $('empty-state').hidden = visible.length > 0;
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => {
      const active = b === button;
      b.classList.toggle('active', active); b.setAttribute('aria-pressed', active);
    });
    renderGallery();
  }));
  $('search').addEventListener('input', renderGallery);
  $('reset-search').addEventListener('click', () => {
    $('search').value = ''; document.querySelector('[data-filter="全部"]').click(); $('search').focus();
  });

  function renderDetailContent() {
    const s = styles[selected];
    if (detailTab === 0) {
      $('detail-content').innerHTML = `<div><span class="mini-label">DESIGN / 观看感受从哪里来</span><h3>设计原理</h3>${list(s.designPrinciples)}</div><div><span class="mini-label">IMPLEMENTATION / 源码怎样实现</span><h3>技术原理</h3>${list(s.technicalPrinciples)}</div>`;
    } else if (detailTab === 1) {
      $('detail-content').innerHTML = `<div><span class="mini-label">VALUE / 研究解读</span><h3>这类效果带来什么价值</h3><p>${esc(s.value)}</p></div><div><span class="mini-label">USE CASES / 应用建议</span><h3>可以用在哪里</h3>${list(s.useCases)}<p>以上为风格适配建议，并非上游已经实现的业务功能。</p></div>`;
    } else {
      $('detail-content').innerHTML = `<div><span class="mini-label">EXTENSIONS / 待实现方向</span><h3>如何继续扩展</h3>${list(s.extensions)}</div><div><span class="mini-label">LIMITS / 制作时需要考虑</span><h3>适用边界</h3><p>${esc(s.limitations)}</p><p style="margin-top:18px">本页播放已发布的原作副本，未重新运行此案例的完整制作链路。</p></div>`;
    }
  }
  function loadDetail() {
    const s = styles[selected];
    const video = $('detail-video');
    video.pause();
    video.poster = `media/${s.slug}.jpg`;
    video.classList.toggle('portrait', s.slug === '18-hanazi');
    video.src = `media/${s.slug}.mp4`;
    video.load();
    $('detail-index').textContent = `${s.id} / 15 — STYLE NOTES`;
    $('detail-category').textContent = s.category;
    $('detail-title').textContent = s.name;
    $('detail-en').textContent = s.en.toUpperCase();
    $('detail-work').textContent = s.work;
    $('detail-description').textContent = s.description;
    $('original-link').href = `https://raw.githubusercontent.com/Vincentwei1021/mg-styles-15/${commit}/${s.videoPath}`;
    $('source-link').href = source(s.sourcePath);
    $('prompt-link').href = source(s.promptPath);
    $('copy-status').textContent = '';
    $('detail-video-note').textContent = '上游原作的压缩预览 · 播放时请打开声音';
    $('detail-evidence-links').innerHTML = s.evidencePaths.map(p => `<a href="${source(p)}" target="_blank" rel="noreferrer">${esc(p)} ↗</a>`).join('');
    renderDetailContent();
    dialog.scrollTop = 0;
  }
  function openStyle(slug) {
    const index = styles.findIndex(s => s.slug === slug);
    if (index < 0) return;
    selected = index;
    previousFocus = document.activeElement;
    loadDetail();
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('dialog-open');
    $('detail-close').focus({preventScroll:true});
  }
  document.addEventListener('click', e => {
    const button = e.target.closest('[data-open]');
    if (button) openStyle(button.dataset.open);
  });
  $('detail-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    const video = $('detail-video');
    video.pause(); video.removeAttribute('src'); video.load();
    document.body.classList.remove('dialog-open');
    previousFocus?.focus({preventScroll:true});
  });
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
  $('detail-prev').addEventListener('click', () => {selected = (selected + 14) % 15; loadDetail();});
  $('detail-next').addEventListener('click', () => {selected = (selected + 1) % 15; loadDetail();});
  $('detail-video').addEventListener('error', () => {
    if (dialog.open && $('detail-video').getAttribute('src'))
      $('detail-video-note').textContent = '视频加载失败，请通过“原作高清”打开固定版本的原片。';
  });
  $('copy-prompt').addEventListener('click', async () => {
    const prompt = window.PROMPTS[styles[selected].slug];
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(prompt);
      else {
        const area = document.createElement('textarea');
        area.value = prompt; area.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        dialog.append(area); area.select();
        const copied = document.execCommand('copy'); area.remove();
        if (!copied) throw new Error('Copy unavailable');
      }
      $('copy-status').textContent = '提示词已复制。它描述创作要求，不保证一次生成相同作品。';
    } catch {
      $('copy-status').textContent = '浏览器未允许复制，请打开“完整提示词”手动复制。';
    }
  });

  const principles = [
    {title:'速度的变化，比位移更有表现力。', description:'同样从 A 到 B，匀速显得机械；先加速再减速，会形成起步与落定。弹簧加入越过目标再回来的过程，让动作带有重量和弹性。', formula:'position = start + (end − start) × ease(t)', tip:'拖动进度，比较三个圆点的相对位置。选择缓动要服务于物体性格，弹簧也不是越多越好。'},
    {title:'形状轻微变化，物体就有了触感。', description:'快速运动时拉长，接触地面时压扁，再回弹恢复。横向放大时纵向缩小，可以大致维持面积，避免看起来像物体突然变大。', formula:'scaleX = 1 + squash; scaleY ≈ 1 / scaleX', tip:'在约 65% 进度处观察触地的形变。这里是原理示意，实际作品通常结合速度、碰撞与材质控制。'},
    {title:'让视线有顺序，而不是同时被争抢。', description:'多个元素间隔几帧进入，观众就能感知它们的关系。主角先动，辅助元素随后跟进，既建立节奏，也降低信息同时出现的负担。', formula:'localTime(i) = time − i × delay', tip:'试试在 20% 到 70% 之间缓慢拖动。错峰间隔太长会拖沓，太短则很难被感知。'},
    {title:'把转场变成上一幕动作的结果。', description:'让圆点、气泡或卡片扩大成为遮罩，带出下一幕。观众能追踪同一个物体，场景转换就会更连贯，视觉注意力也有明确去处。', formula:'maskRadius = interpolate(time, 0 → fullFrame)', tip:'示意中的蓝色圆形逐渐覆盖场景，背后是下一幕。这里只展示遮罩机制，不替代具体分镜设计。'},
    {title:'用有限的变化，建立清晰的阅读顺序。', description:'大小、明暗、颜色和位置共同决定先看哪里。让少数元素突出，其他元素退后；扁平画面即使没有真实景深，也可以拥有层次。', formula:'hierarchy = scale + contrast + space + timing', tip:'进度从左到右，观察焦点如何从左侧移到右侧。图形全部同样醒目时，重点反而会消失。'},
    {title:'声音让动作的发生时刻更明确。', description:'落地、弹出、切换等动作与音效起音对齐，观众会更容易感到冲击和节奏。音乐节拍提供结构，但不必让每一个元素都卡同一个拍。', formula:'frame = round(timeInSeconds × fps)', tip:'此示意不播放声音；竖线代表预先安排的节拍事件。拖动游标，看事件与图形动作如何对齐。'},
  ];
  let principle = 0;
  let playing = false;
  let animationId;
  function drawLab() {
    const t = Number($('lab-progress').value) / 60;
    $('lab-time').textContent = `FRAME ${String(Math.round(t*60)).padStart(3,'0')} / 060`;
    $('lab-output').textContent = `${Math.round(t*100)}%`;
    const c = {orange:'#ed5c36', blue:'#3046d3', ink:'#222820', mint:'#b1c990'};
    const line = (y) => `<path d="M145 ${y}H655" stroke="#c7cdbb" stroke-dasharray="4 7"/>`;
    const label = (x,y,text) => `<text x="${x}" y="${y}" font-size="16" fill="#697062" font-family="Atlas,sans-serif">${text}</text>`;
    const ball = (x,y,r,color,extra='') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${extra}/>`;
    const smooth = x => x*x*(3-2*x);
    const clamp = x => Math.min(1,Math.max(0,x));
    const spring = x => x === 0 ? 0 : 1 - Math.exp(-6*x)*Math.cos(11*x);
    let svg = '';
    if (principle === 0) {
      [['匀速',t,c.ink],['缓入缓出',smooth(t),c.blue],['弹性回弹',spring(t),c.orange]].forEach(([name,v,color],i) => {
        const y=70+i*95; svg+=label(15,y+6,name)+line(y)+ball(145+500*v,y,25,color);
      });
    } else if (principle === 1) {
      const x=140+480*t;
      const y=t<.65 ? 60+195*(t/.65)**2 : 255-130*Math.sin((t-.65)/.35*Math.PI);
      const squash=Math.exp(-(((t-.65)/.055)**2))*.33;
      svg=`<path d="M80 285H690" stroke="#222820" stroke-width="3"/>`+
        `<g transform="translate(${x} ${y}) scale(${1+squash} ${1/(1+squash)})">${ball(0,0,32,c.orange)}</g>`+
        label(80,325,'预备 → 下落 → 压扁 → 回弹');
    } else if (principle === 2) {
      for(let i=0;i<5;i++){
        const progress=clamp((t-i*.11)/.38), p=spring(progress);
        svg+=`<g opacity="${progress}" transform="translate(${120+i*130} ${235-95*p}) scale(${Math.max(.02,p)})"><rect x="-40" y="-40" width="80" height="80" rx="${i%2?8:40}" fill="${[c.orange,c.blue,c.mint,c.ink,c.orange][i]}"/></g>`;
      }
      svg+=label(80,300,'每个元素延迟一点，整体就有了秩序。');
    } else if (principle === 3) {
      svg=`<defs><clipPath id="lab-mask"><circle cx="380" cy="170" r="${smooth(t)*450}"/></clipPath></defs><rect x="40" y="25" width="680" height="285" rx="4" fill="#eedec5"/>`+
      label(80,75,'上一幕')+`<g clip-path="url(#lab-mask)"><rect x="40" y="25" width="680" height="285" fill="${c.blue}"/><text x="380" y="185" font-size="40" fill="#fff" text-anchor="middle" font-family="Atlas,sans-serif">下一种可能</text></g>`;
    } else if (principle === 4) {
      for(let i=0;i<3;i++){
        const focus=Math.exp(-(((t-i*.5)/.23)**2));
        svg+=ball(170+i*210,160,35+38*focus,focus>.4?c.orange:'#b9c4a7')+label(135+i*210,280,['第一眼','第二眼','第三眼'][i]);
      }
    } else {
      svg=line(235);
      for(let i=0;i<5;i++){
        const x=145+i*125; svg+=`<path d="M${x} 205v60" stroke="#a3ad94" stroke-width="3"/>`;
        svg+=ball(x,125,18+24*Math.exp(-(((t-i*.25)/.045)**2)),i%2?c.blue:c.orange);
      }
      svg+=`<path d="M${145+t*500} 60v230" stroke="${c.ink}" stroke-width="3"/>`+label(80,325,'拍点 1            2            3            4            5');
    }
    $('lab-svg').innerHTML=svg;
    $('lab-svg').setAttribute('aria-label', principles[principle].title);
  }
  function changePrinciple(index) {
    principle=index; const p=principles[index];
    $('principle-title').textContent=p.title;
    $('principle-description').textContent=p.description;
    $('principle-formula').textContent=p.formula;
    $('principle-tip').textContent=p.tip;
    drawLab();
  }
  function stopLab() {
    playing=false; cancelAnimationFrame(animationId);
    $('lab-play').textContent='▶'; $('lab-play').setAttribute('aria-label','播放原理示意');
  }
  $('lab-progress').addEventListener('input',()=>{stopLab();drawLab();});
  $('lab-play').addEventListener('click',()=>{
    if(playing){stopLab();return;}
    playing=true; $('lab-play').textContent='Ⅱ'; $('lab-play').setAttribute('aria-label','暂停原理示意');
    const start=performance.now();
    const tick=now=>{
      if(!playing)return;
      $('lab-progress').value=Math.min(60,((now-start)/2500)*60);
      drawLab();
      if(now-start>=2500){stopLab();return;}
      animationId=requestAnimationFrame(tick);
    };
    animationId=requestAnimationFrame(tick);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopLab();});

  const steps=[
    {title:'先定义要做什么', name:'创意与输出约束', input:'输入：故事、品牌、风格特征、画幅与时长。提示词把审美目标和技术条件写清楚，减少模糊空间。', output:'输出：一份可执行的创作任务。保留风格特征，替换创意内容；提示词表达的是目标，不是质量保证。', path:'template.md'},
    {title:'将创意写成程序', name:'场景与运动逻辑', input:'AI 编写图形、场景、相机、时间函数和素材脚本。不同案例选择 SVG、Canvas2D、Three.js、WebGL 或 Blender。', output:'输出：可检查与修改的源码。字幕、物体位置和时序都成为明确数据；仍需运行、观察并修正。', path:'demos/01-flat-vector/index.html'},
    {title:'时间决定当前画面', name:'确定性的逐帧渲染', input:'网页暴露 renderAt(t)。渲染器把时间设为 0、1/30、2/30…，让 Chrome 画出对应帧并截图。', output:'输出：按顺序排列的帧。10 秒 × 30 fps = 300 帧。给定代码与环境可以重渲染，无须再次让 AI 创作。', path:'harness/render.mjs'},
    {title:'让声音配合动作', name:'音乐与事件音效', input:'audio.py 使用音频工具与乐器采样生成音轨。配乐节拍、动作事件和音效起点围绕时间点安排。', output:'输出：WAV 音轨。时间点提供同步依据；数值库、采样和环境不同可能造成重跑结果差异。', path:'lib/audio'},
    {title:'把帧与声音装成视频', name:'编码与混流', input:'FFmpeg 接收渲染帧和音轨，按指定帧率编码，处理像素格式、画质与音频参数。', output:'输出：可播放的 MP4。编码质量、尺寸、帧率与片长共同影响清晰度、文件体积和制作成本。', path:'harness/render.mjs'},
    {title:'从可运行到可交付', name:'检查、评审、修改', input:'检查黑帧、字体、裁切、音量、时长；再看构图、运动节奏、叙事与音画关系。原作者记录了多轮修改。', output:'输出：修改意见与下一轮代码。作者的 AI 评分属于其制作记录，本页不将它视为独立质量认证。', path:'rubric.md'},
  ];
  function changeStep(index) {
    const s=steps[index];
    $('pipeline-detail').innerHTML=`<div><p class="tiny-label">STEP 0${index+1}</p><h3>${s.title}</h3><a href="${source(s.path)}" target="_blank" rel="noreferrer">查看依据 ↗</a></div><div><h4>${s.name}</h4><p>${s.input}</p></div><div><h4>结果与边界</h4><p>${s.output}</p></div>`;
  }
  const scenarios=[
    {title:'让人记住你，而不只记住特效。', description:'品牌标识、发布活动、栏目片头，需要鲜明且可重复识别的视觉语言。先确定气质与关键动作，再控制色板、字体和结束画面。', value:'将静态品牌资产变成可重复使用的动态识别；短片适合作为开场、转场或传播片段。', slugs:['08-morph','04-3d-render','09-bauhaus','06-collage'], boundary:'视觉效果不能替代品牌定位；复杂材质和 3D 镜头还需要额外制作时间。'},
    {title:'用运动解释关系，用顺序降低理解成本。', description:'产品功能、业务流程或系统结构，可以用几何角色、图标、路径和空间模型呈现。让观众先理解一个动作，再引出下一步。', value:'用抽象图形减少无关细节，突出因果与流程。对于真实操作步骤，可结合界面录屏与注释。', slugs:['01-flat-vector','03-isometric','02-line-art','12-aurora-glass'], boundary:'仓库短片是风格样例，没有内置你的业务逻辑或产品数据；需要重新写分镜。'},
    {title:'用视觉节奏托住信息，给重点一个落点。', description:'科普、教育、综艺剪辑与游戏内容，需要兼顾信息清晰和情绪变化。图解承载概念，字幕强调重点，风格增强观看体验。', value:'把复杂概念拆成小段，以人物、贴纸或字幕帮助记忆。适合制作说明片段和栏目包装。', slugs:['19-paperclip','18-hanazi','05-cel-boil','20-pixel'], boundary:'字幕可读性优先于花哨；长内容仍需脚本、旁白与事实核查。'},
    {title:'先做一个好模板，再谈一百个版本。', description:'商品卡片、多语言片尾、数据报告和系列宣传，可以共享视觉结构。先把内容与动画代码分离，再通过参数生成多个版本。', value:'让一次设计支持后续复用，减少重复编辑，并保持系列作品的视觉一致性。', slugs:['01-flat-vector','09-bauhaus','08-morph'], boundary:'这是扩展方向：上游没有完整的批量队列、审核平台或在线编辑器，需要单独开发。'},
  ];
  function changeScenario(index) {
    const s=scenarios[index];
    $('scenario-panel').innerHTML=`<div><h3>${s.title}</h3><p>${s.description}</p></div><div><span class="scenario-label">VALUE / 建议采用的方式</span><p>${s.value}</p><div class="scenario-recs">${s.slugs.map(slug=>`<button data-open="${slug}">${esc(styles.find(i=>i.slug===slug).name)} ↗</button>`).join('')}</div><p class="scenario-boundary">${s.boundary}</p></div>`;
  }
  function bindTabs(attribute,panelId,callback) {
    const buttons=[...document.querySelectorAll(`[${attribute}]`)];
    function activate(button,focus=false) {
      buttons.forEach(b=>{
        const active=b===button; b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1;b.classList.toggle('active',active);
      });
      $(panelId).setAttribute('aria-labelledby',button.id);
      callback(Number(button.getAttribute(attribute)));
      if(focus)button.focus();
    }
    buttons.forEach((button,i)=>{
      button.addEventListener('click',()=>activate(button));
      button.addEventListener('keydown',event=>{
        let next;
        if(event.key==='ArrowRight')next=(i+1)%buttons.length;
        if(event.key==='ArrowLeft')next=(i-1+buttons.length)%buttons.length;
        if(event.key==='Home')next=0;
        if(event.key==='End')next=buttons.length-1;
        if(next!==undefined){event.preventDefault();activate(buttons[next],true);}
      });
    });
  }
  bindTabs('data-principle','principle-panel',changePrinciple);
  bindTabs('data-step','pipeline-detail',changeStep);
  bindTabs('data-scenario','scenario-panel',changeScenario);
  bindTabs('data-detail-tab','detail-content',index=>{detailTab=index;renderDetailContent();});
  renderGallery();changePrinciple(0);changeStep(0);changeScenario(0);
})();
