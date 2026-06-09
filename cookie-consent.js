/**
 * Cookie-consent banner — iTeam-sh
 *
 * Companion to analytics.js. Shows a one-time Hebrew banner asking the visitor
 * to accept or decline analytics cookies, then updates Google Consent Mode and
 * remembers the choice in localStorage (key: "iteam-cookie-consent").
 *
 * Re-open it anytime from any element marked  data-cookie-settings
 * (e.g. the link in the privacy policy), or via window.iteamCookieConsent.open().
 *
 * Self-contained: injects its own styles + DOM (same pattern as
 * accessibility-widget.js). No dependencies.
 */
(function () {
    'use strict';

    var CONSENT_KEY = 'iteam-cookie-consent'; // shared with analytics.js: 'granted' | 'denied'
    var bannerEl = null;

    // Reuse the gtag defined by analytics.js; fall back to a raw dataLayer push.
    function gtag() {
        if (typeof window.gtag === 'function') { window.gtag.apply(window, arguments); }
        else { (window.dataLayer = window.dataLayer || []).push(arguments); }
    }

    function getSaved() {
        try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
    }
    function save(value) {
        try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
    }

    function applyConsent(value) {
        var state = value === 'granted' ? 'granted' : 'denied';
        gtag('consent', 'update', {
            analytics_storage: state, // Google Analytics
            ad_storage: state,        // Google Ads (cookies)
            ad_user_data: state,      // Google Ads (data sent to Google)
            ad_personalization: state // Google Ads (remarketing)
        });
    }

    // --- Styles (brand colors, RTL) ---
    function injectStyles() {
        if (document.getElementById('iteam-cc-styles')) return;
        var css = [
            '.iteam-cc{position:fixed;bottom:24px;right:24px;left:auto;z-index:99999;',
            'max-width:420px;width:calc(100% - 48px);background:#FFFFFF;color:#1a2332;',
            'border:1px solid rgba(0,31,63,0.12);border-radius:12px;',
            'box-shadow:0 12px 28px -6px rgba(0,31,63,0.18),0 4px 8px -4px rgba(0,31,63,0.10);',
            'padding:20px 22px;font-family:"Heebo",Arial,sans-serif;direction:rtl;text-align:right;',
            'transform:translateY(16px);opacity:0;transition:opacity .3s ease,transform .3s ease;}',
            '.iteam-cc.is-visible{transform:translateY(0);opacity:1;}',
            '.iteam-cc__title{display:block;font-size:16px;font-weight:700;color:#001F3F;margin-bottom:6px;}',
            '.iteam-cc__desc{font-size:14px;line-height:1.6;color:#475569;margin:0 0 16px;}',
            '.iteam-cc__link{color:#0D9488;text-decoration:underline;font-weight:500;}',
            '.iteam-cc__link:hover{color:#0b7d73;}',
            '.iteam-cc__actions{display:flex;gap:10px;}',
            '.iteam-cc__btn{flex:1;padding:10px 14px;border-radius:8px;font-family:inherit;font-size:14px;',
            'font-weight:600;cursor:pointer;transition:background .2s ease,border-color .2s ease;border:1px solid transparent;}',
            '.iteam-cc__btn--accept{background:#0D9488;color:#fff;}',
            '.iteam-cc__btn--accept:hover{background:#0b7d73;}',
            '.iteam-cc__btn--decline{background:transparent;color:#001F3F;border-color:rgba(0,31,63,0.25);}',
            '.iteam-cc__btn--decline:hover{background:rgba(0,31,63,0.05);border-color:rgba(0,31,63,0.45);}',
            '.iteam-cc__btn:focus-visible{outline:2px solid #0D9488;outline-offset:2px;}',
            '@media (max-width:600px){.iteam-cc{right:12px;left:12px;bottom:12px;width:auto;max-width:none;}}',
            '@media (prefers-reduced-motion:reduce){.iteam-cc{transition:none;}}'
        ].join('');
        var style = document.createElement('style');
        style.id = 'iteam-cc-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function buildBanner() {
        var wrap = document.createElement('div');
        wrap.className = 'iteam-cc';
        wrap.setAttribute('role', 'dialog');
        wrap.setAttribute('aria-live', 'polite');
        wrap.setAttribute('aria-label', 'הודעת קובצי Cookie');
        wrap.innerHTML =
            '<strong class="iteam-cc__title">אנו מכבדים את פרטיותך</strong>' +
            '<p class="iteam-cc__desc">אתר זה משתמש בקובצי Cookie של Google Analytics ו-Google Ads כדי ' +
            'לנתח את התנועה באתר ולשפר את חוויית הגלישה, וכן לצורכי פרסום ושיווק. תוכלו לאשר או לדחות. ' +
            '<a class="iteam-cc__link" href="/privacy-policy/">למידע נוסף</a></p>' +
            '<div class="iteam-cc__actions">' +
            '<button type="button" class="iteam-cc__btn iteam-cc__btn--decline" data-cc-decline>דחייה</button>' +
            '<button type="button" class="iteam-cc__btn iteam-cc__btn--accept" data-cc-accept>אישור</button>' +
            '</div>';
        wrap.querySelector('[data-cc-accept]').addEventListener('click', function () { choose('granted'); });
        wrap.querySelector('[data-cc-decline]').addEventListener('click', function () { choose('denied'); });
        return wrap;
    }

    function show() {
        injectStyles();
        if (!bannerEl) {
            bannerEl = buildBanner();
            document.body.appendChild(bannerEl);
        }
        var el = bannerEl;
        requestAnimationFrame(function () { el.classList.add('is-visible'); });
    }

    function hide() {
        if (!bannerEl) return;
        var el = bannerEl;
        bannerEl = null;
        el.classList.remove('is-visible');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }

    function choose(value) {
        save(value);
        applyConsent(value);
        hide();
    }

    function open() {
        if (bannerEl) return; // already showing
        show();
    }

    // Add a "הגדרות Cookie" link to the site footer so visitors can change
    // their choice from any page. Injected because the footer markup is
    // duplicated across pages with no shared include.
    function injectFooterLink() {
        var p = document.querySelector('.footer-bottom p');
        if (!p || p.querySelector('[data-cookie-settings]')) return;
        p.appendChild(document.createTextNode(' | '));
        var a = document.createElement('a');
        a.href = '#';
        a.className = 'footer-accessibility-link';
        a.setAttribute('data-cookie-settings', '');
        a.textContent = 'הגדרות Cookie';
        p.appendChild(a);
    }

    function init() {
        injectFooterLink();
        // Let a "cookie settings" link (anywhere) re-open the banner.
        document.addEventListener('click', function (e) {
            var trigger = e.target && e.target.closest && e.target.closest('[data-cookie-settings]');
            if (trigger) { e.preventDefault(); open(); }
        });
        // First visit (no saved choice) → ask.
        if (!getSaved()) { show(); }
    }

    // Public API (handy for a footer link or manual control).
    window.iteamCookieConsent = {
        open: open,
        accept: function () { choose('granted'); },
        decline: function () { choose('denied'); },
        reset: function () { try { localStorage.removeItem(CONSENT_KEY); } catch (e) {} }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
