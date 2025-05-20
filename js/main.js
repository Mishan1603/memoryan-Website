document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll) library
    AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: false,
        mirror: true
    });
    
    // Magnetic Effect for interactive elements
    const magneticElements = document.querySelectorAll('.magnetic-element');
    
    magneticElements.forEach(element => {
        // Skip magnetic effect on flip cards to avoid conflict with rotation
        if (element.classList.contains('flip-card')) return;
        
        element.addEventListener('mousemove', function(e) {
            const position = element.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            
            // Adjust the magnetic pull strength based on element size
            const dampingFactor = Math.min(position.width, position.height) / 20;
            
            element.style.transform = `translate(${x / dampingFactor}px, ${y / dampingFactor}px)`;
        });
        
        element.addEventListener('mouseleave', function() {
            element.style.transform = 'translate(0px, 0px)';
        });
    });
    
    // Parallax effect for screenshots
    const parallaxImages = document.querySelectorAll('.parallax-image');
    
    parallaxImages.forEach(image => {
        const parentElement = image.closest('.screenshot-image-wrapper');
        
        if (parentElement) {
            parentElement.addEventListener('mousemove', function(e) {
                const position = parentElement.getBoundingClientRect();
                const x = (e.clientX - position.left) / position.width - 0.5;
                const y = (e.clientY - position.top) / position.height - 0.5;
                
                // Subtle parallax movement
                image.style.transform = `translate(${x * 10}px, ${y * 10}px) scale(1.05)`;
            });
            
            parentElement.addEventListener('mouseleave', function() {
                image.style.transform = 'translate(0px, 0px) scale(1)';
            });
        }
    });
    
    // Intersection Observer for scroll-triggered animations beyond AOS
    if ('IntersectionObserver' in window) {
        // Animate the gradient border on feature cards
        const featureItems = document.querySelectorAll('.feature-item');
        
        const featureObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const gradientBorder = entry.target.querySelector('.gradient-border');
                    if (gradientBorder) {
                        setTimeout(() => {
                            gradientBorder.style.transform = 'scaleX(0.6)';
                        }, 300);
                    }
                } else {
                    const gradientBorder = entry.target.querySelector('.gradient-border');
                    if (gradientBorder) {
                        gradientBorder.style.transform = 'scaleX(0.3)';
                    }
                }
            });
        }, { threshold: 0.2 });
        
        featureItems.forEach(item => {
            featureObserver.observe(item);
        });
        
        // Parallax scrolling for screenshot sections
        const screenshotSections = document.querySelectorAll('.screenshot-panel');
        
        const screenObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
        
        screenshotSections.forEach(section => {
            section.style.opacity = 0;
            section.style.transform = 'translateY(50px)';
            section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            screenObserver.observe(section);
        });
    }
    
    // Fix for QR Code flip cards - only flip on click, not hover
    const setupFlipCards = () => {
        const flipCardItems = document.querySelectorAll('.qr-code-item');
        
        flipCardItems.forEach(item => {
            // Get the flip card inside this item
            const card = item.querySelector('.flip-card');
            if (!card) return;
            
            // Clean up any existing event listeners
            const clone = card.cloneNode(true);
            card.parentNode.replaceChild(clone, card);
            
            // Work with the fresh clone
            const freshCard = item.querySelector('.flip-card');
            
            // Explicitly remove magnetic effect and any hover behaviors
            freshCard.classList.remove('magnetic-element');
            freshCard.style.transform = 'none';
            
            // Set perspective on the container
            item.style.perspective = '1000px';
            
            // Manual click toggle for flipping
            freshCard.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Prevent event bubbling
                
                const inner = this.querySelector('.flip-card-inner');
                if (inner) {
                    if (inner.style.transform === 'rotateY(180deg)') {
                        inner.style.transform = 'rotateY(0deg)';
                    } else {
                        inner.style.transform = 'rotateY(180deg)';
                    }
                }
            });
            
            // Prevent any mouse events from causing transform changes
            ['mouseover', 'mouseleave', 'mousemove'].forEach(eventType => {
                freshCard.addEventListener(eventType, function(e) {
                    e.stopPropagation();
                    this.style.transform = 'none';
                });
            });
            
            // Handle touch events for mobile
            let touchStartTime = 0;
            
            freshCard.addEventListener('touchstart', function(e) {
                touchStartTime = new Date().getTime();
            });
            
            freshCard.addEventListener('touchend', function(e) {
                const touchEndTime = new Date().getTime();
                const touchDuration = touchEndTime - touchStartTime;
                
                // Only flip if it was a quick tap (not a scroll)
                if (touchDuration < 200) {
                    const inner = this.querySelector('.flip-card-inner');
                    if (inner) {
                        if (inner.style.transform === 'rotateY(180deg)') {
                            inner.style.transform = 'rotateY(0deg)';
                        } else {
                            inner.style.transform = 'rotateY(180deg)';
                        }
                    }
                    e.preventDefault(); // Prevent default behavior
                    e.stopPropagation(); // Prevent event bubbling
                }
            });
        });
    };
    
    // Cleanup any flip card issues
    setupFlipCards();
    
    // Animated gradient background with parallax scrolling effect
    const animatedGradient = document.querySelector('.animated-gradient');
    
    if (animatedGradient) {
        // Mouse movement parallax
        document.addEventListener('mousemove', function(e) {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            // Subtle background movement
            animatedGradient.style.backgroundPosition = `${x * 10}% ${y * 10}%`;
        });
        
        // Scroll-based parallax
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            const scrollPercentage = (scrollPosition / (document.body.scrollHeight - window.innerHeight));
            
            // Apply parallax effect to background based on scroll position
            animatedGradient.style.transform = `translateZ(0) scale(${1 + scrollPercentage * 0.1})`;
            animatedGradient.style.opacity = Math.max(0.5, 0.8 - scrollPercentage * 0.3);
            
            // Adjust the background position based on scroll for depth effect
            const yOffset = scrollPercentage * 20;
            const xOffset = Math.sin(scrollPercentage * Math.PI * 2) * 10;
            animatedGradient.style.backgroundPosition = `${50 + xOffset}% ${yOffset}%`;
        });
    }
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for header
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll('.cta-button, .store-button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            button.style.transform = 'translateY(-5px)';
        });
        
        button.addEventListener('mouseleave', function() {
            button.style.transform = 'translateY(0)';
        });
    });
    
    // Add random twinkling stars to the background (subtle effect)
    const createStars = () => {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        starsContainer.style.position = 'fixed';
        starsContainer.style.top = '0';
        starsContainer.style.left = '0';
        starsContainer.style.width = '100%';
        starsContainer.style.height = '100%';
        starsContainer.style.pointerEvents = 'none';
        starsContainer.style.zIndex = '-1';
        document.body.appendChild(starsContainer);
        
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 2;
            
            star.style.position = 'absolute';
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.background = 'rgba(255, 255, 255, 0.8)';
            star.style.borderRadius = '50%';
            star.style.opacity = Math.random() * 0.5 + 0.1;
            
            // Add twinkling animation
            star.style.animation = `twinkle ${Math.random() * 4 + 3}s infinite alternate`;
            
            starsContainer.appendChild(star);
        }
        
        // Add keyframes for twinkling
        const keyframes = `
            @keyframes twinkle {
                0% { opacity: ${Math.random() * 0.2 + 0.1}; }
                100% { opacity: ${Math.random() * 0.5 + 0.4}; }
            }
        `;
        
        const style = document.createElement('style');
        style.innerHTML = keyframes;
        document.head.appendChild(style);
    };
    
    // Call createStars to add twinkling effect
    createStars();
    
    // Initialize Swiper.js for the screenshot carousel
    const screenshotSwiper = new Swiper('.screenshot-swiper', {
        slidesPerView: 'auto',
        centeredSlides: true,
        spaceBetween: 30,
        loop: true,
        grabCursor: true,
        keyboard: {
            enabled: true,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            320: {
                slidesPerView: 1.2,
                spaceBetween: 20,
            },
            576: {
                slidesPerView: 1.4,
                spaceBetween: 25,
            },
            768: {
                slidesPerView: 1.6,
                spaceBetween: 30,
            },
            992: {
                slidesPerView: 2,
                spaceBetween: 40,
            },
            1200: {
                slidesPerView: 2.2,
                spaceBetween: 50,
            }
        },
        effect: 'coverflow',
        coverflowEffect: {
            rotate: 5,
            stretch: 0,
            depth: 100,
            modifier: 2,
            slideShadows: false,
        },
    });
    
    // Privacy Policy and Terms of Service Modal Implementation
    const setupModals = () => {
        // Add modal containers to the body
        const modalHTML = `
            <div id="privacy-modal" class="modal">
                <div class="modal-content glass-panel">
                    <span class="modal-close">&times;</span>
                    <h2>Privacy Policy</h2>
                    <div class="modal-body">
                        <p><strong>Last Updated:</strong> May 1, 2024</p>
                        
                        <h3>1. Introduction</h3>
                        <p>Welcome to Memoryan. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.</p>
                        
                        <h3>2. Information We Collect</h3>
                        <p>We collect the following types of information:</p>
                        <ul>
                            <li><strong>Account Information:</strong> Email address and authentication information when you register.</li>
                            <li><strong>User Content:</strong> The content you save within the app, including links, notes, and other media.</li>
                            <li><strong>Usage Data:</strong> Information about how you use the app, features accessed, and time spent.</li>
                            <li><strong>Device Information:</strong> Device type, operating system, and unique device identifiers.</li>
                        </ul>
                        
                        <h3>3. How We Use Your Information</h3>
                        <p>We use your information to:</p>
                        <ul>
                            <li>Provide and improve our services</li>
                            <li>Personalize your experience</li>
                            <li>Communicate with you about updates or changes</li>
                            <li>Ensure the security of our services</li>
                            <li>Analyze usage patterns to enhance functionality</li>
                        </ul>
                        
                        <h3>4. Data Storage and Security</h3>
                        <p>Your data is stored securely in our cloud servers. We implement appropriate technical and organizational measures to protect your personal information.</p>
                        
                        <h3>5. Your Rights</h3>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Delete your data (subject to retention requirements)</li>
                            <li>Export your data in a common format</li>
                            <li>Object to certain processing of your data</li>
                        </ul>
                        
                        <h3>6. Third-Party Services</h3>
                        <p>We may use third-party services for analytics, crash reporting, and other functionality. These services may collect information about your use of the app.</p>
                        
                        <h3>7. Children's Privacy</h3>
                        <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
                        
                        <h3>8. Changes to This Policy</h3>
                        <p>We may update this policy periodically. We will notify you of any significant changes through the app or via email.</p>
                        
                        <h3>9. Contact Us</h3>
                        <p>If you have any questions about this Privacy Policy, please contact us at privacy@memoryan.com.</p>
                    </div>
                </div>
            </div>
            
            <div id="terms-modal" class="modal">
                <div class="modal-content glass-panel">
                    <span class="modal-close">&times;</span>
                    <h2>Terms of Service</h2>
                    <div class="modal-body">
                        <p><strong>Last Updated:</strong> May 1, 2024</p>
                        
                        <h3>1. Acceptance of Terms</h3>
                        <p>By accessing or using the Memoryan mobile application, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                        
                        <h3>2. User Accounts</h3>
                        <p>You must create an account to use certain features of the app. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
                        
                        <h3>3. User Content</h3>
                        <p>You retain ownership of content you create or upload to the app. By submitting content, you grant us a non-exclusive, worldwide license to use, store, and display your content for the purpose of providing our services.</p>
                        
                        <h3>4. Acceptable Use</h3>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Use the app for any illegal purpose</li>
                            <li>Upload content that infringes on intellectual property rights</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Use automated means to access the app without our permission</li>
                            <li>Interfere with or disrupt the app or servers</li>
                        </ul>
                        
                        <h3>5. Intellectual Property</h3>
                        <p>The app, including all software, designs, graphics, and content created by us, is protected by copyright, trademark, and other intellectual property laws.</p>
                        
                        <h3>6. Subscription Services</h3>
                        <p>Premium features may require a subscription. Billing will occur through your app store account. Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.</p>
                        
                        <h3>7. Disclaimer of Warranties</h3>
                        <p>The app is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the app will be uninterrupted, secure, or error-free.</p>
                        
                        <h3>8. Limitation of Liability</h3>
                        <p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the app.</p>
                        
                        <h3>9. Termination</h3>
                        <p>We may terminate or suspend your account and access to the app at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to others.</p>
                        
                        <h3>10. Governing Law</h3>
                        <p>These Terms shall be governed by the laws of [Jurisdiction], without regard to its conflict of law provisions.</p>
                        
                        <h3>11. Changes to Terms</h3>
                        <p>We reserve the right to modify these Terms at any time. We will provide notification of material changes through the app or via email.</p>
                        
                        <h3>12. Contact Us</h3>
                        <p>If you have any questions about these Terms, please contact us at terms@memoryan.com.</p>
                    </div>
                </div>
            </div>
        `;
        
        // Append modals to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Setup modal open/close functionality
        const privacyLinks = document.querySelectorAll('a[href="#"][title="Privacy Policy"]');
        const termsLinks = document.querySelectorAll('a[href="#"][title="Terms of Service"]');
        const closeButtons = document.querySelectorAll('.modal-close');
        const modals = document.querySelectorAll('.modal');
        
        // Open modal on link click
        privacyLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById('privacy-modal').style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });
        
        termsLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById('terms-modal').style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });
        
        // Close modal on close button click
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
                document.body.style.overflow = ''; // Restore scrolling
            });
        });
        
        // Close modal on outside click
        window.addEventListener('click', function(e) {
            modals.forEach(modal => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = ''; // Restore scrolling
                }
            });
        });
        
        // Close modal on escape key
        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    };
    
    // Initialize modals
    setupModals();
}); 