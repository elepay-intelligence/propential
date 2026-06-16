/* Propential repayment calculator */
(function () {
  var RATE = 0.1795; // 17.95% p.a.

  function feeBand(amount) {
    if (amount <= 25000) return { est: 975, monthly: 19.50 };
    if (amount <= 50000) return { est: 1130, monthly: 24.50 };
    if (amount <= 75000) return { est: 1285, monthly: 29.50 };
    return { est: 1440, monthly: 34.50 };
  }
  function periodsPerYear() { return 12; } // monthly only
  function repayment(amount, years) {
    var ppy = periodsPerYear(), r = RATE / ppy, n = years * ppy;
    return amount * r / (1 - Math.pow(1 + r, -n));
  }
  var money0 = function (n) { return '$' + Math.round(n).toLocaleString('en-AU'); };
  var money2 = function (n) { return '$' + n.toFixed(2); };

  var amount = document.getElementById('amount');
  var term = document.getElementById('term');
  var amountOut = document.getElementById('amountOut');
  var termOut = document.getElementById('termOut');
  var termMaxLabel = document.getElementById('termMaxLabel');
  var termNote = document.getElementById('termNote');
  var monthlyOut = document.getElementById('monthlyOut');
  var calcEyebrow = document.getElementById('calcEyebrow');
  var calcPer = document.getElementById('calcPer');
  var rAmount = document.getElementById('rAmount');
  var rTerm = document.getElementById('rTerm');
  var rTotal = document.getElementById('rTotal');
  var rEst = document.getElementById('rEst');
  var rMonthlyFee = document.getElementById('rMonthlyFee');

  // Seed defaults from home-page Tweaks, if present
  try {
    var t = JSON.parse(localStorage.getItem('propential_tweaks') || '{}');
    if (t.calcAmount) amount.value = Math.min(100000, Math.max(5000, t.calcAmount));
    if (t.calcTerm) term.value = t.calcTerm;
  } catch (e) {}

  function fillTrack(el) {
    var pct = (el.value - el.min) / (el.max - el.min) * 100;
    el.style.setProperty('--pct', pct + '%');
  }

  function syncTermBand() {
    var amt = +amount.value;
    var maxTerm = amt > 50000 ? 10 : 7;
    term.max = maxTerm;
    termMaxLabel.textContent = maxTerm + ' yrs';
    if (+term.value > maxTerm) term.value = maxTerm;
    termNote.textContent = amt > 50000
      ? 'Terms of up to 10 years apply for loans from $50,001 to $100,000.'
      : 'Terms of 1–7 years apply for loans up to $50,000.';
  }

  function update() {
    syncTermBand();
    var amt = +amount.value;
    var yrs = +term.value;
    var band = feeBand(amt);
    var ppy = periodsPerYear();
    var pay = repayment(amt, yrs);
    var total = pay * yrs * ppy;

    amountOut.textContent = money0(amt);
    termOut.textContent = yrs + (yrs === 1 ? ' year' : ' years');
    monthlyOut.textContent = money0(pay);
    if (calcEyebrow) calcEyebrow.textContent = 'Indicative monthly repayment';
    if (calcPer) calcPer.textContent = '/ month';
    rAmount.textContent = money0(amt);
    rTerm.textContent = yrs + (yrs === 1 ? ' year' : ' years');
    rTotal.textContent = money0(total);
    rEst.textContent = money0(band.est);
    rMonthlyFee.textContent = money2(band.monthly);

    fillTrack(amount);
    fillTrack(term);

    // Persist for cross-page consistency
    try {
      var saved = JSON.parse(localStorage.getItem('propential_tweaks') || '{}');
      saved.calcAmount = amt; saved.calcTerm = yrs;
      localStorage.setItem('propential_tweaks', JSON.stringify(saved));
    } catch (e) {}
  }

  amount.addEventListener('input', update);
  term.addEventListener('input', update);
  update();
})();
