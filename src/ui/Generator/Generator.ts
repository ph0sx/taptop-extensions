import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import generatorStyles from './Generator.styles.css';
import '../Button/Button';

/**
 * Презентационный компонент-обертка для генераторов кода.
 * Не содержит валидации, получает состояние от родительского компонента.
 *
 * @element ttg-generator
 *
 * @attr {string} title - Заголовок генератора
 * @attr {boolean} disabled - Отключен ли генератор
 * @attr {boolean} form-valid - Валидна ли форма (управляется родителем)
 *
 * @fires generate - Событие генерации, отправляется при клике на кнопку
 *
 * @slot - Содержимое генератора (поля формы)
 */
export class Generator extends LitElement {
  static styles = [unsafeCSS(baseStyles), unsafeCSS(generatorStyles)];

  @property({ type: String })
  accessor title = 'Генератор';

  @property({ type: Boolean })
  accessor disabled = false;

  @property({ type: Boolean, attribute: 'form-valid' })
  accessor formValid = false;

  /**
   * Рендерит основную структуру генератора
   */
  protected render(): TemplateResult {
    return html`
      <div class="ttg-generator ${this.disabled ? 'disabled' : ''}">
        <!-- Header -->
        <div class="ttg-generator-header">
          <div class="ttg-generator-icon"></div>
          <h2 class="ttg-generator-title">${this.title}</h2>
        </div>

        <!-- Sections Container -->
        <div class="ttg-generator-sections">
          <slot></slot>
        </div>

        <!-- Generate Button -->
        <div class="ttg-generator-button-container">
          <ttg-button
            id="gen-btn"
            ?disabled="${!this.formValid || this.disabled}"
            @click="${this.handleGenerate}"
          >
            Сгенерировать код
          </ttg-button>
        </div>
      </div>
    `;
  }

  /**
   * Обработчик клика по кнопке генерации
   * Просто отправляет событие родителю
   */
  private handleGenerate = (): void => {
    if (this.formValid && !this.disabled) {
      this.dispatchEvent(
        new CustomEvent('generate', {
          bubbles: true,
          composed: true,
        }),
      );
    }
  };
}

customElements.define('ttg-generator', Generator);
