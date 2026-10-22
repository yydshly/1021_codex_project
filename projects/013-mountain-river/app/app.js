const $ = selector => document.querySelector(selector);
const revision = 'ed17b133ce37f8c97e93262681041d2aded2d8e2';
const shots = {
  river: {label:'RIVER', title:'观察水如何遇见岩石', description:'留意岩石前后的水面与泡沫。河床和障碍进入同一套水流计算，泡沫由局部流动条件产生并向下游输运。', alt:'河道视角：水流绕过岩石并沿阶梯河床下落'},
  overlook: {label:'OVERLOOK', title:'从河流，看见整个河谷', description:'俯瞰河床的落差、岩石分布与植被。地形由种子和河段位置生成；相机移动时，系统准备前方河段，只持续模拟附近三段。', alt:'俯瞰视角：程序化河床、岩石与森林分布'},
  waterline: {label:'WATERLINE', title:'一层水面，几层视觉细节', description:'贴近水面，在暖色光照下观察深浅水色、折射、泡沫与细波。大尺度高度来自模拟，小波纹和光学材质共同形成细节。', alt:'水面视角：暖色光照下的折射、波纹与泡沫'}
};
const steps = [
  ['生成河床','先有河床，水才知道往哪走。','根据固定种子与区段位置，生成河床、岩石和植被。岩石的可见形状与水流障碍共用几何函数，让看到的石头与参与计算的石头保持一致。','种子 + 河段位置 → 可重复生成的地形','river.cu'],
  ['计算水流','每一步，都在交换相邻格子的水。','网格记录水深和水平速度。先输运速度，再根据水面高度差与阻力更新流动；计算格子边界通量，并限制流出量，最后更新水深。泡沫随后被流速场输运。','新水量 = 原水量 + 流入量 − 流出量','coastal-kernels.cu'],
  ['绘制水面','把水深、流速和法线交给材质。','Three.js 读取共享的 GPU 缓冲区，将模拟结果绘成水面。水深影响颜色与透光；观察角度影响反射；随流速移动的纹理与粒子补足泡沫、细波和飞溅。','模拟数据 + 光学着色 + 视觉粒子 → 画面','materials.js'],
  ['延伸世界','只计算身边的水，提前准备远处。','用固定的十个区段槽位复用 GPU 资源，附近三个河段持续模拟。相邻区段交换水位、速度与泡沫；远处河段被回收后，再返回会重新生成，旧动态状态不保留。','相机位置 → 区段准备 → 边界交换 → 资源复用','sections.js']
];
let frame = null, timer = null, timeout = null, launching = false, generation = 0;
function clearTimers(){clearInterval(timer); clearTimeout(timeout); timer=null; timeout=null;}
function stopScene(message='截图模式 · 无需 WebGPU 即可浏览'){
  generation++; clearTimers(); frame?.remove(); frame=null; launching=false;
  $('#stage').classList.remove('live'); $('#launch-overlay').hidden=false; $('#launch').disabled=false;
  $('#launch').textContent='▶ 启动原版交互演示'; $('#stop').hidden=true; $('#stage-label').hidden=false;
  $('#runtime-status').textContent=message;
  const selected=shots[document.querySelector('.shot.active').dataset.shot];
  $('#shot-title').textContent=selected.title; $('#shot-description').textContent=selected.description;
}
document.querySelectorAll('.shot').forEach(button=>button.addEventListener('click',()=>{
  stopScene(); const shot=shots[button.dataset.shot];
  document.querySelectorAll('.shot').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  $('#scene-image').src=`assets/${button.dataset.shot}.png`; $('#scene-image').alt=shot.alt;
  $('#shot-title').textContent=shot.title; $('#shot-description').textContent=shot.description;
  $('#stage-label').textContent=`实机截图 / ${shot.label}`;
}));
document.querySelectorAll('.step').forEach(button=>button.addEventListener('click',()=>{
  const index=Number(button.dataset.step), step=steps[index];
  document.querySelectorAll('.step').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  $('#step-label').textContent=`0${index+1} / ${step[0]}`; $('#step-title').textContent=step[1];
  $('#step-description').textContent=step[2]; $('#step-formula').textContent=step[3];
  $('#step-source').href=`https://github.com/SamG-Coder/MountainRIver/blob/${revision}/src/${step[4]}`;
  $('#step-source').textContent=`查看 ${step[4]} 源码 ↗`;
}));
$('#launch').addEventListener('click',async()=>{
  if(frame||launching)return;
  const attempt=++generation; launching=true; $('#launch').disabled=true;
  $('#runtime-status').textContent='正在检查 WebGPU 支持…';
  try{
    if(!navigator.gpu)throw Error('浏览器未提供 WebGPU，请在支持 WebGPU 且开启硬件加速的浏览器中访问 HTTPS 或 localhost。');
    const adapter=await navigator.gpu.requestAdapter();
    if(attempt!==generation)return;
    if(!adapter)throw Error('未找到可用的 WebGPU 设备。可以继续浏览截图，或更换支持 WebGPU 的浏览器。');
    frame=document.createElement('iframe'); frame.title='Mountain River 原版交互场景'; frame.src='scene/index.html'; frame.allow='fullscreen';
    $('#stage').append(frame); $('#stage').classList.add('live'); $('#launch-overlay').hidden=true;
    $('#stage-label').hidden=true; $('#stop').hidden=false; $('#runtime-status').textContent='正在编译内核、准备河段；首次启动可能需要 1–2 分钟…';
    $('#shot-title').textContent='自由探索，观察实时变化';
    $('#shot-description').textContent='当前是运行中的原版场景，从河道视角开始。使用 View 切换视角、Flow 调整水流、Light 切换光照。下方截图按钮会退出演示并回到静态观察。';
    timer=setInterval(()=>{
      try{
        const error=frame?.contentDocument?.querySelector('#error');
        if(error&&!error.hidden){stopScene('原版启动失败：'+error.textContent);return;}
        if(frame?.contentWindow?.river?.ready){clearTimers();$('#runtime-status').textContent='原版正在运行 · 点击场景后可用 WASD 飞行';}
      }catch{stopScene('无法读取演示状态，请尝试在独立窗口打开。');}
    },800);
    timeout=setTimeout(()=>stopScene('启动等待超时，已释放场景。可重试或在独立窗口打开。'),180000);
  }catch(error){if(attempt===generation)stopScene(error.message);}
});
$('#stop').addEventListener('click',()=>stopScene('已退出演示 · GPU 场景已卸载'));
if(!navigator.gpu)$('#compatibility').textContent='当前浏览器未提供 WebGPU。截图和原理解读仍可使用；交互演示需要支持 WebGPU 且开启硬件加速的浏览器。';
