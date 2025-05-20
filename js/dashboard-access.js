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
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
  
  // Verify password
  async verifyPassword(password) {
    const hash = await this.hashPassword(password);
    return hash === this.passwordHash;
  },
  
  // Generate a hash for a new password (for admin to use)
  async generateHash(password) {
    return await this.hashPassword(password);
  }
};

// Add a global method to generate hashes from the browser console
// Usage: await generatePasswordHash("your-new-password")
window.generatePasswordHash = async function(password) {
  const hash = await DASHBOARD_ACCESS.generateHash(password);
  console.log("Generated hash:", hash);
  return hash;
}; 