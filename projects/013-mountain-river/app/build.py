"""将研究页、实机截图和固定版本原版场景复制到独立静态目录。"""
from pathlib import Path
import shutil

APP = Path(__file__).resolve().parent
PROJECT = APP.parent
WEB = PROJECT / 'web'
WEB.mkdir(exist_ok=True)
for filename in ('index.html', 'styles.css', 'app.js'):
    shutil.copy2(APP / filename, WEB / filename)
(WEB / 'assets').mkdir(exist_ok=True)
for filename in ('river.png', 'overlook.png', 'waterline.png', 'core-value-summary-v2.png'):
    shutil.copy2(PROJECT / 'assets' / filename, WEB / 'assets' / filename)
scene = WEB / 'scene'
scene.mkdir(exist_ok=True)
for filename in ('index.html', 'style.css', 'LICENSE', 'CREDITS.md', 'README.md'):
    shutil.copy2(APP / 'upstream' / filename, scene / filename)
for folder in ('src', 'vendor', 'reports'):
    shutil.copytree(APP / 'upstream' / folder, scene / folder, dirs_exist_ok=True)
print(f'Built {WEB} (static page + pinned original WebGPU scene)')
