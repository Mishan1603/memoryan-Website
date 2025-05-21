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
            return this.client;
        }
        
        try {
            // Ensure Supabase library is loaded
            await this.ensureSupabaseLoaded();
            
            // Create client
            this.client = window.supabaseJs.createClient(supabaseUrl, supabaseKey);
            console.log('Supabase client initialized successfully');
            
            // Make client globally available
            window.supabase = this.client;
            
            return this.client;
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            throw new Error('Failed to initialize Supabase: ' + error.message);
        }
    },
    
    /**
     * Ensure Supabase library is loaded
     * @returns {Promise} Resolves when Supabase is loaded
     */
    ensureSupabaseLoaded: function() {
        return new Promise((resolve, reject) => {
            // If Supabase is already available, resolve immediately
            if (window.supabaseJs) {
                resolve(window.supabaseJs);
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
