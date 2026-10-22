"""Publish generated still references without changing their source design status."""
from pathlib import Path
import hashlib
import json
import shutil
import struct

APP = Path(__file__).resolve().parent
PROJECT = APP.parent


def export_direction_keyframes(design, output):
    source = APP / 'production/tea-moment-keyframes.json'
    record = json.loads(source.read_text(encoding='utf-8'))
    if record['status'] != 'generated_key_images_only' or record['videoStatus'] != 'not_generated':
        raise ValueError('Ceramic still references are not a generated video case.')
    design_file = PROJECT / record['designSource']['path']
    if design_file.resolve() != (APP / 'direction-example.json').resolve() or hashlib.sha256(design_file.read_bytes()).hexdigest() != record['designSource']['sha256']:
        raise ValueError('Key images refer to a different version of the ceramic design.')
    if json.loads(design_file.read_text(encoding='utf-8')) != design:
        raise ValueError('Key image source design mismatch.')
    executions = {e['id']: e for e in record['executions']}
    if len(executions) != len(record['executions']):
        raise ValueError('Duplicate key image execution.')
    for execution in executions.values():
        if not execution['prompt'] or execution['tool'] != 'image_gen' or execution['modelVersion'] is not None:
            raise ValueError('Keep exact built-in image inputs and unknown model metadata.')
        artifact = execution['artifact']
        path = (PROJECT / artifact['file']).resolve()
        destination = (output / artifact['url']).resolve()
        if not path.is_relative_to((PROJECT / 'assets/generated/tea-moment').resolve()) or not destination.is_relative_to((output / 'generated/tea-moment').resolve()):
            raise ValueError('Key image path is outside the ceramic asset directory.')
        data = path.read_bytes()
        if data[:8] != b'\x89PNG\r\n\x1a\n' or hashlib.sha256(data).hexdigest() != artifact['sha256'] or struct.unpack('>II', data[16:24]) != (artifact['width'], artifact['height']):
            raise ValueError('Missing, changed, or incorrectly measured key image: ' + artifact['file'])
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, destination)
        for image in execution['inputImages']:
            original = executions[image['executionId']]['artifact']
            if image['sha256'] != original['sha256'] or not image['role']:
                raise ValueError('Key image input reference mismatch.')
    if {f['shotId'] for f in record['frames']} != {s['id'] for s in design['shots']} or len(record['frames']) != len(design['shots']):
        raise ValueError('Key images must cover the exact three shots once each.')
    for frame in record['frames']:
        artifact = executions[frame['executionId']]['artifact']
        if frame['url'] != artifact['url'] or (frame['width'], frame['height']) != (artifact['width'], artifact['height']):
            raise ValueError('Displayed key image does not match the recorded output.')
    record['designSnapshot'] = design
    record['recordUrl'] = 'tea-moment-keyframes.json'
    payload = json.dumps(record, ensure_ascii=False, indent=2)
    (output / record['recordUrl']).write_text(payload + '\n', encoding='utf-8')
    (output / 'direction-keyframes.js').write_text('window.DIRECTION_KEYFRAMES = ' + payload + ';\n', encoding='utf-8')
    print('Published 3 ceramic still references; their original historical record is preserved.')
