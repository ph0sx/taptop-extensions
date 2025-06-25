import type { Input } from '../../ui/Input/Input';
import type { GeneratorConfig, GeneratorElements } from '../base/BaseGenerator';
import { BaseGenerator } from '../base/BaseGenerator';
import { initGlobalStyles } from '../../utils/global-styles';
import cookieGeneratorStyles from './CookieGenerator.styles.css';
import { template } from './CookieGenerator.template';

interface CookieGeneratorElements extends GeneratorElements {
  expiryDays: Input | null;
}

export default class CookieGenerator extends BaseGenerator {
  protected elements = {} as CookieGeneratorElements;

  constructor() {
    super();
    // Инициализируем глобальные стили при создании компонента
    initGlobalStyles();
    this.config = {
      cookieName: 'cookieAgreement',
      expiryDays: 30,
      closeBtnClass: 'pop-up__inside-close-button',
      overlayClass: 'pop-up__overlay',
    };
  }

  protected getStyles(): string {
    return cookieGeneratorStyles;
  }

  protected getTemplate(): string {
    return template;
  }

  protected findElements(): void {
    super.findElements();
    this.elements.expiryDays = this.shadow.querySelector<Input>('#expiry-days');
  }

  protected setInitialState(): void {
    if (this.elements.expiryDays) {
      this.elements.expiryDays.value = String(this.config.expiryDays);
    }
  }

  protected collectData(): GeneratorConfig | null {
    const { cookieName, closeBtnClass, overlayClass } = this.config;

    return {
      cookieName,
      expiryDays: parseInt(this.elements.expiryDays?.value || '30', 10) || this.config.expiryDays,
      closeBtnClass,
      overlayClass,
    };
  }

  protected generateCode(settings: GeneratorConfig): string {
    return /* html */ `
<script>
        document.addEventListener('DOMContentLoaded', () => {
          const cookies = {
            get: (name) => {
              const value = '; ' + document.cookie;
              const parts = value.split('; ' + name + '=');
              if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
              return undefined;
            },

            set: (name, value, options = {}) => {
              options = { path: '/', ...options };
              if (options.expires) {
                const date = new Date();
                date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
                options.expires = date.toUTCString();
              }

              let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

              for (const [key, val] of Object.entries(options)) {
                updatedCookie += ';' + key + (val !== true ? '=' + val : '');
              }
              document.cookie = updatedCookie;
            },
          };

          const ui = {
            banner: document.querySelector('[data-cookie-banner]'),
            consentBtn: document.querySelector('[data-cookie-consent="accept"]'),
            rejectBtn: document.querySelector('[data-cookie-consent="reject"]'),
            closeBtn: document.querySelector('.${settings.closeBtnClass}'),
            overlay: document.querySelector('.${settings.overlayClass}'),
          };

          const hideBanner = () => {
            if (ui.banner) ui.banner.style.setProperty('display', 'none', 'important');
          };

          if (cookies.get('${settings.cookieName}') === undefined && ui.banner) {
            ui.banner.style.display = 'flex';

            ui.closeBtn?.addEventListener('click', hideBanner);
            ui.overlay?.addEventListener('click', hideBanner);

            ui.consentBtn?.addEventListener('click', () => {
              cookies.set('${settings.cookieName}', 'true', { expires: ${settings.expiryDays} });
              hideBanner();
            });

            ui.rejectBtn?.addEventListener('click', () => {
              cookies.set('${settings.cookieName}', 'false', { expires: ${settings.expiryDays} });
              hideBanner();
            });
          }
        });
      </script>
    `;
  }
}

// Регистрируем кастомный элемент в браузере
customElements.define('cookie-generator', CookieGenerator);
