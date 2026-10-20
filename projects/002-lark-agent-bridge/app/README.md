# 研究网页源码

这是解释上游项目的静态网页，不是 agent 桥接服务。

从总仓库根目录运行：

```powershell
python projects/002-lark-agent-bridge/app/build.py
```

修改 `index.html`、`styles.css`、`app.js`，构建后得到 `../web/` 中可直接发布的同名静态文件。构建脚本将 `data-source` 链接转换为固定上游 Commit 的 GitHub 链接，使来源入口在禁用 JavaScript 时仍可用。

页面交互仅切换研究解释，没有发送消息、执行 agent、读写项目文件或调用模型的能力。
