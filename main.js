/* ================================================
   EL-HUB VENTURES — Main JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

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
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
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
                    btn.innerHTML = 'Message Sent!';
                    btn.style.background = '#e3c567';
                    btn.style.color = '#000';
                    btn.style.borderColor = '#e3c567';
                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Error sending message');
                }
            } catch (error) {
                console.error(error);
                btn.innerHTML = 'Failed to Send';
                btn.style.background = '#cf3939';
                btn.style.color = '#fff';
                btn.style.borderColor = '#cf3939';
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
        themeToggle.addEventListener('click', () => {
            const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
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
