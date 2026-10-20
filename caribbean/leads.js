// Pa a Pa Caribbean: partner click count (GoatCounter, no cookies, no personal data).
// Any link with data-partner="name" is counted as the event "caribbean-partner-name".
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-partner]');
    if (!a) return;
    try { if (window.track) window.track('caribbean-partner-' + a.getAttribute('data-partner')); } catch (x) {}
  }, true);
})();
// Optional founder-tips form (Brevo): the iframe loads only after the visitor taps the button.
(function () {
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-nlopen]');
    if (!b) return;
    var box = b.parentNode.querySelector('.nlbox');
    if (!box || box.firstChild) return;
    var f = document.createElement('iframe');
    f.src = b.getAttribute('data-nlopen');
    f.title = b.textContent.trim();
    box.appendChild(f);
    b.hidden = true;
    try { if (window.track) window.track('caribbean-astuces-ouvert'); } catch (x) {}
  }, true);
})();
