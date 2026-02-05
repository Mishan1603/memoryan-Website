// Lightweight client-side i18n for Memoryan auth pages
// - Looks for elements with data-i18n and data-i18n-placeholder
// - Updates document <html lang> attribute
// - Exposes window.i18n.init({ selector, placeholderSelector, defaultLanguage }) and window.i18n.changeLanguage(lang)
 
(function() {
  const STORAGE_KEY = 'memoryan_lang';

  function getPreferredLanguage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && dictionaries[stored]) return stored;
      const browser = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (browser.startsWith('ru')) return 'ru';
      if (browser.startsWith('uk')) return 'uk';
      if (browser.startsWith('de')) return 'de';
      return 'en';
    } catch (_) {
      return 'en';
    }
  }

  const dictionaries = {
    en: {
      authPortal: {
        title: 'Memoryan Authentication',
        description: 'Choose an action below.',
        emailVerification: 'Email Verification',
        emailVerificationDesc: 'Verify your email address to access all Memoryan features and secure your account.',
        verifyEmail: 'Verify Email',
        passwordReset: 'Password Reset',
        passwordResetDesc: 'Forgot your password? Reset it securely to regain access to your account.',
        resetPassword: 'Reset Password',
        returnToApp: 'Return to Memoryan App',
        secureAuth: 'Secure Authentication',
        securityInfo: 'All authentication processes use secure, encrypted connections and time-limited verification codes. Your security is our priority.'
      },
      errors: {
        unexpected: 'An unexpected error occurred. Please try again.',
        emailNotFound: "This email isn't linked to any existing account. Please check and try again.",
        alreadyVerified: 'Your email is already verified. You can sign in to your account.',
        tooManyAttempts: 'Too many attempts. Please try again after 24 hours.',
        invalidCode: 'Invalid verification code.',
        initiationRequired: 'Please initiate password reset from the mobile app first.'
      },
      common: {
        features: 'Features',
        screenshots: 'Screenshots',
        download: 'Download',
        appStore: 'App Store',
        googlePlay: 'Google Play',
        contact: 'Contact:',
        copied: 'Copied!',
        emailAddress: 'Email Address',
        enterEmailPlaceholder: 'Enter your email address',
        processing: 'Processing request...',
        returnToHome: 'Return to Home',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        backToWebsite: 'Back to Website',
        footer: {
          copyright: '© 2026 Memoryan. All rights reserved.',
          privacyPolicy: 'Privacy Policy',
          termsOfService: 'Terms of Service'
        }
      },
      hero: {
        title: 'This is Memoryan',
        subtitle: 'An app that redefines how people save and apply valuable content from anywhere.',
        description: "It's not just about saving links and notes — it's about effortlessly organizing and rediscovering them like never before.",
        specialOffer: 'Special Launch Offer!',
        freePremium: '🎉 FREE PREMIUM Until the 1st of March! 🎉',
        betaTesting: 'Beta Testing starts 20th February. Be among the first to experience the full power of Memoryan.',
        loadingTrailer: 'Loading trailer...',
        videoNotSupported: 'Your browser does not support the video tag.',
        videoError: 'Unable to load video. Please try again later.'
      },
      features: {
        title: 'Key Features of Memoryan',
        chambersCreation: { title: 'Collections Creation', description: 'Organize your content into visually stunning customizable Collections.' },
        aiTitleGeneration: { title: 'AI Title Generation', description: 'Creation of Titles for saved content has never been easier.' },
        smartTagSystem: { title: 'Smart Tag System', description: 'Categorize with our unique "Save-Enjoy-Apply" tagging approach for better recall.' },
        contentBlocks: { title: 'Beautiful content blocks', description: 'A place where your saved content embraces a unified form for your links, notes.' },
        backupSystem: { title: 'Backup System', description: 'Keep your valuable content safe with automated backups.' },
        sharingPlatform: { title: 'New Sharing Platform', description: 'Share your link with whole Platform.' }
      },
      screenshots: {
        title: 'Experience Memoryan',
        keyboardHint: 'Use keyboard arrows (←→) to navigate',
        items: {
          0: { title: 'MemoryHub', description: 'Your personalized home for all control over your collections.' },
          1: { title: 'Collections design', description: 'Gradients, Titles and Emojis for full reflection of what you want to save there.' },
          2: { title: 'Save Content Effortlessly', description: 'Quickly save links, notes and more with our intuitive interface.' },
          3: { title: 'Blocks page', description: 'Visually appealing displays for your links, notes, and other saved content.' },
          4: { title: 'Rich Note Editor', description: 'Write detailed and passionate notes without compromises.' },
          5: { title: 'Powerful Tagging System', description: 'Organize content with our unique Save-Enjoy-Apply approach.' },
          6: { title: 'Rich Color Palette', description: 'Choose from beautiful gradient options for your collections.' },
          7: { title: 'Deadline Management', description: 'The world is full of useful content. Enough pushing away. Set deadlines and get to it right away.' },
          8: { title: 'Convenient Sorting', description: 'Organize your content in your collections today, and thank yourself tomorrow.' },
          9: { title: 'Advanced Options', description: 'Full control over your content with our intuitive options menu.' }
        }
      },
      upcomingFeatures: {
        title: 'Upcoming Features',
        description: "We're constantly improving Memoryan. Here's what's coming next:",
        sync: { title: 'Synchronization across devices', description: 'Access your content seamlessly from all your devices.' },
        moreBlocks: { title: 'More types of blocks', description: 'Support for Documents (PDF, Word, Excel) and Media (Photo, Video).' },
        languages: { title: 'More supported languages', description: 'Spanish, Chinese, French and more coming soon.' },
        more: { title: 'And much more', description: 'Continuous enhancements, useful features, and fixes.' }
      },
      joinTests: {
        title: 'Join our Closed Tests on Google Play!',
        subtitle: 'Join our tests, provide us a feedback, and get some pleasant gifts afterwords',
        benefits: { premium: '60 Days Premium subscription', credits: 'your name will be Mentioned in credentials on Easter Egg Page' },
        joinButton: 'Join'
      },
      download: {
        title: 'Get Memoryan Now!',
        ios: { title: 'Download for iOS', description: 'Tap to see QR code or click below' },
        android: { title: 'Download for Android', description: 'Tap to see QR code or click below' }
      },
      privacyPolicy: {
        title: 'Privacy Policy',
        lastUpdated: 'Last Updated:',
        introduction: { title: '1. Introduction', content: 'Welcome to Memoryan. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.' },
        informationCollected: { title: '2. Information We Collect', content: 'We collect the following types of information:', items: ['Account Information: Email address and authentication information when you register.', 'User Content: The content you save within the app, including links, notes, and other media.', 'Usage Data: Information about how you use the app, features accessed, and time spent.', 'Device Information: Device type, operating system, and unique device identifiers.'] }
      },
      termsOfService: {
        title: 'Terms of Service',
        lastUpdated: 'Last Updated:',
        acceptanceOfTerms: { title: '1. Acceptance of Terms', content: 'By accessing or using the Memoryan mobile application, you agree to be bound by these Terms of Service and all applicable laws and regulations.' },
        userAccounts: { title: '2. User Accounts', content: 'You must create an account to use certain features of the app. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.' }
      },
      emailVerification: {
        title: 'Verify Your Email',
        description: 'Enter your email to receive a 6-digit code to verify your account.',
        receiveOTP: 'Receive Verification Code',
        sending: 'Sending verification code...',
        codeSent: 'Verification code sent successfully!',
        enterCodeTitle: 'Enter Verification Code',
        codeSentTo: 'We sent a 6-digit code to',
        enterBelow: 'Please enter it below.',
        sixDigitCode: '6-Digit Code',
        enterOTP: '✲✲✲✲✲✲',
        verifyCode: 'Verify Code',
        resendCode: 'Resend Code',
        verified: 'Email Verified!',
        successMessage: 'Your email has been verified successfully. You can now access all Memoryan features.',
        secureVerification: 'Secure Email Verification',
        securityInfo: 'Verification codes are time-limited and single-use for maximum security. Verifying your email helps protect your account and enables all Memoryan features.'
      },
      passwordReset: {
        title: 'Reset Your Password',
        emailIntro: 'Enter your account email to start the password reset process.',
        continueButton: 'Continue',
        requestCode: 'Get Your Reset Code',
        codeWillBeSent: 'We will send a 6-digit code to:',
        receiveOTP: 'Receive Reset Code',
        enterCodeTitle: 'Enter Reset Code',
        codeSentTo: 'We sent a 6-digit code to',
        enterBelow: 'Please enter it below.',
        sixDigitCode: '6-Digit Code',
        enterOTP: '✲✲✲✲✲✲',
        verifyCode: 'Verify Code',
        resendCode: 'Resend Code',
        setNewPassword: 'Set New Password',
        passwordDescription: 'Create a strong password with at least 8 characters.',
        newPassword: 'New Password',
        enterNewPassword: 'Enter your new password',
        confirmPassword: 'Confirm Password',
        confirmNewPassword: 'Confirm your new password',
        updatePassword: 'Update Password',
        success: 'Password Updated!',
        successMessage: 'Your password has been changed successfully. You can now sign in with your new password.',
        secureReset: 'Secure Password Reset',
        securityInfo: 'Password reset codes are time-limited and single-use for maximum security. Your new password is encrypted before being stored.'
      }
    },
    ru: {
      authPortal: {
        title: 'Аутентификация Memoryan',
        description: 'Выберите действие ниже.',
        emailVerification: 'Подтверждение email',
        emailVerificationDesc: 'Подтвердите адрес электронной почты для доступа ко всем функциям и защиты аккаунта.',
        verifyEmail: 'Подтвердить email',
        passwordReset: 'Сброс пароля',
        passwordResetDesc: 'Забыли пароль? Сбросьте его безопасно, чтобы восстановить доступ.',
        resetPassword: 'Сбросить пароль',
        returnToApp: 'Вернуться в приложение Memoryan',
        secureAuth: 'Безопасная аутентификация',
        securityInfo: 'Все процессы используют защищённое соединение и одноразовые коды. Ваша безопасность — наш приоритет.'
      },
      errors: {
        unexpected: 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте ещё раз.',
        emailNotFound: 'Этот адрес не связан с существующим аккаунтом. Проверьте и попробуйте снова.',
        alreadyVerified: 'Ваш email уже подтверждён. Вы можете войти в аккаунт.',
        tooManyAttempts: 'Слишком много попыток. Попробуйте снова через 24 часа.',
        invalidCode: 'Неверный код подтверждения.',
        initiationRequired: 'Пожалуйста, сначала инициируйте сброс пароля в мобильном приложении.'
      },
      common: {
        features: 'Возможности',
        screenshots: 'Скриншоты',
        download: 'Скачать',
        appStore: 'App Store',
        googlePlay: 'Google Play',
        contact: 'Контакты:',
        copied: 'Скопировано!',
        emailAddress: 'Адрес электронной почты',
        enterEmailPlaceholder: 'Введите адрес электронной почты',
        processing: 'Обработка запроса...',
        returnToHome: 'Вернуться на главную',
        privacyPolicy: 'Политика конфиденциальности',
        termsOfService: 'Условия использования',
        backToWebsite: 'Назад на сайт',
        footer: {
          copyright: '© 2026 Memoryan. Все права защищены.',
          privacyPolicy: 'Политика конфиденциальности',
          termsOfService: 'Условия использования'
        }
      },
      hero: {
        title: 'Это Memoryan',
        subtitle: 'Революция в том, как вы сохраняете и применяете потоки информации!',
        description: 'Это не просто сохранение ссылок и заметок — это искусство ценить, систематизировать и открывать что то новое.',
        specialOffer: 'Стартовое предложение!',
        freePremium: '🎉 Бесплатный Премиум до 1 марта! 🎉',
        betaTesting: 'Бета-тестирование с 20 февраля — станьте первыми героями Memoryan!',
        loadingTrailer: 'Загрузка трейлера...',
        videoNotSupported: 'Ваш браузер не поддерживает воспроизведение видео.',
        videoError: 'Не удалось загрузить видео. Попробуйте позже.'
      },
      features: {
        title: 'Ключевые возможности Memoryan',
        chambersCreation: { title: 'Создание коллекций', description: 'Группируйте контент в стильные настраиваемые коллекции для быстрой навигации.' },
        aiTitleGeneration: { title: 'ИИ-заголовки в один клик', description: 'Создание названий сохранённого контента ещё никогда не было таким простым и удобным.' },
        smartTagSystem: { title: 'Удобная система тегов', description: 'Продуманная система тегов обеспечит вам максимальную эффективность в применении и организации контента.' },
        contentBlocks: { title: 'Красивые блоки контента', description: 'Место где ваши ссылки и заметки обретают чёткое и лаконичное оформление в едином стиле.' },
        backupSystem: { title: 'Система резервного копирования', description: 'Сохраняйте ценный контент с помощью автоматических резервных копий.' },
        sharingPlatform: { title: 'Новая платформа обмена', description: 'Делитесь ссылками со всей платформой.' }
      },
      screenshots: {
        title: 'Взгляд изнутри Memoryan',
        keyboardHint: 'Используйте стрелки ← → для перелистывания',
        items: {
          0: { title: 'Главная страница', description: 'Ваш персональный центр управления всеми коллекциями.' },
          1: { title: 'Дизайн коллекций', description: 'Градиенты, Заголовки и Емодзи всё для полного отражения того что вам желается хранить.' },
          2: { title: 'Мгновенные сохранения', description: 'Сохраняйте любые ссылки, буквально в пару кликов.' },
          3: { title: 'Визуально упорядоченные блоки', description: 'Визуально упорядоченные блоки для мгновенного доступа и взаимодействия с контентом.' },
          4: { title: 'Удобный редактор заметок', description: 'Пишите детально и вдохновенно — без компромиссов.' },
          5: { title: 'Тег-менеджмент', description: 'Позволяет не просто сохранить, но переоткрыть или переосознать желаемый контент.' },
          6: { title: 'Палитра без границ', description: 'Выбирайте оттенки или создавайте собственные — подчеркните индивидуальность.' },
          7: { title: 'Применяйте знания', description: 'Интернет полон полезного контента. Долой откладывать. Устанавливайте дедлайны и получайте напоминания.' },
          8: { title: 'Простая сортировка', description: 'Мгновенная сортировка сегодня — безупречная система завтра.' },
          9: { title: 'Расширенные настройки', description: 'Полный контроль над повторением контента через интуитивное меню опций.' }
        }
      },
      upcomingFeatures: {
        title: 'Скоро',
        description: 'Мы постоянно развиваем Memoryan. Вот что в планах:',
        sync: { title: 'Синхронизация на всех устройствах', description: 'Доступ к контенту с любого устройства.' },
        moreBlocks: { title: 'Новые типы блоков', description: 'Документы (PDF, Word, Excel), медиа (фото, видео).' },
        languages: { title: 'Больше языков', description: 'Испанский, китайский, французский и другие.' },
        more: { title: 'И многое другое', description: 'Улучшения, новые функции и доработки.' }
      },
      joinTests: {
        title: 'Присоединяйтесь к закрытому тесту в Google Play!',
        subtitle: 'Участвуйте в тестах, дайте обратную связь и получите приятные подарки',
        benefits: { premium: '60 дней премиум-подписки', credits: 'ваше имя в титрах на странице Easter Egg' },
        joinButton: 'Участвовать'
      },
      download: {
        title: 'Попробуйте Memoryan сегодня!',
        ios: { title: 'Скачать для iOS', description: 'Нажмите для QR-кода или тапните ниже' },
        android: { title: 'Скачать для Android', description: 'Нажмите для QR-кода или тапните ниже' }
      },
      privacyPolicy: {
        title: 'Политика конфиденциальности',
        lastUpdated: 'Последнее обновление:',
        introduction: { title: '1. Введение', content: 'Добро пожаловать в Memoryan. Мы уважаем вашу конфиденциальность и стремимся защищать ваши персональные данные. Эта Политика конфиденциальности объясняет, как мы собираем, используем и защищаем вашу информацию при использовании нашего мобильного приложения.' },
        informationCollected: { title: '2. Информация, которую мы собираем', content: 'Мы собираем следующие типы информации:', items: ['Информация об учетной записи: Email-адрес и данные аутентификации при регистрации.', 'Пользовательский контент: Контент, который вы сохраняете в приложении, включая ссылки, заметки и другие медиа.', 'Данные об использовании: Информация о том, как вы используете приложение, доступ к функциям и время использования.', 'Информация об устройстве: Тип устройства, операционная система и уникальные идентификаторы устройства.'] }
      },
      termsOfService: {
        title: 'Условия использования',
        lastUpdated: 'Последнее обновление:',
        acceptanceOfTerms: { title: '1. Принятие условий', content: 'Получая доступ или используя мобильное приложение Memoryan, вы соглашаетесь соблюдать эти Условия использования и все применимые законы и правила.' },
        userAccounts: { title: '2. Учетные записи пользователей', content: 'Вы должны создать учетную запись для использования определенных функций приложения. Вы несете ответственность за сохранение конфиденциальности информации вашей учетной записи и за все действия, которые происходят в рамках вашей учетной записи.' }
      },
      emailVerification: {
        title: 'Подтвердите свой Email',
        description: 'Введите адрес электронной почты, чтобы получить 6‑значный код для подтверждения аккаунта.',
        receiveOTP: 'Получить код подтверждения',
        sending: 'Отправляем код подтверждения...',
        codeSent: 'Код подтверждения успешно отправлен!',
        enterCodeTitle: 'Введите код подтверждения',
        codeSentTo: 'Мы отправили 6‑значный код на',
        enterBelow: 'Пожалуйста, введите его ниже.',
        sixDigitCode: '6-ти значный Код',
        enterOTP: '—  —  —  —  —  —',
        verifyCode: 'Подтвердить код',
        resendCode: 'Отправить код повторно',
        verified: 'Email подтверждён!',
        successMessage: 'Ваш email успешно подтверждён. Теперь доступны все функции Memoryan.',
        secureVerification: 'Безопасное подтверждение email',
        securityInfo: 'Коды подтверждения имеют ограниченное время действия и одноразовые. Подтверждение email защищает аккаунт и включает все функции.'
      },
      passwordReset: {
        title: 'Сброс пароля',
        emailIntro: 'Введите адрес электронной почты для начала процесса сброса пароля.',
        continueButton: 'Продолжить',
        requestCode: 'Получить код сброса',
        codeWillBeSent: 'Мы отправим 6‑значный код на:',
        receiveOTP: 'Отправить код сброса',
        enterCodeTitle: 'Введите код сброса',
        codeSentTo: 'Мы отправили 6‑значный код на',
        enterBelow: 'Пожалуйста, введите его ниже.',
        sixDigitCode: '6-ти значный Код',
        enterOTP: '—  —  —  —  —  —',
        verifyCode: 'Подтвердить код',
        resendCode: 'Отправить код повторно',
        setNewPassword: 'Установить новый пароль',
        passwordDescription: 'Создайте надёжный пароль не менее 8 символов.',
        newPassword: 'Новый пароль',
        enterNewPassword: 'Введите новый пароль',
        confirmPassword: 'Подтвердите пароль',
        confirmNewPassword: 'Подтвердите новый пароль',
        updatePassword: 'Обновить пароль',
        success: 'Пароль обновлён!',
        successMessage: 'Пароль успешно изменён. Теперь вы можете войти с новым паролем.',
        secureReset: 'Безопасный сброс пароля',
        securityInfo: 'Коды для сброса пароля одноразовые и действуют ограниченное время. Ваш новый пароль шифруется перед сохранением.'
      }
    },
    uk: {
      authPortal: {
        title: 'Аутентифікація Memoryan',
        description: 'Оберіть дію нижче.',
        emailVerification: 'Підтвердження email',
        emailVerificationDesc: 'Підтвердьте електронну адресу для доступу до всіх функцій та захисту облікового запису.',
        verifyEmail: 'Підтвердити email',
        passwordReset: 'Скидання паролю',
        passwordResetDesc: 'Забули пароль? Скиньте його безпечно, щоб відновити доступ.',
        resetPassword: 'Скинути пароль',
        returnToApp: 'Повернутися до додатку Memoryan',
        secureAuth: 'Безпечна аутентифікація',
        securityInfo: 'Усі процеси використовують захищене з’єднання та одноразові коди. Ваша безпека — наш пріоритет.'
      },
      errors: {
        unexpected: 'Сталася неочікувана помилка. Спробуйте ще раз.',
        emailNotFound: 'Ця адреса не пов’язана з існуючим обліковим записом. Перевірте та спробуйте ще раз.',
        alreadyVerified: 'Вашу ел. пошту вже підтверджено. Ви можете увійти в обліковий запис.',
        tooManyAttempts: 'Забагато спроб. Спробуйте знову через 24 години.',
        invalidCode: 'Невірний код підтвердження.',
        initiationRequired: 'Будь ласка, спочатку ініціюйте скидання паролю в мобільному додатку.'
      },
      common: {
        features: 'Можливості',
        screenshots: 'Скриншоти',
        download: 'Завантажити',
        appStore: 'App Store',
        googlePlay: 'Google Play',
        contact: 'Контакт:',
        copied: 'Скопійовано!',
        emailAddress: 'Електронна адреса',
        enterEmailPlaceholder: 'Введіть електронну адресу',
        processing: 'Обробка запиту...',
        returnToHome: 'Повернутися на головну',
        privacyPolicy: 'Політика конфіденційності',
        termsOfService: 'Умови використання',
        backToWebsite: 'Назад до сайту',
        footer: { copyright: '© 2026 Memoryan. Усі права захищено.', privacyPolicy: 'Політика конфіденційності', termsOfService: 'Умови використання' }
      },
      hero: {
        title: 'Це Memoryan',
        subtitle: 'Революція в тому, як ви зберігаєте та застосовуєте потоки інформації!',
        description: 'Це не просто збереження посилань і нотаток — це мистецтво цінувати, систематизувати та відкривати щось нове.',
        specialOffer: 'Стартова пропозиція!',
        freePremium: '🎉 Безкоштовний Преміум до 1 березня! 🎉',
        betaTesting: 'Бета-тестування з 20 лютого — будьте серед перших героїв Memoryan!',
        loadingTrailer: 'Завантаження трейлера...',
        videoNotSupported: 'Ваш браузер не підтримує відтворення відео.',
        videoError: 'Не вдалося завантажити відео. Спробуйте пізніше.'
      },
      features: {
        title: 'Ключові можливості Memoryan',
        chambersCreation: { title: 'Створення колекцій', description: 'Групуйте контент у стильні налаштовувані колекції для швидкої навігації.' },
        aiTitleGeneration: { title: 'ІІ-заголовки в один клік', description: 'Створення назв збереженого контенту ще ніколи не було таким простим.' },
        smartTagSystem: { title: 'Зручна система тегів', description: 'Подумана система тегів для максимальної ефективності в застосуванні та організації контенту.' },
        contentBlocks: { title: 'Красиві блоки контенту', description: 'Місце, де ваші посилання та нотатки мають чітке оформлення в єдиному стилі.' },
        backupSystem: { title: 'Система резервного копіювання', description: 'Зберігайте цінний контент за допомогою автоматичних резервних копій.' },
        sharingPlatform: { title: 'Нова платформа обміну', description: 'Діліться посиланнями з усією платформою.' }
      },
      screenshots: {
        title: 'Погляд зсередини Memoryan',
        keyboardHint: 'Використовуйте стрілки ← → для перегортання',
        items: {
          0: { title: 'Головна сторінка', description: 'Ваш персональний центр керування всіма колекціями.' },
          1: { title: 'Дизайн колекцій', description: 'Градієнти, заголовки та емодзі для повного відображення того, що ви хочете зберігати.' },
          2: { title: 'Миттєві збереження', description: 'Зберігайте будь-які посилання в кілька кліків.' },
          3: { title: 'Візуально впорядковані блоки', description: 'Візуально впорядковані блоки для миттєвого доступу до контенту.' },
          4: { title: 'Зручний редактор нотаток', description: 'Пишіть детально та натхненно — без компромісів.' },
          5: { title: 'Тег-менеджмент', description: 'Дозволяє не лише зберегти, а й перевідкрити контент.' },
          6: { title: 'Палітра без меж', description: 'Обирайте відтінки або створюйте власні.' },
          7: { title: 'Застосовуйте знання', description: 'Інтернет повний корисного контенту. Встановлюйте дедлайни та отримуйте нагадування.' },
          8: { title: 'Просте сортування', description: 'Миттєве сортування сьогодні — бездоганна система завтра.' },
          9: { title: 'Розширені налаштування', description: 'Повний контроль через інтуїтивне меню опцій.' }
        }
      },
      upcomingFeatures: {
        title: 'Скоро',
        description: 'Ми постійно розвиваємо Memoryan. Ось що в планах:',
        sync: { title: 'Синхронізація на всіх пристроях', description: 'Доступ до контенту з будь-якого пристрою.' },
        moreBlocks: { title: 'Нові типи блоків', description: 'Документи (PDF, Word, Excel), медіа (фото, відео).' },
        languages: { title: 'Більше мов', description: 'Іспанська, китайська, французька та інші.' },
        more: { title: 'І багато іншого', description: 'Покращення, нові функції та доопрацювання.' }
      },
      joinTests: {
        title: 'Приєднуйтесь до закритого тесту в Google Play!',
        subtitle: 'Беріть участь у тестах, дайте зворотний зв’язок та отримайте приємні подарунки',
        benefits: { premium: '60 днів преміум-підписки', credits: 'ваше ім’я в титрах на сторінці Easter Egg' },
        joinButton: 'Приєднатися'
      },
      download: {
        title: 'Спробуйте Memoryan сьогодні!',
        ios: { title: 'Завантажити для iOS', description: 'Натисніть для QR-коду або тапніть нижче' },
        android: { title: 'Завантажити для Android', description: 'Натисніть для QR-коду або тапніть нижче' }
      },
      emailVerification: {
        title: 'Підтвердьте свій Email',
        description: 'Введіть електронну адресу, щоб отримати 6‑значний код для підтвердження акаунта.',
        receiveOTP: 'Отримати код підтвердження',
        sending: 'Надсилаємо код підтвердження...',
        codeSent: 'Код підтвердження успішно надіслано!',
        enterCodeTitle: 'Введіть код підтвердження',
        codeSentTo: 'Ми надіслали 6‑значний код на',
        enterBelow: 'Будь ласка, введіть його нижче.',
        sixDigitCode: '6-ти значный Код',
        enterOTP: '—  —  —  —  —  —',
        verifyCode: 'Підтвердити код',
        resendCode: 'Надіслати код ще раз',
        verified: 'Email підтверджено!',
        successMessage: 'Ваш email успішно підтверджено. Тепер доступні всі функції Memoryan.',
        secureVerification: 'Безпечне підтвердження email',
        securityInfo: 'Коди підтвердження одноразові та діють обмежений час. Підтвердження email захищає акаунт і відкриває всі функції.'
      },
      passwordReset: {
        title: 'Скидання паролю',
        emailIntro: 'Введіть електронну адресу, щоб розпочати скидання паролю.',
        continueButton: 'Продовжити',
        requestCode: 'Отримати код скидання',
        codeWillBeSent: 'Ми надішлемо 6‑значний код на:',
        receiveOTP: 'Надіслати код скидання',
        enterCodeTitle: 'Введіть код скидання',
        codeSentTo: 'Ми надіслали 6‑значний код на',
        enterBelow: 'Будь ласка, введіть його нижче.',
        sixDigitCode: '6-ти значный Код',
        enterOTP: '—  —  —  —  —  —',
        verifyCode: 'Підтвердити код',
        resendCode: 'Надіслати повторно',
        setNewPassword: 'Встановити новий пароль',
        passwordDescription: 'Створіть надійний пароль щонайменше з 8 символів.',
        newPassword: 'Новий пароль',
        enterNewPassword: 'Введіть новий пароль',
        confirmPassword: 'Підтвердіть пароль',
        confirmNewPassword: 'Підтвердіть новий пароль',
        updatePassword: 'Оновити пароль',
        success: 'Пароль оновлено!',
        successMessage: 'Пароль успішно змінено. Тепер ви можете увійти з новим паролем.',
        secureReset: 'Безпечне скидання паролю',
        securityInfo: 'Коди для скидання паролю одноразові й діють обмежений час. Ваш новий пароль шифрується перед збереженням.'
      }
    },
    de: {
      authPortal: {
        title: 'Memoryan Authentifizierung',
        description: 'Wählen Sie eine Aktion unten.',
        emailVerification: 'E-Mail-Verifizierung',
        emailVerificationDesc: 'Verifizieren Sie Ihre E-Mail-Adresse für vollen Zugang und sicheren Account.',
        verifyEmail: 'E-Mail verifizieren',
        passwordReset: 'Passwort zurücksetzen',
        passwordResetDesc: 'Passwort vergessen? Setzen Sie es sicher zurück.',
        resetPassword: 'Passwort zurücksetzen',
        returnToApp: 'Zurück zur Memoryan App',
        secureAuth: 'Sichere Authentifizierung',
        securityInfo: 'Alle Prozesse nutzen verschlüsselte Verbindungen und zeitbegrenzte Codes. Ihre Sicherheit hat Priorität.'
      },
      errors: {
        unexpected: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
        emailNotFound: 'Diese E-Mail ist keinem bestehenden Konto zugeordnet. Bitte überprüfen Sie die Eingabe.',
        alreadyVerified: 'Ihre E-Mail ist bereits verifiziert. Sie können sich anmelden.',
        tooManyAttempts: 'Zu viele Versuche. Bitte versuchen Sie es in 24 Stunden erneut.',
        invalidCode: 'Ungültiger Bestätigungscode.',
        initiationRequired: 'Bitte initialisieren Sie die Passwortzurücksetzung zuerst in der mobilen App.'
      },
      common: {
        features: 'Funktionen',
        screenshots: 'Screenshots',
        download: 'Download',
        appStore: 'App Store',
        googlePlay: 'Google Play',
        contact: 'Kontakt:',
        copied: 'Kopiert!',
        emailAddress: 'E-Mail-Adresse',
        enterEmailPlaceholder: 'Geben Sie Ihre E-Mail-Adresse ein',
        processing: 'Vorgang wird verarbeitet...',
        returnToHome: 'Zur Startseite',
        privacyPolicy: 'Datenschutzerklärung',
        termsOfService: 'Nutzungsbedingungen',
        backToWebsite: 'Zur Webseite',
        footer: { copyright: '© 2026 Memoryan. Alle Rechte vorbehalten.', privacyPolicy: 'Datenschutzerklärung', termsOfService: 'Nutzungsbedingungen' }
      },
      hero: {
        title: 'Das ist Memoryan',
        subtitle: 'Eine App, die neu definiert, wie Menschen wertvolle Inhalte von überall speichern und anwenden.',
        description: 'Es geht nicht nur ums Speichern von Links und Notizen — sondern um müheloses Organisieren und Wiederentdecken wie nie zuvor.',
        specialOffer: 'Spezielles Startangebot!',
        freePremium: '🎉 KOSTENLOSES PREMIUM bis zum 1. März! 🎉',
        betaTesting: 'Beta-Testing startet am 20. Februar. Seien Sie unter den Ersten, die die volle Kraft von Memoryan erleben.',
        loadingTrailer: 'Trailer wird geladen...',
        videoNotSupported: 'Ihr Browser unterstützt keine Videowiedergabe.',
        videoError: 'Video konnte nicht geladen werden. Bitte später erneut versuchen.'
      },
      features: {
        title: 'Hauptfunktionen von Memoryan',
        chambersCreation: { title: 'Sammlungen erstellen', description: 'Organisieren Sie Ihre Inhalte in visuell ansprechende, anpassbare Sammlungen.' },
        aiTitleGeneration: { title: 'KI-Titelgenerierung', description: 'Die Erstellung von Titeln für gespeicherte Inhalte war noch nie so einfach.' },
        smartTagSystem: { title: 'Smart-Tag-System', description: 'Kategorisieren Sie mit unserem einzigartigen „Save-Enjoy-Apply“-Ansatz für bessere Erinnerung.' },
        contentBlocks: { title: 'Schöne Inhaltsblöcke', description: 'Ein Ort, an dem Ihre gespeicherten Inhalte eine einheitliche Form für Links und Notizen haben.' },
        backupSystem: { title: 'Backup-System', description: 'Bewahren Sie Ihre wertvollen Inhalte mit automatischen Backups sicher auf.' },
        sharingPlatform: { title: 'Neue Sharing-Plattform', description: 'Teilen Sie Ihre Links mit der gesamten Plattform.' }
      },
      screenshots: {
        title: 'Memoryan erleben',
        keyboardHint: 'Pfeiltasten (←→) zur Navigation',
        items: {
          0: { title: 'MemoryHub', description: 'Ihre persönliche Startseite für die Kontrolle über alle Sammlungen.' },
          1: { title: 'Sammlungsdesign', description: 'Verläufe, Titel und Emojis für die volle Widerspiegelung dessen, was Sie dort speichern möchten.' },
          2: { title: 'Inhalte mühelos speichern', description: 'Speichern Sie schnell Links, Notizen und mehr mit unserer intuitiven Oberfläche.' },
          3: { title: 'Blöcke-Seite', description: 'Ansprechende Darstellung für Ihre Links, Notizen und anderen gespeicherten Inhalte.' },
          4: { title: 'Notizen-Editor', description: 'Schreiben Sie detaillierte und leidenschaftliche Notizen ohne Kompromisse.' },
          5: { title: 'Tagging-System', description: 'Organisieren Sie Inhalte mit unserem Save-Enjoy-Apply-Ansatz.' },
          6: { title: 'Farbpalette', description: 'Wählen Sie aus schönen Verlaufoptionen für Ihre Sammlungen.' },
          7: { title: 'Deadline-Verwaltung', description: 'Die Welt ist voll nützlicher Inhalte. Setzen Sie Fristen und legen Sie los.' },
          8: { title: 'Praktische Sortierung', description: 'Organisieren Sie Ihre Inhalte heute in Sammlungen und danken Sie sich morgen.' },
          9: { title: 'Erweiterte Optionen', description: 'Volle Kontrolle über Ihre Inhalte über das intuitive Optionsmenü.' }
        }
      },
      upcomingFeatures: {
        title: 'Geplante Funktionen',
        description: 'Wir verbessern Memoryan ständig. Das kommt als Nächstes:',
        sync: { title: 'Synchronisation auf allen Geräten', description: 'Greifen Sie nahtlos von allen Geräten auf Ihre Inhalte zu.' },
        moreBlocks: { title: 'Weitere Blocktypen', description: 'Unterstützung für Dokumente (PDF, Word, Excel) und Medien (Foto, Video).' },
        languages: { title: 'Weitere Sprachen', description: 'Spanisch, Chinesisch, Französisch und mehr in Kürze.' },
        more: { title: 'Und vieles mehr', description: 'Kontinuierliche Verbesserungen und neue Funktionen.' }
      },
      joinTests: {
        title: 'Nehmen Sie an unseren Closed Tests auf Google Play teil!',
        subtitle: 'Nehmen Sie an den Tests teil, geben Sie uns Feedback und erhalten Sie anschließend kleine Geschenke',
        benefits: { premium: '60 Tage Premium-Abo', credits: 'Ihr Name wird auf der Easter-Egg-Seite genannt' },
        joinButton: 'Teilnehmen'
      },
      download: {
        title: 'Holen Sie sich Memoryan jetzt!',
        ios: { title: 'Download für iOS', description: 'Tippen für QR-Code oder unten klicken' },
        android: { title: 'Download für Android', description: 'Tippen für QR-Code oder unten klicken' }
      },
      emailVerification: {
        title: 'Bestätigen Sie Ihre E-Mail',
        description: 'Geben Sie Ihre E-Mail ein, um einen 6-stelligen Code zu erhalten.',
        receiveOTP: 'Bestätigungscode erhalten',
        sending: 'Bestätigungscode wird gesendet...',
        codeSent: 'Bestätigungscode wurde gesendet!',
        enterCodeTitle: 'Bestätigungscode eingeben',
        codeSentTo: 'Wir haben einen 6-stelligen Code gesendet an',
        enterBelow: 'Bitte unten eingeben.',
        sixDigitCode: '6-stelliger Code',
        enterOTP: '—  —  —  —  —  —',
        verifyCode: 'Code bestätigen',
        resendCode: 'Code erneut senden',
        verified: 'E-Mail verifiziert!',
        successMessage: 'Ihre E-Mail wurde erfolgreich verifiziert. Alle Funktionen sind jetzt verfügbar.',
        secureVerification: 'Sichere E-Mail-Verifizierung',
        securityInfo: 'Codes sind zeitlich begrenzt und einmalig verwendbar. Die Verifizierung schützt Ihr Konto.'
      },
      passwordReset: {
        title: 'Passwort zurücksetzen',
        emailIntro: 'Geben Sie die E-Mail-Adresse Ihres Kontos ein, um zu beginnen.',
        continueButton: 'Weiter',
        requestCode: 'Code zum Zurücksetzen erhalten',
        codeWillBeSent: 'Wir senden einen 6-stelligen Code an:',
        receiveOTP: 'Reset-Code senden',
        enterCodeTitle: 'Reset-Code eingeben',
        codeSentTo: 'Wir haben einen 6-stelligen Code gesendet an',
        enterBelow: 'Bitte unten eingeben.',
        sixDigitCode: '6-stelliger Code',
        enterOTP: '—  —  —  —  —  —',
        verifyCode: 'Code bestätigen',
        resendCode: 'Code erneut senden',
        setNewPassword: 'Neues Passwort festlegen',
        passwordDescription: 'Erstellen Sie ein starkes Passwort mit mindestens 8 Zeichen.',
        newPassword: 'Neues Passwort',
        enterNewPassword: 'Geben Sie Ihr neues Passwort ein',
        confirmPassword: 'Passwort bestätigen',
        confirmNewPassword: 'Neues Passwort bestätigen',
        updatePassword: 'Passwort aktualisieren',
        success: 'Passwort aktualisiert!',
        successMessage: 'Ihr Passwort wurde erfolgreich geändert. Sie können sich jetzt anmelden.',
        secureReset: 'Sicheres Zurücksetzen des Passworts',
        securityInfo: 'Reset-Codes sind zeitlich begrenzt und einmalig verwendbar. Ihr neues Passwort wird verschlüsselt gespeichert.'
      }
    }
  };

  let currentLang = 'en';

  function translateKey(key) {
    const parts = key.split('.');
    let node = dictionaries[currentLang] || dictionaries.en;
    for (const p of parts) {
      node = node?.[p];
      if (node === undefined) break;
    }
    if (typeof node === 'string') return node;
    if (currentLang !== 'en' && dictionaries.en) {
      node = dictionaries.en;
      for (const p of parts) {
        node = node?.[p];
        if (node === undefined) break;
      }
      if (typeof node === 'string') return node;
    }
    return key;
  }

  function applyTranslations(selector, placeholderSelector) {
    // Text content
    const nodes = document.querySelectorAll(selector || '[data-i18n]');
    nodes.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = translateKey(key);
    });
    // Placeholders
    const placeholders = document.querySelectorAll(placeholderSelector || '[data-i18n-placeholder]');
    placeholders.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', translateKey(key));
    });

    // Update <html lang>
    document.documentElement.setAttribute('lang', currentLang);

    // Update visible language badge if present
    const badge = document.getElementById('current-language');
    if (badge) badge.textContent = currentLang.toUpperCase();
  }

  window.i18n = {
    init({ selector = '[data-i18n]', placeholderSelector = '[data-i18n-placeholder]', defaultLanguage } = {}) {
      currentLang = (defaultLanguage && dictionaries[defaultLanguage]) ? defaultLanguage : getPreferredLanguage();
      applyTranslations(selector, placeholderSelector);
    },
    changeLanguage(lang) {
      if (!dictionaries[lang]) lang = 'en';
      if (currentLang === lang) return;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (_) {}
      currentLang = lang;
      applyTranslations('[data-i18n]', '[data-i18n-placeholder]');
    },
    getPreferredLanguage,
    getCurrentLanguage() { return currentLang; },
    t(key) { return translateKey(key); }
  };
})();



