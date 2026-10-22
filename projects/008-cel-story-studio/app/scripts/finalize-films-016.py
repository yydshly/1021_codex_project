from pathlib import Path
from PIL import Image, ImageDraw
import subprocess,json,shutil,hashlib
p=Path(__file__).resolve().parents[2]; w=p/'web'; review=p/'assets/review-016'; stories=w/'story-examples-016';public=p/'app/public/effects'
def run(args):subprocess.run(args,check=True,capture_output=True)
items=['line-art-concert','line-art-garden','paperclip-anc','paperclip-prism']; records=[]
for name in items:
    f=stories/f'{name}.mp4'
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(f)],text=True))
    v=next(s for s in info['streams'] if s['codec_type']=='video');a=next(s for s in info['streams'] if s['codec_type']=='audio')
    assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1280,720,'30/1',300)
    run(['ffmpeg','-v','error','-i',str(f),'-f','null','-'])
    run(['ffmpeg','-v','error','-y','-ss','9.4','-i',str(f),'-frames:v','1','-q:v','2',str(stories/f'{name}.jpg')])
    board=Image.new('RGB',(1440,870),'#173a34');d=ImageDraw.Draw(board)
    for i,sec in enumerate([.6,1.5,2.5,3.5,4.5,5.5,6.5,7.5,9.4]):
        im=review/'keyframes'/f'encoded-{name}-{i}.jpg'
        run(['ffmpeg','-v','error','-y','-ss',str(sec),'-i',str(f),'-frames:v','1','-vf','scale=480:270',str(im)])
        x=i%3*480;y=i//3*290;board.paste(Image.open(im),(x,y+18));d.text((x+5,y+3),f'{name} / {sec:.1f}s / ENCODED FILM',fill='#fff4d4')
    board.save(review/f'final-{name}.jpg',quality=94)
    records.append({'file':str(f.relative_to(p)),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'frames':300,'audio':a['codec_name'],'fullDecode':True})
for style,story in [('line-art','concert'),('paperclip','anc')]:
    for ext in ['mp4','jpg','json']:shutil.copy2(stories/f'{style}-{story}.{ext}',w/f'effect-examples/{style}.{ext}')
for src in review.glob('audit-*.jpg'):shutil.copy2(src,public/f'audit-016-{src.stem[6:]}.jpg')
for style in ['line-art','paperclip']:
    before=w/f'quality-before-016/{style}.mp4'; after=w/f'effect-examples/{style}.mp4'
    board=Image.new('RGB',(1440,580),'#173a34');d=ImageDraw.Draw(board)
    for row,f in enumerate([before,after]):
        for i,sec in enumerate([2.2,5.5,9.4]):
            target=review/f'compare-{style}-{row}-{i}.jpg';run(['ffmpeg','-v','error','-y','-ss',str(sec),'-i',str(f),'-frames:v','1','-vf','scale=480:270',str(target)])
            board.paste(Image.open(target),(i*480,row*290+18));d.text((i*480+6,row*290+3),f'{"BEFORE" if row==0 else "0.16"} / {sec:.1f}s',fill='white')
    board.save(review/f'compare-{style}.jpg',quality=94);shutil.copy2(review/f'compare-{style}.jpg',public/f'compare-016-{style}.jpg')
# A 40s reel keeps every frame of every new story; no highlight editing.
listing=p/'app/.cache/story-reel-016.txt';listing.write_text('\n'.join("file '"+(stories/f'{name}.mp4').as_posix()+"'" for name in items),encoding='utf-8')
run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(listing),'-vf','setpts=N/(30*TB)','-r','30','-c:v','libx264','-crf','17','-af','atrim=duration=40,asetpts=PTS-STARTPTS','-c:a','aac','-b:a','192k','-movflags','+faststart',str(stories/'complete-reel-016.mp4')])
preserved=json.loads((w/'quality-before-016/manifest.json').read_text(encoding='utf-8'))
for r in preserved:assert hashlib.sha256((w/'quality-before-016'/r['file']).read_bytes()).hexdigest()==r['sha256']
for r in json.loads((review/'audit-manifest.json').read_text(encoding='utf-8')):
    if r['role'].startswith('BEFORE') and r['style'] not in ['line-art','paperclip']:assert hashlib.sha256((p/r['file']).read_bytes()).hexdigest()==r['sha256']
(review/'media.json').write_text(json.dumps({'films':records,'unchangedOtherStyles':13,'preservedFiles':len(preserved),'scope':'Technical integrity only, not an artistic rating.'},indent=2),encoding='utf-8')
print('4 encoded films extracted and decoded; 13 other films unchanged; archived files verified.')
