// Pa a Pa : mesure d'audience GoatCounter (sans cookies).
// Une seule chose à changer : remplacez TONCODE par le code choisi sur goatcounter.com
(function(){
  var CODE = 'pa-a-pa';
  window.track = function(){};
  if (CODE === 'TONCODE') return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://' + CODE + '.goatcounter.com/count');
  document.head.appendChild(s);
  window.track = function(name){
    try { if (sessionStorage.getItem('t:' + name)) return; sessionStorage.setItem('t:' + name, '1'); } catch(e){}
    var n = 0;
    (function try_(){
      try {
        if (window.goatcounter && window.goatcounter.count) { window.goatcounter.count({ path: name, title: name, event: true }); return; }
      } catch(e){ return; }
      if (++n < 20) setTimeout(try_, 500);
    })();
  };
})();
