import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import checkboxGroupStyles from './CheckboxGroup.styles.css';
import '../Question/Question.js';
import '../CheckboxItem/CheckboxItem.js';
import { generateUniqueId } from '../../utils/generate-id.js';
import type { ValidatableElement } from '../../types/validation.js';

/**
 * CheckboxGroup - Lit компонент для группы чекбоксов
 * Поддерживает валидацию и интеграцию с ValidationController
 */
export class CheckboxGroup extends LitElement implements ValidatableElement {
  static styles = [unsafeCSS(baseStyles), unsafeCSS(checkboxGroupStyles)];

  @property({ type: String }) accessor label = '';
  @property({ type: String }) accessor orientation: 'vertical' | 'horizontal' = 'vertical';
  @property({ type: String }) accessor tooltip = '';
  @property({ type: String }) accessor name = '';
  @property({ type: Boolean }) accessor required = false;
  @property({ reflect: true }) accessor error = '';

  @state() private accessor touched = false;
  @state() accessor hasError = false;

  private uniqueId = generateUniqueId('ttg-checkbox-group');

  constructor() {
    super();
  }

  get value(): string[] {
    const checkedItems = this.querySelectorAll('ttg-checkbox-item[checked]');
    return Array.from(checkedItems)
      .map((item) => item.getAttribute('value'))
      .filter((value): value is string => Boolean(value));
  }

  get isValid(): boolean {
    return !this.hasError;
  }

  setError(message: string): void {
    this.error = message;
    this.hasError = true;
  }

  clearError(): void {
    this.error = '';
    this.hasError = false;
  }

  validate(): boolean {
    const selectedValues = this.value;
    let isValid = true;

    if (this.required && selectedValues.length === 0) {
      this.setError('Выберите хотя бы один вариант');
      isValid = false;
    }

    if (isValid) {
      this.clearError();
    }

    this.dispatchEvent(
      new CustomEvent('validation-change', {
        detail: { isValid, value: selectedValues },
        bubbles: true,
        composed: true,
      }),
    );

    return isValid;
  }

  forceValidate(): boolean {
    this.touched = true;
    return this.validate();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('change', this.handleCheckboxChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('change', this.handleCheckboxChange);
  }

  protected firstUpdated(): void {
    this.updateCheckboxNames();
  }

  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('name')) {
      this.updateCheckboxNames();
    }
    if (changedProperties.has('error')) {
      this.hasError = Boolean(this.error);
    }
  }

  render(): TemplateResult {
    return html`
      <div class="ttg-checkbox-group-wrapper ${this.hasError ? 'error' : ''}">
        <label for="${this.uniqueId}">
          <span class="ttg-checkbox-group-label">${this.label}</span>
          ${this.required ? html`<span class="ttg-checkbox-group-required">*</span>` : ''}
          ${this.tooltip
            ? html`<ttg-question tooltip="${this.tooltip}" style="height: 16px;"></ttg-question>`
            : ''}
        </label>
        <div id="${this.uniqueId}" class="ttg-checkbox-group-items ${this.orientation}">
          <slot></slot>
        </div>
        ${this.hasError
          ? html`
            <div class="ttg-checkbox-group-error">
                <svg
                  class="ttg-checkbox-group-error-icon"
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
                <span class="ttg-checkbox-group-error-text">${this.error}</span>
              </div>
          `
          : ''}
      </div>
    `;
  }

  private handleCheckboxChange = (event: Event): void => {
    const target = event.target as Element;
    if (target?.tagName === 'TTG-CHECKBOX-ITEM') {
      this.touched = true;

      if (this.hasError) {
        this.clearError();
      }

      setTimeout(() => this.validate(), 100);

      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
    }
  };

  private updateCheckboxNames(): void {
    if (this.name) {
      const checkboxItems = this.querySelectorAll('ttg-checkbox-item');
      checkboxItems.forEach((item) => {
        item.setAttribute('name', this.name);
      });
    }
  }
}

customElements.define('ttg-checkbox-group', CheckboxGroup);

declare global {
  interface HTMLElementTagNameMap {
    'ttg-checkbox-group': CheckboxGroup;
  }
}
