#!/usr/bin/env python3
"""Pa a Pa Caribbean: data watch.
Reads every country data file, then reports:
  1. data older than MAX_AGE_DAYS since its last verification,
  2. source URLs that no longer answer,
  3. figures still marked as provisional (toVerify),
  4. countries whose yearly review window opens this month.
Run locally:   python3 tools/check_data.py
Run by GitHub: .github/workflows/data-watch.yml (monthly, opens an Issue)."""
import json, os, sys, glob, datetime, urllib.request, urllib.error, ssl

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'caribbean')
MAX_AGE_DAYS = 150
REVIEW_WINDOWS = json.load(open(os.path.join(ROOT, 'maintenance.json'), encoding='utf-8'))['reviewWindows']
today = datetime.date.today()

def lists():
    out = []
    for lang, p in [('en', 'countries.json'), ('es', 'es/countries.json'), ('fr', 'fr/countries.json'), ('nl', 'nl/countries.json')]:
        base = os.path.dirname(os.path.join(ROOT, p))
        for c in json.load(open(os.path.join(ROOT, p), encoding='utf-8'))['countries']:
            out.append((lang, c['id'], os.path.join(base, c['file'])))
    return out

def alive(url):
    ctx = ssl.create_default_context()
    for method in ('HEAD', 'GET'):
        try:
            req = urllib.request.Request(url, method=method, headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 PaAPa-data-watch', 'Accept': 'text/html,application/pdf,*/*'})
            with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
                return r.status
        except urllib.error.HTTPError as e:
            if e.code in (403, 405, 429) and method == 'HEAD': continue
            return e.code
        except Exception as e:
            if method == 'GET': return str(type(e).__name__)
    return 'error'

old, dead, blocked, prov, windows = [], [], [], [], []
seen = set()
for lang, cid, path in lists():
    d = json.load(open(path, encoding='utf-8'))
    ver = datetime.date.fromisoformat(d['dataVerifiedOn'])
    age = (today - ver).days
    if age > MAX_AGE_DAYS: old.append((d['name'], lang, d['dataVerifiedOn'], age))
    for t in d.get('toVerify', []): prov.append((d['name'], lang, t))
    w = REVIEW_WINDOWS.get(cid)
    if w and today.month in w['months'] and cid not in {x[0] for x in windows}: windows.append((cid, d['name'], w['watch']))
    for s in d.get('sources', []) + [a for a in [d['authorities']['tax'], d['authorities']['registry']] if a.get('url')]:
        url = s.get('url')
        if url and url not in seen:
            seen.add(url)
            st = alive(url)
            if st in (401, 403, 429): blocked.append((d['name'], url, st))
            elif not (isinstance(st, int) and 200 <= st < 400): dead.append((d['name'], url, st))

lines = [f'# Data watch {today.isoformat()}', '']
lines += ['## 1. Review windows open this month', ''] + ([f'- **{n}**: {w}' for _, n, w in sorted(windows, key=lambda x: x[1])] or ['- none']) + ['']
lines += [f'## 2. Data not verified for more than {MAX_AGE_DAYS} days', ''] + ([f'- {n} ({l}): verified {v}, {a} days ago' for n, l, v, a in old] or ['- none']) + ['']
lines += ['## 3. Sources that did not answer', ''] + ([f'- {n}: {u} → {s}' for n, u, s in dead] or ['- none']) + ['']
lines += ['## 3b. Sources that block automatic checks (open them by hand when you review the country)', ''] + ([f'- {n}: {u}' for n, u, s in blocked[:40]] or ['- none']) + ['']
lines += ['## 4. Figures still provisional', ''] + ([f'- {n} ({l}): {t}' for n, l, t in prov] or ['- none']) + ['']
lines += ['---', 'Process: re-check the figures against the official source, update the country file, set `dataVerifiedOn`, run `node build_pages.js`, bump `VERSION` in `sw.js`, commit with a message starting "Data:", close this issue.']
rep = '\n'.join(lines)
print(rep)
if os.environ.get('GITHUB_OUTPUT'):
    open(os.environ['GITHUB_OUTPUT'], 'a').write('needs_action=%s\n' % ('true' if (old or dead or windows) else 'false'))
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data-watch-report.md'), 'w', encoding='utf-8').write(rep)
