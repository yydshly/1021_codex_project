# 实践源码

运行命令与边界见 [项目 README](../README.md)。

- `src/`：无前端依赖的 HTML/CSS/JS 研究专题、架构图查看器、真实数据接入说明与中文教学实验室。`responsive.html` 是 390px 布局检查容器。
- `build.py`：生成静态展示、数据和能力索引。
- `build_architecture.py`：用固定布局生成架构 SVG / PNG，将真实运行截图嵌入对应信息链；修改引导图后再运行 `build.py`。
- `catalog.json`：固定提交提取快照，可离线构建。
- `runtime-tools.json`：实际 tools/list schema，无凭据。
- `setup_original.ps1`：安装固定提交。
- `launch_original.py`：默认离线、本机原版启动器。
- `verify_original.py`：真实应用和 MCP 验证。
- `upstream/`、`.venv/`、`.runtime/`：本机生成，禁止提交。

实践内容采用 AGPL-3.0-only。

公开网页部署在 [GitHub Pages](https://yydshly.github.io/1021_codex_project/projects/011-alphadesk-terminal/)。Pages 仅提供研究说明、历史运行证据与虚构数据教学交互；联网取数与 MCP 服务需要独立启动原版后端。

第二阶段新增：`launch_original.py --public` 使用真实公开来源、固定关闭 SEC；`probe_public.py` 检查原版适配器，`verify_public.py` 检查已运行服务的 HTTP/MCP 数据内容。原始数据只进入忽略的 `.runtime/public/`；`validation-public.json` 只记录元数据与哈希。
