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
                "freePremium": "🎉 FREE PREMIUM Until the 20th of July! 🎉",
                "betaTesting": "Beta Testing starts 5th of July. Be among the first to experience the full power of Memoryan.",
                "trailerSoon": "Trailer is soon",
                "loadingTrailer": "Loading trailer...",
                "videoNotSupported": "Your browser does not support the video tag.",
                "videoError": "Unable to load video. Please try again later."
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
            "joinTests": {
                "title": "Join our Closed Tests on Google Play!",
                "subtitle": "Join our tests, provide us a feedback, and get some pleasant gifts afterwords",
                "benefits": {
                    "premium": "60 Days Premium subscription",
                    "credits": "your name will be Mentioned in credentials on Easter Egg Page"
                },
                "joinButton": "Join"
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
            },
            "cookiePolicy": {
                "title": "Cookie Policy",
                "lastUpdated": "Last Updated: June 2025",
                "backToSite": "Back to Memoryan",
                "whatAreCookies": {
                    "title": "What Are Cookies?",
                    "description": "Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and analyzing how our site is used. This policy explains what cookies we use, why we use them, and how you can manage your cookie preferences."
                },
                "essential": {
                    "title": "Essential Cookies",
                    "status": "Always Active",
                    "description": "These cookies are necessary for the website to function properly and cannot be disabled. They are usually set in response to actions you take, such as setting your privacy preferences or language selection.",
                    "cookiesAccepted": {
                        "name": "cookiesAccepted",
                        "description": "Remembers your cookie consent preferences to avoid showing the cookie banner repeatedly.",
                        "storage": "localStorage",
                        "duration": "Permanent",
                        "purpose": "Cookie Consent"
                    },
                    "language": {
                        "name": "memoryan_language",
                        "description": "Stores your preferred language setting for the website.",
                        "storage": "localStorage",
                        "duration": "Permanent",
                        "purpose": "Language Preference"
                    }
                },
                "analytics": {
                    "title": "Analytics Cookies",
                    "status": "Optional",
                    "description": "These cookies help us understand how visitors interact with our website by collecting and reporting anonymous information. This helps us improve our website and provide better content.",
                    "session": {
                        "name": "Website Analytics Session",
                        "description": "Tracks your session on our website to measure page views, time spent, and user interactions. Data is stored securely in Supabase.",
                        "storage": "Supabase Database",
                        "duration": "2 years",
                        "purpose": "Website Analytics"
                    },
                    "rateLimiter": {
                        "name": "rate_limiter_analytics",
                        "description": "Prevents excessive requests to our analytics system by limiting the number of events tracked per time period.",
                        "storage": "localStorage",
                        "duration": "1 hour",
                        "purpose": "Rate Limiting"
                    },
                    "dashboardState": {
                        "name": "memoryan_analytics_state",
                        "description": "Stores analytics dashboard preferences for authorized users (admin only).",
                        "storage": "localStorage",
                        "duration": "30 days",
                        "purpose": "Dashboard Preferences"
                    }
                },
                "thirdParty": {
                    "title": "Third-Party Services",
                    "status": "Optional",
                    "description": "We use third-party services to enhance our website's functionality. These services may set their own cookies.",
                    "googleFonts": {
                        "name": "Google Fonts",
                        "description": "Loads custom fonts from Google Fonts to improve the visual appearance of our website.",
                        "provider": "Google",
                        "purpose": "Font Loading"
                    },
                    "supabase": {
                        "name": "Supabase",
                        "description": "Provides authentication and database services for our website analytics.",
                        "provider": "Supabase",
                        "purpose": "Authentication & Database"
                    },
                    "cdn": {
                        "name": "CDN Resources",
                        "description": "External libraries (AOS, Swiper.js) loaded from CDNs to enhance website functionality.",
                        "provider": "Various CDNs",
                        "purpose": "Website Functionality"
                    }
                },
                "rights": {
                    "title": "Your Rights & Choices",
                    "description": "You have the right to:",
                    "items": [
                        "Accept or reject cookies: Use the controls on this page to manage your preferences.",
                        "Clear stored data: Delete all cookies and local storage data we've stored.",
                        "Browser settings: Configure your browser to block or delete cookies.",
                        "Opt-out: Disable analytics tracking at any time."
                    ],
                    "note": "Note: Disabling essential cookies may affect the functionality of our website."
                },
                "contact": {
                    "title": "Contact Us",
                    "description": "If you have any questions about this Cookie Policy or our privacy practices, please contact us:",
                    "generalContact": "General Contact"
                },
                "controls": {
                    "acceptAll": "Accept All Cookies",
                    "rejectAll": "Reject Optional Cookies",
                    "savePreferences": "Save Preferences",
                    "clearData": "Clear All Data"
                },
                "notifications": {
                    "preferencesSaved": "Cookie preferences saved successfully!",
                    "errorSaving": "Error saving preferences. Please try again.",
                    "dataCleared": "All data cleared successfully! The page will reload.",
                    "errorClearing": "Error clearing data. Please try again.",
                    "languageChanged": "Language changed to"
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
                "freePremium": "🎉 Бесплатный Премиум до 20 июля! 🎉",
                "betaTesting": "Бета-тестирование с 5 июля — станьте первыми героями Memoryan!",
                "trailerSoon": "Трейлер скоро",
                "loadingTrailer": "Загрузка трейлера...",
                "videoNotSupported": "Ваш браузер не поддерживает видео тег.",
                "videoError": "Не удалось загрузить видео. Попробуйте позже."
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
            "joinTests": {
                "title": "Присоединяйтесь к закрытому тестированию в Google Play!",
                "subtitle": "Участвуйте в тестах, делитесь отзывами и получайте приятные подарки",
                "benefits": {
                    "premium": "60 дней Премиум подписки",
                    "credits": "Ваше имя будет указано в титрах на странице Easter Egg"
                },
                "joinButton": "Присоединиться"
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
            },
            "cookiePolicy": {
                "title": "Политика Cookie",
                "lastUpdated": "Последнее обновление: Июнь 2025",
                "backToSite": "Вернуться к Memoryan",
                "whatAreCookies": {
                    "title": "Что такое Cookie?",
                    "description": "Cookie — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении нашего веб-сайта. Они помогают нам предоставлять вам лучший опыт просмотра, запоминая ваши предпочтения и анализируя, как используется наш сайт. Эта политика объясняет, какие cookie мы используем, зачем мы их используем и как вы можете управлять своими настройками cookie."
                },
                "essential": {
                    "title": "Обязательные Cookie",
                    "status": "Всегда активны",
                    "description": "Эти cookie необходимы для правильной работы веб-сайта и не могут быть отключены. Обычно они устанавливаются в ответ на ваши действия, такие как установка настроек конфиденциальности или выбор языка.",
                    "cookiesAccepted": {
                        "name": "cookiesAccepted",
                        "description": "Запоминает ваши предпочтения согласия на cookie, чтобы не показывать баннер cookie повторно.",
                        "storage": "localStorage",
                        "duration": "Постоянно",
                        "purpose": "Согласие на Cookie"
                    },
                    "language": {
                        "name": "memoryan_language",
                        "description": "Сохраняет ваши предпочтения языка для веб-сайта.",
                        "storage": "localStorage",
                        "duration": "Постоянно",
                        "purpose": "Языковые предпочтения"
                    }
                },
                "analytics": {
                    "title": "Аналитические Cookie",
                    "status": "Опциональные",
                    "description": "Эти cookie помогают нам понять, как посетители взаимодействуют с нашим веб-сайтом, собирая и сообщая анонимную информацию. Это помогает нам улучшать наш веб-сайт и предоставлять лучший контент.",
                    "session": {
                        "name": "Сессия веб-аналитики",
                        "description": "Отслеживает вашу сессию на нашем веб-сайте для измерения просмотров страниц, времени, проведенного на сайте, и взаимодействий пользователей. Данные хранятся безопасно в Supabase.",
                        "storage": "База данных Supabase",
                        "duration": "2 года",
                        "purpose": "Веб-аналитика"
                    },
                    "rateLimiter": {
                        "name": "rate_limiter_analytics",
                        "description": "Предотвращает чрезмерные запросы к нашей системе аналитики, ограничивая количество отслеживаемых событий за период времени.",
                        "storage": "localStorage",
                        "duration": "1 час",
                        "purpose": "Ограничение скорости"
                    },
                    "dashboardState": {
                        "name": "memoryan_analytics_state",
                        "description": "Сохраняет предпочтения панели аналитики для авторизованных пользователей (только администратор).",
                        "storage": "localStorage",
                        "duration": "30 дней",
                        "purpose": "Настройки панели"
                    }
                },
                "thirdParty": {
                    "title": "Сторонние сервисы",
                    "status": "Опциональные",
                    "description": "Мы используем сторонние сервисы для улучшения функциональности нашего веб-сайта. Эти сервисы могут устанавливать свои собственные cookie.",
                    "googleFonts": {
                        "name": "Google Fonts",
                        "description": "Загружает пользовательские шрифты из Google Fonts для улучшения внешнего вида нашего веб-сайта.",
                        "provider": "Google",
                        "purpose": "Загрузка шрифтов"
                    },
                    "supabase": {
                        "name": "Supabase",
                        "description": "Предоставляет услуги аутентификации и базы данных для аналитики нашего веб-сайта.",
                        "provider": "Supabase",
                        "purpose": "Аутентификация и база данных"
                    },
                    "cdn": {
                        "name": "CDN ресурсы",
                        "description": "Внешние библиотеки (AOS, Swiper.js), загружаемые из CDN для улучшения функциональности веб-сайта.",
                        "provider": "Различные CDN",
                        "purpose": "Функциональность веб-сайта"
                    }
                },
                "rights": {
                    "title": "Ваши права и выбор",
                    "description": "Вы имеете право:",
                    "items": [
                        "Принимать или отклонять cookie: Используйте элементы управления на этой странице для управления своими предпочтениями.",
                        "Очищать сохраненные данные: Удалять все cookie и данные локального хранилища, которые мы сохранили.",
                        "Настройки браузера: Настроить браузер для блокировки или удаления cookie.",
                        "Отказ: Отключить отслеживание аналитики в любое время."
                    ],
                    "note": "Примечание: Отключение обязательных cookie может повлиять на функциональность нашего веб-сайта."
                },
                "contact": {
                    "title": "Свяжитесь с нами",
                    "description": "Если у вас есть вопросы об этой Политике Cookie или наших практиках конфиденциальности, пожалуйста, свяжитесь с нами:",
                    "generalContact": "Общий контакт"
                },
                "controls": {
                    "acceptAll": "Принять все Cookie",
                    "rejectAll": "Отклонить дополнительные Cookie",
                    "savePreferences": "Сохранить предпочтения",
                    "clearData": "Очистить все данные"
                },
                "notifications": {
                    "preferencesSaved": "Настройки cookie успешно сохранены!",
                    "errorSaving": "Ошибка сохранения настроек. Попробуйте еще раз.",
                    "dataCleared": "Все данные успешно очищены! Страница будет перезагружена.",
                    "errorClearing": "Ошибка очистки данных. Попробуйте еще раз.",
                    "languageChanged": "Язык изменен на"
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
        
        // Dispatch language change event for video player
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));
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
