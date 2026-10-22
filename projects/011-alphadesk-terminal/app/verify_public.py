"""Verify real public data through the running upstream HTTP and MCP APIs.

Raw responses stay in ignored .runtime/public; committed report has metadata only.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import urllib.request
import urllib.error

APP=Path(__file__).resolve().parent
BASE='http://127.0.0.1:8782'
OUT=APP/'.runtime/public/http'; OUT.mkdir(parents=True,exist_ok=True)

def request(path,method='GET',body=None,headers=None):
    h={'Origin':BASE,**(headers or {})}
    if body is not None:h['Content-Type']='application/json'
    req=urllib.request.Request(BASE+path,method=method,data=json.dumps(body).encode() if body is not None else None,headers=h)
    try:
        with urllib.request.urlopen(req,timeout=55) as response:return response.status,response.read(),response.headers.get('Content-Type','')
    except urllib.error.HTTPError as exc:return exc.code,exc.read(),exc.headers.get('Content-Type','')

def check(name,path,extract):
    try:
        status,raw,_=request(path)
        data=json.loads(raw)
        (OUT/(name+'.json')).write_bytes(raw)
        fields=extract(data) if status==200 else {'reason':str(data.get('detail',data))[:350]}
        return {'name':name,'path':path,'status':status,'sha256':hashlib.sha256(raw).hexdigest(),**fields}
    except Exception as exc:return {'name':name,'path':path,'error':str(exc)}

def main():
    jobs=[
      ('chart','/api/chart/NVDA?range=1M&interval=1d',lambda d:{'source':d.get('source'),'records':len(d.get('bars',[])),'first_at':(d.get('bars') or [{}])[0].get('t'),'last_at':(d.get('bars') or [{}])[-1].get('t')}),
      ('quote','/api/quote/NVDA',lambda d:{'source':d.get('vendor'),'official':d.get('official'),'has_price':d.get('price') is not None,'fields':list(d)[:25]}),
      ('chart_provider','/api/chart/capabilities',lambda d:{'provider':d.get('provider')}),
      ('treasury','/api/movers/bonds',lambda d:{'source':d.get('source'),'records':len((d.get('tabs') or [{}])[0].get('rows',[])),'data_dates':sorted({r.get('as_of','') for t in d.get('tabs',[]) for r in t.get('rows',[])})}),
      ('government','/api/gov/feed?days=30&limit=40',lambda d:{'records':len(d.get('events',[])),'sources':sorted({r['source'] for r in d.get('events',[])}),'unavailable':d.get('unavailable'),'read_at':d.get('read_at')}),
      ('halts','/api/halts?limit=60',lambda d:{'records':len(d.get('halts',[])),'sources':sorted({r.get('source','') for r in d.get('halts',[])}),'fields':list(d)[:15]}),
      ('ipos','/api/calendars/ipos',lambda d:{'records':len(d.get('rows',[])),'source':d.get('source'),'start':d.get('start'),'end':d.get('end')}),
    ]
    checks=[]
    with ThreadPoolExecutor(max_workers=3) as pool:
        tasks=[pool.submit(check,*job) for job in jobs]
        for task in as_completed(tasks):
            row=task.result(); checks.append(row);print(json.dumps(row,ensure_ascii=False),flush=True)
    status,raw,_=request('/api/agent/access-tokens','POST',{'name':'public data verification; temporary'})
    assert status==200
    token=json.loads(raw)
    headers={'Authorization':'Bearer '+token['token'],'Accept':'application/json, text/event-stream','MCP-Protocol-Version':'2025-03-26'}
    def rpc(method,params=None):
        code,body,ctype=request('/api/agent/tools/mcp','POST',{'jsonrpc':'2.0','id':1,'method':method,'params':params or {}},headers)
        assert code==200,(method,code)
        reply=json.loads(body) if ctype.startswith('application/json') else json.loads(next(x[6:] for x in body.decode().splitlines() if x.startswith('data: ')))
        assert 'error' not in reply,reply.get('error')
        return reply['result']
    calls=[]
    try:
        rpc('initialize',{'protocolVersion':'2025-03-26','capabilities':{},'clientInfo':{'name':'real-public-source-check','version':'1'}})
        for name,args in [('quote',{'symbol':'NVDA'}),('government_actions',{'days':30,'limit':10}),('trading_halts',{'limit':10})]:
            result=rpc('tools/call',{'name':name,'arguments':args})
            (OUT/('mcp-'+name+'.json')).write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8')
            content=json.loads(next(x['text'] for x in result.get('content',[]) if x['type']=='text'))
            evidence={'has_price':content.get('price') is not None,'source':content.get('vendor')} if name=='quote' else {'records':len(content.get('events' if name=='government_actions' else 'halts',[]))}
            calls.append({'name':name,'protocol_success':not result.get('isError',False),'data_present':evidence.get('has_price',evidence.get('records',0)>0),**evidence})
            print(json.dumps(calls[-1]),flush=True)
    finally:
        code,_,_=request('/api/agent/access-tokens/'+token['token_id'],'DELETE')
        assert code==200
    code,_,_=request('/api/agent/tools/mcp','POST',{'jsonrpc':'2.0','id':2,'method':'tools/list'},headers)
    for i,row in enumerate(checks):
        if row['name']=='halts' and row.get('status')==428:
            job=next(x for x in jobs if x[0]=='halts')
            refreshed=check(*job)
            checks[i]={**refreshed,'initial_status':428,'note':'Initial request queued background fill; checked again after successful MCP read'}
    report={'checked_at':datetime.now(timezone.utc).isoformat(),'synthetic':False,'mode':'original application, public sources, no commercial keys','checks':checks,'mcp':calls,'revoked_token_status':code,'limitations':['Yahoo is a public scraped source, not an exchange real-time feed','SEC disabled at user request','Commercial news, options and analyst data not connected','TreasuryDirect probe returned an empty list; completeness unverified','Chart endpoint omits provenance; chart_provider endpoint identifies active adapter']}
    (APP.parent/'validation-public.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    assert all(x.get('status')==200 for x in checks), 'One or more HTTP endpoints failed; see report'
    assert all(x['protocol_success'] and x['data_present'] for x in calls), 'MCP did not return actual data'
    assert code==401, 'Temporary token was not revoked'

if __name__=='__main__':main()
