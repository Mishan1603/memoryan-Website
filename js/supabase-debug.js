/**
 * Supabase Debug Tool
 * This script helps diagnose issues with Supabase connections
 */

// Add a diagnostic panel to the page
window.addEventListener('load', function() {
    // Create diagnostic panel
    const panel = document.createElement('div');
    panel.id = 'supabase-debug-panel';
    panel.style.position = 'fixed';
    panel.style.bottom = '50px';
    panel.style.right = '10px';
    panel.style.width = '300px';
    panel.style.maxHeight = '400px';
    panel.style.overflowY = 'auto';
    panel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    panel.style.color = '#00ff00';
    panel.style.padding = '10px';
    panel.style.borderRadius = '5px';
    panel.style.fontFamily = 'monospace';
    panel.style.fontSize = '12px';
    panel.style.zIndex = '10000';
    panel.style.display = 'none'; // Initially hidden
    
    // Create content
    panel.innerHTML = `
        <h3 style="color: #00ff00; margin-top: 0;">Supabase Diagnostics</h3>
        <div id="supabase-status">Checking Supabase status...</div>
        <div id="diagnostics-list" style="margin-top: 10px;"></div>
        <div style="margin-top: 10px;">
            <button id="test-supabase-btn" style="background: #333; color: #fff; border: 1px solid #00ff00; padding: 5px 10px; cursor: pointer; margin-right: 5px;">Test Connection</button>
            <button id="init-analytics-btn" style="background: #333; color: #fff; border: 1px solid #00ff00; padding: 5px 10px; cursor: pointer; margin-right: 5px;">Init Analytics</button>
            <button id="toggle-panel-btn" style="background: #333; color: #fff; border: 1px solid #00ff00; padding: 5px 10px; cursor: pointer;">Hide Panel</button>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'show-debug-panel';
    toggleButton.textContent = 'Supabase Debug';
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '10px';
    toggleButton.style.left = '10px';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    toggleButton.style.color = '#00ff00';
    toggleButton.style.border = '1px solid #00ff00';
    toggleButton.style.borderRadius = '3px';
    toggleButton.style.fontFamily = 'monospace';
    toggleButton.style.fontSize = '12px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.zIndex = '10000';
    
    document.body.appendChild(toggleButton);
    
    // Toggle panel visibility
    toggleButton.addEventListener('click', function() {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    
    document.getElementById('toggle-panel-btn').addEventListener('click', function() {
        panel.style.display = 'none';
    });
    
    // Init analytics button
    document.getElementById('init-analytics-btn').addEventListener('click', function() {
        initializeAnalytics();
    });
    
    // Run diagnostics
    runDiagnostics();
    
    // Test button
    document.getElementById('test-supabase-btn').addEventListener('click', function() {
        testSupabaseConnection();
    });
    
    // Periodically refresh status
    setInterval(runDiagnostics, 15000); // Refresh every 15 seconds
});

// Add a log to the diagnostics panel
function addDiagnostic(message, isError = false) {
    const diagList = document.getElementById('diagnostics-list');
    if (diagList) {
        const item = document.createElement('div');
        item.style.marginBottom = '5px';
        item.style.color = isError ? '#ff3333' : '#00ff00';
        item.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        diagList.appendChild(item);
        
        // Limit the number of messages to prevent overflow
        while (diagList.children.length > 20) {
            diagList.removeChild(diagList.firstChild);
        }
        
        // Auto-scroll to bottom
        diagList.scrollTop = diagList.scrollHeight;
    }
    
    // Also log to console
    if (isError) {
        console.error(message);
    } else {
        console.log(message);
    }
}

// Run initial diagnostics
function runDiagnostics() {
    addDiagnostic('Starting Supabase diagnostics...');
    
    const statusElement = document.getElementById('supabase-status');
    if (statusElement) {
        statusElement.innerHTML = '<span style="color: #ffcc00;">Running diagnostics...</span>';
    }
    
    // Check if MemoryanConfig exists
    if (window.MemoryanConfig) {
        addDiagnostic('✅ MemoryanConfig found');
        
        // Check Supabase config
        if (window.MemoryanConfig.supabase) {
            const { url, anonKey } = window.MemoryanConfig.supabase;
            
            if (url && anonKey) {
                addDiagnostic(`✅ Supabase URL: ${maskString(url)}`);
                addDiagnostic(`✅ Supabase Key: ${maskString(anonKey)}`);
            } else {
                addDiagnostic('❌ Missing Supabase URL or key in config!', true);
            }
        } else {
            addDiagnostic('❌ Missing Supabase config!', true);
        }
    } else {
        addDiagnostic('❌ MemoryanConfig not found!', true);
    }
    
    // Check if Supabase library is loaded
    if (window.supabase) {
        addDiagnostic('✅ Supabase library loaded');
        updateSupabaseStatus(true);
    } else {
        addDiagnostic('⚠️ Supabase library not loaded', true);
        
        // Check if MemoryanSupabase is available
        if (window.MemoryanSupabase) {
            addDiagnostic('✅ MemoryanSupabase loader found, attempting to initialize...');
            
            if (window.MemoryanConfig && window.MemoryanConfig.supabase) {
                const { url, anonKey } = window.MemoryanConfig.supabase;
                
                window.MemoryanSupabase.initialize(url, anonKey)
                    .then(client => {
                        window.supabase = client;
                        addDiagnostic('✅ Supabase client initialized successfully');
                        updateSupabaseStatus(true);
                        
                        // Re-check analytics since Supabase is now initialized
                        checkAnalyticsStatus();
                    })
                    .catch(error => {
                        addDiagnostic(`❌ Failed to initialize Supabase: ${error.message}`, true);
                        updateSupabaseStatus(false);
                    });
            }
        } else {
            addDiagnostic('❌ MemoryanSupabase loader not found!', true);
        }
    }
    
    // Check analytics
    checkAnalyticsStatus();
    
    // Check download buttons
    const downloadButtons = document.querySelectorAll('.download-button, [data-analytics="download"]');
    addDiagnostic(`Found ${downloadButtons.length} download buttons`);
    
    // Check for analytics attached attribute
    const attachedButtons = document.querySelectorAll('[data-analytics-attached="true"]');
    addDiagnostic(`${attachedButtons.length}/${downloadButtons.length} buttons have analytics handlers attached`);
    
    if (attachedButtons.length < downloadButtons.length) {
        addDiagnostic('⚠️ Some download buttons may not be tracked correctly', true);
    }
}

// Separate function to check analytics status
function checkAnalyticsStatus() {
    // First check Memoryan.Analytics (preferred)
    if (window.Memoryan && window.Memoryan.Analytics) {
        addDiagnostic('✅ Memoryan.Analytics object found');
        
        try {
            if (window.Memoryan.Analytics.isInitialized) {
                addDiagnostic('✅ Analytics is initialized');
                addDiagnostic(`✅ Session ID: ${window.Memoryan.Analytics.sessionId}`);
                
                // Check if the object is functional by checking critical methods
                const hasMethods = typeof window.Memoryan.Analytics.trackEvent === 'function' &&
                                  typeof window.Memoryan.Analytics.trackDownloadClick === 'function';
                                  
                if (hasMethods) {
                    addDiagnostic('✅ Analytics methods verified');
                } else {
                    addDiagnostic('⚠️ Analytics object missing required methods', true);
                }
                
                // Assign to window.analytics for compatibility if not already done
                if (!window.analytics) {
                    window.analytics = window.Memoryan.Analytics;
                    addDiagnostic('✅ Set window.analytics = Memoryan.Analytics for compatibility');
                } else if (window.analytics !== window.Memoryan.Analytics) {
                    addDiagnostic('⚠️ window.analytics is not the same as Memoryan.Analytics!', true);
                    
                    // Fix the reference
                    window.analytics = window.Memoryan.Analytics;
                    addDiagnostic('✅ Fixed window.analytics reference');
                }
                
                // Check live stats functionality
                if (window.Memoryan.Analytics.liveStats) {
                    addDiagnostic(`✅ Live stats available - ${window.Memoryan.Analytics.liveStats.uniqueVisitors} unique visitors today`);
                } else {
                    addDiagnostic('⚠️ Live stats not yet available');
                    // Request stats refresh
                    if (typeof window.Memoryan.Analytics._fetchLiveStats === 'function') {
                        window.Memoryan.Analytics._fetchLiveStats();
                        addDiagnostic('🔄 Triggered stats refresh');
                    }
                }
                
                // Force Button Attachment
                addDiagnostic('🔄 Forcing button attachment verification...');
                if (typeof window.Memoryan.Analytics._attachToDownloadButtons === 'function') {
                    try {
                        window.Memoryan.Analytics._attachToDownloadButtons();
                        addDiagnostic('✅ Button attachment verification complete');
                    } catch (buttonError) {
                        addDiagnostic(`❌ Error during button verification: ${buttonError.message}`, true);
                    }
                }
            } else {
                addDiagnostic('❌ Analytics not initialized', true);
                
                // Check if it's currently initializing
                if (window.Memoryan.Analytics.isInitializing) {
                    addDiagnostic('⏳ Analytics is currently initializing... please wait');
                } else {
                    addDiagnostic('🔄 Use the Init Analytics button to manually initialize');
                }
            }
        } catch (error) {
            addDiagnostic(`❌ Error checking Memoryan.Analytics status: ${error.message}`, true);
        }
    } 
    // Fallback to window.analytics check
    else if (window.analytics) {
        addDiagnostic('⚠️ Only legacy window.analytics object found');
        
        try {
            if (window.analytics.isInitialized) {
                addDiagnostic('✅ Legacy analytics is initialized');
                
                // Create the proper structure
                window.Memoryan = window.Memoryan || {};
                window.Memoryan.Analytics = window.analytics;
                addDiagnostic('✅ Created Memoryan.Analytics from legacy window.analytics');
            } else {
                addDiagnostic('❌ Legacy analytics not initialized', true);
            }
        } catch (error) {
            addDiagnostic(`❌ Error checking legacy analytics status: ${error.message}`, true);
        }
    } else {
        addDiagnostic('❌ Analytics objects not found!', true);
        
        // Check if Analytics class is available to create an instance
        if (typeof window.Analytics === 'function') {
            addDiagnostic('✅ Analytics class is available, can create instance');
            addDiagnostic('🔄 Use the Init Analytics button to create and initialize');
        } else {
            addDiagnostic('❌ Analytics class not available', true);
        }
    }
}

// Initialize analytics manually
function initializeAnalytics() {
    addDiagnostic('🔄 Manually initializing analytics...');
    
    // Make sure Supabase is initialized first
    if (!window.supabase) {
        addDiagnostic('⚠️ Supabase not initialized, initializing first...');
        if (window.ensureSupabaseInitialized) {
            window.ensureSupabaseInitialized()
                .then(client => {
                    addDiagnostic('✅ Supabase initialized via helper');
                    window.supabase = client;
                    // Now initialize analytics
                    _initializeAnalyticsWithSupabase();
                })
                .catch(error => {
                    addDiagnostic(`❌ Supabase initialization failed: ${error.message}`, true);
                });
        } else if (window.MemoryanSupabase && window.MemoryanConfig && window.MemoryanConfig.supabase) {
            const { url, anonKey } = window.MemoryanConfig.supabase;
            window.MemoryanSupabase.initialize(url, anonKey)
                .then(client => {
                    addDiagnostic('✅ Supabase initialized via MemoryanSupabase');
                    window.supabase = client;
                    // Now initialize analytics
                    _initializeAnalyticsWithSupabase();
                })
                .catch(error => {
                    addDiagnostic(`❌ Supabase initialization failed: ${error.message}`, true);
                });
        } else {
            addDiagnostic('❌ No method available to initialize Supabase!', true);
        }
    } else {
        // Supabase already initialized
        _initializeAnalyticsWithSupabase();
    }
}

// Helper function to initialize analytics once Supabase is ready
function _initializeAnalyticsWithSupabase() {
    // Create instance if needed
    if (!window.Memoryan || !window.Memoryan.Analytics) {
        if (typeof window.Analytics === 'function') {
            addDiagnostic('Creating new Analytics instance...');
            window.Memoryan = window.Memoryan || {};
            window.Memoryan.Analytics = new window.Analytics();
            window.analytics = window.Memoryan.Analytics;
            addDiagnostic('✅ Created new Analytics instance');
        } else {
            addDiagnostic('❌ Analytics class not available, cannot create instance', true);
            return;
        }
    }
    
    // Force page load and session tracking restart
    const analytics = window.Memoryan.Analytics;
    analytics.pageLoadTime = Date.now();
    analytics.lastInteractionTime = Date.now();
    analytics.sessionActive = true;
    
    // Initialize if we have Supabase config
    if (window.MemoryanConfig && window.MemoryanConfig.supabase) {
        const { url, anonKey } = window.MemoryanConfig.supabase;
        
        addDiagnostic('Initializing with Supabase credentials...');
        
        window.Memoryan.Analytics.init(url, anonKey)
            .then(success => {
                if (success) {
                    addDiagnostic('✅ Successfully initialized analytics');
                    // Ensure window.analytics is set too
                    window.analytics = window.Memoryan.Analytics;
                    
                    // Force immediate attachment to download buttons
                    setTimeout(() => {
                        addDiagnostic('🔄 Force attaching to download buttons...');
                        if (typeof window.Memoryan.Analytics._attachToDownloadButtons === 'function') {
                            window.Memoryan.Analytics._attachToDownloadButtons();
                            // Check how many buttons were attached
                            const buttons = document.querySelectorAll('.download-button, [data-analytics="download"]');
                            const attachedButtons = document.querySelectorAll('[data-analytics-attached="true"]');
                            addDiagnostic(`✅ Attached to ${attachedButtons.length}/${buttons.length} download buttons`);
                        }
                    }, 500);
                } else {
                    addDiagnostic('❌ Failed to initialize analytics', true);
                }
                
                // Update status after initialization attempt
                checkAnalyticsStatus();
            })
            .catch(error => {
                addDiagnostic(`❌ Error initializing analytics: ${error.message}`, true);
            });
    } else {
        addDiagnostic('❌ Missing Supabase config, cannot initialize analytics', true);
    }
}

// Update Supabase status display
function updateSupabaseStatus(success) {
    const statusElement = document.getElementById('supabase-status');
    if (statusElement) {
        if (success) {
            statusElement.innerHTML = '<span style="color: #00ff00;">✅ Supabase Connected</span>';
        } else {
            statusElement.innerHTML = '<span style="color: #ff3333;">❌ Supabase Disconnected</span>';
        }
    }
}

// Test Supabase connection by sending a test query
async function testSupabaseConnection() {
    addDiagnostic('Running Supabase connection test...');
    
    try {
        if (!window.supabase) {
            addDiagnostic('❌ Supabase client not available for test', true);
            
            if (window.MemoryanSupabase && window.MemoryanConfig && window.MemoryanConfig.supabase) {
                const { url, anonKey } = window.MemoryanConfig.supabase;
                
                addDiagnostic('Attempting to initialize Supabase first...');
                try {
                    const client = await window.MemoryanSupabase.initialize(url, anonKey);
                    window.supabase = client;
                    addDiagnostic('✅ Successfully initialized Supabase');
                } catch (error) {
                    addDiagnostic(`❌ Failed to initialize Supabase: ${error.message}`, true);
                    updateSupabaseStatus(false);
                    return;
                }
            } else {
                addDiagnostic('❌ Cannot initialize Supabase - missing loader or config', true);
                updateSupabaseStatus(false);
                return;
            }
        }
        
        // Run test query
        const startTime = performance.now();
        const { data, error } = await window.supabase
            .from('website_analytics')
            .select('count(*)', { count: 'exact' })
            .limit(1);
        const endTime = performance.now();
        const queryTime = (endTime - startTime).toFixed(2);
        
        if (error) {
            addDiagnostic(`❌ Test query failed: ${error.message}`, true);
            updateSupabaseStatus(false);
        } else {
            const count = data ? data[0].count : 'unknown';
            addDiagnostic(`✅ Test query successful (${queryTime}ms) - Analytics table has ${count} records`);
            updateSupabaseStatus(true);
            
            // Check analytics after successful Supabase test
            checkAnalyticsStatus();
        }
    } catch (error) {
        addDiagnostic(`❌ Exception during test: ${error.message}`, true);
        updateSupabaseStatus(false);
    }
}

// Mask sensitive strings for display
function maskString(str) {
    if (!str) return 'undefined';
    
    if (str.length > 10) {
        return str.substring(0, 4) + '...' + str.substring(str.length - 4);
    }
    
    return str;
} 
