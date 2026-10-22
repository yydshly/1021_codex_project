"""Build a dependency-free, explicitly synthetic Chinese AlphaDesk exhibition."""
from pathlib import Path
import ast
import datetime as dt
import hashlib
import json
import math
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / 'app'
UP = APP / 'upstream'
WEB = ROOT / 'web'
PIN = 'cef8991daa16ab03799f49c56939e48a1d247964'

TOOLS = {
 'quote': ('行情', '单标的报价', '读取价格、时间、买卖报价与交易场所。'),
 'quotes': ('行情', '批量报价', '一次读取自选标的的报价。'),
 'movers': ('市场', '分类涨跌榜', '按资产、日期和涨跌方向查看榜单。'),
 'market_sessions': ('市场', '可用历史交易日', '先查询哪些日期有记录，再回看历史榜单。'),
 'catalysts': ('事件', '事件总时间线', '合并公告、停牌、政府行动和社交信息。'),
 'price_chart': ('行情', '图表与指标', '提供抽稀价格序列及 RSI、MACD 等指标。'),
 'find_symbol': ('公司', '证券检索', '将公司名转换成正确证券代码。'),
 'market_today': ('市场', '今日市场', '汇集市场报价、板块及最新事件。'),
 'symbol_news': ('新闻', '个股新闻', '读取与一只证券关联的新闻。'),
 'news_search': ('新闻', '新闻检索', '按关键词或语义匹配报道。'),
 'list_filings': ('公告', '公司公告列表', '按证券和表单类型列出 SEC 申报。'),
 'earnings_calendar': ('日历', '财报日历', '查询未来披露与已报告记录。'),
 'price_history': ('行情', '历史价格', '读取日线历史与区间收益材料。'),
 'my_board': ('工作台', '我的关注列表', '读取用户保存的研究标的。'),
 'news_story': ('新闻', '新闻正文', '读取供应商允许提供的全文或摘要。'),
 'key_stats': ('公司', '关键指标', '查询估值、规模与公司统计。'),
 'analyst_view': ('公司', '分析师观点', '展示评级、目标价和评级变更。'),
 'ownership': ('公司', '机构持仓', '按数据源读取机构持仓材料。'),
 'insider_activity': ('公司', '内部人交易', '读取 SEC Form 4 中披露的交易。'),
 'earnings_history': ('公司', '历史业绩', '比较历史预期、实际与差异。'),
 'company_profile': ('公司', '公司档案', '读取注册信息、业务原文与股本口径。'),
 'fund_profile': ('公司', '基金档案', '读取基金持仓和资产分类。'),
 'financial_statements': ('公司', '财务报表', '从 XBRL 获取可追溯的财务序列。'),
 'filing_text': ('公告', '公告全文', '分页读取原始申报文本。'),
 'what_moved': ('研究', '波动与事件对照', '并列展示大幅波动日及此前的新闻与公告。'),
 'move_state': ('研究', '走势延续与回吐', '描述波动之后延续、回吐或反转的程度。'),
 'candidates': ('研究', '下一交易日事件', '列出下一交易日有已注明时间的事件标的。'),
 'movers_in_context': ('研究', '带上下文的涨跌榜', '给涨跌榜配上各自新闻、公告与走势。'),
 'news_scan': ('新闻', '按公司浏览新闻', '将新闻窗口按证券分组。'),
 'entry_facts': ('研究', '流动性与价格事实', '展示价差、流动性、价格位置及可交易标记，不下单。'),
 'related_assets': ('研究', '公告中的关联资产', '从公司自己的申报材料寻找资产联系。'),
 'priced_in': ('研究', '事件前后价格材料', '展示历史财报反应、事件前走势与分析师目标，不给定价结论。'),
 'economic_calendar': ('日历', '经济事件', '读取宏观经济发布日历。'),
 'corporate_calendar': ('日历', '公司行动', '读取分红、拆股和 IPO 日历。'),
 'sector_performance': ('市场', '板块表现', '对比板块基金的涨跌表现。'),
 'sector_breadth': ('市场', '板块市场宽度', '展示板块上涨与下跌范围。'),
 'option_expirations': ('期权', '期权到期日', '列出标的可用的到期日。'),
 'option_chain': ('期权', '期权链', '按到期日读取合约，或读取已记录的历史收盘链。'),
 'options_flow': ('期权', '期权成交观察', '读取会话中的期权成交及买卖侧材料。'),
 'baskets': ('工作台', '主题篮子', '读取预置与用户自定义的关注组合。'),
 'peers': ('公司', '同行公司', '获取供应商提供的同行列表。'),
 'compare_metrics': ('公司', '公司指标比较', '比较多个标的同口径指标。'),
 'transcripts': ('公告', '会议与业绩稿列表', '列出电话会议记录或 SEC 业绩新闻稿。'),
 'transcript_text': ('公告', '会议与业绩稿正文', '分页读全文，区分 release 和 earnings call。'),
 'related_funds': ('公司', '相关基金', '查询与标的相关的基金。'),
 'symbol_events': ('日历', '公司事件', '汇集某证券的公司行动与事件。'),
 'filed_report': ('公告', '已申报报告', '获取报告及对应原始披露材料。'),
 'index_board': ('市场', '指数看板', '读取市场指数或代理标的的表现。'),
 'social_posts': ('事件', '社交帖子', '读取特定公开账号镜像，按作者说法处理。'),
 'government_actions': ('事件', '政府行动', '读取联邦公报、美联储公告与国债拍卖结果。'),
 'filing_feed': ('事件', '全市场公告流', '按类别查看全市场最新 SEC 申报。'),
 'trading_halts': ('事件', '停复牌', '读取交易所停牌与复牌状态。'),
 'data_sources': ('系统', '数据来源', '解释供应商、许可来源与非官方采集的区别。'),
}

PROVIDERS = [
 ('Alpaca','密钥 + Secret','行情 / 新闻 / 期权 / 加密货币','实时推送 + 按需查询','Benzinga 新闻可带正文；行情覆盖随套餐变化。','licensed'),
 ('Polygon','密钥','行情 / 新闻 / 公司行动','按需查询 / 轮询','新闻接口主要提供摘要。图表不跨供应商拼接。','licensed'),
 ('Finnhub','密钥','公司指标 / 分析师 / 新闻 / 电话会议','按需查询','机构持仓、部分预期和会议记录受套餐限制。','licensed'),
 ('Alpha Vantage','密钥','公司资料 / 历史行情 / ETF / 新闻','按需查询','有额度限制；等待与失败应作为状态展示。','licensed'),
 ('FMP','密钥','日历 / 评级 / 公司资料 / 基金 / 新闻 / 电话会议','按需查询','不能用一个供应商名称推断所有接口权限。','licensed'),
 ('Benzinga','密钥','新闻全文 / 图片 / 作者','轮询','直连接口与 Alpaca 转供不是两个独立事实来源。','licensed'),
 ('Marketaux','密钥','新闻摘要 / 图片 / 公司标签','轮询','正文能力以供应商实际返回为准。','licensed'),
 ('SEC EDGAR','真实联系邮箱作为 User-Agent','公告 / 财务 / Form 4 / 业绩稿','JSON / HTML','公开记录；本演示没有提供真实联系人，因此未验证在线拉取。','public'),
 ('US Treasury','无密钥','国债收益率 / 拍卖结果','CSV / 公开接口','收益率是日频；不能解释为即时成交收益率。','public'),
 ('Federal Register','无密钥','政府规则 / 拟议规则','公开接口','许多事件只有日期精度，不能假定盘中精确时刻。','public'),
 ('Federal Reserve','无密钥','美联储公告','官方发布','公告发布时间与新闻转载时间不同。','public'),
 ('Yahoo Finance','主动开启','报价 / 图表 / 日线','公开页面接口','非官方采集，正式供应商之后才尝试。','scraped'),
 ('Nasdaq / Nasdaq Trader','主动开启','日历 / 停复牌','页面接口 / RSS','日历采集与停牌信息保留具体来源。','scraped'),
 ('Social mirror','主动开启','特定 Truth Social 账号的镜像帖子','RSS','来自 trumpstruth.org；不是通用社交搜索，不从帖子推断股票标签。','scraped'),
]

def make_catalog():
    source = UP / 'alphadesk/mcp_server.py'
    tree = ast.parse(source.read_text(encoding='utf-8'))
    tools = []
    for n in tree.body:
        if not isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        if not any(isinstance(d, ast.Call) and isinstance(d.func, ast.Attribute) and d.func.attr == 'tool' for d in n.decorator_list):
            continue
        group, title, summary = TOOLS[n.name]
        defaults = dict(zip([a.arg for a in n.args.args][-len(n.args.defaults):], n.args.defaults)) if n.args.defaults else {}
        params = []
        for a in n.args.args:
            default = defaults.get(a.arg)
            params.append({'name': a.arg, 'type': ast.unparse(a.annotation) if a.annotation else 'any', 'required': default is None,
                           'default': ast.literal_eval(default) if default is not None else None})
        tools.append({'name': n.name, 'title': title, 'group': group, 'summary': summary,
                      'doc': ast.get_docstring(n), 'params': params, 'line': n.lineno,
                      'source': f'https://github.com/vigneshv1cky/alphadesk-terminal/blob/{PIN}/alphadesk/mcp_server.py#L{n.lineno}'})
    if set(TOOLS) != {t['name'] for t in tools}:
        raise ValueError('Tool coverage changed; update the exhibition before building')
    import re
    app_src = (UP / 'alphadesk/ui/src/App.tsx').read_text(encoding='utf-8')
    routes = []
    for path, component in re.findall(r'<Route path="([^"]+)" element=\{<([A-Za-z]+)', app_src):
        routes.append({'path': path, 'component': component, 'redirect': component in ('Navigate','RedirectKeepingQuery')})
    return {'commit': PIN, 'version': '0.2.1', 'date': '2026-10-22', 'tools': tools, 'routes': routes,
            'providers': [dict(zip(['name','access','coverage','transport','note','kind'], x)) for x in PROVIDERS]}

def make_fixtures():
    companies = [
        {'symbol':'DEMO-A','name':'星际算力','sector':'信息技术','base':128,'color':'#69dec0','business':'用于演示数据中心与芯片产业链研究的虚构公司。'},
        {'symbol':'DEMO-B','name':'远航能源','sector':'能源','base':76,'color':'#f2c86b','business':'用于演示油气与新能源事件对照的虚构公司。'},
        {'symbol':'DEMO-C','name':'晨光健康','sector':'医疗健康','base':94,'color':'#a5a2ff','business':'用于演示临床、监管与经营信息的虚构公司。'},
        {'symbol':'DEMO-D','name':'轨道消费','sector':'可选消费','base':52,'color':'#75b9f4','business':'用于演示消费、零售和季度业绩的虚构公司。'},
    ]
    for j,c in enumerate(companies):
        bars=[]
        day=dt.date(2026,6,15)
        while len(bars)<90:
            if day.weekday()<5:
                i=len(bars); base=c['base']*(.76+i*.0023+.036*math.sin(i*.34+j)+.015*math.cos(i*.83))
                o=base*(1+.008*math.sin(i*1.9)); close=base*(1+.011*math.cos(i*1.13+j))
                bars.append({'date':day.isoformat(),'open':round(o,2),'high':round(max(o,close)*1.013,2),'low':round(min(o,close)*.989,2),'close':round(close,2),'volume':int((4+abs(math.sin(i*.32+j))*8)*1e6)})
            day+=dt.timedelta(days=1)
        c['bars']=bars
        c['price']=bars[-1]['close']; c['change']=round((bars[-1]['close']/bars[-2]['close']-1)*100,2)
        c['financials']=[{'period':f'2025 Q{(i%4)+1}' if i<4 else f'2026 Q{i-3}', 'revenue':round((6+j*1.2)*(1+i*.09),2), 'income':round((1.1+j*.15)*(1+i*.11),2),'ocf':round((1.6+j*.2)*(1+i*.08),2)} for i in range(7)]
    news=[]
    subjects=[('算力扩建计划进入新阶段','AI 数据中心 资本开支 芯片'),('公布第三季度示例业绩','财报 营收 利润'),('供应链长期协议披露','合同 供应链'),('能源项目更新建设进度','能源 油气 项目'),('医疗产品研究进度更新','医疗 临床 研发'),('新零售渠道进入试运营','消费 零售 渠道'),('利率决议研究材料发布','利率 政策 宏观'),('董事披露示例股份交易','内部人 持股 披露')]
    for i,(title,tags) in enumerate(subjects):
        c=companies[i%4]
        news.append({'id':f'N{i+1:03}','symbol':c['symbol'],'title':title+'（虚构示例）','at':f'2026-10-{22-i//3:02} {14-i%3:02}:30','source':['示例新闻源 A','示例新闻源 B'][i%2], 'tags':tags,'full':i%3!=1,'body':f'这是中文交互演示自行编写的材料，不是真实新闻。{c["name"]}是一家虚构公司。本条用于观察“标题 → 股票标签 → 相关行情 → 原始材料”的研究路径。数据源返回全文时可以在阅读器里展开；只返回摘要时，需要回到供应商提供的原文链接。本例不构成投资信息。'})
    filings=[{'id':'F001','type':'10-Q','title':'季度报告：业务与财务数据','at':'2026-10-21 16:15','symbol':'DEMO-A'}, {'id':'F002','type':'8-K','title':'业绩新闻稿与经营更新','at':'2026-10-21 16:20','symbol':'DEMO-A'}, {'id':'F003','type':'4','title':'内部人交易申报','at':'2026-10-20 17:00','symbol':'DEMO-B'}, {'id':'F004','type':'10-K','title':'年度报告：业务与风险因素','at':'2026-10-19 16:00','symbol':'DEMO-C'}, {'id':'F005','type':'13F','title':'机构持仓申报','at':'2026-10-18 18:00','symbol':'DEMO-D'}, {'id':'F006','type':'6-K','title':'境外发行人经营更新','at':'2026-10-17 15:00','symbol':'DEMO-B'}]
    return {'synthetic':True,'notice':'全部 DEMO-* 公司、价格、新闻、公告、期权与日期场景均为虚构教学数据；不是行情回放。','companies':companies,'news':news,'filings':filings}

def main():
    WEB.mkdir(exist_ok=True)
    catalog=make_catalog() if UP.exists() else json.loads((APP/'catalog.json').read_text(encoding='utf-8'))
    if UP.exists():
        actual=subprocess.check_output(['git','rev-parse','HEAD'],cwd=UP,text=True).strip()
        if actual!=PIN: raise ValueError(f'Wrong upstream commit: {actual}')
        (APP/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
        shutil.copy2(UP/'LICENSE',ROOT/'UPSTREAM-LICENSE.txt')
        gallery=ROOT/'assets/upstream'; gallery.mkdir(exist_ok=True)
        for p in (UP/'alphadesk/ui/public/landing').glob('*.jpg'): shutil.copy2(p,gallery/p.name)
    fixtures=make_fixtures()
    for p in (APP/'src').iterdir():
        if p.is_file(): shutil.copy2(p,WEB/p.name)
    (WEB/'data.js').write_text('window.LAB_DATA = '+json.dumps({'catalog':catalog,'fixtures':fixtures},ensure_ascii=False)+';\n',encoding='utf-8')
    rows=['# AlphaDesk 全量能力索引','',f'研究提交：`{PIN}`。以下从上游 AST 与路由声明提取；工具定义存在不等于外部数据已经连通。','', '## MCP 工具（53 项）','', '| 工具 | 分类 | 中文说明 | 源码 |','| --- | --- | --- | --- |']
    rows += [f'| `{t["name"]}` | {t["group"]} | {t["summary"]} | [L{t["line"]}]({t["source"]}) |' for t in catalog['tools']]
    rows += ['', '## 原版路由声明','', '| 路由 | 页面 / 重定向组件 |','| --- | --- |']
    rows += [f'| `{r["path"]}` | `{r["component"]}` |' for r in catalog['routes']]
    (ROOT/'capability-map.md').write_text('\n'.join(rows)+'\n',encoding='utf-8')
    (WEB/'media').mkdir(exist_ok=True)
    for p in (ROOT/'assets/upstream').glob('*.jpg'): shutil.copy2(p,WEB/'media'/p.name)
    for name in ('original-account.jpg','original-markets.jpg','real-chart.jpg','real-markets.jpg','real-calendars.jpg','mcp-lab.jpg','architecture-full.svg','architecture-full.png'):
        if (ROOT/'assets'/name).exists(): shutil.copy2(ROOT/'assets'/name,WEB/'media'/name)
    shutil.copy2(ROOT/'UPSTREAM-LICENSE.txt',WEB/'UPSTREAM-LICENSE.txt')
    for name in ('validation-original.json','validation-browser.json','validation-public.json','validation-research.json'):
        if (ROOT/name).exists(): shutil.copy2(ROOT/name,WEB/name)
    report=json.loads((ROOT/'validation-public.json').read_text(encoding='utf-8')) if (ROOT/'validation-public.json').exists() else None
    (WEB/'research-data.js').write_text('window.RESEARCH_DATA = '+json.dumps({'catalog':catalog,'report':report},ensure_ascii=False)+';\n',encoding='utf-8')
    for name in ('research-guide.md','capability-map.md'):
        shutil.copy2(ROOT/name,WEB/name)
    guide=(WEB/'research-guide.md').read_text(encoding='utf-8')
    guide=guide.replace('(app/upstream/',f'(https://github.com/vigneshv1cky/alphadesk-terminal/blob/{PIN}/')
    (WEB/'research-guide.md').write_text(guide,encoding='utf-8')
    # Keep byte hashes stable across Windows builds and Linux Pages checkouts.
    for p in WEB.rglob('*'):
        if p.is_file() and p.suffix in {'.html','.css','.js','.json','.md','.txt','.svg'}:
            p.write_bytes(p.read_bytes().replace(b'\r\n',b'\n'))
    (WEB/'manifest.json').write_text(json.dumps({'commit':PIN,'tools':len(catalog['tools']),'entry':'research overview','teaching_data_synthetic':True,'public_report':'validation-public.json','files':{p.relative_to(WEB).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in WEB.rglob('*') if p.is_file() and p.name!='manifest.json'}},indent=2),encoding='utf-8')
    print(f'Built {WEB}: {len(catalog["tools"])} tools, {len(catalog["routes"])} route declarations, {len(catalog["providers"])} source entries')

if __name__=='__main__': main()
