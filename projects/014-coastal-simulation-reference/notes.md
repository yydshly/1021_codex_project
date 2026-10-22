# 既有研究核对记录

## 2026-10-22 · 去重与关联

用户确认无需重复研究，要求在当前仓库记录已完成内容、链接历史 012 并保留扩展方向。因此本条标记“已归档”，沿用旧项目作为完整证据与运行成果来源。

- 已阅读旧仓库 `projects/012-coastal-simulation-cuda-webshader/` 下的 README、研究与发布记录，以及 `web/upstream/INTEGRATION.md`。
- 已检查 `web/upstream/src/local-extension.js` 和启动接入点：`reef=1` 在初始化前向共用 ROCKS 定义增加一处礁石。历史记录说明该模式跳过烘焙初态并重新预热求解。
- 通过 `git ls-remote https://github.com/SamG-Coder/coastal-simulation-cuda-webshader.git refs/heads/main` 核对，上游返回 `e5a80fe42b4eeba6c01de1467035bafd69592d3e`，与历史集成版本一致。这是本次核对时的状态，不保证之后不更新。
- 历史记录载明上游 `npm test` 通过 50 个部署 JS 模块导入审计与 21 个 CUDA 入口编译检查；还记录了公网三维原版、新礁石和二维实验运行核验。这些为历史验证，不是本次重跑结果。
- 本次仅增加关联文档和索引；未重跑三维演示、硬件 GPU 数值测试或性能基准，也未重新部署历史网页。

## 防止后续混淆

- 旧仓库 008 为原版 coastal-simulation 研究，009 为 ShoreBreak，010 为独立算法教学实验室，012 为本次所指 GPU 移植版研究。
- 当前仓库 012 是 three-freecam，不能将两处相同编号视为同一项目。
- 当前仓库 013 已由 mountain-river 目录占用，本关联记录使用下一个编号 014。
- 完整三维水体来自上游；我们已完成的主要增量是中文研究、运行集成、单处礁石验证和独立二维实验。自由地形进入三维求解器、完整场景编辑与分享仍待开发。
