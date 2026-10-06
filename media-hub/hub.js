/* Propential Partner Media Hub: generic renderer.
   window.HUB (asset manifest) drives everything. Every link and QR code opens the
   standard Propential website; there is no per-partner code or name. */
(function () {
  var P = window.PARTNER || {}, HUB = window.HUB || {};
  var base = P.siteUrl || 'https://propential.com.au';
  var refUrl = base;

  /* ---------- toast ---------- */
  var toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast);
  var tTimer;
  function say(msg) {
    toast.textContent = msg; toast.classList.add('is-up');
    clearTimeout(tTimer); tTimer = setTimeout(function () { toast.classList.remove('is-up'); }, 2600);
  }
  function flash(btn, msg) {
    var t = btn.dataset.label || btn.textContent;
    btn.dataset.label = t; btn.textContent = msg;
    setTimeout(function () { btn.textContent = btn.dataset.label; }, 1500);
  }
  function copyLink(btn, url) { navigator.clipboard.writeText(url).then(function () { flash(btn, 'Copied'); }); }
  document.querySelectorAll('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { copyLink(b, refUrl); }); });

  /* ---------- download ----------
     Opens the generic marketing file with ?print=1, which fires the print
     dialog so the partner saves a PDF.  */
  /* Works both from the file system and from a single-file bundle: decks
     download their .pptx directly; documents open in the preview modal and
     fire the print dialog, so the partner saves a real PDF. */
  function dl(id) {
    var a = item(id);
    if (a.sizes) {
      var pf = a.view.slice(0, 2);
      a.sizes.forEach(function (s, i) { setTimeout(function () { pngDl(pf + '-' + s.dim.replace('\u00d7', 'x')); }, i * 500); });
      return;
    }
    if (a.dlHref) {
      var el = document.createElement('a');
      el.href = a.dlHref; el.download = a.dlName || '';
      document.body.appendChild(el); el.click(); el.remove();
      say('Downloading ' + (a.dlName || a.title) + '.');
      return;
    }
    if ((a.view || '').indexOf('../share/') === 0) { dlFormat(id, 'pdf'); return; }
    var pdf = (window.ASSET_PDF || {})[a.view];
    if (pdf) {
      var pe = document.createElement('a');
      pe.href = pdf; pe.download = 'Propential - ' + a.title + '.pdf';
      document.body.appendChild(pe); pe.click(); pe.remove();
      say('Downloading ' + a.title + ' as a PDF.');
      return;
    }
    open(id);
    say('Save it as a PDF from the print dialog.');
    setTimeout(function () {
      try { mFrame.contentWindow.focus(); mFrame.contentWindow.print(); }
      catch (e) { window.open(a.view, '_blank', 'noopener'); }
    }, 900);
  }

  /* Pitch decks and packs: two formats, both embedded in the page. */
  function dlFormat(id, fmt) {
    var a = item(id), f = (window.DECK_DL || {})[a.view];
    var src = f && f[fmt];
    if (!src) { src = a.view.replace(/\.html$/, '.' + fmt); }
    var el = document.createElement('a');
    el.href = src; el.download = 'Propential - ' + a.title + (fmt === 'pptx' ? '.pptx' : '.pdf');
    document.body.appendChild(el); el.click(); el.remove();
    say('Downloading ' + a.title + ' as ' + (fmt === 'pptx' ? 'a PowerPoint.' : 'a PDF.'));
  }

  /* Opens the real marketing file in its own tab. In a single-file bundle the
     sibling HTML is not fetchable by path, so re-serve the loaded document. */
  function openTab(id) {
    var a = item(id);
    if (INLINE[a.view]) {
      var u = URL.createObjectURL(new Blob([INLINE[a.view]], { type: 'text/html' }));
      window.open(u, '_blank');
      setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
      return;
    }
    var frame = document.querySelector('.card[data-id="' + id + '"] iframe') ||
      (modal.classList.contains('is-open') ? mFrame : null);
    try {
      var doc = frame && frame.contentDocument;
      if (doc) {
        var html = '<!DOCTYPE html>' + doc.documentElement.outerHTML;
        var url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
        var w = window.open(url, '_blank');
        if (w) { setTimeout(function () { URL.revokeObjectURL(url); }, 60000); return; }
      }
    } catch (e) {}
    window.open(a.view, '_blank', 'noopener');
  }

  /* Single-file build: sibling pages (how-to guide and the documents it links to) are
     embedded in ASSET_HTML and shown in a full-screen overlay, so no pop-ups or extra files. */
  var guide = null, guideFrame = null;
  var GUIDE_JS = '<script>document.addEventListener("click",function(e){var a=e.target.closest("a[href]");if(!a)return;var h=a.getAttribute("href");if(/^(#|mailto:|https?:|tel:)/.test(h))return;e.preventDefault();parent.postMessage({propGuide:h},"*")});<\/script>';
  function guideShow(key) {
    var html = window.ASSET_HTML[key];
    if (!guide) {
      guide = document.createElement('div');
      guide.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0E0F0D';
      guideFrame = document.createElement('iframe');
      guideFrame.style.cssText = 'width:100%;height:100%;border:0;display:block;background:#0E0F0D';
      guide.appendChild(guideFrame); document.body.appendChild(guide);
      document.body.style.overflow = 'hidden';
    }
    guideFrame.srcdoc = html.replace('</body>', GUIDE_JS + '</body>');
  }
  function guideClose() { if (guide) { guide.remove(); guide = guideFrame = null; document.body.style.overflow = ''; } }
  window.addEventListener('message', function (e) {
    var k = e.data && e.data.propGuide; if (!k) return;
    if (/^index-/.test(k)) { guideClose(); return; }
    if (window.ASSET_HTML && window.ASSET_HTML[k]) guideShow(k);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && guide) guideClose(); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]'); if (!a) return;
    var href = a.getAttribute('href');
    if (/^how-to-/.test(href) && window.ASSET_HTML && window.ASSET_HTML[href]) { e.preventDefault(); guideShow(href); }
  });

  var sections = HUB.sections || [];
  var host = document.getElementById('hub-sections');
  if (!host) return;

  function esc(s) { return String(s).replace(/"/g, '&quot;'); }
  function card(a, si, ii) {
    var id = si + '.' + ii;
    var nat = a.natural || (a.shape === 'land' ? [1123, 794] : [794, 1123]);
    var pfx = (a.view || '').slice(0, 2);
    var sizes = (a.sizes || []).map(function (s) {
      var key = pfx + '-' + s.dim.replace('\u00d7', 'x');
      return '<div class="size"><span class="dim">' + s.dim + '</span><span class="lbl">' + s.label + '</span>' +
        '<button class="linkbtn" data-png="' + key + '">PNG</button>' +
        (a.snippet ? '<button class="linkbtn" data-snip="' + key + '">HTML</button>' : '') + '</div>';
    }).join('');
    return '<article class="card" data-id="' + id + '" data-search="' + esc((a.title + ' ' + a.desc + ' ' + a.use + ' ' + (a.specs || []).join(' ')).toLowerCase()) + '">' +
      '<label class="pick"><input type="checkbox" data-pick="' + id + '" aria-label="Select ' + esc(a.title) + '">Select</label>' +
      '<div class="thumb thumb--' + (a.shape || 'port') + '" data-open="' + id + '" data-nat="' + nat[0] + ',' + nat[1] + '" role="button" tabindex="0" aria-label="Preview ' + esc(a.title) + '">' +
        (a.badge ? '<span class="badge">' + a.badge + '</span>' : '') +
        '<iframe data-view="' + esc(a.preview || a.view) + '" title="' + esc(a.title) + ' preview" loading="lazy" scrolling="no" tabindex="-1"></iframe>' +
        '<span class="zoom"><span>Preview</span></span>' +
      '</div>' +
      '<div class="card__b">' +
        '<h3>' + a.title + (a.internal ? '<span class="tag-int">Internal only</span>' : '') + '</h3>' +
        '<p>' + a.desc + '</p>' +
        '<div class="use"><b>Use it for:</b> ' + a.use + '</div>' +
        (sizes ? '<div class="sizes">' + sizes + '</div>' : '') +
        '<div class="specs">' + (a.specs || []).map(function (s) { return '<span class="spec">' + s + '</span>'; }).join('') + '</div>' +
        '<div class="card__f">' +
          '<button class="btn btn-primary btn-sm" data-open="' + id + '">View</button>' +
          ((a.view || '').indexOf('../share/') === 0
            ? '<button class="btn btn-ghost btn-sm" data-dlf="' + id + '|pptx">PowerPoint</button><button class="btn btn-ghost btn-sm" data-dlf="' + id + '|pdf">PDF</button>'
            : '<button class="btn btn-ghost btn-sm" data-dl="' + id + '">Download ' + (a.dlLabel || 'PDF') + '</button>') +
          '<button class="linkbtn" data-tab="' + id + '">Open in new tab</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  host.innerHTML = sections.map(function (sec, si) {
    return '<section class="sec' + (si % 2 ? ' sec--alt' : '') + '" id="' + sec.id + '"><div class="wrap">' +
      '<div class="sec__head"><div><span class="eyebrow">' + ('0' + (si + 1)).slice(-2) + ': ' + sec.kicker + '</span>' +
      '<h2>' + sec.title + '</h2><p>' + sec.blurb + '</p></div></div>' +
      '<div class="assets' + (sec.items.length === 1 ? ' assets--solo' : sec.items.length === 2 ? ' assets--2' : '') + '">' +
        sec.items.map(function (a, ii) { return card(a, si, ii); }).join('') +
      '</div><p class="empty" hidden><b>No matches here</b>Try a different word, or clear the search.</p></div></section>';
  }).join('');

  function item(id) { var p = id.split('.'); return sections[+p[0]].items[+p[1]]; }

  /* Assets are inlined into the page when preview-assets.js is present, so the
     hub works as a single shareable file with no sibling requests. */
  var INLINE = window.ASSET_HTML || {};
  var PNG = window.ASSET_PNG || {};
  function pngDl(key) {
    var src = PNG[key] || ('png/' + key + '.png');
    var ext = src.indexOf('image/jpeg') > -1 ? '.jpg' : '.png';
    var el = document.createElement('a');
    el.href = src; el.download = 'Propential-' + key.slice(3) + ext;
    document.body.appendChild(el); el.click(); el.remove();
    say('Downloading the ' + key.slice(3) + ' banner.');
  }
  function snippet(key) {
    var dim = key.slice(3).split('x');
    var html = '<a href="' + refUrl + '" target="_blank">\n' +
      '  <img src="https://cdn.propential.com.au/banners/' + key.slice(3) + '.png"\n' +
      '       width="' + dim[0] + '" height="' + dim[1] + '" alt="Propential, secured finance from $5,000 to $175,000"\n' +
      '       style="display:block;border:0;max-width:100%;height:auto">\n</a>';
    navigator.clipboard.writeText(html).then(function () { say('Email signature HTML copied to your clipboard.'); });
  }
  function loadFrame(f, view) { if (INLINE[view]) f.srcdoc = INLINE[view]; else f.src = view; }
  host.querySelectorAll('iframe[data-view]').forEach(function (f) { loadFrame(f, f.dataset.view); });

  /* ---------- jump nav ---------- */
  var jump = document.getElementById('hub-jump');
  if (jump) {
    jump.innerHTML = sections.map(function (s) {
      return '<a href="#' + s.id + '" data-jump="' + s.id + '">' + s.nav + '<span class="ct">' + s.items.length + '</span></a>';
    }).join('') + '<a href="#brand" data-jump="brand">Brand assets</a><a href="#qr" data-jump="qr">QR code</a><a href="#hub-help" data-jump="hub-help">Help</a>';
    jump.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-jump]'); if (!a) return;
      e.preventDefault();
      var el = document.getElementById(a.dataset.jump); if (!el) return;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 130, behavior: 'smooth' });
      history.replaceState(null, '', '#' + a.dataset.jump);
    });
  }
  var links = jump ? [].slice.call(jump.querySelectorAll('a[data-jump]')) : [];
  function spy() {
    var y = window.pageYOffset + 190, cur = null;
    links.forEach(function (a) { var el = document.getElementById(a.dataset.jump); if (el && el.offsetTop <= y) cur = a; });
    links.forEach(function (a) { a.classList.toggle('is-on', a === cur); });
  }
  window.addEventListener('scroll', spy, { passive: true }); spy();

  /* ---------- search ---------- */
  var input = document.getElementById('hub-search');
  var countEl = document.getElementById('hub-count');
  var allCards = [].slice.call(host.querySelectorAll('.card'));
  function filter() {
    var q = (input ? input.value : '').trim().toLowerCase(), shown = 0;
    allCards.forEach(function (c) { var hit = !q || c.dataset.search.indexOf(q) > -1; c.hidden = !hit; if (hit) shown++; });
    host.querySelectorAll('.sec').forEach(function (s) {
      var vis = s.querySelectorAll('.card:not([hidden])').length;
      s.querySelector('.empty').hidden = vis > 0;
      s.querySelector('.assets').style.display = vis ? '' : 'none';
    });
    if (countEl) countEl.textContent = shown + ' of ' + allCards.length + ' items';
    if (input) input.parentElement.classList.toggle('has-val', !!q);
  }
  if (input) {
    input.addEventListener('input', filter);
    var clear = input.parentElement.querySelector('.clear');
    if (clear) clear.addEventListener('click', function () { input.value = ''; filter(); input.focus(); });
  }
  filter();

  /* ---------- multi-select ---------- */
  var picked = new Set();
  var selbar = document.createElement('div');
  selbar.className = 'selbar';
  selbar.innerHTML = '<span class="n"><b data-n>0</b> selected</span>' +
    '<button class="btn btn-primary btn-sm" data-sel-dl>Download all</button>' +
    '<button class="btn btn-ghost btn-sm" data-sel-copy>Copy all links</button>' +
    '<button class="linkbtn" data-sel-clear>Clear</button>';
  document.body.appendChild(selbar);
  function syncSel() {
    selbar.querySelector('[data-n]').textContent = picked.size;
    selbar.classList.toggle('is-up', picked.size > 0);
  }
  host.addEventListener('change', function (e) {
    var cb = e.target.closest('[data-pick]'); if (!cb) return;
    var c = cb.closest('.card');
    if (cb.checked) { picked.add(cb.dataset.pick); c.classList.add('is-picked'); }
    else { picked.delete(cb.dataset.pick); c.classList.remove('is-picked'); }
    syncSel();
  });
  selbar.addEventListener('click', function (e) {
    if (e.target.closest('[data-sel-clear]')) {
      picked.clear();
      host.querySelectorAll('[data-pick]').forEach(function (cb) { cb.checked = false; cb.closest('.card').classList.remove('is-picked'); });
      syncSel(); return;
    }
    if (e.target.closest('[data-sel-copy]')) {
      var txt = [...picked].map(function (id) { return item(id).title + ': ' + refUrl; }).join('\n');
      navigator.clipboard.writeText(txt).then(function () { say(picked.size + ' links copied to your clipboard.'); });
      return;
    }
    if (e.target.closest('[data-sel-dl]')) {
      var ids = [...picked];
      say('Downloading ' + ids.length + ' item' + (ids.length > 1 ? 's' : '') + '.');
      ids.forEach(function (id, i) { setTimeout(function () { dl(id); }, i * 700); });
    }
  });

  /* ---------- preview modal ---------- */
  var modal = document.createElement('div');
  modal.className = 'modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = '<div class="modal__box"><div class="modal__head"><div><h3></h3><p></p></div>' +
    '<button class="modal__close" aria-label="Close preview">&times;</button></div>' +
    '<div class="modal__body"><iframe title="Asset preview"></iframe></div>' +
    '<div class="modal__foot"><button class="btn btn-primary btn-sm" data-modal-dl>Download</button>' +
    '<button class="btn btn-ghost btn-sm" data-modal-tab>Open in new tab</button>' +
    '<button class="linkbtn" data-modal-copy>Copy my link</button>' +
    '<span class="hint">Esc to close</span></div></div>';
  document.body.appendChild(modal);
  var mFrame = modal.querySelector('iframe'), currentId = null;

  function sizeFrame(nat) {
    var box = modal.querySelector('.modal__body');
    var k = Math.min((box.clientWidth - 8) / nat[0], 1);
    mFrame.style.width = nat[0] + 'px'; mFrame.style.height = nat[1] + 'px';
    mFrame.style.transform = 'scale(' + k + ')';
    mFrame.style.marginBottom = (nat[1] * k - nat[1]) + 'px';
    mFrame.style.marginRight = (nat[0] * k - nat[0]) + 'px';
  }
  var lastNat = [794, 1123];
  function open(id) {
    var a = item(id); currentId = id;
    modal.querySelector('h3').textContent = a.title;
    modal.querySelector('.modal__head p').textContent = a.desc;
    mFrame.removeAttribute('srcdoc'); mFrame.removeAttribute('src'); loadFrame(mFrame, a.view);
    lastNat = a.natural || (a.shape === 'land' ? [1123, 794] : [794, 1123]);
    modal.classList.add('is-open'); document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { sizeFrame(lastNat); });
  }
  function close() { modal.classList.remove('is-open'); mFrame.removeAttribute('srcdoc'); mFrame.src = 'about:blank'; document.body.style.overflow = ''; }
  host.addEventListener('click', function (e) {
    var pg = e.target.closest('[data-png]'); if (pg) { pngDl(pg.dataset.png); return; }
    var sn = e.target.closest('[data-snip]'); if (sn) { snippet(sn.dataset.snip); return; }
    var tb = e.target.closest('[data-tab]'); if (tb) { openTab(tb.dataset.tab); return; }
    var df = e.target.closest('[data-dlf]'); if (df) { var pp = df.dataset.dlf.split('|'); dlFormat(pp[0], pp[1]); return; }
    var d = e.target.closest('[data-dl]'); if (d) { dl(d.dataset.dl); return; }
    var o = e.target.closest('[data-open]'); if (o) open(o.dataset.open);
  });
  host.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset && e.target.dataset.open) { e.preventDefault(); open(e.target.dataset.open); }
  });
  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('.modal__close')) return close();
    if (e.target.closest('[data-modal-dl]') && currentId) dl(currentId);
    if (e.target.closest('[data-modal-tab]') && currentId) openTab(currentId);
    var c = e.target.closest('[data-modal-copy]'); if (c) copyLink(c, refUrl);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('is-open')) close(); });

  /* ---------- scale card previews ---------- */
  function fit() {
    document.querySelectorAll('.thumb').forEach(function (t) {
      var nat = (t.dataset.nat || '794,1123').split(',').map(Number);
      var f = t.querySelector('iframe'); if (!f) return;
      f.style.width = nat[0] + 'px'; f.style.height = nat[1] + 'px';
      f.style.transform = 'scale(' + (t.clientWidth / nat[0]) + ')';
    });
    if (modal.classList.contains('is-open')) sizeFrame(lastNat);
  }
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);

  /* ---------- QR code downloads ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-qr]'); if (!b) return;
    var f = b.dataset.qr, src = (window.QR_FILES || {})[f] || ('qr/propential-qr-code.' + f);
    var el = document.createElement('a'); el.href = src; el.download = 'Propential-QR-code.' + f;
    document.body.appendChild(el); el.click(); el.remove();
    say('Downloading the QR code as a ' + f.toUpperCase() + '.');
  });
})();
