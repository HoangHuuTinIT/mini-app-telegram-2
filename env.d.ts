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
    };
    onAndroidPopupClosed(button_id: string): void;
    onAndroidQrScanned(content: string): void; // Callback for QR Scan result
    updateTheme(themeParamsJson: string): void;
  }
}
