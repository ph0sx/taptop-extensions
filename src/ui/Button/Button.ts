import { buttonStyles } from './Button.styles.js';
import { buttonTemplate } from './Button.template.js';

export class Button extends HTMLElement {
  private shadow: ShadowRoot;

  static get observedAttributes() {
    return ['variant'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  get variant() {
    return this.getAttribute('variant') || 'primary';
  }

  set variant(value) {
    this.setAttribute('variant', value);
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string) {
    if (name === 'variant' && this.shadow) {
      this.updateVariant();
    }
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        ${buttonStyles}
      </style>
      ${buttonTemplate}
    `;
    this.updateVariant();
  }

  private updateVariant() {
    const button = this.shadow.querySelector('.ttg-button');
    if (button) {
      // Remove all variant classes
      button.classList.remove(
        'ttg-button--primary',
        'ttg-button--secondary',
        'ttg-button--tertiary',
      );
      // Add current variant class
      button.classList.add(`ttg-button--${this.variant}`);
    }
  }
}

customElements.define('ttg-button', Button);
