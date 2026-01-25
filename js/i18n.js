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
          copyright: '© 2024 Memoryan. All rights reserved.',
          privacyPolicy: 'Privacy Policy',
          termsOfService: 'Terms of Service'
        }
      },
      hero: {
        title: 'This is Memoryan',
        subtitle: 'An app that redefines how people save and apply valuable content from anywhere.',
        description: "It's not just about saving — it's about cherishing, organizing, and effortlessly rediscovering what truly matters to you.",
        specialOffer: 'Special Launch Offer!',
        freePremium: '🎉 FREE PREMIUM Until the 1st of June! 🎉',
        betaTesting: 'Beta Testing starts 2nd of June. Be among the first to experience the full power of Memoryan.',
        loadingTrailer: 'Loading trailer...',
        videoNotSupported: 'Your browser does not support the video tag.',
        videoError: 'Unable to load video. Please try again later.'
      },
      features: {
        title: 'Key Features of Memoryan',
        chambersCreation: { title: 'Chambers Creation', description: 'Organize your content into visually stunning customizable Chambers.' },
        richCustomization: { title: 'Rich Customization', description: 'Personalize the look and feel of your Chambers and Blocks with gradients and themes.' },
        aiTitleGeneration: { title: 'AI Title Generation', description: 'Let AI craft the perfect titles for your saved content automatically.' },
        smartTagSystem: { title: 'Smart Tag System', description: 'Categorize with our unique "Save-Enjoy-Apply" tagging approach for better recall.' },
        contentBlocks: { title: 'Beautiful Content Blocks', description: 'Visually appealing displays for your links, notes, and other saved content.' }
      },
      screenshots: {
        title: 'Experience Memoryan',
        keyboardHint: 'Use keyboard arrows (←→) to navigate',
        items: {
          0: { title: 'MemoryHub', description: 'Your personalized home for all control over your chambers.' },
          1: { title: 'Chambers design', description: 'Gradients, Titles and Emojis for full reflection of what you want to save there.' },
          2: { title: 'Save Content Effortlessly', description: 'Quickly save links, notes and more with our intuitive interface.' },
          3: { title: 'Blocks page', description: 'Visually appealing displays for your links, notes, and other saved content.' },
          4: { title: 'Rich Note Editor', description: 'Write detailed and passionate notes without compromises.' },
          5: { title: 'Powerful Tagging System', description: 'Organize content with our unique Save-Enjoy-Apply approach.' },
          6: { title: 'Rich Color Palette', description: 'Choose from beautiful gradient options for your chambers.' },
          7: { title: 'Deadline Management', description: 'The world is full of useful content. Enough pushing away. Set deadlines and get to it right away.' },
          8: { title: 'Convenient Sorting', description: 'Organize your content in your folders today, and thank yourself tomorrow.' },
          9: { title: 'Advanced Options', description: 'Full control over your content with our intuitive options menu.' }
        }
      },
      upcomingFeatures: {
        title: 'Upcoming Features',
        description: "We're constantly improving Memoryan. Here's what's coming next:",
        sync: { title: 'Synchronization across devices', description: 'Access your content seamlessly from all your devices.' },
        backup: { title: 'Backup feature', description: 'Keep your valuable content safe with automated backups.' },
        moreBlocks: { title: 'More types of blocks', description: 'Support for Documents (PDF, Word, Excel) and Media (Photo, Video).' },
        languages: { title: 'More supported languages', description: 'Spanish, German, French and more coming soon.' },
        friends: { title: 'Friends Screen', description: 'Effortlessly share valuable content with people who matter to you, with no compromises.' },
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
        termsOfService: 'Условия обслуживания',
        backToWebsite: 'Назад на сайт',
        footer: {
          copyright: '© 2024 Memoryan. Все права защищены.',
          privacyPolicy: 'Политика конфиденциальности',
          termsOfService: 'Условия обслуживания'
        }
      },
      hero: {
        title: 'Это Memoryan',
        subtitle: 'Приложение, которое меняет то, как люди сохраняют и используют ценный контент из любого места.',
        description: 'Речь не только о сохранении — но о том, чтобы хранить, организовывать и с лёгкостью возвращаться к тому, что для вас важно.',
        specialOffer: 'Специальное предложение запуска!',
        freePremium: '🎉 БЕСПЛАТНЫЙ ПРЕМИУМ до 1 июня! 🎉',
        betaTesting: 'Бета-тестирование начнётся 2 июня. Будьте среди первых, кто оценит возможности Memoryan.',
        loadingTrailer: 'Загрузка трейлера...',
        videoNotSupported: 'Ваш браузер не поддерживает воспроизведение видео.',
        videoError: 'Не удалось загрузить видео. Попробуйте позже.'
      },
      features: {
        title: 'Ключевые возможности Memoryan',
        chambersCreation: { title: 'Создание камер', description: 'Организуйте контент в настраиваемые визуальные камеры.' },
        richCustomization: { title: 'Гибкая настройка', description: 'Градиенты и темы для камер и блоков.' },
        aiTitleGeneration: { title: 'AI-заголовки', description: 'ИИ создаёт подходящие заголовки для сохранённого контента.' },
        smartTagSystem: { title: 'Умные теги', description: 'Система «Сохранить-Насладиться-Применить» для лучшего запоминания.' },
        contentBlocks: { title: 'Красивые блоки контента', description: 'Удобное отображение ссылок, заметок и другого контента.' }
      },
      screenshots: {
        title: 'Оцените Memoryan',
        keyboardHint: 'Навигация стрелками (←→)',
        items: {
          0: { title: 'MemoryHub', description: 'Ваш домашний экран для управления камерами.' },
          1: { title: 'Дизайн камер', description: 'Градиенты, заголовки и эмодзи под ваши задачи.' },
          2: { title: 'Сохраняйте контент легко', description: 'Ссылки, заметки и не только через простой интерфейс.' },
          3: { title: 'Страница блоков', description: 'Наглядное отображение ссылок, заметок и контента.' },
          4: { title: 'Редактор заметок', description: 'Заметки без компромиссов.' },
          5: { title: 'Система тегов', description: 'Организация по принципу Сохранить-Насладиться-Применить.' },
          6: { title: 'Палитра градиентов', description: 'Выбор градиентов для камер.' },
          7: { title: 'Дедлайны', description: 'Дeadlines помогают не откладывать контент в долгий ящик.' },
          8: { title: 'Удобная сортировка', description: 'Разложите контент по папкам сегодня — скажете себе спасибо завтра.' },
          9: { title: 'Дополнительные опции', description: 'Полный контроль над контентом через меню.' }
        }
      },
      upcomingFeatures: {
        title: 'Скоро',
        description: 'Мы постоянно развиваем Memoryan. Вот что в планах:',
        sync: { title: 'Синхронизация на всех устройствах', description: 'Доступ к контенту с любого устройства.' },
        backup: { title: 'Резервные копии', description: 'Автоматическое резервное копирование контента.' },
        moreBlocks: { title: 'Новые типы блоков', description: 'Документы (PDF, Word, Excel), медиа (фото, видео).' },
        languages: { title: 'Больше языков', description: 'Испанский, немецкий, французский и другие.' },
        friends: { title: 'Экран «Друзья»', description: 'Делитесь контентом с близкими без ограничений.' },
        more: { title: 'И многое другое', description: 'Улучшения, новые функции и доработки.' }
      },
      joinTests: {
        title: 'Присоединяйтесь к закрытому тесту в Google Play!',
        subtitle: 'Участвуйте в тестах, дайте обратную связь и получите приятные подарки',
        benefits: { premium: '60 дней премиум-подписки', credits: 'ваше имя в титрах на странице Easter Egg' },
        joinButton: 'Участвовать'
      },
      download: {
        title: 'Скачайте Memoryan!',
        ios: { title: 'Скачать для iOS', description: 'Нажмите, чтобы показать QR-код' },
        android: { title: 'Скачать для Android', description: 'Нажмите, чтобы показать QR-код' }
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
        emailAddress: 'Електронна адреса',
        enterEmailPlaceholder: 'Введіть електронну адресу',
        processing: 'Обробка запиту...',
        returnToHome: 'Повернутися на головну',
        privacyPolicy: 'Політика конфіденційності',
        termsOfService: 'Умови надання послуг',
        backToWebsite: 'Назад до сайту'
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
        emailAddress: 'E-Mail-Adresse',
        enterEmailPlaceholder: 'Geben Sie Ihre E-Mail-Adresse ein',
        processing: 'Vorgang wird verarbeitet...',
        returnToHome: 'Zur Startseite',
        privacyPolicy: 'Datenschutzerklärung',
        termsOfService: 'Nutzungsbedingungen',
        backToWebsite: 'Zur Webseite'
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


