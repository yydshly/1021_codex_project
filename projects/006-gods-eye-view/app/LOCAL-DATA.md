# 本地城市模型数据

## 已接入国内实景摄影：合肥天鹅湖

- 分发方：[ICE 图形学社区的 GIS 编辑器页面](https://www.icegl.cn/tvtstore/gisPlaneEditor)，明确列为“测试用倾斜摄影、3d tiles地址”。
- [原始模型入口](https://opensource.cdn.icegl.cn/3Dtiles/%E5%90%88%E8%82%A5_%E5%A4%A9%E9%B9%85%E6%B9%96/tileset.json)，本机于 2026-10-21 完整下载该入口引用的有界样例。
- 覆盖合肥天鹅湖及周边约 **1,633 × 2,267 米**；由根节点包围盒估算，非精密测量，也非整座城市。
- **68 个 GLB / 68 张内嵌 KTX2 摄影纹理 / 3 份 tileset JSON**；加上来源说明共 **10,924,539 字节**（不含生成的 manifest）。模型目录为 `app/data/hefei/`。
- 保留提供方原始摄影几何、材质和纹理，未生成假立面，未从二维在线底图推算建筑。源数据自带地心坐标变换；GLB 使用 Draco 压缩，纹理为 1024×1024，解码组件由原应用的本地 Cesium 依赖提供。
- 免费公开测试入口不需要 Key。**原始航测商业和公开再分发授权未核实**；插件/SDK 代码许可证不等于模型许可证。本次只缓存作本机学习研究，模型目录已忽略，不作为公开模型下载站或生产数据。采集时间未核实。

先使用项目 `start.cmd` 安装、启动原应用，另开 PowerShell 执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File projects/006-gods-eye-view/app/prepare-hefei.ps1
```

脚本需要 Python 3.10+、Windows 自带 curl 和联网；不新增 Python 三方依赖。完整文件会复用，不在每次启动重新下载。准备脚本会运行 `check-hefei.py` 并安装本地模型扩展。模型损坏时校验会报错；移除报错的具体缓存文件后重跑准备脚本即可重新取得。

服务运行后双击项目 `open-hefei.cmd`，或打开 [合肥实景模型](http://localhost:4173/?localCity=hefei)。合肥默认关闭在线底图，黑色背景外的建筑、道路和地面均由本地摄影网格显示。滚轮缩放，按住中键拖动旋转；“重新定位”恢复全景；城市选择器保留广州与里昂。在线底图可手动打开；整套上游应用仍有外部接口，不声称应用完全离线。

独立检查命令：

```powershell
python projects/006-gods-eye-view/app/check-hefei.py
```

已验证逐文件 SHA-256、完整依赖闭包、GLB 分块与二进制范围、68 张内嵌 KTX2 的头部/尺寸、材质到纹理绑定和地心坐标范围；没有外部模型或纹理 URL。浏览器新页面冷启动显示“当前视野已就绪 · 本地共 68 块”，关闭底图时仍显示摄影建筑，隐藏模型后全部消失，再显示正常。68 是本机完整包数量，Cesium 按当前视野和层级读取，不能将它理解为每帧都需渲染 68 块。

证据位于项目 `assets/hefei-photogrammetry-overview.png`、`hefei-photogrammetry-close.png`、`hefei-local-manifest.json`、`hefei-local-check.json`。纹理近距离会模糊，边缘和细小结构受原始摄影重建误差影响。

## 已接入国内样例：广州珠江新城的简化建筑

- 来源：[Tsdsj/guangzhou-3d](https://github.com/Tsdsj/guangzhou-3d)，固定版本 `8e985efd338e85692b78c28c163c77e3daf08342`。
- 原始地图：© OpenStreetMap 贡献者，快照时间 2026-09-23；派生城市数据库采用 **ODbL 1.0**。上游代码 MIT 与数据许可分别适用。
- 选取珠江新城附近约 3.6 × 3.6 公里的 2,251 个建筑记录，转换为 36 个本地 GLB / 3D Tiles 分块。
- 真实建筑轮廓来自 OSM；高度沿用上游数据库，部分为标签、楼层换算，部分为周边中位数或类型默认值。不能把全部高度理解为实测。
- 本地采用平屋顶和单色立面，不含航拍纹理。没有导入上游 84,205 个程序化填充地块，也没有把程序化立面作为真实摄影效果。
- 使用上游近似局部投影的反变换与 WGS84 ENU 坐标框架，仅用于视觉演示，不用于测绘或精确贴地。

当前全部引用文件、源数据和授权记录共 **9,983,935 字节**（约 10.0 MB）；其中包含约 5.3 MB 的原始压缩数据库。文件保存在 `app/data/guangzhou/`，不会在每次打开时重新从网络下载。

首次先运行项目 `start.cmd`，然后执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File projects/006-gods-eye-view/app/prepare-guangzhou.ps1
```

下载与转换使用项目独立 Node 环境和原应用已有的 earcut 依赖，不额外安装 GIS 工具。运行服务后双击 `open-guangzhou.cmd`，或在“本地三维城市”面板切换广州与里昂。`prepare-guangzhou.mjs` 为可复现转换脚本，`check-guangzhou.py` 检查哈希、分块数、GLB 结构、地心坐标和模型依赖；实际浏览器已验证 36 / 36 分块与城市切换。

许可与完整上游说明随数据保存。当前 GLB 是源建筑数据库的简化派生成果，附带 ODbL 数据声明；模型目录不提交到总仓库。不得将该样例宣传为完整的广州实景三维摄影模型。

## 已接入：法国里昂第一行政区的小范围样例

- 原始数据：Métropole de Lyon，2018 年带纹理建筑模型。
- 3D Tiles 制作、分发：LIRIS 实验室 VCity 团队。
- 授权：**Etalab Open Licence 2.0**，允许免费再利用，保留来源和数据日期；不适用 Google 数据条款。
- [分发站与授权声明](https://dataset-dl.liris.cnrs.fr/three-d-tiles-lyon-metropolis/README.txt)
- [许可证](https://dataset-dl.liris.cnrs.fr/three-d-tiles-lyon-metropolis/ETALAB-Licence-Ouverte-v2.0_EN.pdf)
- [具体数据目录](https://dataset-dl.liris.cnrs.fr/three-d-tiles-lyon-metropolis/2018/Lyon-1_2018_Textured/)
- [生产过程](https://github.com/VCityTeam/UD-Demo-vcity-py3dtilers-lyon/blob/master/doc/textured.md)

本次取中心附近 16 个分块，使用提供方自带的次高纹理层级（典型纹理 2048×1365），下载全部 B3DM 和引用的纹理，保存在 `app/data/lyon/`。最高纹理层级在本机测试中触发显存缓存限制，因此未作为最终显示版本。不是整个里昂市，也不是国内模型。`manifest.json` 记录当前使用文件的 SHA-256、大小及来源；许可证和原始说明一并保存在数据目录。早期下载的高精度文件可能留在目录中作为缓存，不被当前 tileset 引用。

几何与纹理是已有模型，并非程序生成的假城市。为适配 Cesium 地球，将 EPSG:3946 投影坐标转换为 ECEF 的逐块局部仿射坐标。保留源 Z 值，未进行高程基准的精密转换，因此只作为视觉演示，不作为测量或精确贴地依据。原始瓦片保留不变，转换仅作用于新生成的 tileset.json。

## 下载、安装与验证

先用项目 `start.cmd` 安装原应用。另开 PowerShell 执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File projects/006-gods-eye-view/app/prepare-local-city.ps1
```

需要 Python 3.10+。坐标转换依赖 pyproj 3.7.1 安装到项目独立虚拟环境。已完整下载的文件不会重复下载。

本地服务启动后打开项目的 `open-local-city.cmd`。新增面板提供加载、定位、隐藏模型、关闭在线底图按钮。原有数据图层与 UI 保留。扩展源代码位于 `app/extensions/localCity.js`；安装脚本将其复制到上游，并为 `src/main.js` 加入启动回调。该修改可重复应用，不改动上游其他模块。

`public/local-city-data` 是指向 `app/data` 的 Windows 目录联接，不复制两份模型。模型不纳入 Git；新机器需要执行下载脚本。

检查：

```powershell
python projects/006-gods-eye-view/app/check-local-city.py
```

检查逐文件哈希、16 个分块、地心坐标范围、B3DM/GLB 格式及纹理依赖闭包。模型请求为 localhost；整套应用仍可能访问在线底图和其他上游接口，不能把“模型已本地化”理解为“整个应用完全离线”。

## 国内候选：香港规划署开放模型

香港规划署发布了部分香港岛（2017 年航拍）和九龙半岛（2018 年航拍）的实景三维模型，提供 OBJ、OSGB、Cesium 3D Tiles 下载：

- [官方数据页](https://data.gov.hk/tc-data/dataset/hk-pland-pland1-3d-photo-realistic-model)
- [下载索引 CSV](https://pdmap.pland.gov.hk/PLANDWEB/public/3d_photo_realistic_models/Metadata/GridIdx_CESIUM.csv)
- [官方路径与格式说明](https://www.pland.gov.hk/pland_en/resources/3D_models/Remarks_for_the_3D_Photo-realistic_Model.pdf)
- [开放平台条款](https://data.gov.hk/en/terms-and-conditions)：允许免费浏览、下载、复制和分发，包括商业用途，要求标明政府、数据提供机构和平台来源并遵守条款。

2026-10-21 本机访问数据下载域名时发生 TLS 握手/连接关闭错误，curl、Python 和应用内浏览器均未取得模型文件。资料页已查证，但**香港模型未下载、未接入、未验证效果**。

用户要求进一步尝试国内数据后，还检查了 IPv4 请求、单次解析地址直连、现有代理入口、香港地政总署的[可视化三维地图与另一下载 API](https://portal.csdi.gov.hk/csdi-webpage/metadata/landsd_rcd_1671677054006_62261/html)，仍未从当前线路取到可用模型。没有关闭证书校验，没有改系统网络配置。该结论只描述本机本次连接，不证明官方站点全球不可用。

其他国内候选：深圳大学 [UrbanScene3D](https://github.com/Linxius/UrbanScene3D) 有航拍重建研究数据，但限制非商业使用和再分发；其公开 NAS 链接在浏览器跳转后空白，直接连接超时，未取得文件。国家基础学科公共科学数据中心检索结果列出深圳渔民村“社区三维模型数据”（335 MB），但本次未取得可验证下载文件。以上候选都未作为成功接入记录。后续已从独立分发站取得上文的合肥摄影模型，广州保留为简化建筑对照。
