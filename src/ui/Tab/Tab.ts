import { initGlobalStyles } from '../../utils/global-styles';

export class Tab extends HTMLElement {
  static get observedAttributes() {
    return ['active'];
  }

  private elements: {
    tab?: HTMLElement;
  } = {};

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    initGlobalStyles();
  }

  get active(): boolean {
    return this.hasAttribute('active');
  }

  set active(value: boolean) {
    if (value) {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    }
  }

  connectedCallback() {
    this.render();
    this.findElements();
  }

  attributeChangedCallback(name: string) {
    if (this.shadowRoot) {
      switch (name) {
        case 'active':
          this.updateActiveState();
          break;
      }
    }
  }

  private render() {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: inline-block;
          box-sizing: border-box;
        }
        
        :host *, :host *::before, :host *::after {
          box-sizing: inherit;
        }

        .tab {
          background: transparent;
          border: none;
          color: var(--ttg-color-text-gray-700);
          cursor: pointer;
          font-family: var(--ttg-font-family);
          font-size: var(--ttg-text-size-s);
          font-weight: 500;
          letter-spacing: -0.28px;
          line-height: var(--ttg-text-line-height-s);
          padding: 0;
          position: relative;
          text-align: center;
          transition: color 0.2s ease;
          white-space: nowrap;
        }

        .tab.active {
          color: var(--ttg-color-text-black);
        }

        .tab.active::after {
          background: var(--ttg-color-bg-blue-base);
          border-radius: 1px;
          bottom: -14px;
          content: '';
          height: 2px;
          left: 0;
          position: absolute;
          right: 0;
        }

        .tab:hover:not(.active) {
          color: var(--ttg-color-text-gray-900);
        }
      </style>
      
      <button type="button" class="tab">
        <slot></slot>
      </button>
    `;
  }

  private findElements() {
    this.elements.tab = this.shadowRoot?.querySelector('.tab') || undefined;
  }

  private updateActiveState() {
    const tab = this.elements.tab;
    if (tab) {
      tab.classList.toggle('active', this.active);
    }
  }
}

customElements.define('ttg-tab', Tab);
