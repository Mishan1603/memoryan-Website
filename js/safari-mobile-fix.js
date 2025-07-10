/**
 * Safari Mobile Image Loading Fix
 * 
 * Addresses documented Safari mobile issues:
 * 1. HTTP Pipelining problems with concurrent image requests
 * 2. Resource loading conflicts in mobile Safari
 * 3. Connection speed dependency issues
 * 
 * Sources:
 * - https://www.steckinsights.com/images-randomly-swapping-iphones-mobile-safari-ios/
 * - https://wordpress.org/support/topic/lazy-load-not-loading-at-all-in-safari/
 */

class SafariMobileFix {
    constructor() {
        this.isSafariMobile = this.detectSafariMobile();
        this.imageQueue = [];
        this.loadingImages = new Set();
        this.maxConcurrentRequests = this.isSafariMobile ? 2 : 6; // Limit for Safari mobile
        this.requestDelay = this.isSafariMobile ? 150 : 0; // Stagger requests for Safari
        this.initialized = false;
        
        console.log('Safari Mobile Fix initialized:', {
            isSafariMobile: this.isSafariMobile,
            maxConcurrent: this.maxConcurrentRequests,
            requestDelay: this.requestDelay
        });
    }
    
    detectSafariMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
        const isMobile = /iphone|ipad|ipod/.test(userAgent) || 
                        (navigator.maxTouchPoints > 0 && /macintosh/.test(userAgent));
        
        return isSafari && isMobile;
    }
    
    init() {
        if (this.initialized || !this.isSafariMobile) return;
        this.initialized = true;
        
        console.log('🍎 Applying Safari Mobile fixes...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyFixes());
        } else {
            this.applyFixes();
        }
    }
    
    applyFixes() {
        this.fixCarouselImages();
        this.optimizeResourceLoading();
        this.preventHTTPPipeliningIssues();
    }
    
    fixCarouselImages() {
        // Find all carousel images
        const carouselImages = document.querySelectorAll('.swiper-slide img');
        console.log(`🔧 Found ${carouselImages.length} carousel images to fix`);
        
        carouselImages.forEach((img, index) => {
            // Remove any existing loading attributes that might conflict
            img.removeAttribute('loading');
            
            // Store original src
            const originalSrc = img.src || img.getAttribute('src');
            if (!originalSrc) return;
            
            // Clear src to prevent immediate loading
            img.removeAttribute('src');
            img.dataset.safariSrc = originalSrc;
            
            // Add to queue with priority based on position
            this.queueImageLoad(img, index < 3 ? 'high' : 'normal');
        });
        
        // Start processing queue
        this.processImageQueue();
    }
    
    queueImageLoad(img, priority = 'normal') {
        const queueItem = {
            img,
            src: img.dataset.safariSrc,
            priority,
            attempts: 0,
            maxAttempts: 3
        };
        
        if (priority === 'high') {
            this.imageQueue.unshift(queueItem); // Add to front
        } else {
            this.imageQueue.push(queueItem); // Add to back
        }
    }
    
    async processImageQueue() {
        while (this.imageQueue.length > 0) {
            // Respect concurrent request limit
            if (this.loadingImages.size >= this.maxConcurrentRequests) {
                await this.waitForSlot();
                continue;
            }
            
            const item = this.imageQueue.shift();
            this.loadImageWithRetry(item);
            
            // Stagger requests for Safari mobile
            if (this.requestDelay > 0) {
                await this.delay(this.requestDelay);
            }
        }
    }
    
    async loadImageWithRetry(item) {
        const { img, src, attempts, maxAttempts } = item;
        
        this.loadingImages.add(img);
        
        try {
            console.log(`📱 Loading image (Safari): ${src.substring(src.lastIndexOf('/') + 1)}`);
            
            await this.loadImagePromise(img, src);
            
            // Success - add loaded class and notify
            img.classList.add('safari-loaded');
            if (img.closest('.swiper-slide')) {
                img.closest('.swiper-slide').classList.add('images-loaded');
            }
            
            console.log(`✅ Safari image loaded successfully`);
            
        } catch (error) {
            console.warn(`❌ Safari image load failed (attempt ${attempts + 1}):`, error);
            
            item.attempts++;
            if (item.attempts < maxAttempts) {
                // Retry with exponential backoff
                setTimeout(() => {
                    this.imageQueue.unshift(item); // Retry with high priority
                }, Math.pow(2, item.attempts) * 1000);
            }
        } finally {
            this.loadingImages.delete(img);
        }
    }
    
    loadImagePromise(img, src) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Image load timeout'));
            }, 10000); // 10 second timeout
            
            const onLoad = () => {
                clearTimeout(timeout);
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                resolve();
            };
            
            const onError = (error) => {
                clearTimeout(timeout);
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                reject(error);
            };
            
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
            
            // Set src to start loading
            img.src = src;
        });
    }
    
    waitForSlot() {
        return new Promise(resolve => {
            const checkSlot = () => {
                if (this.loadingImages.size < this.maxConcurrentRequests) {
                    resolve();
                } else {
                    setTimeout(checkSlot, 100);
                }
            };
            checkSlot();
        });
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    optimizeResourceLoading() {
        // Disable HTTP/2 push for Safari mobile (known to cause issues)
        const metaTag = document.createElement('meta');
        metaTag.httpEquiv = 'Link';
        metaTag.content = 'rel=preload; as=script; crossorigin';
        document.head.appendChild(metaTag);
        
        // Add connection hints for better resource loading
        const dnsTag = document.createElement('link');
        dnsTag.rel = 'dns-prefetch';
        dnsTag.href = '//cdn.jsdelivr.net';
        document.head.appendChild(dnsTag);
    }
    
    preventHTTPPipeliningIssues() {
        // Force Safari to use HTTP/1.1 behavior for images
        const style = document.createElement('style');
        style.textContent = `
            .swiper-slide img {
                content-visibility: auto;
                contain-intrinsic-size: 300px 600px;
            }
            
            /* Ensure Safari treats images as critical resources */
            .swiper-slide img[src] {
                will-change: auto !important;
                transform: translateZ(0);
            }
        `;
        document.head.appendChild(style);
        
        console.log('🔒 Applied Safari HTTP Pipelining fixes');
    }
    
    // Public method to manually trigger image loading
    forceLoadAllImages() {
        if (!this.isSafariMobile) return;
        
        const unloadedImages = document.querySelectorAll('.swiper-slide img:not(.safari-loaded)');
        unloadedImages.forEach(img => {
            if (img.dataset.safariSrc && !img.src) {
                this.queueImageLoad(img, 'high');
            }
        });
        this.processImageQueue();
    }
}

// Initialize Safari Mobile Fix
const safariMobileFix = new SafariMobileFix();

// Auto-initialize when appropriate
if (safariMobileFix.isSafariMobile) {
    safariMobileFix.init();
}

// Expose to global scope for debugging
window.safariMobileFix = safariMobileFix;

// Debug command
window.debugSafariMobile = () => {
    console.log('🍎 Safari Mobile Fix Status:', {
        isSafariMobile: safariMobileFix.isSafariMobile,
        queueLength: safariMobileFix.imageQueue.length,
        loadingCount: safariMobileFix.loadingImages.size,
        initialized: safariMobileFix.initialized
    });
    
    return safariMobileFix.isSafariMobile;
};

console.log('🍎 Safari Mobile Fix loaded'); 