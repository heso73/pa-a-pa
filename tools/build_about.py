# -*- coding: utf-8 -*-
"""Page « About » (EN) : qui construit Pa a Pa Caribbean, comment les chiffres sont vérifiés, contact."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_guides as B
B.DATE = '2026-11-10'
CTA = ('Test your project with Jamaican rules', 'Free, no sign-up. Enter your sales and costs and get your taxes and take-home income.', '../../?c=JM#/test', 'Test my project in Jamaica')
url = B.build('en', 'about-pa-a-pa-caribbean',
 title='About Pa a Pa Caribbean: a free business viability tool for 29 Caribbean countries',
 desc='Pa a Pa Caribbean is a free tool that helps people who want to start a business check their idea: costs, taxes and take-home income in 29 Caribbean countries and territories. Who builds it, how figures are checked, how to send a correction.',
 h1='About Pa a Pa Caribbean',
 lead='Pa a Pa Caribbean is a free tool for people who want to start a business. You enter your expected sales and costs, and you see your taxes, what you keep, and whether the idea can pay your bills. It is built by David Heso.',
 bullets=['Free, with no sign-up. Your answers stay on your device.', 'Covers 29 Caribbean countries and territories, in English, Spanish, French and Dutch.', 'Figures come from official sources and show the date they were last checked.'],
 sections=[
  ('Why it exists', ['Many people start a business without knowing what they will owe in tax and contributions, or how much they must sell to cover their costs. Those answers are scattered across government sites, and the rules change every year. Pa a Pa puts them in one place, in plain language.']),
  ('How the figures are checked', [['Rates and thresholds are taken from tax authorities, social security boards and official announcements, and from the PwC Worldwide Tax Summaries where the official page is unclear.', 'Each guide shows the date it was last checked and links to its sources.', 'You can see which countries are verified on the <a href="../../data-status/">data status page</a>, and what changed on the <a href="../../changelog/">changelog</a>.']]),
  ('What it is not', ['It is not tax, legal or accounting advice. The amounts are estimates for planning. Always confirm the exact figure with the tax authority or a qualified adviser before you pay or sign anything.']),
  ('How it is funded', ['The tool and the guides are free. Some links to partner services, such as business banking or accounting software, may pay a commission if you sign up, at no extra cost to you. Partners never change the figures or the order of the results.']),
  ('Send a correction', ['If you find a figure that looks wrong, write to <a href="mailto:contact@caribbeanmetadata.org">contact@caribbeanmetadata.org</a> with the page address and the source. Corrections from tax authorities, advisers and business support organisations are especially welcome, and checked figures are updated on the page.']),
 ],
 faq=[('Is Pa a Pa Caribbean free?', 'Yes. There is no sign-up and no charge. Some partner links may earn a commission, which does not change what you pay.'),
      ('Who is behind it?', 'It is built by David Heso, as an independent project.'),
      ('Where do the tax figures come from?', 'From tax authorities, social security boards and official announcements, with the date of the last check shown on each page.')],
 related=[('Self-employed tax calculator for Jamaica', '../self-employed-tax-calculator-jamaica/', 'enter your profit, see what you keep'), ('Starting a business in Jamaica', '../../jamaica/', 'taxes, registration and steps'), ('Income tax across the Caribbean', '../caribbean-income-tax-compared/', 'tax-free amounts and rates side by side')],
 cta=CTA)
def edit(path, fn):
    p = os.path.join(B.ROOT, path); s = open(p, encoding='utf-8').read(); n = fn(s)
    if n != s: open(p, 'w', encoding='utf-8').write(n)
edit('sitemap.xml', lambda s: s if url in s else s.replace('</urlset>', '  <url><loc>%s</loc><lastmod>2026-11-10</lastmod></url>\n</urlset>' % url))
edit('llms.txt', lambda s: s if url in s else s.rstrip('\n') + '\n- ' + url + '\n')
edit('caribbean/jamaica/index.html', lambda s: s if 'about-pa-a-pa-caribbean' in s else s.replace('</ul>', '<li><a href="../guides/about-pa-a-pa-caribbean/">About Pa a Pa Caribbean</a></li></ul>', 1) if False else s.replace('<li><a href="../guides/form-s04-jamaica/">Form S04 and quarterly payments</a></li>', '<li><a href="../guides/form-s04-jamaica/">Form S04 and quarterly payments</a></li><li><a href="../guides/about-pa-a-pa-caribbean/">About Pa a Pa Caribbean</a></li>', 1))
print(url)
