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
      `<details class="more"><summary>Conviene preguntar a la administración tributaria</summary>${li(D.toVerify.map(esc))}<p class="small" style="margin:8px 0 0"><b>A quién preguntar: </b>${[D.authorities.tax, D.authorities.registry].filter(Boolean).map(a => a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a>` : esc(a.name)).join(' · ')}</p></details>` +
      (src ? `<details class="more"><summary>Fuentes</summary><ul>${src}</ul></details>` : '') +
      `<p>Pa a Pa es una herramienta gratuita de planificación para quienes emprenden por primera vez. <a href="../">English version</a> · <a href="../../app/">Version française</a></p></footer>`;
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
        <a class="path" href="#/success"><div class="n" style="background:var(--sun);color:var(--ink)">4</div><div><div class="t">Las reglas de la rentabilidad</div><div class="d">Por qué un negocio gana dinero y cómo mantenerlo así.</div></div></a>
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
    TOPIC.mistakes = { label: L('Errores frecuentes'), msgs: () => {
      const r = R(), m = ['<p>Un negocio pequeño rara vez fracasa por un solo error grande. Estos siete se repiten una y otra vez:</p>'];
      m.push(li(['<b>Vender por debajo del costo real.</b> Olvidar tu propio tiempo, el empaque, el transporte o las comisiones.', '<b>No conocer tu punto de equilibrio.</b> Necesitas una cifra de ventas mensual que cubra todos tus costos, impuestos y gastos de vida.', '<b>Quedarte sin efectivo.</b> Sin colchón de ahorro, o con clientes que pagan tarde cuando tú ya pagaste tus cuentas.', '<b>Empezar sin clientes.</b> Construir primero y preguntar después. Nombra cinco personas que pagarían.', '<b>Olvidar los impuestos y aportes.</b> El dinero de tu cuenta no es todo tuyo.', '<b>Mezclar el dinero personal con el del negocio.</b> Esconde las cifras reales. Usa una cuenta aparte.', '<b>Crecer demasiado rápido.</b> Contratar o invertir antes de que las ventas sean estables.']));
      if (r && (!r.be || r.be > r.c.sales * 1.02)) m.push('<p>En tu plan, tus ventas están <b>por debajo del punto de equilibrio</b>. Empieza por este.</p>');
      else if (r && r.c.left < 0) m.push('<p>En tu plan, tus ahorros son <b>menores que los costos de arranque</b>. Empieza por este.</p>');
      return m; } };
    TOPIC.start = { label: L("Por dónde empezar"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Empieza pequeño y en este orden, antes de gastar dinero:</p>");
      m.push(li(["<b>Comprueba la necesidad.</b> Habla con cinco personas que podrían comprarte. Pregunta cuánto pagan hoy por esto.", "<b>Haz tus cuentas.</b> <a href=\"#/test\">Haz la prueba</a> para ver tus costos, impuestos y punto de equilibrio.", "<b>Haz una primera venta.</b> Véndele a un cliente real, aunque sea a mano, antes de construir algo grande.", "<b>Después regístrate y organízate.</b> Sigue los pasos en <a href=\"#/next\">mis próximos pasos</a>."]));
      return m; } };
    TOPIC.legal = { label: L("Forma legal"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>La elección habitual es entre dos opciones:</p>");
      m.push(li(["<b>Persona natural con nombre comercial (tú, bajo un nombre).</b> Barata y sencilla. Tú y el negocio son legalmente la misma persona, así que respondes por las deudas con tus propios bienes.", "<b>Sociedad de responsabilidad limitada (o equivalente).</b> Una persona jurídica aparte, que puede limitar tu riesgo personal. Más trámites, declaraciones anuales y, a menudo, más costos."]));
      m.push("<p>Los impuestos cambian entre una y otra. <a href=\"#/test\">La prueba</a> y <a href=\"#/report\">el informe</a> usan la que elijas. Pregunta al registro mercantil o a un contador antes de decidir.</p>");
      return m; } };
    TOPIC.register = { label: L("Registrar mi negocio"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Registrarse suele implicar varios pasos distintos, en este orden:</p>");
      m.push(li(["Registrar el nombre comercial o la sociedad en el registro oficial.", "Obtener un número de identificación fiscal en la administración de impuestos.", "Inscribirte en la seguridad social si trabajas por tu cuenta o contratas personal.", "Preguntar al ayuntamiento o ministerio si tu actividad necesita licencia o permiso (alimentos, transporte y salud suelen necesitarlo).", "Registrarte en el impuesto sobre ventas si tus ventas llegan al umbral."]));
      m.push("<p>Las oficinas y formularios exactos de tu país están en <a href=\"#/next\">mis próximos pasos</a>. No empieces a vender en una actividad regulada sin haber preguntado.</p>");
      return m; } };
    TOPIC.bank = { label: L("Cuenta bancaria del negocio"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Usa una cuenta aparte para el negocio desde el primer día, aunque sea sencilla.</p>");
      m.push(li(["Todas las ventas y todos los costos pasan por ella. Tus cifras se mantienen reales.", "Facilita mucho la época de impuestos y cualquier solicitud de préstamo.", "Transfiérete cada mes una cantidad fija, como un sueldo.", "Guarda una segunda cuenta pequeña para los impuestos. Aparta lo que debes pagar en cuanto te paguen."]));
      m.push("<p>Pregunta las comisiones mensuales en dos o tres bancos antes de elegir.</p>");
      return m; } };
    TOPIC.records = { label: L("Llevar mis cuentas"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Al principio no necesitas un programa. Necesitas un hábito.</p>");
      m.push(li(["Guarda cada recibo y cada factura, en papel o en foto, en una sola carpeta.", "Anota cada venta y cada costo el mismo día, con fecha, monto y para qué fue.", "Una vez al mes, suma ventas, costos y lo que queda. Compara con tu plan.", "Conserva tus registros los años que pida la administración de impuestos."]));
      m.push("<p>Un contador puede dejarlo montado en una o dos horas, y a menudo se paga solo. Yo no lo reemplazo.</p>");
      return m; } };
    TOPIC.insurance = { label: L("Seguros"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Un seguro es un costo que te protege de una pérdida que no podrías pagar solo.</p>");
      m.push(li(["<b>Local y mercancía:</b> incendio, robo, tormenta e inundación. Importante en zonas de huracanes.", "<b>Responsabilidad civil:</b> si un cliente o un tercero sufre un daño o pierde dinero por tu culpa.", "<b>Vehículo:</b> obligatorio si conduces para el negocio.", "<b>Salud e ingresos para ti:</b> si no puedes trabajar, el negocio se detiene."]));
      m.push("<p>Pide cotización a dos aseguradoras y suma el costo anual a tus costos fijos en <a href=\"#/test\">la prueba</a>.</p>");
      return m; } };
    TOPIC.marketing = { label: L("Conseguir clientes"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Empieza por lo más barato y mide qué funciona.</p>");
      m.push(li(["<b>El boca a boca.</b> Pide a tus primeros clientes que se lo cuenten a dos personas, y agradéceselo.", "<b>Una sola página en una red social</b> o un número de WhatsApp Business donde se vea lo que vendes y tus precios.", "<b>Está donde ya están tus clientes:</b> un mercado, un grupo de Facebook, un tablón de anuncios, un negocio aliado.", "<b>Ofrece una pequeña promoción de primera vez</b> y pregunta cómo te conocieron."]));
      m.push("<p>Gasta en anuncios solo cuando sepas qué mensaje ya funciona gratis. La publicidad es un costo de tu plan.</p>");
      return m; } };
    TOPIC.online = { label: L("Vender en línea"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Puedes empezar en línea con muy poco dinero, pero se aplican las mismas reglas: costos, impuestos y clientes.</p>");
      m.push(li(["Suma la comisión de la plataforma, la comisión de pago, el empaque y el envío a tu costo antes de fijar el precio.", "Las ventas al exterior pueden traer dudas de aduana, envío e impuestos. Verifica antes de prometer una entrega.", "Fotos y descripciones claras venden más que un sitio sofisticado.", "Prueba con una página social o un mercado en línea antes de pagar un sitio web."]));
      m.push("<p>Las ventas en línea siguen siendo ventas: cuentan para los impuestos y para tus registros.</p>");
      return m; } };
    TOPIC.profit = { label: L("Ganancia, ventas y efectivo"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Tres cifras distintas que los principiantes suelen confundir:</p>");
      m.push(li(["<b>Ventas (facturación):</b> todo lo que los clientes te pagan.", "<b>Ganancia:</b> las ventas menos todos los costos e impuestos. Es lo que el negocio gana de verdad.", "<b>Efectivo:</b> el dinero en tu cuenta hoy. Puede ser alto cuando la ganancia es baja (un gran anticipo) y bajo cuando la ganancia es alta (clientes que aún no pagaron)."]));
      m.push("<p>Un negocio puede tener ganancia y aun así quedarse sin efectivo. Vigila las dos. <a href=\"#/test\">La prueba</a> muestra tu punto de equilibrio y lo que queda después de impuestos.</p>");
      return m; } };
    TOPIC.pay = { label: L("Pagarme a mí"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Decide una cantidad mensual fija para ti y trátala como un sueldo, no como lo que sobra.</p>");
      m.push(li(["Parte de tus gastos de vida reales, de la prueba.", "Págate solo después de cubrir costos e impuestos.", "Si las ventas son bajas, reduce tu pago antes de dejar de pagar a proveedores o impuestos.", "Revisa la cantidad cada tres meses."]));
      if (r) m.push(`<p>En tu plan, quedan unos <b>${J(r.c.netMonthly)}</b> al mes después de impuestos.</p>`);
      return m; } };
    TOPIC.costs = { label: L("Costos fijos y variables"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Los costos son de dos tipos:</p>");
      m.push(li(["<b>Los costos fijos</b> no cambian con las ventas: alquiler, seguro, suscripciones, tu propio pago.", "<b>Los costos variables</b> suben con cada venta: materiales, empaque, envío, comisiones."]));
      m.push("<p>El punto de equilibrio es cuántas ventas hacen falta para cubrir los costos fijos después de pagar los variables. Reducir un costo fijo ayuda cada mes; reducir un costo variable ayuda en cada venta. <a href=\"#/test\">Ingresa ambos en la prueba.</a></p>");
      return m; } };
    TOPIC.suppliers = { label: L("Proveedores"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Tus proveedores deciden tu costo de producción, así que elígelos con cuidado.</p>");
      m.push(li(["Pide al menos tres cotizaciones por la misma cantidad y calidad.", "Pregunta el precio por unidad según la cantidad, pero no compres más de lo que puedes vender.", "Pide plazo de pago, por ejemplo 30 días, para aliviar tu efectivo.", "Prueba con un pedido pequeño antes de uno grande.", "Ten un segundo proveedor para tu artículo principal."]));
      return m; } };
    TOPIC.stock = { label: L("Manejar mi inventario"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>El inventario es dinero parado en un estante.</p>");
      m.push(li(["Compra poco de lo que sabes que se vende, y repón a menudo.", "Cuenta tu inventario cada mes y anota qué se vendió más rápido.", "Rebaja pronto lo que se mueve lento, antes de que caduque o pase de moda.", "No inmovilices tus ahorros en inventario antes de que las primeras ventas prueben la demanda."]));
      return m; } };
    TOPIC.premises = { label: L("Dónde trabajar"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>El alquiler fijo es el costo que hunde a muchos negocios pequeños. Empieza por el lugar más barato que funcione.</p>");
      m.push(li(["<b>Desde casa:</b> revisa primero las reglas locales y tu contrato o propietario; algunas actividades (comida, ruido, clientes que visitan) necesitan permiso.", "<b>Puesto en un mercado o espacio compartido:</b> costo bajo, sirve para probar y conoces clientes.", "<b>Local propio:</b> solo cuando las ventas sean estables y paguen el alquiler.", "Lee siempre el contrato de alquiler y pregunta qué pasa si te vas antes."]));
      return m; } };
    TOPIC.partners = { label: L("Socios"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Un socio puede aportar habilidades y dinero, y también puede acabar con el negocio.</p>");
      m.push(li(["Escribe quién aporta qué: dinero, trabajo y tiempo.", "Acuerden cómo se reparte la ganancia y cómo se paga cada uno.", "Acuerden qué pasa si un socio se va, se enferma o quiere vender.", "Ponlo por escrito y que lo revise un abogado."]));
      m.push("<p>Hazlo mientras se llevan bien. Un simple apretón de manos entre amigos es una causa frecuente de discusiones después.</p>");
      return m; } };
    TOPIC.parttime = { label: L("Conservar mi empleo"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Puedes probar el negocio sin perder tus ingresos. Suele ser la forma más segura de empezar.</p>");
      m.push(li(["Revisa tu contrato de trabajo: algunos empleadores prohíben un negocio paralelo o competidor.", "Empieza por las noches y los fines de semana hasta que las ventas cubran tus gastos de vida.", "Fija el nivel en el que renunciarás, por ejemplo tres meses de gastos de vida ahorrados y ventas estables. <a href=\"#/test\">La prueba</a> muestra tu colchón.", "Cuéntale a tu hogar cuál es el plan y la fecha de revisión."]));
      return m; } };
    TOPIC.competition = { label: L("Competencia"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Los competidores son una buena noticia: prueban que la gente paga por esto.</p>");
      m.push(li(["Haz una lista de los tres competidores más cercanos, con sus precios y lo que a los clientes les gusta o no.", "No seas solo más barato. Elige una forma de ser mejor: rapidez, calidad, confianza, comodidad o ubicación.", "Pregunta a tus primeros clientes por qué te eligieron.", "Anótalo en <a href=\"#/vision\">mi visión</a>."]));
      return m; } };
    TOPIC.growth = { label: L("Hacer crecer el negocio"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Crece cuando las cifras sean estables, no cuando estés entusiasmado.</p>");
      m.push(li(["Espera tres meses o más con ventas por encima del punto de equilibrio.", "Añade una sola cosa a la vez: un producto, un empleado, un lugar.", "Antes de gastar, calcula las ventas extra que debe traer para pagarse.", "Mantén intacto tu colchón de ahorro."]));
      return m; } };
    TOPIC.seasonality = { label: L("Temporada baja"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Muchos negocios del Caribe venden mucho más en unos meses que en otros, por el turismo, las fiestas y la temporada de huracanes.</p>");
      m.push(li(["Mira el año pasado o pregunta a otros vendedores: ¿qué meses son de mucho trabajo y cuáles son tranquilos?", "Aparta dinero en los meses buenos para cubrir los tranquilos.", "Planifica costos fijos que puedas reducir o pausar en temporada baja.", "Ofrece algo para los meses flojos: un descuento, otro producto o un servicio para los vecinos."]));
      return m; } };
    TOPIC.invoice = { label: L("Facturas y cotizaciones"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Una factura clara te hace cobrar más rápido. Incluye:</p>");
      m.push(li(["El nombre de tu negocio, la dirección y el número fiscal si lo tienes.", "Un número de factura único y la fecha.", "Lo que vendiste, la cantidad, el precio y el impuesto sobre ventas, si aplica.", "El total, la fecha de vencimiento y cómo pagar (datos de la cuenta).", "Envíala el mismo día y guarda una copia."]));
      m.push("<p>Para una cotización, añade cuánto tiempo vale el precio y qué no está incluido.</p>");
      return m; } };
    TOPIC.contracts = { label: L("Acuerdos con clientes"), msgs: () => {
      const r = R(), m = [];
      m.push("<p>Las condiciones por escrito evitan la mayoría de las disputas.</p>");
      m.push(li(["Para cualquier trabajo de cierta cuantía, escribe lo que harás, el precio, el plazo y el anticipo.", "Explica con palabras sencillas tu regla de reembolso o devolución, y muéstrala.", "Guarda mensajes y fotos como prueba.", "Si un cliente se queja, responde rápido y con calma, y ofrece una solución antes de que la pida."]));
      return m; } };
  }
  const ORDER_ALL = ['start', 'mistakes', 'cost', 'breakeven', 'tax', 'customers', 'savings', 'cash', 'vat', 'team', 'motivation', 'funding', 'legal', 'register', 'bank', 'records', 'insurance', 'marketing', 'online', 'profit', 'pay', 'costs', 'suppliers', 'stock', 'premises', 'partners', 'parttime', 'competition', 'growth', 'seasonality', 'invoice', 'contracts'];
  const orderList = () => ORDER_ALL.filter(id => id !== 'vat' || D.vat);
  const KEYWORDS = [['mistakes', /error|fracas|quiebra|riesgo|por qu[eé].*(negocio|empresa)/], ['cost', /costo|precio|margen|cobrar|cu[aá]nto (debo|cobro)/], ['breakeven', /equilibrio|cu[aá]nto (debo|necesito) vender/], ['cash', /tarde|factura|moroso|capital de trabajo|cr[eé]dito/], ['savings', /ahorro|reserva|colch[oó]n/], ['tax', /impuesto|\bisr\b|dgii|\brnc\b|aporte|\btss\b|cotizaci/], ['vat', /itbis|\biva\b|ventas gravadas/], ['team', /empleado|personal|contratar|n[oó]mina|trabajador/], ['customers', /cliente|mercado|comprador|vender a/], ['motivation', /motiva|miedo|estr[eé]s|dudas|renunciar/], ['funding', /pr[eé]stamo|financ|banco|apoyo|subsidio/]];

  const EXTRA = {"cost": ["precio", "costo", "margen", "cobrar"], "breakeven": ["punto de equilibrio", "equilibrio"], "tax": ["impuesto", "impuestos", "aportes"], "customers": ["clientes", "cliente", "comprador"], "savings": ["ahorros", "colchón", "reserva"], "cash": ["capital de trabajo", "pagan tarde", "moroso"], "team": ["empleado", "empleados", "contratar", "nómina", "trabajador"], "motivation": ["motivación", "estrés"], "funding": ["préstamo", "prestamo", "subvención", "financiamiento", "financiación"], "vat": ["itbis"], "mistakes": ["error", "errores", "fracaso", "fracasar", "quiebra"], "start": ["por dónde empezar", "cómo empezar", "empezar", "comenzar", "iniciar", "arrancar", "crear un negocio", "crear mi negocio", "abrir un negocio", "primer paso", "mi idea", "idea de negocio", "buena idea", "lanzar", "consejos para principiantes", "principiante", "soy nuevo"], "legal": ["forma legal", "forma jurídica", "persona física", "persona natural", "autónomo", "trabajador independiente", "sociedad", "srl", "sas", "compañía limitada", "persona jurídica", "nombre comercial", "constituir"], "register": ["registrar mi negocio", "registrar mi empresa", "registro mercantil", "inscribir", "licencia", "permiso", "trámite", "papeleo", "número fiscal", "requisitos legales", "formalizar"], "bank": ["cuenta bancaria", "cuenta del negocio", "cuenta aparte", "cuenta empresarial", "cuenta separada", "dinero personal", "mezclar dinero", "mezclar el dinero"], "records": ["contabilidad", "llevar mis cuentas", "llevar las cuentas", "contador", "recibos", "hoja de cálculo", "excel", "comprobante", "libro de cuentas"], "insurance": ["seguro de", "seguros", "asegur", "póliza", "responsabilidad civil", "incendio"], "marketing": ["marketing", "publicidad", "anunciar", "promocionar", "promoción", "redes sociales", "facebook", "instagram", "whatsapp", "tiktok", "conseguir clientes", "encontrar clientes", "más clientes", "boca a boca", "logo", "página web", "visibilidad"], "online": ["en línea", "en linea", "online", "comercio electrónico", "tienda virtual", "tienda online", "etsy", "amazon", "shopify", "envío", "enviar", "entrega", "dropshipping", "internet"], "profit": ["ganancia", "beneficio", "utilidad", "facturación", "cuánto voy a ganar", "ganar", "flujo de efectivo", "efectivo", "dinero en caja"], "pay": ["pagarme", "mi sueldo", "mi salario", "cuánto pagarme", "dividendos", "mi pago", "vivir del negocio"], "costs": ["costos fijos", "costo fijo", "costos variables", "costo variable", "gastos fijos", "gastos variables", "gastos"], "suppliers": ["proveedor", "mayorista", "negociar", "al por mayor", "dónde comprar", "abastecimiento"], "stock": ["inventario", "existencias", "stock", "sin vender", "reponer", "cuánto comprar", "caduc"], "premises": ["un local", "local comercial", "tienda física", "oficina", "alquiler", "ubicación", "desde casa", "en casa", "cocina", "taller", "puesto en el mercado"], "partners": ["socio", "asociar", "sociedad con", "cofundador", "con un amigo", "con mi hermano", "con mi hermana", "en familia", "entre varios", "con un socio"], "parttime": ["conservar mi empleo", "mantener mi empleo", "dejar mi trabajo", "renunciar", "mi empleo", "mi jefe", "mi empleador", "en paralelo"], "competition": ["competencia", "competidor", "competir", "rival", "destacar", "diferenciarme", "mi negocio es único"], "growth": ["crecer", "crecimiento", "expandir", "ampliar", "segunda sucursal", "nuevo producto", "más grande"], "seasonality": ["temporada", "mes flojo", "meses flojos", "temporada baja", "temporada alta", "huracán", "huracanes", "turista", "turismo", "estacional"], "invoice": ["hacer una factura", "crear una factura", "emitir una factura", "modelo de factura", "plantilla de factura", "cotización", "cotizacion", "presupuesto", "recibo de pago"], "contracts": ["contrato", "acuerdo por escrito", "por escrito", "términos y condiciones", "anticipo", "reembolso", "garantía", "reclamo", "queja", "disputa", "política de devolución", "devolución"]};
  const GREET = /^(hola|buenas|buenos d|ayuda|ay[uú]dame)/i;
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
  const allChip = () => '<button class="chip soft" data-act="all">' + esc("Todos los temas") + '</button>';

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
        if (el) el.textContent = n + ' de ' + all.length + ' hechos';
      }
    });
    view.addEventListener('submit', e => {
      if (e.target.id !== 'composer') return;
      e.preventDefault();
      const inp = $('#ask'), q = inp.value.trim(); if (!q) return;
      inp.value = '';
      const id = matchTopic(q);
      if (id) { track('caribbean-coach-hit'); coachAsk(id, q); }
      else if (GREET.test(q)) coachPush([{ from: 'me', html: esc(q) }, { from: 'coach', html: "<p>¡Hola! Elige un tema abajo o escribe tu pregunta.</p>" }, { raw: true, html: chips(orderList(), true) }]);
      else { track('caribbean-coach-miss'); coachPush([{ from: 'me', html: esc(q) }, { from: 'coach', html: '<p>Todavía no tengo respuesta para eso. Empieza por los errores frecuentes o elige otro tema. También puedes usar una palabra como precio, impuesto, clientes o ahorros.</p>' }, { raw: true, html: chips(orderList().slice(0, 6), true) + allChip() }]); }
    });
    view.addEventListener('click', e => {
      const sh = e.target.closest('[data-share]'); if (sh) track('caribbean-share-' + sh.dataset.share);
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'all') coachPush([{ from: 'me', html: esc("Todos los temas") }, { raw: true, html: chips(orderList(), true) }]);
      else if (act === 'ask') coachAsk(b.dataset.topic);
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
