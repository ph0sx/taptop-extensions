import { styles } from './Question.styles';
import { template } from './Question.template';

interface QuestionElements {
  container: HTMLElement | null;
  tooltip: HTMLElement | null;
}

export class Question extends HTMLElement {
  private elements: QuestionElements = {
    container: null,
    tooltip: null,
  };

  static get observedAttributes() {
    return ['tooltip'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `<style>${styles}</style>${template}`;

    this.elements.container = this.shadowRoot!.querySelector('.ttg-question-container');
    this.elements.tooltip = this.shadowRoot!.querySelector('.ttg-question-tooltip');
  }

  get tooltip() {
    return this.getAttribute('tooltip') || '';
  }

  set tooltip(value: string) {
    this.setAttribute('tooltip', value);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case 'tooltip':
        if (this.elements.tooltip) {
          this.elements.tooltip.textContent = newValue;
        }
        break;
    }
  }
}

customElements.define('ttg-question', Question);
