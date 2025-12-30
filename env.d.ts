/// <reference types="vite/client" />

export { };

declare global {
    interface Window {
        Android?: {
            showToast(message: string): void;
            vibrate(): void;
            closeApp(): void;
        };
    }
}
