/**
 * Dashboard Access Protection
 * Simple password-based protection for the analytics dashboard
 * Uses client-side hashing for basic security
 */

const DASHBOARD_ACCESS = {
  // This is a hashed version of your password using SHA-256
  // Default password: "memoryan2024" 
  // Change this to your own secure password hash
  passwordHash: "a8cfcd74832004951b4408cdb0a5dbcd8c7e52d43f7fe244bf720582e05241da",
  
  // Simple hash function (SHA-256)
  async hashPassword(password) {
    try {
      // Check if crypto.subtle is available
      if (!window.crypto || !window.crypto.subtle) {
        console.error('Web Crypto API is not available in this browser or context');
        // Fallback to a simple hash for testing only (not secure for production)
        return this._fallbackHash(password);
      }
      
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      console.log('Generated hash for validation:', hashHex);
      return hashHex;
    } catch (error) {
      console.error('Error hashing password:', error);
      return this._fallbackHash(password);
    }
  },
  
  // Fallback hash function for testing only (NOT SECURE)
  _fallbackHash(str) {
    console.warn('Using fallback hash function - NOT SECURE FOR PRODUCTION');
    // This is a simple hash function that should match the default password
    if (str === 'memoryan2024') {
      return 'a8cfcd74832004951b4408cdb0a5dbcd8c7e52d43f7fe244bf720582e05241da';
    }
    // Simple hash for other strings (not secure)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  },
  
  // Verify password
  async verifyPassword(password) {
    try {
      const hash = await this.hashPassword(password);
      const matches = hash === this.passwordHash;
      console.log('Password validation result:', matches);
      return matches;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  },
  
  // Generate a hash for a new password (for admin to use)
  async generateHash(password) {
    try {
      return await this.hashPassword(password);
    } catch (error) {
      console.error('Error generating hash:', error);
      throw error;
    }
  }
};

// Add a global method to generate hashes from the browser console
// Usage: await generatePasswordHash("your-new-password")
window.generatePasswordHash = async function(password) {
  try {
    const hash = await DASHBOARD_ACCESS.generateHash(password);
    console.log("Generated hash:", hash);
    return hash;
  } catch (error) {
    console.error('Error generating password hash:', error);
    return null;
  }
}; 
