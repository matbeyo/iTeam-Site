// Custom Accessibility Widget for iTeam-sh
// Replaces Negishot third-party widget
(function() {
    'use strict';

    var STORAGE_KEY = 'iteam-a11y';
    var defaults = {
        fontSize: 0,       // -2 to +4 steps
        contrast: 'none',  // none | high | inverted
        links: false,      // highlight links
        cursor: false,     // large cursor
        animations: true,  // allow animations
        lineHeight: false, // increased line height
        letterSpacing: false, // increased letter spacing
        readable: false    // readable font
    };

    // Load saved preferences
    function loadPrefs() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved) return Object.assign({}, defaults, saved);
        } catch(e) {}
        return Object.assign({}, defaults);
    }

    function savePrefs(prefs) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch(e) {}
    }

    var prefs = loadPrefs();

    // Inject styles
    var css = document.createElement('style');
    css.id = 'a11y-widget-styles';
    css.textContent = [
        /* Floating button */
        '.a11y-fab{',
            'position:fixed;bottom:24px;left:24px;z-index:100000;',
            'width:56px;height:56px;border-radius:50%;border:none;',
            'background:#0065BF;color:#fff;cursor:pointer;',
            'box-shadow:0 4px 16px rgba(0,0,0,0.3);',
            'display:flex;align-items:center;justify-content:center;',
            'transition:transform 0.2s,box-shadow 0.2s;',
        '}',
        '.a11y-fab:hover,.a11y-fab:focus-visible{',
            'transform:scale(1.08);box-shadow:0 6px 24px rgba(0,0,0,0.4);',
        '}',
        '.a11y-fab:focus-visible{outline:3px solid #fff;outline-offset:3px;}',
        '.a11y-fab svg{width:28px;height:28px;fill:currentColor;}',

        /* Panel */
        '.a11y-panel{',
            'position:fixed;bottom:90px;left:24px;z-index:100001;',
            'width:320px;max-height:80vh;overflow-y:auto;',
            'background:#1a2332;color:#fff;border-radius:16px;',
            'box-shadow:0 10px 40px rgba(0,0,0,0.5);',
            'padding:0;opacity:0;visibility:hidden;',
            'transform:translateY(12px);',
            'transition:opacity 0.25s,transform 0.25s,visibility 0.25s;',
            'font-family:"Heebo",sans-serif;direction:rtl;',
        '}',
        '.a11y-panel.open{opacity:1;visibility:visible;transform:translateY(0);}',
        '.a11y-panel-header{',
            'display:flex;align-items:center;justify-content:space-between;',
            'padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1);',
        '}',
        '.a11y-panel-header h3{margin:0;font-size:18px;font-weight:700;}',
        '.a11y-panel-close{',
            'background:none;border:none;color:#fff;cursor:pointer;',
            'width:32px;height:32px;display:flex;align-items:center;justify-content:center;',
            'border-radius:50%;transition:background 0.15s;font-size:20px;',
        '}',
        '.a11y-panel-close:hover,.a11y-panel-close:focus-visible{background:rgba(255,255,255,0.1);}',
        '.a11y-panel-close:focus-visible{outline:2px solid #0D9488;outline-offset:2px;}',
        '.a11y-panel-body{padding:12px 20px 20px;}',

        /* Controls */
        '.a11y-group{margin-bottom:16px;}',
        '.a11y-group:last-child{margin-bottom:0;}',
        '.a11y-group-label{',
            'font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:8px;',
            'display:block;font-weight:500;',
        '}',
        '.a11y-row{display:flex;gap:8px;flex-wrap:wrap;}',
        '.a11y-btn{',
            'flex:1;min-width:0;padding:10px 8px;border-radius:10px;',
            'border:1px solid rgba(255,255,255,0.12);',
            'background:rgba(255,255,255,0.05);color:#fff;',
            'cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;',
            'display:flex;align-items:center;justify-content:center;gap:6px;',
            'transition:background 0.15s,border-color 0.15s;text-align:center;',
        '}',
        '.a11y-btn:hover{background:rgba(255,255,255,0.1);}',
        '.a11y-btn:focus-visible{outline:2px solid #0D9488;outline-offset:2px;}',
        '.a11y-btn.active{',
            'background:rgba(13,148,136,0.2);border-color:#0D9488;color:#5eead4;',
        '}',
        '.a11y-btn svg{width:18px;height:18px;flex-shrink:0;}',

        /* Font size controls */
        '.a11y-font-row{display:flex;align-items:center;gap:8px;}',
        '.a11y-font-btn{',
            'width:40px;height:40px;border-radius:10px;',
            'border:1px solid rgba(255,255,255,0.12);',
            'background:rgba(255,255,255,0.05);color:#fff;',
            'cursor:pointer;font-size:18px;font-weight:700;',
            'display:flex;align-items:center;justify-content:center;',
            'transition:background 0.15s;',
        '}',
        '.a11y-font-btn:hover{background:rgba(255,255,255,0.1);}',
        '.a11y-font-btn:focus-visible{outline:2px solid #0D9488;outline-offset:2px;}',
        '.a11y-font-value{',
            'flex:1;text-align:center;font-size:14px;font-weight:600;',
        '}',

        /* Reset button */
        '.a11y-reset{',
            'width:100%;padding:10px;border-radius:10px;',
            'border:1px solid rgba(239,68,68,0.3);',
            'background:rgba(239,68,68,0.08);color:#fca5a5;',
            'cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;',
            'margin-top:16px;transition:background 0.15s;',
        '}',
        '.a11y-reset:hover{background:rgba(239,68,68,0.15);}',
        '.a11y-reset:focus-visible{outline:2px solid #ef4444;outline-offset:2px;}',

        /* Link to accessibility statement */
        '.a11y-statement-link{',
            'display:block;text-align:center;color:#5eead4;',
            'font-size:13px;margin-top:12px;text-decoration:underline;',
        '}',
        '.a11y-statement-link:hover{color:#99f6e4;}',
        '.a11y-statement-link:focus-visible{outline:2px solid #0D9488;outline-offset:2px;}',

        /* Light theme panel */
        '[data-theme="light"] .a11y-panel{background:#fff;color:#1a2332;box-shadow:0 10px 40px rgba(0,0,0,0.15);}',
        '[data-theme="light"] .a11y-panel-header{border-bottom-color:rgba(0,0,0,0.08);}',
        '[data-theme="light"] .a11y-panel-close{color:#1a2332;}',
        '[data-theme="light"] .a11y-panel-close:hover{background:rgba(0,0,0,0.06);}',
        '[data-theme="light"] .a11y-group-label{color:rgba(0,0,0,0.5);}',
        '[data-theme="light"] .a11y-btn{border-color:rgba(0,0,0,0.1);background:rgba(0,0,0,0.03);color:#1a2332;}',
        '[data-theme="light"] .a11y-btn:hover{background:rgba(0,0,0,0.06);}',
        '[data-theme="light"] .a11y-btn.active{background:rgba(13,148,136,0.1);border-color:#0D9488;color:#0D9488;}',
        '[data-theme="light"] .a11y-font-btn{border-color:rgba(0,0,0,0.1);background:rgba(0,0,0,0.03);color:#1a2332;}',
        '[data-theme="light"] .a11y-font-btn:hover{background:rgba(0,0,0,0.06);}',
        '[data-theme="light"] .a11y-reset{border-color:rgba(239,68,68,0.2);background:rgba(239,68,68,0.05);color:#dc2626;}',
        '[data-theme="light"] .a11y-reset:hover{background:rgba(239,68,68,0.1);}',
        '[data-theme="light"] .a11y-statement-link{color:#0D9488;}',

        /* Applied a11y styles */
        '.a11y-highlight-links a{',
            'outline:2px solid #0D9488 !important;',
            'outline-offset:2px !important;',
            'text-decoration:underline !important;',
        '}',
        '.a11y-large-cursor,.a11y-large-cursor *{',
            'cursor:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M5 3l3.06 13.06L10.88 12 15 14 5 3z\' fill=\'%23000\' stroke=\'%23fff\' stroke-width=\'1\'/%3E%3C/svg%3E") 4 4,auto !important;',
        '}',
        '.a11y-high-contrast{filter:contrast(1.5) !important;}',
        '.a11y-inverted{filter:invert(1) hue-rotate(180deg) !important;}',
        '.a11y-inverted img,.a11y-inverted video,.a11y-inverted canvas{',
            'filter:invert(1) hue-rotate(180deg) !important;',
        '}',
        /* Stop decorative animations only — keep UI transitions for responsiveness */
        '.a11y-no-animations .partners-track,',
        '.a11y-no-animations .customers-track{',
            'animation:none !important;',
        '}',
        '.a11y-no-animations .animate-fade-in-up{',
            'animation:none !important;',
            'opacity:1 !important;',
            'transform:none !important;',
        '}',
        '.a11y-no-animations #hero-particles{display:none !important;}',
        '.a11y-no-animations .hero-bg-glow{animation:none !important;}',
        /* Stop isometric server visual animations */
        '.a11y-no-animations .led-blink,',
        '.a11y-no-animations .led-blink-fast,',
        '.a11y-no-animations .led-blink-slow{animation:none !important;opacity:1 !important;}',
        '.a11y-no-animations .shield-pulse{animation:none !important;}',
        '.a11y-no-animations .cloud-icon{animation:none !important;}',
        '.a11y-no-animations .server-rack{transition:none !important;}',
        '.a11y-no-animations .isometric-visual:hover .rack-1,',
        '.a11y-no-animations .isometric-visual:hover .rack-2,',
        '.a11y-no-animations .isometric-visual:hover .rack-3{transform:none !important;}',
        /* Hide SVG data packets when animations stopped */
        '.a11y-no-animations .data-packets{display:none !important;}',
        /* Make timeline items static when animations stopped */
        '.a11y-no-animations .timeline-item{',
            'opacity:1 !important;',
            'transform:none !important;',
            'transition:none !important;',
        '}',
        '.a11y-no-animations .timeline-item:hover .timeline-number{',
            'transform:translateX(-50%) !important;',
        '}',
        '.a11y-no-animations .timeline-content{',
            'transition:none !important;',
        '}',
        '.a11y-no-animations .timeline-content:hover{',
            'transform:none !important;',
            'box-shadow:none !important;',
        '}',
        /* Disable hover glow/transform effects on all cards */
        '.a11y-no-animations .service-card,',
        '.a11y-no-animations .partner-logo,',
        '.a11y-no-animations .customer-logo,',
        '.a11y-no-animations .testimonial-card,',
        '.a11y-no-animations .other-service-card,',
        '.a11y-no-animations .advantage-card,',
        '.a11y-no-animations .feature-card,',
        '.a11y-no-animations .approach-card,',
        '.a11y-no-animations .process-card,',
        '.a11y-no-animations .benefit-card,',
        '.a11y-no-animations .pillar-card,',
        '.a11y-no-animations .support-card,',
        '.a11y-no-animations .support-service-card,',
        '.a11y-no-animations .diagnostic-card,',
        '.a11y-no-animations .tier-card,',
        '.a11y-no-animations .tool-card,',
        '.a11y-no-animations .metric-card,',
        '.a11y-no-animations .methodology-card,',
        '.a11y-no-animations .service-detail-card,',
        '.a11y-no-animations .timeline-content{transition:none !important;}',
        '.a11y-no-animations .service-card:hover,',
        '.a11y-no-animations .other-service-card:hover,',
        '.a11y-no-animations .advantage-card:hover,',
        '.a11y-no-animations .feature-card:hover,',
        '.a11y-no-animations .approach-card:hover,',
        '.a11y-no-animations .process-card:hover,',
        '.a11y-no-animations .benefit-card:hover,',
        '.a11y-no-animations .pillar-card:hover,',
        '.a11y-no-animations .support-card:hover,',
        '.a11y-no-animations .support-service-card:hover,',
        '.a11y-no-animations .diagnostic-card:hover,',
        '.a11y-no-animations .testimonial-card:hover,',
        '.a11y-no-animations .tier-card:hover,',
        '.a11y-no-animations .tool-card:hover,',
        '.a11y-no-animations .metric-card:hover,',
        '.a11y-no-animations .methodology-card:hover,',
        '.a11y-no-animations .service-detail-card:hover,',
        '.a11y-no-animations .timeline-content:hover{',
            'box-shadow:inherit !important;background:inherit !important;',
            'transform:none !important;border-color:inherit !important;',
        '}',
        '.a11y-no-animations .service-card:hover::before{height:0 !important;}',
        '.a11y-no-animations .partner-logo:hover,',
        '.a11y-no-animations .customer-logo:hover{',
            'box-shadow:none !important;background:inherit !important;',
        '}',
        '.a11y-no-animations .partner-logo:hover img,',
        '.a11y-no-animations .customer-logo:hover img{',
            'filter:grayscale(100%) !important;opacity:0.7 !important;',
        '}',
        /* Disable hover transforms on buttons and interactive elements */
        '.a11y-no-animations .btn-primary,',
        '.a11y-no-animations .btn-service,',
        '.a11y-no-animations .theme-toggle,',
        '.a11y-no-animations .back-to-top,',
        '.a11y-no-animations .dropdown-menu,',
        '.a11y-no-animations .a11y-fab{transition:none !important;}',
        '.a11y-no-animations .btn-primary:hover,',
        '.a11y-no-animations .hero .btn-primary:hover,',
        '.a11y-no-animations .btn-service:hover,',
        '.a11y-no-animations .theme-toggle:hover,',
        '.a11y-no-animations .back-to-top:hover,',
        '.a11y-no-animations .a11y-fab:hover{transform:none !important;}',

        /* Marquee carousel mode when animations stopped */
        '.a11y-no-animations .partners-marquee,',
        '.a11y-no-animations .customers-marquee{',
            'mask-image:none !important;-webkit-mask-image:none !important;',
        '}',
        '.a11y-no-animations .partners-track,',
        '.a11y-no-animations .customers-track{',
            'transition:transform 0.4s ease !important;',
        '}',

        /* Nav arrows for marquees */
        '.a11y-marquee-nav{',
            'display:none;position:absolute;top:50%;transform:translateY(-50%);',
            'width:40px;height:40px;border-radius:50%;border:1px solid var(--border-color,rgba(255,255,255,0.12));',
            'background:var(--bg-card,rgba(255,255,255,0.04));color:var(--text-primary,#fff);',
            'cursor:pointer;z-index:5;align-items:center;justify-content:center;font-size:20px;',
            'box-shadow:0 2px 8px rgba(0,0,0,0.15);',
        '}',
        '.a11y-marquee-nav:hover{background:var(--accent-color,#0D9488);color:#fff;}',
        '.a11y-marquee-nav:focus-visible{outline:2px solid #0D9488;outline-offset:2px;}',
        '.a11y-marquee-nav.prev{left:8px;}',
        '.a11y-marquee-nav.next{right:8px;}',
        '.a11y-no-animations .a11y-marquee-nav{display:flex;}',

        '[data-theme="light"] .a11y-marquee-nav{',
            'border-color:rgba(0,0,0,0.1);background:rgba(255,255,255,0.9);color:#1a2332;',
            'box-shadow:0 2px 8px rgba(0,0,0,0.08);',
        '}',
        '[data-theme="light"] .a11y-marquee-nav:hover{background:#0D9488;color:#fff;}',
        '.a11y-line-height{line-height:2 !important;}',
        '.a11y-line-height *{line-height:inherit !important;}',
        '.a11y-letter-spacing{letter-spacing:0.12em !important;}',
        '.a11y-letter-spacing *{letter-spacing:inherit !important;}',
        '.a11y-readable-font,.a11y-readable-font *{',
            'font-family:Arial,Helvetica,sans-serif !important;',
        '}',

        /* Responsive */
        '@media(max-width:400px){',
            '.a11y-panel{left:8px;right:8px;width:auto;bottom:86px;}',
            '.a11y-fab{left:16px;bottom:16px;width:50px;height:50px;}',
        '}',

        /* Reduced motion */
        '@media(prefers-reduced-motion:reduce){',
            '.a11y-panel{transition:none;}',
            '.a11y-fab{transition:none;}',
        '}',

        /* forced-colors */
        '@media(forced-colors:active){',
            '.a11y-fab{border:2px solid ButtonText;}',
            '.a11y-panel{border:2px solid ButtonText;}',
            '.a11y-btn{border:1px solid ButtonText;}',
            '.a11y-font-btn{border:1px solid ButtonText;}',
        '}'
    ].join('');
    document.head.appendChild(css);

    // Determine the accessibility page path
    var isServicePage = window.location.pathname.indexOf('/services/') !== -1;
    var a11yPageHref = isServicePage ? '../accessibility.html' : 'accessibility.html';

    // Build DOM
    // Floating button
    var fab = document.createElement('button');
    fab.className = 'a11y-fab';
    fab.setAttribute('aria-label', 'פתח תפריט נגישות');
    fab.setAttribute('title', 'נגישות');
    fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 7h-6.5l-1 8.5 3 4.5h-3l-2.5-4-2.5 4h-3l3-4.5-1-8.5H3V7h18v2z"/></svg>';
    document.body.appendChild(fab);

    // Panel
    var panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'אפשרויות נגישות');
    panel.setAttribute('aria-modal', 'false');
    panel.innerHTML = [
        '<div class="a11y-panel-header">',
            '<h3>נגישות</h3>',
            '<button class="a11y-panel-close" aria-label="סגור תפריט נגישות">&times;</button>',
        '</div>',
        '<div class="a11y-panel-body">',

            // Font size
            '<div class="a11y-group">',
                '<span class="a11y-group-label">גודל טקסט</span>',
                '<div class="a11y-font-row">',
                    '<button class="a11y-font-btn" data-action="font-down" aria-label="הקטן טקסט">−</button>',
                    '<span class="a11y-font-value" id="a11yFontValue">100%</span>',
                    '<button class="a11y-font-btn" data-action="font-up" aria-label="הגדל טקסט">+</button>',
                '</div>',
            '</div>',

            // Contrast
            '<div class="a11y-group">',
                '<span class="a11y-group-label">ניגודיות</span>',
                '<div class="a11y-row">',
                    '<button class="a11y-btn" data-action="contrast-high">',
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20a10 10 0 0 0 0-20z" fill="currentColor"/></svg>',
                        'ניגודיות גבוהה',
                    '</button>',
                    '<button class="a11y-btn" data-action="contrast-inverted">',
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"/></svg>',
                        'צבעים הפוכים',
                    '</button>',
                '</div>',
            '</div>',

            // Toggles
            '<div class="a11y-group">',
                '<span class="a11y-group-label">כלי עזר</span>',
                '<div class="a11y-row" style="margin-bottom:8px">',
                    '<button class="a11y-btn" data-action="links">',
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
                        'הדגשת קישורים',
                    '</button>',
                    '<button class="a11y-btn" data-action="cursor">',
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l3.06 13.06L10.88 12 15 14 5 3z"/></svg>',
                        'סמן גדול',
                    '</button>',
                '</div>',
                '<div class="a11y-row" style="margin-bottom:8px">',
                    '<button class="a11y-btn" data-action="animations">',
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M10 9l5 3-5 3V9z"/></svg>',
                        'עצור אנימציות',
                    '</button>',
                    '<button class="a11y-btn" data-action="readable">',
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>',
                        'פונט קריא',
                    '</button>',
                '</div>',
                '<div class="a11y-row">',
                    '<button class="a11y-btn" data-action="lineHeight">',
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10H7"/><path d="M21 6H3"/><path d="M21 14H3"/><path d="M21 18H7"/></svg>',
                        'ריווח שורות',
                    '</button>',
                    '<button class="a11y-btn" data-action="letterSpacing">',
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 8h10"/><path d="M3 12h18"/><path d="M7 16h10"/><path d="M3 4l3 4-3 4"/><path d="M21 4l-3 4 3 4"/></svg>',
                        'ריווח אותיות',
                    '</button>',
                '</div>',
            '</div>',

            // Reset
            '<button class="a11y-reset" data-action="reset">איפוס הגדרות</button>',
            '<a href="' + a11yPageHref + '" class="a11y-statement-link">הצהרת נגישות</a>',

        '</div>'
    ].join('');
    document.body.appendChild(panel);

    var closeBtn = panel.querySelector('.a11y-panel-close');
    var fontValue = document.getElementById('a11yFontValue');
    var isOpen = false;

    // Toggle panel
    function togglePanel() {
        isOpen = !isOpen;
        panel.classList.toggle('open', isOpen);
        fab.setAttribute('aria-expanded', isOpen);
        if (isOpen) {
            closeBtn.focus();
        }
    }

    fab.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', togglePanel);

    // Close on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) {
            togglePanel();
            fab.focus();
        }
    });

    // Close on click outside
    document.addEventListener('click', function(e) {
        if (isOpen && !panel.contains(e.target) && !fab.contains(e.target)) {
            togglePanel();
        }
    });

    // Inject prev/next arrows into marquee containers
    function setupMarqueeNavs() {
        var marquees = document.querySelectorAll('.partners-marquee, .customers-marquee');
        marquees.forEach(function(marquee) {
            if (marquee.querySelector('.a11y-marquee-nav')) return; // already set up

            // Wrap marquee in a positioning container for the arrows
            var wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            marquee.parentNode.insertBefore(wrapper, marquee);
            wrapper.appendChild(marquee);

            var prevBtn = document.createElement('button');
            prevBtn.className = 'a11y-marquee-nav prev';
            prevBtn.setAttribute('aria-label', 'הקודם');
            prevBtn.innerHTML = '&#8250;'; // RTL: right chevron means "previous"
            wrapper.appendChild(prevBtn);

            var nextBtn = document.createElement('button');
            nextBtn.className = 'a11y-marquee-nav next';
            nextBtn.setAttribute('aria-label', 'הבא');
            nextBtn.innerHTML = '&#8249;'; // RTL: left chevron means "next"
            wrapper.appendChild(nextBtn);

            var track = marquee.querySelector('.partners-track, .customers-track');
            var offset = 0;
            var scrollStep = 220; // logo width + gap

            function getMaxOffset() {
                // Only scroll through the first half (original logos, not duplicates)
                var halfWidth = track.scrollWidth / 2;
                return Math.max(0, halfWidth - marquee.clientWidth);
            }

            prevBtn.addEventListener('click', function() {
                offset = Math.max(0, offset - scrollStep);
                track.style.transform = 'translateX(-' + offset + 'px)';
            });
            nextBtn.addEventListener('click', function() {
                offset = Math.min(getMaxOffset(), offset + scrollStep);
                track.style.transform = 'translateX(-' + offset + 'px)';
            });

            // Store reference for reset
            marquee._a11yTrack = track;
            marquee._a11yResetOffset = function() {
                offset = 0;
                track.style.transform = '';
            };
        });
    }
    setupMarqueeNavs();

    // Force-reveal elements hidden for fade-in animation
    function revealHiddenElements() {
        var hidden = document.querySelectorAll('.service-card, .about-feature');
        hidden.forEach(function(el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

    // Restore hidden elements to their animated state
    function restoreHiddenElements() {
        var els = document.querySelectorAll('.service-card, .about-feature');
        els.forEach(function(el) {
            // Only reset elements that haven't been animated yet
            if (!el.classList.contains('animate-fade-in-up')) {
                el.style.opacity = '';
                el.style.transform = '';
            }
        });
    }

    // Apply preferences to page
    function applyPrefs() {
        var html = document.documentElement;

        // Font size
        var size = 100 + prefs.fontSize * 15;
        html.style.fontSize = size + '%';
        if (fontValue) fontValue.textContent = size + '%';

        // Contrast
        html.classList.remove('a11y-high-contrast', 'a11y-inverted');
        if (prefs.contrast === 'high') html.classList.add('a11y-high-contrast');
        if (prefs.contrast === 'inverted') html.classList.add('a11y-inverted');

        // Links
        html.classList.toggle('a11y-highlight-links', prefs.links);

        // Cursor
        html.classList.toggle('a11y-large-cursor', prefs.cursor);

        // Animations
        html.classList.toggle('a11y-no-animations', !prefs.animations);
        if (!prefs.animations) {
            revealHiddenElements();
        } else {
            restoreHiddenElements();
            // Reset marquee positions when re-enabling animations
            var marquees = document.querySelectorAll('.partners-marquee, .customers-marquee');
            marquees.forEach(function(m) {
                if (m._a11yResetOffset) m._a11yResetOffset();
            });
        }

        // Line height
        html.classList.toggle('a11y-line-height', prefs.lineHeight);

        // Letter spacing
        html.classList.toggle('a11y-letter-spacing', prefs.letterSpacing);

        // Readable font
        html.classList.toggle('a11y-readable-font', prefs.readable);

        // Update button states
        updateButtons();
        savePrefs(prefs);
    }

    function updateButtons() {
        // Contrast buttons
        var highBtn = panel.querySelector('[data-action="contrast-high"]');
        var invertBtn = panel.querySelector('[data-action="contrast-inverted"]');
        if (highBtn) highBtn.classList.toggle('active', prefs.contrast === 'high');
        if (invertBtn) invertBtn.classList.toggle('active', prefs.contrast === 'inverted');

        // Toggle buttons
        var map = {
            links: 'links',
            cursor: 'cursor',
            readable: 'readable',
            lineHeight: 'lineHeight',
            letterSpacing: 'letterSpacing'
        };
        Object.keys(map).forEach(function(action) {
            var btn = panel.querySelector('[data-action="' + action + '"]');
            if (btn) btn.classList.toggle('active', prefs[map[action]]);
        });

        // Animations button (active = animations stopped)
        var animBtn = panel.querySelector('[data-action="animations"]');
        if (animBtn) animBtn.classList.toggle('active', !prefs.animations);
    }

    // Handle button clicks
    panel.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) return;

        var action = btn.getAttribute('data-action');

        switch(action) {
            case 'font-up':
                if (prefs.fontSize < 4) prefs.fontSize++;
                break;
            case 'font-down':
                if (prefs.fontSize > -2) prefs.fontSize--;
                break;
            case 'contrast-high':
                prefs.contrast = prefs.contrast === 'high' ? 'none' : 'high';
                break;
            case 'contrast-inverted':
                prefs.contrast = prefs.contrast === 'inverted' ? 'none' : 'inverted';
                break;
            case 'links':
                prefs.links = !prefs.links;
                break;
            case 'cursor':
                prefs.cursor = !prefs.cursor;
                break;
            case 'animations':
                prefs.animations = !prefs.animations;
                break;
            case 'lineHeight':
                prefs.lineHeight = !prefs.lineHeight;
                break;
            case 'letterSpacing':
                prefs.letterSpacing = !prefs.letterSpacing;
                break;
            case 'readable':
                prefs.readable = !prefs.readable;
                break;
            case 'reset':
                prefs = Object.assign({}, defaults);
                document.documentElement.style.fontSize = '';
                break;
        }

        applyPrefs();
    });

    // Apply on load
    applyPrefs();
})();
