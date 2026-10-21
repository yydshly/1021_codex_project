# 信息图原始设计要求

内置 imagegen 两次请求均因网络错误失败，未返回图片。最终采用本地 SVG 排版及 PNG 渲染，文字以 create_overview.py 中的数据为准。未使用图片 API 或密钥。

Use case: infographic-diagram
Create ONE exceptionally legible, detailed Simplified Chinese educational infographic, a tall portrait poster, ideally 2160×3840 px or highest available portrait resolution. The subject is the GitHub project ultrasecurity/Storm-Breaker and the boundaries of information ordinary websites can obtain. This is a finished information poster, not a UI mockup or photo of a poster. Flat original vector-like diagrams and precise Chinese typography. Off-white paper background, deep forest-green text and section headers, muted green for normally available data, amber for permission-gated data, muted rust for unavailable direct access. Restrained line icons (browser, lock, camera, microphone, pin, file, server), thin rules, readable table, strong hierarchy. No hacker imagery, no fake screenshots, no decorative code, no giant unused whitespace. Content-rich but professional and clear when zoomed. Use the entire canvas, with generous margins and no clipped text. Render the following Chinese information accurately. Do not invent capabilities, results or success rates. All main sections must appear on ONE image.

Title:
Storm-Breaker
浏览器能知道你多少？
Subtitle:
能力 · 权限边界 · 数据去向 · 关页后的变化
Lead:
核心：读取网页可访问的数据，申请特定权限，再通过网络上传。
它获得的是网站权限，不是整台设备的控制权。

SECTION 01 — 这个库实际实现了什么？
Five compact rows, each labeled “源码实现，效果未实测” collectively:
设备信息：系统、浏览器、分辨率、语言、时区、逻辑处理器数量；通过第三方服务查询出口 IP。
定位：获得经纬度并生成地图链接；单次定位，不是连续轨迹追踪。
摄像头：请求朝向用户的摄像头；设计为约每 9 秒上传一张 640×640 PNG，不是完整视频直播。
麦克风：单声道 WAV 分段上传；约 6 秒停止、导出并重新录制，不保证连续无间隙。
管理面板：保存与查看结果、下载及清空日志。“停止监听”只停止面板轮询，不会让访客停止采集。

Show a clear thin horizontal process diagram with arrows:
打开模板 → 读取信息／请求权限 → 浏览器采集 → HTTP 上传 → PHP 保存／面板展示
Underneath concise roles:
Python 启动服务 · JavaScript 调用浏览器接口 · PHP 接收文件
天气、附近服务、相机等页面包装影响用户的授权决定；关键实现未发现权限绕过机制。

SECTION 02 — 浏览器信息边界全景
Prominent qualification: 以下是一般网页能力，不代表本库全部实现。不同浏览器、系统与版本存在差异。
Three distinct colored panels with text labels, do not rely on color alone. Use two columns of content inside panels if helpful for legibility.

GREEN PANEL: A｜通常无需弹窗
• 网络访问：服务器可见出口 IP、请求内容和访问时间；VPN 通常改变出口 IP，不能隐藏全部行为。
• 环境信息：部分系统／浏览器信息、语言、时区；可能被缩减或伪装。
• 设备能力：屏幕／窗口尺寸、像素比例、触摸支持、逻辑处理器数；部分浏览器提供粗略内存。
• 页面行为：本站点击、滚动、停留、可见状态及输入；未提交的表单也可能被读取。
• 本站数据：可访问的 Cookie、本地存储与本站账号关联；脚本不能读取 HttpOnly Cookie。
• 浏览器指纹：Canvas、WebGL、音频计算等特征可用于概率性关联；音频指纹不等于录音。
Emphasize: 密码框的圆点只遮挡显示；输入或填入当前网站的密码可能被该页面读取。

AMBER PANEL: B｜需要特定授权或主动选择
• 摄像头：获准设备的实时画面，可拍照／录像；不包括相册。
• 麦克风：麦克风声音，可录音；不自动包括系统内部音频和通话记录。
• 位置：经纬度与精度等；可请求持续更新，但本库只做单次定位，高精度请求不保证精确结果。
• 屏幕共享：用户选定标签页、窗口或屏幕；每次启动需授权，整屏共享可能暴露其他应用画面。
• 文件／目录：用户选中的内容与元数据；目录授权可能覆盖内部文件，照片可能带拍摄时间和位置。
• 剪贴板：按浏览器规则授权或主动粘贴，通常仅当前内容，不是完整历史。
• 联系人：部分浏览器允许选择联系人和字段，不是静默读取整本通讯录。
• USB／蓝牙／串口：支持的平台上访问获准设备及协议允许的数据，不是系统管理权限。
Small separate note: 其他接口依平台而异，如通知、运动传感器、本地字体；通知权限不等于读取系统通知内容。

RUST PANEL: C｜普通网页不能直接任意读取
• 其他网站的 Cookie、私有页面与登录令牌。
• 浏览器全部保存密码、全部历史、书签与标签页清单。
• 未授权的硬盘文件、相册和其他应用数据库。
• 聊天记录库、系统短信库、通话记录库。
• 其他进程内存、全局键盘输入、任意系统命令。
• 本机 MAC、IMEI、SIM 身份等硬件标识。
• 系统保存的指纹／人脸模板；WebAuthn 返回认证证明，不返回生物模板或私钥。
Panel footer:
限定：普通网页与正常安全模型。扩展、安装程序、特权桥接或漏洞是其他路径。
“不能直接读取”不等于“不能间接看到”：共享聊天画面、主动上传文件，会产生新的数据来源。

SECTION 03 — 用户同意后，关闭网页会怎样？
Highly readable four-column lifecycle comparison table. Columns:
状态｜权限可能保留？｜还能采集新数据？｜关键差异
Rows:
首次访问、未授权｜无有效敏感权限｜基础信息可能；敏感采集不可直接进行｜通常需询问，拒绝则相关采集失败
页面打开、已授权｜是｜满足接口与系统条件时可以｜授权逐项，不是一次全开
切后台／最小化／锁屏｜可能｜已有采集可能继续，也可能受限｜切后台不等于关闭
真正关闭采集页面｜可能｜该页面停止新采集｜假设没有其他相关页面继续运行
再次打开同一网站｜若授权仍有效｜可能无需再次弹窗就重新采集｜没有弹窗不等于绕过权限
撤销相关权限｜对应授权取消｜该项敏感采集不能继续直接进行｜基础信息仍可能可读
Strong highlighted takeaway under table:
权限是否保留 ≠ 页面是否仍在运行
已上传到服务器的数据，不会因关页或撤销权限自动删除。
Service Worker 的推送／同步能力不等于关页后仍可偷拍或录音；已排队请求完成也不等于采集新数据。

SECTION 04 — 使用场景与意义
Four short blocks:
隐私教育：理解“只是访问”与“点击允许”的差别。
社会工程学研究：识别页面用途与实际数据使用之间的落差。
开发学习：理解浏览器 API、编码上传、文件保存和轮询展示。
受控演示：在知情同意的自有设备环境核验权限行为与浏览器差异。
Evaluation:
价值主要在流程整合与安全教学；技术新意有限，不宜据此认定为成熟、稳定的监控产品。

SECTION 05 — 最值得记住的六件事
Use a concise numbered takeaway strip in two columns:
1 “无需权限”只适用于部分信息。
2 授权相机不等于授权麦克风、定位或文件。
3 数据可读后，通常没有统一的额外“上传确认框”。
4 HTTPS 保护传输，不证明网站用途可信。
5 IP 推测位置不等于精确住址；指纹不等于永久设备身份证。
6 撤销授权、停止采集、删除服务器数据，是三件不同的事。

FOOTER source and verification:
研究依据：ultrasecurity/Storm-Breaker @ 4d72351；MDN、W3C 与 Chrome 权限文档。
静态源码研究；上游未部署、未真机采集。已发现潜在脚本异常、HTTP 链接与结果覆盖问题，实际效果待验证。
研究日期：2026-10-20｜005 · 开源研究室

Accuracy constraints: Do not label granted camera permissions as operating-system takeover. Do not imply that closing one tab stops other open pages. Do not imply all browser data are available or that all listed browser APIs are implemented by this repository. Do not invent exact location accuracy. Keep all explanatory distinctions. Ensure Chinese text is sharp, correctly spelled and large enough for detailed reading. Prefer condensed precise Chinese, but preserve all listed facts.
