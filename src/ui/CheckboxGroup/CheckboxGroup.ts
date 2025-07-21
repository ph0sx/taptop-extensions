import baseStyles from '../../styles/base.css';
import checkboxGroupStyles from './CheckboxGroup.styles.css';
import { template } from './CheckboxGroup.template';
import '../Question/Question';
import '../CheckboxItem/CheckboxItem';
import { generateUniqueId } from '../../utils/id';

interface CheckboxGroupElements {
  wrapper: HTMLElement | null;
  label: HTMLLabelElement | null;
  checkboxContainer: HTMLElement | null;
  errorMessage: HTMLElement | null;
}

export class CheckboxGroup extends HTMLElement {
  private elements: CheckboxGroupElements = {
    wrapper: null,
    label: null,
    checkboxContainer: null,
    errorMessage: null,
  };

  private touched = false;
  private uniqueId = generateUniqueId('ttg-checkbox-group');

  static get observedAttributes() {
    return ['label', 'orientation', 'error', 'required', 'tooltip', 'name'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `<style>${baseStyles}${checkboxGroupStyles}</style>${template}`;

    this.elements.wrapper = this.shadowRoot!.querySelector('.ttg-checkbox-group-wrapper');
    this.elements.label = this.shadowRoot!.querySelector('label');
    this.elements.checkboxContainer = this.shadowRoot!.querySelector('.ttg-checkbox-group-items');
    this.elements.errorMessage = this.shadowRoot!.querySelector('.ttg-checkbox-group-error-text');

    // Устанавливаем ID для группы
    if (this.elements.checkboxContainer) {
      this.elements.checkboxContainer.id = this.uniqueId;
    }
    if (this.elements.label) {
      this.elements.label.setAttribute('for', this.uniqueId);
    }
  }

  get value() {
    const checkedItems = this.querySelectorAll('ttg-checkbox-item[checked]');
    return Array.from(checkedItems)
      .map((item) => item.getAttribute('value'))
      .filter(Boolean);
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
    const selectedValues = this.value;
    let isValid = true;

    if (this.hasAttribute('required') && selectedValues.length === 0) {
      this.setError('Выберите хотя бы один вариант');
      isValid = false;
    }

    if (isValid) {
      this.clearError();
    }

    // Dispatch validation change event
    this.dispatchEvent(
      new CustomEvent('validation-change', {
        detail: { isValid, value: selectedValues },
        bubbles: true,
        composed: true,
      }),
    );

    return isValid;
  }

  forceValidate(): boolean {
    this.touched = true;
    return this.validate();
  }

  connectedCallback() {
    // Слушаем изменения в дочерних checkbox элементах
    this.addEventListener('change', this.handleCheckboxChange.bind(this));

    this.updateOrientation();
    this.updateTooltip();
    this.updateRequiredIndicator();
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.handleCheckboxChange.bind(this));
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    switch (name) {
      case 'label': {
        const labelSpan = this.shadowRoot?.querySelector('.ttg-checkbox-group-label');
        if (labelSpan) {
          labelSpan.textContent = newValue;
        }
        break;
      }

      case 'orientation':
        this.updateOrientation();
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

      case 'required':
        this.updateRequiredIndicator();
        break;

      case 'tooltip':
        this.updateTooltip();
        break;

      case 'name':
        // Устанавливаем name для всех дочерних checkbox элементов
        this.updateCheckboxNames();
        break;
    }
  }

  private handleCheckboxChange(event: Event) {
    // Проверяем, что событие от ttg-checkbox-item
    if (event.target && (event.target as Element).tagName === 'TTG-CHECKBOX-ITEM') {
      this.touched = true;

      if (this.hasError) {
        this.clearError();
      }

      // Validate if user has interacted
      if (this.touched) {
        setTimeout(() => this.validate(), 100);
      }

      // Dispatch change event
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private updateOrientation() {
    if (!this.elements.checkboxContainer) return;

    const orientation = this.getAttribute('orientation') || 'vertical';

    // Удаляем все классы ориентации
    this.elements.checkboxContainer.classList.remove('horizontal', 'vertical');

    // Добавляем нужный класс
    this.elements.checkboxContainer.classList.add(orientation);
  }

  private updateRequiredIndicator() {
    const requiredSpan = this.shadowRoot?.querySelector(
      '.ttg-checkbox-group-required',
    ) as HTMLElement;
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

  private updateCheckboxNames() {
    const name = this.getAttribute('name');
    if (name) {
      const checkboxItems = this.querySelectorAll('ttg-checkbox-item');
      checkboxItems.forEach((item) => {
        item.setAttribute('name', name);
      });
    }
  }
}

customElements.define('ttg-checkbox-group', CheckboxGroup);
