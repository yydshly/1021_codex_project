# AlphaDesk 全量能力索引

研究提交：`cef8991daa16ab03799f49c56939e48a1d247964`。以下从上游 AST 与路由声明提取；工具定义存在不等于外部数据已经连通。

## MCP 工具（53 项）

| 工具 | 分类 | 中文说明 | 源码 |
| --- | --- | --- | --- |
| `quote` | 行情 | 读取价格、时间、买卖报价与交易场所。 | [L230](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L230) |
| `movers` | 市场 | 按资产、日期和涨跌方向查看榜单。 | [L262](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L262) |
| `market_sessions` | 市场 | 先查询哪些日期有记录，再回看历史榜单。 | [L337](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L337) |
| `catalysts` | 事件 | 合并公告、停牌、政府行动和社交信息。 | [L359](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L359) |
| `price_chart` | 行情 | 提供抽稀价格序列及 RSI、MACD 等指标。 | [L385](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L385) |
| `find_symbol` | 公司 | 将公司名转换成正确证券代码。 | [L479](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L479) |
| `market_today` | 市场 | 汇集市场报价、板块及最新事件。 | [L506](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L506) |
| `symbol_news` | 新闻 | 读取与一只证券关联的新闻。 | [L540](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L540) |
| `news_search` | 新闻 | 按关键词或语义匹配报道。 | [L622](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L622) |
| `list_filings` | 公告 | 按证券和表单类型列出 SEC 申报。 | [L706](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L706) |
| `earnings_calendar` | 日历 | 查询未来披露与已报告记录。 | [L718](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L718) |
| `quotes` | 行情 | 一次读取自选标的的报价。 | [L799](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L799) |
| `price_history` | 行情 | 读取日线历史与区间收益材料。 | [L822](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L822) |
| `my_board` | 工作台 | 读取用户保存的研究标的。 | [L886](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L886) |
| `news_story` | 新闻 | 读取供应商允许提供的全文或摘要。 | [L907](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L907) |
| `key_stats` | 公司 | 查询估值、规模与公司统计。 | [L959](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L959) |
| `analyst_view` | 公司 | 展示评级、目标价和评级变更。 | [L970](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L970) |
| `ownership` | 公司 | 按数据源读取机构持仓材料。 | [L985](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L985) |
| `insider_activity` | 公司 | 读取 SEC Form 4 中披露的交易。 | [L993](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L993) |
| `earnings_history` | 公司 | 比较历史预期、实际与差异。 | [L1004](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1004) |
| `company_profile` | 公司 | 读取注册信息、业务原文与股本口径。 | [L1024](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1024) |
| `fund_profile` | 公司 | 读取基金持仓和资产分类。 | [L1037](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1037) |
| `financial_statements` | 公司 | 从 XBRL 获取可追溯的财务序列。 | [L1046](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1046) |
| `filing_text` | 公告 | 分页读取原始申报文本。 | [L1072](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1072) |
| `what_moved` | 研究 | 并列展示大幅波动日及此前的新闻与公告。 | [L1143](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1143) |
| `move_state` | 研究 | 描述波动之后延续、回吐或反转的程度。 | [L1204](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1204) |
| `candidates` | 研究 | 列出下一交易日有已注明时间的事件标的。 | [L1245](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1245) |
| `movers_in_context` | 研究 | 给涨跌榜配上各自新闻、公告与走势。 | [L1331](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1331) |
| `news_scan` | 新闻 | 将新闻窗口按证券分组。 | [L1430](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1430) |
| `entry_facts` | 研究 | 展示价差、流动性、价格位置及可交易标记，不下单。 | [L1486](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1486) |
| `related_assets` | 研究 | 从公司自己的申报材料寻找资产联系。 | [L1613](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1613) |
| `priced_in` | 研究 | 展示历史财报反应、事件前走势与分析师目标，不给定价结论。 | [L1697](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1697) |
| `economic_calendar` | 日历 | 读取宏观经济发布日历。 | [L1754](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1754) |
| `corporate_calendar` | 日历 | 读取分红、拆股和 IPO 日历。 | [L1773](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1773) |
| `sector_performance` | 市场 | 对比板块基金的涨跌表现。 | [L1791](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1791) |
| `sector_breadth` | 市场 | 展示板块上涨与下跌范围。 | [L1810](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1810) |
| `option_expirations` | 期权 | 列出标的可用的到期日。 | [L1828](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1828) |
| `option_chain` | 期权 | 按到期日读取合约，或读取已记录的历史收盘链。 | [L1836](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1836) |
| `options_flow` | 期权 | 读取会话中的期权成交及买卖侧材料。 | [L1909](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1909) |
| `baskets` | 工作台 | 读取预置与用户自定义的关注组合。 | [L1953](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L1953) |
| `peers` | 公司 | 获取供应商提供的同行列表。 | [L2002](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2002) |
| `compare_metrics` | 公司 | 比较多个标的同口径指标。 | [L2010](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2010) |
| `transcripts` | 公告 | 列出电话会议记录或 SEC 业绩新闻稿。 | [L2022](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2022) |
| `transcript_text` | 公告 | 分页读全文，区分 release 和 earnings call。 | [L2031](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2031) |
| `related_funds` | 公司 | 查询与标的相关的基金。 | [L2050](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2050) |
| `symbol_events` | 日历 | 汇集某证券的公司行动与事件。 | [L2065](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2065) |
| `filed_report` | 公告 | 获取报告及对应原始披露材料。 | [L2075](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2075) |
| `index_board` | 市场 | 读取市场指数或代理标的的表现。 | [L2105](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2105) |
| `social_posts` | 事件 | 读取特定公开账号镜像，按作者说法处理。 | [L2113](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2113) |
| `government_actions` | 事件 | 读取联邦公报、美联储公告与国债拍卖结果。 | [L2185](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2185) |
| `filing_feed` | 事件 | 按类别查看全市场最新 SEC 申报。 | [L2225](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2225) |
| `trading_halts` | 事件 | 读取交易所停牌与复牌状态。 | [L2275](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2275) |
| `data_sources` | 系统 | 解释供应商、许可来源与非官方采集的区别。 | [L2305](https://github.com/vigneshv1cky/alphadesk-terminal/blob/cef8991daa16ab03799f49c56939e48a1d247964/alphadesk/mcp_server.py#L2305) |

## 原版路由声明

| 路由 | 页面 / 重定向组件 |
| --- | --- |
| `/` | `Navigate` |
| `/markets` | `DashboardPage` |
| `/sectors` | `SectorsPage` |
| `/analysis` | `AnalysisPage` |
| `/compare` | `RedirectKeepingQuery` |
| `/profile` | `CompanyPage` |
| `/company` | `RedirectKeepingQuery` |
| `/news` | `NewsPage` |
| `/filings` | `FilingsPage` |
| `/posts` | `PostsPage` |
| `/portfolio` | `PortfolioPage` |
| `/earnings` | `EarningsPage` |
| `/calendars` | `CalendarsPage` |
| `/themes/:id` | `ThemePage` |
| `/views/:viewId` | `CustomViewPage` |
| `/options` | `OptionsPage` |
| `/terms` | `TermsPage` |
| `/privacy` | `PrivacyPage` |
| `/disclaimer` | `DisclaimerPage` |
| `/about` | `AboutPage` |
| `/account` | `AccountPage` |
| `/agent-access` | `AgentAccessPage` |
| `/dashboard` | `Navigate` |
| `/screener` | `Navigate` |
| `/chart` | `ChartPage` |
| `/filings` | `RedirectKeepingQuery` |
| `/trade` | `RedirectKeepingQuery` |
| `/research` | `RedirectKeepingQuery` |
| `*` | `Navigate` |
