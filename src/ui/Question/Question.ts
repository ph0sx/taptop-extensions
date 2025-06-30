import baseStyles from '../../styles/base.css';
import questionStyles from './Question.styles.css';
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
  private tooltipPortal: HTMLElement | null = null;

  static get observedAttributes() {
    return ['tooltip'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `<style>${baseStyles}${questionStyles}</style>${template}`;

    this.elements.container = this.shadowRoot!.querySelector('.ttg-question-container');
    this.elements.tooltip = this.shadowRoot!.querySelector('.ttg-question-tooltip');

    this.setupTooltipEvents();
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
        if (this.tooltipPortal) {
          this.tooltipPortal.textContent = newValue;
        }
        break;
    }
  }

  private setupTooltipEvents() {
    if (!this.elements.container) return;

    this.elements.container.addEventListener('mouseenter', () => {
      this.showTooltipPortal();
    });

    this.elements.container.addEventListener('mouseleave', () => {
      this.hideTooltipPortal();
    });
  }

  private showTooltipPortal() {
    if (!this.tooltip) return;

    // Create portal if it doesn't exist
    if (!this.tooltipPortal) {
      this.tooltipPortal = document.createElement('div');
      this.tooltipPortal.className = 'ttg-question-tooltip-portal';
      this.tooltipPortal.textContent = this.tooltip;

      // Apply styles directly to ensure they work across different contexts
      Object.assign(this.tooltipPortal.style, {
        position: 'fixed',
        zIndex: '999999',
        width: '280px',
        backgroundColor: '#f8f8f8',
        background: '#ffffff',
        color: '#616161',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid #d5d5d5',
        boxShadow:
          '0px 12px 24px 0px rgba(138, 143, 147, 0.12), 0px 1px 2px 0px rgba(228, 229, 231, 0.24)',
        fontSize: '14px',
        lineHeight: '20px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 0.3s ease',
      });

      // Add arrow pseudo-element
      const arrow = document.createElement('div');
      arrow.style.cssText = `
        position: absolute;
        top: 100%;
        right: 16px;
        transform: translate(-50%, -2px);
        background-position: center;
        background-size: cover;
        background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTEiIHZpZXdCb3g9IjAgMCAxOCAxMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwLjU3ODEgOS4xMTEzM0M5LjU5NjI1IDkuOTEyMTIgOC4xNDc3MSA5Ljg1NDU5IDcuMjMyNDIgOC45Mzk0NUwxLjc5Mjk3IDMuNUwxNi4yMDcgMy41TDEwLjc2NzYgOC45Mzk0NUwxMC41NzgxIDkuMTExMzNaIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjRDVENUQ1Ii8+CjxyZWN0IHdpZHRoPSIxOCIgaGVpZ2h0PSI0IiByeD0iMS41IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K');
        width: 12px;
        height: 6px;
        pointer-events: none;
      `;
      this.tooltipPortal.appendChild(arrow);

      document.body.appendChild(this.tooltipPortal);
    }

    // Position tooltip
    this.positionTooltip();

    // Show tooltip
    this.tooltipPortal.style.opacity = '1';
  }

  private hideTooltipPortal() {
    if (this.tooltipPortal) {
      this.tooltipPortal.style.opacity = '0';
      setTimeout(() => {
        if (this.tooltipPortal && this.tooltipPortal.parentNode) {
          this.tooltipPortal.parentNode.removeChild(this.tooltipPortal);
          this.tooltipPortal = null;
        }
      }, 300);
    }
  }
  //TODO: Логику позиционирования тултипа сделать более разумной
  private positionTooltip() {
    if (!this.tooltipPortal || !this.elements.container) return;

    const containerRect = this.elements.container.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = this.tooltipPortal.offsetHeight || 60;
    const gap = 8;

    // Position above the container (matching original design)
    let top = containerRect.top - tooltipHeight - gap;
    // Position tooltip to the right with slight offset (matching original design)
    let left = containerRect.right + 21 - tooltipWidth;

    // Adjust if tooltip goes outside viewport bounds
    const viewportWidth = window.innerWidth;

    // Horizontal adjustment - ensure tooltip stays in viewport
    if (left < 10) {
      left = 10;
    } else if (left + tooltipWidth > viewportWidth - 10) {
      left = viewportWidth - tooltipWidth - 10;
    }

    // Vertical adjustment - if not enough space above, position below
    if (top < 10) {
      top = containerRect.bottom + gap;
      // When positioned below, flip the arrow
      const arrow = this.tooltipPortal.querySelector('div');
      if (arrow) {
        arrow.style.top = '-6px';
        arrow.style.transform = 'translate(-50%, 0) rotate(180deg)';
      }
    } else {
      // When positioned above, arrow stays at bottom
      const arrow = this.tooltipPortal.querySelector('div');
      if (arrow) {
        arrow.style.top = '100%';
        arrow.style.transform = 'translate(-50%, -2px)';
      }
    }

    this.tooltipPortal.style.left = `${left}px`;
    this.tooltipPortal.style.top = `${top}px`;
  }

  disconnectedCallback() {
    this.hideTooltipPortal();
  }
}

customElements.define('ttg-question', Question);
