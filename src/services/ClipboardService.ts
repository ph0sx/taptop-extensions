export class ClipboardService {
  private static instance: ClipboardService;

  private constructor() {}

  static getInstance(): ClipboardService {
    if (!ClipboardService.instance) {
      ClipboardService.instance = new ClipboardService();
    }
    return ClipboardService.instance;
  }

  // Копирование в буфер обмена с fallback
  async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      console.warn('Код скопирован в буфер обмена');
    } catch {
      this.fallbackCopy(text);
    }
  }

  // Fallback для старых браузеров
  private fallbackCopy(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    try {
      textarea.select();
      const successCopied = document.execCommand('copy');

      if (!successCopied) {
        throw new Error('Не удалось скопировать код в буфер обмена');
      }
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
