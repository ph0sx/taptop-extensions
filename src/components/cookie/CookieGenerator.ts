import { html, type TemplateResult } from 'lit';
import { query } from 'lit/decorators.js';
import { BaseGenerator } from '../base/BaseGenerator.js';
import type { Input } from '../../ui/Input/Input';
import type { GeneratorConfig } from '../base/BaseGenerator';

// Импорты для UI компонентов
import '../../ui/Generator/Generator';
import '../../ui/GeneratorSection/GeneratorSection';
import '../../ui/Input/Input';

export default class CookieGenerator extends BaseGenerator {
  // DOM элементы
  @query('#expiry-days')
  private expiryDaysInput?: Input;

  constructor() {
    super();
  }

  // Рендер содержимого компонента
  protected renderContent(): TemplateResult {
    return html`
      <ttg-generator>
        <ttg-generator-section label="Основные настройки">
          <ttg-input
            id="expiry-days"
            label="Срок хранения (дней)"
            type="number"
            tooltip="Количество дней, в течение которых будет сохраняться согласие пользователя на использование cookie"
            required
            min="1"
            max="365"
            .value="30"
          >
          </ttg-input>
        </ttg-generator-section>
      </ttg-generator>
    `;
  }

  // Сбор данных из формы
  protected collectData(): GeneratorConfig | null {
    const expiryDays = parseInt(this.expiryDaysInput?.value || '30', 10);

    if (isNaN(expiryDays) || expiryDays < 1 || expiryDays > 365) {
      console.error('Некорректное значение срока хранения');
      return null;
    }

    return {
      cookieName: 'cookieAgreement',
      expiryDays,
      closeBtnClass: 'pop-up__inside-close-button',
      overlayClass: 'pop-up__overlay',
    };
  }

  // Генерация кода для cookie баннера
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
