/* Pa a Pa Caribe: informe de viabilidad en español. Usa el motor de ../engine.js. */
(function (root) {
  'use strict';
  const E = root.PaPaEngine;
  function buildReportEs(D, input) {
    const J = n => E.money(D, n), pct = E.pct, num = E.num;
    const c = E.compute(D, input), be = E.breakEven(D, input), st = E.stress(D, input, 0.8);
    const hasVat = !!D.vat, vs = hasVat ? D.vat.short : '', thr = hasVat ? D.vat.threshold : Infinity;
    const gap = c.netMonthly - c.needs, short = gap < 0;

    let verdict;
    if (c.netMonthly <= 0 || c.netMonthly < 0.5 * c.needs) verdict = 'no';
    else if (short || c.left < 0 || c.motivation < 8 || (c.credit && c.bfr > Math.max(0, c.left))) verdict = 'cond';
    else verdict = 'ok';

    const strengths = [], weaknesses = [], opportunities = [], risks = [], recs = [];

    if (c.margin >= 0.4) strengths.push(`Después del costo de lo que vendes, te queda el ${pct(c.margin)} de cada venta. Eso deja espacio para pagar tus otros gastos.`);
    if (!short && c.sales > 0) strengths.push(`Tu plan cubre lo que necesitas para vivir, después de impuestos y aportes (${J(c.netMonthly)} al mes).`);
    if (c.left >= 0 && c.runway !== null && c.runway >= 3) strengths.push(`Tus ahorros cubren el arranque y unos ${c.runway.toFixed(1)} meses de gastos de vida.`);
    if (c.sales > 0 && c.fixed * 12 / c.annualSales <= 0.2) strengths.push('Tus gastos fijos son pequeños frente a tus ventas, así que los meses lentos duelen menos.');
    if (+input.m3 >= 4) strengths.push('Ya sabes quiénes serán tus primeros clientes.');
    if (c.motivation >= 12) strengths.push(`Tu motivación es fuerte (${c.motivation} de 15).`);
    if (!strengths.length) strengths.push('Ya diste el primer paso: poner cifras a tu idea. Cada respuesta aclara los próximos pasos.');

    if (c.netMonthly <= 0) weaknesses.push(`Tu plan pierde ${J(-c.netMonthly)} al mes después de impuestos. Así como está, no puede pagar tus gastos.`);
    else if (short) weaknesses.push(`Tu plan deja ${J(c.netMonthly)} al mes, es decir ${J(-gap)} menos de lo que necesitas para vivir.`);
    if (c.sales > 0 && c.margin < 0.25) weaknesses.push(`Solo el ${pct(Math.max(0, c.margin))} de cada venta queda después del costo de lo que vendes. Tus precios o tus costos de compra pueden necesitar ajuste.`);
    if (be && c.sales > 0 && be > c.sales * 1.02) weaknesses.push(`Necesitas unos ${J(be)} de ventas al mes para cubrir tus costos, tus impuestos y lo que necesitas para vivir. Planeaste ${J(c.sales)}.`);
    if (c.left < 0) weaknesses.push(`Tus ahorros quedan ${J(-c.left)} por debajo de los costos de arranque.`);
    else if (c.runway !== null && c.runway < 3 && c.needs > 0) weaknesses.push(`Después del arranque, tus ahorros cubrirían solo ${c.runway.toFixed(1)} meses de gastos de vida si dejaras de ingresar.`);
    if (+input.m3 > 0 && +input.m3 <= 2) weaknesses.push('Todavía no sabes quiénes serán tus primeros clientes.');
    if (+input.m1 > 0 && +input.m1 <= 2) weaknesses.push('Los ingresos irregulares te preocupan. Necesitarás una reserva de dinero antes de empezar.');
    if (!weaknesses.length) weaknesses.push('Tus cifras no muestran una debilidad importante. Revísalas cada mes cuando empieces.');

    if (!c.credit) opportunities.push('Tus clientes pagan al momento, así que no tienes que financiar su demora.');
    if (hasVat && thr > 0 && !c.vat) opportunities.push(`Tus ventas anuales están por debajo de ${J(thr)}, así que todavía no tienes que cobrar ${vs}.`);
    if (c.model === 'personal') opportunities.push('Registrar tu negocio te permite emitir comprobantes fiscales, abrir cuentas empresariales y acceder a crédito formal.');
    opportunities.push('Existen programas de apoyo a las micro, pequeñas y medianas empresas (Mipymes). Pregunta qué asesoría y qué financiamiento están abiertos ahora.');

    const stressNote = st.netMonthly <= 0 ? `perderías ${J(-st.netMonthly)} al mes` : `te quedarían unos ${J(st.netMonthly)} al mes${st.netMonthly < c.needs ? ', menos de lo que necesitas para vivir' : ''}`;
    if (c.sales > 0) risks.push(`Si tus ventas bajan un 20 %, ${stressNote}.`);
    if (c.credit && c.bfr > 0) risks.push(`Clientes que pagan tarde: esperar el cobro inmoviliza unos ${J(c.bfr)} de tu propio dinero${c.bfr > Math.max(0, c.left) ? ', más que tus ahorros después del arranque' : ''}.`);
    risks.push(`Aparta unos ${J(c.setAside)} cada mes para impuestos y aportes, para tenerlos listos cuando toque pagar.`);
    if (c.model === 'corporate') risks.push('Tu propio pago o los dividendos de la sociedad no están en estas cifras. Planéalos con un contador.');
    if (c.emp > 0) risks.push('Con empleados, los pagos de nómina vencen todos los meses, incluso en un mes lento.');
    if (hasVat && thr === 0) risks.push(`Debes cobrar ${vs} desde tu primera venta de bienes o servicios gravados, y declararlo cada mes.`);
    else if (hasVat && c.annualSales >= thr * 0.8) risks.push(c.vat ? `Tus ventas superan ${J(thr)} al año: debes registrarte para el ${vs}.` : `Estás cerca del límite de ${vs} de ${J(thr)} al año. Prepárate para el ${vs}.`);

    if (c.netMonthly <= 0 || short || c.margin < 0.25) recs.push(['cost', 'Calcula tu costo real y comprueba que tu precio de venta deja lo suficiente.']);
    if (be && c.sales > 0 && be > c.sales * 1.02) recs.push(['breakeven', 'Cierra la brecha hasta tu punto de equilibrio: sube un precio, baja un costo o planea más ventas.']);
    if (c.credit && c.bfr > 0) recs.push(['cash', 'Reduce el dinero inmovilizado por clientes que pagan tarde.']);
    if (c.left < 0 || (c.runway !== null && c.runway < 3)) recs.push(['savings', 'Construye tu colchón de seguridad antes de empezar.']);
    if (+input.m3 > 0 && +input.m3 <= 2) recs.push(['customers', 'Nombra a tus primeros cinco clientes antes de gastar dinero.']);
    if (c.motivation < 8) recs.push(['motivation', 'Prepárate para los meses difíciles con una prueba pequeña primero.']);
    recs.push(['tax', 'Entiende tus impuestos y aparta dinero cada mes.']);
    if (c.emp > 0) recs.push(['team', 'Aprende lo que un empleador debe pagar cada mes.']);
    if (hasVat && (thr === 0 || c.annualSales >= thr * 0.8)) recs.push(['vat', `Entiende el ${vs} antes de tu primera factura.`]);

    return { c, be, st, verdict, strengths, weaknesses, opportunities, risks, recs: recs.slice(0, 5), gap };
  }
  E.buildReportEs = buildReportEs;
})(typeof window !== 'undefined' ? window : globalThis);
