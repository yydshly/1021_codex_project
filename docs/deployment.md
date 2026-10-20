# 多个 Web 演示的部署

## 路径规划

一个仓库对应一个 GitHub Pages 站点，多个静态应用使用不同子路径：

| 内容 | 预期地址 |
| --- | --- |
| 演示门户 | `https://yydshly.github.io/1021_codex_project/` |
| 001 示例 | `https://yydshly.github.io/1021_codex_project/projects/001-example/` |
| 002 示例 | `https://yydshly.github.io/1021_codex_project/projects/002-example/` |

以上子项目名称仅说明路径规则，当前没有已部署项目。

## 首次启用

1. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
2. 在 **Actions → Deploy GitHub Pages → Run workflow** 手动运行，选择 `main`。
3. 等待部署成功，在 Actions 的 `github-pages` 环境链接中打开站点。

部署工作流目前仅支持手动触发；普通 push 和 pull request 只运行校验，不会发布网站。以后需要自动发布时，可在部署工作流中添加 `push.branches: [main]`。

## 添加演示

1. 先按 [维护指南](project-guide.md) 注册研究项目。
2. 原生静态站点直接放入 `projects/NNN-slug/web/`；框架项目先构建，再将输出内容复制到该目录。
3. 确认 `web/index.html` 存在。工具据此自动生成演示链接，无需单独登记 URL。
4. 运行 `python scripts/catalog.py --update-readme`，提交元数据、首页与静态产物，再手动发布。

`_site/` 是生成目录，不提交到 Git。构建工具会先清空它，再生成门户、复制已登记项目的封面与静态演示。各项目可以使用不同的前端技术；统一部署流程不负责安装或编译各个应用。

## 子路径与运行限制

- 资源链接优先用相对路径。使用 Vite 等工具时，将 base 配置为 `/1021_codex_project/projects/NNN-slug/`，或在适用时使用 `./`。
- 单页应用优先使用 hash 路由；GitHub Pages 不提供任意路由回退，history 路由刷新可能返回 404。
- Pages 仅托管静态文件。服务端、数据库与秘密 API 密钥需要其他服务，不能直接随前端发布。
- 发布内容是 `web/` 的完整内容。提交前检查构建产物和 source map 是否适合公开。
- 如需完整部署路径预览，可将 `_site` 的内容放在临时服务器目录下的 `1021_codex_project/` 子目录，再从该服务器根目录启动预览。

参考：[GitHub Pages 简介](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)、[自定义工作流发布](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
