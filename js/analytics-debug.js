/**
 * Memoryan Website Analytics - DEBUG VERSION
 * Tracks user visits, time spent, and download button clicks
 * This version includes extensive logging for troubleshooting
 */

class AnalyticsDebug {
    constructor() {
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.isInitialized = false;
        this.sessionId = this._generateSessionId();
        console.log('Analytics DEBUG: New session created:', this.sessionId);
        this.startTime = Date.now();
        this.rateLimiter = new RateLimiter('analytics', 50, 60000); // Increased limit for testing
        this.events = [];
        this.isSubmitting = false;
        this.pageLoadTime = Date.now();
        this.lastInteractionTime = Date.now();
        this.deviceInfo = this._collectDeviceInfo();
        console.log('Analytics DEBUG: Device info:', this.deviceInfo);
    }

    /**
     * Initialize the analytics with Supabase credentials
     * @param {string} supabaseUrl - Supabase project URL
     * @param {string} supabaseKey - Supabase anonymous key
     */
    async init(supabaseUrl, supabaseKey) {
        console.log('Analytics DEBUG: Initializing with URL:', supabaseUrl);
        
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
        
        try {
            // Initialize Supabase if the loader is available
            if (window.MemoryanSupabase) {
                await window.MemoryanSupabase.initialize(supabaseUrl, supabaseKey);
                console.log('Analytics DEBUG: Using shared Supabase client');
            }
            
            this.isInitialized = true;
            console.log('Analytics DEBUG: Successfully initialized');
            
            // Create a test event
            this.trackEvent('debug_initialization', {
                debug_message: 'Analytics initialized successfully'
            });
            
            // Track page visit
            this.trackEvent('page_visit');

            // Set up listeners
            this._setupEventListeners();

            // Schedule periodic updates for session duration
            this._scheduleDurationUpdates();

            // Setup beforeunload event to send final data
            window.addEventListener('beforeunload', () => this._handleBeforeUnload());

            console.log('Analytics DEBUG: Complete initialization successful');
            
            // Do an immediate test send
            await this._forceSendEvents();
        } catch (error) {
            console.error('Analytics DEBUG: Error initializing analytics:', error);
        }
    }

    /**
     * Force send all pending events (for testing)
     */
    async _forceSendEvents() {
        console.log('Analytics DEBUG: Force sending events now...');
        if (this.events.length === 0) {
            console.log('Analytics DEBUG: No events to send');
            
            // Create a test event and send it right away
            this.trackEvent('debug_test_event', {
                timestamp_ms: Date.now(),
                test_value: 'Generated for testing'
            });
        }
        
        return await this._sendEvents(true);
    }

    /**
     * Track an event
     * @param {string} eventType - Type of event (page_visit, download_click)
     * @param {Object} eventData - Additional data about the event
     */
    trackEvent(eventType, eventData = {}) {
        if (!this.isInitialized) {
            console.warn('Analytics DEBUG: Cannot track events before analytics is initialized');
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

        console.log('Analytics DEBUG: Tracking event:', eventType, event);

        // Add to event queue
        this.events.push(event);
        console.log('Analytics DEBUG: Events queue size:', this.events.length);

        // Send events if we have enough or for important events
        if (this.events.length >= 3 || eventType === 'download_click' || eventType.startsWith('debug_')) {
            this._sendEvents();
        }
    }

    /**
     * Generate a unique session ID
     * @private
     */
    _generateSessionId() {
        return 'debug-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
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
        console.log('Analytics DEBUG: Setting up event listeners');
        // Track download button clicks
        const downloadButtons = document.querySelectorAll('.download-button, [data-analytics="download"]');
        console.log('Analytics DEBUG: Found download buttons:', downloadButtons.length);
        
        downloadButtons.forEach((button, index) => {
            console.log(`Analytics DEBUG: Button ${index}:`, button.outerHTML);
            button.addEventListener('click', () => {
                console.log('Analytics DEBUG: Download button clicked:', button);
                this.trackEvent('download_click', {
                    button_id: button.id || null,
                    button_text: button.textContent.trim(),
                    platform: button.getAttribute('data-platform') || 'unknown'
                });
            });
        });

        // Create test button for immediate verification
        const createTestButton = () => {
            // Only create if it doesn't exist yet
            if (document.getElementById('analytics-debug-test-btn')) {
                return;
            }
            
            const testBtnContainer = document.createElement('div');
            testBtnContainer.style.position = 'fixed';
            testBtnContainer.style.bottom = '10px';
            testBtnContainer.style.right = '10px';
            testBtnContainer.style.zIndex = '9999';
            testBtnContainer.style.padding = '5px';
            testBtnContainer.style.background = '#f1f1f1';
            testBtnContainer.style.border = '1px solid #ddd';
            testBtnContainer.style.borderRadius = '4px';
            
            const testBtn = document.createElement('button');
            testBtn.id = 'analytics-debug-test-btn';
            testBtn.textContent = 'Test Analytics';
            testBtn.style.padding = '5px 10px';
            testBtn.style.cursor = 'pointer';
            
            testBtn.addEventListener('click', async () => {
                console.log('Analytics DEBUG: Test button clicked');
                this.trackEvent('debug_test_event', {
                    timestamp_ms: Date.now(),
                    test_value: 'Manual test event'
                });
                
                // Force send immediately
                await this._forceSendEvents();
            });
            
            testBtnContainer.appendChild(testBtn);
            document.body.appendChild(testBtnContainer);
            console.log('Analytics DEBUG: Added test button');
        };
        
        // Add the test button after a short delay
        setTimeout(createTestButton, 1000);
    }

    /**
     * Schedule updates to track session duration
     * @private
     */
    _scheduleDurationUpdates() {
        console.log('Analytics DEBUG: Scheduling duration updates');
        // Update session duration every minute
        setInterval(() => {
            // Check if user is still active (within last 5 minutes)
            const inactiveTime = Date.now() - this.lastInteractionTime;
            const isSessionActive = inactiveTime < 5 * 60 * 1000; // 5 minutes
            
            console.log('Analytics DEBUG: Session heartbeat check, active=', isSessionActive);
            
            if (isSessionActive) {
                this.trackEvent('session_heartbeat', {
                    duration_seconds: Math.floor((Date.now() - this.pageLoadTime) / 1000)
                });
            }
        }, 30000); // Every 30 seconds for testing
    }

    /**
     * Handle before unload event to send final analytics
     * @private
     */
    _handleBeforeUnload() {
        console.log('Analytics DEBUG: Page unload detected, sending final data');
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
    async _sendEvents(force = false) {
        // Don't send if already submitting or no events
        if (!force && (this.isSubmitting || this.events.length === 0 || !this.isInitialized)) {
            console.log('Analytics DEBUG: Skipping send, conditions not met:', {
                isSubmitting: this.isSubmitting,
                eventsCount: this.events.length,
                isInitialized: this.isInitialized
            });
            return false;
        }
        
        // Check rate limiter
        if (!force && !this.rateLimiter.canMakeRequest()) {
            console.warn('Analytics DEBUG: Rate limit reached, will retry later');
            return false;
        }
        
        this.isSubmitting = true;
        const eventsToSend = [...this.events];
        this.events = [];
        
        console.log('Analytics DEBUG: Sending events to Supabase:', eventsToSend);
        console.log('Analytics DEBUG: Full URL:', `${this.supabaseUrl}/rest/v1/website_analytics`);
        
        try {
            // Verify the table exists by checking permissions first
            const checkResponse = await fetch(`${this.supabaseUrl}/rest/v1/website_analytics?limit=1`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseKey,
                }
            });
            
            console.log('Analytics DEBUG: Table check response:', checkResponse);
            
            if (!checkResponse.ok) {
                console.error('Analytics DEBUG: Table access error:', checkResponse.status, await checkResponse.text());
            }
            
            // Now attempt the actual data submission
            const response = await fetch(`${this.supabaseUrl}/rest/v1/website_analytics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseKey,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(eventsToSend)
            });
            
            console.log('Analytics DEBUG: POST response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Analytics DEBUG: POST response error:', errorText);
                throw new Error(`Analytics submission failed: ${response.status} - ${errorText}`);
            }
            
            console.log(`Analytics DEBUG: Successfully sent ${eventsToSend.length} analytics events`);
            return true;
        } catch (error) {
            console.error('Analytics DEBUG: Error sending analytics data:', error);
            // Put events back in queue for retry
            this.events = [...eventsToSend, ...this.events];
            return false;
        } finally {
            this.isSubmitting = false;
        }
    }

    /**
     * Send events synchronously (for beforeunload)
     * @private
     */
    _sendEventsSynchronously() {
        if (this.events.length === 0 || !this.isInitialized) {
            console.log('Analytics DEBUG: No events to send synchronously');
            return;
        }

        console.log('Analytics DEBUG: Sending events synchronously:', this.events);
        
        // Use sendBeacon API for reliable delivery during page unload
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(this.events)], { type: 'application/json' });
            const success = navigator.sendBeacon(`${this.supabaseUrl}/rest/v1/website_analytics`, blob);
            console.log('Analytics DEBUG: sendBeacon success:', success);
        } else {
            // Fallback to synchronous XHR
            console.log('Analytics DEBUG: Using XHR fallback');
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${this.supabaseUrl}/rest/v1/website_analytics`, false);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('apikey', this.supabaseKey);
            xhr.send(JSON.stringify(this.events));
            console.log('Analytics DEBUG: XHR status:', xhr.status);
        }
    }
}

// Create global analytics instance
window.Memoryan = window.Memoryan || {};
window.Memoryan.AnalyticsDebug = new AnalyticsDebug();

// Emit message when loaded
console.log('Analytics DEBUG: Script loaded, awaiting initialization'); 