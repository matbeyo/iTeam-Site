// iTeam-sh Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle (disabled — light mode only)
    // var themeToggle = document.getElementById('themeToggle');
    // if (themeToggle) {
    //     themeToggle.addEventListener('click', function() {
    //         var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    //         if (isLight) {
    //             document.documentElement.removeAttribute('data-theme');
    //             localStorage.setItem('iteam-theme', 'dark');
    //         } else {
    //             document.documentElement.setAttribute('data-theme', 'light');
    //             localStorage.setItem('iteam-theme', 'light');
    //         }
    //     });
    // }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            // Toggle hamburger animation
            this.classList.toggle('active');
            // Update ARIA expanded state
            var isExpanded = navLinks.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Close mobile menu when clicking a link (skip dropdown toggles)
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (this.classList.contains('dropdown-toggle')) return;
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // Mobile menu focus trap for keyboard accessibility
    if (mobileMenuBtn && navLinks) {
        // Focus trap: Tab/Shift+Tab cycles within open mobile menu
        navLinks.addEventListener('keydown', function(e) {
            if (!navLinks.classList.contains('active')) return;
            if (e.key !== 'Tab') return;

            var focusable = Array.from(navLinks.querySelectorAll(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )).filter(function(el) {
                return el.offsetParent !== null;
            });

            var firstEl = focusable[0];
            var lastEl = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    mobileMenuBtn.focus();
                }
            } else {
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    mobileMenuBtn.focus();
                }
            }
        });

        // Escape key closes mobile menu and returns focus
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.focus();
            }
        });
    }

    // Mobile: toggle dropdown on click
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                var dropdown = this.closest('.nav-dropdown');
                dropdown.classList.toggle('open');
                var isOpen = dropdown.classList.contains('open');
                this.setAttribute('aria-expanded', isOpen);
            }
        });

        // Keyboard support for dropdown on desktop
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                var dropdown = this.closest('.nav-dropdown');
                dropdown.classList.toggle('open');
                var isOpen = dropdown.classList.contains('open');
                this.setAttribute('aria-expanded', isOpen);
            } else if (e.key === 'Escape') {
                var dropdown = this.closest('.nav-dropdown');
                dropdown.classList.remove('open');
                this.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Header reference (used elsewhere)
    const header = document.querySelector('.header');

    // Smooth scroll for anchor links (respects prefers-reduced-motion)
    const prefersReducedMotionScroll = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: prefersReducedMotionScroll ? 'auto' : 'smooth'
                });
            }
        });
    });

    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');

    // Form validation helpers
    function setFieldError(input, message) {
        var group = input.closest('.form-group');
        group.classList.add('has-error');
        input.setAttribute('aria-invalid', 'true');
        var errorEl = group.querySelector('.form-error');
        if (errorEl) {
            errorEl.textContent = message;
        }
        input.style.borderColor = '#ef4444';
    }

    function clearFieldError(input) {
        var group = input.closest('.form-group');
        group.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
        input.style.borderColor = 'rgba(0, 31, 63, 0.12)';
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Basic validation
            let isValid = true;

            var nameInput = document.getElementById('name');
            var companyInput = document.getElementById('company');
            var phoneInput = document.getElementById('phone');
            var emailInput = document.getElementById('email');

            // Clear previous errors
            [nameInput, companyInput, phoneInput, emailInput].forEach(clearFieldError);

            if (!nameInput.value.trim()) {
                isValid = false;
                setFieldError(nameInput, 'נא להזין שם מלא');
            }
            if (!companyInput.value.trim()) {
                isValid = false;
                setFieldError(companyInput, 'נא להזין שם חברה');
            }

            // Phone validation (Israeli format)
            var phoneRegex = /^0[0-9]{1,2}[-]?[0-9]{7}$/;
            if (!phoneInput.value.trim()) {
                isValid = false;
                setFieldError(phoneInput, 'נא להזין מספר טלפון');
            } else if (!phoneRegex.test(phoneInput.value.replace(/\s/g, ''))) {
                isValid = false;
                setFieldError(phoneInput, 'מספר טלפון לא תקין (לדוגמה: 050-0000000)');
            }

            // Email validation
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim()) {
                isValid = false;
                setFieldError(emailInput, 'נא להזין כתובת אימייל');
            } else if (!emailRegex.test(emailInput.value)) {
                isValid = false;
                setFieldError(emailInput, 'כתובת אימייל לא תקינה');
            }

            if (isValid) {
                // Set _replyto to the user's email so replies go to them
                var replyToField = contactForm.querySelector('input[name="_replyto"]');
                if (replyToField) {
                    replyToField.value = emailInput.value;
                }

                // Disable submit button while sending
                var submitBtn = contactForm.querySelector('button[type="submit"]');
                var originalBtnText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'שולח...';

                // Submit to Formspree via AJAX (no redirect)
                fetch('https://formspree.io/f/mgolndpk', {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' }
                }).then(function() {
                    // Success - show custom message with aria-live for screen readers
                    var formWrapper = document.querySelector('.contact-form-wrapper');
                    formWrapper.innerHTML = '<div class="form-success" role="status" aria-live="polite">' +
                        '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" aria-hidden="true">' +
                        '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>' +
                        '<polyline points="22 4 12 14.01 9 11.01"/>' +
                        '</svg>' +
                        '<h3>הפנייה נשלחה בהצלחה!</h3>' +
                        '<p>תודה שפנית אלינו. נחזור אליך בהקדם האפשרי.</p>' +
                        '</div>';
                }).catch(function(error) {
                    // Error handling
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                    console.error('Form submission error:', error);
                    alert('שגיאה בשליחת הטופס. אנא נסו שוב.');
                });
            }
        });

        // Remove error styling on input
        var inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(function(input) {
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }

    // Intersection Observer for animations (respects prefers-reduced-motion)
    const prefersReducedMotionAnim = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animateElements = document.querySelectorAll('.service-card, .about-feature');

    if (!prefersReducedMotionAnim) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animateElements.forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    // Close dropdown on outside click
    document.addEventListener('click', function(e) {
        var dropdowns = document.querySelectorAll('.nav-dropdown.open');
        dropdowns.forEach(function(dropdown) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
                var toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Back to Top Button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: prefersReducedMotionScroll ? 'auto' : 'smooth' });
        });
    }

    // Hero Particles Network Effect (particles.js style)
    const heroCanvas = document.getElementById('hero-particles');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (heroCanvas && !prefersReducedMotion) {
        const ctx = heroCanvas.getContext('2d');
        const particles = [];
        const particleCount = 65;
        const linkDistance = 140;
        const mouse = { x: null, y: null, radius: 180 };

        function resizeHeroCanvas() {
            const hero = heroCanvas.parentElement;
            heroCanvas.width = hero.offsetWidth;
            heroCanvas.height = hero.offsetHeight;
        }
        resizeHeroCanvas();
        window.addEventListener('resize', resizeHeroCanvas);

        // Track mouse position relative to the hero section
        const heroSection = heroCanvas.closest('.hero');
        heroSection.style.pointerEvents = 'auto';
        heroCanvas.style.pointerEvents = 'none';

        heroSection.addEventListener('mousemove', function(e) {
            const rect = heroSection.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        heroSection.addEventListener('mouseleave', function() {
            mouse.x = null;
            mouse.y = null;
        });

        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * heroCanvas.width;
                this.y = Math.random() * heroCanvas.height;
                // Constant base velocity matching particles.js speed
                this.vx = (Math.random() - 0.5) * 1;
                this.vy = (Math.random() - 0.5) * 1;
                this.radius = Math.random() * 2 + 1;
                this.opacity = Math.random() * 0.5 + 0.3;
            }

            update() {
                // Steady linear movement — no dampening
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges (like particles.js)
                if (this.x < 0) { this.x = 0; this.vx = -this.vx; }
                if (this.x > heroCanvas.width) { this.x = heroCanvas.width; this.vx = -this.vx; }
                if (this.y < 0) { this.y = 0; this.vy = -this.vy; }
                if (this.y > heroCanvas.height) { this.y = heroCanvas.height; this.vy = -this.vy; }
            }

            draw() {
                var rgb = '0, 31, 63';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + rgb + ', ' + this.opacity + ')';
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Draw connecting lines between nearby particles
        function drawLinks() {
            var linkRgb = '0, 31, 63';
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < linkDistance) {
                        const opacity = (1 - dist / linkDistance) * 0.25;
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(' + linkRgb + ', ' + opacity + ')';
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw lines from mouse to nearby particles
            if (mouse.x !== null && mouse.y !== null) {
                for (let i = 0; i < particles.length; i++) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouse.radius) {
                        const opacity = (1 - dist / mouse.radius) * 0.4;
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(13, 148, 136, ' + opacity + ')';
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(particles[i].x, particles[i].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation loop
        function animateHeroParticles() {
            ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

            particles.forEach(function(p) {
                p.update();
                p.draw();
            });

            drawLinks();
            requestAnimationFrame(animateHeroParticles);
        }

        animateHeroParticles();
    }
});

// Add active class styling for hamburger menu
const style = document.createElement('style');
style.textContent = `
    .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
    }
    .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
`;
document.head.appendChild(style);

