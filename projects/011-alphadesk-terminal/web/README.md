# 静态研究专题与教学实验室

由 `../app/build.py` 生成，修改 `app/src/` 后重建。相对资源适用于总仓库静态门户。

- `index.html`：中文研究专题，汇总能力、架构、原理、来源、真实运行快照与研究路线。
- `architecture.html`：生成的完整引导图，上方解释核心架构，下方按信息方向对照来源、处理与运行效果，支持放大及下载。
- `lab.html`：18 个教学视图；所有 DEMO 数据均为合成材料，不接入供应商、不保存密钥、不执行交易。
- `real-data.html`：真实公开来源接入说明。原版终端需独立启动本机 8782 服务。
- `research-data.js`：固定版本目录与脱敏实测报告；不含教学 fixtures。
- `validation-*.json`：分阶段实测记录。`media/real-*.jpg` 是实际运行截图；其他图片的归属在页面明确区分。

公开入口：[AlphaDesk 研究专题](https://yydshly.github.io/1021_codex_project/projects/011-alphadesk-terminal/)。截图是历史运行证据，不随市场实时更新；Pages 不托管原版后端或在线 MCP 服务。

AGPL-3.0-only；源文件位于同仓库 `projects/011-alphadesk-terminal/app/`。上游提交和版权信息见项目 README 与随附许可证。
