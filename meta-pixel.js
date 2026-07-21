/**
 * Meta Pixel (Facebook Pixel) — consent-gated for iTeam-sh.
 *
 * Companion to analytics.js / cookie-consent.js. Treated exactly like Google
 * Ads on this site: NOTHING is sent to Meta until the visitor accepts cookies
 * in the banner.
 *
 *   • The fbq() stub is defined on every page load (pure JS — no network, no
 *     cookies) so event calls such as fbq('track','Lead') can be made anywhere
 *     safely. Without consent they just queue and are never sent.
 *   • Facebook's library (fbevents.js) is loaded — and the pixel initialised +
 *     PageView fired — ONLY once consent is 'granted'. Visitors who decline (or
 *     haven't chosen yet) trigger ZERO requests to Facebook.
 *   • Consent is shared with analytics.js via localStorage ('iteam-cookie-consent')
 *     for returning visitors, and via the live 'iteam-consent-change' event that
 *     cookie-consent.js dispatches when the visitor clicks Accept/Decline.
 *
 * The Pixel ID is defined here once — change it in this single place.
 */
(function () {
    var PIXEL_ID = '1036940558692297';
    var CONSENT_KEY = 'iteam-cookie-consent'; // shared with analytics.js: 'granted' | 'denied'

    // --- Standard Meta Pixel stub, WITHOUT the immediate library load ---
    // This is the canonical fbq() bootstrap with the script-injection part
    // removed, so window.fbq exists and queues calls, but fbevents.js is not
    // fetched until activate() runs (i.e. after consent).
    (function (f) {
        if (f.fbq) return;
        var n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    })(window);

    var libraryRequested = false;
    var initialized = false;
    var active = false;

    // Fetch fbevents.js from Facebook (once). Until this runs, no request ever
    // reaches connect.facebook.net.
    function loadLibrary() {
        if (libraryRequested) return;
        libraryRequested = true;
        var t = document.createElement('script');
        t.async = true;
        t.src = 'https://connect.facebook.net/en_US/fbevents.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(t, s);
    }

    // Turn the pixel on: load the library, initialise, and log the page view.
    function activate() {
        if (active) return;
        active = true;
        if (!initialized) {
            initialized = true;
            loadLibrary();
            window.fbq('init', PIXEL_ID);
            window.fbq('track', 'PageView');
        } else {
            // The visitor revoked and then granted consent again on this page.
            window.fbq('consent', 'grant');
        }
    }

    // Best-effort stop if a visitor who already accepted changes their mind in
    // the same session. (Cookies already set are cleared by the browser /
    // "delete cookies"; this just halts any further events.)
    function deactivate() {
        if (!active) return;
        active = false;
        window.fbq('consent', 'revoke');
    }

    function applyConsent(value) {
        if (value === 'granted') activate();
        else deactivate();
    }

    // Returning visitor who already accepted → start immediately.
    var saved = null;
    try { saved = localStorage.getItem(CONSENT_KEY); } catch (e) {}
    if (saved === 'granted') activate();

    // Live choice from the cookie banner (Accept / Decline).
    document.addEventListener('iteam-consent-change', function (e) {
        applyConsent(e && e.detail);
    });

    // Public handle — parity with window.iteamCookieConsent. track() is a thin
    // wrapper so other scripts don't need to know about fbq directly.
    window.iteamMetaPixel = {
        grant: activate,
        revoke: deactivate,
        track: function (eventName, params) {
            if (active && typeof window.fbq === 'function') {
                window.fbq('track', eventName, params);
            }
        }
    };
})();
