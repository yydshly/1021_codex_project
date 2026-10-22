"""Launch the pinned upstream app without changing upstream source.

Default: isolated, no vendor credentials, no outgoing TCP, no ingest loops.
--online: official dashboard command, explicitly requires SEC_USER_AGENT.
--public: real public sources, no vendor credentials; SEC intentionally disabled.
"""
from pathlib import Path
import argparse
import base64
import os
import socket
import sys

APP = Path(__file__).resolve().parent

def configure(online=False, data=None, public_sources=False):
    os.environ['PYTHON_DOTENV_DISABLED'] = '1'
    runtime = Path(data) if data else APP / '.runtime' / ('public' if public_sources else '')
    runtime.mkdir(parents=True, exist_ok=True)
    os.environ['ALPHADESK_DATA'] = str(runtime)
    os.environ['ALPHADESK_AUTH'] = 'off'
    os.environ['ALPHADESK_SEMANTIC_SEARCH'] = 'off'
    os.environ.pop('ALPHADESK_DATABASE_URL', None)
    os.environ.pop('ALPHADESK_ACCESS_TOKEN', None)
    os.environ.pop('ALPHADESK_LOGIN_EMAIL', None)
    os.environ['DASHBOARD_HOST'] = '127.0.0.1'
    os.environ['DASHBOARD_PORT'] = '8782'
    os.environ['ALPHADESK_BASE_URL'] = 'http://127.0.0.1:8782'
    key = runtime / 'vault.key'
    if not key.exists(): key.write_text(base64.b64encode(os.urandom(32)).decode(), encoding='ascii')
    os.environ['ALPHADESK_VAULT_KEY'] = key.read_text(encoding='ascii').strip()
    if not online:
        for name in list(os.environ):
            if name.startswith(('ALPACA_', 'FMP_', 'FINNHUB_', 'POLYGON_', 'ALPHAVANTAGE_', 'BENZINGA_', 'MARKETAUX_')):
                os.environ.pop(name, None)
    if not online and not public_sources:
        connect = socket.socket.connect
        def local_only(sock, address):
            if isinstance(address, tuple) and address[0] not in ('127.0.0.1', 'localhost', '::1'):
                raise OSError('Research offline mode: upstream network access not verified')
            return connect(sock, address)
        socket.socket.connect = local_only
    elif online and not os.environ.get('SEC_USER_AGENT'):
        raise SystemExit('Online mode requires SEC_USER_AGENT with your real contact details. Do not use a fictional email.')
    sys.path.insert(0, str(APP / 'upstream'))
    if public_sources:
        os.environ.pop('SEC_USER_AGENT', None)
        from alphadesk.ingest import edgar
        def contact_required(url, timeout=15.0):
            raise RuntimeError('SEC is disabled in public-source research mode at the user request')
        edgar._get = contact_required

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    mode=parser.add_mutually_exclusive_group()
    mode.add_argument('--online',action='store_true')
    mode.add_argument('--public',action='store_true',dest='public_sources')
    args=parser.parse_args()
    configure(args.online, public_sources=args.public_sources)
    if args.online:
        from alphadesk.main import main as upstream_main
        sys.argv=['alphadesk','dashboard']
        upstream_main()
    else:
        from alphadesk.ledger import store
        store.init()
        store.ensure_local_user()
        from alphadesk.app.dashboard import app
        import uvicorn
        label='real public data, no vendor keys' if args.public_sources else 'isolated, no network/keys'
        print(f'Original AlphaDesk ({label}): http://127.0.0.1:8782/account', flush=True)
        uvicorn.run(app, host='127.0.0.1', port=8782, log_level='warning', timeout_graceful_shutdown=5)

if __name__=='__main__': main()
