/* ============================================================
   PROPENTIAL APPLY — form engine
   Renders the multi-step form from APPLY_SCHEMA, handles
   conditional visibility, repeat blocks, per-step validation,
   the job-title combobox, address autocomplete → 5 sub-inputs,
   localStorage autosave/restore, and submit to /api/submit-apply
   (which maps to Formstack). Every input carries data-fs-id.
   ============================================================ */
(function () {
  var SCHEMA = window.APPLY_SCHEMA, DATA = window.APPLY_DATA;
  if (!SCHEMA || !DATA) return;
  var STORE_KEY = 'propential_apply_v2';

  var form = document.getElementById('applyForm');
  var stepsHost = document.getElementById('wizSteps');
  var trackHost = document.getElementById('trackingFields');
  var result = document.getElementById('applyResult');

  // ---- tiny DOM helper ----
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) for (var k in props) {
      if (k === 'class') n.className = props[k];
      else if (k === 'text') n.textContent = props[k];
      else if (k === 'html') n.innerHTML = props[k];
      else if (k in n && k !== 'list') { try { n[k] = props[k]; } catch (e) { n.setAttribute(k, props[k]); } }
      else n.setAttribute(k, props[k]);
    }
    if (kids) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function opts(o) { return typeof o === 'string' && o[0] === '@' ? (DATA[o.slice(1)] || []) : (o || []); }

  // ---- registry ----
  var byVar = {};        // variable -> controller
  var vis = [];          // {wrap, show, ctrls:[]}
  var stepEls = [];      // section elements
  var current = 0;

  function getVal(v) { var c = byVar[v]; return c ? c.get() : ''; }

  function condPass(c) {
    if (c.on) return getVal(c.f) !== '';
    var val = getVal(c.f);
    if (c.eq !== undefined) return val === c.eq;
    if (c.in) return c.in.indexOf(val) >= 0;
    if (c.notIn) return val !== '' && c.notIn.indexOf(val) < 0;
    return true;
  }
  function shown(show) { return !show || show.every(condPass); }

  // ============================================================
  //  FIELD BUILDERS  — each returns { wrap, ctrl }
  // ============================================================
  function fieldWrap(field, controlNodes, opt) {
    opt = opt || {};
    var cls = 'field';
    if (field.w) cls += ' col-' + field.w;
    else if (!field.half) cls += ' span-2';
    var wrap = el('div', { class: cls, 'data-field': field.v || '' });
    if (field.l && !opt.noLabel) wrap.appendChild(el('label', { 'for': field.v, text: field.l }));
    (Array.isArray(controlNodes) ? controlNodes : [controlNodes]).forEach(function (c) { wrap.appendChild(c); });
    if (field.note) wrap.appendChild(el('p', { class: 'hint note', text: field.note }));
    if (field.hint) wrap.appendChild(el('p', { class: 'hint', text: field.hint }));
    wrap.appendChild(el('p', { class: 'error-msg', text: opt.err || 'This field is required.' }));
    return wrap;
  }
  function setErr(wrap, on, msg) {
    wrap.classList.toggle('field--error', !!on);
    if (msg) { var e = wrap.querySelector('.error-msg'); if (e) e.textContent = msg; }
  }
  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  function num(v) { return parseFloat(String(v).replace(/[,\s]/g, '')); }
  function fmtMoney(v) { var d = String(v == null ? '' : v).replace(/[^\d]/g, ''); return d ? Number(d).toLocaleString('en-US') : ''; }
  // turn references to other pages into links (display only — never touches submitted values)
  function linkify(text) {
    var map = [
      ['Privacy & Credit Reporting Policy', 'legal/privacy.html'],
      ['Privacy Policy and Credit Reporting Policy', 'legal/privacy.html'],
      ['Privacy and Credit Reporting Policy', 'legal/privacy.html'],
      ['Credit Reporting Policy', 'legal/privacy.html'],
      ['Privacy Policy', 'legal/privacy.html'],
      ['Credit Guide', 'legal/credit-guide.html']
    ];
    var html = escapeHtml(text), tokens = [];
    map.forEach(function (m, i) { var ph = '\u0000' + i + '\u0000'; html = html.split(escapeHtml(m[0])).join(ph); tokens.push([ph, '<a href="' + m[1] + '" target="_blank" rel="noopener">' + escapeHtml(m[0]) + '</a>']); });
    tokens.forEach(function (t) { html = html.split(t[0]).join(t[1]); });
    return html;
  }

  // generic text-like input (text/email/tel/date/num/money)
  function buildInput(field) {
    var maxDigits = field.digits != null ? field.digits : (field.digitsRange ? field.digitsRange[1] : null);
    var isMoney = field.t === 'money';
    var type = maxDigits != null ? 'text'
      : field.t === 'num' ? 'number'
      : field.t === 'email' ? 'email' : field.t === 'tel' ? 'tel'
      : field.t === 'date' ? 'date' : 'text';
    var input = el('input', { class: 'input', id: field.v, name: field.v, type: type, 'data-fs-id': field.fs });
    if (field.ac) input.setAttribute('autocomplete', field.ac);
    if (field.ph) input.placeholder = field.ph;
    else if (isMoney) input.placeholder = '0';
    if (field.t === 'num' && maxDigits == null) { input.setAttribute('inputmode', 'numeric'); input.min = field.min != null ? field.min : 0; input.step = '1'; }
    if (isMoney) input.setAttribute('inputmode', 'numeric');
    // hard character cap: stop accepting input once the max digit count is reached
    if (maxDigits != null) {
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('maxlength', String(maxDigits));
      input.addEventListener('input', function () { var d = input.value.replace(/\D/g, '').slice(0, maxDigits); if (input.value !== d) input.value = d; });
    }
    var node = input;
    if (isMoney) node = el('div', { class: 'money-input' }, [el('span', { class: 'money-pre', text: '$' }), input]);
    var wrap = fieldWrap(field, node);
    var isNumLike = isMoney || field.t === 'num';
    if (field.def != null) input.value = isMoney ? fmtMoney(field.def) : field.def;
    var ctrl = {
      v: field.v, field: field, wrap: wrap,
      get: function () { return isNumLike ? String(input.value).replace(/[,\s]/g, '') : input.value.trim(); },
      set: function (val) { input.value = val == null ? '' : (isMoney ? fmtMoney(val) : val); },
      clear: function () { input.value = ''; setErr(wrap, false); },
      validate: function () { return validateValue(field, ctrl.get(), wrap); }
    };
    // live thousands-separator formatting as the user types money
    if (isMoney) input.addEventListener('input', function () { var c = input.value.replace(/[^\d]/g, ''); input.value = c ? Number(c).toLocaleString('en-US') : ''; });
    input.addEventListener('blur', function () { if (current >= 0) ctrl.validate(); });
    input.addEventListener('input', function () { if (wrap.classList.contains('field--error')) ctrl.validate(); });
    return { wrap: wrap, ctrl: ctrl };
  }

  function buildSelect(field) {
    var sel = el('select', { class: 'select', id: field.v, name: field.v, 'data-fs-id': field.fs });
    function fill(list) { sel.innerHTML = ''; sel.appendChild(el('option', { value: '', text: 'Select…', disabled: true, selected: true, hidden: true })); list.forEach(function (o) { sel.appendChild(el('option', { value: o, text: o })); }); }
    fill(opts(field.o));
    var wrap = fieldWrap(field, sel, { err: 'Please select an option.' });
    var ctrl = {
      v: field.v, field: field, wrap: wrap,
      get: function () { return sel.value; },
      set: function (val) { sel.value = val || ''; },
      clear: function () { sel.value = ''; setErr(wrap, false); },
      validate: function () { return validateValue(field, sel.value, wrap, 'Please select an option.'); }
    };
    // Propential term rule: 1–7 yrs up to $50k, up to 10 yrs above. Options rebuild as the amount changes.
    if (field.dynamicTerm) {
      ctrl.rebuild = function () {
        var amt = num(getVal('amount')); var max = (!isNaN(amt) && amt > 50000) ? 10 : 7;
        var cur = sel.value, list = [];
        for (var y = 1; y <= max; y++) list.push(y + (y === 1 ? ' Year' : ' Years'));
        fill(list); if (cur && list.indexOf(cur) >= 0) sel.value = cur;
      };
      ctrl.rebuild();
    }
    sel.addEventListener('change', function () { if (wrap.classList.contains('field--error')) ctrl.validate(); });
    return { wrap: wrap, ctrl: ctrl };
  }

  function buildRadio(field) {
    var group = el('div', { class: 'chip-group', role: 'radiogroup', 'aria-label': field.l });
    opts(field.o).forEach(function (o, i) {
      var input = el('input', { type: 'radio', name: field.v, value: o, 'data-fs-id': field.fs });
      if (i === 0) input.id = field.v;
      group.appendChild(el('label', { class: 'chip' }, [input, el('span', { text: o })]));
    });
    var wrap = fieldWrap(field, group, { err: 'Please choose an option.' });
    function paint() { group.querySelectorAll('input').forEach(function (r) { r.closest('.chip').classList.toggle('is-checked', r.checked); }); }
    var ctrl = {
      v: field.v, field: field, wrap: wrap,
      get: function () { var c = group.querySelector('input:checked'); return c ? c.value : ''; },
      set: function (val) { group.querySelectorAll('input').forEach(function (r) { r.checked = (r.value === val); }); paint(); },
      clear: function () { group.querySelectorAll('input').forEach(function (r) { r.checked = false; }); paint(); setErr(wrap, false); },
      validate: function () { return validateValue(field, ctrl.get(), wrap, 'Please choose an option.'); }
    };
    group.addEventListener('change', function () { paint(); if (wrap.classList.contains('field--error')) ctrl.validate(); });
    return { wrap: wrap, ctrl: ctrl };
  }

  function buildMulti(field) {
    var group = el('div', { class: 'chip-group', role: 'group', 'aria-label': field.l });
    opts(field.o).forEach(function (o, i) {
      var input = el('input', { type: 'checkbox', name: field.v, value: o, 'data-fs-id': field.fs });
      if (i === 0) input.id = field.v;
      group.appendChild(el('label', { class: 'chip' }, [input, el('span', { text: o })]));
    });
    var wrap = fieldWrap(field, group, { err: 'Please choose at least one.' });
    function paint() { group.querySelectorAll('input').forEach(function (r) { r.closest('.chip').classList.toggle('is-checked', r.checked); }); }
    var ctrl = {
      v: field.v, field: field, wrap: wrap,
      get: function () { return Array.prototype.map.call(group.querySelectorAll('input:checked'), function (i) { return i.value; }); },
      set: function (arr) { var a = Array.isArray(arr) ? arr : (arr ? String(arr).split(',') : []); group.querySelectorAll('input').forEach(function (r) { r.checked = a.indexOf(r.value) >= 0; }); paint(); },
      clear: function () { group.querySelectorAll('input').forEach(function (r) { r.checked = false; }); paint(); setErr(wrap, false); },
      validate: function () { return true; } // project is optional
    };
    group.addEventListener('change', paint);
    return { wrap: wrap, ctrl: ctrl };
  }

  // job-title type-ahead combobox
  function buildTypeahead(field) {
    var listId = 'lb_' + field.v;
    var search = el('input', { class: 'input combo__input', id: field.v + '_search', type: 'text', autocomplete: 'off', role: 'combobox', 'aria-expanded': 'false', 'aria-controls': listId, 'aria-autocomplete': 'list', placeholder: 'Type to search…' });
    var hidden = el('input', { type: 'hidden', id: field.v, name: field.v, 'data-fs-id': field.fs });
    var list = el('ul', { class: 'combo__list', id: listId, role: 'listbox', hidden: true });
    var combo = el('div', { class: 'combo' }, [search, hidden, list]);
    var wrap = fieldWrap(field, combo, { err: 'Please select an occupation from the list.' });
    var SRC = DATA[field.match] || [];
    var activeIdx = -1, matches = [];

    function close() { list.hidden = true; search.setAttribute('aria-expanded', 'false'); activeIdx = -1; }
    function render(q) {
      matches = q ? SRC.filter(function (s) { return s.toLowerCase().indexOf(q.toLowerCase()) >= 0; }).slice(0, 60) : [];
      list.innerHTML = '';
      if (!matches.length) { close(); return; }
      matches.forEach(function (m, i) {
        var li = el('li', { class: 'combo__opt', role: 'option', id: listId + '_' + i, text: m });
        li.addEventListener('mousedown', function (e) { e.preventDefault(); choose(m); });
        list.appendChild(li);
      });
      list.hidden = false; search.setAttribute('aria-expanded', 'true'); activeIdx = -1;
    }
    function paintActive() {
      Array.prototype.forEach.call(list.children, function (c, i) { c.classList.toggle('is-active', i === activeIdx); });
      if (activeIdx >= 0) search.setAttribute('aria-activedescendant', listId + '_' + activeIdx);
    }
    function choose(m) { search.value = m; hidden.value = m; close(); if (wrap.classList.contains('field--error')) ctrl.validate(); }

    search.addEventListener('input', function () { hidden.value = ''; render(search.value.trim()); });
    search.addEventListener('keydown', function (e) {
      if (list.hidden && (e.key === 'ArrowDown')) { render(search.value.trim()); return; }
      if (e.key === 'ArrowDown') { activeIdx = Math.min(activeIdx + 1, matches.length - 1); paintActive(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { activeIdx = Math.max(activeIdx - 1, 0); paintActive(); e.preventDefault(); }
      else if (e.key === 'Enter') { if (activeIdx >= 0 && matches[activeIdx]) { choose(matches[activeIdx]); e.preventDefault(); } }
      else if (e.key === 'Escape') { close(); }
    });
    search.addEventListener('blur', function () { setTimeout(function () { close(); if (current >= 0) ctrl.validate(); }, 150); });

    var ctrl = {
      v: field.v, field: field, wrap: wrap,
      get: function () { return hidden.value; },
      set: function (val) { hidden.value = val || ''; search.value = val || ''; },
      clear: function () { hidden.value = ''; search.value = ''; setErr(wrap, false); },
      validate: function () {
        if (!shownCtrl(ctrl)) return true;
        var ok = !!hidden.value && SRC.indexOf(hidden.value) >= 0;
        var empty = !search.value.trim();
        setErr(wrap, !ok, empty ? 'This field is required.' : 'Please select an occupation from the list.');
        return ok;
      }
    };
    return { wrap: wrap, ctrl: ctrl };
  }

  // address → 5 sub-inputs
  function buildAddress(field) {
    var base = field.v;
    var fs = el('fieldset', { class: 'addr', 'data-fs-id': field.fs, 'data-addr': base });
    fs.appendChild(el('legend', { text: field.l }));
    var subs = [
      { sfx: '_address', label: 'Street address', req: true, ac: 'street-address', full: true, autocomp: true, ph: 'Start typing your address' },
      { sfx: '_address2', label: 'Address line 2', req: false, full: true, ph: 'Unit, level or building (optional)' },
      { sfx: '_city', label: 'Suburb / City', req: true, ac: 'address-level2', ph: 'e.g. Sydney' },
      { sfx: '_state', label: 'State', req: true, select: DATA.STATES },
      { sfx: '_zip', label: 'Postcode', req: true, ac: 'postal-code', zip: true, ph: 'e.g. 2000' }
    ];
    var grid = el('div', { class: 'field-grid' });
    var rest = el('div', { class: 'field-grid addr-rest is-hidden' });
    var inputs = {};
    subs.forEach(function (s) {
      var id = base + s.sfx;
      var control;
      if (s.select) {
        control = el('select', { class: 'select', id: id, name: id });
        control.appendChild(el('option', { value: '', text: 'Select…', disabled: true, selected: true, hidden: true }));
        s.select.forEach(function (o) { control.appendChild(el('option', { value: o, text: o })); });
      } else {
        control = el('input', { class: 'input', id: id, name: id, type: 'text' });
        if (s.ac) control.setAttribute('autocomplete', s.ac);
        if (s.ph) control.placeholder = s.ph;
        if (s.zip) { control.setAttribute('inputmode', 'numeric'); control.maxLength = 4; }
        if (s.autocomp) { control.setAttribute('data-address-ac', ''); control.setAttribute('data-addr-target', base); }
      }
      inputs[s.sfx] = control;
      var fw = el('div', { class: 'field' + (s.full ? ' span-2' : '') }, [
        el('label', { 'for': id, html: s.label + (s.req ? '' : ' <span class="opt">(optional)</span>') }),
        control,
        el('p', { class: 'error-msg', text: s.zip ? 'Enter a 4-digit postcode.' : 'This field is required.' })
      ]);
      control.addEventListener('blur', function () { if (current >= 0) ctrl.validate(); });
      control.addEventListener('input', function () { if (fw.classList.contains('field--error')) validateSub(s); });
      (s.sfx === '_address' ? grid : rest).appendChild(fw);
    });
    fs.appendChild(grid);
    fs.appendChild(rest);
    // progressive reveal: line 2 / suburb / state / postcode appear once the street line has content
    function syncRest() { rest.classList.toggle('is-hidden', !inputs._address.value.trim()); }
    inputs._address.addEventListener('input', syncRest);
    var wrap = el('div', { class: 'field span-2', 'data-field': base }, [fs]);

    function validateSub(s) {
      var fw = inputs[s.sfx].closest('.field');
      if (fw.closest('.is-hidden')) { fw.classList.remove('field--error'); return true; }
      var v = inputs[s.sfx].value.trim();
      var bad = false, msg;
      if (s.req && !v) { bad = true; msg = 'This field is required.'; }
      else if (s.zip && v && !/^\d{4}$/.test(v)) { bad = true; msg = 'Enter a 4-digit postcode.'; }
      fw.classList.toggle('field--error', bad); if (msg) fw.querySelector('.error-msg').textContent = msg;
      return !bad;
    }
    var ctrl = {
      v: base, field: field, wrap: wrap, isAddress: true,
      get: function () { var o = {}; subs.forEach(function (s) { o[base + s.sfx] = inputs[s.sfx].value.trim(); }); return o; },
      set: function (val) { if (val) subs.forEach(function (s) { if (val[base + s.sfx] != null) inputs[s.sfx].value = val[base + s.sfx]; }); syncRest(); },
      inputs: inputs, subs: subs,
      clear: function () { subs.forEach(function (s) { inputs[s.sfx].value = ''; }); fs.querySelectorAll('.field').forEach(function (f) { f.classList.remove('field--error'); }); syncRest(); },
      validate: function () {
        if (!shownCtrl(ctrl)) return true;
        var ok = true;
        subs.forEach(function (s) { if (!validateSub(s)) ok = false; });
        return ok;
      }
    };
    return { wrap: wrap, ctrl: ctrl };
  }

  // repeat "Add another …" toggle
  function buildToggle(field) {
    var input = el('input', { type: 'checkbox', id: field.v, name: field.v, value: field.value, 'data-fs-id': field.fs });
    var wrap = el('div', { class: 'field span-2 toggle-add', 'data-field': field.v }, [
      el('label', { class: 'add-toggle' }, [input, el('span', { class: 'add-toggle__plus' }), el('span', { text: field.l })])
    ]);
    var ctrl = {
      v: field.v, field: field, wrap: wrap, isToggle: true,
      get: function () { return input.checked ? field.value : ''; },
      set: function (val) { input.checked = !!val && val !== ''; },
      clear: function () { input.checked = false; },
      validate: function () { return true; }
    };
    input.addEventListener('change', function () { updateVisibility(); persist(); });
    return { wrap: wrap, ctrl: ctrl };
  }

  // consent checkbox (verbatim value; visible text swaps RenoNow→Propential)
  function buildConsent(field) {
    var c = SCHEMA.consents[field.v];
    var box = el('div', { class: 'consent-item', 'data-field': field.v });
    box.appendChild(el('p', { class: 'consent-q', text: c.heading }));
    var input = el('input', { type: 'checkbox', id: field.v, name: field.v, value: c.value, 'data-fs-id': field.fs });
    var content;
    if (c.bullets) {
      content = el('ul', { class: 'consent-bullets' });
      c.bullets.forEach(function (b) { content.appendChild(el('li', { html: linkify(b) })); });
    } else {
      content = el('span', { html: linkify(c.display || c.value.replace(/RenoNow/g, 'Propential')) });
    }
    var label = el('label', { class: 'consent', 'for': field.v }, [input, content]);
    box.appendChild(label);
    box.appendChild(el('p', { class: 'error-msg', text: 'You must agree to this to continue.' }));
    var ctrl = {
      v: field.v, field: field, wrap: box,
      get: function () { return input.checked ? c.value : ''; },
      set: function (val) { input.checked = !!val && val !== ''; },
      clear: function () { input.checked = false; box.classList.remove('field--error'); },
      validate: function () { var ok = input.checked; box.classList.toggle('field--error', !ok); return ok; }
    };
    input.addEventListener('change', function () { if (box.classList.contains('field--error')) ctrl.validate(); persist(); });
    return { wrap: box, ctrl: ctrl };
  }

  function buildField(field) {
    switch (field.t) {
      case 'select': return buildSelect(field);
      case 'radio': return buildRadio(field);
      case 'multi': return buildMulti(field);
      case 'typeahead': return buildTypeahead(field);
      case 'address': return buildAddress(field);
      case 'toggle': return buildToggle(field);
      case 'consent': return buildConsent(field);
      default: return buildInput(field);
    }
  }

  // ---- validation core ----
  function validateValue(field, val, wrap, reqMsg) {
    if (!isVisibleWrap(wrap)) return true;
    var s = String(val == null ? '' : val).trim();
    if (!field.req && !s) { setErr(wrap, false); return true; }
    if (field.req && !s) { setErr(wrap, true, reqMsg || 'This field is required.'); return false; }
    // kind / format checks
    if (field.kind === 'email' && !EMAIL_RE.test(s)) { setErr(wrap, true, 'Please enter a valid email address.'); return false; }
    if (field.kind === 'auMobile' && !/^04\d{8}$/.test(s.replace(/\s/g, ''))) { setErr(wrap, true, 'Enter a valid AU mobile (04xx xxx xxx).'); return false; }
    if (field.kind === 'dobAdult') {
      var d = new Date(s); var n = new Date(); var age = n.getFullYear() - d.getFullYear();
      var m = n.getMonth() - d.getMonth(); if (m < 0 || (m === 0 && n.getDate() < d.getDate())) age--;
      if (!(age >= 18)) { setErr(wrap, true, 'You must be at least 18 years old.'); return false; }
    }
    if (field.kind === 'futureDate') { if (!(new Date(s) > new Date(new Date().toDateString()))) { setErr(wrap, true, 'Please enter a future date.'); return false; } }
    if (field.digits != null && !(new RegExp('^\\d{' + field.digits + '}$')).test(s.replace(/\s/g, ''))) { setErr(wrap, true, 'Enter exactly ' + field.digits + ' digits.'); return false; }
    if (field.digitsRange && !(new RegExp('^\\d{' + field.digitsRange[0] + ',' + field.digitsRange[1] + '}$')).test(s.replace(/\s/g, ''))) { setErr(wrap, true, 'Enter ' + field.digitsRange[0] + '–' + field.digitsRange[1] + ' digits.'); return false; }
    if ((field.t === 'money' || field.t === 'num')) {
      var nv = num(s);
      if (isNaN(nv)) { setErr(wrap, true, 'Please enter a number.'); return false; }
      if (field.min != null && nv < field.min) { setErr(wrap, true, 'Enter at least $' + field.min.toLocaleString() + '.'); return false; }
      if (field.max != null && nv > field.max) { setErr(wrap, true, 'Enter no more than $' + field.max.toLocaleString() + '.'); return false; }
      if (nv < 0) { setErr(wrap, true, 'Cannot be negative.'); return false; }
      if (field.gte) { var base = num(getVal(field.gte)); if (!isNaN(base) && nv < base) { setErr(wrap, true, 'Must be at least your general expenses.'); return false; } }
    }
    setErr(wrap, false); return true;
  }
  function isVisibleWrap(wrap) { var n = wrap; while (n) { if (n.classList && n.classList.contains('is-hidden')) return false; if (n === form) break; n = n.parentNode; } return true; }
  function shownCtrl(ctrl) { return isVisibleWrap(ctrl.wrap); }

  // ============================================================
  //  RENDER
  // ============================================================
  function register(ctrl) { if (ctrl && ctrl.v) byVar[ctrl.v] = ctrl; }

  function makeConfirmAll() {
    var btn = el('button', { type: 'button', class: 'confirm-all', text: 'Confirm all declarations' });
    btn.addEventListener('click', function () {
      stepsHost.querySelectorAll('.consent-item input[type="checkbox"]').forEach(function (cb) { cb.checked = true; });
      stepsHost.querySelectorAll('.consent-item.field--error').forEach(function (b) { b.classList.remove('field--error'); });
      btn.classList.add('is-done'); btn.textContent = 'All declarations confirmed';
      persist();
    });
    return btn;
  }

  function renderFieldInto(host, field, collectCtrls) {
    if (field.t === 'subhead') { var sh = el('h3', { class: 'subhead', text: field.label }); host.appendChild(sh); if (field.show) vis.push({ wrap: sh, show: field.show, ctrls: [] }); return; }
    if (field.t === 'group') {
      var g = el('div', { class: 'repeat-group' });
      if (field.label) g.appendChild(el('p', { class: 'repeat-label', text: field.label }));
      var grid = el('div', { class: 'field-grid' });
      var childCtrls = [];
      field.fields.forEach(function (f) {
        var built = buildField(f); grid.appendChild(built.wrap); register(built.ctrl);
        if (built.ctrl) { childCtrls.push(built.ctrl); if (f.show) vis.push({ wrap: built.wrap, show: f.show, ctrls: [built.ctrl] }); }
      });
      g.appendChild(grid); host.appendChild(g);
      if (field.show) vis.push({ wrap: g, show: field.show, ctrls: childCtrls });
      return;
    }
    var built = buildField(field); host.appendChild(built.wrap); register(built.ctrl);
    if (built.ctrl && field.show) vis.push({ wrap: built.wrap, show: field.show, ctrls: [built.ctrl] });
  }

  function render() {
    SCHEMA.steps.forEach(function (step, i) {
      var section = el('section', { class: 'wiz-step', 'data-step': i, 'data-screen-label': step.title });
      var head = el('div', { class: 'wiz-step__head' }, [
        el('span', { class: 'blk-eyebrow', text: step.eyebrow }),
        el('h2', { text: step.title })
      ]);
      if (step.blurb) {
        if (step.key === 'consents') head.appendChild(el('div', { class: 'head-row' }, [el('p', { class: 'wiz-step__blurb', text: step.blurb }), makeConfirmAll()]));
        else head.appendChild(el('p', { class: 'wiz-step__blurb', text: step.blurb }));
      }
      section.appendChild(head);
      var body = el('div', { class: 'wiz-step__body' });
      var grid = el('div', { class: 'field-grid' });
      step.fields.forEach(function (field) {
        // subheads, groups & full-width blocks break out of the grid
        if (field.t === 'subhead' || field.t === 'group' || field.t === 'toggle') {
          if (grid.childNodes.length) body.appendChild(grid);
          grid = el('div', { class: 'field-grid' });
          renderFieldInto(body, field, true);
        } else renderFieldInto(grid, field, true);
      });
      if (grid.childNodes.length) body.appendChild(grid);
      section.appendChild(body);
      stepsHost.appendChild(section);
      stepEls.push(section);
    });

    // hidden tracking inputs
    SCHEMA.tracking.forEach(function (t) {
      var input = el('input', { type: 'hidden', id: t.v, name: t.v, 'data-fs-id': t.fs });
      if (t.value) input.value = t.value;
      trackHost.appendChild(input);
    });
    populateTracking();
    buildStepper();
  }

  // ============================================================
  //  STEPPER + NAV
  // ============================================================
  var bar, countEl, titleEl, stepList, backBtn, nextBtn;
  function buildStepper() {
    countEl = document.getElementById('wizCount');
    titleEl = document.getElementById('wizTitle');
    bar = document.getElementById('wizBarFill');
    stepList = document.getElementById('wizDots');
    backBtn = document.getElementById('wizBack');
    nextBtn = document.getElementById('wizNext');
    SCHEMA.steps.forEach(function (step, i) {
      var li = el('li', { class: 'wiz-dot', 'data-go': i }, [
        el('span', { class: 'wiz-dot__n', text: String(i + 1) }),
        el('span', { class: 'wiz-dot__l', text: step.title })
      ]);
      li.addEventListener('click', function () { goTo(i); });
      stepList.appendChild(li);
    });
    backBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () {
      if (current === SCHEMA.steps.length - 1) { submit(); return; }
      if (validateStep(current)) goTo(current + 1);
    });
  }

  function goTo(i) {
    i = Math.max(0, Math.min(SCHEMA.steps.length - 1, i));
    current = i;
    stepEls.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
    var total = SCHEMA.steps.length;
    countEl.textContent = 'Step ' + (i + 1) + ' of ' + total;
    titleEl.textContent = SCHEMA.steps[i].title;
    var railC = document.getElementById('wizRailCount'); if (railC) railC.textContent = 'Step ' + (i + 1) + ' of ' + total;
    bar.style.width = ((i + 1) / total * 100) + '%';
    Array.prototype.forEach.call(stepList.children, function (li, n) {
      li.classList.toggle('is-current', n === i);
      li.classList.toggle('is-done', n < i);
    });
    backBtn.style.visibility = i === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = i === total - 1 ? 'Submit application' : 'Continue';
    nextBtn.classList.toggle('is-submit', i === total - 1);
    persist();
    var topEl = document.getElementById('wizTop');
    var y = 0, n = topEl; while (n) { y += n.offsetTop; n = n.offsetParent; }
    window.scrollTo({ top: Math.max(0, y - 100), behavior: 'smooth' });
  }

  function ctrlsInStep(i) {
    var list = [];
    SCHEMA.steps[i].fields.forEach(function (f) {
      if (f.t === 'group') f.fields.forEach(function (g) { if (byVar[g.v]) list.push(byVar[g.v]); });
      else if (byVar[f.v]) list.push(byVar[f.v]);
    });
    return list;
  }
  function validateStep(i) {
    var ok = true, firstBad = null;
    ctrlsInStep(i).forEach(function (c) {
      if (!shownCtrl(c)) return;
      if (!c.validate()) { ok = false; if (!firstBad) firstBad = c.wrap; }
    });
    if (firstBad) window.scrollTo({ top: firstBad.getBoundingClientRect().top + window.pageYOffset - 120, behavior: 'smooth' });
    return ok;
  }

  // ============================================================
  //  VISIBILITY (cascading)
  // ============================================================
  function updateVisibility() {
    var changed = true, guard = 0;
    while (changed && guard++ < 8) {
      changed = false;
      vis.forEach(function (v) {
        var want = shown(v.show);
        var isHidden = v.wrap.classList.contains('is-hidden');
        if (want === isHidden) {
          v.wrap.classList.toggle('is-hidden', !want);
          if (!want) v.ctrls.forEach(function (c) { c.clear && c.clear(); });
          changed = true;
        } else if (!want) {
          // keep hidden fields cleared so cascade stays correct
        }
      });
    }
  }

  // ============================================================
  //  PERSISTENCE
  // ============================================================
  var saveTimer;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        var values = {};
        for (var v in byVar) { if (byVar[v].isAddress) values[v] = byVar[v].get(); else values[v] = byVar[v].get(); }
        localStorage.setItem(STORE_KEY, JSON.stringify({ values: values, step: current, ts: Date.now() }));
      } catch (e) {}
    }, 250);
  }
  function restore() {
    var saved;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) {}
    if (!saved || !saved.values) return null;
    for (var v in saved.values) { if (byVar[v]) byVar[v].set(saved.values[v]); }
    if (byVar.term && byVar.term.rebuild) { byVar.term.rebuild(); if (saved.values.term) byVar.term.set(saved.values.term); }
    return saved;
  }

  // ============================================================
  //  TRACKING + ADDRESS AUTOCOMPLETE
  // ============================================================
  function populateTracking() {
    try {
      var p = new URLSearchParams(location.search);
      SCHEMA.tracking.forEach(function (t) { if (t.param) { var val = p.get(t.param); if (val) { var elx = document.getElementById(t.v); if (elx) elx.value = val; } } });
    } catch (e) {}
  }

  // Address autocomplete → fills the 5 sub-inputs (needs a Google Maps key;
  // without one the sub-inputs remain ordinary, fully-usable text fields).
  function initAddressAC() {
    var m = document.querySelector('meta[name="google-maps-key"]');
    var key = window.PROPENTIAL_MAPS_KEY || (m && m.content) || '';
    if (!key) return;
    window.__propentialApplyAC = function () {
      if (!(window.google && google.maps && google.maps.places)) return;
      document.querySelectorAll('[data-address-ac]').forEach(function (input) {
        var base = input.getAttribute('data-addr-target');
        var ac = new google.maps.places.Autocomplete(input, { componentRestrictions: { country: 'au' }, fields: ['address_components'], types: ['address'] });
        input.setAttribute('autocomplete', 'off');
        ac.addListener('place_changed', function () {
          var place = ac.getPlace(); if (!place || !place.address_components) return;
          var get = function (type) { var c = place.address_components.find(function (x) { return x.types.indexOf(type) >= 0; }); return c ? c : null; };
          var streetNo = get('street_number'), route = get('route');
          var sub = get('locality') || get('postal_town') || get('sublocality') || get('administrative_area_level_2');
          var state = get('administrative_area_level_1'), zip = get('postal_code');
          var byId = function (sfx) { return document.getElementById(base + sfx); };
          byId('_address').value = [streetNo && streetNo.long_name, route && route.long_name].filter(Boolean).join(' ');
          if (sub) byId('_city').value = sub.long_name;
          if (state) { var sv = state.short_name; var selEl = byId('_state'); if (selEl) { Array.prototype.forEach.call(selEl.options, function (o) { if (o.value === sv) selEl.value = sv; }); } }
          if (zip) byId('_zip').value = zip.long_name;
          var sa = byId('_address'); if (sa) sa.dispatchEvent(new Event('input', { bubbles: true }));
          persist();
        });
      });
    };
    var s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key) + '&libraries=places&callback=__propentialApplyAC&loading=async';
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  }

  // ============================================================
  //  SUBMIT
  // ============================================================
  function collect() {
    var out = {};
    SCHEMA.steps.forEach(function (step) {
      step.fields.forEach(function (f) {
        if (f.t === 'subhead') return;
        if (f.t === 'group') { f.fields.forEach(function (g) { collectField(g, out); }); return; }
        collectField(f, out);
      });
    });
    SCHEMA.tracking.forEach(function (t) { var elx = document.getElementById(t.v); out[t.v] = elx ? elx.value : ''; });
    // renoIsHome=Yes → copy home address into renovation address keys
    if (getVal('renoIsHome') === 'Yes' && byVar.resAddress && byVar.propAddress) {
      var home = byVar.resAddress.get();
      ['_address', '_address2', '_city', '_state', '_zip'].forEach(function (sfx) { out['propAddress' + sfx] = home['resAddress' + sfx] || ''; });
    }
    return out;
  }
  function collectField(f, out) {
    var c = byVar[f.v]; if (!c) return;
    if (c.isAddress) { var o = c.get(); for (var k in o) out[k] = o[k]; return; }
    out[f.v] = c.get();
  }

  function validateAll() {
    for (var i = 0; i < SCHEMA.steps.length; i++) {
      var ok = true;
      ctrlsInStep(i).forEach(function (c) { if (shownCtrl(c) && !c.validate()) ok = false; });
      if (!ok) { goTo(i); validateStep(i); return false; }
    }
    return true;
  }

  // The repeat "Add another …" toggles and the 7 consents whose collected value
  // is a label/verbatim string but whose backend contract is a boolean.
  var TOGGLE_KEYS = ['addCl2', 'addCl3', 'addSrc2', 'addSrc3', 'addIp2', 'addIp3',
    'addAsset2', 'addAsset3', 'addAsset4', 'addCard2', 'addCard3', 'addCard4', 'addCard5',
    'addDebt2', 'addDebt3', 'addDebt4', 'addDebt5'];
  var CONSENT_KEYS = ['consentPrivacy', 'consentConfirm', 'consentCitizen', 'consentAccuracy',
    'consentCredit', 'consentElectronic', 'consentBiometric'];

  // Normalise the schema's collected values into the exact shape the backend
  // (/api/submit-apply → applySchema) expects. The backend owns the Formstack
  // field-ids and exact option strings, so the design never has to.
  function toBackendData(raw) {
    var d = {};
    for (var k in raw) if (Object.prototype.hasOwnProperty.call(raw, k)) d[k] = raw[k];
    // term "5 Years" → "5" (backend maps the number → exact Formstack option label)
    if (raw.term) { var ty = parseInt(raw.term, 10); d.term = isNaN(ty) ? '' : String(ty); }
    // structured addresses → backend keys
    d.resAddress = raw.resAddress_address || '';
    d.resCity = raw.resAddress_city || '';
    d.resState = raw.resAddress_state || '';
    d.resPostcode = raw.resAddress_zip || '';
    d.prevResAddress = raw.prevAddress_address || '';
    d.propAddress = raw.propAddress_address || '';
    d.propCity = raw.propAddress_city || '';
    d.propState = raw.propAddress_state || '';
    d.propPostcode = raw.propAddress_zip || '';
    // string/label values → booleans
    CONSENT_KEYS.forEach(function (key) { d[key] = !!raw[key]; });
    TOGGLE_KEYS.forEach(function (key) { d[key] = !!raw[key]; });
    return d;
  }

  function setSubmitting(on) {
    if (!nextBtn) return;
    nextBtn.disabled = on;
    nextBtn.textContent = on ? 'Submitting…' : 'Submit application';
    if (backBtn) backBtn.disabled = on;
  }
  function showSubmitError() {
    setSubmitting(false);
    var box = document.getElementById('wizSubmitError') || el('p', { class: 'submit-error', id: 'wizSubmitError', role: 'alert' });
    box.textContent = 'Sorry, something went wrong submitting your application. Please try again — if it keeps happening, contact us and we’ll help.';
    if (nextBtn && nextBtn.parentNode && !document.getElementById('wizSubmitError')) nextBtn.parentNode.insertBefore(box, nextBtn);
  }

  function submit() {
    updateVisibility();
    if (!validateAll()) return;
    var raw = collect();
    var payload = toBackendData(raw);
    setSubmitting(true);
    fetch('/api/submit-apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; });
    }).then(function (res) {
      if (res.ok && res.body && res.body.ok) {
        try { localStorage.removeItem(STORE_KEY); } catch (e) {}
        showSuccess(raw);
      } else {
        console.log('[v0] submit failed', res);
        showSubmitError();
      }
    }).catch(function (err) {
      console.log('[v0] submit network error', err);
      showSubmitError();
    });
  }

  var MARK = '<span class="result-mark mark" aria-hidden="true"><svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="armg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECD58C"/><stop offset="0.5" stop-color="#D6B15E"/><stop offset="1" stop-color="#B6873A"/></linearGradient></defs><path d="M34 96 L100 36 L166 96" fill="none" stroke="url(#armg)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M52 92 V162 Q52 174 64 174 H136 Q148 174 148 162 V92" fill="none" stroke="url(#armg)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="100" cy="112" r="14" fill="url(#armg)"/><path d="M90 120 L110 120 L114 154 L86 154 Z" fill="url(#armg)"/></svg></span>';
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function showSuccess(data) {
    var first = (data.firstName || '').trim();
    document.getElementById('wizChrome').hidden = true;
    result.innerHTML = MARK +
      '<h2>Application received' + (first ? ', ' + escapeHtml(first) : '') + '.</h2>' +
      '<p style="max-width:none">Thanks for applying with Propential. Our team will review your application against our credit policy and come back to you quickly with next steps, usually by email or phone.</p>' +
      '<p style="margin-top:14px;font-size:0.78rem;color:var(--text-faint);max-width:none">This confirmation is not an approval or credit offer.<br>Your application is subject to credit assessment and our lending criteria.</p>' +
      '<div class="result-actions"><a class="btn btn-primary btn-lg" href="index.html">Back to home</a></div>' +
      '<div class="appsteps" aria-label="Application progress"><div class="apptrack">' +
        '<div class="appstep appstep--done"><span class="appstep__node">\u2713</span><span class="appstep__label">Application Received</span></div>' +
        '<div class="appstep appstep--current"><span class="appstep__node">2</span><span class="appstep__label">Application Under Review</span></div>' +
        '<div class="appstep appstep--todo"><span class="appstep__node">3</span><span class="appstep__label">Conditional Approval<sup>^</sup> within minutes</span></div>' +
        '<div class="appstep appstep--todo"><span class="appstep__node">4</span><span class="appstep__label">Full Approval</span></div>' +
      '</div><p class="appsteps__foot"><sup>^</sup> Conditional approval subject to suitability and receiving all required information during normal NSW business hours. Final approval subject to our lending criteria and supplying satisfactory supporting documents.</p></div>';
    result.hidden = false;
    window.scrollTo({ top: Math.max(0, result.getBoundingClientRect().top + window.pageYOffset - 110), behavior: 'smooth' });
  }

  // ============================================================
  //  INIT
  // ============================================================
  render();
  function syncPropValue() { if (getVal('renoIsHome') === 'Yes' && byVar.propValue && byVar.homeValue) byVar.propValue.set(byVar.homeValue.get()); }
  form.addEventListener('change', function () { updateVisibility(); if (byVar.term && byVar.term.rebuild) byVar.term.rebuild(); syncPropValue(); persist(); });
  form.addEventListener('input', function (e) { if (byVar.term && byVar.term.rebuild && e.target && e.target.id === 'amount') byVar.term.rebuild(); if (e.target && e.target.id === 'homeValue') syncPropValue(); persist(); });
  var saved = restore();
  updateVisibility();
  initAddressAC();
  goTo(saved && typeof saved.step === 'number' ? saved.step : 0);
  // prevent native submit
  form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
})();
