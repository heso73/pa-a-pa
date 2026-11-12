# -*- coding: utf-8 -*-
"""6 pages EN : salaire minimum, calculateur PAYE et calculateur TVA pour Trinité-et-Tobago et la Barbade.
Usage (depuis la racine du dépôt) : python3 tools/build_tt_bb_pages.py
Ne génère que ces 6 pages (n'écrase pas les pages Jamaïque). Idempotent pour sitemap.xml, llms.txt et les pages pays.
Sources : voir CHK_TT / CHK_BB et les phrases de source sur chaque page."""
import os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_guides as B

B.DATE = '2026-11-12'
ROOT = B.ROOT
B.G = {}

CHK_TT = ('Figures last checked on 12 November 2026 against the Ministry of Finance, the Inland Revenue Division (IRD), '
          'the National Insurance Board (NIBTT), the PwC Worldwide Tax Summaries and the 2027 Budget commentaries. '
          'Confirm the current amount with the IRD or your payroll provider before you pay.')
CHK_BB = ('Figures last checked on 12 November 2026 against the Barbados Revenue Authority (BRA), the National Insurance Office, '
          'the Ministry of Labour notice and the PwC Worldwide Tax Summaries. '
          'Confirm the current amount with the BRA or your payroll provider before you pay.')
CTA_TT = ('Test your project with Trinidad and Tobago rules', 'Free, no sign-up. Enter your sales and costs and get your taxes and take-home income.', '../../?c=TT#/test', 'Test my project in Trinidad and Tobago')
CTA_BB = ('Test your project with Barbados rules', 'Free, no sign-up. Enter your sales and costs and get your taxes and take-home income.', '../../?c=BB#/test', 'Test my project in Barbados')

def money(sym, n, d=0):
    return sym + (format(int(n + 0.5), ',') if d == 0 else format(round(n + 1e-9, d), ',.%df' % d))

tt = lambda n, d=0: money('TT$', n, d)
bb = lambda n, d=0: money('BDS$', n, d)

R = lambda t, s, d: (t, '../%s/' % s, d)

CALC_CSS = ('<style>.calc{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin:20px 0}'
            '.calc label{display:block;font-weight:600;margin:12px 0 4px}'
            '.calc input,.calc select{width:100%;font:inherit;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}'
            '.calc table{width:100%;border-collapse:collapse;margin-top:14px}.calc td{padding:7px 4px;border-bottom:1px solid var(--line)}'
            '.calc td:last-child{text-align:right;font-variant-numeric:tabular-nums}.calc tr.sum td{font-weight:700;border-bottom:0}'
            '.calc .note{color:var(--muted);font-size:.92rem;margin-top:10px}</style>')

def fmt_js(sym):
    return ("function m(n,d){return '%s'+n.toLocaleString('en-US',{minimumFractionDigits:d||0,maximumFractionDigits:d||0})}"
            "function num(id){var v=parseFloat(document.getElementById(id).value);return isNaN(v)||v<0?0:v}") % sym

# ======================================================================= Trinidad et Tobago : règles
TT_MW = 20.50                       # TT$ l'heure depuis le 1er janvier 2024
TT_OT = TT_MW * 1.5
TT_ALLOW = 90000                    # abattement personnel annuel
TT_NIS_CEIL = 163200                # plafond annuel (13 600 par mois)
TT_NIS_R = {'2026': 0.054, '2027': 0.064}   # part salarié : 16,2 % puis 19,2 % au total, un tiers salarié

def tt_emp(g, r=0.054):
    """g = salaire brut mensuel. NIS salarié (plafond 13 600/mois), Health Surcharge, PAYE (25 % / 30 %)."""
    nis = min(g, TT_NIS_CEIL / 12) * r
    wk = g * 12 / 52
    hs = (8.25 if wk > 109 else 4.80) * 52 / 12 if g > 0 else 0
    chg = max(g * 12 - nis * 12 - TT_ALLOW, 0)
    tax = (0.25 * min(chg, 1000000) + 0.30 * max(chg - 1000000, 0)) / 12
    return nis, hs, tax, g - nis - hs - tax

TT_MW_M = TT_MW * 40 * 52 / 12
_tmw = tt_emp(TT_MW_M)

CALC_TT_MW = CALC_CSS + '''<div class="calc" id="calc-mw"><strong>Calculator: pay at the minimum wage</strong>
<label for="m-reg">Regular hours in the week (up to 40)</label><input id="m-reg" type="number" inputmode="numeric" min="0" max="40" step="1" value="40">
<label for="m-ot">Overtime hours in the week</label><input id="m-ot" type="number" inputmode="numeric" min="0" step="1" value="0">
<table><tr><td>Regular pay (TT$20.50 an hour)</td><td id="m-a"></td></tr><tr><td>Overtime pay (TT$30.75 an hour)</td><td id="m-b"></td></tr><tr class="sum"><td>Gross pay for the week</td><td id="m-t"></td></tr><tr class="sum"><td>Gross pay for the month (x 52 / 12)</td><td id="m-m"></td></tr></table>
<p class="note">Minimum rate in force since 1 January 2024. Overtime at time and a half is the usual rule: check your case with the Ministry of Labour. Estimate, not payroll advice.</p></div>
<script>(function(){''' + fmt_js('TT$') + '''function run(){var r=Math.min(num('m-reg'),40),o=num('m-ot');var a=r*20.5,b=o*30.75;
document.getElementById('m-a').textContent=m(a,2);document.getElementById('m-b').textContent=m(b,2);document.getElementById('m-t').textContent=m(a+b,2);document.getElementById('m-m').textContent=m((a+b)*52/12,2)}
['m-reg','m-ot'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>'''

CALC_TT_PAYE = CALC_CSS + '''<div class="calc" id="calc-paye"><strong>Calculator: PAYE and take-home pay</strong>
<label for="p-gross">Gross pay for one pay period (TT$)</label><input id="p-gross" type="number" inputmode="numeric" min="0" step="100" value="10000">
<label for="p-freq">Paid</label><select id="p-freq"><option value="52">Weekly</option><option value="26">Fortnightly</option><option value="12" selected>Monthly</option></select>
<label for="p-rate">National Insurance rate</label><select id="p-rate"><option value="0.054">2026: 16.2% in total, employee 5.4%</option><option value="0.064">From 4 January 2027: 19.2% in total, employee 6.4%</option></select>
<table><tr><td>Tax-free allowance for this period</td><td id="p-thr"></td></tr><tr><td>National Insurance (employee share)</td><td id="p-nis"></td></tr><tr><td>Health Surcharge</td><td id="p-hs"></td></tr><tr><td>Income tax (PAYE)</td><td id="p-paye"></td></tr><tr class="sum"><td>Total deductions</td><td id="p-ded"></td></tr><tr class="sum"><td>Take-home pay for the period</td><td id="p-net"></td></tr></table>
<p class="note">Estimate for one employer, with the TT$90,000 personal allowance and no other deduction. National Insurance is really set by earnings class, so the amount can differ by a few dollars. Not payroll or tax advice: confirm with the IRD or your payroll provider.</p></div>
<script>(function(){''' + fmt_js('TT$') + '''function run(){var g=num('p-gross'),f=parseFloat(document.getElementById('p-freq').value),r=parseFloat(document.getElementById('p-rate').value);
var nis=Math.min(g,163200/f)*r,hs=g>0?((g*f/52>109?8.25:4.80)*52/f):0,chg=Math.max(g*f-nis*f-90000,0),ta=0.25*Math.min(chg,1000000)+0.30*Math.max(chg-1000000,0),tax=ta/f,ded=nis+hs+tax;
document.getElementById('p-thr').textContent=m(90000/f,2);document.getElementById('p-nis').textContent=m(nis,2);document.getElementById('p-hs').textContent=m(hs,2);document.getElementById('p-paye').textContent=m(tax,2);document.getElementById('p-ded').textContent=m(ded,2);document.getElementById('p-net').textContent=m(g-ded,2)}
['p-gross','p-freq','p-rate'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>'''

CALC_TT_VAT = CALC_CSS + '''<div class="calc" id="calc-vat"><strong>Calculator: add or remove VAT (12.5%)</strong>
<label for="v-amt">Amount (TT$)</label><input id="v-amt" type="number" inputmode="numeric" min="0" step="10" value="1000">
<label for="v-mode">This amount is</label><select id="v-mode"><option value="ex">Before VAT (add 12.5%)</option><option value="in">With VAT included (take 12.5% out)</option></select>
<table><tr><td>Price before VAT</td><td id="v-ex"></td></tr><tr><td>VAT (12.5%)</td><td id="v-tax"></td></tr><tr class="sum"><td>Price with VAT</td><td id="v-in"></td></tr></table>
<p class="note">Standard rate of 12.5%. Some goods and services are zero-rated or exempt: check with the Inland Revenue Division (IRD). Estimate, not tax advice.</p></div>
<script>(function(){''' + fmt_js('TT$') + '''function run(){var a=num('v-amt'),md=document.getElementById('v-mode').value;var ex=md==='ex'?a:a/1.125,inc=md==='ex'?a*1.125:a;
document.getElementById('v-ex').textContent=m(ex,2);document.getElementById('v-tax').textContent=m(inc-ex,2);document.getElementById('v-in').textContent=m(inc,2)}
['v-amt','v-mode'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>'''

def tt_table(rate=0.054):
    rows = ''
    for g in [3553.33, 5000, 7500, 10000, 15000, 20000, 30000, 50000]:
        nis, hs, tax, net = tt_emp(g, rate)
        rows += '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % (tt(g), tt(nis + hs + tax), tt(tax), tt(net))
    return ('<div class="scrollx"><table><tr><th>Gross per month</th><th>Total deductions</th><th>Of which income tax</th><th>Take-home per month</th></tr>%s</table></div>' % rows)

TT_MW_TABLE = ('<div class="scrollx"><table><tr><th>Item</th><th>Since 1 January 2024</th></tr>'
               '<tr><td>Per hour</td><td>TT$20.50</td></tr><tr><td>Overtime per hour (time and a half)</td><td>TT$30.75</td></tr>'
               '<tr><td>Per day (8 hours)</td><td>TT$164.00</td></tr><tr><td>Per 40-hour week</td><td>TT$820.00</td></tr>'
               '<tr><td>Per month (52 weeks / 12)</td><td>%s</td></tr><tr><td>Per year (52 weeks)</td><td>TT$42,640</td></tr></table></div>' % tt(TT_MW_M, 2))
TT_MW_HIST = ('<div class="scrollx"><table><tr><th>In force from</th><th>Per hour</th></tr>'
              '<tr><td>Before 1 January 2024</td><td>TT$17.50</td></tr><tr><td>1 January 2024</td><td>TT$20.50</td></tr></table></div>')

R_TT_MW = R('Minimum wage in Trinidad and Tobago 2026', 'trinidad-and-tobago-minimum-wage-2026', 'TT$20.50 an hour and what it means per month')
R_TT_PAYE = R('PAYE calculator for Trinidad and Tobago', 'paye-calculator-trinidad-and-tobago', 'income tax, National Insurance and Health Surcharge')
R_TT_VAT = R('VAT calculator for Trinidad and Tobago', 'vat-calculator-trinidad-and-tobago', 'add or remove 12.5% VAT from a price')
R_TT_HOME = ('Starting a business in Trinidad and Tobago', '../../trinidad-and-tobago/', 'taxes, registration and the steps')

P = []
def page(slug, **k): P.append((slug, k))

page('trinidad-and-tobago-minimum-wage-2026',
     title='Minimum wage in Trinidad and Tobago 2026: TT$20.50 an hour, weekly and monthly pay',
     desc='The national minimum wage in Trinidad and Tobago is TT$20.50 an hour: TT$820 a week, about TT$3,553 a month. Overtime rate, calculator and what a minimum-wage worker takes home.',
     h1='Minimum wage in Trinidad and Tobago in 2026',
     lead='The national minimum wage in Trinidad and Tobago is TT$20.50 an hour. Here is what that is per week and per month, the overtime rate, and what a minimum-wage worker takes home after National Insurance and the Health Surcharge.',
     bullets=['TT$20.50 an hour since 1 January 2024, up from TT$17.50.', 'TT$820 for a 40-hour week and about %s a month before deductions.' % tt(TT_MW_M),
              'No income tax is due at this level, because the pay is below the TT$90,000 personal allowance. About %s a month reaches the worker.' % tt(_tmw[3])],
     sections=[('The rates', [TT_MW_TABLE, 'The rate comes from the Minimum Wages (Amendment) Order 2023 (Legal Notice No. 390 of 2023), as listed by WageIndicator. It applies to every sector. The 2027 Budget presented on 12 October 2026 did not announce a new national rate in the commentaries we read; if the Minimum Wages Board changes it, this page will be updated.']),
               ('Calculate a week of pay', [CALC_TT_MW]),
               ('How it changed', [TT_MW_HIST]),
               ('What a minimum-wage worker takes home', ['A worker paid TT$20.50 for 40 hours a week earns about %s a month. That is below the personal allowance of TT$90,000 a year, so no PAYE is due. The worker still pays National Insurance (about %s, at the 2026 employee share of 5.4%%) and the Health Surcharge (about %s, TT$8.25 a week). About %s a month is left.' % (tt(TT_MW_M, 2), tt(_tmw[0], 2), tt(_tmw[1], 2), tt(_tmw[3], 2)),
                                                         'For another salary, use the <a href="../paye-calculator-trinidad-and-tobago/">PAYE calculator for Trinidad and Tobago</a>. ' + CHK_TT])],
     faq=[('What is the minimum wage in Trinidad and Tobago in 2026?', 'TT$20.50 an hour, in force since 1 January 2024. It is the same in every sector.'),
          ('How much is the minimum wage per month in Trinidad and Tobago?', 'About %s a month before deductions, for 40 hours a week over 52 weeks divided by 12.' % tt(TT_MW_M, 2)),
          ('What is the overtime rate?', 'Time and a half is the usual rule, which is TT$30.75 an hour at the minimum wage. Confirm your case with the Ministry of Labour.'),
          ('Does a minimum-wage worker pay income tax?', 'No. The yearly pay of TT$42,640 is below the TT$90,000 personal allowance. The worker still pays National Insurance and the Health Surcharge.')],
     related=[R_TT_PAYE, R_TT_VAT, R_TT_HOME], cta=CTA_TT)

page('paye-calculator-trinidad-and-tobago',
     title='PAYE calculator for Trinidad and Tobago (2026): income tax, NIS and Health Surcharge',
     desc='Free PAYE calculator for Trinidad and Tobago: enter your weekly, fortnightly or monthly pay and see income tax, National Insurance, the Health Surcharge and your take-home pay. Personal allowance TT$90,000.',
     h1='PAYE calculator for Trinidad and Tobago',
     lead='PAYE is the income tax your employer takes from each pay. Enter your gross pay for one period and see the income tax, your National Insurance, the Health Surcharge and what reaches your bank account.',
     bullets=['Income tax: 25% on chargeable income up to TT$1,000,000 a year, then 30%, after a TT$90,000 personal allowance.', 'National Insurance: 16.2% in total in 2026, of which the employee pays 5.4% up to TT$13,600 a month. It rises to 19.2% (employee 6.4%) from 4 January 2027.', 'Health Surcharge: TT$8.25 a week (TT$4.80 for the lowest earners).'],
     sections=[('The calculator', [CALC_TT_PAYE]),
               ('Take-home pay at different salaries', [tt_table(), 'Monthly pay, 2026 National Insurance rate, one employer and no other income.']),
               ('How the deductions are worked out', ['<strong>Income tax</strong>: your yearly pay minus National Insurance minus the TT$90,000 allowance is your chargeable income. 25% applies up to TT$1,000,000 and 30% above. The 2027 Budget kept the allowance at TT$90,000 for most people and raised it to TT$102,000 for qualifying pensioners.',
                                                      '<strong>National Insurance</strong> is set by earnings class, with a ceiling of TT$13,600 a month. The calculator uses the employee share of the combined rate, which is a close estimate. <strong>Health Surcharge</strong> is TT$8.25 a week when you earn more than TT$109 a week, otherwise TT$4.80.',
                                                      'The employer pays its own National Insurance on top of your salary. ' + CHK_TT])],
     faq=[('What is the income tax rate in Trinidad and Tobago?', '25% on chargeable income up to TT$1,000,000 a year and 30% above, after a personal allowance of TT$90,000.'),
          ('What is the National Insurance rate in Trinidad and Tobago in 2026?', '16.2% of insurable earnings since 5 January 2026, split about two thirds employer (10.8%) and one third employee (5.4%). The ceiling is TT$13,600 a month. It rises to 19.2% from 4 January 2027.'),
          ('How much is the Health Surcharge?', 'TT$8.25 a week for employees earning more than TT$109 a week (more than TT$469.99 a month), and TT$4.80 a week for others, according to the Inland Revenue Division.'),
          ('Is this calculator payroll advice?', 'No. It is an estimate for planning. Confirm the exact amounts with the IRD or your payroll provider.')],
     related=[R_TT_MW, R_TT_VAT, R_TT_HOME], cta=CTA_TT)

page('vat-calculator-trinidad-and-tobago',
     title='VAT calculator for Trinidad and Tobago: add or remove 12.5% VAT',
     desc='Free VAT calculator for Trinidad and Tobago: add 12.5% VAT to a price or take it out of a VAT-inclusive price. Registration threshold TT$500,000 in twelve months and what changes in 2027.',
     h1='VAT calculator for Trinidad and Tobago',
     lead='Value Added Tax (VAT) in Trinidad and Tobago is 12.5%. Enter an amount to add the VAT to a price, or to find the price before VAT inside a total.',
     bullets=['Standard VAT rate: 12.5%.', 'You must register if you sell TT$500,000 or more in a twelve-month period, or expect to. Registration is free.', 'Digital services from abroad become subject to 12.5% VAT from 1 March 2027 (2027 Budget proposal).'],
     sections=[('The calculator', [CALC_TT_VAT]),
               ('How it works', ['To add VAT, multiply the price by 1.125. To take VAT out of a total, divide it by 1.125. On TT$1,125 the VAT is TT$125 and the price before VAT is TT$1,000.',
                                 'Most small businesses start below the registration threshold and do not charge VAT yet. The Ministry of Finance says individuals and businesses must register when they sell TT$500,000 or more in twelve months, or forecast that. Registered businesses file VAT returns and pay the Inland Revenue Division; your filing period is set when you register.']),
               ('What is changing', ['The 2025 Budget removed VAT from a wide range of basic food items from 17 October 2025 and announced a review of VAT with a possible move to a sales tax; no date has been set. The 2027 Budget proposes VAT on digital and remote services supplied by non-resident providers from 1 March 2027. ' + CHK_TT]),
               ('Remember', ['Some goods and services are zero-rated or exempt, so 12.5% does not apply to everything. Check your item with the IRD before you charge or claim VAT.'])],
     faq=[('What is the VAT rate in Trinidad and Tobago?', '12.5%, according to the Ministry of Finance.'),
          ('How do I take VAT out of a price?', 'Divide the VAT-inclusive total by 1.125. The difference is the VAT.'),
          ('When must a business register for VAT in Trinidad and Tobago?', 'When it sells TT$500,000 or more in a twelve-month period, or forecasts sales of that amount. Registration is free.'),
          ('Will VAT be replaced by a sales tax?', 'The government has said it is reviewing the VAT system with a possible move to a sales tax, but no date or rate has been announced.')],
     related=[R_TT_MW, R_TT_PAYE, R_TT_HOME], cta=CTA_TT)

# ======================================================================= Barbade : règles
BB_MW = 10.71                       # BDS$ l'heure depuis le 21 janvier 2026
BB_OT = BB_MW * 1.5
BB_ALLOW = 25000
BB_NIS_CEIL_M = 5360                # plafond mensuel 2026

def bb_emp(g):
    """g = salaire brut mensuel. NIS 11 % (plafond 5 360/mois), fonds de résilience 0,25 % du brut, impôt 11,5 % / 27,5 % après abattement de 25 000 (NIS non déductible, BRA)."""
    nis = min(g, BB_NIS_CEIL_M) * 0.11
    rr = g * 0.0025
    taxable = max(g * 12 - BB_ALLOW, 0)
    tax = (0.115 * min(taxable, 50000) + 0.275 * max(taxable - 50000, 0)) / 12
    return nis, rr, tax, g - nis - rr - tax

BB_MW_M = BB_MW * 40 * 52 / 12
_bmw = bb_emp(BB_MW_M)

CALC_BB_MW = CALC_CSS + '''<div class="calc" id="calc-mw"><strong>Calculator: pay at the minimum wage</strong>
<label for="m-reg">Regular hours in the week (up to 40)</label><input id="m-reg" type="number" inputmode="numeric" min="0" max="40" step="1" value="40">
<label for="m-ot">Overtime hours in the week</label><input id="m-ot" type="number" inputmode="numeric" min="0" step="1" value="0">
<table><tr><td>Regular pay (BDS$10.71 an hour)</td><td id="m-a"></td></tr><tr><td>Overtime pay (150%, BDS$16.07 an hour)</td><td id="m-b"></td></tr><tr class="sum"><td>Gross pay for the week</td><td id="m-t"></td></tr><tr class="sum"><td>Gross pay for the month (x 52 / 12)</td><td id="m-m"></td></tr></table>
<p class="note">General national minimum wage from 21 January 2026. Security guards have a higher rate of BDS$11.66. Estimate, not payroll advice.</p></div>
<script>(function(){''' + fmt_js('BDS$') + '''function run(){var r=Math.min(num('m-reg'),40),o=num('m-ot');var a=r*10.71,b=o*10.71*1.5;
document.getElementById('m-a').textContent=m(a,2);document.getElementById('m-b').textContent=m(b,2);document.getElementById('m-t').textContent=m(a+b,2);document.getElementById('m-m').textContent=m((a+b)*52/12,2)}
['m-reg','m-ot'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>'''

CALC_BB_PAYE = CALC_CSS + '''<div class="calc" id="calc-paye"><strong>Calculator: PAYE and take-home pay</strong>
<label for="p-gross">Gross pay for one pay period (BDS$)</label><input id="p-gross" type="number" inputmode="numeric" min="0" step="50" value="5000">
<label for="p-freq">Paid</label><select id="p-freq"><option value="52">Weekly</option><option value="26">Fortnightly</option><option value="12" selected>Monthly</option></select>
<table><tr><td>Tax-free allowance for this period</td><td id="p-thr"></td></tr><tr><td>National Insurance (employee, 11%)</td><td id="p-nis"></td></tr><tr><td>Resilience and Regeneration Fund (0.25%)</td><td id="p-rr"></td></tr><tr><td>Income tax (PAYE)</td><td id="p-paye"></td></tr><tr class="sum"><td>Total deductions</td><td id="p-ded"></td></tr><tr class="sum"><td>Take-home pay for the period</td><td id="p-net"></td></tr></table>
<p class="note">2026 rates, one employer, BDS$25,000 personal allowance and no other allowance or credit. Not payroll or tax advice: confirm with the BRA or your payroll provider.</p></div>
<script>(function(){''' + fmt_js('BDS$') + '''function run(){var g=num('p-gross'),f=parseFloat(document.getElementById('p-freq').value);
var ceil=f===12?5360:(f===52?1238:2476),nis=Math.min(g,ceil)*0.11,rr=g*0.0025,tb=Math.max(g*f-25000,0),tax=(0.115*Math.min(tb,50000)+0.275*Math.max(tb-50000,0))/f,ded=nis+rr+tax;
document.getElementById('p-thr').textContent=m(25000/f,2);document.getElementById('p-nis').textContent=m(nis,2);document.getElementById('p-rr').textContent=m(rr,2);document.getElementById('p-paye').textContent=m(tax,2);document.getElementById('p-ded').textContent=m(ded,2);document.getElementById('p-net').textContent=m(g-ded,2)}
['p-gross','p-freq'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>'''

CALC_BB_VAT = CALC_CSS + '''<div class="calc" id="calc-vat"><strong>Calculator: add or remove VAT (17.5%)</strong>
<label for="v-amt">Amount (BDS$)</label><input id="v-amt" type="number" inputmode="numeric" min="0" step="10" value="1000">
<label for="v-mode">This amount is</label><select id="v-mode"><option value="ex">Before VAT (add 17.5%)</option><option value="in">With VAT included (take 17.5% out)</option></select>
<table><tr><td>Price before VAT</td><td id="v-ex"></td></tr><tr><td>VAT (17.5%)</td><td id="v-tax"></td></tr><tr class="sum"><td>Price with VAT</td><td id="v-in"></td></tr></table>
<p class="note">Standard rate of 17.5%. Some supplies are zero-rated or exempt: check with the Barbados Revenue Authority (BRA). Estimate, not tax advice.</p></div>
<script>(function(){''' + fmt_js('BDS$') + '''function run(){var a=num('v-amt'),md=document.getElementById('v-mode').value;var ex=md==='ex'?a:a/1.175,inc=md==='ex'?a*1.175:a;
document.getElementById('v-ex').textContent=m(ex,2);document.getElementById('v-tax').textContent=m(inc-ex,2);document.getElementById('v-in').textContent=m(inc,2)}
['v-amt','v-mode'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>'''

def bb_table():
    rows = ''
    for g in [1856.40, 2500, 3500, 5000, 7500, 10000, 15000]:
        nis, rr, tax, net = bb_emp(g)
        rows += '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % (bb(g), bb(nis + rr + tax), bb(tax), bb(net))
    return ('<div class="scrollx"><table><tr><th>Gross per month</th><th>Total deductions</th><th>Of which income tax</th><th>Take-home per month</th></tr>%s</table></div>' % rows)

BB_MW_TABLE = ('<div class="scrollx"><table><tr><th>Item</th><th>From 21 January 2026</th></tr>'
               '<tr><td>Per hour</td><td>BDS$10.71</td></tr><tr><td>Overtime per hour (150%%)</td><td>BDS$16.07</td></tr>'
               '<tr><td>Per day (8 hours)</td><td>BDS$85.68</td></tr><tr><td>Per 40-hour week</td><td>BDS$428.40</td></tr>'
               '<tr><td>Per month (52 weeks / 12)</td><td>%s</td></tr><tr><td>Security guards, per hour</td><td>BDS$11.66</td></tr></table></div>' % bb(BB_MW_M, 2))
BB_MW_HIST = ('<div class="scrollx"><table><tr><th>In force from</th><th>General rate per hour</th><th>Security guards per hour</th></tr>'
              '<tr><td>Before June 2025</td><td>BDS$8.50</td><td>BDS$9.25</td></tr><tr><td>June 2025</td><td>BDS$10.50</td><td>BDS$11.43</td></tr>'
              '<tr><td>21 January 2026</td><td>BDS$10.71</td><td>BDS$11.66</td></tr></table></div>')

R_BB_MW = R('Minimum wage in Barbados 2026', 'barbados-minimum-wage-2026', 'BDS$10.71 an hour and what it means per month')
R_BB_PAYE = R('PAYE calculator for Barbados', 'paye-calculator-barbados', 'income tax, National Insurance and the Resilience Fund')
R_BB_VAT = R('VAT calculator for Barbados', 'vat-calculator-barbados', 'add or remove 17.5% VAT from a price')
R_BB_HOME = ('Starting a business in Barbados', '../../barbados/', 'taxes, registration and the steps')

page('barbados-minimum-wage-2026',
     title='Minimum wage in Barbados 2026: BDS$10.71 an hour, weekly and monthly pay',
     desc='The national minimum wage in Barbados is BDS$10.71 an hour from 21 January 2026: BDS$428.40 a week, about BDS$1,856 a month. Overtime rate, security guards, calculator and take-home pay.',
     h1='Minimum wage in Barbados in 2026',
     lead='Since 21 January 2026 the national minimum wage in Barbados is BDS$10.71 an hour. Here is what that is per week and per month, the overtime rate, and what a minimum-wage worker takes home.',
     bullets=['BDS$10.71 an hour from 21 January 2026, up from BDS$10.50 (and BDS$8.50 before June 2025).', 'BDS$428.40 for a 40-hour week and about %s a month before deductions. Overtime is paid at 150%%.' % bb(BB_MW_M),
              'No income tax is due at this level, because the pay is below the BDS$25,000 allowance. About %s a month reaches the worker.' % bb(_bmw[3])],
     sections=[('The rates from 21 January 2026', [BB_MW_TABLE, 'The Ministry of Labour, Social Security and Third Sector gave notice of a 2% increase under the Minimum Wage Act, 2017: BDS$10.71 for all other workers and BDS$11.66 for security guards, with overtime at 150% of the ordinary rate.']),
               ('Calculate a week of pay', [CALC_BB_MW]),
               ('How it changed', [BB_MW_HIST]),
               ('What a minimum-wage worker takes home', ['A worker paid BDS$10.71 for 40 hours a week earns about %s a month. That is below the BDS$25,000 yearly allowance, so no income tax is due. The worker still pays National Insurance and related contributions at 11%% (about %s) and the Resilience and Regeneration Fund at 0.25%% (about %s). About %s a month is left.' % (bb(BB_MW_M, 2), bb(_bmw[0], 2), bb(_bmw[1], 2), bb(_bmw[3], 2)),
                                                         'For another salary, use the <a href="../paye-calculator-barbados/">PAYE calculator for Barbados</a>. ' + CHK_BB])],
     faq=[('What is the minimum wage in Barbados in 2026?', 'BDS$10.71 an hour from 21 January 2026 for all workers except security guards, who earn at least BDS$11.66 an hour.'),
          ('How much is the minimum wage per month in Barbados?', 'About %s a month before deductions, for 40 hours a week over 52 weeks divided by 12.' % bb(BB_MW_M, 2)),
          ('What is the overtime rate in Barbados?', 'At least 150% of the ordinary rate, which is about BDS$16.07 an hour at the minimum wage.'),
          ('Does a minimum-wage worker pay income tax in Barbados?', 'No. The yearly pay of about BDS$22,277 is below the BDS$25,000 allowance. National Insurance and the Resilience and Regeneration Fund are still deducted.')],
     related=[R_BB_PAYE, R_BB_VAT, R_BB_HOME], cta=CTA_BB)

page('paye-calculator-barbados',
     title='PAYE calculator for Barbados (2026): income tax, NIS and take-home pay',
     desc='Free PAYE calculator for Barbados: enter your weekly, fortnightly or monthly pay and see income tax at 11.5% and 27.5%, National Insurance (11%) and the Resilience Fund. Allowance BDS$25,000.',
     h1='PAYE calculator for Barbados',
     lead='PAYE is the income tax your employer takes from each pay. Enter your gross pay for one period and see the income tax, National Insurance, the Resilience and Regeneration Fund and what reaches your bank account.',
     bullets=['Income tax for 2026: 11.5% on the first BDS$50,000 above the BDS$25,000 allowance, then 27.5%. The rates were cut by one point under the 2026 Budget.', 'National Insurance: employee 11% up to BDS$5,360 a month.', 'Resilience and Regeneration Fund: 0.25% of gross pay, with no ceiling.'],
     sections=[('The calculator', [CALC_BB_PAYE]),
               ('Take-home pay at different salaries', [bb_table(), 'Monthly pay, 2026 rates, one employer and no other income.']),
               ('How the deductions are worked out', ['<strong>Income tax</strong>: your yearly pay minus the BDS$25,000 allowance is your taxable income. 11.5% applies to the first BDS$50,000 of it and 27.5% to the rest. The BRA says employee National Insurance contributions are not tax deductible, so the calculator takes them off after the tax.',
                                                      '<strong>National Insurance</strong> at 11% covers the pension and related funds (health service, unemployment, training). It stops at insurable earnings of BDS$5,360 a month (BDS$1,238 a week) in 2026. The <strong>Resilience and Regeneration Fund</strong> is 0.25% of gross pay for employees and applies above the ceiling too.',
                                                      'The employer pays its own contributions on top of your salary. This estimate leaves out credits such as the compensatory income credit. ' + CHK_BB])],
     faq=[('What is the income tax rate in Barbados in 2026?', '11.5% on taxable income from BDS$25,001 to BDS$75,000 and 27.5% above, according to the Barbados Revenue Authority. The rates were 12.5% and 28.5% before the 2026 Budget.'),
          ('What is the employee National Insurance rate in Barbados?', '11% of insurable earnings up to BDS$5,360 a month in 2026, plus 0.25% to the Resilience and Regeneration Fund on gross pay.'),
          ('Is National Insurance deducted before income tax in Barbados?', 'No. The BRA states that National Insurance paid by an employee is not tax deductible.'),
          ('Is this calculator payroll advice?', 'No. It is an estimate for planning. Confirm the exact amounts with the BRA or your payroll provider.')],
     related=[R_BB_MW, R_BB_VAT, R_BB_HOME], cta=CTA_BB)

page('vat-calculator-barbados',
     title='VAT calculator for Barbados: add or remove 17.5% VAT',
     desc='Free VAT calculator for Barbados: add 17.5% VAT to a price or take it out of a VAT-inclusive price. Registration threshold BDS$200,000, raised to BDS$350,000 from 1 October 2026 by the 2026 Budget.',
     h1='VAT calculator for Barbados',
     lead='Value Added Tax (VAT) in Barbados is 17.5%. Enter an amount to add the VAT to a price, or to find the price before VAT inside a total.',
     bullets=['Standard VAT rate: 17.5%.', 'Registration threshold: BDS$200,000 of yearly sales. The 2026 Budget raises it to BDS$350,000 from 1 October 2026.', 'Returns are filed every two months, by the 21st of the month after the period.'],
     sections=[('The calculator', [CALC_BB_VAT]),
               ('How it works', ['To add VAT, multiply the price by 1.175. To take VAT out of a total, divide it by 1.175. On BDS$1,175 the VAT is BDS$175 and the price before VAT is BDS$1,000.']),
               ('The registration threshold', ['A business must register once its yearly sales reach the threshold. It was BDS$200,000. The Budget presented on 16 March 2026 raised it to BDS$350,000 from 1 October 2026, according to PwC, EY and KPMG. The BRA pages we checked may still show BDS$200,000, so ask the BRA which amount applies before you decide not to register. Registration is through the BRA online portal. ' + CHK_BB]),
               ('Remember', ['Some goods and services are zero-rated or exempt, for example exports and some tourism services, so 17.5% does not apply to everything. Check your item with the BRA before you charge or claim VAT.'])],
     faq=[('What is the VAT rate in Barbados?', '17.5% on most goods and services, according to the Barbados Revenue Authority and PwC.'),
          ('How do I take VAT out of a price?', 'Divide the VAT-inclusive total by 1.175. The difference is the VAT.'),
          ('What is the VAT registration threshold in Barbados?', 'BDS$200,000 of yearly sales. The 2026 Budget raises it to BDS$350,000 from 1 October 2026.'),
          ('How often are VAT returns filed in Barbados?', 'Every two months, with the return and payment due by the 21st of the month after the period.')],
     related=[R_BB_MW, R_BB_PAYE, R_BB_HOME], cta=CTA_BB)


# ======================================================================= NIS (12 nov, lot 2)
CALC_TT_NIS = CALC_CSS + """<div class="calc" id="calc-nis"><strong>Calculator: how much National Insurance?</strong>
<label for="n-pay">Monthly pay (TT$)</label><input id="n-pay" type="number" inputmode="numeric" min="0" step="100" value="10000">
<label for="n-who">You are</label><select id="n-who"><option value="e">An employee</option><option value="r">An employer, for one employee</option></select>
<label for="n-yr">Period</label><select id="n-yr"><option value="2026">2026: 16.2% in total (employee 5.4%, employer 10.8%)</option><option value="2027">From 4 January 2027: 19.2% in total (employee 6.4%, employer 12.8%)</option></select>
<table><tr><td>Rate</td><td id="n-r"></td></tr><tr><td>Contribution per month</td><td id="n-m"></td></tr><tr class="sum"><td>Contribution per year</td><td id="n-y"></td></tr><tr><td>Ceiling reached (TT$13,600 a month)?</td><td id="n-c"></td></tr></table>
<p class="note">National Insurance is set by earnings class, so the real amount can differ by a few dollars. Estimate, not payroll advice.</p></div>
<script>(function(){""" + fmt_js('TT$') + """function run(){var p=num('n-pay'),w=document.getElementById('n-who').value,y=document.getElementById('n-yr').value;var r=(y==='2026'?(w==='e'?0.054:0.108):(w==='e'?0.064:0.128));var c=Math.min(p,13600)*r;
document.getElementById('n-r').textContent=(r*100).toFixed(1)+'%';document.getElementById('n-m').textContent=m(c,2);document.getElementById('n-y').textContent=m(c*12,2);document.getElementById('n-c').textContent=p>13600?'Yes: pay above TT$13,600 a month is not charged':'No'}
['n-pay','n-who','n-yr'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>"""

R_TT_NIS = R('National Insurance calculator for Trinidad and Tobago', 'nis-calculator-trinidad-and-tobago', 'employee and employer, 2026 and 2027')
page('nis-calculator-trinidad-and-tobago',
     title='National Insurance (NIS) calculator for Trinidad and Tobago: 16.2% in 2026, 19.2% in 2027',
     desc='Free NIS calculator for Trinidad and Tobago: employee and employer National Insurance contributions at 16.2% in 2026 and 19.2% from 4 January 2027, up to TT$13,600 of pay a month.',
     h1='National Insurance (NIS) calculator for Trinidad and Tobago',
     lead='National Insurance gives access to a pension and other benefits. Enter a monthly pay and see the contribution for an employee or an employer, in 2026 and from January 2027.',
     bullets=['2026: 16.2% in total, employee 5.4% and employer 10.8%.', 'From 4 January 2027: 19.2% in total, employee 6.4% and employer 12.8%.', 'Contributions stop at insurable earnings of TT$13,600 a month. The highest weekly total is TT$508.50 in 2026 and TT$602.40 in 2027.'],
     sections=[('The calculator', [CALC_TT_NIS]),
               ('The rates', ['<div class="scrollx"><table><tr><th>Period</th><th>Total rate</th><th>Employee</th><th>Employer</th><th>Highest weekly total</th></tr><tr><td>5 January 2026 to 3 January 2027</td><td>16.2%</td><td>5.4% (TT$169.50 a week at most)</td><td>10.8% (TT$339.00)</td><td>TT$508.50</td></tr><tr><td>From 4 January 2027</td><td>19.2%</td><td>6.4% (TT$200.80 a week at most)</td><td>12.8% (TT$401.60)</td><td>TT$602.40</td></tr></table></div>',
                                'The increase was announced in the 2026 Budget and written into the Finance Act 2025 and the National Insurance contribution regulations. Contributions are paid by earnings class, which is why the calculator gives a close estimate. ' + CHK_TT])],
     faq=[('What is the National Insurance rate in Trinidad and Tobago?', '16.2% of insurable earnings since 5 January 2026, about two thirds paid by the employer and one third by the employee. It rises to 19.2% from 4 January 2027.'),
          ('What is the National Insurance ceiling?', 'Insurable earnings stop at TT$13,600 a month, which is TT$3,138 a week.'),
          ('Does the self-employed person pay National Insurance?', 'The NIBTT FAQ says the scheme does not yet cover the self-employed, while some payroll sites say they pay the combined rate. Ask the NIBTT before you count on it.')],
     related=[R_TT_PAYE, R_TT_MW, R_TT_HOME], cta=CTA_TT)

CALC_BB_NIS = CALC_CSS + """<div class="calc" id="calc-nis"><strong>Calculator: how much National Insurance?</strong>
<label for="n-pay">Monthly pay or profit (BDS$)</label><input id="n-pay" type="number" inputmode="numeric" min="0" step="100" value="5000">
<label for="n-who">You are</label><select id="n-who"><option value="0.11">An employee (11%)</option><option value="0.1275">An employer, for one employee (12.75%)</option><option value="0.17">Self-employed (17%)</option></select>
<label for="n-yr">Year (earnings ceiling)</label><select id="n-yr"><option value="5360">2026: BDS$5,360 a month</option><option value="5450">2027: BDS$5,450 a month</option></select>
<table><tr><td>National Insurance and related funds</td><td id="n-m"></td></tr><tr><td>Resilience and Regeneration Fund (0.25% of gross)</td><td id="n-rr"></td></tr><tr class="sum"><td>Total per month</td><td id="n-t"></td></tr><tr class="sum"><td>Total per year</td><td id="n-y"></td></tr><tr><td>Ceiling reached?</td><td id="n-c"></td></tr></table>
<p class="note">The Resilience and Regeneration Fund has no ceiling. Estimate, not payroll advice.</p></div>
<script>(function(){""" + fmt_js('BDS$') + """function run(){var p=num('n-pay'),r=parseFloat(document.getElementById('n-who').value),ce=parseFloat(document.getElementById('n-yr').value);var a=Math.min(p,ce)*r,b=p*0.0025;
document.getElementById('n-m').textContent=m(a,2);document.getElementById('n-rr').textContent=m(b,2);document.getElementById('n-t').textContent=m(a+b,2);document.getElementById('n-y').textContent=m((a+b)*12,2);document.getElementById('n-c').textContent=p>ce?'Yes: National Insurance stops at BDS$'+ce.toLocaleString('en-US')+' a month':'No'}
['n-pay','n-who','n-yr'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>"""

R_BB_NIS = R('National Insurance calculator for Barbados', 'nis-calculator-barbados', 'employee, employer and self-employed')
page('nis-calculator-barbados',
     title='National Insurance (NIS) calculator for Barbados (2026): employee 11%, employer 12.75%',
     desc='Free NIS calculator for Barbados: employee 11%, employer 12.75% and self-employed 17%, up to BDS$5,360 of pay a month, plus the 0.25% Resilience and Regeneration Fund.',
     h1='National Insurance (NIS) calculator for Barbados',
     lead='National Insurance in Barbados also funds health service, unemployment and training. Enter a monthly pay and see the contribution for an employee, an employer or a self-employed person.',
     bullets=['Private-sector employee 11%, employer 12.75%, self-employed 17%, on earnings up to BDS$5,360 a month in 2026 (BDS$5,450 in 2027).', 'Resilience and Regeneration Fund: 0.25% of gross pay, paid by employees, employers and the self-employed, with no ceiling.', 'The fund rose from 0.1% to 0.25% for employees on 1 April 2025.'],
     sections=[('The calculator', [CALC_BB_NIS]),
               ('The rates', ['<div class="scrollx"><table><tr><th>Who</th><th>Base rate</th><th>With the 0.25% fund</th></tr><tr><td>Private-sector employee</td><td>11.00%</td><td>11.25%</td></tr><tr><td>Employer, for each employee</td><td>12.75%</td><td>13.00%</td></tr><tr><td>Self-employed</td><td>17.00%</td><td>17.25%</td></tr></table></div>',
                              'The National Insurance Office lists the ceilings as BDS$1,238 a week and BDS$5,360 a month in 2026, and BDS$1,258 a week and BDS$5,450 a month in 2027. The fund is calculated on gross earnings, without the ceiling. ' + CHK_BB])],
     faq=[('What is the National Insurance rate in Barbados?', 'For a private-sector employee, 11% of insurable earnings, and 12.75% for the employer. Self-employed people pay 17%. A 0.25% Resilience and Regeneration Fund is added on gross earnings.'),
          ('What is the NIS ceiling in Barbados in 2026?', 'BDS$5,360 a month, or BDS$1,238 a week. It is BDS$5,450 a month from 2027.'),
          ('Is National Insurance tax deductible in Barbados?', 'No. The BRA says National Insurance paid by an employee or a self-employed person is not tax deductible.')],
     related=[R_BB_PAYE, R_BB_MW, R_BB_HOME], cta=CTA_BB)

urls = []
for slug, k in P:
    urls.append(B.build('en', slug, **k))

# ---- liens, sitemap, llms.txt (idempotents) ----
def edit(path, fn):
    p = os.path.join(ROOT, path); s = open(p, encoding='utf-8').read(); n = fn(s)
    if n != s: open(p, 'w', encoding='utf-8').write(n)

def country_links(country_dir, title, slugs):
    def f(s):
        if '<h2>%s</h2>' % title in s: return s
        items = ''.join('<li><a href="../guides/%s/">%s</a></li>' % (sl, re.sub(r'<.*?>', '', dict(P)[sl]['h1'])) for sl in slugs)
        return s.replace('    <h2>Other Caribbean countries</h2>', '    <h2>%s</h2>\n    <ul>%s</ul>\n    <h2>Other Caribbean countries</h2>' % (title, items), 1)
    edit('caribbean/%s/index.html' % country_dir, f)

country_links('trinidad-and-tobago', 'Trinidad and Tobago guides', [s for s, _ in P if 'trinidad' in s])
country_links('barbados', 'Barbados guides', [s for s, _ in P if 'barbados' in s])

def add_sitemap(s):
    add = ''.join('  <url><loc>%s</loc><lastmod>2026-11-12</lastmod></url>\n' % u for u in urls if u not in s)
    return s.replace('</urlset>', add + '</urlset>') if add else s
edit('sitemap.xml', add_sitemap)
def add_llms(s):
    add = ''.join('- %s\n' % u for u in urls if u not in s)
    return s.rstrip('\n') + '\n' + add if add else s
edit('llms.txt', add_llms)
print('\n'.join(urls))
