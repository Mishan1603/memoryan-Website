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
        emailAddress: 'Email Address',
        enterEmailPlaceholder: 'Enter your email address',
        processing: 'Processing request...',
        returnToHome: 'Return to Home',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        backToWebsite: 'Back to Website'
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
        emailAddress: 'Адрес электронной почты',
        enterEmailPlaceholder: 'Введите адрес электронной почты',
        processing: 'Обработка запроса...',
        returnToHome: 'Вернуться на главную',
        privacyPolicy: 'Политика конфиденциальности',
        termsOfService: 'Условия обслуживания',
        backToWebsite: 'Назад на сайт'
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
      if (!node) break;
    }
    return (typeof node === 'string') ? node : key;
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
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (_) {}
      currentLang = lang;
      applyTranslations('[data-i18n]', '[data-i18n-placeholder]');
      window.location.reload();
    },
    getPreferredLanguage,
    getCurrentLanguage() { return currentLang; },
    t(key) { return translateKey(key); }
  };
})();


