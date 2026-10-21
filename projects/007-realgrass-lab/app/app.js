import { DEFAULTS, clamp } from './model.js';
const $=id=>document.getElementById(id);
const upstreamURL='https://samg-coder.github.io/RealGrass/';
let mode='source',meadow=null,stageVisible=true,starting=false,rendererFailed=false;
const settings={...DEFAULTS,paused:matchMedia('(prefers-reduced-motion: reduce)').matches};
const viewNotes={
  source:'原库在线页面。GPU 状态以画面内提示为准；首次编译可能需要数十秒。无法加载时可重新加载或独立打开。在线版本可能随上游更新。',
  ours:'当前只运行自研版，已释放原库画面。固定范围草地 + 解析风场 + 二维云影；显示的 FPS 仅代表当前环境。',
  split:'原库与自研版同时运行，可能竞争 GPU。相机与参数需手动调整；这是视觉对照，不是公平性能测试。窄屏采用上下排列。'
};
function syncRunning(){meadow?.setActive(mode!=='source'&&stageVisible&&!document.hidden&&!rendererFailed);}
async function startMeadow(){
  if(meadow||starting)return;
  starting=true;rendererFailed=false;$('render-error').hidden=true;
  $('renderer-status').textContent='正在准备草地';
  try{
    const {Meadow}=await import('./renderer.js');
    meadow=new Meadow($('meadow'),stats=>{
      $('stat-count').textContent=stats.count.toLocaleString();
      $('stat-fps').textContent=stats.fps??'—';
      $('stat-draws').textContent=stats.draws;
      $('buffer-info').textContent='实例缓冲 '+(stats.bytes/1048576).toFixed(2)+' MiB · 不含帧缓冲';
    },fail);
    for(const [key,value] of Object.entries(settings))if(meadow.settings[key]!==value)meadow.set(key,value);
    $('renderer-status').textContent=settings.paused?'动画已暂停':'GPU 顶点动画';
    syncRunning();
  }catch(error){fail(error.message);}
  finally{starting=false;}
}
function fail(message){
  rendererFailed=true;$('render-error').hidden=false;$('render-error-text').textContent=message;
  $('renderer-status').textContent='演示未运行';syncRunning();
}
async function setView(next){
  mode=next;
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===next)));
  document.querySelector('.stages').dataset.mode=next;
  $('source-stage').hidden=next==='ours';$('own-stage').hidden=next==='source';$('controls').hidden=next==='source';
  $('reload-source').hidden=next==='ours';$('view-note').textContent=viewNotes[next];
  if(next==='ours'){
    if($('upstream').hasAttribute('src'))$('upstream').removeAttribute('src');
  }else if(!$('upstream').hasAttribute('src'))$('upstream').src=upstreamURL;
  if(next!=='source')await startMeadow();
  syncRunning();
}
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
$('reload-source').addEventListener('click',()=>{$('upstream').src=upstreamURL;$('view-note').textContent='已请求重新加载。页面载入后仍需要 GPU 初始化；运行状态请看原库画面内提示。';});
const observer=new IntersectionObserver(entries=>{stageVisible=entries[0].isIntersecting;syncRunning();},{rootMargin:'150px'});
observer.observe(document.querySelector('.stages'));
document.addEventListener('visibilitychange',syncRunning);
window.addEventListener('pagehide',()=>meadow?.setActive(false));
window.addEventListener('pageshow',syncRunning);

function updateControls(){
  for(const name of ['wind','height','clouds','moisture']){
    $(name).value=settings[name];
    $(name+'-value').textContent=name==='wind'?settings[name].toFixed(1):name==='height'?settings[name].toFixed(2)+' m':Math.round(settings[name]*100)+'%';
  }
  $('density').value=settings.density;$('seed').value=settings.seed;$('flowers').checked=settings.flowers;
  $('pause').textContent=settings.paused?'▷ 继续动画':'Ⅱ 暂停动画';$('pause').setAttribute('aria-pressed',String(settings.paused));
  if(meadow&&!rendererFailed)$('renderer-status').textContent=settings.paused?'动画已暂停':'GPU 顶点动画';
}
function change(name,value){
  settings[name]=value;meadow?.set(name,value);updateControls();
}
for(const name of ['wind','height','clouds','moisture'])$(name).addEventListener('input',event=>change(name,Number(event.target.value)));
$('density').addEventListener('change',event=>change('density',Number(event.target.value)));
$('seed').addEventListener('change',event=>change('seed',clamp(Math.round(Number(event.target.value)||0),0,999999)));
$('flowers').addEventListener('change',event=>{change('flowers',event.target.checked);meadow?.report();});
$('pause').addEventListener('click',()=>change('paused',!settings.paused));
function cameraPreset(name){
  meadow?.preset(name);
  document.querySelectorAll('[data-camera]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.camera===name)));
}
document.querySelectorAll('[data-camera]').forEach(button=>button.addEventListener('click',()=>cameraPreset(button.dataset.camera)));
$('reset').addEventListener('click',()=>{
  Object.assign(settings,DEFAULTS);
  if(meadow){Object.assign(meadow.settings,settings);meadow.time=0;meadow.brush.strength=0;meadow.regenerate();}
  cameraPreset('meadow');updateControls();
  document.querySelectorAll('[data-experiment]').forEach(b=>b.setAttribute('aria-pressed','false'));
  $('experiment-note').textContent='参数、相机与动画时间已恢复默认值。种子 1337 会复现同一片草地。';
});
$('retry').addEventListener('click',async()=>{
  meadow?.destroy();meadow=null;
  // Replacing the canvas also removes old pointer listeners and allows a fresh context.
  const old=$('meadow'),replacement=old.cloneNode(false);old.replaceWith(replacement);
  await startMeadow();
});
const experiments={
  wind:{values:{wind:3,clouds:0,paused:false},camera:'meadow',note:'实验 01：自研版直接由位置与时间计算风；暂停后风会冻结。回到原库切换 Gusts，观察带速度状态的摆动与回弹。两者模型不同，未作拟合比较。'},
  touch:{values:{wind:0,paused:false},camera:'close',note:'实验 02：按住 Shift 在草地上移动，随后换一处。自研版只保留当前笔刷位置与统一衰减；原库为近场草叶保存弯曲和速度，能保留局部运动历史。'},
  cloud:{values:{clouds:0.9,wind:1.2,paused:false},camera:'meadow',note:'实验 03：观察云与地面亮暗的共同移动，再把云量降到 0。自研版用同一二维云场；原库使用三维密度并可飞入云层。两者都有统一云影，但空间表达不同。'},
  distance:{values:{height:0.8,density:56000,paused:false},camera:'overhead',note:'实验 04：俯瞰自研草地，可看到近处更密、远处稀疏，地面颜色补足空隙。它没有 LOD 或流式加载。原库通过相机周围加载与多级远景覆盖维持大范围观感。'}
};
document.querySelectorAll('[data-experiment]').forEach(button=>button.addEventListener('click',async()=>{
  const item=experiments[button.dataset.experiment];
  await setView('ours');
  for(const [key,value] of Object.entries(item.values))change(key,value);
  cameraPreset(item.camera);
  $('experiment-note').textContent=item.note;
  document.querySelectorAll('[data-experiment]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  if(window.scrollY>document.querySelector('.lab').offsetTop)document.querySelector('.lab').scrollIntoView({behavior:'smooth',block:'start'});
}));
document.querySelector('[data-open-split]').addEventListener('click',async()=>{await setView('split');$('experience').scrollIntoView({behavior:'smooth'});});

const commit='f68b918796bbe3409d399e9640ca1f63164d7d26';
const steps={
  growth:{tag:'种子化生成 / GPU COMPUTE',title:'草叶有身份，草丛有结构。',copy:'按植株、分蘖与叶序生成形态，而不是把所有叶片完全随机撒在地上。世界种子让同一位置能够复现；滑块修改的是生长快照，未连续模拟植物生命过程。',formula:'世界种子 + 空间位置\n          ↓\n     植物类型 / 植株\n          ↓\n     分蘖 / 叶序 / 成熟度\n          ↓\n   位置 + 形态 + 生长信息',cost:'代价：更复杂的身份规则、状态布局和近远景一致性维护。',path:'kernels/plant-model.cuh'},
  motion:{tag:'持久化运动 / DAMPED SPRING',title:'相同的风，叶片有各自的历史。',copy:'每片近场叶片保存两个方向的弯曲和速度。风、云场与笔刷产生外力，弹簧把叶片拉回，阻尼让运动逐渐消退。每帧分四个有界子步积分，减少慢帧造成的不稳定。',formula:'加速度 = 外力 − 弹簧系数 × 弯曲\n速度 ← (速度 + 加速度 × dt) × 阻尼\n弯曲 ← 弯曲 + 速度 × dt\n\n自研近似：\n弯曲 = f(位置, 时间, 当前笔刷)\n没有逐叶速度 / 历史缓冲',cost:'代价：需要逐叶状态、每帧计算与稳定积分；自研版省略这部分。',path:'kernels/grass.cu#L43'},
  visibility:{tag:'流式加载与细节分级 / LOD',title:'把计算留给看得见的草。',copy:'相机移动触发周围网格更新，GPU 按可见性和距离把草叶分到不同细节桶，写入间接绘制计数。远景用程序化覆盖补足。正常动画不需要把草叶计数读回 CPU。',formula:'相机 → 周围 6 m 网格更新\n          ↓\nGPU 筛选 → 近 / 中 / 远 / 花序\n          ↓\n  可见索引 + 间接绘制命令\n          ↓\n     渲染器直接读取',cost:'代价：身份连续性、远近颜色一致性与 LOD 过渡都需要维护。',path:'src/main.js#L100'},
  weather:{tag:'共享空间场 / VOLUMETRIC WEATHER',title:'云、阴影与阵风来自同一片天空。',copy:'演化的三维密度沿视线采样，累积云的透射和光照；地面向太阳方向采样得到云影。草的阵风也取自该云场，避免天空、地面和风完全脱节。它仍是程序化天气近似。',formula:'种子 + 空间 + 时间 → 云密度\n           ├→ 视线积分 → 云\n           ├→ 向太阳采样 → 云影\n           └→ 局部采样 → 阵风\n\n自研版：共享二维噪声场，省略体积积分',cost:'代价：多次三维噪声与光线采样；像素数和采样数都会影响成本。',path:'docs/implemented-growth.md'}
};
document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{
  const item=steps[button.dataset.step];
  document.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $('step-tag').textContent=item.tag;$('step-title').textContent=item.title;$('step-copy').textContent=item.copy;
  $('step-formula').textContent=item.formula;$('step-cost').textContent=item.cost;
  $('step-link').href='https://github.com/SamG-Coder/RealGrass/blob/'+commit+'/'+item.path;
}));
const goals={
  decoration:{routes:['canvas','webgl'],text:'固定镜头的网页氛围可从 Canvas 2D / SVG 开始；需要明显的三维视差与漫游，再采用实例化草叶。云可先用贴片或二维噪声。'},
  interactive:{routes:['webgl'],text:'WebGL2 / Three.js 实例化草叶 + 顶点风场。先验证交互需求；需要逐叶回弹历史时，再引入状态缓冲。'},
  simulation:{routes:['feedback','webgpu'],text:'需要持续的受力与回弹历史：WebGL2 可考虑 Transform Feedback；复杂计算、GPU 筛选和间接绘制则考虑原生 WebGPU / WGSL。'},
  game:{routes:['engine','mesh'],text:'先接入引擎已有的地形、植被与材质流程；只有在硬件与原生接口明确、且测量发现瓶颈后，再研究 Mesh Shader 草簇生成。'}
};
document.querySelectorAll('[data-goal]').forEach(button=>button.addEventListener('click',()=>{
  const item=goals[button.dataset.goal];
  document.querySelectorAll('[data-goal]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $('recommendation-text').textContent=item.text;
  document.querySelectorAll('[data-route]').forEach(card=>card.classList.toggle('recommended',item.routes.includes(card.dataset.route)));
}));
updateControls();
