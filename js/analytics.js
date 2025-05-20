/**
 * Memoryan Website Analytics
 * Tracks user visits, time spent, and download button clicks
 * Securely sends data to Supabase
 */

class Analytics {
    constructor() {
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.isInitialized = false;
        this.sessionId = this._generateSessionId();
        this.startTime = Date.now();
        this.rateLimiter = new RateLimiter('analytics', 10, 60000); // 10 requests per minute
        this.events = [];
        this.isSubmitting = false;
        this.pageLoadTime = Date.now();
        this.lastInteractionTime = Date.now();
        this.deviceInfo = this._collectDeviceInfo();
    }

    /**
     * Initialize the analytics with Supabase credentials
     * @param {string} supabaseUrl - Supabase project URL
     * @param {string} supabaseKey - Supabase anonymous key
     */
    init(supabaseUrl, supabaseKey) {
        if (this.isInitialized) {
            console.warn('Analytics already initialized');
            return;
        }

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase credentials for analytics');
            return;
        }

        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.isInitialized = true;

        // Track page visit
        this.trackEvent('page_visit');

        // Set up listeners
        this._setupEventListeners();

        // Schedule periodic updates for session duration
        this._scheduleDurationUpdates();

        // Setup beforeunload event to send final data
        window.addEventListener('beforeunload', () => this._handleBeforeUnload());

        console.log('Analytics initialized successfully');
    }

    /**
     * Track an event
     * @param {string} eventType - Type of event (page_visit, download_click)
     * @param {Object} eventData - Additional data about the event
     */
    trackEvent(eventType, eventData = {}) {
        if (!this.isInitialized) {
            console.warn('Cannot track events before analytics is initialized');
            return;
        }

        // Update last interaction time
        this.lastInteractionTime = Date.now();

        // Create event object
        const event = {
            session_id: this.sessionId,
            event_type: eventType,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            referrer: document.referrer || null,
            time_on_page: Date.now() - this.pageLoadTime,
            ...eventData,
            ...this.deviceInfo
        };

        // Add to event queue
        this.events.push(event);

        // Send events if we have enough or for important events
        if (this.events.length >= 3 || eventType === 'download_click') {
            this._sendEvents();
        }
    }

    /**
     * Generate a unique session ID
     * @private
     */
    _generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, 
                  v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Collect basic, non-PII device information
     * @private
     */
    _collectDeviceInfo() {
        return {
            screen_width: window.screen.width,
            screen_height: window.screen.height,
            user_language: navigator.language,
            platform: navigator.platform,
            is_mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        };
    }

    /**
     * Set up event listeners for tracked interactions
     * @private
     */
    _setupEventListeners() {
        // Track download button clicks
        document.querySelectorAll('.download-button, [data-analytics="download"]').forEach(button => {
            button.addEventListener('click', () => {
                this.trackEvent('download_click', {
                    button_id: button.id || null,
                    button_text: button.textContent.trim(),
                    platform: button.getAttribute('data-platform') || 'unknown'
                });
            });
        });

        // Track page scrolling activity
        let lastScrollPosition = 0;
        window.addEventListener('scroll', () => {
            const currentScrollPosition = window.scrollY;
            if (Math.abs(currentScrollPosition - lastScrollPosition) > 100) {
                this.lastInteractionTime = Date.now();
                lastScrollPosition = currentScrollPosition;
            }
        }, { passive: true });

        // Track user interaction to keep session alive
        ['click', 'touchstart', 'mousemove'].forEach(eventType => {
            window.addEventListener(eventType, () => {
                this.lastInteractionTime = Date.now();
            }, { passive: true });
        });
    }

    /**
     * Schedule updates to track session duration
     * @private
     */
    _scheduleDurationUpdates() {
        // Update session duration every minute
        setInterval(() => {
            // Check if user is still active (within last 5 minutes)
            const inactiveTime = Date.now() - this.lastInteractionTime;
            const isSessionActive = inactiveTime < 5 * 60 * 1000; // 5 minutes
            
            if (isSessionActive) {
                this.trackEvent('session_heartbeat', {
                    duration_seconds: Math.floor((Date.now() - this.pageLoadTime) / 1000)
                });
            }
        }, 60 * 1000); // Every minute
    }

    /**
     * Handle before unload event to send final analytics
     * @private
     */
    _handleBeforeUnload() {
        // Create final session event
        const finalEvent = {
            session_id: this.sessionId,
            event_type: 'session_end',
            timestamp: new Date().toISOString(),
            duration_seconds: Math.floor((Date.now() - this.pageLoadTime) / 1000),
            page_url: window.location.href,
            ...this.deviceInfo
        };
        
        this.events.push(finalEvent);
        
        // Send events synchronously
        this._sendEventsSynchronously();
    }

    /**
     * Send queued events to Supabase
     * @private
     */
    async _sendEvents() {
        // Don't send if already submitting or no events
        if (this.isSubmitting || this.events.length === 0 || !this.isInitialized) return;
        
        // Check rate limiter
        if (!this.rateLimiter.canMakeRequest()) {
            console.warn('Analytics rate limit reached, will retry later');
            return;
        }
        
        this.isSubmitting = true;
        const eventsToSend = [...this.events];
        this.events = [];
        
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/website_analytics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseKey,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(eventsToSend)
            });
            
            if (!response.ok) {
                throw new Error(`Analytics submission failed: ${response.status}`);
            }
            
            console.log(`Successfully sent ${eventsToSend.length} analytics events`);
        } catch (error) {
            console.error('Error sending analytics data:', error);
            // Put events back in queue for retry
            this.events = [...eventsToSend, ...this.events];
        } finally {
            this.isSubmitting = false;
        }
    }

    /**
     * Send events synchronously (for beforeunload)
     * @private
     */
    _sendEventsSynchronously() {
        if (this.events.length === 0 || !this.isInitialized) return;

        // Use sendBeacon API for reliable delivery during page unload
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(this.events)], { type: 'application/json' });
            navigator.sendBeacon(`${this.supabaseUrl}/rest/v1/website_analytics`, blob);
        } else {
            // Fallback to synchronous XHR
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${this.supabaseUrl}/rest/v1/website_analytics`, false);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('apikey', this.supabaseKey);
            xhr.send(JSON.stringify(this.events));
        }
    }
}

// Create global analytics instance
window.Memoryan = window.Memoryan || {};
window.Memoryan.Analytics = new Analytics(); 