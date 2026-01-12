/**
 * Kiểm tra môi trường Telegram Mini App
 */
export function isTMA(): boolean {
  return typeof (window as any).TelegramWebviewProxy?.postEvent === 'function';
}
