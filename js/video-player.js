/**
 * Professional Video Player for Memoryan Website
 * Features: Language-based video selection, progressive loading, auto-play, custom controls, dynamic sizing
 */

class MemoryanVideoPlayer {
    constructor() {
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
        
        this.isPlaying = false;
        this.isMuted = true; // Start muted as required
        this.currentLanguage = 'en';
        this.loadingThreshold = 0.3; // 30% loading threshold
        this.hasAutoPlayed = false;
        this.controlsTimeout = null;
        
        this.init();
    }
    
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.detectLanguage();
        this.setupDynamicSizing();
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
        
        // Initialize button states to match video state
        this.isMuted = this.video.muted; // Sync with video's muted attribute
        this.updateVolumeButton(); // Update button display
        this.updatePlayPauseButton(); // Update play/pause button
    }
    
    setupEventListeners() {
        if (!this.video) return;
        
        // Video events
        this.video.addEventListener('loadstart', () => this.handleVideoLoadStart());
        this.video.addEventListener('progress', () => this.handleVideoProgress());
        this.video.addEventListener('canplay', () => this.handleVideoCanPlay());
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('ended', () => this.handleVideoEnded());
        this.video.addEventListener('error', () => this.handleVideoError());
        this.video.addEventListener('play', () => this.handlePlay());
        this.video.addEventListener('pause', () => this.handlePause());
        
        // Control events
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlayPause();
            });
        }
        
        if (this.progressBar) {
            this.progressBar.addEventListener('click', (e) => this.seekVideo(e));
        }
        
        if (this.volumeBtn) {
            this.volumeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMute();
            });
        }
        
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFullscreen();
            });
        }
        
        // Video container click to toggle play/pause
        if (this.videoControls) {
            this.videoControls.addEventListener('click', (e) => {
                if (e.target === this.videoControls) {
                    this.togglePlayPause();
                }
            });
            
            // Show/hide controls on hover
            this.videoControls.addEventListener('mouseenter', () => this.showControls());
            this.videoControls.addEventListener('mouseleave', () => this.hideControls());
        }
        
        // Language change listener
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.loadVideo();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    }
    
    detectLanguage() {
        // Get language from localStorage or detect from browser
        const savedLanguage = localStorage.getItem('memoryan_language');
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
        } else {
            const browserLang = navigator.language || navigator.userLanguage;
            this.currentLanguage = browserLang.startsWith('ru') ? 'ru' : 'en';
        }
    }
    
    loadVideo() {
        if (!this.video || !this.videoSource) return;
        
        // Reset state
        this.hasAutoPlayed = false;
        this.isPlaying = false;
        this.showLoading();
        this.hideError();
        
        // Set video source based on language
        const videoSrc = this.currentLanguage === 'ru' ? 'trailer_ru.mp4' : 'trailer.mp4';
        
        // Only reload if source changed
        if (this.videoSource.src !== videoSrc) {
            this.videoSource.src = videoSrc;
            this.video.load();
        }
    }
    
    handleVideoLoadStart() {
        console.log('Video loading started');
        this.showLoading();
    }
    
    handleVideoProgress() {
        if (!this.video.buffered.length) return;
        
        const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
        const duration = this.video.duration;
        
        if (duration > 0) {
            const bufferedPercent = bufferedEnd / duration;
            
            // Auto-play when 30% is loaded and hasn't auto-played yet
            if (bufferedPercent >= this.loadingThreshold && !this.hasAutoPlayed) {
                this.hasAutoPlayed = true;
                this.hideLoading();
                this.video.classList.add('loaded');
                
                // Auto-play (muted)
                this.video.muted = true;
                this.isMuted = true; // Sync state
                this.updateVolumeButton(); // Update button display
                this.video.play().catch(error => {
                    console.log('Auto-play failed:', error);
                    this.showControls();
                });
            }
        }
    }
    
    handleVideoCanPlay() {
        console.log('Video can play');
        if (!this.hasAutoPlayed) {
            this.hideLoading();
            this.video.classList.add('loaded');
            this.showControls();
        }
    }
    
    handleVideoError() {
        console.error('Video loading error');
        this.hideLoading();
        this.showError();
    }
    
    handlePlay() {
        this.isPlaying = true;
        this.updatePlayPauseButton();
        this.videoControls?.classList.add('playing');
        this.hideControlsDelayed();
    }
    
    handlePause() {
        this.isPlaying = false;
        this.updatePlayPauseButton();
        this.videoControls?.classList.remove('playing');
        this.showControls();
    }
    
    handleVideoEnded() {
        this.isPlaying = false;
        this.updatePlayPauseButton();
        this.showControls();
        this.video.currentTime = 0;
    }
    
    togglePlayPause() {
        if (!this.video) return;
        
        if (this.isPlaying) {
            this.video.pause();
        } else {
            this.video.play().catch(error => {
                console.log('Play failed:', error);
            });
        }
    }
    
    toggleMute() {
        if (!this.video) return;
        
        // Toggle the muted state
        this.isMuted = !this.isMuted;
        this.video.muted = this.isMuted;
        
        // Ensure volume is set appropriately
        if (!this.isMuted) {
            // When unmuting, set volume to a reasonable level if it's 0
            if (this.video.volume === 0) {
                this.video.volume = 0.7; // Set to 70% volume
            }
        }
        
        // Update button display
        this.updateVolumeButton();
        
        console.log('Video muted state:', this.video.muted, 'isMuted:', this.isMuted, 'volume:', this.video.volume);
    }
    
    toggleFullscreen() {
        if (!this.video) return;
        
        if (document.fullscreenElement) {
            document.exitFullscreen();
            this.exitFullscreenMode();
        } else {
            // Request fullscreen on the video wrapper for better control
            const videoWrapper = this.video.closest('.video-player-wrapper');
            const elementToFullscreen = videoWrapper || this.video;
            
            elementToFullscreen.requestFullscreen().then(() => {
                this.enterFullscreenMode();
            }).catch(error => {
                console.log('Fullscreen failed:', error);
                // Fallback to video element
                this.video.requestFullscreen().then(() => {
                    this.enterFullscreenMode();
                }).catch(err => {
                    console.log('Video fullscreen also failed:', err);
                });
            });
        }
    }
    
    enterFullscreenMode() {
        // Add fullscreen class for styling
        const videoWrapper = this.video.closest('.video-player-wrapper');
        if (videoWrapper) {
            videoWrapper.classList.add('fullscreen-mode');
            // Ensure proper centering in fullscreen
            videoWrapper.style.display = 'flex';
            videoWrapper.style.alignItems = 'center';
            videoWrapper.style.justifyContent = 'center';
        }
        this.video.classList.add('fullscreen-video');
        
        // Ensure video fills screen vertically and maintains aspect ratio
        this.video.style.width = 'auto';
        this.video.style.height = '100vh';
        this.video.style.objectFit = 'contain';
        this.video.style.objectPosition = 'center';
    }
    
    exitFullscreenMode() {
        // Remove fullscreen classes
        const videoWrapper = this.video.closest('.video-player-wrapper');
        if (videoWrapper) {
            videoWrapper.classList.remove('fullscreen-mode');
            // Reset wrapper styles
            videoWrapper.style.display = '';
            videoWrapper.style.alignItems = '';
            videoWrapper.style.justifyContent = '';
        }
        this.video.classList.remove('fullscreen-video');
        
        // Reset video styles
        this.video.style.width = '';
        this.video.style.height = '';
        this.video.style.objectFit = '';
        this.video.style.objectPosition = '';
    }
    
    seekVideo(event) {
        if (!this.video || !this.progressBar) return;
        
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        
        this.video.currentTime = percentage * this.video.duration;
    }
    
    updateProgress() {
        if (!this.video || !this.progressFill || !this.progressHandle) return;
        
        const percentage = (this.video.currentTime / this.video.duration) * 100;
        this.progressFill.style.width = percentage + '%';
        this.progressHandle.style.left = percentage + '%';
    }
    
    updatePlayPauseButton() {
        if (!this.playPauseBtn) return;
        
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');
        
        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
    
    updateVolumeButton() {
        console.log('=== updateVolumeButton called ===');
        
        if (!this.volumeBtn) {
            console.error('Volume button not found');
            return;
        }
        
        const volumeIcon = this.volumeBtn.querySelector('.volume-icon');
        const muteIcon = this.volumeBtn.querySelector('.mute-icon');
        
        console.log('Icons found:', { volumeIcon: !!volumeIcon, muteIcon: !!muteIcon });
        
        if (!volumeIcon || !muteIcon) {
            console.error('Volume button icons not found', { volumeIcon, muteIcon });
            return;
        }
        
        // Sync with actual video muted state
        if (this.video) {
            this.isMuted = this.video.muted;
        }
        
        console.log('Current state - isMuted:', this.isMuted, 'video.muted:', this.video?.muted);
        
        // Update icon display based on muted state
        if (this.isMuted) {
            volumeIcon.style.display = 'none';
            muteIcon.style.display = 'inline-block';
            console.log('✅ Applied: volumeIcon=none, muteIcon=inline-block');
        } else {
            volumeIcon.style.display = 'inline-block';
            muteIcon.style.display = 'none';
            console.log('✅ Applied: volumeIcon=inline-block, muteIcon=none');
        }
        
        // Verify the changes were applied
        setTimeout(() => {
            console.log('Verification - volumeIcon display:', volumeIcon.style.display, 'muteIcon display:', muteIcon.style.display);
        }, 100);
    }
    
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
        this.videoControls?.classList.add('show-controls');
        this.clearControlsTimeout();
    }
    
    hideControls() {
        if (this.isPlaying) {
            this.videoControls?.classList.remove('show-controls');
        }
    }
    
    hideControlsDelayed() {
        this.clearControlsTimeout();
        this.controlsTimeout = setTimeout(() => {
            this.hideControls();
        }, 3000);
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
            // Exited fullscreen
            this.exitFullscreenMode();
        }
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
    
    /**
     * Calculate dynamic video dimensions based on viewport height
     * Video height = 75% of viewport height
     * Video width = height / 2 (maintaining 2:1 aspect ratio)
     */
    calculateDynamicVideoSize() {
        const viewportHeight = window.innerHeight;
        const videoHeight = Math.floor(viewportHeight * 0.75); // 75% of viewport height
        const videoWidth = Math.floor(videoHeight / 2); // Width is half of height (2:1 aspect ratio)
        
        // Set minimum and maximum constraints for usability
        const minHeight = 300;
        const maxHeight = 800;
        const minWidth = 150;
        const maxWidth = 400;
        
        const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, videoHeight));
        const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, videoWidth));
        
        return {
            width: constrainedWidth,
            height: constrainedHeight
        };
    }
    
    /**
     * Apply dynamic sizing to video wrapper
     */
    applyDynamicSizing() {
        if (!this.videoWrapper) return;
        
        const dimensions = this.calculateDynamicVideoSize();
        
        // Apply dimensions to video wrapper
        this.videoWrapper.style.width = `${dimensions.width}px`;
        this.videoWrapper.style.height = `${dimensions.height}px`;
        
        console.log(`Dynamic video sizing applied: ${dimensions.width}x${dimensions.height}px (${Math.round(window.innerHeight * 0.75)}px = 75% of ${window.innerHeight}px viewport)`);
    }
    
    /**
     * Setup dynamic sizing with resize listener
     */
    setupDynamicSizing() {
        // Apply initial sizing
        this.applyDynamicSizing();
        
        // Listen for window resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            // Debounce resize events for performance
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.applyDynamicSizing();
            }, 250);
        });
        
        // Listen for orientation change on mobile devices
        window.addEventListener('orientationchange', () => {
            // Delay to allow orientation change to complete
            setTimeout(() => {
                this.applyDynamicSizing();
            }, 500);
        });
    }
}

// Global functions for HTML onclick handlers
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

// Removed global toggleMute function - using class method only

function toggleFullscreen() {
    window.videoPlayer?.toggleFullscreen();
}

// Initialize video player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.videoPlayer = new MemoryanVideoPlayer();
});

// Handle language changes from i18n system
document.addEventListener('languageChanged', (event) => {
    window.videoPlayer?.detectLanguage();
    window.videoPlayer?.loadVideo();
}); 