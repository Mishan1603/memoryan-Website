(function () {

  var REF_STORAGE = 'memoryan_waitlist_ref';

  var JOINED_STORAGE = 'memoryan_waitlist_joined_v1';

  var turnstileWidgetId = null;

  var turnstileToken = null;

  /** @type {'input'|'captcha'|'submitting'|'joined'} */

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



  function readStoredRefCode() {

    try {

      var raw = localStorage.getItem(JOINED_STORAGE);

      if (!raw) return null;

      var o = JSON.parse(raw);

      var c = o && o.refCode;

      if (typeof c === 'string' && /^[A-Z0-9]{4,16}$/.test(c)) return c;

    } catch (_) {}

    return null;

  }



  function persistJoinedRef(ref) {

    if (!ref || typeof ref !== 'string') return;

    try {

      localStorage.setItem(JOINED_STORAGE, JSON.stringify({ v: 1, refCode: ref }));

    } catch (_) {}

  }



  function referUrlForCode(code) {

    try {

      var u = new URL(window.location.href);

      u.searchParams.set('ref', code);

      return u.toString();

    } catch (_) {

      return window.location.origin + '/?ref=' + encodeURIComponent(code);

    }

  }



  function setFormMessage(text, variant) {

    var o = getEls();

    if (!o.msg) return;

    o.msg.textContent = text || '';

    o.msg.classList.remove('is-success', 'is-error', 'has-text');

    if (text) {

      o.msg.classList.add('has-text');

      if (variant === 'success') o.msg.classList.add('is-success');

      else if (variant === 'error') o.msg.classList.add('is-error');

    }

  }



  function closeCaptchaInstant() {

    var el = document.getElementById('waitlist-captcha-stage');

    if (el) {

      el.classList.remove('is-open');

      el.setAttribute('aria-hidden', 'true');

    }

    destroyTurnstile();

  }



  function openCaptchaAnimated() {

    var el = document.getElementById('waitlist-captcha-stage');

    if (!el) return;

    el.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(function () {

      requestAnimationFrame(function () {

        el.classList.add('is-open');

      });

    });

  }



  function closeCaptchaAnimated(done) {

    var el = document.getElementById('waitlist-captcha-stage');

    if (!el || !el.classList.contains('is-open')) {

      closeCaptchaInstant();

      if (done) done();

      return;

    }

    var finished = false;

    function once() {

      if (finished) return;

      finished = true;

      el.removeEventListener('transitionend', onEnd);

      destroyTurnstile();

      el.setAttribute('aria-hidden', 'true');

      if (done) done();

    }

    function onEnd(e) {

      if (e.target !== el) return;

      if (e.propertyName !== 'max-height' && e.propertyName !== 'opacity') return;

      once();

    }

    el.addEventListener('transitionend', onEnd);

    el.classList.remove('is-open');

    setTimeout(once, 480);

  }



  function showReferBlock(refCode) {

    var block = document.getElementById('waitlist-refer-block');

    var input = document.getElementById('waitlist-refer-url');

    if (!refCode || !block || !input) return;

    input.value = referUrlForCode(refCode);

    block.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(function () {

      requestAnimationFrame(function () {

        block.classList.add('is-visible');

      });

    });

  }



  function applyJoinedState(refCode) {

    var o = getEls();

    flow = 'joined';

    if (o.ctaWrap) o.ctaWrap.hidden = true;

    if (o.submitBtn) o.submitBtn.setAttribute('aria-expanded', 'false');

    if (typeof refCode === 'string' && /^[A-Z0-9]{4,16}$/i.test(refCode)) {

      showReferBlock(refCode.toUpperCase());

    }

    if (o.email) {

      o.email.readOnly = true;

    }

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

        if (o.submitBtn) o.submitBtn.setAttribute('aria-expanded', 'false');

        closeCaptchaInstant();

        hideSubmitProgress();

      }

      return;

    }

    if (flow === 'input' || flow === 'captcha') {

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

    setFormMessage('', '');

    postInFlight = true;

    flow = 'submitting';

    showSubmitProgress(t('waitlist.submitting'), true);



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

        if (res.ok && res.json && res.json.ok === true) {

          var refRaw = res.json.refCode;

          var ref = typeof refRaw === 'string' ? refRaw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : '';

          if (ref.length >= 4 && ref.length <= 16) persistJoinedRef(ref);

          var already = !!res.json.alreadySignedUp;

          hideSubmitProgress();

          closeCaptchaAnimated(function () {

            if (o.form) o.form.setAttribute('data-waitlist-msg', already ? 'already' : 'success');

            setFormMessage(t(already ? 'waitlist.alreadyOnList' : 'waitlist.success'), 'success');

            applyJoinedState(ref);

            fetchStats();

          });

        } else if (res.status === 429) {

          setFormMessage(t('waitlist.errorRateLimit'), 'error');

          flow = 'captcha';

          resetTurnstile();

          showSubmitProgress(t('waitlist.awaitingCaptcha'), true);

        } else {

          setFormMessage(t('waitlist.errorGeneric'), 'error');

          flow = 'captcha';

          resetTurnstile();

          showSubmitProgress(t('waitlist.awaitingCaptcha'), true);

        }

      })

      .catch(function () {

        setFormMessage(t('waitlist.errorNetwork'), 'error');

        flow = 'captcha';

        resetTurnstile();

        showSubmitProgress(t('waitlist.awaitingCaptcha'), true);

      })

      .finally(function () {

        postInFlight = false;

      });

  }



  function beginCaptchaFlow() {

    var o = getEls();

    if (!o.email || !isWaitlistEmailValid(o.email.value) || postInFlight) return;

    if (!o.submitBtn) return;

    setFormMessage('', '');

    flow = 'captcha';

    openCaptchaAnimated();

    o.submitBtn.setAttribute('aria-expanded', 'true');

    showSubmitProgress(t('waitlist.awaitingCaptcha'), true);

    requestAnimationFrame(function () {

      mountTurnstile();

    });

    try {

      o.captchaStage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (_) {}

  }



  function handlePrimaryAction() {

    var o = getEls();

    if (!o.email || postInFlight) return;

    if (flow === 'joined') return;

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

      } else {

        setFormMessage(t('waitlist.errorCaptcha'), 'error');

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

      if (flow === 'joined') return;

      setFormMessage('', '');

      syncEmailStepUi();

    });



    o.email.addEventListener('keydown', function (e) {

      if (e.key !== 'Enter') return;

      if (flow === 'joined') return;

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



    function initJoinedFromStorage() {

      var code = readStoredRefCode();

      if (!code) return;

      if (o.form) {

        o.form.classList.add('waitlist-form--from-storage');

        o.form.setAttribute('data-waitlist-msg', 'already');

      }

      setFormMessage(t('waitlist.alreadyOnList'), 'success');

      applyJoinedState(code);

    }



    function wireReferCopy() {

      var btn = document.getElementById('waitlist-refer-copy');

      var toast = document.getElementById('waitlist-refer-toast');

      if (!btn || btn.dataset.bound === '1') return;

      btn.dataset.bound = '1';

      btn.addEventListener('click', function () {

        var input = document.getElementById('waitlist-refer-url');

        if (!input || !input.value) return;

        function flashToast() {

          if (!toast) return;

          toast.textContent = t('waitlist.referCopied');

          setTimeout(function () {

            if (toast) toast.textContent = '';

          }, 2200);

        }

        if (navigator.clipboard && navigator.clipboard.writeText) {

          navigator.clipboard.writeText(input.value).then(flashToast).catch(function () {

            try {

              input.select();

              document.execCommand('copy');

              flashToast();

            } catch (_) {}

          });

          return;

        }

        try {

          input.select();

          document.execCommand('copy');

          flashToast();

        } catch (_) {}

      });

    }



    wireReferCopy();

    if (readStoredRefCode()) initJoinedFromStorage();

    else syncEmailStepUi();

  }



  window.memoryanWaitlistRefresh = function () {

    updateLocalDevBanner();

    var valEl = document.getElementById('waitlist-count-value');

    if (!valEl || valEl.textContent === '—') return;

    var n = parseInt(valEl.textContent, 10);

    if (!isNaN(n)) updateCounterUi(n);

    if (window.i18n && typeof window.i18n.t === 'function') {

      var rb = document.getElementById('waitlist-refer-block');

      if (rb) {

        rb.querySelectorAll('[data-i18n]').forEach(function (el) {

          var k = el.getAttribute('data-i18n');

          if (k) el.textContent = window.i18n.t(k);

        });

      }

      var msg = document.getElementById('waitlist-form-message');

      var wf = document.getElementById('waitlist-form');

      var kind = wf && wf.getAttribute('data-waitlist-msg');

      if (msg && msg.classList.contains('has-text') && msg.classList.contains('is-success') && kind) {

        msg.textContent = window.i18n.t(kind === 'already' ? 'waitlist.alreadyOnList' : 'waitlist.success');

      }

    }

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

