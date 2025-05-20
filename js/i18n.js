/**
 * i18n initialization and utilities for Memoryan website
 * Following i18next industry standard
 */

/**
 * Initialize i18next localization system
 * Implementation adapted for script-based website
 */
(function() {
    // Available languages
    const LANGUAGES = {
        en: 'English',
        ru: 'Русский'
    };
    
    // Default language
    let currentLanguage = 'en';
    
    // Storage key for language preference
    const LANGUAGE_STORAGE_KEY = 'memoryan_language';
    
    // Pre-loaded translations to avoid CORS issues
    const TRANSLATIONS = {
        en: {
            "common": {
                "download": "Download",
                "appStore": "App Store",
                "googlePlay": "Google Play",
                "features": "Features",
                "screenshots": "Screenshots",
                "comingSoon": "Social media coming soon!",
                "contact": "Contact:",
                "footer": {
                    "copyright": "© 2025 Memoryan. All rights reserved.",
                    "privacyPolicy": "Privacy Policy",
                    "termsOfService": "Terms of Service"
                }
            },
            "hero": {
                "title": "This is Memoryan",
                "subtitle": "An app that redefines how people save and apply valuable content from anywhere.",
                "description": "It's not just about saving links and notes — it's about effortlessly organizing and rediscovering them like never before.",
                "specialOffer": "Special Launch Offer!",
                "freePremium": "🎉 FREE PREMIUM Until the 15th of June! 🎉",
                "betaTesting": "Beta Testing starts 30th May. Be among the first to experience the full power of Memoryan.",
                "trailerSoon": "Trailer is soon"
            },
            "features": {
                "title": "Key Features of Memoryan",
                "chambersCreation": {
                    "title": "Chambers Creation",
                    "description": "Organize your content into visually stunning customizable Folders, which called Chambers."
                },
                "richCustomization": {
                    "title": "Rich Customization",
                    "description": "Personalize the look and feel of your Chambers and Blocks with gradients and themes."
                },
                "aiTitleGeneration": {
                    "title": "AI Title Generation",
                    "description": "Creation of Titles for saved content has never been easier."
                },
                "smartTagSystem": {
                    "title": "Smart Tag System",
                    "description": "Categorize with our unique \"Save-Enjoy-Apply\" tagging approach for better recall."
                },
                "contentBlocks": {
                    "title": "Blocks page",
                    "description": "A place where your saved content embraces a unified form for your links, notes."
                }
            },
            "screenshots": {
                "title": "Experience Memoryan",
                "keyboardHint": "Use keyboard arrows (←→) to navigate",
                "items": [
                    {
                        "title": "MemoryHub",
                        "description": "Your personalized home for all control over your chambers."
                    },
                    {
                        "title": "Chambers design",
                        "description": "Gradients, Titles and Emojis for full reflection of what you want to save there."
                    },
                    {
                        "title": "Save Content Effortlessly",
                        "description": "Quickly save links, notes and more with our intuitive interface."
                    },
                    {
                        "title": "Blocks page",
                        "description": "Visually appealing displays for your links, notes, and other saved content."
                    },
                    {
                        "title": "Rich Note Editor",
                        "description": "Write detailed and passionate notes without compromises."
                    },
                    {
                        "title": "Powerful Tagging System",
                        "description": "Organize content with our unique Save-Enjoy-Apply approach."
                    },
                    {
                        "title": "Rich Color Palette",
                        "description": "Choose from beautiful gradient options for your chambers."
                    },
                    {
                        "title": "Deadline Management",
                        "description": "The world is full of useful content. Enough pushing away. Set deadlines and get to it right away."
                    },
                    {
                        "title": "Convenient Sorting",
                        "description": "Organize your content in your folders today, and thank yourself tomorrow."
                    },
                    {
                        "title": "Advanced Options",
                        "description": "Full control over your content with our intuitive options menu."
                    }
                ]
            },
            "download": {
                "title": "Get Memoryan Now!",
                "ios": {
                    "title": "Download for iOS",
                    "description": "Tap to see QR code or click below"
                },
                "android": {
                    "title": "Download for Android",
                    "description": "Tap to see QR code or click below"
                }
            },
            "upcomingFeatures": {
                "title": "Upcoming Features",
                "description": "We're constantly improving Memoryan. Here's what's coming next:",
                "sync": {
                    "title": "Synchronization across devices",
                    "description": "Access your content seamlessly from all your devices."
                },
                "backup": {
                    "title": "Backup feature",
                    "description": "Keep your valuable content safe with automated backups."
                },
                "moreBlocks": {
                    "title": "More types of blocks",
                    "description": "Support for Documents (PDF, Word, Excel) and Media (Photo, Video)."
                },
                "languages": {
                    "title": "More supported languages",
                    "description": "Spanish, German, French and more coming soon."
                },
                "friends": {
                    "title": "Friends Screen",
                    "description": "Effortlessly share valuable content with people who matter to you, with no compromises."
                },
                "more": {
                    "title": "And much more",
                    "description": "Continuous enhancements, useful features, and fixes."
                }
            },
            "privacyPolicy": {
                "title": "Privacy Policy",
                "lastUpdated": "Last Updated:",
                "introduction": {
                    "title": "1. Introduction",
                    "content": "Welcome to Memoryan. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application."
                },
                "informationCollected": {
                    "title": "2. Information We Collect",
                    "content": "We collect the following types of information:",
                    "items": [
                        "Account Information: Email address and authentication information when you register.",
                        "User Content: The content you save within the app, including links, notes, and other media.",
                        "Usage Data: Information about how you use the app, features accessed, and time spent.",
                        "Device Information: Device type, operating system, and unique device identifiers."
                    ]
                }
            },
            "termsOfService": {
                "title": "Terms of Service",
                "lastUpdated": "Last Updated:",
                "acceptanceOfTerms": {
                    "title": "1. Acceptance of Terms",
                    "content": "By accessing or using the Memoryan mobile application, you agree to be bound by these Terms of Service and all applicable laws and regulations."
                },
                "userAccounts": {
                    "title": "2. User Accounts",
                    "content": "You must create an account to use certain features of the app. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account."
                }
            }
        },
        ru: {
            "common": {
                "features": "Особенности",
                "screenshots": "Скриншоты",
                "download": "Скачать",
                "appStore": "App Store",
                "googlePlay": "Google Play",
                "comingSoon": "Социальные медиа скоро появятся!",
                "contact": "Контакт:",
                "footer": {
                    "copyright": "© 2025 Memoryan. Все права защищены.",
                    "privacyPolicy": "Политика конфиденциальности",
                    "termsOfService": "Условия использования"
                }
            },
            "hero": {
                "title": "Это Memoryan",
                "subtitle": "Революция в том, как вы сохраняете и применяете потоки информации!",
                "description": "Это не просто сохранение ссылок и заметок — это искусство ценить, систематизировать и открывать что то новое.",
                "specialOffer": "Стартовое предложение!",
                "freePremium": "🎉 Бесплатный Премиум до 15 июня! 🎉",
                "betaTesting": "Бета-тестирование с 30 мая — станьте первыми героями Memoryan!",
                "trailerSoon": "Трейлер - скоро"
            },
            "features": {
                "title": "Ключевые возможности Memoryan",
                "chambersCreation": {
                  "title": "Создание Папок",
                  "description": "Группируйте контент в стильные настраиваемые Камеры для быстрой навигации."
                },
                "richCustomization": {
                  "title": "Глубокая персонализация",
                  "description": "Настройте внешний вид папок и блоков: градиенты, шрифты и темы — всё под ваш стиль."
                },
                "aiTitleGeneration": {
                  "title": "ИИ-заголовки в один клик",
                  "description": "Создание названий сохранённого контента ещё никогда не было таким простым и удобным."
                },
                "smartTagSystem": {
                  "title": "Удобная система тегов",
                  "description": "Продуманная система тегов обеспечит вам максимальную эффективность в применении и организацииконтента."
                },
                "contentBlocks": {
                  "title": "Страница блоков",
                  "description": "Место где ваши ссылки и заметки обретаютсёткое и лаконичное оформление в едином стиле."
                }
            },
            "screenshots": {
                "title": "Взгляд изнутри Memoryan",
                "keyboardHint": "Используйте стрелки ← → для перелистывания",
                "items": [
                  {
                    "title": "Главная страница",
                    "description": "Ваш персональный центр управления всеми папками"
                  },
                  {
                    "title": "Дизайн папок",
                    "description": "Градиенты, Заголовки и Емодзи всё для полного отражения того что вам желается хранить."
                  },
                  {
                    "title": "Мгновенные сохранения",
                    "description": "Сохраняйте любые ссылки, буквально в пару кликов."
                  },
                  {
                    "title": "Визуально упорядоченные блоки",
                    "description": "Визуально упорядоченные блоки для мгновенного доступа и взаимодействия с контентом."
                  },
                  {
                    "title": "Удобный редактор заметок",
                    "description": "Пишите детально и вдохновенно — без компромиссов."
                  },
                  {
                    "title": "Тег-менеджмент",
                    "description": "Позволяет не просто сохранить, но переоткрыть или переосознать желаймый контент."
                  },
                  {
                    "title": "Палитра без границ",
                    "description": "Выбирайте оттенки или создавайте собственные — подчеркните индивидуальность."
                  },
                  {
                    "title": "Применяйте знания",
                    "description": "Интернет полон полезного контента. Доллой откладывать. Устанавливайте дедлайны и получайте напоминания."
                  },
                  {
                    "title": "Простая сортировка",
                    "description": "Мгновенная сортировка сегодня — безупречная система завтра."
                  },
                  {
                    "title": "Проектируйте своё использование",
                    "description": "Мы даём вам возможность создать своё пространство для хранения и дальнейшего взаимодействия с контентом."
                  }
                ]
            },
            "download": {
              "title": "Попробуйте Memoryan сегодня!",
              "ios": {
                "title": "Скачать для iOS",
                "description": "Нажмите для QR-кода или тапните ниже"
              },
              "android": {
                "title": "Скачать для Android",
                "description": "Нажмите для QR-кода или тапните ниже"
              }
            },
            "upcomingFeatures": {
                "title": "Будущие обновления",
                "description": "Мы будем улучшать Memoryan. Вот что ожидается в ближайшее время:",
                "sync": {
                    "title": "Синхронизация между устройствами",
                    "description": "Доступ к вашему контенту со всех ваших устройств."
                },
                "backup": {
                    "title": "Функция резервного копирования",
                    "description": "Обеспечьте сохранность ваших данных с автоматическим резервным копированием."
                },
                "moreBlocks": {
                    "title": "Больше типов блоков",
                    "description": "Поддержка документов (PDF, Word, Excel), а также медиа (фото, видео)."
                },
                "languages": {
                    "title": "Больше поддерживаемых языков",
                    "description": "Скоро появятся испанский, немецкий, французский и другие языки."
                },
                "friends": {
                    "title": "Экран Друзей",
                    "description": "Делитесь ценным контентом с важными для вас людьми без компромиссов."
                },
                "more": {
                    "title": "И многое другое",
                    "description": "Постоянные улучшения, полезные функции и исправления."
                }
            },
            "privacyPolicy": {
                "title": "Политика конфиденциальности",
                "lastUpdated": "Последнее обновление:",
                "introduction": {
                    "title": "1. Введение",
                    "content": "Добро пожаловать в Memoryan. Мы уважаем вашу конфиденциальность и стремимся защищать ваши персональные данные. Эта Политика конфиденциальности объясняет, как мы собираем, используем и защищаем вашу информацию при использовании нашего мобильного приложения."
                },
                "informationCollected": {
                    "title": "2. Информация, которую мы собираем",
                    "content": "Мы собираем следующие типы информации:",
                    "items": [
                        "Информация об учетной записи: Email-адрес и данные аутентификации при регистрации.",
                        "Пользовательский контент: Контент, который вы сохраняете в приложении, включая ссылки, заметки и другие медиа.",
                        "Данные об использовании: Информация о том, как вы используете приложение, доступ к функциям и время использования.",
                        "Информация об устройстве: Тип устройства, операционная система и уникальные идентификаторы устройства."
                    ]
                }
            },
            "termsOfService": {
                "title": "Условия использования",
                "lastUpdated": "Последнее обновление:",
                "acceptanceOfTerms": {
                    "title": "1. Принятие условий",
                    "content": "Получая доступ или используя мобильное приложение Memoryan, вы соглашаетесь соблюдать эти Условия использования и все применимые законы и правила."
                },
                "userAccounts": {
                    "title": "2. Учетные записи пользователей",
                    "content": "Вы должны создать учетную запись для использования определенных функций приложения. Вы несете ответственность за сохранение конфиденциальности информации вашей учетной записи и за все действия, которые происходят в рамках вашей учетной записи."
                }
            }
        }
    };
    
    // Try to detect user language on initialization
    const detectLanguage = () => {
        // First check if user has a stored preference
        const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLang && LANGUAGES[storedLang]) {
            return storedLang;
        }
        
        // Otherwise try to detect from browser
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0]; // Get language code without region
        
        // If the detected language is supported, use it
        return LANGUAGES[langCode] ? langCode : 'en';
    };
    
    // Set initial language
    const initLanguage = () => {
        currentLanguage = detectLanguage();
        
        // Apply translations to the page
        translatePage();
        
        // Setup language switcher
        setupLanguageSwitcher();
        
        console.log(`Language initialized: ${currentLanguage}`);
    };
    
    // Function to get current translations for the active language
    const getCurrentTranslations = () => {
        return TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    };
    
    // Function to translate text on the page
    const translatePage = () => {
        const translations = getCurrentTranslations();
        console.log(`Translating page to ${currentLanguage}`);
        
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`Found ${elements.length} elements with data-i18n attribute`);
        
        translateElements(elements, translations);
        
        // Find all elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const text = getTranslation(key, translations);
            
            if (text) {
                element.placeholder = text;
            }
        });
        
        // Find all elements with data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const text = getTranslation(key, translations);
            
            if (text) {
                element.title = text;
            }
        });
    };
    
    // Translate a specific set of elements
    const translateElements = (elements, translations = null) => {
        if (!translations) {
            translations = getCurrentTranslations();
        }
        
        console.log(`Translating ${elements.length} elements with language ${currentLanguage}`);
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = getTranslation(key, translations);
            
            if (text) {
                console.log(`Translating key: ${key} to: ${text.substring(0, 20)}...`);
                // If element has children that aren't text nodes, only update the text portions
                if (element.childElementCount > 0) {
                    // Find all text nodes and update them
                    for (let node of element.childNodes) {
                        if (node.nodeType === Node.TEXT_NODE) {
                            node.nodeValue = text;
                            break; // Update only the first text node
                        }
                    }
                } else {
                    // Otherwise just set text content
                    element.textContent = text;
                }
            } else {
                console.warn(`No translation found for key: ${key} in language: ${currentLanguage}`);
                // Log the full path to help debug
                console.warn(`  Key structure: ${key.split('.').join(' > ')}`);
            }
        });
    };
    
    // Helper to get nested translation value
    const getTranslation = (key, translations) => {
        if (!key || !translations) {
            console.warn(`⚠️ getTranslation called with invalid parameters: key=${key}, translations=${!!translations}`);
            return null;
        }
        
        // Handle nested keys like "common.footer.copyright"
        const keys = key.split('.');
        console.log(`🔑 Attempting to get translation for ${key} (${keys.length} parts)`);
        
        let value = translations;
        const pathParts = [];
        
        for (const k of keys) {
            pathParts.push(k);
            
            if (value && typeof value === 'object' && k in value) {
                console.log(`✓ Found path part: ${k} in ${pathParts.join('.')}`);
                value = value[k];
            } else {
                console.warn(`✗ Missing path part: ${k} in ${pathParts.join('.')}`);
                console.log(`🔍 Available keys at this level: ${value && typeof value === 'object' ? Object.keys(value).join(', ') : 'none'}`);
                return null;
            }
        }
        
        if (typeof value === 'string') {
            console.log(`✅ Translation found: "${value.substring(0, 30)}${value.length > 30 ? '...' : ''}" for key: ${key}`);
            return value;
        } else {
            console.warn(`❌ Value at ${key} is not a string but ${typeof value}:`, value);
            return null;
        }
    };
    
    // Function to change the language
    const changeLanguage = (lang) => {
        if (!LANGUAGES[lang] || lang === currentLanguage) return;
        
        console.log(`Changing language from ${currentLanguage} to ${lang}`);
        
        // Save preference
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        currentLanguage = lang;
        
        // Update the page with new translations
        translatePage();
        
        // Update language switcher active state
        updateLanguageSwitcherUI();
        
        // Update HTML lang attribute
        const htmlRoot = document.getElementById('html-root');
        if (htmlRoot) {
            htmlRoot.setAttribute('lang', lang);
            console.log(`Updated HTML lang attribute to: ${lang}`);
        }
        
        // Force re-translate carousel after a delay to handle any dynamic content
        setTimeout(() => {
            console.log("⚡ Forced carousel translation after language switch");
            // Force translate all elements with data-i18n attributes
            const elements = document.querySelectorAll('[data-i18n]');
            translateElements(elements);
            
            // Special handling for Swiper slides
            if (window.fixSwiperTranslations) {
                window.fixSwiperTranslations();
            }
        }, 100);
        
        // Repeat translations multiple times to catch any dynamic content
        [300, 600, 1000, 1500].forEach(delay => {
            setTimeout(() => {
                if (window.fixSwiperTranslations) {
                    window.fixSwiperTranslations();
                }
            }, delay);
        });
    };
    
    // Setup language switcher UI
    const setupLanguageSwitcher = () => {
        // Create language switcher if it doesn't exist
        if (!document.getElementById('language-switcher')) {
            const switcher = document.createElement('div');
            switcher.id = 'language-switcher';
            switcher.className = 'language-switcher';
            
            // Create language buttons
            for (const [code, name] of Object.entries(LANGUAGES)) {
                const btn = document.createElement('button');
                btn.setAttribute('data-lang', code);
                btn.textContent = name;
                btn.addEventListener('click', () => changeLanguage(code));
                switcher.appendChild(btn);
            }
            
            // Add directly to the body for fixed positioning
            document.body.appendChild(switcher);
            
            // Set initial active state
            updateLanguageSwitcherUI();
        }
    };
    
    // Update language switcher UI to show active language
    const updateLanguageSwitcherUI = () => {
        const buttons = document.querySelectorAll('#language-switcher button');
        
        buttons.forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            if (btnLang === currentLanguage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };
    
    // Expose public API
    window.i18n = {
        init: initLanguage,
        changeLanguage,
        getCurrentLanguage: () => currentLanguage,
        translateElements: (elements) => translateElements(elements),
        getTranslations: getCurrentTranslations,
        // Translation function
        t: function(key) {
            console.log(`📣 t() called with key: ${key}`);
            
            // Get the current translations
            const translations = getCurrentTranslations();
            
            // Special debug function for Swiper
            if (key === 'debug.translations') {
                console.log('📋 Current translations object:', translations);
                
                // Check all screenshot.items translations
                if (translations.screenshots && translations.screenshots.items) {
                    console.log(`📸 screenshots.items has ${translations.screenshots.items.length} items`);
                    translations.screenshots.items.forEach((item, idx) => {
                        console.log(`  Item ${idx}: title="${item.title}", description="${item.description?.substring(0, 30)}..."`);
                    });
                } else {
                    console.warn('⚠️ screenshots.items not found in current translations');
                }
                
                return null;
            }
            
            return getTranslation(key, translations);
        }
    };
    
    // Auto-initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguage);
    } else {
        initLanguage();
    }
})(); 