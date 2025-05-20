/**
 * RateLimiter - A client-side utility for limiting API request rates
 * This helps prevent excessive API calls from a single client
 */
class RateLimiter {
    /**
     * Create a new rate limiter
     * @param {string} name - Unique identifier for this rate limiter
     * @param {number} maxRequests - Maximum number of requests allowed in the time window
     * @param {number} timeWindowMs - Time window in milliseconds
     */
    constructor(name, maxRequests = 10, timeWindowMs = 60000) {
        this.name = name;
        this.maxRequests = maxRequests;
        this.timeWindowMs = timeWindowMs;
        this.storageKey = `rate_limiter_${name}`;
        
        // Initialize the requests array in localStorage if it doesn't exist
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }
    
    /**
     * Check if a request is allowed
     * @returns {boolean} True if the request should be allowed, false otherwise
     */
    canMakeRequest() {
        // Get the current timestamp
        const now = Date.now();
        
        // Load past requests
        const requests = this._getRequestTimestamps();
        
        // Remove expired timestamps
        const validRequests = requests.filter(timestamp => now - timestamp < this.timeWindowMs);
        
        // Check if we're under the limit
        const allowed = validRequests.length < this.maxRequests;
        
        // If allowed, record this request
        if (allowed) {
            validRequests.push(now);
            this._saveRequestTimestamps(validRequests);
            console.log(`Request allowed by rate limiter '${this.name}' (${validRequests.length}/${this.maxRequests})`);
        } else {
            console.warn(`Request blocked by rate limiter '${this.name}' - limit of ${this.maxRequests} reached within ${this.timeWindowMs/1000}s`);
        }
        
        return allowed;
    }
    
    /**
     * Get the time in milliseconds until the next request will be allowed
     * @returns {number} Time in milliseconds, or 0 if requests are allowed now
     */
    getTimeUntilNextAllowed() {
        // If we can make a request right now, return 0
        if (this.canMakeRequest()) {
            return 0;
        }
        
        // Otherwise, calculate when the oldest request will expire
        const now = Date.now();
        const requests = this._getRequestTimestamps().sort();
        const oldestRequest = requests[0];
        
        // Calculate when the oldest request will expire
        return (oldestRequest + this.timeWindowMs) - now;
    }
    
    /**
     * Wraps a function with rate limiting
     * @param {Function} fn - The function to wrap
     * @returns {Function} A rate-limited function that returns a Promise
     */
    limitFunction(fn) {
        return async (...args) => {
            if (this.canMakeRequest()) {
                return await fn(...args);
            } else {
                const waitTime = this.getTimeUntilNextAllowed();
                throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
            }
        };
    }
    
    /**
     * Reset the rate limiter
     */
    reset() {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
        console.log(`Rate limiter '${this.name}' has been reset`);
    }
    
    /**
     * Get stored request timestamps
     * @private
     */
    _getRequestTimestamps() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch (e) {
            console.error('Error parsing rate limiter data, resetting', e);
            localStorage.setItem(this.storageKey, JSON.stringify([]));
            return [];
        }
    }
    
    /**
     * Save request timestamps
     * @private
     */
    _saveRequestTimestamps(timestamps) {
        localStorage.setItem(this.storageKey, JSON.stringify(timestamps));
    }
}

/**
 * Example usage:
 * 
 * // Create rate limiters for different API endpoints
 * const searchLimiter = new RateLimiter('search', 5, 60000); // 5 requests per minute
 * const commentLimiter = new RateLimiter('comments', 2, 30000); // 2 requests per 30 seconds
 * 
 * // Use with fetch
 * async function fetchWithRateLimit(url, rateLimiter) {
 *     if (rateLimiter.canMakeRequest()) {
 *         try {
 *             const response = await fetch(url);
 *             return response.json();
 *         } catch (error) {
 *             console.error('Error fetching data:', error);
 *             throw error;
 *         }
 *     } else {
 *         const waitTime = rateLimiter.getTimeUntilNextAllowed();
 *         alert(`Too many requests. Please try again in ${Math.ceil(waitTime/1000)} seconds.`);
 *         throw new Error('Rate limit exceeded');
 *     }
 * }
 * 
 * // Usage with async/await
 * async function searchAPI(query) {
 *     try {
 *         const data = await fetchWithRateLimit(`/api/search?q=${query}`, searchLimiter);
 *         return data;
 *     } catch (error) {
 *         // Handle error appropriately
 *         console.error('Search failed:', error);
 *     }
 * }
 * 
 * // Or wrap existing functions
 * const originalFetch = fetch;
 * window.fetch = async function(url, options) {
 *     if (url.includes('/api/')) {
 *         if (!searchLimiter.canMakeRequest()) {
 *             throw new Error('Rate limit exceeded for API calls');
 *         }
 *     }
 *     return originalFetch(url, options);
 * };
 */

// Export the RateLimiter class
window.RateLimiter = RateLimiter; 