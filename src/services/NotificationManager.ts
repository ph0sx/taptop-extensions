export interface NotificationConfig {
  popupSelector?: string;
  acceptButtonSelector?: string;
  closeButtonSelector?: string;
  contentSelector?: string;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private config: Required<NotificationConfig>;

  private constructor(config: NotificationConfig = {}) {
    this.config = {
      popupSelector: config.popupSelector ?? '.pop-up-success',
      acceptButtonSelector: config.acceptButtonSelector ?? '[data-popup-accept-btn]',
      closeButtonSelector: config.closeButtonSelector ?? '[data-popup-close-btn]',
      contentSelector: config.contentSelector ?? '.pop-up__content',
    };
  }

  static getInstance(config?: NotificationConfig): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager(config);
    }
    return NotificationManager.instance;
  }

  // Показ popup успеха
  showSuccess(message = 'Код скопирован в буфер обмена!'): void {
    const successPopup = document.querySelector<HTMLElement>(this.config.popupSelector);
    const popupAcceptBtn = document.querySelector<HTMLElement>(this.config.acceptButtonSelector);
    const popupCloseBtn = document.querySelector<HTMLElement>(this.config.closeButtonSelector);
    const popupContent = successPopup?.querySelector<HTMLElement>(this.config.contentSelector);

    if (!successPopup) {
      alert(message);
      return;
    }

    const hidePopup = () => {
      successPopup.style.display = 'none';
    };

    // Обработчики кнопок
    if (popupAcceptBtn) {
      popupAcceptBtn.removeEventListener('click', hidePopup);
      popupAcceptBtn.addEventListener('click', hidePopup);
    }

    if (popupCloseBtn) {
      popupCloseBtn.removeEventListener('click', hidePopup);
      popupCloseBtn.addEventListener('click', hidePopup);
    }

    // Клик по оверлею
    const overlayClickHandler = (event: Event) => {
      if (popupContent && !popupContent.contains(event.target as Node)) {
        hidePopup();
      } else if (!popupContent && event.target === successPopup) {
        hidePopup();
      }
    };

    successPopup.removeEventListener('click', overlayClickHandler);
    successPopup.addEventListener('click', overlayClickHandler);

    successPopup.style.display = 'flex';
  }

  // Обновление конфигурации
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
