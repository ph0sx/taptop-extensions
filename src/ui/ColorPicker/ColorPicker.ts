import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import colorPickerStyles from './ColorPicker.styles.css';
import '../Question/Question';
import { generateUniqueId } from '../../utils/generate-id';
import { ValidationController } from '../../controllers/ValidationController.js';
import type { ValidationFieldConfig, ValidatableElement } from '../../types/validation.js';
import Pickr from '@simonwep/pickr';

/**
 * ColorPicker компонент с интегрированной валидацией
 *
 * @element ttg-color-picker
 *
 * @attr {string} label - Текст метки поля
 * @attr {string} value - Значение цвета в формате HEX с альфа-каналом (например, #FFFFFF или #FFFFFF80)
 * @attr {string} error - Текст ошибки валидации (отображается, если передан)
 * @attr {boolean} disabled - Отключено ли поле
 * @attr {boolean} required - Обязательно ли поле для заполнения
 * @attr {string} tooltip - Текст всплывающей подсказки
 *
 * @fires update-value - Событие изменения значения с новым значением в detail.value
 * @fires field-blur - Событие потери фокуса
 */
export class ColorPicker extends LitElement implements ValidatableElement {
  @property({ type: String })
  accessor label = '';

  @property({ type: String })
  accessor value = '#FFFFFF';

  @property({ type: String })
  accessor error = '';

  @property({ type: Boolean })
  accessor disabled = false;

  @property({ type: Boolean })
  accessor required = false;

  @property({ type: String })
  accessor tooltip = '';

  @state()
  private accessor touched = false;

  @state()
  private accessor hexValue = 'FFFFFF';

  @state()
  private accessor opacity = 100;

  @query('.ttg-color-picker-swatch')
  private swatchElement?: HTMLElement;

  @query('.picker-container')
  private pickerContainer?: HTMLElement;

  private pickrInstance?: Pickr;
  private uniqueId = generateUniqueId('ttg-color-picker');
  private validationController?: ValidationController;

  // ValidatableElement interface properties
  get isValid(): boolean {
    return !this.error && this.isValidHex(this.hexValue);
  }

  get hasError(): boolean {
    return !!this.error;
  }

  // Стили темы Pickr (nano theme)
  static pickrNanoStyles = `
    /*! Pickr 1.9.1 MIT | https://github.com/Simonwep/pickr */
    .pickr{position:relative;overflow:visible;transform:translateY(0)}.pickr *{box-sizing:border-box;outline:none;border:none;-webkit-appearance:none}.pickr .pcr-button{position:relative;height:2em;width:2em;padding:.5em;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue",Arial,sans-serif;border-radius:.15em;background:url("data:image/svg+xml;utf8, <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50' stroke='%2342445A' stroke-width='5px' stroke-linecap='round'><path d='M45,45L5,5'></path><path d='M45,5L5,45'></path></svg>") no-repeat center;background-size:0;transition:all .3s}.pickr .pcr-button::before{position:absolute;content:"";top:0;left:0;width:100%;height:100%;background:url("data:image/svg+xml;utf8, <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'><path fill='white' d='M1,0H2V1H1V0ZM0,1H1V2H0V1Z'/><path fill='gray' d='M0,0H1V1H0V0ZM1,1H2V2H1V1Z'/></svg>");background-size:.5em;border-radius:.15em;z-index:-1}.pickr .pcr-button::before{z-index:initial}.pickr .pcr-button::after{position:absolute;content:"";top:0;left:0;height:100%;width:100%;transition:background .3s;background:var(--pcr-color);border-radius:.15em}.pickr .pcr-button.clear{background-size:70%}.pickr .pcr-button.clear::before{opacity:0}.pickr .pcr-button.clear:focus{box-shadow:0 0 0 1px rgba(255,255,255,.85),0 0 0 3px var(--pcr-color)}.pickr .pcr-button.disabled{cursor:not-allowed}.pickr *,.pcr-app *{box-sizing:border-box;outline:none;border:none;-webkit-appearance:none}.pickr input:focus,.pickr input.pcr-active,.pickr button:focus,.pickr button.pcr-active,.pcr-app input:focus,.pcr-app input.pcr-active,.pcr-app button:focus,.pcr-app button.pcr-active{box-shadow:0 0 0 1px rgba(255,255,255,.85),0 0 0 3px var(--pcr-color)}.pickr .pcr-palette,.pickr .pcr-slider,.pcr-app .pcr-palette,.pcr-app .pcr-slider{transition:box-shadow .3s}.pickr .pcr-palette:focus,.pickr .pcr-slider:focus,.pcr-app .pcr-palette:focus,.pcr-app .pcr-slider:focus{box-shadow:0 0 0 1px rgba(255,255,255,.85),0 0 0 3px rgba(0,0,0,.25)}.pcr-app{position:fixed;display:flex;flex-direction:column;z-index:10000;border-radius:.1em;background:#fff;opacity:0;visibility:hidden;transition:opacity .3s,visibility 0s .3s;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue",Arial,sans-serif;box-shadow:0 .15em 1.5em 0 rgba(0,0,0,.1),0 0 1em 0 rgba(0,0,0,.03);left:0;top:0}.pcr-app.visible{transition:opacity .3s;visibility:visible;opacity:1}.pcr-app .pcr-swatches{display:flex;flex-wrap:wrap;margin-top:.75em}.pcr-app .pcr-swatches.pcr-last{margin:0}@supports(display: grid){.pcr-app .pcr-swatches{display:grid;align-items:center;grid-template-columns:repeat(auto-fit, 1.75em)}}.pcr-app .pcr-swatches>button{font-size:1em;position:relative;width:calc(1.75em - 5px);height:calc(1.75em - 5px);border-radius:.15em;cursor:pointer;margin:2.5px;flex-shrink:0;justify-self:center;transition:all .15s;overflow:hidden;background:rgba(0,0,0,0);z-index:1}.pcr-app .pcr-swatches>button::before{position:absolute;content:"";top:0;left:0;width:100%;height:100%;background:url("data:image/svg+xml;utf8, <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'><path fill='white' d='M1,0H2V1H1V0ZM0,1H1V2H0V1Z'/><path fill='gray' d='M0,0H1V1H0V0ZM1,1H2V2H1V1Z'/></svg>");background-size:6px;border-radius:.15em;z-index:-1}.pcr-app .pcr-swatches>button::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:var(--pcr-color);border:1px solid rgba(0,0,0,.05);border-radius:.15em;box-sizing:border-box}.pcr-app .pcr-swatches>button:hover{filter:brightness(1.05)}.pcr-app .pcr-swatches>button:not(.pcr-active){box-shadow:none}.pcr-app .pcr-interaction{display:flex;flex-wrap:wrap;align-items:center;margin:0 -0.2em 0 -0.2em}.pcr-app .pcr-interaction>*{margin:0 .2em}.pcr-app .pcr-interaction input{letter-spacing:.07em;font-size:.75em;text-align:center;cursor:pointer;color:#75797e;background:#f1f3f4;border-radius:.15em;transition:all .15s;padding:.45em .5em;margin-top:.75em}.pcr-app .pcr-interaction input:hover{filter:brightness(0.975)}.pcr-app .pcr-interaction input:focus{box-shadow:0 0 0 1px rgba(255,255,255,.85),0 0 0 3px rgba(66,133,244,.75)}.pcr-app .pcr-interaction .pcr-result{color:#75797e;text-align:left;flex:1 1 8em;min-width:8em;transition:all .2s;border-radius:.15em;background:#f1f3f4;cursor:text}.pcr-app .pcr-interaction .pcr-result::-moz-selection{background:#4285f4;color:#fff}.pcr-app .pcr-interaction .pcr-result::selection{background:#4285f4;color:#fff}.pcr-app .pcr-interaction .pcr-type.active{color:#fff;background:#4285f4}.pcr-app .pcr-interaction .pcr-save,.pcr-app .pcr-interaction .pcr-cancel,.pcr-app .pcr-interaction .pcr-clear{color:#fff;width:auto}.pcr-app .pcr-interaction .pcr-save,.pcr-app .pcr-interaction .pcr-cancel,.pcr-app .pcr-interaction .pcr-clear{color:#fff}.pcr-app .pcr-interaction .pcr-save:hover,.pcr-app .pcr-interaction .pcr-cancel:hover,.pcr-app .pcr-interaction .pcr-clear:hover{filter:brightness(0.925)}.pcr-app .pcr-interaction .pcr-save{background:#4285f4}.pcr-app .pcr-interaction .pcr-clear,.pcr-app .pcr-interaction .pcr-cancel{background:#f44250}.pcr-app .pcr-interaction .pcr-clear:focus,.pcr-app .pcr-interaction .pcr-cancel:focus{box-shadow:0 0 0 1px rgba(255,255,255,.85),0 0 0 3px rgba(244,66,80,.75)}.pcr-app .pcr-selection .pcr-picker{position:absolute;height:18px;width:18px;border:2px solid #fff;border-radius:100%;-webkit-user-select:none;-moz-user-select:none;user-select:none}.pcr-app .pcr-selection .pcr-color-palette,.pcr-app .pcr-selection .pcr-color-chooser,.pcr-app .pcr-selection .pcr-color-opacity{position:relative;-webkit-user-select:none;-moz-user-select:none;user-select:none;display:flex;flex-direction:column;cursor:grab;cursor:-webkit-grab}.pcr-app .pcr-selection .pcr-color-palette:active,.pcr-app .pcr-selection .pcr-color-chooser:active,.pcr-app .pcr-selection .pcr-color-opacity:active{cursor:grabbing;cursor:-webkit-grabbing}.pcr-app[data-theme=nano]{width:14.25em;max-width:95vw}.pcr-app[data-theme=nano] .pcr-swatches{margin-top:.6em;padding:0 .6em}.pcr-app[data-theme=nano] .pcr-interaction{padding:0 .6em .6em .6em}.pcr-app[data-theme=nano] .pcr-selection{display:grid;grid-gap:.6em;grid-template-columns:1fr 4fr;grid-template-rows:5fr auto auto;align-items:center;height:10.5em;width:100%;align-self:flex-start}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-preview{grid-area:2/1/4/1;height:100%;width:100%;display:flex;flex-direction:row;justify-content:center;margin-left:.6em}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-preview .pcr-last-color{display:none}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-preview .pcr-current-color{position:relative;background:var(--pcr-color);width:2em;height:2em;border-radius:50em;overflow:hidden}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-preview .pcr-current-color::before{position:absolute;content:"";top:0;left:0;width:100%;height:100%;background:url("data:image/svg+xml;utf8, <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'><path fill='white' d='M1,0H2V1H1V0ZM0,1H1V2H0V1Z'/><path fill='gray' d='M0,0H1V1H0V0ZM1,1H2V2H1V1Z'/></svg>");background-size:.5em;border-radius:.15em;z-index:-1}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-palette{grid-area:1/1/2/3;width:100%;height:100%;z-index:1}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-palette .pcr-palette{border-radius:.15em;width:100%;height:100%}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-palette .pcr-palette::before{position:absolute;content:"";top:0;left:0;width:100%;height:100%;background:url("data:image/svg+xml;utf8, <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'><path fill='white' d='M1,0H2V1H1V0ZM0,1H1V2H0V1Z'/><path fill='gray' d='M0,0H1V1H0V0ZM1,1H2V2H1V1Z'/></svg>");background-size:.5em;border-radius:.15em;z-index:-1}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-chooser{grid-area:2/2/2/2}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-opacity{grid-area:3/2/3/2}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-chooser,.pcr-app[data-theme=nano] .pcr-selection .pcr-color-opacity{height:.5em;margin:0 .6em}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-chooser .pcr-picker,.pcr-app[data-theme=nano] .pcr-selection .pcr-color-opacity .pcr-picker{top:50%;transform:translateY(-50%)}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-chooser .pcr-slider,.pcr-app[data-theme=nano] .pcr-selection .pcr-color-opacity .pcr-slider{flex-grow:1;border-radius:50em}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-chooser .pcr-slider{background:linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(0, 100%, 50%))}.pcr-app[data-theme=nano] .pcr-selection .pcr-color-opacity .pcr-slider{background:linear-gradient(to right, transparent, black),url("data:image/svg+xml;utf8, <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'><path fill='white' d='M1,0H2V1H1V0ZM0,1H1V2H0V1Z'/><path fill='gray' d='M0,0H1V1H0V0ZM1,1H2V2H1V1Z'/></svg>");background-size:100%,.25em}
  `;

  static styles = [
    unsafeCSS(baseStyles),
    unsafeCSS(colorPickerStyles),
    unsafeCSS(ColorPicker.pickrNanoStyles),
  ];

  constructor() {
    super();
    this.parseValue();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.initializeValidation();
  }

  firstUpdated(): void {
    this.initializePickr();
  }

  disconnectedCallback(): void {
    this.destroyPickr();
    super.disconnectedCallback();
  }

  /**
   * Инициализирует валидацию если компонент включен в форму с ValidationController
   */
  private initializeValidation(): void {
    if (!this.id) {
      this.id = this.uniqueId;
    }

    // Ищем ValidationController в родительских элементах
    let parent = this.parentElement;
    while (parent) {
      if (parent.shadowRoot) {
        const controllers = (parent as unknown as { _controllers?: unknown[] })._controllers;
        if (controllers) {
          const validationController = controllers.find(
            (c: unknown) => c instanceof ValidationController,
          );
          if (validationController) {
            this.validationController = validationController;
            this.registerWithValidationController();
            break;
          }
        }
      }
      parent = parent.parentElement;
    }
  }

  /**
   * Регистрирует компонент в ValidationController
   */
  private registerWithValidationController(): void {
    if (!this.validationController) return;

    const fieldConfig: ValidationFieldConfig = {
      id: this.id,
      rules: this.required
        ? [
            { type: 'required', message: 'Выберите цвет' },
            {
              type: 'pattern',
              options: { pattern: /^#[0-9A-Fa-f]{6,8}$/ },
              message: 'Цвет должен быть в формате HEX (#RRGGBB или #RRGGBBAA)',
            },
          ]
        : [
            {
              type: 'pattern',
              options: { pattern: /^#[0-9A-Fa-f]{6,8}$/ },
              message: 'Цвет должен быть в формате HEX (#RRGGBB или #RRGGBBAA)',
            },
          ],
      validateOnBlur: true,
      validateOnInput: false,
    };

    this.validationController.registerField(fieldConfig, this.value);
  }

  /**
   * Получает ID для компонента
   */
  private getPickerId(): string {
    return this.id || this.uniqueId;
  }

  /**
   * Парсит значение value в hex и opacity
   */
  private parseValue(): void {
    if (!this.value || !this.value.startsWith('#')) {
      this.hexValue = 'FFFFFF';
      this.opacity = 100;
      return;
    }

    const hex = this.value.slice(1);

    if (hex.length === 6) {
      this.hexValue = hex.toUpperCase();
      this.opacity = 100;
    } else if (hex.length === 8) {
      this.hexValue = hex.slice(0, 6).toUpperCase();
      const alpha = parseInt(hex.slice(6, 8), 16);
      this.opacity = Math.round((alpha / 255) * 100);
    } else {
      this.hexValue = 'FFFFFF';
      this.opacity = 100;
    }
  }

  /**
   * Инициализирует Pickr
   */
  private initializePickr(): void {
    if (!this.swatchElement || !this.pickerContainer || this.disabled) return;

    try {
      // Используем статический импорт Pickr
      if (!Pickr || typeof Pickr.create !== 'function') {
        console.error('Failed to load Pickr library - constructor not found');
        return;
      }

      this.pickrInstance = Pickr.create({
        el: this.swatchElement,
        theme: 'nano',
        useAsButton: true,
        container: this.pickerContainer,
        default: `#${this.hexValue}${this.getAlphaHex()}`,
        comparison: false,
        lockOpacity: false, // Разрешаем изменение прозрачности
        components: {
          preview: true, // Показываем превью для лучшего UX
          opacity: true, // Включаем слайдер прозрачности
          hue: true,
          interaction: {
            hex: false,
            rgba: false,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: false,
            clear: false,
            save: false,
          },
        },
      });

      this.pickrInstance
        .on('change', (color: Pickr.HSVaColor) => {
          // Обновляем только внутреннее состояние в реальном времени
          this.updateInternalStateFromPickr(color);
        })
        .on('hide', () => {
          // При закрытии Pickr обновляем визуальное состояние и отправляем события
          const currentColor = this.pickrInstance?.getColor();
          if (currentColor) {
            this.updateInternalStateFromPickr(currentColor);
            this.updateVisualStateFromPickr();
          }
          this.handleBlur();
        });
    } catch (error) {
      console.error('Failed to initialize Pickr:', error);
    }
  }

  /**
   * Уничтожает Pickr инстанс
   */
  private destroyPickr(): void {
    if (this.pickrInstance) {
      this.pickrInstance.destroy();
      this.pickrInstance = undefined;
    }
  }

  /**
   * Обновляет внутренние значения из Pickr (без визуального обновления)
   */
  private updateInternalStateFromPickr(color: Pickr.HSVaColor): void {
    const rgba = color.toRGBA();
    const hexArray = color.toHEXA();

    // Используем toString() для получения строкового представления HEX
    const hexString = hexArray.toString();
    const alpha = rgba[3];

    // Извлекаем HEX без символа '#', обрезаем до 6 символов и приводим к верхнему регистру
    const newHexValue = hexString.replace('#', '').slice(0, 6).toUpperCase();
    const newOpacity = Math.round(alpha * 100);

    // Обновляем только внутреннее состояние (без отправки событий)
    this.hexValue = newHexValue;
    this.opacity = newOpacity;
  }

  /**
   * Обновляет визуальное состояние и отправляет события (только при закрытии Pickr)
   */
  private updateVisualStateFromPickr(): void {
    // Обновляем визуальное отображение и отправляем событие изменения
    this.updateValue();
    this.requestUpdate(); // Принудительно обновляем компонент для отображения новой ikonki
  }

  /**
   * Конвертирует opacity (0-100%) в hex alpha (00-FF)
   */
  private getAlphaHex(): string {
    return Math.round((this.opacity / 100) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  }

  /**
   * Формирует итоговое значение и отправляет событие
   * Возвращает полный RGBA формат #RRGGBBAA с прозрачностью
   */
  private updateValue(): void {
    const alphaHex = this.getAlphaHex();
    const newValue = `#${this.hexValue}${alphaHex}`;

    this.dispatchEvent(
      new CustomEvent('update-value', {
        detail: { value: newValue },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Валидирует HEX значение
   */
  private isValidHex(hex: string): boolean {
    return /^[0-9A-Fa-f]{6}$/.test(hex);
  }

  /**
   * Обработчик ввода HEX
   */
  private handleHexInput = (e: Event) => {
    if (!this.isInputElement(e.target)) return;

    let inputValue = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();

    if (inputValue.length > 6) {
      inputValue = inputValue.slice(0, 6);
    }

    e.target.value = inputValue;

    if (this.isValidHex(inputValue)) {
      this.hexValue = inputValue;
      this.updateValue();
    }
  };

  /**
   * Обработчик потери фокуса
   */
  private handleBlur = () => {
    this.touched = true;

    // Уведомляем ValidationController о потере фокуса
    if (this.validationController) {
      this.validationController.touchField(this.id);
    }

    this.dispatchEvent(
      new CustomEvent('field-blur', {
        bubbles: true,
        composed: true,
      }),
    );
  };

  /**
   * Проверяет, является ли элемент input элементом
   */
  private isInputElement(element: EventTarget | null): element is HTMLInputElement {
    return element instanceof HTMLInputElement;
  }

  /**
   * Рендерит SVG иконку ошибки
   */
  private renderErrorIcon(): TemplateResult {
    return html`
      <svg
        class="ttg-color-picker-error-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M2.5 10C2.5 5.85787 5.85787 2.5 10 2.5C14.1422 2.5 17.5 5.85787 17.5 10C17.5 14.1422 14.1422 17.5 10 17.5C5.85787 17.5 2.5 14.1422 2.5 10ZM10 5.98837C10.289 5.98837 10.5233 6.22264 10.5233 6.51163V10.6977C10.5233 10.9867 10.289 11.2209 10 11.2209C9.71102 11.2209 9.47674 10.9867 9.47674 10.6977V6.51163C9.47674 6.22264 9.71102 5.98837 10 5.98837ZM10.3959 13.8378C10.5893 13.623 10.5718 13.2921 10.357 13.0988C10.1422 12.9055 9.81135 12.9228 9.61802 13.1377L9.61105 13.1454C9.41772 13.3602 9.43516 13.691 9.64998 13.8844C9.86479 14.0777 10.1956 14.0603 10.389 13.8455L10.3959 13.8378Z"
          fill="#FF2B71"
        />
      </svg>
    `;
  }

  /**
   * Рендерит tooltip компонент если задан
   */
  private renderTooltip(): TemplateResult | string {
    return this.tooltip
      ? html`<ttg-question tooltip="${this.tooltip}" style="height: 16px;"></ttg-question>`
      : '';
  }

  /**
   * Вычисляет CSS классы для обёртки компонента
   */
  private getWrapperClasses(): string {
    return `ttg-color-picker-wrapper${this.error ? ' error' : ''}${this.disabled ? ' disabled' : ''}`;
  }

  /**
   * Рендерит блок ошибки если есть ошибка
   */
  private renderError(): TemplateResult | string {
    return this.error
      ? html`
          <div class="ttg-color-picker-error">
            ${this.renderErrorIcon()}
            <span class="ttg-color-picker-error-text">${this.error}</span>
          </div>
        `
      : '';
  }

  render(): TemplateResult {
    return html`
      <div class="${this.getWrapperClasses()}">
        <label for="${this.getPickerId()}">
          <span class="ttg-color-picker-label">${this.label}</span>
          ${this.required ? html`<span class="ttg-color-picker-required">*</span>` : ''}
          ${this.renderTooltip()}
        </label>
        <div class="ttg-color-picker-field">
          <div
            class="ttg-color-picker-swatch"
            style="background-color: #${this.hexValue}; opacity: ${this.opacity / 100}"
          ></div>
          <input
            class="ttg-color-picker-hex-input"
            type="text"
            .value="${this.hexValue}"
            placeholder="FFFFFF"
            maxlength="6"
            ?disabled="${this.disabled}"
            @input="${this.handleHexInput}"
            @blur="${this.handleBlur}"
          />
          <span class="ttg-color-picker-opacity">${this.opacity}%</span>
        </div>

        <!-- Контейнер для палитры Pickr (рендерится внутри Shadow DOM) -->
        <div class="picker-container"></div>

        ${this.renderError()}
      </div>
    `;
  }

  /**
   * ValidatableElement interface methods
   */
  validate(): boolean {
    if (this.required && (!this.value || this.value === '#FFFFFF')) {
      this.setError('Выберите цвет');
      return false;
    }

    if (this.value && !this.isValidHex(this.hexValue)) {
      this.setError('Введите корректное HEX значение');
      return false;
    }

    this.clearError();
    return true;
  }

  setError(error: string): void {
    this.error = error;
  }

  clearError(): void {
    this.error = '';
  }

  /**
   * Обновляет компонент при изменении value извне
   */
  async updated(changedProperties: Map<string, unknown>): Promise<void> {
    if (changedProperties.has('value')) {
      this.parseValue();

      // Уведомляем ValidationController об изменении значения
      if (this.validationController) {
        this.validationController.updateFieldValue(this.id, this.value);
      }
    }

    if (changedProperties.has('disabled')) {
      if (this.disabled) {
        this.destroyPickr();
      } else {
        this.initializePickr();
      }
    }

    if (changedProperties.has('required')) {
      // Перерегистрируем поле с новыми правилами валидации
      if (this.validationController) {
        this.validationController.unregisterField(this.id);
        this.registerWithValidationController();
      }
    }
  }
}

customElements.define('ttg-color-picker', ColorPicker);
