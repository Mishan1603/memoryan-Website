/**
 * Smart Carousel Image Optimizer
 * Solves lazy loading issues with Swiper carousels by implementing intelligent preloading
 * 
 * Problems Solved:
 * 1. Swiper loop creates dynamic duplicates - images don't load until swiped
 * 2. Native lazy loading doesn't work well with transforms and hidden slides
 * 3. Limited viewport visibility prevents proper image loading triggers
 * 4. CSS opacity/transform changes interfere with browser's "in view" detection
 */

class SmartCarouselOptimizer {
    constructor() {
        this.carouselImages = new Map(); // Track all carousel images
        this.loadedImages = new Set(); // Track which images are loaded
        this.preloadQueue = new Set(); // Queue of images to preload
        this.isCarouselInView = false; // Track if carousel is visible
        this.currentSlideIndex = 0; // Track current slide
        this.totalSlides = 0; // Total number of unique slides
        this.preloadRadius = 3; // Number of slides to preload ahead/behind
        this.swiper = null; // Reference to Swiper instance
        
        // Bind methods
        this.init = this.init.bind(this);
        this.setupCarouselObserver = this.setupCarouselObserver.bind(this);
        this.overrideLazyLoading = this.overrideLazyLoading.bind(this);
        this.preloadImages = this.preloadImages.bind(this);
        this.handleSlideChange = this.handleSlideChange.bind(this);
    }
    
    init() {
        console.log('🚀 Initializing Smart Carousel Optimizer');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupOptimizer());
        } else {
            this.setupOptimizer();
        }
    }
    
    setupOptimizer() {
        // Check if Safari Mobile Fix is handling this
        if (window.safariMobileFix && window.safariMobileFix.isSafariMobile) {
            console.log('🍎 Safari Mobile Fix detected - deferring to Safari-specific handling');
            return;
        }
        
        // Step 1: Find and catalog all carousel images
        this.catalogCarouselImages();
        
        // Step 2: Override native lazy loading for carousel images
        this.overrideLazyLoading();
        
        // Step 3: Setup intersection observer for carousel visibility
        this.setupCarouselObserver();
        
        // Step 4: Setup Swiper event hooks
        this.setupSwiperHooks();
        
        // Step 5: Start intelligent preloading
        this.startIntelligentPreloading();
    }
    
    catalogCarouselImages() {
        console.log('📋 Cataloging carousel images');
        
        // Find all carousel slides
        const slides = document.querySelectorAll('.swiper-slide');
        console.log(`Found ${slides.length} total slides`);
        
        // Filter out duplicate slides and catalog unique images
        const uniqueSlides = [];
        const seenImages = new Set();
        
        slides.forEach((slide, index) => {
            const img = slide.querySelector('img[loading="lazy"]');
            if (img) {
                const src = img.src || img.getAttribute('src');
                if (src && !seenImages.has(src)) {
                    seenImages.add(src);
                    uniqueSlides.push({
                        slide,
                        img,
                        src,
                        originalIndex: index,
                        uniqueIndex: uniqueSlides.length
                    });
                    
                                         // Store in our map for quick access
                     const isLoaded = img.complete && img.naturalHeight > 0;
                     this.carouselImages.set(uniqueSlides.length - 1, {
                         img,
                         src,
                         slide,
                         loaded: isLoaded
                     });
                     
                     // If image is already loaded, add the class immediately
                     if (isLoaded) {
                         slide.classList.add('images-loaded');
                     }
                }
            }
        });
        
        this.totalSlides = uniqueSlides.length;
        console.log(`📊 Cataloged ${this.totalSlides} unique carousel images`);
        
        // Log already loaded images
        let alreadyLoaded = 0;
        this.carouselImages.forEach((data, index) => {
            if (data.loaded) {
                this.loadedImages.add(index);
                alreadyLoaded++;
            }
        });
        console.log(`✅ ${alreadyLoaded} images already loaded`);
    }
    
    overrideLazyLoading() {
        console.log('🔄 Overriding native lazy loading for carousel images');
        
        // Remove loading="lazy" from carousel images and replace with data-carousel-lazy
        this.carouselImages.forEach((data, index) => {
            const { img } = data;
            
            if (img.hasAttribute('loading')) {
                img.removeAttribute('loading');
                img.setAttribute('data-carousel-lazy', 'true');
                console.log(`🔧 Removed lazy loading from carousel image ${index}`);
            }
            
            // Add load event listener to track when image loads
            img.addEventListener('load', () => {
                this.loadedImages.add(index);
                console.log(`✅ Carousel image ${index} loaded successfully`);
                
                // Add images-loaded class to enable visual effects
                const slide = data.slide;
                if (slide) {
                    slide.classList.add('images-loaded');
                }
            });
            
            // Add error handling
            img.addEventListener('error', () => {
                console.warn(`❌ Failed to load carousel image ${index}: ${data.src}`);
            });
        });
    }
    
    setupCarouselObserver() {
        console.log('👁️ Setting up carousel visibility observer');
        
        const carousel = document.querySelector('.screenshot-swiper');
        if (!carousel) {
            console.warn('⚠️ Carousel not found');
            return;
        }
        
        // Use Intersection Observer to detect when carousel comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const wasInView = this.isCarouselInView;
                this.isCarouselInView = entry.isIntersecting;
                
                if (!wasInView && this.isCarouselInView) {
                    console.log('👀 Carousel came into view - starting aggressive preloading');
                    this.startAggressivePreloading();
                } else if (wasInView && !this.isCarouselInView) {
                    console.log('👁️‍🗨️ Carousel out of view - reducing preload priority');
                }
            });
        }, {
            root: null,
            rootMargin: '200px', // Start preloading when carousel is 200px away
            threshold: 0.1
        });
        
        observer.observe(carousel);
    }
    
    setupSwiperHooks() {
        console.log('🔗 Setting up Swiper event hooks');
        
        // Wait for Swiper to be initialized
        const checkForSwiper = () => {
            // Try to find Swiper instance from various possible sources
            if (window.screenshotSwiper) {
                this.swiper = window.screenshotSwiper;
            } else if (window.swiper) {
                this.swiper = window.swiper;
            } else {
                // Try to find Swiper from DOM element
                const swiperElement = document.querySelector('.screenshot-swiper');
                if (swiperElement && swiperElement.swiper) {
                    this.swiper = swiperElement.swiper;
                }
            }
            
            if (this.swiper) {
                console.log('✅ Found Swiper instance, setting up hooks');
                this.attachSwiperEvents();
                return true;
            }
            return false;
        };
        
        // Try immediately
        if (!checkForSwiper()) {
            // Try again after a delay
            setTimeout(() => {
                if (!checkForSwiper()) {
                    console.warn('⚠️ Could not find Swiper instance, using fallback method');
                    this.setupFallbackSlideDetection();
                }
            }, 1000);
        }
    }
    
    attachSwiperEvents() {
        if (!this.swiper) return;
        
        // Hook into slide change events
        this.swiper.on('slideChange', () => {
            this.currentSlideIndex = this.swiper.realIndex || this.swiper.activeIndex;
            console.log(`📍 Slide changed to index: ${this.currentSlideIndex}`);
            this.handleSlideChange();
        });
        
        // Hook into slide transition start
        this.swiper.on('slideChangeTransitionStart', () => {
            // Preload images for the slide we're transitioning to
            this.preloadSlideAndNeighbors(this.swiper.realIndex || this.swiper.activeIndex);
        });
        
        // Get initial slide index
        this.currentSlideIndex = this.swiper.realIndex || this.swiper.activeIndex || 0;
        console.log(`📍 Initial slide index: ${this.currentSlideIndex}`);
    }
    
    setupFallbackSlideDetection() {
        console.log('🔄 Setting up fallback slide change detection');
        
        // Use MutationObserver to detect when active slide changes
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        if (!swiperWrapper) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Detect slide changes by watching transform changes
                    this.detectSlideChangeFromTransform();
                }
            });
        });
        
        observer.observe(swiperWrapper, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        // Also periodically check for active slide changes
        setInterval(() => {
            this.detectActiveSlideChange();
        }, 500);
    }
    
    detectSlideChangeFromTransform() {
        const activeSlide = document.querySelector('.swiper-slide-active');
        if (activeSlide) {
            const slides = Array.from(document.querySelectorAll('.swiper-slide'));
            const newIndex = slides.indexOf(activeSlide);
            
            if (newIndex !== -1 && newIndex !== this.currentSlideIndex) {
                this.currentSlideIndex = newIndex % this.totalSlides; // Handle loop duplicates
                console.log(`📍 Fallback detected slide change to: ${this.currentSlideIndex}`);
                this.handleSlideChange();
            }
        }
    }
    
    detectActiveSlideChange() {
        const activeSlide = document.querySelector('.swiper-slide-active');
        if (activeSlide) {
            const slideImage = activeSlide.querySelector('img[data-carousel-lazy]');
            if (slideImage) {
                // Find this image in our catalog
                for (let [index, data] of this.carouselImages) {
                    if (data.img === slideImage && index !== this.currentSlideIndex) {
                        this.currentSlideIndex = index;
                        console.log(`📍 Active slide detected: ${this.currentSlideIndex}`);
                        this.handleSlideChange();
                        break;
                    }
                }
            }
        }
    }
    
    handleSlideChange() {
        // Preload current slide and neighbors immediately
        this.preloadSlideAndNeighbors(this.currentSlideIndex);
        
        // Schedule preloading of extended neighbors
        this.scheduleExtendedPreloading();
    }
    
    startIntelligentPreloading() {
        console.log('🧠 Starting intelligent preloading');
        
        // Always preload the first slide immediately
        this.loadImageAtIndex(0);
        
        // If carousel is in view, start aggressive preloading
        if (this.isCarouselInView) {
            this.startAggressivePreloading();
        } else {
            // Otherwise, just preload a few key slides
            this.preloadSlideAndNeighbors(0);
        }
    }
    
    startAggressivePreloading() {
        console.log('🔥 Starting aggressive preloading');
        
        // Preload current slide and extended neighbors
        this.preloadSlideAndNeighbors(this.currentSlideIndex, this.preloadRadius);
        
        // Schedule background preloading of remaining images
        this.scheduleBackgroundPreloading();
    }
    
    preloadSlideAndNeighbors(centerIndex, radius = 2) {
        const indicesToLoad = [];
        
        // Add center index
        indicesToLoad.push(centerIndex);
        
        // Add neighbors
        for (let i = 1; i <= radius; i++) {
            // Previous slides
            const prevIndex = (centerIndex - i + this.totalSlides) % this.totalSlides;
            indicesToLoad.push(prevIndex);
            
            // Next slides
            const nextIndex = (centerIndex + i) % this.totalSlides;
            indicesToLoad.push(nextIndex);
        }
        
        console.log(`🎯 Preloading slides around index ${centerIndex}:`, indicesToLoad);
        
        // Load high priority images immediately
        indicesToLoad.slice(0, 3).forEach(index => {
            this.loadImageAtIndex(index, 'high');
        });
        
        // Load remaining images with slight delay
        indicesToLoad.slice(3).forEach((index, delay) => {
            setTimeout(() => {
                this.loadImageAtIndex(index, 'normal');
            }, delay * 100);
        });
    }
    
    scheduleExtendedPreloading() {
        // Use requestIdleCallback for non-critical preloading
        if (window.requestIdleCallback) {
            window.requestIdleCallback(() => {
                this.preloadSlideAndNeighbors(this.currentSlideIndex, this.preloadRadius + 1);
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                this.preloadSlideAndNeighbors(this.currentSlideIndex, this.preloadRadius + 1);
            }, 500);
        }
    }
    
    scheduleBackgroundPreloading() {
        // Preload all remaining images in background
        const unloadedIndices = [];
        for (let i = 0; i < this.totalSlides; i++) {
            if (!this.loadedImages.has(i)) {
                unloadedIndices.push(i);
            }
        }
        
        if (unloadedIndices.length === 0) {
            console.log('✅ All carousel images are loaded!');
            return;
        }
        
        console.log(`⏳ Scheduling background preloading of ${unloadedIndices.length} remaining images`);
        
        // Load remaining images with staggered timing
        unloadedIndices.forEach((index, delay) => {
            const loadDelay = delay * 200 + 1000; // Start after 1 second, then 200ms apart
            
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => {
                    setTimeout(() => {
                        this.loadImageAtIndex(index, 'background');
                    }, loadDelay);
                });
            } else {
                setTimeout(() => {
                    this.loadImageAtIndex(index, 'background');
                }, loadDelay);
            }
        });
    }
    
    loadImageAtIndex(index, priority = 'normal') {
        if (index < 0 || index >= this.totalSlides) {
            console.warn(`⚠️ Invalid image index: ${index}`);
            return;
        }
        
        if (this.loadedImages.has(index)) {
            console.log(`✅ Image ${index} already loaded`);
            return;
        }
        
        const imageData = this.carouselImages.get(index);
        if (!imageData) {
            console.warn(`⚠️ No image data found for index: ${index}`);
            return;
        }
        
        const { img, src } = imageData;
        
        console.log(`🔄 Loading image ${index} (${priority} priority): ${src.substring(src.lastIndexOf('/') + 1)}`);
        
        // Force load the image
        if (!img.src) {
            img.src = src;
            
            // Check if image loads immediately (cached)
            setTimeout(() => {
                if (img.complete && img.naturalHeight > 0) {
                    this.loadedImages.add(index);
                    const slide = imageData.slide;
                    if (slide) {
                        slide.classList.add('images-loaded');
                    }
                    console.log(`⚡ Image ${index} loaded immediately from cache`);
                }
            }, 10);
        }
        
        // For high priority images, we can also preload via Image constructor
        if (priority === 'high') {
            const preloadImg = new Image();
            preloadImg.onload = () => {
                console.log(`⚡ High priority preload completed for image ${index}`);
            };
            preloadImg.src = src;
        }
        
        // Mark as loading
        this.preloadQueue.add(index);
    }
    
    // Public method to check optimization status
    getStatus() {
        return {
            totalSlides: this.totalSlides,
            loadedImages: this.loadedImages.size,
            loadingProgress: (this.loadedImages.size / this.totalSlides * 100).toFixed(1) + '%',
            currentSlide: this.currentSlideIndex,
            carouselInView: this.isCarouselInView,
            swiperFound: !!this.swiper
        };
    }
    
    // Public method to force preload all images
    forcePreloadAll() {
        console.log('💪 Force preloading all carousel images');
        for (let i = 0; i < this.totalSlides; i++) {
            this.loadImageAtIndex(i, 'high');
        }
    }
}

// Initialize the optimizer
const smartCarouselOptimizer = new SmartCarouselOptimizer();

// Auto-start when script loads
smartCarouselOptimizer.init();

// Expose to global scope for debugging
window.smartCarouselOptimizer = smartCarouselOptimizer;

// Add a debug command
window.debugCarouselOptimizer = () => {
    console.log('🔍 Carousel Optimizer Status:', smartCarouselOptimizer.getStatus());
    return smartCarouselOptimizer.getStatus();
};

console.log('🎠 Smart Carousel Optimizer loaded successfully'); 
