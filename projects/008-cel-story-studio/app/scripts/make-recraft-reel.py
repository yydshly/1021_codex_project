from pathlib import Path
import subprocess,json
root=Path(__file__).resolve().parents[1];media=root.parent/'web/effect-examples'
ids=['aurora-glass','flat-vector','line-art','morph','hanazi','paperclip'];manifest=root/'.cache/recraft-concat.txt'
manifest.write_text('\n'.join("file '"+(media/f'{id}.mp4').as_posix()+"'" for id in ids),encoding='utf8')
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(manifest),'-map','0:v','-map','0:a','-vf','setpts=N/(30*TB)','-r','30','-c:v','libx264','-crf','16','-pix_fmt','yuv420p','-af','atrim=duration=60,asetpts=PTS-STARTPTS','-c:a','aac','-b:a','192k','-movflags','+faststart',str(media/'recraft-reel.mp4')],check=True)
(media/'recraft-reel.chapters.json').write_text(json.dumps([{'style':id,'start':i*10,'end':(i+1)*10} for i,id in enumerate(ids)],indent=2),encoding='utf8')
print('Six complete films / 60 seconds / 1800 frames.')
