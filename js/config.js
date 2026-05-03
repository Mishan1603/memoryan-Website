/**
 * Memoryan Website Configuration
 * Contains environment-specific settings
 *
 * Local testing: do NOT open index.html as a file (file://). The browser sends Origin "null",
 * so Supabase Edge CORS blocks waitlist calls, and Cloudflare Turnstile often fails in sandboxed iframes.
 * Run from this folder: serve-local.cmd  OR  python -m http.server 5173
 * Then add http://127.0.0.1:5173 (and localhost) to WAITLIST_ALLOWED_ORIGINS in Supabase, and add the
 * same hostnames to your Turnstile widget in Cloudflare.
 * Optional for file:// only (insecure): deploy Edge with secret WAITLIST_ALLOW_NULL_ORIGIN=true — dev only.
 *
 * IMPORTANT: Before deploying to production, replace these values with your actual
 * Supabase URL and anon key from your Supabase project settings
 */

window.MemoryanConfig = {
    // Supabase credentials (used by auth pages: password-reset, email-verification, etc.)
    supabase: {
        url: 'https://sncpkcjtncanpbsedlpf.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuY3BrY2p0bmNhbnBic2VkbHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMjcwMzYsImV4cCI6MjA1NjYwMzAzNn0.pqPn5ATjTC5SVMwI9qR1ICe-GUAiSfXyNhmHH4-OoTA'
    },
    // Cloudflare Turnstile (visible widget). Use test keys for local dev; match TURNSTILE_SECRET_KEY on Edge.
    waitlist: {
        turnstileSiteKey: '0x4AAAAAADIlEkkXo8Ik8D9j'
    }
}; 
