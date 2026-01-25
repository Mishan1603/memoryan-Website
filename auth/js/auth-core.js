/**
 * Memoryan Authentication Core Library
 * Provides secure authentication services using Supabase
 * 
 * Security Features:
 * - Uses only anon key in frontend
 * - Proper session handling
 * - Input validation and sanitization
 * - Error handling with security context
 * - Rate limiting protection
 */

class MemoryanAuth {
    constructor() {
        this.supabaseClient = null;
        this.isInitialized = false;
        this.currentUser = null;
        this.currentSession = null;
        this.edgeFunctionBaseUrl = null;
        this.supabaseAnonKey = null; // Add this
        this.debug = true; // Set to false in production
        this.rateLimitTracker = new Map();
        this.maxRetryAttempts = 3;
        this.retryDelay = 1000; // 1 second base delay
    this.blockingOverlayActive = false;
        
        // Bind methods to maintain context
        this.init = this.init.bind(this);
        this.log = this.log.bind(this);
        this.error = this.error.bind(this);
        
        this.log('MemoryanAuth initialized');
    }

    /**
     * Initialize the authentication system
     * @param {Object} config - Configuration object
     * @param {string} config.supabaseUrl - Supabase project URL
     * @param {string} config.supabaseAnonKey - Supabase anonymous key
     */
    async init(config) {
        try {
            this.log('Initializing MemoryanAuth...');
            
            if (!config || !config.supabaseUrl || !config.supabaseAnonKey) {
                throw new Error('Missing required Supabase configuration');
            }

            this.supabaseAnonKey = config.supabaseAnonKey; // Add this

            // Wait for Supabase to be available
            await this.ensureSupabaseClient(config.supabaseUrl, config.supabaseAnonKey);
            
            // Set Edge Function base URL
            this.edgeFunctionBaseUrl = `${config.supabaseUrl}/functions/v1`;
            
            // Set up session monitoring
            this.setupSessionMonitoring();
            
            this.isInitialized = true;
            this.log('MemoryanAuth initialized successfully');
            
            return true;
        } catch (error) {
            this.error('Failed to initialize MemoryanAuth:', error);
            return false;
        }
    }

    /**
     * Ensure Supabase client is available and initialized
     */
    async ensureSupabaseClient(supabaseUrl, supabaseAnonKey) {
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            try {
                // Check if global Supabase client exists
                if (window.supabase) {
                    this.supabaseClient = window.supabase;
                    this.log('Using existing Supabase client');
                    return;
                }
                
                // Try to initialize via MemoryanSupabase
                if (window.MemoryanSupabase) {
                    this.supabaseClient = await window.MemoryanSupabase.initialize(supabaseUrl, supabaseAnonKey);
                    window.supabase = this.supabaseClient;
                    this.log('Initialized Supabase client via MemoryanSupabase');
                    return;
                }
                
                // Wait and retry
                attempts++;
                if (attempts < maxAttempts) {
                    this.log(`Waiting for Supabase (attempt ${attempts}/${maxAttempts})`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } catch (error) {
                this.error(`Attempt ${attempts} failed:`, error);
                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        
        throw new Error('Failed to initialize Supabase client after maximum attempts');
    }

    /**
     * Set up session monitoring and auth state changes
     */
    setupSessionMonitoring() {
        if (!this.supabaseClient) return;
        
        // Listen for auth state changes
        this.supabaseClient.auth.onAuthStateChange((event, session) => {
            this.log('Auth state changed:', event);
            this.currentSession = session;
            this.currentUser = session?.user || null;
            
            // Emit custom events for other parts of the app to listen to
            this.emitAuthEvent(event, { session, user: this.currentUser });
        });
    }

    /**
     * Emit authentication events
     */
    emitAuthEvent(eventType, data) {
        const customEvent = new CustomEvent('memoryan-auth', {
            detail: { type: eventType, ...data }
        });
        window.dispatchEvent(customEvent);
    }

    /**
     * Send email verification request
     * @param {string} email - User's email address
     * @returns {Promise<Object>} Result object with success status and message
     */
    async sendEmailVerification(email) {
        try {
            this.log('Sending email verification for:', email);
            
            // Validate email
            if (!this.isValidEmail(email)) {
                throw new Error('Invalid email address format');
            }

            // Check rate limiting
            if (!this.checkRateLimit('email-verification', email)) {
                throw new Error('Too many verification requests. Please wait before trying again.');
            }

            // Call Edge Function for secure email verification (OTP)
            const response = await this.callEdgeFunction('send-email-verification-otp', {
                email: email.toLowerCase().trim()
            });

            this.updateRateLimit('email-verification', email);
            
            return {
                success: true,
                message: 'Verification email sent successfully',
                data: response
            };
        } catch (error) {
            this.error('Email verification failed:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    /**
     * Handle email verification from URL parameters
     * @param {URLSearchParams} urlParams - URL search parameters
     * @returns {Promise<Object>} Verification result
     */
    async handleEmailVerification(urlParams) {
        try {
            this.log('Handling email verification from URL');
            
            const token = urlParams.get('token');
            const type = urlParams.get('type');
            
            if (!token || type !== 'signup') {
                throw new Error('Invalid verification link');
            }

            // Set the session using the token
            const { data, error } = await this.supabaseClient.auth.setSession({
                access_token: token,
                refresh_token: '' // Will be handled by Supabase
            });

            if (error) throw error;

            if (data.user) {
                // Update user security level to 'verified'
                await this.updateUserSecurityLevel(data.user.id, 'verified');
                
                return {
                    success: true,
                    message: 'Email verified successfully',
                    user: data.user
                };
            }

            throw new Error('Verification failed');
        } catch (error) {
            this.error('Email verification handling failed:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    /**
     * Send password reset email
     * @param {string} email - User's email address
     * @returns {Promise<Object>} Result object
     */
    async sendPasswordReset(email) {
        try {
            this.log('Sending password reset for:', email);
            
            // Validate email
            if (!this.isValidEmail(email)) {
                throw new Error('Invalid email address format');
            }

            // Check rate limiting
            if (!this.checkRateLimit('password-reset', email)) {
                throw new Error('Too many reset requests. Please wait before trying again.');
            }

            // Use Supabase built-in password reset
            const { error } = await this.supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/password-reset.html?mode=reset`
            });

            if (error) throw error;

            this.updateRateLimit('password-reset', email);
            
            return {
                success: true,
                message: 'Password reset email sent successfully'
            };
        } catch (error) {
            this.error('Password reset failed:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    /**
     * Handle password reset from URL parameters
     * @param {URLSearchParams} urlParams - URL search parameters
     * @returns {Promise<Object>} Reset handling result
     */
    async handlePasswordReset(urlParams) {
        try {
            this.log('Handling password reset from URL');
            
            const accessToken = urlParams.get('access_token');
            const refreshToken = urlParams.get('refresh_token');
            const type = urlParams.get('type');
            
            if (!accessToken || type !== 'recovery') {
                throw new Error('Invalid reset link');
            }

            // Set the session for password reset
            const { data, error } = await this.supabaseClient.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
            });

            if (error) throw error;

            return {
                success: true,
                message: 'Reset session established',
                user: data.user,
                session: data.session
            };
        } catch (error) {
            this.error('Password reset handling failed:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    /**
     * Update user password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Update result
     */
    async updatePassword(newPassword) {
        try {
            this.log('Updating user password');
            
            // Validate password
            if (!this.isValidPassword(newPassword)) {
                throw new Error('Password must be at least 8 characters long');
            }

            // Ensure user is authenticated
            if (!this.currentUser) {
                throw new Error('User must be authenticated to update password');
            }

            // Update password
            const { error } = await this.supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            
            return {
                success: true,
                message: 'Password updated successfully'
            };
        } catch (error) {
            this.error('Password update failed:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    /**
     * Update user security level in the database
     * @param {string} userId - User ID
     * @param {string} securityLevel - New security level
     */
    async updateUserSecurityLevel(userId, securityLevel) {
        try {
            this.log(`Updating security level for user ${userId} to ${securityLevel}`);
            
            const { error } = await this.supabaseClient
                .from('users')
                .update({ 
                    account_security_level: securityLevel,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;
            
            this.log('Security level updated successfully');
        } catch (error) {
            this.error('Failed to update security level:', error);
            // Don't throw here as this is a secondary operation
        }
    }

    /**
     * Call a Supabase Edge Function
     * @param {string} functionName - Name of the function to call
     * @param {Object} payload - Data to send to the function
     * @returns {Promise<Object>} Function response
     */
    async callEdgeFunction(functionName, payload) {
        try {
            this.log(`Calling Edge Function: ${functionName}`, payload);
            
            // Get current session if available
            const { data: { session } } = await this.supabaseClient.auth.getSession();
            
            // Use the user's access token if available, otherwise fall back to the anon key.
            const accessToken = session?.access_token || this.supabaseAnonKey;

            const response = await fetch(`${this.edgeFunctionBaseUrl}/${functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-client-info': 'auth-ui/1.0.0',
                },
                body: JSON.stringify(payload),
                mode: 'cors',
                credentials: 'omit'
            });

            // Always return parsed JSON so caller can render localized messages for non-2xx cases
            let body;
            try {
                body = await response.json();
            } catch (_) {
                body = { success: response.ok };
            }
            if (!response.ok) {
                this.error(`Edge Function ${functionName} failed:`, body?.message || `HTTP ${response.status}`);
            }
            return body;
        } catch (error) {
            this.error(`Error calling Edge Function ${functionName}:`, error);
            throw error; // Re-throw to be caught by the calling method
        }
    }

    /**
     * Check rate limiting for authentication operations
     * @param {string} operation - Operation type
     * @param {string} identifier - User identifier (email)
     * @returns {boolean} Whether operation is allowed
     */
    checkRateLimit(operation, identifier) {
        const key = `${operation}:${identifier}`;
        const now = Date.now();
        const limit = this.getRateLimit(operation);
        
        if (!this.rateLimitTracker.has(key)) {
            this.rateLimitTracker.set(key, []);
        }
        
        const attempts = this.rateLimitTracker.get(key);
        
        // Remove old attempts outside the time window
        const validAttempts = attempts.filter(time => now - time < limit.window);
        this.rateLimitTracker.set(key, validAttempts);
        
        return validAttempts.length < limit.maxAttempts;
    }

    /**
     * Update rate limiting tracker
     * @param {string} operation - Operation type
     * @param {string} identifier - User identifier
     */
    updateRateLimit(operation, identifier) {
        const key = `${operation}:${identifier}`;
        const now = Date.now();
        
        if (!this.rateLimitTracker.has(key)) {
            this.rateLimitTracker.set(key, []);
        }
        
        const attempts = this.rateLimitTracker.get(key);
        attempts.push(now);
        this.rateLimitTracker.set(key, attempts);
    }

    /**
     * Get rate limit configuration for operation
     * @param {string} operation - Operation type
     * @returns {Object} Rate limit config
     */
    getRateLimit(operation) {
        const limits = {
            'email-verification': { maxAttempts: 3, window: 300000 }, // 3 attempts per 5 minutes
            'password-reset': { maxAttempts: 3, window: 300000 },     // 3 attempts per 5 minutes
        };
        
        return limits[operation] || { maxAttempts: 5, window: 600000 }; // Default: 5 per 10 minutes
    }

    /**
     * Validate email address format
     * @param {string} email - Email to validate
     * @returns {boolean} Whether email is valid
     */
    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim()) && email.length <= 254; // RFC 5321 limit
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {boolean} Whether password is valid
     */
    isValidPassword(password) {
        if (!password || typeof password !== 'string') return false;
        return password.length >= 8; // Minimum 8 characters
    }

    /**
     * Sanitize user input
     * @param {string} input - Input to sanitize
     * @returns {string} Sanitized input
     */
    sanitizeInput(input) {
        if (!input || typeof input !== 'string') return '';
        return input.trim().replace(/[<>]/g, ''); // Remove potential HTML tags
    }

    /**
     * Get user-friendly error message
     * @param {Error} error - Error object
     * @returns {string} User-friendly message
     */
    getErrorMessage(error) {
        const errorMessages = {
            'Invalid login credentials': 'The email or password you entered is incorrect.',
            'Email not confirmed': 'Please check your email and click the verification link.',
            'User not found': 'No account found with this email address.',
            'Invalid email': 'Please enter a valid email address.',
            'Password should be at least 8 characters': 'Password must be at least 8 characters long.',
            'Invalid verification link': 'The verification link is invalid or has expired.',
            'Invalid reset link': 'The password reset link is invalid or has expired.',
            'Too many requests': 'Too many requests. Please wait before trying again.',
        };
        
        const message = error.message || error.toString();
        
        // Return mapped message or sanitized original message
        return errorMessages[message] || this.sanitizeInput(message) || 'An unexpected error occurred. Please try again.';
    }

    /**
     * Show loading state
     * @param {string} message - Loading message
     */
    showLoading(message = 'Processing...') {
        const loadingEl = document.getElementById('auth-loading');
        const loadingText = document.getElementById('loading-text');
        
        if (loadingEl) {
            if (loadingText) loadingText.textContent = message;
            loadingEl.style.display = 'flex';
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const loadingEl = document.getElementById('auth-loading');
    if (loadingEl) {
      if (this.blockingOverlayActive) {
        // Do not hide when a blocking overlay is active
        return;
      }
            loadingEl.style.display = 'none';
        }
    }

  /**
   * Display a full-screen blocking overlay with a message, then redirect
   * @param {string} message - Message to display
   * @param {string} redirectUrl - URL to navigate to after delay
   * @param {number} delayMs - Delay before redirect (default 5000ms)
   */
  displayBlockingOverlay(message, redirectUrl, delayMs = 5000) {
    const loadingEl = document.getElementById('auth-loading');
    const loadingText = document.getElementById('loading-text');
    if (loadingEl) {
      this.blockingOverlayActive = true;
      if (loadingText) loadingText.textContent = this.sanitizeInput(message);
      loadingEl.style.display = 'flex';
      // Ensure overlay visually indicates error state if styles exist
      loadingEl.classList.add('blocking-overlay');
      try {
        setTimeout(() => {
          window.location.href = redirectUrl || 'https://mymemoryan.com';
        }, typeof delayMs === 'number' ? delayMs : 5000);
      } catch (_) {
        // Fallback immediate redirect
        window.location.href = redirectUrl || 'https://mymemoryan.com';
      }
    } else {
      // Fallback to error message if overlay missing
      this.displayError(message || 'Too many attempts. Please try again after 24 hours.');
      setTimeout(() => {
        window.location.href = redirectUrl || 'https://mymemoryan.com';
      }, typeof delayMs === 'number' ? delayMs : 5000);
    }
  }

    /**
     * Display error message to user
     * @param {string} message - Error message
     * @param {string} containerId - Container element ID
     */
    displayError(message, containerId = 'error-display') {
        const errorContainer = document.getElementById(containerId);
        if (errorContainer) {
            const text = this.sanitizeInput(message) || 'An unexpected error occurred. Please try again.';
            errorContainer.innerHTML = `
                <div class="auth-message error">
                    ${text}
                </div>
            `;
            errorContainer.style.display = 'block';
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 10000);
        }
    }

    /**
     * Display success message to user
     * @param {string} message - Success message
     * @param {string} containerId - Container element ID
     */
    displaySuccess(message, containerId = 'error-display') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="auth-message success">
                    <strong>Success:</strong> ${this.sanitizeInput(message)}
                </div>
            `;
            container.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                container.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Clear any displayed messages
     * @param {string} containerId - Container element ID
     */
    clearMessages(containerId = 'error-display') {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }
    }

    /**
     * Debug logging
     */
    log(...args) {
        if (this.debug) {
            console.log('[MemoryanAuth]', ...args);
        }
    }

    /**
     * Error logging
     */
    error(...args) {
        console.error('[MemoryanAuth]', ...args);
    }

    /**
     * Get current authentication state
     * @returns {Object} Current auth state
     */
    getAuthState() {
        return {
            isAuthenticated: !!this.currentUser,
            user: this.currentUser,
            session: this.currentSession,
            isInitialized: this.isInitialized
        };
    }

    /**
     * Sign out current user
     * @returns {Promise<Object>} Sign out result
     */
    async signOut() {
        try {
            const { error } = await this.supabaseClient.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            this.currentSession = null;
            
            return { success: true, message: 'Signed out successfully' };
        } catch (error) {
            this.error('Sign out failed:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    /**
     * Move language dropdown to body when open (fixes Safari z-index behind content).
     * Call with true when opening, false when closing.
     */
    positionLanguageDropdown(open) {
        const dropdown = document.getElementById('language-dropdown');
        const button = document.getElementById('language-button');
        const selector = document.querySelector('.language-selector');
        if (!dropdown || !button || !selector) return;
        if (open) {
            const rect = button.getBoundingClientRect();
            document.body.appendChild(dropdown);
            dropdown.style.position = 'fixed';
            dropdown.style.top = (rect.bottom + 10) + 'px';
            dropdown.style.right = (window.innerWidth - rect.right) + 'px';
            dropdown.style.left = 'auto';
            dropdown.style.zIndex = '99998';
        } else {
            if (dropdown.parentNode !== selector) {
                selector.appendChild(dropdown);
            }
            dropdown.style.position = '';
            dropdown.style.top = '';
            dropdown.style.right = '';
            dropdown.style.left = '';
            dropdown.style.zIndex = '';
        }
    }
}

// Create global instance
window.MemoryanAuth = new MemoryanAuth();

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', async function() {
    if (window.MemoryanConfig && window.MemoryanConfig.supabase) {
        const { url, anonKey } = window.MemoryanConfig.supabase;
        await window.MemoryanAuth.init({
            supabaseUrl: url,
            supabaseAnonKey: anonKey
        });
    }
}); 
