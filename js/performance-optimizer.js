/**
 * Memoryan Performance Optimizer
 * Comprehensive optimization system for images and videos
 * 
 * Features:
 * - Progressive image loading with automatic compression
 * - Viewport-aware video management
 * - Intersection Observer for lazy loading
 * - Dynamic quality adjustment based on connection speed
 * - Memory management and cleanup
 */

class MemoryanPerformanceOptimizer {
    constructor() {
        // Configuration
        this.config = {
            // Image optimization settings
            compressionQuality: 0.8,
            compressionFormat: 'webp',
            fallbackFormat: 'jpeg',
            progressiveSizes: [0.3, 0.6, 1.0], // Progressive quality levels
            
            // Video optimization settings
            videoPreload: 'metadata',
            videoPauseThreshold: 0.5, // Pause video when 50% out of viewport
            videoResumeThreshold: 0.3, // Resume when 30% in viewport
            
            // Lazy loading settings
            rootMargin: '50px',
            threshold: 0.1,
            
            // Connection-aware settings
            slowConnectionThreshold: 1000000, // 1 Mbps in bits per second
        };
        
        // State management
        this.intersectionObserver = null;
        this.videoObserver = null;
        this.loadedImages = new Set();
        this.compressedImages = new Map();
        this.videoStates = new Map();
        this.connectionSpeed = 'unknown';
        this.isSlowConnection = false;
        
        // Performance tracking
        this.loadTimes = new Map();
        this.compressionStats = {
            originalSize: 0,
            compressedSize: 0,
            savedBytes: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Memoryan Performance Optimizer');
        
        // Detect connection speed
        this.detectConnectionSpeed();
        
        // Setup observers
        this.setupIntersectionObserver();
        this.setupVideoObserver();
        
        // Initialize image optimization
        this.initializeImageOptimization();
        
        // Initialize video optimization
        this.initializeVideoOptimization();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Performance Optimizer initialized');
    }
    
    detectConnectionSpeed() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.connectionSpeed = connection.effectiveType;
            
            // Consider 2G and slow-2g as slow connections
            this.isSlowConnection = ['slow-2g', '2g'].includes(connection.effectiveType);
            
            console.log(`📡 Connection detected: ${connection.effectiveType}, Slow: ${this.isSlowConnection}`);
            
            // Adjust settings based on connection
            if (this.isSlowConnection) {
                this.config.compressionQuality = 0.6;
                this.config.progressiveSizes = [0.2, 0.5, 1.0];
                this.config.videoPreload = 'none';
            }
        } else {
            console.log('📡 Connection API not supported, using default settings');
        }
    }
    
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported, falling back to immediate loading');
            return;
        }
        
        // Observer for images
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImageProgressive(entry.target);
                    this.intersectionObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: this.config.rootMargin,
            threshold: this.config.threshold
        });
        
        console.log('👁️ Intersection Observer for images initialized');
    }
    
    setupVideoObserver() {
        if (!('IntersectionObserver' in window)) return;
        
        // Observer for videos with different thresholds
        this.videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.handleVideoVisibility(entry.target, entry.intersectionRatio);
            });
        }, {
            threshold: [0, 0.3, 0.5, 0.7, 1.0]
        });
        
        console.log('📹 Video Intersection Observer initialized');
    }
    
    initializeImageOptimization() {
        // Find all images that need optimization
        const images = document.querySelectorAll('img[src*="images/"], img[data-src*="images/"]');
        
        images.forEach(img => {
            this.prepareImageForOptimization(img);
        });
        
        console.log(`🖼️ Found ${images.length} images for optimization`);
    }
    
    prepareImageForOptimization(img) {
        // Store original src
        const originalSrc = img.src || img.dataset.src;
        
        if (!originalSrc || this.loadedImages.has(originalSrc)) {
            return;
        }
        
        // Add loading placeholder
        this.addLoadingPlaceholder(img);
        
        // Clear current src to prevent immediate loading
        if (img.src) {
            img.dataset.originalSrc = img.src;
            img.removeAttribute('src');
        }
        
        // Observe for lazy loading
        if (this.intersectionObserver) {
            this.intersectionObserver.observe(img);
        } else {
            // Fallback: load immediately
            this.loadImageProgressive(img);
        }
    }
    
    addLoadingPlaceholder(img) {
        // Create a low-quality SVG placeholder
        const width = img.offsetWidth || 300;
        const height = img.offsetHeight || 200;
        
        const placeholder = `data:image/svg+xml;base64,${btoa(`
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#2C3645;stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:#3D495E;stop-opacity:0.5" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad)" />
                <circle cx="50%" cy="50%" r="20" fill="rgba(191,201,241,0.4)" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
                </circle>
            </svg>
        `)}`;
        
        img.src = placeholder;
        img.classList.add('loading-placeholder');
    }
    
    async loadImageProgressive(img) {
        const originalSrc = img.dataset.originalSrc || img.dataset.src;
        
        if (!originalSrc || this.loadedImages.has(originalSrc)) {
            return;
        }
        
        const loadStartTime = performance.now();
        
        try {
            // Progressive loading: Low quality -> Medium quality -> Full quality
            for (let i = 0; i < this.config.progressiveSizes.length; i++) {
                const quality = this.config.progressiveSizes[i];
                const optimizedSrc = await this.generateOptimizedImage(originalSrc, quality);
                
                // Load the progressive image
                await this.loadImage(img, optimizedSrc, i === 0);
                
                // Small delay between progressive loads for smoother UX
                if (i < this.config.progressiveSizes.length - 1) {
                    await this.delay(150);
                }
            }
            
            // Mark as loaded
            this.loadedImages.add(originalSrc);
            img.classList.remove('loading-placeholder');
            img.classList.add('image-loaded');
            
            // Track loading time
            const loadTime = performance.now() - loadStartTime;
            this.loadTimes.set(originalSrc, loadTime);
            
            console.log(`✅ Image loaded progressively: ${originalSrc.split('/').pop()} (${loadTime.toFixed(2)}ms)`);
            
        } catch (error) {
            console.error('❌ Error loading image:', originalSrc, error);
            // Fallback to original image
            this.loadImage(img, originalSrc, true);
        }
    }
    
    async generateOptimizedImage(originalSrc, quality) {
        const cacheKey = `${originalSrc}_${quality}`;
        
        // Check if already compressed
        if (this.compressedImages.has(cacheKey)) {
            return this.compressedImages.get(cacheKey);
        }
        
        try {
            // For progressive loading, we'll use different approaches
            if (quality < 1.0) {
                // For lower quality, we'll create a compressed version
                const compressedSrc = await this.compressImage(originalSrc, quality);
                this.compressedImages.set(cacheKey, compressedSrc);
                return compressedSrc;
            } else {
                // For full quality, return original
                return originalSrc;
            }
        } catch (error) {
            console.warn('⚠️ Image compression failed, using original:', error);
            return originalSrc;
        }
    }
    
    async compressImage(imageSrc, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate compressed dimensions
                    const scale = Math.sqrt(quality);
                    canvas.width = img.naturalWidth * scale;
                    canvas.height = img.naturalHeight * scale;
                    
                    // Apply image smoothing for better quality
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    // Draw compressed image
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Convert to data URL with compression
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', this.config.compressionQuality);
                    
                    // Track compression stats
                    const originalSize = this.estimateImageSize(img.naturalWidth, img.naturalHeight);
                    const compressedSize = compressedDataUrl.length * 0.75; // Rough estimate
                    
                    this.compressionStats.originalSize += originalSize;
                    this.compressionStats.compressedSize += compressedSize;
                    this.compressionStats.savedBytes += (originalSize - compressedSize);
                    
                    resolve(compressedDataUrl);
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => reject(new Error('Failed to load image for compression'));
            img.src = imageSrc;
        });
    }
    
    estimateImageSize(width, height) {
        // Rough estimate: 3 bytes per pixel for JPEG
        return width * height * 3;
    }
    
    loadImage(imgElement, src, isFirst = false) {
        return new Promise((resolve, reject) => {
            const tempImg = new Image();
            
            tempImg.onload = () => {
                imgElement.src = src;
                
                // Add fade-in effect for first load
                if (isFirst) {
                    imgElement.style.opacity = '0';
                    imgElement.style.transition = 'opacity 0.3s ease';
                    
                    // Trigger fade-in
                    requestAnimationFrame(() => {
                        imgElement.style.opacity = '1';
                    });
                }
                
                resolve();
            };
            
            tempImg.onerror = () => reject(new Error('Failed to load image'));
            tempImg.src = src;
        });
    }
    
    initializeVideoOptimization() {
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            this.optimizeVideo(video);
        });
        
        console.log(`📹 Optimized ${videos.length} videos`);
    }
    
    optimizeVideo(video) {
        // Apply connection-aware preload setting
        video.preload = this.config.videoPreload;
        
        // Store initial state
        this.videoStates.set(video, {
            wasPlaying: false,
            hasLoaded: false,
            isInViewport: false
        });
        
        // Add viewport observation
        if (this.videoObserver) {
            this.videoObserver.observe(video);
        }
        
        // Add event listeners for video optimization
        video.addEventListener('loadeddata', () => {
            const state = this.videoStates.get(video);
            state.hasLoaded = true;
            console.log('📹 Video loaded:', video.src?.split('/').pop() || 'video');
        });
        
        video.addEventListener('play', () => {
            const state = this.videoStates.get(video);
            state.wasPlaying = true;
        });
        
        video.addEventListener('pause', () => {
            const state = this.videoStates.get(video);
            state.wasPlaying = false;
        });
    }
    
    handleVideoVisibility(video, intersectionRatio) {
        const state = this.videoStates.get(video);
        if (!state) return;
        
        const wasInViewport = state.isInViewport;
        state.isInViewport = intersectionRatio > this.config.videoResumeThreshold;
        
        // Video became visible
        if (!wasInViewport && state.isInViewport) {
            console.log('📹 Video entered viewport:', video.src?.split('/').pop() || 'video');
            
            // Resume if it was playing before
            if (state.wasPlaying && video.paused) {
                video.play().catch(e => console.log('Auto-play prevented:', e));
            }
        }
        // Video became less visible
        else if (wasInViewport && intersectionRatio < this.config.videoPauseThreshold) {
            console.log('📹 Video left viewport:', video.src?.split('/').pop() || 'video');
            
            // Pause video to save bandwidth
            if (!video.paused) {
                state.wasPlaying = true;
                video.pause();
            }
        }
    }
    
    setupEventListeners() {
        // Listen for connection changes
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.detectConnectionSpeed();
                console.log('📡 Connection changed, reconfiguring...');
            });
        }
        
        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAllVideos();
            } else {
                this.resumeVisibleVideos();
            }
        });
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }
    
    pauseAllVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.paused) {
                const state = this.videoStates.get(video);
                if (state) {
                    state.wasPlaying = true;
                }
                video.pause();
            }
        });
        
        console.log('📹 All videos paused (page hidden)');
    }
    
    resumeVisibleVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            const state = this.videoStates.get(video);
            if (state && state.wasPlaying && state.isInViewport) {
                video.play().catch(e => console.log('Auto-play prevented:', e));
            }
        });
        
        console.log('📹 Visible videos resumed (page visible)');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Public API methods
    optimizeNewImage(img) {
        this.prepareImageForOptimization(img);
    }
    
    optimizeNewVideo(video) {
        this.optimizeVideo(video);
    }
    
    getPerformanceStats() {
        return {
            imagesLoaded: this.loadedImages.size,
            compressionStats: { ...this.compressionStats },
            averageLoadTime: Array.from(this.loadTimes.values()).reduce((a, b) => a + b, 0) / this.loadTimes.size || 0,
            connectionSpeed: this.connectionSpeed,
            isSlowConnection: this.isSlowConnection
        };
    }
    
    cleanup() {
        // Disconnect observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.videoObserver) {
            this.videoObserver.disconnect();
        }
        
        // Clear maps and sets
        this.loadedImages.clear();
        this.compressedImages.clear();
        this.videoStates.clear();
        this.loadTimes.clear();
        
        console.log('🧹 Performance Optimizer cleaned up');
    }
}

// Global instance
let memoryanOptimizer = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        memoryanOptimizer = new MemoryanPerformanceOptimizer();
    });
} else {
    memoryanOptimizer = new MemoryanPerformanceOptimizer();
}

// Export for global access
window.MemoryanPerformanceOptimizer = MemoryanPerformanceOptimizer;
window.memoryanOptimizer = memoryanOptimizer; 