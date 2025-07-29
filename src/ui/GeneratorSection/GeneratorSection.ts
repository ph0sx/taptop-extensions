import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import generatorSectionStyles from './GeneratorSection.styles.css';

/**
 * Компонент-секция для группировки элементов генератора
 * с опциональным заголовком и границей
 *
 * @element ttg-generator-section
 *
 * @attr {string} label - Заголовок секции
 * @attr {boolean} bordered - Добавить верхнюю границу
 *
 * @slot - Содержимое секции
 */
export class GeneratorSection extends LitElement {
  static styles = [unsafeCSS(baseStyles), unsafeCSS(generatorSectionStyles)];

  @property({ type: String })
  accessor label = '';

  @property({ type: Boolean })
  accessor bordered = false;

  protected render(): TemplateResult {
    return html`
      <div class="ttg-generator-section ${this.bordered ? 'with-border' : ''}">
        ${this.label
          ? html`
          <div class="ttg-generator-section-header">
                <h3 class="ttg-generator-section-title">${this.label}</h3>
              </div>
        `
          : ''}
        <div class="ttg-generator-section-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('ttg-generator-section', GeneratorSection);
