"""Prepare a reviewable execution plan without submitting any paid video task."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
APP = HERE.parent


def main():
    design = json.loads((APP / 'studio-book-repair.json').read_text(encoding='utf-8'))
    anchor_en = ('The same small old indigo clothbound book, a small pale-beige rectangular repair patch at the lower-right corner of the front cover, naturally yellowed paper and signs of use. '
                 'The reference image defines book identity and workshop materials, not mandatory framing or closed-book pose. '
                 'An ordinary wooden repair table, soft morning light from a window on the left, restrained natural colors. ')
    anchor_zh = '同一本小型靛蓝布面旧书，前封面右下角有小块浅米色矩形补布，纸边自然泛黄并保留旧痕。参考图只规定书的身份与工作台材质，不强制沿用构图或合书姿态。普通木质修复台，左侧窗户柔和晨光，色彩自然克制。'
    end_en = ('No faces, no speech, no music, no overlaid text or logos. Quiet workshop room tone and subtle contact sounds only. '
              'No rain, mirrors, forest imagery, magical transformation or exaggerated particles. '
              'Keep the camera locked off: no zoom, pan, orbit or cuts within the clip. Plausible hands, rigid book geometry and continuous physical contact.')
    end_zh = '不拍脸，无人声、音乐、叠加文字或标志；只有安静工作室底噪和轻微接触声。不要雨、镜面、森林意象、魔法变化或夸张粒子。摄影机固定：镜内不变焦、摇移、环绕或切镜。手部合理，书的几何稳定，接触连续。'
    scenes = [
        (
            '5 seconds, 16:9. Oblique side macro near spine level. The book starts closed and lying flat, frayed spine toward camera. '
            'A hand in a plain linen sleeve gently makes ONE slow pass with a small soft brush across the worn spine, then pauses. '
            'Show realistic fine paper fibers; keep the brush-to-spine contact zone crisp with enough depth of field, background softly out of focus. '
            'The hand enters from the left. The spine crosses the middle of frame. No sudden repair or change of material. Soft diffuse window light, no pronounced light shaft.',
            '5 秒，16:9。接近书脊高度的斜侧微距。开场旧书合上平放，磨损书脊朝镜头。穿素色亚麻袖衣的手用小软刷缓慢轻刷书脊一次，然后停住。纸纤维真实细小，刷头与书脊接触区清楚，景深足以看清接触，背景柔和虚化。手从左侧进入，书脊横向穿过画面中段。不要突然修好或改变材料。柔和漫射窗光，不做明显光束。'
        ),
        (
            '10 seconds, 16:9. Start ALREADY OPEN on a soft linen book support, not opening from the closed reference pose. '
            'Close macro from the binding-hole side, slightly above the table. One linen-sleeved hand steadies the paper section while the other holds one needle carrying one fine beige thread. '
            'At first pause briefly; during the first six seconds slowly pass that single needle ONCE through one EXISTING visible binding hole, then hold still for the rest of the clip. '
            'Keep needle tip, hole and thread contact readable together, with the palms outside the contact area. '
            'The needle enters the paper hole, never a finger; the thread remains continuous, the hole and fingers remain stable. '
            'No repeated stitching, montage, instant restoration or whole-book repair sequence. Soft window light from the left separates thread from paper.',
            '10 秒，16:9。开场书已打开，支在柔软亚麻书托上，不要从参考图的合书姿态开始开书。装订孔一侧、略高于台面的近距离微距。一只亚麻袖口的手稳住书帖，另一只手拿一根穿着单根米色细线的针。先短暂停顿，在前六秒内缓慢将这一根针穿过一个已有且可见的装订孔一次，然后在余下时间保持停顿。针尖、孔与线的接触区同时可读，手掌不遮住接触。针只穿纸孔、不穿手指；线连续，孔和手指稳定。不重复穿针，不蒙太奇，不瞬间修复，不演整个修书流程。左侧柔和窗光使线与纸分离。'
        ),
        (
            '5 seconds, 16:9. Start with the same repaired book ALREADY OPEN on the table. '
            'A locked oblique medium view shows the book, linen-sleeved restorer forearms and a small portion of the left window area. '
            'Both hands gently close the book ONCE; after it closes they pause. The front cover and its lower-right beige patch become visible. '
            'Keep the book aged, not newly manufactured. Book and hands are the visual center, only a few ordinary tools far behind them. '
            'A faint diagonal shaft of morning window light from the left is made visible by VERY LITTLE airborne paper dust, consistent with the real window. '
            'No thick fog, glitter, smoke or particles obscuring the hands; cover correctly exposed.',
            '5 秒，16:9。开场同一本修补过的旧书已经打开在台面上。固定的斜侧中景看到书、亚麻袖衣修复者的前臂和左侧窗边少量空间。双手轻轻合书一次，合上后停住；前封面和其右下角米色补布变得可见。保留旧痕，不要变成新书。书与双手是视觉中心，远后方只有少量普通工具。左侧晨间窗光斜向照入，由极少空气纸尘使很淡的光束可见，光向与实际窗户一致。没有浓雾、闪粉、烟和遮手粒子，书面曝光正常。'
        ),
        (
            '5 seconds, 16:9. The same book starts closed. Locked oblique medium-close view slightly above the wooden table, faces outside frame. '
            'The restorer with plain linen sleeves gently passes the book across the table into the waiting reader hands with gray wool cuffs; '
            'the reader receives it and BOTH people pause, hands still supporting it. One handover only; no handshake, re-opening or extra gesture. '
            'Keep the book and all four hands within the LEFT sixty percent of frame. '
            'Reserve roughly the RIGHT forty percent as calm clear pale wall and tabletop for a later Chinese title; no tools, moving figures or bright highlights there. '
            'Soft light continues from the left window, gentle even contrast in the title area. The cover patch stays in its original place.',
            '5 秒，16:9。同一本书开场合上。略高于木台面的固定斜侧中近景，脸在画外。穿素色亚麻袖衣的修复者沿台面轻轻把书交给灰色毛衣袖口读者等待的双手；读者接住后，双方停住，双手仍托住书。只交还一次，不握手、不重新开书、不增加手势。书和四只手都在画面左侧约六成区域。右侧约四成留作平静干净的浅墙与桌面，供之后添加中文片名；此处不要工具、移动人影或亮光斑。延续左侧窗光，文案区域对比柔和稳定，封面补布位置不变。'
        )
    ]
    shots = []
    for i, (source, content) in enumerate(zip(design['shots'], scenes)):
        en, zh = content
        prompt = en + ' ' + anchor_en + end_en
        shots.append(dict(id=source['id'], title=source['title'], type='i2v', model='Seedance 2.0',
                          resolution=1080, aspectRatio='16:9', generationDuration=10 if i == 1 else 5,
                          editDuration=source['duration'], nativeAudio=True, count=1,
                          estimatedCredits=240 if i == 1 else 120, referenceImages=['assets/generated/book-repair/reference/book-reference.png'],
                          referenceRole='book_identity_and_workshop_materials_not_first_frame',
                          prompt=prompt, promptZhTranslation=zh + anchor_zh + end_zh,
                          promptZhTranslationOfSha256=hashlib.sha256(prompt.encode('utf-8')).hexdigest(),
                          submittedLanguage='en', refIds=source['ruleIds'], designShotFile='app/studio-book-repair.json'))
    plan = dict(id='book-repair', title=design['title']['zh'], status='prepared_awaiting_parameter_confirmation',
                preparedAt='2026-10-22', executionSkill='chatart-skill',
                target=dict(duration=18, aspectRatio='16:9', resolution=1080),
                referenceImage=dict(provider='built-in image_gen', role='book identity and workshop materials; not a first frame',
                                    path='assets/generated/book-repair/reference/book-reference.png', status='generating'),
                shots=shots, estimatedCredits=sum(s['estimatedCredits'] for s in shots),
                costBasis='ChatArt estimate-cost 2026-10-22: 3 x 120 + 1 x 240; prior case service-reported costs exceeded estimate by 25%, actual deduction was unverified.',
                previousServiceRateProjectionCredits=750, accountDeductionVerified=False,
                assembly=dict(order=[s['id'] for s in shots], durations=[s['editDuration'] for s in shots],
                              transition='Straight cuts after readable actions; no graphic match or morph.',
                              endTitle='让故事，继续', titleMethod='Add in post-production in the actually verified right-side safe area.',
                              audio='Preserve native contact / room sound where suitable; short fades, no generated narration.'),
                executionNotes=['No paid video submission before parameter confirmation.',
                                'Use run; on timeout resume query with same task ID; never resubmit failures automatically.',
                                'Keep original design and submitted-language input separate; do not claim perfect geometry, contact or emotion without evidence.'])
    destination = HERE / 'book-repair-plan.json'
    if destination.exists():
        raise SystemExit('Plan already exists; do not overwrite an execution record.')
    destination.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Prepared 4-shot plan: 5 / 10 / 5 / 5 seconds; edit 18 seconds; estimate 600 credits. No videos submitted.')


if __name__ == '__main__':
    main()
