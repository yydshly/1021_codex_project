"""Publish the user-requested research archive without rewriting execution history."""
from pathlib import Path
from html import escape
import json
import shutil

APP = Path(__file__).resolve().parent
PROJECT = APP.parent


def export_archive(output):
    archive = json.loads((APP / 'archive-summary.json').read_text(encoding='utf-8'))
    library = json.loads((output / 'case-library.json').read_text(encoding='utf-8'))
    cases = {c['id']: c for c in library['cases']}
    if archive['status'] != 'archived_on_user_request' or archive['scope']['actualTopics'] != len(cases):
        raise ValueError('Archive must match the actual case library and user-requested state.')
    if archive['scope']['targetedRevisions'] != sum(len(c.get('revisions', [])) for c in cases.values()):
        raise ValueError('Archive revision count must not inflate topic count.')
    for action in archive['actions']:
        case = cases[action['caseId']]
        if not set(action['shotIds']).issubset({s['shotId'] for s in case['shotReviews']}):
            raise ValueError('Archive action has no actual shot evidence.')
        if action.get('revisionId') and action['revisionId'] not in {r['id'] for r in case.get('revisions', [])}:
            raise ValueError('Archive action names an unknown revision.')
    image = PROJECT / 'assets' / archive['provenance']['overviewImage']
    if not image.is_file():
        raise ValueError('The requested overview image must exist before publishing the archive.')
    shutil.copy2(image, output / image.name)
    dimensions = json.loads((APP / 'archive-infographic-provenance.json').read_text(encoding='utf-8'))['dimensions']
    shutil.copy2(APP / 'archive-summary.json', output / 'archive-summary.json')
    for frame in archive['comparison']:
        relative = Path(frame['image']).relative_to('generated/bike-kindness')
        if '..' in relative.parts or not (PROJECT / 'assets/generated/bike-kindness/published' / relative).is_file():
            raise ValueError('Archive comparison must use an existing actual frame.')
    e = escape
    def items(values):
        return '<ul>' + ''.join(f'<li>{e(v)}</li>' for v in values) + '</ul>'
    roles = ''.join(f'<article><h4>{e(r["name"])}</h4><p>{e(r["does"])}</p></article>' for r in archive['roles'])
    flow = ''.join(f'<li><b>{i:02}</b><span>{e(s)}</span></li>' for i, s in enumerate(archive['workflow'], 1))
    labels = {'observed_input_and_output_difference': '输入与输出对照', 'observed_execution_deviation': '实际执行偏差', 'plausible_contributor_not_isolated': '可能因素 · 尚未隔离验证', 'assistant_visual_interpretation': '助手画面判断 · 无观众验证', 'process_review': '制作与验收流程复核'}
    issues = ''.join(f'<article><span class="archive-evidence">{e(labels[i["evidenceLevel"]])}</span><h4>{e(i["title"])}</h4><p><strong>已观察：</strong>{e(i["fact"])}</p><p><strong>归因边界：</strong>{e(i["assessment"])}</p><p class="archive-next"><strong>重启后：</strong>{e(i["next"])}</p></article>' for i in archive['issues'])
    comparison = ''.join(f'<figure><a href="{e(f["image"])}" target="_blank" rel="noopener noreferrer"><img src="{e(f["image"])}" loading="lazy" alt="{e(f["label"])}：{e(f["note"])}"></a><figcaption><b>{e(f["label"])}</b> · {e(f["time"])}<p>{e(f["note"])}</p><a href="{e(f["reference"])}" target="_blank" rel="noopener noreferrer">对照当时静态参考 ↗</a></figcaption></figure>' for f in archive['comparison'])
    cards = []
    for case in cases.values():
        actions = [a for a in archive['actions'] if a['caseId'] == case['id']]
        latest = case.get('revisions', [])[-1] if case.get('revisions') else None
        summary = latest['summary'] if latest else case['review']['summary']
        target = latest['id'] if latest else case['id']
        cards.append(f'<article><a href="#experience-{e(target)}"><img loading="lazy" src="{e(case.get("latestResult", case["result"])["poster"])}" alt="{e(case["title"])}实际成片画面"><div><span>{case["result"]["duration"]}秒 · 一套题材{" · 含两镜返修" if latest else ""}</span><h4>《{e(case["title"])}》 ↗</h4><p>{e(" · ".join(a["name"] for a in actions))}</p><small>{e(summary)}</small></div></a></article>')
    rows = ''.join(f'<tr><th scope="row">{e(a["name"])}<small>{e(a["kind"])}</small></th><td>{e(a["state"])}<p>{e(a["observation"])}</p></td><td><a href="#experience-{e(a.get("revisionId", a["caseId"]))}">{e(cases[a["caseId"]]["title"])} ↗</a><small>{e(" / ".join(a["shotIds"]))}{" + " + e(a["revisionId"]) if a.get("revisionId") else ""}</small></td></tr>' for a in archive['actions'])
    extensions = ''.join(f'<article><span>待按需扩展 · 尚未实现</span><h4>{e(x["name"])}</h4><p>{e(x["value"])}</p></article>' for x in archive['extensions'])
    publication = archive['publicationSummary']
    technical = ''.join(f'<li><strong>{e(x["name"])}</strong><p>{e(x["current"])}</p><small>{e(x["boundary"])}</small></li>' for x in publication['technicalAssets'])
    scenarios = ''.join(f'<li><strong>{e(x["name"])}</strong><p>{e(x["use"])}</p></li>' for x in publication['futureScenarios'])
    summary_html = f'<section id="library-understanding" aria-labelledby="library-understanding-title"><h3 id="library-understanding-title">这个库能做什么，又能留下什么？</h3><div class="archive-summary-grid"><article><span>现在能用</span><h4>能力与实际效果</h4>{items(publication["capabilities"])}</article><article><span>已经形成方法与数据结构</span><h4>可沉淀的技术</h4><ul>{technical}</ul></article><article><span>后续按需扩展，尚未做成通用工具</span><h4>可扩展的使用场景</h4><ul>{scenarios}</ul></article></div></section>'
    html = f'''<section id="archive" class="archive-section" aria-labelledby="archive-title">
      <div class="section-heading"><div><div class="eyebrow">RESEARCH ARCHIVE · {e(archive['recordedAt'])}</div><h2 id="archive-title">{e(archive['title'])}</h2></div><span class="archive-badge">暂时归档 · 按需重启</span></div>
      <p class="archive-lead">{e(archive['positioning'])}</p><p class="archive-muted">{e(archive['archiveReason'])}</p>
      <div class="archive-downloads"><a class="button primary" href="{e(image.name)}" download>下载一张图总览 ↓</a><a class="button" href="archive-summary.json" download>下载归档与动作索引 JSON ↓</a><a class="text-link" href="#archive-issues">看本轮问题与归因 ↓</a><a class="text-link" href="#archive-actions">看已探索动作 ↓</a></div>
      <figure class="archive-overview"><a href="{e(image.name)}" target="_blank" rel="noopener noreferrer"><img src="{e(image.name)}" width="{dimensions['width']}" height="{dimensions['height']}" alt="视频创作动作素材库总览：情绪需要驱动动作选择，语言模型设计双语提示词，视频模型生成，复盘回库；含四个实测题材、价值与后续扩展"></a><figcaption>AI生成的中文说明图 · 点击查看原图；以下文字与JSON保留准确内容。</figcaption></figure>
      <p class="archive-boundary">{e(archive['boundary'])}</p>
      {summary_html}
      <h3>情绪需要决定动作，模型负责判断和创作。</h3><ol class="archive-flow">{flow}</ol><div class="archive-roles">{roles}</div>
      <div class="archive-value"><h3>现阶段的价值</h3>{items(archive['values'])}</div>
      <section id="archive-issues" aria-labelledby="archive-issues-title"><div class="section-heading"><div><div class="eyebrow">WHAT WENT WRONG</div><h3 id="archive-issues-title">问题在哪里，哪些原因能确认？</h3></div></div><p class="archive-muted">已写明而未落实的约束属于本次执行偏差；输入素材与设计也有问题。当前没有证据给两者分配责任百分比，不能保证改提示词或换模型就会解决。</p><div class="archive-issues">{issues}</div><div class="archive-comparison">{comparison}</div><p class="archive-boundary">后续复核补充：此前“基本可读”主要指动作顺序能够辨认，不等于物体结构、自然握持和整片可信度已经合格。助手的参考制作与验收也有责任。原设计与首版历史均保留。</p></section>
      <section id="archive-actions" aria-labelledby="archive-actions-title"><div class="section-heading"><div><div class="eyebrow">ACTIONS WE EXPLORED</div><h3 id="archive-actions-title">四个题材，探索过哪些动作与表达？</h3></div></div><p class="archive-muted">以下是动作和表达的观察条目，不是独立实验数，也不是稳定能力认证。旧书两镜返修仍属于同一题材。</p><div class="archive-cases">{''.join(cards)}</div><details class="archive-table"><summary>展开{len(archive['actions'])}项动作／表达观察与证据入口</summary><div><table><thead><tr><th>探索内容</th><th>实际观察与边界</th><th>案例及原镜头</th></tr></thead><tbody>{rows}</tbody></table></div></details></section>
      <section id="archive-next"><h3>后期可以怎样扩展？</h3><div class="archive-extensions">{extensions}</div></section>
      <details class="archive-open"><summary>尚未解决与未验证的事项</summary>{items(archive['unresolved'])}</details>
      <details id="archive-restart" class="archive-open"><summary>以后按需重启，从这里继续</summary><ol>{''.join(f'<li>{e(v)}</li>' for v in archive['restart'])}</ol><p><a class="text-link" href="model-guide.md" download>下载模型创作指引 ↓</a> · <a class="text-link" href="#direct">进入保留的创作工作台 →</a></p></details>
    </section>'''
    print(f'Published research archive: {len(cases)} topics, {len(archive["actions"])} action/expression observations.')
    return html
