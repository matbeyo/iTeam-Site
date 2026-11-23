/**
 * POST /api/meta-lead — report a website lead to Meta via the Conversions API.
 *
 * Called fire-and-forget by analytics.js after Formspree accepts a form, only
 * when the visitor arrived from a Meta ad (fbclid in the URL). Works without
 * the cookie banner's consent because it sends no cookies and no personal
 * details — see ../meta-capi.js for exactly what is sent.
 *
 * App settings (Azure Static Web App → Environment variables):
 *   META_CAPI_TOKEN       required. Events Manager → dataset → Settings →
 *                         Conversions API → Generate access token.
 *                         If missing, the function does nothing (204).
 *   META_TEST_EVENT_CODE  optional. Events Manager → Test events code, to see
 *                         events live while testing. Remove after testing.
 *   META_GRAPH_VERSION    optional, e.g. "v23.0".
 *
 * Always answers 202/204 to the browser — a Meta failure must never affect
 * the visitor, and the lead itself is already in Sales@ via Formspree.
 */
'use strict';

const { app } = require('@azure/functions');
const { buildLeadEvent, isAllowedOrigin, graphUrl } = require('../meta-capi');

app.http('metaLead', {
    route: 'meta-lead',
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const token = process.env.META_CAPI_TOKEN;
        if (!token) return { status: 204 };

        if (!isAllowedOrigin(request.headers.get('origin'))) return { status: 204 };

        let body = null;
        try {
            const text = await request.text();
            if (text.length > 4096) return { status: 204 };
            body = JSON.parse(text);
        } catch (e) {
            return { status: 204 };
        }

        const built = buildLeadEvent(body, {
            userAgent: request.headers.get('user-agent') || '',
            testEventCode: process.env.META_TEST_EVENT_CODE
        });
        if (!built.ok) return { status: 204 };

        try {
            const res = await fetch(graphUrl(process.env.META_GRAPH_VERSION), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(built.payload),
                signal: AbortSignal.timeout(8000)
            });
            if (!res.ok) {
                const detail = (await res.text().catch(() => '')).slice(0, 500);
                context.warn('Meta CAPI responded ' + res.status + ': ' + detail);
            }
        } catch (e) {
            context.warn('Meta CAPI request failed: ' + (e && e.message));
        }
        return { status: 202 };
    }
});
