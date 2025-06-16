import type { Input } from '../../ui/Input/Input';
import '../../ui/Input/Input';
import type { GeneratorConfig, GeneratorElements } from '../base/BaseGenerator';
import { BaseGenerator } from '../base/BaseGenerator';
import { styles } from './CookieGenerator.styles';
import { template } from './CookieGenerator.template';

interface CookieGeneratorElements extends GeneratorElements {
  expiryDays: Input | null;
  popupClass: Input | null;
  consentBtnClass: Input | null;
  rejectBtnClass: Input | null;
}

export default class CookieGenerator extends BaseGenerator {
  protected elements = {} as CookieGeneratorElements;

  constructor() {
    super();
    this.config = {
      cookieName: 'cookieAgreement',
      expiryDays: 30,
      popupClass: 'popup-cookie',
      consentBtnClass: 'button-cookie',
      rejectBtnClass: 'button-no-cookie',
      closeBtnClass: 'pop-up__inside-close-button',
      overlayClass: 'pop-up__overlay',
    };
  }

  protected getStyles(): string {
    return styles;
  }

  protected getTemplate(): string {
    return template;
  }

  protected findElements(): void {
    super.findElements();
    this.elements.expiryDays = this.shadow.querySelector<Input>('#expiry-days');
    this.elements.popupClass = this.shadow.querySelector<Input>('#popup-class');
    this.elements.consentBtnClass = this.shadow.querySelector<Input>('#consent-btn-class');
    this.elements.rejectBtnClass = this.shadow.querySelector<Input>('#reject-btn-class');
  }

  protected setInitialState(): void {
    if (this.elements.expiryDays) {
      this.elements.expiryDays.value = String(this.config.expiryDays);
    }
    if (this.elements.popupClass) {
      this.elements.popupClass.value = this.config.popupClass;
    }
    if (this.elements.consentBtnClass) {
      this.elements.consentBtnClass.value = this.config.consentBtnClass;
    }
    if (this.elements.rejectBtnClass) {
      this.elements.rejectBtnClass.value = this.config.rejectBtnClass;
    }
  }

  protected collectData(): GeneratorConfig | null {
    const { cookieName, closeBtnClass, overlayClass } = this.config;

    return {
      cookieName,
      expiryDays: parseInt(this.elements.expiryDays?.value || '30', 10) || this.config.expiryDays,
      popupClass: this.elements.popupClass?.value || this.config.popupClass,
      consentBtnClass: this.elements.consentBtnClass?.value || this.config.consentBtnClass,
      rejectBtnClass: this.elements.rejectBtnClass?.value || this.config.rejectBtnClass,
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
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? decodeURIComponent(match[2]) : undefined;
        },
        set: (name, value, options = {}) => {
            options = { path: '/', ...options };
            if (options.expires) {
            const date = new Date();
            date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
            options.expires = date.toUTCString();
        }

        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
            for (const [key, val] of Object.entries(options)) {
            updatedCookie += '; ' + key + (val !== true ? '=' + val : '');
            }
            document.cookie = updatedCookie;
        }
        };

        const ui = {
        banner: document.querySelector(".${settings.popupClass}"),
        consentBtn: document.querySelector(".${settings.consentBtnClass}"),
        rejectBtn: document.querySelector(".${settings.rejectBtnClass}"),
        closeBtn: document.querySelector(".${settings.closeBtnClass}"),
        overlay: document.querySelector(".${settings.overlayClass}")
        };

        const hideBanner = () => {
        if (ui.banner) ui.banner.style.setProperty('display', 'none', 'important');
        };

        if (cookies.get("${settings.cookieName}") === undefined && ui.banner) {
        ui.banner.style.display = "flex";
        ui.closeBtn?.addEventListener("click", hideBanner);
        ui.overlay?.addEventListener("click", hideBanner);
        ui.consentBtn?.addEventListener("click", () => {
            cookies.set("${settings.cookieName}", "true", { expires: ${settings.expiryDays} });
            hideBanner();
        });
        ui.rejectBtn?.addEventListener("click", () => {
            cookies.set("${settings.cookieName}", "false", { expires: ${settings.expiryDays} });
            hideBanner();
        });

        })
      </script>
    `;
  }
}

// Регистрируем кастомный элемент в браузере
customElements.define('cookie-generator', CookieGenerator);
