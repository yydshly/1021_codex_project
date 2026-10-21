# 网页源码

原创中文静态研究页。HTML 保存完整正文与权限表，即使禁用 JavaScript 仍可阅读；JavaScript 仅提供筛选、情境切换和目录高亮。

在总仓库根目录构建：

```powershell
python projects/005-storm-breaker/app/build.py
```

产物位于 `../web/`。构建会将源码中的 `{{UPSTREAM}}` 替换为锁定提交的 GitHub URL。运行方法见项目 README。

无 npm 依赖、外部字体、追踪脚本、设备权限调用、上传接口或 Service Worker。脚本不真实检测权限；情境切换仅为解释模型。
