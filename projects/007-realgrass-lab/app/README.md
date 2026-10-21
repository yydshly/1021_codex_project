# 实践源码

无第三方运行依赖的静态研究网页。先执行 `python build.py`，再用 HTTP 服务打开输出的 `../web/`。

从仓库根目录执行：

```powershell
python projects/007-realgrass-lab/app/build.py
node --test projects/007-realgrass-lab/app/tests/model.test.mjs
python -m http.server 8173 --bind 127.0.0.1
```

访问 http://127.0.0.1:8173/projects/007-realgrass-lab/web/ 。

修改入口为 `index.html`、`styles.css`、`app.js`、`model.js` 与 `renderer.js`。不要单独修改 `web/` 里的生成文件。

浏览器默认加载第三方原库演示；自研版是独立 WebGL2 实现，和原库没有运行时依赖。研究结论与许可说明在父目录。
