// article.js — shared behaviors for the Articles section (מאמרים)
// Loaded after script.js (which handles nav, dropdown, back-to-top).
// Every behavior is guarded by element presence, so this file is safe to
// load on both the hub (/articles/) and individual article pages.
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- Article auto-hydration --------------------------------------------
       If a page has <script id="article-config" type="application/json">, build
       all the tedious metadata from the page's <title>, <meta description>, the
       URL, and a tiny {category, date} config — so a new article only needs a
       title, a description, that 2-field config, a headline + lead, and a body.
       Generates: canonical, OpenGraph/Twitter, Article + Breadcrumb JSON-LD,
       the breadcrumb label, the category badge, and the meta pill (with an
       auto-calculated read time). ------------------------------------------- */
    (function hydrateArticle() {
        var cfgEl = document.getElementById('article-config');
        if (!cfgEl) return;
        var cfg = {};
        try { cfg = JSON.parse(cfgEl.textContent) || {}; } catch (e) { return; }

        var SITE = 'https://www.iteam-sh.co.il';
        var headline = (document.title || '').replace(/\s*[|–-]\s*iTeam-sh\s*$/, '').trim();
        var descMeta = document.querySelector('meta[name="description"]');
        var description = descMeta ? descMeta.getAttribute('content') : '';
        var pathMatch = location.pathname.replace(/\/+$/, '').match(/\/articles\/([^\/]+)$/);
        var slug = cfg.slug || (pathMatch ? pathMatch[1] : '');
        var url = SITE + '/articles/' + slug + '/';
        var category = cfg.category || '';
        var dateISO = cfg.date || '';
        var author = cfg.author || '';
        var authorTitle = cfg.authorTitle || '';
        var authorImage = cfg.authorImage || '';

        // Hebrew date display from an ISO date (YYYY-MM-DD)
        var months = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
        var dateDisplay = '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
            var dp = dateISO.split('-');
            dateDisplay = parseInt(dp[2], 10) + ' ב' + months[parseInt(dp[1], 10) - 1] + ' ' + dp[0];
        }

        // Auto read-time from the body (~200 words/min)
        var contentEl = document.querySelector('.article-content');
        var words = contentEl ? contentEl.textContent.trim().split(/\s+/).filter(Boolean).length : 0;
        var mins = Math.max(1, Math.round(words / 200));
        var readTime = (mins === 1 ? 'דקה' : mins + ' דקות') + ' קריאה';

        // --- <head>: only the derived tags (title + description stay static) ---
        function upsertMeta(attr, key, val) {
            if (!val) return;
            var el = document.head.querySelector('meta[' + attr + '="' + key + '"]');
            if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
            el.setAttribute('content', val);
        }
        var canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
        canonical.setAttribute('href', url);
        upsertMeta('property', 'og:url', url);
        upsertMeta('property', 'og:title', headline);
        upsertMeta('property', 'og:description', description);
        upsertMeta('name', 'twitter:title', headline);
        upsertMeta('name', 'twitter:description', description);

        var article = {
            '@context': 'https://schema.org', '@type': 'Article',
            headline: headline, description: description, inLanguage: 'he', url: url,
            author: author ? { '@type': 'Person', name: author } : { '@type': 'Organization', name: 'iTeam-sh' },
            publisher: { '@type': 'Organization', name: 'iTeam-sh', logo: { '@type': 'ImageObject', url: SITE + '/images/iteam-logo.png' } },
            image: SITE + '/images/iteam-logo.png', mainEntityOfPage: url
        };
        if (dateISO) { article.datePublished = dateISO; article.dateModified = dateISO; }
        if (author && authorTitle) article.author.jobTitle = authorTitle;
        var breadcrumb = {
            '@context': 'https://schema.org', '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'דף הבית', item: SITE + '/' },
                { '@type': 'ListItem', position: 2, name: 'מאמרים', item: SITE + '/articles/' },
                { '@type': 'ListItem', position: 3, name: headline }
            ]
        };
        [article, breadcrumb].forEach(function (obj) {
            var s = document.createElement('script');
            s.type = 'application/ld+json';
            s.textContent = JSON.stringify(obj);
            document.head.appendChild(s);
        });

        // --- Hero chrome: breadcrumb label, category badge, meta pill ---
        var crumbEl = document.querySelector('.article-hero .breadcrumb-current');
        if (crumbEl && !crumbEl.textContent.trim()) crumbEl.textContent = cfg.crumb || category || headline;
        var badgeText = document.querySelector('.article-badge .badge-text');
        if (badgeText && !badgeText.textContent.trim() && category) badgeText.textContent = category;

        var metaEl = document.querySelector('.article-hero .article-meta');
        if (metaEl && !metaEl.children.length) {
            var cal = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
            var clk = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
            var tagIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
            var parts = [];
            if (dateDisplay) parts.push('<span class="meta-item">' + cal + '<time datetime="' + dateISO + '">' + dateDisplay + '</time></span>');
            parts.push('<span class="meta-item">' + clk + readTime + '</span>');
            if (category) parts.push('<span class="meta-item">' + tagIcon + category + '</span>');
            metaEl.innerHTML = parts.join('<span class="meta-divider" aria-hidden="true"></span>');
        }

        // --- Author byline at the bottom of the article ---
        if (author && contentEl && !contentEl.querySelector('.article-byline')) {
            var byline = document.createElement('div');
            byline.className = 'article-byline';
            var avatarHtml = authorImage ? '<img class="article-byline-avatar" src="' + authorImage + '" alt="' + author + '" loading="lazy">' : '';
            byline.innerHTML = avatarHtml +
                '<div class="article-byline-info">' +
                    '<span class="article-byline-label">נכתב על ידי</span>' +
                    '<span class="article-byline-name"></span>' +
                    (authorTitle ? '<span class="article-byline-role"></span>' : '') +
                '</div>';
            byline.querySelector('.article-byline-name').textContent = author;
            if (authorTitle) byline.querySelector('.article-byline-role').textContent = authorTitle;
            var backLink = contentEl.querySelector('.article-back');
            if (backLink) contentEl.insertBefore(byline, backLink); else contentEl.appendChild(byline);
        }
    })();

    /* ---- Reading progress bar (article pages) ---- */
    var bar = document.getElementById('reading-bar');
    if (bar) {
        var updateBar = function () {
            var doc = document.documentElement;
            var scrollTop = doc.scrollTop || document.body.scrollTop;
            var height = doc.scrollHeight - doc.clientHeight;
            var pct = height > 0 ? (scrollTop / height) * 100 : 0;
            bar.style.width = pct + '%';
        };
        window.addEventListener('scroll', updateBar, { passive: true });
        window.addEventListener('resize', updateBar);
        updateBar();
    }

    /* ---- Scroll reveal ---- */
    var reveals = document.querySelectorAll('.reveal');
    if (reveals.length) {
        var showAll = function () {
            reveals.forEach(function (el) { el.classList.add('is-visible'); });
        };
        if (!('IntersectionObserver' in window) || reduceMotion) {
            showAll();
        } else {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
            reveals.forEach(function (el) { io.observe(el); });
            // Safety net: never leave content hidden if the observer doesn't fire
            setTimeout(showAll, 2500);
        }
    }

    /* ---- Category filter chips (hub, optional) ---- */
    var filter = document.querySelector('.cat-filter');
    if (filter) {
        var cards = document.querySelectorAll('.posts-grid .post-card');
        filter.addEventListener('click', function (e) {
            var chip = e.target.closest('.cat-chip');
            if (!chip) return;
            var cat = chip.getAttribute('data-cat');
            filter.querySelectorAll('.cat-chip').forEach(function (c) {
                c.classList.toggle('is-active', c === chip);
            });
            cards.forEach(function (card) {
                var show = cat === 'all' || card.getAttribute('data-category') === cat;
                card.classList.toggle('is-hidden', !show);
            });
        });
    }

    /* ---- Hero particle network (site-signature effect) ---- */
    var canvas = document.getElementById('article-particles');
    if (canvas && !reduceMotion) {
        var ctx = canvas.getContext('2d');
        var particles = [];
        var particleCount = 52;
        var linkDistance = 140;
        var mouse = { x: null, y: null, radius: 170 };
        var host = canvas.parentElement;

        function resize() {
            canvas.width = host.offsetWidth;
            canvas.height = host.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        host.addEventListener('mousemove', function (e) {
            var rect = host.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        host.addEventListener('mouseleave', function () {
            mouse.x = null; mouse.y = null;
        });

        function Particle() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.9;
            this.vy = (Math.random() - 0.5) * 0.9;
            this.radius = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.3;
        }
        Particle.prototype.update = function () {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0) { this.x = 0; this.vx = -this.vx; }
            if (this.x > canvas.width) { this.x = canvas.width; this.vx = -this.vx; }
            if (this.y < 0) { this.y = 0; this.vy = -this.vy; }
            if (this.y > canvas.height) { this.y = canvas.height; this.vy = -this.vy; }
        };
        Particle.prototype.draw = function () {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 31, 63, ' + this.opacity + ')';
            ctx.fill();
        };

        for (var i = 0; i < particleCount; i++) particles.push(new Particle());

        function drawLinks() {
            for (var i = 0; i < particles.length; i++) {
                for (var j = i + 1; j < particles.length; j++) {
                    var dx = particles[i].x - particles[j].x;
                    var dy = particles[i].y - particles[j].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < linkDistance) {
                        var op = (1 - dist / linkDistance) * 0.22;
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(0, 31, 63, ' + op + ')';
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            if (mouse.x !== null) {
                for (var k = 0; k < particles.length; k++) {
                    var mdx = particles[k].x - mouse.x;
                    var mdy = particles[k].y - mouse.y;
                    var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (mdist < mouse.radius) {
                        var mop = (1 - mdist / mouse.radius) * 0.4;
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(13, 148, 136, ' + mop + ')';
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(particles[k].x, particles[k].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(function (p) { p.update(); p.draw(); });
            drawLinks();
            requestAnimationFrame(loop);
        }
        loop();
    }
})();
