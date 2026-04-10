/* ================================================
   EL-HUB VENTURES — Main JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const showSuccessPopup = (title, message) => {
        let popup = document.getElementById('formSuccessPopup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'formSuccessPopup';
            popup.className = 'form-success-popup';
            popup.innerHTML = `
                <div class="form-success-backdrop"></div>
                <div class="form-success-card" role="dialog" aria-live="polite" aria-label="Form submission success">
                    <h3 id="formSuccessTitle"></h3>
                    <p id="formSuccessMessage"></p>
                    <button type="button" id="formSuccessCloseBtn" class="btn btn-primary">Close</button>
                </div>
            `;
            document.body.appendChild(popup);

            const closeBtn = popup.querySelector('#formSuccessCloseBtn');
            const backdrop = popup.querySelector('.form-success-backdrop');
            const closePopup = () => popup.classList.remove('open');
            closeBtn.addEventListener('click', closePopup);
            backdrop.addEventListener('click', closePopup);
        }

        const titleEl = popup.querySelector('#formSuccessTitle');
        const messageEl = popup.querySelector('#formSuccessMessage');
        titleEl.textContent = title;
        messageEl.textContent = message;
        popup.classList.add('open');
    };

    // ---------- Navbar Scroll Effect ----------
    const navbar = document.getElementById('navbar');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ---------- Mobile Menu ----------
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open') ? 'true' : 'false');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // Header submenus
    navLinks.querySelectorAll('.nav-drop-toggle').forEach((toggle) => {
        toggle.addEventListener('click', (e) => {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            if (!isMobile) {
                // Desktop should be hover-only: prevent sticky click-open state.
                e.preventDefault();
                return;
            }

            const parent = toggle.closest('.nav-dropdown');
            const isOpen = parent.classList.contains('open');
            navLinks.querySelectorAll('.nav-dropdown').forEach((item) => {
                item.classList.remove('open');
                const btn = item.querySelector('.nav-drop-toggle');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                parent.classList.add('open');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            navLinks.querySelectorAll('.nav-dropdown').forEach((item) => {
                item.classList.remove('open');
                const btn = item.querySelector('.nav-drop-toggle');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });
            document.body.style.overflow = '';
        }
    });

    // ---------- Smooth Scroll for Anchor Links ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ---------- Scroll Reveal (Intersection Observer) ----------
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const parent = target.parentElement;
                
                // Automatic stagger for grid children
                if (parent && (parent.classList.contains('services-grid') || 
                              parent.classList.contains('portfolio-grid') || 
                              parent.classList.contains('hubs-grid'))) {
                    const index = Array.from(parent.children).indexOf(target);
                    target.style.transitionDelay = `${index * 120}ms`;
                }
                
                // Respect manual data-delay if present
                const delay = target.dataset.delay || 0;
                setTimeout(() => {
                    target.classList.add('visible');
                }, parseInt(delay));
                
                revealObserver.unobserve(target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // ---------- Animated Number Counters ----------
    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const start = performance.now();

        const update = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('[data-target]');
                counters.forEach(counter => animateCounter(counter));
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    // Observe hero stats
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) counterObserver.observe(heroStats);

    // Observe why-us stats
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) counterObserver.observe(statsGrid);

    // ---------- Floating Particles ----------
    const particlesContainer = document.getElementById('heroParticles');
    if (particlesContainer) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (4 + Math.random() * 4) + 's';
            particle.style.width = (2 + Math.random() * 3) + 'px';
            particle.style.height = particle.style.width;
            particle.style.opacity = 0.1 + Math.random() * 0.4;
            particlesContainer.appendChild(particle);
        }
    }

    // ---------- Testimonials Carousel ----------
    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('carouselDots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (track && dotsContainer) {
        const cards = track.querySelectorAll('.testimonial-card');
        let currentIndex = 0;
        let autoPlayInterval;

        // Create dots
        cards.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const updateDots = () => {
            dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        };

        const goToSlide = (index) => {
            currentIndex = index;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots();
            resetAutoPlay();
        };

        prevBtn.addEventListener('click', () => {
            goToSlide(currentIndex === 0 ? cards.length - 1 : currentIndex - 1);
        });

        nextBtn.addEventListener('click', () => {
            goToSlide(currentIndex === cards.length - 1 ? 0 : currentIndex + 1);
        });

        // Auto-play
        const startAutoPlay = () => {
            autoPlayInterval = setInterval(() => {
                goToSlide(currentIndex === cards.length - 1 ? 0 : currentIndex + 1);
            }, 5000);
        };

        const resetAutoPlay = () => {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        };

        startAutoPlay();
    }

    // ---------- Contact Form ----------
    const contactForm = document.getElementById('contactForm');
    // Contact Form Handling
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = 'Sending...';
            
            try {
                // Get form data
                const formData = new FormData(contactForm);
                const data = Object.fromEntries(formData.entries());

                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();

                if (response.ok) {
                    if (window.dataLayer) {
                        window.dataLayer.push({ event: 'lead_form_submit', service: data.service || 'unknown' });
                    }
                    btn.innerHTML = 'Message Sent!';
                    btn.style.background = '#e3c567';
                    btn.style.color = '#000';
                    btn.style.borderColor = '#e3c567';
                    contactForm.reset();
                    showSuccessPopup(
                        'Message sent successfully',
                        'Thank you for reaching out. Our team will contact you shortly.'
                    );
                } else {
                    throw new Error(result.message || 'Error sending message');
                }
            } catch (error) {
                console.error(error);
                btn.innerHTML = 'Failed to Send';
                btn.style.background = '#cf3939';
                btn.style.color = '#fff';
                btn.style.borderColor = '#cf3939';
                showSuccessPopup(
                    'Submission failed',
                    error.message || 'Unable to send right now. Please try again shortly.'
                );
            } finally {
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                }, 3000);
            }
        });
    }

    // Theme Toggle Logic
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    const currentTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', currentTheme);

    if (themeToggle) {
        themeToggle.textContent = currentTheme === 'dark' ? 'Light' : 'Dark';
        themeToggle.addEventListener('click', () => {
            const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.textContent = newTheme === 'dark' ? 'Light' : 'Dark';
        });
    }

    // ---------- Cookie Consent ----------
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookies = document.getElementById('acceptCookies');
    const cookieAccepted = localStorage.getItem('cookieConsentAccepted') === 'yes';

    if (cookieBanner) {
        if (cookieAccepted) {
            cookieBanner.style.display = 'none';
        } else if (acceptCookies) {
            acceptCookies.addEventListener('click', () => {
                localStorage.setItem('cookieConsentAccepted', 'yes');
                cookieBanner.style.display = 'none';
            });
        }
    }

    // Ensure safe rel attrs on external links
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
        if (!link.getAttribute('rel')) {
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // ---------- Protected Document Access ----------
    const encodeAccessCode = (value) => {
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            hash = ((hash << 5) - hash) + value.charCodeAt(i);
            hash |= 0;
        }
        return btoa(String(hash));
    };

    const protectedCodeHash = 'MTUwOTQ0Mg=='; // Hash for "1234"
    document.querySelectorAll('.protected-doc-link').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const providedCode = window.prompt('Enter access code to view partnership document:');
            if (!providedCode) return;

            const isValid = encodeAccessCode(providedCode.trim()) === protectedCodeHash;
            if (!isValid) {
                window.alert('Invalid code. Access denied.');
                return;
            }

            const docUrl = link.dataset.docUrl;
            if (!docUrl) return;
            window.open(docUrl, '_blank', 'noopener,noreferrer');
        });
    });

    // ---------- Certificate Modal ----------
    const certificateModal = document.getElementById('certificateModal');
    const certificateModalClose = document.getElementById('certificateModalClose');
    const certificateModalBackdrop = document.getElementById('certificateModalBackdrop');
    const certificateOpenButtons = document.querySelectorAll('.open-certificate-btn');

    const openCertificateModal = () => {
        if (!certificateModal) return;
        certificateModal.classList.add('open');
        certificateModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeCertificateModal = () => {
        if (!certificateModal) return;
        certificateModal.classList.remove('open');
        certificateModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    certificateOpenButtons.forEach((btn) => {
        btn.addEventListener('click', openCertificateModal);
    });

    if (certificateModalClose) {
        certificateModalClose.addEventListener('click', closeCertificateModal);
    }

    if (certificateModalBackdrop) {
        certificateModalBackdrop.addEventListener('click', closeCertificateModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && certificateModal && certificateModal.classList.contains('open')) {
            closeCertificateModal();
        }
    });

    // ---------- Sticky CTA Visibility ----------
    const stickyCta = document.querySelector('.sticky-cta');
    if (stickyCta) {
        const handleStickyCta = () => {
            stickyCta.style.opacity = window.scrollY > 500 ? '1' : '0';
            stickyCta.style.pointerEvents = window.scrollY > 500 ? 'auto' : 'none';
        };

        handleStickyCta();
        window.addEventListener('scroll', handleStickyCta, { passive: true });
    }

    // ---------- Active Nav Highlighting ----------
    const sections = document.querySelectorAll('.section');
    const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');

    const updateActiveNav = () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navAnchors.forEach(anchor => {
            anchor.style.color = '';
            if (anchor.getAttribute('href') === `#${current}`) {
                anchor.style.color = 'var(--accent-primary)';
            }
        });
    };

    window.addEventListener('scroll', updateActiveNav, { passive: true });
});
