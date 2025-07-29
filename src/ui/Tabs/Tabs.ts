import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import tabsStyles from './Tabs.styles.css';
import type { Tab } from '../Tab/Tab.js';

@customElement('ttg-tabs')
export class Tabs extends LitElement {
  static styles = [unsafeCSS(baseStyles), unsafeCSS(tabsStyles)];

  @property({ type: String, attribute: 'active-tab' })
  accessor activeTab = '';

  @queryAssignedElements({ selector: 'ttg-tab' })
  private accessor tabs!: Tab[];

  protected firstUpdated(): void {
    this.initializeActiveTab();
  }

  protected render(): TemplateResult {
    return html`
      <div
        class="tabs-container"
        role="tablist"
        @click="${this.handleTabClick}"
        @keydown="${this.handleKeydown}"
      >
        <slot></slot>
      </div>
    `;
  }

  private handleTabClick(event: Event): void {
    const target = event.target as HTMLElement;
    const tabElement = target.closest('ttg-tab') as Tab;

    if (tabElement && tabElement.dataset.tab) {
      event.preventDefault();
      event.stopPropagation();

      const tabId = tabElement.dataset.tab;
      this.setActiveTab(tabId);
      this.dispatchTabChangeEvent(tabId);
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    const activeTabIndex = this.tabs.findIndex((tab) => tab.active);
    let nextIndex = activeTabIndex;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = activeTabIndex > 0 ? activeTabIndex - 1 : this.tabs.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = activeTabIndex < this.tabs.length - 1 ? activeTabIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = this.tabs.length - 1;
        break;
      default:
        return;
    }

    const nextTab = this.tabs[nextIndex];
    if (nextTab && nextTab.dataset.tab) {
      this.setActiveTab(nextTab.dataset.tab);
      nextTab.focus();
      this.dispatchTabChangeEvent(nextTab.dataset.tab);
    }
  }

  private setActiveTab(tabId: string): void {
    if (!this.isValidTabId(tabId)) {
      console.warn(`Tab with id "${tabId}" not found`);
      return;
    }
    this.activeTab = tabId;
  }

  private isValidTabId(tabId: string): boolean {
    return this.tabs.some((tab) => tab.dataset.tab === tabId);
  }

  private updateActiveTab(): void {
    this.tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === this.activeTab;
      tab.active = isActive;

      // Update ARIA attributes for better accessibility
      tab.setAttribute('aria-selected', isActive.toString());
      tab.setAttribute('tabindex', isActive ? '0' : '-1');

      // Link tab to its corresponding tabpanel
      if (tab.dataset.tab) {
        tab.setAttribute('aria-controls', `${tab.dataset.tab}-panel`);
      }
    });
  }

  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('activeTab')) {
      this.updateActiveTab();
    }
  }

  private initializeActiveTab(): void {
    const activeTab = this.tabs.find((tab) => tab.active);
    if (activeTab && activeTab.dataset.tab) {
      this.activeTab = activeTab.dataset.tab;
    } else if (this.tabs.length > 0) {
      const firstTab = this.tabs[0];
      if (firstTab.dataset.tab) {
        this.activeTab = firstTab.dataset.tab;
        firstTab.active = true;
      }
    }
  }

  public switchTab(tabId: string): void {
    if (!this.isValidTabId(tabId)) {
      console.warn(`Tab with id "${tabId}" not found`);
      return;
    }
    this.setActiveTab(tabId);
    this.dispatchTabChangeEvent(tabId);
  }

  private dispatchTabChangeEvent(tabId: string): void {
    this.dispatchEvent(
      new CustomEvent('tab-change', {
        detail: { tabId },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
