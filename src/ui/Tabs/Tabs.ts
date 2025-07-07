import baseStyles from '../../styles/base.css';
import tabsStyles from './Tabs.styles.css';
import { tabsTemplate } from './Tabs.template';

export class Tabs extends HTMLElement {
  private shadow: ShadowRoot;
  private _activeTab: string = '';

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  get activeTab(): string {
    return this._activeTab;
  }

  set activeTab(value: string) {
    this._activeTab = value;
    this.updateActiveTab();
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.initializeActiveTab();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        ${baseStyles}
        ${tabsStyles}
      </style>
      ${tabsTemplate}
    `;
  }

  private setupEventListeners() {
    this.addEventListener('click', this.handleTabClick.bind(this));
  }

  private cleanup() {
    this.removeEventListener('click', this.handleTabClick.bind(this));
  }

  private handleTabClick(event: Event) {
    const target = event.target as HTMLElement;
    const tabElement = target.closest('ttg-tab') as HTMLElement;

    if (tabElement && tabElement.dataset.tab) {
      event.preventDefault();
      event.stopPropagation();

      const tabId = tabElement.dataset.tab;
      this.setActiveTab(tabId);

      // Dispatch custom event for parent components to listen to
      this.dispatchEvent(
        new CustomEvent('tab-change', {
          detail: { tabId },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private setActiveTab(tabId: string) {
    this._activeTab = tabId;
    this.updateActiveTab();
  }

  private updateActiveTab() {
    // Remove active attribute from all tabs
    const tabs = this.querySelectorAll('ttg-tab');
    tabs.forEach((tab) => {
      tab.removeAttribute('active');
    });

    // Set active attribute on the selected tab
    if (this._activeTab) {
      const activeTab = this.querySelector(`ttg-tab[data-tab="${this._activeTab}"]`);
      if (activeTab) {
        activeTab.setAttribute('active', '');
      }
    }
  }

  private initializeActiveTab() {
    // Find the tab with active attribute or use the first tab
    const activeTab = this.querySelector('ttg-tab[active]') as HTMLElement;
    if (activeTab && activeTab.dataset.tab) {
      this._activeTab = activeTab.dataset.tab;
    } else {
      // Use first tab as default
      const firstTab = this.querySelector('ttg-tab') as HTMLElement;
      if (firstTab && firstTab.dataset.tab) {
        this._activeTab = firstTab.dataset.tab;
        firstTab.setAttribute('active', '');
      }
    }
  }

  // Public method to programmatically change active tab
  public switchTab(tabId: string) {
    this.setActiveTab(tabId);

    // Dispatch the same event as click would
    this.dispatchEvent(
      new CustomEvent('tab-change', {
        detail: { tabId },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define('ttg-tabs', Tabs);
