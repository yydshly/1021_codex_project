# 项目维护指南

## 编号与目录

- 使用三位编号与小写英文 slug：`001-project-name`。
- 新编号取已有最大编号加一；保留归档条目，不复用编号。
- 首页和演示门户按编号升序展示，与 JSON 中的录入顺序无关。
- slug 尽量固定，避免已发布演示与文档链接变化。
- 研究状态为 `待研究`、`研究中`、`已完成`、`已归档`。

## 新增一个项目

1. 确认原仓库链接、研究目标和上游许可证。
2. 将 `templates/project/` 复制到 `projects/001-example/`，按实际下一个编号命名。
3. 修改项目 README、研究记录与实践代码；删除或替换不适用的提示。
4. 在根目录 `projects.json` 的 `projects` 数组中添加元数据：

```json
{
  "id": "001",
  "slug": "example",
  "title": "项目名称",
  "summary": "一句话说明项目能力与本次研究重点。",
  "repository": "https://github.com/owner/repository",
  "status": "待研究",
  "image": null
}
```

5. 有截图后，将 `image` 改为实际存在的项目内相对路径，如 `assets/cover.png`。
6. 执行 `python scripts/catalog.py --update-readme`，自动更新首页表格、图片展示和本地演示门户。
7. 执行 `python -m unittest discover -s tests` 与 `python scripts/catalog.py --check`，检查差异后提交。

不要手动编辑首页 `PROJECT_INDEX` 标记之间的内容；该区域由元数据生成。标记之外的介绍和导航可自由维护。

### 网站研究来源

研究对象是网站且未确认公开源码时，使用 `"repository": null` 并提供 `"source_url": "https://example.com/page"`。来源链接须为无凭据的 HTTPS URL；括号使用 URL 编码。README 中明确记录“未确认公开仓库”、授权情况与访问日期，不编造 GitHub 地址或开源许可证。已有开源项目继续使用原来的 `repository` 字段。

## 子项目建议结构

```text
projects/001-example/
├── README.md       # 介绍、截图、复现说明、研究结论
├── notes.md        # 研究过程与实验记录
├── assets/         # 封面与截图
├── app/            # 实践源码，各项目独立管理依赖
└── web/            # 可选的静态导出；有 index.html 才创建演示入口
```

演示目录在生成门户时会整体复制，因此只放可公开访问的文件。图片由 `image` 字段按需复制；笔记与 `app/` 源码不进入 Pages 站点。仓库本身是公开的，已提交的文件仍可在 GitHub 上访问。

## 归档与许可证

停止研究时将状态设为 `已归档`，保留已有编号、结论和来源。不要将上游许可证替换成总仓库的许可证；引入第三方代码或素材时，应逐项确认授权并保留声明。
