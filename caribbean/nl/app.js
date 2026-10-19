/* Pa a Pa Caraïben: interface in het Nederlands. Gebruikt ../engine.js, report-nl.js en een gegevensbestand per land. */
(function () {
  'use strict';
  const E = window.PaPaEngine;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = E.num, pct = E.pct;
  const track = n => { try { if (window.track) window.track(n); } catch (e) { /* negeren */ } };
  let D = null, COUNTRIES = null, chat = [], visited = {}, errMsg = '', S = null, KEY = '';
  const J = n => E.money(D, n);
  const TAGS = { 'to confirm': 'te bevestigen' };

  const defaults = () => ({
    input: { status: 'business_name', activity: '', payMode: '', creditShare: '50', cdays: '30', sdays: '0', sales: '', direct: '', fixed: '', needs: '', emp: '0', pay: '', startup: '', savings: '', m1: 0, m2: 0, m3: 0 },
    step: 0, vision: {}, done: {}, ready: false
  });
  const keyFor = id => 'papa-nl-' + id.toLowerCase() + '-v1';
  function load() {
    try {
      const o = JSON.parse(localStorage.getItem(KEY));
      if (o && o.input) { const d = defaults(); return Object.assign(d, o, { input: Object.assign(d.input, o.input) }); }
    } catch (e) { /* negeren */ }
    return defaults();
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* negeren */ } };
  const report = () => (S.ready ? E.buildReportNl(D, S.input) : null);
  const stat = () => E.statusOf(D, S.input.status);

  const li = a => '<ul>' + a.map(x => `<li>${x}</li>`).join('') + '</ul>';
  const fieldNum = (k, label, unit, hint, ph) =>
    `<div class="field"><label for="f-${k}">${label} <span class="unit">${unit}</span></label>` +
    `<input id="f-${k}" data-k="${k}" type="number" inputmode="numeric" min="0" step="1" placeholder="${ph || ''}" value="${esc(S.input[k])}">` +
    (hint ? `<small>${hint}</small>` : '') + '</div>';
  const why = (title, body) => `<div class="why"><b class="k">${title}</b>${body}</div>`;
  const sym = () => D.currency.symbol;
  const ex = k => (D.examples && D.examples[k] != null ? 'bijv. ' + D.examples[k] : '');
  const previewBox = () => '';
  const planNote = () => `<div class="note" style="margin:0 0 14px">Gebruik dit als <b>schatting om te plannen</b>. Bij je inschrijving geeft ${esc(D.authorities.tax.name)} je de exacte bedragen voor jouw situatie.</div>`;
  function bracketsText(br) {
    return br.map((b, i) => {
      const prev = i ? br[i - 1].upToChargeable : 0;
      return b.upToChargeable != null ? `${pct(b.rate)} ${i ? 'vanaf ' + J(prev) + ' ' : ''}tot ${J(b.upToChargeable)}` : (i ? `${pct(b.rate)} boven ${J(prev)}` : `${pct(b.rate)} vast tarief`);
    }).join(', ');
  }
  function footer() {
    const a = D.authorities;
    const link = x => (x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)}</a>` : esc(x.name));
    const src = (D.sources || []).map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('');
    return `<div class="share"><b>Deel deze app</b> <a class="chip soft" data-share="whatsapp" href="https://wa.me/?text=Gratis%20hulpmiddel%20om%20een%20bedrijfsidee%20in%20het%20Caribisch%20gebied%20te%20testen%3A%20belastingen%2C%20wat%20je%20overhoudt%20en%20een%20plan.%20Zonder%20aanmelding.%20https%3A//heso73.github.io/pa-a-pa/caribbean/nl/" target="_blank" rel="noopener">WhatsApp</a> <a class="chip soft" data-share="facebook" href="https://www.facebook.com/sharer/sharer.php?u=https%3A//heso73.github.io/pa-a-pa/caribbean/nl/" target="_blank" rel="noopener">Facebook</a> <button class="chip soft" data-act="copylink" data-url="https://heso73.github.io/pa-a-pa/caribbean/nl/">Link kopiëren</button> <span id="copiedlink" class="small muted" role="status"></span></div><p class="small"><a href="../partners/">Voor organisaties: partnerkit</a></p>` + `<footer class="fine"><p>Deze cijfers zijn schattingen om je te helpen beslissen. Het is geen fiscaal of juridisch advies. Gegevens van ${esc(D.name)} voor het laatst gecontroleerd op ${esc(D.dataVerifiedOn)}. Bevestig altijd bij ${link(a.tax)} en bij ${link(a.registry)}.</p>` +
      `<details class="more"><summary>Vraag dit aan de belastingdienst</summary>${li(D.toVerify.map(esc))}<p class="small" style="margin:8px 0 0"><b>Wie vraag je: </b>${[D.authorities.tax, D.authorities.registry].filter(Boolean).map(a => a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a>` : esc(a.name)).join(' · ')}</p></details>` +
      (src ? `<details class="more"><summary>Bronnen</summary><ul>${src}</ul></details>` : '') +
      `<p>Pa a Pa is een gratis planningshulpmiddel voor wie voor het eerst onderneemt. <a href="../">English version</a> · <a href="../es/">Versión en español</a> · <a href="../fr/">Version française</a></p></footer>`;
  }

  function home() {
    const done = S.ready ? `<a class="path" href="#/report" style="margin-bottom:12px"><div class="n" style="background:var(--sun);color:var(--ink)">✓</div><div><div class="t">Je rapport is klaar</div><div class="d">Open het opnieuw of pas je cijfers aan in de test.</div></div></a>` : '';
    return `<section class="hero"><h1>Jouw bedrijfsplan, stap voor stap.</h1>
      <p class="lead">Gratis en zonder aanmelding. Elke vraag en elk cijfer wordt in gewone woorden uitgelegd. Belastingen en regels van: <b>${esc(D.name)}</b>.</p></section>
      ${previewBox()}${done}
      <nav class="paths" aria-label="Kies een route">
        <a class="path primary" href="#/test"><div class="n">1</div><div><div class="t">Test je project</div><div class="d">Houdt het stand? Je antwoord in een paar minuten.</div></div></a>
        <a class="path" href="#/vision"><div class="n">2</div><div><div class="t">Bouw je visie</div><div class="d">Maak je ideeën helder: voor wie, wat en hoe.</div></div></a>
        <a class="path" href="#/next"><div class="n" style="background:var(--ink)">3</div><div><div class="t">Ga voor succes</div><div class="d">Je volgende stappen, met een coach die je begeleidt.</div></div></a>
        <a class="path" href="#/success"><div class="n" style="background:var(--sun);color:var(--ink)">4</div><div><div class="t">De regels van winstgevend ondernemen</div><div class="d">Waarom een bedrijf geld verdient en hoe dat zo blijft.</div></div></a>
      </nav>
      <p class="tagline">Testen · Starten · Volhouden</p>${footer()}`;
  }

  const STEP_NAMES = ['Je project', 'Je geld', 'Je team en de start', 'Je motivatie'];
  function stepProject() {
    const st = D.legalStatuses.map(s => `<label class="opt"><input type="radio" name="status" data-k="status" value="${s.id}" ${S.input.status === s.id ? 'checked' : ''}><span class="t">${esc(s.label)}</span><small>${esc(s.plain)}</small></label>`).join('');
    const modes = [['now', 'Direct', 'Contant, pinpas of overschrijving ter plekke.'], ['later', 'Later, op factuur', 'Klanten betalen dagen of weken later.'], ['both', 'Een beetje van allebei', 'Sommige klanten betalen direct, andere later.']];
    const pm = modes.map(m => `<label class="opt"><input type="radio" name="payMode" data-k="payMode" value="${m[0]}" ${S.input.payMode === m[0] ? 'checked' : ''}><span class="t">${m[1]}</span><small>${m[2]}</small></label>`).join('');
    const pmode = S.input.payMode;
    const extra = pmode === 'later' || pmode === 'both' ? `<div class="grid2">${pmode === 'both' ? fieldNum('creditShare', 'Deel van de omzet dat later wordt betaald', '(%)', '', '50') : ''}${fieldNum('cdays', 'Dagen die klanten nodig hebben om te betalen', '(dagen)', '', '30')}${fieldNum('sdays', 'Dagen die leveranciers je geven om te betalen', '(dagen)', 'Vul 0 in als je leveranciers meteen betaalt.', '0')}</div>` : '';
    const act = D.activities ? `<h2 class="q">Waar gaat je bedrijf zich vooral mee bezighouden?</h2><div class="opts">${D.activities.map(a => `<label class="opt"><input type="radio" name="activity" data-k="activity" value="${a.id}" ${S.input.activity === a.id ? 'checked' : ''}><span class="t">${esc(a.label)}</span><small>${esc(a.plain)}</small></label>`).join('')}</div>` : '';
    return `<h2 class="q">Hoe ga je werken?</h2><div class="opts">${st}</div>${act}
      <h2 class="q">Hoe betalen je klanten je?</h2><div class="opts">${pm}</div>${extra}
      ${why('Waarom deze vragen?', '<p>Je rechtsvorm bepaalt welke belastingen en premies je betaalt. Twijfel je? Begin als eenmanszaak: dat is meestal het eenvoudigst.</p><p>Als klanten later betalen, schiet jij het geld intussen voor. Dat geld heet <b>werkkapitaal</b>. We rekenen het alleen uit als het voor jou geldt.</p>')}`;
  }
  function stepMoney() {
    const u = `(${sym()} per maand)`;
    return `<h2 class="q">Je geld, maand voor maand</h2><p class="muted">Alle bedragen zijn in ${esc(D.currency.code)} (${esc(sym())}), per maand.</p>
      ${fieldNum('sales', 'Verwachte omzet', u, 'Wat klanten je in een gewone maand betalen.', ex('sales'))}
      ${fieldNum('direct', 'Kosten van wat je verkoopt', u, 'Handelswaar, materialen, verpakking: wat je uitgeeft om te maken of in te kopen wat je verkoopt. Vul 0 in als er niets is.', ex('direct'))}
      ${fieldNum('fixed', 'Vaste kosten', u, 'Kosten die niet meebewegen met de omzet: huur, vervoer, telefoon, verzekeringen, reclame. Vul 0 in als er niets is.', ex('fixed'))}
      ${fieldNum('needs', 'Wat je nodig hebt om van te leven', u, 'Je huishouden moet eten. Wees eerlijk: dit telt mee als kostenpost van het project.', ex('needs'))}
      ${why('Waarom deze vragen?', '<p>We vergelijken wat binnenkomt met wat eruit gaat en trekken daarna belastingen en premies af. Wat overblijft moet dekken wat je nodig hebt om van te leven, anders kan het plan niet werken.</p>')}`;
  }
  function stepTeam() {
    return `<h2 class="q">Je team en je start</h2>
      <div class="grid2">${fieldNum('emp', 'Medewerkers', '(aantal)', 'Jezelf niet meegeteld. Vul 0 in als er geen zijn.', '0')}${fieldNum('pay', 'Brutoloon per medewerker', `(${sym()} per maand)`, 'Vóór inhoudingen.', ex('pay'))}</div>
      <div class="grid2">${fieldNum('startup', 'Opstartkosten', `(${sym()}, eenmalig)`, 'Apparatuur, handelswaar, inschrijving, website. Vul 0 in als er niets is.', ex('startup'))}${fieldNum('savings', 'Spaargeld dat je kunt gebruiken', `(${sym()})`, 'Geld dat je kunt inzetten zonder te lenen.', ex('savings'))}</div>
      ${why('Waarom deze vragen?', '<p>Medewerkers brengen naast hun loon ook maandelijkse betalingen aan de overheid met zich mee. Opstartkosten en spaargeld laten zien of je kunt beginnen zonder schulden en hoe lang je het volhoudt als de omzet traag op gang komt.</p>')}`;
  }
  function stepMotivation() {
    const items = [['m1', 'Ik kan zes maanden leven met een wisselend inkomen.'], ['m2', 'Ik ben klaar om het eerste jaar zes dagen per week te werken.'], ['m3', 'Ik weet wie mijn eerste vijf klanten worden.']];
    const html = items.map(it => `<fieldset class="statement" style="border:0;padding:0;margin:0 0 18px"><legend style="font-weight:600;margin-bottom:8px;padding:0">${it[1]}</legend><div class="scale">${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="${it[0]}" data-k="${it[0]}" value="${n}" ${+S.input[it[0]] === n ? 'checked' : ''}>${n}</label>`).join('')}</div><div class="scalelegend"><span>Helemaal niet</span><span>Helemaal</span></div></fieldset>`).join('');
    return `<h2 class="q">Hoe klaar ben je?</h2><p class="muted">Geef elke stelling een cijfer van 1 (helemaal niet) tot 5 (helemaal).</p>${html}
      ${why('Waarom deze vragen?', '<p>Geld is maar één kant. Je energie en je eerste klanten bepalen of het plan de eerste maanden overleeft.</p>')}`;
  }
  function validate(step) {
    const i = S.input;
    if (step === 0) { if (!i.status) return 'Kies hoe je gaat werken.'; if (D.activities && !i.activity) return 'Kies waar je bedrijf zich vooral mee bezighoudt.'; if (!i.payMode) return 'Kies hoe je klanten je betalen.'; if (i.payMode === 'both' && !(num(i.creditShare) > 0)) return 'Vul in welk deel van de omzet later wordt betaald.'; }
    if (step === 1) { if (!(num(i.sales) > 0)) return 'Vul je verwachte omzet per maand in.'; if (!(num(i.needs) > 0)) return 'Vul in wat je elke maand nodig hebt om van te leven.'; }
    if (step === 3) { if (!(+i.m1 && +i.m2 && +i.m3)) return 'Beoordeel alle drie de stellingen om door te gaan.'; }
    return '';
  }
  function test() {
    const s = Math.min(Math.max(+S.step || 0, 0), 3);
    const bars = [0, 1, 2, 3].map(n => `<i class="${n <= s ? 'on' : ''}"></i>`).join('');
    const body = [stepProject, stepMoney, stepTeam, stepMotivation][s]();
    const last = s === 3;
    return `<div class="backrow"><a class="iconbtn" href="#/" aria-label="Terug naar het begin"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 3L5 9l6 6"></path></svg></a><b style="color:var(--deep);font-size:14px">Test je project · ${esc(D.name)}</b></div>
      <div class="progress" aria-hidden="true">${bars}</div><div class="crumb">Deel ${s + 1} van 4 · ${STEP_NAMES[s]}</div>${s === 0 ? previewBox() : ''}
      ${errMsg ? `<p class="error" role="alert">${esc(errMsg)}</p>` : ''}${body}
      <div class="btnrow"><button class="btn" data-act="${last ? 'finish' : 'next'}">${last ? 'Mijn rapport bekijken' : 'Verder'}</button>${s > 0 ? '<button class="btn link" data-act="back">Terug</button>' : ''}</div>${footer()}`;
  }

  const VERDICT = {
    ok: ['Haalbaar', 'Je plan dekt wat je nodig hebt om van te leven, je spaargeld kan de start dragen en je voelt je klaar. Blijf je cijfers controleren zodra je begint.'],
    cond: ['Haalbaar, onder voorwaarden', 'Je project kan werken als je de punten hieronder oplost voordat je begint.'],
    no: ['Nog niet haalbaar', 'Zoals het er nu uitziet kan dit plan je kosten niet betalen. Het goede nieuws: je ontdekt het voordat je geld uitgeeft. Werk de punten hieronder uit en test opnieuw.']
  };
  function glossary(c) {
    const items = [['Kosten van wat je verkoopt', 'Wat je uitgeeft aan handelswaar en materialen voor wat je verkoopt.'], ['Vaste kosten', 'Kosten die je ook in een trage maand betaalt: huur, telefoon, verzekeringen.']];
    if (c.model === 'corporate') {
      if (D.corporateTax) items.push([D.corporateTax.label, 'Belasting over de winst van de vennootschap. ' + bracketsText(D.corporateTax.brackets) + '.']);
    } else {
      D.selfEmployed.contributions.forEach(ct => items.push([ct.label, ct.plain]));
      if (D.incomeTax) items.push([D.incomeTax.label, 'Belasting over je winst na het vrijgestelde deel (' + D.incomeTax.allowanceNote + '). Tarieven: ' + (D.incomeTax.bracketText || bracketsText(D.incomeTax.brackets)) + '.']);
    }
    if (D.vat) items.push([D.vat.short, D.vat.label + '. Dit is de belasting die je bij klanten in rekening brengt over belaste verkopen en daarna afdraagt aan de overheid.']);
    return `<details class="more"><summary>Wat betekenen deze woorden?</summary><dl>${items.map(x => `<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join('')}</dl></details>`;
  }
  function reportView() {
    const R = report();
    if (!R) return `<h1>Je rapport</h1><p class="lead">Doe eerst de test. Dat duurt een paar minuten en het rapport wordt opgebouwd uit je antwoorden.</p><a class="btn" href="#/test">Mijn project testen</a>${footer()}`;
    const c = R.c;
    const rows = [['Omzet', J(c.annualSales)], ['Kosten van wat je verkoopt en vaste kosten', '-' + J((c.direct + c.fixed) * 12)]];
    if (c.emp) { rows.push(['Lonen van medewerkers', '-' + J(c.payroll)]); rows.push(['Werkgeverspremies', '-' + J(c.er)]); }
    rows.push(['<b>Winst vóór belasting</b>', J(c.profit)]);
    c.lines.forEach(l => rows.push([esc(l.label), '-' + J(l.amount)]));
    const table = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('') + `<tr class="sum"><td>Je houdt per jaar over</td><td>${J(c.net)}</td></tr><tr><td>Je houdt per maand over</td><td><b>${J(c.netMonthly)}</b></td></tr><tr><td>Je hebt per maand nodig</td><td>${J(c.needs)}</td></tr>`;
    const notes = [];
    if (R.be) notes.push(`<div class="note"><b>Break-evenpunt:</b> je hebt ongeveer ${J(R.be)} omzet per maand nodig om je kosten, je belastingen en je levensonderhoud te dekken.</div>`);
    notes.push(`<div class="note${c.left < 0 ? ' alert' : ''}"><b>Start:</b> ${c.left < 0 ? `je spaargeld ligt ${J(-c.left)} onder de opstartkosten.` : `na de opstartkosten houd je ${J(c.left)} over, ongeveer ${c.runway.toFixed(1)} maanden levensonderhoud als er geen inkomen binnenkomt.`}</div>`);
    if (c.credit) notes.push(`<div class="note${c.bfr > Math.max(0, c.left) ? ' alert' : ''}"><b>Werkkapitaal:</b> wachten op betaling van klanten legt ongeveer ${J(c.bfr)} van je eigen geld vast.</div>`);
    notes.push(`<div class="note"><b>Motivatie ${c.motivation} van 15:</b> ${c.motivation >= 12 ? 'Sterk. Houd je redenen op papier voor de moeilijke maanden.' : c.motivation >= 8 ? 'Een goede basis. Werk aan de stelling met je laagste cijfer voordat je begint.' : 'Neem de tijd om je voor te bereiden: test je idee eerst in deeltijd en zoek eerst je klanten.'}</div>`);
    (D.notes || []).forEach(n => notes.push(`<div class="note alert">${esc(n)}</div>`));
    const sw = (title, color, items) => `<section class="card swot"><h3><span class="dot" style="background:${color}"></span>${title}</h3>${li(items.map(esc))}</section>`;
    const recs = R.recs.map(r => `<li><div>${esc(r[1])}<br><a href="#/coach/${r[0]}">Vraag de coach: ${esc(TOPIC[r[0]].label())}</a></div></li>`).join('');
    return `<h1>Haalbaarheidsrapport</h1><div class="muted small" style="margin:4px 0 8px">${esc(D.name)} · ${esc(stat().label)}</div>
      <div class="verdict ${R.verdict}"><div class="k">Oordeel</div><div class="v">${VERDICT[R.verdict][0]}</div><p>${VERDICT[R.verdict][1]}</p></div>${planNote()}
      <section class="card"><h3 style="margin-bottom:10px">Zo telt je jaar op</h3><table class="sum">${table}</table>${notes.join('')}${glossary(c)}</section>
      ${sw('Sterktes', '#1F7A8C', R.strengths)}${sw('Zwaktes', '#E8A33D', R.weaknesses)}${sw('Kansen', '#0B3C49', R.opportunities)}${sw('Risico’s', '#C2491D', R.risks)}
      <section class="card"><h3 style="margin-bottom:12px">Wat eerst te doen</h3><ol class="recs">${recs}</ol></section>
      <div class="btnrow" style="margin-top:18px"><a class="btn" href="#/coach">Met mijn coach praten</a><a class="btn link" href="#/test">Mijn cijfers aanpassen</a></div>${footer()}`;
  }

  const VISION = [
    ['who', 'Wie zijn je klanten?', 'Beschrijf een echte persoon of een type bedrijf: waar die woont, waar die de hele dag mee bezig is.'],
    ['problem', 'Welk probleem los je voor hen op?', 'Waar hebben ze nu moeite mee, of wat betalen ze te veel voor?'],
    ['offer', 'Wat ga je precies verkopen en voor welke prijs?', 'Eén zin voor het product of de dienst en dan een prijs die je hardop durft te zeggen.'],
    ['why', 'Waarom zouden ze voor jou kiezen?', 'Prijs, kwaliteit, snelheid, vertrouwen, locatie. Kies er een of twee en wees eerlijk.'],
    ['reach', 'Hoe horen je eerste vijf klanten dat je bestaat?', 'Noem echte plekken of mensen: een WhatsApp-groep, een markt, een kerk, een school, een vriend die een koper kent.'],
    ['stop', 'Wat zou je doen stoppen of van plan laten veranderen?', 'Bepaal nu, in alle rust, welk resultaat na drie maanden je zou doen bijsturen.']
  ];
  function visionView() {
    const f = VISION.map(v => `<div class="field"><label for="v-${v[0]}">${v[1]}</label><textarea id="v-${v[0]}" data-v="${v[0]}">${esc(S.vision[v[0]] || '')}</textarea><small>${v[2]}</small></div>`).join('');
    return `<h1>Bouw je visie</h1><p class="lead">Zes vragen om je idee helder te krijgen. Je antwoorden blijven op dit apparaat en worden opgeslagen terwijl je typt.</p>
      <section class="card" style="margin-top:14px">${f}</section>
      <section class="card"><h3 style="margin-bottom:8px">Je visie op één pagina</h3><div id="vsum" style="white-space:pre-wrap;font-size:15px"></div>
      <div class="btnrow"><button class="btn secondary" data-act="copy">Mijn visie kopiëren</button><span id="copied" class="small muted" role="status"></span></div></section>${footer()}`;
  }
  function visionText() {
    const parts = VISION.filter(v => (S.vision[v[0]] || '').trim()).map(v => `${v[1]}\n${S.vision[v[0]].trim()}`);
    return parts.length ? parts.join('\n\n') : 'Beantwoord de vragen hierboven en je visie verschijnt hier.';
  }
  const updateVision = () => { const el = $('#vsum'); if (el) el.textContent = visionText(); };

  function nextQuarter() {
    const n = new Date(), t = new Date(n.getFullYear(), n.getMonth(), n.getDate()), y = n.getFullYear();
    const q = D.calendar.quarterly;
    const cand = q.map(x => new Date(y, x.m - 1, x.d)).concat([new Date(y + 1, q[0].m - 1, q[0].d)]);
    return cand.find(d => d >= t).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function feeText(st) {
    const parts = [];
    if (st.feeLines && st.feeLines.length) parts.push('Budget voor inschrijving: ' + st.feeLines.map(f => `${f.label.toLowerCase()} ${J(f.amount)}`).join(', ') + '.');
    if (st.feeNote) parts.push(st.feeNote);
    return parts.join(' ');
  }
  function nextView() {
    const R = report(), c = R ? R.c : E.compute(D, S.input), st = stat(), cal = D.calendar;
    const steps = D.launchSteps.filter(s => s.appliesTo.includes(st.id) && (s.when !== 'employees' || c.emp > 0) && (s.when !== 'vat' || c.vat));
    const done = steps.filter(s => S.done[s.id]).length;
    const list = steps.map(s => `<li><label><input type="checkbox" data-done="${s.id}" ${S.done[s.id] ? 'checked' : ''}><span><span class="t">${esc(s.label)}</span><small>${esc(s.plain)}${s.url ? ` <a href="${esc(s.url)}" target="_blank" rel="noopener">Officiële website</a>` : ''}</small></span></label></li>`).join('');
    const rows = [];
    if (cal.quarterly && cal.quarterly.length) rows.push(['Volgende: ' + nextQuarter(), (st.taxModel === 'corporate' ? cal.quarterlyTextCorporate : cal.quarterlyTextPersonal) + ' Data elk jaar: ' + cal.quarterlyList + '.']);
    if (cal.monthlyText) rows.push([cal.monthlyLabel || 'Elke maand', cal.monthlyText]);
    rows.push([cal.annualLabel, st.taxModel === 'corporate' ? cal.annualTextCorporate || cal.annualTextPersonal : cal.annualTextPersonal]);
    if (c.emp > 0) rows.push([cal.payrollLabel || 'Elke maand', cal.payrollText]);
    if (c.vat && cal.vatText) rows.push([D.vat.short, cal.vatText]);
    return `<h1>Ga voor succes</h1><p class="lead">Je volgende stappen in <b>${esc(D.name)}</b>, rechtsvorm: <b>${esc(st.label.toLowerCase())}</b>.${S.ready ? '' : ' <a href="#/test">Doe de test</a> om deze lijst op je project af te stemmen.'}</p>
      <section class="card" style="margin-top:14px"><h3 style="margin-bottom:4px">Stappen om te starten</h3><p class="muted small" id="donecount">${done} van ${steps.length} gedaan</p><ul class="checklist">${list}</ul><p class="muted small" style="margin:12px 0 0">${esc(feeText(st))}</p></section>
      <section class="card"><h3 style="margin-bottom:10px">Je belastingkalender</h3><ul class="cal">${rows.map(x => `<li><b>${esc(x[0])}</b><span>${esc(x[1])}</span></li>`).join('')}</ul>${R && st.taxModel !== 'corporate' ? `<div class="note alert"><b>Zet ${J(c.setAside)} per maand opzij</b> op een aparte rekening, zodat de betalingen klaarstaan als ze verschuldigd zijn.</div>` : ''}</section>
      <section class="card"><h3 style="margin-bottom:8px">Hulp voor kleine bedrijven</h3><p>${D.authorities.support.map(s => s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>` : esc(s.name)).join('<br>')}</p><p class="muted small" style="margin:0">Vraag welk advies en welke financiering nu beschikbaar zijn.</p></section>
      <div class="btnrow" style="margin-top:18px"><a class="btn" href="#/coach">Mijn coach iets vragen</a></div>${footer()}`;
  }

  const TOPIC = {};
  function defTopics() {
    const R = () => report();
    const L = k => () => k;
    TOPIC.cost = { label: L('Kostprijs en verkoopprijs'), tool: 'cost', msgs: () => {
      const r = R(), m = ['<p>Je <b>kostprijs</b> is wat een product of klus je kost voordat je het verkoopt: materialen, verpakking, vervoer en je eigen tijd.</p>'];
      m.push(`<p>Als je onder die kostprijs verkoopt, verlies je bij elke verkoop geld, ook als de klant tevreden is.${r && r.c.sales > 0 ? ` In jouw plan gaat ${pct(Math.min(1, r.c.direct / r.c.sales))} van je omzet naar handelswaar en materialen.` : ''} We rekenen het uit voor een product of een klus.</p>`);
      return m; } };
    TOPIC.breakeven = { label: L('Break-evenpunt'), msgs: () => {
      const r = R();
      if (!r) return ['<p>Het <b>break-evenpunt</b> is de maandomzet die je kosten, je belastingen en je levensonderhoud dekt. <a href="#/test">Doe de test</a> om het jouwe te zien.</p>'];
      const m = [];
      if (!r.be) m.push('<p>Nu kost wat je inkoopt evenveel als wat je verkoopt, dus geen enkele omzet bereikt het evenwicht. Begin bij je prijzen.</p>');
      else m.push(`<p>Om je kosten, je belastingen en je levensonderhoud te betalen heb je ongeveer <b>${J(r.be)}</b> omzet per maand nodig. Je plan heeft ${J(r.c.sales)}.${r.be > r.c.sales * 1.02 ? ` Dat is ${J(r.be - r.c.sales)} meer dan gepland.` : ' Je zit erboven.'}</p>`);
      m.push('<p>Je hebt drie hefbomen: een prijs verhogen, een kostenpost verlagen of meer omzet plannen. Verander er één tegelijk en test opnieuw. <a href="#/test">Mijn cijfers aanpassen</a></p>');
      return m; } };
    TOPIC.cash = { label: L('Klanten die te laat betalen'), msgs: () => {
      const r = R(), m = ['<p>Als een klant na 30 dagen betaalt, heb jij materialen, lonen en huur al betaald. Het geld dat je intussen voorschiet is je <b>werkkapitaal</b>.</p>'];
      if (r) m.push(r.c.credit ? `<p>In jouw plan legt wachten op betaling ongeveer <b>${J(r.c.bfr)}</b> vast.</p>` : '<p>In jouw plan betalen klanten direct, dus dit raakt je niet.</p>');
      m.push(li(['Vraag een aanbetaling voordat je begint.', 'Factureer dezelfde dag, met een duidelijke vervaldatum.', 'Bied kortere termijnen aan, bijvoorbeeld 14 dagen.', 'Vraag je leveranciers om meer betaaltijd.', 'Stop het werk voor klanten die al achterlopen.']));
      return m; } };
    TOPIC.savings = { label: L('Mijn financiële buffer'), msgs: () => {
      const r = R(), m = [];
      if (r) m.push(r.c.left < 0 ? `<p>Je spaargeld ligt <b>${J(-r.c.left)}</b> onder de opstartkosten.</p>` : `<p>Na de opstartkosten houd je <b>${J(r.c.left)}</b> over, ongeveer <b>${r.c.runway.toFixed(1)} maanden</b> levensonderhoud als er geen inkomen binnenkomt.</p>`);
      else m.push('<p>Je <b>financiële buffer</b> is wat je na de opstartkosten overhoudt, gedeeld door wat je elke maand nodig hebt om van te leven. <a href="#/test">Doe de test</a> om de jouwe te zien.</p>');
      m.push('<p>Een gangbare regel is drie tot zes maanden levensonderhoud achter de hand te hebben voordat je van het bedrijf afhankelijk wordt. Om daar te komen: begin in deeltijd, verlaag de opstartkosten (koop tweedehands, huur in plaats van te kopen) of start in fasen.</p>');
      return m; } };
    TOPIC.tax = { label: L('Belastingen en premies'), msgs: () => {
      const r = R(), st = stat(), cal = D.calendar, m = [];
      if (st.taxModel === 'corporate') {
        const ct = D.corporateTax;
        m.push(`<p>Een vennootschap betaalt <b>${esc(ct.label.toLowerCase())}</b> over haar winst: ${esc(bracketsText(ct.brackets))}.${r ? ` In jouw plan: ongeveer <b>${J(r.c.corpTax)}</b> per jaar.` : ''}${ct.note ? ' ' + esc(ct.note) : ''}</p>`);
        const lv = (D.salesLevies || []).filter(l => !l.appliesTo || l.appliesTo.includes(st.id));
        if (lv.length) m.push(`<p>Daarnaast betaal je over de omzet (niet over de winst): ${lv.map(l => '<b>' + esc(l.label) + '</b> (' + pct(l.rate) + ')').join(', ')}.</p>`);
        m.push('<p>Wat je voor jezelf opneemt (salaris of dividend) wordt apart belast en zit niet in deze cijfers. Laat een boekhouder het plannen.</p>');
      } else {
        m.push('<p>Als eenmanszaak wordt je winst belast als persoonlijk inkomen. Dit betaal je erover:</p>');
        const it = D.incomeTax, items = it ? [`<b>${esc(it.label)}:</b> ${esc(it.bracketText || bracketsText(it.brackets))}, na een vrijgesteld deel (${esc(it.allowanceNote)}).`] : [];
        D.selfEmployed.contributions.forEach(ct => items.push(`<b>${esc(ct.label)}</b>${ct.rate != null ? ' (' + pct(ct.rate) + ')' : ''}: ${esc(ct.plain)}`));
        m.push(li(items));
        if (r) m.push(`<p>In jouw plan komt dit neer op ongeveer <b>${J(r.c.levies)}</b> per jaar. Zet elke maand <b>${J(r.c.setAside)}</b> opzij op een aparte rekening.</p>`);
        m.push(`<p>${esc(cal.annualLabel)}: ${esc(cal.annualTextPersonal.charAt(0).toLowerCase() + cal.annualTextPersonal.slice(1))} <a href="#/next">Mijn belastingkalender bekijken</a></p>`);
      }
      (D.notes || []).forEach(n => m.push(`<p class="muted small">${esc(n)}</p>`));
      return m; } };
    TOPIC.vat = { label: () => (D.vat ? D.vat.short : 'Omzetbelasting') + ' (omzetbelasting)', msgs: () => {
      const r = R(), v = D.vat || {};
      if (!D.vat) return [`<p>${esc(D.name)} heeft geen algemene omzetbelasting. Bekijk de andere kosten in je rapport: vergunningen, premies en loonheffingen.</p>`];
      const m = [`<p>De <b>${esc(v.short)}</b> is de omzetbelasting (${esc(v.label)}). Het algemene tarief is ${pct(v.rate)}. ${esc(v.registerNote)} Daarna reken je ${esc(v.short)} over je verkopen door en doe je aangifte. ${esc(v.filingNote)}</p>`];
      if (r) m.push(`<p>Je verwachte jaaromzet is ${J(r.c.annualSales)}.</p>`);
      m.push('<p>Controleer vóór je eerste factuur bij de belastingdienst of een boekhouder hoe je je moet inschrijven en facturen moet opmaken.</p>');
      return m; } };
    TOPIC.team = { label: L('Medewerkers'), msgs: () => {
      const r = R(), items = D.employer.items.map(i => `${esc(i.label)} ${pct(i.rate)}`);
      const m = [`<p>Een medewerker kost meer dan zijn loon. Naast het brutoloon komt er voor de werkgever bij: ${items.join(', ')}. Ook worden premies op het loon van de medewerker ingehouden, en jij draagt alles af aan de autoriteiten.</p>`];
      m.push(r && r.c.emp > 0 ? `<p>In jouw plan bedragen de werkgeverspremies ongeveer <b>${J(r.c.er)}</b> per jaar bij een loonsom van ${J(r.c.payroll)}.</p>` : '<p>Je hebt geen medewerkers gepland, dus dit heeft nog geen invloed op je cijfers.</p>');
      m.push(`<p>${esc(D.calendar.payrollText)}</p>`);
      return m; } };
    TOPIC.customers = { label: L('Mijn eerste klanten'), msgs: () => ['<p>Noem voordat je geld uitgeeft <b>je eerste vijf klanten</b>: echte mensen of bedrijven die bij je zouden kopen.</p>', '<p>Vraag ieder daarna om een kleine toezegging: een vooruitbestelling, een aanbetaling of een vaste datum. Een vriendelijk woord is geen klant. Geld of een duidelijke datum wel.</p>', '<p>Kun je er geen vijf noemen, dan is je eerste klus niet het bedrijf: het is praten met mensen die zouden kunnen kopen. <a href="#/vision">Noteer ze in mijn visie</a></p>'] };
    TOPIC.motivation = { label: L('Gemotiveerd blijven'), msgs: () => {
      const r = R(), m = ['<p>Geld is maar één kant van de test. Energie bepaalt of het plan de eerste maanden overleeft.</p>'];
      if (r) m.push(`<p>Je motivatiescore is ${r.c.motivation} van 15.</p>`);
      m.push(li(['Test eerst klein: verkoop aan vijf mensen voordat je iets opzegt.', 'Spreek met je huishouden een reserve en een evaluatiedatum af, bijvoorbeeld na drie maanden.', 'Schrijf op waarom je het doet. Lees het op moeilijke dagen terug.', 'Bepaal nu welk resultaat je van koers zou doen veranderen.']));
      return m; } };
    TOPIC.funding = { label: L('Leningen en steun'), msgs: () => {
      const r = R(), m = ['<p>Verschillende instellingen werken met kleine bedrijven in ' + esc(D.name) + '. Ik kan niet zeggen voor welk programma je in aanmerking komt. Neem contact op en vraag welk advies en welke financiering nu beschikbaar zijn.</p>'];
      if (r) m.push(`<p>Voordat je leent: je plan laat ongeveer <b>${J(r.c.netMonthly)}</b> per maand over na belasting. De maandlast van een lening moet binnen dat bedrag passen, niet erboven.</p>`);
      m.push(`<p>${D.authorities.support.map(s => s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>` : esc(s.name)).join('<br>')}</p>`);
      return m; } };
    TOPIC.mistakes = { label: L('Veelgemaakte fouten'), msgs: () => {
      const r = R(), m = ['<p>Een klein bedrijf gaat zelden ten onder door één grote fout. Deze zeven komen steeds terug:</p>'];
      m.push(li(['<b>Verkopen onder de echte kostprijs.</b> Je eigen tijd, verpakking, vervoer of kosten vergeten.', '<b>Je break-even niet kennen.</b> Je hebt een maandomzet nodig die al je kosten, belastingen en levensonderhoud dekt.', '<b>Zonder geld komen te zitten.</b> Geen buffer, of klanten die laat betalen terwijl jij je rekeningen al betaald hebt.', '<b>Beginnen zonder klanten.</b> Eerst bouwen en later vragen. Noem vijf mensen die zouden betalen.', '<b>Belastingen en premies vergeten.</b> Het geld op je rekening is niet helemaal van jou.', '<b>Privégeld en bedrijfsgeld door elkaar halen.</b> Het verbergt de echte cijfers. Gebruik een aparte rekening.', '<b>Te snel groeien.</b> Mensen aannemen of investeren voordat de omzet stabiel is.']));
      if (r && (!r.be || r.be > r.c.sales * 1.02)) m.push('<p>In jouw plan ligt je omzet <b>onder het break-evenpunt</b>. Begin hiermee.</p>');
      else if (r && r.c.left < 0) m.push('<p>In jouw plan zijn je spaargelden <b>te laag voor de opstartkosten</b>. Begin hiermee.</p>');
      return m; } };
    TOPIC.start = { label: L("Waar begin ik?"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Begin klein en in deze volgorde, voordat je geld uitgeeft:</p>");
      m.push(li(["<b>Check de behoefte.</b> Praat met vijf mensen die zouden kunnen kopen. Vraag wat ze er nu voor betalen.", "<b>Reken het door.</b> <a href=\"#/test\">Doe de test</a> om je kosten, belastingen en break-even te zien.", "<b>Maak een eerste verkoop.</b> Verkoop aan één echte klant, desnoods met de hand, voordat je iets groots bouwt.", "<b>Registreer en richt daarna alles in.</b> Volg de stappen bij <a href=\"#/next\">mijn volgende stappen</a>."]));
      return m; } };
    TOPIC.legal = { label: L("Rechtsvorm"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>De gebruikelijke keuze is tussen twee opties:</p>");
      m.push(li(["<b>Eenmanszaak (jij, onder een handelsnaam).</b> Goedkoop en eenvoudig. Jij en het bedrijf zijn juridisch dezelfde persoon, dus je bent met je eigen bezittingen aansprakelijk voor schulden.", "<b>Besloten vennootschap (bv of vergelijkbaar).</b> Een aparte rechtspersoon, die je persoonlijke risico kan beperken. Meer papierwerk, jaarlijkse aangifte en vaak hogere kosten."]));
      m.push("<p>Belastingen verschillen per vorm. <a href=\"#/test\">De test</a> en <a href=\"#/report\">het rapport</a> gebruiken de vorm die je kiest. Vraag het handelsregister of een boekhouder voordat je beslist.</p>");
      return m; } };
    TOPIC.register = { label: L("Mijn bedrijf inschrijven"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Inschrijven gaat meestal in een aantal aparte stappen, in deze volgorde:</p>");
      m.push(li(["Schrijf de handelsnaam of vennootschap in bij het officiële register.", "Vraag een belastingnummer aan bij de belastingdienst.", "Meld je aan voor sociale premies als je voor jezelf werkt of mensen in dienst neemt.", "Vraag bij de gemeente of het ministerie of je activiteit een vergunning nodig heeft (eten, vervoer en zorg meestal wel).", "Registreer je voor omzetbelasting als je omzet de drempel bereikt."]));
      m.push("<p>De precieze loketten en formulieren voor jouw land staan bij <a href=\"#/next\">mijn volgende stappen</a>. Begin niet met verkopen in een gereguleerde activiteit zonder het eerst te vragen.</p>");
      return m; } };
    TOPIC.bank = { label: L("Zakelijke bankrekening"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Gebruik vanaf dag één een aparte rekening voor het bedrijf, ook al is die eenvoudig.</p>");
      m.push(li(["Elke verkoop en elke kost loopt erover. Je cijfers blijven kloppen.", "Het maakt belastingtijd en elke leningaanvraag veel makkelijker.", "Maak elke maand een vast bedrag aan jezelf over, als een salaris.", "Houd een tweede kleine rekening voor belastingen. Zet het deel dat je moet betalen opzij zodra je betaald wordt."]));
      m.push("<p>Vraag bij twee of drie banken naar de maandelijkse kosten voordat je kiest.</p>");
      return m; } };
    TOPIC.records = { label: L("Mijn boekhouding bijhouden"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>In het begin heb je geen programma nodig. Je hebt een gewoonte nodig.</p>");
      m.push(li(["Bewaar elke bon en factuur, op papier of als foto, in één map.", "Schrijf elke verkoop en elke kost dezelfde dag op, met datum, bedrag en waarvoor.", "Tel eens per maand verkopen, kosten en wat overblijft op. Vergelijk met je plan.", "Bewaar je administratie zo veel jaar als de belastingdienst vraagt."]));
      m.push("<p>Een boekhouder kan dit in een uur of twee opzetten en verdient zich vaak terug. Ik vervang hem of haar niet.</p>");
      return m; } };
    TOPIC.insurance = { label: L("Verzekeringen"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Een verzekering is een kost die je beschermt tegen verlies dat je zelf niet kunt dragen.</p>");
      m.push(li(["<b>Pand en voorraad:</b> brand, diefstal, storm en overstroming. Belangrijk in orkaangebieden.", "<b>Aansprakelijkheid:</b> als een klant of derde schade lijdt of geld verliest door jou.", "<b>Voertuig:</b> verplicht als je voor het bedrijf rijdt.", "<b>Gezondheid en inkomen voor jezelf:</b> als je niet kunt werken, stopt het bedrijf."]));
      m.push("<p>Vraag offertes bij twee verzekeraars en tel de jaarkosten bij je vaste kosten in <a href=\"#/test\">de test</a>.</p>");
      return m; } };
    TOPIC.marketing = { label: L("Klanten vinden"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Begin met de goedkoopste manieren en meet wat werkt.</p>");
      m.push(li(["<b>Mond-tot-mondreclame.</b> Vraag je eerste klanten het aan twee mensen te vertellen, en bedank ze.", "<b>Eén pagina op sociale media</b> of een WhatsApp Business-nummer waar mensen zien wat je verkoopt en je prijzen.", "<b>Wees waar je klanten al zijn:</b> een markt, een Facebookgroep, een prikbord, een partnerbedrijf.", "<b>Bied een kleine kennismakingsactie aan</b> en vraag hoe ze je gevonden hebben."]));
      m.push("<p>Betaal pas voor advertenties als je weet welke boodschap al gratis werkt. Reclame is een kostenpost in je plan.</p>");
      return m; } };
    TOPIC.online = { label: L("Online verkopen"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Je kunt online met weinig geld beginnen, maar dezelfde regels gelden: kosten, belastingen en klanten.</p>");
      m.push(li(["Tel de platformkosten, betaalkosten, verpakking en verzending bij je kostprijs op voordat je je prijs bepaalt.", "Verkoop naar het buitenland kan vragen over douane, verzending en belasting oproepen. Zoek het uit voordat je een levering belooft.", "Foto’s en duidelijke beschrijvingen verkopen meer dan een mooie site.", "Test met een socialemediapagina of marktplaats voordat je voor een website betaalt."]));
      m.push("<p>Online verkopen blijven verkopen: ze tellen mee voor belasting en voor je administratie.</p>");
      return m; } };
    TOPIC.profit = { label: L("Winst, omzet en geld op de rekening"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Drie verschillende getallen die beginners vaak door elkaar halen:</p>");
      m.push(li(["<b>Omzet:</b> alles wat klanten je betalen.", "<b>Winst:</b> omzet min alle kosten en belastingen. Dit verdient het bedrijf echt.", "<b>Liquide middelen:</b> het geld op je rekening vandaag. Dat kan hoog zijn als de winst laag is (een grote vooruitbetaling) en laag als de winst hoog is (klanten die nog niet betaald hebben)."]));
      m.push("<p>Een bedrijf kan winst maken en toch zonder geld komen te zitten. Let op beide. <a href=\"#/test\">De test</a> toont je break-even en wat er na belasting overblijft.</p>");
      return m; } };
    TOPIC.pay = { label: L("Mezelf betalen"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Bepaal een vast maandbedrag voor jezelf en behandel het als een salaris, niet als wat er overblijft.</p>");
      m.push(li(["Begin bij je echte leefkosten, uit de test.", "Betaal jezelf pas nadat kosten en belastingen gedekt zijn.", "Als de omzet laag is, verlaag dan je eigen betaling voordat je stopt met leveranciers of belastingen te betalen.", "Bekijk het bedrag elke drie maanden opnieuw."]));
      if (r) m.push(`<p>In jouw plan blijft na belasting ongeveer <b>${J(r.c.netMonthly)}</b> per maand over.</p>`);
      return m; } };
    TOPIC.costs = { label: L("Vaste en variabele kosten"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Kosten zijn er in twee soorten:</p>");
      m.push(li(["<b>Vaste kosten</b> veranderen niet met de omzet: huur, verzekering, abonnementen, je eigen betaling.", "<b>Variabele kosten</b> stijgen met elke verkoop: materiaal, verpakking, verzending, commissies."]));
      m.push("<p>Het break-evenpunt is het aantal verkopen dat nodig is om de vaste kosten te dekken nadat de variabele kosten betaald zijn. Een vaste kost verlagen helpt elke maand; een variabele kost verlagen helpt bij elke verkoop. <a href=\"#/test\">Vul beide in bij de test.</a></p>");
      return m; } };
    TOPIC.suppliers = { label: L("Leveranciers"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Je leveranciers bepalen je kostprijs, dus kies ze zorgvuldig.</p>");
      m.push(li(["Vraag minstens drie offertes voor dezelfde hoeveelheid en kwaliteit.", "Vraag de prijs per stuk bij verschillende hoeveelheden, maar koop niet meer dan je kunt verkopen.", "Vraag om een betaaltermijn, bijvoorbeeld 30 dagen, om je kas te ontlasten.", "Test met een kleine eerste bestelling vóór een grote.", "Houd een tweede leverancier voor je hoofdproduct."]));
      return m; } };
    TOPIC.stock = { label: L("Mijn voorraad beheren"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Voorraad is geld dat op een plank ligt.</p>");
      m.push(li(["Koop kleine hoeveelheden van wat je weet te verkopen, en bestel vaak bij.", "Tel je voorraad elke maand en noteer wat het snelst verkocht werd.", "Verlaag traag lopende artikelen vroeg in prijs, voordat ze over datum of uit de mode raken.", "Zet je spaargeld niet vast in voorraad voordat de eerste verkopen de vraag bewijzen."]));
      return m; } };
    TOPIC.premises = { label: L("Waar werk ik?"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Vaste huur is de kost die veel kleine bedrijven laat zinken. Begin op de goedkoopste plek die werkt.</p>");
      m.push(li(["<b>Vanuit huis:</b> check eerst de lokale regels en je huurcontract of verhuurder; sommige activiteiten (eten, lawaai, klanten aan huis) vragen toestemming.", "<b>Marktkraam of gedeelde ruimte:</b> lage kosten, goed om te testen en je ontmoet klanten.", "<b>Eigen pand:</b> pas als de omzet stabiel is en de huur ervan betaald kan worden.", "Lees altijd het huurcontract en vraag wat er gebeurt als je eerder vertrekt."]));
      return m; } };
    TOPIC.partners = { label: L("Partners"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Een partner kan vaardigheden en geld inbrengen, en kan het bedrijf ook beëindigen.</p>");
      m.push(li(["Schrijf op wie wat inbrengt: geld, werk en tijd.", "Spreek af hoe de winst wordt verdeeld en hoe jullie allebei betaald worden.", "Spreek af wat er gebeurt als een partner vertrekt, ziek wordt of wil verkopen.", "Leg het schriftelijk vast en laat het door een jurist nakijken."]));
      m.push("<p>Doe dit zolang jullie het goed met elkaar kunnen vinden. Een handdruk tussen vrienden is een veelvoorkomende oorzaak van latere ruzie.</p>");
      return m; } };
    TOPIC.parttime = { label: L("Mijn baan houden"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Je kunt het bedrijf testen met behoud van je inkomen. Dat is vaak de veiligste manier om te beginnen.</p>");
      m.push(li(["Check je arbeidscontract: sommige werkgevers verbieden een nevenactiviteit of concurrerend werk.", "Begin in de avonden en weekenden tot de omzet je leefkosten dekt.", "Bepaal bij welk niveau je stopt, bijvoorbeeld drie maanden leefkosten gespaard en stabiele omzet. <a href=\"#/test\">De test</a> toont je buffer.", "Vertel je huishouden wat het plan en de evaluatiedatum zijn."]));
      return m; } };
    TOPIC.competition = { label: L("Concurrenten"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Concurrenten zijn goed nieuws: ze bewijzen dat mensen hiervoor betalen.</p>");
      m.push(li(["Maak een lijst van de drie dichtstbijzijnde concurrenten, met hun prijzen en wat klanten leuk of niet leuk vinden.", "Wees niet alleen goedkoper. Kies één manier om beter te zijn: snelheid, kwaliteit, vertrouwen, gemak of locatie.", "Vraag je eerste klanten waarom ze voor jou kozen.", "Schrijf het op bij <a href=\"#/vision\">mijn visie</a>."]));
      return m; } };
    TOPIC.growth = { label: L("Het bedrijf laten groeien"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Groei als de cijfers stabiel zijn, niet als je enthousiast bent.</p>");
      m.push(li(["Wacht op drie maanden of meer met omzet boven break-even.", "Voeg één ding tegelijk toe: een product, een medewerker, een plek.", "Schat voordat je uitgeeft de extra omzet die het moet opleveren om zichzelf terug te verdienen.", "Houd je buffer intact."]));
      return m; } };
    TOPIC.seasonality = { label: L("Rustige maanden"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Veel bedrijven in het Caribisch gebied verkopen in sommige maanden veel meer dan in andere, door toerisme, feestdagen en het orkaanseizoen.</p>");
      m.push(li(["Kijk naar vorig jaar of vraag andere verkopers: welke maanden zijn druk en welke rustig?", "Zet in drukke maanden geld opzij om de rustige te dekken.", "Plan vaste kosten die je in het laagseizoen kunt verlagen of pauzeren.", "Bied iets aan voor rustige maanden: een korting, een ander product of een dienst voor de buurt."]));
      return m; } };
    TOPIC.invoice = { label: L("Facturen en offertes"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Een duidelijke factuur zorgt dat je sneller betaald wordt. Zet erop:</p>");
      m.push(li(["Je bedrijfsnaam, adres en belastingnummer als je er een hebt.", "Een uniek factuurnummer en de datum.", "Wat je verkocht hebt, de hoeveelheid, de prijs en eventuele omzetbelasting.", "Het totaal, de uiterste betaaldatum en hoe te betalen (rekeninggegevens).", "Verstuur hem dezelfde dag en bewaar een kopie."]));
      m.push("<p>Voeg bij een offerte toe hoe lang de prijs geldig is en wat er niet bij zit.</p>");
      return m; } };
    TOPIC.contracts = { label: L("Afspraken met klanten"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Schriftelijke voorwaarden voorkomen de meeste geschillen.</p>");
      m.push(li(["Schrijf bij elke klus boven een klein bedrag op wat je doet, de prijs, de timing en de aanbetaling.", "Beschrijf je terugbetalings- of retourregel in gewone woorden en toon die.", "Bewaar berichten en foto’s als bewijs.", "Als een klant klaagt, reageer snel en rustig en bied een oplossing aan voordat hij erom vraagt."]));
      return m; } };
  }
  const ORDER_ALL = ['start', 'mistakes', 'cost', 'breakeven', 'tax', 'customers', 'savings', 'cash', 'vat', 'team', 'motivation', 'funding', 'legal', 'register', 'bank', 'records', 'insurance', 'marketing', 'online', 'profit', 'pay', 'costs', 'suppliers', 'stock', 'premises', 'partners', 'parttime', 'competition', 'growth', 'seasonality', 'invoice', 'contracts'];
  const orderList = () => ORDER_ALL.filter(id => id !== 'vat' || D.vat);
  const KEYWORDS = [['mistakes', /fout|faillis|mislukk|risico|waarom.*(bedrijf|onderneming)/], ['cost', /kost|prijs|marge|rekenen|hoeveel (moet|vraag)/], ['breakeven', /break.?even|rendabel|hoeveel.*verkopen/], ['cash', /\blaat\b|factuur|werkkapitaal|krediet|achterstand/], ['savings', /spaar|reserve|buffer/], ['tax', /belasting|premie|\baov\b|\bazv\b|\bbbo\b|\bob\b|fiscaal/], ['vat', /btw|omzetbelasting/], ['team', /medewerker|personeel|aannemen|loon|werknemer/], ['customers', /klant|markt|koper|verkopen aan/], ['motivation', /motivat|angst|stress|twijfel|opgeven/], ['funding', /lening|financier|bank|steun|subsidie/]];

  const EXTRA = {"cost": ["prijs", "kostprijs", "verkoopprijs", "marge"], "breakeven": ["break-even", "break even", "rendabel"], "tax": ["belasting", "belastingen", "premie"], "customers": ["klant", "klanten", "koper"], "savings": ["sparen", "spaargeld", "buffer", "reserve"], "cash": ["werkkapitaal", "laat betalen", "achterstand"], "team": ["medewerker", "personeel", "werknemer", "aannemen"], "motivation": ["motivatie", "stress"], "funding": ["lening", "subsidie", "financiering", "lenen"], "vat": ["btw", "omzetbelasting"], "mistakes": ["fout", "fouten", "faillissement", "mislukken", "risico"], "start": ["waar begin", "hoe begin", "beginnen", "starten", "opstarten", "bedrijf starten", "bedrijf beginnen", "eerste stap", "mijn idee", "bedrijfsidee", "goed idee", "lanceren", "tips voor beginners", "beginner", "ik ben nieuw"], "legal": ["rechtsvorm", "eenmanszaak", "zzp", "zelfstandige", "vennootschap", "bv", "nv", "rechtspersoon", "handelsnaam", "onderneming oprichten", "oprichten"], "register": ["bedrijf registreren", "bedrijf inschrijven", "inschrijven bij", "inschrijving", "vergunning", "licentie", "toestemming", "papierwerk", "formaliteiten", "belastingnummer", "wettelijke eisen"], "bank": ["bankrekening", "zakelijke rekening", "aparte rekening", "privégeld", "privé en zakelijk", "geld door elkaar"], "records": ["boekhouding", "boekhouden", "administratie", "boekhouder", "bonnen", "kasboek", "spreadsheet", "excel"], "insurance": ["verzekering", "verzekeren", "verzekeraar", "aansprakelijkheid", "brand", "diefstal", "schade", "polis"], "marketing": ["marketing", "reclame", "adverteren", "promotie", "sociale media", "facebook", "instagram", "whatsapp", "tiktok", "klanten vinden", "klanten krijgen", "meer klanten", "mond-tot-mond", "logo", "website", "zichtbaarheid"], "online": ["online", "webshop", "e-commerce", "ecommerce", "etsy", "amazon", "shopify", "verzending", "verzenden", "levering", "dropshipping", "internet"], "profit": ["winst", "omzet", "verdienen", "hoeveel ga ik verdienen", "liquide", "geld op de rekening", "kasstroom", "cashflow"], "pay": ["mezelf betalen", "mijn salaris", "mijn loon", "hoeveel betalen", "opnemen", "dividend", "eigenaarsloon", "leefkosten", "van leven"], "costs": ["vaste kosten", "variabele kosten", "vaste last", "overhead", "uitgaven", "maandelijkse kosten"], "suppliers": ["leverancier", "groothandel", "onderhandelen", "in bulk", "waar koop ik", "inkoop", "inkopen"], "stock": ["voorraad", "inventaris", "onverkocht", "bijbestellen", "hoeveel inkopen", "houdbaar"], "premises": ["bedrijfspand", "winkelpand", "winkel", "kantoor", "huur", "locatie", "vanuit huis", "thuis", "keuken", "werkplaats", "marktkraam", "kraam"], "partners": ["partner", "compagnon", "medeoprichter", "met een vriend", "met mijn broer", "met mijn zus", "met familie", "samen beginnen", "met een partner"], "parttime": ["mijn baan", "baan houden", "ontslag nemen", "opzeggen", "bijbaan", "naast mijn werk", "werkgever", "neventak"], "competition": ["concurrent", "concurrentie", "rivaal", "onderscheiden", "anders dan", "uniek"], "growth": ["groeien", "groei", "uitbreiden", "opschalen", "tweede vestiging", "nieuw product"], "seasonality": ["seizoen", "rustige maand", "laagseizoen", "hoogseizoen", "orkaan", "toerist", "toerisme", "seizoensgebonden"], "invoice": ["factuur maken", "factuur opstellen", "factuur schrijven", "factuur sjabloon", "offerte", "kwitantie"], "contracts": ["contract", "overeenkomst", "schriftelijk", "algemene voorwaarden", "aanbetaling", "terugbetaling", "garantie", "klacht", "geschil", "retourbeleid", "ontevreden klant"]};
  const GREET = /^(hallo|hoi|hey|help|hulp|goedendag|goedemorgen)/i;
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
  const allChip = () => '<button class="chip soft" data-act="all">' + esc("Alle onderwerpen") + '</button>';

  const chips = (ids, soft) => `<div class="chips">${ids.map(id => `<button class="chip${soft ? ' soft' : ''}" data-act="ask" data-topic="${id}">${esc(TOPIC[id].label())}</button>`).join('')}</div>`;
  function moreChips(current) {
    const r = report(), pri = r ? r.recs.map(x => x[0]) : [], pool = pri.concat(orderList());
    const ids = []; pool.forEach(id => { if (id !== current && !visited[id] && !ids.includes(id)) ids.push(id); });
    return ids.length ? `<p class="muted small" style="margin:6px 0 2px">En nu?</p>${chips(ids.slice(0, 3), true)}${r ? '<a class="chip soft" href="#/report">Mijn rapport</a>' : ''}` : '';
  }
  function toolCost() {
    const s = sym();
    return `<div class="bubble coach tool tool-cost"><p><b>Kostprijs van een product of klus</b></p><div class="grid2">
      <div class="field"><label for="t-mat">Materialen of handelswaar <span class="unit">(${s})</span></label><input id="t-mat" type="number" inputmode="numeric" min="0" placeholder="0"></div>
      <div class="field"><label for="t-oth">Verpakking, vervoer, commissies <span class="unit">(${s})</span></label><input id="t-oth" type="number" inputmode="numeric" min="0" placeholder="0"></div>
      <div class="field"><label for="t-hrs">Uren van je tijd</label><input id="t-hrs" type="number" inputmode="decimal" min="0" step="0.25" placeholder="0"></div>
      <div class="field"><label for="t-rate">Je tijd, per uur <span class="unit">(${s})</span></label><input id="t-rate" type="number" inputmode="numeric" min="0" placeholder="0"><small>Wat je per uur zou willen verdienen.</small></div></div>
      <div class="res" id="t-res" aria-live="polite"></div></div>`;
  }
  function costCalc() {
    const g = id => num(($('#' + id) || {}).value), cost = g('t-mat') + g('t-oth') + g('t-hrs') * g('t-rate'), el = $('#t-res');
    if (!el) return;
    if (!(cost > 0)) { el.textContent = ''; return; }
    const price = m => J(cost / (1 - m));
    el.innerHTML = `<p>Je kostprijs: <b>${J(cost)}</b>.</p><p>De marge is het deel van de verkoopprijs dat je na deze kosten overhoudt. Om 30 % over te houden verkoop je voor <b>${price(0.3)}</b>, voor 40 % verkoop je voor <b>${price(0.4)}</b>, voor 50 % verkoop je voor <b>${price(0.5)}</b>.</p><p class="muted small">Je vaste kosten en je belastingen komen nog uit die marge.</p>`;
  }
  const chatHTML = () => chat.map(m => m.raw ? m.html : `<div class="bubble ${m.from}">${m.html}</div>`).join('');
  function coachPush(items) {
    chat = chat.concat(items);
    const log = $('#chatlog'); if (log) log.innerHTML = chatHTML();
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
    const first = [{ from: 'coach', html: `<p>Hallo! Ik ben je gids voor ${esc(D.name)}. Ik ben een hulpmiddel in deze app, geen mens, en ik leg dingen uit in gewone woorden. Ik vervang geen boekhouder.</p>` }];
    if (r) { first.push({ from: 'coach', html: '<p>Je rapport is klaar. Dit zijn de nuttigste punten om eerst aan te werken:</p>' }); first.push({ raw: true, html: chips(r.recs.map(x => x[0])) }); }
    else { first.push({ from: 'coach', html: '<p>Doe eerst <a href="#/test">de test</a>, dan kan ik adviezen opbouwen uit je eigen cijfers. Kies intussen een onderwerp:</p>' }); first.push({ raw: true, html: chips(orderList().slice(0, 6)) }); }
    return first;
  }
  function coach(arg) {
    if (!chat.length) chat = coachIntro();
    const pending = TOPIC[arg] && !visited[arg] ? arg : null;
    return `<div class="coachhead"><div class="avatar"><svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="30" width="10" height="14" rx="3" fill="#8FC9D4"></rect><rect x="19" y="19" width="10" height="25" rx="3" fill="#fff"></rect><rect x="34" y="6" width="10" height="38" rx="3" fill="#E8A33D"></rect></svg></div><div><h2 style="font-size:20px">Je coach</h2><div class="muted small">Gratis · Gestuurd door je cijfers</div></div></div>
      <div class="chat" id="chatlog" data-pending="${pending || ''}">${chatHTML()}</div>
      <form class="composer" id="composer" autocomplete="off"><input type="text" id="ask" aria-label="Schrijf aan je coach" placeholder="Vraag over prijzen, belastingen, klanten..."><button type="submit" aria-label="Versturen"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#12262B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5"></path></svg></button></form>`;
  }

  function renderCountryMenu() {
    $('#cname').firstChild.nodeValue = D.name + ' ';
    const list = COUNTRIES.countries.map(c => `<button class="copt" data-country="${c.id}" ${c.id === D.country ? 'aria-current="true"' : ''}>${esc(c.name)}${c.preview ? ' (voorbeeld)' : ''}${c.id === D.country ? ' ✓' : ''}</button>`).join('');
    const soon = (COUNTRIES.comingSoon || []).length ? `<p class="muted small" style="margin:10px 0 0">Binnenkort: ${esc(COUNTRIES.comingSoon.join(', '))}. Elk land heeft eigen belastingen en regels.</p>` : '';
    const ext = (COUNTRIES.external || []).map(c => `<button class="copt" data-url="${esc(c.url)}" data-key="${esc(c.key)}" data-id="${esc(c.id)}">${esc(c.name)} <span class="muted small">&nbsp;${c.lang === 'es' ? 'en español' : c.lang === 'fr' ? 'en français' : 'in English'} →</span></button>`).join('');
    $('#cpop').innerHTML = list + ext + soon;
  }
  function useCountry(entry) {
    return fetch(entry.file).then(r => { if (!r.ok) throw new Error('data'); return r.json(); }).then(d => {
      D = d; KEY = keyFor(D.country); S = load(); chat = []; visited = {}; errMsg = '';
      if (!D.legalStatuses.some(x => x.id === S.input.status)) S.input.status = D.legalStatuses[0].id;
      try { localStorage.setItem('papa-nl-country', D.country); } catch (e) { /* negeren */ }
      renderCountryMenu();
      document.title = 'Pa a Pa Caraïben: test je bedrijfsidee · ' + D.name;
    });
  }

  function successView() {
    const lbl = id => (TOPIC[id] ? TOPIC[id].label() : id);
    return (window.PAPSuccess ? window.PAPSuccess.render({ R: report(), J, pct, esc, topicLabel: lbl }) : '') + footer();
  }

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
        if (el) el.textContent = n + ' van ' + all.length + ' gedaan';
      }
    });
    view.addEventListener('submit', e => {
      if (e.target.id !== 'composer') return;
      e.preventDefault();
      const inp = $('#ask'), q = inp.value.trim(); if (!q) return;
      inp.value = '';
      const id = matchTopic(q);
      if (id) { track('caribbean-coach-hit'); coachAsk(id, q); }
      else if (GREET.test(q)) coachPush([{ from: 'me', html: esc(q) }, { from: 'coach', html: "<p>Hallo! Kies hieronder een onderwerp of typ je vraag.</p>" }, { raw: true, html: chips(orderList(), true) }]);
      else { track('caribbean-coach-miss'); coachPush([{ from: 'me', html: esc(q) }, { from: 'coach', html: '<p>Daar heb ik nog geen antwoord op. Begin met de veelgemaakte fouten of kies een ander onderwerp. Je kunt ook een woord gebruiken als prijs, belasting, klanten of sparen.</p>' }, { raw: true, html: chips(orderList().slice(0, 6), true) + allChip() }]); }
    });
    view.addEventListener('click', e => {
      const sh = e.target.closest('[data-share]'); if (sh) track('caribbean-share-' + sh.dataset.share);
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'all') coachPush([{ from: 'me', html: esc("Alle onderwerpen") }, { raw: true, html: chips(orderList(), true) }]);
      else if (act === 'ask') coachAsk(b.dataset.topic);
      else if (act === 'back') { S.step = Math.max(0, S.step - 1); errMsg = ''; save(); rerender(); window.scrollTo(0, 0); }
      else if (act === 'next') { errMsg = validate(S.step); if (!errMsg) { if (S.step === 0) track('caribbean-test-started-' + D.country.toLowerCase()); S.step += 1; save(); } rerender(); window.scrollTo(0, 0); }
      else if (act === 'finish') { errMsg = validate(3); if (errMsg) { rerender(); window.scrollTo(0, 0); return; } S.ready = true; S.step = 0; chat = []; visited = {}; save(); track('caribbean-report-done-' + D.country.toLowerCase()); location.hash = '#/report'; }
      else if (act === 'copylink') {
        const done = ok => { const el = $('#copiedlink'); if (el) el.textContent = ok ? 'Link gekopieerd.' : b.dataset.url; track('caribbean-share-copy'); };
        try { navigator.clipboard.writeText(b.dataset.url).then(() => done(true), () => done(false)); } catch (err) { done(false); }
      }
      else if (act === 'copy') {
        const txt = visionText(), done = ok => { const el = $('#copied'); if (el) el.textContent = ok ? 'Gekopieerd.' : 'Selecteer de tekst hierboven en kopieer die.'; };
        try { navigator.clipboard.writeText(txt).then(() => done(true), () => done(false)); } catch (err) { done(false); }
      }
    });
    $('#cpop').addEventListener('click', e => {
      const x = e.target.closest('[data-url]');
      if (x) { try { localStorage.setItem(x.dataset.key, x.dataset.id); } catch (err) { /* negeren */ } location.href = x.dataset.url; return; }
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
    e.textContent = 'Het gegevensbestand kon niet worden geladen. Open deze pagina via het webadres (GitHub Pages) en niet door op het bestand te dubbelklikken.';
  }

  fetch('countries.json').then(r => { if (!r.ok) throw new Error('data'); return r.json(); }).then(list => {
    COUNTRIES = list;
    let id = list.countries[0].id;
    try { id = localStorage.getItem('papa-nl-country') || id; } catch (e) { /* negeren */ }
    try { const q = new URLSearchParams(location.search).get('c'); if (q) id = q.toUpperCase(); } catch (e) { /* ignore */ }
    const entry = list.countries.find(c => c.id === id) || list.countries[0];
    return useCountry(entry);
  }).then(() => { defTopics(); bindEvents(); route(); }).catch(showErr);
})();
