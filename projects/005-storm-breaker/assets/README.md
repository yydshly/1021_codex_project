# 网页截图

以下均由本研究网页的实际浏览器渲染取得，不是上游工具运行结果。

- `cover.png`：桌面首页与权限边界示意。
- `lifecycle.png`：关页情境解释。
- `mobile-preview.png`：390px 宽 iframe（扣除滚动条后内容视口 375px）的实际渲染与宽度核验。

截图仅作为视觉记录，不代表跨设备兼容性或上游采集能力验证。

## 原创信息图

- `storm-breaker-overview.png`：2400 像素宽高清单图，内容包含能力、权限分类、页面生命周期与研究意义。
- `storm-breaker-overview.svg`：同一图稿的可缩放版本，中文字依赖设备上的中文字体。

由 `../app/create_overview.py` 本地排版与渲染；这是解释示意，不是上游采集结果。内置 imagegen 两次调用均因网络错误失败，未采用其图片输出。设计要求保存在 `../app/infographic-prompt.md`。
