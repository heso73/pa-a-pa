/* Pa a Pa Caraïbe : rapport de viabilité en français. Utilise le moteur de ../engine.js. */
(function (root) {
  'use strict';
  const E = root.PaPaEngine;
  function buildReportFr(D, input) {
    const J = n => E.money(D, n), pct = E.pct, num = E.num;
    const c = E.compute(D, input), be = E.breakEven(D, input), st = E.stress(D, input, 0.8);
    const hasVat = !!D.vat, vs = hasVat ? D.vat.short : '', thr = hasVat ? D.vat.threshold : Infinity;
    const gap = c.netMonthly - c.needs, short = gap < 0;

    let verdict;
    if (c.netMonthly <= 0 || c.netMonthly < 0.5 * c.needs) verdict = 'no';
    else if (short || c.left < 0 || c.motivation < 8 || (c.credit && c.bfr > Math.max(0, c.left))) verdict = 'cond';
    else verdict = 'ok';

    const strengths = [], weaknesses = [], opportunities = [], risks = [], recs = [];

    if (c.margin >= 0.4) strengths.push(`Après le coût de ce que vous vendez, il vous reste ${pct(c.margin)} de chaque vente. Cela laisse de la place pour payer vos autres dépenses.`);
    if (!short && c.sales > 0) strengths.push(`Votre plan couvre ce dont vous avez besoin pour vivre, après impôts et cotisations (${J(c.netMonthly)} par mois).`);
    if (c.left >= 0 && c.runway !== null && c.runway >= 3) strengths.push(`Vos économies couvrent le démarrage et environ ${c.runway.toFixed(1)} mois de dépenses de vie.`);
    if (c.sales > 0 && c.fixed * 12 / c.annualSales <= 0.2) strengths.push('Vos charges fixes sont faibles par rapport à vos ventes : les mois lents font donc moins mal.');
    if (+input.m3 >= 4) strengths.push('Vous savez déjà qui seront vos premiers clients.');
    if (c.motivation >= 12) strengths.push(`Votre motivation est forte (${c.motivation} sur 15).`);
    if (!strengths.length) strengths.push('Vous avez fait le premier pas : mettre des chiffres sur votre idée. Chaque réponse clarifie les prochaines étapes.');

    if (c.netMonthly <= 0) weaknesses.push(`Votre plan perd ${J(-c.netMonthly)} par mois après impôts. En l’état, il ne peut pas payer vos dépenses.`);
    else if (short) weaknesses.push(`Votre plan laisse ${J(c.netMonthly)} par mois, soit ${J(-gap)} de moins que ce dont vous avez besoin pour vivre.`);
    if (c.sales > 0 && c.margin < 0.25) weaknesses.push(`Seulement ${pct(Math.max(0, c.margin))} de chaque vente reste après le coût de ce que vous vendez. Vos prix ou vos coûts d’achat peuvent demander un ajustement.`);
    if (be && c.sales > 0 && be > c.sales * 1.02) weaknesses.push(`Il vous faut environ ${J(be)} de ventes par mois pour couvrir vos coûts, vos impôts et ce dont vous avez besoin pour vivre. Vous avez prévu ${J(c.sales)}.`);
    if (c.left < 0) weaknesses.push(`Vos économies sont ${J(-c.left)} en dessous des coûts de démarrage.`);
    else if (c.runway !== null && c.runway < 3 && c.needs > 0) weaknesses.push(`Après le démarrage, vos économies ne couvriraient que ${c.runway.toFixed(1)} mois de dépenses de vie si vous ne receviez plus de revenus.`);
    if (+input.m3 > 0 && +input.m3 <= 2) weaknesses.push('Vous ne savez pas encore qui seront vos premiers clients.');
    if (+input.m1 > 0 && +input.m1 <= 2) weaknesses.push('Les revenus irréguliers vous inquiètent. Il vous faudra une réserve d’argent avant de commencer.');
    if (!weaknesses.length) weaknesses.push('Vos chiffres ne montrent pas de faiblesse importante. Vérifiez-les chaque mois une fois lancé.');

    if (!c.credit) opportunities.push('Vos clients paient sur le moment : vous n’avez donc pas à financer leurs retards.');
    if (hasVat && thr > 0 && !c.vat) opportunities.push(`Vos ventes annuelles sont sous ${J(thr)} : vous n’avez donc pas encore à facturer la ${vs}.`);
    if (c.model === 'personal') opportunities.push('Enregistrer votre entreprise vous permet d’émettre des factures, d’ouvrir des comptes professionnels et d’accéder au crédit formel.');
    opportunities.push('Des programmes de soutien aux micro, petites et moyennes entreprises existent. Demandez quels conseils et quels financements sont ouverts en ce moment.');

    const stressNote = st.netMonthly <= 0 ? `vous perdriez ${J(-st.netMonthly)} par mois` : `il vous resterait environ ${J(st.netMonthly)} par mois${st.netMonthly < c.needs ? ', moins que ce dont vous avez besoin pour vivre' : ''}`;
    if (c.sales > 0) risks.push(`Si vos ventes baissent de 20 %, ${stressNote}.`);
    if (c.credit && c.bfr > 0) risks.push(`Clients qui paient en retard : attendre l’encaissement immobilise environ ${J(c.bfr)} de votre propre argent${c.bfr > Math.max(0, c.left) ? ', plus que vos économies après le démarrage' : ''}.`);
    risks.push(`Mettez de côté environ ${J(c.setAside)} chaque mois pour les impôts et cotisations, afin de les avoir prêts au moment de payer.`);
    if (c.model === 'corporate') risks.push('Votre propre rémunération ou les dividendes de la société ne figurent pas dans ces chiffres. Planifiez-les avec un comptable.');
    if (c.emp > 0) risks.push('Avec des employés, les paiements de paie tombent tous les mois, même un mois lent.');
    if (hasVat && thr === 0) risks.push(`Vous devez facturer la ${vs} dès votre première vente de biens ou services taxables, et la déclarer chaque mois.`);
    else if (hasVat && c.annualSales >= thr * 0.8) risks.push(c.vat ? `Vos ventes dépassent ${J(thr)} par an : vous devez vous inscrire à la ${vs}.` : `Vous approchez du seuil de la ${vs} de ${J(thr)} par an. Préparez-vous à la ${vs}.`);

    if (c.netMonthly <= 0 || short || c.margin < 0.25) recs.push(['cost', 'Calculez votre coût réel et vérifiez que votre prix de vente laisse assez.']);
    if (be && c.sales > 0 && be > c.sales * 1.02) recs.push(['breakeven', 'Comblez l’écart jusqu’à votre seuil de rentabilité : augmentez un prix, baissez un coût ou prévoyez plus de ventes.']);
    if (c.credit && c.bfr > 0) recs.push(['cash', 'Réduisez l’argent immobilisé par les clients qui paient en retard.']);
    if (c.left < 0 || (c.runway !== null && c.runway < 3)) recs.push(['savings', 'Construisez votre matelas de sécurité avant de commencer.']);
    if (+input.m3 > 0 && +input.m3 <= 2) recs.push(['customers', 'Nommez vos cinq premiers clients avant de dépenser de l’argent.']);
    if (c.motivation < 8) recs.push(['motivation', 'Préparez-vous aux mois difficiles avec d’abord un petit test.']);
    recs.push(['tax', 'Comprenez vos impôts et mettez de l’argent de côté chaque mois.']);
    if (c.emp > 0) recs.push(['team', 'Apprenez ce qu’un employeur doit payer chaque mois.']);
    if (hasVat && (thr === 0 || c.annualSales >= thr * 0.8)) recs.push(['vat', `Comprenez la ${vs} avant votre première facture.`]);

    return { c, be, st, verdict, strengths, weaknesses, opportunities, risks, recs: recs.slice(0, 5), gap };
  }
  E.buildReportFr = buildReportFr;
})(typeof window !== 'undefined' ? window : globalThis);
