// Pa a Pa Caribbean: optional e-mail signup + partner click log (Supabase).
// Only the public (publishable) key is used here. The database lets visitors write, never read.
(function () {
  var URL_ = 'https://oneuajfduoeqkxxcwzai.supabase.co/rest/v1/';
  var KEY = 'sb_publishable_X47C1kAI0N2VNJgEWgfLaQ_ZigQU7Re';
  var LANG = (document.documentElement.lang || 'en').slice(0, 2);
  if (['fr', 'en', 'es', 'nl'].indexOf(LANG) < 0) LANG = 'en';
  var T = {
    en: { h: 'One practical tip a week', p: 'Get one short tip a week to start and run your business in the Caribbean, and a note when your country\u2019s figures change. Free.', e: 'Your e-mail', c: 'I agree to receive these e-mails. I can stop at any time.', b: 'Subscribe', ok: 'Thank you. You are on the list.', bad: 'Please enter a valid e-mail and tick the box.', err: 'Something went wrong. Please try again in a moment.', pv: 'Privacy' },
    es: { h: 'Un consejo práctico por semana', p: 'Recibe un consejo corto por semana para emprender y gestionar tu negocio en el Caribe, y un aviso cuando cambien las cifras de tu país. Gratis.', e: 'Tu correo', c: 'Acepto recibir estos correos. Puedo darme de baja cuando quiera.', b: 'Suscribirme', ok: 'Gracias. Ya estás en la lista.', bad: 'Escribe un correo válido y marca la casilla.', err: 'Algo salió mal. Inténtalo de nuevo en un momento.', pv: 'Privacidad' },
    fr: { h: 'Une astuce pratique par semaine', p: 'Recevez une astuce courte par semaine pour créer et gérer votre entreprise dans la Caraïbe, et un message quand les chiffres de votre pays changent. Gratuit.', e: 'Votre e-mail', c: 'J\u2019accepte de recevoir ces e-mails. Je peux me désinscrire à tout moment.', b: 'Je m\u2019abonne', ok: 'Merci. Vous êtes inscrit.', bad: 'Saisissez un e-mail valide et cochez la case.', err: 'Un problème est survenu. Réessayez dans un instant.', pv: 'Confidentialité' },
    nl: { h: 'Elke week één praktische tip', p: 'Ontvang elke week één korte tip om je bedrijf in het Caribisch gebied te starten en te runnen, en een bericht als de cijfers van jouw land veranderen. Gratis.', e: 'Je e-mail', c: 'Ik ga akkoord met het ontvangen van deze e-mails. Ik kan me altijd afmelden.', b: 'Aanmelden', ok: 'Bedankt. Je staat op de lijst.', bad: 'Vul een geldig e-mailadres in en vink het vakje aan.', err: 'Er ging iets mis. Probeer het zo opnieuw.', pv: 'Privacy' }
  }[LANG];
  var track = function (n) { try { if (window.track) window.track(n); } catch (e) {} };
  var ctx = function () { return { country: (window.PAP_COUNTRY || '').toString().toLowerCase().slice(0, 40) || null, lang: LANG }; };

  function post(table, row) {
    return fetch(URL_ + table, {
      method: 'POST', keepalive: true,
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row)
    });
  }
  window.PAP = { post: post };

  // Partner clicks: any link with data-partner="name" is logged (no personal data).
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-partner]');
    if (!a) return;
    var c = ctx();
    post('clicks', { partner: a.getAttribute('data-partner').slice(0, 40), country: c.country, lang: c.lang, page: (location.pathname + location.hash).slice(0, 120) }).catch(function () {});
    track('caribbean-partner-' + a.getAttribute('data-partner'));
  }, true);

  function privacyUrl() { var i = location.pathname.indexOf('/caribbean/'); return i < 0 ? 'privacy/' : location.pathname.slice(0, i + 11) + 'privacy/'; }

  function box() {
    var d = document.createElement('section');
    d.id = 'leadbox'; d.className = 'card'; d.style.marginTop = '14px';
    d.innerHTML = '<h2 style="margin-top:0">' + T.h + '</h2><p>' + T.p + '</p>' +
      '<form novalidate><div class="field"><label for="leademail">' + T.e + '</label><input id="leademail" type="email" inputmode="email" autocomplete="email" maxlength="254"></div>' +
      '<label class="small" style="display:flex;gap:8px;align-items:flex-start;margin:8px 0 12px"><input id="leadconsent" type="checkbox" style="margin-top:3px"><span>' + T.c + ' <a href="' + privacyUrl() + '">' + T.pv + '</a></span></label>' +
      '<button class="btn" type="submit">' + T.b + '</button><p id="leadmsg" class="small muted" role="status" style="margin:8px 0 0"></p></form>';
    d.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var em = d.querySelector('#leademail').value.trim(), ck = d.querySelector('#leadconsent').checked, m = d.querySelector('#leadmsg');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em) || em.length > 254 || !ck) { m.textContent = T.bad; return; }
      var c = ctx(), btn = d.querySelector('button'); btn.disabled = true;
      post('leads', { email: em, country: c.country, lang: c.lang, consent: true, source: 'report' }).then(function (r) {
        if (r.ok || r.status === 409) { m.textContent = T.ok; try { localStorage.setItem('papa-lead', '1'); } catch (x) {} track('caribbean-lead'); setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 4000); }
        else { m.textContent = T.err; btn.disabled = false; }
      }).catch(function () { m.textContent = T.err; btn.disabled = false; });
    });
    return d;
  }

  function place() {
    var v = document.getElementById('view');
    if (!v || !/^#\/report/.test(location.hash) || document.getElementById('leadbox')) return;
    try { if (localStorage.getItem('papa-lead')) return; } catch (e) {}
    if (!v.querySelector('h1,h2')) return;
    var anchor = v.querySelector('.share') || v.querySelector('footer');
    var b = box();
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(b, anchor); else v.appendChild(b);
  }
  function init() {
    var v = document.getElementById('view'); if (!v) return;
    new MutationObserver(place).observe(v, { childList: true });
    window.addEventListener('hashchange', function () { setTimeout(place, 0); });
    place();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
