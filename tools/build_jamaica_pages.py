# -*- coding: utf-8 -*-
"""9 pages Jamaïque (EN) : calculateurs et guides ciblés sur des recherches précises.
Usage (depuis la racine du dépôt) : python3 tools/build_jamaica_pages.py
Chiffres : TAJ, NHT, PwC Tax Summaries (voir les sources sur chaque page)."""
import os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_guides as B

B.DATE = '2026-11-10'
ROOT = B.ROOT
CHK = 'Figures last checked on 10 November 2026 against the official sources (TAJ, NHT) and the PwC Worldwide Tax Summaries. Confirm the current amount with the authority before you pay.'
CTA = ('Test your project with Jamaican rules', 'Free, no sign-up. Enter your sales and costs and get your taxes and take-home income.', '../../?c=JM#/test', 'Test my project in Jamaica')

# Seuils annuels d'impôt sur le revenu (TAJ) : 1 avril 2025 / 2026 / 2027
THR_2026 = 1876614   # année civile 2026 (3 mois à 1 799 376 + 9 mois à 1 902 360)
THR_2027 = 1978212   # année civile 2027 (3 mois à 1 902 360 + 9 mois à 2 003 496)

def se_tax(profit, thr=THR_2026):
    nis = min(profit, 5000000) * 0.06
    nht = profit * 0.03
    edu = max(profit - nis, 0) * 0.0225
    t = max(profit - nis, 0)
    inc = 0.25 * max(min(t, 6000000) - thr, 0) + 0.30 * max(t - 6000000, 0)
    return nis, nht, edu, inc, profit - nis - nht - edu - inc

def jm(n): return 'J$' + format(int(round(n)), ',')

R = lambda t, s, d: (t, '../%s/' % s, d)
R_TAX = R('Self-employed taxes in Jamaica', 'jamaica-self-employed-taxes', 'income tax, NIS, NHT and Education Tax')
R_CALC = R('Self-employed tax calculator for Jamaica', 'self-employed-tax-calculator-jamaica', 'enter your profit, see what you keep')
R_THR = R('Income tax threshold in Jamaica', 'income-tax-threshold-jamaica', 'the tax-free amount 2025 to 2027')
R_NIS = R('NIS contributions in Jamaica', 'nis-contributions-jamaica', 'rates and the yearly ceiling')
R_EDU = R('Education Tax in Jamaica', 'education-tax-jamaica', 'who pays and how')
R_NHT = R('NHT for the self-employed', 'nht-self-employed-jamaica', 'the 3% contribution and how to pay')
R_REG = R('Cost to register a business in Jamaica', 'register-a-business-in-jamaica-cost', 'business name or limited company')
R_GCT = R('GCT registration in Jamaica', 'gct-registration-jamaica', 'the threshold and the deadlines')
R_TRN = R('How to get a TRN in Jamaica', 'trn-jamaica-how-to-get', 'the tax number you need first')
R_DL = R('Jamaica tax deadlines for small businesses', 'jamaica-tax-deadlines-quarterly', 'the dates to put in your calendar')
R_S04 = R('Form S04 and quarterly payments', 'form-s04-jamaica', 'the yearly estimate')
R_KEEP = R('How much do you keep after tax in Jamaica?', 'how-much-do-i-keep-self-employed-jamaica', 'take-home pay at different profit levels')
R_HIRE = R('Cost of hiring an employee in Jamaica', 'cost-of-hiring-employee-jamaica', 'employer contributions on top of salary')
R_BE = R('Break-even calculator for Jamaica', 'break-even-calculator-jamaica', 'how much you must sell')

CALC_CSS = ('<style>.calc{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin:20px 0}'
            '.calc label{display:block;font-weight:600;margin:12px 0 4px}'
            '.calc input,.calc select{width:100%;font:inherit;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}'
            '.calc table{width:100%;border-collapse:collapse;margin-top:14px}.calc td{padding:7px 4px;border-bottom:1px solid var(--line)}'
            '.calc td:last-child{text-align:right;font-variant-numeric:tabular-nums}.calc tr.sum td{font-weight:700;border-bottom:0}'
            '.calc .note{color:var(--muted);font-size:.92rem;margin-top:10px}</style>')
FMT = "function jm(n){return 'J$'+Math.round(n).toLocaleString('en-US')}function num(id){var v=parseFloat(document.getElementById(id).value);return isNaN(v)||v<0?0:v}"

CALC_SE = CALC_CSS + '''<div class="calc" id="calc-se"><strong>Calculator: what do you keep after tax?</strong>
<label for="se-profit">Yearly profit before tax (J$)</label><input id="se-profit" type="number" inputmode="numeric" min="0" step="10000" value="3000000">
<label for="se-year">Tax year</label><select id="se-year"><option value="1876614">2026 (tax-free amount J$1,876,614)</option><option value="1978212">2027 (tax-free amount J$1,978,212)</option></select>
<table><tr><td>NIS (6%, up to J$5,000,000)</td><td id="se-nis"></td></tr><tr><td>NHT (3%)</td><td id="se-nht"></td></tr><tr><td>Education Tax (2.25% after NIS)</td><td id="se-edu"></td></tr><tr><td>Income tax</td><td id="se-inc"></td></tr><tr class="sum"><td>Left for you, per year</td><td id="se-net"></td></tr><tr class="sum"><td>Left for you, per month</td><td id="se-mon"></td></tr></table>
<p class="note">Estimate for a self-employed person with no other income. Not tax advice: confirm with Tax Administration Jamaica (TAJ).</p></div>
<script>(function(){''' + FMT + '''function run(){var p=num('se-profit'),t=parseFloat(document.getElementById('se-year').value);var nis=Math.min(p,5000000)*0.06,nht=p*0.03,edu=Math.max(p-nis,0)*0.0225,x=Math.max(p-nis,0);var inc=0.25*Math.max(Math.min(x,6000000)-t,0)+0.30*Math.max(x-6000000,0);var net=p-nis-nht-edu-inc;
document.getElementById('se-nis').textContent=jm(nis);document.getElementById('se-nht').textContent=jm(nht);document.getElementById('se-edu').textContent=jm(edu);document.getElementById('se-inc').textContent=jm(inc);document.getElementById('se-net').textContent=jm(net);document.getElementById('se-mon').textContent=jm(net/12)}
['se-profit','se-year'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>'''

CALC_HIRE = CALC_CSS + '''<div class="calc" id="calc-hire"><strong>Calculator: what does an employee really cost?</strong>
<label for="h-sal">Gross monthly salary (J$)</label><input id="h-sal" type="number" inputmode="numeric" min="0" step="1000" value="150000">
<label for="h-heart">HEART Trust levy (3%)</label><select id="h-heart"><option value="1">Include HEART 3%</option><option value="0">My business is not liable for HEART</option></select>
<table><tr><td>NIS employer (3%, up to J$5,000,000 a year)</td><td id="h-nis"></td></tr><tr><td>NHT employer (3%)</td><td id="h-nht"></td></tr><tr><td>Education Tax employer (3.5% after employee NIS)</td><td id="h-edu"></td></tr><tr><td>HEART Trust (3%)</td><td id="h-heartv"></td></tr><tr class="sum"><td>Extra cost per month</td><td id="h-extra"></td></tr><tr class="sum"><td>Total monthly cost of the employee</td><td id="h-tot"></td></tr></table>
<p class="note">Employer side only. The employee also pays NIS, NHT, Education Tax and income tax out of the salary. Estimate, not payroll advice.</p></div>
<script>(function(){''' + FMT + '''function run(){var s=num('h-sal'),h=document.getElementById('h-heart').value==='1';var nis=Math.min(s,5000000/12)*0.03,nht=s*0.03,empNis=Math.min(s,5000000/12)*0.03,edu=Math.max(s-empNis,0)*0.035,hr=h?s*0.03:0,ex=nis+nht+edu+hr;
document.getElementById('h-nis').textContent=jm(nis);document.getElementById('h-nht').textContent=jm(nht);document.getElementById('h-edu').textContent=jm(edu);document.getElementById('h-heartv').textContent=jm(hr);document.getElementById('h-extra').textContent=jm(ex);document.getElementById('h-tot').textContent=jm(s+ex)}
['h-sal','h-heart'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>'''

CALC_BE = CALC_CSS + '''<div class="calc" id="calc-be"><strong>Calculator: how much must you sell?</strong>
<label for="b-fix">Fixed costs per month (rent, internet, loan, your own pay) (J$)</label><input id="b-fix" type="number" inputmode="numeric" min="0" step="1000" value="150000">
<label for="b-price">Selling price per item (J$)</label><input id="b-price" type="number" inputmode="numeric" min="0" step="10" value="2500">
<label for="b-var">Cost per item you sell (materials, packaging, delivery) (J$)</label><input id="b-var" type="number" inputmode="numeric" min="0" step="10" value="1500">
<table><tr><td>Margin per item</td><td id="b-m"></td></tr><tr class="sum"><td>Items to sell per month to break even</td><td id="b-n"></td></tr><tr class="sum"><td>Sales per month at break-even</td><td id="b-s"></td></tr></table>
<p class="note">Break-even is before income tax and contributions on your own profit. Put your own pay in the fixed costs.</p></div>
<script>(function(){''' + FMT + '''function run(){var f=num('b-fix'),p=num('b-price'),v=num('b-var'),m=p-v;document.getElementById('b-m').textContent=jm(m);
if(m<=0){document.getElementById('b-n').textContent='Price must be above cost';document.getElementById('b-s').textContent='';return}
var n=Math.ceil(f/m);document.getElementById('b-n').textContent=n.toLocaleString('en-US');document.getElementById('b-s').textContent=jm(n*p)}
['b-fix','b-price','b-var'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>'''

# tableau statique : ce qu'il reste à différents niveaux de bénéfice
levels = [1500000, 2000000, 2500000, 3000000, 4000000, 5000000, 6000000, 8000000]
rows = ''
for L in levels:
    nis, nht, edu, inc, net = se_tax(L)
    rows += '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % (jm(L), jm(nis + nht + edu + inc), jm(net), jm(net / 12))
KEEP_TABLE = '<div class="scrollx"><table><tr><th>Profit per year</th><th>Total tax and contributions</th><th>You keep per year</th><th>You keep per month</th></tr>%s</table></div>' % rows

B.G = {}
PAGES = []
def P(slug, **k): PAGES.append((slug, k))

P('self-employed-tax-calculator-jamaica',
  title='Self-employed tax calculator for Jamaica (2026): income tax, NIS, NHT, Education Tax',
  desc='Free calculator: enter your yearly profit and see what a self-employed person keeps in Jamaica after income tax, NIS (6%), NHT (3%) and Education Tax (2.25%). Tax years 2026 and 2027.',
  h1='Self-employed tax calculator for Jamaica',
  lead='Enter your yearly profit and see the four things that come out of it: NIS, NHT, Education Tax and income tax. It uses the 2026 or 2027 tax-free amount from Tax Administration Jamaica (TAJ).',
  bullets=['NIS 6% up to J$5,000,000, NHT 3%, Education Tax 2.25% after NIS.', 'Income tax: 25% above the tax-free amount, then 30% above J$6,000,000.', 'The tax-free amount for the whole of 2026 is J$1,876,614 (the rise to J$1,902,360 starts in April).'],
  sections=[('The calculator', [CALC_SE]),
            ('How the result is worked out', ['Start from your profit: sales minus your costs. NIS is 6% of profit up to J$5,000,000 and is taken off before income tax. Education Tax is 2.25% of profit after NIS. NHT is 3% of profit. Income tax is 25% of what remains above the tax-free amount, up to J$6,000,000, and 30% above that.', 'See the full explanation with an example in <a href="../jamaica-self-employed-taxes/">Self-employed taxes in Jamaica</a>. ' + CHK])],
  faq=[('How much tax does a self-employed person pay in Jamaica?', 'It depends on profit. On J$3,000,000 of profit, about J$%s goes to income tax, NIS, NHT and Education Tax together in 2026. Use the calculator above for your own figure.' % format(int(round(sum(se_tax(3000000)[:4]))), ',')),
       ('Which tax-free amount applies in 2026?', 'The yearly amount rose to J$1,902,360 on 1 April 2026. Because the rise starts in April, the effective amount for the whole of 2026 is J$1,876,614, according to TAJ.'),
       ('Is this calculator tax advice?', 'No. It is an estimate for planning. Confirm the exact amounts with TAJ.')],
  related=[R_TAX, R_THR, R_KEEP], cta=CTA)

P('income-tax-threshold-jamaica',
  title='Income tax threshold in Jamaica: tax-free amount for 2025, 2026 and 2027',
  desc='The Jamaican income tax threshold (tax-free amount): J$1,799,376 from April 2025, J$1,902,360 from April 2026 and J$2,003,496 from April 2027, with the effective amount per calendar year.',
  h1='Income tax threshold in Jamaica (2025 to 2027)',
  lead='The tax-free amount is the part of your yearly income on which you pay no income tax. Jamaica is raising it in steps, each on 1 April. Because the rise starts in April, the amount that applies to a whole calendar year is slightly lower than the new yearly figure.',
  bullets=['From 1 April 2026: J$1,902,360 a year (J$158,530 a month).', 'Effective amount for the whole of calendar year 2026: J$1,876,614.', 'Next step on 1 April 2027: J$2,003,496 a year (J$166,958 a month).'],
  sections=[('The amounts, step by step', ['<div class="scrollx"><table><tr><th>From</th><th>Yearly amount</th><th>Monthly amount</th><th>Effective for that calendar year</th></tr><tr><td>1 April 2025</td><td>J$1,799,376</td><td>J$149,948</td><td>-</td></tr><tr><td>1 April 2026</td><td>J$1,902,360</td><td>J$158,530</td><td>J$1,876,614</td></tr><tr><td>1 April 2027</td><td>J$2,003,496</td><td>J$166,958</td><td>J$1,978,212</td></tr></table></div>', 'The effective amount for a calendar year is three months at the old yearly figure and nine months at the new one. For 2026: J$449,844 plus J$1,426,770 = J$1,876,614.']),
            ('Who gets it', ['Tax-resident individuals, employed or self-employed. Non-residents do not get the tax-free amount and pay 25% from the first dollar of Jamaican income, according to PwC.']),
            ('What it means for you', ['Work out your tax with the <a href="../self-employed-tax-calculator-jamaica/">self-employed tax calculator</a>. ' + CHK])],
  faq=[('What is the income tax threshold in Jamaica in 2026?', 'J$1,902,360 a year from 1 April 2026, which is J$158,530 a month. For the whole calendar year 2026 the effective amount is J$1,876,614.'),
       ('When does the threshold rise again?', 'On 1 April 2027, to J$2,003,496 a year, according to the TAJ schedule.'),
       ('Do non-residents get the tax-free amount?', 'No. Non-residents pay 25% from the first dollar of Jamaican income.')],
  related=[R_CALC, R_TAX, R_KEEP], cta=CTA)

P('how-much-do-i-keep-self-employed-jamaica',
  title='How much do you keep after tax in Jamaica? Self-employed take-home pay (2026)',
  desc='What a self-employed person in Jamaica keeps from J$1.5 million to J$8 million of yearly profit after income tax, NIS, NHT and Education Tax, with the monthly take-home amount.',
  h1='How much do you keep after tax in Jamaica?',
  lead='A self-employed person pays income tax and three contributions out of profit. This table shows what is left at different yearly profit levels, using the 2026 rules. Find your row, or use the calculator for an exact figure.',
  bullets=['Based on 2026 rules: tax-free amount J$1,876,614, NIS 6%, NHT 3%, Education Tax 2.25%.', 'Profit means sales minus your business costs, before tax.', 'Up to about J$2 million of profit you pay almost no income tax, but you still pay the contributions.'],
  sections=[('Take-home pay by profit level', [KEEP_TABLE, 'Estimates for a self-employed person with no other income. ' + CHK]),
            ('Your own number', ['Use the <a href="../self-employed-tax-calculator-jamaica/">self-employed tax calculator</a> for your exact profit, or test your whole project with the free business test below.'])],
  faq=[('How much does a self-employed person keep on J$3,000,000 of profit in Jamaica?', 'About %s a year, or %s a month, after income tax, NIS, NHT and Education Tax, under 2026 rules.' % (jm(se_tax(3000000)[4]), jm(se_tax(3000000)[4] / 12))),
       ('Do I pay contributions if I pay no income tax?', 'Yes. NIS, NHT and Education Tax apply to your profit even when it is below the income tax threshold.')],
  related=[R_CALC, R_TAX, R_THR], cta=CTA)

P('nht-self-employed-jamaica',
  title='NHT contributions for the self-employed in Jamaica: rate and how to pay',
  desc='Self-employed people in Jamaica contribute 3% of income to the National Housing Trust (NHT). How to register through TAJ and pay by 15 March, June, September and December.',
  h1='NHT contributions for the self-employed in Jamaica',
  lead='The National Housing Trust (NHT) helps contributors get housing loans. If you work for yourself, you contribute to it yourself, because there is no employer to do it for you.',
  bullets=['Most self-employed people contribute 3% of their income.', 'You register as a self-employed contributor through Tax Administration Jamaica (TAJ).', 'You pay by the 15th of March, June, September and December.'],
  sections=[('The rate', ['The NHT says self-employed people in categories 1 to 5 contribute 3% of their income. Some categories, such as domestic workers and local caregivers in private homes, contribute 2% of gross earnings. Check which category applies to you with the NHT or TAJ.']),
            ('How to register and pay', [['Get your TRN from TAJ if you do not have one yet (see <a href="../trn-jamaica-how-to-get/">how to get a TRN</a>).', 'Register as a self-employed contributor through the TAJ website or at the NHT compliance department in a branch office.', 'Pay at TAJ, online or in office, by the 15th of March, June, September and December.']]),
            ('Add it to your budget', ['NHT is one of four amounts that come out of your profit with income tax, NIS and Education Tax. See the <a href="../self-employed-tax-calculator-jamaica/">calculator</a> for the total. ' + CHK])],
  faq=[('What is the NHT rate for the self-employed in Jamaica?', 'Most self-employed people contribute 3% of their income, according to the NHT. A few categories contribute 2%.'),
       ('When do I pay NHT as a self-employed person?', 'By the 15th of March, June, September and December, at Tax Administration Jamaica.'),
       ('Do I get the money back?', 'NHT contributions give access to housing benefits for contributors. Ask the NHT for the exact refund and loan conditions that apply to you.')],
  related=[R_CALC, R_NIS, R_EDU], cta=CTA)

P('trn-jamaica-how-to-get',
  title='How to get a TRN in Jamaica: the tax number every business needs first',
  desc='The Taxpayer Registration Number (TRN) in Jamaica: what it is, why you need it before registering a business, and how to apply through Tax Administration Jamaica (TAJ).',
  h1='How to get a TRN in Jamaica',
  lead='The Taxpayer Registration Number (TRN) is a nine-digit number that identifies you to the tax office. You need it for almost every step of starting a business, so it is the first thing to get.',
  bullets=['The TRN is issued by Tax Administration Jamaica (TAJ).', 'You need it before you can file returns, register for GCT or pay NHT as a self-employed person.', 'For a sole trader, your personal TRN is usually the one used for the business.'],
  sections=[('What you need to apply', [['A completed and signed TRN application form from TAJ.', 'A valid photo ID such as a passport or driver\'s licence.', 'Proof of your address, such as a utility bill.']]),
            ('Where to apply', ['Apply through the TAJ website or at a TAJ office. Requirements can change, so check the current list on <a href="https://www.jamaicatax.gov.jm" rel="noopener">jamaicatax.gov.jm</a> or call 888-TAX-HELP (888-829-4357).']),
            ('Companies and sole traders', ['A sole trader registers a business name at the Companies Office of Jamaica (COJ) and normally uses a personal TRN. A limited company must register with the COJ first and then receives its own TRN. See <a href="../register-a-business-in-jamaica-cost/">the cost to register a business</a>.']),
            ('What comes next', ['Once you have a TRN you can register for the taxes that apply to you: income tax, <a href="../nht-self-employed-jamaica/">NHT</a>, NIS and, above J$15,000,000 of yearly sales, <a href="../gct-registration-jamaica/">GCT</a>. ' + CHK])],
  faq=[('What is a TRN in Jamaica?', 'The Taxpayer Registration Number, a nine-digit number issued by Tax Administration Jamaica to identify every taxpayer.'),
       ('Do I need a TRN to start a business in Jamaica?', 'Yes. You need it for almost every registration step.'),
       ('Does a sole trader need a separate TRN?', 'Usually not. A sole trader normally uses their personal TRN. A limited company gets its own.')],
  related=[R_REG, R_NHT, R_GCT], cta=CTA)

P('cost-of-hiring-employee-jamaica',
  title='Cost of hiring an employee in Jamaica: employer NIS, NHT, Education Tax and HEART',
  desc='What it really costs to hire your first employee in Jamaica: employer NIS 3%, NHT 3%, Education Tax 3.5% and HEART 3%, about 12.5% on top of the salary. Free calculator.',
  h1='Cost of hiring an employee in Jamaica',
  lead='A salary is not the whole cost of an employee. As an employer you also pay four contributions on top. Together they add roughly 12.5% to the gross salary. Use the calculator to see the real monthly cost.',
  bullets=['Employer NIS 3% (up to J$5,000,000 a year) and NHT 3%.', 'Employer Education Tax 3.5% and HEART Trust levy 3%.', 'You deduct the employee\'s share from their pay and remit everything to TAJ by the 14th of the following month.'],
  sections=[('The calculator', [CALC_HIRE]),
            ('What you must do as an employer', [['Register as an employer with TAJ.', 'Deduct PAYE, the employee\'s NIS, NHT and Education Tax from each salary.', 'Remit these deductions and your own employer contributions by the 14th of the month after payment.']]),
            ('Plan before you hire', ['Add about 12.5% to every salary in your <a href="../../">business test</a> before deciding whether you can afford a first employee. The HEART levy applies once your wage bill passes the threshold set by HEART/NSTA, so confirm it for your case. ' + CHK])],
  faq=[('How much does an employer pay on top of salary in Jamaica?', 'Employer NIS 3%, NHT 3%, Education Tax 3.5% and HEART 3%, about 12.5% together, according to PwC and TAJ guidance.'),
       ('When are payroll contributions due?', 'By the 14th day of the month after the salary is paid.'),
       ('Does a sole trader need to register as an employer?', 'Yes, as soon as you hire. You register for PAYE and deduct and remit contributions to TAJ.')],
  related=[R_DL, R_TAX, R_NIS], cta=CTA)

P('freelancer-tax-jamaica',
  title='Freelancer and content creator taxes in Jamaica (2026): what you pay and when',
  desc='Taxes for freelancers, creatives and content creators in Jamaica: you are self-employed, so you pay income tax, NIS, NHT and Education Tax, quarterly. Steps to register and what to keep.',
  h1='Freelancer and content creator taxes in Jamaica',
  lead='Freelancers, designers, photographers, developers and content creators are treated as self-employed in Jamaica. Being self-employed does not exempt you from paying taxes: you are solely responsible for paying them to Tax Administration Jamaica (TAJ).',
  bullets=['You pay income tax on profit above the tax-free amount, plus NIS, NHT and Education Tax.', 'Payments are quarterly: March 15, June 15, September 15 and December 15.', 'Keep a record of every payment received and every business cost.'],
  sections=[('What you pay', ['The same four amounts as any self-employed person. Try the <a href="../self-employed-tax-calculator-jamaica/">calculator</a> with your expected yearly profit. Up to about J$2 million of profit you pay almost no income tax, but contributions still apply.']),
            ('What to do first', [['Get a <a href="../trn-jamaica-how-to-get/">TRN</a> from TAJ.', 'Register a business name at the Companies Office of Jamaica if you invoice under a business name (see <a href="../register-a-business-in-jamaica-cost/">the cost</a>).', 'Register as a self-employed contributor for <a href="../nht-self-employed-jamaica/">NHT</a> and NIS.', 'Put the quarterly dates in your calendar: see the <a href="../jamaica-tax-deadlines-quarterly/">tax deadlines</a>.']]),
            ('Keep your records', ['Save invoices, receipts and bank statements. Your profit is sales minus business costs, so every cost you can prove lowers your taxable profit. Separate your business money from personal money from day one.']),
            ('When GCT applies', ['General Consumption Tax is only required once your yearly taxable sales reach J$15,000,000. See <a href="../gct-registration-jamaica/">GCT registration</a>. ' + CHK])],
  faq=[('Do freelancers pay tax in Jamaica?', 'Yes. Freelancers are self-employed and pay income tax above the tax-free amount, plus NIS, NHT and Education Tax.'),
       ('Do I have to register a company to freelance?', 'No. You can work as a sole trader. You need a TRN, and a registered business name if you trade under one.'),
       ('When do freelancers pay tax in Jamaica?', 'Four times a year: March 15, June 15, September 15 and December 15.')],
  related=[R_CALC, R_TRN, R_DL], cta=CTA)

P('jamaica-tax-deadlines-quarterly',
  title='Jamaica tax deadlines for small businesses: quarterly, monthly and yearly dates',
  desc='Tax dates for small businesses in Jamaica: self-employed payments on 15 March, June, September and December; payroll by the 14th; GCT returns by the 25th; yearly estimate by 15 March.',
  h1='Jamaica tax deadlines for small businesses',
  lead='Most penalties come from missed dates, not from the tax itself. Here are the dates a small business in Jamaica should put in its calendar, depending on whether you work alone or have employees.',
  bullets=['Self-employed payments: March 15, June 15, September 15 and December 15.', 'Payroll deductions and employer contributions: by the 14th of the following month.', 'GCT returns: by the 25th of the month after the period.'],
  sections=[('If you work for yourself', ['<div class="scrollx"><table><tr><th>When</th><th>What</th></tr><tr><td>15 March, 15 June, 15 September, 15 December</td><td>Quarterly payments of income tax, NIS, NHT and Education Tax to TAJ</td></tr><tr><td>15 March</td><td>Yearly estimate, form S04A (see <a href="../form-s04-jamaica/">Form S04</a>)</td></tr></table></div>']),
            ('If you have employees', ['<div class="scrollx"><table><tr><th>When</th><th>What</th></tr><tr><td>14th of each month</td><td>PAYE, NIS, NHT, Education Tax and HEART for the previous month</td></tr></table></div>', 'Late payment brings penalties and interest. See <a href="../cost-of-hiring-employee-jamaica/">the cost of hiring an employee</a>.']),
            ('If you are registered for GCT', ['<div class="scrollx"><table><tr><th>When</th><th>What</th></tr><tr><td>25th of the month after the period</td><td>GCT return, monthly or every two months</td></tr></table></div>', 'See <a href="../gct-registration-jamaica/">GCT registration</a>. ' + CHK])],
  faq=[('When do self-employed people pay tax in Jamaica?', 'On 15 March, 15 June, 15 September and 15 December.'),
       ('When are payroll deductions due in Jamaica?', 'By the 14th day of the month after the salary was paid.'),
       ('When are GCT returns due?', 'By the 25th of the month after the period.')],
  related=[R_S04, R_TAX, R_HIRE], cta=CTA)

P('break-even-calculator-jamaica',
  title='Break-even calculator for a small business in Jamaica',
  desc='Free break-even calculator in Jamaican dollars: enter your fixed costs, selling price and cost per item to see how many items you must sell each month to stop losing money.',
  h1='Break-even calculator for a small business in Jamaica',
  lead='Your break-even point is the number of items you must sell each month before you stop losing money. Enter your fixed costs, your price and what each item costs you, and the calculator does the rest.',
  bullets=['Break-even = fixed costs per month divided by the margin per item.', 'Margin per item = selling price minus what the item costs you.', 'Put your own pay in the fixed costs, or you will break even but still not eat.'],
  sections=[('The calculator', [CALC_BE]),
            ('Read the result', ['If the number of items looks impossible for your market, change something now: raise the price, cut a cost, or aim for a smaller fixed cost. Then add tax: the <a href="../self-employed-tax-calculator-jamaica/">self-employed tax calculator</a> shows what is left once taxes are paid.']),
            ('Learn the idea', ['Read <a href="../fixed-costs-vs-variable-costs/">fixed costs vs variable costs</a> to be sure which of your costs go in which box. ' + CHK])],
  faq=[('What is a break-even point?', 'The sales level at which your income exactly covers your costs. Below it you lose money, above it you make a profit.'),
       ('How do I calculate break-even?', 'Divide your monthly fixed costs by the margin on each item, which is the selling price minus the cost of the item.'),
       ('Does break-even include tax?', 'No. It is before income tax and contributions on your own profit.')],
  related=[R_CALC, R_KEEP, R_TAX], cta=CTA)

urls = []
for slug, k in PAGES:
    urls.append(B.build('en', slug, **k))

# --- liens depuis les pages existantes, sitemap, llms.txt (idempotent) ---
def edit(path, fn):
    p = os.path.join(ROOT, path); s = open(p, encoding='utf-8').read(); n = fn(s)
    if n != s: open(p, 'w', encoding='utf-8').write(n)

new_links = ''.join('<li><a href="../guides/%s/">%s</a></li>' % (s, re.sub(r'<.*?>', '', k['h1'])) for s, k in PAGES)
def jm_page(s):
    if PAGES[0][0] in s: return s
    return s.replace('<li><a href="../guides/form-s04-jamaica/">Form S04 and quarterly payments</a></li></ul>', '<li><a href="../guides/form-s04-jamaica/">Form S04 and quarterly payments</a></li>' + new_links + '</ul>', 1)
edit('caribbean/jamaica/index.html', jm_page)

def add_sitemap(s):
    add = ''.join('  <url><loc>%s</loc><lastmod>2026-11-10</lastmod></url>\n' % u for u in urls if u not in s)
    return s.replace('</urlset>', add + '</urlset>') if add else s
edit('sitemap.xml', add_sitemap)
def add_llms(s):
    add = ''.join('- %s\n' % u for u in urls if u not in s)
    return s.rstrip('\n') + '\n' + add if add else s
edit('llms.txt', add_llms)
print('\n'.join(urls))
