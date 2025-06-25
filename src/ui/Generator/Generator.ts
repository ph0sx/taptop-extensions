import baseStyles from '../../styles/base.css';
import generatorStyles from './Generator.styles.css';
import { template } from './Generator.template';
import '../Button/Button';

interface GeneratorElements {
  wrapper: HTMLElement | null;
  header: HTMLElement | null;
  title: HTMLElement | null;
  sectionsContainer: HTMLElement | null;
  generateButton: HTMLButtonElement | null;
}

export class Generator extends HTMLElement {
  private elements: GeneratorElements = {
    wrapper: null,
    header: null,
    title: null,
    sectionsContainer: null,
    generateButton: null,
  };

  static get observedAttributes() {
    return ['title', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `<style>${baseStyles}${generatorStyles}</style>${template}`;

    this.elements.wrapper = this.shadowRoot!.querySelector('.ttg-generator');
    this.elements.header = this.shadowRoot!.querySelector('.ttg-generator-header');
    this.elements.title = this.shadowRoot!.querySelector('.ttg-generator-title');
    this.elements.sectionsContainer = this.shadowRoot!.querySelector('.ttg-generator-sections');
    this.elements.generateButton = this.shadowRoot!.querySelector('ttg-button');
  }

  get title(): string {
    return this.getAttribute('title') || 'Генератор';
  }

  set title(value: string) {
    this.setAttribute('title', value);
  }

  get isDisabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  private handleGenerate(): void {
    if (this.isDisabled) return;

    // Validate all inputs before generating
    if (!this.validateAllInputs()) {
      return;
    }

    // Собираем данные из всех инпутов в слотах
    const data = this.collectInputData();

    // Отправляем событие с данными
    this.dispatchEvent(
      new CustomEvent('generate', {
        detail: { data },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private validateAllInputs(): boolean {
    const inputs = this.querySelectorAll('ttg-input') as NodeListOf<
      HTMLElement & { forceValidate: () => boolean }
    >;
    let isFormValid = true;

    inputs.forEach((input) => {
      if (input.forceValidate && !input.forceValidate()) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }

  private checkFormValidity(): boolean {
    const inputs = this.querySelectorAll('ttg-input') as NodeListOf<
      HTMLElement & {
        hasError: boolean;
        hasAttribute: (name: string) => boolean;
        value: string;
        elements: { input: HTMLInputElement | null };
        getAttribute: (name: string) => string | null;
      }
    >;

    for (const input of inputs) {
      // Check if input has validation errors
      if (input.hasError) {
        return false;
      }

      const value = input.value?.trim() || '';

      // Check required inputs
      if (input.hasAttribute('required') && !value) {
        return false;
      }

      // Check min/max validation for number inputs
      if (input.elements?.input?.type === 'number' && value) {
        const numValue = parseFloat(value);

        if (input.hasAttribute('min')) {
          const minValue = parseFloat(input.getAttribute('min') || '0');
          if (numValue < minValue) {
            return false;
          }
        }

        if (input.hasAttribute('max')) {
          const maxValue = parseFloat(input.getAttribute('max') || '0');
          if (numValue > maxValue) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private updateButtonState(): void {
    const isValid = this.checkFormValidity();

    // Disable only the button, not the entire generator
    if (this.elements.generateButton) {
      this.elements.generateButton.disabled = !isValid;
    }

    // Dispatch validation change event
    this.dispatchEvent(
      new CustomEvent('validation-change', {
        detail: { isValid },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private collectInputData(): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    // Ищем все инпуты во всех слотах
    const inputs = this.querySelectorAll(
      'ttg-input, ttg-color-input, ttg-radio-group, ttg-image-uploader',
    );

    inputs.forEach((input: Element) => {
      const inputId = input.id;
      if (inputId) {
        if (input.tagName === 'TTG-INPUT' || input.tagName === 'TTG-COLOR-INPUT') {
          data[inputId] = (input as HTMLInputElement & { value: string }).value;
        }
      }
    });

    return data;
  }

  connectedCallback() {
    // Обработчик кнопки генерации
    this.elements.generateButton?.addEventListener('click', () => {
      this.handleGenerate();
    });

    // Слушаем изменения в дочерних элементах
    this.addEventListener('change', (e) => {
      // Update button state based on form validity
      setTimeout(() => this.updateButtonState(), 0);

      // Переотправляем событие изменения
      this.dispatchEvent(
        new CustomEvent('input-change', {
          detail: {
            target: e.target,
            data: this.collectInputData(),
          },
          bubbles: true,
          composed: true,
        }),
      );
    });

    // Check initial validity state
    setTimeout(() => this.updateButtonState(), 0);
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    switch (name) {
      case 'title':
        if (this.elements.title) {
          this.elements.title.textContent = newValue;
        }
        break;

      case 'disabled': {
        const isDisabled = this.hasAttribute('disabled');
        if (this.elements.generateButton) {
          this.elements.generateButton.disabled = isDisabled;
        }
        if (this.elements.wrapper) {
          this.elements.wrapper.classList.toggle('disabled', isDisabled);
        }
        break;
      }
    }
  }
}

customElements.define('ttg-generator', Generator);
