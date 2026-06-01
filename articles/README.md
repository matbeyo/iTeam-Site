# Articles (מאמרים)

How to publish a new article. No build step — copy a folder, fill in a few
fields, write the text. All the tedious metadata is generated automatically.

## Where things live

```
articles/
  index.html                ← the hub (the list of article cards)
  _template/index.html      ← copy this to start a new article
  cloud-it-trends/          ← example article
article.css                 ← shared styles (project root)
article.js                  ← shared behaviors + auto-metadata (project root)
```

`article.css` / `article.js` are shared by every article — never copy styling.

## What's automatic

You **don't** write canonical links, OpenGraph/Twitter tags, JSON-LD, the
breadcrumb label, the category badge, the date pill, or the **read time**.
`article.js` builds all of that from your `<title>`, your `<meta description>`,
the folder name, and a 2-field config block. Read time is counted from the text.

## Publish a new article — the only things you edit

### 1. Create the folder
Copy `articles/_template/` and rename it to your **slug** (lowercase English,
hyphen-separated — it becomes the URL):

```
articles/_template/  →  articles/my-new-article/
```
→ live at `https://www.iteam-sh.co.il/articles/my-new-article/`

### 2. Edit the 5 marked spots (look for ✏️ in the file)
1. **`<title>`** — the headline + ` | iTeam-sh`
2. **`<meta name="description">`** — one sentence (~155 chars)
3. **`#article-config`** — category + date:
   ```html
   <script id="article-config" type="application/json">
   { "category": "ענן", "date": "2026-06-15" }
   </script>
   ```
4. **`<h1>` + the `.article-lead`** — the on-page headline (wrap one phrase in
   `<span class="mark-accent">…</span>`) and the intro sentence
5. **The body** — write inside `<div class="article-content">`

That's it. Don't touch the breadcrumb, badge, or meta pill — they fill in by themselves.

### 3. Write the body
Plain HTML is auto-styled — just write:
```html
<p class="lead">An emphasized opening paragraph (optional).</p>
<p>A normal paragraph with <strong>bold</strong>, a <span class="highlight">teal highlight</span>, and a <a href="/services/">link</a>.</p>
<h2>A section heading</h2>
<p>…</p>
<h3>A sub-heading</h3>
<ul><li>list item</li></ul>
<blockquote>A simple quote.</blockquote>
```
For richer pieces, drop in any block from **[Rich blocks](#rich-blocks)** below.

### 4. Add a card to the hub
In `articles/index.html`, copy an existing `<article class="post-card">…</article>`
inside `.posts-grid` and update its category, cover icon, title + `href` (your
slug), excerpt and date. Put the newest first; the top one can use
`post-card--featured` to go full-width.

### 5. Add it to the sitemap
Copy a `<url>` block in `sitemap.xml` and point it at your slug.

Push to `main` — GitHub Actions deploys to Azure automatically.

---

## Rich blocks

Copy any of these into the body (`.article-content`). Add `class="reveal"` to
make a block fade in on scroll.

**Pull quote**
```html
<div class="pull-quote reveal">
    <p>A standout sentence or key idea.</p>
    <cite>— source / name (optional)</cite>
</div>
```

**Callout** — tip (default) / `callout-warning` / `callout-info`
```html
<div class="callout reveal">
    <span class="callout-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>
    </span>
    <div class="callout-body">
        <p class="callout-title">טיפ</p>
        <p>The callout text.</p>
    </div>
</div>
```

**Key takeaways**
```html
<div class="takeaways reveal">
    <p class="takeaways-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        מה כדאי לזכור
    </p>
    <ul>
        <li>First point.</li>
        <li>Second point.</li>
    </ul>
</div>
```

**Q&A card**
```html
<div class="qa-card reveal">
    <span class="qa-tag">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        שאלה נפוצה
    </span>
    <p class="qa-question">"The question?"</p>
    <p class="qa-answer">The answer.</p>
</div>
```

**Figure + caption** (needs a real image in the article folder)
```html
<figure class="article-figure reveal">
    <img src="image.jpg" alt="description">
    <figcaption>Caption.</figcaption>
</figure>
```

**Inline CTA**
```html
<div class="inline-cta reveal">
    <div class="inline-cta-text">
        <strong>A call to action.</strong>
        <span>A short supporting line.</span>
    </div>
    <a href="/#contact" class="btn btn-primary">Button</a>
</div>
```

---

## Notes
- **English terms in Hebrew text:** wrap multi-word Latin phrases in
  `<span dir="ltr">…</span>` (e.g. `<span dir="ltr">Platform Engineering</span>`)
  so they read correctly in the RTL flow.
- **Social share image:** by default articles share the iTeam logo. For a custom
  preview, drop `cover.jpg` (1200×630) in the article folder and add
  `<meta property="og:image" content="https://www.iteam-sh.co.il/articles/<slug>/cover.jpg">`.
- `_template/` is a reference only — not linked, excluded from the sitemap and
  `robots.txt`. Copy from it; don't delete it.
- **Author byline:** add `"author"`, `"authorTitle"` and `"authorImage"` (e.g. `"/images/CEO/ronen.jpg"`) to the config to show a byline — *נכתב על ידי …* — at the bottom of the article. Omit them for no byline. The author also feeds the `Person` author in the structured data.
- Categories used so far: `תשתיות`, `אבטחת מידע`, `ענן`, `מגמות IT` — use anything.
