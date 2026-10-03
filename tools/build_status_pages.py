import json, os, datetime, html
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','caribbean')
B='https://heso73.github.io/pa-a-pa/caribbean/'
e=html.escape
SLUG=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'slugs.json')))
MW=json.load(open(os.path.join(ROOT,'maintenance.json'),encoding='utf-8'))['reviewWindows']
MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
rows=[]; seen=set()
for lang,p,pref in [('en','countries.json',''),('es','es/countries.json','es/'),('fr','fr/countries.json','fr/'),('nl','nl/countries.json','nl/')]:
    base=os.path.dirname(os.path.join(ROOT,p))
    for c in json.load(open(os.path.join(ROOT,p),encoding='utf-8'))['countries']:
        d=json.load(open(os.path.join(base,c['file']),encoding='utf-8'))
        key=(c['id'],lang)
        w=MW.get(c['id'],{'months':[],'watch':''})
        prov=d.get('toVerify',[])
        rows.append((d['name'],lang,d['dataVerifiedOn'],', '.join(MON[m-1] for m in w['months']),len(prov),B+pref+SLUG[c['id']]+'/', d['authorities']['tax']['name']))
rows.sort(key=lambda r:(r[0],r[1]))
tr=''.join(f'<tr><td><a href="{e(u)}">{e(n)}</a> <span class="muted small">({l})</span></td><td>{e(v)}</td><td>{e(win)}</td><td>{e(tax)}</td></tr>' for n,l,v,win,k,u,tax in rows)
head=lambda title,desc,canon: f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#0B3C49">
<title>{e(title)}</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{B}{canon}/"><meta name="robots" content="index,follow">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{B}{canon}/"><meta property="og:image" content="{B}icons/og-en.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="192x192" href="../icons/icon-192.png"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"><link rel="stylesheet" href="../styles.css"><script src="../../stats.js" defer></script></head>
<body><div class="wrap"><header class="topbar"><a class="brand" href="../" aria-label="Pa a Pa Caribbean"><svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="30" width="10" height="14" rx="3" fill="#1F7A8C"></rect><rect x="19" y="19" width="10" height="25" rx="3" fill="#0B3C49"></rect><rect x="34" y="6" width="10" height="38" rx="3" fill="#E8A33D"></rect></svg><span>Pa a Pa <small>Caribbean</small></span></a></header><main class="page">'''
tail='</main></div></body></html>\n'
os.makedirs(os.path.join(ROOT,'data-status'),exist_ok=True)
open(os.path.join(ROOT,'data-status','index.html'),'w',encoding='utf-8').write(head('How current is the data? Pa a Pa Caribbean data status','When each country’s tax data was last verified, which months it is re-checked, and where to confirm exact amounts.','data-status')+f'''<h1>Data status</h1>
<p class="lead">Every figure in Pa a Pa Caribbean is a planning estimate taken from the tax authority of each country or a reliable adviser source. This page shows when each country was last checked and in which months its rates usually change, so the data is re-checked on a fixed calendar.</p>
<table class="sum facts" style="width:100%"><tr><td><b>Country</b></td><td><b>Last verified</b></td><td><b>Re-checked in</b></td><td><b>Confirm amounts with</b></td></tr>{tr}</table>
<h2>How the data is kept current</h2><ul><li>A monthly automatic check flags data older than 150 days, sources that stop answering, and countries whose rates usually change that month.</li><li>Each country is re-read against its official source in its review months, then the date above is updated.</li><li>Figures that could not be confirmed in an official source are marked as provisional in the country guide.</li></ul>
<p class="muted small">Planning estimates, not tax or legal advice. See the <a href="../changelog/">changelog</a> for what changed and when.</p>'''+tail)
log=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'changelog.json'),encoding='utf-8'))
items=''.join(f'<h2>{e(x["date"])}: {e(x["title"])}</h2><p>{e(x["text"])}</p>' for x in log)
os.makedirs(os.path.join(ROOT,'changelog'),exist_ok=True)
open(os.path.join(ROOT,'changelog','index.html'),'w',encoding='utf-8').write(head('Changelog: Pa a Pa Caribbean updates','What changed in Pa a Pa Caribbean and when: new countries, languages and data updates.','changelog')+'<h1>Changelog</h1><p class="lead">New countries, new languages and data updates, newest first.</p>'+items+tail)
print(len(rows),'status rows;',len(log),'changelog entries')
