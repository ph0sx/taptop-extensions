import { styles } from './Input.styles';
import { template } from './Input.template';

interface InputElements {
  wrapper: HTMLElement | null;
  label: HTMLLabelElement | null;
  input: HTMLInputElement | null;
  errorMessage: HTMLElement | null;
}

export class Input extends HTMLElement {
  private elements: InputElements = {
    wrapper: null,
    label: null,
    input: null,
    errorMessage: null,
  };

  private touched = false;
  private userStartedTyping = false;

  static get observedAttributes() {
    return ['label', 'value', 'type', 'error', 'disabled', 'placeholder', 'required'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `<style>${styles}</style>${template}`;

    this.elements.wrapper = this.shadowRoot!.querySelector('.ttg-input-wrapper');
    this.elements.label = this.shadowRoot!.querySelector('.ttg-input-label');
    this.elements.input = this.shadowRoot!.querySelector('.ttg-input-control');
    this.elements.errorMessage = this.shadowRoot!.querySelector('.ttg-input-error-text');
  }

  get value() {
    return this.elements.input?.value || '';
  }

  set value(val: string) {
    if (this.elements.input) {
      this.elements.input.value = val;
    }
  }

  get hasError() {
    return this.elements.wrapper?.classList.contains('error') || false;
  }

  setError(message: string) {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
    }
    if (this.elements.wrapper) {
      this.elements.wrapper.classList.add('error');
    }
    this.setAttribute('error', message);
  }

  clearError() {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = '';
    }
    if (this.elements.wrapper) {
      this.elements.wrapper.classList.remove('error');
    }
    this.removeAttribute('error');
  }

  validate(): boolean {
    const value = this.value.trim();

    if (this.hasAttribute('required') && !value) {
      this.setError('Это поле обязательно для заполнения');
      return false;
    }

    this.clearError();
    return true;
  }

  forceValidate(): boolean {
    this.touched = true;
    this.userStartedTyping = true;
    return this.validate();
  }

  connectedCallback() {
    this.elements.input?.addEventListener('input', () => {
      this.userStartedTyping = true;

      if (this.hasError) {
        this.clearError();
      }

      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    });

    this.elements.input?.addEventListener('blur', () => {
      this.touched = true;

      if (this.userStartedTyping || this.value.trim() || this.hasError) {
        this.validate();
      }
    });

    this.elements.input?.addEventListener('input', () => {
      if (this.value.trim() && this.touched) {
        setTimeout(() => this.validate(), 300);
      }
    });
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case 'label':
        if (this.elements.label) {
          this.elements.label.textContent = newValue;
        }
        break;

      case 'value':
        if (this.elements.input) {
          this.elements.input.value = newValue;
        }
        break;

      case 'type':
        if (this.elements.input) {
          this.elements.input.type = newValue;
        }
        break;

      case 'placeholder':
        if (this.elements.input) {
          this.elements.input.placeholder = newValue;
        }
        break;

      case 'error':
        if (newValue) {
          if (this.elements.errorMessage) {
            this.elements.errorMessage.textContent = newValue;
          }
          if (this.elements.wrapper) {
            this.elements.wrapper.classList.add('error');
          }
        } else {
          if (this.elements.errorMessage) {
            this.elements.errorMessage.textContent = '';
          }
          if (this.elements.wrapper) {
            this.elements.wrapper.classList.remove('error');
          }
        }
        break;

      case 'disabled':
        if (this.elements.input) {
          this.elements.input.disabled = this.hasAttribute('disabled');
        }
        break;

      case 'required':
        this.updateRequiredIndicator();
        break;
    }
  }

  private updateRequiredIndicator() {
    const requiredSpan = this.shadowRoot?.querySelector('.ttg-input-required') as HTMLElement;
    if (requiredSpan) {
      requiredSpan.style.display = this.hasAttribute('required') ? 'inline' : 'none';
    }
  }
}

customElements.define('ttg-input', Input);
