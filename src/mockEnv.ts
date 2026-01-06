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

      // Handle Viewport Expand
      if (e.name === 'web_app_expand') {
        if (window.Android && window.Android.expandViewport) {
          window.Android.expandViewport();
        }
        // Emit viewport changed with expanded state
        return emitEvent('viewport_changed', {
          height: window.innerHeight,
          width: window.innerWidth,
          is_expanded: true,
          is_state_stable: true,
        });
      }

      // Handle Main Button setup
      if (e.name === 'web_app_setup_main_button') {
        const { is_visible, text, color, is_active, is_progress_visible } = (e as any).is_visible !== undefined ? e as any : (e as any).params || {};

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
          if (typeof is_active === 'boolean') {
            window.Android.setMainButtonEnabled(is_active);
          }
          if (typeof is_progress_visible === 'boolean') {
            window.Android.setMainButtonProgress(is_progress_visible);
          }
        }
        // Also emit event back to SDK to confirm the change (mocking the behavior)
        if (typeof is_visible === 'boolean') {
          emitEvent('main_button_settings_changed', { is_visible });
        }
        if (typeof is_active === 'boolean') {
          emitEvent('main_button_settings_changed', { is_active });
        }
        if (typeof is_progress_visible === 'boolean') {
          emitEvent('main_button_settings_changed', { is_progress_visible });
        }
      }

      // Handle Back Button setup
      if (e.name === 'web_app_setup_back_button') {
        const { is_visible } = (e as any).is_visible !== undefined ? e as any : (e as any).params || {};
        // alert(`DEBUG: web_app_setup_back_button received. Visible: ${is_visible}`);
        if (window.Android && typeof is_visible === 'boolean') {
          window.Android.setBackButtonVisible(is_visible);
        }
        if (typeof is_visible === 'boolean') {
          emitEvent('back_button_settings_changed', { is_visible });
        }
      }

      // Handle Header Color setup
      if (e.name === 'web_app_set_header_color') {
        const { color } = (e as any).color !== undefined ? e as any : (e as any).params || {};
        if (window.Android && color) {
          window.Android.setHeaderColor(color);
        }
        if (color) {
          emitEvent('header_color_changed', { color });
        }
      }

      // Handle Settings Button setup
      if (e.name === 'web_app_setup_settings_button') {
        const { is_visible } = (e as any).is_visible !== undefined ? e as any : (e as any).params || {};
        if (window.Android && typeof is_visible === 'boolean') {
          window.Android.setSettingsButtonVisible(is_visible);
        }
        if (typeof is_visible === 'boolean') {
          emitEvent('settings_button_settings_changed', { is_visible });
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

      // Handle Closing Behavior (confirmation before close)
      if (e.name === 'web_app_setup_closing_behavior') {
        const { need_confirmation } = (e as any).need_confirmation !== undefined ? e as any : (e as any).params || {};
        if (window.Android && typeof need_confirmation === 'boolean') {
          window.Android.setClosingConfirmation(need_confirmation);
        }
        if (typeof need_confirmation === 'boolean') {
          emitEvent('closing_behavior_changed', { need_confirmation });
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
      if (e.name === 'web_app_open_tg_link' || e.name === 'web_app_open_telegram_link') {
        const { path_full } = (e as any).params || {};
        const url = path_full; // SDK sends path_full

        if (url && url.includes('share/url') && window.Android && window.Android.shareText) {
          // Handle Share URL: https://t.me/share/url?url={url}&text={text}
          try {
            const urlObj = new URL(url, 'https://t.me');
            const text = urlObj.searchParams.get('text') || '';
            const shareUrl = urlObj.searchParams.get('url') || '';
            window.Android.shareText(`${text} ${shareUrl}`.trim());
            return;
          } catch (e) {
            // Fallback
          }
        }

        if (window.Android && url) {
          window.Android.openTelegramLink(url);
        } else if (url) {
          window.open(url, '_blank');
        }
      }

      // Handle Secondary Button
      if (e.name === 'web_app_setup_secondary_button') {
        const { text, color, is_active, is_visible, position, is_progress_visible } = (e as any).params || {};
        if (window.Android) {
          if (text !== undefined) window.Android.setSecondaryButtonText(text);
          if (color !== undefined) window.Android.setSecondaryButtonColor(color);
          if (is_active !== undefined) window.Android.setSecondaryButtonEnabled(is_active);
          if (is_visible !== undefined) window.Android.setSecondaryButtonVisible(is_visible);
          if (position !== undefined) window.Android.setSecondaryButtonPosition(position);
          if (is_progress_visible !== undefined) window.Android.setSecondaryButtonProgress(is_progress_visible);
        }
      }

      // Handle Swipe Behavior
      if (e.name === 'web_app_setup_swipe_behavior') {
        const { allow_vertical_swipe } = (e as any).params || {};
        if (window.Android && window.Android.setSwipeEnabled) {
          window.Android.setSwipeEnabled(allow_vertical_swipe);
        }
      }

      // Handle Invoice
      if (e.name === 'web_app_open_invoice') {
        const { slug } = (e as any).params || {};
        if (window.Android && window.Android.openInvoice) {
          window.Android.openInvoice(slug);
        } else {
          alert(`[Mock Invoice] Opening invoice: ${slug}`);
          // Simulate event
          setTimeout(() => emitEvent('invoice_closed', { slug, status: 'paid' }), 2000);
        }
      }

      // Handle Fullscreen
      if (e.name === 'web_app_request_fullscreen') {
        if (window.Android && window.Android.setFullscreen) {
          window.Android.setFullscreen(true);
        }
      }
      if (e.name === 'web_app_exit_fullscreen') {
        if (window.Android && window.Android.setFullscreen) {
          window.Android.setFullscreen(false);
        }
      }

      // Handle Request Write Access
      if (e.name === 'web_app_request_write_access') {
        if (window.Android && window.Android.requestWriteAccess) {
          window.Android.requestWriteAccess();
        } else {
          // Mock: simulate user granting access after 1 second
          setTimeout(() => emitEvent('write_access_requested', { status: 'allowed' }), 1000);
        }
      }

      // Handle Request Contact
      if (e.name === 'web_app_request_phone') {
        if (window.Android && window.Android.requestContact) {
          window.Android.requestContact();
        } else {
          // Mock: simulate user sharing contact after 1 second
          // Using CustomEvent because emitEvent type doesn't support contact property
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('phone_requested', {
              detail: {
                status: 'sent',
                contact: {
                  phone_number: '+84123456789',
                  first_name: 'Mock',
                  last_name: 'User',
                  user_id: 999999999
                }
              }
            }));
          }, 1000);
        }
      }

      // Handle Bottom Bar Color
      if (e.name === 'web_app_set_bottom_bar_color') {
        const { color } = (e as any).params || {};
        if (window.Android && window.Android.setBottomBarColor) {
          window.Android.setBottomBarColor(color);
        } else {
          // Mock: Just log and show toast
          console.log('[Mock] Bottom Bar Color set to:', color);
        }
      }

      // Handle Emoji Status
      if (e.name === 'web_app_set_emoji_status') {
        const { custom_emoji_id, duration } = (e as any).params || {};
        if (window.Android && window.Android.setEmojiStatus) {
          window.Android.setEmojiStatus(custom_emoji_id, duration);
        } else {
          // Mock: Simulate success after 1 second
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('emoji_status_set', {
              detail: { success: true }
            }));
          }, 1000);
        }
      }

      // Handle Add to Home Screen
      if (e.name === 'web_app_add_to_home_screen') {
        if (window.Android && window.Android.addToHomeScreen) {
          window.Android.addToHomeScreen();
        } else {
          // Mock: Simulate success after 1 second
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('home_screen_added', {
              detail: { status: 'added' }
            }));
          }, 1000);
        }
      }

      // Handle Check Home Screen Status
      if (e.name === 'web_app_check_home_screen') {
        if (window.Android && window.Android.checkHomeScreenStatus) {
          const status = window.Android.checkHomeScreenStatus();
          window.dispatchEvent(new CustomEvent('home_screen_checked', {
            detail: JSON.parse(status)
          }));
        } else {
          // Mock: Return unknown status
          window.dispatchEvent(new CustomEvent('home_screen_checked', {
            detail: { status: 'unknown' }
          }));
        }
      }

      // Handle Start Accelerometer
      if (e.name === 'web_app_start_accelerometer') {
        const { refresh_rate } = (e as any).params || {};
        if (window.Android && window.Android.startAccelerometer) {
          window.Android.startAccelerometer(refresh_rate || 'default');
        } else {
          // Mock: Use browser DeviceMotion API if available
          console.log('[Mock] Start Accelerometer with rate:', refresh_rate);
        }
      }

      // Handle Stop Accelerometer
      if (e.name === 'web_app_stop_accelerometer') {
        if (window.Android && window.Android.stopAccelerometer) {
          window.Android.stopAccelerometer();
        }
      }

      // Handle Start Gyroscope
      if (e.name === 'web_app_start_gyroscope') {
        const { refresh_rate } = (e as any).params || {};
        if (window.Android && window.Android.startGyroscope) {
          window.Android.startGyroscope(refresh_rate || 'default');
        } else {
          console.log('[Mock] Start Gyroscope with rate:', refresh_rate);
        }
      }

      // Handle Stop Gyroscope
      if (e.name === 'web_app_stop_gyroscope') {
        if (window.Android && window.Android.stopGyroscope) {
          window.Android.stopGyroscope();
        }
      }

      // Handle Start Device Orientation
      if (e.name === 'web_app_start_device_orientation') {
        const { refresh_rate, need_absolute } = (e as any).params || {};
        if (window.Android && window.Android.startDeviceOrientation) {
          window.Android.startDeviceOrientation(refresh_rate || 'default', need_absolute || false);
        } else {
          console.log('[Mock] Start Device Orientation with rate:', refresh_rate);
        }
      }

      // Handle Stop Device Orientation
      if (e.name === 'web_app_stop_device_orientation') {
        if (window.Android && window.Android.stopDeviceOrientation) {
          window.Android.stopDeviceOrientation();
        }
      }

      // Handle Open Location Settings
      if (e.name === 'web_app_open_location_settings') {
        if (window.Android && window.Android.openLocationSettings) {
          window.Android.openLocationSettings();
        } else {
          alert('[Mock] Opening Location Settings');
        }
      }

      // Handle Get Current Location
      if (e.name === 'web_app_get_current_location') {
        if (window.Android && window.Android.getCurrentLocation) {
          window.Android.getCurrentLocation();
        } else {
          // Mock: Use browser Geolocation API
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                window.dispatchEvent(new CustomEvent('location_received', {
                  detail: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    altitude: position.coords.altitude,
                    accuracy: position.coords.accuracy,
                    speed: position.coords.speed,
                    heading: position.coords.heading
                  }
                }));
              },
              (error) => {
                window.dispatchEvent(new CustomEvent('location_error', {
                  detail: { error: error.message }
                }));
              }
            );
          } else {
            // Mock location for desktop
            window.dispatchEvent(new CustomEvent('location_received', {
              detail: {
                latitude: 10.762622,
                longitude: 106.660172,
                altitude: null,
                accuracy: 100,
                speed: null,
                heading: null
              }
            }));
          }
        }
      }

      // Handle Share Story (Story Widget)
      if (e.name === 'web_app_share_to_story') {
        const { media_url, text, widget_link } = (e as any).params || {};
        if (window.Android && window.Android.shareStory) {
          window.Android.shareStory(
            media_url || '',
            text || '',
            widget_link?.url || '',
            widget_link?.name || ''
          );
        } else {
          // Mock: Show what would be shared
          console.log('[Mock] Share to Story:', { media_url, text, widget_link });
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('story_shared', {
              detail: { success: true }
            }));
          }, 1000);
        }
      }

      // Handle Download File
      if (e.name === 'web_app_download_file') {
        const { url, file_name } = (e as any).params || {};
        if (window.Android && window.Android.downloadFile) {
          window.Android.downloadFile(url || '', file_name || 'download');
        } else {
          // Mock: Open URL in new tab (simulates download)
          console.log('[Mock] Download File:', { url, file_name });
          window.open(url, '_blank');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('file_download_started', {
              detail: { success: true, url, file_name }
            }));
          }, 500);
        }
      }

      // Handle Open Media Preview
      if (e.name === 'web_app_open_media_preview') {
        const { url, type } = (e as any).params || {};
        if (window.Android && window.Android.openMediaPreview) {
          window.Android.openMediaPreview(url || '', type || 'photo');
        } else {
          // Mock: Open media in new window
          console.log('[Mock] Open Media Preview:', { url, type });
          window.open(url, '_blank');
        }
      }

      // Handle Read Text From Clipboard
      if (e.name === 'web_app_read_text_from_clipboard') {
        if (window.Android && window.Android.readTextFromClipboard) {
          window.Android.readTextFromClipboard();
        } else {
          // Mock: Use browser Clipboard API
          if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText()
              .then((text) => {
                window.dispatchEvent(new CustomEvent('clipboard_text_received', {
                  detail: { data: text }
                }));
              })
              .catch(() => {
                window.dispatchEvent(new CustomEvent('clipboard_text_received', {
                  detail: { data: null, error: 'Clipboard access denied' }
                }));
              });
          } else {
            // Mock for fallback
            window.dispatchEvent(new CustomEvent('clipboard_text_received', {
              detail: { data: '[Mock Clipboard Text]' }
            }));
          }
        }
      }

      // Handle Send Data (to bot)
      if (e.name === 'web_app_data_send') {
        const { data } = (e as any).params || {};
        if (window.Android && window.Android.sendData) {
          window.Android.sendData(data || '');
        } else {
          // Mock: Show what would be sent
          console.log('[Mock] Send Data to Bot:', data);
          alert(`[Mock] Đã gửi data tới Bot:\n${data}\n\n(Tính năng này chỉ hoạt động trong Telegram thật)`);
        }
      }

      // Handle Switch Inline Query
      if (e.name === 'web_app_switch_inline_query') {
        const { query, chat_types } = (e as any).params || {};
        if (window.Android && window.Android.switchInlineQuery) {
          window.Android.switchInlineQuery(query || '', JSON.stringify(chat_types || []));
        } else {
          // Mock: Show inline query simulation
          console.log('[Mock] Switch Inline Query:', { query, chat_types });
          alert(`[Mock] Mở inline query:\nQuery: @bot ${query}\nChat Types: ${JSON.stringify(chat_types)}\n\n(Tính năng này chỉ hoạt động trong Telegram thật)`);
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

      // Handle Cloud Storage operations
      if (e.name === 'web_app_invoke_custom_method') {
        const params = (e as any).params || {};
        const { method, req_id } = params;

        if (method === 'saveStorageValue') {
          const { key, value } = params.params || {};
          if (window.Android && window.Android.cloudStorageSetItem) {
            window.Android.cloudStorageSetItem(key, value);
          } else {
            // Fallback to localStorage for browser testing
            localStorage.setItem(`tg_cloud_${key}`, value);
          }
          emitEvent('custom_method_invoked', { req_id, result: true });
        }

        if (method === 'getStorageValues') {
          const { keys } = params.params || {};
          const result: Record<string, string> = {};

          if (window.Android && window.Android.cloudStorageGetItem) {
            for (const key of keys) {
              const value = window.Android.cloudStorageGetItem(key);
              if (value) result[key] = value;
            }
          } else {
            // Fallback to localStorage
            for (const key of keys) {
              const value = localStorage.getItem(`tg_cloud_${key}`);
              if (value) result[key] = value;
            }
          }
          emitEvent('custom_method_invoked', { req_id, result });
        }

        if (method === 'deleteStorageValues') {
          const { keys } = params.params || {};
          if (window.Android && window.Android.cloudStorageRemoveItem) {
            for (const key of keys) {
              window.Android.cloudStorageRemoveItem(key);
            }
          } else {
            // Fallback to localStorage
            for (const key of keys) {
              localStorage.removeItem(`tg_cloud_${key}`);
            }
          }
          emitEvent('custom_method_invoked', { req_id, result: true });
        }

        if (method === 'getStorageKeys') {
          let keys: string[] = [];
          if (window.Android && window.Android.cloudStorageGetKeys) {
            try {
              keys = JSON.parse(window.Android.cloudStorageGetKeys());
            } catch {
              keys = [];
            }
          } else {
            // Fallback to localStorage
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key?.startsWith('tg_cloud_')) {
                keys.push(key.replace('tg_cloud_', ''));
              }
            }
          }
          emitEvent('custom_method_invoked', { req_id, result: keys });
        }
      }

      // Handle Biometric Manager - Get Info
      if (e.name === 'web_app_biometry_get_info') {
        let biometricInfo = {
          available: false,
          type: '',
          access_requested: false,
          access_granted: false,
          device_id: '',
          token_saved: false,
        };

        if (window.Android && window.Android.biometricInit) {
          try {
            biometricInfo = JSON.parse(window.Android.biometricInit());
          } catch {
            // Keep default info
          }
        }

        emitEvent('biometry_info_received', biometricInfo);
      }

      // Handle Biometric Manager - Request Auth
      if (e.name === 'web_app_biometry_request_auth') {
        const params = (e as any).params || {};
        const { reason } = params;

        if (window.Android && window.Android.biometricAuthenticate) {
          window.Android.biometricAuthenticate(reason || 'Xác thực sinh trắc học');
        } else {
          // Fallback: simulate success for browser testing
          setTimeout(() => {
            emitEvent('biometry_auth_requested', {
              status: 'authorized',
              token: 'mock_biometric_token_' + Date.now(),
            });
          }, 1000);
        }
      }

      // Handle Biometric Manager - Open Settings
      if (e.name === 'web_app_biometry_open_settings') {
        if (window.Android && window.Android.biometricOpenSettings) {
          window.Android.biometricOpenSettings();
        }
        emitEvent('biometry_settings_received', { status: 'opened' });
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

  // Listen for Viewport Expanded from Android
  (window as any).onViewportExpanded = (height: number, width: number) => {
    emitEvent('viewport_changed', {
      height: height,
      width: width,
      is_expanded: true,
      is_state_stable: true,
    });
  };

  // Listen for Biometric Result from Android
  window.onBiometricResult = (success: boolean, token: string) => {
    if (success) {
      emitEvent('biometry_auth_requested', {
        status: 'authorized',
        token: token,
      });
    } else {
      emitEvent('biometry_auth_requested', {
        status: 'failed',
        token: '',
      });
    }
  };

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
      setHeaderColor: (color: string) => {
        // Trigger Android Native Action
        if (window.Android && window.Android.setHeaderColor) {
          window.Android.setHeaderColor(color);
        } else if (window.Android) {
          alert("setHeaderColor not implemented in native " + (window.Android ? "Android" : "mock"));
        }
      },
      // Invoice support
      openInvoice: (slug: string, callback?: (status: string) => void) => {
        // Store callback for later use when invoice_closed event is received
        if (callback) {
          (window as any)._invoiceCallback = callback;
        }
        if (window.Android && window.Android.openInvoice) {
          window.Android.openInvoice(slug);
        } else {
          alert(`[Mock Invoice] Opening invoice: ${slug}`);
          // Simulate paid status after 2 seconds for browser testing
          setTimeout(() => {
            if ((window as any)._invoiceCallback) {
              (window as any)._invoiceCallback('paid');
            }
          }, 2000);
        }
      },
      // Fullscreen support
      requestFullscreen: () => {
        if (window.Android && window.Android.setFullscreen) {
          window.Android.setFullscreen(true);
        }
      },
      exitFullscreen: () => {
        if (window.Android && window.Android.setFullscreen) {
          window.Android.setFullscreen(false);
        }
      },
      // Minimal mocks to prevent crashes if other things are accessed
      onEvent: () => { },
      offEvent: () => { },
      postEvent: () => { },
    };
  }

  // Listen for Android Back Button Pressed
  window.addEventListener('back_button_pressed', () => {
    emitEvent('back_button_pressed');
  });

  // Listen for Settings Button Pressed
  window.addEventListener('settings_button_pressed', () => {
    emitEvent('settings_button_pressed');
  });

  // Listen for Secondary Button Pressed
  window.addEventListener('secondary_button_pressed', () => {
    emitEvent('secondary_button_pressed');
  });

  // Listen for Main Button Pressed (from Android native button)
  window.addEventListener('main_button_pressed', () => {
    emitEvent('main_button_pressed');
  });

  // Listen for Invoice Closed from Android
  window.addEventListener('invoice_closed', (e: any) => {
    const detail = e.detail || {};
    emitEvent('invoice_closed', { slug: detail.slug, status: detail.status });
    // Call stored callback if available
    if ((window as any)._invoiceCallback) {
      (window as any)._invoiceCallback(detail.status);
      (window as any)._invoiceCallback = null; // Clear callback after use
    }
  });

  console.info(
    '⚠️ Environment and Telegram Global mocked for Android WebView integration.',
  );
}
// }
