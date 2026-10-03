/* Pa a Pa Caribbean: calculation and report engine (no DOM). */
(function (root) {
  'use strict';

  const num = v => Math.max(0, parseFloat(String(v == null ? '' : v).replace(/,/g, '')) || 0);
  const J = n => (n < 0 ? '-' : '') + 'J$' + Math.round(Math.abs(n)).toLocaleString('en-US');
  const pct = r => parseFloat((r * 100).toFixed(2)) + '%';

  function compute(D, input) {
    const T = D.taxes, SE = D.selfEmployedContributions, EC = D.employerContributions, EE = D.employeeContributions;
    const c = {
      status: input.status,
      sales: num(input.sales), direct: num(input.direct), fixed: num(input.fixed), needs: num(input.needs),
      emp: Math.round(num(input.emp)), pay: num(input.pay), startup: num(input.startup), savings: num(input.savings)
    };
    c.annualSales = c.sales * 12;
    c.payroll = c.emp * c.pay * 12;
    const nisBase = c.emp * Math.min(c.pay * 12, SE.nis.ceilingJMD);
    c.heart = c.emp >= EC.heartNta.minEmployees && c.payroll / 12 > EC.heartNta.monthlyPayrollThresholdJMD;
    c.er = nisBase * EC.nis + c.payroll * EC.nht
      + Math.max(0, c.payroll - nisBase * EE.nis) * EC.educationTax
      + (c.heart ? c.payroll * EC.heartNta.rate : 0);
    c.profit = c.annualSales - (c.direct + c.fixed) * 12 - c.payroll - c.er;
    const p = Math.max(0, c.profit);
    c.nis = c.nht = c.edu = c.incomeTax = c.corpTax = 0;
    if (c.status === 'limited_company') {
      c.corpTax = p * T.corporateIncomeTax.standardRate;
      c.levies = c.corpTax;
    } else {
      c.nis = Math.min(p, SE.nis.ceilingJMD) * SE.nis.rate;
      c.nht = p * SE.nht.rate;
      const base = Math.max(0, p - c.nis);
      c.edu = base * SE.educationTax.rate;
      const thr = T.personalIncomeTax.thresholdJMD, cut = T.personalIncomeTax.brackets[0].upToJMD;
      c.incomeTax = base > thr ? T.personalIncomeTax.brackets[0].rate * (Math.min(base, cut) - thr)
        + T.personalIncomeTax.brackets[1].rate * Math.max(0, base - cut) : 0;
      c.levies = c.nis + c.nht + c.edu + c.incomeTax;
    }
    c.net = c.profit - c.levies;
    c.netMonthly = c.net / 12;
    c.setAside = c.levies / 12;
    c.gct = c.annualSales >= T.gct.registrationThresholdJMD;
    c.margin = c.sales > 0 ? (c.sales - c.direct) / c.sales : 0;

    const mode = input.payMode || 'now';
    const share = mode === 'later' ? 1 : mode === 'both' ? Math.min(100, num(input.creditShare)) / 100 : 0;
    c.credit = share > 0;
    c.bfr = Math.max(0, c.sales * share * num(input.cdays) / 30 - c.direct * num(input.sdays) / 30);
    c.motivation = (+input.m1 || 0) + (+input.m2 || 0) + (+input.m3 || 0);
    c.left = c.savings - c.startup;
    c.runway = c.needs > 0 ? Math.max(0, c.left) / c.needs : null;
    return c;
  }

  // Monthly sales needed so that what is left after tax covers living needs.
  function breakEven(D, input) {
    const base = compute(D, input);
    if (base.margin <= 0 || base.sales <= 0) return null;
    const ratio = base.direct / base.sales;
    const at = s => compute(D, Object.assign({}, input, { sales: s, direct: s * ratio })).netMonthly;
    let lo = 0, hi = Math.max(base.sales * 2, 100000);
    while (at(hi) < base.needs && hi < 1e10) hi *= 2;
    if (at(hi) < base.needs) return null;
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (at(mid) >= base.needs) hi = mid; else lo = mid; }
    return hi;
  }

  function stress(D, input, factor) {
    const s = num(input.sales) * factor, d = num(input.direct) * factor;
    return compute(D, Object.assign({}, input, { sales: s, direct: d }));
  }

  function buildReport(D, input) {
    const c = compute(D, input);
    const be = breakEven(D, input);
    const st = stress(D, input, 0.8);
    const gctLine = D.taxes.gct.registrationThresholdJMD;
    const gap = c.netMonthly - c.needs;
    const short = gap < 0;

    let verdict;
    if (c.netMonthly <= 0 || c.netMonthly < 0.5 * c.needs) verdict = 'no';
    else if (short || c.left < 0 || c.motivation < 8 || (c.credit && c.bfr > Math.max(0, c.left))) verdict = 'cond';
    else verdict = 'ok';

    const strengths = [], weaknesses = [], opportunities = [], risks = [], recs = [];

    // Strengths
    if (c.margin >= 0.4) strengths.push(`After the cost of what you sell, you keep ${pct(c.margin)} of each sale. That leaves room to pay your other costs.`);
    if (!short && c.sales > 0) strengths.push(`Your plan covers your living needs after taxes and contributions (${J(c.netMonthly)} per month).`);
    if (c.left >= 0 && c.runway !== null && c.runway >= 3) strengths.push(`Your savings cover the start-up costs and about ${c.runway.toFixed(1)} months of living costs.`);
    if (c.sales > 0 && c.fixed * 12 / c.annualSales <= 0.2) strengths.push('Your fixed costs are small compared with your sales, so slow months hurt less.');
    if (+input.m3 >= 4) strengths.push('You already know who your first customers will be.');
    if (c.motivation >= 12) strengths.push(`Your motivation is strong (${c.motivation} out of 15).`);
    if (!strengths.length) strengths.push('You have started by putting numbers on your idea. Every answer makes the next steps clearer.');

    // Weaknesses
    if (c.netMonthly <= 0) weaknesses.push(`Your plan loses ${J(-c.netMonthly)} per month after taxes. It cannot pay your bills as it stands.`);
    else if (short) weaknesses.push(`Your plan leaves ${J(c.netMonthly)} per month, which is ${J(-gap)} below your living needs.`);
    if (c.sales > 0 && c.margin < 0.25) weaknesses.push(`Only ${pct(Math.max(0, c.margin))} of each sale is left after the cost of what you sell. Your prices or your purchase costs may need work.`);
    if (be && c.sales > 0 && be > c.sales * 1.02) weaknesses.push(`You need about ${J(be)} in sales per month to cover your costs, your taxes and your living needs. You planned ${J(c.sales)}.`);
    if (c.left < 0) weaknesses.push(`Your savings fall ${J(-c.left)} short of your start-up costs.`);
    else if (c.runway !== null && c.runway < 3 && c.needs > 0) weaknesses.push(`After start-up costs, your savings would cover only ${c.runway.toFixed(1)} months of living costs if income stopped.`);
    if (+input.m3 > 0 && +input.m3 <= 2) weaknesses.push('You do not yet know who your first customers will be.');
    if (+input.m1 > 0 && +input.m1 <= 2) weaknesses.push('Irregular income worries you. You will need a cash reserve before you start.');
    if (!weaknesses.length) weaknesses.push('No major weakness shows in your numbers. Check them again every month once you start.');

    // Opportunities
    if (!c.credit) opportunities.push('Your customers pay on the spot, so you do not have to fund their delay.');
    if (!c.gct) opportunities.push(`Your yearly sales are below ${J(gctLine)}, so you do not have to charge GCT yet. Your paperwork stays lighter.`);
    if (c.status === 'business_name') opportunities.push('A registered business name lets you advertise under it and build a name customers recognise.');
    opportunities.push('Small-business support bodies such as JBDC and DBJ exist. Ask them what advice and financing are open now.');

    // Risks
    const stressNote = st.netMonthly <= 0 ? `you would lose ${J(-st.netMonthly)} per month` : `you would keep about ${J(st.netMonthly)} per month${st.netMonthly < c.needs ? ', below your living needs' : ''}`;
    if (c.sales > 0) risks.push(`If your sales fall by 20%, ${stressNote}.`);
    if (c.credit && c.bfr > 0) risks.push(`Customers who pay late: waiting for payment ties up about ${J(c.bfr)} of your own money${c.bfr > Math.max(0, c.left) ? ', more than your savings after start-up' : ''}.`);
    if (c.status === 'business_name') risks.push(`Taxes and contributions fall due in four payments a year (March, June, September, December 15). Set aside about ${J(c.setAside)} each month.`);
    else risks.push('Your own pay or dividends from the company are not included in these numbers. Plan them with an accountant.');
    if (c.emp > 0) risks.push('With employees, payroll deductions are due by the 14th of every month, even in a slow month.');
    if (c.annualSales >= gctLine * 0.8) risks.push(c.gct ? `Your sales pass ${J(gctLine)} a year: you must register for GCT.` : `You are close to the GCT line of ${J(gctLine)} a year. Plan for GCT.`);

    // Recommendations: [coach topic id, text]
    if (c.netMonthly <= 0 || short || c.margin < 0.25) recs.push(['cost', 'Work out your real cost price, then check that your selling price leaves enough.']);
    if (be && c.sales > 0 && be > c.sales * 1.02) recs.push(['breakeven', 'Close the gap to your break-even sales: raise a price, cut a cost, or plan more sales.']);
    if (c.credit && c.bfr > 0) recs.push(['cash', 'Reduce the money tied up by late-paying customers.']);
    if (c.left < 0 || (c.runway !== null && c.runway < 3)) recs.push(['savings', 'Build your safety net before you start.']);
    if (+input.m3 > 0 && +input.m3 <= 2) recs.push(['customers', 'Name your first five customers before you spend money.']);
    if (c.motivation < 8) recs.push(['motivation', 'Prepare for the hard months with a small test first.']);
    recs.push(['tax', 'Understand your taxes and set money aside every month.']);
    if (c.emp > 0) recs.push(['team', 'Learn what an employer must pay each month.']);
    if (c.annualSales >= gctLine * 0.8) recs.push(['gct', 'Understand GCT before you reach the registration line.']);

    return { c, be, st, verdict, strengths, weaknesses, opportunities, risks, recs: recs.slice(0, 5), gap };
  }

  const api = { num, J, pct, compute, breakEven, stress, buildReport };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PaPaEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
