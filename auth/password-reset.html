/**
 * Password Reset Page JavaScript (OTP Flow)
 * Handles the multi-step password reset process.
 */

class PasswordReset {
    constructor() {
        this.isProcessing = false;
        this.currentUsername = null;
        this.currentEmail = null;
        this.resetToken = null;
    this.lastFailed = { email: null, otp: null };
        
        this.init = this.init.bind(this);
        this.showSection = this.showSection.bind(this);
    }

    async init() {
        await this.waitForAuth();
        
        // Initialize language support (saved or browser language)
        if (window.i18n) {
            window.i18n.init({
                selector: '[data-i18n]',
                placeholderSelector: '[data-i18n-placeholder]'
            });
        }
        
        this.setupEventListeners();
        this.setupLanguageSelector();
        
        // Check if URL has reset parameters
        this.handleUrlParameters();
    }

    async waitForAuth() {
        while (!window.MemoryanAuth || !window.MemoryanAuth.isInitialized) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    setupEventListeners() {
        // Email-first flow
        document.getElementById('email-form').addEventListener('submit', this.handleEmailSubmit.bind(this));
        document.getElementById('request-otp-form').addEventListener('submit', this.handleRequestOtp.bind(this));
        document.getElementById('verify-otp-form').addEventListener('submit', this.handleVerifyOtp.bind(this));
        document.getElementById('new-password-form').addEventListener('submit', this.handleSetNewPassword.bind(this));
        // Remove resend button per requirement
        const resend = document.getElementById('resend-otp-link');
        if (resend) resend.style.display = 'none';
    }

    setupLanguageSelector() {
        const languageButton = document.getElementById('language-button');
        const languageDropdown = document.getElementById('language-dropdown');
        const languageOptions = document.querySelectorAll('.language-option');
        
        if (languageButton && languageDropdown) {
            languageButton.addEventListener('click', () => {
                languageDropdown.classList.toggle('active');
                if (window.MemoryanAuth && window.MemoryanAuth.positionLanguageDropdown) {
                    window.MemoryanAuth.positionLanguageDropdown(languageDropdown.classList.contains('active'));
                }
            });
            
            languageOptions.forEach(option => {
                option.addEventListener('click', (event) => {
                    event.preventDefault();
                    const lang = option.getAttribute('data-lang');
                    if (window.i18n && lang) {
                        window.i18n.changeLanguage(lang);
                        languageDropdown.classList.remove('active');
                        if (window.MemoryanAuth && window.MemoryanAuth.positionLanguageDropdown) {
                            window.MemoryanAuth.positionLanguageDropdown(false);
                        }
                    }
                });
            });
            
            document.addEventListener('click', (event) => {
                if (!languageButton.contains(event.target) && !languageDropdown.contains(event.target)) {
                    languageDropdown.classList.remove('active');
                    if (window.MemoryanAuth && window.MemoryanAuth.positionLanguageDropdown) {
                        window.MemoryanAuth.positionLanguageDropdown(false);
                    }
                }
            });
        }
    }

    showSection(sectionId) {
        ['email-section', 'request-otp-section', 'enter-otp-section', 'new-password-section', 'password-updated-section'].forEach(id => {
            document.getElementById(id).style.display = (id === sectionId) ? 'block' : 'none';
        });
    }

    async handleUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'reset') {
            const result = await window.MemoryanAuth.handlePasswordReset(urlParams);
            if (result.success) {
                this.showSection('new-password-section');
            } else {
                window.MemoryanAuth.displayError(result.message || 'Invalid password reset link.');
                this.showSection('email-section');
            }
        }
    }

    async handleEmailSubmit(event) {
        event.preventDefault();
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        window.MemoryanAuth.showLoading('Checking email...');
        window.MemoryanAuth.clearMessages();

        try {
            // Read email from form, do not prefill anything
            const emailInput = document.getElementById('reset-email');
            this.currentEmail = (emailInput?.value || '').toLowerCase().trim();

            if (!this.currentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.currentEmail)) {
                window.MemoryanAuth.displayError('Please enter a valid email address.');
                return;
            }

            if (this.lastFailed.email && this.lastFailed.email === this.currentEmail) {
                window.MemoryanAuth.displayError(window.i18n ? window.i18n.t('errors.emailNotFound') : 'Email not found.');
                return;
            }

            // Step 1 validation: ensure user exists
            const { data: userCheck, error: userErr } = await window.MemoryanAuth.supabaseClient
                .rpc('get_user_auth_status', { p_user_email: this.currentEmail });
            if (userErr) {
                window.MemoryanAuth.displayError('Failed to check account. Please try again.');
                return;
            }
            if (!userCheck || userCheck.length === 0) {
                this.lastFailed.email = this.currentEmail;
                window.MemoryanAuth.displayError(window.i18n ? window.i18n.t('errors.emailNotFound') : 'No account found with this email address.');
                return;
            }

            // Step 1 validation: ensure flow was initiated from the app
            const { data: initiated, error: initErr } = await window.MemoryanAuth.supabaseClient
                .rpc('check_password_reset_initiated', { p_user_email: this.currentEmail });
            if (initErr) {
                window.MemoryanAuth.displayError('Failed to verify reset initiation. Please try again.');
                return;
            }
            if (!initiated) {
                window.MemoryanAuth.displayError('Please initiate password reset from the mobile app first.');
                return;
            }

            // Show plain email as requested and move to OTP request
            document.getElementById('user-email-display').textContent = this.currentEmail;
            this.showSection('request-otp-section');
        } catch (error) {
            window.MemoryanAuth.displayError('An unexpected error occurred. Please try again.');
        } finally {
            this.isProcessing = false;
            window.MemoryanAuth.hideLoading();
        }
    }

    maskEmail(email) {
        if (!email || email.indexOf('@') === -1) return email;
        
        const parts = email.split('@');
        if (parts[0].length <= 3) {
            return parts[0][0] + '***@' + parts[1];
        } else {
            return parts[0].substring(0, 2) + '***@' + parts[1];
        }
    }

    async handleRequestOtp(event) {
        event.preventDefault();
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        window.MemoryanAuth.showLoading('Sending reset code...');
        window.MemoryanAuth.clearMessages();

        try {
            // Email already captured in Step 1
            if (!this.currentEmail) {
                window.MemoryanAuth.displayError('Please enter your email first.');
                this.showSection('email-section');
                return;
            }

            // Call the send-password-reset-otp Edge Function
            const result = await window.MemoryanAuth.callEdgeFunction('send-password-reset-otp', { 
                email: this.currentEmail
            });
            
            if (result.success) {
                document.getElementById('otp-email').textContent = this.currentEmail;
                this.showSection('enter-otp-section');
                window.MemoryanAuth.displaySuccess(result.message || (window.i18n ? window.i18n.t('passwordReset.receiveOTP') : 'Reset code sent successfully!'));
            } else {
                const msg = (result.message || '').toLowerCase();
              if (msg.includes('too many') || msg.includes('rate')) {
                  // Blocked state → show overlay + redirect
                  const text = window.i18n ? window.i18n.t('errors.tooManyAttempts') : 'Too many attempts. Please try again after 24 hours.';
                  window.MemoryanAuth.displayBlockingOverlay(text, 'https://mymemoryan.com', 5000);
              } else if (msg.includes('not initiated')) {
                  const text = window.i18n ? window.i18n.t('errors.initiationRequired') : 'Please initiate password reset from the mobile app first.';
                  window.MemoryanAuth.displayError(text);
                } else if (msg.includes('no account') || msg.includes('not found')) {
                    window.MemoryanAuth.displayError(window.i18n ? window.i18n.t('errors.emailNotFound') : "This email isn't linked to any existing account. Please check and try again.");
                } else {
                    window.MemoryanAuth.displayError(result.message || (window.i18n ? window.i18n.t('errors.unexpected') : 'Failed to send reset code.'));
                }
            }
        } catch (error) {
            window.MemoryanAuth.displayError('An unexpected error occurred. Please try again.');
        } finally {
            this.isProcessing = false;
            window.MemoryanAuth.hideLoading();
        }
    }

    async handleVerifyOtp(event) {
        event.preventDefault();
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        window.MemoryanAuth.showLoading('Verifying code...');
        window.MemoryanAuth.clearMessages();

        try {
            const otp = document.getElementById('otp-input').value;
            if (this.lastFailed.otp && this.lastFailed.otp === otp) {
                window.MemoryanAuth.displayError(window.i18n ? window.i18n.t('errors.invalidCode') : 'Invalid verification code.');
                return;
            }
            
            // Call the verify-password-reset-otp Edge Function
            const result = await window.MemoryanAuth.callEdgeFunction('verify-password-reset-otp', {
                email: this.currentEmail,
                otp: otp
            });

            if (result.success) {
                this.resetToken = result.resetToken;
                this.showSection('new-password-section');
            } else {
                const blocked = (result?.blocked || false) === true;
                if (blocked || (result?.remainingAttempts === 0)) {
                    const msg = window.i18n ? window.i18n.t('errors.tooManyAttempts') : 'Too many attempts. Please try again after 24 hours.';
                    // Show blocking overlay and redirect after 5s
                    window.MemoryanAuth.displayBlockingOverlay(msg, 'https://mymemoryan.com', 5000);
                } else {
                    this.lastFailed.otp = otp;
                    window.MemoryanAuth.displayError(window.i18n ? window.i18n.t('errors.invalidCode') : 'Invalid verification code.');
                }
                
                // Update remaining attempts display accurately each time
                const attemptsEl = document.getElementById('remaining-attempts');
                if (result.remainingAttempts !== undefined && result.remainingAttempts !== null) {
                    const attemptsText = result.remainingAttempts === 0
                      ? (window.i18n ? window.i18n.t('errors.tooManyAttempts') : 'Too many attempts. Please try again after 24 hours.')
                      : (result.remainingAttempts === 1 ? '1 attempt remaining.' : `${result.remainingAttempts} attempts remaining.`);
                    attemptsEl.textContent = attemptsText;
                    attemptsEl.style.display = 'block';
                } else {
                    attemptsEl.textContent = '';
                    attemptsEl.style.display = 'none';
                }
            }
        } catch (error) {
            window.MemoryanAuth.displayError('An unexpected error occurred. Please try again.');
        } finally {
            this.isProcessing = false;
            window.MemoryanAuth.hideLoading();
        }
    }

    async handleSetNewPassword(event) {
        event.preventDefault();
        if (this.isProcessing) return;

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            window.MemoryanAuth.displayError('Passwords do not match.');
            return;
        }
        
        // Password strength validation
        if (newPassword.length < 8) {
            window.MemoryanAuth.displayError('Password must be at least 8 characters long.');
            return;
        }

        this.isProcessing = true;
        window.MemoryanAuth.showLoading('Updating password...');
        window.MemoryanAuth.clearMessages();

        try {
            const result = await window.MemoryanAuth.callEdgeFunction('confirm-password-reset', {
                resetToken: this.resetToken,
                email: this.currentEmail,
                newPassword: newPassword
            });

            if (result.success) {
                this.showSection('password-updated-section');
            } else {
                window.MemoryanAuth.displayError(result.message || 'Failed to update password.');
            }
        } catch (error) {
            window.MemoryanAuth.displayError('An unexpected error occurred. Please try again.');
        } finally {
            this.isProcessing = false;
            window.MemoryanAuth.hideLoading();
        }
    }

    handleResendOtp(event) {
        event.preventDefault();
        this.handleRequestOtp(new Event('submit'));
    }
    
    backToUsername(event) {
        event.preventDefault();
        this.showSection('username-section');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new PasswordReset().init();
}); 
