# -*- coding: utf-8 -*-
"""8 pages EN (20 nov. 2026), construites sur de vraies requêtes de la Search Console :
 - income-tax-threshold-trinidad-and-tobago  (« what is the minimum salary for paye in trinidad », « paye trinidad »)
 - income-tax-threshold-barbados
 - minimum-wage-caribbean-2026               (« minimum wage in the caribbean 2026 », « minimum wage 2026 », « minimum wage »)
 - overtime-pay-calculator-caribbean         (« overtime calculations », « overtime pay »)
Usage (racine du dépôt) : python3 -I tools/build_batch3.py   Idempotent (sitemap, llms.txt, liens).
Chiffres repris des pages déjà vérifiées le 12 nov. 2026 (voir CHK_*). Aucune donnée nouvelle inventée."""
import os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_guides as B

B.DATE = '2026-11-20'
ROOT = B.ROOT
B.G = {}

CHK_TT = ('Figures last checked on 12 November 2026 against the Inland Revenue Division (IRD), the National Insurance Board (NIBTT) '
          'and the PwC Worldwide Tax Summaries. Confirm the current amount with the IRD or your payroll provider before you pay.')
CHK_BB = ('Figures last checked on 12 November 2026 against the Barbados Revenue Authority (BRA) and the PwC Worldwide Tax Summaries. '
          'Confirm the current amount with the BRA or your payroll provider before you pay.')
CHK_ALL = ('Figures last checked on 12 November 2026 against each country\'s tax or labour authority (Jamaica: Ministry of Labour and Social Security; '
           'Trinidad and Tobago: Ministry of Labour and WageIndicator; Barbados: Ministry of Labour notice; Dominican Republic: DGII and the Comité Nacional de Salarios, '
           'resolution CNS-01-2025). Confirm the current amount with the authority of your country before you pay.')
CTA = ('Test your project with your country\'s rules', 'Free, no sign-up. Enter your sales and costs and get your taxes and take-home income.', '../../', 'Test my project')

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

# ---- formules (identiques à tools/build_tt_bb_pages.py)
def tt_emp(g, r=0.054):
    nis = min(g, 163200 / 12) * r
    hs = (8.25 if g * 12 / 52 > 109 else 4.80) * 52 / 12 if g > 0 else 0
    chg = max(g * 12 - nis * 12 - 90000, 0)
    tax = (0.25 * min(chg, 1000000) + 0.30 * max(chg - 1000000, 0)) / 12
    return nis, hs, tax, g - nis - hs - tax
def bb_emp(g):
    nis = min(g, 5360) * 0.11; rr = g * 0.0025
    taxable = max(g * 12 - 25000, 0)
    tax = (0.115 * min(taxable, 50000) + 0.275 * max(taxable - 50000, 0)) / 12
    return nis, rr, tax, g - nis - rr - tax

P = []
def page(slug, **k): P.append((slug, k))

R_TT_PAYE = R('PAYE calculator for Trinidad and Tobago', 'paye-calculator-trinidad-and-tobago', 'income tax, National Insurance and Health Surcharge')
R_TT_MW = R('Minimum wage in Trinidad and Tobago 2026', 'trinidad-and-tobago-minimum-wage-2026', 'TT$20.50 an hour and what it means per month')
R_TT_NIS = R('National Insurance calculator for Trinidad and Tobago', 'nis-calculator-trinidad-and-tobago', 'employee and employer, 2026 and 2027')
R_BB_PAYE = R('PAYE calculator for Barbados', 'paye-calculator-barbados', 'income tax, National Insurance and the Resilience Fund')
R_BB_MW = R('Minimum wage in Barbados 2026', 'barbados-minimum-wage-2026', 'BDS$10.71 an hour and what it means per month')
R_BB_NIS = R('National Insurance calculator for Barbados', 'nis-calculator-barbados', 'employee, employer and self-employed')
R_JM_MW = R('Minimum wage in Jamaica 2026', 'jamaica-minimum-wage-2026', 'J$17,000 a week, hourly rate and monthly pay')
R_DR_MW = ('Salario mínimo 2026 en República Dominicana (in Spanish)', '../../es/guias/salario-minimo-republica-dominicana-2026/', 'by company size')
R_JM_THR = R('Income tax threshold in Jamaica', 'income-tax-threshold-jamaica', 'the tax-free amount 2025 to 2027')

# ===================================================================== 1. Trinidad : seuil d'imposition
g_start = 7500 / (1 - 0.054)
rows = ''
for g in [5000, 6000, 7500, 8000, 10000, 12000, 15000, 20000, 30000]:
    nis, hs, tax, net = tt_emp(g)
    rows += '<tr><td>%s</td><td>%s</td><td>%s</td></tr>' % (tt(g), tt(tax), tt(net))
CALC_TT = CALC_CSS + '''<div class="calc" id="calc-thr"><strong>Calculator: do I pay income tax?</strong>
<label for="t-gross">Gross pay per month (TT$)</label><input id="t-gross" type="number" inputmode="numeric" min="0" step="100" value="9000">
<table><tr><td>National Insurance (employee, 5.4%, up to TT$13,600)</td><td id="t-nis"></td></tr><tr><td>Tax-free allowance per month (TT$90,000 / 12)</td><td id="t-all"></td></tr><tr><td>Chargeable income per month</td><td id="t-chg"></td></tr><tr class="sum"><td>Income tax (PAYE) per month</td><td id="t-tax"></td></tr><tr><td>Does income tax apply?</td><td id="t-yes"></td></tr></table>
<p class="note">2026 rates, one employer, TT$90,000 personal allowance, no other deduction. Estimate, not payroll or tax advice.</p></div>
<script>(function(){''' + fmt_js('TT$') + '''function run(){var g=num('t-gross'),nis=Math.min(g,13600)*0.054,chg=Math.max(g*12-nis*12-90000,0)/12,tax=0.25*Math.min(chg*12,1000000)/12+0.30*Math.max(chg*12-1000000,0)/12;
document.getElementById('t-nis').textContent=m(nis,2);document.getElementById('t-all').textContent=m(7500,2);document.getElementById('t-chg').textContent=m(chg,2);document.getElementById('t-tax').textContent=m(tax,2);document.getElementById('t-yes').textContent=chg>0?'Yes':'No: pay is below the allowance'}
document.getElementById('t-gross').addEventListener('input',run);run()})();</script>'''
page('income-tax-threshold-trinidad-and-tobago',
     title='Income tax threshold in Trinidad and Tobago 2026: TT$90,000 a year, TT$7,500 a month',
     desc='In Trinidad and Tobago you pay no income tax on the first TT$90,000 a year (TT$7,500 a month). See the PAYE rates, the pay at which tax starts, and a free calculator.',
     h1='Income tax threshold in Trinidad and Tobago in 2026',
     lead='The personal allowance in Trinidad and Tobago is TT$90,000 a year, which is TT$7,500 a month. Below it you pay no PAYE income tax. Here is the pay at which tax starts, the rates above it, and a calculator.',
     bullets=['Tax-free allowance: TT$90,000 a year (TT$7,500 a month, about TT$1,731 a week).',
              'Income tax: 25% on chargeable income up to TT$1,000,000 a year, then 30%.',
              'Employee National Insurance (5.4%% in 2026) is taken off first, so income tax starts at about %s a month of gross pay.' % tt(g_start)],
     sections=[('What the threshold is', ['Your <strong>chargeable income</strong> is your yearly pay minus employee National Insurance minus the TT$90,000 allowance. If the result is zero or negative, no income tax is due. National Insurance (employee share 5.4% in 2026, up to TT$13,600 of pay a month) and the Health Surcharge still apply even when income tax does not.']),
               ('Calculate your income tax', [CALC_TT]),
               ('Income tax by monthly pay', ['<div class="scrollx"><table><tr><th>Gross per month</th><th>Income tax per month</th><th>Take-home per month</th></tr>%s</table></div>' % rows,
                                              'Take-home is after National Insurance, the Health Surcharge and income tax, with the 2026 National Insurance rate. ' + CHK_TT]),
               ('What changes in 2027', ['National Insurance rises to 19.2% in total (employee 6.4%) from 4 January 2027, which lowers take-home pay slightly and moves the pay at which income tax starts. The 2027 Budget kept the TT$90,000 allowance for most people.'])],
     faq=[('What is the income tax threshold in Trinidad and Tobago?', 'TT$90,000 a year, which is TT$7,500 a month. Chargeable income below it is not taxed.'),
          ('What is the minimum salary for PAYE in Trinidad and Tobago?', 'There is no minimum salary as such: income tax starts once chargeable income passes the TT$90,000 allowance, which is about %s a month of gross pay after employee National Insurance.' % tt(g_start)),
          ('What is the income tax rate in Trinidad and Tobago?', '25% on chargeable income up to TT$1,000,000 a year and 30% above.'),
          ('Does a minimum-wage worker pay income tax?', 'No. The yearly pay at the minimum wage is about TT$42,640, below the TT$90,000 allowance.')],
     related=[R_TT_PAYE, R_TT_MW, R_TT_NIS], cta=CTA)

# ===================================================================== 2. Barbade : seuil d'imposition
rows = ''
for g in [1500, 2083.33, 2500, 3000, 4000, 5000, 7500, 10000]:
    nis, rr, tax, net = bb_emp(g)
    rows += '<tr><td>%s</td><td>%s</td><td>%s</td></tr>' % (bb(g), bb(tax), bb(net))
CALC_BB = CALC_CSS + '''<div class="calc" id="calc-thr"><strong>Calculator: do I pay income tax?</strong>
<label for="b-gross">Gross pay per month (BDS$)</label><input id="b-gross" type="number" inputmode="numeric" min="0" step="100" value="3000">
<table><tr><td>Tax-free allowance per month (BDS$25,000 / 12)</td><td id="b-all"></td></tr><tr><td>Taxable income per month</td><td id="b-chg"></td></tr><tr class="sum"><td>Income tax (PAYE) per month</td><td id="b-tax"></td></tr><tr><td>Does income tax apply?</td><td id="b-yes"></td></tr></table>
<p class="note">2026 rates, one employer, BDS$25,000 allowance and no other allowance or credit. Estimate, not payroll or tax advice.</p></div>
<script>(function(){''' + fmt_js('BDS$') + '''function run(){var g=num('b-gross'),tb=Math.max(g*12-25000,0),tax=(0.115*Math.min(tb,50000)+0.275*Math.max(tb-50000,0))/12;
document.getElementById('b-all').textContent=m(25000/12,2);document.getElementById('b-chg').textContent=m(tb/12,2);document.getElementById('b-tax').textContent=m(tax,2);document.getElementById('b-yes').textContent=tb>0?'Yes':'No: pay is below the allowance'}
document.getElementById('b-gross').addEventListener('input',run);run()})();</script>'''
page('income-tax-threshold-barbados',
     title='Income tax threshold in Barbados 2026: BDS$25,000 a year, BDS$2,083 a month',
     desc='In Barbados you pay no income tax on the first BDS$25,000 a year (about BDS$2,083 a month). See the rates above it, a table by monthly pay, and a free calculator.',
     h1='Income tax threshold in Barbados in 2026',
     lead='The personal allowance in Barbados is BDS$25,000 a year, about BDS$2,083 a month. Below it you pay no income tax. Here are the rates above it, the tax by monthly pay, and a calculator.',
     bullets=['Tax-free allowance: BDS$25,000 a year (about BDS$2,083 a month).', 'Income tax: 11.5% on the first BDS$50,000 above the allowance, then 27.5%.',
              'National Insurance (11% for the employee) and the 0.25% Resilience and Regeneration Fund are separate from income tax and are still charged.'],
     sections=[('What the threshold is', ['Your taxable income is your yearly pay minus the BDS$25,000 allowance. If it is zero or negative, no income tax is due. National Insurance paid by an employee is not tax deductible, according to the BRA, so it does not reduce taxable income.']),
               ('Calculate your income tax', [CALC_BB]),
               ('Income tax by monthly pay', ['<div class="scrollx"><table><tr><th>Gross per month</th><th>Income tax per month</th><th>Take-home per month</th></tr>%s</table></div>' % rows,
                                              'Take-home is after National Insurance (11%, up to BDS$5,360 a month), the Resilience and Regeneration Fund (0.25%) and income tax. ' + CHK_BB])],
     faq=[('What is the income tax threshold in Barbados?', 'BDS$25,000 a year, about BDS$2,083 a month. Taxable income below it is not taxed.'),
          ('What is the income tax rate in Barbados?', '11.5% on the first BDS$50,000 of taxable income above the allowance, and 27.5% on the rest.'),
          ('Does a minimum-wage worker pay income tax in Barbados?', 'No. The yearly pay of about BDS$22,277 is below the BDS$25,000 allowance. National Insurance and the Resilience and Regeneration Fund are still deducted.')],
     related=[R_BB_PAYE, R_BB_MW, R_BB_NIS], cta=CTA)

# ===================================================================== 3. Salaire minimum dans la Caraïbe
page('minimum-wage-caribbean-2026',
     title='Minimum wage in the Caribbean 2026: Jamaica, Trinidad and Tobago, Barbados, Dominican Republic',
     desc='The 2026 minimum wage in four Caribbean countries side by side: Jamaica J$17,000 a week, Trinidad and Tobago TT$20.50 an hour, Barbados BDS$10.71 an hour, Dominican Republic by company size.',
     h1='Minimum wage in the Caribbean in 2026',
     lead='There is no single Caribbean minimum wage: each country sets its own, in its own currency. Here are the 2026 rates for the four countries Pa a Pa covers in detail, with the monthly equivalent and a link to each full guide.',
     bullets=['Jamaica: J$17,000 for a 40-hour week (J$425 an hour) from 1 July 2026.', 'Trinidad and Tobago: TT$20.50 an hour since 1 January 2024.',
              'Barbados: BDS$10.71 an hour since 21 January 2026.', 'Dominican Republic: from RD$16,993.20 to RD$29,988.00 a month depending on company size, from 1 February 2026.'],
     sections=[('The rates side by side', ['<div class="scrollx"><table><tr><th>Country</th><th>Rate</th><th>About per month</th></tr>'
                                           '<tr><td>Jamaica</td><td>J$17,000 a week (J$425 an hour)</td><td>J$73,667</td></tr>'
                                           '<tr><td>Trinidad and Tobago</td><td>TT$20.50 an hour</td><td>TT$3,553</td></tr>'
                                           '<tr><td>Barbados</td><td>BDS$10.71 an hour</td><td>BDS$1,856</td></tr>'
                                           '<tr><td>Dominican Republic</td><td>By company size</td><td>RD$16,993 to RD$29,988</td></tr></table></div>',
                                           'Monthly amounts are for 40 hours a week over 52 weeks divided by 12, before deductions, except the Dominican Republic, where the rates are monthly figures. The currencies are different (the Jamaican, Trinidad and Tobago, Barbados and Dominican pesos and dollars are not worth the same), so the numbers cannot be compared directly without converting them.']),
               ('Overtime and take-home pay', ['Jamaica: J$637.50 an hour for hours beyond 40 in a week and J$850 for double time. Barbados: 150% of the ordinary rate, which is BDS$16.07 an hour at the minimum wage. Trinidad and Tobago: time and a half is the usual rule, TT$30.75 an hour at the minimum wage. At these pay levels income tax is not due in Jamaica, Trinidad and Tobago or Barbados, but social contributions are still deducted. ' + CHK_ALL]),
               ('Where to read more', ['Each country has its own guide, with a calculator and the take-home pay at the minimum wage. The Dominican guide is in Spanish.'])],
     faq=[('What is the minimum wage in the Caribbean?', 'There is no regional rate. In 2026 it is J$17,000 a week in Jamaica, TT$20.50 an hour in Trinidad and Tobago, BDS$10.71 an hour in Barbados, and RD$16,993.20 to RD$29,988.00 a month in the Dominican Republic, depending on company size.'),
          ('Which Caribbean country has the highest minimum wage?', 'The rates are in different currencies, so they cannot be ranked by the number alone. Convert them to one currency at the current exchange rate to compare them.'),
          ('Is the minimum wage the same for every worker?', 'Not always. Barbados and Jamaica have a higher rate for security guards, and the Dominican Republic sets the rate by company size.')],
     related=[R_JM_MW, R_TT_MW, R_BB_MW, R_DR_MW], cta=CTA)

# ===================================================================== 4. Heures supplémentaires
CALC_OT = CALC_CSS + '''<div class="calc" id="calc-ot"><strong>Calculator: overtime pay</strong>
<label for="o-rate">Ordinary pay per hour</label><input id="o-rate" type="number" inputmode="decimal" min="0" step="0.01" value="20.50">
<label for="o-hrs">Overtime hours in the week</label><input id="o-hrs" type="number" inputmode="decimal" min="0" step="0.5" value="5">
<label for="o-mul">Overtime rate</label><select id="o-mul"><option value="1.5" selected>Time and a half (150%)</option><option value="2">Double time (200%)</option></select>
<table><tr><td>Overtime rate per hour</td><td id="o-r"></td></tr><tr class="sum"><td>Overtime pay for the week</td><td id="o-t"></td></tr><tr><td>Regular pay for 40 hours</td><td id="o-b"></td></tr><tr class="sum"><td>Total gross pay for the week</td><td id="o-g"></td></tr></table>
<p class="note">Enter the amount in your own currency. The multiplier is the usual rule: check the rate that applies to your job and your day with the labour ministry. Estimate, not payroll advice.</p></div>
<script>(function(){function f(n){return n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}function num(id){var v=parseFloat(document.getElementById(id).value);return isNaN(v)||v<0?0:v}
function run(){var r=num('o-rate'),h=num('o-hrs'),k=parseFloat(document.getElementById('o-mul').value),o=r*k;
document.getElementById('o-r').textContent=f(o);document.getElementById('o-t').textContent=f(o*h);document.getElementById('o-b').textContent=f(r*40);document.getElementById('o-g').textContent=f(r*40+o*h)}
['o-rate','o-hrs','o-mul'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>'''
page('overtime-pay-calculator-caribbean',
     title='Overtime pay calculator for the Caribbean (2026): time and a half, double time',
     desc='Free overtime calculator: enter your hourly pay and overtime hours to get the overtime rate and weekly pay. Minimum-wage overtime rates for Jamaica, Barbados and Trinidad and Tobago.',
     h1='Overtime pay calculator for the Caribbean',
     lead='Overtime is paid at a higher rate than your ordinary hour. Enter your hourly pay and your overtime hours and see the overtime rate and the total for the week. Below, the overtime rates at the minimum wage in three countries.',
     bullets=['Overtime is usually paid at 150% of the ordinary hourly rate (time and a half), and 200% on some days or in some cases.', 'Jamaica: J$637.50 an hour at the minimum wage, J$850 for double time.',
              'Barbados: BDS$16.07 an hour at the minimum wage. Trinidad and Tobago: TT$30.75 an hour at the minimum wage.'],
     sections=[('The calculator', [CALC_OT]),
               ('Overtime rates at the minimum wage', ['<div class="scrollx"><table><tr><th>Country</th><th>Ordinary hour</th><th>Time and a half</th><th>Double time</th></tr>'
                                                       '<tr><td>Jamaica</td><td>J$425.00</td><td>J$637.50</td><td>J$850.00</td></tr>'
                                                       '<tr><td>Barbados</td><td>BDS$10.71</td><td>BDS$16.07</td><td>BDS$21.42</td></tr>'
                                                       '<tr><td>Trinidad and Tobago</td><td>TT$20.50</td><td>TT$30.75</td><td>TT$41.00</td></tr></table></div>',
                                                       'Time and a half and double time are the ordinary rate multiplied by 1.5 and by 2. Whether a given hour counts as overtime, and at which rate, depends on your contract, the day and the country: confirm it with the ministry of labour. ' + CHK_ALL]),
               ('How overtime is worked out', ['Overtime pay = ordinary hourly rate x multiplier x overtime hours. Example: at TT$20.50 an hour, 5 hours at time and a half is 20.50 x 1.5 x 5 = TT$153.75.'])],
     faq=[('How is overtime pay calculated?', 'Multiply your ordinary hourly rate by the overtime multiplier (1.5 for time and a half, 2 for double time) and by the number of overtime hours.'),
          ('What is the overtime rate in Jamaica?', 'At the minimum wage, J$637.50 an hour for hours beyond 40 in a week and J$850 an hour for double time, from 1 July 2026.'),
          ('What is the overtime rate in Barbados?', 'At least 150% of the ordinary rate, which is about BDS$16.07 an hour at the minimum wage.')],
     related=[R_JM_MW, R_BB_MW, R_TT_MW], cta=CTA)

# ===================================================================== 5. Salaire net Trinité
rows = ''
for g in [3553.33, 5000, 7500, 10000, 12000, 15000, 20000, 30000, 50000]:
    nis, hs, tax, net = tt_emp(g)
    rows += '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % (tt(g), tt(nis + hs + tax), tt(tax), tt(net))
CALC_TT_NET = CALC_CSS + '''<div class="calc" id="calc-net"><strong>Calculator: salary after tax</strong>
<label for="s-gross">Gross pay per month (TT$)</label><input id="s-gross" type="number" inputmode="numeric" min="0" step="100" value="10000">
<table><tr><td>National Insurance (employee, 5.4%)</td><td id="s-nis"></td></tr><tr><td>Health Surcharge</td><td id="s-hs"></td></tr><tr><td>Income tax (PAYE)</td><td id="s-tax"></td></tr><tr class="sum"><td>Total deductions</td><td id="s-ded"></td></tr><tr class="sum"><td>Take-home pay per month</td><td id="s-net"></td></tr><tr><td>Take-home pay per year</td><td id="s-yr"></td></tr></table>
<p class="note">2026 rates, one employer, TT$90,000 personal allowance, no other deduction. Estimate, not payroll or tax advice.</p></div>
<script>(function(){''' + fmt_js('TT$') + '''function run(){var g=num('s-gross'),nis=Math.min(g,13600)*0.054,hs=g>0?((g*12/52>109?8.25:4.80)*52/12):0,chg=Math.max(g*12-nis*12-90000,0),tax=(0.25*Math.min(chg,1000000)+0.30*Math.max(chg-1000000,0))/12,ded=nis+hs+tax;
document.getElementById('s-nis').textContent=m(nis,2);document.getElementById('s-hs').textContent=m(hs,2);document.getElementById('s-tax').textContent=m(tax,2);document.getElementById('s-ded').textContent=m(ded,2);document.getElementById('s-net').textContent=m(g-ded,2);document.getElementById('s-yr').textContent=m((g-ded)*12,2)}
document.getElementById('s-gross').addEventListener('input',run);run()})();</script>'''
_n10 = tt_emp(10000)
page('salary-after-tax-trinidad-and-tobago',
     title='Salary after tax in Trinidad and Tobago (2026): take-home pay calculator',
     desc='Free take-home pay calculator for Trinidad and Tobago: enter your monthly gross salary and see National Insurance, the Health Surcharge, income tax and what you keep. Table from TT$3,553 to TT$50,000.',
     h1='Salary after tax in Trinidad and Tobago in 2026',
     lead='What do you really keep from a gross salary in Trinidad and Tobago? Enter your monthly pay and see the deductions (National Insurance, Health Surcharge, income tax) and your take-home pay. A table below shows common salaries.',
     bullets=['On TT$10,000 gross a month, about %s is deducted and %s reaches your bank account.' % (tt(10000 - _n10[3]), tt(_n10[3])),
              'Deductions: employee National Insurance (5.4% in 2026), the Health Surcharge and income tax (25% above the TT$90,000 allowance, 30% above TT$1,000,000).',
              'At the minimum wage (about TT$3,553 a month) no income tax is due.'],
     sections=[('Calculate your take-home pay', [CALC_TT_NET]),
               ('Take-home pay by monthly salary', ['<div class="scrollx"><table><tr><th>Gross per month</th><th>Total deductions</th><th>Of which income tax</th><th>Take-home per month</th></tr>%s</table></div>' % rows,
                                                    'National Insurance is set by earnings class, so the real amount can differ by a few dollars. ' + CHK_TT]),
               ('What changes in 2027', ['From 4 January 2027 the employee National Insurance share rises from 5.4% to 6.4%, so take-home pay falls slightly. The PAYE calculator lets you switch between the two rates.'])],
     faq=[('How much tax do I pay on TT$10,000 a month in Trinidad and Tobago?', 'About %s a month in income tax, on top of National Insurance and the Health Surcharge, with the 2026 rates and the TT$90,000 allowance.' % tt(_n10[2])),
          ('What is the take-home pay on TT$10,000 a month?', 'About %s a month after National Insurance, the Health Surcharge and income tax.' % tt(_n10[3])),
          ('Is the Health Surcharge deducted from my pay?', 'Yes. It is TT$8.25 a week for most employees and TT$4.80 for the lowest earners.')],
     related=[R_TT_PAYE, R('Income tax threshold in Trinidad and Tobago', 'income-tax-threshold-trinidad-and-tobago', 'TT$90,000 a year'), R_TT_NIS], cta=CTA)

# ===================================================================== 6. Salaire net Barbade
rows = ''
for g in [1856.40, 2500, 3000, 4000, 5000, 6000, 8000, 10000, 15000]:
    nis, rr, tax, net = bb_emp(g)
    rows += '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % (bb(g), bb(nis + rr + tax), bb(tax), bb(net))
CALC_BB_NET = CALC_CSS + '''<div class="calc" id="calc-net"><strong>Calculator: salary after tax</strong>
<label for="s-gross">Gross pay per month (BDS$)</label><input id="s-gross" type="number" inputmode="numeric" min="0" step="100" value="5000">
<table><tr><td>National Insurance (employee, 11%, up to BDS$5,360)</td><td id="s-nis"></td></tr><tr><td>Resilience and Regeneration Fund (0.25%)</td><td id="s-rr"></td></tr><tr><td>Income tax (PAYE)</td><td id="s-tax"></td></tr><tr class="sum"><td>Total deductions</td><td id="s-ded"></td></tr><tr class="sum"><td>Take-home pay per month</td><td id="s-net"></td></tr><tr><td>Take-home pay per year</td><td id="s-yr"></td></tr></table>
<p class="note">2026 rates, one employer, BDS$25,000 allowance and no other allowance or credit. Estimate, not payroll or tax advice.</p></div>
<script>(function(){''' + fmt_js('BDS$') + '''function run(){var g=num('s-gross'),nis=Math.min(g,5360)*0.11,rr=g*0.0025,tb=Math.max(g*12-25000,0),tax=(0.115*Math.min(tb,50000)+0.275*Math.max(tb-50000,0))/12,ded=nis+rr+tax;
document.getElementById('s-nis').textContent=m(nis,2);document.getElementById('s-rr').textContent=m(rr,2);document.getElementById('s-tax').textContent=m(tax,2);document.getElementById('s-ded').textContent=m(ded,2);document.getElementById('s-net').textContent=m(g-ded,2);document.getElementById('s-yr').textContent=m((g-ded)*12,2)}
document.getElementById('s-gross').addEventListener('input',run);run()})();</script>'''
_b5 = bb_emp(5000)
page('salary-after-tax-barbados',
     title='Salary after tax in Barbados (2026): take-home pay calculator',
     desc='Free take-home pay calculator for Barbados: enter your monthly gross salary and see National Insurance, the Resilience and Regeneration Fund, income tax and what you keep.',
     h1='Salary after tax in Barbados in 2026',
     lead='What do you really keep from a gross salary in Barbados? Enter your monthly pay and see the deductions (National Insurance, Resilience and Regeneration Fund, income tax) and your take-home pay. A table below shows common salaries.',
     bullets=['On BDS$5,000 gross a month, about %s is deducted and %s reaches your bank account.' % (bb(5000 - _b5[3]), bb(_b5[3])),
              'Deductions: employee National Insurance (11% up to BDS$5,360 a month), the 0.25% Resilience and Regeneration Fund and income tax (11.5% then 27.5% above the BDS$25,000 allowance).',
              'At the minimum wage (about BDS$1,856 a month) no income tax is due.'],
     sections=[('Calculate your take-home pay', [CALC_BB_NET]),
               ('Take-home pay by monthly salary', ['<div class="scrollx"><table><tr><th>Gross per month</th><th>Total deductions</th><th>Of which income tax</th><th>Take-home per month</th></tr>%s</table></div>' % rows, CHK_BB])],
     faq=[('How much tax do I pay on BDS$5,000 a month in Barbados?', 'About %s a month in income tax, on top of National Insurance and the Resilience and Regeneration Fund, with the 2026 rates and the BDS$25,000 allowance.' % bb(_b5[2])),
          ('What is the take-home pay on BDS$5,000 a month?', 'About %s a month after National Insurance, the Resilience and Regeneration Fund and income tax.' % bb(_b5[3])),
          ('Is National Insurance tax deductible in Barbados?', 'No. The BRA says National Insurance paid by an employee is not tax deductible, so it does not lower taxable income.')],
     related=[R_BB_PAYE, R('Income tax threshold in Barbados', 'income-tax-threshold-barbados', 'BDS$25,000 a year'), R_BB_NIS], cta=CTA)

# ===================================================================== 7. TVA / GCT / ITBIS comparés
page('vat-rates-caribbean-2026',
     title='VAT rates in the Caribbean 2026: Jamaica GCT, Trinidad VAT, Barbados VAT, Dominican ITBIS',
     desc='Sales tax compared: Jamaica GCT 15%, Trinidad and Tobago VAT 12.5%, Barbados VAT 17.5%, Dominican Republic ITBIS 18%. Registration thresholds and filing deadlines side by side.',
     h1='VAT and sales tax rates in the Caribbean in 2026',
     lead='Each Caribbean country charges its own sales tax, under a different name, at a different rate and with a different registration threshold. Here are the four countries Pa a Pa covers in detail, side by side.',
     bullets=['Rates: Jamaica GCT 15%, Trinidad and Tobago VAT 12.5%, Barbados VAT 17.5%, Dominican Republic ITBIS 18%.',
              'Registration thresholds: Jamaica J$15,000,000 of yearly sales, Trinidad and Tobago TT$500,000, Barbados BDS$350,000 from 1 October 2026 (it was BDS$200,000). The Dominican Republic has no minimum of sales.',
              'To add a tax to a price, multiply by 1 plus the rate; to remove it from a total, divide by the same number.'],
     sections=[('The rates side by side', ['<div class="scrollx"><table><tr><th>Country</th><th>Tax</th><th>Rate</th><th>You must register from</th><th>Returns</th></tr>'
                                           '<tr><td>Jamaica</td><td>GCT</td><td>15%</td><td>J$15,000,000 a year</td><td>Monthly or every two months, by the 25th of the next month</td></tr>'
                                           '<tr><td>Trinidad and Tobago</td><td>VAT</td><td>12.5%</td><td>TT$500,000 in twelve months</td><td>Period set at registration</td></tr>'
                                           '<tr><td>Barbados</td><td>VAT</td><td>17.5%</td><td>BDS$350,000 a year from 1 October 2026</td><td>Every two months, by the 21st of the next month</td></tr>'
                                           '<tr><td>Dominican Republic</td><td>ITBIS</td><td>18%</td><td>First taxable sale (RNC and NCF required)</td><td>Monthly, by the 20th of the next month</td></tr></table></div>',
                                           'In Barbados the threshold was BDS$200,000 until the 2026 Budget raised it to BDS$350,000 from 1 October 2026, according to PwC, EY and KPMG. The BRA pages may still show the old figure, so ask the BRA which amount applies. Some goods and services are zero-rated or exempt in every country: check the list with the tax authority. Figures last checked between 9 and 12 November 2026 against the tax authorities (TAJ, IRD, BRA, DGII).']),
               ('Quick maths', ['Price with tax = price x 1.15 (Jamaica), x 1.125 (Trinidad and Tobago), x 1.175 (Barbados) or x 1.18 (Dominican Republic). On a price of 1,000 before tax the tax is 150, 125, 175 or 180 in the local currency.'])],
     faq=[('What is the VAT rate in the Caribbean?', 'There is no regional rate. It is 15% in Jamaica (GCT), 12.5% in Trinidad and Tobago, 17.5% in Barbados and 18% in the Dominican Republic (ITBIS).'),
          ('Which Caribbean country has the highest VAT?', 'Of the four covered here, the Dominican Republic at 18%, then Barbados at 17.5%, Jamaica at 15% and Trinidad and Tobago at 12.5%.'),
          ('When must a small business register for VAT in the Caribbean?', 'Jamaica: J$15,000,000 of yearly sales. Trinidad and Tobago: TT$500,000 in twelve months. Barbados: BDS$350,000 a year from 1 October 2026. The Dominican Republic has no sales minimum.')],
     related=[R('Register for GCT in Jamaica', 'gct-registration-jamaica', 'rate, threshold and deadlines'), R('VAT calculator for Trinidad and Tobago', 'vat-calculator-trinidad-and-tobago', 'add or remove 12.5% VAT'),
              R('VAT calculator for Barbados', 'vat-calculator-barbados', 'add or remove 17.5% VAT'), ('Calculadora de ITBIS (in Spanish)', '../../es/guias/calculadora-itbis-republica-dominicana/', 'sumar o quitar el 18 %')], cta=CTA)

# ===================================================================== 8. Cotisations sociales comparées
page('social-security-contributions-caribbean-2026',
     title='Social security contributions in the Caribbean 2026: NIS in Jamaica, Trinidad, Barbados, TSS in the DR',
     desc='Employee and employer social security rates side by side: Jamaica NIS 3%, Trinidad and Tobago NIS 5.4% and 10.8%, Barbados NIS 11% and 12.75%, Dominican Republic TSS.',
     h1='Social security contributions in the Caribbean in 2026',
     lead='Employees and employers pay into a national scheme in every Caribbean country, at very different rates and ceilings. Here are the 2026 rates for the four countries Pa a Pa covers in detail.',
     bullets=['Jamaica (NIS): employee 3%, employer 3%, on pay up to J$5,000,000 a year.', 'Trinidad and Tobago (NIS): employee 5.4%, employer 10.8% in 2026 (6.4% and 12.8% from 4 January 2027), up to TT$13,600 a month.',
              'Barbados (NIS): employee 11%, employer 12.75%, up to BDS$5,360 a month, plus a 0.25% fund.', 'Dominican Republic (TSS): employee 3.04% health plus 2.87% pensions; the employer pays more, with a separate monthly ceiling for each fund.'],
     sections=[('The rates side by side', ['<div class="scrollx"><table><tr><th>Country</th><th>Employee</th><th>Employer</th><th>Self-employed</th><th>Ceiling</th></tr>'
                                           '<tr><td>Jamaica (NIS)</td><td>3%</td><td>3%</td><td>6%</td><td>J$5,000,000 a year</td></tr>'
                                           '<tr><td>Trinidad and Tobago (NIS)</td><td>5.4%</td><td>10.8%</td><td>Not yet covered, per the NIBTT FAQ</td><td>TT$13,600 a month</td></tr>'
                                           '<tr><td>Barbados (NIS)</td><td>11%</td><td>12.75%</td><td>17%</td><td>BDS$5,360 a month</td></tr>'
                                           '<tr><td>Dominican Republic (TSS)</td><td>3.04% health + 2.87% pensions</td><td>7.09% health + 7.10% pensions + about 1.2% work risks + 1% INFOTEP</td><td>Not covered here</td><td>RD$232,230 (health) and RD$464,460 (pensions) a month</td></tr></table></div>',
                                           'Barbados also charges a 0.25% Resilience and Regeneration Fund on gross pay, with no ceiling. Jamaica has other payroll contributions (NHT, Education Tax) that are not in this table: see the Jamaica guides. ' + CHK_ALL]),
               ('How to use these rates', ['Contribution = pay (up to the ceiling) x rate. The country calculators give the exact amount for your pay.'])],
     faq=[('What is the NIS rate in the Caribbean?', 'It depends on the country: 3% for employees in Jamaica, 5.4% in Trinidad and Tobago and 11% in Barbados in 2026. The Dominican Republic uses the TSS, with 3.04% health and 2.87% pensions for the employee.'),
          ('Who pays more, the employer or the employee?', 'In all four countries the employer\'s share is equal to or higher than the employee\'s share.'),
          ('Is there a ceiling on contributions?', 'Yes, in every country covered here, expressed per year in Jamaica and per month in the others.')],
     related=[R('NIS calculator for Jamaica', 'nis-calculator-jamaica', 'employee 3%, employer 3%'), R_TT_NIS, R_BB_NIS, ('Calculadora de la TSS (in Spanish)', '../../es/guias/calculadora-tss-republica-dominicana/', 'SFS, AFP y empleador')], cta=CTA)

urls = []
for slug, k in P:
    urls.append(B.build('en', slug, **k))

def edit(path, fn):
    p = os.path.join(ROOT, path); s = open(p, encoding='utf-8').read(); n = fn(s)
    if n != s: open(p, 'w', encoding='utf-8').write(n)

# liens entrants : « Read next » des pages existantes (idempotent)
def add_related(slugdir, href, label, desc):
    def f(s):
        if href in s: return s
        i = s.find('<div class="related">')
        if i < 0: return s
        j = s.index('</ul></div>', i)
        return s[:j] + '<li><a href="%s">%s</a> : %s</li>\n' % (href, label, desc) + s[j:]
    edit('caribbean/guides/%s/index.html' % slugdir, f)

add_related('jamaica-minimum-wage-2026', '../minimum-wage-caribbean-2026/', 'Minimum wage in the Caribbean 2026', 'four countries side by side')
add_related('trinidad-and-tobago-minimum-wage-2026', '../minimum-wage-caribbean-2026/', 'Minimum wage in the Caribbean 2026', 'four countries side by side')
add_related('barbados-minimum-wage-2026', '../minimum-wage-caribbean-2026/', 'Minimum wage in the Caribbean 2026', 'four countries side by side')
for sl in ['jamaica-minimum-wage-2026', 'trinidad-and-tobago-minimum-wage-2026', 'barbados-minimum-wage-2026']:
    add_related(sl, '../overtime-pay-calculator-caribbean/', 'Overtime pay calculator', 'time and a half and double time')
add_related('paye-calculator-trinidad-and-tobago', '../income-tax-threshold-trinidad-and-tobago/', 'Income tax threshold in Trinidad and Tobago', 'TT$90,000 a year')
add_related('trinidad-and-tobago-minimum-wage-2026', '../income-tax-threshold-trinidad-and-tobago/', 'Income tax threshold in Trinidad and Tobago', 'TT$90,000 a year')
add_related('nis-calculator-trinidad-and-tobago', '../income-tax-threshold-trinidad-and-tobago/', 'Income tax threshold in Trinidad and Tobago', 'TT$90,000 a year')
add_related('paye-calculator-barbados', '../income-tax-threshold-barbados/', 'Income tax threshold in Barbados', 'BDS$25,000 a year')
add_related('barbados-minimum-wage-2026', '../income-tax-threshold-barbados/', 'Income tax threshold in Barbados', 'BDS$25,000 a year')
add_related('nis-calculator-barbados', '../income-tax-threshold-barbados/', 'Income tax threshold in Barbados', 'BDS$25,000 a year')

add_related('paye-calculator-trinidad-and-tobago', '../salary-after-tax-trinidad-and-tobago/', 'Salary after tax in Trinidad and Tobago', 'take-home pay by salary')
add_related('income-tax-threshold-trinidad-and-tobago', '../salary-after-tax-trinidad-and-tobago/', 'Salary after tax in Trinidad and Tobago', 'take-home pay by salary')
add_related('paye-calculator-barbados', '../salary-after-tax-barbados/', 'Salary after tax in Barbados', 'take-home pay by salary')
add_related('income-tax-threshold-barbados', '../salary-after-tax-barbados/', 'Salary after tax in Barbados', 'take-home pay by salary')
for sl in ['vat-calculator-trinidad-and-tobago', 'vat-calculator-barbados', 'gct-registration-jamaica', 'gct-calculator-jamaica']:
    add_related(sl, '../vat-rates-caribbean-2026/', 'VAT rates in the Caribbean 2026', 'four countries side by side')
for sl in ['nis-calculator-jamaica', 'nis-calculator-trinidad-and-tobago', 'nis-calculator-barbados']:
    add_related(sl, '../social-security-contributions-caribbean-2026/', 'Social security contributions in the Caribbean', 'four countries side by side')
add_related('minimum-wage-caribbean-2026', '../vat-rates-caribbean-2026/', 'VAT rates in the Caribbean 2026', 'four countries side by side')
add_related('minimum-wage-caribbean-2026', '../social-security-contributions-caribbean-2026/', 'Social security contributions in the Caribbean', 'four countries side by side')

def add_sitemap(s):
    add = ''.join('  <url><loc>%s</loc><lastmod>2026-11-20</lastmod></url>\n' % u for u in urls if u not in s)
    return s.replace('</urlset>', add + '</urlset>') if add else s
edit('sitemap.xml', add_sitemap)
def add_llms(s):
    add = ''.join('- %s\n' % u for u in urls if u not in s)
    return s.rstrip('\n') + '\n' + add if add else s
edit('llms.txt', add_llms)
print('\n'.join(urls))
