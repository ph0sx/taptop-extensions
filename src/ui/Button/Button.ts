import baseStyles from '../../styles/base.css';
import buttonStyles from './Button.styles.css';
import { buttonTemplate } from './Button.template';

export class Button extends HTMLElement {
  private shadow: ShadowRoot;

  static get observedAttributes() {
    return ['variant', 'disabled'];
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

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  connectedCallback() {
    this.render();
    this.updateIdForPrimary();
  }

  attributeChangedCallback(name: string) {
    if (this.shadow) {
      switch (name) {
        case 'variant':
          this.updateVariant();
          this.updateIdForPrimary();
          break;
        case 'disabled':
          this.updateDisabledState();
          break;
      }
    }
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        ${baseStyles}
        ${buttonStyles}
      </style>
      ${buttonTemplate}
    `;
    this.updateVariant();
    this.updateDisabledState();
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

  private updateDisabledState() {
    const button = this.shadow.querySelector('.ttg-button') as HTMLButtonElement;
    if (button) {
      button.disabled = this.disabled;
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
