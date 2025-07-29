import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import dropdownStyles from './Dropdown.styles.css';
import '../Question/Question';
import { generateUniqueId } from '../../utils/generate-id';
import type { ValidatableElement, ValidationRuleConfig } from '../../types/validation.js';

export interface DropdownOption {
  value: string;
  text: string;
}

/**
 * Компонент выпадающего списка с валидацией
 *
 * @element ttg-dropdown
 *
 * @attr {string} label - Текст метки поля
 * @attr {string} value - Выбранное значение
 * @attr {string} error - Текст ошибки валидации
 * @attr {boolean} disabled - Отключено ли поле
 * @attr {string} placeholder - Текст заглушки
 * @attr {boolean} required - Обязательно ли поле для заполнения
 * @attr {string} tooltip - Текст всплывающей подсказки
 * @attr {string} options-json - JSON строка с опциями
 *
 * @fires change - Событие изменения значения
 * @fires validation-change - Событие изменения состояния валидации
 */
export class Dropdown extends LitElement implements ValidatableElement {
  // Реактивные свойства
  @property({ type: String })
  accessor label = '';

  @property({ type: String })
  accessor value = '';

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

  @property({ type: String, attribute: 'options-json' })
  accessor optionsJson = '';

  @property({ type: Boolean, attribute: 'enable-search' })
  accessor enableSearch = false;

  @property({ type: String, attribute: 'search-placeholder' })
  accessor searchPlaceholder = 'Поиск...';

  // Внутреннее состояние
  @state()
  private accessor touched = false;

  @state()
  private accessor options: DropdownOption[] = [];

  @state()
  private accessor filteredOptions: DropdownOption[] = [];

  @state()
  private accessor searchValue = '';

  @state()
  private accessor isOpen = false;

  @state()
  private accessor highlightedIndex = -1;

  @query('.ttg-dropdown-control')
  private selectElement?: HTMLSelectElement;

  @query('.ttg-dropdown-search')
  private searchElement?: HTMLInputElement;

  @query('.ttg-dropdown-options')
  private optionsElement?: HTMLElement;

  private uniqueId = generateUniqueId('ttg-dropdown');

  // Поддержка ValidationController
  get hasError(): boolean {
    return this.error !== '';
  }

  /**
   * Устанавливает ошибку валидации (вызывается ValidationController)
   */
  setError(error: string): void {
    this.error = error;
  }

  /**
   * Очищает ошибку валидации (вызывается ValidationController)
   */
  clearError(): void {
    this.error = '';
  }

  /**
   * Возвращает правила валидации на основе атрибутов
   */
  getValidationRules(): ValidationRuleConfig[] {
    const rules: ValidationRuleConfig[] = [];

    if (this.required) {
      rules.push({ type: 'required' });
    }

    return rules;
  }

  /**
   * Устанавливает опции для выпадающего списка
   */
  setOptions(newOptions: DropdownOption[]): void {
    this.options = [...newOptions];
  }

  static styles = [unsafeCSS(baseStyles), unsafeCSS(dropdownStyles)];

  constructor() {
    super();
  }

  /**
   * Обновляет опции при изменении optionsJson и фильтрует их по поиску
   */
  willUpdate(changedProperties: Map<string | number | symbol, unknown>): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has('optionsJson') && this.optionsJson) {
      try {
        const parsedOptions = JSON.parse(this.optionsJson);
        if (Array.isArray(parsedOptions) && this.isValidOptionsArray(parsedOptions)) {
          this.options = parsedOptions;
        }
      } catch (e) {
        console.error('Invalid options format:', e);
        this.options = [];
      }
    }

    // Обновляем отфильтрованные опции при изменении options или searchValue
    if (changedProperties.has('options') || changedProperties.has('searchValue')) {
      this.updateFilteredOptions();
    }
  }

  /**
   * Проверяет корректность структуры опций
   */
  private isValidOptionsArray(options: unknown[]): options is DropdownOption[] {
    return options.every(
      (option): option is DropdownOption =>
        typeof option === 'object' &&
        option !== null &&
        typeof (option as DropdownOption).value === 'string' &&
        typeof (option as DropdownOption).text === 'string',
    );
  }

  /**
   * Обновляет список отфильтрованных опций на основе поискового запроса
   */
  private updateFilteredOptions(): void {
    if (!this.searchValue.trim()) {
      this.filteredOptions = [...this.options];
      return;
    }

    const searchLower = this.searchValue.toLowerCase();
    this.filteredOptions = this.options.filter(
      (option) =>
        option.text.toLowerCase().includes(searchLower) ||
        option.value.toLowerCase().includes(searchLower),
    );
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
   * Рендерит опции выпадающего списка для обычного select
   */
  private renderSelectOptions(): TemplateResult[] {
    const optionTemplates: TemplateResult[] = [];

    // Добавляем placeholder опцию
    if (this.placeholder) {
      optionTemplates.push(html`<option value="">${this.placeholder}</option>`);
    }

    // Добавляем опции из данных
    optionTemplates.push(
      ...this.options.map(
        (option) => html`<option value="${option.value}">${option.text}</option>`,
      ),
    );

    return optionTemplates;
  }

  /**
   * Рендерит кастомные опции для поиска
   */
  private renderCustomOptions(): TemplateResult[] {
    return this.filteredOptions.map(
      (option: DropdownOption, index: number) => html`
        <div
          class="ttg-dropdown-option ${index === this.highlightedIndex
            ? 'highlighted'
            : ''} ${option.value === this.value ? 'selected' : ''}"
          data-value="${option.value}"
          @click="${() => this.selectOption(option)}"
          @mouseenter="${() => this.setHighlightedIndex(index)}"
        >
          ${option.text}
        </div>
      `,
    );
  }

  /**
   * Рендерит поле поиска
   */
  private renderSearchField(): TemplateResult {
    return html`
      <input
        type="text"
        class="ttg-dropdown-search"
        placeholder="${this.searchPlaceholder}"
        .value="${this.searchValue}"
        @input="${this.handleSearchInput}"
        @keydown="${this.handleSearchKeyDown}"
      />
    `;
  }

  /**
   * Рендерит кастомный dropdown с поиском
   */
  private renderCustomDropdown(): TemplateResult {
    const selectedOption = this.options.find((opt: DropdownOption) => opt.value === this.value);
    const displayText = selectedOption?.text || this.placeholder || 'Выберите опцию';

    return html`
      <div class="ttg-dropdown-field-custom">
        <div
          class="ttg-dropdown-trigger"
          @click="${this.toggleDropdown}"
          @keydown="${this.handleTriggerKeyDown}"
          tabindex="0"
          role="combobox"
          aria-expanded="${this.isOpen}"
          aria-haspopup="listbox"
          aria-labelledby="${this.uniqueId}-label"
          aria-describedby="${this.error ? `${this.uniqueId}-error` : ''}"
          aria-invalid="${this.hasError}"
        >
          <span class="ttg-dropdown-value ${!selectedOption ? 'placeholder' : ''}">
            ${displayText}
          </span>
          ${this.renderArrowIcon()}
        </div>
        ${this.isOpen
          ? html`
              <div class="ttg-dropdown-panel">
                ${this.renderSearchField()}
                <div class="ttg-dropdown-options" role="listbox">
                  ${this.filteredOptions.length > 0
                    ? this.renderCustomOptions()
                    : html`<div class="ttg-dropdown-no-options">Нет подходящих вариантов</div>`}
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Рендерит SVG иконку стрелки
   */
  private renderArrowIcon(): TemplateResult {
    return html`
      <svg
        class="ttg-dropdown-arrow"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M15.8337 7.5L10.0003 13.3333L4.16699 7.5"
          stroke="#A9A9A9"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;
  }

  /**
   * Рендерит SVG иконку ошибки
   */
  private renderErrorIcon(): TemplateResult {
    return html`
      <svg
        class="ttg-dropdown-error-icon"
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
   * Вычисляет CSS классы для обёртки компонента
   */
  private getWrapperClasses(): string {
    return `ttg-dropdown-wrapper${this.error ? ' error' : ''}`;
  }

  /**
   * Рендерит блок ошибки если есть ошибка
   */
  private renderError(): TemplateResult | string {
    return this.error
      ? html`
          <div class="ttg-dropdown-error" id="${this.uniqueId}-error" role="alert">
            ${this.renderErrorIcon()}
            <span class="ttg-dropdown-error-text">${this.error}</span>
          </div>
        `
      : '';
  }

  /**
   * Основной метод рендеринга компонента
   */
  render(): TemplateResult {
    return html`
      <div class="${this.getWrapperClasses()}">
        <label for="${this.uniqueId}" id="${this.uniqueId}-label">
          <span class="ttg-dropdown-label">${this.label}</span>
          ${this.required ? html`<span class="ttg-dropdown-required">*</span>` : ''}
          ${this.renderTooltip()}
        </label>
        ${this.enableSearch ? this.renderCustomDropdown() : this.renderNativeSelect()}
        ${this.renderError()}
      </div>
    `;
  }

  /**
   * Рендерит нативный select
   */
  private renderNativeSelect(): TemplateResult {
    return html`
      <div class="ttg-dropdown-field">
        <select
          id="${this.uniqueId}"
          class="ttg-dropdown-control"
          .value="${this.value}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-describedby="${this.error ? `${this.uniqueId}-error` : ''}"
          aria-invalid="${this.hasError}"
          @change="${this.handleChange}"
          @blur="${this.handleBlur}"
          @keydown="${this.handleKeyDown}"
        >
          ${this.renderSelectOptions()}
        </select>
        ${this.renderArrowIcon()}
      </div>
    `;
  }

  /**
   * Проверяет, является ли элемент HTML select элементом
   */
  private isSelectElement(element: EventTarget | null): element is HTMLSelectElement {
    return element instanceof HTMLSelectElement;
  }

  /**
   * Обработчик события изменения значения
   */
  private handleChange = (e: Event) => {
    if (!this.isSelectElement(e.target)) {
      return;
    }

    const target = e.target;
    this.value = target.value;

    // Очищаем ошибку при изменении
    if (this.error) {
      this.error = '';
    }

    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  /**
   * Обработчик события потери фокуса
   */
  private handleBlur = () => {
    this.touched = true;
    // ValidationController сам обработает blur через свои обработчики
  };

  /**
   * Обработчик нажатия клавиш для улучшенной навигации
   */
  private handleKeyDown = (e: KeyboardEvent) => {
    // Escape - закрыть dropdown (браузер обрабатывает автоматически)
    if (e.key === 'Escape' && this.selectElement) {
      this.selectElement.blur();
    }
  };

  /**
   * Совместимость с ValidationController - принудительная валидация
   */
  validate(): boolean {
    return !this.hasError;
  }

  /**
   * Принудительная валидация с установкой touched
   */
  forceValidate(): boolean {
    this.touched = true;
    return this.validate();
  }

  /**
   * Обработчик ввода в поле поиска
   */
  private handleSearchInput = (e: Event) => {
    if (e.target instanceof HTMLInputElement) {
      this.searchValue = e.target.value;
      this.highlightedIndex = 0;
    }
  };

  /**
   * Обработчик клавиш в поле поиска
   */
  private handleSearchKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.moveHighlight(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.moveHighlight(-1);
        break;
      case 'Enter':
        e.preventDefault();
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredOptions.length) {
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.closeDropdown();
        break;
    }
  };

  /**
   * Обработчик клавиш для триггера кастомного dropdown
   */
  private handleTriggerKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
        }
        break;
      case 'Escape':
        if (this.isOpen) {
          e.preventDefault();
          this.closeDropdown();
        }
        break;
    }
  };

  /**
   * Перемещает выделение в списке опций
   */
  private moveHighlight(direction: number): void {
    const newIndex = this.highlightedIndex + direction;

    if (newIndex >= 0 && newIndex < this.filteredOptions.length) {
      this.highlightedIndex = newIndex;
      this.scrollHighlightedIntoView();
    }
  }

  /**
   * Прокручивает выделенный элемент в видимую область
   */
  private scrollHighlightedIntoView(): void {
    if (!this.optionsElement) return;

    const highlightedElement = this.optionsElement.querySelector(
      '.ttg-dropdown-option.highlighted',
    ) as HTMLElement;
    if (highlightedElement) {
      highlightedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }

  /**
   * Устанавливает индекс выделенной опции
   */
  private setHighlightedIndex(index: number): void {
    this.highlightedIndex = index;
  }

  /**
   * Переключает состояние dropdown
   */
  private toggleDropdown(): void {
    if (this.disabled) return;

    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Открывает dropdown
   */
  private openDropdown(): void {
    if (this.disabled) return;

    this.isOpen = true;
    this.searchValue = '';
    this.updateFilteredOptions(); // Обновляем фильтр при открытии
    this.highlightedIndex = this.filteredOptions.findIndex(
      (opt: DropdownOption) => opt.value === this.value,
    );
    if (this.highlightedIndex === -1) {
      this.highlightedIndex = 0;
    }

    this.updateComplete
      .then(() => {
        this.searchElement?.focus();
      })
      .catch(() => {
        // Игнорируем ошибки updateComplete
      });
  }

  /**
   * Закрывает dropdown
   */
  private closeDropdown(): void {
    this.isOpen = false;
    this.searchValue = '';
    this.highlightedIndex = -1;
  }

  /**
   * Выбирает опцию
   */
  private selectOption(option: DropdownOption): void {
    this.value = option.value;
    this.closeDropdown();

    if (this.error) {
      this.error = '';
    }

    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  /**
   * Обработчик клика вне компонента для закрытия dropdown
   */
  private handleDocumentClick = (e: Event) => {
    if (!this.contains(e.target as Node)) {
      this.closeDropdown();
    }
  };

  /**
   * Подключение компонента
   */
  connectedCallback(): void {
    super.connectedCallback();
    if (this.enableSearch) {
      document.addEventListener('click', this.handleDocumentClick);
    }
  }

  /**
   * Отключение компонента
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.enableSearch) {
      document.removeEventListener('click', this.handleDocumentClick);
    }
  }
}

customElements.define('ttg-dropdown', Dropdown);
