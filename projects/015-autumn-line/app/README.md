# 实践源码

此目录基于 `ishuagrawal/autumn-line` 的 `c5e84c0282c5c86ccc595e9d7fa5f5edb040aa26`，保留 MIT 许可证及 `UPSTREAM-README.md`。

- `index.html` + `src/research.ts/css`：本地新增研究展示界面。
- `scene.html` + `src/boot.ts`：独立三维场景入口及启动错误提示。
- `src/main.ts`：上游入口，增加同源参数控制、暂停/可见性及释放处理。
- `src/render/post.ts`：增加整体描边强度参数；其余主要场景算法沿用上游。
- `vite.config.ts`：双入口、相对资源路径、输出到 `../web/`，不保留上游截图上传端点。

`npm ci` 安装锁定依赖；`npm run dev` 开发；`npm run build` 检查类型并构建。重建会替换当前子项目的 `web/` 构建产物。

源图及第三方声明位于 `public/`，由构建复制到 `web/`。详情见上一级研究 README。
