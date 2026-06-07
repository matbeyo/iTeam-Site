# Products (מוצרים)

How to add a new product page. No build step — copy a folder, edit the content,
add it to the menus and sitemap, push.

The **מוצרים** section holds product / landing pages that are distinct from the
core IT services (e.g. a vendor product we resell, install and support). It
mirrors the articles section: a hub of cards plus one folder per product.

## Where things live

```
products/
  index.html                          ← the hub (grid of product cards)
  email-security-microsoft-365/       ← the first product (copy this to start)
    index.html
styles.css                            ← .services-grid / .service-card (product cards)
article.css / article.js              ← hub hero, particles, scroll-reveal
staticwebapp.config.json              ← 301 redirects (only if a URL changes)
```

## Important: products are NOT auto-hydrated

Unlike **articles** (where `article.js` generates the metadata), each product
page is a **full, standalone page** with its own hand-written `<title>`,
description, canonical/OpenGraph/Twitter tags, and `Service` + `BreadcrumbList`
JSON-LD. The simplest path is to **copy the existing Email Security page** and
change the content + every URL/label.

## Add a new product — the steps

### 1. Create the folder
Copy `products/email-security-microsoft-365/` and rename it to your **slug**
(lowercase English, hyphen-separated — it becomes the URL):

```
products/email-security-microsoft-365/  →  products/<your-slug>/
```
→ live at `https://www.iteam-sh.co.il/products/<your-slug>/`

### 2. Edit the page content + metadata
In your new `index.html`, update **all** of these (search the file for the old
slug `email-security-microsoft-365` and for `iteam-sh.co.il/products/` to catch
every URL):

1. `<title>` and `<meta name="description">`
2. `<link rel="canonical">` + both `hreflang` alternates → `.../products/<your-slug>/`
3. `og:url` / `twitter:url` (+ titles/descriptions)
4. JSON-LD **`Service`**: `@id`, `name`, `serviceType`, `description`, offers
5. JSON-LD **`BreadcrumbList`**: position 3 `name` + `item` URL (position 2 already points to `מוצרים` → `/products/`)
6. The visible breadcrumb's current label, the `<h1>`, and the page body

The header/footer nav and the `../../` asset paths can stay as-is — they're
already correct for a `products/<slug>/` page.

### 3. Add a card to the hub
In `products/index.html`, copy the Email Security `<div class="service-card …">`
inside `.services-grid` (there's a commented template right after it) and set the
icon SVG, `<h3>`, the bullet list, and the link `href="<your-slug>/"`.

### 4. Add it to the site-wide menus
The **מוצרים** header dropdown and footer column already exist on **every page**,
each already containing the Email Security `<li>` with the correct relative path
for that page. So for each page, just **copy that `<li>` and change the slug +
label** — no need to work out the prefix yourself.

There is **no templating**, so this is a per-page edit. Find every page that
needs it with a search for the menu items:

```
grep -rl "products/email-security-microsoft-365/" --include="*.html" .
```

(That's the homepage, `accessibility.html`, `about/`, `why-it/`,
`privacy-policy/`, the `articles/` hub + `_template/` + each article, the
`products/` hub, and each `services/` and `products/` page.)

### 5. Add it to the sitemap
Copy a `<url>` block in `sitemap.xml` (under the **Products** comment) and point
it at `https://www.iteam-sh.co.il/products/<your-slug>/`.

### 6. Ship it
Push to `main` — GitHub Actions deploys to Azure automatically.

## If you rename or move a product URL later
Add a **301 redirect** in `staticwebapp.config.json` from the old path to the new
one, and update the canonical/OG/JSON-LD URLs + the sitemap.

> Azure normalizes trailing slashes, so `/path` and `/path/` are the same route —
> use a single rule (optionally plus a `…/*` wildcard for sub-paths). Adding both
> the slash and no-slash form as separate routes fails the deploy with a
> `duplicate route` error.

## Notes
- **English terms in Hebrew text:** wrap multi-word Latin phrases in
  `<span dir="ltr">…</span>` so they read correctly in the RTL flow.
- Product pages live two levels deep, so assets are referenced via `../../`
  (`../../styles.css`, `../../images/...`) and other sections via root-relative
  `/...` or `../../services/...`.
- The hub (`products/index.html`) reuses `styles.css` for the cards and
  `article.css` + `article.js` for the hero/particles/scroll-reveal — never copy
  those styles into the page.
