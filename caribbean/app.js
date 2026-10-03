/* Pa a Pa Caribbean: interface. Works with engine.js and jamaica.json. */
(function () {
  'use strict';
  const E = window.PaPaEngine;
  const KEY = 'papa-jm-v1';
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const J = E.J, pct = E.pct, num = E.num;
  const track = n => { try { if (window.track) window.track(n); } catch (e) { /* ignore */ } };
  let D = null, chat = [], visited = {}, errMsg = '';

  const defaults = () => ({
    input: { status: 'business_name', payMode: '', creditShare: '50', cdays: '30', sdays: '0', sales: '', direct: '', fixed: '', needs: '', emp: '0', pay: '', startup: '', savings: '', m1: 0, m2: 0, m3: 0 },
    step: 0, vision: {}, done: {}, ready: false
  });
  function load() {
    try {
      const o = JSON.parse(localStorage.getItem(KEY));
      if (o && o.input) { const d = defaults(); return Object.assign(d, o, { input: Object.assign(d.input, o.input) }); }
    } catch (e) { /* ignore */ }
    return defaults();
  }
  let S = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };
  const report = () => (S.ready ? E.buildReport(D, S.input) : null);

  /* ---------- small helpers ---------- */
  const li = a => '<ul>' + a.map(x => `<li>${x}</li>`).join('') + '</ul>';
  const fieldNum = (k, label, unit, hint, ph) =>
    `<div class="field"><label for="f-${k}">${label} <span class="unit">${unit}</span></label>` +
    `<input id="f-${k}" data-k="${k}" type="number" inputmode="numeric" min="0" step="1" placeholder="${ph || ''}" value="${esc(S.input[k])}">` +
    (hint ? `<small>${hint}</small>` : '') + '</div>';
  const why = (title, body) => `<div class="why"><b class="k">${title}</b>${body}</div>`;
  const footer = () => `<footer class="fine"><p>These figures are estimates to help you decide. They are not tax or legal advice. Data last checked on ${esc(D.dataVerifiedOn)}. Always confirm with <a href="${esc(D.authorities.tax.url)}">${esc(D.authorities.tax.name)}</a> and the <a href="${esc(D.authorities.registry.url)}">${esc(D.authorities.registry.name)}</a>.</p>` +
    `<details class="more"><summary>Still being verified</summary>${li(D.toVerify.map(esc))}</details>` +
    `<p>Pa a Pa is published by Caribbean Metadata. <a href="../app/">Version française</a></p></footer>`;

  /* ---------- HOME ---------- */
  function home() {
    const done = S.ready ? `<a class="path" href="#/report" style="margin-bottom:12px"><div class="n" style="background:var(--sun);color:var(--ink)">✓</div><div><div class="t">Your report is ready</div><div class="d">Open it again, or change your numbers in the test.</div></div></a>` : '';
    return `<section class="hero"><h1>Your business project, step by step.</h1>
      <p class="lead">Free, no sign-up. Every question and every figure is explained in plain words.</p></section>
      ${done}
      <nav class="paths" aria-label="Choose a path">
        <a class="path primary" href="#/test"><div class="n">1</div><div><div class="t">Test your project</div><div class="d">Will it hold up? Get your answer in a few minutes.</div></div></a>
        <a class="path" href="#/vision"><div class="n">2</div><div><div class="t">Build your vision</div><div class="d">Get your ideas clear: who for, what, how.</div></div></a>
        <a class="path" href="#/next"><div class="n" style="background:var(--ink)">3</div><div><div class="t">Move toward success</div><div class="d">Your next steps, with a coach to guide you.</div></div></a>
      </nav>
      <p class="tagline">Test · Launch · Last</p>${footer()}`;
  }

  /* ---------- TEST (4 parts) ---------- */
  const STEP_NAMES = ['Your project', 'Your money', 'Your team and start-up', 'Your motivation'];

  function stepProject() {
    const st = D.legalStatuses.map(s => `<label class="opt"><input type="radio" name="status" data-k="status" value="${s.id}" ${S.input.status === s.id ? 'checked' : ''}><span class="t">${esc(s.label)}</span><small>${esc(s.plain)}</small></label>`).join('');
    const modes = [['now', 'Right away', 'Cash, card or transfer on the spot.'], ['later', 'Later, on invoice', 'Customers pay days or weeks after.'], ['both', 'A bit of both', 'Some customers pay now, some later.']];
    const pm = modes.map(m => `<label class="opt"><input type="radio" name="payMode" data-k="payMode" value="${m[0]}" ${S.input.payMode === m[0] ? 'checked' : ''}><span class="t">${m[1]}</span><small>${m[2]}</small></label>`).join('');
    const pmode = S.input.payMode;
    const extra = pmode === 'later' || pmode === 'both' ? `<div class="grid2">${pmode === 'both' ? fieldNum('creditShare', 'Share of sales paid later', '(%)', '', '50') : ''}${fieldNum('cdays', 'Days customers take to pay', '(days)', '', '30')}${fieldNum('sdays', 'Days your suppliers give you to pay', '(days)', 'Enter 0 if you pay suppliers right away.', '0')}</div>` : '';
    return `<h2 class="q">How will you operate?</h2><div class="opts">${st}</div>
      <h2 class="q">How will your customers pay you?</h2><div class="opts">${pm}</div>${extra}
      ${why('Why these questions?', '<p>Your legal form decides which taxes and contributions you pay. If you are unsure, start with the registered business name: it is usually the simplest.</p><p>If customers pay later, you advance the money in the meantime. That money is called <b>working capital</b>. We only calculate it when it applies to you.</p>')}`;
  }
  function stepMoney() {
    return `<h2 class="q">Your money, month by month</h2><p class="muted">All amounts in Jamaican dollars (J$), per month.</p>
      ${fieldNum('sales', 'Expected sales', '(J$ per month)', 'What customers will pay you in a normal month.', 'e.g. 400000')}
      ${fieldNum('direct', 'Cost of what you sell', '(J$ per month)', 'Goods, materials, packaging: what you spend to make or buy what you sell. Enter 0 if none.', 'e.g. 150000')}
      ${fieldNum('fixed', 'Fixed costs', '(J$ per month)', 'Costs that do not change with sales: rent, transport, phone, insurance, marketing. Enter 0 if none.', 'e.g. 60000')}
      ${fieldNum('needs', 'What you need to live on', '(J$ per month)', 'Your household has to eat. Be honest: this counts as a cost of the project.', 'e.g. 120000')}
      ${why('Why these questions?', '<p>We compare what comes in with what goes out, then take off taxes and contributions. What is left must cover your living needs, or the plan cannot work.</p>')}`;
  }
  function stepTeam() {
    return `<h2 class="q">Your team and your start</h2>
      <div class="grid2">${fieldNum('emp', 'Employees', '(number)', 'Not counting you. Enter 0 if none.', '0')}${fieldNum('pay', 'Gross pay per employee', '(J$ per month)', 'Before deductions.', '')}</div>
      <div class="grid2">${fieldNum('startup', 'Start-up costs', '(J$, one time)', 'Equipment, stock, registration, website. Enter 0 if none.', 'e.g. 200000')}${fieldNum('savings', 'Savings you can use', '(J$)', 'Money you can put in without borrowing.', 'e.g. 500000')}</div>
      ${why('Why these questions?', '<p>Employees add monthly payments to the state on top of their pay. Start-up costs and savings show whether you can begin without borrowing, and for how long you can hold on if sales start slowly.</p>')}`;
  }
  function stepMotivation() {
    const items = [['m1', 'I can live with irregular income for six months.'], ['m2', 'I am ready to work six days a week during the first year.'], ['m3', 'I know who my first five customers will be.']];
    const html = items.map(it => `<fieldset class="statement" style="border:0;padding:0;margin:0 0 18px"><legend style="font-weight:600;margin-bottom:8px;padding:0">${it[1]}</legend><div class="scale">${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="${it[0]}" data-k="${it[0]}" value="${n}" ${+S.input[it[0]] === n ? 'checked' : ''}>${n}</label>`).join('')}</div><div class="scalelegend"><span>Not at all</span><span>Completely</span></div></fieldset>`).join('');
    return `<h2 class="q">How ready are you?</h2><p class="muted">Rate each statement from 1 (not at all) to 5 (completely).</p>${html}
      ${why('Why these questions?', '<p>Money is only one side. Your energy and your first customers decide whether the plan survives the first months.</p>')}`;
  }
  function validate(step) {
    const i = S.input;
    if (step === 0) { if (!i.status) return 'Choose how you will operate.'; if (!i.payMode) return 'Choose how your customers will pay you.'; if (i.payMode === 'both' && !(num(i.creditShare) > 0)) return 'Enter the share of sales that is paid later.'; }
    if (step === 1) { if (!(num(i.sales) > 0)) return 'Enter your expected sales per month.'; if (!(num(i.needs) > 0)) return 'Enter what you need to live on each month.'; }
    if (step === 3) { if (!(+i.m1 && +i.m2 && +i.m3)) return 'Rate the three statements to continue.'; }
    return '';
  }
  function test() {
    const s = Math.min(Math.max(+S.step || 0, 0), 3);
    const bars = [0, 1, 2, 3].map(n => `<i class="${n <= s ? 'on' : ''}"></i>`).join('');
    const body = [stepProject, stepMoney, stepTeam, stepMotivation][s]();
    const last = s === 3;
    return `<div class="backrow"><a class="iconbtn" href="#/" aria-label="Back to home"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 3L5 9l6 6"></path></svg></a><b style="color:var(--deep);font-size:14px">Test your project</b></div>
      <div class="progress" aria-hidden="true">${bars}</div><div class="crumb">Part ${s + 1} of 4 · ${STEP_NAMES[s]}</div>
      ${errMsg ? `<p class="error" role="alert">${esc(errMsg)}</p>` : ''}${body}
      <div class="btnrow"><button class="btn" data-act="${last ? 'finish' : 'next'}">${last ? 'See my report' : 'Continue'}</button>${s > 0 ? '<button class="btn link" data-act="back">Back</button>' : ''}</div>${footer()}`;
  }

  /* ---------- REPORT ---------- */
  const VERDICT = {
    ok: ['Viable', 'Your plan covers your living needs, your savings can carry the start, and you feel ready. Keep checking your numbers once you begin.'],
    cond: ['Viable, under conditions', 'Your project can work if you fix the points below before you start.'],
    no: ['Not viable yet', 'As it stands, this plan cannot pay your bills. The good news: you found out before spending money. Work on the points below and test again.']
  };
  function reportView() {
    const R = report();
    if (!R) return `<h1>Your report</h1><p class="lead">Take the test first. It takes a few minutes and the report is built from your answers.</p><a class="btn" href="#/test">Test my project</a>${footer()}`;
    const c = R.c, T = D.taxes, SE = D.selfEmployedContributions;
    const rows = [['Sales', J(c.annualSales)], ['Cost of what you sell and fixed costs', '-' + J((c.direct + c.fixed) * 12)]];
    if (c.emp) { rows.push(['Employee pay', '-' + J(c.payroll)]); rows.push(['Employer contributions', '-' + J(c.er)]); }
    rows.push(['<b>Profit before tax</b>', J(c.profit)]);
    if (c.status === 'limited_company') rows.push([`Company income tax (${pct(T.corporateIncomeTax.standardRate)})`, '-' + J(c.corpTax)]);
    else rows.push([`NIS (${pct(SE.nis.rate)})`, '-' + J(c.nis)], [`NHT (${pct(SE.nht.rate)})`, '-' + J(c.nht)], [`Education Tax (${pct(SE.educationTax.rate)})`, '-' + J(c.edu)], ['Income tax', '-' + J(c.incomeTax)]);
    const table = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('') + `<tr class="sum"><td>Left for you, per year</td><td>${J(c.net)}</td></tr><tr><td>Left for you, per month</td><td><b>${J(c.netMonthly)}</b></td></tr><tr><td>You need, per month</td><td>${J(c.needs)}</td></tr>`;
    const notes = [];
    if (R.be) notes.push(`<div class="note"><b>Break-even:</b> you need about ${J(R.be)} in sales per month to cover your costs, your taxes and your living needs.</div>`);
    notes.push(`<div class="note${c.left < 0 ? ' alert' : ''}"><b>Start-up:</b> ${c.left < 0 ? `your savings are ${J(-c.left)} short of the start-up costs.` : `after start-up costs you keep ${J(c.left)}, about ${c.runway.toFixed(1)} months of living costs if income stopped.`}</div>`);
    if (c.credit) notes.push(`<div class="note${c.bfr > Math.max(0, c.left) ? ' alert' : ''}"><b>Working capital:</b> waiting for customers to pay ties up about ${J(c.bfr)} of your own money.</div>`);
    notes.push(`<div class="note"><b>Motivation ${c.motivation} out of 15:</b> ${c.motivation >= 12 ? 'Strong. Keep your reasons written down for hard months.' : c.motivation >= 8 ? 'A good base. Work on your lowest-rated statement before you start.' : 'Take time to prepare: test your idea part-time and find your first customers first.'}</div>`);
    const sw = (title, color, items) => `<section class="card swot"><h3><span class="dot" style="background:${color}"></span>${title}</h3>${li(items.map(esc))}</section>`;
    const topicLabel = id => TOPIC[id].label;
    const recs = R.recs.map(r => `<li><div>${esc(r[1])}<br><a href="#/coach/${r[0]}">Ask the coach: ${esc(topicLabel(r[0]))}</a></div></li>`).join('');
    return `<h1>Viability report</h1>
      <div class="verdict ${R.verdict}"><div class="k">Verdict</div><div class="v">${VERDICT[R.verdict][0]}</div><p>${VERDICT[R.verdict][1]}</p></div>
      <section class="card"><h3 style="margin-bottom:10px">How your year adds up</h3><table class="sum">${table}</table>${notes.join('')}
        <details class="more"><summary>What do these words mean?</summary><dl>
          <dt>Cost of what you sell</dt><dd>What you spend on goods and materials for what you sell.</dd>
          <dt>Fixed costs</dt><dd>Costs you pay even in a slow month: rent, phone, insurance.</dd>
          <dt>NIS</dt><dd>National Insurance Scheme. It gives you access to a pension and other benefits.</dd>
          <dt>NHT</dt><dd>National Housing Trust. It helps contributors get housing loans.</dd>
          <dt>Education Tax</dt><dd>A contribution that funds schools.</dd>
          <dt>Income tax</dt><dd>Tax on your profit above ${J(T.personalIncomeTax.thresholdJMD)} a year.</dd></dl></details></section>
      ${sw('Strengths', '#1F7A8C', R.strengths)}${sw('Weaknesses', '#E8A33D', R.weaknesses)}${sw('Opportunities', '#0B3C49', R.opportunities)}${sw('Risks', '#C2491D', R.risks)}
      <section class="card"><h3 style="margin-bottom:12px">What to do first</h3><ol class="recs">${recs}</ol></section>
      <div class="btnrow" style="margin-top:18px"><a class="btn" href="#/coach">Talk to my coach</a><a class="btn link" href="#/test">Change my numbers</a></div>${footer()}`;
  }

  /* ---------- VISION ---------- */
  const VISION = [
    ['who', 'Who are your customers?', 'Describe one real person or one type of business: where they live, what they do all day.'],
    ['problem', 'What problem do you solve for them?', 'What do they struggle with, or pay too much for, today?'],
    ['offer', 'What exactly will you sell, and at what price?', 'One sentence for the product or service, then a price you could say out loud.'],
    ['why', 'Why would they choose you?', 'Price, quality, speed, trust, location. Pick one or two and be honest.'],
    ['reach', 'How will your first five customers find out about you?', 'Name real places or people: a WhatsApp group, a market, a church, a school, a friend who knows a buyer.'],
    ['stop', 'What would make you stop or change your plan?', 'Decide now, calmly, what result after three months would make you adjust.']
  ];
  function visionView() {
    const f = VISION.map(v => `<div class="field"><label for="v-${v[0]}">${v[1]}</label><textarea id="v-${v[0]}" data-v="${v[0]}">${esc(S.vision[v[0]] || '')}</textarea><small>${v[2]}</small></div>`).join('');
    return `<h1>Build your vision</h1><p class="lead">Six questions to get your idea clear. Your answers stay on this device and are saved as you type.</p>
      <section class="card" style="margin-top:14px">${f}</section>
      <section class="card"><h3 style="margin-bottom:8px">Your vision on one page</h3><div id="vsum" style="white-space:pre-wrap;font-size:15px"></div>
      <div class="btnrow"><button class="btn secondary" data-act="copy">Copy my vision</button><span id="copied" class="small muted" role="status"></span></div></section>${footer()}`;
  }
  function visionText() {
    const parts = VISION.filter(v => (S.vision[v[0]] || '').trim()).map(v => `${v[1]}\n${S.vision[v[0]].trim()}`);
    return parts.length ? parts.join('\n\n') : 'Answer the questions above and your vision appears here.';
  }
  const updateVision = () => { const el = $('#vsum'); if (el) el.textContent = visionText(); };

  /* ---------- NEXT STEPS ---------- */
  function nextQuarter() {
    const n = new Date(), t = new Date(n.getFullYear(), n.getMonth(), n.getDate()), y = n.getFullYear();
    const cand = [new Date(y, 2, 15), new Date(y, 5, 15), new Date(y, 8, 15), new Date(y, 11, 15), new Date(y + 1, 2, 15)];
    return cand.find(d => d >= t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function nextView() {
    const R = report(), c = R ? R.c : E.compute(D, S.input);
    const st = S.input.status;
    const steps = D.launchSteps.filter(s => s.appliesTo.includes(st) && (s.when !== 'employees' || c.emp > 0) && (s.when !== 'gct' || c.gct));
    const done = steps.filter(s => S.done[s.id]).length;
    const lst = D.legalStatuses.find(s => s.id === st);
    const fee = lst.fees ? (st === 'limited_company' ? `Budget for COJ fees: registration ${J(lst.fees.registrationJMD)}, name search ${J(lst.fees.nameSearchJMD)}, name reservation ${J(lst.fees.nameReservationJMD)}.` : `COJ fee for a business name: ${J(lst.fees.registrationJMD)}, valid for ${lst.fees.validityYears} years.`) : '';
    const list = steps.map(s => `<li><label><input type="checkbox" data-done="${s.id}" ${S.done[s.id] ? 'checked' : ''}><span><span class="t">${esc(s.label)}</span><small>${esc(s.plain)}${s.url ? ` <a href="${esc(s.url)}" target="_blank" rel="noopener">Official site</a>` : ''}</small></span></label></li>`).join('');
    const cal = [];
    cal.push(['Next: ' + nextQuarter(), st === 'limited_company' ? 'Pay your estimated company income tax. It is due four times a year: March 15, June 15, September 15 and December 15.' : 'Pay your self-employed statutory payments (income tax, NIS, NHT, Education Tax). Due four times a year: March 15, June 15, September 15 and December 15.']);
    if (st === 'business_name') cal.push(['By March 15', 'File your income estimate for the year (form S04A). It sets the amount of your quarterly payments.']);
    if (c.emp > 0) cal.push(['By the 14th', 'Every month: pay payroll deductions for the previous month (form S01).']);
    if (c.gct) cal.push(['By the 25th', 'Every month or two months: file your GCT return, due the 25th of the month after the period.']);
    return `<h1>Move toward success</h1><p class="lead">Your next steps for a <b>${esc(lst.label.toLowerCase())}</b>.${S.ready ? '' : ' <a href="#/test">Take the test</a> to adapt this list to your project.'}</p>
      <section class="card" style="margin-top:14px"><h3 style="margin-bottom:4px">Steps to launch</h3><p class="muted small" id="donecount">${done} of ${steps.length} done</p><ul class="checklist">${list}</ul><p class="muted small" style="margin:12px 0 0">${esc(fee)}</p></section>
      <section class="card"><h3 style="margin-bottom:10px">Your tax calendar</h3><ul class="cal">${cal.map(x => `<li><b>${esc(x[0])}</b><span>${esc(x[1])}</span></li>`).join('')}</ul>${R && st !== 'limited_company' ? `<div class="note alert"><b>Set aside ${J(c.setAside)} a month</b> in a separate account so the payments are ready when they fall due.</div>` : ''}</section>
      <section class="card"><h3 style="margin-bottom:8px">Help for small businesses</h3><p>${D.authorities.support.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join(' · ')}</p><p class="muted small" style="margin:0">Ask them what advice and financing are open now.</p></section>
      <div class="btnrow" style="margin-top:18px"><a class="btn" href="#/coach">Ask my coach</a></div>${footer()}`;
  }

  /* ---------- COACH ---------- */
  const TOPIC = {};
  function defTopics() {
    const R = () => report();
    const ec = D.employerContributions, T = D.taxes, SE = D.selfEmployedContributions;
    TOPIC.cost = { label: 'Cost price and selling price', tool: 'cost', msgs: () => {
      const r = R(), m = [`<p>Your <b>cost price</b> is what one product or one job costs you before you sell it: materials, packaging, transport and your own time.</p>`];
      m.push(`<p>If you sell below it, you lose money on every sale, even when customers are happy.${r && r.c.sales > 0 ? ` In your plan, goods and materials take ${pct(Math.min(1, r.c.direct / r.c.sales))} of your sales.` : ''} Let's work it out for one product or one job.</p>`);
      return m; } };
    TOPIC.breakeven = { label: 'Break-even sales', msgs: () => {
      const r = R();
      if (!r) return ['<p><b>Break-even</b> is the monthly sales that cover your costs, your taxes and your living needs. <a href="#/test">Take the test</a> to see yours.</p>'];
      const m = [];
      if (!r.be) m.push('<p>Right now your purchases cost as much as your sales, so no amount of sales reaches break-even. Start with your prices.</p>');
      else m.push(`<p>To pay your costs, your taxes and your living needs, you need about <b>${J(r.be)}</b> in sales per month. Your plan has ${J(r.c.sales)}.${r.be > r.c.sales * 1.02 ? ` That is ${J(r.be - r.c.sales)} more than planned.` : ' You are above it.'}</p>`);
      m.push('<p>You have three levers: raise a price, cut a cost, or plan more sales. Change one at a time and run the test again. <a href="#/test">Edit my numbers</a></p>');
      return m; } };
    TOPIC.cash = { label: 'Customers who pay late', msgs: () => {
      const r = R(), m = ['<p>When a customer pays in 30 days, you have already paid for materials, wages and rent. The money you advance in the meantime is your <b>working capital</b>.</p>'];
      if (r) m.push(r.c.credit ? `<p>In your plan, waiting for payment ties up about <b>${J(r.c.bfr)}</b>.</p>` : '<p>In your plan customers pay on the spot, so this does not affect you.</p>');
      m.push(li(['Ask for a deposit before you start.', 'Invoice the same day, with a clear due date.', 'Offer shorter terms, for example 14 days.', 'Ask your suppliers for more time to pay.', 'Pause work for customers who are already late.']));
      return m; } };
    TOPIC.savings = { label: 'My safety net', msgs: () => {
      const r = R(), m = [];
      if (r) m.push(r.c.left < 0 ? `<p>Your savings are <b>${J(-r.c.left)}</b> short of the start-up costs.</p>` : `<p>After start-up costs you keep <b>${J(r.c.left)}</b>, about <b>${r.c.runway.toFixed(1)} months</b> of living costs if income stopped.</p>`);
      else m.push('<p>Your <b>safety net</b> is what you keep after start-up costs, divided by what you need to live on each month. <a href="#/test">Take the test</a> to see yours.</p>');
      m.push('<p>A common rule of thumb is three to six months of living costs before you rely on the business. To get there: start part-time, cut start-up costs (buy used, rent instead of buy), or launch in phases.</p>');
      return m; } };
    TOPIC.tax = { label: 'Taxes and contributions', msgs: () => {
      const r = R(), st = S.input.status, m = [];
      if (st === 'limited_company') {
        m.push(`<p>A limited company pays company income tax on its profit. The standard rate is ${pct(T.corporateIncomeTax.standardRate)} (confirm with TAJ).${r ? ` In your plan: about <b>${J(r.c.corpTax)}</b> a year.` : ''}</p>`);
        m.push('<p>It pays estimated tax in four instalments: March 15, June 15, September 15 and December 15. What you take out for yourself (salary or dividends) is taxed separately and is not in these numbers. Ask an accountant to plan it.</p>');
      } else {
        m.push('<p>As a registered business name, your profit is taxed like personal income. Four things are paid on it:</p>');
        m.push(li([`<b>Income tax:</b> nothing on the first ${J(T.personalIncomeTax.thresholdJMD)} a year, then 25% up to ${J(T.personalIncomeTax.brackets[0].upToJMD)} and 30% above.`, `<b>NIS</b> (${pct(SE.nis.rate)}): the National Insurance Scheme, which gives access to a pension and other benefits.`, `<b>NHT</b> (${pct(SE.nht.rate)}): the National Housing Trust, which helps contributors get housing loans.`, `<b>Education Tax</b> (${pct(SE.educationTax.rate)}): funds schools.`]));
        if (r) m.push(`<p>In your plan these come to about <b>${J(r.c.levies)}</b> a year. Set aside <b>${J(r.c.setAside)}</b> each month in a separate account.</p>`);
        m.push('<p>You pay in four instalments: March 15, June 15, September 15 and December 15. Each year, by March 15, you file an income estimate (form S04A) that sets the amounts. <a href="#/next">See my tax calendar</a></p>');
      }
      return m; } };
    TOPIC.gct = { label: 'GCT (sales tax)', msgs: () => {
      const r = R(), g = T.gct, m = [`<p><b>GCT</b> is Jamaica's sales tax, like VAT. The standard rate is ${pct(g.standardRate)}. You must register once your yearly sales pass <b>${J(g.registrationThresholdJMD)}</b>, within 21 days of crossing it. Then you charge GCT on your sales and file a return by the 25th of the following month.</p>`];
      if (r) m.push(`<p>Your planned yearly sales are ${J(r.c.annualSales)}.${r.c.gct ? ' You are over the line.' : ' You are below the line for now.'}</p>`);
      m.push('<p>You can also register earlier by choice. Ask TAJ or an accountant before you do.</p>');
      return m; } };
    TOPIC.team = { label: 'Employees', msgs: () => {
      const r = R(), m = [`<p>An employee costs more than their pay. On top of gross pay, the employer adds NIS ${pct(ec.nis)}, NHT ${pct(ec.nht)} and Education Tax ${pct(ec.educationTax)}, plus HEART/NTA ${pct(ec.heartNta.rate)} from three employees (to confirm). Deductions are also taken from the employee's pay, and you pay all of it to TAJ.</p>`];
      m.push(r && r.c.emp > 0 ? `<p>In your plan, employer contributions add about <b>${J(r.c.er)}</b> a year to a payroll of ${J(r.c.payroll)}.</p>` : '<p>You planned no employees, so this does not affect your numbers yet.</p>');
      m.push('<p>Everything is due by the <b>14th of each month</b> for the month before, even when sales are slow.</p>');
      return m; } };
    TOPIC.customers = { label: 'My first customers', msgs: () => ['<p>Before you spend money, <b>name your first five customers</b>: real people or businesses who would buy from you.</p>', '<p>Then ask each one for a small commitment: a pre-order, a deposit, or a firm date. A kind word is not a customer. Money or a clear date is.</p>', '<p>If you cannot name five, your first job is not the business. It is talking to people who might buy. <a href="#/vision">Write them down in my vision</a></p>'] };
    TOPIC.motivation = { label: 'Staying motivated', msgs: () => {
      const r = R(), m = ['<p>Money is only one side of the test. Energy decides whether the plan survives the first months.</p>'];
      if (r) m.push(`<p>Your motivation score is ${r.c.motivation} out of 15.</p>`);
      m.push(li(['Test small first: sell to five people before you quit anything.', 'Agree with your household on a reserve and a review date, for example after three months.', 'Write down why you are doing this. Read it on hard days.', 'Decide now what result would make you change course.']));
      return m; } };
    TOPIC.funding = { label: 'Loans and support', msgs: () => {
      const r = R(), m = ['<p>Bodies such as JBDC (Jamaica Business Development Corporation) and DBJ (Development Bank of Jamaica) work with small businesses. I cannot tell you which programme you qualify for. Contact them and ask what advice and financing are open now.</p>'];
      if (r) m.push(`<p>Before you borrow: your plan leaves about <b>${J(r.c.netMonthly)}</b> a month after tax. A loan payment must fit inside that amount, not on top of it.</p>`);
      m.push(`<p>${D.authorities.support.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join('<br>')}</p>`);
      return m; } };
  }
  const ORDER = ['cost', 'breakeven', 'tax', 'customers', 'savings', 'cash', 'gct', 'team', 'motivation', 'funding'];
  const KEYWORDS = [['cost', /cost price|price|pricing|margin|charge|how much (should|do) i sell/], ['breakeven', /break.?even|how much (do i )?need to sell/], ['cash', /late|invoice|unpaid|working capital|cash ?flow|bfr|credit/], ['savings', /saving|reserve|runway|safety/], ['tax', /tax|nis|nht|contribution|income tax|trn|s04/], ['gct', /gct|vat|sales tax/], ['team', /employ|staff|hire|payroll|worker/], ['customers', /customer|client|market|buyer|sell to/], ['motivation', /motivat|afraid|scared|stress|quit|doubt|fear/], ['funding', /loan|fund|grant|borrow|bank|jbdc|dbj/]];

  function chips(ids, soft) { return `<div class="chips">${ids.map(id => `<button class="chip${soft ? ' soft' : ''}" data-act="ask" data-topic="${id}">${esc(TOPIC[id].label)}</button>`).join('')}</div>`; }
  function moreChips(current) {
    const r = report(), pri = r ? r.recs.map(x => x[0]) : [], pool = pri.concat(ORDER);
    const ids = []; pool.forEach(id => { if (id !== current && !visited[id] && !ids.includes(id)) ids.push(id); });
    return ids.length ? `<p class="muted small" style="margin:6px 0 2px">What next?</p>${chips(ids.slice(0, 3), true)}${r ? '<a class="chip soft" href="#/report">My report</a>' : ''}` : '';
  }
  function toolCost() {
    return `<div class="bubble coach tool tool-cost"><p><b>Cost of one product or one job</b></p><div class="grid2">
      <div class="field"><label for="t-mat">Materials or goods <span class="unit">(J$)</span></label><input id="t-mat" type="number" inputmode="numeric" min="0" placeholder="0"></div>
      <div class="field"><label for="t-oth">Packaging, transport, fees <span class="unit">(J$)</span></label><input id="t-oth" type="number" inputmode="numeric" min="0" placeholder="0"></div>
      <div class="field"><label for="t-hrs">Hours of your time</label><input id="t-hrs" type="number" inputmode="decimal" min="0" step="0.25" placeholder="0"></div>
      <div class="field"><label for="t-rate">Your time, per hour <span class="unit">(J$)</span></label><input id="t-rate" type="number" inputmode="numeric" min="0" placeholder="0"><small>What you would want to earn per hour.</small></div></div>
      <div class="res" id="t-res" aria-live="polite"></div></div>`;
  }
  function costCalc() {
    const g = id => num(($('#' + id) || {}).value), cost = g('t-mat') + g('t-oth') + g('t-hrs') * g('t-rate'), el = $('#t-res');
    if (!el) return;
    if (!(cost > 0)) { el.textContent = ''; return; }
    const price = m => J(cost / (1 - m));
    el.innerHTML = `<p>Your cost price: <b>${J(cost)}</b>.</p><p>Margin is the share of the selling price you keep after this cost. To keep 30% sell at <b>${price(0.3)}</b>, to keep 40% sell at <b>${price(0.4)}</b>, to keep 50% sell at <b>${price(0.5)}</b>.</p><p class="muted small">Your fixed costs and taxes still come out of that margin.</p>`;
  }
  function chatHTML() {
    return chat.map(m => m.raw ? m.html : `<div class="bubble ${m.from}">${m.html}</div>`).join('');
  }
  function coachPush(items) {
    chat = chat.concat(items);
    const log = $('#chatlog'); if (log) log.innerHTML = chatHTML();
    const c = $('#composer'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }
  function coachAsk(id, label) {
    if (!TOPIC[id]) return;
    visited[id] = true;
    const items = [{ from: 'me', html: esc(label || TOPIC[id].label) }];
    TOPIC[id].msgs().forEach(h => items.push({ from: 'coach', html: h }));
    if (TOPIC[id].tool === 'cost') items.push({ raw: true, html: toolCost() });
    items.push({ raw: true, html: moreChips(id) });
    coachPush(items);
  }
  function coachIntro() {
    const r = report();
    const first = [{ from: 'coach', html: '<p>Hello! I am your guide. I am a tool built into this app, not a person, and I explain things in plain words. I do not replace an accountant.</p>' }];
    if (r) { first.push({ from: 'coach', html: '<p>Your report is ready. These are the most useful points to work on first:</p>' }); first.push({ raw: true, html: chips(r.recs.map(x => x[0])) }); }
    else { first.push({ from: 'coach', html: '<p>Take <a href="#/test">the test</a> first and I can build advice from your own numbers. Meanwhile, pick any topic:</p>' }); first.push({ raw: true, html: chips(ORDER.slice(0, 6)) }); }
    return first;
  }
  function coach(arg) {
    if (!chat.length) chat = coachIntro();
    const pending = TOPIC[arg] && !visited[arg] ? arg : null;
    return `<div class="coachhead"><div class="avatar"><svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="30" width="10" height="14" rx="3" fill="#8FC9D4"></rect><rect x="19" y="19" width="10" height="25" rx="3" fill="#fff"></rect><rect x="34" y="6" width="10" height="38" rx="3" fill="#E8A33D"></rect></svg></div><div><h2 style="font-size:20px">Your coach</h2><div class="muted small">Free · Guided by your numbers</div></div></div>
      <div class="chat" id="chatlog" data-pending="${pending || ''}">${chatHTML()}</div>
      <form class="composer" id="composer" autocomplete="off"><input type="text" id="ask" aria-label="Ask your coach" placeholder="Ask about price, tax, customers..."><button type="submit" aria-label="Send"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#12262B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5"></path></svg></button></form>`;
  }

  /* ---------- router ---------- */
  function route() {
    if (!D) return;
    const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
    const name = parts[0] || '', arg = parts[1];
    const views = { '': home, test, report: reportView, vision: visionView, next: nextView, coach };
    const fn = views[name] || home;
    if (name !== 'test') errMsg = '';
    const view = $('#view');
    view.innerHTML = fn(arg);
    document.querySelectorAll('nav.tabs a').forEach(a => {
      const t = a.dataset.tab, cur = (name === '' && t === 'home') || (name === 'report' && t === 'test') || t === name;
      if (cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (name === 'vision') updateVision();
    const pend = name === 'coach' && $('#chatlog') && $('#chatlog').dataset.pending;
    if (!pend) window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
    if (pend) coachAsk(pend);
  }
  const rerender = () => { const y = window.scrollY; $('#view').innerHTML = test(); window.scrollTo(0, y); };

  function bindEvents() {
    const view = $('#view');
    view.addEventListener('input', e => {
      const t = e.target;
      if (t.type === 'radio') return;
      if (t.dataset.k) { S.input[t.dataset.k] = t.value; save(); }
      else if (t.dataset.v) { S.vision[t.dataset.v] = t.value; save(); updateVision(); }
      else if (t.closest && t.closest('.tool-cost')) costCalc();
    });
    view.addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.k && t.type === 'radio') { S.input[t.dataset.k] = t.value; save(); if (t.dataset.k === 'payMode') rerender(); }
      else if (t.dataset.done) {
        S.done[t.dataset.done] = t.checked; save();
        const all = document.querySelectorAll('input[data-done]'), n = Array.prototype.filter.call(all, x => x.checked).length, el = $('#donecount');
        if (el) el.textContent = n + ' of ' + all.length + ' done';
      }
    });
    view.addEventListener('submit', e => {
      if (e.target.id !== 'composer') return;
      e.preventDefault();
      const inp = $('#ask'), q = inp.value.trim(); if (!q) return;
      inp.value = '';
      const hit = KEYWORDS.find(k => k[1].test(q.toLowerCase()));
      if (hit) coachAsk(hit[0], q);
      else coachPush([{ from: 'me', html: esc(q) }, { from: 'coach', html: '<p>I can explain the topics below. Pick one, or rephrase your question with a word like price, tax, customers or savings.</p>' }, { raw: true, html: chips(ORDER.slice(0, 6), true) }]);
    });
    view.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'ask') coachAsk(b.dataset.topic);
      else if (act === 'back') { S.step = Math.max(0, S.step - 1); errMsg = ''; save(); rerender(); window.scrollTo(0, 0); }
      else if (act === 'next') { errMsg = validate(S.step); if (!errMsg) { if (S.step === 0) track('caribbean-test-started'); S.step += 1; save(); } rerender(); window.scrollTo(0, 0); }
      else if (act === 'finish') { errMsg = validate(3); if (errMsg) { rerender(); window.scrollTo(0, 0); return; } S.ready = true; S.step = 0; chat = []; visited = {}; save(); track('caribbean-report-done'); location.hash = '#/report'; }
      else if (act === 'copy') {
        const txt = visionText(), done = ok => { const el = $('#copied'); if (el) el.textContent = ok ? 'Copied.' : 'Select the text above and copy it.'; };
        try { navigator.clipboard.writeText(txt).then(() => done(true), () => done(false)); } catch (err) { done(false); }
      }
    });
    window.addEventListener('hashchange', route);
  }

  /* ---------- start ---------- */
  fetch('jamaica.json').then(r => { if (!r.ok) throw new Error('data'); return r.json(); }).then(d => {
    D = d; defTopics(); bindEvents(); route();
  }).catch(() => {
    const e = $('#err'); e.style.display = 'block';
    e.textContent = 'Could not load the data file. Open this page from its web address (GitHub Pages), not by double-clicking the file.';
  });
})();
