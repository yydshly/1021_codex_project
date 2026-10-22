from pathlib import Path
import subprocess,json
p=Path(__file__).resolve().parents[2];folder=p/'web/effect-examples'
ids=['flat-vector','line-art','isometric','3d-render','cel-boil','collage','liquid','morph','bauhaus','synthwave','aurora-glass','hanazi','paperclip','pixel','hud']
cache=p/'app/.cache';manifest=cache/'collection-concat.txt'
manifest.write_text('\n'.join("file '"+(folder/f'{name}.mp4').as_posix()+"'" for name in ids),encoding='utf8')
# Keep all 4500 frames. Reset frame timestamps to avoid accumulating AAC padding between films.
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(manifest),'-map','0:v','-map','0:a','-vf','setpts=N/(30*TB)','-r','30','-c:v','libx264','-crf','16','-pix_fmt','yuv420p','-af','atrim=duration=150,asetpts=PTS-STARTPTS','-c:a','aac','-b:a','192k','-movflags','+faststart',str(folder/'quality-reel.mp4')],check=True)
(folder/'quality-reel.chapters.json').write_text(json.dumps([{'style':s,'start':i*10,'end':(i+1)*10} for i,s in enumerate(ids)],indent=2),encoding='utf8')
print('150 s / fifteen complete films / 4500 frames')
