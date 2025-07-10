/**
 * Simple Video Optimizer for Memoryan Website
 * Only handles video viewport optimization - no image interference
 */

class SimpleVideoOptimizer {
    constructor() {
        this.videos = new Map();
        this.isInitialized = false;
        
        // Auto-initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        if (this.isInitialized) return;
        
        console.log('🎬 Simple Video Optimizer starting...');
        
        // Only set up video management if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            this.setupVideoObserver();
            this.findAndOptimizeVideos();
        }
        
        // Listen for new videos being added
        this.setupMutationObserver();
        
        this.isInitialized = true;
        console.log('✅ Simple Video Optimizer initialized');
    }
    
    setupVideoObserver() {
        // Create observer for videos with generous thresholds
        this.videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                const isVisible = entry.intersectionRatio > 0.1; // 10% visible
                
                this.handleVideoVisibility(video, isVisible);
            });
        }, {
            threshold: [0, 0.1, 0.5, 0.9], // Multiple thresholds for better control
            rootMargin: '50px' // Start loading slightly before entering viewport
        });
        
        console.log('👁️ Video Observer ready');
    }
    
    setupMutationObserver() {
        // Watch for new videos being added to the DOM
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the node itself is a video
                        if (node.tagName === 'VIDEO') {
                            this.optimizeVideo(node);
                        }
                        // Check for videos within the added node
                        const videos = node.querySelectorAll ? node.querySelectorAll('video') : [];
                        videos.forEach(video => this.optimizeVideo(video));
                    }
                });
            });
        });
        
        // Start observing
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    findAndOptimizeVideos() {
        // Find all existing videos
        const allVideos = document.querySelectorAll('video');
        console.log(`🔍 Found ${allVideos.length} videos to optimize`);
        
        allVideos.forEach(video => {
            this.optimizeVideo(video);
        });
    }
    
    optimizeVideo(video) {
        // Skip if already optimized
        if (this.videos.has(video)) return;
        
        // Store video info
        this.videos.set(video, {
            wasPlaying: false,
            hasBeenVisible: false,
            currentTime: 0
        });
        
        // Set up video properties for better performance
        video.preload = 'metadata'; // Only load metadata initially
        
        // Add to intersection observer
        if (this.videoObserver) {
            this.videoObserver.observe(video);
        }
        
        // Store current time when video is paused
        video.addEventListener('pause', () => {
            const videoInfo = this.videos.get(video);
            if (videoInfo) {
                videoInfo.currentTime = video.currentTime;
                videoInfo.wasPlaying = false;
            }
        });
        
        // Track when video starts playing
        video.addEventListener('play', () => {
            const videoInfo = this.videos.get(video);
            if (videoInfo) {
                videoInfo.wasPlaying = true;
            }
        });
        
        console.log(`📹 Video optimized: ${video.id || 'unnamed'}`);
    }
    
    handleVideoVisibility(video, isVisible) {
        const videoInfo = this.videos.get(video);
        if (!videoInfo) return;
        
        if (isVisible) {
            // Video is entering viewport
            videoInfo.hasBeenVisible = true;
            
            // If video was playing before, resume it
            if (videoInfo.wasPlaying && video.paused) {
                console.log(`▶️ Resuming video: ${video.id || 'unnamed'}`);
                
                // Restore current time if it was stored
                if (videoInfo.currentTime > 0) {
                    video.currentTime = videoInfo.currentTime;
                }
                
                // Attempt to resume playback
                video.play().catch(error => {
                    console.warn('Could not resume video playback:', error);
                });
            }
            
        } else {
            // Video is leaving viewport
            if (!video.paused) {
                console.log(`⏸️ Pausing video: ${video.id || 'unnamed'}`);
                
                // Store current state
                videoInfo.wasPlaying = true;
                videoInfo.currentTime = video.currentTime;
                
                // Pause the video to save bandwidth
                video.pause();
            }
        }
    }
    
    // Public method to pause all videos (useful for page navigation)
    pauseAllVideos() {
        this.videos.forEach((videoInfo, video) => {
            if (!video.paused) {
                videoInfo.wasPlaying = false; // Don't auto-resume these
                video.pause();
            }
        });
        
        console.log('⏸️ All videos paused');
    }
    
    // Public method to get optimization stats
    getStats() {
        const totalVideos = this.videos.size;
        const visibleVideos = Array.from(this.videos.keys()).filter(video => {
            const rect = video.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        }).length;
        
        return {
            totalVideos,
            visibleVideos,
            optimizedVideos: totalVideos
        };
    }
    
    // Cleanup method
    cleanup() {
        if (this.videoObserver) {
            this.videoObserver.disconnect();
        }
        
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        this.videos.clear();
        console.log('🧹 Video optimizer cleaned up');
    }
}

// Initialize the video optimizer
window.simpleVideoOptimizer = new SimpleVideoOptimizer();

// Make it available globally for debugging
window.debugVideoOptimizer = () => {
    const stats = window.simpleVideoOptimizer.getStats();
    console.log('🎬 Video Optimizer Stats:', stats);
    return stats;
}; 