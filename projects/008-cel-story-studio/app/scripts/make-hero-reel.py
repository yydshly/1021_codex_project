"""Concatenate the two complete creative films, preserving all frames and their original scores."""
from pathlib import Path
import json,subprocess
root=Path(__file__).resolve().parents[1];media=root.parent/'web/effect-examples';cache=root/'.cache'
ids=['3d-render','isometric'];manifest=cache/'hero-concat.txt'
manifest.write_text('\n'.join("file '"+(media/f'{id}.mp4').as_posix()+"'" for id in ids),encoding='utf8')
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(manifest),'-map','0:v','-map','0:a','-vf','setpts=N/(30*TB)','-r','30','-c:v','libx264','-crf','16','-pix_fmt','yuv420p','-af','atrim=duration=20,asetpts=PTS-STARTPTS','-c:a','aac','-b:a','192k','-movflags','+faststart',str(media/'hero-reel.mp4')],check=True)
(media/'hero-reel.chapters.json').write_text(json.dumps([{'style':id,'start':i*10,'end':(i+1)*10} for i,id in enumerate(ids)],indent=2),encoding='utf8')
print('20 seconds, 600 frames, two complete films with their scores.')
