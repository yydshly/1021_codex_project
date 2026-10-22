# 实践源码

`index.html`、`styles.css`、`app.js` 是研究页源码，`upstream/` 是 Mountain River 固定提交 `ed17b133ce37f8c97e93262681041d2aded2d8e2` 的原版快照。

从总仓库根目录执行：

```powershell
python projects/013-mountain-river/app/build.py
python -m http.server 8174 --bind 127.0.0.1
```

打开 <http://127.0.0.1:8174/projects/013-mountain-river/web/>。无需 npm 安装，不依赖外部 CDN。修改研究页后重新执行 `build.py`，不要直接修改 `web/` 生成文件。原版源码保持不变。

编译检查：`node projects/013-mountain-river/app/upstream/scripts/check-kernels.mjs`。
