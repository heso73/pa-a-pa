/* Pa a Pa Caribbean: calculation and report engine (no DOM). One engine, one data file per country. */
(function (root) {
  'use strict';

  const num = v => Math.max(0, parseFloat(String(v == null ? '' : v).replace(/,/g, '')) || 0);
  const money = (D, n) => (n < 0 ? '-' : '') + D.currency.symbol + Math.round(Math.abs(n)).toLocaleString('en-US');
  const pct = r => parseFloat((r * 100).toFixed(2)) + '%';

  // Tax on `x` through bands whose limits (upToChargeable) are cumulative.
  function bandTax(brackets, x) {
    let prev = 0, tax = 0;
    for (const b of brackets) {
      const up = b.upToChargeable == null ? Infinity : b.upToChargeable;
      if (x > prev) tax += (Math.min(x, up) - prev) * b.rate;
      if (x <= up) break;
      prev = up;
    }
    return tax;
  }

  const statusOf = (D, id) => D.legalStatuses.find(s => s.id === id) || D.legalStatuses[0];

  function compute(D, input) {
    const st = statusOf(D, input.status);
    const c = {
      status: st.id, model: st.taxModel,
      sales: num(input.sales), direct: num(input.direct), fixed: num(input.fixed), needs: num(input.needs),
      emp: Math.round(num(input.emp)), pay: num(input.pay), startup: num(input.startup), savings: num(input.savings)
    };
    c.annualSales = c.sales * 12;
    c.payroll = c.emp * c.pay * 12;

    // Employer contributions
    const perEmp = c.pay * 12, empShare = {};
    (D.employee || []).forEach(e => { empShare[e.id] = Math.min(perEmp, e.ceilingAnnual == null ? Infinity : e.ceilingAnnual) * e.rate; });
    c.erLines = [];
    D.employer.items.forEach(it => {
      if (it.minEmployees && c.emp < it.minEmployees) return;
      if (it.minMonthlyPayroll && c.payroll / 12 <= it.minMonthlyPayroll) return;
      let base = perEmp - (it.baseLess ? (empShare[it.baseLess] || 0) : 0);
      if (it.exemptAnnual) base -= it.exemptAnnual;
      if (it.ceilingAnnual != null) base = Math.min(base, it.ceilingAnnual);
      const amount = Math.max(0, base) * c.emp * it.rate;
      c.erLines.push({ id: it.id, label: it.label, rate: it.rate, amount });
    });
    c.er = c.erLines.reduce((a, l) => a + l.amount, 0);

    c.profit = c.annualSales - (c.direct + c.fixed) * 12 - c.payroll - c.er;
    const p = Math.max(0, c.profit);

    // Taxes and contributions on the owner's profit
    c.lines = [];
    c.incomeTax = 0; c.corpTax = 0;
    const acts = D.activities || [];
    c.activity = acts.find(a => a.id === input.activity) || acts[0] || null;
    if (c.model === 'corporate') {
      if (D.corporateTax) {
        c.corpTax = bandTax(D.corporateTax.brackets, p);
        c.lines.push({ id: 'corp', label: D.corporateTax.label, amount: c.corpTax, tag: D.corporateTax.verified === false ? 'to confirm' : '' });
      }
    } else {
      const amt = {};
      let deductible = 0;
      D.selfEmployed.contributions.forEach(ct => {
        let amount;
        if (ct.annualFlat != null) amount = p > 0 ? ct.annualFlat : 0;
        else {
          let base = p - (ct.baseLess ? (amt[ct.baseLess] || 0) : 0);
          base = Math.max(0, base - (ct.exemptAnnual || 0));
          if (ct.ceilingAnnual != null) base = Math.min(base, ct.ceilingAnnual);
          amount = base * ct.rate;
        }
        amt[ct.id] = amount;
        if (ct.deductibleShare != null) deductible += amount * ct.deductibleShare; else if (ct.deductible) deductible += amount;
        c.lines.push({ id: ct.id, label: ct.rate != null ? `${ct.label} (${pct(ct.rate)})` : ct.label, amount, tag: ct.verified === false ? 'to confirm' : '' });
      });
      if (D.incomeTax) {
        const base = Math.max(0, p - deductible), it = D.incomeTax;
        let allowance = it.allowance || 0;
        if (it.allowanceShare) allowance = Math.max(allowance, base * it.allowanceShare);
        c.chargeable = Math.max(0, base - allowance);
        c.incomeTax = bandTax(it.brackets, c.chargeable);
        c.lines.push({ id: 'tax', label: it.label, amount: c.incomeTax });
      }
    }
    // Levies charged on sales (business licence, gross-receipts business tax, green fund...)
    (D.salesLevies || []).filter(l => !l.appliesTo || l.appliesTo.includes(c.status)).forEach(l => {
      let rate = l.rate || 0, exempt = false, label = l.label;
      if (l.rateByActivity && c.activity) {
        rate = c.activity.rate;
        if (c.activity.exemptBelow != null && c.annualSales < c.activity.exemptBelow) exempt = true;
        label = `${l.label} (${pct(rate)} of sales)`;
      } else if (l.bands) {
        const b = l.bands.find(x => x.upTo == null || c.annualSales <= x.upTo) || l.bands[l.bands.length - 1];
        rate = b.rate;
        label = rate > 0 ? `${l.label} (${pct(rate)} of sales)` : `${l.label} (exempt below ${money(D, l.bands[0].upTo)})`;
      }
      c.lines.push({ id: l.id, label, amount: exempt ? 0 : c.annualSales * rate, tag: l.verified === false ? 'to confirm' : '' });
    });
    c.levies = c.lines.reduce((a, l) => a + l.amount, 0);
    c.net = c.profit - c.levies;
    c.netMonthly = c.net / 12;
    c.setAside = c.levies / 12;
    c.vat = !!D.vat && c.annualSales >= D.vat.threshold;
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
    let lo = 0, hi = Math.max(base.sales * 2, 1000);
    while (at(hi) < base.needs && hi < 1e12) hi *= 2;
    if (at(hi) < base.needs) return null;
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (at(mid) >= base.needs) hi = mid; else lo = mid; }
    return hi;
  }

  function stress(D, input, factor) {
    return compute(D, Object.assign({}, input, { sales: num(input.sales) * factor, direct: num(input.direct) * factor }));
  }

  function buildReport(D, input) {
    const J = n => money(D, n);
    const c = compute(D, input), be = breakEven(D, input), st = stress(D, input, 0.8);
    const hasVat = !!D.vat, vatShort = hasVat ? D.vat.short : '', thr = hasVat ? D.vat.threshold : Infinity;
    const gap = c.netMonthly - c.needs, short = gap < 0;

    let verdict;
    if (c.netMonthly <= 0 || c.netMonthly < 0.5 * c.needs) verdict = 'no';
    else if (short || c.left < 0 || c.motivation < 8 || (c.credit && c.bfr > Math.max(0, c.left))) verdict = 'cond';
    else verdict = 'ok';

    const strengths = [], weaknesses = [], opportunities = [], risks = [], recs = [];

    if (c.margin >= 0.4) strengths.push(`After the cost of what you sell, you keep ${pct(c.margin)} of each sale. That leaves room to pay your other costs.`);
    if (!short && c.sales > 0) strengths.push(`Your plan covers your living needs after taxes and contributions (${J(c.netMonthly)} per month).`);
    if (c.left >= 0 && c.runway !== null && c.runway >= 3) strengths.push(`Your savings cover the start-up costs and about ${c.runway.toFixed(1)} months of living costs.`);
    if (c.sales > 0 && c.fixed * 12 / c.annualSales <= 0.2) strengths.push('Your fixed costs are small compared with your sales, so slow months hurt less.');
    if (+input.m3 >= 4) strengths.push('You already know who your first customers will be.');
    if (c.motivation >= 12) strengths.push(`Your motivation is strong (${c.motivation} out of 15).`);
    if (!strengths.length) strengths.push('You have started by putting numbers on your idea. Every answer makes the next steps clearer.');

    if (c.netMonthly <= 0) weaknesses.push(`Your plan loses ${J(-c.netMonthly)} per month after taxes. It cannot pay your bills as it stands.`);
    else if (short) weaknesses.push(`Your plan leaves ${J(c.netMonthly)} per month, which is ${J(-gap)} below your living needs.`);
    if (c.sales > 0 && c.margin < 0.25) weaknesses.push(`Only ${pct(Math.max(0, c.margin))} of each sale is left after the cost of what you sell. Your prices or your purchase costs may need work.`);
    if (be && c.sales > 0 && be > c.sales * 1.02) weaknesses.push(`You need about ${J(be)} in sales per month to cover your costs, your taxes and your living needs. You planned ${J(c.sales)}.`);
    if (c.left < 0) weaknesses.push(`Your savings fall ${J(-c.left)} short of your start-up costs.`);
    else if (c.runway !== null && c.runway < 3 && c.needs > 0) weaknesses.push(`After start-up costs, your savings would cover only ${c.runway.toFixed(1)} months of living costs if income stopped.`);
    if (+input.m3 > 0 && +input.m3 <= 2) weaknesses.push('You do not yet know who your first customers will be.');
    if (+input.m1 > 0 && +input.m1 <= 2) weaknesses.push('Irregular income worries you. You will need a cash reserve before you start.');
    if (!weaknesses.length) weaknesses.push('No major weakness shows in your numbers. Check them again every month once you start.');

    if (!c.credit) opportunities.push('Your customers pay on the spot, so you do not have to fund their delay.');
    if (hasVat && !c.vat) opportunities.push(`Your yearly sales are below ${J(thr)}, so you do not have to charge ${vatShort} yet. Your paperwork stays lighter.`);
    if (c.model === 'personal') opportunities.push('A registered business name lets you advertise under it and build a name customers recognise.');
    opportunities.push('Small-business support bodies exist. Ask them what advice and financing are open now.');

    const stressNote = st.netMonthly <= 0 ? `you would lose ${J(-st.netMonthly)} per month` : `you would keep about ${J(st.netMonthly)} per month${st.netMonthly < c.needs ? ', below your living needs' : ''}`;
    if (c.sales > 0) risks.push(`If your sales fall by 20%, ${stressNote}.`);
    if (c.credit && c.bfr > 0) risks.push(`Customers who pay late: waiting for payment ties up about ${J(c.bfr)} of your own money${c.bfr > Math.max(0, c.left) ? ', more than your savings after start-up' : ''}.`);
    if (c.model === 'personal') risks.push(D.calendar.quarterly && D.calendar.quarterly.length
      ? `Taxes and contributions fall due in several payments a year (${D.calendar.quarterlyList}). Set aside about ${J(c.setAside)} each month.`
      : `Set aside about ${J(c.setAside)} each month for your taxes, fees and contributions, so they are ready when due.`);
    else risks.push('Your own pay or dividends from the company are not included in these numbers. Plan them with an accountant.');
    if (c.emp > 0) risks.push('With employees, payroll payments are due every month, even in a slow month.');
    if (hasVat && c.annualSales >= thr * 0.8) risks.push(c.vat ? `Your sales pass ${J(thr)} a year: you must register for ${vatShort}.` : `You are close to the ${vatShort} line of ${J(thr)} a year. Plan for ${vatShort}.`);

    if (c.netMonthly <= 0 || short || c.margin < 0.25) recs.push(['cost', 'Work out your real cost price, then check that your selling price leaves enough.']);
    if (be && c.sales > 0 && be > c.sales * 1.02) recs.push(['breakeven', 'Close the gap to your break-even sales: raise a price, cut a cost, or plan more sales.']);
    if (c.credit && c.bfr > 0) recs.push(['cash', 'Reduce the money tied up by late-paying customers.']);
    if (c.left < 0 || (c.runway !== null && c.runway < 3)) recs.push(['savings', 'Build your safety net before you start.']);
    if (+input.m3 > 0 && +input.m3 <= 2) recs.push(['customers', 'Name your first five customers before you spend money.']);
    if (c.motivation < 8) recs.push(['motivation', 'Prepare for the hard months with a small test first.']);
    recs.push(['tax', 'Understand your taxes and set money aside every month.']);
    if (c.emp > 0) recs.push(['team', 'Learn what an employer must pay each month.']);
    if (hasVat && c.annualSales >= thr * 0.8) recs.push(['vat', `Understand ${vatShort} before you reach the registration line.`]);

    return { c, be, st, verdict, strengths, weaknesses, opportunities, risks, recs: recs.slice(0, 5), gap };
  }

  const api = { num, money, pct, bandTax, statusOf, compute, breakEven, stress, buildReport };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PaPaEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
