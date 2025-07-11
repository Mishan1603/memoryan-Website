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
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 20; // Maximum number of attempts (10 seconds with 500ms interval)
        this.isInitializing = false; // Flag to prevent multiple simultaneous initialization attempts
        this.liveStatsCallbacks = []; // Callbacks for live stats updates
        this.sessionHeartbeatInterval = null; // Interval for sending session heartbeats
        this.sessionActive = true; // Flag to track if session is active
        this.lastVisibilityChangeTime = null; // Added for visibility change tracking
        this.lastStatsRefresh = Date.now(); // Added for real-time stats tracking
        
        // Debug logs
        this._log('Analytics constructor called');
        this._log(`Session ID: ${this.sessionId}`);
        
        // Set up visibility change listener for better session tracking
        this._setupVisibilityListener();
    }

    /**
     * Set up page visibility listener for better session tracking
     * @private
     */
    _setupVisibilityListener() {
        try {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    this._log('Page hidden, marking time and considering session pause');
                    this.lastInteractionTime = Date.now();
                    
                    // Send "page_blur" event to mark when user navigated away
                    if (this.isInitialized) {
                        const eventData = {
                            event_type: 'page_blur',
                            time_on_page: Date.now() - this.pageLoadTime,
                            page_url: window.location.href
                        };
                        this._trackEvent(eventData, true); // Send immediately
                    }
                } else if (document.visibilityState === 'visible') {
                    this._log('Page visible again, resuming session tracking');
                    
                    // When page comes back to visibility, update metrics
                    // This handles cases like tab switching without full page unload
                    if (this.isInitialized) {
                        const eventData = {
                            event_type: 'page_focus',
                            time_on_page: Date.now() - this.pageLoadTime,
                            page_url: window.location.href
                        };
                        this._trackEvent(eventData);
                        
                        // Refresh live stats
                        this._fetchLiveStats();
                    }
                }
            });
            
            // Also set up beforeunload for true page exits
            window.addEventListener('beforeunload', () => {
                this.trackSessionEnd();
            });
            
            // Setup heartbeat mechanism for better session tracking
            this._setupSessionHeartbeat();
        } catch (error) {
            this._error('Error setting up visibility listener', error);
        }
    }

    /**
     * Set up session heartbeat for accurate session tracking
     * @private
     */
    _setupSessionHeartbeat() {
        // Clear any existing heartbeat
        if (this.sessionHeartbeatInterval) {
            clearInterval(this.sessionHeartbeatInterval);
        }
        
        // Set heartbeat interval (every 30 seconds)
        const heartbeatInterval = 30000; // 30 seconds
        
        this.sessionHeartbeatInterval = setInterval(() => {
            if (this.isInitialized && this.sessionActive && document.visibilityState === 'visible') {
                const timeSinceLastInteraction = Date.now() - this.lastInteractionTime;
                
                // Update last interaction time to keep session active
                this.lastInteractionTime = Date.now();
                
                // Send heartbeat event if session is active and page is visible
                const eventData = {
                    event_type: 'session_heartbeat',
                    time_on_page: Date.now() - this.pageLoadTime,
                    idle_time: timeSinceLastInteraction,
                    page_url: window.location.href
                };
                
                this._trackEvent(eventData);
                this._log(`Sending session heartbeat (idle: ${Math.round(timeSinceLastInteraction/1000)}s)`);
            }
        }, heartbeatInterval);
        
        this._log(`Session heartbeat set up (interval: ${heartbeatInterval}ms)`);
    }

    /**
     * Check if analytics cookies are allowed by user preferences
     * @returns {boolean} True if analytics is allowed
     * @private
     */
    _isAnalyticsAllowed() {
        try {
            // Check if user has accepted cookies
            const hasAcceptedCookies = localStorage.getItem('cookiesAccepted');
            if (!hasAcceptedCookies) {
                this._log('User has not accepted cookies yet');
                return false;
            }

            // Check specific cookie preferences
            const preferences = localStorage.getItem('memoryan_cookie_preferences');
            if (preferences) {
                const cookiePrefs = JSON.parse(preferences);
                const analyticsAllowed = cookiePrefs.analytics === true;
                this._log(`Analytics cookies allowed: ${analyticsAllowed}`);
                return analyticsAllowed;
            }

            // If no specific preferences but cookies accepted, assume analytics is allowed
            // This handles legacy behavior where accepting meant accepting all
            this._log('No specific preferences found, but cookies accepted - allowing analytics');
            return true;
        } catch (error) {
            this._error('Error checking analytics permissions', error);
            // Default to not allowed if there's an error
            return false;
        }
    }

    /**
     * Initialize the analytics with Supabase credentials
     * @param {string} supabaseUrl - Supabase project URL
     * @param {string} supabaseKey - Supabase anonymous key
     */
    async init(supabaseUrl, supabaseKey) {
        // If already initialized, return immediately
        if (this.isInitialized) {
            this._log('Analytics already initialized');
            return true;
        }

        // Check if analytics cookies are allowed before proceeding
        if (!this._isAnalyticsAllowed()) {
            this._log('Analytics cookies not allowed by user preferences - skipping initialization');
            return false;
        }

        // If initialization is in progress, wait for it
        if (this.isInitializing) {
            this._log('Initialization already in progress, waiting...');
            // Wait for current initialization to finish
            for (let i = 0; i < 20; i++) { // Wait up to 2 seconds
                await new Promise(resolve => setTimeout(resolve, 100));
                if (this.isInitialized) {
                    this._log('Analytics became initialized while waiting');
                    return true;
                }
            }
            this._log('Timed out waiting for existing initialization to complete');
            return false;
        }

        this.isInitializing = true;
        this.initializationAttempts++;

        if (!supabaseUrl || !supabaseKey) {
            this._error('Missing Supabase credentials for analytics');
            this.isInitializing = false;
            return false;
        }

        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        
        try {
            this._log(`Analytics init started (attempt ${this.initializationAttempts}/${this.maxInitializationAttempts})`);
            
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
                    
                    // Retry initialization if we haven't exceeded max attempts
                    if (this.initializationAttempts < this.maxInitializationAttempts) {
                        this.isInitializing = false;
                        // Retry with exponential backoff (500ms, 1000ms, 1500ms, etc.)
                        const delay = Math.min(500 * this.initializationAttempts, 2000);
                        this._log(`Retrying initialization in ${delay}ms...`);
                        setTimeout(() => {
                            this.init(supabaseUrl, supabaseKey);
                        }, delay);
                    } else {
                        this._error(`Failed to initialize after ${this.maxInitializationAttempts} attempts`);
                        this.isInitializing = false;
                    }
                    return false;
                }
            } else {
                // Last resort - try to use ensureSupabaseInitialized helper if available
                if (window.ensureSupabaseInitialized) {
                    try {
                        this._log('Attempting to initialize via ensureSupabaseInitialized');
                        supabaseClient = await window.ensureSupabaseInitialized();
                        this._log('Successfully initialized Supabase via helper');
                    } catch (helperError) {
                        this._error('Helper initialization failed', helperError);
                    }
                }
                
                if (!supabaseClient) {
                    this._error('No method available to initialize Supabase');
                    this.isInitializing = false;
                    return false;
                }
            }
            
            // Verify we have a valid client
            if (!supabaseClient) {
                this._error('Failed to get valid Supabase client');
                this.isInitializing = false;
                return false;
            }
            
            // Set up global access to the client
            window.supabase = supabaseClient;
            
            // Mark as initialized only after we confirm Supabase is available
            this.isInitialized = true;
            this.isInitializing = false;
            this._log('Analytics initialized successfully');
            
            // Create bridge between window.analytics and window.Memoryan.Analytics
            if (window.analytics !== this) {
                window.analytics = this;
                this._log('Created bridge: window.analytics → window.Memoryan.Analytics');
            }
            
            // Process any queued events
            await this._processQueue();
            
            // Track initial page visit
            this.trackPageVisit();
            
            // Attach to all download buttons
            this._attachToDownloadButtons();
            
            // Start periodic live stats updates
            this._startLiveStatsUpdates();
            
            // Reset page load time to now to ensure accurate time tracking
            this.pageLoadTime = Date.now();
            this.lastInteractionTime = Date.now();
            this.sessionActive = true;
            
            // Set up beforeunload and unload event listeners for better session_end tracking
            window.addEventListener('beforeunload', () => {
                this.trackSessionEnd();
            });
            
            window.addEventListener('unload', () => {
                this.trackSessionEnd();
            });
            
            // Also track visibility change for better session tracking
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    // Don't end the session, but record the time for accurate duration
                    this.lastVisibilityChangeTime = Date.now();
                } else if (document.visibilityState === 'visible' && this.lastVisibilityChangeTime) {
                    // Update page load time when coming back to adjust for time away
                    const timeAway = Date.now() - this.lastVisibilityChangeTime;
                    if (timeAway > 30000) { // If away for more than 30 seconds
                        this.pageLoadTime += timeAway;
                    }
                }
            });
            
            return true;
        } catch (error) {
            this._error('Error initializing analytics', error);
            this.isInitializing = false;
            return false;
        }
    }

    /**
     * Register a callback for live stats updates
     * @param {Function} callback Function to call with updated stats
     */
    registerLiveStatsCallback(callback) {
        if (typeof callback === 'function') {
            this.liveStatsCallbacks.push(callback);
            this._log(`Registered live stats callback, total callbacks: ${this.liveStatsCallbacks.length}`);
            
            // If we already have stats, call immediately with current data
            if (this.liveStats) {
                callback(this.liveStats);
            }
        }
    }
    
    /**
     * Start periodic updates for live stats
     * @private
     */
    _startLiveStatsUpdates() {
        if (!this.liveStatsInterval) {
            this._log('Starting live stats updates');
            
            // Initial stats fetch
            this._fetchLiveStats();
            
            // Create ticker for real-time second counter
            this.tickerInterval = setInterval(() => {
                if (this.liveStats) {
                    // Update the timestamp to show real-time counting
                    this.liveStats.timestamp = new Date().toISOString();
                    
                    // Update seconds since last refresh
                    const secondsSinceRefresh = Math.floor((Date.now() - this.lastStatsRefresh) / 1000);
                    this.liveStats.secondsSinceRefresh = secondsSinceRefresh;
                    
                    // Notify all callbacks with the updated timestamp
                    this.liveStatsCallbacks.forEach(callback => {
                        try {
                            callback(this.liveStats);
                        } catch (callbackError) {
                            this._error('Error in live stats ticker callback', callbackError);
                        }
                    });
                }
            }, 1000); // Update every second for a clock-like effect
            
            // Set up interval for regular data refreshes from server (every 10 seconds)
            this.liveStatsInterval = setInterval(() => {
                this._fetchLiveStats();
            }, 10000);
        }
    }
    
    /**
     * Fetch live stats from Supabase
     * @private
     */
    async _fetchLiveStats() {
        if (!this.isInitialized || !window.supabase) {
            return;
        }
        
        try {
            // Record refresh time
            this.lastStatsRefresh = Date.now();
            
            // Current timestamp for today's date
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            
            // Fetch today's unique visitors
            const { data: todayData, error: todayError } = await window.supabase
                .from('website_analytics')
                .select('session_id')
                .gte('timestamp', today)
                .eq('event_type', 'page_visit');
            
            if (todayError) {
                this._error('Error fetching today\'s stats', todayError);
                return;
            }
            
            // Count unique session IDs
            const uniqueSessionIds = new Set();
            if (todayData && todayData.length > 0) {
                todayData.forEach(row => {
                    if (row.session_id) uniqueSessionIds.add(row.session_id);
                });
            }
            
            // Fetch stats for active visitors (last 2 minutes)
            // We use both heartbeats and page visits for accurate counting
            const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000).toISOString();
            const { data: activeData, error: activeError } = await window.supabase
                .from('website_analytics')
                .select('session_id, event_type, timestamp')
                .in('event_type', ['page_visit', 'session_heartbeat', 'page_focus'])
                .gte('timestamp', twoMinutesAgo);
            
            if (activeError) {
                this._error('Error fetching active visitors', activeError);
                return;
            }
            
            // Count unique active session IDs
            // For "active" status, we want the most recent event per session
            const activeSessionIds = new Set();
            const sessionLastActivity = {};
            
            if (activeData && activeData.length > 0) {
                // First collect the latest timestamp for each session
                activeData.forEach(row => {
                    if (row.session_id) {
                        const timestamp = new Date(row.timestamp).getTime();
                        if (!sessionLastActivity[row.session_id] || timestamp > sessionLastActivity[row.session_id]) {
                            sessionLastActivity[row.session_id] = timestamp;
                        }
                    }
                });
                
                // Then count as active if the last activity was within the time window
                // and we haven't seen a session_end event after that
                for (const [sessionId, lastActivity] of Object.entries(sessionLastActivity)) {
                    // Check if this session has ended
                    const { data: sessionEndData } = await window.supabase
                        .from('website_analytics')
                        .select('timestamp')
                        .eq('event_type', 'session_end')
                        .eq('session_id', sessionId)
                        .gte('timestamp', twoMinutesAgo)
                        .order('timestamp', { ascending: false })
                        .limit(1);
                    
                    // If no session_end event or last activity is newer than last session_end
                    if (!sessionEndData || sessionEndData.length === 0 || 
                        lastActivity > new Date(sessionEndData[0].timestamp).getTime()) {
                        activeSessionIds.add(sessionId);
                    }
                }
            }
            
            // Fetch download clicks
            const { data: downloadData, error: downloadError } = await window.supabase
                .from('website_analytics')
                .select('id')
                .eq('event_type', 'download_click')
                .gte('timestamp', today);
            
            if (downloadError) {
                this._error('Error fetching download stats', downloadError);
                return;
            }
            
            // Create stats object
            this.liveStats = {
                timestamp: now.toISOString(),
                secondsSinceRefresh: 0,  // Start at 0 since we just refreshed
                uniqueVisitors: uniqueSessionIds.size,
                activeVisitors: activeSessionIds.size,
                downloadClicks: downloadData ? downloadData.length : 0
            };
            
            this._log('Updated live stats', this.liveStats);
            
            // Notify all callbacks
            this.liveStatsCallbacks.forEach(callback => {
                try {
                    callback(this.liveStats);
                } catch (callbackError) {
                    this._error('Error in live stats callback', callbackError);
                }
            });
        } catch (error) {
            this._error('Error fetching live stats', error);
        }
    }

    /**
     * Track an event
     * @param {string} eventType - Type of event (page_visit, download_click)
     * @param {Object} eventData - Additional data about the event
     */
    trackEvent(eventType, eventData = {}) {
        // Check if analytics is allowed before tracking
        if (!this._isAnalyticsAllowed()) {
            this._log(`Event tracking skipped - analytics cookies not allowed: ${eventType}`);
            return;
        }

        if (!this.isInitialized) {
            console.warn('Cannot track events before analytics is initialized');
            this.eventQueue.push({eventType, eventData});
            this._log(`Event queued for later: ${eventType}`);
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
            // Check if analytics is allowed before tracking
            if (!this._isAnalyticsAllowed()) {
                this._log('Page visit tracking skipped - analytics cookies not allowed');
                return;
            }

            this._log('Tracking page visit');
            
            // Reset page timing on new visit
            this.pageLoadTime = Date.now();
            this.lastInteractionTime = Date.now();
            this.sessionActive = true;
            
            const eventData = {
                event_type: 'page_visit',
                page_url: window.location.href,
                referrer: document.referrer || null,
                time_on_page: 0, // Start with 0 since we just loaded the page
                platform: this._detectPlatform(),
                screen_width: window.innerWidth,
                screen_height: window.innerHeight,
                user_language: navigator.language || navigator.userLanguage,
                is_mobile: this._isMobile()
            };
            
            this._log('Page visit data:', eventData);
            this._trackEvent(eventData);
            
            // Start tracking time on page
            this._setupSessionHeartbeat();
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
            
            // Ensure we get meaningful button text and ID
            const buttonId = buttonElement.id || 
                buttonElement.getAttribute('data-analytics') || 
                buttonElement.getAttribute('data-platform') || 
                'download-button';
                
            const buttonText = buttonElement.textContent.trim() || 
                buttonElement.getAttribute('data-i18n') || 
                'Download';
            
            const eventData = {
                event_type: 'download_click',
                page_url: window.location.href,
                platform: this._detectPlatform(),
                is_mobile: this._isMobile(),
                download_platform: platform,
                button_id: buttonId,
                button_text: buttonText
            };
            
            this._log('Download click data:', eventData);
            
            // Force immediate processing
            this._trackEvent(eventData, true);
            
            // Immediately update live stats to reflect new download
            setTimeout(() => this._fetchLiveStats(), 500);
        } catch (error) {
            this._error('Error tracking download click', error);
        }
    }
    
    /**
     * Track session end when user leaves the page
     */
    trackSessionEnd() {
        try {
            // Skip if already processed or not initialized
            if (!this.sessionActive || !this.isInitialized) {
                return;
            }
            
            this._log('Tracking session end');
            this.sessionActive = false;
            
            // Calculate final session duration
            const sessionDuration = Math.floor((Date.now() - this.pageLoadTime) / 1000);
            
            const eventData = {
                event_type: 'session_end',
                page_url: window.location.href,
                platform: this._detectPlatform(),
                is_mobile: this._isMobile(),
                duration_seconds: sessionDuration
            };
            
            this._log('Session end data:', eventData);
            
            // Use navigator.sendBeacon for more reliable delivery during page unload
            if (navigator.sendBeacon && window.supabase) {
                try {
                    // Create a properly formatted endpoint URL for Supabase
                    const endpoint = `${this.supabaseUrl}/rest/v1/website_analytics`;
                    
                    // Create headers with Supabase key
                    const headers = {
                        'Content-Type': 'application/json',
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Prefer': 'return=minimal'
                    };
                    
                    // Prepare the data with session_id
                    const fullData = {
                        ...eventData,
                        session_id: this.sessionId,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Send using beacon API which is designed for exit events
                    const blob = new Blob([JSON.stringify(fullData)], { type: 'application/json' });
                    const beaconSent = navigator.sendBeacon(endpoint, blob);
                    
                    this._log(`Beacon send ${beaconSent ? 'successful' : 'failed'}`);
                } catch (beaconError) {
                    this._error('Error using sendBeacon', beaconError);
                    // Fall back to regular send
                    this._trackEvent(eventData, true);
                }
            } else {
                // Fall back to regular send if beacon not available
                this._trackEvent(eventData, true);
            }
            
            // Clean up intervals
            if (this.sessionHeartbeatInterval) {
                clearInterval(this.sessionHeartbeatInterval);
                this.sessionHeartbeatInterval = null;
            }
            
            if (this.liveStatsInterval) {
                clearInterval(this.liveStatsInterval);
                this.liveStatsInterval = null;
            }
        } catch (error) {
            this._error('Error tracking session end', error);
        }
    }

    /**
     * Handle cookie preference changes
     * This method should be called when user updates their cookie preferences
     * @param {Object} preferences - Updated cookie preferences
     */
    handleCookiePreferenceChange(preferences) {
        this._log('Cookie preferences changed:', preferences);
        
        if (preferences.analytics === true) {
            // Analytics enabled - initialize if not already done
            if (!this.isInitialized && window.MemoryanConfig && window.MemoryanConfig.supabase) {
                this._log('Analytics enabled - initializing...');
                const { url, anonKey } = window.MemoryanConfig.supabase;
                this.init(url, anonKey).then(success => {
                    if (success) {
                        this._log('Analytics initialized successfully after preference change');
                        this.trackPageVisit();
                    }
                });
            } else if (this.isInitialized) {
                this._log('Analytics already initialized - tracking page visit');
                this.trackPageVisit();
            }
        } else {
            // Analytics disabled - stop tracking and clear data
            this._log('Analytics disabled - stopping tracking and clearing data');
            this._stopTracking();
        }
    }

    /**
     * Stop all analytics tracking and clear related data
     * @private
     */
    _stopTracking() {
        // Clear session heartbeat
        if (this.sessionHeartbeatInterval) {
            clearInterval(this.sessionHeartbeatInterval);
            this.sessionHeartbeatInterval = null;
        }

        // Clear event queue
        this.eventQueue = [];
        this.events = [];

        // Clear analytics-related localStorage items
        try {
            const analyticsKeys = ['rate_limiter_analytics', 'memoryan_analytics_state'];
            analyticsKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            this._log('Cleared analytics localStorage data');
        } catch (error) {
            this._error('Error clearing analytics data', error);
        }

        // Mark as inactive but keep initialized status for potential re-enabling
        this.sessionActive = false;
        this._log('Analytics tracking stopped');
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
                    console.error('Analytics initialization failed. Check console for details.');
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
                    console.log('Test event sent successfully! Check Supabase.');
                } else {
                    this._error('Test event failed to send');
                    console.error('Test event failed. Check console for details.');
                }
            });
        } catch (error) {
            this._error('Error sending test event', error);
            console.error(`Error: ${error.message}`);
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
                
                // Try to initialize analytics if we have credentials
                if (this.supabaseUrl && this.supabaseKey && !this.isInitializing) {
                    this._log('Attempting to initialize analytics before processing event');
                    this.init(this.supabaseUrl, this.supabaseKey);
                }
                
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
     * Internal function to verify analytics data is being sent properly
     * @private
     */
    async _verifyAnalyticsConnection() {
        if (!this.isInitialized) {
            this._error('Cannot verify analytics connection before initialization');
            return false;
        }
        
        try {
            // Send a very small verification event
            const verificationEvent = {
                event_type: 'system_check',
                session_id: this.sessionId,
                timestamp: new Date().toISOString(),
                page_url: window.location.href
            };
            
            this._log('Sending verification event to check connection');
            const success = await this._sendToSupabase(verificationEvent);
            
            if (success) {
                this._log('✅ Analytics connection verified successfully');
            } else {
                this._error('❌ Analytics connection verification failed');
            }
            
            return success;
        } catch (error) {
            this._error('Error verifying analytics connection', error);
            return false;
        }
    }
    
    /**
     * Attach event listeners to download buttons
     * @private
     */
    _attachToDownloadButtons() {
        try {
            this._log('Attaching to download buttons');
            const downloadButtons = document.querySelectorAll('.download-button, [data-analytics="download"]');
            
            this._log(`Found ${downloadButtons.length} download buttons`);
            
            downloadButtons.forEach(button => {
                // Skip if already processed
                if (button.getAttribute('data-analytics-attached') === 'true') {
                    this._log('Skipping already attached button', button);
                    return;
                }
                
                this._log('Attaching handler to download button', button);
                
                // Mark button as processed
                button.setAttribute('data-analytics-attached', 'true');
                
                // Store original onclick
                const originalOnClick = button.onclick;
                
                // Direct DOM event listener for maximum reliability
                button.addEventListener('click', (e) => {
                    this._log('Download button clicked via event listener', e.currentTarget);
                    this.trackDownloadClick(e.currentTarget);
                    
                    // Don't return false so the default action still executes
                });
                
                // Also override onclick property for older browsers
                button.onclick = (e) => {
                    this._log('Download button clicked via onclick property', e.currentTarget || e.target);
                    this.trackDownloadClick(e.currentTarget || e.target);
                    
                    // Call original handler if it exists
                    if (typeof originalOnClick === 'function') {
                        return originalOnClick.call(button, e);
                    }
                };
            });
            
            // Monitor for future buttons and UI changes
            if (!this._buttonObserver) {
                this._log('Setting up observer for new download buttons');
                
                const callback = (mutationsList) => {
                    let needsReattach = false;
                    
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList' || mutation.type === 'attributes') {
                            needsReattach = true;
                            break;
                        }
                    }
                    
                    if (needsReattach) {
                        this._attachToDownloadButtons();
                    }
                };
                
                // Create observer
                this._buttonObserver = new MutationObserver(callback);
                
                // Observe the download section
                const downloadSection = document.getElementById('download-qr');
                if (downloadSection) {
                    this._buttonObserver.observe(downloadSection, { 
                        childList: true, 
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['class', 'id', 'data-analytics']
                    });
                    this._log('Observer attached to download section');
                } else {
                    // Fallback to observing the whole body
                    this._buttonObserver.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['class', 'id', 'data-analytics']
                    });
                    this._log('Observer attached to document body (fallback)');
                }
            }
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
        
        // More comprehensive platform detection
        if (ua.indexOf('android') > -1) return 'android';
        if (ua.indexOf('iphone') > -1) return 'ios';
        if (ua.indexOf('ipad') > -1) return 'ios';
        if (ua.indexOf('ipod') > -1) return 'ios';
        if (ua.indexOf('windows phone') > -1) return 'windows-mobile';
        if (ua.indexOf('windows') > -1) return 'windows';
        if (ua.indexOf('mac os x') > -1) return 'mac';
        if (ua.indexOf('linux') > -1) return 'linux';
        if (ua.indexOf('cros') > -1) return 'chromeos';
        
        // Check for specific browsers as fallback
        if (ua.indexOf('firefox') > -1) return 'firefox';
        if (ua.indexOf('chrome') > -1) return 'chrome';
        if (ua.indexOf('safari') > -1) return 'safari';
        if (ua.indexOf('edge') > -1) return 'edge';
        
        return navigator.platform || 'unknown';
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
