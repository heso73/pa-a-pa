/* Pa a Pa Caraïbe : interface en français. Utilise ../engine.js, report-fr.js et un fichier de données par pays. */
(function () {
  'use strict';
  const E = window.PaPaEngine;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = E.num, pct = E.pct;
  const track = n => { try { if (window.track) window.track(n); } catch (e) { /* ignorer */ } };
  let D = null, COUNTRIES = null, chat = [], visited = {}, errMsg = '', S = null, KEY = '';
  const J = n => E.money(D, n);
  const TAGS = { 'to confirm': 'à confirmer' };

  const defaults = () => ({
    input: { status: 'business_name', activity: '', payMode: '', creditShare: '50', cdays: '30', sdays: '0', sales: '', direct: '', fixed: '', needs: '', emp: '0', pay: '', startup: '', savings: '', m1: 0, m2: 0, m3: 0 },
    step: 0, vision: {}, done: {}, ready: false
  });
  const keyFor = id => 'papa-fr-' + id.toLowerCase() + '-v1';
  function load() {
    try {
      const o = JSON.parse(localStorage.getItem(KEY));
      if (o && o.input) { const d = defaults(); return Object.assign(d, o, { input: Object.assign(d.input, o.input) }); }
    } catch (e) { /* ignorer */ }
    return defaults();
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignorer */ } };
  const report = () => (S.ready ? E.buildReportFr(D, S.input) : null);
  const stat = () => E.statusOf(D, S.input.status);

  const li = a => '<ul>' + a.map(x => `<li>${x}</li>`).join('') + '</ul>';
  const fieldNum = (k, label, unit, hint, ph) =>
    `<div class="field"><label for="f-${k}">${label} <span class="unit">${unit}</span></label>` +
    `<input id="f-${k}" data-k="${k}" type="number" inputmode="numeric" min="0" step="1" placeholder="${ph || ''}" value="${esc(S.input[k])}">` +
    (hint ? `<small>${hint}</small>` : '') + '</div>';
  const why = (title, body) => `<div class="why"><b class="k">${title}</b>${body}</div>`;
  const sym = () => D.currency.symbol;
  const ex = k => (D.examples && D.examples[k] != null ? 'ex. : ' + D.examples[k] : '');
  const previewBox = () => '';
  const planNote = () => `<div class="note" style="margin:0 0 14px">Utilisez ceci comme <b>estimation pour planifier</b>. À l’inscription, ${esc(D.authorities.tax.name)} vous donne les montants exacts pour votre cas.</div>`;
  function bracketsText(br) {
    return br.map((b, i) => {
      const prev = i ? br[i - 1].upToChargeable : 0;
      return b.upToChargeable != null ? `${pct(b.rate)} ${i ? 'de ' + J(prev) + ' ' : ''}jusqu’à ${J(b.upToChargeable)}` : (i ? `${pct(b.rate)} au-delà de ${J(prev)}` : `${pct(b.rate)} taux unique`);
    }).join(', ');
  }
  function footer() {
    const a = D.authorities;
    const link = x => (x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)}</a>` : esc(x.name));
    const src = (D.sources || []).map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('');
    return `<div class="share"><b>Partager l’app</b> <a class="chip soft" data-share="whatsapp" href="https://wa.me/?text=Outil%20gratuit%20pour%20tester%20une%20id%C3%A9e%20d%E2%80%99entreprise%20dans%20la%20Cara%C3%AFbe%20%3A%20imp%C3%B4ts%2C%20ce%20qu%E2%80%99il%20vous%20reste%20et%20un%20plan.%20Sans%20inscription.%20https%3A//heso73.github.io/pa-a-pa/caribbean/fr/" target="_blank" rel="noopener">WhatsApp</a> <a class="chip soft" data-share="facebook" href="https://www.facebook.com/sharer/sharer.php?u=https%3A//heso73.github.io/pa-a-pa/caribbean/fr/" target="_blank" rel="noopener">Facebook</a> <button class="chip soft" data-act="copylink" data-url="https://heso73.github.io/pa-a-pa/caribbean/fr/">Copier le lien</button> <span id="copiedlink" class="small muted" role="status"></span></div><p class="small"><a href="../partners/">Pour les organisations : kit partenaires</a></p>` + `<footer class="fine"><p>Ces chiffres sont des estimations pour vous aider à décider. Ils ne constituent pas un conseil fiscal ou juridique. Données de ${esc(D.name)} vérifiées pour la dernière fois le ${esc(D.dataVerifiedOn)}. Confirmez toujours auprès de ${link(a.tax)} et de ${link(a.registry)}.</p>` +
      `<details class="more"><summary>À demander à l’administration fiscale</summary>${li(D.toVerify.map(esc))}</details>` +
      (src ? `<details class="more"><summary>Sources</summary><ul>${src}</ul></details>` : '') +
      `<p>Pa a Pa est publié par Caribbean Metadata. <a href="../">English version</a> · <a href="../es/">Versión en español</a></p></footer>`;
  }

  function home() {
    const done = S.ready ? `<a class="path" href="#/report" style="margin-bottom:12px"><div class="n" style="background:var(--sun);color:var(--ink)">✓</div><div><div class="t">Votre rapport est prêt</div><div class="d">Rouvrez-le ou modifiez vos chiffres dans le test.</div></div></a>` : '';
    return `<section class="hero"><h1>Votre projet d’entreprise, pas à pas.</h1>
      <p class="lead">Gratuit et sans inscription. Chaque question et chaque chiffre sont expliqués avec des mots simples. Impôts et règles affichés pour : <b>${esc(D.name)}</b>.</p></section>
      ${previewBox()}${done}
      <nav class="paths" aria-label="Choisissez un chemin">
        <a class="path primary" href="#/test"><div class="n">1</div><div><div class="t">Testez votre projet</div><div class="d">Est-il solide ? Votre réponse en quelques minutes.</div></div></a>
        <a class="path" href="#/vision"><div class="n">2</div><div><div class="t">Construisez votre vision</div><div class="d">Clarifiez vos idées : pour qui, quoi et comment.</div></div></a>
        <a class="path" href="#/next"><div class="n" style="background:var(--ink)">3</div><div><div class="t">Avancez vers la réussite</div><div class="d">Vos prochaines étapes, avec un coach qui vous guide.</div></div></a>
        <a class="path" href="#/success"><div class="n" style="background:var(--sun);color:var(--ink)">4</div><div><div class="t">Les règles de la rentabilité</div><div class="d">Pourquoi une entreprise gagne de l’argent, et comment le rester.</div></div></a>
      </nav>
      <p class="tagline">Tester · Se lancer · Durer</p>${footer()}`;
  }

  const STEP_NAMES = ['Votre projet', 'Votre argent', 'Votre équipe et le démarrage', 'Votre motivation'];
  function stepProject() {
    const st = D.legalStatuses.map(s => `<label class="opt"><input type="radio" name="status" data-k="status" value="${s.id}" ${S.input.status === s.id ? 'checked' : ''}><span class="t">${esc(s.label)}</span><small>${esc(s.plain)}</small></label>`).join('');
    const modes = [['now', 'Sur le moment', 'Espèces, carte ou virement sur place.'], ['later', 'Plus tard, sur facture', 'Les clients paient des jours ou des semaines après.'], ['both', 'Un peu des deux', 'Certains clients paient sur le moment, d’autres plus tard.']];
    const pm = modes.map(m => `<label class="opt"><input type="radio" name="payMode" data-k="payMode" value="${m[0]}" ${S.input.payMode === m[0] ? 'checked' : ''}><span class="t">${m[1]}</span><small>${m[2]}</small></label>`).join('');
    const pmode = S.input.payMode;
    const extra = pmode === 'later' || pmode === 'both' ? `<div class="grid2">${pmode === 'both' ? fieldNum('creditShare', 'Part des ventes payée plus tard', '(%)', '', '50') : ''}${fieldNum('cdays', 'Jours que mettent vos clients à payer', '(jours)', '', '30')}${fieldNum('sdays', 'Jours que vos fournisseurs vous laissent pour payer', '(jours)', 'Écrivez 0 si vous payez vos fournisseurs tout de suite.', '0')}</div>` : '';
    return `<h2 class="q">Comment allez-vous exercer ?</h2><div class="opts">${st}</div>
      <h2 class="q">Comment vos clients vous paieront-ils ?</h2><div class="opts">${pm}</div>${extra}
      ${why('Pourquoi ces questions ?', '<p>Votre forme juridique décide des impôts et cotisations que vous payez. En cas de doute, commencez en entreprise individuelle : c’est souvent le plus simple.</p><p>Si les clients paient plus tard, vous avancez l’argent en attendant. Cet argent s’appelle le <b>besoin en fonds de roulement</b>. Nous ne le calculons que lorsqu’il vous concerne.</p>')}`;
  }
  function stepMoney() {
    const u = `(${sym()} par mois)`;
    return `<h2 class="q">Votre argent, mois par mois</h2><p class="muted">Tous les montants sont en ${esc(D.currency.code)} (${esc(sym())}), par mois.</p>
      ${fieldNum('sales', 'Ventes prévues', u, 'Ce que les clients vous paieront un mois normal.', ex('sales'))}
      ${fieldNum('direct', 'Coût de ce que vous vendez', u, 'Marchandises, matières, emballages : ce que vous dépensez pour produire ou acheter ce que vous vendez. Écrivez 0 s’il n’y en a pas.', ex('direct'))}
      ${fieldNum('fixed', 'Charges fixes', u, 'Dépenses qui ne changent pas avec les ventes : loyer, transport, téléphone, assurances, publicité. Écrivez 0 s’il n’y en a pas.', ex('fixed'))}
      ${fieldNum('needs', 'Ce dont vous avez besoin pour vivre', u, 'Votre foyer doit manger. Soyez honnête : cela compte comme un coût du projet.', ex('needs'))}
      ${why('Pourquoi ces questions ?', '<p>Nous comparons ce qui entre et ce qui sort, puis nous retirons impôts et cotisations. Ce qui reste doit couvrir ce dont vous avez besoin pour vivre, sinon le plan ne peut pas fonctionner.</p>')}`;
  }
  function stepTeam() {
    return `<h2 class="q">Votre équipe et votre démarrage</h2>
      <div class="grid2">${fieldNum('emp', 'Employés', '(nombre)', 'Sans vous compter. Écrivez 0 s’il n’y en a pas.', '0')}${fieldNum('pay', 'Salaire brut par employé', `(${sym()} par mois)`, 'Avant retenues.', ex('pay'))}</div>
      <div class="grid2">${fieldNum('startup', 'Coûts de démarrage', `(${sym()}, une seule fois)`, 'Équipement, marchandises, enregistrement, site web. Écrivez 0 s’il n’y en a pas.', ex('startup'))}${fieldNum('savings', 'Économies que vous pouvez utiliser', `(${sym()})`, 'Argent que vous pouvez investir sans emprunter.', ex('savings'))}</div>
      ${why('Pourquoi ces questions ?', '<p>Les employés ajoutent des paiements mensuels à l’État en plus de leur salaire. Les coûts de démarrage et les économies montrent si vous pouvez commencer sans vous endetter et combien de temps vous tiendrez si les ventes démarrent lentement.</p>')}`;
  }
  function stepMotivation() {
    const items = [['m1', 'Je peux vivre avec des revenus irréguliers pendant six mois.'], ['m2', 'Je suis prêt à travailler six jours par semaine pendant la première année.'], ['m3', 'Je sais qui seront mes cinq premiers clients.']];
    const html = items.map(it => `<fieldset class="statement" style="border:0;padding:0;margin:0 0 18px"><legend style="font-weight:600;margin-bottom:8px;padding:0">${it[1]}</legend><div class="scale">${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="${it[0]}" data-k="${it[0]}" value="${n}" ${+S.input[it[0]] === n ? 'checked' : ''}>${n}</label>`).join('')}</div><div class="scalelegend"><span>Pas du tout</span><span>Tout à fait</span></div></fieldset>`).join('');
    return `<h2 class="q">Êtes-vous prêt ?</h2><p class="muted">Notez chaque phrase de 1 (pas du tout) à 5 (tout à fait).</p>${html}
      ${why('Pourquoi ces questions ?', '<p>L’argent n’est qu’un côté. Votre énergie et vos premiers clients décident si le plan survit aux premiers mois.</p>')}`;
  }
  function validate(step) {
    const i = S.input;
    if (step === 0) { if (!i.status) return 'Choisissez comment vous allez exercer.'; if (!i.payMode) return 'Choisissez comment vos clients vous paieront.'; if (i.payMode === 'both' && !(num(i.creditShare) > 0)) return 'Indiquez la part des ventes payée plus tard.'; }
    if (step === 1) { if (!(num(i.sales) > 0)) return 'Indiquez vos ventes prévues par mois.'; if (!(num(i.needs) > 0)) return 'Indiquez ce dont vous avez besoin pour vivre chaque mois.'; }
    if (step === 3) { if (!(+i.m1 && +i.m2 && +i.m3)) return 'Notez les trois phrases pour continuer.'; }
    return '';
  }
  function test() {
    const s = Math.min(Math.max(+S.step || 0, 0), 3);
    const bars = [0, 1, 2, 3].map(n => `<i class="${n <= s ? 'on' : ''}"></i>`).join('');
    const body = [stepProject, stepMoney, stepTeam, stepMotivation][s]();
    const last = s === 3;
    return `<div class="backrow"><a class="iconbtn" href="#/" aria-label="Retour à l’accueil"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 3L5 9l6 6"></path></svg></a><b style="color:var(--deep);font-size:14px">Testez votre projet · ${esc(D.name)}</b></div>
      <div class="progress" aria-hidden="true">${bars}</div><div class="crumb">Partie ${s + 1} sur 4 · ${STEP_NAMES[s]}</div>${s === 0 ? previewBox() : ''}
      ${errMsg ? `<p class="error" role="alert">${esc(errMsg)}</p>` : ''}${body}
      <div class="btnrow"><button class="btn" data-act="${last ? 'finish' : 'next'}">${last ? 'Voir mon rapport' : 'Continuer'}</button>${s > 0 ? '<button class="btn link" data-act="back">Retour</button>' : ''}</div>${footer()}`;
  }

  const VERDICT = {
    ok: ['Viable', 'Votre plan couvre ce dont vous avez besoin pour vivre, vos économies peuvent soutenir le démarrage et vous vous sentez prêt. Continuez à vérifier vos chiffres une fois lancé.'],
    cond: ['Viable, sous conditions', 'Votre projet peut fonctionner si vous réglez les points ci-dessous avant de commencer.'],
    no: ['Pas encore viable', 'En l’état, ce plan ne peut pas payer vos dépenses. La bonne nouvelle : vous l’avez découvert avant de dépenser de l’argent. Travaillez les points ci-dessous et refaites le test.']
  };
  function glossary(c) {
    const items = [['Coût de ce que vous vendez', 'Ce que vous dépensez en marchandises et matières pour ce que vous vendez.'], ['Charges fixes', 'Dépenses que vous payez même un mois lent : loyer, téléphone, assurances.']];
    if (c.model === 'corporate') {
      if (D.corporateTax) items.push([D.corporateTax.label, 'Impôt sur le bénéfice de la société. ' + bracketsText(D.corporateTax.brackets) + '.']);
    } else {
      D.selfEmployed.contributions.forEach(ct => items.push([ct.label, ct.plain]));
      if (D.incomeTax) items.push([D.incomeTax.label, 'Impôt sur votre bénéfice après la part exonérée (' + D.incomeTax.allowanceNote + '). Taux : ' + (D.incomeTax.bracketText || bracketsText(D.incomeTax.brackets)) + '.']);
    }
    if (D.vat) items.push([D.vat.short, D.vat.label + '. C’est l’impôt que vous facturez à vos clients sur les ventes taxables et que vous reversez ensuite à l’État.']);
    return `<details class="more"><summary>Que signifient ces mots ?</summary><dl>${items.map(x => `<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join('')}</dl></details>`;
  }
  function reportView() {
    const R = report();
    if (!R) return `<h1>Votre rapport</h1><p class="lead">Faites d’abord le test. Il prend quelques minutes et le rapport se construit avec vos réponses.</p><a class="btn" href="#/test">Tester mon projet</a>${footer()}`;
    const c = R.c;
    const rows = [['Ventes', J(c.annualSales)], ['Coût de ce que vous vendez et charges fixes', '-' + J((c.direct + c.fixed) * 12)]];
    if (c.emp) { rows.push(['Salaires des employés', '-' + J(c.payroll)]); rows.push(['Cotisations de l’employeur', '-' + J(c.er)]); }
    rows.push(['<b>Bénéfice avant impôts</b>', J(c.profit)]);
    c.lines.forEach(l => rows.push([esc(l.label), '-' + J(l.amount)]));
    const table = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('') + `<tr class="sum"><td>Il vous reste par an</td><td>${J(c.net)}</td></tr><tr><td>Il vous reste par mois</td><td><b>${J(c.netMonthly)}</b></td></tr><tr><td>Il vous faut par mois</td><td>${J(c.needs)}</td></tr>`;
    const notes = [];
    if (R.be) notes.push(`<div class="note"><b>Seuil de rentabilité :</b> il vous faut environ ${J(R.be)} de ventes par mois pour couvrir vos coûts, vos impôts et ce dont vous avez besoin pour vivre.</div>`);
    notes.push(`<div class="note${c.left < 0 ? ' alert' : ''}"><b>Démarrage :</b> ${c.left < 0 ? `vos économies sont ${J(-c.left)} en dessous des coûts de démarrage.` : `après les coûts de démarrage, il vous reste ${J(c.left)}, soit environ ${c.runway.toFixed(1)} mois de dépenses de vie si aucun revenu n’entrait.`}</div>`);
    if (c.credit) notes.push(`<div class="note${c.bfr > Math.max(0, c.left) ? ' alert' : ''}"><b>Besoin en fonds de roulement :</b> attendre le paiement des clients immobilise environ ${J(c.bfr)} de votre propre argent.</div>`);
    notes.push(`<div class="note"><b>Motivation ${c.motivation} sur 15 :</b> ${c.motivation >= 12 ? 'Forte. Gardez vos raisons par écrit pour les mois difficiles.' : c.motivation >= 8 ? 'Une bonne base. Travaillez la phrase que vous avez notée le plus bas avant de commencer.' : 'Prenez le temps de vous préparer : testez votre idée à temps partiel et trouvez d’abord vos clients.'}</div>`);
    (D.notes || []).forEach(n => notes.push(`<div class="note alert">${esc(n)}</div>`));
    const sw = (title, color, items) => `<section class="card swot"><h3><span class="dot" style="background:${color}"></span>${title}</h3>${li(items.map(esc))}</section>`;
    const recs = R.recs.map(r => `<li><div>${esc(r[1])}<br><a href="#/coach/${r[0]}">Demandez au coach : ${esc(TOPIC[r[0]].label())}</a></div></li>`).join('');
    return `<h1>Rapport de viabilité</h1><div class="muted small" style="margin:4px 0 8px">${esc(D.name)} · ${esc(stat().label)}</div>
      <div class="verdict ${R.verdict}"><div class="k">Verdict</div><div class="v">${VERDICT[R.verdict][0]}</div><p>${VERDICT[R.verdict][1]}</p></div>${planNote()}
      <section class="card"><h3 style="margin-bottom:10px">Comment s’additionne votre année</h3><table class="sum">${table}</table>${notes.join('')}${glossary(c)}</section>
      ${sw('Forces', '#1F7A8C', R.strengths)}${sw('Faiblesses', '#E8A33D', R.weaknesses)}${sw('Opportunités', '#0B3C49', R.opportunities)}${sw('Risques', '#C2491D', R.risks)}
      <section class="card"><h3 style="margin-bottom:12px">Quoi faire d’abord</h3><ol class="recs">${recs}</ol></section>
      <div class="btnrow" style="margin-top:18px"><a class="btn" href="#/coach">Parler à mon coach</a><a class="btn link" href="#/test">Modifier mes chiffres</a></div>${footer()}`;
  }

  const VISION = [
    ['who', 'Qui sont vos clients ?', 'Décrivez une personne réelle ou un type d’entreprise : où elle vit, ce qu’elle fait toute la journée.'],
    ['problem', 'Quel problème leur résolvez-vous ?', 'Avec quoi ont-ils du mal aujourd’hui, ou que paient-ils trop cher ?'],
    ['offer', 'Que allez-vous vendre exactement, et à quel prix ?', 'Une phrase pour le produit ou le service, puis un prix que vous pourriez dire à voix haute.'],
    ['why', 'Pourquoi vous choisiraient-ils ?', 'Prix, qualité, rapidité, confiance, emplacement. Choisissez-en une ou deux et soyez honnête.'],
    ['reach', 'Comment vos cinq premiers clients sauront-ils que vous existez ?', 'Nommez des lieux ou des personnes réels : un groupe WhatsApp, un marché, une église, une école, un ami qui connaît un acheteur.'],
    ['stop', 'Qu’est-ce qui vous ferait arrêter ou changer de plan ?', 'Décidez dès maintenant, calmement, quel résultat à trois mois vous ferait ajuster.']
  ];
  function visionView() {
    const f = VISION.map(v => `<div class="field"><label for="v-${v[0]}">${v[1]}</label><textarea id="v-${v[0]}" data-v="${v[0]}">${esc(S.vision[v[0]] || '')}</textarea><small>${v[2]}</small></div>`).join('');
    return `<h1>Construisez votre vision</h1><p class="lead">Six questions pour clarifier votre idée. Vos réponses restent sur cet appareil et sont enregistrées pendant que vous écrivez.</p>
      <section class="card" style="margin-top:14px">${f}</section>
      <section class="card"><h3 style="margin-bottom:8px">Votre vision en une page</h3><div id="vsum" style="white-space:pre-wrap;font-size:15px"></div>
      <div class="btnrow"><button class="btn secondary" data-act="copy">Copier ma vision</button><span id="copied" class="small muted" role="status"></span></div></section>${footer()}`;
  }
  function visionText() {
    const parts = VISION.filter(v => (S.vision[v[0]] || '').trim()).map(v => `${v[1]}\n${S.vision[v[0]].trim()}`);
    return parts.length ? parts.join('\n\n') : 'Répondez aux questions ci-dessus et votre vision apparaîtra ici.';
  }
  const updateVision = () => { const el = $('#vsum'); if (el) el.textContent = visionText(); };

  function nextQuarter() {
    const n = new Date(), t = new Date(n.getFullYear(), n.getMonth(), n.getDate()), y = n.getFullYear();
    const q = D.calendar.quarterly;
    const cand = q.map(x => new Date(y, x.m - 1, x.d)).concat([new Date(y + 1, q[0].m - 1, q[0].d)]);
    return cand.find(d => d >= t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function feeText(st) {
    const parts = [];
    if (st.feeLines && st.feeLines.length) parts.push('Budget d’enregistrement : ' + st.feeLines.map(f => `${f.label.toLowerCase()} ${J(f.amount)}`).join(', ') + '.');
    if (st.feeNote) parts.push(st.feeNote);
    return parts.join(' ');
  }
  function nextView() {
    const R = report(), c = R ? R.c : E.compute(D, S.input), st = stat(), cal = D.calendar;
    const steps = D.launchSteps.filter(s => s.appliesTo.includes(st.id) && (s.when !== 'employees' || c.emp > 0) && (s.when !== 'vat' || c.vat));
    const done = steps.filter(s => S.done[s.id]).length;
    const list = steps.map(s => `<li><label><input type="checkbox" data-done="${s.id}" ${S.done[s.id] ? 'checked' : ''}><span><span class="t">${esc(s.label)}</span><small>${esc(s.plain)}${s.url ? ` <a href="${esc(s.url)}" target="_blank" rel="noopener">Site officiel</a>` : ''}</small></span></label></li>`).join('');
    const rows = [];
    if (cal.quarterly && cal.quarterly.length) rows.push(['Prochaine échéance : ' + nextQuarter(), (st.taxModel === 'corporate' ? cal.quarterlyTextCorporate : cal.quarterlyTextPersonal) + ' Dates chaque année : ' + cal.quarterlyList + '.']);
    if (cal.monthlyText) rows.push([cal.monthlyLabel || 'Chaque mois', cal.monthlyText]);
    rows.push([cal.annualLabel, st.taxModel === 'corporate' ? cal.annualTextCorporate || cal.annualTextPersonal : cal.annualTextPersonal]);
    if (c.emp > 0) rows.push([cal.payrollLabel || 'Chaque mois', cal.payrollText]);
    if (c.vat && cal.vatText) rows.push([D.vat.short, cal.vatText]);
    return `<h1>Avancez vers la réussite</h1><p class="lead">Vos prochaines étapes pour <b>${esc(D.name)}</b>, statut : <b>${esc(st.label.toLowerCase())}</b>.${S.ready ? '' : ' <a href="#/test">Faites le test</a> pour adapter cette liste à votre projet.'}</p>
      <section class="card" style="margin-top:14px"><h3 style="margin-bottom:4px">Étapes pour se lancer</h3><p class="muted small" id="donecount">${done} sur ${steps.length} faites</p><ul class="checklist">${list}</ul><p class="muted small" style="margin:12px 0 0">${esc(feeText(st))}</p></section>
      <section class="card"><h3 style="margin-bottom:10px">Votre calendrier fiscal</h3><ul class="cal">${rows.map(x => `<li><b>${esc(x[0])}</b><span>${esc(x[1])}</span></li>`).join('')}</ul>${R && st.taxModel !== 'corporate' ? `<div class="note alert"><b>Mettez de côté ${J(c.setAside)} par mois</b> sur un compte séparé pour avoir les paiements prêts le moment venu.</div>` : ''}</section>
      <section class="card"><h3 style="margin-bottom:8px">Aide aux petites entreprises</h3><p>${D.authorities.support.map(s => s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>` : esc(s.name)).join('<br>')}</p><p class="muted small" style="margin:0">Demandez quels conseils et quels financements sont ouverts en ce moment.</p></section>
      <div class="btnrow" style="margin-top:18px"><a class="btn" href="#/coach">Poser une question à mon coach</a></div>${footer()}`;
  }

  const TOPIC = {};
  function defTopics() {
    const R = () => report();
    const L = k => () => k;
    TOPIC.cost = { label: L('Coût et prix de vente'), tool: 'cost', msgs: () => {
      const r = R(), m = ['<p>Votre <b>coût</b> est ce que vous coûte un produit ou un travail avant de le vendre : matières, emballage, transport et votre propre temps.</p>'];
      m.push(`<p>Si vous vendez en dessous de ce coût, vous perdez de l’argent à chaque vente, même si le client est content.${r && r.c.sales > 0 ? ` Dans votre plan, les marchandises et les matières représentent ${pct(Math.min(1, r.c.direct / r.c.sales))} de vos ventes.` : ''} Calculons-le pour un produit ou un travail.</p>`);
      return m; } };
    TOPIC.breakeven = { label: L('Seuil de rentabilité'), msgs: () => {
      const r = R();
      if (!r) return ['<p>Le <b>seuil de rentabilité</b> correspond aux ventes mensuelles qui couvrent vos coûts, vos impôts et ce dont vous avez besoin pour vivre. <a href="#/test">Faites le test</a> pour voir le vôtre.</p>'];
      const m = [];
      if (!r.be) m.push('<p>Pour l’instant, ce que vous achetez coûte autant que ce que vous vendez : aucune quantité de ventes n’atteint l’équilibre. Commencez par vos prix.</p>');
      else m.push(`<p>Pour payer vos coûts, vos impôts et ce dont vous avez besoin pour vivre, il vous faut environ <b>${J(r.be)}</b> de ventes par mois. Votre plan prévoit ${J(r.c.sales)}.${r.be > r.c.sales * 1.02 ? ` C’est ${J(r.be - r.c.sales)} de plus que prévu.` : ' Vous êtes au-dessus.'}</p>`);
      m.push('<p>Vous avez trois leviers : augmenter un prix, baisser un coût ou prévoir plus de ventes. Changez-en un à la fois et refaites le test. <a href="#/test">Modifier mes chiffres</a></p>');
      return m; } };
    TOPIC.cash = { label: L('Clients qui paient en retard'), msgs: () => {
      const r = R(), m = ['<p>Quand un client paie à 30 jours, vous avez déjà payé matières, salaires et loyer. L’argent que vous avancez entre-temps est votre <b>besoin en fonds de roulement</b>.</p>'];
      if (r) m.push(r.c.credit ? `<p>Dans votre plan, attendre le paiement immobilise environ <b>${J(r.c.bfr)}</b>.</p>` : '<p>Dans votre plan, les clients paient sur le moment : cela ne vous concerne donc pas.</p>');
      m.push(li(['Demandez un acompte avant de commencer.', 'Facturez le jour même, avec une date d’échéance claire.', 'Proposez des délais plus courts, par exemple 14 jours.', 'Demandez plus de temps de paiement à vos fournisseurs.', 'Suspendez le travail pour les clients déjà en retard.']));
      return m; } };
    TOPIC.savings = { label: L('Mon matelas de sécurité'), msgs: () => {
      const r = R(), m = [];
      if (r) m.push(r.c.left < 0 ? `<p>Vos économies sont <b>${J(-r.c.left)}</b> en dessous des coûts de démarrage.</p>` : `<p>Après les coûts de démarrage, il vous reste <b>${J(r.c.left)}</b>, soit environ <b>${r.c.runway.toFixed(1)} mois</b> de dépenses de vie si aucun revenu n’entrait.</p>`);
      else m.push('<p>Votre <b>matelas de sécurité</b> est ce qui vous reste après les coûts de démarrage, divisé par ce dont vous avez besoin pour vivre chaque mois. <a href="#/test">Faites le test</a> pour voir le vôtre.</p>');
      m.push('<p>Une règle courante est d’avoir trois à six mois de dépenses de vie avant de dépendre de l’entreprise. Pour y arriver : commencez à temps partiel, baissez les coûts de démarrage (achetez d’occasion, louez au lieu d’acheter) ou lancez-vous par étapes.</p>');
      return m; } };
    TOPIC.tax = { label: L('Impôts et cotisations'), msgs: () => {
      const r = R(), st = stat(), cal = D.calendar, m = [];
      if (st.taxModel === 'corporate') {
        const ct = D.corporateTax;
        m.push(`<p>Une société paie l’<b>${esc(ct.label.toLowerCase())}</b> sur son bénéfice : ${esc(bracketsText(ct.brackets))}.${r ? ` Dans votre plan : environ <b>${J(r.c.corpTax)}</b> par an.` : ''}${ct.note ? ' ' + esc(ct.note) : ''}</p>`);
        const lv = (D.salesLevies || []).filter(l => !l.appliesTo || l.appliesTo.includes(st.id));
        if (lv.length) m.push(`<p>Sont aussi payés sur les ventes (et non sur le bénéfice) : ${lv.map(l => '<b>' + esc(l.label) + '</b> (' + pct(l.rate) + ')').join(', ')}.</p>`);
        m.push('<p>Ce que vous prélevez pour vous (salaire ou dividendes) est imposé à part et ne figure pas dans ces chiffres. Demandez à un comptable de le planifier.</p>');
      } else {
        m.push('<p>En entreprise individuelle, votre bénéfice est imposé comme un revenu personnel. Voici ce qui se paie dessus :</p>');
        const it = D.incomeTax, items = it ? [`<b>${esc(it.label)}:</b> ${esc(it.bracketText || bracketsText(it.brackets))}, après une part exonérée (${esc(it.allowanceNote)}).`] : [];
        D.selfEmployed.contributions.forEach(ct => items.push(`<b>${esc(ct.label)}</b>${ct.rate != null ? ' (' + pct(ct.rate) + ')' : ''}: ${esc(ct.plain)}`));
        m.push(li(items));
        if (r) m.push(`<p>Dans votre plan, cela représente environ <b>${J(r.c.levies)}</b> par an. Mettez de côté <b>${J(r.c.setAside)}</b> chaque mois sur un compte séparé.</p>`);
        m.push(`<p>${esc(cal.annualLabel)}: ${esc(cal.annualTextPersonal.charAt(0).toLowerCase() + cal.annualTextPersonal.slice(1))} <a href="#/next">Voir mon calendrier fiscal</a></p>`);
      }
      (D.notes || []).forEach(n => m.push(`<p class="muted small">${esc(n)}</p>`));
      return m; } };
    TOPIC.vat = { label: () => (D.vat ? D.vat.short : 'Taxe sur les ventes') + ' (taxe sur les ventes)', msgs: () => {
      const r = R(), v = D.vat || {};
      if (!D.vat) return [`<p>${esc(D.name)} n’a pas de taxe générale sur les ventes. Vérifiez les autres coûts de votre rapport : licences, cotisations et charges salariales.</p>`];
      const m = [`<p>La <b>${esc(v.short)}</b> est la taxe sur les ventes (${esc(v.label)}). Le taux général est de ${pct(v.rate)}. ${esc(v.registerNote)} Ensuite vous facturez la ${esc(v.short)} sur vos ventes et vous déposez des déclarations. ${esc(v.filingNote)}</p>`];
      if (r) m.push(`<p>Vos ventes annuelles prévues sont de ${J(r.c.annualSales)}.</p>`);
      m.push('<p>Avant votre première facture, confirmez avec l’administration fiscale ou un comptable comment vous inscrire et émettre vos factures.</p>');
      return m; } };
    TOPIC.team = { label: L('Employés'), msgs: () => {
      const r = R(), items = D.employer.items.map(i => `${esc(i.label)} ${pct(i.rate)}`);
      const m = [`<p>Un employé coûte plus que son salaire. En plus du salaire brut, l’employeur ajoute : ${items.join(', ')}. Des cotisations sont aussi retenues sur le salaire de l’employé, et vous payez le tout aux autorités.</p>`];
      m.push(r && r.c.emp > 0 ? `<p>Dans votre plan, les cotisations de l’employeur représentent environ <b>${J(r.c.er)}</b> par an pour une masse salariale de ${J(r.c.payroll)}.</p>` : '<p>Vous n’avez pas prévu d’employés : cela n’affecte donc pas encore vos chiffres.</p>');
      m.push(`<p>${esc(D.calendar.payrollText)}</p>`);
      return m; } };
    TOPIC.customers = { label: L('Mes premiers clients'), msgs: () => ['<p>Avant de dépenser de l’argent, <b>nommez vos cinq premiers clients</b> : des personnes ou des entreprises réelles qui vous achèteraient.</p>', '<p>Demandez ensuite à chacun un petit engagement : une précommande, un acompte ou une date ferme. Un mot aimable n’est pas un client. De l’argent ou une date claire, oui.</p>', '<p>Si vous ne pouvez pas en nommer cinq, votre premier travail n’est pas l’entreprise : c’est parler à des gens qui pourraient acheter. <a href="#/vision">Les noter dans ma vision</a></p>'] };
    TOPIC.motivation = { label: L('Garder la motivation'), msgs: () => {
      const r = R(), m = ['<p>L’argent n’est qu’un côté du test. L’énergie décide si le plan survit aux premiers mois.</p>'];
      if (r) m.push(`<p>Votre score de motivation est de ${r.c.motivation} sur 15.</p>`);
      m.push(li(['Testez d’abord en petit : vendez à cinq personnes avant de tout quitter.', 'Convenez avec votre foyer d’une réserve et d’une date de bilan, par exemple à trois mois.', 'Écrivez pourquoi vous le faites. Relisez-le les jours difficiles.', 'Décidez dès maintenant quel résultat vous ferait changer de cap.']));
      return m; } };
    TOPIC.funding = { label: L('Prêts et soutien'), msgs: () => {
      const r = R(), m = ['<p>Plusieurs institutions travaillent avec les petites entreprises en ' + esc(D.name) + '. Je ne peux pas vous dire pour quel programme vous êtes éligible. Contactez-les et demandez quels conseils et quels financements sont ouverts en ce moment.</p>'];
      if (r) m.push(`<p>Avant d’emprunter : votre plan laisse environ <b>${J(r.c.netMonthly)}</b> par mois après impôts. La mensualité d’un prêt doit tenir dans ce montant, pas au-dessus.</p>`);
      m.push(`<p>${D.authorities.support.map(s => s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>` : esc(s.name)).join('<br>')}</p>`);
      return m; } };
  }
  const ORDER_ALL = ['cost', 'breakeven', 'tax', 'customers', 'savings', 'cash', 'vat', 'team', 'motivation', 'funding'];
  const orderList = () => ORDER_ALL.filter(id => id !== 'vat' || D.vat);
  const KEYWORDS = [['cost', /co[uû]t|prix|marge|facturer|combien (dois|je)/], ['breakeven', /rentabilit|seuil|combien (dois|faut).*vendre/], ['cash', /retard|facture|impay|fonds de roulement|cr[eé]dit/], ['savings', /[eé]conomie|r[eé]serve|matelas/], ['tax', /imp[oô]t|dgi|nif|cotisation|ona|ofatma|patente/], ['vat', /tca|tva|taxe sur/], ['team', /employ|personnel|embauch|salari|paie/], ['customers', /client|march[eé]|acheteur|vendre [aà]/], ['motivation', /motiv|peur|stress|doute|abandon/], ['funding', /pr[eê]t|financ|banque|soutien|subvention/]];

  const chips = (ids, soft) => `<div class="chips">${ids.map(id => `<button class="chip${soft ? ' soft' : ''}" data-act="ask" data-topic="${id}">${esc(TOPIC[id].label())}</button>`).join('')}</div>`;
  function moreChips(current) {
    const r = report(), pri = r ? r.recs.map(x => x[0]) : [], pool = pri.concat(orderList());
    const ids = []; pool.forEach(id => { if (id !== current && !visited[id] && !ids.includes(id)) ids.push(id); });
    return ids.length ? `<p class="muted small" style="margin:6px 0 2px">Et maintenant ?</p>${chips(ids.slice(0, 3), true)}${r ? '<a class="chip soft" href="#/report">Mon rapport</a>' : ''}` : '';
  }
  function toolCost() {
    const s = sym();
    return `<div class="bubble coach tool tool-cost"><p><b>Coût d’un produit ou d’un travail</b></p><div class="grid2">
      <div class="field"><label for="t-mat">Matières ou marchandises <span class="unit">(${s})</span></label><input id="t-mat" type="number" inputmode="numeric" min="0" placeholder="0"></div>
      <div class="field"><label for="t-oth">Emballage, transport, commissions <span class="unit">(${s})</span></label><input id="t-oth" type="number" inputmode="numeric" min="0" placeholder="0"></div>
      <div class="field"><label for="t-hrs">Heures de votre temps</label><input id="t-hrs" type="number" inputmode="decimal" min="0" step="0.25" placeholder="0"></div>
      <div class="field"><label for="t-rate">Votre temps, par heure <span class="unit">(${s})</span></label><input id="t-rate" type="number" inputmode="numeric" min="0" placeholder="0"><small>Ce que vous voudriez gagner par heure.</small></div></div>
      <div class="res" id="t-res" aria-live="polite"></div></div>`;
  }
  function costCalc() {
    const g = id => num(($('#' + id) || {}).value), cost = g('t-mat') + g('t-oth') + g('t-hrs') * g('t-rate'), el = $('#t-res');
    if (!el) return;
    if (!(cost > 0)) { el.textContent = ''; return; }
    const price = m => J(cost / (1 - m));
    el.innerHTML = `<p>Votre coût : <b>${J(cost)}</b>.</p><p>La marge est la part du prix de vente qui vous reste après ce coût. Pour garder 30 %, vendez à <b>${price(0.3)}</b> ; pour 40 %, vendez à <b>${price(0.4)}</b> ; pour 50 %, vendez à <b>${price(0.5)}</b>.</p><p class="muted small">Vos charges fixes et vos impôts sortent encore de cette marge.</p>`;
  }
  const chatHTML = () => chat.map(m => m.raw ? m.html : `<div class="bubble ${m.from}">${m.html}</div>`).join('');
  function coachPush(items) {
    chat = chat.concat(items);
    const log = $('#chatlog'); if (log) log.innerHTML = chatHTML();
    const c = $('#composer'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'end', behavior: 'smooth' });
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
    const first = [{ from: 'coach', html: `<p>Bonjour ! Je suis votre guide pour ${esc(D.name)}. Je suis un outil intégré à cette application, pas une personne, et j’explique les choses avec des mots simples. Je ne remplace pas un comptable.</p>` }];
    if (r) { first.push({ from: 'coach', html: '<p>Votre rapport est prêt. Voici les points les plus utiles à travailler d’abord :</p>' }); first.push({ raw: true, html: chips(r.recs.map(x => x[0])) }); }
    else { first.push({ from: 'coach', html: '<p>Faites d’abord <a href="#/test">le test</a> et je pourrai construire des conseils avec vos propres chiffres. En attendant, choisissez un sujet :</p>' }); first.push({ raw: true, html: chips(orderList().slice(0, 6)) }); }
    return first;
  }
  function coach(arg) {
    if (!chat.length) chat = coachIntro();
    const pending = TOPIC[arg] && !visited[arg] ? arg : null;
    return `<div class="coachhead"><div class="avatar"><svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="30" width="10" height="14" rx="3" fill="#8FC9D4"></rect><rect x="19" y="19" width="10" height="25" rx="3" fill="#fff"></rect><rect x="34" y="6" width="10" height="38" rx="3" fill="#E8A33D"></rect></svg></div><div><h2 style="font-size:20px">Votre coach</h2><div class="muted small">Gratuit · Guidé par vos chiffres</div></div></div>
      <div class="chat" id="chatlog" data-pending="${pending || ''}">${chatHTML()}</div>
      <form class="composer" id="composer" autocomplete="off"><input type="text" id="ask" aria-label="Écrivez à votre coach" placeholder="Posez une question sur les prix, les impôts, les clients..."><button type="submit" aria-label="Envoyer"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#12262B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5"></path></svg></button></form>`;
  }

  function renderCountryMenu() {
    $('#cname').firstChild.nodeValue = D.name + ' ';
    const list = COUNTRIES.countries.map(c => `<button class="copt" data-country="${c.id}" ${c.id === D.country ? 'aria-current="true"' : ''}>${esc(c.name)}${c.preview ? ' (aperçu)' : ''}${c.id === D.country ? ' ✓' : ''}</button>`).join('');
    const soon = (COUNTRIES.comingSoon || []).length ? `<p class="muted small" style="margin:10px 0 0">Bientôt : ${esc(COUNTRIES.comingSoon.join(', '))}. Chaque pays a ses propres impôts et règles.</p>` : '';
    const ext = (COUNTRIES.external || []).map(c => `<button class="copt" data-url="${esc(c.url)}" data-key="${esc(c.key)}" data-id="${esc(c.id)}">${esc(c.name)} <span class="muted small">&nbsp;${c.lang === 'nl' ? 'in het Nederlands' : c.lang === 'es' ? 'en español' : 'in English'} →</span></button>`).join('');
    $('#cpop').innerHTML = list + ext + soon;
  }
  function useCountry(entry) {
    return fetch(entry.file).then(r => { if (!r.ok) throw new Error('data'); return r.json(); }).then(d => {
      D = d; KEY = keyFor(D.country); S = load(); chat = []; visited = {}; errMsg = '';
      if (!D.legalStatuses.some(x => x.id === S.input.status)) S.input.status = D.legalStatuses[0].id;
      try { localStorage.setItem('papa-fr-country', D.country); } catch (e) { /* ignorer */ }
      renderCountryMenu();
      document.title = 'Pa a Pa Caraïbe : testez votre idée d’entreprise · ' + D.name;
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
        if (el) el.textContent = n + ' sur ' + all.length + ' faites';
      }
    });
    view.addEventListener('submit', e => {
      if (e.target.id !== 'composer') return;
      e.preventDefault();
      const inp = $('#ask'), q = inp.value.trim(); if (!q) return;
      inp.value = '';
      const hit = KEYWORDS.find(k => k[1].test(q.toLowerCase()));
      if (hit) coachAsk(hit[0], q);
      else coachPush([{ from: 'me', html: esc(q) }, { from: 'coach', html: '<p>Je peux expliquer les sujets ci-dessous. Choisissez-en un ou reformulez votre question avec un mot comme prix, impôt, clients ou économies.</p>' }, { raw: true, html: chips(orderList().slice(0, 6), true) }]);
    });
    view.addEventListener('click', e => {
      const sh = e.target.closest('[data-share]'); if (sh) track('caribbean-share-' + sh.dataset.share);
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'ask') coachAsk(b.dataset.topic);
      else if (act === 'back') { S.step = Math.max(0, S.step - 1); errMsg = ''; save(); rerender(); window.scrollTo(0, 0); }
      else if (act === 'next') { errMsg = validate(S.step); if (!errMsg) { if (S.step === 0) track('caribbean-test-started-' + D.country.toLowerCase()); S.step += 1; save(); } rerender(); window.scrollTo(0, 0); }
      else if (act === 'finish') { errMsg = validate(3); if (errMsg) { rerender(); window.scrollTo(0, 0); return; } S.ready = true; S.step = 0; chat = []; visited = {}; save(); track('caribbean-report-done-' + D.country.toLowerCase()); location.hash = '#/report'; }
      else if (act === 'copylink') {
        const done = ok => { const el = $('#copiedlink'); if (el) el.textContent = ok ? 'Lien copié.' : b.dataset.url; track('caribbean-share-copy'); };
        try { navigator.clipboard.writeText(b.dataset.url).then(() => done(true), () => done(false)); } catch (err) { done(false); }
      }
      else if (act === 'copy') {
        const txt = visionText(), done = ok => { const el = $('#copied'); if (el) el.textContent = ok ? 'Copié.' : 'Sélectionnez le texte ci-dessus et copiez-le.'; };
        try { navigator.clipboard.writeText(txt).then(() => done(true), () => done(false)); } catch (err) { done(false); }
      }
    });
    $('#cpop').addEventListener('click', e => {
      const x = e.target.closest('[data-url]');
      if (x) { try { localStorage.setItem(x.dataset.key, x.dataset.id); } catch (err) { /* ignorer */ } location.href = x.dataset.url; return; }
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
    e.textContent = 'Impossible de charger le fichier de données. Ouvrez cette page depuis son adresse web (GitHub Pages), et non en double-cliquant sur le fichier.';
  }

  fetch('countries.json').then(r => { if (!r.ok) throw new Error('data'); return r.json(); }).then(list => {
    COUNTRIES = list;
    let id = list.countries[0].id;
    try { id = localStorage.getItem('papa-fr-country') || id; } catch (e) { /* ignorer */ }
    try { const q = new URLSearchParams(location.search).get('c'); if (q) id = q.toUpperCase(); } catch (e) { /* ignore */ }
    const entry = list.countries.find(c => c.id === id) || list.countries[0];
    return useCountry(entry);
  }).then(() => { defTopics(); bindEvents(); route(); }).catch(showErr);
})();
