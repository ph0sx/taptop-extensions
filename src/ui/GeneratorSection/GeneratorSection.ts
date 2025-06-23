import { styles } from './GeneratorSection.styles';
import { template } from './GeneratorSection.template';

export class GeneratorSection extends HTMLElement {
  private shadow: ShadowRoot;
  private elements: {
    title?: HTMLElement;
    content?: HTMLElement;
  } = {};

  static get observedAttributes() {
    return ['title', 'bordered'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  get title(): string {
    return this.getAttribute('title') || '';
  }

  set title(value: string) {
    this.setAttribute('title', value);
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
      case 'title':
        this.updateTitle();
        break;
      case 'bordered':
        this.updateBorder();
        break;
    }
  }

  private render(): void {
    this.shadow.innerHTML = `<style>${styles}</style>${template}`;
  }

  private findElements(): void {
    this.elements.title = this.shadow.querySelector('.ttg-generator-section-title') || undefined;
    this.elements.content =
      this.shadow.querySelector('.ttg-generator-section-content') || undefined;
  }

  private updateTitle(): void {
    if (this.elements.title) {
      this.elements.title.textContent = this.title;
      // Скрываем заголовок если он пустой
      const header = this.shadow.querySelector('.ttg-generator-section-header') as HTMLElement;
      if (header) {
        header.style.display = this.title ? 'block' : 'none';
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
