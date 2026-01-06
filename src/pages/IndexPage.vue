```vue
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { routes } from '@/router';
import { mainButton, secondaryButton, useSignal, popup, hapticFeedback, miniApp, initData, settingsButton, closingBehavior, swipeBehavior, viewport, cloudStorage, type User } from '@tma.js/sdk-vue';
import AppPage from '@/components/AppPage.vue';
import AppLink from '@/components/AppLink.vue';
import { useBackButton } from '@/composables/useBackButton';
import { useRouter } from 'vue-router';

const nonIndexRoutes = computed(() => routes.filter((r) => !!r.meta?.title));

const initDataRow = useSignal(initData.state);
const user = useSignal<User | undefined>(initData.user);
const router = useRouter();

useBackButton();

// Setup Settings Button
onMounted(() => {
  if (settingsButton.mount.isAvailable()) {
    settingsButton.show();
    settingsButton.onClick(() => {
      // Navigate to Theme Params page when Settings button is clicked
      router.push({ name: 'theme-params' });
    });
  }
});

const isAndroidHost = ref(false);

const isMainButtonVisible = useSignal(mainButton.isVisible);

onMounted(() => {
  // Check if running inside Android Host
  isAndroidHost.value = !!window.Android;

  // DEBUG: Check available methods
  if (window.Android) {
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(window.Android));
      // alert(`Android Interface Methods: ${methods.join(', ')}`);

      if (typeof window.Android.shareText !== 'function') {
          alert("LỖI: Hàm shareText KHÔNG tồn tại trong WebAppInterface! Vui lòng cập nhật Android Code.");
      }
  } else {
      console.log("Not running in Android Host");
  }

  // Setup Main Button click listener from SDK
  mainButton.onClick(() => {
    if (window.Android) {
      window.Android.showToast("Đã bấm nút Main Button!");
    } else {
      alert("Main Button Clicked!");
    }
  });
});

const toggleMainButton = () => {
  if (mainButton.isVisible()) {
    mainButton.hide();
  } else {
    mainButton.setText("Nút Chính"); // Set default text explicitly
    mainButton.show();
  }
};

const updateMainButtonText = () => {
  mainButton.setText("THANH TOÁN NGAY");
};

const updateMainButtonColor = () => {
  mainButton.setBgColor("#ff4081"); // Pink color
};

const enableMainButton = () => {
  mainButton.enable();
};

const disableMainButton = () => {
  mainButton.disable();
};

const showProgress = () => {
  mainButton.setParams({ isLoaderVisible: true });
};

const hideProgress = () => {
  mainButton.setParams({ isLoaderVisible: false });
};

const showNativeToast = () => {
  if (window.Android) {
    window.Android.showToast("Lời chào từ Vue.js gửi tới Android!");
  }
};



const triggerImpact = (style: 'light' | 'medium' | 'heavy') => {
  if (hapticFeedback.isSupported()) {
    hapticFeedback.impactOccurred(style);
  }
};

const triggerNotification = (type: 'success' | 'warning' | 'error') => {
  if (hapticFeedback.isSupported()) {
    hapticFeedback.notificationOccurred(type);
  }
};

const triggerSelection = () => {
  if (hapticFeedback.isSupported()) {
    hapticFeedback.selectionChanged();
  }
};

const closeNativeApp = () => {
  miniApp.close();
};

const enableCloseConfirmation = () => {
  closingBehavior.enableConfirmation();
};

const disableCloseConfirmation = () => {
  closingBehavior.disableConfirmation();
};

// Viewport state
const viewportHeight = useSignal(viewport.height);
const viewportIsExpanded = useSignal(viewport.isExpanded);

const expandMiniApp = () => {
  viewport.expand();
};

// Cloud Storage state and functions
const cloudStorageKey = ref('testKey');
const cloudStorageValue = ref('');
const cloudStorageResult = ref('');
const cloudStorageKeys = ref<string[]>([]);

const saveToCloud = async () => {
  try {
    await cloudStorage.setItem(cloudStorageKey.value, cloudStorageValue.value);
    cloudStorageResult.value = `✅ Đã lưu: ${cloudStorageKey.value} = ${cloudStorageValue.value}`;
  } catch (e) {
    cloudStorageResult.value = `❌ Lỗi: ${e}`;
  }
};

const loadFromCloud = async () => {
  try {
    const value = await cloudStorage.getItem(cloudStorageKey.value);
    cloudStorageResult.value = `📖 Đọc được: ${cloudStorageKey.value} = ${value || '(trống)'}`;
  } catch (e) {
    cloudStorageResult.value = `❌ Lỗi: ${e}`;
  }
};

const deleteFromCloud = async () => {
  try {
    await cloudStorage.deleteItem(cloudStorageKey.value);
    cloudStorageResult.value = `🗑️ Đã xóa: ${cloudStorageKey.value}`;
  } catch (e) {
    cloudStorageResult.value = `❌ Lỗi: ${e}`;
  }
};

const getAllKeys = async () => {
  try {
    const keys = await cloudStorage.getKeys();
    cloudStorageKeys.value = keys;
    cloudStorageResult.value = `🔑 Có ${keys.length} keys: ${keys.join(', ') || '(không có)'}`;
  } catch (e) {
    cloudStorageResult.value = `❌ Lỗi: ${e}`;
  }
};

// Biometric state and functions
const biometricResult = ref('');
const biometricInfo = ref({
  available: false,
  type: '',
});

const checkBiometric = () => {
  if (window.Android && window.Android.biometricInit) {
    try {
      const info = JSON.parse(window.Android.biometricInit());
      biometricInfo.value = info;
      biometricResult.value = info.available
        ? `✅ Biometric có sẵn: ${info.type}`
        : '❌ Biometric không khả dụng';
    } catch (e) {
      biometricResult.value = `❌ Lỗi: ${e}`;
    }
  } else {
    biometricResult.value = '⚠️ Không hỗ trợ (chạy trên browser)';
  }
};

const authenticateBiometric = () => {
  biometricResult.value = '⏳ Đang chờ xác thực...';

  // Setup callback to receive result
  window.onBiometricResult = (success: boolean, token: string) => {
    if (success) {
      biometricResult.value = `✅ Xác thực thành công! Token: ${token.substring(0, 20)}...`;
    } else {
      biometricResult.value = '❌ Xác thực thất bại';
    }
  };

  if (window.Android && window.Android.biometricAuthenticate) {
    window.Android.biometricAuthenticate('Xác thực để truy cập tính năng bảo mật');
  } else {
    // Simulate for browser
    setTimeout(() => {
      biometricResult.value = '✅ (Mock) Xác thực thành công!';
    }, 1000);
  }
};

const openBiometricSettings = () => {
  if (window.Android && window.Android.biometricOpenSettings) {
    window.Android.biometricOpenSettings();
    biometricResult.value = '📱 Đã mở Settings...';
  } else {
    biometricResult.value = '⚠️ Không hỗ trợ mở Settings';
  }
};

// --- Secondary Button ---
const isSecondaryButtonVisible = useSignal(secondaryButton.isVisible);
onMounted(() => {
  if (secondaryButton.mount.isAvailable()) {
    secondaryButton.mount();
    // Handle Secondary Button click with feedback
    secondaryButton.onClick(() => {
        console.log("Secondary button clicked via SDK");
        if (window.Android) {
            window.Android.showToast("🥈 Đã nhấn nút phụ (Secondary Button)!");
        } else {
            alert("🥈 Đã nhấn nút phụ (Secondary Button)!");
        }
    });
  }

  // Swipe behavior
  if (swipeBehavior.mount.isAvailable()) {
      swipeBehavior.mount();
  }
});

const toggleSecondaryButton = () => {
    if (secondaryButton.isVisible()) {
        secondaryButton.hide();
    } else {
        secondaryButton.setParams({
            text: 'Nút phụ (Secondary)',
            isVisible: true,
            position: 'bottom',
        });
        secondaryButton.show();
    }
};

// --- Swipe Behavior ---
const allowVerticalSwipe = ref(true);
const toggleSwipe = () => {
    // allowVerticalSwipe is already updated by v-model, DO NOT toggle it again here.

    // Try SDK method first
    const sb = swipeBehavior as any;
    try {
        if (allowVerticalSwipe.value) {
            if (sb.enableVerticalSwipe) sb.enableVerticalSwipe();
        } else {
            if (sb.disableVerticalSwipe) sb.disableVerticalSwipe();
        }
    } catch (e) { console.error("Swipe SDK error", e); }

    // Direct Android fallback
    if (window.Android && window.Android.setSwipeEnabled) {
        window.Android.setSwipeEnabled(allowVerticalSwipe.value);
    } else {
        // Fallback alert for testing if no android interface
        if (!window.Android) alert(`Swipe set to: ${allowVerticalSwipe.value}`);
    }
};

// --- Invoice ---
const invoiceSlug = ref('test-invoice-slug');
const invoiceResult = ref('');

// Listen for invoice_closed event from Android
onMounted(() => {
    window.addEventListener('invoice_closed', (e: any) => {
        const detail = e.detail || {};
        const status = detail.status || 'unknown';
        const slug = detail.slug || '';

        if (status === 'paid') {
            invoiceResult.value = `✅ Thanh toán thành công! Invoice: ${slug}`;
            if (window.Android) {
                window.Android.showToast(`💰 Thanh toán Invoice "${slug}" thành công!`);
            }
        } else {
            invoiceResult.value = `❌ Thanh toán thất bại. Status: ${status}`;
        }
    });
});

const openInvoice = () => {
    if (invoiceSlug.value) {
        invoiceResult.value = '⏳ Đang mở Invoice...';

        // 1. Try Android Interface directly (most reliable for native host)
        if (window.Android && window.Android.openInvoice) {
            window.Android.openInvoice(invoiceSlug.value);
            return;
        }

        // 2. Try WebApp object (polyfilled)
        const webApp = (window as any).Telegram?.WebApp;
        if (webApp && webApp.openInvoice) {
            webApp.openInvoice(invoiceSlug.value, (status: string) => {
                if (status === 'paid') {
                    invoiceResult.value = `✅ Thanh toán thành công!`;
                    if (window.Android) {
                        window.Android.showToast('💰 Thanh toán thành công!');
                    } else {
                        alert('💰 Thanh toán thành công!');
                    }
                } else {
                    invoiceResult.value = `❌ Status: ${status}`;
                }
            });
        } else {
            alert('Invoice API not found');
            invoiceResult.value = '';
        }
    } else {
        alert('Vui lòng nhập Invoice Slug');
    }
};

// --- Fullscreen ---
const requestFullscreen = () => {
    // 1. Try Android Interface directly
    if (window.Android && window.Android.setFullscreen) {
        window.Android.setFullscreen(true);
        return;
    }

    const webApp = (window as any).Telegram?.WebApp;
    if (webApp && webApp.requestFullscreen) webApp.requestFullscreen();
};
const exitFullscreen = () => {
    // 1. Try Android Interface directly
    if (window.Android && window.Android.setFullscreen) {
        window.Android.setFullscreen(false);
        return;
    }

    const webApp = (window as any).Telegram?.WebApp;
    if (webApp && webApp.exitFullscreen) webApp.exitFullscreen();
};

// --- Share ---
const shareText = ref('Testing Share Message from Android Host!');
const shareApp = () => {
    // 1. Prioritize Native Share Sheet via shareText
    if (window.Android && window.Android.shareText) {
        window.Android.shareText(shareText.value);
        return;
    }

    // 2. Fallback to Telegram share URL (for browser testing)
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/BotFather')}&text=${encodeURIComponent(shareText.value)}`;
    window.open(url, '_blank');
};

// --- Request Write Access ---
const writeAccessResult = ref('');
const requestWriteAccess = () => {
    writeAccessResult.value = '⏳ Đang yêu cầu quyền gửi tin nhắn...';

    // Try Android Interface
    if (window.Android && window.Android.requestWriteAccess) {
        window.Android.requestWriteAccess();
        return;
    }

    // Fallback for SDK/Polyfill
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp && webApp.requestWriteAccess) {
        webApp.requestWriteAccess((success: boolean) => {
            writeAccessResult.value = success
                ? '✅ Đã được cấp quyền gửi tin nhắn!'
                : '❌ Người dùng từ chối quyền';
        });
    } else {
        // Mock for browser
        setTimeout(() => {
            writeAccessResult.value = '✅ (Mock) Đã được cấp quyền!';
        }, 1000);
    }
};

// Listen for write_access_requested event from Android
onMounted(() => {
    window.addEventListener('write_access_requested', (e: any) => {
        const status = e.detail?.status || 'unknown';
        writeAccessResult.value = status === 'allowed'
            ? '✅ Đã được cấp quyền gửi tin nhắn!'
            : '❌ Người dùng từ chối quyền';
    });
});

// --- Request Contact ---
const contactResult = ref('');
const requestContact = () => {
    contactResult.value = '⏳ Đang yêu cầu số điện thoại...';

    // Try Android Interface
    if (window.Android && window.Android.requestContact) {
        window.Android.requestContact();
        return;
    }

    // Fallback for SDK/Polyfill
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp && webApp.requestContact) {
        webApp.requestContact((success: boolean, contact: any) => {
            if (success && contact) {
                contactResult.value = `✅ SĐT: ${contact.phone_number}, Tên: ${contact.first_name}`;
            } else {
                contactResult.value = '❌ Người dùng từ chối chia sẻ';
            }
        });
    } else {
        // Mock for browser
        setTimeout(() => {
            contactResult.value = '✅ (Mock) SĐT: +84123456789, Tên: Mock User';
        }, 1000);
    }
};

// Listen for phone_requested event from Android
onMounted(() => {
    window.addEventListener('phone_requested', (e: any) => {
        const detail = e.detail || {};
        if (detail.status === 'sent' && detail.contact) {
            contactResult.value = `✅ SĐT: ${detail.contact.phone_number}, Tên: ${detail.contact.first_name}`;
        } else {
            contactResult.value = '❌ Người dùng từ chối chia sẻ';
        }
    });
});

// --- Bottom Bar Color ---
const bottomBarColor = ref('#3390ec');
const setBottomBarColor = (color: string) => {
    bottomBarColor.value = color;

    // Try Android Interface
    if (window.Android && window.Android.setBottomBarColor) {
        window.Android.setBottomBarColor(color);
        return;
    }

    // Fallback for SDK/Polyfill
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp && webApp.setBottomBarColor) {
        webApp.setBottomBarColor(color);
    } else {
        // Mock for browser
        alert(`[Mock] Bottom Bar Color set to: ${color}`);
    }
};

// --- Emoji Status ---
const emojiStatusResult = ref('');
const emojiId = ref('5368324170671202286'); // Example emoji ID

const setEmojiStatus = () => {
    emojiStatusResult.value = '⏳ Đang đặt Emoji Status...';

    // Try Android Interface
    if (window.Android && window.Android.setEmojiStatus) {
        window.Android.setEmojiStatus(emojiId.value, 3600); // 1 hour duration
        return;
    }

    // Fallback for SDK/Polyfill
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp && webApp.setEmojiStatus) {
        webApp.setEmojiStatus(emojiId.value, { duration: 3600 }, (success: boolean) => {
            emojiStatusResult.value = success
                ? '✅ Đã đặt Emoji Status thành công!'
                : '❌ Không thể đặt Emoji Status';
        });
    } else {
        // Mock for browser
        setTimeout(() => {
            emojiStatusResult.value = '✅ (Mock) Đã đặt Emoji Status!';
        }, 1000);
    }
};

// Listen for emoji_status_set event from Android
onMounted(() => {
    window.addEventListener('emoji_status_set', (e: any) => {
        const success = e.detail?.success;
        emojiStatusResult.value = success
            ? '✅ Đã đặt Emoji Status thành công!'
            : '❌ Không thể đặt Emoji Status';
    });
});

// --- Home Screen ---
const homeScreenResult = ref('');

const addToHomeScreen = () => {
    homeScreenResult.value = '⏳ Đang thêm vào Home Screen...';

    // Try Android Interface
    if (window.Android && window.Android.addToHomeScreen) {
        window.Android.addToHomeScreen();
        return;
    }

    // Fallback for SDK/Polyfill
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp && webApp.addToHomeScreen) {
        webApp.addToHomeScreen();
    } else {
        // Mock for browser
        setTimeout(() => {
            homeScreenResult.value = '✅ (Mock) Đã thêm vào Home Screen!';
        }, 1000);
    }
};

// Listen for home_screen_added event from Android
onMounted(() => {
    window.addEventListener('home_screen_added', (e: any) => {
        const status = e.detail?.status;
        homeScreenResult.value = status === 'added'
            ? '✅ Đã thêm vào Home Screen thành công!'
            : `❌ Lỗi: ${status}`;
    });
});

// --- Accelerometer ---
const accelerometerData = ref({ x: 0, y: 0, z: 0 });
const isAccelerometerActive = ref(false);

const startAccelerometer = () => {
    isAccelerometerActive.value = true;

    // Try Android Interface
    if (window.Android && window.Android.startAccelerometer) {
        window.Android.startAccelerometer('ui');
        return;
    }

    // Fallback: Use browser DeviceMotion API
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleDeviceMotion);
    } else {
        // Mock for desktop browser
        const interval = setInterval(() => {
            if (!isAccelerometerActive.value) {
                clearInterval(interval);
                return;
            }
            accelerometerData.value = {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2,
                z: 9.8 + (Math.random() - 0.5) * 0.5
            };
        }, 100);
    }
};

const handleDeviceMotion = (event: DeviceMotionEvent) => {
    if (event.accelerationIncludingGravity) {
        accelerometerData.value = {
            x: event.accelerationIncludingGravity.x || 0,
            y: event.accelerationIncludingGravity.y || 0,
            z: event.accelerationIncludingGravity.z || 0
        };
    }
};

const stopAccelerometer = () => {
    isAccelerometerActive.value = false;

    if (window.Android && window.Android.stopAccelerometer) {
        window.Android.stopAccelerometer();
    }
    window.removeEventListener('devicemotion', handleDeviceMotion);
};

// Listen for accelerometer_changed event from Android
onMounted(() => {
    window.addEventListener('accelerometer_changed', (e: any) => {
        const { x, y, z } = e.detail || {};
        accelerometerData.value = { x: x || 0, y: y || 0, z: z || 0 };
    });
});

// --- Gyroscope ---
const gyroscopeData = ref({ x: 0, y: 0, z: 0 });
const isGyroscopeActive = ref(false);

const startGyroscope = () => {
    isGyroscopeActive.value = true;

    // Try Android Interface
    if (window.Android && window.Android.startGyroscope) {
        window.Android.startGyroscope('ui');
        return;
    }

    // Fallback: Use browser DeviceOrientation API
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
    } else {
        // Mock for desktop browser
        const interval = setInterval(() => {
            if (!isGyroscopeActive.value) {
                clearInterval(interval);
                return;
            }
            gyroscopeData.value = {
                x: (Math.random() - 0.5) * 0.1,
                y: (Math.random() - 0.5) * 0.1,
                z: (Math.random() - 0.5) * 0.1
            };
        }, 100);
    }
};

const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    gyroscopeData.value = {
        x: event.beta || 0,
        y: event.gamma || 0,
        z: event.alpha || 0
    };
};

const stopGyroscope = () => {
    isGyroscopeActive.value = false;

    if (window.Android && window.Android.stopGyroscope) {
        window.Android.stopGyroscope();
    }
    window.removeEventListener('deviceorientation', handleDeviceOrientation);
};

// Listen for gyroscope_changed event from Android
onMounted(() => {
    window.addEventListener('gyroscope_changed', (e: any) => {
        const { x, y, z } = e.detail || {};
        gyroscopeData.value = { x: x || 0, y: y || 0, z: z || 0 };
    });
});

// --- Device Orientation ---
const deviceOrientationData = ref({ alpha: 0, beta: 0, gamma: 0, absolute: false });
const isDeviceOrientationActive = ref(false);

const startDeviceOrientation = () => {
    isDeviceOrientationActive.value = true;

    // Try Android Interface
    if (window.Android && window.Android.startDeviceOrientation) {
        window.Android.startDeviceOrientation('ui', false);
        return;
    }

    // Fallback: Use browser DeviceOrientation API
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation);
    } else {
        // Mock for desktop browser
        const interval = setInterval(() => {
            if (!isDeviceOrientationActive.value) {
                clearInterval(interval);
                return;
            }
            deviceOrientationData.value = {
                alpha: Math.random() * 360,
                beta: (Math.random() - 0.5) * 180,
                gamma: (Math.random() - 0.5) * 90,
                absolute: false
            };
        }, 100);
    }
};

const handleOrientation = (event: DeviceOrientationEvent) => {
    deviceOrientationData.value = {
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
        absolute: event.absolute || false
    };
};

const stopDeviceOrientation = () => {
    isDeviceOrientationActive.value = false;

    if (window.Android && window.Android.stopDeviceOrientation) {
        window.Android.stopDeviceOrientation();
    }
    window.removeEventListener('deviceorientation', handleOrientation);
};

// Listen for device_orientation_changed event from Android
onMounted(() => {
    window.addEventListener('device_orientation_changed', (e: any) => {
        const { alpha, beta, gamma, absolute } = e.detail || {};
        deviceOrientationData.value = {
            alpha: alpha || 0,
            beta: beta || 0,
            gamma: gamma || 0,
            absolute: absolute || false
        };
    });
});

// --- Location Manager ---
const locationData = ref({ latitude: 0, longitude: 0, accuracy: 0 });
const locationError = ref('');
const isLoadingLocation = ref(false);

const openLocationSettings = () => {
    if (window.Android && window.Android.openLocationSettings) {
        window.Android.openLocationSettings();
    } else {
        alert('[Mock] Opening Location Settings would happen on Android');
    }
};

const getCurrentLocation = () => {
    isLoadingLocation.value = true;
    locationError.value = '';

    // Try Android Interface
    if (window.Android && window.Android.getCurrentLocation) {
        window.Android.getCurrentLocation();
        return;
    }

    // Fallback: Use browser Geolocation API
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                locationData.value = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                isLoadingLocation.value = false;
            },
            (error) => {
                locationError.value = `❌ Lỗi: ${error.message}`;
                isLoadingLocation.value = false;
            }
        );
    } else {
        // Mock for desktop
        setTimeout(() => {
            locationData.value = {
                latitude: 10.762622,
                longitude: 106.660172,
                accuracy: 100
            };
            isLoadingLocation.value = false;
        }, 1000);
    }
};

// Listen for location events from Android
onMounted(() => {
    window.addEventListener('location_received', (e: any) => {
        const { latitude, longitude, accuracy } = e.detail || {};
        locationData.value = {
            latitude: latitude || 0,
            longitude: longitude || 0,
            accuracy: accuracy || 0
        };
        isLoadingLocation.value = false;
    });

    window.addEventListener('location_error', (e: any) => {
        locationError.value = `❌ Lỗi: ${e.detail?.error || 'Unknown error'}`;
        isLoadingLocation.value = false;
    });
});

// --- Story Widget ---
const storyMediaUrl = ref('https://picsum.photos/400/600'); // Default sample image
const storyText = ref('Check out my Mini App! 🚀');
const storyWidgetUrl = ref('https://t.me/DuorovChat');
const storyWidgetName = ref('Open Mini App');
const storyResult = ref('');
const isShareingStory = ref(false);

const shareStory = () => {
    isShareingStory.value = true;
    storyResult.value = '⏳ Đang chia sẻ lên Story...';

    // Try Android Interface
    if (window.Android && window.Android.shareStory) {
        window.Android.shareStory(
            storyMediaUrl.value,
            storyText.value,
            storyWidgetUrl.value,
            storyWidgetName.value
        );
        return;
    }

    // Fallback for SDK/Polyfill
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp && webApp.shareToStory) {
        webApp.shareToStory(storyMediaUrl.value, {
            text: storyText.value,
            widget_link: {
                url: storyWidgetUrl.value,
                name: storyWidgetName.value
            }
        });
    } else {
        // Mock for browser
        setTimeout(() => {
            storyResult.value = '✅ (Mock) Đã chia sẻ lên Story!';
            isShareingStory.value = false;
        }, 1000);
    }
};

// Listen for story_shared event from Android
onMounted(() => {
    window.addEventListener('story_shared', (e: any) => {
        const success = e.detail?.success;
        storyResult.value = success
            ? '✅ Đã chia sẻ lên Story thành công!'
            : '❌ Không thể chia sẻ lên Story';
        isShareingStory.value = false;
    });
});

// --- Download File ---
const downloadUrl = ref('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
const downloadFileName = ref('sample.pdf');
const downloadResult = ref('');
const isDownloading = ref(false);

const downloadFile = () => {
    isDownloading.value = true;
    downloadResult.value = '⏳ Đang tải file...';

    // Try Android Interface
    if (window.Android && window.Android.downloadFile) {
        window.Android.downloadFile(downloadUrl.value, downloadFileName.value);
        return;
    }

    // Fallback for browser - create download link
    const link = document.createElement('a');
    link.href = downloadUrl.value;
    link.download = downloadFileName.value;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
        downloadResult.value = '✅ Đã bắt đầu tải file!';
        isDownloading.value = false;
    }, 1000);
};

// Listen for file download events from Android
onMounted(() => {
    window.addEventListener('file_download_started', (e: any) => {
        downloadResult.value = `✅ Đang tải: ${e.detail?.file_name}`;
        isDownloading.value = false;
    });

    window.addEventListener('file_download_complete', (e: any) => {
        downloadResult.value = `✅ Đã tải xong: ${e.detail?.file_name}`;
        isDownloading.value = false;
    });

    window.addEventListener('file_download_error', (e: any) => {
        downloadResult.value = `❌ Lỗi tải file: ${e.detail?.error}`;
        isDownloading.value = false;
    });
});

// --- Open Media Preview ---
const mediaPreviewUrl = ref('https://picsum.photos/800/600');
const mediaPreviewType = ref('photo'); // 'photo' | 'video'

const openMediaPreview = () => {
    // Try Android Interface
    if (window.Android && window.Android.openMediaPreview) {
        window.Android.openMediaPreview(mediaPreviewUrl.value, mediaPreviewType.value);
        return;
    }

    // Fallback for browser - open in new tab
    window.open(mediaPreviewUrl.value, '_blank');
};

// --- Read Text From Clipboard ---
const clipboardText = ref('');
const isReadingClipboard = ref(false);

const readTextFromClipboard = () => {
    isReadingClipboard.value = true;
    clipboardText.value = '⏳ Đang đọc clipboard...';

    // Try Android Interface
    if (window.Android && window.Android.readTextFromClipboard) {
        window.Android.readTextFromClipboard();
        return;
    }

    // Fallback for browser - use Clipboard API
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText()
            .then((text) => {
                clipboardText.value = text || '(Clipboard trống)';
                isReadingClipboard.value = false;
            })
            .catch(() => {
                clipboardText.value = '❌ Không được phép đọc clipboard';
                isReadingClipboard.value = false;
            });
    } else {
        clipboardText.value = '❌ Trình duyệt không hỗ trợ Clipboard API';
        isReadingClipboard.value = false;
    }
};

// Listen for clipboard_text_received event from Android
onMounted(() => {
    window.addEventListener('clipboard_text_received', (e: any) => {
        const data = e.detail?.data;
        if (data !== null) {
            clipboardText.value = data || '(Clipboard trống)';
        } else {
            clipboardText.value = `❌ ${e.detail?.error || 'Không thể đọc clipboard'}`;
        }
        isReadingClipboard.value = false;
    });
});

// --- Send Data (to Bot) ---
const sendDataPayload = ref('{"action":"test","value":123}');
const sendDataResult = ref('');

const sendDataToBot = () => {
    // Try Android Interface
    if (window.Android && window.Android.sendData) {
        window.Android.sendData(sendDataPayload.value);
        sendDataResult.value = '✅ Đã gửi data tới Bot! (App sẽ đóng sau khi gửi)';
        return;
    }

    // Mock for browser
    console.log('[Mock] Send Data to Bot:', sendDataPayload.value);
    sendDataResult.value = `✅ (Mock) Đã gửi: ${sendDataPayload.value}`;
    alert(`[Mock] Đã gửi data tới Bot:\n${sendDataPayload.value}\n\n(Trong Telegram thật, Mini App sẽ đóng sau khi gửi)`);
};

// --- Switch Inline Query ---
const inlineQuery = ref('test query');
const selectedChatTypes = ref(['users', 'groups']);
const chatTypesOptions = ['users', 'bots', 'groups', 'channels'];

const switchInlineQuery = () => {
    // Try Android Interface
    if (window.Android && window.Android.switchInlineQuery) {
        window.Android.switchInlineQuery(inlineQuery.value, JSON.stringify(selectedChatTypes.value));
        return;
    }

    // Mock for browser
    console.log('[Mock] Switch Inline Query:', inlineQuery.value, selectedChatTypes.value);
    alert(`[Mock] Mở inline query:\nQuery: @bot ${inlineQuery.value}\nChat Types: ${selectedChatTypes.value.join(', ')}\n\n(Tính năng này chỉ hoạt động trong Telegram thật)`);
};

// --- Start Param (from initData) ---
const startParam = ref('');

// Get start_param from URL or initData on mount
onMounted(() => {
    // Try to get from URL
    const urlParams = new URLSearchParams(window.location.search);
    startParam.value = urlParams.get('tgWebAppStartParam') || urlParams.get('start_param') || '';

    // Also try from initData if available
    if (initData && initData.startParam) {
        startParam.value = initData.startParam() || startParam.value;
    }
});

const showPopup = async () => {
  try {
    const buttonId = await (popup as any).show({
      title: 'Xác nhận giao dịch',
      message: 'Bạn có chắc chắn muốn thanh toán 100.000đ?',
      buttons: [
        { id: 'Đồng ý', type: 'ok', text: 'Đồng ý' },
        { id: 'Hủy', type: 'cancel', text: 'Hủy' },
      ],
    });
    alert(`Bạn đã bấm nút: ${buttonId}`);
  } catch (e) {
    // Ignore catch
  }
};

const scanQr = () => {
  // Use the raw Telegram WebApp object to bypass SDK wrapper limitations
  const webApp = (window as any).Telegram?.WebApp;
  if (webApp && webApp.showScanQrPopup) {
    webApp.showScanQrPopup({
      text: 'Vui lòng quét bất kỳ mã QR nào để test...'
    }, (text: string) => {
      alert(`Đã quét được: ${text}`);
      return true; // Return true to close the popup handling
    });
  } else {
    alert("Không tìm thấy đối tượng Telegram WebApp!");
  }
};

const changeHeaderColor = (color: string) => {
  const webApp = (window as any).Telegram?.WebApp;
  if (webApp && webApp.setHeaderColor) {
    webApp.setHeaderColor(color);
  } else {
      // Fallback if using sdk directly (though polyfill handles webApp global)
      alert("setHeaderColor not supported in this env");
  }
};
</script>

<template>
  <AppPage title="Home Page" :back="false">
    <p>
      This page is a home page in this boilerplate. You can use the links below to visit other
      pages with their own functionality.
    </p>
    <ul class="index-page__links">
      <li v-for="route in nonIndexRoutes" :key="route.name" class="index-page__link-item">
        <AppLink class="index-page__link" :to="{ name: route.name }">
          <i v-if="route.meta?.icon" class="index-page__link-icon">
            <component :is="route.meta.icon" />
          </i>
          {{ route.meta!.title }}
        </AppLink>
      </li>
    </ul>

    <div v-if="isAndroidHost" class="native-controls">
      <h3>🤖 Android Native Controls</h3>
      <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Các chức năng native: Toast, Haptic Feedback (rung), Quét QR, Đổi màu Header, và đóng App</p>
      <div class="button-group">
        <button @click="showNativeToast">Toast "Hello"</button>
        <button @click="() => triggerImpact('light')">Rung Nhẹ</button>
        <button @click="() => triggerImpact('heavy')">Rung Mạnh</button>
        <button @click="() => triggerNotification('success')">Rung Success</button>
        <button @click="() => triggerNotification('error')">Rung Error</button>
        <button @click="triggerSelection">Rung Selection</button>
        <button @click="scanQr">📷 Quét QRCode</button>
        <div class="test-row">
           <button @click="() => changeHeaderColor('#ff0000')">Header Đỏ</button>
           <button @click="() => changeHeaderColor('#008000')">Header Xanh</button>
           <button @click="() => changeHeaderColor('secondary_bg_color')">Header Theme</button>
        </div>
        <button @click="closeNativeApp" class="btn-danger">Đóng App</button>
      </div>
    </div>

    <!-- Secondary Button Demo -->
    <div class="native-controls">
        <h3>🥈 Secondary Button</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Nút hành động thứ hai, thường đặt cạnh Main Button để cung cấp thêm lựa chọn</p>
        <div class="button-group">
            <button @click="toggleSecondaryButton">
                {{ isSecondaryButtonVisible ? 'Ẩn' : 'Hiện' }} Nút Phụ
            </button>
        </div>
    </div>

    <!-- Swipe Behavior Demo -->
    <div class="native-controls">
        <h3>👆 Swipe Behavior</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Kiểm soát việc vuốt dọc để đóng Mini App (chặn khi đang nhập form, thanh toán...)</p>
        <label style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" v-model="allowVerticalSwipe" @change="toggleSwipe" />
            Cho phép vuốt dọc để đóng
        </label>
    </div>

    <!-- Invoice Demo -->
    <div class="native-controls">
        <h3>💰 Invoice (Fake)</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Mở Invoice thanh toán qua Telegram Payments (Stars). Trong demo này là mock.</p>
        <div class="storage-inputs">
            <input v-model="invoiceSlug" placeholder="Invoice Slug" class="storage-input" />
        </div>
        <div class="button-group">
            <button @click="openInvoice">Mở Invoice</button>
        </div>
        <div v-if="invoiceResult" class="storage-result">
            {{ invoiceResult }}
        </div>
    </div>

    <!-- Fullscreen Demo -->
    <div class="native-controls">
        <h3>🖥️ Fullscreen</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Ẩn status bar và toolbar để Mini App chiếm toàn bộ màn hình (cho game, video...)</p>
        <div class="button-group">
            <button @click="requestFullscreen">Vào Fullscreen</button>
            <button @click="exitFullscreen">Thoát Fullscreen</button>
        </div>
    </div>

    <!-- Share Demo -->
    <div class="native-controls">
        <h3>📢 Share Message</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Mở hộp thoại chia sẻ native của hệ thống để gửi link/tin nhắn</p>
        <div class="storage-inputs">
            <input v-model="shareText" placeholder="Tin nhắn muốn share" class="storage-input" />
        </div>
        <div class="button-group">
            <button @click="shareApp">Share App</button>
        </div>
    </div>

    <!-- Request Write Access Demo -->
    <div class="native-controls">
        <h3>✍️ Request Write Access</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Yêu cầu quyền để Bot gửi tin nhắn cho user</p>
        <div class="button-group">
            <button @click="requestWriteAccess">Yêu cầu quyền gửi tin</button>
        </div>
        <div v-if="writeAccessResult" class="storage-result">
            {{ writeAccessResult }}
        </div>
    </div>

    <!-- Request Contact Demo -->
    <div class="native-controls">
        <h3>📞 Request Contact</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Yêu cầu user chia sẻ số điện thoại</p>
        <div class="button-group">
            <button @click="requestContact">Yêu cầu số điện thoại</button>
        </div>
        <div v-if="contactResult" class="storage-result">
            {{ contactResult }}
        </div>
    </div>

    <!-- Bottom Bar Color Demo -->
    <div class="native-controls">
        <h3>🎨 Bottom Bar Color</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Đổi màu thanh bottom bar (navigation bar)</p>
        <div class="button-group">
            <button @click="setBottomBarColor('#3390ec')">🔵 Xanh dương</button>
            <button @click="setBottomBarColor('#ff5722')">🟠 Cam</button>
            <button @click="setBottomBarColor('#4caf50')">🟢 Xanh lá</button>
            <button @click="setBottomBarColor('#9c27b0')">🟣 Tím</button>
        </div>
        <div class="storage-result">
            Màu hiện tại: {{ bottomBarColor }}
        </div>
    </div>

    <!-- Emoji Status Demo -->
    <div class="native-controls">
        <h3>😀 Emoji Status</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Đặt emoji status cho user (yêu cầu Telegram Premium)</p>
        <div class="storage-inputs">
            <input v-model="emojiId" placeholder="Custom Emoji ID" class="storage-input" />
        </div>
        <div class="button-group">
            <button @click="setEmojiStatus">Đặt Emoji Status</button>
        </div>
        <div v-if="emojiStatusResult" class="storage-result">
            {{ emojiStatusResult }}
        </div>
    </div>

    <!-- Home Screen Demo -->
    <div class="native-controls">
        <h3>🏠 Add to Home Screen</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Thêm Mini App vào màn hình chính</p>
        <div class="button-group">
            <button @click="addToHomeScreen">➕ Thêm vào Home Screen</button>
        </div>
        <div v-if="homeScreenResult" class="storage-result">
            {{ homeScreenResult }}
        </div>
    </div>

    <!-- Accelerometer Demo -->
    <div class="native-controls">
        <h3>📱 Accelerometer</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Đọc dữ liệu cảm biến gia tốc</p>
        <div class="button-group">
            <button @click="startAccelerometer" :disabled="isAccelerometerActive">▶️ Start</button>
            <button @click="stopAccelerometer" :disabled="!isAccelerometerActive">⏹️ Stop</button>
        </div>
        <div class="storage-result" style="font-family: monospace;">
            X: {{ accelerometerData.x.toFixed(3) }}<br/>
            Y: {{ accelerometerData.y.toFixed(3) }}<br/>
            Z: {{ accelerometerData.z.toFixed(3) }}
        </div>
    </div>

    <!-- Gyroscope Demo -->
    <div class="native-controls">
        <h3>🌀 Gyroscope</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Đọc dữ liệu cảm biến con quay hồi chuyển</p>
        <div class="button-group">
            <button @click="startGyroscope" :disabled="isGyroscopeActive">▶️ Start</button>
            <button @click="stopGyroscope" :disabled="!isGyroscopeActive">⏹️ Stop</button>
        </div>
        <div class="storage-result" style="font-family: monospace;">
            X (Beta): {{ gyroscopeData.x.toFixed(3) }}<br/>
            Y (Gamma): {{ gyroscopeData.y.toFixed(3) }}<br/>
            Z (Alpha): {{ gyroscopeData.z.toFixed(3) }}
        </div>
    </div>

    <!-- Device Orientation Demo -->
    <div class="native-controls">
        <h3>🧭 Device Orientation</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Đọc hướng thiết bị (la bàn số)</p>
        <div class="button-group">
            <button @click="startDeviceOrientation" :disabled="isDeviceOrientationActive">▶️ Start</button>
            <button @click="stopDeviceOrientation" :disabled="!isDeviceOrientationActive">⏹️ Stop</button>
        </div>
        <div class="storage-result" style="font-family: monospace;">
            Alpha (Hướng): {{ deviceOrientationData.alpha.toFixed(1) }}°<br/>
            Beta (Nghiêng trước/sau): {{ deviceOrientationData.beta.toFixed(1) }}°<br/>
            Gamma (Nghiêng trái/phải): {{ deviceOrientationData.gamma.toFixed(1) }}°<br/>
            Absolute: {{ deviceOrientationData.absolute ? 'Có' : 'Không' }}
        </div>
    </div>

    <!-- Location Manager Demo -->
    <div class="native-controls">
        <h3>📍 Location Manager</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Lấy vị trí GPS hiện tại</p>
        <div class="button-group">
            <button @click="openLocationSettings">⚙️ Cài đặt</button>
            <button @click="getCurrentLocation" :disabled="isLoadingLocation">
                {{ isLoadingLocation ? '⏳ Đang lấy...' : '📍 Lấy vị trí' }}
            </button>
        </div>
        <div class="storage-result" style="font-family: monospace;">
            <template v-if="locationError">{{ locationError }}</template>
            <template v-else>
                Latitude: {{ locationData.latitude.toFixed(6) }}<br/>
                Longitude: {{ locationData.longitude.toFixed(6) }}<br/>
                Độ chính xác: {{ locationData.accuracy.toFixed(0) }}m
            </template>
        </div>
    </div>

    <!-- Story Widget Demo -->
    <div class="native-controls">
        <h3>📖 Story Widget</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Chia sẻ nội dung lên Telegram Stories</p>
        <div class="storage-inputs">
            <input v-model="storyMediaUrl" placeholder="URL ảnh/video" class="storage-input" />
            <input v-model="storyText" placeholder="Caption text" class="storage-input" style="margin-top: 8px;" />
            <input v-model="storyWidgetUrl" placeholder="Widget Link URL" class="storage-input" style="margin-top: 8px;" />
            <input v-model="storyWidgetName" placeholder="Widget Link Name" class="storage-input" style="margin-top: 8px;" />
        </div>
        <div class="button-group">
            <button @click="shareStory" :disabled="isShareingStory">
                {{ isShareingStory ? '⏳ Đang chia sẻ...' : '📤 Share to Story' }}
            </button>
        </div>
        <div v-if="storyResult" class="storage-result">
            {{ storyResult }}
        </div>
    </div>

    <!-- Download File Demo -->
    <div class="native-controls">
        <h3>📥 Download File</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Tải file từ URL về thiết bị</p>
        <div class="storage-inputs">
            <input v-model="downloadUrl" placeholder="URL file" class="storage-input" />
            <input v-model="downloadFileName" placeholder="Tên file" class="storage-input" style="margin-top: 8px;" />
        </div>
        <div class="button-group">
            <button @click="downloadFile" :disabled="isDownloading">
                {{ isDownloading ? '⏳ Đang tải...' : '📥 Download' }}
            </button>
        </div>
        <div v-if="downloadResult" class="storage-result">
            {{ downloadResult }}
        </div>
    </div>

    <!-- Media Preview Demo -->
    <div class="native-controls">
        <h3>🖼️ Media Preview</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Xem trước ảnh/video trong viewer toàn màn hình</p>
        <div class="storage-inputs">
            <input v-model="mediaPreviewUrl" placeholder="URL media" class="storage-input" />
            <select v-model="mediaPreviewType" class="storage-input" style="margin-top: 8px;">
                <option value="photo">Ảnh (photo)</option>
                <option value="video">Video</option>
            </select>
        </div>
        <div class="button-group">
            <button @click="openMediaPreview">🖼️ Xem Media</button>
        </div>
    </div>

    <!-- Read Clipboard Demo -->
    <div class="native-controls">
        <h3>📋 Read Clipboard</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Đọc nội dung text từ clipboard</p>
        <div class="button-group">
            <button @click="readTextFromClipboard" :disabled="isReadingClipboard">
                {{ isReadingClipboard ? '⏳ Đang đọc...' : '📋 Đọc Clipboard' }}
            </button>
        </div>
        <div v-if="clipboardText" class="storage-result">
            {{ clipboardText }}
        </div>
    </div>

    <!-- Send Data Demo -->
    <div class="native-controls">
        <h3>📤 Send Data (to Bot)</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Gửi dữ liệu trực tiếp tới Bot qua Telegram</p>
        <div class="storage-inputs">
            <textarea v-model="sendDataPayload" placeholder='{"key": "value"}' class="storage-input" rows="3" style="resize: vertical;"></textarea>
        </div>
        <div class="button-group">
            <button @click="sendDataToBot">📤 Gửi Data</button>
        </div>
        <div v-if="sendDataResult" class="storage-result">
            {{ sendDataResult }}
        </div>
    </div>

    <!-- Switch Inline Query Demo -->
    <div class="native-controls">
        <h3>🔍 Switch Inline Query</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Mở inline query @bot trong chat khác</p>
        <div class="storage-inputs">
            <input v-model="inlineQuery" placeholder="Inline query text" class="storage-input" />
            <div style="margin-top: 8px;">
                <label style="font-size: 12px;">Chat Types:</label>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;">
                    <label v-for="type in chatTypesOptions" :key="type" style="display: flex; align-items: center; gap: 4px;">
                        <input type="checkbox" :value="type" v-model="selectedChatTypes" />
                        {{ type }}
                    </label>
                </div>
            </div>
        </div>
        <div class="button-group">
            <button @click="switchInlineQuery">🔍 Mở Inline Query</button>
        </div>
    </div>

    <!-- Start Param Demo -->
    <div class="native-controls">
        <h3>🚀 Start Param</h3>
        <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Tham số khởi động từ deep link (t.me/bot?startapp=xxx)</p>
        <div class="storage-result" style="font-family: monospace;">
            {{ startParam ? `Start Param: ${startParam}` : '(Không có start param)' }}
        </div>
        <p style="font-size: 11px; color: var(--tg-theme-hint-color); margin-top: 8px;">
            Test bằng cách thêm <code>?tgWebAppStartParam=test123</code> vào URL
        </p>
    </div>

    <!-- Main Button Demo -->
    <div class="native-controls">
      <h3>🚀 Main Button</h3>
      <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Nút hành động chính hiển thị ở cuối màn hình (VD: Thanh toán, Gửi, Xác nhận...)</p>
      <div class="button-group">
        <button @click="toggleMainButton">
          {{ isMainButtonVisible ? 'Ẩn' : 'Hiện' }} Nút Chính
        </button>
        <button @click="updateMainButtonText">Đổi tên "Thanh Toán"</button>
        <button @click="updateMainButtonColor">Đổi màu Hồng</button>
        <button @click="enableMainButton">✅ Enable</button>
        <button @click="disableMainButton">🚫 Disable</button>
        <button @click="showProgress">⏳ Loading</button>
        <button @click="hideProgress">✓ Done</button>
      </div>
    </div>

    <!-- Popup Demo -->
    <div class="native-controls">
      <h3>💬 Popup Demo</h3>
      <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Hộp thoại xác nhận với các nút tùy chọn (OK/Cancel/Destructive)</p>
      <div class="button-group">
        <button @click="showPopup">Hiện Popup Chuẩn</button>
      </div>
    </div>

    <!-- Closing Behavior Demo -->
    <div class="native-controls">
      <h3>🚪 Closing Behavior</h3>
      <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Bật/tắt xác nhận trước khi đóng Mini App (để tránh mất dữ liệu)</p>
      <div class="button-group">
        <button @click="enableCloseConfirmation">🔒 Bật Xác nhận đóng</button>
        <button @click="disableCloseConfirmation">🔓 Tắt Xác nhận đóng</button>
      </div>
    </div>

    <!-- Viewport Demo -->
    <div class="native-controls">
      <h3>📐 Viewport</h3>
      <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Mở rộng viewport để Mini App chiếm toàn bộ màn hình có thể</p>
      <div class="viewport-info">
        <p>Height: <strong>{{ viewportHeight }}px</strong></p>
        <p>Expanded: <strong>{{ viewportIsExpanded ? '✅ Yes' : '❌ No' }}</strong></p>
      </div>
      <div class="button-group">
        <button @click="expandMiniApp">🔲 Expand Full Screen</button>
      </div>
    </div>

    <!-- Cloud Storage Demo -->
    <div class="native-controls">
      <h3>☁️ Cloud Storage</h3>
      <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Lưu dữ liệu key-value lên cloud Telegram, tự động đồng bộ giữa các thiết bị</p>
      <div class="storage-inputs">
        <input v-model="cloudStorageKey" placeholder="Key" class="storage-input" />
        <input v-model="cloudStorageValue" placeholder="Value" class="storage-input" />
      </div>
      <div class="button-group">
        <button @click="saveToCloud">💾 Lưu</button>
        <button @click="loadFromCloud">📖 Đọc</button>
        <button @click="deleteFromCloud">🗑️ Xóa</button>
        <button @click="getAllKeys">🔑 Lấy Keys</button>
      </div>
      <div v-if="cloudStorageResult" class="storage-result">
        {{ cloudStorageResult }}
      </div>
    </div>

    <!-- Biometric Demo -->
    <div class="native-controls">
      <h3>🔐 Biometric Authentication</h3>
      <p style="font-size: 12px; color: var(--tg-theme-hint-color);">Xác thực bằng vân tay hoặc FaceID để bảo vệ dữ liệu nhạy cảm</p>
      <div class="button-group">
        <button @click="checkBiometric">🔍 Kiểm tra</button>
        <button @click="authenticateBiometric">👆 Xác thực</button>
        <button @click="openBiometricSettings">⚙️ Settings</button>
      </div>
      <div v-if="biometricResult" class="storage-result">
        {{ biometricResult }}
      </div>
    </div>
  </AppPage>
</template>

<style scoped>
.native-controls {
  margin-top: 20px;
  padding: 15px;
  background: var(--tg-theme-secondary-bg-color, #f0f0f0);
  border-radius: 12px;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

button {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: var(--tg-theme-button-color, #3390ec);
  color: var(--tg-theme-button-text-color, #ffffff);
  cursor: pointer;
  font-weight: bold;
}

button:active {
  opacity: 0.8;
}

.btn-danger {
  background: var(--tg-theme-destructive-text-color, #ff3b30);
}

.viewport-info {
  margin-bottom: 10px;
  padding: 10px;
  background: var(--tg-theme-bg-color, #ffffff);
  border-radius: 8px;
}

.viewport-info p {
  margin: 5px 0;
}

.storage-inputs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.storage-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--tg-theme-hint-color, #ccc);
  border-radius: 8px;
  background: var(--tg-theme-bg-color, #ffffff);
  color: var(--tg-theme-text-color, #000000);
  font-size: 14px;
}

.storage-result {
  margin-top: 10px;
  padding: 10px;
  background: var(--tg-theme-bg-color, #ffffff);
  border-radius: 8px;
  font-family: monospace;
}

.index-page__links {
  list-style: none;
  padding-left: 0;
}

.index-page__link {
  font-weight: bold;
  display: inline-flex;
  gap: 5px;
}

.index-page__link-item + .index-page__link-item {
  margin-top: 10px;
}

.index-page__link-icon {
  width: 20px;
  display: block;
}

.index-page__link-icon svg {
  display: block;
}
</style>
