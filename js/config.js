/**
 * Memoryan Website Configuration
 * Contains environment-specific settings
 * 
 * IMPORTANT: Before deploying to production, replace these values with your actual
 * Supabase URL and anon key from your Supabase project settings
 */

window.MemoryanConfig = {
    // Supabase credentials
    supabase: {
        url: 'https://sncpkcjtncanpbsedlpf.supabase.co', // Replace with your Supabase URL
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuY3BrY2p0bmNhbnBic2VkbHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMjcwMzYsImV4cCI6MjA1NjYwMzAzNn0.pqPn5ATjTC5SVMwI9qR1ICe-GUAiSfXyNhmHH4-OoTA' // Replace with your Supabase anon key
    },
    
    // Analytics settings
    analytics: {
        enabled: true,                    // Set to false to disable analytics completely
        trackDownloadClicks: true,        // Track clicks on download buttons
        sessionHeartbeatInterval: 60000   // Heartbeat interval in ms (1 minute)
    }
}; 