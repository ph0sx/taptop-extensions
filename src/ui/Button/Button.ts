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
    this.updateIdForPrimary();
  }

  attributeChangedCallback(name: string) {
    if (name === 'variant' && this.shadow) {
      this.updateVariant();
      this.updateIdForPrimary();
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

  private updateIdForPrimary() {
    if (this.variant === 'primary') {
      this.id = 'gen-btn';
    } else {
      this.removeAttribute('id');
    }
  }
}

customElements.define('ttg-button', Button);
