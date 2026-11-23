/**
 * Meta Conversions API — pure helpers (no Azure / network dependencies, so
 * they can be unit-tested with `node --test`).
 *
 * Privacy design (see also /privacy-policy/ section 3):
 *   • Only leads that arrived from a Meta ad are reported — i.e. the landing
 *     URL carried an `fbclid` click id. Organic leads send nothing.
 *   • The ONLY visitor data sent to Meta is that click id (as `fbc`) and the
 *     browser's user-agent string (Meta requires it for website events).
 *     No name, email, phone, IP address or message content is ever sent.
 */
'use strict';

const PIXEL_ID = '4591129021155733'; // same dataset as /meta-pixel.js
const SITE_ORIGIN = 'https://iteam-sh.co.il';
const DEFAULT_GRAPH_VERSION = 'v23.0';

const FBCLID_RE = /^[A-Za-z0-9_-]{10,500}$/;
const EVENT_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
const MAX_CLICK_AGE_MS = 7 * 24 * 60 * 60 * 1000; // Meta's attribution window

/**
 * Validate the browser's request body and build the Conversions API payload.
 * Returns { ok: true, payload } or { ok: false, reason }.
 */
function buildLeadEvent(body, opts) {
    opts = opts || {};
    const now = typeof opts.now === 'number' ? opts.now : Date.now();
    const userAgent = typeof opts.userAgent === 'string' ? opts.userAgent.slice(0, 512) : '';

    if (!body || typeof body !== 'object') return { ok: false, reason: 'no-body' };

    const fbclid = typeof body.fbclid === 'string' ? body.fbclid.trim() : '';
    if (!FBCLID_RE.test(fbclid)) return { ok: false, reason: 'no-fbclid' };

    const eventId = typeof body.eventId === 'string' ? body.eventId : '';
    if (!EVENT_ID_RE.test(eventId)) return { ok: false, reason: 'bad-event-id' };

    let url = typeof body.url === 'string' ? body.url : '';
    if (url !== SITE_ORIGIN && url.indexOf(SITE_ORIGIN + '/') !== 0) return { ok: false, reason: 'bad-url' };
    // Drop the query string: it is not needed for attribution (fbc carries the click).
    url = url.split('?')[0].split('#')[0].slice(0, 500);

    if (!userAgent) return { ok: false, reason: 'no-user-agent' };

    // fbc creation time = when the visitor landed from the ad (ms). Fall back to now.
    let clickTime = Number(body.clickTime);
    if (!Number.isFinite(clickTime) || clickTime > now || now - clickTime > MAX_CLICK_AGE_MS) {
        clickTime = now;
    }
    clickTime = Math.floor(clickTime);

    const payload = {
        data: [{
            event_name: 'Lead',
            event_time: Math.floor(now / 1000),
            event_id: eventId, // same id as the browser pixel's Lead → Meta de-duplicates
            action_source: 'website',
            event_source_url: url,
            user_data: {
                fbc: 'fb.1.' + clickTime + '.' + fbclid,
                client_user_agent: userAgent
            }
        }]
    };
    if (opts.testEventCode) payload.test_event_code = String(opts.testEventCode);
    return { ok: true, payload };
}

/** True when the request comes from the live site (or its www alias). */
function isAllowedOrigin(origin) {
    return origin === SITE_ORIGIN || origin === 'https://www.iteam-sh.co.il';
}

function graphUrl(version) {
    const v = /^v\d+\.\d+$/.test(version || '') ? version : DEFAULT_GRAPH_VERSION;
    return 'https://graph.facebook.com/' + v + '/' + PIXEL_ID + '/events';
}

module.exports = { buildLeadEvent, isAllowedOrigin, graphUrl, PIXEL_ID };
