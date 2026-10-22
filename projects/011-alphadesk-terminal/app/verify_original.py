"""Exercise original FastAPI and MCP registration without external requests."""
from pathlib import Path
import asyncio
import json
import tempfile
from launch_original import configure

APP=Path(__file__).resolve().parent
(APP/'.runtime').mkdir(exist_ok=True)
runtime=Path(tempfile.mkdtemp(prefix='verify-',dir=APP/'.runtime'))
configure(data=runtime)
from alphadesk.ledger import store
store.init()
store.ensure_local_user()
from alphadesk.app.dashboard import app
from alphadesk.mcp_server import mcp
from fastapi.testclient import TestClient

tools=asyncio.run(mcp.list_tools())
catalog=json.loads((APP/'catalog.json').read_text(encoding='utf-8'))
assert {t.name for t in tools}=={t['name'] for t in catalog['tools']}
assert all(t.annotations and t.annotations.readOnlyHint for t in tools)
checks=[]
with TestClient(app,base_url='http://127.0.0.1:8782') as client:
    for route in ['/markets','/chart','/analysis','/profile','/news','/filings','/posts','/portfolio','/sectors','/earnings','/calendars','/options','/account','/agent-access','/about','/terms','/privacy','/disclaimer','/themes/ai','/views/demo']:
        r=client.get(route)
        good=r.status_code==200 and 'text/html' in r.headers.get('content-type','')
        checks.append({'route':route,'status':r.status_code,'check':'SPA shell only; data not verified','passed':good})
        assert good,(route,r.status_code)
    for route,expected in [('/api/auth/me',200),('/api/agent/tools/mcp',401),('/api/quote/NVDA',428),('/api/chart/NVDA',428)]:
        r=client.get(route)
        checks.append({'route':route,'status':r.status_code,'expected':expected,'passed':r.status_code==expected})
        assert r.status_code==expected,(route,r.status_code,r.text[:300])
    issued=client.post('/api/agent/access-tokens',json={'name':'isolated protocol verification'})
    assert issued.status_code==200
    token=issued.json()['token']
    token_id=issued.json()['token_id']
    headers={'Authorization':'Bearer '+token,'Accept':'application/json, text/event-stream','MCP-Protocol-Version':'2025-03-26'}
    def rpc(method,params=None):
        r=client.post('/api/agent/tools/mcp',headers=headers,json={'jsonrpc':'2.0','id':1,'method':method,'params':params or {}})
        assert r.status_code==200,(method,r.status_code)
        if r.headers.get('content-type','').startswith('application/json'): reply=r.json()
        else: reply=json.loads(next(line[6:] for line in r.text.splitlines() if line.startswith('data: ')))
        assert 'error' not in reply,(method,reply.get('error'))
        return reply['result']
    rpc('initialize',{'protocolVersion':'2025-03-26','capabilities':{},'clientInfo':{'name':'isolated-research-check','version':'1'}})
    listed=rpc('tools/list')
    assert len(listed['tools'])==53
    calls=[]
    for name in ['data_sources','baskets']:
        result=rpc('tools/call',{'name':name,'arguments':{}})
        assert not result.get('isError'),name
        calls.append({'name':name,'passed':True,'mode':'real upstream tool, no external data'})
    revoke=client.delete('/api/agent/access-tokens/'+token_id)
    assert revoke.status_code==200
    refused=client.post('/api/agent/tools/mcp',headers=headers,json={'jsonrpc':'2.0','id':2,'method':'tools/list'})
    assert refused.status_code==401
report={'upstream_commit':catalog['commit'],'python':'3.12','mode':'isolated; no vendor keys; outgoing TCP blocked; ingest loops disabled','tool_registration_count':len(tools),'all_tools_read_only':True,'checks':checks,'mcp_protocol':{'initialize':True,'tools_list':53,'calls':calls,'revoked_token_status':401},'limits':['SPA shell 200 does not verify page data','No vendor connectivity tested','No embedding model installed','No external AI client or OAuth flow tested']}
(APP.parent/'validation-original.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
(APP/'runtime-tools.json').write_text(json.dumps([t.model_dump(mode='json') for t in tools],ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'tools':len(tools),'http_checks':len(checks),'passed':all(x['passed'] for x in checks)}))
