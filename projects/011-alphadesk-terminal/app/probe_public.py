"""Bounded real-source checks. Saves actual payloads locally, never fixtures."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
import json
import time
from launch_original import configure, APP

def main():
    configure(public_sources=True)
    from alphadesk.ledger import store
    store.init()
    store.ensure_local_user()
    from alphadesk.ingest import gov_feed, movers
    from alphadesk.providers.scraped import YahooPrices, NasdaqCalendars
    jobs={
        'yahoo_chart':lambda:YahooPrices().chart_series('AAPL',range_key='1M',interval='1d'),
        'treasury_yields':movers._treasury,
        'fed':lambda:gov_feed.fed_press(limit=10),
        'treasury_auctions':lambda:gov_feed.treasury_auctions(days=14,limit=10),
        'federal_register':lambda:gov_feed.federal_register(days=30,limit=10),
        'nasdaq_halts':lambda:NasdaqCalendars()._read_halts(),
    }
    output=APP/'.runtime/public/probes'; output.mkdir(parents=True,exist_ok=True)
    def run(name,fn):
        started=time.monotonic()
        try:
            payload=fn()
            (output/(name+'.json')).write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
            return {'name':name,'returned_data':bool(payload),'seconds':round(time.monotonic()-started,2),'shape':list(payload)[:10] if isinstance(payload,dict) else f'{len(payload or [])} rows'}
        except Exception as exc:
            return {'name':name,'returned_data':False,'seconds':round(time.monotonic()-started,2),'error':str(exc)}
    rows=[]
    with ThreadPoolExecutor(max_workers=3) as pool:
        tasks=[pool.submit(run,n,f) for n,f in jobs.items()]
        for task in as_completed(tasks):
            row=task.result(); rows.append(row); print(json.dumps(row,ensure_ascii=False),flush=True)
    (output/'report.json').write_text(json.dumps({'checked_at':datetime.now(timezone.utc).isoformat(),'synthetic':False,'checks':rows},ensure_ascii=False,indent=2),encoding='utf-8')

if __name__=='__main__':main()
