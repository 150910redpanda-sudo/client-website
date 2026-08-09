/* Gibbs Hall Barn — site behaviour.
   Kept in an external file so the Content-Security-Policy can forbid inline
   script entirely. Nothing here is required for the content to be readable:
   if this file fails to load, the page still renders in full. */
(function () {
  'use strict';

  // Tell CSS that JavaScript is running, so the scroll-reveal animations can
  // start from their hidden state. Done first so there is no flash.
  document.documentElement.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ─── Custom cursor ───
     Only on a real mouse, and never when the visitor has asked for reduced
     motion — the lagging ring is exactly the kind of movement that setting
     is meant to suppress. The CSS hides the native cursor under the same
     conditions, so the two can never disagree. */
  if (finePointer && !reduceMotion) {
    var cursor = document.getElementById('cursor');
    var ring = document.getElementById('cursorRing');
    if (cursor && ring) {
      var mx = 0, my = 0, rx = 0, ry = 0;
      document.addEventListener('mousemove', function (e) {
        mx = e.clientX;
        my = e.clientY;
      }, { passive: true });

      (function animateCursor() {
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(animateCursor);
      })();

      document.querySelectorAll('a, button, .attraction-item, .room-card, .gallery-cell').forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          cursor.style.width = '18px';
          cursor.style.height = '18px';
          ring.style.width = '56px';
          ring.style.height = '56px';
        });
        el.addEventListener('mouseleave', function () {
          cursor.style.width = '8px';
          cursor.style.height = '8px';
          ring.style.width = '36px';
          ring.style.height = '36px';
        });
      });
    }
  }

  /* ─── Nav background on scroll ─── */
  var nav = document.getElementById('nav');
  if (nav) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ─── Mobile navigation ─── */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    var closeNav = function (returnFocus) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      if (returnFocus) navToggle.focus();
    };

    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        var first = navLinks.querySelector('a');
        if (first) first.focus();
      }
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { closeNav(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) closeNav(true);
    });
  }

  /* ─── Scroll reveal ───
     Skipped entirely under reduced motion; the CSS already leaves those
     elements visible in that case. */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ─── Cookie consent + analytics ───
     The only analytics on this site is Vercel Web Analytics, and it is loaded
     strictly after an explicit "Accept". Nothing is measured before that, and
     "Decline" is remembered so the visitor is not asked again. */
  var CONSENT_KEY = 'ghb_cookie_consent';
  var banner = document.getElementById('cookieBanner');
  var analyticsLoaded = false;

  function storage() {
    // Private browsing modes can make localStorage throw on access.
    try {
      var probe = '__ghb__';
      window.localStorage.setItem(probe, probe);
      window.localStorage.removeItem(probe);
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }

  function readConsent() {
    var store = storage();
    return store ? store.getItem(CONSENT_KEY) : null;
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window.va = window.va || function () {
      (window.vaq = window.vaq || []).push(arguments);
    };
    var s = document.createElement('script');
    s.defer = true;
    s.src = '/_vercel/insights/script.js';
    document.head.appendChild(s);
  }

  function showBanner() {
    if (!banner) return;
    banner.classList.add('visible');
    banner.removeAttribute('aria-hidden');
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('visible');
    banner.setAttribute('aria-hidden', 'true');
  }

  function setConsent(value) {
    var store = storage();
    if (store) store.setItem(CONSENT_KEY, value);
    hideBanner();
    if (value === 'accepted') {
      loadAnalytics();
    } else if (analyticsLoaded) {
      // Consent withdrawn after the tag was already running: a script cannot
      // be un-loaded, so reload to a clean page with analytics absent.
      window.location.reload();
    }
  }

  var existingConsent = readConsent();
  if (existingConsent === 'accepted') {
    loadAnalytics();
  } else if (existingConsent !== 'declined') {
    window.setTimeout(showBanner, 800);
  }

  var acceptBtn = document.getElementById('cookieAccept');
  var declineBtn = document.getElementById('cookieDecline');
  if (acceptBtn) acceptBtn.addEventListener('click', function () { setConsent('accepted'); });
  if (declineBtn) declineBtn.addEventListener('click', function () { setConsent('declined'); });

  // Footer link so consent can be withdrawn or changed at any time — a
  // requirement of UK PECR/GDPR that a one-shot banner does not meet.
  var reopen = document.getElementById('cookieSettings');
  if (reopen) {
    reopen.addEventListener('click', function () {
      var store = storage();
      if (store) store.removeItem(CONSENT_KEY);
      showBanner();
      if (acceptBtn) acceptBtn.focus();
    });
  }
})();
