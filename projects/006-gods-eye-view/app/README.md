# 实践入口

研究主线见[信息采集设计与来源详表](../INFORMATION-SOURCES.md)。此目录保留可复现运行与有限取数验证工具；模型作为已有实践记录。

## 研究网页构建

在总仓库根目录执行：

```powershell
python -m pip install -r projects/006-gods-eye-view/app/requirements-web.txt
python -X utf8 projects/006-gods-eye-view/app/build-research-web.py
python -m http.server 8766 --bind 127.0.0.1 --directory projects/006-gods-eye-view/web
```

首次构建需要 Markdown 3.10.2，当前机器已安装。预生成的 `web/` 可直接托管，不需要再次安装依赖。源模板、样式和交互位于 `research-web/`；来源详情与实测结果分别从研究 Markdown 和证据 JSON 生成。只导出被文档引用且允许公开的文件，不导出 `data/`、`upstream/`、`.runtime/` 或 `.logs/`。

综合理解与取舍维护在 `../STUDY-GUIDE.md`，10 节内容同步到主页面；`research-web/effects.json` 组织 6 张已有实机截图及各自范围、许可和精度说明。整页搜索在浏览器中索引静态章节和来源详情，不访问外部搜索接口。上游能力、本机结果、未验证项分别标注，不自动探测外部接口，也不自动启动原应用。

## 研究总览图构建

在仓库根目录执行：

```powershell
python -m pip install -r projects/006-gods-eye-view/app/requirements-overview.txt
python -X utf8 projects/006-gods-eye-view/app/build-overview-image.py
python -X utf8 projects/006-gods-eye-view/app/build-research-web.py
```

当前机器已安装 Pillow 11.3.0，本次没有新增安装。默认读取 Windows 的微软雅黑字体；其他环境可用 `--font` 与 `--bold-font` 指定含中文字形的字体文件。内容源为 `overview-content.json`，取材为固定版研究文档与已保存截图，不调用外部接口。生成 `assets/research-overview-20261022.png`、同名 SVG 和校验摘要 JSON；研究网页提供展开与原图入口。

## 原地球应用

此目录提供固定版本的 Windows 运行包装，不复制上游源码到研究总仓库的版本历史。

```powershell
.\setup.ps1
.\run.ps1 -OpenBrowser
```

- 上游版本与运行环境见 `upstream.lock.json`。
- `setup.ps1` 会保留已有上游本地修改；版本不一致且存在修改时停止。
- `run.ps1` 仅监听 `127.0.0.1`，默认端口 4173，按 Ctrl+C 停止。
- 需要重新安装依赖时，先停止服务，再运行 `.\setup.ps1 -ForceInstall`，避免 Windows 锁定运行中的原生模块。
- `upstream/`、`.runtime/`、`.logs/` 均不提交。上游 `.env` 只保存在本地。
- 不需要 Puppeteer 的浏览器回归测试，所以安装时跳过额外 Chromium 下载。

本地三维城市扩展见 [LOCAL-DATA.md](LOCAL-DATA.md)。`setup.ps1` 安装扩展；合肥、广州、里昂分别使用 `prepare-hefei.ps1`、`prepare-guangzhou.ps1`、`prepare-local-city.ps1` 准备。`data/` 不提交到 Git。

## 有限公开入口探测

```powershell
python -X utf8 projects/006-gods-eye-view/app/probe-public-sources.py --output projects/006-gods-eye-view/app/.logs/source-probe-latest.json
```

以上命令在总仓库根目录执行，需要 Python 3.10+ 和联网，无第三方 Python 依赖。各入口一次无凭据 GET，4 路并发、20 秒超时、2 MiB 响应上限，不重试、不关闭证书校验，不保存完整响应。输出的是接口/基础格式证据，不是国内数据覆盖、许可或浏览器业务验收。复跑另存新文件，不覆盖 `assets/` 中的历史记录。

## 广州国内样例

运行 `prepare-guangzhou.ps1` 下载固定版本的广州开放数据库并转换为本地 3D Tiles；检查使用 `check-guangzhou.py`。服务启动后打开项目的 `open-guangzhou.cmd`。模型有真实建筑轮廓，部分高度为估计，无航拍纹理。城市选择保留合肥、广州与里昂，详见 [LOCAL-DATA.md](LOCAL-DATA.md)。
