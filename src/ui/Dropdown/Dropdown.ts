import baseStyles from '../../styles/base.css';
import dropdownStyles from './Dropdown.styles.css';
import { template } from './Dropdown.template';
import '../Question/Question';
import { generateUniqueId } from '../../utils/generate-id';

interface DropdownElements {
  wrapper: HTMLElement | null;
  label: HTMLLabelElement | null;
  select: HTMLSelectElement | null;
  errorMessage: HTMLElement | null;
}

export class Dropdown extends HTMLElement {
  private elements: DropdownElements = {
    wrapper: null,
    label: null,
    select: null,
    errorMessage: null,
  };

  private touched = false;
  private userStartedTyping = false;
  private uniqueId = generateUniqueId('ttg-dropdown');

  static get observedAttributes() {
    return ['label', 'value', 'error', 'disabled', 'required', 'tooltip', 'options'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `<style>${baseStyles}${dropdownStyles}</style>${template}`;

    this.elements.wrapper = this.shadowRoot!.querySelector('.ttg-dropdown-wrapper');
    this.elements.label = this.shadowRoot!.querySelector('label');
    this.elements.select = this.shadowRoot!.querySelector('.ttg-dropdown-control');
    this.elements.errorMessage = this.shadowRoot!.querySelector('.ttg-dropdown-error-text');

    // Устанавливаем связь между label и select
    if (this.elements.select) {
      this.elements.select.id = this.uniqueId;
    }
    if (this.elements.label) {
      this.elements.label.setAttribute('for', this.uniqueId);
    }
  }

  get value() {
    return this.elements.select?.value || '';
  }

  set value(val: string) {
    if (this.elements.select) {
      this.elements.select.value = val;
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
    let isValid = true;

    if (this.hasAttribute('required') && !value) {
      this.setError('Это поле обязательно для заполнения');
      isValid = false;
    }

    if (isValid) {
      this.clearError();
    }

    // Dispatch validation change event
    this.dispatchEvent(
      new CustomEvent('validation-change', {
        detail: { isValid, value },
        bubbles: true,
        composed: true,
      }),
    );

    return isValid;
  }

  forceValidate(): boolean {
    this.touched = true;
    this.userStartedTyping = true;
    return this.validate();
  }

  setOptions(options: Array<{ value: string; text: string }>) {
    if (!this.elements.select) return;

    // Очищаем существующие опции
    this.elements.select.innerHTML = '';

    // Добавляем пустую опцию если есть placeholder
    const placeholder = this.getAttribute('placeholder');
    if (placeholder) {
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = placeholder;
      this.elements.select.appendChild(placeholderOption);
    }

    // Добавляем новые опции
    options.forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      this.elements.select!.appendChild(optionElement);
    });
  }

  connectedCallback() {
    this.elements.select?.addEventListener('change', () => {
      this.userStartedTyping = true;

      if (this.hasError) {
        this.clearError();
      }

      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    });

    this.elements.select?.addEventListener('blur', () => {
      this.touched = true;

      if (this.userStartedTyping || this.value.trim() || this.hasError) {
        this.validate();
      }
    });

    this.updateTooltip();
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    switch (name) {
      case 'label': {
        const labelSpan = this.shadowRoot?.querySelector('.ttg-dropdown-label');
        if (labelSpan) {
          labelSpan.textContent = newValue;
        }
        break;
      }

      case 'value':
        if (this.elements.select) {
          this.elements.select.value = newValue;
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
        if (this.elements.select) {
          this.elements.select.disabled = this.hasAttribute('disabled');
        }
        break;

      case 'required':
        this.updateRequiredIndicator();
        break;

      case 'tooltip':
        this.updateTooltip();
        break;

      case 'options':
        try {
          const options = JSON.parse(newValue);
          this.setOptions(options);
        } catch (e) {
          console.warn('Invalid options format:', e);
        }
        break;
    }
  }

  private updateRequiredIndicator() {
    const requiredSpan = this.shadowRoot?.querySelector('.ttg-dropdown-required') as HTMLElement;
    if (requiredSpan) {
      requiredSpan.style.display = this.hasAttribute('required') ? 'inline' : 'none';
    }
  }

  private updateTooltip() {
    const questionElement = this.shadowRoot?.querySelector('ttg-question') as HTMLElement;
    if (questionElement) {
      const tooltipValue = this.getAttribute('tooltip');
      if (tooltipValue) {
        questionElement.style.display = 'block';
        questionElement.setAttribute('tooltip', tooltipValue);
      } else {
        questionElement.style.display = 'none';
      }
    }
  }
}

customElements.define('ttg-dropdown', Dropdown);
