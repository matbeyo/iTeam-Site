# iTeam-sh

Marketing website for **iTeam-sh**, an IT services company in Ra'anana, Israel.
Hebrew, right-to-left (`lang="he" dir="rtl"`).

- **No build step** — plain HTML, CSS and vanilla JavaScript. No bundler,
  framework or package manager.
- **Hosting** — Azure Static Web Apps; every push to `main` auto-deploys via
  GitHub Actions (`.github/workflows/azure-deploy.yml`).

## Structure

```
index.html              ← landing page (hero, services, about, partners, contact)
services/<slug>/         ← service detail pages (6)
products/                ← products section (מוצרים): hub + one folder per product
  index.html             ← products hub
  <slug>/index.html      ← a product page (e.g. email-security-microsoft-365)
articles/                ← articles section (מאמרים): hub + one folder per article
about/  why-it/          ← standalone pages
accessibility.html  privacy-policy/
styles.css               ← single site-wide stylesheet (CSS custom properties)
article.css / article.js ← shared by the articles + products hubs and article pages
accessibility-widget.js  ← custom accessibility panel
analytics.js             ← GA4 loader with Google Consent Mode (loads cookie-consent.js)
sitemap.xml  robots.txt
staticwebapp.config.json ← Azure SWA routing (301 redirects)
```

## Develop

Open `index.html` directly, or serve the folder with any static server:

```bash
npx serve .
```

No install or build commands are needed.

## Docs

- [`CLAUDE.md`](CLAUDE.md) — architecture, conventions and deployment details.
- [`products/README.md`](products/README.md) — how to add a new product.
- [`articles/README.md`](articles/README.md) — how to publish a new article.
