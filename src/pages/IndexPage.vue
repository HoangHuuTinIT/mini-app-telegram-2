```vue
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { routes } from '@/router';
import { mainButton, useSignal, popup, hapticFeedback, miniApp, initData, settingsButton, type User } from '@tma.js/sdk-vue';
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
      </div>
    </div>

    <!-- Popup Demo -->
    <div class="native-controls">
      <h3>💬 Popup Demo</h3>
      <div class="button-group">
        <button @click="showPopup">Hiện Popup Chuẩn</button>
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
