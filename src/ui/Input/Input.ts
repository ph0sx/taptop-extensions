import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import inputStyles from './Input.styles.css';
import '../Question/Question';
import { generateUniqueId } from '../../utils/generate-id';

/**
 * Презентационный компонент ввода
 *
 * @element ttg-input
 *
 * @attr {string} label - Текст метки поля
 * @attr {string} value - Значение поля
 * @attr {string} type - Тип поля ввода (text, number, email, etc.)
 * @attr {string} error - Текст ошибки валидации (отображается, если передан)
 * @attr {boolean} disabled - Отключено ли поле
 * @attr {string} placeholder - Текст подсказки
 * @attr {boolean} required - Обязательно ли поле для заполнения
 * @attr {string} tooltip - Текст всплывающей подсказки
 * @attr {string} min - Минимальное значение
 * @attr {string} max - Максимальное значение
 * @attr {boolean} show-action-button - Показывать ли кнопку действия
 * @attr {string} action-tooltip - Подсказка для кнопки действия
 *
 * @fires update-value - Событие изменения значения с новым значением в detail.value
 * @fires field-blur - Событие потери фокуса
 * @fires action-click - Событие клика по кнопке действия
 */
export class Input extends LitElement {
  // Реактивные свойства
  @property({ type: String })
  accessor label = '';

  @property({ type: String })
  accessor value = '';

  @property({ type: String })
  accessor type = 'text';

  @property({ type: String })
  accessor error = '';

  @property({ type: Boolean })
  accessor disabled = false;

  @property({ type: String })
  accessor placeholder = '';

  @property({ type: Boolean })
  accessor required = false;

  @property({ type: String })
  accessor tooltip = '';

  @property({ type: String })
  accessor min = '';

  @property({ type: String })
  accessor max = '';

  @property({ type: Boolean, attribute: 'show-action-button' })
  accessor showActionButton = false;

  @property({ type: String, attribute: 'action-tooltip' })
  accessor actionTooltip = '';

  @state()
  private accessor touched = false;

  private uniqueId = generateUniqueId('ttg-input');

  /**
   * Получает ID для внутреннего input элемента
   * Использует переданный ID компонента или fallback на uniqueId
   */
  private getInputId(): string {
    return this.id || this.uniqueId;
  }

  static styles = [unsafeCSS(baseStyles), unsafeCSS(inputStyles)];

  constructor() {
    super();
  }

  /**
   * Рендерит SVG иконку поиска для кнопки действия
   * @returns Шаблон SVG иконки
   */
  private renderSearchIcon(): TemplateResult {
    return html`
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
          stroke="#6B7280"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;
  }

  /**
   * Рендерит SVG иконку ошибки
   * @returns Шаблон SVG иконки
   */
  private renderErrorIcon(): TemplateResult {
    return html`
      <svg
        class="ttg-input-error-icon"
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
   * @returns Шаблон tooltip или пустая строка
   */
  private renderTooltip(): TemplateResult | string {
    return this.tooltip
      ? html`<ttg-question tooltip="${this.tooltip}" style="height: 16px;"></ttg-question>`
      : '';
  }

  /**
   * Вычисляет CSS классы для обёртки компонента
   * @returns Строка с CSS классами
   */
  private getWrapperClasses(): string {
    return `ttg-input-wrapper${this.error ? ' error' : ''}`;
  }

  /**
   * Вычисляет CSS классы для поля ввода
   * @returns Строка с CSS классами
   */
  private getInputFieldClasses(): string {
    return `ttg-input-field${this.showActionButton ? ' has-action-button' : ''}`;
  }

  /**
   * Основной метод рендеринга компонента
   * @returns Шаблон компонента
   */
  render(): TemplateResult {
    return html`
      <div class="${this.getWrapperClasses()}">
        <label for="${this.getInputId()}">
          <span class="ttg-input-label">${this.label}</span>
          ${this.required ? html`<span class="ttg-input-required">*</span>` : ''}
          ${this.renderTooltip()}
        </label>
        <div class="${this.getInputFieldClasses()}">
          ${this.renderInput()} ${this.renderActionButton()}
        </div>
        ${this.renderError()}
      </div>
    `;
  }

  /**
   * Рендерит поле ввода
   * @returns Шаблон поля ввода
   */
  private renderInput(): TemplateResult {
    return html`
      <input
        id="${this.getInputId()}"
        class="ttg-input-control"
        type="${this.type}"
        .value="${this.value}"
        placeholder="${this.placeholder}"
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        min="${this.min}"
        max="${this.max}"
        @input="${this.handleInput}"
        @blur="${this.handleBlur}"
      />
    `;
  }

  /**
   * Рендерит кнопку действия если необходимо
   * @returns Шаблон кнопки или пустая строка
   */
  private renderActionButton(): TemplateResult | string {
    return this.showActionButton
      ? html`
          <button
            class="ttg-input-action-button"
            type="button"
            title="${this.actionTooltip}"
            @click="${this.handleActionClick}"
          >
            ${this.renderSearchIcon()}
          </button>
        `
      : '';
  }

  /**
   * Рендерит блок ошибки если есть ошибка
   * @returns Шаблон ошибки или пустая строка
   */
  private renderError(): TemplateResult | string {
    return this.error
      ? html`
          <div class="ttg-input-error">
            ${this.renderErrorIcon()}
            <span class="ttg-input-error-text">${this.error}</span>
          </div>
        `
      : '';
  }

  /**
   * Проверяет, является ли элемент HTML input элементом
   * @param element - Проверяемый элемент
   * @returns true если элемент является HTMLInputElement
   */
  private isInputElement(element: EventTarget | null): element is HTMLInputElement {
    return element instanceof HTMLInputElement;
  }

  /**
   * Обработчик события ввода текста
   * @param e - Событие ввода
   */
  private handleInput = (e: Event) => {
    if (!this.isInputElement(e.target)) {
      return;
    }

    const target = e.target;
    const newValue = target.value;

    // Отправляем событие с новым значением для родительского компонента
    this.dispatchEvent(
      new CustomEvent('update-value', {
        detail: { value: newValue },
        bubbles: true,
        composed: true,
      }),
    );
  };

  /**
   * Обработчик события потери фокуса
   */
  private handleBlur = () => {
    this.touched = true;

    // Сообщаем родительскому компоненту о потере фокуса
    this.dispatchEvent(
      new CustomEvent('field-blur', {
        bubbles: true,
        composed: true,
      }),
    );
  };

  /**
   * Обработчик клика по кнопке действия
   */
  private handleActionClick = () => {
    this.dispatchEvent(
      new CustomEvent('action-click', {
        bubbles: true,
        composed: true,
      }),
    );
  };
}

customElements.define('ttg-input', Input);
