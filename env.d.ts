/// <reference types="vite/client" />

export { };

declare global {
  interface Window {
    Android?: {
      showToast(message: string): void;
      vibrate(): void;
      closeApp(): void;
      setMainButtonText(text: string): void;
      setMainButtonVisible(isVisible: boolean): void;
      setMainButtonColor(color: string): void;
      setMainButtonEnabled(enabled: boolean): void;
      setMainButtonProgress(isVisible: boolean): void;
      openPopup(title: string, message: string, buttonsJson: string): void;
      hapticFeedback(type: string, style: string): void;
      requestTheme(): void;
      openLink(url: string): void;
      openTelegramLink(url: string): void;
      scanQrCode(): void;
      setBackButtonVisible(visible: boolean): void;
      setHeaderColor(color: string): void;
      setSettingsButtonVisible(visible: boolean): void;
      setClosingConfirmation(needConfirmation: boolean): void;
      expandViewport(): void;
      // Cloud Storage methods
      cloudStorageSetItem(key: string, value: string): void;
      cloudStorageGetItem(key: string): string;
      cloudStorageRemoveItem(key: string): void;
      cloudStorageGetKeys(): string;  // Returns JSON array of keys
      // Biometric methods
      biometricInit(): string;  // Returns JSON with biometric info
      biometricAuthenticate(reason: string): void;
      biometricOpenSettings(): void;
      // Secondary Button
      setSecondaryButtonText(text: string): void;
      setSecondaryButtonVisible(visible: boolean): void;
      setSecondaryButtonColor(color: string): void;
      setSecondaryButtonEnabled(enabled: boolean): void;
      setSecondaryButtonProgress(visible: boolean): void;
      setSecondaryButtonPosition(position: string): void; // 'left', 'right', 'top', 'bottom'
      // Swipe Behavior
      setSwipeEnabled(enabled: boolean): void;
      // Invoice
      openInvoice(slug: string): void;
      // Fullscreen
      setFullscreen(fullscreen: boolean): void;
      // Share
      shareText(text: string): void;
      // Request Write Access (permission for bot to send messages)
      requestWriteAccess(): void;
      // Request Contact (get user's phone number)
      requestContact(): void;
      // Bottom Bar Color
      setBottomBarColor(color: string): void;
      // Emoji Status
      setEmojiStatus(emojiId: string, duration?: number): void;
      // Home Screen
      addToHomeScreen(): void;
      checkHomeScreenStatus(): string; // Returns JSON with status
      // Accelerometer
      startAccelerometer(refreshRate: string): void; // 'default', 'ui', 'game', 'fastest'
      stopAccelerometer(): void;
      // Gyroscope
      startGyroscope(refreshRate: string): void;
      stopGyroscope(): void;
      // Device Orientation
      startDeviceOrientation(refreshRate: string, needAbsolute?: boolean): void;
      stopDeviceOrientation(): void;
      // Location Manager
      openLocationSettings(): void;
      getCurrentLocation(): void;
      // Story Widget
      shareStory(mediaUrl: string, text?: string, widgetLinkUrl?: string, widgetLinkName?: string): void;
      // Download File
      downloadFile(url: string, fileName: string): void;
      // Open Media Preview
      openMediaPreview(url: string, type: string): void; // type: 'photo' | 'video'
      // Read Text From Clipboard
      readTextFromClipboard(): void; // Result returned via clipboard_text_received event
      // Send Data (to bot via Telegram)
      sendData(data: string): void;
      // Switch Inline Query (open inline query in chat)
      switchInlineQuery(query: string, chatTypes?: string): void; // chatTypes: JSON array of 'users', 'bots', 'groups', 'channels'
    };
    onAndroidPopupClosed(button_id: string): void;
    onAndroidQrScanned(content: string): void; // Callback for QR Scan result
    updateTheme(themeParamsJson: string): void;
    onBiometricResult(success: boolean, token: string): void;  // Callback for biometric result
  }
}
