# -*- coding: utf-8 -*-
"""Guides de niche (EN) construits à partir des données vérifiées de caribbean/*.json."""
import json, os, sys, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_guides as B
ROOT = B.ROOT
cdir = os.path.join(ROOT, 'caribbean')
slugs = json.load(open(os.path.join(ROOT, 'tools', 'slugs.json')))
J = json.load(open(os.path.join(cdir, 'jamaica.json')))
CHK = 'Figures last checked on 4 October 2026 against the official sources; confirm the current amount with the authority before you pay.'
CTA_JM = ('Test your project with Jamaican rules', 'Free, no sign-up. Enter your sales and costs and get your taxes and take-home income.', '../../?c=JM#/test', 'Test my project in Jamaica')
REL = lambda t, p, d: (t, p, d)
R_JM_PAGE = REL('Starting a business in Jamaica', '../../jamaica/', 'taxes, registration and steps')
R_TAX = REL('Self-employed taxes in Jamaica', '../jamaica-self-employed-taxes/', 'income tax, NIS, NHT and Education Tax')
R_REG = REL('Cost to register a business in Jamaica', '../register-a-business-in-jamaica-cost/', 'business name or limited company')
R_GCT = REL('GCT registration in Jamaica', '../gct-registration-jamaica/', 'the threshold and the deadlines')
R_CMP = REL('Income tax across the Caribbean', '../caribbean-income-tax-compared/', 'tax-free amounts and rates side by side')
R_FIX = REL('Fixed costs vs variable costs', '../fixed-costs-vs-variable-costs/', 'and your break-even point')

B.en('jamaica-self-employed-taxes',
 title='Self-employed taxes in Jamaica (2026): income tax, NIS, NHT and Education Tax',
 desc='How much tax a self-employed person pays in Jamaica in 2026: the J$1,902,360 tax-free amount, 25% and 30% income tax, NIS, NHT, Education Tax, quarterly dates, and a worked example in J$.',
 h1='Self-employed taxes in Jamaica: what you pay in 2026',
 lead='If you work for yourself in Jamaica, you pay income tax on your profit plus three contributions: NIS, NHT and Education Tax. Here are the rates, the dates and a worked example, so you can plan before your first payment.',
 bullets=['Income tax: 25% on income from J$1,902,360 (the yearly tax-free amount) up to J$6,000,000, then 30%.', 'Contributions: NIS 6%, NHT 3%, Education Tax 2.25%.', 'You pay quarterly (March 15, June 15, September 15, December 15) and file your yearly income estimate (form S04A) by March 15.'],
 sections=[
  ('The rates', [['<strong>Income tax:</strong> 25% on income from J$1,902,360 up to J$6,000,000, then 30%. The first J$1,902,360 a year is tax-free.', '<strong>NIS (National Insurance Scheme), 6%:</strong> gives access to a pension and other benefits. It applies up to a yearly ceiling of J$5,000,000.', '<strong>NHT (National Housing Trust), 3%:</strong> helps contributors get housing loans.', '<strong>Education Tax, 2.25%:</strong> funds schools. It is calculated after the NIS amount is taken off.'], 'The tax-free amount rose to J$1,902,360 on 1 April 2026 and is set to rise again on 1 April 2027, according to the Tax Administration Jamaica (TAJ) schedule. For 2026 as a whole, the effective tax-free amount is slightly lower because the rise starts in April.']),
  ('A worked example', ['A sole trader sells J$400,000 a month. After the cost of goods and fixed costs, the profit before tax is J$2,280,000 for the year.', '<div class="scrollx"><table><tr><td>Sales for the year</td><td>J$4,800,000</td></tr><tr><td>Cost of goods and fixed costs</td><td>− J$2,520,000</td></tr><tr class="total"><td>Profit before tax</td><td>J$2,280,000</td></tr><tr><td>NIS (6%)</td><td>− J$136,800</td></tr><tr><td>NHT (3%)</td><td>− J$68,400</td></tr><tr><td>Education Tax (2.25%)</td><td>− J$48,222</td></tr><tr><td>Income tax</td><td>− J$60,210</td></tr><tr class="total"><td>Left for you, per year</td><td>J$1,966,368</td></tr><tr><td>Left for you, per month</td><td>J$163,864</td></tr></table></div>', 'This is a planning estimate. Your own result depends on your costs and on the deductions you can claim.']),
  ('When you pay and file', [['<strong>March 15, June 15, September 15 and December 15:</strong> pay your self-employed statutory payments (income tax, NIS, NHT and Education Tax).', '<strong>By March 15:</strong> file your income estimate for the year (form S04A). It sets the amount of your quarterly payments.']]),
  ('Planning tip', ['Set aside a share of each payment you receive in a separate account, so the quarterly dates do not catch you short. To see how much of your sales is really yours, work out your costs first: see <a href="../fixed-costs-vs-variable-costs/">fixed costs vs variable costs</a>.', CHK]),
 ],
 faq=[('How much tax does a self-employed person pay in Jamaica?', 'Income tax of 25% on income from J$1,902,360 up to J$6,000,000, then 30%, plus NIS 6%, NHT 3% and Education Tax 2.25%. In the example on this page, a profit of J$2,280,000 leaves about J$1,966,368 after all four.'),
      ('When do self-employed people pay tax in Jamaica?', 'Four times a year: March 15, June 15, September 15 and December 15. The yearly income estimate (form S04A) is due by March 15.'),
      ('Do I need a TRN to work for myself in Jamaica?', 'Yes. The Taxpayer Registration Number (TRN) identifies you to the tax office and is needed for almost every other registration step. You get it from Tax Administration Jamaica.')],
 related=[R_REG, R_GCT, R_JM_PAGE], cta=CTA_JM)

fees = {s['id']: s['feeLines'] for s in J['legalStatuses']}
B.en('register-a-business-in-jamaica-cost',
 title='How much does it cost to register a business in Jamaica? (2026)',
 desc='Registration costs in Jamaica: J$2,500 for a business name (valid 3 years) and about J$30,500 for a limited company at the Companies Office of Jamaica. Steps, documents and what each option means.',
 h1='How much does it cost to register a business in Jamaica?',
 lead='There are two common ways to start: a registered business name, which is the simplest, or a limited company, which costs more and has more paperwork but can limit your personal risk. Here is what each costs and what you need.',
 bullets=['Registered business name: J$2,500, valid for 3 years.', 'Limited company: about J$30,500 (J$27,000 registration, J$500 name search, J$3,000 name reservation).', 'You need a TRN (tax number) first. Registration is done at the Companies Office of Jamaica (COJ).'],
 sections=[
  ('Option 1: registered business name', ['You run the business as an individual, under your own name or a business name. For tax, you and the business are the same person. It is usually the simplest way to start.', '<div class="scrollx"><table><tr><td>Business name registration (valid 3 years)</td><td>J$2,500</td></tr></table></div>', 'What you need: your TRN, a valid ID and a business address in Jamaica. If you trade under any name other than your own full name, you must register it. Search the name at the COJ first.']),
  ('Option 2: limited company', ['The company is its own legal person, separate from you. It costs more to set up and has more paperwork, but it can limit your personal risk.', '<div class="scrollx"><table><tr><td>COJ registration</td><td>J$27,000</td></tr><tr><td>Name search</td><td>J$500</td></tr><tr><td>Name reservation</td><td>J$3,000</td></tr><tr class="total"><td>Total</td><td>J$30,500</td></tr></table></div>', 'What you need: a name reservation, articles of incorporation, a beneficial ownership return, a TRN for the directors and the ID of the principal director.']),
  ('The steps, in order', [['Get your TRN from Tax Administration Jamaica (TAJ).', 'Choose your name and check that it is free at the COJ.', 'Register with the Companies Office of Jamaica, online or in person. A business name is registered for three years, then renewed.', 'For a limited company, complete the Business Registration Form (BRF1), which also covers your tax and contribution registrations.', 'If you work for yourself, register with TAJ and file your yearly income estimate (form S04A) by March 15.']]),
  ('Which one should I choose?', ['If you start small and alone, the business name is cheaper and quicker. A company makes sense when you want to separate your personal assets from the business or take on partners. Ask the COJ or an accountant before deciding. These fees do not include professional help, such as a lawyer for the articles.', CHK]),
 ],
 faq=[('How much does it cost to register a business name in Jamaica?', 'J$2,500, valid for three years, at the Companies Office of Jamaica.'),
      ('How much does it cost to register a limited company in Jamaica?', 'About J$30,500 in official fees: J$27,000 for COJ registration, J$500 for the name search and J$3,000 for the name reservation. Lawyer or accountant fees are extra.'),
      ('Do I need a TRN before I register?', 'Yes. The TRN is needed for almost every step. Get it from Tax Administration Jamaica first.')],
 related=[R_TAX, R_GCT, R_JM_PAGE], cta=CTA_JM)

V = J['vat']
B.en('gct-registration-jamaica',
 title='When must a business register for GCT in Jamaica? Threshold and deadlines',
 desc='General Consumption Tax (GCT) in Jamaica: 15% rate, registration from J$15,000,000 in yearly sales, 21 days to register, and returns due by the 25th of the following month.',
 h1='When must a business register for GCT in Jamaica?',
 lead='General Consumption Tax (GCT) is Jamaica\'s sales tax, like VAT. Most small businesses start below the threshold and do not need to register yet. Here is the rate, the threshold and the deadlines.',
 bullets=['GCT rate: 15%.', 'Register from J$15,000,000 in yearly sales, within 21 days of crossing the threshold.', 'Returns are due by the 25th of the month after the period.'],
 sections=[
  ('The rule', ['GCT is charged at 15%. A business must register once its yearly sales reach J$15,000,000, and it must do so within 21 days of crossing the threshold. Below that level, registration is not required.']),
  ('What changes once you register', [['You add GCT to your prices and keep the money for the tax office. It is not income.', 'You file a return every month or every two months, due by the 25th of the month after the period.']]),
  ('Planning for it', ['If your sales are approaching J$15,000,000 a year, work out beforehand how it will change your prices and your cash. The tax you collect is held for the authority and must not be spent. See <a href="../fixed-costs-vs-variable-costs/">fixed costs vs variable costs</a> to check how your margins hold up.', CHK]),
 ],
 faq=[('What is the GCT registration threshold in Jamaica?', 'J$15,000,000 in yearly sales.'),
      ('How long do I have to register for GCT?', '21 days from the day you cross the threshold.'),
      ('When are GCT returns due in Jamaica?', 'By the 25th of the month after the period, filed every month or every two months.')],
 related=[R_TAX, R_REG, R_JM_PAGE], cta=CTA_JM)

rows = []
for x in json.load(open(os.path.join(cdir, 'countries.json')))['countries']:
    j = json.load(open(os.path.join(cdir, x['file']))); t = j.get('incomeTax') or {}
    if not t.get('verified') or not t.get('bracketText'): continue
    sl = slugs.get(x['id'])
    if not sl: continue
    sym = j['currency']['symbol'].strip() or j['currency']['code']
    al = t.get('allowance')
    rows.append('<tr><td><a href="../../%s/">%s</a></td><td>%s</td><td>%s</td></tr>' % (sl, html.escape(x['name']), (sym + format(al, ',')) if al else 'none or built into the rates', html.escape(t['bracketText'])))
B.en('caribbean-income-tax-compared',
 title='Income tax in the Caribbean compared: tax-free amounts and rates by country (2026)',
 desc='Personal income tax in the Caribbean side by side: the yearly tax-free amount and the main rates for Jamaica, Trinidad and Tobago, Guyana, Barbados, Saint Lucia and more, with a link to each country guide.',
 h1='Income tax in the Caribbean compared',
 lead='Personal income tax differs a lot across the Caribbean. This table puts the yearly tax-free amount and the main rates side by side for the countries we have checked, with a link to each country guide for the full picture.',
 bullets=['Rates and allowances are for personal income tax; contributions and sales taxes are on each country page.', 'Each amount is in the local currency of that country.', 'Several territories have no personal income tax or are not yet verified: see the country guides.'],
 sections=[
  ('The table', ['<div class="scrollx"><table><tr><th>Country</th><th>Tax-free amount per year</th><th>Rates</th></tr>' + ''.join(rows) + '</table></div>', 'These are the headline personal income tax rates for a self-employed person. Social contributions (such as NIS in Jamaica) and sales taxes come on top and are covered on each country page. Amounts change; the date each country was last checked is on its page.']),
  ('How to use this', ['Do not compare the amounts across countries directly: currencies and living costs differ. Use the table to see how steeply tax rises in each place, then open the country guide and run the free test with your own sales and costs.', CHK]),
 ],
 faq=[('Which Caribbean countries have no personal income tax?', 'Several territories do not charge personal income tax, and some are not yet verified here. Check the country guide for the one you are interested in.'),
      ('Is the tax-free amount the same as the standard deduction?', 'No. The tax-free amount is the part of your yearly income that is not taxed. Each country defines its own allowances and deductions: see its guide.'),
      ('Where can I see my own result?', 'Open the free test, choose your country, and enter your sales and costs. You get your taxes and your take-home income.')],
 related=[R_TAX, R_FIX], cta=('Run the numbers for your own country', 'Free, no sign-up. Pick your country, enter your sales and costs.', '../../', 'Open the free business test'))

if __name__ == '__main__':
    for key, g in list(B.G.items()):
        if g['lang'] == 'en' and key.split('/')[1] in ('jamaica-self-employed-taxes', 'register-a-business-in-jamaica-cost', 'gct-registration-jamaica', 'caribbean-income-tax-compared'):
            k = dict(g); lang = k.pop('lang'); slug = k.pop('slug'); print(B.build(lang, slug, **k))
