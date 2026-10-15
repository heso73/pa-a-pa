// Pa a Pa Caribbean: partner links and PDF export on the report page.
// Dormant by default: nothing is shown until partners.json has an active partner with an https link,
// or a PDF checkout link. Clicks on partner links are logged by leads.js through the data-partner attribute.
(function () {
  var LANG = (document.documentElement.lang || 'en').slice(0, 2);
  if (['fr', 'en', 'es', 'nl'].indexOf(LANG) < 0) LANG = 'en';
  var T = {
    en: { ph: 'Services that can help you start', disc: 'Pa a Pa may earn a commission if you sign up through these links, at no extra cost to you.', cta: 'Learn more',
          pt: 'Your report as a PDF', pp: 'A clean, printable copy of your viability report to keep or share with a bank or adviser.', get: 'Get the PDF', dl: 'Download PDF',
          head: 'Viability report', foot: 'Estimates for orientation only. Not tax, legal or financial advice. Made with Pa a Pa Caribbean.' },
    es: { ph: 'Servicios que pueden ayudarte a empezar', disc: 'Pa a Pa puede recibir una comisión si te registras a través de estos enlaces, sin costo adicional para ti.', cta: 'Ver más',
          pt: 'Tu informe en PDF', pp: 'Una copia limpia e imprimible de tu informe de viabilidad para guardar o compartir con un banco o asesor.', get: 'Obtener el PDF', dl: 'Descargar PDF',
          head: 'Informe de viabilidad', foot: 'Estimaciones orientativas. No es asesoría fiscal, legal ni financiera. Hecho con Pa a Pa Caribe.' },
    fr: { ph: 'Des services pour vous aider à démarrer', disc: 'Pa a Pa peut toucher une commission si vous vous inscrivez via ces liens, sans frais supplémentaires pour vous.', cta: 'En savoir plus',
          pt: 'Votre rapport en PDF', pp: 'Une copie propre et imprimable de votre rapport de viabilité, à garder ou à remettre à une banque ou à un conseiller.', get: 'Obtenir le PDF', dl: 'Télécharger le PDF',
          head: 'Rapport de viabilité', foot: 'Estimations d’orientation. Ne remplace pas un conseil fiscal, juridique ou financier. Réalisé avec Pa a Pa Caraïbe.' },
    nl: { ph: 'Diensten die je op weg helpen', disc: 'Pa a Pa kan een commissie ontvangen als je je via deze links aanmeldt, zonder extra kosten voor jou.', cta: 'Meer info',
          pt: 'Je rapport als PDF', pp: 'Een nette, afdrukbare kopie van je haalbaarheidsrapport om te bewaren of aan een bank of adviseur te geven.', get: 'PDF kopen', dl: 'PDF downloaden',
          head: 'Haalbaarheidsrapport', foot: 'Schattingen ter oriëntatie. Geen fiscaal, juridisch of financieel advies. Gemaakt met Pa a Pa Caraïben.' }
  }[LANG];

  var cfg = null;
  var track = function (n) { try { if (window.track) window.track(n); } catch (e) {} };
  var isHttps = function (u) { return typeof u === 'string' && /^https:\/\/[^\s]+$/i.test(u); };
  var base = function () { var i = location.pathname.indexOf('/caribbean/'); return i < 0 ? '' : location.pathname.slice(0, i + 11); };
  var pick = function (o) { return o && (o[LANG] || o.en) || ''; };

  try { if (/[?&]pdf=1(&|$)/.test(location.search)) { localStorage.setItem('papa-pdf', '1'); track('caribbean-pdf-paid'); } } catch (e) {}
  var unlocked = function () { try { return localStorage.getItem('papa-pdf') === '1'; } catch (e) { return false; } };

  function el(tag, props, kids) {
    var n = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) { if (k === 'text') n.textContent = props[k]; else n.setAttribute(k, props[k]); });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function activePartners() {
    var c = (window.PAP_COUNTRY || '').toString().toUpperCase();
    return ((cfg && cfg.partners) || []).filter(function (p) {
      if (!p || p.active !== true || !isHttps(p.url) || !p.name || !/^[a-z0-9-]{1,40}$/.test(p.id || '')) return false;
      var cs = (p.countries || ['*']).map(function (x) { return String(x).toUpperCase(); });
      return cs.indexOf('*') >= 0 || (c && cs.indexOf(c) >= 0);
    });
  }

  function partnerBox(list) {
    var rows = list.map(function (p) {
      var a = el('a', { href: p.url, target: '_blank', rel: 'sponsored nofollow noopener', 'data-partner': p.id, class: 'btn link', text: pick(p.cta) || T.cta });
      return el('div', { style: 'margin:12px 0' }, [el('b', { text: p.name }), pick(p.text) ? el('p', { style: 'margin:4px 0 6px', text: pick(p.text) }) : null, a]);
    });
    return el('section', { id: 'partnerbox', class: 'card', style: 'margin-top:14px' },
      [el('h2', { style: 'margin-top:0', text: T.ph })].concat(rows, [el('p', { class: 'small muted', style: 'margin:8px 0 0', text: T.disc })]));
  }

  function pdfBox() {
    var url = cfg && cfg.pdf && cfg.pdf.checkout_url;
    if (!isHttps(url)) return null;
    var price = cfg.pdf.price ? ' · ' + String(cfg.pdf.price).slice(0, 20) : '';
    var action;
    if (unlocked()) {
      action = el('button', { type: 'button', class: 'btn', text: T.dl });
      action.addEventListener('click', function () { track('caribbean-pdf-download'); window.print(); });
    } else {
      action = el('a', { href: url, target: '_blank', rel: 'noopener', 'data-partner': 'pdf-checkout', class: 'btn', text: T.get + price });
    }
    return el('section', { id: 'pdfbox', class: 'card', style: 'margin-top:14px' },
      [el('h2', { style: 'margin-top:0', text: T.pt }), el('p', { text: T.pp }), action]);
  }

  function printHead() {
    var now = new Date().toISOString().slice(0, 10);
    return el('div', { id: 'printhead' }, [
      el('div', { class: 'ph-t', text: 'Pa a Pa Caribbean · ' + T.head + ' · ' + (window.PAP_COUNTRY || '') + ' · ' + now }),
      el('div', { class: 'ph-f', text: T.foot })
    ]);
  }

  function place() {
    var v = document.getElementById('view');
    if (!v || !/^#\/report/.test(location.hash) || !cfg || !v.querySelector('h1,h2')) return;
    if (!document.getElementById('printhead')) v.insertBefore(printHead(), v.firstChild);
    var anchor = document.getElementById('leadbox') || v.querySelector('.share') || v.querySelector('footer');
    var add = function (node) { if (!node) return; if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(node, anchor); else v.appendChild(node); };
    if (!document.getElementById('partnerbox')) { var list = activePartners(); if (list.length) add(partnerBox(list)); }
    if (!document.getElementById('pdfbox')) add(pdfBox());
  }

  function css() {
    var s = document.createElement('style');
    s.textContent = '#printhead{display:none}' +
      '@media print{#printhead{display:block;margin:0 0 16px;padding-bottom:8px;border-bottom:1px solid #999}#printhead .ph-t{font-weight:700}#printhead .ph-f{font-size:.8em;margin-top:2px}' +
      '#partnerbox,#pdfbox,#leadbox,.share,.chips,.btnrow,#coachbox,button,.btn{display:none!important}body{background:#fff!important}a{color:inherit;text-decoration:none}}';
    document.head.appendChild(s);
  }

  function init() {
    css();
    fetch(base() + 'partners.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (c) {
      cfg = c;
      var v = document.getElementById('view'); if (!v) return;
      new MutationObserver(place).observe(v, { childList: true });
      window.addEventListener('hashchange', function () { setTimeout(place, 0); });
      place();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
