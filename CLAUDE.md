# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Marketing site for iTeam-sh (IT services, Ra'anana), live at https://iteam-sh.co.il. Hebrew, RTL (`lang="he" dir="rtl"`). See also `README.md`, `articles/README.md` (publishing an article) and `products/README.md` (adding a product page).

## Commands

- **Run locally:** no build step or install for the site itself. Serve the repo root statically; `.claude/launch.json` defines the preview server `site` (`python -m http.server 8765`). Root-relative paths such as `/analytics.js` only work when served, not via `file://`.
- **API tests:** `cd api && npm test` (runs `node --test`). Single file: `cd api && node --test test/meta-capi.test.js`. There is no linter.
- **Deploy:** every push to `main` deploys to Azure Static Web Apps (`.github/workflows/azure-deploy.yml`, `app_location: /`, `api_location: api`). Work on a branch, open a PR, and merge only after the user approves.

## Architecture

**No templating.** Every page is a standalone, hand-written `index.html` with its own header, nav, footer and SEO tags (canonical, OG/Twitter, JSON-LD). A change to the shared header/footer/menus must be made in every HTML file (find them with `grep -rl`). Pages two levels deep reference assets as `../../styles.css`, `../../script.js`, etc.

**Shared assets (root):**
- `styles.css`: single site-wide stylesheet built on CSS custom properties; pages force `data-theme="light"` via an inline script.
- `script.js`: nav, animations, and the contact-form handler (validation + AJAX POST to Formspree `mgolndpk`; leads arrive in marketing@).
- `article.css` / `article.js`: used by the articles and products hubs and article pages. `article.js` auto-generates article metadata (canonical, OG, JSON-LD, breadcrumb, read time) from `<title>`, the meta description, the folder slug and the `#article-config` JSON block. Products are **not** auto-hydrated.
- `accessibility-widget.js`: self-contained accessibility panel (injects its own CSS/DOM).

**Tracking and lead flow (consent-first; keep it that way):**
1. Every page loads `/analytics.js` in `<head>`. It sets Google Consent Mode v2 to *denied* by default, loads GA4 + Google Ads, and injects `cookie-consent.js` (banner) and `meta-pixel.js`. Consent is stored in localStorage key `iteam-cookie-consent` and broadcast via the `iteam-consent-change` event; the Meta pixel library is not fetched until consent is granted. Tag/pixel IDs are defined once at the top of each file.
2. On a successful Formspree response (checked for `ok`, not just HTTP success), `script.js` calls `window.iteamTrackLeadConversion({email, phone})`. It fires the Google Ads conversion (Enhanced Conversions), GA4 `generate_lead`, the Meta Pixel `Lead` (consent-gated) and, if the URL has `fbclid`, a POST to `/api/meta-lead` sharing the same event id for deduplication.
3. `api/` holds Azure Functions (Node 20, `@azure/functions` v4). `src/functions/metaLead.js` forwards the lead to the Meta Conversions API; `src/meta-capi.js` holds the pure, unit-tested helpers. By design it sends only `fbc` (from fbclid) and the user agent, never personal details, and always returns 202/204 to the browser. It needs the `META_CAPI_TOKEN` app setting (no-op without it). The privacy policy (`/privacy-policy/`) describes this behaviour, so update it if what is sent changes.

**Paid landing pages (`lp/<name>/`):** campaign pages for Meta ads. They are `noindex, follow`, canonical to the matching `/services/` page, and are kept out of `sitemap.xml` and site navigation. Each has its own form with hidden `_subject` / `מקור` fields and a hidden `utm` field filled from `utm_*` + `fbclid` by an inline script, so every lead email shows its source. Build new ones by copying an existing LP.

**Routing:** `staticwebapp.config.json` holds 301 redirects (legacy WordPress URLs, moved pages) and 404s for README/template paths; unknown paths 301 to `/`. Azure normalizes trailing slashes, so don't add both `/path` and `/path/` routes (it fails the deploy with "duplicate route"). When a URL moves, add a redirect and update canonical/OG/JSON-LD and `sitemap.xml`.

## Conventions

- Wrap multi-word Latin phrases inside Hebrew text in `<span dir="ltr">…</span>`.
- New indexable pages go in `sitemap.xml`; `articles/_template/` stays unlinked and excluded from the sitemap and robots.
- `.claude/` (local Claude Code settings) is git-ignored; this `CLAUDE.md` is tracked.
