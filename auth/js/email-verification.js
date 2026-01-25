/**
 * Email Verification Page JavaScript
 * Handles the email verification process using OTP code.
 */

class EmailVerification {
    constructor() {
        this.isProcessing = false;
        this.currentEmail = null;
    this.lastFailed = { email: null, otp: null }; // prevent repeated same invalid value
        
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
        
        // Check if URL has verification token
        this.handleUrlParameters();
    }

    async waitForAuth() {
        while (!window.MemoryanAuth || !window.MemoryanAuth.isInitialized) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    setupEventListeners() {
        document.getElementById('request-otp-form').addEventListener('submit', this.handleRequestOtp.bind(this));
        document.getElementById('verify-otp-form').addEventListener('submit', this.handleVerifyOtp.bind(this));
    // Remove resend (disabled per requirement)
    const resend = document.getElementById('resend-otp-link');
    if (resend) resend.style.display = 'none';
    }

    setupLanguageSelector() {
        const languageButton = document.getElementById('language-button');
        const languageDropdown = document.getElementById('language-dropdown');
        const languageOptions = document.querySelectorAll('.language-option');
        
        if (languageButton && languageDropdown) {
            // Toggle dropdown
            languageButton.addEventListener('click', () => {
                languageDropdown.classList.toggle('active');
            });
            
            // Handle language selection (saves and reloads page)
            languageOptions.forEach(option => {
                option.addEventListener('click', (event) => {
                    event.preventDefault();
                    const lang = option.getAttribute('data-lang');
                    if (window.i18n && lang) {
                        window.i18n.changeLanguage(lang);
                    }
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (event) => {
                if (!languageButton.contains(event.target) && !languageDropdown.contains(event.target)) {
                    languageDropdown.classList.remove('active');
                }
            });
        }
    }

    showSection(sectionId) {
        ['request-otp-section', 'enter-otp-section', 'verification-success-section'].forEach(id => {
            document.getElementById(id).style.display = (id === sectionId) ? 'block' : 'none';
        });
    }

    async handleUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const type = urlParams.get('type');
        const otpFromUrl = urlParams.get('otp');
        
        if (token && type === 'signup') {
            window.MemoryanAuth.showLoading('Verifying your email...');
            
            try {
                const result = await window.MemoryanAuth.handleEmailVerification(urlParams);
                
                if (result.success) {
                    this.showSection('verification-success-section');
                } else {
                    window.MemoryanAuth.displayError(result.message || 'Verification failed.');
                    this.showSection('request-otp-section');
                }
            } catch (error) {
                window.MemoryanAuth.displayError('An error occurred during verification.');
                this.showSection('request-otp-section');
            } finally {
                window.MemoryanAuth.hideLoading();
            }
        }

        // Prefill OTP if provided via URL (from email button)
        if (otpFromUrl) {
            const otpInput = document.getElementById('otp-input');
            if (otpInput) {
                otpInput.value = otpFromUrl;
                this.showSection('enter-otp-section');
                window.MemoryanAuth.displaySuccess('We prefilled your verification code.');
            }
        }
    }

    async handleRequestOtp(event) {
        event.preventDefault();
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        window.MemoryanAuth.showLoading(window.i18n ? window.i18n.t('common.processing') : 'Processing request...');
        window.MemoryanAuth.clearMessages();

        try {
            this.currentEmail = document.getElementById('verification-email').value;
            
      // Debounce identical failing email: if previous attempt failed for same email, return early
      if (this.lastFailed.email && this.lastFailed.email === this.currentEmail) {
        window.MemoryanAuth.displayError(window.i18n ? window.i18n.t('errors.emailNotFound') : 'Email not found.');
        return;
      }

      // Call edge function; our core returns body even on errors
            const result = await window.MemoryanAuth.callEdgeFunction('send-email-verification-otp', { email: this.currentEmail });
            const apiMessage = (result && (result.message || result.error)) ? String(result.message || result.error).trim() : '';
            const raw = apiMessage.toLowerCase();

            if (result && result.success) {
                document.getElementById('otp-email').textContent = this.currentEmail;
                this.showSection('enter-otp-section');
                window.MemoryanAuth.displaySuccess(result.message || (window.i18n ? window.i18n.t('emailVerification.codeSent') : 'Verification code sent successfully!'));
            } else {
                if (raw.includes('already verified')) {
                    this.showSection('verification-success-section');
                    window.MemoryanAuth.displaySuccess(window.i18n ? window.i18n.t('errors.alreadyVerified') : 'Your email is already verified. You can sign in to your account.');
                    return;
                }
                if (raw.includes('no account') || raw.includes('not found') || raw.includes("sign up first")) {
                    this.lastFailed.email = this.currentEmail;
                    window.MemoryanAuth.displayError(window.i18n ? window.i18n.t('errors.emailNotFound') : "This email isn't linked to any existing account. Please check and try again.");
                    return;
                }
                if (raw.includes('too many') || raw.includes('rate') || raw.includes('wait')) {
                    window.MemoryanAuth.displayError(window.i18n ? window.i18n.t('errors.tooManyAttempts') : 'Too many attempts. Please try again after 24 hours.');
                    return;
                }
                const fallback = window.i18n ? window.i18n.t('errors.unexpected') : 'An unexpected error occurred. Please try again.';
                window.MemoryanAuth.displayError(apiMessage || fallback);
            }
        } catch (error) {
            const msg = String(error && (error.message || error) || '').toLowerCase();
            if (msg.includes('already verified')) {
                this.showSection('verification-success-section');
                window.MemoryanAuth.displaySuccess(window.i18n ? window.i18n.t('errors.alreadyVerified') : 'Your email is already verified. You can sign in to your account.');
            } else if (msg.includes('no account') || msg.includes('not found')) {
                this.lastFailed.email = this.currentEmail;
                window.MemoryanAuth.displayError(window.i18n ? window.i18n.t('errors.emailNotFound') : "This email isn't linked to any existing account. Please check and try again.");
            } else {
                window.MemoryanAuth.displayError(window.i18n ? window.i18n.t('errors.unexpected') : 'An unexpected error occurred. Please try again.');
            }
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

      // Prevent repeated same invalid OTP attempts locally
      if (this.lastFailed.otp && this.lastFailed.otp === otp) {
        window.MemoryanAuth.displayError(window.i18n ? window.i18n.t('errors.invalidCode') : 'Invalid verification code.');
        return;
      }
            
            // Call the Edge Function to verify the OTP
      const result = await window.MemoryanAuth.callEdgeFunction('verify-email-otp', {
                email: this.currentEmail,
                otp: otp
            });
            
            if (result.success) {
                this.showSection('verification-success-section');
      } else {
        this.lastFailed.otp = otp;
        window.MemoryanAuth.displayError(result.message || (window.i18n ? window.i18n.t('errors.invalidCode') : 'Invalid verification code.'));
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
        // Just reuse the request OTP form submission
        this.showSection('request-otp-section');
        if (this.currentEmail) {
            document.getElementById('verification-email').value = this.currentEmail;
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new EmailVerification().init();
}); 
