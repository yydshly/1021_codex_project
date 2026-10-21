# 研究工具

## 交互式网页构建

```powershell
python projects/003-knowledge-work-plugins/app/build.py
```

`build.py` 从研究文档提取 17 个代表流程、14 类约束和 13 份模板（通用任务卡加 12 个场景模板），结合 `source-index.json` 与 `labels.json` 导出 `web/`。构建不需要下载上游、安装前端依赖或连接模型。

- `../business-analysis.json`：17 个流程的深化内容来源，含具体案例、输入检查、三层控制证据、异常、审批、验收和价值指标。`extra_sources` 使用固定上游版本的相对文件路径。
- `../business-analysis.md`：构建生成的完整中文研究报告，包含原流程输入、步骤与交付物；与网页使用同一份数据，避免两处维护不同结论。
- 构建检查 W01–W17 覆盖与固定版本一致；为 17 个流程草稿和 12 份场景模板加入落地补充，通用任务卡另补相应字段。不要手动编辑 `web/data.js` 或生成的研究报告。
- `index.html`、`styles.css`、`app.js`：网页结构、响应式布局与原生交互。
- `labels.json`：17 类角色配置与 181 个 Skill 的中文用途标签。中文标签是本研究整理，原文用途在场景详情中保留。
- `web/data.js`：从当前研究文档构建的浏览器数据，不手工编辑。
- 静态资源使用内容摘要参数避免旧缓存；数据中转义 `<`，页面对动态文本做 HTML 转义。
- 复制优先使用浏览器 Clipboard API，不支持时尝试本地复制；失败时选中文本供手动复制。

源码变更后重新构建，再预览 `web/`。可运行 `node --check projects/003-knowledge-work-plugins/app/app.js` 检查语法；使用方式及浏览器验证记录见上级 README、notes.md。

## 一张能力全景图

```powershell
python projects/003-knowledge-work-plugins/app/draw_capability_map.py
python projects/003-knowledge-work-plugins/app/build.py
```

`draw_capability_map.py` 使用同一套文字与坐标生成 `assets/capability-map.svg`（2000×3140）与 `assets/capability-map.png`（4000×6280）。生成器从 `source-index.json` 读取数量，从 `labels.json` 读取角色中文名，并校验 17 个角色、181 个 Skill 与已保存工单记录中的状态码。岗位场景和解释文字由研究归纳；不生成或调用模型。

PNG 生成使用 Pillow（本次 11.3.0）和 Windows 的微软雅黑常规 / 粗体字库。SVG 保留文字与形状，可继续编辑；PNG 可跨平台阅读。`capability-map-preview.png` 是低分辨率检查副本。`build.py` 将两份正式图复制到 `web/`，网页“全景图”使用 SVG 展示并提供 PNG 原图入口。

## 工单实操与真实记录回放

- `demo_server.py`：标准库 HTTP 服务，绑定本机地址，实际执行必要事实、查重状态、批准版本与重复分派检查。仅写临时目录中的虚构工单，不调用模型或业务连接器。
- `live-demo.js`：现场操作界面和离线记录回放，分别明确标记。静态页面用构建时嵌入的数据，不用 AJAX 读取本地 JSON。
- `record_demo.py`：启动全新临时服务，执行 15 次 POST 和最终 GET 断言；保存 `../demo/execution-record.json`，构建时复制为 `web/demo-record.json` 并嵌入浏览器数据。
- `test_demo.py`：5 项控制测试，包含服务端拒绝和并发重复提交。运行 `python -m unittest discover -s projects/003-knowledge-work-plugins/app -p test_demo.py`。
- `run_live_demo.py`：为后续真实 Claude A/B/C 比较准备的脚本；本次 A 请求因过期认证失败，不能声称完成比较。仅临时提取固定上游的客服 Skill，未全局安装插件。使用前阅读 [演示说明](../demo/README.md)。

启动：`python projects/003-knowledge-work-plugins/app/demo_server.py`，然后打开 `http://127.0.0.1:8033/#demo`。停止用 Ctrl+C，重启产生新状态。仅适合本地单人演示；没有生产身份认证，不提供通用客服 AI 能力。

## 上游入口清点

`catalog_upstream.py` 读取干净的固定版本上游 Git 检出，生成场景索引和 JSON 证据清单。仅使用 Python 标准库与 Git，不导入或执行上游代码。

```powershell
python projects/003-knowledge-work-plugins/app/catalog_upstream.py --source F:/research-cache/knowledge-work-plugins
python projects/003-knowledge-work-plugins/app/catalog_upstream.py --source F:/research-cache/knowledge-work-plugins --check
```

输入必须是 `a266ab8c3c754a3ccf7a634044fc1595fc06e50e`，且无未提交文件变更。脚本拒绝其他版本，防止无意覆盖固定快照的研究统计。

输出：

- `../scenario-index.md`：顶层插件、所有 Skill / Command 的名称、用途及固定链接；合作伙伴和外部市场入口单独列出。
- `../source-index.json`：统计、元数据、章节、工具配置、来源与 LF 规范化 SHA-256。

范围限制：

- 顶层插件按 `.claude-plugin/plugin.json` 存在识别；合作伙伴与外部源仅登记市场记录。
- Skill 按 `skills/**/SKILL.md` 计数，独立 Command 按 `commands/*.md` 计数，二者可能覆盖同一业务。
- Frontmatter 提取器仅支持当前快照所用的标量和折叠描述，不作为通用 YAML 解析器。
- `empty_url` 仅标出空 URL；非空地址不代表可连接、已认证或工具可用。
- 没有对外部仓库做递归下载，没有执行其中的安装、MCP、脚本或模型调用。
