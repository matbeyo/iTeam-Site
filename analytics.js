/**
 * Google tag (gtag.js) — Google Analytics 4 with Google Consent Mode v2.
 *
 * Privacy-first setup:
 *   • Analytics cookies are DENIED by default — no tracking cookies are stored
 *     until the visitor clicks "אישור" (Accept) in the cookie banner.
 *   • The banner UI lives in cookie-consent.js (loaded at the bottom of this
 *     file) and flips analytics_storage to "granted" once the visitor accepts.
 *   • The choice is remembered in localStorage, so the banner shows only once.
 *
 * The Measurement ID is defined here once — change it in this single place.
 */
(function () {
    var GA_MEASUREMENT_ID = 'G-5RR5E57Z5F';
    var CONSENT_KEY = 'iteam-cookie-consent'; // shared with cookie-consent.js: 'granted' | 'denied'

    // --- gtag bootstrap (must run before any consent/config calls) ---
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    // --- Apply any previously saved choice as the default consent state ---
    var saved = null;
    try { saved = localStorage.getItem(CONSENT_KEY); } catch (e) {}

    gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: saved === 'granted' ? 'granted' : 'denied',
        wait_for_update: 500
    });

    // --- Load the gtag.js library from Google ---
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(gaScript);

    // --- Initialize Analytics (honors the consent state set above) ---
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);

    // --- Load the cookie-consent banner UI ---
    var ccScript = document.createElement('script');
    ccScript.async = true;
    ccScript.src = '/cookie-consent.js';
    document.head.appendChild(ccScript);
})();
