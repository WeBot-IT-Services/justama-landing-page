// Enhanced JavaScript for Jutasama Import and Export Landing Page

// Enhanced DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize all components
        initSmoothScrolling();
        initNavbarEffects();
        initFormHandling();
        initAnimations();
        initCarouselEnhancements();
        initContactTracking();
        initScrollIndicator();
        initModernEffects();

        // Check for any missing elements
        checkForMissingElements();

        // Initialize image error handling
        initImageErrorHandling();

        // Initialize responsive debugging
        initResponsiveDebugging();

        // Immediate content visibility check
        checkContentVisibility();

        // Test animation performance
        setTimeout(testAnimationPerformance, 500);

        // Run final comprehensive check
        setTimeout(runComprehensiveCheck, 1000);

        console.log('Jutasama landing page initialized successfully');
    } catch (error) {
        console.error('Error initializing landing page:', error);
    }
});

// Check for missing elements that should be present
function checkForMissingElements() {
    const requiredElements = [
        { selector: '.modern-navbar', name: 'Navigation bar' },
        { selector: '#modernProductCarousel', name: 'Product carousel' },
        { selector: '#contactForm', name: 'Contact form' },
        { selector: '.modern-hero-section', name: 'Hero section' },
        { selector: '.floating-card', name: 'Floating cards' }
    ];

    requiredElements.forEach(element => {
        const el = document.querySelector(element.selector);
        if (!el) {
            console.warn(`Missing element: ${element.name} (${element.selector})`);
        } else {
            console.log(`✓ Found: ${element.name}`);
        }
    });
}

// Image error handling
function initImageErrorHandling() {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        // Skip if already has error handler
        if (img.hasAttribute('data-error-handled')) return;

        img.setAttribute('data-error-handled', 'true');

        // Add loading state
        img.addEventListener('loadstart', function() {
            this.style.opacity = '0.5';
        });

        // Handle successful load
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });

        // Handle error - only if no onerror already defined
        if (!img.hasAttribute('onerror')) {
            img.addEventListener('error', function() {
                console.warn(`Failed to load image: ${this.src}`);

                // Try to find a fallback image
                const fallbacks = [
                    'assets/images/placeholder.jpg',
                    'assets/images/logo.jpeg',
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
                ];

                // Try fallback images
                let fallbackIndex = 0;
                const tryFallback = () => {
                    if (fallbackIndex < fallbacks.length) {
                        this.src = fallbacks[fallbackIndex];
                        fallbackIndex++;
                    } else {
                        // All fallbacks failed, hide image
                        this.style.display = 'none';
                        console.error(`All fallbacks failed for image: ${this.getAttribute('data-original-src') || 'unknown'}`);
                    }
                };

                // Store original src
                if (!this.hasAttribute('data-original-src')) {
                    this.setAttribute('data-original-src', this.src);
                }

                // Remove this error handler to prevent infinite loop
                this.removeEventListener('error', arguments.callee);

                // Add new error handler for fallback
                this.addEventListener('error', tryFallback);

                // Try first fallback
                tryFallback();
            });
        }
    });
}

// Immediate content visibility check
function checkContentVisibility() {
    console.log('🔍 Checking content visibility...');

    const criticalElements = document.querySelectorAll('.modern-service-card, .modern-product-card, .modern-trust-item, .trust-feature-card, .testimonial-card');
    let hiddenElements = 0;

    criticalElements.forEach((el, index) => {
        const computedStyle = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        const isHidden = (
            computedStyle.opacity === '0' ||
            computedStyle.visibility === 'hidden' ||
            computedStyle.display === 'none' ||
            rect.height === 0 ||
            rect.width === 0
        );

        if (isHidden) {
            hiddenElements++;
            console.warn(`Hidden element detected:`, el, {
                opacity: computedStyle.opacity,
                visibility: computedStyle.visibility,
                display: computedStyle.display,
                dimensions: `${rect.width}x${rect.height}`,
                classes: el.className
            });

            // Force show if it's hidden due to fade-in
            if (el.classList.contains('fade-in')) {
                console.log('Forcing visibility for fade-in element:', el);
                el.classList.add('fade-in-visible', 'visible');
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        }
    });

    if (hiddenElements === 0) {
        console.log('✅ All critical content is visible');
    } else {
        console.warn(`⚠️ Found ${hiddenElements} hidden elements out of ${criticalElements.length}`);
    }

    return hiddenElements === 0;
}

// Test animation performance and timing
function testAnimationPerformance() {
    console.log('🎭 Testing animation performance...');

    const animatedElements = document.querySelectorAll('.fade-in');
    const performanceData = {
        totalElements: animatedElements.length,
        visibleElements: 0,
        animatedElements: 0,
        fallbackElements: 0,
        immediateElements: 0
    };

    animatedElements.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        const isVisible = computedStyle.opacity !== '0';
        const animationStatus = el.getAttribute('data-animated');

        if (isVisible) performanceData.visibleElements++;

        switch (animationStatus) {
            case 'true':
                performanceData.animatedElements++;
                break;
            case 'fallback':
                performanceData.fallbackElements++;
                break;
            case 'immediate':
                performanceData.immediateElements++;
                break;
        }
    });

    console.log('Animation Performance Report:', performanceData);

    // Check for performance issues
    const visibilityRatio = performanceData.visibleElements / performanceData.totalElements;
    if (visibilityRatio < 1) {
        console.warn(`⚠️ Animation performance issue: Only ${Math.round(visibilityRatio * 100)}% of elements are visible`);

        // Force show remaining hidden elements
        animatedElements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.opacity === '0') {
                console.log('Force-showing hidden element:', el);
                el.classList.add('fade-in-visible', 'visible');
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.setAttribute('data-animated', 'forced');
            }
        });
    } else {
        console.log('✅ All animated elements are visible');
    }

    return performanceData;
}

// Responsive debugging
function initResponsiveDebugging() {
    // Check for common responsive issues
    const checkResponsiveIssues = () => {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // Check for horizontal overflow
        const body = document.body;
        const html = document.documentElement;
        const documentWidth = Math.max(
            body.scrollWidth, body.offsetWidth,
            html.clientWidth, html.scrollWidth, html.offsetWidth
        );

        if (documentWidth > viewport.width) {
            console.warn(`Horizontal overflow detected: Document width (${documentWidth}px) > Viewport width (${viewport.width}px)`);

            // Find elements causing overflow
            const elements = document.querySelectorAll('*');
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.right > viewport.width) {
                    console.warn('Element causing overflow:', el, `Right edge: ${rect.right}px`);
                }
            });
        }

        // Check carousel visibility
        const carousel = document.getElementById('modernProductCarousel');
        if (carousel) {
            const carouselRect = carousel.getBoundingClientRect();
            const carouselVisible = carouselRect.height > 0 && carouselRect.width > 0;
            console.log(`Carousel visibility: ${carouselVisible ? 'Visible' : 'Hidden'} (${carouselRect.width}x${carouselRect.height})`);

            if (!carouselVisible) {
                console.warn('Carousel is not visible - checking for CSS issues');
                const computedStyle = window.getComputedStyle(carousel);
                console.log('Carousel computed styles:', {
                    display: computedStyle.display,
                    visibility: computedStyle.visibility,
                    opacity: computedStyle.opacity,
                    height: computedStyle.height,
                    overflow: computedStyle.overflow
                });
            }
        }
    };

    // Check on load and resize
    checkResponsiveIssues();
    window.addEventListener('resize', debounce(checkResponsiveIssues, 250));
}

// Comprehensive check function
function runComprehensiveCheck() {
    console.log('🔍 Running comprehensive display check...');

    const checks = [
        {
            name: 'Navigation Menu',
            test: () => {
                const navbar = document.querySelector('.modern-navbar');
                const navLinks = document.querySelectorAll('.modern-nav-link');
                return navbar && navLinks.length > 0;
            }
        },
        {
            name: 'Hero Section',
            test: () => {
                const hero = document.querySelector('.modern-hero-section');
                const heroImage = document.querySelector('.hero-main-image img');
                return hero && heroImage;
            }
        },
        {
            name: 'Product Carousel',
            test: () => {
                const carousel = document.getElementById('modernProductCarousel');
                const carouselItems = document.querySelectorAll('.carousel-item');
                const indicators = document.querySelectorAll('.modern-indicators button');
                const controls = document.querySelectorAll('.modern-carousel-control');

                if (!carousel) return false;

                const rect = carousel.getBoundingClientRect();
                const isVisible = rect.height > 0 && rect.width > 0;

                console.log(`Carousel details:`, {
                    element: !!carousel,
                    items: carouselItems.length,
                    indicators: indicators.length,
                    controls: controls.length,
                    visible: isVisible,
                    dimensions: `${rect.width}x${rect.height}`
                });

                return carousel && carouselItems.length > 0 && isVisible;
            }
        },
        {
            name: 'Contact Form',
            test: () => {
                const form = document.getElementById('contactForm');
                const inputs = form ? form.querySelectorAll('input, select, textarea') : [];
                return form && inputs.length > 0;
            }
        },
        {
            name: 'Floating Cards',
            test: () => {
                const cards = document.querySelectorAll('.floating-card');
                return cards.length > 0;
            }
        },
        {
            name: 'Bootstrap Components',
            test: () => {
                return typeof bootstrap !== 'undefined';
            }
        },
        {
            name: 'Responsive Images',
            test: () => {
                const images = document.querySelectorAll('img');
                let loadedImages = 0;
                images.forEach(img => {
                    if (img.complete && img.naturalHeight !== 0) {
                        loadedImages++;
                    }
                });
                console.log(`Images: ${loadedImages}/${images.length} loaded successfully`);
                return loadedImages > 0;
            }
        },
        {
            name: 'Content Visibility',
            test: () => {
                const criticalElements = document.querySelectorAll('.modern-service-card, .modern-product-card, .modern-trust-item, .trust-feature-card, .testimonial-card');
                let visibleElements = 0;
                let animatedElements = 0;

                criticalElements.forEach(el => {
                    const computedStyle = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();

                    const isVisible = (
                        computedStyle.opacity !== '0' &&
                        computedStyle.visibility !== 'hidden' &&
                        computedStyle.display !== 'none' &&
                        rect.height > 0 &&
                        rect.width > 0
                    );

                    if (isVisible) visibleElements++;
                    if (el.hasAttribute('data-animated')) animatedElements++;
                });

                console.log(`Content visibility: ${visibleElements}/${criticalElements.length} visible, ${animatedElements} animated`);
                return visibleElements === criticalElements.length;
            }
        }
    ];

    let passedChecks = 0;
    checks.forEach(check => {
        const result = check.test();
        const status = result ? '✅' : '❌';
        console.log(`${status} ${check.name}: ${result ? 'PASS' : 'FAIL'}`);
        if (result) passedChecks++;
    });

    console.log(`\n📊 Overall Status: ${passedChecks}/${checks.length} checks passed`);

    if (passedChecks === checks.length) {
        console.log('🎉 All components are displaying correctly!');
    } else {
        console.warn('⚠️ Some components may have display issues. Check the details above.');
    }
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerOffset = 100;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update active nav link
                updateActiveNavLink(targetId);
            }
        });
    });
}

// Enhanced navbar effects
function initNavbarEffects() {
    const navbar = document.querySelector('.modern-navbar');
    const navLinks = document.querySelectorAll('.modern-nav-link');

    // Scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active section
        updateActiveSection();
    });

    // Mobile menu toggle enhancement
    const navbarToggler = document.querySelector('.modern-toggler');
    const navbarCollapse = document.querySelector('#navbarNav');

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navbar.contains(e.target) && navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                    toggle: false
                });
                bsCollapse.hide();
            }
        });
    }
}

// Update active navigation link
function updateActiveNavLink(targetId) {
    const navLinks = document.querySelectorAll('.modern-nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
}

// Update active section based on scroll position
function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.modern-nav-link');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionHeight = section.offsetHeight;

        if (sectionTop <= 150 && sectionTop + sectionHeight > 150) {
            currentSection = '#' + section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentSection) {
            link.classList.add('active');
        }
    });
}

// Enhanced form handling
function initFormHandling() {
    const contactForm = document.getElementById('contactForm');

    // Handle contact form
    if (contactForm) {
        setupFormValidation(contactForm, 'Contact Form');
    }
}

// Setup form validation and submission for any form
function setupFormValidation(form, formType) {
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            showAlert('Please correct the errors in the form.', 'error');
            return;
        }

        // Get form data
        const formData = new FormData(this);
        const formObject = {};

        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        // Show loading state
        const submitBtn = this.querySelector('.modern-submit-btn');
        showLoadingState(submitBtn, true);

        // Success message for contact form
        const successMessage = 'Thank you for your inquiry! We will contact you within 24 hours.';

        // Simulate form submission (replace with actual Firebase/backend integration)
        setTimeout(() => {
            showAlert(successMessage, 'success');
            form.reset();
            showLoadingState(submitBtn, false);

            // Track form submission
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    event_category: 'Contact',
                    event_label: formType
                });
            }
        }, 2000);
    });
}

// Field validation
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
    }

    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
    }

    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number.';
        }
    }

    // Update field state
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
    }

    // Update error message
    const feedback = field.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = errorMessage;
    }

    return isValid;
}

// Loading state for buttons
function showLoadingState(button, isLoading) {
    const spinner = button.querySelector('.btn-loading-spinner');
    const icon = button.querySelector('i:not(.btn-loading-spinner i)');

    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        if (spinner) spinner.style.display = 'block';
        if (icon) icon.style.opacity = '0';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        if (spinner) spinner.style.display = 'none';
        if (icon) icon.style.opacity = '1';
    }
}

// Enhanced alert system
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.modern-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create alert element
    const alert = document.createElement('div');
    alert.className = `modern-alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <div class="alert-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            </div>
            <div class="alert-message">
                <div class="alert-title">${type === 'success' ? 'Success!' : 'Error!'}</div>
                <div class="alert-text">${message}</div>
            </div>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add styles
    const alertStyles = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
        color: white;
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 400px;
        backdrop-filter: blur(10px);
    `;

    alert.style.cssText = alertStyles;

    // Add alert content styles
    const style = document.createElement('style');
    style.textContent = `
        .modern-alert .alert-content {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
        }
        .modern-alert .alert-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        .modern-alert .alert-message {
            flex: 1;
        }
        .modern-alert .alert-title {
            font-weight: 600;
            font-size: 1.1rem;
            margin-bottom: 0.25rem;
        }
        .modern-alert .alert-text {
            font-size: 0.95rem;
            opacity: 0.9;
        }
        .modern-alert .alert-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            opacity: 0.7;
            transition: opacity 0.2s ease;
        }
        .modern-alert .alert-close:hover {
            opacity: 1;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(alert);

    // Animate in
    setTimeout(() => {
        alert.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 6 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.style.transform = 'translateX(100%)';
            setTimeout(() => {
                alert.remove();
                style.remove();
            }, 300);
        }
    }, 6000);
}

// Enhanced animations with fallback protection
function initAnimations() {
    try {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        // Check if IntersectionObserver is supported
        if (!window.IntersectionObserver) {
            console.warn('IntersectionObserver not supported, showing all content immediately');
            showAllContent();
            return;
        }

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Use both class names for compatibility
                    entry.target.classList.add('fade-in-visible', 'visible');
                    entry.target.setAttribute('data-animated', 'true');

                    // Add staggered animation for child elements
                    const children = entry.target.querySelectorAll('.animate-child');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('fade-in-visible', 'visible');
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);

        // Get elements for animation
        const animateElements = document.querySelectorAll('.modern-service-card, .modern-product-card, .modern-trust-item, .trust-feature-card, .testimonial-card');

        if (animateElements.length === 0) {
            console.warn('No elements found for animation');
            return;
        }

        // Apply fade-in class and observe elements
        animateElements.forEach((el, index) => {
            el.classList.add('fade-in');
            el.setAttribute('data-animation-index', index);
            observer.observe(el);
        });

        // Fallback: Show all content after 5 seconds if animations haven't triggered
        setTimeout(() => {
            animateElements.forEach(el => {
                if (!el.hasAttribute('data-animated')) {
                    console.warn('Animation fallback triggered for element:', el);
                    el.classList.add('fade-in-visible', 'visible');
                    el.setAttribute('data-animated', 'fallback');
                }
            });
        }, 5000);

        console.log(`Initialized animations for ${animateElements.length} elements`);

    } catch (error) {
        console.error('Animation initialization failed:', error);
        showAllContent();
    }
}

// Fallback function to show all content immediately
function showAllContent() {
    const animateElements = document.querySelectorAll('.modern-service-card, .modern-product-card, .modern-trust-item, .trust-feature-card, .testimonial-card');
    animateElements.forEach(el => {
        el.classList.remove('fade-in');
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.setAttribute('data-animated', 'immediate');
    });
    console.log('All content shown immediately (fallback mode)');
}

// Carousel enhancements
function initCarouselEnhancements() {
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach(carousel => {
        // Ensure Bootstrap carousel is initialized
        if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
            const bsCarousel = bootstrap.Carousel.getInstance(carousel) || new bootstrap.Carousel(carousel, {
                interval: 5000,
                wrap: true,
                keyboard: true
            });
        }

        // Add touch/swipe support
        let startX = 0;
        let endX = 0;

        carousel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });

        carousel.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].clientX;
            handleSwipe(carousel);
        });

        function handleSwipe(carouselElement) {
            const threshold = 50;
            const diff = startX - endX;

            if (Math.abs(diff) > threshold) {
                const bsCarousel = bootstrap.Carousel.getInstance(carouselElement) || new bootstrap.Carousel(carouselElement);

                if (diff > 0) {
                    bsCarousel.next();
                } else {
                    bsCarousel.prev();
                }
            }
        }

        // Pause on hover
        carousel.addEventListener('mouseenter', function() {
            const bsCarousel = bootstrap.Carousel.getInstance(this);
            if (bsCarousel) bsCarousel.pause();
        });

        carousel.addEventListener('mouseleave', function() {
            const bsCarousel = bootstrap.Carousel.getInstance(this);
            if (bsCarousel) bsCarousel.cycle();
        });
    });

    // Specific fix for product carousel
    const productCarousel = document.getElementById('modernProductCarousel');
    if (productCarousel) {
        // Force initialization if not already done
        setTimeout(() => {
            if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
                const instance = bootstrap.Carousel.getInstance(productCarousel);
                if (!instance) {
                    new bootstrap.Carousel(productCarousel, {
                        interval: 5000,
                        wrap: true,
                        keyboard: true
                    });
                }
            }
        }, 100);
    }
}

// Contact tracking
function initContactTracking() {
    // WhatsApp tracking
    const whatsappButtons = document.querySelectorAll('a[href*="wa.me"]');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            trackEvent('whatsapp_click', 'Contact', 'WhatsApp Button');
        });
    });

    // Phone tracking
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            trackEvent('phone_click', 'Contact', 'Phone Number');
        });
    });

    // Email tracking
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            trackEvent('email_click', 'Contact', 'Email Address');
        });
    });
}

// Scroll indicator
function initScrollIndicator() {
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #1e40af 0%, #f59e0b 100%);
        z-index: 9999;
        transition: width 0.1s ease;
    `;

    document.body.appendChild(scrollIndicator);

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        scrollIndicator.style.width = scrollPercent + '%';
    });
}

// Modern effects
function initModernEffects() {
    // Parallax effect for hero section
    const heroSection = document.querySelector('.modern-hero-section');
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            const heroBackground = heroSection.querySelector('.hero-background');
            if (heroBackground) {
                heroBackground.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    // Floating animation for cards
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.5}s`;
    });

    // Interactive hover effects
    const interactiveElements = document.querySelectorAll('.modern-service-card, .modern-product-card, .trust-feature-card');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Analytics tracking
function trackEvent(eventName, eventCategory = 'General', eventLabel = '') {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: eventCategory,
            event_label: eventLabel
        });
    }

    // Console log for debugging
    console.log(`Event tracked: ${eventName} | ${eventCategory} | ${eventLabel}`);
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // You can send error reports to your analytics service here
});

// Service worker registration (optional PWA support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}


