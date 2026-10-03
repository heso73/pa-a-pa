/* Pa a Pa Caraïben: haalbaarheidsrapport in het Nederlands. Gebruikt het rekenmodel in ../engine.js. */
(function (root) {
  'use strict';
  const E = root.PaPaEngine;
  function buildReportNl(D, input) {
    const J = n => E.money(D, n), pct = E.pct, num = E.num;
    const c = E.compute(D, input), be = E.breakEven(D, input), st = E.stress(D, input, 0.8);
    const hasVat = !!D.vat, vs = hasVat ? D.vat.short : '', thr = hasVat ? D.vat.threshold : Infinity;
    const gap = c.netMonthly - c.needs, short = gap < 0;

    let verdict;
    if (c.netMonthly <= 0 || c.netMonthly < 0.5 * c.needs) verdict = 'no';
    else if (short || c.left < 0 || c.motivation < 8 || (c.credit && c.bfr > Math.max(0, c.left))) verdict = 'cond';
    else verdict = 'ok';

    const strengths = [], weaknesses = [], opportunities = [], risks = [], recs = [];

    if (c.margin >= 0.4) strengths.push(`Na de kosten van wat je verkoopt houd je ${pct(c.margin)} van elke verkoop over. Dat geeft ruimte om je andere kosten te betalen.`);
    if (!short && c.sales > 0) strengths.push(`Je plan dekt wat je nodig hebt om van te leven, na belastingen en premies (${J(c.netMonthly)} per maand).`);
    if (c.left >= 0 && c.runway !== null && c.runway >= 3) strengths.push(`Je spaargeld dekt de start en ongeveer ${c.runway.toFixed(1)} maanden levensonderhoud.`);
    if (c.sales > 0 && c.fixed * 12 / c.annualSales <= 0.2) strengths.push('Je vaste kosten zijn klein ten opzichte van je omzet, dus trage maanden doen minder pijn.');
    if (+input.m3 >= 4) strengths.push('Je weet al wie je eerste klanten worden.');
    if (c.motivation >= 12) strengths.push(`Je motivatie is sterk (${c.motivation} van 15).`);
    if (!strengths.length) strengths.push('Je hebt de eerste stap gezet: cijfers bij je idee zetten. Elk antwoord maakt de volgende stappen duidelijker.');

    if (c.netMonthly <= 0) weaknesses.push(`Je plan verliest ${J(-c.netMonthly)} per maand na belasting. Zoals het er nu uitziet kan het je kosten niet betalen.`);
    else if (short) weaknesses.push(`Je plan laat ${J(c.netMonthly)} per maand over, dat is ${J(-gap)} minder dan je nodig hebt om van te leven.`);
    if (c.sales > 0 && c.margin < 0.25) weaknesses.push(`Slechts ${pct(Math.max(0, c.margin))} van elke verkoop blijft over na de kosten van wat je verkoopt. Je prijzen of je inkoopkosten hebben misschien aanpassing nodig.`);
    if (be && c.sales > 0 && be > c.sales * 1.02) weaknesses.push(`Je hebt ongeveer ${J(be)} omzet per maand nodig om je kosten, je belastingen en je levensonderhoud te dekken. Je plande ${J(c.sales)}.`);
    if (c.left < 0) weaknesses.push(`Je spaargeld ligt ${J(-c.left)} onder de opstartkosten.`);
    else if (c.runway !== null && c.runway < 3 && c.needs > 0) weaknesses.push(`Na de start dekt je spaargeld slechts ${c.runway.toFixed(1)} maanden levensonderhoud als er geen inkomen meer binnenkomt.`);
    if (+input.m3 > 0 && +input.m3 <= 2) weaknesses.push('Je weet nog niet wie je eerste klanten worden.');
    if (+input.m1 > 0 && +input.m1 <= 2) weaknesses.push('Een wisselend inkomen maakt je ongerust. Je hebt een geldreserve nodig voordat je begint.');
    if (!weaknesses.length) weaknesses.push('Je cijfers laten geen grote zwakte zien. Controleer ze elke maand zodra je begint.');

    if (!c.credit) opportunities.push('Je klanten betalen direct, dus je hoeft hun betaaltermijn niet voor te financieren.');
    if (hasVat && thr > 0 && !c.vat) opportunities.push(`Je jaaromzet blijft onder ${J(thr)}, dus je hoeft nog geen ${vs} in rekening te brengen.`);
    if (c.model === 'personal') opportunities.push('Je bedrijf inschrijven maakt het mogelijk facturen uit te schrijven, zakelijke rekeningen te openen en formeel krediet te krijgen.');
    opportunities.push('Er bestaan steunprogramma’s voor micro-, kleine en middelgrote bedrijven. Vraag welk advies en welke financiering nu beschikbaar zijn.');

    const stressNote = st.netMonthly <= 0 ? `zou je ${J(-st.netMonthly)} per maand verliezen` : `zou je ongeveer ${J(st.netMonthly)} per maand overhouden${st.netMonthly < c.needs ? ', minder dan je nodig hebt om van te leven' : ''}`;
    if (c.sales > 0) risks.push(`Als je omzet met 20 % daalt, ${stressNote}.`);
    if (c.credit && c.bfr > 0) risks.push(`Klanten die te laat betalen: wachten op betaling legt ongeveer ${J(c.bfr)} van je eigen geld vast${c.bfr > Math.max(0, c.left) ? ', meer dan je spaargeld na de start' : ''}.`);
    risks.push(`Zet elke maand ongeveer ${J(c.setAside)} opzij voor belastingen en premies, zodat het klaarstaat als je moet betalen.`);
    if (c.model === 'corporate') risks.push('Je eigen beloning of de dividenden van de vennootschap zitten niet in deze cijfers. Plan ze met een boekhouder.');
    if (c.emp > 0) risks.push('Met medewerkers zijn de loonbetalingen elke maand verschuldigd, ook in een trage maand.');
    if (hasVat && thr === 0) risks.push(`Je moet vanaf je eerste verkoop van belaste goederen of diensten ${vs} in rekening brengen en daar elke maand aangifte van doen.`);
    else if (hasVat && c.annualSales >= thr * 0.8) risks.push(c.vat ? `Je omzet komt boven ${J(thr)} per jaar: je moet je inschrijven voor ${vs}.` : `Je zit dicht bij de ${vs}-grens van ${J(thr)} per jaar. Bereid je voor op ${vs}.`);

    if (c.netMonthly <= 0 || short || c.margin < 0.25) recs.push(['cost', 'Reken je echte kostprijs uit en controleer of je verkoopprijs genoeg overlaat.']);
    if (be && c.sales > 0 && be > c.sales * 1.02) recs.push(['breakeven', 'Dicht de kloof naar je break-evenpunt: verhoog een prijs, verlaag een kostenpost of plan meer omzet.']);
    if (c.credit && c.bfr > 0) recs.push(['cash', 'Verminder het geld dat vastzit bij klanten die te laat betalen.']);
    if (c.left < 0 || (c.runway !== null && c.runway < 3)) recs.push(['savings', 'Bouw je financiële buffer op voordat je begint.']);
    if (+input.m3 > 0 && +input.m3 <= 2) recs.push(['customers', 'Noem je eerste vijf klanten voordat je geld uitgeeft.']);
    if (c.motivation < 8) recs.push(['motivation', 'Bereid je voor op de moeilijke maanden met eerst een kleine test.']);
    recs.push(['tax', 'Begrijp je belastingen en zet elke maand geld opzij.']);
    if (c.emp > 0) recs.push(['team', 'Leer wat een werkgever elke maand moet betalen.']);
    if (hasVat && (thr === 0 || c.annualSales >= thr * 0.8)) recs.push(['vat', `Begrijp ${vs} vóór je eerste factuur.`]);

    return { c, be, st, verdict, strengths, weaknesses, opportunities, risks, recs: recs.slice(0, 5), gap };
  }
  E.buildReportNl = buildReportNl;
})(typeof window !== 'undefined' ? window : globalThis);
