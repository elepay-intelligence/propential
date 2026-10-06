/* Propential | renders the banner set from a copy config.
   window.BANNERS = { ref, photos, copy, groups } is set by the page. */
(function () {
  var B = window.BANNERS || {};
  var ref = B.ref || 'REF';
  var url = 'https://propential.com.au';
  var C = B.copy || {};
  var PH = B.photos || {};
  var FINE = 'Credit provided by MediPay Holdings Pty Ltd ACL 474336. Subject to lending criteria.';
  var qs = new URLSearchParams(location.search);
  var raw = qs.has('raw');
  var only = window.__ONLY || qs.get('only');

  function mark() {
    var id = 'bg' + Math.random().toString(36).slice(2, 7);
    return '<svg viewBox="0 0 200 210" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECD58C"/><stop offset=".5" stop-color="#D6B15E"/><stop offset="1" stop-color="#B6873A"/></linearGradient></defs>' +
      '<path d="M34 96 L100 36 L166 96" fill="none" stroke="url(#' + id + ')" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M52 92 V162 Q52 174 64 174 H136 Q148 174 148 162 V92" fill="none" stroke="url(#' + id + ')" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M111.49 120 A14 14 0 1 0 88.51 120 L86 154 L114 154 Z" fill="url(#' + id + ')"/></svg>';
  }
  function lock() { return '<span class="lk">' + mark() + '<span class="wm"><b>Prop</b><i>ential</i></span></span>'; }
  function photo(key) { return '<span class="ph" style="background-image:url(\'' + (PH[key] || PH.wide) + '\')"></span><span class="sc"></span>'; }
  function pts() { return '<ul class="pts">' + C.pts.map(function (p) { return '<li><b>' + p[0] + '</b>' + (p[1] ? '<span>' + p[1] + '</span>' : '') + '</li>'; }).join('') + '</ul>'; }
  function stats() { return '<ul class="stats">' + C.stats.map(function (s) { return '<li><span class="v">' + s[0] + '</span><span class="l">' + s[1] + '</span></li>'; }).join('') + '</ul>'; }
  function qr() { return '<span class="qr"><img src="' + (B.qr || '../assets/qr-propential.png') + '" alt="Scan for propential.com.au"></span>'; }

  /* horizontal strip: copy left, CTA right, photo bleeding underneath */
  function strip(size, o) {
    return '<a class="bnr strip b' + size + '" href="' + url + '" target="_blank" rel="noopener">' + photo(o.photo) +
      '<span class="body">' + lock() +
        '<span class="hd">' + (o.short ? C.headShort : C.head) + '</span>' + pts() + '</span>' +
      '<span class="side"><span class="cta">' + C.cta + ' &rsaquo;</span><span class="fine">' + FINE + ' &middot; propential.com.au</span></span></a>';
  }
  /* upright block: lockup top, kicker + headline + stat rows, CTA + QR base */
  function block(size, o) {
    var mid = o.pts ? pts() : stats();
    return '<a class="bnr block b' + size + '" href="' + url + '" target="_blank" rel="noopener">' + photo(o.photo) +
      '<span class="body">' + lock() +
        '<span class="kick">' + C.kick + '</span>' +
        '<span class="hd">' + C.head + '</span>' + mid + '</span>' +
      '<span class="side"><span class="foot"><span class="cta">' + C.cta + ' &rsaquo;</span>' + qr() + '</span>' +
      '<span class="fine">' + FINE + ' &middot; propential.com.au</span></span></a>';
  }

  var LAYOUT = {
    '600x160': function () { return strip('600x160', { photo: 'strip' }); },
    '600x100': function () { return strip('600x100', { photo: 'strip', short: true }); },
    '468x120': function () { return strip('468x120', { photo: 'strip', short: true }); },
    '1200x250': function () { return strip('1200x250', { photo: 'wide' }); },
    '970x250': function () { return strip('970x250', { photo: 'wide' }); },
    '300x600': function () { return block('300x600', { photo: 'tower' }); },
    '1080x1080': function () { return block('1080x1080', { photo: 'square' }); },
    '1200x628': function () { return block('1200x628', { photo: 'wide', pts: true }); },
    '1080x1920': function () { return block('1080x1920', { photo: 'story' }); }
  };

  if (only) {
    document.querySelectorAll('.pagehead, footer.grp').forEach(function (el) { el.remove(); });
    document.querySelectorAll('.grp').forEach(function (el) { if (el.id !== only) el.remove(); });
  }
  if (raw) document.querySelectorAll('.pagehead, footer.grp, .meta, .grp > .wrap > p, .grp h2').forEach(function (el) { el.remove(); });

  (B.groups || []).forEach(function (g) {
    var host = document.querySelector('[data-group="' + g.id + '"]');
    if (!host) return;
    host.innerHTML = g.items.map(function (it) {
      var wh = it.size.split('x').map(Number);
      return '<div class="item"><div class="meta"><h3>' + it.title + '</h3><span class="dim">' + it.size + ' px</span><span class="note">' + it.note + '</span></div>' +
        '<div class="stage" data-w="' + wh[0] + '" data-h="' + wh[1] + '">' + LAYOUT[it.size]() + '</div></div>';
    }).join('');
  });

  function fit() {
    document.querySelectorAll('.stage').forEach(function (s) {
      var w = +s.dataset.w, h = +s.dataset.h;
      var k = raw ? 1 : Math.min(1, s.parentElement.clientWidth / w);
      s.style.height = Math.round(h * k) + 'px';
      s.firstElementChild.style.transform = 'scale(' + k + ')';
    });
  }
  fit();
  window.addEventListener('resize', fit);
  document.fonts && document.fonts.ready.then(fit);
})();
