"""Record returned service cost/URL after successful downloads, never resubmit."""
import json
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent


def main():
    plan_path = HERE / 'book-repair-r2-plan.json'
    plan = json.loads(plan_path.read_text(encoding='utf-8'))
    cost = 0
    for shot in plan['shots']:
        path = HERE / f'{shot["id"]}-execution.json'
        state = json.loads(path.read_text(encoding='utf-8'))
        if state['status'] != 'completed' or not state.get('actualMedia'):
            raise ValueError('Inspect a completed source before finalizing.')
        log = (HERE / f'{shot["id"]}-progress.log').read_text(encoding='utf-8')
        returned_cost = re.search(r'status: 1\s+cost: ([\d.]+) credits', log)
        url = re.search(r'video_url:(https://\S+)', log)
        if not returned_cost or not url:
            raise ValueError('Expected returned cost and media URL.')
        state.update(reportedCredits=float(returned_cost[1]), sourceUrl=url[1])
        cost += state['reportedCredits']
        path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    plan.update(status='completed', completedAt='2026-10-22', serviceReportedCredits=cost)
    plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Two measured tasks complete; returned service cost {cost:g} credits (not a verified deduction).')


if __name__ == '__main__':
    main()
