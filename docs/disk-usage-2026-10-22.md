# 仓库磁盘占用审计（2026-10-22）

初次盘点仅提出清理建议，未调整研究项目目录或业务源码。后续 [清理执行记录](disk-cleanup-result-2026-10-22.json) 显示第一批 28 个目录已清理完成，文件内容合计约 9.39 GiB，执行前后 F 盘可用空间增加约 9.40 GiB；以下审计与审批受阻记录保留为当时快照。随后整理首页再次生成约 1.49 GiB 的 `_site/`，自动审批仍拒绝删除，暂留本机且不提交。

初次校验时发现项目 010 的已有元数据尚未同步至 README，已通过生成器同步自动索引，并按当时流程重建 `_site/`。以下为扫描时数据，不代表当前目录或整个 F 盘。

## 结论

- 仓库共 **99,248 个普通文件**，内容大小 **18.51 GiB**，Windows 文件分配空间合计 **18.66 GiB**。
- `008-cel-story-studio` 占内容大小的约 **68.2%**，主要是渲染和打包缓存；项目已归档，优先处理这里最有效。
- 第一批可重建目录合计 **9.58 GiB 内容 / 约 9.59 GiB 分配空间**，约占当前分配空间的 **51%**。应先停止使用这些目录的预览、构建和渲染任务，再按精确目录清理。
- 扫描时 F 盘可用空间约 **2.20 GiB**。仅完成第一批清理，理论上可增加约 9.59 GiB 可用空间；不计同时运行的其他任务变化。
- 源文件与发布资料中另有 **729 组 SHA-256 相同的文件**，多余副本内容合计约 **866.95 MiB**。其中包含独立工程、研究原件和发布副本，不能直接按哈希删除。

单位：1 GiB = 1,073,741,824 字节，1 MiB = 1,048,576 字节。下文默认使用文件内容大小；分配空间另行注明。父目录包含子目录，不能把父子目录相加。

## 占用分布

| 根目录 | 内容大小 | 文件分配空间 | 说明 |
| --- | ---: | ---: | --- |
| `projects/` | 15.20 GiB | 15.35 GiB | 研究资料、源码、静态发布内容及本地环境 |
| `_site/` | 1.675 GiB | 1.677 GiB | 生成的发布副本 |
| `.git/` | 1.634 GiB | 1.637 GiB | 分支、标签、Codex 检查点及其他 Git 对象 |
| 其他 | 小于 1 MiB | 小于 1 MiB | 文档、索引、工具与模板 |

| 子项目 | 内容大小（GiB） | 文件分配空间（GiB） | 文件数 |
| --- | ---: | ---: | ---: |
| `008-cel-story-studio` | 12.631 | 12.704 | 49,537 |
| `006-gods-eye-view` | 0.747 | 0.775 | 18,065 |
| `010-melies-cinematic-guide` | 0.591 | 0.592 | 686 |
| `004-mg-styles-explorer` | 0.472 | 0.472 | 192 |
| `001-remotion-flat-vector` | 0.451 | 0.472 | 15,206 |
| `011-alphadesk-terminal` | 0.160 | 0.171 | 7,594 |
| `015-autumn-line` | 0.085 | 0.089 | 2,760 |
| `012-three-freecam` | 0.032 | 0.034 | 1,311 |
| `013-mountain-river` | 0.016 | 0.016 | 151 |
| `003-knowledge-work-plugins` | 0.007 | 0.007 | 58 |
| `007-realgrass-lab` | 0.004 | 0.004 | 23 |
| `005-storm-breaker` | 0.004 | 0.004 | 22 |
| `009-lcm-memory` | 0.002 | 0.002 | 24 |
| `002-lark-agent-bridge` | 0.001 | 0.001 | 20 |
| `014-coastal-simulation-reference` | 小于 0.001 | 小于 0.001 | 2 |

## 第一批：优先清理的可重建内容

| 精确范围 | 内容大小 | 判断依据与恢复方式 |
| --- | ---: | --- |
| `projects/008-cel-story-studio/app/node_modules/.cache/` | 4.270 GiB | Webpack/Remotion 构建缓存；下次构建或渲染重新生成，首次执行会变慢 |
| 下列 25 个 `008` 渲染 bundle 目录 | 3.438 GiB | 含 `index.html`、编译后的 `.bundle.js` 与 source map；由相应渲染/验证入口重新打包 |
| `_site/` | 1.675 GiB | 1,352 个资源文件逐个 SHA-256 核对，全部与 `projects/*/web/` 或封面原件相同；另有生成的首页与 `.nojekyll`。由 `python scripts/catalog.py` 重建 |
| `projects/001-remotion-flat-vector/app/node_modules/.cache/` | 0.195 GiB | Webpack/Remotion 构建缓存；下次运行重新生成 |
| **不重叠合计** | **9.578 GiB** | **文件分配空间约 9.587 GiB** |

25 个 bundle 目录均相对于 `projects/008-cel-story-studio/app/.cache/`：

```text
actors-preview-018-bundle/
bauhaus-014-review-bundle/
capability-bundle/
collage-014-review-bundle/
director-018/
effect-bundle/
framing-013-bundle/
hud-preview-013/bundle/
hud-preview-014/bundle/
hud-preview-015/bundle/
isometric-design/bundle/
line-review-bundle/
liquid-preview-014/bundle/
liquid-preview-015/bundle/
magnetic-qa-bundle/
morph-review-bundle/
neon-review-bundle/
neon014-review-bundle/
pixel-013-review-bundle/
pixel-014-review-bundle/
prism-preview-014/bundle/
story-016/
story-017/
styles-bundle/
world-bundle/
```

对 `hud-preview-*`、`liquid-preview-*`、`isometric-design`、`prism-preview-014`，只把内部 `bundle/` 列入清理范围。父目录里的 `index.tsx`、`entry.tsx`、`render*.mjs`、配置和截图继续保留。不要用通配符删除整个 `app/.cache/`。

第一批清理不需要删除依赖包本体、已发布视频或研究原件；恢复后是否能完整重跑所有历史实验，本次未逐项执行验证。

## 第二批：有恢复成本或需核对资料完整性

以下项目未计入第一批合计：

| 内容 | 大小 | 建议 |
| --- | ---: | --- |
| `008/app/.cache/portable-proof-018/` | 560.28 MiB | 独立包安装与渲染验证副本，包含约 441.62 MiB 的 `node_modules`；核对发布包、验证脚本及证明记录后可回收 |
| `004/app/.cache/` | 434.74 MiB | 主要是上游原视频下载缓存；恢复需要联网，验证脚本还会读取 `tree.json`，不宜直接整目录清空 |
| `008/app/.cache/blender/blender-4.5.14-windows-x64.zip` | 380.19 MiB | 已有解压后的 Blender，可优先回收下载压缩包；约 889.77 MiB 的解压目录是实际渲染运行环境 |
| `008/app/.cache/` 内六组逐帧目录 | 259.04 MiB | `liquid-final-012`、`magnetic-before-camera`、`magnetic-camera-final`、`magnetic-final-011`、`magnetic-final-014`、`studio-amber-frames`；先保留配置、选定证据帧并确认成片完整，重新渲染有时间成本 |
| `008/app/exports/` | 223.26 MiB | 混合自定义影片、任务配置和帧；部分影片已复制到 `web/`，但多个历史验证脚本直接引用此处，需逐项处理 |
| 其他依赖与本地运行环境 | 1.353 GiB | 已扣除所有 `.cache` 范围，避免重复计数；包括各项目剩余 `node_modules`、`011` 的 `.venv`、`006/011` 的 `.runtime`。移除后需重新安装或下载 |

本节 `001/004/006/008/011` 等前缀是对应完整项目目录的简写。上游克隆、本地修改、私有配置与城市数据也需要按用途保留，不因被 Git 忽略就视为冗余。`006/app/README.md` 明确说明上游目录可能含本地修改与 `.env`。

## 内容重复，但需要保留用途

重复检查先按大小分组，再计算 SHA-256。排除了 `_site`、`.git`、`.cache`、`node_modules`、`.venv`、`.runtime` 和 `__pycache__`；统计的是范围内每组保留一份后的额外内容字节，未计算 ZIP 包内部文件。

- **`008/web/` 内部**有 105 组相同内容，额外副本约 **177.04 MiB**。例如 `effect-examples/trio-reel-013.mp4` 与 `quality-before-016/trio-reel-013.mp4` 完全相同。可在后续维护中统一媒体引用，但要同时修改历史对照页、构建逻辑和验证引用。
- `008/web/quality-before*` 共约 **733.55 MiB**，其中许多文件是实际旧版成片，不能把整个历史目录当成重复文件删除。项目归档说明要求保留历次作品与返修档案。
- **`010`** 常同时保留生成原件、`assets/generated/*/published/` 整理副本和 `web/generated/` 发布副本。仅 `assets/` 内额外副本约 **104.83 MiB**；原件哈希、剪辑范围与研究结论绑定，直接删除可能破坏证据链和构建。
- `NotoSansSC.ttf` 在四处各有一份 16.95 MiB 原件，额外副本约 **50.85 MiB**；独立项目与可下载工程各自需要字体，收益明显小于清理渲染缓存。

子项目 `web/` 是仓库明确要求版本化的发布成果。应保留其完整可运行状态，不能套用根目录 `_site/` 的处理方式。

## Git 占用

根 `.git/` 的 1.634 GiB 不是全量垃圾：仓库除 `main` 外还有发布分支、研究标签和 `refs/codex/turn-diffs/*` 检查点。

以 `git rev-list --objects --all --reflog` 为可达性范围，再通过 `git cat-file --batch-all-objects` 检查对象，发现未被这些引用覆盖的 1,780 个对象，占对象存储约 **209.02 MiB**。该数值不是当前可安全释放空间：对象可能仍用于索引、进行中的操作或恢复，普通 GC 也受保留期影响。

`git count-objects -v` 还报告 16 个 `tmp_obj_*` 临时文件，合计 **16.56 MiB**。本次未删除临时对象、未运行 GC 或 prune、未删除分支或检查点。不要手工移除 pack 文件。

## 避免再次增长

1. 归档后清理渲染 bundle 和构建缓存；保留源码、锁文件、配置、最终作品与证据。对混合了临时源码和配置的 `.cache/`，先将应归档资料迁入正式目录再处理。
2. 初次审计时 `scripts/catalog.py` 的 **`--check` 也会调用 `build_site()`，先删除再完整重建 `_site/`**，使日常校验重新产生约 1.675 GiB 的发布副本。用户授权清理后已将校验与构建分开：`--check` 只校验，默认命令和 `--update-readme` 仍可生成站点，Pages 工作流同步使用默认构建命令。
3. 已有 `.gitignore` 和子项目忽略规则覆盖本次主要缓存、依赖和 `_site/`；忽略规则能阻止提交，不能回收本地磁盘空间。
4. 优先清理大缓存，再考虑媒体引用去重。跨项目共享依赖目录或直接删除原始媒体的改动成本较高，目前收益小于第一批清理。

## 用户授权后的执行状态

用户随后明确授权清理第一批约 9.59 GiB，并保留源码、原始素材、成片与研究记录。已重新核对全部 28 个精确目录，确认解析路径均在本仓库内、目标及祖先目录均无重解析点；首次复核内容合计 10,283,994,294 字节，6,094 个文件。随后测量的文件分配空间为约 9.40 GiB，最终只读预览统计内容约 9.394 GiB；期间 `_site/` 的资源数从 1,354 变为 1,315，现场目录发生变化。本次没有执行任何清理，也没有扩大范围；实际释放量应以清理时的数据为准。

已为清理范围外的 15,968 个项目文件建立 SHA-256 清单（约 5.17 GiB 内容；不含依赖、运行环境、嵌套 Git 与字节码）。清单位于本机临时目录，不将大体积盘点数据加入仓库。

**清理尚未执行：自动审批拒绝了批量递归删除命令，缩小为单个绝对路径的 `_site/` 删除命令后仍被拒绝；两次仅返回 `blocked by policy`，没有具体原因。没有通过其他工具绕过此限制。**

已准备本次固定清单脚本 `scripts/cleanup-approved-cache.ps1`。默认仅预览；在本机 PowerShell 手动执行以下命令，会检查全部路径与链接后仅删除上述 28 个目录，并将结果写入 `docs/disk-cleanup-result-2026-10-22.json`：

```powershell
& 'F:\codex_project\1021_codex_project\scripts\cleanup-approved-cache.ps1' -Apply
```

防止再次累积的变更已完成：`AGENTS.md` 和维护指南增加制作收尾清理要求；`catalog.py --check` 改为只校验，不创建或修改 `_site/`；Pages 构建工作流改用默认构建命令。10 项单元测试及 15 个项目的索引校验通过。测试覆盖校验命令不创建/改写站点、默认构建命令仍生成发布产物。清理脚本默认预览已实际运行通过，未传入 `-Apply`；复查 28 个目标目录仍全部存在。

## 扫描与验证

- 递归扫描包含隐藏文件；不跟随重解析点。跳过 `006/app/upstream/public/local-city-data` 链接，避免把链接目标计入两次或跨出仓库。
- 文件内容大小来自 `stat`；文件分配空间来自 Windows `FILE_STANDARD_INFO.AllocationSize`，不包含目录及文件系统元数据。本次未发现多硬链接文件，读取与分配空间查询无错误。
- 扫描与哈希核对均为本机只读检查，不访问外部服务。存在与仓库路径匹配的 Node 进程；未终止任何任务，也未将该匹配当成所有占用进程的完整清单。
- 扫描不是原子快照，运行中的任务和 Git 检查点可能继续增加文件；本报告新增文件及后续校验产生的变化未纳入初始占用统计。
- 仓库校验：`python -m unittest discover -s tests` 通过（8 项）；`python -X utf8 scripts/catalog.py --check` 通过（15 个项目）。首次索引检查发现项目 010 的标题、摘要未同步，执行 `python -X utf8 scripts/catalog.py --update-readme` 后复查通过。生成与校验均按现有实现重建 `_site/`，不属于空间清理。
