import baseStyles from '../../styles/base.css';
import generatorSectionStyles from './GeneratorSection.styles.css';
import { template } from './GeneratorSection.template';

export class GeneratorSection extends HTMLElement {
  private shadow: ShadowRoot;
  private elements: {
    title?: HTMLElement;
    content?: HTMLElement;
  } = {};

  static get observedAttributes() {
    return ['label', 'bordered'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  get label(): string {
    return this.getAttribute('label') || '';
  }

  set label(value: string) {
    this.setAttribute('label', value);
  }

  get bordered(): boolean {
    return this.hasAttribute('bordered');
  }

  set bordered(value: boolean) {
    if (value) {
      this.setAttribute('bordered', '');
    } else {
      this.removeAttribute('bordered');
    }
  }

  connectedCallback() {
    this.render();
    this.findElements();
    this.updateTitle();
    this.updateBorder();
  }

  attributeChangedCallback(name: string) {
    if (!this.shadow) return;

    switch (name) {
      case 'label':
        this.updateTitle();
        break;
      case 'bordered':
        this.updateBorder();
        break;
    }
  }

  private render(): void {
    this.shadow.innerHTML = `<style>${baseStyles}${generatorSectionStyles}</style>${template}`;
  }

  private findElements(): void {
    this.elements.title = this.shadow.querySelector('.ttg-generator-section-title') || undefined;
    this.elements.content =
      this.shadow.querySelector('.ttg-generator-section-content') || undefined;
  }

  private updateTitle(): void {
    if (this.elements.title) {
      this.elements.title.textContent = this.label;
      // Скрываем заголовок если он пустой
      const header = this.shadow.querySelector('.ttg-generator-section-header') as HTMLElement;
      if (header) {
        header.style.display = this.label ? 'block' : 'none';
      }
    }
  }

  private updateBorder(): void {
    const section = this.shadow.querySelector('.ttg-generator-section');
    if (section) {
      section.classList.toggle('with-border', this.bordered);
    }
  }
}

customElements.define('ttg-generator-section', GeneratorSection);
