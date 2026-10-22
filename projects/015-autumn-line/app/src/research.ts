export {};
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const frame = $<HTMLIFrameElement>('scene');
const settings = $<HTMLFieldSetElement>('settings');
const status = $('status');
let ready = false;
let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
let visible = true;
let watchdog: number | undefined;
const notes = ['颜色、光照、描边与雾共同形成最终画面。', '白色区域是后处理提取的轮廓；调低强度观察变化。', '不同颜色编码表面方向，帮助理解明暗与折线。', '每 50 米重复的灰度深度图，用于观察层次，不用于测量。'];
function send(action: string, value?: number | boolean) {
  frame.contentWindow?.postMessage({ channel: 'autumn-lab', action, value }, location.origin);
}
function sync() {
  send('outline', Number($<HTMLInputElement>('outline').value));
  send('wind', Number($<HTMLInputElement>('wind').value));
  send('diagnostic', Number($<HTMLSelectElement>('diagnostic').value));
  send('quality', Number($<HTMLSelectElement>('quality').value));
  send('pause', paused); send('visible', visible);
  $('pause').textContent = paused ? '继续动画' : '暂停动画';
  if (paused) $('fps').textContent = '暂停';
}
$('launch').addEventListener('click', () => {
  ready = false;
  status.textContent = '生成场景中 · 正在构建地形与森林';
  frame.hidden = false; $('poster').hidden = true;
  frame.src = './scene.html?embedded=1';
  $<HTMLButtonElement>('unload').disabled = false;
  watchdog = window.setTimeout(() => {
    if (!ready) status.textContent = '生成时间较长，可释放后重试，或独立打开场景查看错误。';
  }, 60000);
});
$('unload').addEventListener('click', () => {
  clearTimeout(watchdog); ready = false;
  frame.src = 'about:blank'; frame.hidden = true; $('poster').hidden = false;
  settings.disabled = true; $<HTMLButtonElement>('unload').disabled = true;
  status.textContent = '场景已释放 · 可重新启动';
  $('fps').textContent = '—'; $('build-time').textContent = '—';
});
window.addEventListener('message', (e) => {
  if (e.origin !== location.origin || e.source !== frame.contentWindow || e.data?.channel !== 'autumn-lab') return;
  if (e.data.event === 'ready') {
    clearTimeout(watchdog); ready = true; settings.disabled = false;
    $('build-time').textContent = `${(e.data.ms / 1000).toFixed(1)} s`;
    status.textContent = '实时三维 · 当前画面由本机 GPU 渲染'; sync();
  }
  if (e.data.event === 'fps') $('fps').textContent = paused ? '暂停' : String(e.data.fps);
  if (e.data.event === 'mode') document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(b => {
    if (b.dataset.action !== 'compare') b.setAttribute('aria-pressed', String(b.dataset.action === e.data.mode));
  });
  if (e.data.event === 'error') {
    clearTimeout(watchdog); settings.disabled = true;
    status.textContent = `场景无法运行：${String(e.data.message).slice(0, 150)}。可释放场景并查看截图。`;
  }
});
document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(b => b.addEventListener('click', () => send(b.dataset.action!)));
for (const id of ['outline', 'wind']) {
  $<HTMLInputElement>(id).addEventListener('input', () => {
    const v = Number($<HTMLInputElement>(id).value);
    $(id + '-value').textContent = v.toFixed(1); send(id, v);
  });
}
$('diagnostic').addEventListener('change', () => {
  const n = Number($<HTMLSelectElement>('diagnostic').value);
  $('layer-note').textContent = notes[n]; send('diagnostic', n);
});
$('quality').addEventListener('change', () => send('quality', Number($<HTMLSelectElement>('quality').value)));
$('pause').addEventListener('click', () => { paused = !paused; sync(); $('fps').textContent = paused ? '暂停' : '—'; });
$('reset').addEventListener('click', () => {
  for (const id of ['outline', 'wind']) { $<HTMLInputElement>(id).value = '1'; $(id + '-value').textContent = '1.0'; }
  $<HTMLSelectElement>('diagnostic').value = '0'; $<HTMLSelectElement>('quality').value = '1';
  $('layer-note').textContent = notes[0]; paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  send('photo'); sync();
});
const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (ready) send('visible', visible); }, { threshold: 0 });
observer.observe($('viewport'));
document.querySelectorAll<HTMLAnchorElement>('[data-source]').forEach(a => {
  a.href = `https://github.com/ishuagrawal/autumn-line/blob/c5e84c0282c5c86ccc595e9d7fa5f5edb040aa26/${a.dataset.source}`;
  a.target = '_blank'; a.rel = 'noreferrer';
});
