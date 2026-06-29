/**
 * Google tag (gtag.js) — Google Analytics 4 + Google Ads, with Google Consent Mode v2.
 *
 * Privacy-first setup:
 *   • All storage (analytics + advertising) is DENIED by default — no tracking
 *     or advertising cookies are stored until the visitor clicks "אישור" (Accept)
 *     in the cookie banner.
 *   • The banner UI lives in cookie-consent.js (loaded at the bottom of this
 *     file) and flips consent to "granted" once the visitor accepts.
 *   • The choice is remembered in localStorage, so the banner shows only once.
 *
 * Tag IDs are defined here once — change them in this single place.
 *   GA_MEASUREMENT_ID — Google Analytics 4 (website traffic)
 *   GOOGLE_ADS_ID     — Google Ads (conversion tracking & remarketing)
 */
(function () {
    var GA_MEASUREMENT_ID = 'G-5RR5E57Z5F';   // Google Analytics 4
    var GOOGLE_ADS_ID = 'AW-715641717';        // Google Ads
    var CONSENT_KEY = 'iteam-cookie-consent';  // shared with cookie-consent.js: 'granted' | 'denied'

    // --- gtag bootstrap (must run before any consent/config calls) ---
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    // --- Apply any previously saved choice as the default consent state ---
    var saved = null;
    try { saved = localStorage.getItem(CONSENT_KEY); } catch (e) {}
    var consentState = saved === 'granted' ? 'granted' : 'denied';

    // Consent Mode — analytics + advertising storage all gated behind consent.
    gtag('consent', 'default', {
        ad_storage: consentState,
        ad_user_data: consentState,
        ad_personalization: consentState,
        analytics_storage: consentState,
        wait_for_update: 500
    });

    // --- Load the gtag.js library from Google (one library serves both tags) ---
    var gaScript = document.createElement('script');
    gaScript.async = true;
    // URL uses the Google Ads ID so Google's tag verifier finds AW-… in the page source.
    // One gtag.js library still serves both tags (GA4 + Ads) via the gtag('config', …) calls below.
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ADS_ID;
    document.head.appendChild(gaScript);

    // --- Initialize both tags (they honor the consent state set above) ---
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID); // Google Analytics
    gtag('config', GOOGLE_ADS_ID);     // Google Ads

    // --- Google Ads conversion ---
    // Call window.iteamTrackLeadConversion() when a lead completes (e.g. the
    // contact form is submitted successfully). The conversion label lives here
    // next to the tag IDs; it honors Consent Mode just like the tags above.
    var ADS_LEAD_CONVERSION_LABEL = 'AW-715641717/ArPTCKj1-OQZEPWmn9UC';
    window.iteamTrackLeadConversion = function () {
        // Google Ads: count the submission as a lead conversion.
        gtag('event', 'conversion', { send_to: ADS_LEAD_CONVERSION_LABEL });
        // Google Analytics 4: log a standard lead event so the same submission
        // shows up in GA4 (Reports → Engagement → Events, name: generate_lead).
        // It goes to GA by default (no send_to override) and honors Consent Mode.
        gtag('event', 'generate_lead');
        // Meta Pixel: count the submission as a Lead. fbq always exists (stub in
        // meta-pixel.js); it only reaches Facebook if the visitor consented,
        // otherwise the call harmlessly no-ops — same consent gate as above.
        if (typeof window.fbq === 'function') { window.fbq('track', 'Lead'); }
    };

    // --- Load the cookie-consent banner UI ---
    var ccScript = document.createElement('script');
    ccScript.async = true;
    ccScript.src = '/cookie-consent.js';
    document.head.appendChild(ccScript);

    // --- Load the Meta (Facebook) Pixel — consent-gated, like the tags above.
    // It self-gates on the same 'iteam-cookie-consent' choice, so it sends
    // nothing to Facebook until the visitor accepts in the banner. ---
    var fbScript = document.createElement('script');
    fbScript.async = true;
    fbScript.src = '/meta-pixel.js';
    document.head.appendChild(fbScript);
})();
