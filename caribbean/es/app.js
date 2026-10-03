/* Pa a Pa Caribe: interfaz en español. Usa ../engine.js, report-es.js y un archivo de datos por país. */
(function () {
  'use strict';
  const E = window.PaPaEngine;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = E.num, pct = E.pct;
  const track = n => { try { if (window.track) window.track(n); } catch (e) { /* ignorar */ } };
  let D = null, COUNTRIES = null, chat = [], visited = {}, errMsg = '', S = null, KEY = '';
  const J = n => E.money(D, n);
  const TAGS = { 'to confirm': 'por confirmar' };

  const defaults = () => ({
    input: { status: 'business_name', activity: '', payMode: '', creditShare: '50', cdays: '30', sdays: '0', sales: '', direct: '', fixed: '', needs: '', emp: '0', pay: '', startup: '', savings: '', m1: 0, m2: 0, m3: 0 },
    step: 0, vision: {}, done: {}, ready: false
  });
  const keyFor = id => 'papa-es-' + id.toLowerCase() + '-v1';
  function load() {
    try {
      const o = JSON.parse(localStorage.getItem(KEY));
      if (o && o.input) { const d = defaults(); return Object.assign(d, o, { input: Object.assign(d.input, o.input) }); }
    } catch (e) { /* ignorar */ }
    return defaults();
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignorar */ } };
  const report = () => (S.ready ? E.buildReportEs(D, S.input) : null);
  const stat = () => E.statusOf(D, S.input.status);

  const li = a => '<ul>' + a.map(x => `<li>${x}</li>`).join('') + '</ul>';
  const fieldNum = (k, label, unit, hint, ph) =>
    `<div class="field"><label for="f-${k}">${label} <span class="unit">${unit}</span></label>` +
    `<input id="f-${k}" data-k="${k}" type="number" inputmode="numeric" min="0" step="1" placeholder="${ph || ''}" value="${esc(S.input[k])}">` +
    (hint ? `<small>${hint}</small>` : '') + '</div>';
  const why = (title, body) => `<div class="why"><b class="k">${title}</b>${body}</div>`;
  const sym = () => D.currency.symbol;
  const ex = k => (D.examples && D.examples[k] != null ? 'p. ej. ' + D.examples[k] : '');
  const previewBox = () => '';
  const planNote = () => `<div class="note" style="margin:0 0 14px">Usa esto como tu <b>estimación para planificar</b>. Al registrarte, ${esc(D.authorities.tax.name)} te da los montos exactos para tu caso.</div>`;
  function bracketsText(br) {
    return br.map((b, i) => {
      const prev = i ? br[i - 1].upToChargeable : 0;
      return b.upToChargeable != null ? `${pct(b.rate)} ${i ? 'desde ' + J(prev) + ' ' : ''}hasta ${J(b.upToChargeable)}` : (i ? `${pct(b.rate)} por encima de ${J(prev)}` : `${pct(b.rate)} tasa única`);
    }).join(', ');
  }
  function footer() {
    const a = D.authorities;
    const link = x => (x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)}</a>` : esc(x.name));
    const src = (D.sources || []).map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('');
    return `<div class="share"><b>Comparte esta app</b> <a class="chip soft" data-share="whatsapp" href="https://wa.me/?text=Herramienta%20gratuita%20para%20probar%20una%20idea%20de%20negocio%20en%20el%20Caribe%3A%20impuestos%2C%20lo%20que%20te%20queda%20y%20un%20plan.%20Sin%20registro.%20https%3A//heso73.github.io/pa-a-pa/caribbean/es/" target="_blank" rel="noopener">WhatsApp</a> <a class="chip soft" data-share="facebook" href="https://www.facebook.com/sharer/sharer.php?u=https%3A//heso73.github.io/pa-a-pa/caribbean/es/" target="_blank" rel="noopener">Facebook</a> <button class="chip soft" data-act="copylink" data-url="https://heso73.github.io/pa-a-pa/caribbean/es/">Copiar enlace</button> <span id="copiedlink" class="small muted" role="status"></span></div><p class="small"><a href="../partners/">Para organizaciones: kit para aliados</a></p>` + `<footer class="fine"><p>Estas cifras son estimaciones para ayudarte a decidir. No son asesoría fiscal ni legal. Datos de ${esc(D.name)} verificados por última vez el ${esc(D.dataVerifiedOn)}. Confirma siempre con ${link(a.tax)} y con ${link(a.registry)}.</p>` +
      `<details class="more"><summary>Conviene preguntar a la DGII</summary>${li(D.toVerify.map(esc))}</details>` +
      (src ? `<details class="more"><summary>Fuentes</summary><ul>${src}</ul></details>` : '') +
      `<p>Pa a Pa es publicado por Caribbean Metadata. <a href="../">English version</a> · <a href="../../app/">Version française</a></p></footer>`;
  }

  function home() {
    const done = S.ready ? `<a class="path" href="#/report" style="margin-bottom:12px"><div class="n" style="background:var(--sun);color:var(--ink)">✓</div><div><div class="t">Tu informe está listo</div><div class="d">Ábrelo de nuevo o cambia tus cifras en la prueba.</div></div></a>` : '';
    return `<section class="hero"><h1>Tu proyecto de negocio, paso a paso.</h1>
      <p class="lead">Gratis y sin registro. Cada pregunta y cada cifra se explican con palabras sencillas. Mostrando impuestos y reglas de <b>${esc(D.name)}</b>.</p></section>
      ${previewBox()}${done}
      <nav class="paths" aria-label="Elige un camino">
        <a class="path primary" href="#/test"><div class="n">1</div><div><div class="t">Prueba tu proyecto</div><div class="d">¿Se sostiene? Tu respuesta en unos minutos.</div></div></a>
        <a class="path" href="#/vision"><div class="n">2</div><div><div class="t">Construye tu visión</div><div class="d">Aclara tus ideas: para quién, qué y cómo.</div></div></a>
        <a class="path" href="#/next"><div class="n" style="background:var(--ink)">3</div><div><div class="t">Avanza hacia el éxito</div><div class="d">Tus próximos pasos, con un coach que te guía.</div></div></a>
      </nav>
      <p class="tagline">Probar · Lanzar · Durar</p>${footer()}`;
  }

  const STEP_NAMES = ['Tu proyecto', 'Tu dinero', 'Tu equipo y el arranque', 'Tu motivación'];
  function stepProject() {
    const st = D.legalStatuses.map(s => `<label class="opt"><input type="radio" name="status" data-k="status" value="${s.id}" ${S.input.status === s.id ? 'checked' : ''}><span class="t">${esc(s.label)}</span><small>${esc(s.plain)}</small></label>`).join('');
    const modes = [['now', 'Al momento', 'Efectivo, tarjeta o transferencia en el acto.'], ['later', 'Más tarde, con factura', 'Los clientes pagan días o semanas después.'], ['both', 'Un poco de cada', 'Unos clientes pagan al momento y otros después.']];
    const pm = modes.map(m => `<label class="opt"><input type="radio" name="payMode" data-k="payMode" value="${m[0]}" ${S.input.payMode === m[0] ? 'checked' : ''}><span class="t">${m[1]}</span><small>${m[2]}</small></label>`).join('');
    const pmode = S.input.payMode;
    const extra = pmode === 'later' || pmode === 'both' ? `<div class="grid2">${pmode === 'both' ? fieldNum('creditShare', 'Parte de las ventas pagada después', '(%)', '', '50') : ''}${fieldNum('cdays', 'Días que tardan los clientes en pagar', '(días)', '', '30')}${fieldNum('sdays', 'Días que te dan tus proveedores para pagar', '(días)', 'Escribe 0 si pagas a tus proveedores de inmediato.', '0')}</div>` : '';
    return `<h2 class="q">¿Cómo vas a operar?</h2><div class="opts">${st}</div>
      <h2 class="q">¿Cómo te pagarán tus clientes?</h2><div class="opts">${pm}</div>${extra}
      ${why('¿Por qué estas preguntas?', '<p>Tu forma legal decide qué impuestos y aportes pagas. Si dudas, empieza como persona física: suele ser lo más sencillo.</p><p>Si los clientes pagan después, tú adelantas el dinero mientras tanto. Ese dinero se llama <b>capital de trabajo</b>. Solo lo calculamos cuando te aplica.</p>')}`;
  }
  function stepMoney() {
    const u = `(${sym()} al mes)`;
    return `<h2 class="q">Tu dinero, mes a mes</h2><p class="muted">Todos los montos en ${esc(D.currency.code)} (${esc(sym())}), por mes.</p>
      ${fieldNum('sales', 'Ventas esperadas', u, 'Lo que los clientes te pagarán en un mes normal.', ex('sales'))}
      ${fieldNum('direct', 'Costo de lo que vendes', u, 'Mercancía, materiales, empaques: lo que gastas para producir o comprar lo que vendes. Escribe 0 si no hay.', ex('direct'))}
      ${fieldNum('fixed', 'Gastos fijos', u, 'Gastos que no cambian con las ventas: alquiler, transporte, teléfono, seguros, publicidad. Escribe 0 si no hay.', ex('fixed'))}
      ${fieldNum('needs', 'Lo que necesitas para vivir', u, 'Tu hogar tiene que comer. Sé honesto: esto cuenta como un costo del proyecto.', ex('needs'))}
      ${why('¿Por qué estas preguntas?', '<p>Comparamos lo que entra con lo que sale y luego restamos impuestos y aportes. Lo que queda debe cubrir lo que necesitas para vivir, o el plan no puede funcionar.</p>')}`;
  }
  function stepTeam() {
    return `<h2 class="q">Tu equipo y tu arranque</h2>
      <div class="grid2">${fieldNum('emp', 'Empleados', '(número)', 'Sin contarte a ti. Escribe 0 si no hay.', '0')}${fieldNum('pay', 'Sueldo bruto por empleado', `(${sym()} al mes)`, 'Antes de descuentos.', ex('pay'))}</div>
      <div class="grid2">${fieldNum('startup', 'Costos de arranque', `(${sym()}, una sola vez)`, 'Equipos, mercancía, registro, página web. Escribe 0 si no hay.', ex('startup'))}${fieldNum('savings', 'Ahorros que puedes usar', `(${sym()})`, 'Dinero que puedes poner sin pedir prestado.', ex('savings'))}</div>
      ${why('¿Por qué estas preguntas?', '<p>Los empleados añaden pagos mensuales al Estado además de su sueldo. Los costos de arranque y los ahorros muestran si puedes empezar sin endeudarte y cuánto tiempo puedes resistir si las ventas arrancan lento.</p>')}`;
  }
  function stepMotivation() {
    const items = [['m1', 'Puedo vivir con ingresos irregulares durante seis meses.'], ['m2', 'Estoy listo para trabajar seis días a la semana durante el primer año.'], ['m3', 'Sé quiénes serán mis primeros cinco clientes.']];
    const html = items.map(it => `<fieldset class="statement" style="border:0;padding:0;margin:0 0 18px"><legend style="font-weight:600;margin-bottom:8px;padding:0">${it[1]}</legend><div class="scale">${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="${it[0]}" data-k="${it[0]}" value="${n}" ${+S.input[it[0]] === n ? 'checked' : ''}>${n}</label>`).join('')}</div><div class="scalelegend"><span>Nada</span><span>Totalmente</span></div></fieldset>`).join('');
    return `<h2 class="q">¿Qué tan listo estás?</h2><p class="muted">Califica cada frase de 1 (nada) a 5 (totalmente).</p>${html}
      ${why('¿Por qué estas preguntas?', '<p>El dinero es solo un lado. Tu energía y tus primeros clientes deciden si el plan sobrevive los primeros meses.</p>')}`;
  }
  function validate(step) {
    const i = S.input;
    if (step === 0) { if (!i.status) return 'Elige cómo vas a operar.'; if (!i.payMode) return 'Elige cómo te pagarán tus clientes.'; if (i.payMode === 'both' && !(num(i.creditShare) > 0)) return 'Escribe la parte de las ventas que se paga después.'; }
    if (step === 1) { if (!(num(i.sales) > 0)) return 'Escribe tus ventas esperadas por mes.'; if (!(num(i.needs) > 0)) return 'Escribe lo que necesitas para vivir cada mes.'; }
    if (step === 3) { if (!(+i.m1 && +i.m2 && +i.m3)) return 'Califica las tres frases para continuar.'; }
    return '';
  }
  function test() {
    const s = Math.min(Math.max(+S.step || 0, 0), 3);
    const bars = [0, 1, 2, 3].map(n => `<i class="${n <= s ? 'on' : ''}"></i>`).join('');
    const body = [stepProject, stepMoney, stepTeam, stepMotivation][s]();
    const last = s === 3;
    return `<div class="backrow"><a class="iconbtn" href="#/" aria-label="Volver al inicio"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 3L5 9l6 6"></path></svg></a><b style="color:var(--deep);font-size:14px">Prueba tu proyecto · ${esc(D.name)}</b></div>
      <div class="progress" aria-hidden="true">${bars}</div><div class="crumb">Parte ${s + 1} de 4 · ${STEP_NAMES[s]}</div>${s === 0 ? previewBox() : ''}
      ${errMsg ? `<p class="error" role="alert">${esc(errMsg)}</p>` : ''}${body}
      <div class="btnrow"><button class="btn" data-act="${last ? 'finish' : 'next'}">${last ? 'Ver mi informe' : 'Continuar'}</button>${s > 0 ? '<button class="btn link" data-act="back">Atrás</button>' : ''}</div>${footer()}`;
  }

  const VERDICT = {
    ok: ['Viable', 'Tu plan cubre lo que necesitas para vivir, tus ahorros pueden sostener el arranque y te sientes listo. Sigue revisando tus cifras cuando empieces.'],
    cond: ['Viable, con condiciones', 'Tu proyecto puede funcionar si resuelves los puntos de abajo antes de empezar.'],
    no: ['Todavía no es viable', 'Así como está, este plan no puede pagar tus gastos. La buena noticia: lo descubriste antes de gastar dinero. Trabaja los puntos de abajo y vuelve a probar.']
  };
  function glossary(c) {
    const items = [['Costo de lo que vendes', 'Lo que gastas en mercancía y materiales para lo que vendes.'], ['Gastos fijos', 'Gastos que pagas incluso en un mes lento: alquiler, teléfono, seguros.']];
    if (c.model === 'corporate') {
      if (D.corporateTax) items.push([D.corporateTax.label, 'Impuesto sobre la ganancia de la sociedad. ' + bracketsText(D.corporateTax.brackets) + '.']);
    } else {
      D.selfEmployed.contributions.forEach(ct => items.push([ct.label, ct.plain]));
      if (D.incomeTax) items.push([D.incomeTax.label, 'Impuesto sobre tu ganancia después de la parte exenta (' + D.incomeTax.allowanceNote + '). Tasas: ' + (D.incomeTax.bracketText || bracketsText(D.incomeTax.brackets)) + '.']);
    }
    if (D.vat) items.push([D.vat.short, D.vat.label + '. Es el impuesto que cobras a tus clientes sobre las ventas gravadas y luego entregas al Estado.']);
    return `<details class="more"><summary>¿Qué significan estas palabras?</summary><dl>${items.map(x => `<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join('')}</dl></details>`;
  }
  function reportView() {
    const R = report();
    if (!R) return `<h1>Tu informe</h1><p class="lead">Haz primero la prueba. Toma unos minutos y el informe se construye con tus respuestas.</p><a class="btn" href="#/test">Probar mi proyecto</a>${footer()}`;
    const c = R.c;
    const rows = [['Ventas', J(c.annualSales)], ['Costo de lo que vendes y gastos fijos', '-' + J((c.direct + c.fixed) * 12)]];
    if (c.emp) { rows.push(['Sueldos de empleados', '-' + J(c.payroll)]); rows.push(['Aportes del empleador', '-' + J(c.er)]); }
    rows.push(['<b>Ganancia antes de impuestos</b>', J(c.profit)]);
    c.lines.forEach(l => rows.push([esc(l.label), '-' + J(l.amount)]));
    const table = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('') + `<tr class="sum"><td>Te queda al año</td><td>${J(c.net)}</td></tr><tr><td>Te queda al mes</td><td><b>${J(c.netMonthly)}</b></td></tr><tr><td>Necesitas al mes</td><td>${J(c.needs)}</td></tr>`;
    const notes = [];
    if (R.be) notes.push(`<div class="note"><b>Punto de equilibrio:</b> necesitas unos ${J(R.be)} de ventas al mes para cubrir tus costos, tus impuestos y lo que necesitas para vivir.</div>`);
    notes.push(`<div class="note${c.left < 0 ? ' alert' : ''}"><b>Arranque:</b> ${c.left < 0 ? `tus ahorros quedan ${J(-c.left)} por debajo de los costos de arranque.` : `después de los costos de arranque te quedan ${J(c.left)}, unos ${c.runway.toFixed(1)} meses de gastos de vida si no entrara ningún ingreso.`}</div>`);
    if (c.credit) notes.push(`<div class="note${c.bfr > Math.max(0, c.left) ? ' alert' : ''}"><b>Capital de trabajo:</b> esperar el pago de los clientes inmoviliza unos ${J(c.bfr)} de tu propio dinero.</div>`);
    notes.push(`<div class="note"><b>Motivación ${c.motivation} de 15:</b> ${c.motivation >= 12 ? 'Fuerte. Ten tus razones por escrito para los meses difíciles.' : c.motivation >= 8 ? 'Una buena base. Trabaja la frase que calificaste más bajo antes de empezar.' : 'Tómate tiempo para prepararte: prueba tu idea a medio tiempo y consigue primero a tus clientes.'}</div>`);
    (D.notes || []).forEach(n => notes.push(`<div class="note alert">${esc(n)}</div>`));
    const sw = (title, color, items) => `<section class="card swot"><h3><span class="dot" style="background:${color}"></span>${title}</h3>${li(items.map(esc))}</section>`;
    const recs = R.recs.map(r => `<li><div>${esc(r[1])}<br><a href="#/coach/${r[0]}">Pregunta al coach: ${esc(TOPIC[r[0]].label())}</a></div></li>`).join('');
    return `<h1>Informe de viabilidad</h1><div class="muted small" style="margin:4px 0 8px">${esc(D.name)} · ${esc(stat().label)}</div>
      <div class="verdict ${R.verdict}"><div class="k">Veredicto</div><div class="v">${VERDICT[R.verdict][0]}</div><p>${VERDICT[R.verdict][1]}</p></div>${planNote()}
      <section class="card"><h3 style="margin-bottom:10px">Cómo suma tu año</h3><table class="sum">${table}</table>${notes.join('')}${glossary(c)}</section>
      ${sw('Fortalezas', '#1F7A8C', R.strengths)}${sw('Debilidades', '#E8A33D', R.weaknesses)}${sw('Oportunidades', '#0B3C49', R.opportunities)}${sw('Riesgos', '#C2491D', R.risks)}
      <section class="card"><h3 style="margin-bottom:12px">Qué hacer primero</h3><ol class="recs">${recs}</ol></section>
      <div class="btnrow" style="margin-top:18px"><a class="btn" href="#/coach">Hablar con mi coach</a><a class="btn link" href="#/test">Cambiar mis cifras</a></div>${footer()}`;
  }

  const VISION = [
    ['who', '¿Quiénes son tus clientes?', 'Describe a una persona real o un tipo de negocio: dónde vive, a qué se dedica todo el día.'],
    ['problem', '¿Qué problema les resuelves?', '¿Con qué batallan hoy, o qué pagan demasiado caro?'],
    ['offer', '¿Qué vas a vender exactamente y a qué precio?', 'Una frase para el producto o servicio y luego un precio que podrías decir en voz alta.'],
    ['why', '¿Por qué te elegirían a ti?', 'Precio, calidad, rapidez, confianza, ubicación. Elige una o dos y sé honesto.'],
    ['reach', '¿Cómo se enterarán tus primeros cinco clientes de que existes?', 'Nombra lugares o personas reales: un grupo de WhatsApp, un mercado, una iglesia, una escuela, un amigo que conoce a un comprador.'],
    ['stop', '¿Qué te haría parar o cambiar de plan?', 'Decide ahora, con calma, qué resultado a los tres meses te haría ajustar.']
  ];
  function visionView() {
    const f = VISION.map(v => `<div class="field"><label for="v-${v[0]}">${v[1]}</label><textarea id="v-${v[0]}" data-v="${v[0]}">${esc(S.vision[v[0]] || '')}</textarea><small>${v[2]}</small></div>`).join('');
    return `<h1>Construye tu visión</h1><p class="lead">Seis preguntas para aclarar tu idea. Tus respuestas se quedan en este dispositivo y se guardan mientras escribes.</p>
      <section class="card" style="margin-top:14px">${f}</section>
      <section class="card"><h3 style="margin-bottom:8px">Tu visión en una página</h3><div id="vsum" style="white-space:pre-wrap;font-size:15px"></div>
      <div class="btnrow"><button class="btn secondary" data-act="copy">Copiar mi visión</button><span id="copied" class="small muted" role="status"></span></div></section>${footer()}`;
  }
  function visionText() {
    const parts = VISION.filter(v => (S.vision[v[0]] || '').trim()).map(v => `${v[1]}\n${S.vision[v[0]].trim()}`);
    return parts.length ? parts.join('\n\n') : 'Responde las preguntas de arriba y tu visión aparecerá aquí.';
  }
  const updateVision = () => { const el = $('#vsum'); if (el) el.textContent = visionText(); };

  function nextQuarter() {
    const n = new Date(), t = new Date(n.getFullYear(), n.getMonth(), n.getDate()), y = n.getFullYear();
    const q = D.calendar.quarterly;
    const cand = q.map(x => new Date(y, x.m - 1, x.d)).concat([new Date(y + 1, q[0].m - 1, q[0].d)]);
    return cand.find(d => d >= t).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function feeText(st) {
    const parts = [];
    if (st.feeLines && st.feeLines.length) parts.push('Presupuesto de registro: ' + st.feeLines.map(f => `${f.label.toLowerCase()} ${J(f.amount)}`).join(', ') + '.');
    if (st.feeNote) parts.push(st.feeNote);
    return parts.join(' ');
  }
  function nextView() {
    const R = report(), c = R ? R.c : E.compute(D, S.input), st = stat(), cal = D.calendar;
    const steps = D.launchSteps.filter(s => s.appliesTo.includes(st.id) && (s.when !== 'employees' || c.emp > 0) && (s.when !== 'vat' || c.vat));
    const done = steps.filter(s => S.done[s.id]).length;
    const list = steps.map(s => `<li><label><input type="checkbox" data-done="${s.id}" ${S.done[s.id] ? 'checked' : ''}><span><span class="t">${esc(s.label)}</span><small>${esc(s.plain)}${s.url ? ` <a href="${esc(s.url)}" target="_blank" rel="noopener">Sitio oficial</a>` : ''}</small></span></label></li>`).join('');
    const rows = [];
    if (cal.quarterly && cal.quarterly.length) rows.push(['Próximo: ' + nextQuarter(), (st.taxModel === 'corporate' ? cal.quarterlyTextCorporate : cal.quarterlyTextPersonal) + ' Fechas cada año: ' + cal.quarterlyList + '.']);
    if (cal.monthlyText) rows.push([cal.monthlyLabel || 'Cada mes', cal.monthlyText]);
    rows.push([cal.annualLabel, st.taxModel === 'corporate' ? cal.annualTextCorporate || cal.annualTextPersonal : cal.annualTextPersonal]);
    if (c.emp > 0) rows.push([cal.payrollLabel || 'Cada mes', cal.payrollText]);
    if (c.vat && cal.vatText) rows.push([D.vat.short, cal.vatText]);
    return `<h1>Avanza hacia el éxito</h1><p class="lead">Tus próximos pasos en <b>${esc(D.name)}</b> como <b>${esc(st.label.toLowerCase())}</b>.${S.ready ? '' : ' <a href="#/test">Haz la prueba</a> para adaptar esta lista a tu proyecto.'}</p>
      <section class="card" style="margin-top:14px"><h3 style="margin-bottom:4px">Pasos para lanzar</h3><p class="muted small" id="donecount">${done} de ${steps.length} hechos</p><ul class="checklist">${list}</ul><p class="muted small" style="margin:12px 0 0">${esc(feeText(st))}</p></section>
      <section class="card"><h3 style="margin-bottom:10px">Tu calendario de impuestos</h3><ul class="cal">${rows.map(x => `<li><b>${esc(x[0])}</b><span>${esc(x[1])}</span></li>`).join('')}</ul>${R && st.taxModel !== 'corporate' ? `<div class="note alert"><b>Aparta ${J(c.setAside)} al mes</b> en una cuenta aparte para tener los pagos listos cuando toquen.</div>` : ''}</section>
      <section class="card"><h3 style="margin-bottom:8px">Ayuda para pequeños negocios</h3><p>${D.authorities.support.map(s => s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>` : esc(s.name)).join('<br>')}</p><p class="muted small" style="margin:0">Pregunta qué asesoría y qué financiamiento están abiertos ahora.</p></section>
      <div class="btnrow" style="margin-top:18px"><a class="btn" href="#/coach">Preguntar a mi coach</a></div>${footer()}`;
  }

  const TOPIC = {};
  function defTopics() {
    const R = () => report();
    const L = k => () => k;
    TOPIC.cost = { label: L('Costo y precio de venta'), tool: 'cost', msgs: () => {
      const r = R(), m = ['<p>Tu <b>costo</b> es lo que te cuesta un producto o un trabajo antes de venderlo: materiales, empaque, transporte y tu propio tiempo.</p>'];
      m.push(`<p>Si vendes por debajo de ese costo, pierdes dinero en cada venta, aunque el cliente quede contento.${r && r.c.sales > 0 ? ` En tu plan, la mercancía y los materiales se llevan el ${pct(Math.min(1, r.c.direct / r.c.sales))} de tus ventas.` : ''} Vamos a calcularlo para un producto o un trabajo.</p>`);
      return m; } };
    TOPIC.breakeven = { label: L('Punto de equilibrio'), msgs: () => {
      const r = R();
      if (!r) return ['<p>El <b>punto de equilibrio</b> son las ventas mensuales que cubren tus costos, tus impuestos y lo que necesitas para vivir. <a href="#/test">Haz la prueba</a> para ver el tuyo.</p>'];
      const m = [];
      if (!r.be) m.push('<p>Ahora mismo lo que compras cuesta tanto como lo que vendes, así que ninguna cantidad de ventas llega al equilibrio. Empieza por tus precios.</p>');
      else m.push(`<p>Para pagar tus costos, tus impuestos y lo que necesitas para vivir, necesitas unos <b>${J(r.be)}</b> de ventas al mes. Tu plan tiene ${J(r.c.sales)}.${r.be > r.c.sales * 1.02 ? ` Son ${J(r.be - r.c.sales)} más de lo planeado.` : ' Estás por encima.'}</p>`);
      m.push('<p>Tienes tres palancas: subir un precio, bajar un costo o planear más ventas. Cambia una a la vez y repite la prueba. <a href="#/test">Editar mis cifras</a></p>');
      return m; } };
    TOPIC.cash = { label: L('Clientes que pagan tarde'), msgs: () => {
      const r = R(), m = ['<p>Cuando un cliente paga a 30 días, tú ya pagaste materiales, sueldos y alquiler. El dinero que adelantas mientras tanto es tu <b>capital de trabajo</b>.</p>'];
      if (r) m.push(r.c.credit ? `<p>En tu plan, esperar el pago inmoviliza unos <b>${J(r.c.bfr)}</b>.</p>` : '<p>En tu plan los clientes pagan al momento, así que esto no te afecta.</p>');
      m.push(li(['Pide un anticipo antes de empezar.', 'Factura el mismo día, con una fecha de vencimiento clara.', 'Ofrece plazos más cortos, por ejemplo 14 días.', 'Pide más tiempo de pago a tus proveedores.', 'Pausa el trabajo para clientes que ya están atrasados.']));
      return m; } };
    TOPIC.savings = { label: L('Mi colchón de seguridad'), msgs: () => {
      const r = R(), m = [];
      if (r) m.push(r.c.left < 0 ? `<p>Tus ahorros quedan <b>${J(-r.c.left)}</b> por debajo de los costos de arranque.</p>` : `<p>Después de los costos de arranque te quedan <b>${J(r.c.left)}</b>, unos <b>${r.c.runway.toFixed(1)} meses</b> de gastos de vida si no entrara ningún ingreso.</p>`);
      else m.push('<p>Tu <b>colchón de seguridad</b> es lo que te queda después de los costos de arranque, dividido entre lo que necesitas para vivir cada mes. <a href="#/test">Haz la prueba</a> para ver el tuyo.</p>');
      m.push('<p>Una regla común es tener de tres a seis meses de gastos de vida antes de depender del negocio. Para llegar: empieza a medio tiempo, baja los costos de arranque (compra usado, alquila en vez de comprar) o lanza por fases.</p>');
      return m; } };
    TOPIC.tax = { label: L('Impuestos y aportes'), msgs: () => {
      const r = R(), st = stat(), cal = D.calendar, m = [];
      if (st.taxModel === 'corporate') {
        const ct = D.corporateTax;
        m.push(`<p>Una sociedad paga el <b>${esc(ct.label.toLowerCase())}</b> sobre su ganancia: ${esc(bracketsText(ct.brackets))}.${r ? ` En tu plan: unos <b>${J(r.c.corpTax)}</b> al año.` : ''}${ct.note ? ' ' + esc(ct.note) : ''}</p>`);
        const lv = (D.salesLevies || []).filter(l => !l.appliesTo || l.appliesTo.includes(st.id));
        if (lv.length) m.push(`<p>Además se pagan sobre las ventas (no sobre la ganancia): ${lv.map(l => '<b>' + esc(l.label) + '</b> (' + pct(l.rate) + ')').join(', ')}.</p>`);
        m.push('<p>Lo que retiras para ti (sueldo o dividendos) se grava aparte y no está en estas cifras. Pide a un contador que lo planifique.</p>');
      } else {
        m.push('<p>Como persona física, tu ganancia se grava como ingreso personal. Esto es lo que se paga sobre ella:</p>');
        const it = D.incomeTax, items = it ? [`<b>${esc(it.label)}:</b> ${esc(it.bracketText || bracketsText(it.brackets))}, después de una parte exenta (${esc(it.allowanceNote)}).`] : [];
        D.selfEmployed.contributions.forEach(ct => items.push(`<b>${esc(ct.label)}</b>${ct.rate != null ? ' (' + pct(ct.rate) + ')' : ''}: ${esc(ct.plain)}`));
        m.push(li(items));
        if (r) m.push(`<p>En tu plan esto suma unos <b>${J(r.c.levies)}</b> al año. Aparta <b>${J(r.c.setAside)}</b> cada mes en una cuenta aparte.</p>`);
        m.push(`<p>${esc(cal.annualLabel)}: ${esc(cal.annualTextPersonal.charAt(0).toLowerCase() + cal.annualTextPersonal.slice(1))} <a href="#/next">Ver mi calendario de impuestos</a></p>`);
      }
      (D.notes || []).forEach(n => m.push(`<p class="muted small">${esc(n)}</p>`));
      return m; } };
    TOPIC.vat = { label: () => (D.vat ? D.vat.short : 'Impuesto a las ventas') + ' (impuesto a las ventas)', msgs: () => {
      const r = R(), v = D.vat || {};
      if (!D.vat) return [`<p>${esc(D.name)} no tiene un impuesto general a las ventas. Revisa los otros costos de tu informe: licencias, aportes y cargas de nómina.</p>`];
      const m = [`<p>El <b>${esc(v.short)}</b> es el impuesto a las ventas (${esc(v.label)}). La tasa general es ${pct(v.rate)}. ${esc(v.registerNote)} Después cobras ${esc(v.short)} en tus ventas y presentas declaraciones. ${esc(v.filingNote)}</p>`];
      if (r) m.push(`<p>Tus ventas anuales previstas son ${J(r.c.annualSales)}.</p>`);
      m.push('<p>Antes de tu primera factura, confirma con la DGII o con un contador cómo debes registrarte y emitir comprobantes fiscales.</p>');
      return m; } };
    TOPIC.team = { label: L('Empleados'), msgs: () => {
      const r = R(), items = D.employer.items.map(i => `${esc(i.label)} ${pct(i.rate)}`);
      const m = [`<p>Un empleado cuesta más que su sueldo. Además del sueldo bruto, el empleador suma: ${items.join(', ')}. También se descuentan aportes del sueldo del empleado, y tú pagas todo a las autoridades.</p>`];
      m.push(r && r.c.emp > 0 ? `<p>En tu plan, los aportes del empleador suman unos <b>${J(r.c.er)}</b> al año sobre una nómina de ${J(r.c.payroll)}.</p>` : '<p>No planeaste empleados, así que esto todavía no afecta tus cifras.</p>');
      m.push(`<p>${esc(D.calendar.payrollText)}</p>`);
      return m; } };
    TOPIC.customers = { label: L('Mis primeros clientes'), msgs: () => ['<p>Antes de gastar dinero, <b>nombra a tus primeros cinco clientes</b>: personas o negocios reales que te comprarían.</p>', '<p>Luego pide a cada uno un pequeño compromiso: un pedido anticipado, un depósito o una fecha firme. Una palabra amable no es un cliente. El dinero o una fecha clara, sí.</p>', '<p>Si no puedes nombrar cinco, tu primer trabajo no es el negocio: es hablar con gente que podría comprar. <a href="#/vision">Anótalos en mi visión</a></p>'] };
    TOPIC.motivation = { label: L('Mantener la motivación'), msgs: () => {
      const r = R(), m = ['<p>El dinero es solo un lado de la prueba. La energía decide si el plan sobrevive los primeros meses.</p>'];
      if (r) m.push(`<p>Tu puntuación de motivación es ${r.c.motivation} de 15.</p>`);
      m.push(li(['Prueba en pequeño primero: vende a cinco personas antes de dejar nada.', 'Acuerda con tu hogar una reserva y una fecha de revisión, por ejemplo a los tres meses.', 'Escribe por qué lo haces. Léelo los días difíciles.', 'Decide ahora qué resultado te haría cambiar de rumbo.']));
      return m; } };
    TOPIC.funding = { label: L('Préstamos y apoyo'), msgs: () => {
      const r = R(), m = ['<p>Varias instituciones trabajan con pequeños negocios en ' + esc(D.name) + '. No puedo decirte para qué programa calificas. Contáctalas y pregunta qué asesoría y qué financiamiento están abiertos ahora.</p>'];
      if (r) m.push(`<p>Antes de pedir prestado: tu plan deja unos <b>${J(r.c.netMonthly)}</b> al mes después de impuestos. La cuota de un préstamo debe caber dentro de ese monto, no encima.</p>`);
      m.push(`<p>${D.authorities.support.map(s => s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>` : esc(s.name)).join('<br>')}</p>`);
      return m; } };
  }
  const ORDER_ALL = ['cost', 'breakeven', 'tax', 'customers', 'savings', 'cash', 'vat', 'team', 'motivation', 'funding'];
  const orderList = () => ORDER_ALL.filter(id => id !== 'vat' || D.vat);
  const KEYWORDS = [['cost', /costo|precio|margen|cobrar|cu[aá]nto (debo|cobro)/], ['breakeven', /equilibrio|cu[aá]nto (debo|necesito) vender/], ['cash', /tarde|factura|moroso|capital de trabajo|cr[eé]dito/], ['savings', /ahorro|reserva|colch[oó]n/], ['tax', /impuesto|isr|dgii|rnc|aporte|tss|cotizaci/], ['vat', /itbis|iva|ventas gravadas/], ['team', /empleado|personal|contratar|n[oó]mina|trabajador/], ['customers', /cliente|mercado|comprador|vender a/], ['motivation', /motiva|miedo|estr[eé]s|dudas|renunciar/], ['funding', /pr[eé]stamo|financ|banco|apoyo|subsidio/]];

  const chips = (ids, soft) => `<div class="chips">${ids.map(id => `<button class="chip${soft ? ' soft' : ''}" data-act="ask" data-topic="${id}">${esc(TOPIC[id].label())}</button>`).join('')}</div>`;
  function moreChips(current) {
    const r = report(), pri = r ? r.recs.map(x => x[0]) : [], pool = pri.concat(orderList());
    const ids = []; pool.forEach(id => { if (id !== current && !visited[id] && !ids.includes(id)) ids.push(id); });
    return ids.length ? `<p class="muted small" style="margin:6px 0 2px">¿Y ahora?</p>${chips(ids.slice(0, 3), true)}${r ? '<a class="chip soft" href="#/report">Mi informe</a>' : ''}` : '';
  }
  function toolCost() {
    const s = sym();
    return `<div class="bubble coach tool tool-cost"><p><b>Costo de un producto o un trabajo</b></p><div class="grid2">
      <div class="field"><label for="t-mat">Materiales o mercancía <span class="unit">(${s})</span></label><input id="t-mat" type="number" inputmode="numeric" min="0" placeholder="0"></div>
      <div class="field"><label for="t-oth">Empaque, transporte, comisiones <span class="unit">(${s})</span></label><input id="t-oth" type="number" inputmode="numeric" min="0" placeholder="0"></div>
      <div class="field"><label for="t-hrs">Horas de tu tiempo</label><input id="t-hrs" type="number" inputmode="decimal" min="0" step="0.25" placeholder="0"></div>
      <div class="field"><label for="t-rate">Tu tiempo, por hora <span class="unit">(${s})</span></label><input id="t-rate" type="number" inputmode="numeric" min="0" placeholder="0"><small>Lo que querrías ganar por hora.</small></div></div>
      <div class="res" id="t-res" aria-live="polite"></div></div>`;
  }
  function costCalc() {
    const g = id => num(($('#' + id) || {}).value), cost = g('t-mat') + g('t-oth') + g('t-hrs') * g('t-rate'), el = $('#t-res');
    if (!el) return;
    if (!(cost > 0)) { el.textContent = ''; return; }
    const price = m => J(cost / (1 - m));
    el.innerHTML = `<p>Tu costo: <b>${J(cost)}</b>.</p><p>El margen es la parte del precio de venta que te queda después de este costo. Para quedarte con el 30 % vende a <b>${price(0.3)}</b>, con el 40 % vende a <b>${price(0.4)}</b>, con el 50 % vende a <b>${price(0.5)}</b>.</p><p class="muted small">Tus gastos fijos y tus impuestos todavía salen de ese margen.</p>`;
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
    const first = [{ from: 'coach', html: `<p>¡Hola! Soy tu guía para ${esc(D.name)}. Soy una herramienta integrada en esta app, no una persona, y explico las cosas con palabras sencillas. No sustituyo a un contador.</p>` }];
    if (r) { first.push({ from: 'coach', html: '<p>Tu informe está listo. Estos son los puntos más útiles para trabajar primero:</p>' }); first.push({ raw: true, html: chips(r.recs.map(x => x[0])) }); }
    else { first.push({ from: 'coach', html: '<p>Haz primero <a href="#/test">la prueba</a> y podré armar consejos con tus propias cifras. Mientras tanto, elige cualquier tema:</p>' }); first.push({ raw: true, html: chips(orderList().slice(0, 6)) }); }
    return first;
  }
  function coach(arg) {
    if (!chat.length) chat = coachIntro();
    const pending = TOPIC[arg] && !visited[arg] ? arg : null;
    return `<div class="coachhead"><div class="avatar"><svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="30" width="10" height="14" rx="3" fill="#8FC9D4"></rect><rect x="19" y="19" width="10" height="25" rx="3" fill="#fff"></rect><rect x="34" y="6" width="10" height="38" rx="3" fill="#E8A33D"></rect></svg></div><div><h2 style="font-size:20px">Tu coach</h2><div class="muted small">Gratis · Guiado por tus cifras</div></div></div>
      <div class="chat" id="chatlog" data-pending="${pending || ''}">${chatHTML()}</div>
      <form class="composer" id="composer" autocomplete="off"><input type="text" id="ask" aria-label="Escribe a tu coach" placeholder="Pregunta por precios, impuestos, clientes..."><button type="submit" aria-label="Enviar"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#12262B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5"></path></svg></button></form>`;
  }

  function renderCountryMenu() {
    $('#cname').firstChild.nodeValue = D.name + ' ';
    const list = COUNTRIES.countries.map(c => `<button class="copt" data-country="${c.id}" ${c.id === D.country ? 'aria-current="true"' : ''}>${esc(c.name)}${c.preview ? ' (vista previa)' : ''}${c.id === D.country ? ' ✓' : ''}</button>`).join('');
    const soon = (COUNTRIES.comingSoon || []).length ? `<p class="muted small" style="margin:10px 0 0">Próximamente: ${esc(COUNTRIES.comingSoon.join(', '))}. Cada país tiene sus propios impuestos y reglas.</p>` : '';
    const ext = (COUNTRIES.external || []).map(c => `<button class="copt" data-url="${esc(c.url)}" data-key="${esc(c.key)}" data-id="${esc(c.id)}">${esc(c.name)} <span class="muted small">&nbsp;${c.lang === 'nl' ? 'in het Nederlands' : c.lang === 'fr' ? 'en français' : 'in English'} →</span></button>`).join('');
    $('#cpop').innerHTML = list + ext + soon;
  }
  function useCountry(entry) {
    return fetch(entry.file).then(r => { if (!r.ok) throw new Error('data'); return r.json(); }).then(d => {
      D = d; KEY = keyFor(D.country); S = load(); chat = []; visited = {}; errMsg = '';
      if (!D.legalStatuses.some(x => x.id === S.input.status)) S.input.status = D.legalStatuses[0].id;
      try { localStorage.setItem('papa-es-country', D.country); } catch (e) { /* ignorar */ }
      renderCountryMenu();
      document.title = 'Pa a Pa Caribe: prueba tu idea de negocio en ' + D.name;
    });
  }

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
        if (el) el.textContent = n + ' de ' + all.length + ' hechos';
      }
    });
    view.addEventListener('submit', e => {
      if (e.target.id !== 'composer') return;
      e.preventDefault();
      const inp = $('#ask'), q = inp.value.trim(); if (!q) return;
      inp.value = '';
      const hit = KEYWORDS.find(k => k[1].test(q.toLowerCase()));
      if (hit) coachAsk(hit[0], q);
      else coachPush([{ from: 'me', html: esc(q) }, { from: 'coach', html: '<p>Puedo explicar los temas de abajo. Elige uno o reformula tu pregunta con una palabra como precio, impuesto, clientes o ahorros.</p>' }, { raw: true, html: chips(orderList().slice(0, 6), true) }]);
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
        const done = ok => { const el = $('#copiedlink'); if (el) el.textContent = ok ? 'Enlace copiado.' : b.dataset.url; track('caribbean-share-copy'); };
        try { navigator.clipboard.writeText(b.dataset.url).then(() => done(true), () => done(false)); } catch (err) { done(false); }
      }
      else if (act === 'copy') {
        const txt = visionText(), done = ok => { const el = $('#copied'); if (el) el.textContent = ok ? 'Copiado.' : 'Selecciona el texto de arriba y cópialo.'; };
        try { navigator.clipboard.writeText(txt).then(() => done(true), () => done(false)); } catch (err) { done(false); }
      }
    });
    $('#cpop').addEventListener('click', e => {
      const x = e.target.closest('[data-url]');
      if (x) { try { localStorage.setItem(x.dataset.key, x.dataset.id); } catch (err) { /* ignorar */ } location.href = x.dataset.url; return; }
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
    e.textContent = 'No se pudo cargar el archivo de datos. Abre esta página desde su dirección web (GitHub Pages), no haciendo doble clic en el archivo.';
  }

  fetch('countries.json').then(r => { if (!r.ok) throw new Error('data'); return r.json(); }).then(list => {
    COUNTRIES = list;
    let id = list.countries[0].id;
    try { id = localStorage.getItem('papa-es-country') || id; } catch (e) { /* ignorar */ }
    try { const q = new URLSearchParams(location.search).get('c'); if (q) id = q.toUpperCase(); } catch (e) { /* ignore */ }
    const entry = list.countries.find(c => c.id === id) || list.countries[0];
    return useCountry(entry);
  }).then(() => { defTopics(); bindEvents(); route(); }).catch(showErr);
})();
