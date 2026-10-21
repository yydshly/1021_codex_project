"""One bounded, credential-free GET per public source; save summaries, not feeds."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

CASES = [
    ('esri', 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer?f=pjson', 'esri'),
    ('osm-tile', 'https://tile.openstreetmap.org/0/0/0.png', 'png'),
    ('reearth-terrain', 'https://terrain.reearth.land/cesium-mesh/ellipsoid/layer.json', 'terrain'),
    ('opensky-shanghai', 'https://opensky-network.org/api/states/all?lamin=30&lomin=120&lamax=32.5&lomax=123', 'opensky'),
    ('adsblol-shanghai', 'https://api.adsb.lol/v2/lat/31.1443/lon/121.8083/dist/250', 'adsblol'),
    ('celestrak-stations', 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle', 'tle'),
    ('usgs-day', 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson', 'geojson'),
    ('gfs-bucket', 'https://noaa-gfs-bdp-pds.s3.amazonaws.com/?list-type=2&max-keys=1', 's3'),
    ('ecmwf-index', 'https://data.ecmwf.int/forecasts/', 'index'),
    ('openmeteo-shanghai', 'https://api.open-meteo.com/v1/forecast?latitude=31.1443&longitude=121.8083&current=temperature_2m,wind_speed_10m', 'weather'),
    ('hk-cctv-catalog', 'https://static.data.gov.hk/td/traffic-snapshot-images/code/Traffic_Camera_Locations_En.xml', 'xml'),
    ('taiwan-cctv-catalog', 'https://tisvcloud.freeway.gov.tw/history/motc20/CCTV.xml', 'xml'),
]
LIMIT = 2 * 1024 * 1024


def validate(body, kind):
    if kind in {'esri', 'terrain', 'opensky', 'adsblol', 'geojson', 'weather'}:
        value = json.loads(body)
        if kind == 'esri':
            assert 'tileInfo' in value and 'error' not in value
        elif kind == 'terrain':
            assert value.get('tiles')
        elif kind == 'opensky':
            assert 'states' in value and isinstance(value.get('time'), (int, float))
            return {'records': len(value['states'] or []), 'feedTime': value['time']}
        elif kind == 'adsblol':
            assert isinstance(value.get('ac'), list)
            return {'records': len(value['ac']), 'feedTime': value.get('now')}
        elif kind == 'geojson':
            assert value.get('type') == 'FeatureCollection'
            rows = value['features']
            return {'records': len(rows), 'generated': value.get('metadata', {}).get('generated'),
                    'magnitudeAtLeast2_5': sum((r.get('properties', {}).get('mag') or 0) >= 2.5 for r in rows)}
        elif kind == 'weather':
            assert 'current' in value and 'temperature_2m' in value['current']
            return {'dataTime': value['current'].get('time')}
    elif kind == 'png':
        assert body.startswith(b'\x89PNG\r\n\x1a\n')
    elif kind == 'tle':
        lines = body.decode('utf-8-sig').splitlines()
        first = sum(line.startswith('1 ') for line in lines)
        assert first > 0 and first == sum(line.startswith('2 ') for line in lines)
        return {'elementSets': first}
    elif kind in {'s3', 'xml'}:
        root = ET.fromstring(body)
        if kind == 's3':
            assert root.tag.endswith('ListBucketResult')
        return {'rootTag': root.tag, 'elements': sum(1 for _ in root.iter())}
    elif kind == 'index':
        text = body.decode('utf-8', errors='replace')
        assert '<html' in text.lower() and 'href=' in text.lower()
    return {}


def probe(case):
    source, endpoint, kind = case
    started = time.monotonic()
    result = {'source': source, 'endpoint': endpoint, 'expectedFormat': kind,
              'checkedAtUtc': datetime.now(timezone.utc).isoformat()}
    request = Request(endpoint, headers={
        'User-Agent': 'gods-eye-view-research/1.0 (+https://github.com/bilawalsidhu/gods-eye-view)',
        'Accept': '*/*',
    })
    try:
        with urlopen(request, timeout=20) as response:
            result.update(httpStatus=response.status, contentType=response.headers.get('Content-Type'))
            body = response.read(LIMIT + 1)
            if len(body) > LIMIT:
                raise ValueError('Response exceeds 2 MiB probe cap')
            result['bytes'] = len(body)
            result['summary'] = validate(body, kind)
            result['outcome'] = 'format-validated'
    except HTTPError as error:
        result.update(httpStatus=error.code, outcome='http-error', error=str(error.reason))
    except (URLError, TimeoutError, OSError, ValueError, AssertionError, ET.ParseError) as error:
        result.update(outcome='failed', error=str(error) or type(error).__name__)
    result['elapsedSeconds'] = round(time.monotonic() - started, 2)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(probe, CASES))
    report = {
        'checkedAtUtc': datetime.now(timezone.utc).isoformat(), 'displayTimezone': 'Asia/Shanghai',
        'scope': 'Current machine and configured network only; no cross-ISP or mainland-direct-route audit.',
        'proxyEnvironmentPresent': any(os.environ.get(key) for key in ('HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY')),
        'method': 'One unauthenticated GET per source, normal TLS verification, no retries, 20 s timeout, 2 MiB cap.',
        'limitations': 'Format success is not freshness, China completeness, licensing, imagery playback or end-to-end UI proof. No credentials or full feeds saved.',
        'results': results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    for result in results:
        print(json.dumps(result, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
