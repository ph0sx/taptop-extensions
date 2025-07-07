import baseStyles from '../../styles/base.css';
import inputStyles from './Input.styles.css';
import { template } from './Input.template';
import '../Question/Question';
import { generateUniqueId } from '../../utils/id';

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
  private uniqueId = generateUniqueId('ttg-input');

  static get observedAttributes() {
    return [
      'label',
      'value',
      'type',
      'error',
      'disabled',
      'placeholder',
      'required',
      'tooltip',
      'min',
      'max',
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `<style>${baseStyles}${inputStyles}</style>${template}`;

    this.elements.wrapper = this.shadowRoot!.querySelector('.ttg-input-wrapper');
    this.elements.label = this.shadowRoot!.querySelector('label');
    this.elements.input = this.shadowRoot!.querySelector('.ttg-input-control');
    this.elements.errorMessage = this.shadowRoot!.querySelector('.ttg-input-error-text');

    // Устанавливаем связь между label и input
    if (this.elements.input) {
      this.elements.input.id = this.uniqueId;
    }
    if (this.elements.label) {
      this.elements.label.setAttribute('for', this.uniqueId);
    }
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
    let isValid = true;

    if (this.hasAttribute('required') && !value) {
      this.setError('Это поле обязательно для заполнения');
      isValid = false;
    } else if (this.elements.input?.type === 'number' && value) {
      // Validate min/max for number inputs
      const numValue = parseFloat(value);

      if (this.hasAttribute('min')) {
        const minValue = parseFloat(this.getAttribute('min')!);
        if (numValue < minValue) {
          this.setError(`Значение должно быть не менее ${minValue}`);
          isValid = false;
        }
      }

      if (this.hasAttribute('max')) {
        const maxValue = parseFloat(this.getAttribute('max')!);
        if (numValue > maxValue) {
          this.setError(`Значение должно быть не более ${maxValue}`);
          isValid = false;
        }
      }
    } else if (this.elements.input?.type === 'time' && value) {
      // Validate min/max for time inputs
      if (this.hasAttribute('min')) {
        const minTime = this.getAttribute('min')!;
        if (value < minTime) {
          this.setError(`Время должно быть не раньше ${minTime}`);
          isValid = false;
        }
      }

      if (this.hasAttribute('max')) {
        const maxTime = this.getAttribute('max')!;
        if (value > maxTime) {
          this.setError(`Время должно быть не позже ${maxTime}`);
          isValid = false;
        }
      }
    } else if (this.elements.input?.type === 'date' && value) {
      // Validate min/max for date inputs
      if (this.hasAttribute('min')) {
        const minDate = this.getAttribute('min')!;
        if (value < minDate) {
          this.setError(`Дата должна быть не раньше ${minDate}`);
          isValid = false;
        }
      }

      if (this.hasAttribute('max')) {
        const maxDate = this.getAttribute('max')!;
        if (value > maxDate) {
          this.setError(`Дата должна быть не позже ${maxDate}`);
          isValid = false;
        }
      }
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

    this.updateTooltip();
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    switch (name) {
      case 'label': {
        const labelSpan = this.shadowRoot?.querySelector('.ttg-input-label');
        if (labelSpan) {
          labelSpan.textContent = newValue;
        }
        break;
      }

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

      case 'tooltip':
        this.updateTooltip();
        break;

      case 'min':
        if (this.elements.input) {
          if (newValue) {
            this.elements.input.setAttribute('min', newValue);
          } else {
            this.elements.input.removeAttribute('min');
          }
        }
        break;

      case 'max':
        if (this.elements.input) {
          if (newValue) {
            this.elements.input.setAttribute('max', newValue);
          } else {
            this.elements.input.removeAttribute('max');
          }
        }
        break;
    }
  }

  private updateRequiredIndicator() {
    const requiredSpan = this.shadowRoot?.querySelector('.ttg-input-required') as HTMLElement;
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

customElements.define('ttg-input', Input);
