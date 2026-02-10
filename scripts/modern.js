/**
 * ============================================================================
 * MODERN PORTFOLIO - JAVASCRIPT
 * ============================================================================
 * 
 * Professional JavaScript with:
 * - Module Pattern (IIFE)
 * - Theme Toggle
 * - Smooth Interactions
 * - Performance Optimizations
 * - Error Handling
 * 
 * @author Endryw Lucas Nobre
 * @version 4.0.0
 * ============================================================================
 */

'use strict';

/**
 * Modern Portfolio Application
 */
const ModernPortfolio = (() => {
    // ========================================================================
    // CONFIGURATION
    // ========================================================================
    
    const CONFIG = {
        themeStorageKey: 'portfolio-theme',
        animationDuration: 300,
        enableAnalytics: false,
    };

    // ========================================================================
    // STATE
    // ========================================================================
    
    const state = {
        currentTheme: 'light',
        observers: new Map(),
    };

    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================
    
    /**
     * Debounce function
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
     * Get stored theme preference
     */
    const getStoredTheme = () => {
        try {
            return localStorage.getItem(CONFIG.themeStorageKey) || 'light';
        } catch (e) {
            console.warn('localStorage not available:', e);
            return 'light';
        }
    };

    /**
     * Store theme preference
     */
    const storeTheme = (theme) => {
        try {
            localStorage.setItem(CONFIG.themeStorageKey, theme);
        } catch (e) {
            console.warn('Could not store theme:', e);
        }
    };

    // ========================================================================
    // THEME MANAGEMENT
    // ========================================================================
    
    /**
     * Initialize theme
     */
    const initTheme = () => {
        const storedTheme = getStoredTheme();
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        state.currentTheme = storedTheme === 'dark' || (storedTheme === 'auto' && prefersDark) 
            ? 'dark' 
            : 'light';
        
        applyTheme(state.currentTheme);
    };

    /**
     * Apply theme to document
     */
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        state.currentTheme = theme;
        
        // Update theme toggle icon if needed
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            updateThemeIcon(themeToggle, theme);
        }
    };

    /**
     * Update theme toggle icon
     */
    const updateThemeIcon = (button, theme) => {
        const icon = button.querySelector('.icon-sun');
        if (icon && theme === 'dark') {
            // Could swap to moon icon here
            icon.style.transform = 'rotate(180deg)';
        } else if (icon) {
            icon.style.transform = 'rotate(0deg)';
        }
    };

    /**
     * Toggle theme
     */
    const toggleTheme = () => {
        const newTheme = state.currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        storeTheme(newTheme);
    };

    /**
     * Initialize theme toggle button
     */
    const initThemeToggle = () => {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    };

    // ========================================================================
    // ANIMATIONS
    // ========================================================================
    
    /**
     * Initialize Intersection Observer for animations
     */
    const initIntersectionObserver = () => {
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
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        // Observe cards and sections
        const elementsToObserve = document.querySelectorAll('.card, .hero-section, .profile-photo');
        elementsToObserve.forEach(element => {
            observer.observe(element);
        });

        state.observers.set('fadeIn', observer);
    };

    // ========================================================================
    // SMOOTH SCROLL
    // ========================================================================
    
    /**
     * Initialize smooth scroll for anchor links
     */
    const initSmoothScroll = () => {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#') return;
                
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                    
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                }
            });
        });
    };

    // ========================================================================
    // EXTERNAL LINKS
    // ========================================================================
    
    /**
     * Ensure external links have proper attributes
     */
    const initExternalLinks = () => {
        const externalLinks = document.querySelectorAll('a[target="_blank"]');
        
        externalLinks.forEach(link => {
            if (!link.hasAttribute('rel')) {
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    };

    // ========================================================================
    // KEYBOARD NAVIGATION
    // ========================================================================
    
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

    // ========================================================================
    // CURRENT YEAR
    // ========================================================================
    
    /**
     * Update current year in footer
     */
    const updateCurrentYear = () => {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    };

    // ========================================================================
    // IMAGE ERROR HANDLING
    // ========================================================================
    
    /**
     * Handle image loading errors
     */
    const initImageErrorHandling = () => {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            if (!img.hasAttribute('onerror')) {
                img.addEventListener('error', function() {
                    this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22%3E%3Crect fill=%22%23e5e7eb%22 width=%2240%22 height=%2240%22/%3E%3C/svg%3E';
                });
            }
        });
    };

    // ========================================================================
    // PERFORMANCE MONITORING
    // ========================================================================
    
    /**
     * Log performance metrics (optional)
     */
    const logPerformanceMetrics = () => {
        if (!window.performance || !CONFIG.enableAnalytics) return;

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

    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    
    /**
     * Global error handler
     */
    const handleError = (error, context = 'Unknown') => {
        console.error(`Error in ${context}:`, error);
        
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
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
                return;
            }

            console.log('🚀 Initializing Modern Portfolio...');

            // Core features
            initTheme();
            initThemeToggle();
            updateCurrentYear();
            initSmoothScroll();
            initIntersectionObserver();
            initKeyboardNavigation();
            initExternalLinks();
            initImageErrorHandling();
            
            // Optional features
            if (CONFIG.enableAnalytics) {
                logPerformanceMetrics();
            }

            console.log('✅ Modern Portfolio initialized successfully');

        } catch (error) {
            handleError(error, 'Initialization');
        }
    };

    /**
     * Cleanup function
     */
    const destroy = () => {
        state.observers.forEach(observer => observer.disconnect());
        state.observers.clear();
        console.log('🧹 Modern Portfolio cleaned up');
    };

    // ========================================================================
    // PUBLIC API
    // ========================================================================
    
    return {
        init,
        destroy,
        toggleTheme,
        config: CONFIG,
        state: state,
    };
})();

// ============================================================================
// AUTO-INITIALIZE
// ============================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ModernPortfolio.init());
} else {
    ModernPortfolio.init();
}

// ============================================================================
// GLOBAL ERROR HANDLERS
// ============================================================================

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// ============================================================================
// EXPORT
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernPortfolio;
}
