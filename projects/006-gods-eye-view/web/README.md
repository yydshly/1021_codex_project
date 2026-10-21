# God’s Eye View 完整研究网页

本目录是有意版本化的静态产物，不是原 God’s Eye View 地球应用。研究主线见项目根目录 `INFORMATION-SOURCES.md`，运行与模型实践见 `RUNNING.md`。

- `index.html`：完整研究主页面，直接展示理解、能力与场景、6 张效果对照、真实与模拟、地球加载比较、采集设计、11 类来源、国内证据、Key 与费用、本地缓存、价值、问答、进展和资料目录。
- `guide.html`：`STUDY-GUIDE.md` 的完整阅读页，作为理解与使用取舍的内容来源。
- `review.html`：本次完整性和阅读路径复核，包含截图、修正与剩余缺口。
- `research.html`：完整研究；`practice.html`：历史运行与模型附录。
- `overview.html`、`notes.html`、`local-data.html`：项目说明、研究记录和本地数据说明。
- `assets/`：被研究文档引用的截图与证据；没有模型原始数据。
- `build-manifest.json`：构建输入的 SHA-256，便于检查网页与文档一致。

页面展示 2026-10-21 的来源研究与保存的探测结果，不自动联网取数。所有相对路径可用于静态子目录部署。

2026-10-22 补充单张研究总览图，位于首页的“一图总览”展开区；提供宽 3600 像素 PNG 与正文可放大的 SVG。图中证据日期仍为 2026-10-20—21，没有重新请求信息源。图像内容与复现脚本见 `app/overview-content.json`、`app/build-overview-image.py`；只导出静态文字、图片和自生成 SVG，不含凭据或模型原始文件。

`STUDY-GUIDE.md` 的 10 节内容同步进入主页面；来源卡片读取 `INFORMATION-SOURCES.md`，探测表读取保存的 JSON。新增选用矩阵、国内候选调查和接入验收链路；国内候选未接入，不计入旧探测。截图切换说明在 `app/research-web/effects.json`，模板与样式在同目录。效果图是历史实机截图，原地球服务需要另行启动。修改内容后重建，避免文档与网页分离。

主页面提供随页阅读栏：章节跳转与整页搜索，搜索包含折叠的来源详情和问答。用空格分隔多个关键词；点击来源结果会清除来源目录原有筛选并展开对应卡片。搜索只查当前静态研究，不调用外部搜索服务。

公开网页的安装、运行和探测脚本链接指向研究仓库源码，避免下载孤立启动器造成缺失依赖。复现原应用须先克隆完整仓库，再按运行说明操作；静态网页不运行本地服务端或保管 API Key。

在总仓库根目录重建：

```powershell
python -m pip install -r projects/006-gods-eye-view/app/requirements-web.txt
python -X utf8 projects/006-gods-eye-view/app/build-research-web.py
python scripts/catalog.py --update-readme
```

预览：

```powershell
python -m http.server 8766 --bind 127.0.0.1 --directory projects/006-gods-eye-view/web
```

打开 `http://localhost:8766/`。此目录中的静态阅读和交互不依赖原应用的 4173 服务；网页中的旧运行地址按历史记录理解，原应用需另行启动。
