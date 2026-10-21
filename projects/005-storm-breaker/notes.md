# 研究记录

## 2026-10-20 · 源码与权限边界

### 范围与方法

只读查询 GitHub API、README 和关键源码，核对浏览器接口文档。未执行上游代码或采集用户数据。创建研究网页不等于部署采集服务。

- 固定 Commit：`4d7235104870ec0224f445fd905c98f22a105426`。
- GitHub API 仓库 `license` 为 null；提交文件树未发现 LICENSE。上游授权情况待作者确认。
- README 的更新日志日期不等于最新提交日期；本页以锁定 Commit 定义研究版本。
- 已有其他工作目录占用 001–004，使用 005，保留其他工作内容。

### 关键证据

| 文件 | 观察 | 结论层级 |
| --- | --- | --- |
| `modules/control.py` | 启动 PHP 内置服务，管理 PID | 源码确认 |
| `storm-web/assets/js/loc.js` | ClientJS、navigator 与 ipify；非 Brave 分支等待 IP 回调再上传 | 源码确认；失败影响为静态推断 |
| `storm-web/assets/js/location.js` | getCurrentPosition；经纬度构建地图链接 | 单次定位，源码确认 |
| `storm-web/templates/camera_temp/index.html` | getUserMedia，9000ms 计时，640×640 Canvas，严格模式下未声明 cc 赋值 | 设计意图确认；异常影响待复现 |
| `storm-web/templates/camera_temp/post.php` | Base64 解码并保存 PNG | 源码确认 |
| `storm-web/templates/microphone/js/_app.js` | 6000ms 停止计时，导出 WAV、重新开始录音，可能早于授权结束调用 rec.stop | 源码确认；时序影响待复现 |
| `storm-web/templates/microphone/upload.php` | 保存录音文件并写结果消息 | 源码确认 |
| `storm-web/templates/normal_data/handler.php` | 覆盖写入 result.txt | 源码确认 |
| `storm-web/receiver.php` | 遍历结果文件，读取后清空 | 源码确认；并发影响待复现 |
| `storm-web/assets/js/script.js` | HTTP 链接、2 秒轮询、停止按钮只 clearInterval、清空按钮清客户端显示 | 源码确认 |

源码链接统一使用 `https://github.com/ultrasecurity/Storm-Breaker/blob/4d7235104870ec0224f445fd905c98f22a105426/` 加表中文件路径；网页提供直接链接。

### 对话理解的校正

- “所有信息”改为“实现了采集逻辑且当前浏览器 / 权限提供的信息”。
- “无论如何拿不到”改为“正常普通网页没有通用直接读取接口”；主动共享、扩展、安装程序或漏洞是不同路径。
- “用户没点允许”不等于没有有效授权，可能已有保留授权。
- “CPU 名称”不直接等同于处理器型号；媒体 deviceId 不等于硬件序列号。
- “关闭浏览器界面”需区分真正卸载页面与最小化 / 切应用 / 锁屏。
- “停止监听”仅停止管理面板轮询，不能推断停止客户端采集。
- 通知 / 后台同步能力不构成关页后继续使用相机和麦克风的证据。

### 网页验证

已完成以下验证，均针对原创研究网页：

- `python projects/005-storm-breaker/app/build.py`：生成三项静态资源，成功。
- `node --check projects/005-storm-breaker/web/app.js`：语法检查通过。
- 本地 HTTP 首页响应 200。
- 桌面内容宽度与视口宽度均为 1265px，无整页横向溢出。
- 390px iframe 中实际可用内容宽度为 375px，内容 scrollWidth 同为 375px；九个 section 无横向溢出。宽表格保留容器内横向滚动，不挤宽页面。仅为窄视口模拟，未使用真实手机。
- 分类筛选结果：基础信息 6 项、特定授权 8 项、无法直接读取 8 项；恢复全部为 22 项。
- 搜索“密码”得到 2 项；不存在关键词显示空状态；清空后恢复全部。
- 五阶段流程均可切换解释；关页、有授权再打开、后台及撤销授权情境按预期显示。
- FAQ 可通过 Enter 展开；采用原生按钮、复选框、details 与可见焦点样式。
- 已检查时段内浏览器控制台无 error / warn。
- 静态核验：无重复 ID、内部锚点有效、静态资源存在、上游 blob 引用全部锁定 Commit、CSS / JS 源码与产物一致。
- 临时移动端 QA 页面已移除；发布目录仅保留最终研究页面和资源。
- `python scripts/catalog.py --update-readme`：索引与门户已生成。
- `python -m unittest discover -s tests`：6 项测试通过。
- `python scripts/catalog.py --check`：通过。

实际渲染截图：`assets/cover.png`、`assets/lifecycle.png`、`assets/mobile-preview.png`。这些只证明研究网页的展示，不证明上游工具能成功采集。

### 未验证

- 上游在当前 Chrome、Edge、Firefox、Safari、移动端中的真实采集结果。
- 图片上传问题、录音初始化问题的浏览器复现。
- 定位精度、录音连续性、后台 / 锁屏表现和多用户并发。
- 完整身份认证、上传安全与文件访问控制审计。
- 线上 Pages 部署。

### 后续实验设计（未执行）

在知情同意的自有设备环境中记录浏览器版本、授权方式、安全上下文与接口错误；分别测试首次拒绝、首次允许、重新访问、切后台、真正关页与撤销权限。实验需区分“新采集数据”“已排队上传”“服务端保存的旧数据”，不把面板仍在运行当成继续采集的证据。

## 2026-10-20 · 单张信息图

用户要求用一张尽可能完整的图解释库的能力、浏览器可得信息、权限分类、使用价值与关闭页面前后差异。

- 内置 imagegen 连续两次因网络请求错误未返回图片，未使用需要密钥的 API 回退。
- 最终使用原创 SVG 布局与 Pillow 从文本、形状直接渲染 PNG，未编辑或挪用上游图片。
- 图稿包含五大部分：实际能力与流程、三类信息边界、六种生命周期情境、使用场景、六项核心结论。
- 保留普通网页范围、浏览器差异、单次定位、间隔抓拍、授权逐项、关页不删服务端数据等条件。
- 已人工查看整图，检查文字不重叠；修正中文行首标点与“用途范围”可能引起的误解，改为“访问范围”。
- PNG / SVG 来自同一排版数据；PNG 便于分享，SVG 可放大且文字可检索。
- 原始生成要求保存在 `app/infographic-prompt.md`，最终文案以 `app/create_overview.py` 为准。

## 2026-10-21 · 导读图整合与静态网页发布

- 首页使用既有原创 PNG 作为导读预览，正文提供完整长图、折叠阅读、高清打开及 PNG / SVG 下载；未修改已生成图稿。
- 增加“它是什么、支持什么、价值在哪里”摘要；区分上游五项实现与普通浏览器能力，保留单次定位、间隔抓拍、分段录音及效果未实测的限定。
- 构建脚本将原图复制到 web/assets，避免发布后引用研究目录导致图片丢失。
- 本地浏览器确认：两处图片均加载成功，1265px 视口无整页横向溢出；导读锚点和展开 / 收起正常；检查时段控制台无警告或错误。
- 更新 assets/cover.png 为新首页实际截图。既有移动端和生命周期截图保留为前一版验证记录。
- 发布前检查：6 项仓库单元测试通过，catalog --check 通过；页面 ID 唯一、内部锚点与本地资源存在、源码与静态产物一致，发布目录 PNG / SVG 与原图逐字节一致。
- 发布目标：https://yydshly.github.io/1021_codex_project/projects/005-storm-breaker/ 。通过仓库 pages.yml 工作流部署；具体执行状态以 GitHub Actions 为准。
- 本次发布仅为原创研究网页，上游采集器的运行验证范围保持不变。
