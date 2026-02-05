    document.addEventListener('DOMContentLoaded', function() {
        // Initialize i18n (uses saved or browser language; main site: en, ru, uk, de)
        if (window.i18n && typeof window.i18n.init === 'function') {
            window.i18n.init({ selector: '[data-i18n]', placeholderSelector: '[data-i18n-placeholder]' });
            setupLanguageSelector();
        }

        function setupLanguageSelector() {
            var languageButton = document.getElementById('language-button');
            var languageDropdown = document.getElementById('language-dropdown');
            var languageOptions = document.querySelectorAll('.language-option');
            var currentBadge = document.getElementById('current-language');

            if (languageButton && languageDropdown) {
                languageButton.addEventListener('click', function(e) {
                    e.stopPropagation();
                    languageDropdown.classList.toggle('active');
                });
                languageOptions.forEach(function(option) {
                    option.addEventListener('click', function(e) {
                        e.preventDefault();
                        var lang = option.getAttribute('data-lang');
                        if (window.i18n && lang) {
                            window.i18n.changeLanguage(lang);
                            languageDropdown.classList.remove('active');
                            if (currentBadge) currentBadge.textContent = lang.toUpperCase();
                        }
                    });
                });
                document.addEventListener('click', function(e) {
                    if (!languageButton.contains(e.target) && !languageDropdown.contains(e.target)) {
                        languageDropdown.classList.remove('active');
                    }
                });
            }
            if (currentBadge && window.i18n && window.i18n.getCurrentLanguage) {
                currentBadge.textContent = window.i18n.getCurrentLanguage().toUpperCase();
            }
        }

        // Check if user has already accepted cookies
        const hasAcceptedCookies = localStorage.getItem('cookiesAccepted');
        
        if (!hasAcceptedCookies) {
            // Show cookie consent banner
            const cookieConsent = document.getElementById('cookie-consent');
            if (cookieConsent) {
                // Wait a moment before showing to ensure smooth animation
                setTimeout(() => {
                    cookieConsent.classList.add('show');
                }, 500);
                
                // Set up event listeners for buttons
                const acceptAllButton = document.getElementById('accept-all-cookies');
                const rejectOptionalButton = document.getElementById('reject-optional-cookies');
                const moreButton = document.getElementById('more-cookies');
                
                if (acceptAllButton) {
                    acceptAllButton.addEventListener('click', function() {
                        // Save full acceptance in localStorage
                        localStorage.setItem('cookiesAccepted', 'true');
                        localStorage.setItem('memoryan_cookie_preferences', JSON.stringify({
                            essential: true,
                            analytics: true,
                            thirdparty: true
                        }));
                        
                        // Hide the banner
                        cookieConsent.classList.remove('show');
                        setTimeout(() => {
                            cookieConsent.style.display = 'none';
                        }, 500);
                        
                        // Initialize analytics if available and preferences allow
                        if (window.Memoryan && window.Memoryan.Analytics && window.MemoryanConfig && window.MemoryanConfig.supabase) {
                            const { url, anonKey } = window.MemoryanConfig.supabase;
                            window.Memoryan.Analytics.init(url, anonKey).then(success => {
                                if (success) {
                                    window.Memoryan.Analytics.trackPageVisit();
                                }
                            });
                        }
                    });
                }
                
                if (rejectOptionalButton) {
                    rejectOptionalButton.addEventListener('click', function() {
                        // Save minimal acceptance in localStorage
                        localStorage.setItem('cookiesAccepted', 'true');
                        localStorage.setItem('memoryan_cookie_preferences', JSON.stringify({
                            essential: true,
                            analytics: false,
                            thirdparty: false
                        }));
                        
                        // Hide the banner
                        cookieConsent.classList.remove('show');
                        setTimeout(() => {
                            cookieConsent.style.display = 'none';
                        }, 500);
                    });
                }
                
                if (moreButton) {
                    moreButton.addEventListener('click', function() {
                        // Redirect to cookie policy page
                        window.location.href = 'cookie-policy.html';
                    });
                }
            }
        }
        
        // GLOBAL FIX: Protect flip cards from ANY external mouse effects
        // Must run before any other code
        (function protectFlipCards() {
            // Find all flip cards in the document
            const allFlipCards = document.querySelectorAll('.flip-card, .flip-card-inner, .flip-card-front, .flip-card-back');
            
            // Apply protection to each element
            allFlipCards.forEach(card => {
                // Prevent these elements from getting any transform changes from other scripts
                const originalTransform = window.getComputedStyle(card).transform;
                
                // Override transform setter for these elements
                Object.defineProperty(card.style, 'transform', {
                    set: function(value) {
                        // Only allow vertical translations and rotateY transforms
                        // Block any other transform changes to these elements
                        if (value === '' || 
                            value.includes('translateY') || 
                            value.includes('rotateY')) {
                            card.style.cssText += `transform: ${value};`;
                        }
                    },
                    configurable: true
                });
                
                // Block mousemove events completely
                card.addEventListener('mousemove', function(e) {
                    e.stopPropagation();
                }, true);
            });
            
            // Also disable magnetic effect on these elements by class
            document.querySelectorAll('.flip-card.magnetic-element').forEach(card => {
                card.classList.remove('magnetic-element');
            });
        })();
        
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
        
        // Device detection utilities
        const isMobileDevice = () => {
            // Check if device is mobile based on multiple criteria
            const aspectRatio = window.innerWidth / window.innerHeight;
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const hasSmallScreen = window.innerWidth <= 768;
            const userAgent = navigator.userAgent.toLowerCase();
            
            // Consider as mobile if it's touch-enabled and has portrait aspect ratio or small screen
            return isTouchDevice && (aspectRatio < 1.3 || hasSmallScreen);
        };
        
        const isAndroidDevice = () => {
            return /android/i.test(navigator.userAgent);
        };
        
        const isTabletDevice = () => {
            // Detect tablets (larger screen touch devices)
            const aspectRatio = window.innerWidth / window.innerHeight;
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const hasLargeScreen = window.innerWidth > 768 && window.innerWidth < 1200;
            
            return isTouchDevice && hasLargeScreen;
        };
        
        // Completely isolated flip card implementation with mobile-aware behavior
        const setupFlipCards = () => {
            const flipCardItems = document.querySelectorAll('.qr-code-item');
            
            flipCardItems.forEach(item => {
                try {
                    // Get original card
                    const originalCard = item.querySelector('.flip-card');
                    if (!originalCard) return;
                    
                    // Store card content
                    const cardHTML = originalCard.innerHTML;
                    
                    // Create parent node reference for insertion
                    const parentNode = originalCard.parentNode;
                    
                    // Remove the original card completely
                    originalCard.remove();
                    
                    // Create a new card from scratch with minimal attributes
                    const newCard = document.createElement('div');
                    newCard.className = 'flip-card';
                    newCard.innerHTML = cardHTML;
                    
                    // Get reference to the inner card that will flip
                    const inner = newCard.querySelector('.flip-card-inner');
                    
                    // Make sure inner element exists
                    if (!inner) {
                        console.error('Flip card inner element not found');
                        return;
                    }
                    
                    // Set perspective on container for 3D effect
                    item.style.perspective = '1000px';
                    
                    // Determine if this is an Android or iOS card
                    const downloadButton = newCard.querySelector('.download-button');
                    const isAndroidCard = downloadButton && downloadButton.getAttribute('data-platform') === 'android';
                    const isIOSCard = downloadButton && downloadButton.getAttribute('data-platform') === 'ios';
                    
                    // Define click handler with mobile-aware behavior
                    const handleCardClick = function(event) {
                        // Stop event propagation to other handlers
                        event.stopPropagation();
                        event.preventDefault();
                        
                        // Check if user is on mobile device
                        if (isMobileDevice() && !isTabletDevice()) {
                            console.log('Mobile device detected');
                            
                            // For Android cards on mobile, redirect to Play Store
                            if (isAndroidCard && isAndroidDevice()) {
                                console.log('Redirecting Android mobile user to Play Store');
                                window.open('https://play.google.com/store/apps/details?id=com.memoryan.app', '_blank');
                                return;
                            }
                            
                            // For iOS cards on mobile, still show QR code (fall through to flip)
                            // For tablets and desktop, always show QR code (fall through to flip)
                        }
                        
                        // Default behavior: flip the card to show QR code
                        if (inner.style.transform === 'rotateY(180deg)') {
                            inner.style.transform = '';
                        } else {
                            inner.style.transform = 'rotateY(180deg)';
                        }
                    };
                    
                    // Also enhance the download button behavior
                    if (downloadButton) {
                        downloadButton.addEventListener('click', function(event) {
                            event.stopPropagation();
                            event.preventDefault();
                            
                            // Check if user is on mobile device
                            if (isMobileDevice() && !isTabletDevice()) {
                                if (isAndroidCard && isAndroidDevice()) {
                                    console.log('Download button: Redirecting Android mobile user to Play Store');
                                    window.open('https://play.google.com/store/apps/details?id=com.memoryan.app', '_blank');
                                    return;
                                }
                            }
                            
                            // Default behavior: flip the card
                            handleCardClick(event);
                        });
                    }
                    
                    // Clear any existing handlers and add the click handler
                    newCard.onclick = handleCardClick;
                    
                    // EVENT BLOCKING: Prevent ANY mouse movement events from causing transforms
                    // Use capture phase to intercept events before they reach other handlers
                    const blockEvent = function(event) {
                        event.stopPropagation();
                        // Don't call preventDefault() as it interferes with CSS hover effects
                    };
                    
                    // Block these events explicitly to prevent any transform conflicts
                    ['mousemove', 'mouseover', 'mouseenter'].forEach(eventType => {
                        newCard.addEventListener(eventType, blockEvent, true);
                        
                        // Also block events on inner, front and back cards to be thorough
                        inner.addEventListener(eventType, blockEvent, true);
                        
                        const front = newCard.querySelector('.flip-card-front');
                        if (front) front.addEventListener(eventType, blockEvent, true);
                        
                        const back = newCard.querySelector('.flip-card-back');
                        if (back) back.addEventListener(eventType, blockEvent, true);
                    });
                    
                    // Make transform property read-only on inner element to prevent other scripts
                    // from changing it except through our click handler
                    let currentTransform = '';
                    Object.defineProperty(inner.style, 'transform', {
                        get: function() { 
                            return currentTransform; 
                        },
                        set: function(value) {
                            // Only allow transforms via our click handler
                            if (value === 'rotateY(180deg)' || value === '') {
                                currentTransform = value;
                                inner.style.cssText += `transform: ${value};`;
                            }
                        },
                        configurable: true
                    });
                    
                    // Disable pointer events on front/back to prevent bubbling
                    const front = newCard.querySelector('.flip-card-front');
                    const back = newCard.querySelector('.flip-card-back');
                    if (front) front.style.pointerEvents = 'none';
                    if (back) back.style.pointerEvents = 'none';
                    
                    // Add the new card to the DOM
                    parentNode.appendChild(newCard);
                    
                } catch (error) {
                    console.error('Error setting up flip card:', error);
                }
            });
        };
        
        // Initialize cards with the isolated implementation
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
        
        // Improved function to fix Swiper translations
        function fixSwiperTranslations() {
            console.log("🔄 Running fixSwiperTranslations");
            // Get all slides including duplicates
            const allSlides = document.querySelectorAll('.swiper-slide');
            console.log(`🔍 Found ${allSlides.length} swiper slides to translate`);
            
            // Current language for debugging
            const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
            console.log(`🌐 Current language: ${currentLang}`);
            
            // Function to translate a specific slide
            function translateSlide(slide, index) {
                const elementsToTranslate = slide.querySelectorAll('[data-i18n]');
                console.log(`🔍 Slide ${index}: Found ${elementsToTranslate.length} elements with data-i18n`);
                
                // Directly modify DOM for consistent results
                elementsToTranslate.forEach(element => {
                    const key = element.getAttribute('data-i18n');
                    
                    // Get translation directly from i18n
                    if (window.i18n && typeof window.i18n.t === 'function') {
                        const translation = window.i18n.t(key);
                        if (translation && typeof translation === 'string') {
                            // Update the content
                            element.textContent = translation;
                            console.log(`✅ Translated "${key}" to: "${translation.substring(0, 30)}${translation.length > 30 ? '...' : ''}"`);
                        } else {
                            console.warn(`❌ No translation found for key: ${key} in language: ${currentLang}`);
                            console.warn(`  Key structure: ${key.split('.').join(' > ')}`);
                        }
                    }
                });
            }
            
            // Translate all slides with index for debugging
            allSlides.forEach((slide, index) => translateSlide(slide, index));
        }
        
        // Hook into the language change event for Swiper translations
        if (window.i18n) {
            // Override the changeLanguage method to ensure Swiper slides are translated
            const originalChangeLanguage = window.i18n.changeLanguage;
            window.i18n.changeLanguage = function(lang) {
                console.log(`🔄 Language change detected to: ${lang}`);
                
                // Call original method
                originalChangeLanguage(lang);
                
                // Translate all Swiper slides at different intervals to catch all dynamic content
                [50, 200, 500, 1000].forEach(delay => {
                    setTimeout(fixSwiperTranslations, delay);
                });
            };
            
            // Add a global function to force translation of Swiper
            window.fixSwiperTranslations = fixSwiperTranslations;
            
            // Add a debug function to window for console access
            window.debugSwiper = function() {
                console.log("🔍 Debugging Swiper translations");
                // Print translations debug info
                window.i18n.t('debug.translations');
                
                // Count and log slides
                const allSlides = document.querySelectorAll('.swiper-slide');
                console.log(`Total slides: ${allSlides.length}`);
                
                // Log all data-i18n elements in each slide
                allSlides.forEach((slide, index) => {
                    const elementsToTranslate = slide.querySelectorAll('[data-i18n]');
                    console.log(`Slide ${index} has ${elementsToTranslate.length} data-i18n elements`);
                    
                    elementsToTranslate.forEach(el => {
                        const key = el.getAttribute('data-i18n');
                        console.log(`  Key: ${key}, Current text: "${el.textContent}"`);
                    });
                });
                
                // Force translation refresh
                fixSwiperTranslations();
                
                return "Debug information printed to console";
            };
        }
        
        // Initialize Swiper with translations support
        function initializeSwiper() {
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
                on: {
                    init: function() {
                        console.log("Swiper initialized");
                        
                        // Give a little time for Swiper to fully render
                        setTimeout(fixSwiperTranslations, 100);
                    },
                    loopCreate: function() {
                        // This event fires when Swiper creates loop duplicates
                        setTimeout(fixSwiperTranslations, 100);
                    },
                    slideChangeTransitionEnd: function() {
                        // When slides are changed, ensure translations are correct
                        setTimeout(fixSwiperTranslations, 50);
                    }
                }
            });
            
            // Expose Swiper instance globally for smart carousel optimizer
            window.screenshotSwiper = screenshotSwiper;
            
            // Notify smart carousel optimizer that Swiper is ready
            if (window.smartCarouselOptimizer && typeof window.smartCarouselOptimizer.setupSwiperHooks === 'function') {
                setTimeout(() => {
                    window.smartCarouselOptimizer.setupSwiperHooks();
                }, 100);
            }
            
            return screenshotSwiper;
        }
        
        // Call the initialization function
        const swiper = initializeSwiper();
        
        // Also run translation when the page fully loads
        window.addEventListener('load', function() {
            console.log("📄 Page fully loaded, applying translations to Swiper");
            // Allow Swiper to initialize fully
            setTimeout(fixSwiperTranslations, 300);
            setTimeout(fixSwiperTranslations, 1000);
        });
        
        // Monitor and fix translations periodically
        // This is a failsafe mechanism in case other scripts manipulate the DOM
        const translationInterval = setInterval(fixSwiperTranslations, 2000);
        // Stop the interval after 30 seconds to avoid unnecessary processing
        setTimeout(() => {
            console.log("⏱️ Stopping periodic translation checks");
            clearInterval(translationInterval);
        }, 30000);
        
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
                            <p>If you have any questions about this Privacy Policy, please contact us at info@memoryan.com.</p>
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