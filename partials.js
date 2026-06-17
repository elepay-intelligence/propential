/* Propential - shared nav + footer injected into every interior page.
   Keeps chrome consistent across pages. Set the active link with
   <body data-page="calculator"> and the path depth with
   <body data-base="../"> for pages in a subfolder. */
(function () {
  var B = (document.body && document.body.dataset.base) || '';
  var page = (document.body && document.body.dataset.page) || '';

  var markSvg =
    '<span class="mark" aria-hidden="true">' +
    '<svg viewBox="0 0 200 210" height="32" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="pnavg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECD58C"/><stop offset="0.5" stop-color="#D6B15E"/><stop offset="1" stop-color="#B6873A"/></linearGradient></defs>' +
    '<path d="M34 96 L100 36 L166 96" fill="none" stroke="url(#pnavg)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M52 92 V162 Q52 174 64 174 H136 Q148 174 148 162 V92" fill="none" stroke="url(#pnavg)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="100" cy="112" r="14" fill="url(#pnavg)"/>' +
    '<path d="M90 120 L110 120 L114 154 L86 154 Z" fill="url(#pnavg)"/>' +
    '</svg></span>';

  function a(href, label, key) {
    var cls = key && key === page ? ' class="is-active"' : '';
    return '<li><a href="' + B + href + '"' + cls + '>' + label + '</a></li>';
  }

  var nav =
    '<div class="wrap nav__inner">' +
      '<a class="nav__brand" href="' + B + 'index.html" aria-label="Propential home">' +
        markSvg +
        '<span class="wordmark"><span class="prop">Prop</span><span class="ential">ential</span></span>' +
      '</a>' +
      '<nav class="nav__menu" aria-label="Primary">' +
        '<ul class="nav__links">' +
          a('how-it-works.html', 'How it works', 'how') +
          a('product.html', 'The product', 'product') +
          a('calculator.html', 'Calculator', 'calculator') +
          a('faqs.html', 'FAQs', 'faqs') +
        '</ul>' +
        '<div class="nav__cta">' +
          '<a class="btn btn-ghost" href="' + B + 'calculator.html">Calculate</a>' +
          '<a class="btn btn-primary" href="' + B + 'eligibility.html">Check eligibility</a>' +
        '</div>' +
      '</nav>' +
      '<button class="nav__toggle" aria-label="Open menu" aria-expanded="false"><span></span></button>' +
    '</div>';

  function fcol(href, label) { return '<li><a href="' + B + href + '">' + label + '</a></li>'; }

  var footer =
    '<div class="wrap">' +
      '<div class="footer__top">' +
        '<div class="footer__brand">' +
          '<span class="wordmark"><span class="prop">Prop</span><span class="ential">ential</span></span>' +
          '<p>Unlock your property\u2019s true value. A property-secured loan for owners who want to do something with the place they own.</p>' +
        '</div>' +
        '<div class="footer__col"><h4>Product</h4><ul>' +
          fcol('how-it-works.html', 'How it works') +
          fcol('product.html', 'The product') +
          fcol('calculator.html', 'Calculator') +
          fcol('eligibility.html', 'Check eligibility') +
          fcol('apply.html', 'Apply') +
          fcol('faqs.html', 'FAQs') +
        '</ul></div>' +
        '<div class="footer__col"><h4>Legal</h4><ul>' +
          fcol('legal/privacy.html', 'Privacy &amp; credit reporting policy') +
          fcol('legal/terms.html', 'Terms &amp; conditions') +
          fcol('legal/credit-guide.html', 'Credit guide') +
          fcol('legal/tmd.html', 'Target Market Determination') +
          fcol('legal/complaints.html', 'Complaints') +
          fcol('legal/hardship.html', 'Hardship') +
        '</ul></div>' +
      '</div>' +
      '<p class="footer__aoc">Propential acknowledges that we are on the land of the Gadigal and Birrabirragal people, the traditional custodians of the land. We pay our respects to Elders past, present and emerging.</p>' +
      '<p class="footer__legal">\u00A9 MediPay Holdings Pty Limited ACN 604 221 276 Australian Credit Licence Number 474336 | 264 George Street, Sydney NSW 2000. Any repayment figures shown are indicative only and are not a quote, approval, credit offer or financial advice. All applications are subject to credit assessment and our lending criteria.</p>' +
    '</div>';

  var navEl = document.getElementById('site-nav');
  if (navEl) { navEl.className = 'nav'; navEl.innerHTML = nav; }
  var footEl = document.getElementById('site-footer');
  if (footEl) { footEl.className = 'footer'; footEl.innerHTML = footer; }
})();
