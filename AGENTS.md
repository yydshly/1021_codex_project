# 仓库协作约定

- 这是多个开源项目的研究总仓库。文档默认使用简体中文。
- 新增研究前阅读 `docs/project-guide.md`；部署前阅读 `docs/deployment.md`。
- 子项目目录使用 `projects/NNN-slug/`，编号从 `001` 递增，保留归档条目，不复用编号。
- `projects.json` 是索引元数据来源。更改后运行 `python scripts/catalog.py --update-readme`；不要手动修改 README 的自动生成区。
- 每个研究项目记录上游仓库、许可证、研究版本、运行方法和验证结果；未验证的结论需明确标注。
- 封面与截图放入项目 `assets/`；实践源码放入 `app/`；可公开发布的静态产物放入 `web/`。
- 不提交凭据、依赖目录或根目录 `_site/`。子项目 `web/` 是有意版本化的静态产物。
- 视频、素材制作与渲染验证完成后，及时清理本轮可重建的编译缓存、渲染打包目录、验证副本和不再使用的根目录 `_site/`；保留源码、锁文件、配置、原始素材、成片与研究记录。不得整目录清空混有源码或证据的 `.cache/`。收尾步骤见 `docs/project-guide.md`。
- 完成相关变更后运行 `python -m unittest discover -s tests` 和 `python scripts/catalog.py --check`。
- 首次初始化不占用真实项目编号，也不编造研究内容或截图。
