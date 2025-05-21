/**
 * Memoryan Website Analytics
 * Tracks user visits, time spent, and download button clicks
 * Securely sends data to Supabase
 */

// Make sure the Analytics class is accessible globally
window.Analytics = class Analytics {
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
        this.debug = true; // Enable debugging
        this.eventQueue = [];
        
        // Debug logs
        this._log('Analytics constructor called');
        this._log(`Session ID: ${this.sessionId}`);
    }

    /**
     * Initialize the analytics with Supabase credentials
     * @param {string} supabaseUrl - Supabase project URL
     * @param {string} supabaseKey - Supabase anonymous key
     */
    async init(supabaseUrl, supabaseKey) {
        if (this.isInitialized) {
            console.warn('Analytics already initialized');
            return true;
        }

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase credentials for analytics');
            return false;
        }

        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        
        try {
            this._log('Analytics init started');
            
            // Get or initialize Supabase client
            let supabaseClient = null;
            
            // First check if window.supabase already exists
            if (window.supabase) {
                this._log('Using existing Supabase client from window.supabase');
                supabaseClient = window.supabase;
            } 
            // Otherwise check if we have MemoryanSupabase available to initialize
            else if (window.MemoryanSupabase) {
                this._log('Initializing Supabase client via MemoryanSupabase');
                try {
                    supabaseClient = await window.MemoryanSupabase.initialize(supabaseUrl, supabaseKey);
                    this._log('Successfully initialized Supabase client');
                } catch (supabaseError) {
                    this._error('Error initializing Supabase client', supabaseError);
                    return false;
                }
            } else {
                this._error('No method available to initialize Supabase - missing both window.supabase and MemoryanSupabase');
                return false;
            }
            
            // Verify we have a valid client
            if (!supabaseClient) {
                this._error('Failed to get valid Supabase client');
                return false;
            }
            
            // Set up global access to the client
            window.supabase = supabaseClient;
            
            // Mark as initialized only after we confirm Supabase is available
            this.isInitialized = true;
            this._log('Analytics initialized successfully');
            
            // Process any queued events
            await this._processQueue();
            
            // Track initial page visit
            this.trackPageVisit();
            
            // Setup beforeunload event for session tracking
            window.addEventListener('beforeunload', () => {
                this.trackSessionEnd();
            });
            
            // Attach to all download buttons
            this._attachToDownloadButtons();
            
            return true;
        } catch (error) {
            this._error('Error initializing analytics', error);
            return false;
        }
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
     * Track a page visit
     */
    trackPageVisit() {
        try {
            this._log('Tracking page visit');
            const eventData = {
                event_type: 'page_visit',
                page_url: window.location.href,
                referrer: document.referrer || null,
                time_on_page: 0,
                platform: this._detectPlatform(),
                screen_width: window.innerWidth,
                screen_height: window.innerHeight,
                user_language: navigator.language || navigator.userLanguage,
                is_mobile: this._isMobile()
            };
            
            this._log('Page visit data:', eventData);
            this._trackEvent(eventData);
        } catch (error) {
            this._error('Error tracking page visit', error);
        }
    }
    
    /**
     * Track a button click
     * @param {HTMLElement} buttonElement The button that was clicked
     */
    trackButtonClick(buttonElement) {
        try {
            if (!buttonElement) {
                this._error('Button element is null or undefined');
                return;
            }
            
            this._log('Tracking button click', buttonElement);
            
            // Extract button information
            const buttonId = buttonElement.id || buttonElement.getAttribute('data-analytics') || 'unknown';
            const buttonText = buttonElement.textContent || 'unknown';
            
            const eventData = {
                event_type: 'button_click',
                page_url: window.location.href,
                platform: this._detectPlatform(),
                is_mobile: this._isMobile(),
                button_id: buttonId,
                button_text: buttonText
            };
            
            this._log('Button click data:', eventData);
            this._trackEvent(eventData);
        } catch (error) {
            this._error('Error tracking button click', error);
        }
    }
    
    /**
     * Track a download button click
     * @param {HTMLElement} buttonElement The button that was clicked
     */
    trackDownloadClick(buttonElement) {
        try {
            if (!buttonElement) {
                this._error('Download button element is null or undefined');
                return;
            }
            
            this._log('Tracking download click', buttonElement);
            
            // Extract platform information from button
            const platform = buttonElement.getAttribute('data-platform') || 'unknown';
            
            const eventData = {
                event_type: 'download_click',
                page_url: window.location.href,
                platform: this._detectPlatform(),
                is_mobile: this._isMobile(),
                button_id: buttonElement.id || `${platform}-download`,
                button_text: buttonElement.textContent || 'Download'
            };
            
            this._log('Download click data:', eventData);
            this._trackEvent(eventData);
        } catch (error) {
            this._error('Error tracking download click', error);
        }
    }
    
    /**
     * Track session end when user leaves the page
     */
    trackSessionEnd() {
        try {
            this._log('Tracking session end');
            const sessionDuration = Math.floor((Date.now() - this.pageLoadTime) / 1000);
            
            const eventData = {
                event_type: 'session_end',
                page_url: window.location.href,
                platform: this._detectPlatform(),
                is_mobile: this._isMobile(),
                duration_seconds: sessionDuration
            };
            
            this._log('Session end data:', eventData);
            this._trackEvent(eventData, true); // Force immediate send on page unload
        } catch (error) {
            this._error('Error tracking session end', error);
        }
    }
    
    /**
     * Test function to manually trigger an event for debugging
     */
    testAnalytics() {
        this._log('Running analytics test');
        if (!this.isInitialized) {
            this._log('Analytics not initialized, attempting to initialize now');
            this.init(this.supabaseUrl, this.supabaseKey).then(success => {
                if (success) {
                    this._sendTestEvent();
                } else {
                    this._error('Failed to initialize analytics for test');
                    alert('Analytics initialization failed. Check console for details.');
                }
            });
        } else {
            this._sendTestEvent();
        }
    }
    
    /**
     * Send a test event to Supabase
     * @private
     */
    _sendTestEvent() {
        try {
            const testEvent = {
                event_type: 'test_event',
                page_url: window.location.href,
                referrer: 'test-referrer',
                platform: this._detectPlatform(),
                screen_width: window.innerWidth,
                screen_height: window.innerHeight,
                user_language: navigator.language,
                is_mobile: this._isMobile(),
                button_id: 'test-button',
                button_text: 'Test Analytics'
            };
            
            this._log('Sending test event:', testEvent);
            
            // Force immediate processing
            this._trackEvent(testEvent, true).then(result => {
                if (result) {
                    this._log('Test event sent successfully');
                    alert('Test event sent successfully! Check Supabase.');
                } else {
                    this._error('Test event failed to send');
                    alert('Test event failed. Check console for details.');
                }
            });
        } catch (error) {
            this._error('Error sending test event', error);
            alert(`Error: ${error.message}`);
        }
    }
    
    /**
     * Private method to track an event
     * @param {Object} eventData The event data to track
     * @param {boolean} immediate Whether to send immediately (for beforeunload)
     * @private
     */
    async _trackEvent(eventData, immediate = false) {
        try {
            // Add session ID to event data
            const fullEventData = {
                ...eventData,
                session_id: this.sessionId
            };
            
            this._log(`Preparing to track event: ${eventData.event_type}`, fullEventData);
            
            if (!this.isInitialized) {
                this._log('Analytics not initialized, queueing event');
                this.eventQueue.push(fullEventData);
                return false;
            }
            
            // If we need to send immediately (e.g., beforeunload)
            if (immediate) {
                this._log('Sending event immediately (bypassing rate limit)');
                return await this._sendToSupabase(fullEventData);
            }
            
            // Otherwise, use rate limiting
            if (this.rateLimiter.canMakeRequest()) {
                this._log('Rate limit allows request, sending event');
                return await this._sendToSupabase(fullEventData);
            } else {
                this._log('Rate limited, queueing event');
                this.eventQueue.push(fullEventData);
                return false;
            }
        } catch (error) {
            this._error('Error in _trackEvent', error);
            return false;
        }
    }
    
    /**
     * Send event data to Supabase
     * @param {Object} eventData The event data to send
     * @private
     */
    async _sendToSupabase(eventData) {
        try {
            if (!window.supabase) {
                // Try to get client from MemoryanSupabase
                if (window.MemoryanSupabase && window.MemoryanSupabase.client) {
                    window.supabase = window.MemoryanSupabase.client;
                    this._log('Retrieved Supabase client from MemoryanSupabase');
                } else if (window.MemoryanConfig && window.MemoryanConfig.supabase) {
                    // Try to initialize
                    this._log('Trying to initialize Supabase client');
                    const { url, anonKey } = window.MemoryanConfig.supabase;
                    if (window.MemoryanSupabase) {
                        try {
                            const client = await window.MemoryanSupabase.initialize(url, anonKey);
                            this._log('Successfully initialized Supabase client');
                            window.supabase = client;
                        } catch (initError) {
                            this._error('Failed to initialize Supabase', initError);
                            return false;
                        }
                    } else {
                        this._error('MemoryanSupabase not available for initialization');
                        return false;
                    }
                } else {
                    this._error('Supabase client not found when sending data');
                    return false;
                }
            }
            
            this._log('Sending to Supabase:', eventData);
            
            // Directly submit to Supabase
            const { data, error } = await window.supabase
                .from('website_analytics')
                .insert(eventData)
                .select();
            
            if (error) {
                this._error('Supabase error when sending data', error);
                return false;
            }
            
            this._log('Successfully sent event to Supabase', data);
            return true;
        } catch (error) {
            this._error('Exception when sending to Supabase', error);
            return false;
        }
    }
    
    /**
     * Process any queued events
     * @private
     */
    async _processQueue() {
        if (this.eventQueue.length === 0) {
            this._log('No events in queue to process');
            return;
        }
        
        this._log(`Processing queue of ${this.eventQueue.length} events`);
        
        // Clone and clear the queue
        const queueToProcess = [...this.eventQueue];
        this.eventQueue = [];
        
        // Process each event
        for (const eventData of queueToProcess) {
            if (this.rateLimiter.canMakeRequest()) {
                this._log('Processing queued event', eventData);
                await this._sendToSupabase(eventData);
            } else {
                this._log('Rate limit hit while processing queue, re-queueing event');
                this.eventQueue.push(eventData);
                break;
            }
        }
    }
    
    /**
     * Attach event listeners to download buttons
     * @private
     */
    _attachToDownloadButtons() {
        try {
            this._log('Attaching to download buttons');
            const downloadButtons = document.querySelectorAll('.download-button');
            
            this._log(`Found ${downloadButtons.length} download buttons`);
            
            downloadButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    this._log('Download button clicked', e.target);
                    this.trackDownloadClick(e.target);
                });
            });
        } catch (error) {
            this._error('Error attaching to download buttons', error);
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
     * Detect the user's platform
     * @returns {string} The detected platform
     * @private
     */
    _detectPlatform() {
        const ua = navigator.userAgent.toLowerCase();
        
        if (ua.indexOf('android') > -1) return 'android';
        if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1 || ua.indexOf('ipod') > -1) return 'ios';
        if (ua.indexOf('windows') > -1) return 'windows';
        if (ua.indexOf('mac os x') > -1) return 'mac';
        if (ua.indexOf('linux') > -1) return 'linux';
        
        return 'unknown';
    }
    
    /**
     * Check if the user is on a mobile device
     * @returns {boolean} Whether the user is on a mobile device
     * @private
     */
    _isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    /**
     * Log a debug message
     * @param {string} message The message to log
     * @param {*} data Optional data to log
     * @private
     */
    _log(message, data) {
        if (this.debug) {
            if (data) {
                console.log(`📊 Analytics: ${message}`, data);
            } else {
                console.log(`📊 Analytics: ${message}`);
            }
        }
    }
    
    /**
     * Log an error message
     * @param {string} message The error message
     * @param {Error} error Optional error object
     * @private
     */
    _error(message, error) {
        console.error(`❌ Analytics Error: ${message}`, error || '');
    }
}

// Create global analytics instance
window.Memoryan = window.Memoryan || {};
window.Memoryan.Analytics = new Analytics();

// Automatically initialize analytics when config is available
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Analytics: DOM loaded, checking for config...');
    
    // Create window.analytics alias for compatibility with older code
    if (!window.analytics && window.Memoryan && window.Memoryan.Analytics) {
        window.analytics = window.Memoryan.Analytics;
        console.log('📊 Analytics: Created window.analytics alias');
    }
    
    // Add test button to page for debugging
    setTimeout(() => {
        // This runs after a small delay to ensure the DOM is fully ready
        const footer = document.querySelector('footer');
        if (footer) {
            // Create test button
            const testButton = document.createElement('button');
            testButton.id = 'test-analytics-button';
            testButton.textContent = 'Test Analytics';
            testButton.style.position = 'fixed';
            testButton.style.bottom = '10px';
            testButton.style.right = '10px';
            testButton.style.zIndex = '9999';
            testButton.style.padding = '8px 12px';
            testButton.style.backgroundColor = 'rgba(0, 128, 255, 0.8)';
            testButton.style.color = 'white';
            testButton.style.border = 'none';
            testButton.style.borderRadius = '4px';
            testButton.style.cursor = 'pointer';
            testButton.style.fontFamily = 'Lato, sans-serif';
            testButton.style.fontSize = '14px';
            testButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            
            // Add click event
            testButton.addEventListener('click', () => {
                if (window.Memoryan && window.Memoryan.Analytics) {
                    window.Memoryan.Analytics.testAnalytics();
                } else {
                    console.error('❌ Analytics object not found');
                    alert('Analytics object not found');
                }
            });
            
            // Add to page
            document.body.appendChild(testButton);
            console.log('📊 Analytics: Test button added to page');
        }
    }, 500);
    
    // Function to initialize analytics
    function initializeAnalytics() {
        // Check if already initialized
        if (window.Memoryan && window.Memoryan.Analytics && window.Memoryan.Analytics.isInitialized) {
            console.log('📊 Analytics: Already initialized');
            return;
        }
        
        // Check if config is available
        if (window.MemoryanConfig && window.MemoryanConfig.analytics && window.MemoryanConfig.analytics.enabled) {
            console.log('📊 Analytics: Config found, initializing...');
            
            if (window.Memoryan && window.Memoryan.Analytics) {
                // Check if Supabase is ready
                if (window.supabase) {
                    console.log('📊 Analytics: Supabase already available, initializing now');
                    window.Memoryan.Analytics.init(
                        window.MemoryanConfig.supabase.url, 
                        window.MemoryanConfig.supabase.anonKey
                    ).then(success => {
                        console.log('📊 Analytics: Initialization ' + (success ? 'successful' : 'failed'));
                        
                        // Create global window.analytics for compatibility with existing code
                        window.analytics = window.Memoryan.Analytics;
                    });
                } else if (window.MemoryanSupabase) {
                    console.log('📊 Analytics: Waiting for Supabase to be initialized first');
                    
                    // Check if supabase-loader has already started initialization
                    const checkInterval = setInterval(() => {
                        if (window.supabase) {
                            clearInterval(checkInterval);
                            console.log('📊 Analytics: Supabase became available, initializing now');
                            
                            window.Memoryan.Analytics.init(
                                window.MemoryanConfig.supabase.url, 
                                window.MemoryanConfig.supabase.anonKey
                            ).then(success => {
                                console.log('📊 Analytics: Delayed initialization ' + (success ? 'successful' : 'failed'));
                                window.analytics = window.Memoryan.Analytics;
                            });
                        }
                    }, 100); // Check every 100ms
                    
                    // Stop checking after 10 seconds to avoid infinite loop
                    setTimeout(() => {
                        if (checkInterval) {
                            clearInterval(checkInterval);
                            console.error('❌ Analytics: Timed out waiting for Supabase to initialize');
                        }
                    }, 10000);
                } else {
                    console.error('❌ Analytics: No Supabase library available to initialize');
                }
            } else {
                console.error('❌ Analytics: Memoryan.Analytics not available');
            }
        } else {
            console.log('📊 Analytics: Config not found or analytics disabled');
        }
    }
    
    // Wait a short time for other scripts to load and initialize
    setTimeout(initializeAnalytics, 100);
}); 
