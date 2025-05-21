/**
 * Supabase Client Loader
 * Ensures Supabase is properly loaded and initialized
 */

window.MemoryanSupabase = {
    client: null,
    
    /**
     * Initialize Supabase client with credentials
     * @param {string} supabaseUrl - Supabase project URL
     * @param {string} supabaseKey - Supabase anon key
     * @returns {Object} Supabase client
     */
    initialize: async function(supabaseUrl, supabaseKey) {
        if (this.client) {
            console.log('Returning existing Supabase client');
            return this.client;
        }
        
        try {
            console.log('Initializing Supabase client...');
            
            // Ensure Supabase library is loaded
            await this.ensureSupabaseLoaded();
            
            // Find the Supabase constructor
            const supabaseConstructor = window.supabaseJs || window.supabase;
            
            if (!supabaseConstructor || !supabaseConstructor.createClient) {
                console.error('Supabase constructor not found or missing createClient method');
                // Try direct initialization if the global object is available
                if (window.supabase && typeof window.supabase === 'function') {
                    console.log('Attempting direct initialization with global supabase');
                    this.client = window.supabase(supabaseUrl, supabaseKey);
                } else {
                    throw new Error('Supabase library not properly loaded');
                }
            } else {
                // Create client
                this.client = supabaseConstructor.createClient(supabaseUrl, supabaseKey);
            }
            
            console.log('Supabase client initialized successfully');
            
            // Make client globally available
            window.supabase = this.client;
            
            return this.client;
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            
            // Fallback to creating a new instance if possible
            try {
                if (window.supabase && typeof window.supabase.createClient === 'function') {
                    console.log('Attempting fallback initialization');
                    this.client = window.supabase.createClient(supabaseUrl, supabaseKey);
                    window.supabase = this.client;
                    return this.client;
                }
            } catch (fallbackError) {
                console.error('Fallback initialization also failed:', fallbackError);
            }
            
            throw new Error('Failed to initialize Supabase: ' + error.message);
        }
    },
    
    /**
     * Ensure Supabase library is loaded
     * @returns {Promise} Resolves when Supabase is loaded
     */
    ensureSupabaseLoaded: function() {
        return new Promise((resolve, reject) => {
            // Check for Supabase under different possible names
            if (window.supabaseJs) {
                console.log('Found Supabase as window.supabaseJs');
                resolve(window.supabaseJs);
                return;
            }
            
            if (window.supabase && (typeof window.supabase.createClient === 'function' || typeof window.supabase === 'function')) {
                console.log('Found Supabase as window.supabase');
                window.supabaseJs = window.supabase;
                resolve(window.supabase);
                return;
            }
            
            console.log('Loading Supabase library...');
            
            // Create a script element to load Supabase
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.36.0/dist/umd/supabase.min.js";
            
            script.onload = function() {
                console.log('Supabase library loaded successfully');
                if (window.supabase) {
                    // Assign to supabaseJs to avoid conflicts
                    window.supabaseJs = window.supabase;
                    resolve(window.supabaseJs);
                } else {
                    reject(new Error('Supabase loaded but global object not found'));
                }
            };
            
            script.onerror = function() {
                const error = new Error('Failed to load Supabase library');
                console.error(error);
                reject(error);
            };
            
            document.head.appendChild(script);
        });
    },
    
    /**
     * Get initialized client
     * @returns {Object} Supabase client
     */
    getClient: function() {
        if (!this.client) {
            throw new Error('Supabase client not initialized. Call initialize() first.');
        }
        return this.client;
    }
}; 

// Initialize Supabase when config is available
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checking for Supabase config...');
    if (window.MemoryanConfig && window.MemoryanConfig.supabase) {
        const { url, anonKey } = window.MemoryanConfig.supabase;
        
        if (url && anonKey) {
            console.log('Supabase config found, initializing...');
            window.MemoryanSupabase.initialize(url, anonKey)
                .then(client => {
                    console.log('Supabase initialized automatically on page load');
                })
                .catch(error => {
                    console.error('Error initializing Supabase:', error);
                });
        }
    }
}); 
