// Pa a Pa Caribbean: partner click count (GoatCounter, no cookies, no personal data).
// Any link with data-partner="name" is counted as the event "caribbean-partner-name".
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-partner]');
    if (!a) return;
    try { if (window.track) window.track('caribbean-partner-' + a.getAttribute('data-partner')); } catch (x) {}
  }, true);
})();
