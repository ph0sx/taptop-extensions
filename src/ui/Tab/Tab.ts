import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import tabStyles from './Tab.styles.css';

@customElement('ttg-tab')
export class Tab extends LitElement {
  static styles = [unsafeCSS(baseStyles), unsafeCSS(tabStyles)];

  @property({ type: Boolean, reflect: true })
  accessor active = false;

  protected render(): TemplateResult {
    return html`
      <button
        type="button"
        class="tab ${this.active ? 'active' : ''}"
        aria-pressed="${this.active}"
        role="tab"
        tabindex="${this.active ? '0' : '-1'}"
      >
        <slot></slot>
      </button>
    `;
  }
}
