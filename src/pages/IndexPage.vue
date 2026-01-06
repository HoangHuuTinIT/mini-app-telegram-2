```vue
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { routes } from '@/router';
import { mainButton, useSignal, popup, hapticFeedback, miniApp, initData, settingsButton, closingBehavior, viewport, cloudStorage, type User } from '@tma.js/sdk-vue';
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

    <!-- Main Button Demo -->
    <div class="native-controls">
      <h3>🚀 Main Button</h3>
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
      <div class="button-group">
        <button @click="showPopup">Hiện Popup Chuẩn</button>
      </div>
    </div>

    <!-- Closing Behavior Demo -->
    <div class="native-controls">
      <h3>🚪 Closing Behavior</h3>
      <div class="button-group">
        <button @click="enableCloseConfirmation">🔒 Bật Xác nhận đóng</button>
        <button @click="disableCloseConfirmation">🔓 Tắt Xác nhận đóng</button>
      </div>
    </div>

    <!-- Viewport Demo -->
    <div class="native-controls">
      <h3>📐 Viewport</h3>
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
