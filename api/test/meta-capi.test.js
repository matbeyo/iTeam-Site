'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { buildLeadEvent, isAllowedOrigin, graphUrl } = require('../src/meta-capi');

const NOW = 1795400000000;
const UA = 'Mozilla/5.0 (iPhone) FBAN/FBIOS';
const FBCLID = 'IwZXh0bgNhZW0BMABwZG9mAWZkaWQ';
const good = () => ({
    fbclid: FBCLID,
    eventId: 'lead-abc12345',
    url: 'https://iteam-sh.co.il/lp/tikun-13/?utm_source=facebook&fbclid=' + FBCLID,
    clickTime: NOW - 60000
});

test('builds a Lead event with only fbc + user agent', () => {
    const r = buildLeadEvent(good(), { now: NOW, userAgent: UA });
    assert.ok(r.ok);
    const ev = r.payload.data[0];
    assert.strictEqual(ev.event_name, 'Lead');
    assert.strictEqual(ev.event_id, 'lead-abc12345');
    assert.strictEqual(ev.action_source, 'website');
    assert.strictEqual(ev.event_time, Math.floor(NOW / 1000));
    assert.strictEqual(ev.event_source_url, 'https://iteam-sh.co.il/lp/tikun-13/');
    assert.deepStrictEqual(ev.user_data, {
        fbc: 'fb.1.' + (NOW - 60000) + '.' + FBCLID,
        client_user_agent: UA
    });
    assert.strictEqual(r.payload.test_event_code, undefined);
});

test('adds test_event_code when configured', () => {
    const r = buildLeadEvent(good(), { now: NOW, userAgent: UA, testEventCode: 'TEST123' });
    assert.strictEqual(r.payload.test_event_code, 'TEST123');
});

test('rejects leads that did not come from a Meta ad', () => {
    const b = good(); delete b.fbclid;
    assert.deepStrictEqual(buildLeadEvent(b, { now: NOW, userAgent: UA }), { ok: false, reason: 'no-fbclid' });
    assert.strictEqual(buildLeadEvent({ ...good(), fbclid: 'bad id<script>' }, { now: NOW, userAgent: UA }).ok, false);
});

test('rejects foreign URLs, bad event ids and missing user agent', () => {
    assert.strictEqual(buildLeadEvent({ ...good(), url: 'https://evil.example/' }, { now: NOW, userAgent: UA }).reason, 'bad-url');
    assert.strictEqual(buildLeadEvent({ ...good(), url: 'https://iteam-sh.co.il.evil.example/' }, { now: NOW, userAgent: UA }).reason, 'bad-url');
    assert.strictEqual(buildLeadEvent({ ...good(), eventId: 'x' }, { now: NOW, userAgent: UA }).reason, 'bad-event-id');
    assert.strictEqual(buildLeadEvent(good(), { now: NOW, userAgent: '' }).reason, 'no-user-agent');
    assert.strictEqual(buildLeadEvent(null, { now: NOW, userAgent: UA }).reason, 'no-body');
});

test('falls back to now for future, stale or missing click times', () => {
    for (const clickTime of [NOW + 1000, NOW - 8 * 24 * 3600 * 1000, undefined, 'x']) {
        const r = buildLeadEvent({ ...good(), clickTime }, { now: NOW, userAgent: UA });
        assert.strictEqual(r.payload.data[0].user_data.fbc, 'fb.1.' + NOW + '.' + FBCLID);
    }
});

test('origin allow-list and graph URL', () => {
    assert.ok(isAllowedOrigin('https://iteam-sh.co.il'));
    assert.ok(isAllowedOrigin('https://www.iteam-sh.co.il'));
    assert.ok(!isAllowedOrigin('https://evil.example'));
    assert.ok(!isAllowedOrigin(null));
    assert.strictEqual(graphUrl(), 'https://graph.facebook.com/v23.0/4591129021155733/events');
    assert.strictEqual(graphUrl('v24.0'), 'https://graph.facebook.com/v24.0/4591129021155733/events');
    assert.strictEqual(graphUrl('../x'), 'https://graph.facebook.com/v23.0/4591129021155733/events');
});
