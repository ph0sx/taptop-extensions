import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import checkboxItemStyles from './CheckboxItem.styles.css';
import { generateUniqueId } from '../../utils/generate-id';

export class CheckboxItem extends LitElement {
  static styles = [unsafeCSS(baseStyles), unsafeCSS(checkboxItemStyles)];

  @property({ type: String })
  accessor label = '';

  @property({ type: String })
  accessor value = '';

  @property({ type: Boolean, reflect: true })
  accessor checked = false;

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: String })
  accessor name = '';

  private uniqueId = generateUniqueId('ttg-checkbox-item');

  protected render(): TemplateResult {
    return html`
      <div class="ttg-checkbox-item ${this.disabled ? 'disabled' : ''}">
        <label class="ttg-checkbox-label">
          <input
            type="checkbox"
            class="ttg-checkbox-input"
            id="${this.uniqueId}"
            .checked="${this.checked}"
            .value="${this.value}"
            .disabled="${this.disabled}"
            .name="${this.name}"
            @change="${this.handleChange}"
          />
          <div class="ttg-checkbox-icon"></div>
          <span class="ttg-checkbox-label-text">${this.label}</span>
        </label>
      </div>
    `;
  }

  private handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          checked: this.checked,
          value: this.value,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define('ttg-checkbox-item', CheckboxItem);
