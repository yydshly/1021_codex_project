# 信息采集设计、来源与国内可用性

本研究重点是“为什么采集、向谁获取、怎样取得、能证明什么”。依据为固定上游 **0.2.1 / `064d51f7be2675f1c69e16068e9c49d1a60144d1`** 的源码、2026-10-21 查阅的服务方说明，以及当前机器的有限探测。旧代码支持的选项不一定仍受服务方支持。

[项目首页](README.md) · [历史运行记录](RUNNING.md) · [实测摘要](assets/source-probe-20261021.json)。下文“选择理由”为依据源码结构作出的研究归纳，不声称获得作者的选型访谈；对西藏、新疆的迁移建议尚未实施。

## 1. 从问题决定采集范围

选择一个地方后，可按下面五个问题组织调查；不必开启全部图层。

| 调查问题 | 需要的信号 | 为什么选择它 | 尚不能回答什么 |
| --- | --- | --- | --- |
| 在哪里、周围有什么？ | 地形、道路、地点、设施 | 给其他信息提供共同位置和尺度 | 影像年代不同，不代表当前现场；设施清单不保证完整 |
| 哪些对象在移动？ | 带编号与时间的位置消息 | 飞机、船舶自身广播形成可汇集的观测 | 接收盲区内的目标、完整历史轨迹、活动意图 |
| 环境如何变化？ | 预报网格、观测影像、事件目录 | 比较地区、时次与事件位置 | 单次预报不代表长期气候，不自动证明事件因果 |
| 地面拍到了什么？ | 相机位置、照片、时间、出处 | 为宏观地图补充有身份的近景材料 | 公开目录以外的相机、任意位置实时视频、精确视场 |
| 地方之间怎样连接？ | 道路、线路、设施网络、服务状态 | 理解空间联系及活动背景 | 名义线路不等于实际流量，当前数据不等于历史状态 |

筛选来源时依次记录：**是否产生所需信号；是否有接口/文件；位置和时间能否识别；字段与精度是否够用；国内覆盖怎样；访问和复用条件能否接受。** “全球接口”不等于全球完整观测。

<a id="source-details"></a>
## 2. 主要来源详表

### 2.1 空间背景：地图影像、地形与地点

- **为什么获取：**建立位置、尺度、地貌与周边参照，让事件和对象有落点。
- **来源与内容：**Esri World Imagery、OpenStreetMap、Re:Earth / Mapterhorn；Google 实景三维为可选来源。影像、道路/地点、地形、建筑模型是不同数据。
- **怎么取：**Cesium 按视野与层级请求瓦片。Esri 入口是 `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer`；Re:Earth 是 `https://terrain.reearth.land/cesium-mesh/ellipsoid`。三维模型沿 tileset 索引继续取分块；地点查询和地图图片分开。
- **国内与实测：**此前上海浦东影像在浏览器显示成功；本次 Esri 元数据、OSM `0/0/0.png` 和 Re:Earth `layer.json` 均成功。没有验证全国细层级及地形分块闭包。Google 路径未配置凭据，未验证中国城市覆盖。
- **限制：**底图有拍摄年代；图上看到飞机不能当实时飞机状态。瓦片可读不等于允许批量镜像或再分发。Re:Earth 初始化失败时，代码可降级到平滑椭球，不能将降级画面当真实地形。
- **源码：**[默认来源](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/src/maps/defaultSources.js)、[影像](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/src/maps/imagery.js)、[地形与降级](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/src/maps/terrain.js)。模型实践保留于 [LOCAL-DATA.md](app/LOCAL-DATA.md)，本次不再继续找模型。

### 2.2 飞机：OpenSky 与 adsb.lol

- **为什么获取：**飞机广播带身份、时间和位置的信号，适合认识航路活动与区域联系，不需从影像猜测飞机运动。
- **字段：**OpenSky 状态向量含 ICAO 地址、呼号、经纬度、气压/几何高度、速度、航迹角、位置时间等，部分为空。adsb.lol 提供接收网络汇集的快照和部分轨迹。型号、航线等补充查询另走 adsbdb，并非广播天然包含所有这些字段。
- **怎么取：**本地 `/api/flights` 的主源请求 OpenSky `GET /api/states/all?extended=1`，正常路径取得全球快照，服务端缓存并按余量调整节奏。主源没有可用快照时结合旧缓存和相机中心附近的 adsb.lol 区域源处理。点接口为 `https://api.adsb.lol/v2/lat/{lat}/lon/{lon}/dist/{海里}`；不是将不同源数量简单相加。
- **凭据与限额：**官方允许受限匿名最新状态查询；认证使用 OAuth2 client credentials。**固定源码仍保留 Basic 选项，但官方已不接受 Basic 认证。** 不能按页面帧率请求或假定始终匿名不限量。
- **国内与实测：**此前 OpenSky 全球响应有 13,125 条，其中上海框为 0；本次匿名直查同一框（东经 120–123°、北纬 30–32.5°）仍为 0。adsb.lol 浦东周边 250 海里圆形范围返回 7 条。两范围不同，后者包含周边海域及地区，不能把 7 条说成上海或大陆航班数，也不能据此比较两源覆盖率。
- **限制：**受接收站、广播、空字段、限流和网络影响。空记录不等于没有飞机；连续快照不等于完整历史。库有本地 ADS-B 接收入口，本次未部署设备。OpenSky 等服务的使用与数据条件仍需独立核实，不能套用代码 MIT 许可。
- **依据：**[OpenSky 官方 REST 文档](https://openskynetwork.github.io/opensky-api/rest.html)、[adsb.lol 官方 API 仓库](https://github.com/adsblol/api)、[固定版主源及备用实现](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/aircraft/opensky.js)。历史全球响应见 [flights-check.json](assets/flights-check.json)。

### 2.3 船舶：AISStream

- **为什么获取：**观察船舶、港口与航道之间的活动联系；位置报告追踪对象，静态消息补充船舶身份。
- **字段：**AIS 消息中的 MMSI、位置、航速、航迹向、部分船名等，随消息类型和接收状态分别出现。
- **怎么取：**服务器连接 `wss://stream.aisstream.io/v0/stream`，发送含 `APIKey`、`BoundingBoxes` 及可选过滤的订阅；持续解码消息、维护最近状态。浏览器读取本地 `/api/vessels`。Key 留在服务端；源站明确不允许浏览器直接连接。
- **国内与实测：**未配置 `AISSTREAM_API_KEY`，没有实际订阅。中国港口、近海、远海和内河覆盖均未验证；接受全球框只是订阅条件，不代表消息完整。
- **限制：**接收网络与目标广播决定可见性；流可能中断、丢消息，服务方不保证持久重放。广播公开不能自动推导为服务数据可任意商用或转售，使用前复核当前条件。
- **依据：**[AISStream 官方文档](https://aisstream.io/documentation)、[订阅与本地接口实现](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/vessels/ais-live.js)。

### 2.4 卫星与发射：CelesTrak、Launch Library

- **为什么获取：**认识上空轨道对象、过境和任务背景；轨道参数与发射任务记录分别提供不同信息。
- **怎么取：**CelesTrak `gp.php?GROUP={group}&FORMAT=tle` 经本地 `/api/celestrak` 代理，内存/磁盘缓存约 6 小时。客户端 satellite.js 根据参数推算位置。发射信息另从 The Space Devs Launch Library 2 的近期任务 JSON 获取。
- **国内与实测：**无 Key 的 `stations` 请求返回 17 组 TLE 行对，仅检查基本行结构，不代表已完整解析传播或取得全量卫星。公开参数可以用于推算经过中国上空的位置，不依赖中国接收站直接看到卫星；参数新鲜度、漏编和推算精度仍需检查。发射源本次未探测。
- **格式限制：**固定源码仍请求 TLE；CelesTrak 官方已说明五位编号格式不能表示 100000 及以上的新编目对象。扩大目录支持需另评估 OMM/JSON 及解析链路，不能认为 TLE 已覆盖所有新卫星。本次只记录限制，没有修改实现。
- **信息身份：**基于历元参数计算的位置，不是实时遥感图像、星载视频或连续观测定位。
- **依据：**[CelesTrak 官方格式说明](https://celestrak.org/NORAD/documentation/gp-data-formats.php)、[固定上游请求](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/src/data/spaceProviderRequests.js)、[缓存代理](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/space/celestrak.js)、[TLE 解析](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/src/layers/satellites/catalog.js)。

### 2.5 地震：USGS

- **为什么获取：**取得已发生事件的时间、位置和规模，作为区域事件观察和核实的入口。
- **怎么取：**浏览器直接请求 `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`。读取事件编号、震级、时间、地点文字和 `[经度, 纬度, 深度]`；固定版校验快照并过滤至 M≥2.5，不是源站全部记录均显示。
- **国内与实测：**本次返回 207 条全球事件，其中 50 条符合 M≥2.5。未核对中国子集，也未与国内目录比对，不能当国内全部微震记录。
- **限制：**目录可修订，需保留震级类型与更新时间。事件点不能自动给出影响范围、损失或预警；接口不提供地震预测。
- **依据：**[USGS 官方字段说明](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)、[获取实现](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/src/layers/earthquakes/source.js)、[筛选与规范化](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/src/layers/earthquakes/records.js)。

### 2.6 热异常：NASA FIRMS

- **为什么获取：**找出卫星观测到的高温异常地点、时间，作为火情、工业热源或变化线索进一步核实。
- **怎么取：**申请免费 MAP_KEY；服务器请求 `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/{SOURCE}/{AREA}/{DAY_RANGE}`，解析坐标、日期/时刻、传感器和置信字段。固定版合并三路 VIIRS NRT 与 MODIS_NRT，拉世界范围 2 日数据再筛最近 24 小时，缓存约 30 分钟；多星记录并未因此自动跨源去重。
- **国内与实测：**全球产品范围包含中国，这是产品范围判断；未配置 `FIRMS_MAP_KEY`，没有实测中国区域响应。过境、云遮挡、产品尺度与处理时延影响可见性。美国/加拿大的快速产品不能外推为中国同等时效。
- **限制：**热异常不等于已确认森林火灾、火场边界、受灾面积或起火原因。返回错误页时不能当 CSV。Key 嵌在上游路径中，日志和公开记录应避免保存完整带 Key URL。
- **依据：**[FIRMS 官方 Area API](https://firms.modaps.eosdis.nasa.gov/api/area/)、[固定版获取与缓存](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/firms.js)。

### 2.7 天气：模式网格、点位天气、观测影像分开取得

- **为什么获取：**提供风、温度、气压等背景，比较同一时次或预报时段的地区条件。
- **来源与方法：**NOAA GFS 从公开 S3 取得 `.idx` 和 GRIB2 字节范围；ECMWF IFS 从开放目录及索引取得 GRIB2 字段，服务器解码网格。Open-Meteo 按经纬度和变量通过 `/v1/forecast` 返回点位 JSON。固定版风场读取 0.25° 产品，不是取得模式的全部字段。
- **国内与实测：**本次 GFS 桶列举和 ECMWF 目录成功，未下载解码完整风场。上海坐标的 Open-Meteo 返回当前时次温度、风速字段，未做实测站点对照。全球模式范围包含中国，但山谷、城市及短时局地精度需另评估。
- **观测图层边界：**nowCOAST 雷达主要针对美国本土；闪电密度、气旋各有地域范围。全球红外云图不等于全球雷达，中国台风覆盖也不能由北美气旋图层推出。本次未验证这些图像图层。
- **时间与使用条件：**保留起报、预报有效与查询时间；模式值不等于现场气象站实测，单次风场不代表长期气候。ECMWF 有署名与服务条件；Open-Meteo 免费托管 API 限于其非商业条件并有额度，数据许可和托管服务条件分别判断。
- **依据：**[ECMWF 开放数据](https://www.ecmwf.int/en/forecasts/datasets/open-data)、[Open-Meteo 字段](https://open-meteo.com/en/docs)及[服务条件](https://open-meteo.com/en/terms)；代码 [GFS](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/wind/gfs.js)、[IFS](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/wind/ifs.js)、[点位天气](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/regional/weather.js)、[观测影像](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/weather.js)。

### 2.8 摄像头：地区公开目录和图片端点

- **为什么获取：**为地点或事件补充近景观察材料；先取得公开目录和坐标，再按需请求图片/媒体。
- **怎么取：**服务器加载已配置的地区目录，规范化编号与坐标，浏览器访问本地 `/api/cctv/sources`、`/frame/:id` 等接口。香港包读取运输署 XML，根据相机编号请求指定域名 JPEG；台湾高速公路包读取 MOTC XML，按注册映射取单帧。其他地区包格式与播放方式各异。
- **明确入口：**香港目录 `https://static.data.gov.hk/td/traffic-snapshot-images/code/Traffic_Camera_Locations_En.xml`，图片域名 `https://tdcctv.data.one.gov.hk/`；台湾目录 `https://tisvcloud.freeway.gov.tw/history/motc20/CCTV.xml`。[香港官方开发指南](https://data.gov.hk/en/help/ckan-api-development-guide)以交通快拍数据集为示例，可核对来源身份。
- **国内与实测：**源码有香港/台湾包，不等于本机已成功。本次两目录都未取得 HTTP 响应，Python 报 `URLError / Errno 2`，原因未定位，**不能据此归因为 TLS、封锁或源站故障**。未取得相机画面，没有大陆通用摄像头公开接口的成功证据；香港、台湾和大陆分别判断。
- **限制：**香港交通快拍是周期图片，此路径不等于连续视频。缺少真实朝向时会使用低置信度估计，界面视锥不能当精确覆盖。CCTV 帧接口有替代图像链路，必须核对来源，不能将街景替代图片当当前监控帧；不扫描目录以外设备。
- **依据：**[目录常量](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/cctv/constants.js)、[香港目录解析](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/cctv/sources.js)、[台湾包](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/cctv/taiwan.js)、[帧接口及替代链路](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/cctv.js)。

### 2.9 街景：Mapillary、KartaView、Panoramax、Google

- **为什么获取：**认识道路沿线与地面对象，取得有拍摄身份的照片和序列，为地方观察提供材料。
- **怎么取：**查询覆盖瓦片，在位置附近找图片，再请求序列、图片与观看器。Mapillary 需要令牌；KartaView / Panoramax 有公开接口；Google 路径使用相应 Key 和服务。它们与摄像头目录分开。
- **国内与实测：**未测试这些平台的中国覆盖、具体道路照片或完整播放。使用前应对目标线路抽样，不能由国外道路照片推出大陆全国可用。
- **限制：**保留拍摄日期、作者、序列与许可。街景不是实时监控；不同图源的缓存和署名条件不同。
- **依据：**[提供方注册](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/src/layers/streetLevel/registry.js)、[Mapillary 代理](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/mapillary.js)、[固定版图源清单](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/DATA_SOURCES.md)。

### 2.10 道路、地点与交通：OSM、地名服务、TomTom

- **为什么获取：**知道对象位于哪里、附近有什么及地区怎样连接；道路几何、地名与交通流分别采集。
- **怎么取：**OSM 经矢量瓦片、固定抽取数据或自行配置的 Overpass 查询取得；地名另走地名服务。固定库 `/api/overpass` 只请求运营者配置的端点，没有配置就不能当默认可用服务。TomTom 流量由服务器持 `TOMTOM_API_KEY` 请求 PBF 瓦片，再解码路段流量。
- **国内与实测：**本次 OSM 全球底图瓦片成功，未测中国道路/地点查询完整性或 TomTom 国内流量。广州本地 OSM 派生数据库不证明在线查询或全国实时路况可用。
- **限制：**OSM 取决于贡献和标签覆盖；沿真实道路生成的车辆运动是模拟，不能当逐车观测。公共 Nominatim 要求应用标识、缓存、低频使用，应用总量最多 1 请求/秒；不能按用户拆分突破额度或用于无限批量编码。
- **依据：**[Overpass 实现](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/overpass.js)、[TomTom 代理](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/traffic.js)、[OSM Overpass 说明](https://wiki.openstreetmap.org/wiki/Overpass_API)、[Nominatim 公共服务政策](https://operations.osmfoundation.org/policies/nominatim/)。

### 2.11 其他：设施网络、公交、单车、电台

- **为什么获取：**扩展地方结构和生活背景，观察设施联系及部分服务状态。
- **怎么取：**设施专题来自内置地理数据或 OSM 抽取；公交按各城市实时接口适配；单车按 GBFS 读取站点与可用数；电台目录提供位置和广播链接，不能按一个接口取得所有地区。
- **国内与实测：**不少服务仅限特定国外城市或国家，本次未验证国内同类来源。电台流不能当当地传感器或事件证据。
- **限制：**内置资料不是当前观测；如部分海底光缆专题有独立非商业许可，不能因随 MIT 代码提供就直接商用。人口、产业、史料、长期气候并未因此自动补齐，需按研究问题另查。
- **依据：**[来源和许可清单](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/DATA_SOURCES.md)、[公交代理](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/transit.js)、[GBFS 代理](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/gbfs.js)。

#### 补充专题：不要把地域功能理解成国内已可用

11 类是本研究的分组，其他专题归在这里。以下依据固定版本源码／资料清单整理，**本次均未请求接口或验收画面**。

| 专题与采集目的 | 来源与获取方法 | 国内意义与限制 |
| --- | --- | --- |
| GNSS 完整性：观察已接收飞机报告的导航质量信号 | `/api/gnss-integrity` 单独请求 adsb.lol 的 250 海里点位接口，保留 NIC／NACp 等字段，约 60 秒服务端缓存；汇总方法参考 GPSJAM | 依赖当地飞机报告与接收样本；GPSJAM 在此是汇总方法参考，不是已证明接入其全国观测。异常评分不能确认干扰来源或原因 |
| 火场边界：区分热异常点与已报告事件范围 | `/api/fire-perimeters` 无 Key 读取 NIFC WFIGS ArcGIS Feature Service，处理分页并缓存约 5 分钟；另有 InciWeb 发布资料路径 | 美国跨机构火灾资料，不是中国火场边界通用源；边界、控制比例等有各自报告日期，不等于即时精确边缘 |
| 空气质量：在站点位置显示有时间的指数 | ECCC MSC GeoMet OGC API 的 `aqhi-stations` 和 `aqhi-observations-realtime`，读取站点与最新 AQHI；固定版仅注册加拿大提供方 | 仅加拿大，不能用于证明中国空气质量可得；AQHI 与其他国家 AQI 的尺度不能混用 |
| 路径规划：取得两地之间沿路网的几何与转向步骤 | `/api/route` 代理 FOSSGIS 公共 OSRM，按 car／bike／foot 及坐标请求，约 10 分钟缓存 | 计算路线，不是已经观测到的行程或当前真实车流；目标区路网与规划成功需另测，公共服务不适合重度批量使用 |

源码依据：[GNSS 代理](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/gnssIntegrity.js)、[火场边界](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/firePerimeters.js)、[空气质量取数](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/src/layers/airQuality/source.js)、[路径代理](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/server/providers/places/routes.js)。完整项目理解与效果辨析见[综合研究](STUDY-GUIDE.md)。

<a id="acquisition"></a>
## 3. 可以迁移的信息获取设计

### 3.1 先识别信息怎样产生

| 产生机制 | 典型来源 | 正确的数据身份 |
| --- | --- | --- |
| 对象广播，被接收网络汇集 | ADS-B、AIS | 有接收盲区的位置消息 |
| 仪器/遥感观测，经处理入目录 | 地震、热异常、云图 | 带观测时刻、延迟与产品尺度的记录 |
| 模式计算或参数外推 | GFS / IFS、轨道参数 | 有起报/历元与有效时间的计算结果 |
| 人工或社区编目 | OSM、固定设施、街景序列 | 带来源与更新记录的地理资料 |
| 为表达而生成 | 道路车辆动画、估计相机朝向 | 模拟或估计，不能升级为实际观测 |

### 3.2 再选择协议、范围和代理边界

1. 明确区域、时间和变量，再选快照轮询、消息订阅、文件下载或参数计算。
2. Key、跨域受限或统一缓存的来源走本地服务；USGS 等浏览器直接取数的来源不必假设都经代理。
3. 校验响应格式、字段、坐标与时间后更新数据。HTTP 200 可能仍是错误页、空列表或旧缓存。
4. 各源分别设置刷新、合并请求、额度和失败行为。飞机备用源、卫星约 6 小时参数缓存、FIRMS 约 30 分钟缓存不应共用一个任意刷新率。
5. 地图、统计与讲述共享来源、更新时间和 `loading / degraded / stale / fallback / unavailable` 状态；备用源的区域范围不能伪装成全球主源。

源码依据：[统一数据状态](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/src/data/layerSnapshot.js)。这些模式支持基础获取和展示，不代替资料核实或复杂关联分析。

### 3.3 每个候选来源的调查模板

| 记录项 | 必须回答的问题 |
| --- | --- |
| 研究问题、所需变量 | 拿到后能具体解释什么？ |
| 发布者、产生机制、来源页 | 是观测、编目、推算还是模拟？ |
| 入口、协议、格式、范围 | GET/POST/订阅/文件？按区域、时段还是整包取？ |
| 字段、单位、坐标与精度 | 经纬顺序、高程基准、深度/高度、速度单位是否一致？ |
| 观测/历元/起报/有效/查询时间 | 哪一时刻的数据，是否修订或过期？ |
| Key、额度、缓存与失败行为 | 如何调用，失败后保留什么状态？ |
| 中国范围与目标区抽样 | 产品包含中国吗？目标地有多少有效记录？ |
| 环境、日期与证据文件 | 在哪次请求成功，是否验证到页面？ |
| 授权、署名、缓存与分发 | 当前研究、长期使用、公开发布的条件分别是什么？ |
| 已验证结论和缺口 | 证明到哪一步，下一次验证解决什么？ |

已有点位、轨迹和图层能力时，基础呈现可以复用；但坐标、单位、高程与时间仍须检查。来源调查帮助提前判断取什么、向谁取，以及结果能否支撑问题。

<a id="china"></a>
## 4. 国内可用性与证据

### 4.1 分开判断五层可用性

| 层次 | 通过的含义 | 不代表什么 |
| --- | --- | --- |
| 文档/源码存在 | 知道入口和调用方法 | 当前可用、条件未变 |
| 本机网络可达 | 当前配置取得响应 | 所有大陆运营商均可直连 |
| 格式可用 | 返回预期 JSON/XML/TLE/瓦片 | 数据新鲜、有中国记录、字段完整 |
| 目标区有有效数据 | 抽样区有满足条件的记录 | 全国、全天、所有对象完整覆盖 |
| 应用与用途可用 | 解析、展示、时间和许可适用 | 无限调用、随意镜像或改变用途 |

不能将前一层成功直接写成后一层完成。对于境内飞机、船舶、摄像头，接收/发布覆盖和使用条件会先决定是否可行。

### 4.2 2026-10-21 本机有限探测

时间为 **北京时间 01:53:40—01:53:48**，证据保留 UTC 原始时间。每源一次无凭据 GET，不重试、保持正常 TLS 校验、20 秒超时、2 MiB 上限，读取校验后丢弃完整响应，只保存摘要。未见 `HTTP_PROXY / HTTPS_PROXY / ALL_PROXY` 值，但没有审计实际网络出口，不能称“中国大陆直连验证”，也未做跨运营商或持续运行测试。

| 入口 | HTTP / 格式结果 | 本次证明到哪一步 |
| --- | --- | --- |
| Esri 元数据 | 200，瓦片信息 | 元数据可读；上海影像另有此前浏览器证据 |
| OSM `0/0/0.png` | 200，PNG | 一张全球层级图片可读，未测道路查询 |
| Re:Earth `layer.json` | 200，地形描述 | 未验证地形分块及高程 |
| OpenSky 上海框 | 200，0 条 | 空快照不是网络失败，也不是境内没有飞机 |
| adsb.lol 浦东周边 250 海里 | 200，7 条 | 广域快照存在，不是上海框或大陆覆盖统计 |
| CelesTrak `stations` | 200，17 组 TLE 行对 | 基本结构可识别，未做完整解析传播或历元检查 |
| USGS 一日 GeoJSON | 200，207 条，M≥2.5 为 50 条 | 目录及筛选可用，未核对中国子集 |
| GFS S3 列举 | 200，XML | 对象目录可访问，未读取风场 |
| ECMWF 预报目录 | 200，HTML 页面 | 页面与链接结构可读，未验证具体预报文件/解码 |
| Open-Meteo 上海坐标 | 200，当前时次字段 | 未核对站点精度或页面显示 |
| 香港运输署相机 XML | 无 HTTP，`URLError / Errno 2` | 未取到目录，原因未定位 |
| 台湾高速公路相机 XML | 无 HTTP，`URLError / Errno 2` | 未取到目录或相机帧 |

原始摘要：[source-probe-20261021.json](assets/source-probe-20261021.json)；脚本：[probe-public-sources.py](app/probe-public-sources.py)。**10/12 是所选入口的格式探测通过数，不是 10 类功能已跑通或国内完整可用。**

未执行：AISStream 认证订阅、FIRMS 带 Key 数据、Google 付费接口、Mapillary 认证、TomTom 路况、街景播放、nowCOAST 图像图层。没有注册账户、提交凭据或改网络设置。

### 4.3 境内飞机、船舶、摄像头的当前结论

- **飞机：**有公开接口和局部回应，缺少中国大陆完整覆盖保证；不同查询范围不能直接比较，全球数量不能推断国内数量。
- **船舶：**获取方法明确，实际订阅与中国各水域覆盖未验证；全球框不能证明国内船舶齐全。
- **摄像头：**香港/台湾公开交通目录路径已在源码找到，本次未取到目录和图片；大陆通用公开接入未取得成功证据。街景、固定实拍和替代图片不能称当前监控视频。
- **自然信息：**全球产品提供调查入口，风场、热异常、地震各有尺度、阈值、时效和目录差异，先验证目标区与时间。

## 5. 对西藏、新疆研究的迁移取舍

以下是来源调查方案，不是已实施功能。

| 研究问题 | 优先调查的类别 | 本库可借鉴什么 | 还须另外补齐什么 |
| --- | --- | --- | --- |
| 地形怎样影响某次空气运动？ | 既有 DEM + 指定时次 GFS/IFS 风场 | 网格下载、变量筛选、时间空间一致性 | 高空/剖面变量及尺度匹配，不能只靠近地面风解释全部过程 |
| 不同地区长期环境为何不同？ | 多年气候、河流、植被、地形 | 按问题组织多源调查的方法 | 当前天气不足，需长期统计与可靠解释资料 |
| 一条路怎样连接地方？ | 道路、沿线地点设施、带日期街景/实拍 | 区域查询、目录到近景的取数方式 | 目标线路覆盖、年代一致性、材料选择 |
| 自然事件发生在哪里？ | 地震目录、对应时段热异常/遥感 | 事件坐标、时间、阈值与来源追溯 | 国内目录比对、事件核实、影响及原因资料 |
| 历史迁徙或文化如何形成联系？ | 史料、历史地名、年代和路线证据 | 通用来源记录与地理定位 | 库未提供完整史料，需专门研究 |

可优先复用来源清单、格式接法、限额缓存和来源时间状态；地球加载、图层呈现作为配套。新增数据先明确能支撑的问题，避免为了加图层而采集。

## 6. 实践和许可记录的归位

启动、截图、模型与下载限制保留在 [RUNNING.md](RUNNING.md)、[LOCAL-DATA.md](app/LOCAL-DATA.md)及 [notes.md](notes.md)，不作为本轮主线。旧西藏/新疆的全局贴图与独立区域场景、本库的 Cesium 按需地图，是空间背景获取方法的对比，不替代事件来源研究，也未证明首屏一定更快。

代码、数据、服务和模型许可分别适用。各节的服务方页面应在实际使用时复核；本研究未取得额外商业协议，也未证明所有入口允许长期存储或公开再分发。汇总见[固定版 DATA_SOURCES.md](https://github.com/bilawalsidhu/gods-eye-view/blob/064d51f7be2675f1c69e16068e9c49d1a60144d1/DATA_SOURCES.md)。
