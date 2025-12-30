import { emitEvent, isTMA, mockTelegramEnv } from '@tma.js/sdk-vue';

// It is important, to mock the environment only for development purposes. When building the
// application, import.meta.env.DEV will become false, and the code inside will be tree-shaken,
// so you will not see it in your final bundle.

// MODIFIED: Remove check for import.meta.env.DEV to allow running in Android WebView (production build)
// if (import.meta.env.DEV) {

// Check if we are NOT in a real Telegram environment
if (!await isTMA('complete')) {
  // Try to parse user data from URL parameters (e.g. ?user_id=123&first_name=John)
  // This allows the Android App to pass user info dynamically.
  const urlParams = new URL(window.location.href).searchParams;
  const userId = parseInt(urlParams.get('user_id') || '999999999');
  const firstName = urlParams.get('first_name') || 'Android User';
  const username = urlParams.get('username') || 'android_user';

  const themeParams = {
    accent_text_color: '#6ab2f2',
    bg_color: '#17212b',
    button_color: '#5288c1',
    button_text_color: '#ffffff',
    destructive_text_color: '#ec3942',
    header_bg_color: '#17212b',
    hint_color: '#708499',
    link_color: '#6ab3f3',
    secondary_bg_color: '#232e3c',
    section_bg_color: '#17212b',
    section_header_text_color: '#6ab3f3',
    subtitle_text_color: '#708499',
    text_color: '#f5f5f5',
  } as const;
  const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

  mockTelegramEnv({
    onEvent(e) {
      // Here you can write your own handlers for all known Telegram Mini Apps methods:
      // https://docs.telegram-mini-apps.com/platform/methods
      if (e.name === 'web_app_request_theme') {
        return emitEvent('theme_changed', { theme_params: themeParams });
      }
      if (e.name === 'web_app_request_viewport') {
        return emitEvent('viewport_changed', {
          height: window.innerHeight,
          width: window.innerWidth,
          is_expanded: true,
          is_state_stable: true,
        });
      }
      if (e.name === 'web_app_request_content_safe_area') {
        return emitEvent('content_safe_area_changed', noInsets);
      }
      if (e.name === 'web_app_request_safe_area') {
        return emitEvent('safe_area_changed', noInsets);
      }

      // Handle Main Button setup
      if (e.name === 'web_app_setup_main_button') {
        const { is_visible, text, color } = (e as any).is_visible !== undefined ? e as any : (e as any).params || {};

        // Forward to Android if available
        if (window.Android) {
          if (typeof is_visible === 'boolean') {
            window.Android.setMainButtonVisible(is_visible);
          }
          if (text) {
            window.Android.setMainButtonText(text);
          }
          if (color) {
            window.Android.setMainButtonColor(color);
          }
        }
        // Also emit event back to SDK to confirm the change (mocking the behavior)
        if (typeof is_visible === 'boolean') {
          emitEvent('main_button_settings_changed', { is_visible });
        }
      }

      // Handle Popup
      if (e.name === 'web_app_open_popup') {
        const { title, message, buttons } = (e as any).title !== undefined ? e as any : (e as any).params || {};

        if (window.Android) {
          // Serialize buttons to JSON string to pass to Android
          const buttonsJson = JSON.stringify(buttons || []);
          try {
            window.Android.openPopup(title || '', message || '', buttonsJson);
          } catch (err) {
            alert(`Error calling window.Android.openPopup: ${err}`);
          }
        } else {
          // Fallback for browser testing
          alert(`[Popup] ${title}: ${message}`);
        }
      }

      // Handle Haptic Feedback
      if (e.name === 'web_app_trigger_haptic_feedback') {
        const { type, impact_style, notification_type } = (e as any).params || {};
        if (window.Android) {
          let style = '';
          if (type === 'impact') style = impact_style || '';
          if (type === 'notification') style = notification_type || '';

          window.Android.hapticFeedback(type, style);
        }
      }

      // Handle Close App
      if (e.name === 'web_app_close') {
        if (window.Android) {
          window.Android.closeApp();
        }
      }

      // Handle Open Link (External Browser or Deep Link)
      if (e.name === 'web_app_open_link') {
        const { url } = (e as any).params || {};
        if (window.Android && url) {
          window.Android.openLink(url);
        } else if (url) {
          window.open(url, '_blank');
        }
      }

      // Handle Telegram Link (Internal Navigation)
      if (e.name === 'web_app_open_telegram_link') {
        const { url } = (e as any).params || {};
        if (window.Android && url) {
          window.Android.openTelegramLink(url);
        } else if (url) {
          window.open(url, '_blank');
        }
      }

      // Handle QR Scanner
      if (e.name === 'web_app_open_scan_qr_popup') {
        if (window.Android && window.Android.scanQrCode) {
          window.Android.scanQrCode();
        } else {
          alert("QR Scanner not supported on this device/emulator");
          // Simulate a scan for testing if needed
          // setTimeout(() => window.onAndroidQrScanned("https://t.me/example"), 2000);
        }
      }
    },
    launchParams: new URLSearchParams([
      // Discover more launch parameters:
      // https://docs.telegram-mini-apps.com/platform/launch-parameters#parameters-list
      ['tgWebAppThemeParams', JSON.stringify(themeParams)],
      // Your init data goes here. Learn more about it here:
      // https://docs.telegram-mini-apps.com/platform/init-data#parameters-list
      //
      // Note that to make sure, you are using a valid init data, you must pass it exactly as it
      // is sent from the Telegram application. The reason is in case you will sort its keys
      // (auth_date, hash, user, etc.) or values your own way, init data validation will more
      // likely to fail on your server side. So, to make sure you are working with a valid init
      // data, it is better to take a real one from your application and paste it here. It should
      // look something like this (a correctly encoded URL search params):
      // ```
      // user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22...
      // ```
      // But in case you don't really need a valid init data, use this one:
      ['tgWebAppData', new URLSearchParams([
        ['auth_date', (new Date().getTime() / 1000 | 0).toString()],
        ['hash', 'some-hash'],
        ['signature', 'some-signature'],
        ['user', JSON.stringify({
          id: userId,
          first_name: firstName,
          username: username,
          is_premium: false,
          language_code: 'en'
        })],
      ]).toString()],
      ['tgWebAppVersion', '8.4'],
      ['tgWebAppPlatform', 'android_webview'], // Custom platform name
    ]),
  });

  // Listen for Android Popup Callback
  window.onAndroidPopupClosed = (buttonId: string) => {
    emitEvent('popup_closed', { button_id: buttonId });
  };

  // Listen for QR Code Scan Result
  window.onAndroidQrScanned = (content: string) => {
    // 1. Emit the text received event to the Mini App
    emitEvent('qr_text_received', { data: content });

    // 2. Call the polyfill callback if it exists (set by showScanQrPopup)
    if ((window as any)._qrCallback) {
      (window as any)._qrCallback(content);
    }

    // 3. Automatically close the "popup" state in the SDK (since Native UI is gone)
    emitEvent('scan_qr_popup_closed');
  };

  // Listen for Android Theme Updates
  window.updateTheme = (themeParamsJson: string) => {
    // alert(`DEBUG: Received Theme JSON: ${themeParamsJson}`); // Uncomment for heavy debugging
    try {
      const parsedParams = JSON.parse(themeParamsJson);
      // alert(`DEBUG: Parsed Theme Color: ${parsedParams.bg_color}`);
      emitEvent('theme_changed', { theme_params: parsedParams });
    } catch (e) {
      alert(`ERROR parsing theme: ${e}`);
    }
  };

  // Request initial theme from Android (Pull mechanism to avoid race conditions)
  if (window.Android && window.Android.requestTheme) {
    // alert('DEBUG: Requesting initial theme from Android...');
    window.Android.requestTheme();
  }

  // --- POLYFILL for window.Telegram.WebApp ---
  // This allows direct usage of Telegram globals (bypassing the SDK wrapper)
  if (!(window as any).Telegram) {
    (window as any).Telegram = {};
  }
  if (!(window as any).Telegram.WebApp) {
    (window as any).Telegram.WebApp = {
      initData: '',
      initDataUnsafe: {},
      version: '6.4',
      platform: 'android',
      showScanQrPopup: (params: any, callback?: (text: string) => boolean) => {
        // Store callback to be called later
        if (callback) {
          (window as any)._qrCallback = callback;
        }
        // Trigger Android Native Action
        if (window.Android && window.Android.scanQrCode) {
          window.Android.scanQrCode();
        } else {
          alert("QR Code Scanner not available in this emulated environment.");
        }
      },
      // Minimal mocks to prevent crashes if other things are accessed
      onEvent: () => { },
      offEvent: () => { },
      postEvent: () => { },
    };
  }

  console.info(
    '⚠️ Environment and Telegram Global mocked for Android WebView integration.',
  );
}
// }
