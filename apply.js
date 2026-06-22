/* Propential - application form */
(function () {
  var form = document.getElementById('applyForm');
  var result = document.getElementById('applyResult');
  var amount = document.getElementById('amount');
  var term = document.getElementById('term');
  var propState = document.getElementById('propState');
  var secHint = document.getElementById('secHint');
  var idType = document.getElementById('idType');
  var idIssuedState = document.getElementById('idIssuedState');
  var idNumber = document.getElementById('idNumber');
  var idNumberHint = document.getElementById('idNumberHint');

  // Prefill referral code from URL (?ref= or ?partner=)
  try {
    var params = new URLSearchParams(location.search);
    var ref = params.get('ref') || params.get('partner');
    if (ref) document.getElementById('referral').value = ref;
  } catch (e) {}

  // Campaign tracking (utm_source / utm_medium / utm_campaign) for Formstack.
  var utm = { source: '', medium: '', campaign: '' };
  try {
    var uparams = new URLSearchParams(location.search);
    utm.source = uparams.get('utm_source') || '';
    utm.medium = uparams.get('utm_medium') || '';
    utm.campaign = uparams.get('utm_campaign') || '';
  } catch (e) {}

  // Prefill from the eligibility step, if completed
  try {
    var elig = JSON.parse(localStorage.getItem('propential_elig') || 'null');
    if (elig) {
      if (elig.name) document.getElementById('name').value = elig.name;
      if (elig.email) document.getElementById('email').value = elig.email;
      if (elig.phone) document.getElementById('phone').value = elig.phone;
      if (elig.amount) amount.value = elig.amount;
      if (elig.state) propState.value = elig.state;
      if (elig.project) {
        String(elig.project).split(',').forEach(function (val) {
          var p = form.querySelector('input[name="project"][value="' + val.trim() + '"]');
          if (p) { p.checked = true; var chip = p.closest('.chip'); if (chip) chip.classList.add('is-checked'); }
        });
      }
    }
  } catch (e) {}

  // Build term options based on amount band
  function rebuildTerms() {
    var amt = parseFloat(amount.value) || 0;
    var maxTerm = amt > 50000 ? 10 : 7;
    var current = term.value;
    term.innerHTML = '<option value="" disabled>Select a term</option>';
    for (var y = 1; y <= maxTerm; y++) {
      var o = document.createElement('option');
      o.value = y; o.textContent = y + (y === 1 ? ' year' : ' years');
      term.appendChild(o);
    }
    if (current && +current <= maxTerm) term.value = current;
    else term.querySelector('option[value=""]').selected = true;
    document.getElementById('termHint').textContent = amt > 50000
      ? 'Up to 10 years for loans above $50,000.'
      : '1–7 years for loans up to $50,000.';
  }
  amount.addEventListener('input', rebuildTerms);
  rebuildTerms();

  form.addEventListener('change', function (e) {
    if ((e.target.type === 'radio' || e.target.type === 'checkbox') && e.target.closest('.chip')) {
      form.querySelectorAll('input[name="' + e.target.name + '"]').forEach(function (r) {
        var chip = r.closest('.chip'); if (chip) chip.classList.toggle('is-checked', r.checked);
      });
      if (e.target.name === 'hasMortgage') {
        var show = e.target.value === 'yes';
        document.querySelectorAll('.mortgage-only').forEach(function (el) { el.classList.toggle('is-shown', show); });
      }
    }
    if (e.target === propState) {
      var qn = propState.value === 'QLD' || propState.value === 'NT';
      secHint.textContent = qn
        ? 'In ' + propState.value + ', secured by a second mortgage over your property.'
        : 'In ' + propState.value + ', secured by a caveat over your property.';
    }
  });

  function setError(el, on) { (el.closest('.field') || el).classList.toggle('field--error', on); }

  // Dynamic ID-number format by ID type + issuing state
  var ID_DL = {
    NSW: { re: /^\d{6,8}$/, ex: '6\u20138 digits' },
    VIC: { re: /^\d{7,9}$/, ex: '7\u20139 digits' },
    QLD: { re: /^[A-Za-z0-9]{6,9}$/, ex: '6\u20139 letters/numbers' },
    WA:  { re: /^\d{6,7}[A-Za-z]?$/, ex: '6\u20137 digits, optional trailing letter' },
    SA:  { re: /^\d{6,8}$/, ex: '6\u20138 digits' },
    TAS: { re: /^\d{6,8}$/, ex: '6\u20138 digits' },
    ACT: { re: /^\d{6,7}$/, ex: '6\u20137 digits' },
    NT:  { re: /^\d{6,7}$/, ex: '6\u20137 digits' }
  };
  function idRule() {
    var type = idType ? idType.value : '', st = idIssuedState ? idIssuedState.value : '';
    if (type === 'Australian passport') return { re: /^[A-Za-z]\d{7}$/, hint: '8 characters: one letter then 7 digits (e.g. A1234567).', ph: 'A1234567' };
    if (type === 'Australian driver licence') {
      if (st && ID_DL[st]) return { re: ID_DL[st].re, hint: st + ' licence: ' + ID_DL[st].ex + '.', ph: '' };
      return { re: null, hint: 'Select the issuing state to validate your licence number.', ph: '' };
    }
    if (type === 'Other government ID') return { re: /^[A-Za-z0-9]{3,}$/, hint: 'At least 3 characters.', ph: '' };
    return { re: null, hint: "Select your ID type and issuing state and we'll show the expected format.", ph: '' };
  }
  function checkIdNumber() {
    if (!idNumber) return true;
    var r = idRule();
    var v = idNumber.value.trim().replace(/\s+/g, '');
    var bad = !v || (r.re ? !r.re.test(v) : v.length < 3);
    setError(idNumber, bad);
    return !bad;
  }
  function refreshIdNumber() {
    if (!idNumber) return;
    var r = idRule();
    if (idNumberHint) idNumberHint.textContent = r.hint;
    idNumber.placeholder = r.ph || '';
    if ((idNumber.closest('.field') || idNumber).classList.contains('field--error')) checkIdNumber();
  }
  if (idType) idType.addEventListener('change', refreshIdNumber);
  if (idIssuedState) idIssuedState.addEventListener('change', refreshIdNumber);
  if (idNumber) {
    idNumber.addEventListener('blur', checkIdNumber);
    idNumber.addEventListener('input', function () { if ((idNumber.closest('.field') || idNumber).classList.contains('field--error')) checkIdNumber(); });
  }
  refreshIdNumber();

  function validate() {
    var ok = true;
    var requiredText = ['name', 'dob', 'email', 'phone', 'resAddress', 'propAddress', 'propValue', 'income', 'expenses', 'otherDebts'];
    requiredText.forEach(function (id) {
      var el = document.getElementById(id);
      var bad = !el.value.trim();
      if (id === 'email') bad = bad || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value);
      setError(el, bad); if (bad) ok = false;
    });
    var selects = ['propState', 'term', 'employment', 'idType', 'idIssuedState'];
    selects.forEach(function (id) { var el = document.getElementById(id); setError(el, !el.value); if (!el.value) ok = false; });
    if (!checkIdNumber()) ok = false;
    // amount range
    var amt = parseFloat(amount.value);
    var amtBad = !(amt >= 5000 && amt <= 175000);
    setError(amount, amtBad); if (amtBad) ok = false;
    // radios
    ['hasMortgage', 'project'].forEach(function (name) {
      var checked = form.querySelector('input[name="' + name + '"]:checked');
      setError(form.querySelector('input[name="' + name + '"]'), !checked); if (!checked) ok = false;
    });
    // consents
    var c1 = document.getElementById('consentPrivacy'), c2 = document.getElementById('consentAccuracy');
    var cbad = !(c1.checked && c2.checked);
    document.getElementById('consentErr').style.display = cbad ? 'block' : 'none';
    if (cbad) ok = false;
    return ok;
  }

  var MARK = '<span class="result-mark mark" aria-hidden="true"><svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="armg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECD58C"/><stop offset="0.5" stop-color="#D6B15E"/><stop offset="1" stop-color="#B6873A"/></linearGradient></defs><path d="M34 96 L100 36 L166 96" fill="none" stroke="url(#armg)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M52 92 V162 Q52 174 64 174 H136 Q148 174 148 162 V92" fill="none" stroke="url(#armg)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="100" cy="112" r="14" fill="url(#armg)"/><path d="M90 120 L110 120 L114 154 L86 154 Z" fill="url(#armg)"/></svg></span>';

  function renderSuccess() {
    var name = document.getElementById('name').value.trim();
    var ref = document.getElementById('referral').value.trim();

    result.innerHTML = MARK +
      '<h2>Application received, ' + escapeHtml(name.split(' ')[0]) + '.</h2>' +
      '<p style="max-width:none">Thanks for applying with Propential. Our team will review your application against our credit policy and come back to you quickly with next steps, usually by email or phone.</p>' +
      (ref ? '<div class="result-ref">Referral code applied: <b style="color:rgb(214, 177, 94)">' + escapeHtml(ref) + '</b></div>' : '') +
      '<p style="margin-top:14px;font-size:0.78rem;color:var(--text-faint);max-width:none">This confirmation is not an approval or credit offer.<br>Your application is subject to credit assessment and our lending criteria.</p>' +
      '<div class="result-actions"><a class="btn btn-primary btn-lg" href="index.html">Back to home</a></div>' +
      '<div class="appsteps" aria-label="Application progress">' +
        '<div class="apptrack">' +
          '<div class="appstep appstep--done"><span class="appstep__node">\u2713</span><span class="appstep__label">Application Received</span></div>' +
          '<div class="appstep appstep--current"><span class="appstep__node">2</span><span class="appstep__label">Application Under Review</span></div>' +
          '<div class="appstep appstep--todo"><span class="appstep__node">3</span><span class="appstep__label">Conditional Approval<sup>^</sup> within minutes</span></div>' +
          '<div class="appstep appstep--todo"><span class="appstep__node">4</span><span class="appstep__label">Full Approval</span></div>' +
        '</div>' +
        '<p class="appsteps__foot" style="font-size:12px;color:rgb(111, 108, 99);max-width:none"><sup>^</sup> Conditional approval subject to suitability and receiving all required information during normal NSW business hours. Final approval subject to our lending criteria and supplying satisfactory supporting documents.</p>' +
      '</div>';

    try { localStorage.removeItem('propential_elig'); } catch (er) {}
    form.hidden = true;
    result.hidden = false;
    window.scrollTo({ top: result.getBoundingClientRect().top + window.pageYOffset - 110, behavior: 'smooth' });
  }

  function showSubmitError(btn) {
    if (btn) { btn.disabled = false; btn.textContent = 'Submit application'; }
    var el = document.getElementById('submitError');
    if (!el) {
      el = document.createElement('p');
      el.id = 'submitError';
      el.className = 'error-msg';
      el.style.textAlign = 'center';
      el.style.marginTop = '12px';
      var foot = form.querySelector('.form-foot');
      if (foot && foot.parentNode) foot.parentNode.insertBefore(el, foot);
      else form.appendChild(el);
    }
    el.style.display = 'block';
    el.textContent = 'Sorry \u2014 we couldn\u2019t submit your application just now. Please try again in a moment.';
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Build the JSON payload the /api/submit-apply route expects (field names
  // mirror its applySchema; numbers may be strings, the server coerces them).
  function collectData() {
    var val = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
    var mort = form.querySelector('input[name="hasMortgage"]:checked');
    var data = {
      name: val('name').trim(),
      dob: val('dob'),
      email: val('email').trim(),
      phone: val('phone').trim(),
      resAddress: val('resAddress').trim(),
      propAddress: val('propAddress').trim(),
      propState: val('propState'),
      propValue: val('propValue'),
      hasMortgage: mort ? mort.value : '',
      lender: val('lender').trim(),
      amount: val('amount'),
      term: val('term'),
      project: Array.prototype.map.call(form.querySelectorAll('input[name="project"]:checked'), function (c) { return c.value; }),
      purpose: val('purpose').trim(),
      employment: val('employment'),
      income: val('income'),
      expenses: val('expenses'),
      otherDebts: val('otherDebts'),
      idType: val('idType'),
      idIssuedState: val('idIssuedState'),
      idNumber: val('idNumber').trim(),
      referral: val('referral').trim(),
      consentPrivacy: document.getElementById('consentPrivacy').checked,
      consentAccuracy: document.getElementById('consentAccuracy').checked,
      utmSource: utm.source,
      utmMedium: utm.medium,
      utmCampaign: utm.campaign
    };
    var mb = val('mortBalance').trim();
    if (mb) data.mortBalance = mb;
    return data;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) {
      var firstErr = form.querySelector('.field--error') || (document.getElementById('consentErr').style.display === 'block' ? document.getElementById('consentErr') : null);
      if (firstErr) window.scrollTo({ top: firstErr.getBoundingClientRect().top + window.pageYOffset - 120, behavior: 'smooth' });
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting\u2026'; }
    var prevErr = document.getElementById('submitError');
    if (prevErr) prevErr.style.display = 'none';

    fetch('/api/submit-apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectData())
    }).then(function (r) {
      return r.json().then(function (body) { return { ok: r.ok, body: body }; }, function () { return { ok: false, body: null }; });
    }).then(function (res) {
      if (res.ok && res.body && res.body.ok) renderSuccess();
      else showSubmitError(btn);
    }).catch(function () {
      showSubmitError(btn);
    });
  });

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
})();
