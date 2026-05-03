(function () {

  var REF_STORAGE = 'memoryan_waitlist_ref';

  var turnstileWidgetId = null;

  var turnstileToken = null;

  /** @type {'input'|'captcha'|'submitting'} */

  var flow = 'input';

  var postInFlight = false;



  function cfg() {  

    return window.MemoryanConfig || {};

  }



  function supabaseHeaders() {

    var s = cfg().supabase || {};

    var key = s.anonKey || '';

    return {

      Authorization: 'Bearer ' + key,

      apikey: key,

      'Content-Type': 'application/json',

    };

  }



  function baseUrl() {

    var s = cfg().supabase || {};

    return (s.url || '').replace(/\/$/, '');

  }



  function captureRefFromUrl() {

    try {

      var p = new URLSearchParams(window.location.search);

      var r = (p.get('ref') || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

      if (r.length >= 4 && r.length <= 16) {

        sessionStorage.setItem(REF_STORAGE, r);

      }

    } catch (_) {}

  }



  function getStoredRef() {

    try {

      return sessionStorage.getItem(REF_STORAGE) || '';

    } catch (_) {

      return '';

    }

  }



  function t(key) {

    if (window.i18n && typeof window.i18n.t === 'function') return window.i18n.t(key);

    return key;

  }



  /** Looks valid for UX gate (stricter than HTML5 email). */

  function isWaitlistEmailValid(raw) {

    var v = (raw || '').trim();

    if (v.length < 5 || v.length > 75) return false;

    if (/[\s<>\[\]{}\\]/.test(v)) return false;

    if (v.indexOf('@') < 1 || v.indexOf('@') !== v.lastIndexOf('@')) return false;

    var parts = v.split('@');

    if (parts.length !== 2) return false;

    var local = parts[0];

    var domain = parts[1].toLowerCase();

    if (!local || !domain) return false;

    if (domain.indexOf('.') < 0) return false;

    if (domain.startsWith('.') || domain.endsWith('.') || domain.indexOf('..') >= 0) return false;

    if (local.indexOf('..') >= 0) return false;

    if (domain === 'example.com' || domain.endsWith('.example.com')) return false;

    return true;

  }



  function variantMessageKey(count) {

    var n = typeof count === 'number' && !isNaN(count) ? count : 0;

    if (n >= 5000) return 'waitlist.milestone5000';

    if (n >= 1000) return 'waitlist.milestone1000';

    if (n >= 500) return 'waitlist.milestone500';

    return 'waitlist.v' + (n % 20);

  }



  function updateCounterUi(count) {

    var valEl = document.getElementById('waitlist-count-value');

    var varEl = document.getElementById('waitlist-variant-line');

    var underEl = document.getElementById('waitlist-under500-line');

    if (valEl) valEl.textContent = String(count);

    if (underEl) {

      if (typeof count === 'number' && count >= 0 && count < 500) {

        underEl.hidden = false;


      } else {

        underEl.hidden = true;

        underEl.textContent = '';

      }

    }

    if (varEl) varEl.textContent = t(variantMessageKey(count));

  }



  function fetchStats() {

    var url = baseUrl() + '/functions/v1/waitlist-stats';

    return fetch(url, { method: 'GET', headers: supabaseHeaders() })

      .then(function (r) {

        return r.json().then(function (j) {

          return { ok: r.ok, json: j };

        });

      })

      .then(function (_ref) {

        var j = _ref.json;

        if (_ref.ok && j && typeof j.count === 'number') {

          updateCounterUi(j.count);

        } else {

          updateCounterUi(0);

        }

      })

      .catch(function () {

        var el = document.getElementById('waitlist-count-value');

        if (el) el.textContent = '—';

        var u = document.getElementById('waitlist-under500-line');

        if (u) {

          u.hidden = true;

          u.textContent = '';

        }

      });

  }



  function whenTurnstileReady(cb, n) {

    if (window.turnstile && typeof window.turnstile.render === 'function') {

      cb();

      return;

    }

    if ((n || 0) > 120) return;

    setTimeout(function () {

      whenTurnstileReady(cb, (n || 0) + 1);

    }, 50);

  }



  function destroyTurnstile() {

    var el = document.getElementById('waitlist-turnstile');

    if (window.turnstile && turnstileWidgetId != null) {

      try {

        window.turnstile.remove(turnstileWidgetId);

      } catch (_) {}

    }

    turnstileWidgetId = null;

    turnstileToken = null;

    if (el) el.innerHTML = '';

  }



  function mountTurnstile() {

    var el = document.getElementById('waitlist-turnstile');

    var w = cfg().waitlist || {};

    var siteKey = w.turnstileSiteKey || '';

    if (!el || !siteKey) return;

    if (turnstileWidgetId != null) return;

    whenTurnstileReady(function () {

      try {

        el.innerHTML = '';

        turnstileToken = null;

        turnstileWidgetId = window.turnstile.render(el, {

          sitekey: siteKey,

          callback: function (token) {

            turnstileToken = token;

            tryAutoSubmitAfterCaptcha();

          },

          'expired-callback': function () {

            turnstileToken = null;

          },

          'error-callback': function () {

            turnstileToken = null;

          },

        });

      } catch (e) {

        console.warn('Turnstile render failed', e);

      }

    });

  }



  function resetTurnstile() {

    if (window.turnstile && turnstileWidgetId != null) {

      try {

        window.turnstile.reset(turnstileWidgetId);

      } catch (_) {}

    }

    turnstileToken = null;

  }



  function getEls() {

    return {

      form: document.getElementById('waitlist-form'),

      email: document.getElementById('waitlist-email'),

      ctaWrap: document.getElementById('waitlist-cta-wrap'),

      captchaStage: document.getElementById('waitlist-captcha-stage'),

      submitBtn: document.getElementById('waitlist-submit'),

      label: document.getElementById('waitlist-submit-label'),

      loading: document.getElementById('waitlist-submit-loading'),

      loadingText: document.getElementById('waitlist-submit-loading-text'),

      msg: document.getElementById('waitlist-form-message'),

    };

  }



  function showSubmitProgress(text, withSpinner) {

    var o = getEls();

    if (!o.submitBtn || !o.label || !o.loading || !o.loadingText) return;

    o.label.hidden = true;

    o.loading.hidden = false;

    o.loadingText.textContent = text;

    if (withSpinner === false) {

      o.loading.classList.add('waitlist-submit-loading--no-spinner');

    } else {

      o.loading.classList.remove('waitlist-submit-loading--no-spinner');

    }

    o.submitBtn.classList.add('is-loading');

    o.submitBtn.disabled = true;

    o.submitBtn.setAttribute('aria-busy', 'true');

  }



  function hideSubmitProgress() {

    var o = getEls();

    if (!o.submitBtn || !o.label || !o.loading || !o.loadingText) return;

    o.loading.hidden = true;

    o.loadingText.textContent = '';

    o.loading.classList.remove('waitlist-submit-loading--no-spinner');

    o.label.hidden = false;

    o.submitBtn.classList.remove('is-loading');

    o.submitBtn.disabled = false;

    o.submitBtn.setAttribute('aria-busy', 'false');

  }



  function syncEmailStepUi() {

    var o = getEls();

    if (!o.email || !o.ctaWrap || !o.captchaStage) return;

    var valid = isWaitlistEmailValid(o.email.value);

    if (!valid) {

      o.ctaWrap.hidden = true;

      if (flow === 'captcha') {

        flow = 'input';

        o.captchaStage.hidden = true;

        if (o.submitBtn) o.submitBtn.setAttribute('aria-expanded', 'false');

        destroyTurnstile();

        hideSubmitProgress();

      }

      return;

    }

    if (flow === 'input') {

      o.ctaWrap.hidden = false;

    }

  }



  function tryAutoSubmitAfterCaptcha() {

    if (flow !== 'captcha' || postInFlight || !turnstileToken) return;

    doPost();

  }



  function doPost() {

    var o = getEls();

    if (!o.form || !o.email || postInFlight) return;

    var honeypot = o.form.querySelector('input[name="website"]');

    if (o.msg) {

      o.msg.textContent = '';

      o.msg.classList.remove('is-success', 'is-error');

    }

    postInFlight = true;

    flow = 'submitting';

    showSubmitProgress(t('waitlist.submitting'), false);



    var email = o.email.value.trim();

    var body = {

      email: email,

      turnstileToken: turnstileToken,

      website: honeypot ? honeypot.value : '',

      referredByCode: getStoredRef() || undefined,

      source: 'website',

    };



    fetch(baseUrl() + '/functions/v1/waitlist-signup', {

      method: 'POST',

      headers: supabaseHeaders(),

      body: JSON.stringify(body),

    })

      .then(function (r) {

        return r.json().then(function (j) {

          return { ok: r.ok, status: r.status, json: j };

        });

      })

      .then(function (res) {

        if (!o.msg) return;

        o.msg.classList.remove('is-success', 'is-error');

        if (res.ok && res.json && res.json.ok === true) {

          o.msg.textContent = t('waitlist.success');

          o.msg.classList.add('is-success');

          o.form.reset();

          flow = 'input';

          o.ctaWrap.hidden = true;

          o.captchaStage.hidden = true;

          if (o.submitBtn) o.submitBtn.setAttribute('aria-expanded', 'false');

          destroyTurnstile();

          hideSubmitProgress();

          fetchStats();

        } else if (res.status === 429) {

          o.msg.textContent = t('waitlist.errorRateLimit');

          o.msg.classList.add('is-error');

          flow = 'captcha';

          resetTurnstile();

          showSubmitProgress(t('waitlist.awaitingCaptcha'));

        } else {

          o.msg.textContent = t('waitlist.errorGeneric');

          o.msg.classList.add('is-error');

          flow = 'captcha';

          resetTurnstile();

          showSubmitProgress(t('waitlist.awaitingCaptcha'));

        }

      })

      .catch(function () {

        if (o.msg) {

          o.msg.textContent = t('waitlist.errorNetwork');

          o.msg.classList.add('is-error');

        }

        flow = 'captcha';

        resetTurnstile();

        showSubmitProgress(t('waitlist.awaitingCaptcha'));

      })

      .finally(function () {

        postInFlight = false;

      });

  }



  function beginCaptchaFlow() {

    var o = getEls();

    if (!o.email || !isWaitlistEmailValid(o.email.value) || postInFlight) return;

    if (!o.submitBtn) return;

    if (o.msg) {

      o.msg.textContent = '';

      o.msg.classList.remove('is-success', 'is-error');

    }

    flow = 'captcha';

    o.captchaStage.hidden = false;

    o.submitBtn.setAttribute('aria-expanded', 'true');

    showSubmitProgress(t('waitlist.awaitingCaptcha'));

    mountTurnstile();

    try {

      o.captchaStage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (_) {}

  }



  function handlePrimaryAction() {

    var o = getEls();

    if (!o.email || postInFlight) return;

    if (o.msg && o.msg.classList.contains('is-success')) return;



    if (!isWaitlistEmailValid(o.email.value)) {

      if (o.msg) {

        o.msg.textContent = t('waitlist.errorEmail');

        o.msg.classList.add('is-error');

      }

      return;

    }



    if (flow === 'input') {

      beginCaptchaFlow();

      return;

    }



    if (flow === 'captcha') {

      if (turnstileToken) {

        doPost();

      } else if (o.msg) {

        o.msg.textContent = t('waitlist.errorCaptcha');

        o.msg.classList.add('is-error');

      }

    }

  }



  function initForm() {

    var o = getEls();

    if (!o.form || !o.email) return;



    o.form.addEventListener('submit', function (e) {

      e.preventDefault();

      handlePrimaryAction();

    });



    o.email.addEventListener('input', function () {

      if (o.msg) {

        o.msg.textContent = '';

        o.msg.classList.remove('is-success', 'is-error');

      }

      syncEmailStepUi();

    });



    o.email.addEventListener('keydown', function (e) {

      if (e.key !== 'Enter') return;

      e.preventDefault();

      if (isWaitlistEmailValid(o.email.value)) {

        if (flow === 'input') beginCaptchaFlow();

        else if (flow === 'captcha' && turnstileToken) doPost();

      }

    });



    if (o.submitBtn) {

      o.submitBtn.addEventListener('click', function () {

        handlePrimaryAction();

      });

    }



    syncEmailStepUi();

  }



  window.memoryanWaitlistRefresh = function () {

    updateLocalDevBanner();

    var valEl = document.getElementById('waitlist-count-value');

    if (!valEl || valEl.textContent === '—') return;

    var n = parseInt(valEl.textContent, 10);

    if (!isNaN(n)) updateCounterUi(n);

  };



  function updateLocalDevBanner() {

    var b = document.getElementById('waitlist-local-dev-banner');

    if (!b) return;

    if (location.protocol === 'file:') {

      b.hidden = false;

      b.textContent = t('waitlist.localDevBannerFile');

    } else {

      b.hidden = true;

      b.textContent = '';

    }

  }



  function initVideoModal() {

    var modal = document.getElementById('video-modal');

    var openBtn = document.getElementById('watch-video-open');

    var closeBtn = document.getElementById('video-modal-close');

    var backdrop = document.querySelector('[data-video-modal-close]');

    if (!modal || !openBtn) return;



    function openModal() {

      modal.classList.add('is-open');

      modal.setAttribute('aria-hidden', 'false');

      document.body.style.overflow = 'hidden';

      try {

        window.dispatchEvent(new Event('resize'));

      } catch (_) {}

      try {

        window.dispatchEvent(new CustomEvent('memoryan:trailer-modal-open'));

      } catch (_) {}

    }



    function closeModal() {

      var v = document.getElementById('trailerVideo');

      if (v) {

        try {

          v.pause();

        } catch (_) {}

      }

      modal.classList.remove('is-open');

      modal.setAttribute('aria-hidden', 'true');

      document.body.style.overflow = '';

    }



    openBtn.addEventListener('click', function () {

      openModal();

    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {

      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();

    });

  }



  window.initMemoryanWaitlist = function () {

    updateLocalDevBanner();

    initVideoModal();

    captureRefFromUrl();

    fetchStats();

    initForm();

  };

})();

