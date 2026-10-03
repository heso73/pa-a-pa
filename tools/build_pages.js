// Generates crawlable static guide pages for every country, from the same data files as the app.
const fs = require('fs'), path = require('path');
const E = require('./caribbean/engine.js');
const ROOT = path.join(__dirname, 'caribbean');
const BASE = 'https://heso73.github.io/pa-a-pa/caribbean/';
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const load = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));

const SLUG = { JM:'jamaica', TT:'trinidad-and-tobago', GY:'guyana', BB:'barbados', BS:'bahamas', BZ:'belize', LC:'saint-lucia', DM:'dominica', GD:'grenada', VC:'saint-vincent-and-the-grenadines', AG:'antigua-and-barbuda', KN:'saint-kitts-and-nevis', DO:'republica-dominicana', PR:'puerto-rico', CU:'cuba', KY:'cayman-islands', VG:'british-virgin-islands', TC:'turks-and-caicos-islands', AI:'anguilla', MS:'montserrat', AW:'aruba', CW:'curacao', SR:'suriname', HT:'haiti', BON:'bonaire', STA:'sint-eustatius', SAB:'saba', SXM:'sint-maarten', VI:'us-virgin-islands' };

const T = {
  en: {
    lang: 'en', site: 'Pa a Pa Caribbean', home: 'Pa a Pa Caribbean', hub: BASE,
    title: n => `Starting a business in ${n}: taxes, registration and steps (2026) | Pa a Pa Caribbean`,
    desc: (n, vs, cur) => `${n}: income tax, social contributions, ${vs} and the registration steps for a new business, with a worked example in ${cur}. Free business viability test, no sign-up.`,
    h1: n => `Starting a business in ${n}: taxes, registration and steps`,
    lead: (n, auth) => `A plain-words guide for first-time entrepreneurs in ${n}: what you register, what you pay and when. Figures are 2026 estimates for planning. ${auth} gives you the exact amounts when you register.`,
    facts: 'Quick facts', factRows: { cur: 'Currency', tax: 'Tax authority', reg: 'Business registry', inc: 'Income tax on your profit', corp: 'Company tax', vat: 'Sales tax', soc: 'Social contributions (self-employed)', sales: 'Levies on sales' },
    none: n => `No personal income tax in ${n}`, steps: 'Steps to start', forms: 'Choosing a legal form', taxes: 'Taxes and contributions', example: 'Worked example', cal: 'Tax calendar', faq: 'Frequently asked questions', try: 'Test your own project', tryText: 'Enter your sales, costs and what you need to live on. You get your taxes, your take-home income, a viability report and a coach. Free, no sign-up.', cta: 'Test my project in ' , others: 'Other Caribbean countries', from: 'Last checked',
    month: 'per month', year: 'per year', ifEmp: '(if you hire employees)', ifVat: '(when your sales reach the threshold)',
    exIntro: (cur, s) => `A sole trader selling ${s} a month, after the cost of goods, fixed costs and their own living needs:`, exSales: 'Sales for the year', exCost: 'Cost of goods and fixed costs', exProfit: 'Profit before tax', exNet: 'Left for you, per year', exNetM: 'Left for you, per month', exNeed: 'Living needs, per month',
    ceilMonth: 'up to', perMonth: 'a month', rateFrom: 'from', noThr: 'from the first sale',
    qTax: n => `How much tax does a self-employed person pay in ${n}?`, qVat: (n, vs) => `Do I need to register for ${vs} in ${n}?`, qReg: n => `Where do I register a business in ${n}?`, qEmp: n => `How much does it cost to employ someone in ${n}?`, qTool: n => `Is there a free tool to test a business idea in ${n}?`,
    aTool: n => `Yes. Pa a Pa Caribbean is a free web app that tests whether a business idea in ${n} can pay the owner's bills. You answer a few questions and get your estimated taxes, your take-home income, a strengths and risks report and the next steps. It needs no sign-up and keeps your answers on your own device.`
  },
  es: {
    lang: 'es', site: 'Pa a Pa Caribe', home: 'Pa a Pa Caribe', hub: BASE + 'es/',
    title: n => `Cómo montar un negocio en ${n}: impuestos, registro y pasos (2026) | Pa a Pa Caribe`,
    desc: (n, vs, cur) => `${n}: impuesto sobre la renta, seguridad social, ${vs} y pasos de registro para un negocio nuevo, con un ejemplo calculado en ${cur}. Prueba gratuita de viabilidad, sin registro.`,
    h1: n => `Cómo montar un negocio en ${n}: impuestos, registro y pasos`,
    lead: (n, auth) => `Una guía en palabras sencillas para quien emprende por primera vez en ${n}: qué registras, qué pagas y cuándo. Las cifras son estimaciones para planificar en 2026. Al registrarte, ${auth} te da los montos exactos.`,
    facts: 'Datos clave', factRows: { cur: 'Moneda', tax: 'Administración tributaria', reg: 'Registro de negocios', inc: 'Impuesto sobre la renta de tu ganancia', corp: 'Impuesto de sociedades', vat: 'Impuesto a las ventas', soc: 'Seguridad social (independiente)', sales: 'Impuestos sobre las ventas' },
    none: n => `No hay impuesto sobre la renta personal en ${n}`, steps: 'Pasos para empezar', forms: 'Elegir la forma legal', taxes: 'Impuestos y aportes', example: 'Ejemplo calculado', cal: 'Calendario de impuestos', faq: 'Preguntas frecuentes', try: 'Prueba tu propio proyecto', tryText: 'Escribe tus ventas, tus costos y lo que necesitas para vivir. Obtienes tus impuestos, lo que te queda, un informe de viabilidad y un coach. Gratis y sin registro.', cta: 'Probar mi proyecto en ', others: 'Otros países del Caribe', from: 'Última verificación',
    month: 'al mes', year: 'al año', ifEmp: '(si contratas empleados)', ifVat: '(cuando tus ventas llegan al límite)',
    exIntro: (cur, s) => `Un negocio a nombre propio que vende ${s} al mes, después del costo de la mercancía, los gastos fijos y lo que el dueño necesita para vivir:`, exSales: 'Ventas del año', exCost: 'Costo de la mercancía y gastos fijos', exProfit: 'Ganancia antes de impuestos', exNet: 'Te queda al año', exNetM: 'Te queda al mes', exNeed: 'Lo que necesitas para vivir, al mes',
    ceilMonth: 'hasta', perMonth: 'al mes', rateFrom: 'desde', noThr: 'desde la primera venta',
    qTax: n => `¿Cuántos impuestos paga un trabajador independiente en ${n}?`, qVat: (n, vs) => `¿Debo registrarme para el ${vs} en ${n}?`, qReg: n => `¿Dónde se registra un negocio en ${n}?`, qEmp: n => `¿Cuánto cuesta emplear a alguien en ${n}?`, qTool: n => `¿Hay una herramienta gratuita para probar una idea de negocio en ${n}?`,
    aTool: n => `Sí. Pa a Pa Caribe es una app web gratuita que prueba si una idea de negocio en ${n} puede pagar los gastos de su dueño. Respondes unas preguntas y obtienes tus impuestos estimados, lo que te queda, un informe de fortalezas y riesgos y los próximos pasos. No pide registro y guarda tus respuestas en tu propio dispositivo.`
  },
  fr: {
    lang: 'fr', site: 'Pa a Pa Caraïbe', home: 'Pa a Pa Caraïbe', hub: BASE + 'fr/',
    title: n => `Créer une entreprise en ${n} : impôts, démarches et étapes (2026) | Pa a Pa Caraïbe`,
    desc: (n, vs, cur) => `${n} : impôt sur le revenu, cotisations sociales, ${vs} et démarches d’enregistrement pour une nouvelle entreprise, avec un exemple chiffré en ${cur}. Test de viabilité gratuit, sans inscription.`,
    h1: n => `Créer une entreprise en ${n} : impôts, démarches et étapes`,
    lead: (n, auth) => `Un guide en mots simples pour celles et ceux qui entreprennent pour la première fois en ${n} : ce que vous enregistrez, ce que vous payez et quand. Les chiffres sont des estimations 2026 pour planifier. À l’inscription, ${auth} vous donne les montants exacts.`,
    facts: 'Repères', factRows: { cur: 'Monnaie', tax: 'Administration fiscale', reg: 'Registre des entreprises', inc: 'Impôt sur le revenu de votre bénéfice', corp: 'Impôt sur les sociétés', vat: 'Taxe sur les ventes', soc: 'Cotisations sociales (indépendant)', sales: 'Taxes sur les ventes' },
    none: n => `Pas d’impôt sur le revenu des personnes en ${n}`, steps: 'Étapes pour se lancer', forms: 'Choisir la forme juridique', taxes: 'Impôts et cotisations', example: 'Exemple chiffré', cal: 'Calendrier fiscal', faq: 'Questions fréquentes', try: 'Testez votre propre projet', tryText: 'Indiquez vos ventes, vos coûts et ce dont vous avez besoin pour vivre. Vous obtenez vos impôts, ce qu’il vous reste, un rapport de viabilité et un coach. Gratuit, sans inscription.', cta: 'Tester mon projet en ', others: 'Autres langues', from: 'Dernière vérification',
    month: 'par mois', year: 'par an', ifEmp: '(si vous embauchez)', ifVat: '(quand vos ventes atteignent le seuil)',
    exIntro: (cur, s) => `Un entrepreneur individuel qui vend ${s} par mois, après le coût des marchandises, les charges fixes et ses propres besoins de vie :`, exSales: 'Ventes de l’année', exCost: 'Coût des marchandises et charges fixes', exProfit: 'Bénéfice avant impôts', exNet: 'Il vous reste par an', exNetM: 'Il vous reste par mois', exNeed: 'Besoins de vie, par mois',
    ceilMonth: 'jusqu’à', perMonth: 'par mois', rateFrom: 'dès', noThr: 'dès la première vente',
    qTax: n => `Combien d’impôts paie un travailleur indépendant en ${n} ?`, qVat: (n, vs) => `Dois-je m’inscrire à la ${vs} en ${n} ?`, qReg: n => `Où enregistrer une entreprise en ${n} ?`, qEmp: n => `Combien coûte l’emploi d’un salarié en ${n} ?`, qTool: n => `Existe-t-il un outil gratuit pour tester une idée d’entreprise en ${n} ?`,
    aTool: n => `Oui. Pa a Pa Caraïbe est une application web gratuite qui teste si une idée d’entreprise en ${n} peut payer les dépenses de son créateur. Vous répondez à quelques questions et obtenez vos impôts estimés, ce qu’il vous reste, un rapport de forces et de risques et les prochaines étapes. Sans inscription ; vos réponses restent sur votre appareil.`
  },
  nl: {
    lang: 'nl', site: 'Pa a Pa Caraïben', home: 'Pa a Pa Caraïben', hub: BASE + 'nl/',
    title: n => `Een bedrijf starten in ${n}: belastingen, inschrijving en stappen (2026) | Pa a Pa Caraïben`,
    desc: (n, vs, cur) => `${n}: inkomstenbelasting, sociale premies, ${vs} en de stappen voor het inschrijven van een nieuw bedrijf, met een rekenvoorbeeld in ${cur}. Gratis haalbaarheidstest, zonder aanmelding.`,
    h1: n => `Een bedrijf starten in ${n}: belastingen, inschrijving en stappen`,
    lead: (n, auth) => `Een gids in gewone woorden voor wie voor het eerst onderneemt in ${n}: wat je inschrijft, wat je betaalt en wanneer. De cijfers zijn schattingen voor 2026 om te plannen. Bij je inschrijving geeft ${auth} je de exacte bedragen.`,
    facts: 'Kerngegevens', factRows: { cur: 'Munt', tax: 'Belastingdienst', reg: 'Handelsregister', inc: 'Inkomstenbelasting over je winst', corp: 'Vennootschapsbelasting', vat: 'Omzetbelasting', soc: 'Sociale premies (zelfstandige)', sales: 'Heffingen over de omzet' },
    none: n => `Geen inkomstenbelasting voor personen in ${n}`, steps: 'Stappen om te starten', forms: 'Een rechtsvorm kiezen', taxes: 'Belastingen en premies', example: 'Rekenvoorbeeld', cal: 'Belastingkalender', faq: 'Veelgestelde vragen', try: 'Test je eigen project', tryText: 'Vul je omzet, je kosten en wat je nodig hebt om van te leven in. Je krijgt je belastingen, wat je overhoudt, een haalbaarheidsrapport en een coach. Gratis, zonder aanmelding.', cta: 'Mijn project testen in ', others: 'Andere talen', from: 'Laatst gecontroleerd',
    month: 'per maand', year: 'per jaar', ifEmp: '(als je personeel aanneemt)', ifVat: '(zodra je omzet de grens bereikt)',
    exIntro: (cur, s) => `Een eenmanszaak met ${s} omzet per maand, na de kosten van handelswaar, de vaste kosten en het levensonderhoud van de eigenaar:`, exSales: 'Omzet over het jaar', exCost: 'Kosten van handelswaar en vaste kosten', exProfit: 'Winst vóór belasting', exNet: 'Je houdt per jaar over', exNetM: 'Je houdt per maand over', exNeed: 'Levensonderhoud, per maand',
    ceilMonth: 'tot', perMonth: 'per maand', rateFrom: 'vanaf', noThr: 'vanaf de eerste verkoop',
    qTax: n => `Hoeveel belasting betaalt een zelfstandige in ${n}?`, qVat: (n, vs) => `Moet ik me inschrijven voor ${vs} in ${n}?`, qReg: n => `Waar kan ik een bedrijf inschrijven in ${n}?`, qEmp: n => `Wat kost het om iemand in dienst te nemen in ${n}?`, qTool: n => `Is er een gratis hulpmiddel om een bedrijfsidee te testen in ${n}?`,
    aTool: n => `Ja. Pa a Pa Caraïben is een gratis webapp die test of een bedrijfsidee in ${n} de kosten van de eigenaar kan betalen. Je beantwoordt een paar vragen en krijgt je geschatte belastingen, wat je overhoudt, een rapport met sterktes en risico’s en de volgende stappen. Zonder aanmelding; je antwoorden blijven op je eigen apparaat.`
  }
};

function bracketsText(D, br, lang) {
  return br.map((b, i) => {
    const prev = i ? br[i - 1].upToChargeable : 0, J = n => E.money(D, n);
    if (b.upToChargeable != null) return lang === 'es' ? `${E.pct(b.rate)} ${i ? 'desde ' + J(prev) + ' ' : ''}hasta ${J(b.upToChargeable)}` : `${E.pct(b.rate)} ${i ? 'from ' + J(prev) + ' ' : ''}up to ${J(b.upToChargeable)}`;
    return i ? (lang === 'es' ? `${E.pct(b.rate)} por encima de ${J(prev)}` : `${E.pct(b.rate)} above ${J(prev)}`) : (lang === 'es' ? `${E.pct(b.rate)} tasa única` : `${E.pct(b.rate)} flat rate`);
  }).join(', ');
}

function build(ui, D) {
  const lang = (ui === 'fr' || ui === 'nl') ? 'es' : ui;
  const t = T[ui], J = n => E.money(D, n), pct = E.pct, name = D.name, slug = SLUG[D.country];
  const url = BASE + (ui === 'es' ? 'es/' : ui === 'fr' ? 'fr/' : ui === 'nl' ? 'nl/' : '') + slug + '/';
  const personal = D.legalStatuses.find(s => s.taxModel === 'personal') || D.legalStatuses[0];
  const hasVat = !!D.vat;
  const vs = hasVat ? D.vat.short : (lang === 'es' ? 'licencias' : 'licences');
  const input = Object.assign({ status: personal.id, activity: D.activities ? D.activities[0].id : '', payMode: 'now', emp: 0, m1: 4, m2: 4, m3: 4 }, D.examples);
  const c = E.compute(D, input);

  // text pieces
  const incTxt = D.incomeTax ? `${D.incomeTax.bracketText || bracketsText(D, D.incomeTax.brackets, lang)} (${D.incomeTax.allowanceNote})` : t.none(name);
  const corpTxt = D.corporateTax ? bracketsText(D, D.corporateTax.brackets, lang) : (lang === 'es' ? 'Sin impuesto sobre la ganancia' : 'No tax on company profit');
  const socTxt = D.selfEmployed.contributions.length ? D.selfEmployed.contributions.map(ct => `${ct.label}${ct.rate != null ? ' ' + pct(ct.rate) : ''}${ct.ceilingAnnual ? ` (${t.ceilMonth} ${J(ct.ceilingAnnual / 12)} ${t.perMonth})` : ''}`).join(', ') : (lang === 'es' ? 'Ninguna obligatoria para el propietario' : 'None required for the owner');
  const levTxt = (D.salesLevies || []).length ? D.salesLevies.map(l => `${l.label}${l.rate ? ' ' + pct(l.rate) : ''}`).join(', ') : '';
  const vatTxt = hasVat ? `${D.vat.label} (${vs}) ${pct(D.vat.rate)}; ${D.vat.threshold ? (lang === 'es' ? 'obligatorio desde ' : 'register from ') + J(D.vat.threshold) + (lang === 'es' ? ' de ventas al año' : ' in yearly sales') : t.noThr}` : (lang === 'es' ? 'No hay impuesto general a las ventas' : 'No general sales tax');
  const taxLink = a => (a.url ? `<a href="${esc(a.url)}" rel="noopener">${esc(a.name)}</a>` : esc(a.name));

  const facts = [[t.factRows.cur, `${D.currency.code} (${D.currency.symbol.trim()})`], [t.factRows.tax, taxLink(D.authorities.tax)], [t.factRows.reg, taxLink(D.authorities.registry)], [t.factRows.inc, esc(incTxt)], [t.factRows.corp, esc(corpTxt)], [t.factRows.vat, esc(vatTxt)], [t.factRows.soc, esc(socTxt)]];
  if (levTxt) facts.push([t.factRows.sales, esc(levTxt)]);

  const steps = D.launchSteps.filter(s => s.appliesTo.includes(personal.id)).map(s => `<li><b>${esc(s.label)}</b>${s.when === 'employees' ? ' ' + t.ifEmp : s.when === 'vat' ? ' ' + t.ifVat : ''}<br><span class="muted">${esc(s.plain)}</span></li>`).join('');
  const forms = D.legalStatuses.map(s => `<li><b>${esc(s.label)}</b>: ${esc(s.plain)}${s.feeNote ? ' ' + esc(s.feeNote) : ''}</li>`).join('');
  const contribs = [...D.selfEmployed.contributions.map(ct => `<li><b>${esc(ct.label)}</b>${ct.rate != null ? ' (' + pct(ct.rate) + ')' : ''}: ${esc(ct.plain)}</li>`)];
  if (D.incomeTax) contribs.unshift(`<li><b>${esc(D.incomeTax.label)}</b>: ${esc(incTxt)}.</li>`);
  (D.salesLevies || []).forEach(l => contribs.push(`<li><b>${esc(l.label)}</b>: ${lang === 'es' ? 'se paga sobre las ventas, no sobre la ganancia.' : 'charged on sales, not on profit.'}</li>`));
  if (hasVat) contribs.push(`<li><b>${esc(D.vat.label)} (${esc(vs)})</b>: ${pct(D.vat.rate)}. ${esc(D.vat.registerNote || '')} ${esc(D.vat.filingNote || '')}</li>`);
  const empItems = D.employer.items.map(i => `${i.label} ${pct(i.rate)}`).join(', ');
  const cal = D.calendar, calRows = [];
  if (cal.quarterly && cal.quarterly.length) calRows.push(`<li><b>${esc(cal.quarterlyList)}</b>: ${esc(cal.quarterlyTextPersonal)}</li>`);
  if (cal.monthlyText) calRows.push(`<li><b>${esc(cal.monthlyLabel || '')}</b>: ${esc(cal.monthlyText)}</li>`);
  calRows.push(`<li><b>${esc(cal.annualLabel)}</b>: ${esc(cal.annualTextPersonal)}</li>`);
  calRows.push(`<li><b>${esc(cal.payrollLabel || (lang === 'es' ? 'Cada mes' : 'Every month'))}</b>: ${esc(cal.payrollText)}</li>`);
  const exRows = [[t.exSales, J(c.annualSales)], [t.exCost, '-' + J((c.direct + c.fixed) * 12)], [t.exProfit, J(c.profit)], ...c.lines.map(l => [l.label, '-' + J(l.amount)]), [t.exNet, J(c.net)], [t.exNetM, J(c.netMonthly)], [t.exNeed, J(c.needs)]];

  // FAQ (answers built from the data)
  const first3 = D.launchSteps.filter(s => s.appliesTo.includes(personal.id)).slice(0, 3).map(s => s.label).join('; ');
  const faq = [
    [t.qTax(name), `${lang === 'es' ? 'Sobre la ganancia: ' : 'On profit: '}${incTxt}. ${lang === 'es' ? 'Aportes: ' : 'Contributions: '}${socTxt}. ${levTxt ? (lang === 'es' ? 'Sobre las ventas: ' : 'On sales: ') + levTxt + '. ' : ''}${lang === 'es' ? `Ejemplo: con ${J(c.sales)} de ventas al mes, te quedan unos ${J(c.netMonthly)} al mes después de impuestos.` : `Example: with ${J(c.sales)} of sales a month, about ${J(c.netMonthly)} a month is left after tax.`}`],
    hasVat ? [t.qVat(name, vs), `${vatTxt}. ${D.vat.registerNote || ''} ${D.vat.filingNote || ''}`.trim()] : [lang === 'es' ? `¿Hay IVA o impuesto a las ventas en ${name}?` : `Is there a sales tax or VAT in ${name}?`, lang === 'es' ? `No. ${name} no tiene un impuesto general a las ventas. Los costos a planificar son los de la lista de impuestos y aportes de esta página.` : `No. ${name} has no general sales tax. The costs to plan for are the ones in the taxes and contributions list on this page.`],
    [t.qReg(name), `${lang === 'es' ? 'Con ' : 'With '}${D.authorities.registry.name} ${lang === 'es' ? 'y con' : 'and'} ${D.authorities.tax.name}. ${lang === 'es' ? 'Primeros pasos: ' : 'First steps: '}${first3}.`],
    [t.qEmp(name), `${lang === 'es' ? 'Además del sueldo bruto, el empleador suma: ' : 'On top of gross pay, the employer adds: '}${empItems}. ${cal.payrollText}`],
    [t.qTool(name), t.aTool(name)]
  ];
  const faqLd = { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  const crumbs = [{ '@type': 'ListItem', position: 1, name: t.site, item: t.hub }, { '@type': 'ListItem', position: 2, name, item: url }];
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': url + '#page', url, name: t.title(name), description: t.desc(name, vs, D.currency.code), inLanguage: lang, dateModified: D.dataVerifiedOn, isPartOf: { '@id': BASE + '#website' }, about: { '@id': BASE + '#app' } },
    { '@type': 'BreadcrumbList', itemListElement: crumbs }, faqLd ] };

  const related = ui === 'nl' ? '<a href="../../">English</a> · <a href="../../es/">Español</a> · <a href="../../fr/">Français</a>' : ui === 'fr' ? '<a href="../../">English</a> · <a href="../../es/">Español</a> · <a href="../../nl/">Nederlands</a>' : (ui === 'es' ? ALL_ES : ALL_EN).filter(x => x.id !== D.country).map(x => `<a href="../${SLUG[x.id]}/">${esc(x.name)}</a>`).join(' · ');
  const appLink = `../?c=${D.country}#/test`;
  const SH = { en: ['Share this guide', 'Free tool to test a business idea in the Caribbean: taxes, take-home income and a plan. No sign-up.'], es: ['Comparte esta guía', 'Herramienta gratuita para probar una idea de negocio en el Caribe: impuestos, lo que te queda y un plan. Sin registro.'], fr: ['Partager ce guide', 'Outil gratuit pour tester une idée d’entreprise dans la Caraïbe : impôts, ce qu’il vous reste et un plan. Sans inscription.'], nl: ['Deel deze gids', 'Gratis hulpmiddel om een bedrijfsidee in het Caribisch gebied te testen: belastingen, wat je overhoudt en een plan. Zonder aanmelding.'] }[ui];
  const shareRow = `<p class="share"><b>${SH[0]}</b> <a class="chip soft" href="https://wa.me/?text=${encodeURIComponent(SH[1] + ' ' + url)}" target="_blank" rel="noopener">WhatsApp</a> <a class="chip soft" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener">Facebook</a></p>`;

  const html = `<!DOCTYPE html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0B3C49">
<title>${esc(t.title(name))}</title>
<meta name="description" content="${esc(t.desc(name, vs, D.currency.code))}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-snippet:-1">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${t.site}">
<meta property="og:title" content="${esc(t.title(name))}">
<meta property="og:description" content="${esc(t.desc(name, vs, D.currency.code))}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${ui === 'es' ? 'es_419' : ui === 'fr' ? 'fr_HT' : ui === 'nl' ? 'nl_AW' : 'en'}">
<meta property="og:image" content="https://heso73.github.io/pa-a-pa/caribbean/icons/og-${ui}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="192x192" href="../${ui !== 'en' ? '../' : ''}icons/icon-192.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="../${ui !== 'en' ? '../' : ''}styles.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<div class="wrap">
  <header class="topbar"><a class="brand" href="../" aria-label="${t.home}"><svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="30" width="10" height="14" rx="3" fill="#1F7A8C"></rect><rect x="19" y="19" width="10" height="25" rx="3" fill="#0B3C49"></rect><rect x="34" y="6" width="10" height="38" rx="3" fill="#E8A33D"></rect></svg><span>Pa a Pa <small>${lang === 'es' ? 'Caribe' : 'Caribbean'}</small></span></a></header>
  <main class="page">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="../">${t.site}</a> › ${esc(name)}</nav>
    <h1>${esc(t.h1(name))}</h1>
    <p class="lead">${esc(t.lead(name, D.authorities.tax.name))}</p>
    <p><a class="btn" href="${appLink}">${t.cta}${esc(name)}</a></p>
    <h2>${t.facts}</h2>
    <table class="sum facts">${facts.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>
    <h2>${t.steps}</h2>
    <ol class="steps">${steps}</ol>
    <h2>${t.forms}</h2>
    <ul>${forms}</ul>
    <h2>${t.taxes}</h2>
    <ul>${contribs.join('')}</ul>
    ${(D.notes || []).map(n => `<p class="note">${esc(n)}</p>`).join('')}
    <h2>${t.example}</h2>
    <p>${esc(t.exIntro(D.currency.code, J(c.sales)))}</p>
    <table class="sum">${exRows.map((r, i) => `<tr${i === exRows.length - 3 ? ' class="sum"' : ''}><td>${esc(r[0])}</td><td>${r[1]}</td></tr>`).join('')}</table>
    <h2>${t.cal}</h2>
    <ul>${calRows.join('')}</ul>
    <h2>${t.faq}</h2>
    ${faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}
    <section class="card"><h2 style="margin-top:0">${t.try}</h2><p>${t.tryText}</p><p><a class="btn" href="${appLink}">${t.cta}${esc(name)}</a></p></section>
    ${shareRow}
    <h2>${t.others}</h2>
    <p class="related">${related}</p>
    <p class="muted small">${t.from}: ${esc(D.dataVerifiedOn)}. ${taxLink(D.authorities.tax)}.</p>
  </main>
</div>
</body>
</html>
`;
  return ui === 'fr' ? frFix(html, D, c) : ui === 'nl' ? nlFix(html, D, c) : html;
}


function frFix(h, D, c) {
  const J = n => E.money(D, n);
  const pairs = [
    ['Sobre la ganancia: ', 'Sur le bénéfice : '], ['Aportes: ', 'Cotisations : '], ['Sobre las ventas: ', 'Sur les ventes : '],
    [`Ejemplo: con ${J(c.sales)} de ventas al mes, te quedan unos ${J(c.netMonthly)} al mes después de impuestos.`, `Exemple : avec ${J(c.sales)} de ventes par mois, il vous reste environ ${J(c.netMonthly)} par mois après impôts.`],
    ['Con ', 'Auprès de '], [' y con ', ' et de '], ['Primeros pasos: ', 'Premières étapes : '],
    ['Además del sueldo bruto, el empleador suma: ', 'En plus du salaire brut, l’employeur ajoute : '],
    ['Cada mes', 'Chaque mois'], ['Ninguna obligatoria para el propietario', 'Aucune obligatoire pour le propriétaire'], ['Sin impuesto sobre la ganancia', 'Pas d’impôt sur le bénéfice'],
    ['obligatorio desde ', 'obligatoire dès '], [' de ventas al año', ' de ventes par an'],
    ['se paga sobre las ventas, no sobre la ganancia.', 'se paie sur les ventes, pas sur le bénéfice.'],
    ['No hay impuesto general a las ventas', 'Pas de taxe générale sur les ventes'],
    [`¿Hay IVA o impuesto a las ventas en ${D.name}?`, `Y a-t-il une TVA ou une taxe sur les ventes en ${D.name} ?`],
    [`No. ${D.name} no tiene un impuesto general a las ventas. Los costos a planificar son los de la lista de impuestos y aportes de esta página.`, `Non. ${D.name} n’a pas de taxe générale sur les ventes. Les coûts à prévoir sont ceux de la liste d’impôts et de cotisations de cette page.`],
    ['licencias', 'licences'],
    [' desde ', ' de '], [' hasta ', ' jusqu’à '], [' por encima de ', ' au-delà de '], [' tasa única', ' taux unique']
  ];
  pairs.forEach(([a, b]) => { h = h.split(a).join(b); });
  return h;
}


function nlFix(h, D, c) {
  const J = n => E.money(D, n);
  const pairs = [
    ['Sobre la ganancia: ', 'Over de winst: '], ['Aportes: ', 'Premies: '], ['Sobre las ventas: ', 'Over de omzet: '],
    [`Ejemplo: con ${J(c.sales)} de ventas al mes, te quedan unos ${J(c.netMonthly)} al mes después de impuestos.`, `Voorbeeld: bij ${J(c.sales)} omzet per maand houd je ongeveer ${J(c.netMonthly)} per maand over na belasting.`],
    ['Con ', 'Bij '], [' y con ', ' en bij '], ['Primeros pasos: ', 'Eerste stappen: '],
    ['Además del sueldo bruto, el empleador suma: ', 'Naast het brutoloon komt er voor de werkgever bij: '],
    ['Cada mes', 'Elke maand'], ['Ninguna obligatoria para el propietario', 'Geen verplicht voor de eigenaar'], ['Sin impuesto sobre la ganancia', 'Geen belasting over de winst'],
    ['obligatorio desde ', 'verplicht vanaf '], [' de ventas al año', ' omzet per jaar'],
    ['se paga sobre las ventas, no sobre la ganancia.', 'wordt geheven over de omzet, niet over de winst.'],
    ['No hay impuesto general a las ventas', 'Geen algemene omzetbelasting'],
    [`¿Hay IVA o impuesto a las ventas en ${D.name}?`, `Is er btw of omzetbelasting in ${D.name}?`],
    [`No. ${D.name} no tiene un impuesto general a las ventas. Los costos a planificar son los de la lista de impuestos y aportes de esta página.`, `Nee. ${D.name} heeft geen algemene omzetbelasting. De kosten om te plannen staan in de lijst met belastingen en premies op deze pagina.`],
    ['licencias', 'vergunningen'],
    [' desde ', ' vanaf '], [' hasta ', ' tot '], [' por encima de ', ' boven '], [' tasa única', ' vast tarief']
  ];
  pairs.forEach(([a, b]) => { h = h.split(a).join(b); });
  return h;
}

const enList = load('countries.json').countries, esList = load('es/countries.json').countries;
const frList = load('fr/countries.json').countries;
const nlList = load('nl/countries.json').countries;
var ALL_EN = enList, ALL_ES = esList;
const urls = [];
for (const c of enList) { const D = load(c.file); const dir = path.join(ROOT, SLUG[c.id]); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'index.html'), build('en', D)); urls.push({ loc: BASE + SLUG[c.id] + '/', lastmod: D.dataVerifiedOn }); }
for (const c of esList) { const D = load('es/' + c.file); const dir = path.join(ROOT, 'es', SLUG[c.id]); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'index.html'), build('es', D)); urls.push({ loc: BASE + 'es/' + SLUG[c.id] + '/', lastmod: D.dataVerifiedOn }); }
for (const c of frList) { const D = load('fr/' + c.file); const dir = path.join(ROOT, 'fr', SLUG[c.id]); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'index.html'), build('fr', D)); urls.push({ loc: BASE + 'fr/' + SLUG[c.id] + '/', lastmod: D.dataVerifiedOn }); }
for (const c of nlList) { const D = load('nl/' + c.file); const dir = path.join(ROOT, 'nl', SLUG[c.id]); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'index.html'), build('nl', D)); urls.push({ loc: BASE + 'nl/' + SLUG[c.id] + '/', lastmod: D.dataVerifiedOn }); }
fs.writeFileSync(path.join(__dirname, 'page_urls.json'), JSON.stringify(urls, null, 1));
console.log('pages:', urls.length);
fs.writeFileSync(path.join(__dirname, 'slugs.json'), JSON.stringify(SLUG));
