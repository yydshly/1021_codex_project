import * as Cesium from 'cesium';
import { holdContinuousRender, releaseContinuousRender } from '../renderGovernor.js';

/** Local research extension: no credentials, all model/texture URLs are same-origin. */
export function installLocalCity({ viewer }) {
  const cities = {
    hefei: { title: '合肥 · 天鹅湖', description: '航拍重建网格与真实影像纹理<br>公开测试样例 · 非整座城市', range: 3400, dynamic: true, hideBase: true,
      source: 'https://www.icegl.cn/tvtstore/gisPlaneEditor', label: 'ICE 图形学社区 · 倾斜摄影测试样例',
      credit: 'Local Hefei photogrammetry: ICEGL public test sample; original imagery rights remain with their owners' },
    lyon: { title: '里昂街区', description: '真实建筑与影像纹理 · 2018 年', count: 16, range: 950,
      source: 'https://dataset-dl.liris.cnrs.fr/three-d-tiles-lyon-metropolis/README.txt',
      label: 'Métropole de Lyon / LIRIS VCity · Etalab 2.0',
      credit: 'Local city: © Métropole de Lyon (2018) / LIRIS VCity — Etalab Open Licence 2.0' },
    guangzhou: { title: '广州 · 珠江新城', description: '简化建筑体块 · 真实 OSM 轮廓<br>部分高度为估计 · 无航拍纹理', count: undefined, range: 5600,
      source: 'https://github.com/Tsdsj/guangzhou-3d', label: 'OpenStreetMap 贡献者 / Tsdsj · ODbL 1.0',
      credit: 'Local Guangzhou: © OpenStreetMap contributors / Tsdsj, guangzhou-3d — ODbL 1.0; simplified geometry, some estimated heights' },
  };
  const requested = new URLSearchParams(location.search).get('localCity');
  let cityId = cities[requested] ? requested : 'hefei';
  let city = cities[cityId];
  const panel = document.createElement('section');
  panel.setAttribute('aria-label', '本地三维城市');
  panel.style.cssText = 'position:fixed;top:100px;left:24px;z-index:1200;width:275px;padding:16px;background:#0c1722ee;border:1px solid #54bec7;border-radius:12px;color:#e4f4f5;font:14px/1.6 system-ui;box-shadow:0 8px 24px #0006';
  panel.innerHTML = `<strong style="font-size:17px">本地三维城市</strong>
    <label style="display:block;margin-top:8px">选择城市 <select aria-label="选择本地城市" style="width:100%;padding:6px;background:#203d4b;color:white;border:1px solid #50858e;border-radius:5px"><option value="hefei">合肥 · 天鹅湖（实景摄影）</option><option value="guangzhou">广州 · 珠江新城（简化建筑）</option><option value="lyon">里昂街区（带影像纹理）</option></select></label>
    <p data-city-description style="margin:6px 0"></p>
    <div role="status" aria-live="polite">点击加载本机模型</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
      <button data-action="load">加载并定位</button>
      <button data-action="show" disabled>隐藏模型</button>
      <button data-action="base">关闭在线底图</button>
    </div>
    <small style="display:block;margin-top:9px;color:#a9c6ce">滚轮缩放；按住中键拖动可旋转。<br>三维数据从本机读取，周围底图在线。</small>
    <a data-city-source style="color:#71d9df;font-size:12px" target="_blank" rel="noreferrer"></a>`;
  document.body.append(panel);
  for (const button of panel.querySelectorAll('button')) {
    button.style.cssText = 'padding:6px 9px;border:1px solid #50858e;border-radius:5px;background:#203d4b;color:white;cursor:pointer';
  }
  const status = panel.querySelector('[role="status"]');
  const loadButton = panel.querySelector('[data-action="load"]');
  const showButton = panel.querySelector('[data-action="show"]');
  const baseButton = panel.querySelector('[data-action="base"]');
  const citySelect = panel.querySelector('select');
  const description = panel.querySelector('[data-city-description]');
  const sourceLink = panel.querySelector('[data-city-source]');
  function updateCity() {
    citySelect.value = cityId;
    description.innerHTML = `${city.description}<br>无需 API Key · 模型保存在本机`;
    sourceLink.href = city.source;
    sourceLink.textContent = `数据：${city.label}`;
  }
  updateCity();
  let tileset;
  let loading;
  let credit;
  let blockCount = city.count;
  const loadedTiles = new Set();
  let failures = 0;
  let baseVisible = true;
  let renderTimer;
  function wake(milliseconds = 2500) {
    holdContinuousRender('research-local-city');
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => releaseContinuousRender('research-local-city'), milliseconds);
  }
  async function focus() {
    wake();
    viewer.camera.flyToBoundingSphere(tileset.boundingSphere, {
      duration: 0,
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(-25), Cesium.Math.toRadians(-38), city.range,
      ),
    });
    viewer.scene.requestRender();
  }
  async function load() {
    if (loading) return loading;
    if (tileset) {
      tileset.show = true;
      showButton.textContent = '隐藏模型';
      return focus();
    }
    loadButton.disabled = true;
    citySelect.disabled = true;
    status.textContent = '正在读取本机模型…';
    wake(30000);
    loading = (async () => {
      try {
        const manifestResponse = await fetch(`/local-city-data/${cityId}/manifest.json`);
        if (!manifestResponse.ok) throw new Error('本地数据尚未准备，请先运行对应城市的下载脚本');
        const manifest = await manifestResponse.json();
        blockCount = manifest.blocks;
        tileset = await Cesium.Cesium3DTileset.fromUrl(`/local-city-data/${cityId}/tileset.json`, {
          maximumScreenSpaceError: 8,
          lightColor: new Cesium.Cartesian3(2, 2, 2),
        });
        tileset.tileLoad.addEventListener((tile) => {
          loadedTiles.add(tile);
          wake();
          status.textContent = city.dynamic
            ? `按视野读取 ${loadedTiles.size} 块 · 本地共 ${blockCount} 块`
            : `本地模型已载入 ${loadedTiles.size} / ${blockCount} 块${failures ? `；失败 ${failures} 块` : ''}`;
        });
        tileset.allTilesLoaded.addEventListener(() => {
          if (city.dynamic && !failures) status.textContent = `当前视野已就绪 · 本地共 ${blockCount} 块`;
        });
        tileset.tileFailed.addEventListener((error) => {
          failures += 1;
          status.textContent = `模型加载失败 ${failures} 块，请检查本地数据`;
          console.error('[LocalCity]', error);
        });
        viewer.scene.primitives.add(tileset);
        credit = new Cesium.Credit(city.credit, true);
        viewer.creditDisplay.addStaticCredit(credit);
        viewer.scene.globe.depthTestAgainstTerrain = false;
        if (city.hideBase) {
          baseVisible = false;
          viewer.scene.globe.show = false;
          baseButton.textContent = '显示在线底图';
        }
        showButton.disabled = false;
        loadButton.textContent = '重新定位';
        await focus();
        console.info(`[LocalCity] ${cityId} tileset ready; all model URLs served from localhost.`);
      } catch (error) {
        status.textContent = `未能载入模型：${error.message}`;
        if (tileset && !tileset.isDestroyed()) viewer.scene.primitives.remove(tileset);
        tileset = undefined;
        showButton.disabled = true;
        console.error('[LocalCity]', error);
      } finally {
        loadButton.disabled = false;
        citySelect.disabled = false;
        loading = undefined;
      }
    })();
    return loading;
  }
  loadButton.addEventListener('click', load);
  citySelect.addEventListener('change', () => {
    if (tileset && !tileset.isDestroyed()) viewer.scene.primitives.remove(tileset);
    if (credit) viewer.creditDisplay.removeStaticCredit(credit);
    tileset = undefined;
    credit = undefined;
    loadedTiles.clear(); failures = 0;
    cityId = citySelect.value; city = cities[cityId];
    updateCity();
    const url = new URL(location.href); url.searchParams.set('localCity', cityId);
    history.replaceState(null, '', url);
    showButton.disabled = true;
    showButton.textContent = '隐藏模型';
    loadButton.textContent = '加载并定位';
    load();
  });
  showButton.addEventListener('click', () => {
    wake();
    tileset.show = !tileset.show;
    showButton.textContent = tileset.show ? '隐藏模型' : '显示模型';
    viewer.scene.requestRender();
  });
  baseButton.addEventListener('click', () => {
    wake();
    baseVisible = !baseVisible;
    viewer.scene.globe.show = baseVisible;
    baseButton.textContent = baseVisible ? '关闭在线底图' : '显示在线底图';
    viewer.scene.requestRender();
  });
  if (cities[requested]) load();
}
