# 0.9：材质与表演重制（历史记录）

当前 0.10 已完成另外十二项重制，见 [COLLECTION-CRAFT.md](COLLECTION-CRAFT.md)；原三十秒连播入口现已扩展为十五片 150 秒连播。下文为 0.9 当时的范围与验证记录。

用户指出 0.8 的样片质量仍明显落后于参考作品。本轮集中改造三维、玻璃与手绘三支影片；其余十二项保留原版，不计入本轮质量升级。目标以实际成片判断，不以模板数量、类型检查或像素差异代替审美评价。

## 看影片和比较

- [三支完整影片，30 秒连播](https://github.com/yydshly/1021_codex_project/releases/download/mg-styles-research-019/mg019-effect-examples--quality-reel.mp4)
- [琥珀轨道](web/effect-examples/3d-render.mp4)：[优化前](web/quality-before/3d-render.mp4)
- [声波档案](web/effect-examples/aurora-glass.mp4)：[优化前](web/quality-before/aurora-glass.mp4)
- [最后一班月亮](web/effect-examples/cel-boil.mp4)：[优化前](web/quality-before/cel-boil.mp4)

本地工作台顶部提供三支影片的入口；放映窗口可切换「查看优化前版本」，观看不会覆盖编辑草稿。十五项原作参考继续保留。

## 这次落实的制作变化

| 影片 | 0.8 的问题 | 0.9 的实际变化 |
| --- | --- | --- |
| 琥珀轨道 | 规则环结、暗色棚拍、统一海报版式，材料与空间缺少细节 | 原创带状陶瓷雕塑、95 根瓷肋、黄铜双轨、琥珀球；Cycles 计算间接光、透射、接触阴影和镜头景深；微距→全景→材质特写→全景，标题在结尾出现 |
| 声波档案 | 层叠圆角矩形与背景采样偏移，缺少可辨的磨砂和空间内容 | 相机射线与倾斜面板相交；多点模糊背景、倒角反射、色散、光泽扫光；独立内容纹理和三层错位排版；中段推进并转动面板，展示光学层次 |
| 最后一班月亮 | 小角色处在远景，动作与手部投递简略 | 重新绘制兔邮差、服装缝线、邮包、车轮和邮筒；近景、雨夜骑行、伸手投递三个镜头；一拍二墨线、头部变化、围巾跟随、投递动作与纸张叠印 |

三维场景与模型均由本项目代码生成，没有使用源作的字形网格、场景、HDRI 或成片。手绘继续按 MIT 复用绘线引擎及已有纸纹声明。新配乐为代码合成的三段 44.1 kHz 立体声音乐，包含镜头切换、车铃、纸张摩擦等事件，无外部采样。

审看中修正了房屋悬空、车轮未落地、手与投递口高度不符、玻璃右侧标题被遮挡、玻璃边缘过亮，以及成片与快速预览的标识。完整运动分条审看，不能只看封面。

## 三维预览与导出

- 默认六项材质／构成参数有 300 帧的 Cycles 成片缓存；修改标题、短句、节点、声音和时长时可继续复用该材料画面。
- 修改配色、数量、速度、粗糙度或种子后，网页切换到同一场景的 Three.js 构图预览。它不包含最终的光线追踪与景深，界面明确标识。
- 导出时服务运行 Blender，按本次配置重新计算序列，再交给 Remotion 合成文字和声音。内部序列地址不接受用户配置；服务只读取经过校验的数据。
- 缓存匹配在前后端共用 `studio-cache.mjs`。所有六项材质／几何参数都参与匹配，不能用旧画面冒充参数变化。原始提交 JSON 与内部帧地址分开保存。

这是确定性镜头与运动编排，没有软体碰撞或流体物理解算。默认参数之外的最终材质需要等待渲染；不宣称实时构图预览与 Cycles 的光照完全相同。

## 复现

本机使用 [Blender 4.5 LTS](https://www.blender.org/releases/4-5/) 的官方便携包，放在被忽略的 `app/.cache/blender/`，没有写入系统程序目录。其他机器可通过 `BLENDER_PATH` 指向 Blender 4.5+ 可执行文件。优先 OPTIX；没有可用 GPU 时渲染会更慢。

```powershell
cd projects/008-cel-story-studio/app
$env:BLENDER_PATH = 'C:/path/to/blender.exe'
python scripts/make-film-scores.py
npm run render:studio
node scripts/render-effects.mjs --style=3d-render --videos --variants
node scripts/render-effects.mjs --style=aurora-glass --videos --variants
node scripts/render-effects.mjs --style=cel-boil --videos --variants
python scripts/make-quality-reel.py
python scripts/make-effect-reel.py
npm run build
```

每支 10 秒、1280×720、30 fps。默认三维为 48 samples 加降噪；原始参数对照帧也使用 Cycles，不将其与快速预览跨引擎比较。修改绘制代码后重启服务，刷新浏览器。

实际验证结果记录在 `assets/quality-verification.json`；默认三维的脚本签名与配置在 `assets/studio-render-metadata.json`。这些验证用于确认媒体和导出链路，作品质量以成片及前后对比为准。

## 本轮实际验证

- 三支默认影片均为 300 帧，连播为 900 帧；全部 1280×720、30 fps、H.264 + AAC，FFmpeg 完整解码通过。
- 网页导入《光的触感》：4 秒、10 个卫星、粗糙度 0.8、种子 43，提交任务 `5f4ee611-0bae-4ce7-9301-b05a44434622`。120 帧新的 Cycles 图片全部生成，网页下载的成片完整解码通过；服务提交、网页保存和公开 JSON 完全相同。样片为 [4 秒自定义材质](web/creative-examples/amber-studio-4s.mp4)。
- 浏览器分别实播三支新片、三份优化前影片和 30 秒连播，均达到 readyState 4、开始播放且无媒体错误；默认三维缓存也在编辑 Player 中实际播放。
- 合集开始播放后，编辑 Player 暂停；打开单支放映后，合集暂停，避免多路声音叠加。三支入口的锚点经实测修正为 `#effects-quality`，仍显示 15 项能力和 3 支本轮作品。
- 返回故事后，《阳台上的小花》、小禾、5 镜／12 秒及四项组件和强度均保持。有效宽与页面宽均为 658 px，无横向溢出。
- 49 项应用测试、TypeScript、构建、6 项仓库测试与 8 项索引检查通过。

[实际工作台截图](assets/quality-overview.png) · [三维放映截图](assets/quality-studio-browser.png) · [前后实际帧对照](assets/quality-before-after.jpg)。三份 `assets/quality-*-filmstrip.jpg` 按 0.5、1.5、3.5、6.2、7.7、9.7 秒检查完整影片变化。
