/* Pa a Pa Caribbean: interface. Works with engine.js and one data file per country. */
(function () {
  'use strict';
  const E = window.PaPaEngine;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = E.num, pct = E.pct;
  const track = n => { try { if (window.track) window.track(n); } catch (e) { /* ignore */ } };
  let D = null, COUNTRIES = null, chat = [], visited = {}, errMsg = '', S = null, KEY = '';
  const J = n => E.money(D, n);

  /* ---------- state (one saved state per country) ---------- */
  const defaults = () => ({
    input: { status: 'business_name', activity: '', payMode: '', creditShare: '50', cdays: '30', sdays: '0', sales: '', direct: '', fixed: '', needs: '', emp: '0', pay: '', startup: '', savings: '', m1: 0, m2: 0, m3: 0 },
    step: 0, vision: {}, done: {}, ready: false
  });
  const keyFor = id => (id === 'JM' ? 'papa-jm-v1' : 'papa-' + id.toLowerCase() + '-v1');
  function load() {
    try {
      const o = JSON.parse(localStorage.getItem(KEY));
      if (o && o.input) { const d = defaults(); return Object.assign(d, o, { input: Object.assign(d.input, o.input) }); }
    } catch (e) { /* ignore */ }
    return defaults();
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };
  const report = () => (S.ready ? E.buildReport(D, S.input) : null);
  const stat = () => E.statusOf(D, S.input.status);
  if (!window.localStorage) { window.localStorage = { getItem() { return null; }, setItem() {} }; }

  /* ---------- helpers ---------- */
  const li = a => '<ul>' + a.map(x => `<li>${x}</li>`).join('') + '</ul>';
  const fieldNum = (k, label, unit, hint, ph) =>
    `<div class="field"><label for="f-${k}">${label} <span class="unit">${unit}</span></label>` +
    `<input id="f-${k}" data-k="${k}" type="number" inputmode="numeric" min="0" step="1" placeholder="${ph || ''}" value="${esc(S.input[k])}">` +
    (hint ? `<small>${hint}</small>` : '') + '</div>';
  const why = (title, body) => `<div class="why"><b class="k">${title}</b>${body}</div>`;
  const sym = () => D.currency.symbol;
  const previewBox = () => '';
  const planNote = () => `<div class="note" style="margin:0 0 14px">Use this as your <b>planning estimate</b>. When you register, ${esc(D.authorities.tax.name)} gives you the exact amounts for your case.</div>`;
  const ex = k => (D.examples && D.examples[k] != null ? 'e.g. ' + D.examples[k] : '');
  function bracketsText(br) {
    return br.map((b, i) => {
      const prev = i ? br[i - 1].upToChargeable : 0;
      return b.upToChargeable != null ? `${pct(b.rate)} ${i ? 'from ' + J(prev) + ' ' : ''}up to ${J(b.upToChargeable)}` : (i ? `${pct(b.rate)} above ${J(prev)}` : `${pct(b.rate)} flat rate`);
    }).join(', ');
  }
  function footer() {
    const a = D.authorities;
    const link = x => (x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)}</a>` : esc(x.name));
    const src = (D.sources || []).map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('');
    return `<div class="share"><b>Share this app</b> <a class="chip soft" data-share="whatsapp" href="https://wa.me/?text=Free%20tool%20to%20test%20a%20business%20idea%20in%20the%20Caribbean%3A%20taxes%2C%20take-home%20income%20and%20a%20plan.%20No%20sign-up.%20https%3A//heso73.github.io/pa-a-pa/caribbean/" target="_blank" rel="noopener">WhatsApp</a> <a class="chip soft" data-share="facebook" href="https://www.facebook.com/sharer/sharer.php?u=https%3A//heso73.github.io/pa-a-pa/caribbean/" target="_blank" rel="noopener">Facebook</a> <button class="chip soft" data-act="copylink" data-url="https://heso73.github.io/pa-a-pa/caribbean/">Copy link</button> <span id="copiedlink" class="small muted" role="status"></span></div><p class="small"><a href="partners/">For organizations: partner kit</a></p>` + `<footer class="fine"><p>These figures are estimates to help you decide. They are not tax or legal advice. Data for ${esc(D.name)} last checked on ${esc(D.dataVerifiedOn)}. Always confirm with ${link(a.tax)} and ${link(a.registry)}.</p>` +
      `<details class="more"><summary>Good to ask the tax office</summary>${li(D.toVerify.map(esc))}<p class="small" style="margin:8px 0 0"><b>Who to ask: </b>${[D.authorities.tax, D.authorities.registry].filter(Boolean).map(a => a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a>` : esc(a.name)).join(' · ')}</p></details>` +
      (src ? `<details class="more"><summary>Sources</summary><ul>${src}</ul></details>` : '') +
      `<p>Pa a Pa is a free planning tool for first-time entrepreneurs. <a href="es/">Español</a> · <a href="../app/">Version française</a></p></footer>`;
  }

  /* ---------- HOME ---------- */
  function home() {
    const done = S.ready ? `<a class="path" href="#/report" style="margin-bottom:12px"><div class="n" style="background:var(--sun);color:var(--ink)">✓</div><div><div class="t">Your report is ready</div><div class="d">Open it again, or change your numbers in the test.</div></div></a>` : '';
    return `<section class="hero"><h1>Your business project, step by step.</h1>
      <p class="lead">Free, no sign-up. Every question and every figure is explained in plain words. Showing taxes and rules for <b>${esc(D.name)}</b>.</p></section>
      ${previewBox()}${done}
      <nav class="paths" aria-label="Choose a path">
        <a class="path primary" href="#/test"><div class="n">1</div><div><div class="t">Test your project</div><div class="d">Will it hold up? Get your answer in a few minutes.</div></div></a>
        <a class="path" href="#/vision"><div class="n">2</div><div><div class="t">Build your vision</div><div class="d">Get your ideas clear: who for, what, how.</div></div></a>
        <a class="path" href="#/next"><div class="n" style="background:var(--ink)">3</div><div><div class="t">Move toward success</div><div class="d">Your next steps, with a coach to guide you.</div></div></a>
        <a class="path" href="#/success"><div class="n" style="background:var(--sun);color:var(--ink)">4</div><div><div class="t">The rules of profit</div><div class="d">Why a business earns money, and how to keep it that way.</div></div></a>
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
    const act = D.activities ? `<h2 class="q">What will your business mainly do?</h2><div class="opts">${D.activities.map(a => `<label class="opt"><input type="radio" name="activity" data-k="activity" value="${a.id}" ${S.input.activity === a.id ? 'checked' : ''}><span class="t">${esc(a.label)}</span><small>${esc(a.plain)}</small></label>`).join('')}</div>` : '';
    return `<h2 class="q">How will you operate?</h2><div class="opts">${st}</div>${act}
      <h2 class="q">How will your customers pay you?</h2><div class="opts">${pm}</div>${extra}
      ${why('Why these questions?', '<p>Your legal form decides which taxes and contributions you pay. If you are unsure, start with the registered business name: it is usually the simplest.</p><p>If customers pay later, you advance the money in the meantime. That money is called <b>working capital</b>. We only calculate it when it applies to you.</p>')}`;
  }
  function stepMoney() {
    const u = `(${sym()} per month)`;
    return `<h2 class="q">Your money, month by month</h2><p class="muted">All amounts in ${esc(D.currency.code)} (${esc(sym())}), per month.</p>
      ${fieldNum('sales', 'Expected sales', u, 'What customers will pay you in a normal month.', ex('sales'))}
      ${fieldNum('direct', 'Cost of what you sell', u, 'Goods, materials, packaging: what you spend to make or buy what you sell. Enter 0 if none.', ex('direct'))}
      ${fieldNum('fixed', 'Fixed costs', u, 'Costs that do not change with sales: rent, transport, phone, insurance, marketing. Enter 0 if none.', ex('fixed'))}
      ${fieldNum('needs', 'What you need to live on', u, 'Your household has to eat. Be honest: this counts as a cost of the project.', ex('needs'))}
      ${why('Why these questions?', '<p>We compare what comes in with what goes out, then take off taxes and contributions. What is left must cover your living needs, or the plan cannot work.</p>')}`;
  }
  function stepTeam() {
    return `<h2 class="q">Your team and your start</h2>
      <div class="grid2">${fieldNum('emp', 'Employees', '(number)', 'Not counting you. Enter 0 if none.', '0')}${fieldNum('pay', 'Gross pay per employee', `(${sym()} per month)`, 'Before deductions.', ex('pay'))}</div>
      <div class="grid2">${fieldNum('startup', 'Start-up costs', `(${sym()}, one time)`, 'Equipment, stock, registration, website. Enter 0 if none.', ex('startup'))}${fieldNum('savings', 'Savings you can use', `(${sym()})`, 'Money you can put in without borrowing.', ex('savings'))}</div>
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
    if (step === 0) { if (!i.status) return 'Choose how you will operate.'; if (D.activities && !i.activity) return 'Choose what your business will mainly do.'; if (!i.payMode) return 'Choose how your customers will pay you.'; if (i.payMode === 'both' && !(num(i.creditShare) > 0)) return 'Enter the share of sales that is paid later.'; }
    if (step === 1) { if (!(num(i.sales) > 0)) return 'Enter your expected sales per month.'; if (!(num(i.needs) > 0)) return 'Enter what you need to live on each month.'; }
    if (step === 3) { if (!(+i.m1 && +i.m2 && +i.m3)) return 'Rate the three statements to continue.'; }
    return '';
  }
  function test() {
    const s = Math.min(Math.max(+S.step || 0, 0), 3);
    const bars = [0, 1, 2, 3].map(n => `<i class="${n <= s ? 'on' : ''}"></i>`).join('');
    const body = [stepProject, stepMoney, stepTeam, stepMotivation][s]();
    const last = s === 3;
    return `<div class="backrow"><a class="iconbtn" href="#/" aria-label="Back to home"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 3L5 9l6 6"></path></svg></a><b style="color:var(--deep);font-size:14px">Test your project · ${esc(D.name)}</b></div>
      <div class="progress" aria-hidden="true">${bars}</div><div class="crumb">Part ${s + 1} of 4 · ${STEP_NAMES[s]}</div>${s === 0 ? previewBox() : ''}
      ${errMsg ? `<p class="error" role="alert">${esc(errMsg)}</p>` : ''}${body}
      <div class="btnrow"><button class="btn" data-act="${last ? 'finish' : 'next'}">${last ? 'See my report' : 'Continue'}</button>${s > 0 ? '<button class="btn link" data-act="back">Back</button>' : ''}</div>${footer()}`;
  }

  /* ---------- REPORT ---------- */
  const VERDICT = {
    ok: ['Viable', 'Your plan covers your living needs, your savings can carry the start, and you feel ready. Keep checking your numbers once you begin.'],
    cond: ['Viable, under conditions', 'Your project can work if you fix the points below before you start.'],
    no: ['Not viable yet', 'As it stands, this plan cannot pay your bills. The good news: you found out before spending money. Work on the points below and test again.']
  };
  function glossary(c) {
    const items = [['Cost of what you sell', 'What you spend on goods and materials for what you sell.'], ['Fixed costs', 'Costs you pay even in a slow month: rent, phone, insurance.']];
    if (c.model === 'corporate') {
      if (D.corporateTax) items.push([D.corporateTax.label, 'Tax on the profit of the company. ' + bracketsText(D.corporateTax.brackets) + '.']);
    } else {
      D.selfEmployed.contributions.forEach(ct => items.push([ct.label, ct.plain]));
      if (D.incomeTax) items.push([D.incomeTax.label, 'Tax on your profit after the tax-free amount (' + D.incomeTax.allowanceNote + '). Rates: ' + (D.incomeTax.bracketText || bracketsText(D.incomeTax.brackets)) + '.']);
    }
    (D.salesLevies || []).filter(l => !l.appliesTo || l.appliesTo.includes(c.status)).forEach(l => items.push([l.label, 'Charged on your sales (not on your profit), so you pay it even when you make no profit.']));
    return `<details class="more"><summary>What do these words mean?</summary><dl>${items.map(x => `<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join('')}</dl></details>`;
  }
  function reportView() {
    const R = report();
    if (!R) return `<h1>Your report</h1><p class="lead">Take the test first. It takes a few minutes and the report is built from your answers.</p><a class="btn" href="#/test">Test my project</a>${footer()}`;
    const c = R.c;
    const rows = [['Sales', J(c.annualSales)], ['Cost of what you sell and fixed costs', '-' + J((c.direct + c.fixed) * 12)]];
    if (c.emp) { rows.push(['Employee pay', '-' + J(c.payroll)]); rows.push(['Employer contributions', '-' + J(c.er)]); }
    rows.push(['<b>Profit before tax</b>', J(c.profit)]);
    c.lines.forEach(l => rows.push([esc(l.label), '-' + J(l.amount)]));
    const table = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('') + `<tr class="sum"><td>Left for you, per year</td><td>${J(c.net)}</td></tr><tr><td>Left for you, per month</td><td><b>${J(c.netMonthly)}</b></td></tr><tr><td>You need, per month</td><td>${J(c.needs)}</td></tr>`;
    const notes = [];
    if (R.be) notes.push(`<div class="note"><b>Break-even:</b> you need about ${J(R.be)} in sales per month to cover your costs, your taxes and your living needs.</div>`);
    notes.push(`<div class="note${c.left < 0 ? ' alert' : ''}"><b>Start-up:</b> ${c.left < 0 ? `your savings are ${J(-c.left)} short of the start-up costs.` : `after start-up costs you keep ${J(c.left)}, about ${c.runway.toFixed(1)} months of living costs if income stopped.`}</div>`);
    if (c.credit) notes.push(`<div class="note${c.bfr > Math.max(0, c.left) ? ' alert' : ''}"><b>Working capital:</b> waiting for customers to pay ties up about ${J(c.bfr)} of your own money.</div>`);
    notes.push(`<div class="note"><b>Motivation ${c.motivation} out of 15:</b> ${c.motivation >= 12 ? 'Strong. Keep your reasons written down for hard months.' : c.motivation >= 8 ? 'A good base. Work on your lowest-rated statement before you start.' : 'Take time to prepare: test your idea part-time and find your first customers first.'}</div>`);
    (D.notes || []).forEach(n => notes.push(`<div class="note alert">${esc(n)}</div>`));
    const sw = (title, color, items) => `<section class="card swot"><h3><span class="dot" style="background:${color}"></span>${title}</h3>${li(items.map(esc))}</section>`;
    const recs = R.recs.map(r => `<li><div>${esc(r[1])}<br><a href="#/coach/${r[0]}">Ask the coach: ${esc(TOPIC[r[0]].label())}</a></div></li>`).join('');
    return `<h1>Viability report</h1><div class="muted small" style="margin:4px 0 8px">${esc(D.name)} · ${esc(stat().label)}</div>
      <div class="verdict ${R.verdict}"><div class="k">Verdict</div><div class="v">${VERDICT[R.verdict][0]}</div><p>${VERDICT[R.verdict][1]}</p></div>${planNote()}
      <section class="card"><h3 style="margin-bottom:10px">How your year adds up</h3><table class="sum">${table}</table>${notes.join('')}${glossary(c)}</section>
      ${sw('Strengths', '#0B4FA0', R.strengths)}${sw('Weaknesses', '#F5B83D', R.weaknesses)}${sw('Opportunities', '#0A2A6B', R.opportunities)}${sw('Risks', '#C2491D', R.risks)}
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
    const q = D.calendar.quarterly;
    const cand = q.map(x => new Date(y, x.m - 1, x.d)).concat([new Date(y + 1, q[0].m - 1, q[0].d)]);
    return cand.find(d => d >= t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function feeText(st) {
    const parts = [];
    if (st.feeLines && st.feeLines.length) parts.push('Budget for registration: ' + st.feeLines.map(f => `${f.label.toLowerCase()} ${J(f.amount)}`).join(', ') + '.');
    if (st.feeNote) parts.push(st.feeNote);
    return parts.join(' ');
  }
  function nextView() {
    const R = report(), c = R ? R.c : E.compute(D, S.input), st = stat(), cal = D.calendar;
    const steps = D.launchSteps.filter(s => s.appliesTo.includes(st.id) && (s.when !== 'employees' || c.emp > 0) && (s.when !== 'vat' || c.vat));
    const done = steps.filter(s => S.done[s.id]).length;
    const list = steps.map(s => `<li><label><input type="checkbox" data-done="${s.id}" ${S.done[s.id] ? 'checked' : ''}><span><span class="t">${esc(s.label)}</span><small>${esc(s.plain)}${s.url ? ` <a href="${esc(s.url)}" target="_blank" rel="noopener">Official site</a>` : ''}</small></span></label></li>`).join('');
    const rows = [];
    if (cal.quarterly && cal.quarterly.length) rows.push(['Next: ' + nextQuarter(), (st.taxModel === 'corporate' ? cal.quarterlyTextCorporate : cal.quarterlyTextPersonal) + ' Due dates each year: ' + cal.quarterlyList + '.']);
    if (cal.monthlyText) rows.push([cal.monthlyLabel || 'Every month', cal.monthlyText]);
    rows.push([cal.annualLabel, st.taxModel === 'corporate' ? 'File your company tax return for the year before.' : cal.annualTextPersonal]);
    if (c.emp > 0) rows.push([cal.payrollDay ? `By the ${cal.payrollDay}th` : 'Every month', cal.payrollText]);
    if (c.vat && cal.vatText) rows.push([D.vat.short, cal.vatText]);
    return `<h1>Move toward success</h1><p class="lead">Your next steps in <b>${esc(D.name)}</b> for a <b>${esc(st.label.toLowerCase())}</b>.${S.ready ? '' : ' <a href="#/test">Take the test</a> to adapt this list to your project.'}</p>
      <section class="card" style="margin-top:14px"><h3 style="margin-bottom:4px">Steps to launch</h3><p class="muted small" id="donecount">${done} of ${steps.length} done</p><ul class="checklist">${list}</ul><p class="muted small" style="margin:12px 0 0">${esc(feeText(st))}</p></section>
      <section class="card"><h3 style="margin-bottom:10px">Your tax calendar</h3><ul class="cal">${rows.map(x => `<li><b>${esc(x[0])}</b><span>${esc(x[1])}</span></li>`).join('')}</ul>${R && st.taxModel !== 'corporate' ? `<div class="note alert"><b>Set aside ${J(c.setAside)} a month</b> in a separate account so the payments are ready when they fall due.</div>` : ''}</section>
      <section class="card"><h3 style="margin-bottom:8px">Help for small businesses</h3><p>${D.authorities.support.map(s => s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>` : esc(s.name)).join('<br>')}</p><p class="muted small" style="margin:0">Ask them what advice and financing are open now.</p></section>
      <div class="btnrow" style="margin-top:18px"><a class="btn" href="#/coach">Ask my coach</a></div>${footer()}`;
  }

  /* ---------- COACH ---------- */
  const TOPIC = {};
  function defTopics() {
    const R = () => report();
    const L = k => () => k;
    TOPIC.cost = { label: L('Cost price and selling price'), tool: 'cost', msgs: () => {
      const r = R(), m = ['<p>Your <b>cost price</b> is what one product or one job costs you before you sell it: materials, packaging, transport and your own time.</p>'];
      m.push(`<p>If you sell below it, you lose money on every sale, even when customers are happy.${r && r.c.sales > 0 ? ` In your plan, goods and materials take ${pct(Math.min(1, r.c.direct / r.c.sales))} of your sales.` : ''} Let's work it out for one product or one job.</p>`);
      return m; } };
    TOPIC.breakeven = { label: L('Break-even sales'), msgs: () => {
      const r = R();
      if (!r) return ['<p><b>Break-even</b> is the monthly sales that cover your costs, your taxes and your living needs. <a href="#/test">Take the test</a> to see yours.</p>'];
      const m = [];
      if (!r.be) m.push('<p>Right now your purchases cost as much as your sales, so no amount of sales reaches break-even. Start with your prices.</p>');
      else m.push(`<p>To pay your costs, your taxes and your living needs, you need about <b>${J(r.be)}</b> in sales per month. Your plan has ${J(r.c.sales)}.${r.be > r.c.sales * 1.02 ? ` That is ${J(r.be - r.c.sales)} more than planned.` : ' You are above it.'}</p>`);
      m.push('<p>You have three levers: raise a price, cut a cost, or plan more sales. Change one at a time and run the test again. <a href="#/test">Edit my numbers</a></p>');
      return m; } };
    TOPIC.cash = { label: L('Customers who pay late'), msgs: () => {
      const r = R(), m = ['<p>When a customer pays in 30 days, you have already paid for materials, wages and rent. The money you advance in the meantime is your <b>working capital</b>.</p>'];
      if (r) m.push(r.c.credit ? `<p>In your plan, waiting for payment ties up about <b>${J(r.c.bfr)}</b>.</p>` : '<p>In your plan customers pay on the spot, so this does not affect you.</p>');
      m.push(li(['Ask for a deposit before you start.', 'Invoice the same day, with a clear due date.', 'Offer shorter terms, for example 14 days.', 'Ask your suppliers for more time to pay.', 'Pause work for customers who are already late.']));
      return m; } };
    TOPIC.savings = { label: L('My safety net'), msgs: () => {
      const r = R(), m = [];
      if (r) m.push(r.c.left < 0 ? `<p>Your savings are <b>${J(-r.c.left)}</b> short of the start-up costs.</p>` : `<p>After start-up costs you keep <b>${J(r.c.left)}</b>, about <b>${r.c.runway.toFixed(1)} months</b> of living costs if income stopped.</p>`);
      else m.push('<p>Your <b>safety net</b> is what you keep after start-up costs, divided by what you need to live on each month. <a href="#/test">Take the test</a> to see yours.</p>');
      m.push('<p>A common rule of thumb is three to six months of living costs before you rely on the business. To get there: start part-time, cut start-up costs (buy used, rent instead of buy), or launch in phases.</p>');
      return m; } };
    TOPIC.tax = { label: L('Taxes and contributions'), msgs: () => {
      const r = R(), st = stat(), cal = D.calendar, m = [];
      if (st.taxModel === 'corporate') {
        const ct = D.corporateTax;
        if (ct) m.push(`<p>A limited company pays <b>${esc(ct.label.toLowerCase())}</b> on its profit: ${esc(bracketsText(ct.brackets))}.${r ? ` In your plan: about <b>${J(r.c.corpTax)}</b> a year.` : ''}${ct.note ? ' ' + esc(ct.note) : ''}</p>`);
        else m.push(`<p>A limited company does not pay tax on its profit in ${esc(D.name)}.</p>`);
        const lv = (D.salesLevies || []).filter(l => !l.appliesTo || l.appliesTo.includes(st.id));
        if (lv.length) m.push(`<p>It also pays on its sales: ${lv.map(l => '<b>' + esc(l.label) + '</b>').join(', ')}.</p>`);
        m.push(`<p>${cal.quarterlyList ? 'Payments fall due on ' + esc(cal.quarterlyList) + '. ' : ''}What you take out for yourself (salary or dividends) is taxed separately and is not in these numbers. Ask an accountant to plan it.</p>`);
      } else {
        m.push('<p>As a registered business name, your profit is taxed like personal income. Here is what is paid on it:</p>');
        const it = D.incomeTax, items = it ? [`<b>${esc(it.label)}:</b> ${esc(it.bracketText || bracketsText(it.brackets))}, after a tax-free amount (${esc(it.allowanceNote)}).`] : [];
        D.selfEmployed.contributions.forEach(ct => items.push(`<b>${esc(ct.label)}</b>${ct.rate != null ? ' (' + pct(ct.rate) + ')' : ''}: ${esc(ct.plain)}`));
        (D.salesLevies || []).filter(l => !l.appliesTo || l.appliesTo.includes(st.id)).forEach(l => items.push(`<b>${esc(l.label)}</b>: charged on your sales, not on your profit.`));
        if (!it) m.push(`<p>${esc(D.name)} has no income tax on your profit. Here is what you pay instead:</p>`);
        m.push(li(items));
        if (r) m.push(`<p>In your plan these come to about <b>${J(r.c.levies)}</b> a year. Set aside <b>${J(r.c.setAside)}</b> each month in a separate account.</p>`);
        m.push(`<p>${cal.quarterlyList ? 'Payments fall due on ' + esc(cal.quarterlyList) + '. ' : ''}${esc(cal.annualLabel)}: ${esc(cal.annualTextPersonal.charAt(0).toLowerCase() + cal.annualTextPersonal.slice(1))} <a href="#/next">See my tax calendar</a></p>`);
      }
      (D.notes || []).forEach(n => m.push(`<p class="muted small">${esc(n)}</p>`));
      return m; } };
    TOPIC.vat = { label: () => (D.vat ? D.vat.short : 'Sales tax') + ' (sales tax)', msgs: () => {
      const r = R(), v = D.vat || {};
      if (!D.vat) return [`<p>${esc(D.name)} has no general sales tax on what you sell. Check the other costs listed in your report: licences, social contributions and payroll charges.</p>`];
      const m = [`<p><b>${esc(v.short)}</b> is the sales tax (${esc(v.label)}). The standard rate is ${pct(v.rate)}. You must register once your yearly sales reach <b>${J(v.threshold)}</b>. ${esc(v.registerNote)} After that you charge ${esc(v.short)} on your sales and file returns. ${esc(v.filingNote)}</p>`];
      if (r) m.push(`<p>Your planned yearly sales are ${J(r.c.annualSales)}.${r.c.vat ? ' You are over the line.' : ' You are below the line for now.'}</p>`);
      m.push('<p>You can also register earlier by choice. Ask the tax office or an accountant before you do.</p>');
      return m; } };
    TOPIC.team = { label: L('Employees'), msgs: () => {
      const r = R(), items = D.employer.items.map(i => `${esc(i.label)} ${pct(i.rate)}${i.minEmployees ? ' (from ' + i.minEmployees + ' employees)' : ''}`);
      const m = [`<p>An employee costs more than their pay. On top of gross pay, the employer adds: ${items.join(', ')}. Deductions are also taken from the employee's pay, and you pay all of it to the authorities.</p>`];
      m.push(r && r.c.emp > 0 ? `<p>In your plan, employer contributions add about <b>${J(r.c.er)}</b> a year to a payroll of ${J(r.c.payroll)}.</p>` : '<p>You planned no employees, so this does not affect your numbers yet.</p>');
      m.push(`<p>${esc(D.calendar.payrollText)}</p>`);
      return m; } };
    TOPIC.customers = { label: L('My first customers'), msgs: () => ['<p>Before you spend money, <b>name your first five customers</b>: real people or businesses who would buy from you.</p>', '<p>Then ask each one for a small commitment: a pre-order, a deposit, or a firm date. A kind word is not a customer. Money or a clear date is.</p>', '<p>If you cannot name five, your first job is not the business. It is talking to people who might buy. <a href="#/vision">Write them down in my vision</a></p>'] };
    TOPIC.motivation = { label: L('Staying motivated'), msgs: () => {
      const r = R(), m = ['<p>Money is only one side of the test. Energy decides whether the plan survives the first months.</p>'];
      if (r) m.push(`<p>Your motivation score is ${r.c.motivation} out of 15.</p>`);
      m.push(li(['Test small first: sell to five people before you quit anything.', 'Agree with your household on a reserve and a review date, for example after three months.', 'Write down why you are doing this. Read it on hard days.', 'Decide now what result would make you change course.']));
      return m; } };
    TOPIC.funding = { label: L('Loans and support'), msgs: () => {
      const r = R(), m = ['<p>Several bodies work with small businesses in ' + esc(D.name) + '. I cannot tell you which programme you qualify for. Contact them and ask what advice and financing are open now.</p>'];
      if (r) m.push(`<p>Before you borrow: your plan leaves about <b>${J(r.c.netMonthly)}</b> a month after tax. A loan payment must fit inside that amount, not on top of it.</p>`);
      m.push(`<p>${D.authorities.support.map(s => s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>` : esc(s.name)).join('<br>')}</p>`);
      return m; } };
    TOPIC.mistakes = { label: L('Common mistakes'), msgs: () => {
      const r = R(), m = ['<p>Most small businesses do not fail because of one big mistake. These seven come up again and again:</p>'];
      m.push(li(['<b>Selling below the real cost.</b> Forgetting your own time, packaging, transport or fees.', '<b>Not knowing your break-even.</b> You need a monthly sales figure that covers all your costs, taxes and living needs.', '<b>Running out of cash.</b> No safety net, or customers who pay late while you have already paid your bills.', '<b>Starting without customers.</b> Building first and asking later. Name five people who would pay.', '<b>Forgetting taxes and contributions.</b> The money in your account is not all yours.', '<b>Mixing personal and business money.</b> It hides the real numbers. Use a separate account.', '<b>Growing too fast.</b> Hiring or investing before sales are steady.']));
      if (r && (!r.be || r.be > r.c.sales * 1.02)) m.push('<p>In your plan, your sales are <b>below break-even</b>. Start with this one.</p>');
      else if (r && r.c.left < 0) m.push('<p>In your plan, your savings are <b>short of the start-up costs</b>. Start with this one.</p>');
      return m; } };
    TOPIC.start = { label: L("Where do I start?"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Start small and in this order, before you spend money:</p>");
      m.push(li(["<b>Check the need.</b> Talk to five people who might buy. Ask what they pay for this today.", "<b>Run your numbers.</b> <a href=\"#/test\">Take the test</a> to see your costs, taxes and break-even.", "<b>Make a first sale.</b> Sell to one real customer, even by hand, before you build anything big.", "<b>Then register and set up.</b> Follow the steps in <a href=\"#/next\">my next steps</a>."]));
      return m; } };
    TOPIC.legal = { label: L("Business structure"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>The usual choice is between two options:</p>");
      m.push(li(["<b>Registered business name (you, trading under a name).</b> Cheap and simple. You and the business are legally the same person, so you answer for debts with your own assets.", "<b>Limited company.</b> A separate legal entity, which can limit your personal risk. More paperwork, yearly filings and often higher costs."]));
      m.push("<p>Taxes differ between the two. <a href=\"#/test\">The test</a> and <a href=\"#/report\">the report</a> use the one you choose. Ask the company registry or an accountant before you decide.</p>");
      return m; } };
    TOPIC.register = { label: L("Registering my business"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Registering usually means a few separate steps, in this order:</p>");
      m.push(li(["Register the business name or company with the official registry.", "Get a tax number from the tax office.", "Register for social contributions if you work for yourself or hire people.", "Ask the local council or ministry whether your activity needs a licence or permit (food, transport and health often do).", "Register for sales tax if your sales reach the threshold."]));
      m.push("<p>The exact offices and forms for your country are in <a href=\"#/next\">my next steps</a>. Do not start selling in a regulated activity before you have asked.</p>");
      return m; } };
    TOPIC.bank = { label: L("A business bank account"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Use a separate account for the business from day one, even a simple one.</p>");
      m.push(li(["Every sale and every cost goes through it. Your numbers stay true.", "It makes tax time and any loan request much easier.", "Move a fixed amount to yourself each month, like a salary.", "Keep a second small account for taxes. Put the share you must pay aside as soon as you are paid."]));
      m.push("<p>Ask two or three banks about monthly fees before you choose.</p>");
      return m; } };
    TOPIC.records = { label: L("Keeping records"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>You do not need software at the start. You need a habit.</p>");
      m.push(li(["Keep every receipt and invoice, paper or photo, in one folder.", "Write each sale and each cost the same day, with date, amount and what it was for.", "Once a month, add up sales, costs and what is left. Compare with your plan.", "Keep your records for as many years as your tax office asks."]));
      m.push("<p>An accountant can set this up for you in an hour or two, and it often pays for itself. I do not replace one.</p>");
      return m; } };
    TOPIC.insurance = { label: L("Insurance"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Insurance is a cost that protects you from a loss you could not pay yourself.</p>");
      m.push(li(["<b>Property and stock:</b> fire, theft, storm and flood. Important in hurricane areas.", "<b>Liability:</b> if a customer or another person is harmed or loses money because of you.", "<b>Vehicle:</b> required by law if you drive for the business.", "<b>Health and income cover for you:</b> if you cannot work, the business stops."]));
      m.push("<p>Ask two insurers for quotes and add the yearly cost to your fixed costs in <a href=\"#/test\">the test</a>.</p>");
      return m; } };
    TOPIC.marketing = { label: L("Finding customers"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Start with the cheapest ways, and measure what works.</p>");
      m.push(li(["<b>Word of mouth.</b> Ask your first customers to tell two people, and thank them.", "<b>One social page</b> or a WhatsApp Business number where people can see what you sell and your prices.", "<b>Be where your customers already are:</b> a market, a Facebook group, a notice board, a partner business.", "<b>Offer a small first-time deal</b> and ask how they heard about you."]));
      m.push("<p>Spend money on adverts only after you know which message already works for free. Advertising is a cost in your plan.</p>");
      return m; } };
    TOPIC.online = { label: L("Selling online"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>You can start online with very little money, but the same rules apply: costs, taxes and customers.</p>");
      m.push(li(["Add the platform fee, the payment fee, packaging and delivery to your cost price before you set your price.", "Sales to other countries can bring customs, shipping and tax questions. Check before you promise a delivery.", "Clear photos and descriptions sell more than a fancy site.", "Test with one social page or a marketplace before you pay for a website."]));
      m.push("<p>Online sales are still sales: they count for tax and for your records.</p>");
      return m; } };
    TOPIC.profit = { label: L("Profit, sales and cash"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Three different numbers, which beginners often mix up:</p>");
      m.push(li(["<b>Sales (turnover):</b> everything customers pay you.", "<b>Profit:</b> sales minus all costs and taxes. This is what the business really earns.", "<b>Cash:</b> the money in your account today. It can be high when profit is low (a large advance payment) and low when profit is high (customers who have not paid yet)."]));
      m.push("<p>A business can make a profit and still run out of cash. Watch both. <a href=\"#/test\">The test</a> shows your break-even and what is left after tax.</p>");
      return m; } };
    TOPIC.pay = { label: L("Paying myself"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Decide a fixed monthly amount for yourself and treat it like a salary, not like what is left over.</p>");
      m.push(li(["Start from your real living costs, from the test.", "Pay yourself only after costs and taxes are covered.", "If sales are low, cut your own pay before you stop paying suppliers or taxes.", "Review the amount every three months."]));
      if (r) m.push(`<p>In your plan, about <b>${J(r.c.netMonthly)}</b> a month is left after tax.</p>`);
      return m; } };
    TOPIC.costs = { label: L("Fixed and variable costs"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Costs come in two kinds:</p>");
      m.push(li(["<b>Fixed costs</b> do not change with sales: rent, insurance, subscriptions, your own pay.", "<b>Variable costs</b> rise with each sale: materials, packaging, delivery, commissions."]));
      m.push("<p>Break-even is the number of sales it takes to cover the fixed costs once the variable costs are paid. Cutting a fixed cost helps every month; cutting a variable cost helps every sale. <a href=\"#/test\">Enter both in the test.</a></p>");
      return m; } };
    TOPIC.suppliers = { label: L("Suppliers"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Your suppliers decide your cost price, so choose them with care.</p>");
      m.push(li(["Get at least three quotes for the same quantity and quality.", "Ask the price per unit at different quantities, but do not buy more than you can sell.", "Ask for payment terms, for example 30 days, to ease your cash.", "Test a small first order before any big one.", "Keep a second supplier for your main item."]));
      return m; } };
    TOPIC.stock = { label: L("Managing stock"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Stock is money sitting on a shelf.</p>");
      m.push(li(["Buy small amounts of what you know sells, and re-order often.", "Count your stock each month and note what sold fastest.", "Mark down slow items early, before they go out of date or fashion.", "Do not tie your savings up in stock before the first sales prove demand."]));
      return m; } };
    TOPIC.premises = { label: L("Where to work"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Fixed rent is the cost that sinks many small businesses. Start with the cheapest place that works.</p>");
      m.push(li(["<b>From home:</b> check local rules and your lease or landlord first; some activities (food, noise, customers visiting) need permission.", "<b>Market stall or shared space:</b> low cost, a way to test, and you meet customers.", "<b>Your own premises:</b> only when sales are steady and can pay the rent.", "Always read the lease and ask what happens if you leave early."]));
      return m; } };
    TOPIC.partners = { label: L("Business partners"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>A partner can bring skills and money, and can also end a business.</p>");
      m.push(li(["Write down who puts in what: money, work and time.", "Agree how profit is shared and how each of you is paid.", "Agree what happens if one partner leaves, falls ill or wants to sell.", "Put it in writing and have a lawyer check it."]));
      m.push("<p>Do this while you still get along. A handshake between friends is a common cause of arguments later.</p>");
      return m; } };
    TOPIC.parttime = { label: L("Keeping my job"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>You can test the business while keeping your income. It is often the safest way to start.</p>");
      m.push(li(["Check your work contract: some employers ban side businesses or competing work.", "Start in the evenings and at weekends until sales cover your living costs.", "Set the level at which you will quit, for example three months of living costs saved and steady sales. <a href=\"#/test\">The test</a> shows your safety net.", "Tell your household what the plan and the review date are."]));
      return m; } };
    TOPIC.competition = { label: L("Competitors"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Competitors are good news: they prove people pay for this.</p>");
      m.push(li(["List the three nearest competitors, with their prices and what customers like or dislike.", "Do not just be cheaper. Choose one way to be better: speed, quality, trust, convenience or location.", "Ask your first customers why they chose you.", "Write it down in <a href=\"#/vision\">my vision</a>."]));
      return m; } };
    TOPIC.growth = { label: L("Growing the business"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Grow when the numbers are steady, not when you are excited.</p>");
      m.push(li(["Wait for three or more months of sales above break-even.", "Add one thing at a time: a product, a worker, a place.", "Before you spend, estimate the extra sales it must bring to pay for itself.", "Keep your safety net intact."]));
      return m; } };
    TOPIC.seasonality = { label: L("Slow months"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Many Caribbean businesses sell much more in some months than in others, with tourism, holidays and the hurricane season.</p>");
      m.push(li(["Look at last year or ask other sellers: which months are busy and which are quiet?", "Put money aside in busy months to cover the quiet ones.", "Plan fixed costs you can cut or pause in the low season.", "Offer something for slow months: a discount, a different product, or a service for local people."]));
      return m; } };
    TOPIC.invoice = { label: L("Invoices and quotes"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>A clear invoice gets you paid faster. Include:</p>");
      m.push(li(["Your business name, address and tax number if you have one.", "A unique invoice number and the date.", "What you sold, the quantity, the price and any sales tax.", "The total, the due date and how to pay (account details).", "Send it the same day and keep a copy."]));
      m.push("<p>For a quote, add how long the price is valid and what is not included.</p>");
      return m; } };
    TOPIC.contracts = { label: L("Agreements with customers"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Written terms prevent most disputes.</p>");
      m.push(li(["For any job above a small amount, write down what you will do, the price, the timing and the deposit.", "State your refund or return rule in plain words, and display it.", "Keep messages and photos as proof.", "If a customer complains, answer quickly and calmly, and offer a fix before they ask."]));
      return m; } };
  }
  const ORDER_ALL = ['start', 'mistakes', 'cost', 'breakeven', 'tax', 'customers', 'savings', 'cash', 'vat', 'team', 'motivation', 'funding', 'legal', 'register', 'bank', 'records', 'insurance', 'marketing', 'online', 'profit', 'pay', 'costs', 'suppliers', 'stock', 'premises', 'partners', 'parttime', 'competition', 'growth', 'seasonality', 'invoice', 'contracts'];
  const orderList = () => ORDER_ALL.filter(id => id !== 'vat' || D.vat);
  const KEYWORDS = [['mistakes', /mistake|fail|go(es)? wrong|bankrupt|pitfall|risk|why do (small )?(businesses|companies)/], ['cost', /cost price|price|pricing|margin|charge|how much (should|do) i sell/], ['breakeven', /break.?even|how much (do i )?need to sell/], ['cash', /\blate\b|invoice|unpaid|working capital|cash ?flow|bfr|credit/], ['savings', /saving|reserve|runway|safety/], ['tax', /tax|\bnis\b|\bnht\b|contribution|income tax|\btrn\b|\btin\b|levy|surcharge/], ['vat', /gct|\bvat\b|sales tax/], ['team', /employ|staff|hire|payroll|worker/], ['customers', /customer|client|market|buyer|sell to/], ['motivation', /motivat|afraid|scared|stress|quit|doubt|fear/], ['funding', /loan|fund|grant|borrow|bank|support/]];

  const EXTRA = {"cost": ["pricing", "selling price", "price", "cost price", "margin"], "breakeven": ["break even", "breakeven", "break-even"], "tax": ["taxes", "taxation", "contribution", "contributions"], "customers": ["customer", "customers", "buyers", "clients"], "savings": ["savings", "safety net", "reserve"], "cash": ["working capital", "cash flow", "paid late", "unpaid", "pay late"], "team": ["employee", "employees", "staff", "payroll", "worker"], "motivation": ["motivation", "stressed", "afraid", "scared"], "funding": ["loan", "grant", "borrow", "funding", "financing"], "vat": ["sales tax"], "mistakes": ["mistake", "mistakes", "failure", "pitfall", "go wrong"], "start": ["where do i start", "how to start", "how do i start", "start a business", "starting a business", "get started", "begin", "first step", "new business", "business idea", "my idea", "good idea", "launch", "any advice", "some advice", "your advice", "tips for beginners", "beginner", "newbie", "new to business"], "legal": ["legal form", "sole trader", "sole proprietor", "limited company", "ltd", "llc", "incorporate", "registered business name", "partnership", "business structure", "legal structure"], "register": ["register my business", "register a business", "register the business", "register my company", "business registration", "licence", "license", "permit", "paperwork", "legal requirements"], "bank": ["bank account", "business account", "separate account", "mobile money", "mix money", "mixing money", "personal money", "mix personal"], "records": ["bookkeeping", "accounting", "records", "receipts", "record keeping", "accountant", "spreadsheet", "book keeping"], "insurance": ["insurance", "insure", "insured", "liability", "protect my business", "theft", "fire"], "marketing": ["marketing", "advertis", "promote", "promotion", "social media", "facebook", "instagram", "whatsapp", "tiktok", "get customers", "find customers", "more customers", "flyer", "word of mouth", "brand", "logo", "website", "visibility"], "online": ["online", "e-commerce", "ecommerce", "etsy", "amazon", "shopify", "shipping", "delivery", "dropship", "online store"], "profit": ["profit", "turnover", "revenue", "earn", "make money", "how much money", "income"], "pay": ["pay myself", "my salary", "my wage", "how much should i take", "drawings", "dividend", "owner pay", "take home", "take out of the business"], "costs": ["fixed cost", "variable cost", "overhead", "running costs", "monthly costs", "expenses"], "suppliers": ["supplier", "wholesale", "wholesaler", "negotiate", "bulk", "vendor", "where to buy", "buy stock"], "stock": ["stock", "inventory", "unsold", "how much to buy", "reorder", "spoil", "expire"], "premises": ["premises", "shop", "store front", "storefront", "location", "office", "home based", "work from home", "kitchen", "workshop", "stall", "market stall", "rent"], "partners": ["partner", "co-found", "cofound", "business partner", "with a friend", "with my brother", "with my sister", "family business"], "parttime": ["keep my job", "quit my job", "resign", "side business", "side hustle", "my job", "leave my job", "part-time job", "part time job", "my employer"], "competition": ["competitor", "competition", "compete", "rival", "different from", "stand out", "unique", "others sell"], "growth": ["growing", "growth", "expand", "scale up", "second branch", "new product", "bigger", "when to grow", "grow", "grows"], "seasonality": ["season", "slow month", "slow period", "low season", "hurricane", "tourist", "off season", "quiet month"], "invoice": ["write an invoice", "make an invoice", "create an invoice", "send an invoice", "invoice template", "quote", "quotation", "receipt"], "contracts": ["contract", "agreement", "terms and conditions", "in writing", "deposit", "refund", "guarantee", "warranty", "complaint", "dispute", "return policy"]};
  const GREET = /^(hi|hello|hey|help|good (morning|afternoon|evening))\b/i;
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  Object.keys(EXTRA).forEach(k => { EXTRA[k] = EXTRA[k].map(norm); });
  /* true si les deux mots ne different que d'une lettre (faute de frappe) */
  const near = (a, b) => {
    if (a === b) return true;
    const la = a.length, lb = b.length; if (Math.abs(la - lb) > 1) return false;
    let i = 0; while (i < la && i < lb && a[i] === b[i]) i++;
    if (la === lb) return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
    return la > lb ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
  };
  /* Choisit le sujet dont le mot reconnu est le plus long (le plus precis). */
  function matchTopic(q) {
    const low = q.toLowerCase(), qn = norm(q), words = qn.split(/[^a-z0-9]+/).filter(Boolean), score = {};
    const up = (id, n) => { if (!(score[id] >= n)) score[id] = n; };
    KEYWORDS.forEach(k => { const m = low.match(k[1]); if (m) up(k[0], m[0].length); });
    Object.keys(EXTRA).forEach(id => EXTRA[id].forEach(s => {
      if (s.length < 5) { if (words.indexOf(s) >= 0) up(id, s.length); return; }
      if (qn.indexOf(s) >= 0) { up(id, s.length); return; }
      if (s.indexOf(' ') < 0 && words.some(w => w.length >= s.length - 1 && (near(w.slice(0, s.length), s) || near(w.slice(0, s.length - 1), s)))) up(id, s.length - 1);
    }));
    let best = null, top = 0;
    orderList().forEach(id => { if (score[id] > top) { top = score[id]; best = id; } });
    return best;
  }
  const allChip = () => '<button class="chip soft" data-act="all">' + esc("All topics") + '</button>';

  const chips = (ids, soft) => `<div class="chips">${ids.map(id => `<button class="chip${soft ? ' soft' : ''}" data-act="ask" data-topic="${id}">${esc(TOPIC[id].label())}</button>`).join('')}</div>`;
  function moreChips(current) {
    const r = report(), pri = r ? r.recs.map(x => x[0]) : [], pool = pri.concat(orderList());
    const ids = []; pool.forEach(id => { if (id !== current && !visited[id] && !ids.includes(id)) ids.push(id); });
    return ids.length ? `<p class="muted small" style="margin:6px 0 2px">What next?</p>${chips(ids.slice(0, 3), true)}${r ? '<a class="chip soft" href="#/report">My report</a>' : ''}` : '';
  }
  function toolCost() {
    const s = sym();
    return `<div class="bubble coach tool tool-cost"><p><b>Cost of one product or one job</b></p><div class="grid2">
      <div class="field"><label for="t-mat">Materials or goods <span class="unit">(${s})</span></label><input id="t-mat" type="number" inputmode="numeric" min="0" placeholder="0"></div>
      <div class="field"><label for="t-oth">Packaging, transport, fees <span class="unit">(${s})</span></label><input id="t-oth" type="number" inputmode="numeric" min="0" placeholder="0"></div>
      <div class="field"><label for="t-hrs">Hours of your time</label><input id="t-hrs" type="number" inputmode="decimal" min="0" step="0.25" placeholder="0"></div>
      <div class="field"><label for="t-rate">Your time, per hour <span class="unit">(${s})</span></label><input id="t-rate" type="number" inputmode="numeric" min="0" placeholder="0"><small>What you would want to earn per hour.</small></div></div>
      <div class="res" id="t-res" aria-live="polite"></div></div>`;
  }
  function costCalc() {
    const g = id => num(($('#' + id) || {}).value), cost = g('t-mat') + g('t-oth') + g('t-hrs') * g('t-rate'), el = $('#t-res');
    if (!el) return;
    if (!(cost > 0)) { el.textContent = ''; return; }
    const price = m => J(cost / (1 - m));
    el.innerHTML = `<p>Your cost price: <b>${J(cost)}</b>.</p><p>Margin is the share of the selling price you keep after this cost. To keep 30% sell at <b>${price(0.3)}</b>, to keep 40% sell at <b>${price(0.4)}</b>, to keep 50% sell at <b>${price(0.5)}</b>.</p><p class="muted small">Your fixed costs and taxes still come out of that margin.</p>`;
  }
  const chatHTML = () => chat.map(m => m.raw ? m.html : `<div class="bubble ${m.from}">${m.html}</div>`).join('');
  function coachPush(items) {
    chat = chat.concat(items);
    const log = $('#chatlog'); if (log) log.innerHTML = chatHTML();
    /* Amener la question qui vient d'être posée en haut de l'écran : la réponse s'affiche juste dessous. */
    if (log) {
      const mine = log.querySelectorAll('.bubble.me');
      const last = mine[mine.length - 1];
      if (last && last.scrollIntoView) requestAnimationFrame(() => last.scrollIntoView({ block: 'start', behavior: 'smooth' }));
    }
  }
  function coachAsk(id, label) {
    if (!TOPIC[id]) return;
    visited[id] = true;
    const items = [{ from: 'me', html: esc(label || TOPIC[id].label()) }];
    TOPIC[id].msgs().forEach(h => items.push({ from: 'coach', html: h }));
    if (TOPIC[id].tool === 'cost') items.push({ raw: true, html: toolCost() });
    items.push({ raw: true, html: moreChips(id) });
    coachPush(items);
  }
  function coachIntro() {
    const r = report();
    const first = [{ from: 'coach', html: `<p>Hello! I am your guide for ${esc(D.name)}. I am a tool built into this app, not a person, and I explain things in plain words. I do not replace an accountant.</p>` }];
    if (r) { first.push({ from: 'coach', html: '<p>Your report is ready. These are the most useful points to work on first:</p>' }); first.push({ raw: true, html: chips(r.recs.map(x => x[0])) }); }
    else { first.push({ from: 'coach', html: '<p>Take <a href="#/test">the test</a> first and I can build advice from your own numbers. Meanwhile, pick any topic:</p>' }); first.push({ raw: true, html: chips(orderList().slice(0, 6)) }); }
    return first;
  }
  function coach(arg) {
    if (!chat.length) chat = coachIntro();
    const pending = TOPIC[arg] && !visited[arg] ? arg : null;
    return `<div class="coachhead"><div class="avatar"><svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="30" width="10" height="14" rx="3" fill="#8FC9D4"></rect><rect x="19" y="19" width="10" height="25" rx="3" fill="#fff"></rect><rect x="34" y="6" width="10" height="38" rx="3" fill="#E8A33D"></rect></svg></div><div><h2 style="font-size:20px">Your coach</h2><div class="muted small">Free · Guided by your numbers</div></div></div>
      <div class="chat" id="chatlog" data-pending="${pending || ''}">${chatHTML()}</div>
      <form class="composer" id="composer" autocomplete="off"><input type="text" id="ask" aria-label="Ask your coach" placeholder="Ask about price, tax, customers..."><button type="submit" aria-label="Send"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#12262B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5"></path></svg></button></form>`;
  }

  /* ---------- country menu ---------- */
  function renderCountryMenu() {
    $('#cname').firstChild.nodeValue = D.name + ' ';
    const list = COUNTRIES.countries.map(c => `<button class="copt" data-country="${c.id}" ${c.id === D.country ? 'aria-current="true"' : ''}>${esc(c.name)}${c.preview ? ' (preview)' : ''}${c.id === D.country ? ' ✓' : ''}</button>`).join('');
    const soon = (COUNTRIES.comingSoon || []).length ? `<p class="muted small" style="margin:10px 0 0">Coming next: ${esc(COUNTRIES.comingSoon.join(', '))}. Each country has its own taxes and rules.</p>` : '';
    const ext = (COUNTRIES.external || []).map(c => `<button class="copt" data-url="${esc(c.url)}" data-key="${esc(c.key)}" data-id="${esc(c.id)}">${esc(c.name)} <span class="muted small">&nbsp;${c.lang === 'nl' ? 'in het Nederlands' : c.lang === 'fr' ? 'en français' : 'en español'} →</span></button>`).join('');
    $('#cpop').innerHTML = list + ext + soon;
  }
  function useCountry(entry) {
    return fetch(entry.file).then(r => { if (!r.ok) throw new Error('data'); return r.json(); }).then(d => {
      D = d; KEY = keyFor(D.country); S = load(); chat = []; visited = {}; errMsg = '';
      if (!D.legalStatuses.some(x => x.id === S.input.status)) S.input.status = D.legalStatuses[0].id;
      try { localStorage.setItem('papa-country', D.country); } catch (e) { /* ignore */ }
      renderCountryMenu();
      document.title = 'Pa a Pa Caribbean: test your business idea in ' + D.name;
    });
  }

  function successView() {
    const lbl = id => (TOPIC[id] ? TOPIC[id].label() : id);
    return (window.PAPSuccess ? window.PAPSuccess.render({ R: report(), J, pct, esc, topicLabel: lbl }) : '') + footer();
  }

  /* ---------- router ---------- */
  function route() {
    if (!D) return;
    window.PAP_COUNTRY = D.country;
    const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
    const name = parts[0] || '', arg = parts[1];
    const views = { '': home, test, report: reportView, vision: visionView, next: nextView, success: successView, coach };
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
      const id = matchTopic(q);
      if (id) { track('caribbean-coach-hit'); coachAsk(id, q); }
      else if (GREET.test(q)) coachPush([{ from: 'me', html: esc(q) }, { from: 'coach', html: "<p>Hello! Pick a topic below, or type your question.</p>" }, { raw: true, html: chips(orderList(), true) }]);
      else { track('caribbean-coach-miss'); coachPush([{ from: 'me', html: esc(q) }, { from: 'coach', html: '<p>I do not have an answer to that yet. Start with the most common mistakes, or pick another topic. You can also use a word like price, tax, customers or savings.</p>' }, { raw: true, html: chips(orderList().slice(0, 6), true) + allChip() }]); }
    });
    view.addEventListener('click', e => {
      const sh = e.target.closest('[data-share]'); if (sh) track('caribbean-share-' + sh.dataset.share);
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'all') coachPush([{ from: 'me', html: esc("All topics") }, { raw: true, html: chips(orderList(), true) }]);
      else if (act === 'ask') coachAsk(b.dataset.topic);
      else if (act === 'back') { S.step = Math.max(0, S.step - 1); errMsg = ''; save(); rerender(); window.scrollTo(0, 0); }
      else if (act === 'next') { errMsg = validate(S.step); if (!errMsg) { if (S.step === 0) track('caribbean-test-started-' + D.country.toLowerCase()); S.step += 1; save(); } rerender(); window.scrollTo(0, 0); }
      else if (act === 'finish') { errMsg = validate(3); if (errMsg) { rerender(); window.scrollTo(0, 0); return; } S.ready = true; S.step = 0; chat = []; visited = {}; save(); track('caribbean-report-done-' + D.country.toLowerCase()); location.hash = '#/report'; }
      else if (act === 'copylink') {
        const done = ok => { const el = $('#copiedlink'); if (el) el.textContent = ok ? 'Link copied.' : b.dataset.url; track('caribbean-share-copy'); };
        try { navigator.clipboard.writeText(b.dataset.url).then(() => done(true), () => done(false)); } catch (err) { done(false); }
      }
      else if (act === 'copy') {
        const txt = visionText(), done = ok => { const el = $('#copied'); if (el) el.textContent = ok ? 'Copied.' : 'Select the text above and copy it.'; };
        try { navigator.clipboard.writeText(txt).then(() => done(true), () => done(false)); } catch (err) { done(false); }
      }
    });
    $('#cpop').addEventListener('click', e => {
      const x = e.target.closest('[data-url]');
      if (x) { try { localStorage.setItem(x.dataset.key, x.dataset.id); } catch (err) { /* ignore */ } location.href = x.dataset.url; return; }
      const b = e.target.closest('[data-country]'); if (!b) return;
      const entry = COUNTRIES.countries.find(c => c.id === b.dataset.country);
      $('#cmenu').removeAttribute('open');
      if (!entry || entry.id === D.country) return;
      useCountry(entry).then(() => { if (location.hash === '#/' || location.hash === '') route(); else location.hash = '#/'; }).catch(showErr);
    });
    window.addEventListener('hashchange', route);
  }

  function showErr() {
    const e = $('#err'); e.style.display = 'block';
    e.textContent = 'Could not load the data file. Open this page from its web address (GitHub Pages), not by double-clicking the file.';
  }

  /* ---------- start ---------- */
  fetch('countries.json').then(r => { if (!r.ok) throw new Error('data'); return r.json(); }).then(list => {
    COUNTRIES = list;
    let id = 'JM';
    try { id = localStorage.getItem('papa-country') || 'JM'; } catch (e) { /* ignore */ }
    try { const q = new URLSearchParams(location.search).get('c'); if (q) id = q.toUpperCase(); } catch (e) { /* ignore */ }
    const entry = list.countries.find(c => c.id === id) || list.countries[0];
    return useCountry(entry);
  }).then(() => { defTopics(); bindEvents(); route(); }).catch(showErr);
})();
