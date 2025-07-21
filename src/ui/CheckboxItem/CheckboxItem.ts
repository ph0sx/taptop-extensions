import baseStyles from '../../styles/base.css';
import checkboxItemStyles from './CheckboxItem.styles.css';
import { template } from './CheckboxItem.template';
import { generateUniqueId } from '../../utils/id';

interface CheckboxItemElements {
  wrapper: HTMLElement | null;
  checkbox: HTMLInputElement | null;
  label: HTMLLabelElement | null;
  checkboxIcon: HTMLElement | null;
}

export class CheckboxItem extends HTMLElement {
  private elements: CheckboxItemElements = {
    wrapper: null,
    checkbox: null,
    label: null,
    checkboxIcon: null,
  };

  private uniqueId = generateUniqueId('ttg-checkbox-item');

  static get observedAttributes() {
    return ['label', 'value', 'checked', 'disabled', 'name'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `<style>${baseStyles}${checkboxItemStyles}</style>${template}`;

    this.elements.wrapper = this.shadowRoot!.querySelector('.ttg-checkbox-item');
    this.elements.checkbox = this.shadowRoot!.querySelector('.ttg-checkbox-input');
    this.elements.label = this.shadowRoot!.querySelector('.ttg-checkbox-label');
    this.elements.checkboxIcon = this.shadowRoot!.querySelector('.ttg-checkbox-icon');

    // Устанавливаем связь между label и checkbox
    if (this.elements.checkbox) {
      this.elements.checkbox.id = this.uniqueId;
    }
    if (this.elements.label) {
      this.elements.label.setAttribute('for', this.uniqueId);
    }
  }

  get value() {
    return this.getAttribute('value') || '';
  }

  set value(val: string) {
    this.setAttribute('value', val);
  }

  get checked() {
    return this.elements.checkbox?.checked || false;
  }

  set checked(val: boolean) {
    if (this.elements.checkbox) {
      this.elements.checkbox.checked = val;
      this.updateCheckboxIcon();
    }
    if (val) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val: boolean) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  connectedCallback() {
    this.elements.checkbox?.addEventListener('change', this.handleChange.bind(this));
    this.elements.wrapper?.addEventListener('click', this.handleWrapperClick.bind(this));

    // Обновляем иконку при подключении
    this.updateCheckboxIcon();
  }

  disconnectedCallback() {
    this.elements.checkbox?.removeEventListener('change', this.handleChange.bind(this));
    this.elements.wrapper?.removeEventListener('click', this.handleWrapperClick.bind(this));
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    switch (name) {
      case 'label': {
        const labelSpan = this.shadowRoot?.querySelector('.ttg-checkbox-label-text');
        if (labelSpan) {
          labelSpan.textContent = newValue;
        }
        break;
      }

      case 'value':
        if (this.elements.checkbox) {
          this.elements.checkbox.value = newValue;
        }
        break;

      case 'checked':
        if (this.elements.checkbox) {
          this.elements.checkbox.checked = this.hasAttribute('checked');
          this.updateCheckboxIcon();
        }
        break;

      case 'disabled':
        if (this.elements.checkbox) {
          this.elements.checkbox.disabled = this.hasAttribute('disabled');
        }
        if (this.elements.wrapper) {
          if (this.hasAttribute('disabled')) {
            this.elements.wrapper.classList.add('disabled');
          } else {
            this.elements.wrapper.classList.remove('disabled');
          }
        }
        break;

      case 'name':
        if (this.elements.checkbox) {
          this.elements.checkbox.name = newValue;
        }
        break;
    }
  }

  private handleChange() {
    this.updateCheckboxIcon();

    // Dispatch change event
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          checked: this.checked,
          value: this.value,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleWrapperClick(event: Event) {
    // Предотвращаем двойной клик если клик был по самому checkbox
    if (event.target === this.elements.checkbox) {
      return;
    }

    // Если компонент не отключен, переключаем состояние
    if (!this.disabled) {
      this.checked = !this.checked;
      this.handleChange();
    }
  }

  private updateCheckboxIcon() {
    if (!this.elements.checkboxIcon) return;

    if (this.checked) {
      this.elements.checkboxIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="16" height="16" rx="4" fill="#333333"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5304 6.52941L7.00006 12.0597L3.46973 8.52941L4.53039 7.46875L7.00006 9.93842L11.4697 5.46875L12.5304 6.52941Z" fill="white"/>
        </svg>
      `;
    } else {
      this.elements.checkboxIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="16" height="16" rx="4" fill="#D5D5D5"/>
          <g filter="url(#filter0_d_2269_255)">
            <rect x="3.5" y="3.5" width="13" height="13" rx="2.6" fill="white"/>
          </g>
          <defs>
            <filter id="filter0_d_2269_255" x="1.5" y="3.5" width="17" height="17" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="2"/>
              <feGaussianBlur stdDeviation="1"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0.105882 0 0 0 0 0.109804 0 0 0 0 0.113725 0 0 0 0.12 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2269_255"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2269_255" result="shape"/>
            </filter>
          </defs>
        </svg>
      `;
    }
  }
}

customElements.define('ttg-checkbox-item', CheckboxItem);
