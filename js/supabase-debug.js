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
    
    // Run diagnostics
    runDiagnostics();
    
    // Test button
    document.getElementById('test-supabase-btn').addEventListener('click', function() {
        testSupabaseConnection();
    });
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
    
    // Check if MemoryanConfig exists
    if (window.MemoryanConfig) {
        addDiagnostic('MemoryanConfig found');
        
        // Check Supabase config
        if (window.MemoryanConfig.supabase) {
            const { url, anonKey } = window.MemoryanConfig.supabase;
            
            if (url && anonKey) {
                addDiagnostic(`Supabase URL: ${maskString(url)}`);
                addDiagnostic(`Supabase Key: ${maskString(anonKey)}`);
            } else {
                addDiagnostic('Missing Supabase URL or key in config!', true);
            }
        } else {
            addDiagnostic('Missing Supabase config!', true);
        }
    } else {
        addDiagnostic('MemoryanConfig not found!', true);
    }
    
    // Check if Supabase library is loaded
    if (window.supabase) {
        addDiagnostic('Supabase library loaded');
    } else {
        addDiagnostic('Supabase library not loaded!', true);
        
        // Check if MemoryanSupabase is available
        if (window.MemoryanSupabase) {
            addDiagnostic('MemoryanSupabase loader found, attempting to initialize...');
            
            if (window.MemoryanConfig && window.MemoryanConfig.supabase) {
                const { url, anonKey } = window.MemoryanConfig.supabase;
                
                window.MemoryanSupabase.initialize(url, anonKey)
                    .then(client => {
                        window.supabase = client;
                        addDiagnostic('Supabase client initialized successfully');
                        updateSupabaseStatus(true);
                    })
                    .catch(error => {
                        addDiagnostic(`Failed to initialize Supabase: ${error.message}`, true);
                        updateSupabaseStatus(false);
                    });
            }
        } else {
            addDiagnostic('MemoryanSupabase loader not found!', true);
        }
    }
    
    // Check analytics
    if (window.analytics) {
        addDiagnostic('Analytics object found');
        
        if (window.analytics.isInitialized) {
            addDiagnostic('Analytics is initialized');
        } else {
            addDiagnostic('Analytics not initialized!', true);
        }
    } else {
        addDiagnostic('Analytics object not found!', true);
    }
}

// Update Supabase status display
function updateSupabaseStatus(success) {
    const statusEl = document.getElementById('supabase-status');
    if (statusEl) {
        statusEl.innerHTML = success 
            ? '✅ Supabase Connected' 
            : '❌ Supabase Connection Failed';
        statusEl.style.color = success ? '#00ff00' : '#ff3333';
    }
}

// Test Supabase connection
async function testSupabaseConnection() {
    addDiagnostic('Testing Supabase connection...');
    
    try {
        // Check if we have a Supabase client
        if (!window.supabase) {
            if (window.MemoryanSupabase && window.MemoryanConfig && window.MemoryanConfig.supabase) {
                const { url, anonKey } = window.MemoryanConfig.supabase;
                window.supabase = await window.MemoryanSupabase.initialize(url, anonKey);
                addDiagnostic('Initialized Supabase client for test');
            } else {
                throw new Error('Supabase client not available');
            }
        }
        
        // Try to insert a test row
        const testData = {
            session_id: 'debug-test-' + Date.now(),
            event_type: 'debug_test',
            timestamp: new Date().toISOString(),
            page_url: window.location.href
        };
        
        addDiagnostic(`Sending test data: ${JSON.stringify(testData)}`);
        
        const { data, error } = await window.supabase
            .from('website_analytics')
            .insert(testData)
            .select();
        
        if (error) {
            throw error;
        }
        
        addDiagnostic(`Test successful! Response: ${JSON.stringify(data)}`);
        updateSupabaseStatus(true);
        
    } catch (error) {
        addDiagnostic(`Test failed: ${error.message}`, true);
        if (error.details) addDiagnostic(`Details: ${error.details}`, true);
        if (error.hint) addDiagnostic(`Hint: ${error.hint}`, true);
        updateSupabaseStatus(false);
    }
}

// Mask sensitive strings (show only first and last few characters)
function maskString(str) {
    if (!str) return '';
    if (str.length <= 8) return '********';
    return str.substring(0, 4) + '...' + str.substring(str.length - 4);
} 