import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import buttonStyles from './Button.styles.css';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

export class Button extends LitElement {
  static styles = [unsafeCSS(baseStyles), unsafeCSS(buttonStyles)];

  @property({
    type: String,
    reflect: true,
    hasChanged: (newVal: string, oldVal: string) => {
      const validVariants: ButtonVariant[] = ['primary', 'secondary', 'tertiary'];
      return newVal !== oldVal && validVariants.includes(newVal as ButtonVariant);
    },
  })
  accessor variant: ButtonVariant = 'primary';

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  protected render(): TemplateResult {
    return html`
      <button
        type="button"
        class="ttg-button ttg-button--${this.variant}"
        ?disabled="${this.disabled}"
        aria-disabled="${this.disabled}"
      >
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('ttg-button', Button);
