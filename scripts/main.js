/**
 * ============================================================================
 * PORTFOLIO - MAIN JAVASCRIPT
 * ============================================================================
 * 
 * Arquitetura JavaScript Profissional
 * - Padrão Module Pattern
 * - Performance Optimizations
 * - Progressive Enhancement
 * - Acessibilidade
 * - Error Handling
 * 
 * @author Endryw Lucas Nobre
 * @version 2.0.0
 * ============================================================================
 */

'use strict';

/**
 * Main Portfolio Application
 * Encapsulated using IIFE (Immediately Invoked Function Expression)
 */
const PortfolioApp = (() => {
    // ========================================================================
    // CONFIGURATION
    // ========================================================================

    const CONFIG = {
        scrollThreshold: 400,
        parallaxFactor: 0.3,
        debounceDelay: 16, // ~60fps
        animationDuration: 300,
        enableAnalytics: false,
        enableParallax: true,
    };

    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================

    const state = {
        isScrolling: false,
        lastScrollPosition: 0,
        rafId: null,
        observers: new Map(),
    };

    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================

    /**
     * Debounce function to limit execution rate
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    /**
     * Throttle function using requestAnimationFrame
     * @param {Function} callback - Function to throttle
     * @returns {Function} Throttled function
     */
    const throttleRAF = (callback) => {
        let ticking = false;
        return function (...args) {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    callback.apply(this, args);
                    ticking = false;
                });
                ticking = true;
            }
        };
    };

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} True if element is in viewport
     */
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    /**
     * Smooth scroll to element
     * @param {HTMLElement} target - Target element
     * @param {number} offset - Offset from top
     */
    const smoothScrollTo = (target, offset = 0) => {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    };

    // ========================================================================
    // CORE FEATURES
    // ========================================================================

    /**
     * Initialize smooth scroll for anchor links
     */
    const initSmoothScroll = () => {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');

        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');

                // Skip if href is just "#"
                if (href === '#') return;

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();
                    smoothScrollTo(target, 20);

                    // Update URL without jumping
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }

                    // Set focus for accessibility
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                }
            });
        });
    };

    /**
     * Initialize parallax effect on header
     */
    const initParallaxEffect = () => {
        if (!CONFIG.enableParallax) return;

        const header = document.querySelector('header');
        if (!header) return;

        const handleScroll = throttleRAF(() => {
            const scrolled = window.pageYOffset;
            const opacity = Math.max(0, 1 - scrolled / CONFIG.scrollThreshold);
            const translateY = scrolled * CONFIG.parallaxFactor;

            // Use transform for better performance
            header.style.transform = `translate3d(0, ${translateY}px, 0)`;
            header.style.opacity = opacity;
        });

        window.addEventListener('scroll', handleScroll, { passive: true });
    };

    /**
     * Initialize Intersection Observer for fade-in animations
     */
    const initIntersectionObserver = () => {
        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported');
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optionally unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe sections and cards
        const elementsToObserve = document.querySelectorAll('.section, .project-card, .work-item');
        elementsToObserve.forEach(element => {
            observer.observe(element);
        });

        state.observers.set('fadeIn', observer);
    };

    /**
     * Update current year in footer
     */
    const updateCurrentYear = () => {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    };

    /**
     * Initialize keyboard navigation enhancements
     */
    const initKeyboardNavigation = () => {
        // Add keyboard shortcut to scroll to top (Alt + T)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });

        // Improve focus visibility for keyboard users
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    };

    /**
     * Initialize external link handling
     */
    const initExternalLinks = () => {
        const externalLinks = document.querySelectorAll('a[target="_blank"]');

        externalLinks.forEach(link => {
            // Ensure security attributes
            if (!link.hasAttribute('rel')) {
                link.setAttribute('rel', 'noopener noreferrer');
            }

            // Add visual indicator if not present
            if (!link.querySelector('.external-link-icon')) {
                // Icon already in HTML, just ensure it's there
            }
        });
    };

    /**
     * Initialize performance monitoring (optional)
     */
    const initPerformanceMonitoring = () => {
        if (!window.performance || !CONFIG.enableAnalytics) return;

        // Log performance metrics
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const connectTime = perfData.responseEnd - perfData.requestStart;
                const renderTime = perfData.domComplete - perfData.domLoading;

                console.group('⚡ Performance Metrics');
                console.log(`Page Load Time: ${pageLoadTime}ms`);
                console.log(`Connect Time: ${connectTime}ms`);
                console.log(`Render Time: ${renderTime}ms`);
                console.groupEnd();
            }, 0);
        });
    };

    /**
     * Initialize lazy loading for images (if any added in future)
     */
    const initLazyLoading = () => {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                img.src = img.dataset.src || img.src;
            });
        } else {
            // Fallback to Intersection Observer
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    };

    /**
     * Initialize theme toggle (optional - ready for dark mode)
     */
    const initThemeToggle = () => {
        // Check for saved theme preference or default to light mode
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);

        // Theme toggle button (if added to HTML)
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const theme = document.documentElement.getAttribute('data-theme');
                const newTheme = theme === 'light' ? 'dark' : 'light';

                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
    };

    /**
     * Error boundary for graceful degradation
     */
    const handleError = (error, context = 'Unknown') => {
        console.error(`Error in ${context}:`, error);

        // Optional: Send to analytics/monitoring service
        if (CONFIG.enableAnalytics && window.gtag) {
            window.gtag('event', 'exception', {
                description: error.message,
                fatal: false
            });
        }
    };

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize all features
     */
    const init = () => {
        try {
            // Check if DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
                return;
            }

            console.log('🚀 Initializing Portfolio App...');

            // Core features
            updateCurrentYear();
            initSmoothScroll();
            initParallaxEffect();
            initIntersectionObserver();
            initKeyboardNavigation();
            initExternalLinks();
            initLazyLoading();
            initThemeToggle();

            // Optional features
            if (CONFIG.enableAnalytics) {
                initPerformanceMonitoring();
            }

            console.log('✅ Portfolio App initialized successfully');

        } catch (error) {
            handleError(error, 'Initialization');
        }
    };

    /**
     * Cleanup function for SPA navigation (if needed)
     */
    const destroy = () => {
        // Clear all observers
        state.observers.forEach(observer => observer.disconnect());
        state.observers.clear();

        // Cancel any pending animation frames
        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
        }

        console.log('🧹 Portfolio App cleaned up');
    };

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    return {
        init,
        destroy,
        config: CONFIG,
        state: state,
    };
})();

// ============================================================================
// AUTO-INITIALIZE
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PortfolioApp.init());
} else {
    PortfolioApp.init();
}

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Prevent default error handling
    // event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Prevent default error handling
    // event.preventDefault();
});

// ============================================================================
// EXPORT FOR MODULE SYSTEMS (if needed)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioApp;
}

// ============================================================================
// END OF SCRIPT
// ============================================================================
