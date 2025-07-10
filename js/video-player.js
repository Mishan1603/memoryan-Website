/**
 * Optimized Professional Video Player for Memoryan Website
 * Mobile-First Performance Optimizations:
 * - Debounced event handlers
 * - Efficient DOM manipulation
 * - Reduced event listeners
 * - Optimized mobile touch interactions
 * - Memory leak prevention
 * - Throttled progress updates
 */

class MemoryanVideoPlayer {
    constructor() {
        // Core elements
        this.video = null;
        this.videoSource = null;
        this.videoLoading = null;
        this.videoControls = null;
        this.videoError = null;
        this.playPauseBtn = null;
        this.progressBar = null;
        this.progressFill = null;
        this.progressHandle = null;
        this.volumeBtn = null;
        this.fullscreenBtn = null;
        this.videoWrapper = null;
        
        // State management
        this.isPlaying = false;
        this.isMuted = true;
        this.currentLanguage = 'en';
        this.loadingThreshold = 0.3;
        this.hasAutoPlayed = false;
        
        // Performance optimization properties
        this.controlsTimeout = null;
        this.resizeTimeout = null;
        this.progressUpdateThrottle = null;
        this.lastProgressUpdate = 0;
        this.progressUpdateInterval = 100; // Update every 100ms instead of every frame
        
        // Mobile optimization
        this.isMobileDevice = false;
        this.touchStartTime = 0;
        this.lastTouchTime = 0;
        
        // Cached dimensions for performance
        this.cachedDimensions = null;
        this.lastViewportHeight = 0;
        this.dimensionUpdateThreshold = 50; // Only update if viewport changes by 50px
        
        // Event handler references for cleanup
        this.boundHandlers = {};
        
        this.init();
    }
    
    init() {
        this.setupElements();
        this.detectMobileDevice();
        this.createBoundHandlers();
        this.setupEventListeners();
        this.detectLanguage();
        this.setupOptimizedSizing();
        this.loadVideo();
    }
    
    setupElements() {
        this.video = document.getElementById('trailerVideo');
        this.videoSource = document.getElementById('videoSource');
        this.videoLoading = document.getElementById('videoLoading');
        this.videoControls = document.getElementById('videoControls');
        this.videoError = document.getElementById('videoError');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressHandle = document.getElementById('progressHandle');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.videoWrapper = document.querySelector('.video-player-wrapper');
        
        if (!this.video) {
            console.error('Video element not found');
            return;
        }
        
        // Initialize states efficiently
        this.isMuted = this.video.muted;
        this.updateButtonStates();
    }
    
    detectMobileDevice() {
        // Optimized mobile detection - cache result
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;
        
        this.isMobileDevice = isMobileUserAgent || (hasTouchScreen && isSmallScreen);
        
        // Detect Safari for fullscreen handling
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        this.isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        console.log('Device type detected:', this.isMobileDevice ? 'Mobile' : 'Desktop');
        console.log('Safari detected:', this.isSafari, 'iOS Safari:', this.isIOSSafari);
    }
    
    createBoundHandlers() {
        // Pre-bind all event handlers for better performance and cleanup
        this.boundHandlers = {
            // Video events
            loadstart: () => this.handleVideoLoadStart(),
            progress: this.debounce(() => this.handleVideoProgress(), 200),
            canplay: () => this.handleVideoCanPlay(),
            timeupdate: this.throttle(() => this.updateProgress(), this.progressUpdateInterval),
            ended: () => this.handleVideoEnded(),
            error: () => this.handleVideoError(),
            play: () => this.handlePlay(),
            pause: () => this.handlePause(),
            
            // Control events
            playPauseClick: (e) => {
                e.stopPropagation();
                this.togglePlayPause();
            },
            progressClick: (e) => this.seekVideo(e),
            volumeClick: (e) => {
                e.stopPropagation();
                this.toggleMute();
            },
            fullscreenClick: (e) => {
                e.stopPropagation();
                this.toggleFullscreen();
            },
            
            // Interaction events
            containerClick: (e) => {
                if (e.target === this.videoControls) {
                    this.togglePlayPause();
                }
            },
            
            // Optimized resize handler
            resize: this.debounce(() => this.handleResize(), 250),
            orientationChange: this.debounce(() => this.handleOrientationChange(), 500),
            
            // Language change
            languageChange: (e) => {
                this.currentLanguage = e.detail.language;
                this.loadVideo();
            },
            
            // Keyboard
            keydown: (e) => this.handleKeyboard(e),
            
                    // Fullscreen
        fullscreenChange: () => this.handleFullscreenChange(),
        webkitFullscreenChange: () => this.handleFullscreenChange(),
        webkitBeginFullscreen: () => this.handleVideoEnterFullscreen(),
        webkitEndFullscreen: () => this.handleVideoExitFullscreen()
        };
        
        // Mobile-specific handlers
        if (this.isMobileDevice) {
            this.boundHandlers.touchStart = (e) => this.handleTouchStart(e);
            this.boundHandlers.touchEnd = (e) => this.handleTouchEnd(e);
        } else {
            // Desktop: Mouse-optimized controls
            this.boundHandlers.mouseEnter = () => this.handleMouseEnter();
            this.boundHandlers.mouseLeave = () => this.handleMouseLeave();
            this.boundHandlers.mouseMove = this.throttle(() => this.handleMouseMove(), 100);
        }
    }
    
    setupEventListeners() {
        if (!this.video) return;
        
        // Video events
        this.video.addEventListener('loadstart', this.boundHandlers.loadstart);
        this.video.addEventListener('progress', this.boundHandlers.progress);
        this.video.addEventListener('canplay', this.boundHandlers.canplay);
        this.video.addEventListener('timeupdate', this.boundHandlers.timeupdate);
        this.video.addEventListener('ended', this.boundHandlers.ended);
        this.video.addEventListener('error', this.boundHandlers.error);
        this.video.addEventListener('play', this.boundHandlers.play);
        this.video.addEventListener('pause', this.boundHandlers.pause);
        
        // Control events
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', this.boundHandlers.playPauseClick);
        }
        
        if (this.progressBar) {
            this.progressBar.addEventListener('click', this.boundHandlers.progressClick);
        }
        
        if (this.volumeBtn) {
            this.volumeBtn.addEventListener('click', this.boundHandlers.volumeClick);
        }
        
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', this.boundHandlers.fullscreenClick);
        }
        
        if (this.videoControls) {
            this.videoControls.addEventListener('click', this.boundHandlers.containerClick);
        }
        
        // Setup device-specific controls
        this.setupDeviceSpecificControls();
        
        // Global events
        window.addEventListener('resize', this.boundHandlers.resize);
        window.addEventListener('orientationchange', this.boundHandlers.orientationChange);
        document.addEventListener('languageChanged', this.boundHandlers.languageChange);
        document.addEventListener('keydown', this.boundHandlers.keydown);
        
        // Fullscreen events
        document.addEventListener('fullscreenchange', this.boundHandlers.fullscreenChange);
        document.addEventListener('webkitfullscreenchange', this.boundHandlers.webkitFullscreenChange);
        document.addEventListener('mozfullscreenchange', this.boundHandlers.fullscreenChange);
        document.addEventListener('MSFullscreenChange', this.boundHandlers.fullscreenChange);
        
        // Safari-specific video fullscreen events
        if (this.video && (this.isSafari || this.isIOSSafari)) {
            this.video.addEventListener('webkitbeginfullscreen', this.boundHandlers.webkitBeginFullscreen);
            this.video.addEventListener('webkitendfullscreen', this.boundHandlers.webkitEndFullscreen);
        }
    }
    
    setupDeviceSpecificControls() {
        if (!this.videoWrapper) return;
        
        if (this.isMobileDevice) {
            // Mobile: Touch-optimized controls
            this.videoWrapper.addEventListener('touchstart', this.boundHandlers.touchStart, { passive: true });
            this.videoWrapper.addEventListener('touchend', this.boundHandlers.touchEnd, { passive: true });
        } else {
            // Desktop: Mouse-optimized controls
            this.videoWrapper.addEventListener('mouseenter', this.boundHandlers.mouseEnter);
            this.videoWrapper.addEventListener('mouseleave', this.boundHandlers.mouseLeave);
            this.videoWrapper.addEventListener('mousemove', this.boundHandlers.mouseMove);
        }
    }
    
    // Optimized utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Mobile touch handlers
    handleTouchStart(e) {
        this.touchStartTime = Date.now();
    }
    
    handleTouchEnd(e) {
        const touchDuration = Date.now() - this.touchStartTime;
        const timeSinceLastTouch = Date.now() - this.lastTouchTime;
        
        // Only show controls if it's a quick tap (not a scroll) and not too frequent
        if (touchDuration < 300 && timeSinceLastTouch > 200) {
            this.showControlsTemporarily();
            this.lastTouchTime = Date.now();
        }
    }
    
    // Desktop mouse handlers
    handleMouseEnter() {
        this.showControls();
        this.clearControlsTimeout();
    }
    
    handleMouseLeave() {
        if (this.isPlaying) {
            this.hideControls();
        }
    }
    
    handleMouseMove() {
        this.showControlsTemporarily();
    }
    
    // Optimized resize handling
    handleResize() {
        const currentHeight = window.innerHeight;
        
        // Only recalculate if viewport height changed significantly
        if (Math.abs(currentHeight - this.lastViewportHeight) > this.dimensionUpdateThreshold) {
            this.lastViewportHeight = currentHeight;
            this.cachedDimensions = null; // Clear cache
            this.applyOptimizedSizing();
        }
    }
    
    handleOrientationChange() {
        // Clear cache and recalculate after orientation change
        this.cachedDimensions = null;
        this.lastViewportHeight = 0;
        setTimeout(() => {
            this.applyOptimizedSizing();
        }, 100); // Small delay to ensure orientation change is complete
    }
    
    showControlsTemporarily() {
        this.showControls();
        this.clearControlsTimeout();
        
        // Auto-hide controls after 2 seconds if playing
        if (this.isPlaying) {
            this.controlsTimeout = setTimeout(() => {
                this.hideControls();
            }, 2000);
        }
    }
    
    detectLanguage() {
        // Optimized language detection
        const htmlLang = document.documentElement.lang;
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        
        this.currentLanguage = urlLang || htmlLang || 'en';
        console.log('Language detected:', this.currentLanguage);
    }
    
    loadVideo() {
        if (!this.video || !this.videoSource) return;
        
        const videoFile = this.currentLanguage === 'ru' ? 'trailer_ru.mp4' : 'trailer.mp4';
        const newSrc = videoFile;
        
        // Only reload if source actually changed
        if (this.videoSource.src !== newSrc) {
            this.showLoading();
            this.hideError();
            
            this.videoSource.src = newSrc;
            this.video.load();
            
            console.log(`Loading video: ${videoFile} for language: ${this.currentLanguage}`);
        }
    }
    
    // Optimized event handlers
    handleVideoLoadStart() {
        this.showLoading();
        this.hideError();
    }
    
    handleVideoProgress() {
        if (!this.video.buffered.length) return;
        
        const buffered = this.video.buffered.end(this.video.buffered.length - 1);
        const duration = this.video.duration;
        
        if (duration > 0) {
            const loadedPercentage = buffered / duration;
            
            if (loadedPercentage >= this.loadingThreshold && !this.hasAutoPlayed) {
                this.handleVideoCanPlay();
            }
        }
    }
    
    handleVideoCanPlay() {
        this.hideLoading();
        
        if (!this.hasAutoPlayed) {
            this.hasAutoPlayed = true;
            
            // Auto-play with error handling
            const playPromise = this.video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Auto-play prevented:', error);
                    this.isPlaying = false;
                    this.updateButtonStates();
                });
            }
        }
    }
    
    handleVideoError() {
        this.hideLoading();
        this.showError();
        console.error('Video loading error');
    }
    
    handlePlay() {
        this.isPlaying = true;
        this.updateButtonStates();
        this.video.classList.add('loaded');
    }
    
    handlePause() {
        this.isPlaying = false;
        this.updateButtonStates();
    }
    
    handleVideoEnded() {
        this.isPlaying = false;
        this.updateButtonStates();
        this.showControls();
    }
    
    // Optimized control methods
    togglePlayPause() {
        if (!this.video) return;
        
        if (this.isPlaying) {
            this.video.pause();
        } else {
            const playPromise = this.video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Play failed:', error);
                });
            }
        }
        
        this.showControlsTemporarily();
    }
    
    toggleMute() {
        if (!this.video) return;
        
        this.isMuted = !this.isMuted;
        this.video.muted = this.isMuted;
        this.updateVolumeButton();
        this.showControlsTemporarily();
    }
    
    toggleFullscreen() {
        if (this.isFullscreen()) {
            this.exitFullscreenMode();
        } else {
            this.enterFullscreenMode();
        }
        this.showControlsTemporarily();
    }
    
    enterFullscreenMode() {
        console.log('Entering fullscreen mode, Safari:', this.isSafari, 'iOS Safari:', this.isIOSSafari);
        
        // Safari-specific handling for video fullscreen
        if (this.isSafari || this.isIOSSafari) {
            this.enterSafariFullscreen();
            return;
        }
        
        // Standard fullscreen API handling for other browsers
        const element = this.videoWrapper || this.video;
        
        try {
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => {
                    console.warn('Fullscreen request failed:', err);
                    this.fallbackFullscreen();
                });
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else {
                this.fallbackFullscreen();
            }
        } catch (error) {
            console.warn('Fullscreen API error:', error);
            this.fallbackFullscreen();
        }
    }
    
    enterSafariFullscreen() {
        console.log('Using Safari-specific fullscreen');
        
        // For iOS Safari, use the video element's webkitEnterFullscreen
        if (this.isIOSSafari && this.video && this.video.webkitEnterFullscreen) {
            try {
                this.video.webkitEnterFullscreen();
                return;
            } catch (error) {
                console.warn('iOS Safari fullscreen failed:', error);
            }
        }
        
        // For desktop Safari, try video-specific fullscreen first
        if (this.video && this.video.webkitRequestFullscreen) {
            try {
                this.video.webkitRequestFullscreen();
                return;
            } catch (error) {
                console.warn('Safari video fullscreen failed:', error);
            }
        }
        
        // Try container fullscreen for Safari
        if (this.videoWrapper && this.videoWrapper.webkitRequestFullscreen) {
            try {
                this.videoWrapper.webkitRequestFullscreen();
                return;
            } catch (error) {
                console.warn('Safari container fullscreen failed:', error);
            }
        }
        
        // Fallback to CSS fullscreen for Safari
        this.fallbackFullscreen();
    }
    
    fallbackFullscreen() {
        console.log('Using fallback fullscreen mode');
        this.videoWrapper?.classList.add('fullscreen-mode');
        this.video?.classList.add('fullscreen-video');
        
        // For Safari, we need to handle the video sizing manually
        if (this.isSafari && this.video) {
            this.video.style.width = '100vw';
            this.video.style.height = '100vh';
            this.video.style.objectFit = 'contain';
        }
    }
    
    exitFullscreenMode() {
        console.log('Exiting fullscreen mode');
        
        // Handle iOS Safari specific exit
        if (this.isIOSSafari && this.video && this.video.webkitExitFullscreen) {
            try {
                this.video.webkitExitFullscreen();
            } catch (error) {
                console.warn('iOS Safari fullscreen exit failed:', error);
            }
        }
        
        // Standard fullscreen API exit
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } catch (error) {
            console.warn('Fullscreen exit API error:', error);
        }
        
        // Always clean up fallback classes and styles
        this.cleanupFullscreenFallback();
    }
    
    cleanupFullscreenFallback() {
        this.videoWrapper?.classList.remove('fullscreen-mode');
        this.video?.classList.remove('fullscreen-video');
        
        // Reset Safari-specific styles
        if (this.video) {
            this.video.style.width = '';
            this.video.style.height = '';
            this.video.style.objectFit = '';
        }
    }
    
    seekVideo(event) {
        if (!this.video || !this.progressBar) return;
        
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * this.video.duration;
        
        this.video.currentTime = Math.max(0, Math.min(this.video.duration, newTime));
        this.showControlsTemporarily();
    }
    
    // Throttled progress update
    updateProgress() {
        if (!this.video || !this.progressFill || !this.progressHandle) return;
        
        const currentTime = this.video.currentTime;
        const duration = this.video.duration;
        
        if (duration > 0) {
            const percentage = (currentTime / duration) * 100;
            
            // Use transform for better performance than changing width
            this.progressFill.style.transform = `scaleX(${percentage / 100})`;
            this.progressHandle.style.left = `${percentage}%`;
        }
    }
    
    // Efficient button state updates
    updateButtonStates() {
        this.updatePlayPauseButton();
        this.updateVolumeButton();
    }
    
    updatePlayPauseButton() {
        if (!this.playPauseBtn) return;
        
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');
        
        if (playIcon && pauseIcon) {
            if (this.isPlaying) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        }
    }
    
    updateVolumeButton() {
        if (!this.volumeBtn) return;
        
        const volumeIcon = this.volumeBtn.querySelector('.volume-icon');
        const muteIcon = this.volumeBtn.querySelector('.mute-icon');
        
        if (volumeIcon && muteIcon) {
            if (this.isMuted) {
                volumeIcon.style.display = 'none';
                muteIcon.style.display = 'block';
            } else {
                volumeIcon.style.display = 'block';
                muteIcon.style.display = 'none';
            }
        }
    }
    
    // UI state methods
    showLoading() {
        this.videoLoading?.classList.remove('hidden');
    }
    
    hideLoading() {
        this.videoLoading?.classList.add('hidden');
    }
    
    showError() {
        if (this.videoError) {
            this.videoError.style.display = 'flex';
        }
    }
    
    hideError() {
        if (this.videoError) {
            this.videoError.style.display = 'none';
        }
    }
    
    showControls() {
        if (this.videoControls) {
            this.videoControls.classList.add('show-controls');
        }
        this.clearControlsTimeout();
    }
    
    hideControls() {
        if (this.videoControls) {
            this.videoControls.classList.remove('show-controls');
        }
    }
    
    isFullscreen() {
        // Check standard fullscreen APIs
        const standardFullscreen = !!(document.fullscreenElement || 
                                    document.webkitFullscreenElement || 
                                    document.mozFullScreenElement || 
                                    document.msFullscreenElement);
        
        // Check iOS Safari specific fullscreen
        const iosFullscreen = this.isIOSSafari && this.video && 
                             (this.video.webkitDisplayingFullscreen || 
                              this.video.webkitPresentationMode === 'fullscreen');
        
        // Check fallback fullscreen classes
        const fallbackFullscreen = this.video?.classList.contains('fullscreen-video') ||
                                  this.videoWrapper?.classList.contains('fullscreen-mode');
        
        return standardFullscreen || iosFullscreen || fallbackFullscreen;
    }
    
    clearControlsTimeout() {
        if (this.controlsTimeout) {
            clearTimeout(this.controlsTimeout);
            this.controlsTimeout = null;
        }
    }
    
    handleFullscreenChange() {
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && 
            !document.msFullscreenElement) {
            this.cleanupFullscreenFallback();
        }
    }
    
    handleVideoEnterFullscreen() {
        console.log('Safari video entered fullscreen');
        this.showControlsTemporarily();
    }
    
    handleVideoExitFullscreen() {
        console.log('Safari video exited fullscreen');
        this.cleanupFullscreenFallback();
        this.showControlsTemporarily();
    }
    
    handleKeyboard(event) {
        if (!this.video) return;
        
        // Only handle keyboard if video is in viewport
        const rect = this.video.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (!isVisible) return;
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePlayPause();
                break;
            case 'KeyM':
                event.preventDefault();
                this.toggleMute();
                break;
            case 'KeyF':
                event.preventDefault();
                this.toggleFullscreen();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.video.currentTime = Math.max(0, this.video.currentTime - 10);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10);
                break;
        }
    }
    
    // Optimized sizing system
    calculateOptimizedVideoSize() {
        // Use cached dimensions if viewport hasn't changed significantly
        if (this.cachedDimensions && 
            Math.abs(window.innerHeight - this.lastViewportHeight) < this.dimensionUpdateThreshold) {
            return this.cachedDimensions;
        }
        
        const viewportHeight = window.innerHeight;
        const videoHeight = Math.floor(viewportHeight * 0.75);
        const videoWidth = Math.floor(videoHeight / 2);
        
        // Constraints
        const minHeight = 300;
        const maxHeight = 800;
        const minWidth = 150;
        const maxWidth = 400;
        
        const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, videoHeight));
        const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, videoWidth));
        
        // Cache the result
        this.cachedDimensions = {
            width: constrainedWidth,
            height: constrainedHeight
        };
        
        this.lastViewportHeight = viewportHeight;
        
        return this.cachedDimensions;
    }
    
    applyOptimizedSizing() {
        if (!this.videoWrapper) return;
        
        const dimensions = this.calculateOptimizedVideoSize();
        
        // Use transform for better performance than changing width/height
        this.videoWrapper.style.width = `${dimensions.width}px`;
        this.videoWrapper.style.height = `${dimensions.height}px`;
        
        console.log(`Optimized video sizing: ${dimensions.width}x${dimensions.height}px`);
    }
    
    setupOptimizedSizing() {
        // Apply initial sizing
        this.applyOptimizedSizing();
        
        // Note: Resize listeners are already set up in setupEventListeners with debouncing
    }
    
    // Cleanup method for memory management
    destroy() {
        // Clear all timeouts
        this.clearControlsTimeout();
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        if (this.progressUpdateThrottle) {
            clearTimeout(this.progressUpdateThrottle);
        }
        
        // Remove all event listeners
        if (this.video) {
            this.video.removeEventListener('loadstart', this.boundHandlers.loadstart);
            this.video.removeEventListener('progress', this.boundHandlers.progress);
            this.video.removeEventListener('canplay', this.boundHandlers.canplay);
            this.video.removeEventListener('timeupdate', this.boundHandlers.timeupdate);
            this.video.removeEventListener('ended', this.boundHandlers.ended);
            this.video.removeEventListener('error', this.boundHandlers.error);
            this.video.removeEventListener('play', this.boundHandlers.play);
            this.video.removeEventListener('pause', this.boundHandlers.pause);
            
            // Remove Safari-specific listeners
            if (this.isSafari || this.isIOSSafari) {
                this.video.removeEventListener('webkitbeginfullscreen', this.boundHandlers.webkitBeginFullscreen);
                this.video.removeEventListener('webkitendfullscreen', this.boundHandlers.webkitEndFullscreen);
            }
        }
        
        // Remove control listeners
        this.playPauseBtn?.removeEventListener('click', this.boundHandlers.playPauseClick);
        this.progressBar?.removeEventListener('click', this.boundHandlers.progressClick);
        this.volumeBtn?.removeEventListener('click', this.boundHandlers.volumeClick);
        this.fullscreenBtn?.removeEventListener('click', this.boundHandlers.fullscreenClick);
        this.videoControls?.removeEventListener('click', this.boundHandlers.containerClick);
        
        // Remove global listeners
        window.removeEventListener('resize', this.boundHandlers.resize);
        window.removeEventListener('orientationchange', this.boundHandlers.orientationChange);
        document.removeEventListener('languageChanged', this.boundHandlers.languageChange);
        document.removeEventListener('keydown', this.boundHandlers.keydown);
        
        // Remove device-specific listeners
        if (this.videoWrapper) {
            if (this.isMobileDevice) {
                this.videoWrapper.removeEventListener('touchstart', this.boundHandlers.touchStart);
                this.videoWrapper.removeEventListener('touchend', this.boundHandlers.touchEnd);
            } else {
                this.videoWrapper.removeEventListener('mouseenter', this.boundHandlers.mouseEnter);
                this.videoWrapper.removeEventListener('mouseleave', this.boundHandlers.mouseLeave);
                this.videoWrapper.removeEventListener('mousemove', this.boundHandlers.mouseMove);
            }
        }
        
        // Clear references
        this.boundHandlers = {};
        this.cachedDimensions = null;
    }
}

// Global functions for HTML onclick handlers (maintained for compatibility)
function handleVideoLoadStart() {
    window.videoPlayer?.handleVideoLoadStart();
}

function handleVideoCanPlay() {
    window.videoPlayer?.handleVideoCanPlay();
}

function handleVideoProgress() {
    window.videoPlayer?.handleVideoProgress();
}

function handleVideoError() {
    window.videoPlayer?.handleVideoError();
}

function togglePlayPause() {
    window.videoPlayer?.togglePlayPause();
}

function toggleFullscreen() {
    window.videoPlayer?.toggleFullscreen();
}

// Optimized initialization
document.addEventListener('DOMContentLoaded', () => {
    // Clean up any existing player
    if (window.videoPlayer && typeof window.videoPlayer.destroy === 'function') {
        window.videoPlayer.destroy();
    }
    
    window.videoPlayer = new MemoryanVideoPlayer();
});

// Handle language changes from i18n system
document.addEventListener('languageChanged', (event) => {
    // Language change is now handled internally by the player
    console.log('Language change detected:', event.detail.language);
});

// Handle page unload cleanup
window.addEventListener('beforeunload', () => {
    if (window.videoPlayer && typeof window.videoPlayer.destroy === 'function') {
        window.videoPlayer.destroy();
    }
}); 
