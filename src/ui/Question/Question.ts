import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import questionStyles from './Question.styles.css';

/**
 * Перечисление для размещения тултипа
 */
enum TooltipPlacement {
  ABOVE = 'above',
  BELOW = 'below',
}

/**
 * Константы для размеров и позиционирования тултипа
 */
const TOOLTIP_CONSTANTS = {
  // Размеры по умолчанию
  DEFAULT_WIDTH: 280 as const,
  DEFAULT_HEIGHT: 60 as const,

  // Отступы и расстояния
  VIEWPORT_PADDING: 10 as const,
  CONTAINER_GAP: 8 as const,
  HORIZONTAL_OFFSET: 21 as const,

  // Размеры стрелки
  ARROW_WIDTH: 12 as const,
  ARROW_HEIGHT: 6 as const,
  ARROW_RIGHT_OFFSET: 16 as const,
  ARROW_VERTICAL_OFFSET: -2 as const,
  ARROW_BELOW_OFFSET: -6 as const,

  // Анимация
  ANIMATION_DURATION: 300 as const,

  // Z-индекс
  PORTAL_Z_INDEX: '999999' as const,
} as const;

/**
 * Base64 данные для SVG стрелки тултипа
 */
const TOOLTIP_ARROW_SVG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTEiIHZpZXdCb3g9IjAgMCAxOCAxMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwLjU3ODEgOS4xMTEzM0M5LjU5NjI1IDkuOTEyMTIgOC4xNDc3MSA5Ljg1NDU5IDcuMjMyNDIgOC45Mzk0NUwxLjc5Mjk3IDMuNUwxNi4yMDcgMy41TDEwLjc2NzYgOC45Mzk0NUwxMC41NzgxIDkuMTExMzNaIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjRDVENUQ1Ii8+CjxyZWN0IHdpZHRoPSIxOCIgaGVpZ2h0PSI0IiByeD0iMS41IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';

/**
 * Интерфейс для расчета позиции тултипа
 */
interface TooltipPosition {
  readonly top: number;
  readonly left: number;
  readonly placement: TooltipPlacement;
}

/**
 * Интерфейс для границ области просмотра
 */
interface ViewportBounds {
  readonly width: number;
  readonly height: number;
  readonly padding: number;
}

/**
 * Компонент тултипа с рендерингом через портал для предотвращения обрезания Shadow DOM.
 *
 * @element ttg-question
 *
 * @attr {string} tooltip - Текстовое содержимое тултипа
 *
 * @cssprop --ttg-question-tooltip-width - Ширина тултипа (по умолчанию: 280px)
 * @cssprop --ttg-question-tooltip-bg - Цвет фона тултипа
 * @cssprop --ttg-question-tooltip-border - Цвет границы тултипа
 * @cssprop --ttg-question-icon-color - Цвет иконки знака вопроса
 */
export class Question extends LitElement {
  static styles = [unsafeCSS(baseStyles), unsafeCSS(questionStyles)];

  @property({ type: String })
  accessor tooltip = '';

  @query('.ttg-question-container')
  private readonly container?: HTMLElement;

  private tooltipPortal: HTMLElement | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private isShowing: boolean = false;
  private cachedArrowElement: HTMLElement | null = null;

  protected firstUpdated(): void {
    this.setupTooltipEvents();
  }

  protected render(): TemplateResult {
    return html`
      <div class="ttg-question-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          class="ttg-question-icon"
        >
          <path
            d="M8 0.5C12.1421 0.5 15.5 3.85786 15.5 8C15.5 12.1421 12.1421 15.5 8 15.5C3.85786 15.5 0.5 12.1421 0.5 8C0.5 3.85786 3.85786 0.5 8 0.5ZM7.76758 11.0352C7.55735 11.0352 7.37615 11.1102 7.22559 11.2607C7.07516 11.4112 7.00006 11.5917 7 11.8018C7 12.0118 7.07527 12.1923 7.22559 12.3428C7.37615 12.4933 7.55735 12.5693 7.76758 12.5693C7.90936 12.5693 8.03692 12.5348 8.15039 12.4668C8.26687 12.3958 8.35955 12.302 8.42773 12.1855C8.49874 12.0691 8.53418 11.9409 8.53418 11.8018C8.53412 11.5917 8.45903 11.4112 8.30859 11.2607C8.15814 11.1103 7.9776 11.0353 7.76758 11.0352ZM8.00586 3.6543C7.5458 3.6543 7.12676 3.74507 6.74902 3.92676C6.37402 4.10858 6.07093 4.37207 5.84082 4.71582C5.61376 5.05941 5.48858 5.47245 5.46582 5.95508H6.54004C6.5628 5.62011 6.64626 5.34889 6.79102 5.1416C6.93582 4.93433 7.11628 4.78215 7.33203 4.68555C7.54794 4.58896 7.7729 4.54102 8.00586 4.54102C8.27286 4.54103 8.51566 4.59625 8.73438 4.70703C8.9531 4.81782 9.12811 4.97517 9.25879 5.17969C9.38947 5.38423 9.45508 5.62589 9.45508 5.9043C9.45508 6.12866 9.41445 6.33297 9.33496 6.51758C9.25826 6.70224 9.15305 6.86577 9.01953 7.00781C8.88607 7.14693 8.73588 7.26789 8.56836 7.37012C8.29 7.5377 8.05138 7.7211 7.85254 7.91992C7.65368 8.11879 7.50053 8.37917 7.39258 8.7002C7.28469 9.02117 7.22737 9.45269 7.22168 9.99512V10.0459H8.24414V9.99512C8.24983 9.64293 8.28731 9.34904 8.35547 9.11328C8.42365 8.87749 8.53303 8.67436 8.68359 8.50391C8.83413 8.33066 9.03427 8.16598 9.28418 8.00977C9.53417 7.85636 9.74769 7.6803 9.92383 7.48145C10.1027 7.28268 10.2383 7.0564 10.332 6.80371C10.4286 6.55087 10.4775 6.26758 10.4775 5.95508C10.4775 5.51204 10.3754 5.11701 10.1709 4.77051C9.9692 4.42393 9.68172 4.15101 9.30957 3.95215C8.94035 3.75341 8.50567 3.65431 8.00586 3.6543Z"
            fill="#D5D5D5"
          />
        </svg>
      </div>
    `;
  }

  private setupTooltipEvents(): void {
    if (!this.container) return;

    this.container.addEventListener('mouseenter', () => {
      this.showTooltipPortal();
    });

    this.container.addEventListener('mouseleave', () => {
      this.hideTooltipPortal();
    });
  }

  /**
   * Показывает портал тултипа с правильным позиционированием
   */
  private showTooltipPortal(): void {
    // Валидация: проверяем наличие и корректность tooltip
    if (!this.tooltip || typeof this.tooltip !== 'string' || this.tooltip.trim() === '') {
      console.warn(
        'Компонент Question: попытка показать тултип с пустым или некорректным содержимым',
      );
      return;
    }

    // Отменяем предыдущий таймер скрытия если он есть
    this.clearHideTimer();
    this.isShowing = true;

    if (!this.tooltipPortal) {
      this.createTooltipPortal();
    }

    // Проверяем, что портал успешно создан
    if (!this.tooltipPortal) {
      console.error('Компонент Question: не удалось создать портал тултипа');
      this.isShowing = false;
      return;
    }

    this.updateTooltipContent();
    this.positionTooltip();

    // Анимация появления
    if (this.tooltipPortal) {
      this.tooltipPortal.style.opacity = '1';
    }
  }

  private createTooltipPortal(): void {
    try {
      this.tooltipPortal = document.createElement('div');
      this.tooltipPortal.className = 'ttg-question-tooltip-portal';

      this.applyTooltipStyles();
      this.createTooltipArrow();

      if (!document.body) {
        console.warn('Компонент Question: document.body недоступен для создания портала');
        return;
      }

      document.body.appendChild(this.tooltipPortal);
    } catch (error) {
      console.error('Ошибка при создании портала тултипа:', error);
      this.tooltipPortal = null;
    }
  }

  private applyTooltipStyles(): void {
    if (!this.tooltipPortal) {
      console.warn('Компонент Question: попытка применить стили к несуществующему порталу');
      return;
    }

    try {
      Object.assign(this.tooltipPortal.style, {
        position: 'fixed',
        zIndex: TOOLTIP_CONSTANTS.PORTAL_Z_INDEX,
        width: `var(--ttg-question-tooltip-width, ${TOOLTIP_CONSTANTS.DEFAULT_WIDTH}px)`,
        backgroundColor: 'var(--ttg-question-tooltip-bg, #ffffff)',
        color: 'var(--ttg-question-tooltip-color, #616161)',
        padding: 'var(--ttg-question-tooltip-padding, 12px)',
        borderRadius: 'var(--ttg-question-tooltip-radius, 12px)',
        border: '1px solid var(--ttg-question-tooltip-border, #d5d5d5)',
        boxShadow:
          'var(--ttg-question-tooltip-shadow, 0px 12px 24px 0px rgba(138, 143, 147, 0.12), 0px 1px 2px 0px rgba(228, 229, 231, 0.24))',
        fontSize: 'var(--ttg-question-tooltip-font-size, 14px)',
        lineHeight: 'var(--ttg-question-tooltip-line-height, 20px)',
        fontFamily:
          'var(--ttg-question-tooltip-font-family, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        pointerEvents: 'none',
        opacity: '0',
        transition: `opacity ${TOOLTIP_CONSTANTS.ANIMATION_DURATION}ms ease`,
      });
    } catch (error) {
      console.error('Ошибка при применении стилей к порталу тултипа:', error);
    }
  }

  private createTooltipArrow(): void {
    if (!this.tooltipPortal) return;

    // Кешируем стрелку для повторного использования
    if (!this.cachedArrowElement) {
      this.cachedArrowElement = document.createElement('div');
      this.cachedArrowElement.className = 'ttg-question-tooltip-arrow';
      this.cachedArrowElement.style.cssText = `
        position: absolute;
        top: 100%;
        right: ${TOOLTIP_CONSTANTS.ARROW_RIGHT_OFFSET}px;
        transform: translate(-50%, ${TOOLTIP_CONSTANTS.ARROW_VERTICAL_OFFSET}px);
        background-position: center;
        background-size: cover;
        background-image: url('${TOOLTIP_ARROW_SVG}');
        width: ${TOOLTIP_CONSTANTS.ARROW_WIDTH}px;
        height: ${TOOLTIP_CONSTANTS.ARROW_HEIGHT}px;
        pointer-events: none;
      `;
    }

    this.tooltipPortal.appendChild(this.cachedArrowElement);
  }

  private updateTooltipContent(): void {
    if (!this.tooltipPortal) return;

    this.tooltipPortal.textContent = this.tooltip;

    // Повторно добавляем кешированную стрелку после обновления содержимого
    if (this.cachedArrowElement) {
      this.tooltipPortal.appendChild(this.cachedArrowElement);
    }
  }

  /**
   * Скрывает портал тултипа с анимацией
   */
  private hideTooltipPortal(): void {
    if (!this.tooltipPortal || !this.isShowing) return;

    this.isShowing = false;

    // Анимация исчезновения
    if (this.tooltipPortal) {
      this.tooltipPortal.style.opacity = '0';
    }

    // Сохраняем ссылку на таймер для возможности отмены
    this.hideTimer = window.setTimeout((): void => {
      // Проверяем, что тултип все еще нужно скрыть
      if (!this.isShowing) {
        this.removeTooltipPortal();
      }
      this.hideTimer = null;
    }, TOOLTIP_CONSTANTS.ANIMATION_DURATION);
  }

  private clearHideTimer(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  private removeTooltipPortal(): void {
    if (!this.tooltipPortal) return;

    try {
      if (this.tooltipPortal.parentNode) {
        this.tooltipPortal.parentNode.removeChild(this.tooltipPortal);
      }
    } catch (error) {
      console.error('Ошибка при удалении портала тултипа:', error);
    } finally {
      this.tooltipPortal = null;
    }

    // Не очищаем cachedArrowElement, чтобы повторно использовать при следующем показе
  }

  private positionTooltip(): void {
    if (!this.tooltipPortal || !this.container) return;

    const position = this.calculateOptimalPosition();
    this.applyTooltipPosition(position);
    this.adjustArrowPosition(position.placement);
  }

  /**
   * Рассчитывает оптимальную позицию для тултипа
   */
  private calculateOptimalPosition(): TooltipPosition {
    const positionData = this.getPositionCalculationData();
    if (!positionData) {
      return this.getDefaultPosition();
    }

    const { containerRect, tooltipDimensions, viewport, gap } = positionData;

    // Определяем оптимальное вертикальное размещение
    const verticalPosition = this.determineVerticalPlacement(
      containerRect,
      tooltipDimensions,
      viewport,
      gap,
    );

    // Корректируем горизонтальную позицию
    const adjustedLeft = this.adjustHorizontalPosition(
      verticalPosition.left,
      tooltipDimensions.width,
      viewport,
    );

    return {
      ...verticalPosition,
      left: adjustedLeft,
    };
  }

  private getPositionCalculationData() {
    if (!this.container || !this.tooltipPortal) {
      return null;
    }

    try {
      return {
        containerRect: this.container.getBoundingClientRect(),
        tooltipDimensions: this.getTooltipDimensions(),
        viewport: this.getViewportBounds(),
        gap: TOOLTIP_CONSTANTS.CONTAINER_GAP,
      };
    } catch (error) {
      console.error('Ошибка при получении данных для расчета позиции:', error);
      return null;
    }
  }

  private getDefaultPosition(): TooltipPosition {
    return { top: 0, left: 0, placement: TooltipPlacement.ABOVE };
  }

  /**
   * Определяет оптимальное вертикальное размещение тултипа
   */
  private determineVerticalPlacement(
    containerRect: DOMRect,
    tooltipDimensions: { width: number; height: number },
    viewport: ViewportBounds,
    gap: number,
  ): TooltipPosition {
    // Сначала пытаемся позиционировать сверху (предпочтительно)
    const abovePosition = this.calculateAbovePosition(containerRect, tooltipDimensions, gap);

    // Проверяем коллизии и при необходимости размещаем снизу
    if (this.hasVerticalCollision(abovePosition, viewport)) {
      return this.calculateBelowPosition(containerRect, tooltipDimensions, gap);
    }

    return abovePosition;
  }

  private getTooltipDimensions(): { width: number; height: number } {
    if (!this.tooltipPortal) {
      return {
        width: TOOLTIP_CONSTANTS.DEFAULT_WIDTH,
        height: TOOLTIP_CONSTANTS.DEFAULT_HEIGHT,
      };
    }

    return {
      width: this.tooltipPortal.offsetWidth || TOOLTIP_CONSTANTS.DEFAULT_WIDTH,
      height: this.tooltipPortal.offsetHeight || TOOLTIP_CONSTANTS.DEFAULT_HEIGHT,
    };
  }

  private getViewportBounds(): ViewportBounds {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      padding: TOOLTIP_CONSTANTS.VIEWPORT_PADDING,
    };
  }

  private calculateAbovePosition(
    containerRect: DOMRect,
    tooltipDimensions: { width: number; height: number },
    gap: number,
  ): TooltipPosition {
    return {
      top: containerRect.top - tooltipDimensions.height - gap,
      left: containerRect.right + TOOLTIP_CONSTANTS.HORIZONTAL_OFFSET - tooltipDimensions.width,
      placement: TooltipPlacement.ABOVE,
    };
  }

  private calculateBelowPosition(
    containerRect: DOMRect,
    tooltipDimensions: { width: number; height: number },
    gap: number,
  ): TooltipPosition {
    return {
      top: containerRect.bottom + gap,
      left: containerRect.right + TOOLTIP_CONSTANTS.HORIZONTAL_OFFSET - tooltipDimensions.width,
      placement: TooltipPlacement.BELOW,
    };
  }

  private hasVerticalCollision(position: TooltipPosition, viewport: ViewportBounds): boolean {
    return position.top < viewport.padding;
  }

  private adjustHorizontalPosition(
    left: number,
    tooltipWidth: number,
    viewport: ViewportBounds,
  ): number {
    const minLeft: number = viewport.padding;
    const maxLeft: number = viewport.width - tooltipWidth - viewport.padding;

    if (left < minLeft) {
      return minLeft;
    }
    if (left > maxLeft) {
      return maxLeft;
    }
    return left;
  }

  private applyTooltipPosition(position: TooltipPosition): void {
    if (!this.tooltipPortal) return;

    this.tooltipPortal.style.left = `${position.left}px`;
    this.tooltipPortal.style.top = `${position.top}px`;
  }

  private adjustArrowPosition(placement: TooltipPlacement): void {
    if (!this.cachedArrowElement) return;

    if (placement === TooltipPlacement.BELOW) {
      this.cachedArrowElement.style.top = `${TOOLTIP_CONSTANTS.ARROW_BELOW_OFFSET}px`;
      this.cachedArrowElement.style.transform = 'translate(-50%, 0) rotate(180deg)';
    } else {
      this.cachedArrowElement.style.top = '100%';
      this.cachedArrowElement.style.transform = `translate(-50%, ${TOOLTIP_CONSTANTS.ARROW_VERTICAL_OFFSET}px)`;
    }
  }

  /**
   * Метод жизненного цикла Lit, вызываемый при удалении элемента из DOM
   */
  disconnectedCallback(): void {
    try {
      super.disconnectedCallback();

      // Очищаем все таймеры и немедленно удаляем портал
      this.clearHideTimer();
      this.isShowing = false;

      if (this.tooltipPortal) {
        this.removeTooltipPortal();
      }

      // Очищаем кеш при окончательном удалении компонента
      this.cachedArrowElement = null;
    } catch (error) {
      console.error('Ошибка при отключении компонента Question:', error);

      // Критическая очистка в случае ошибки
      try {
        this.clearHideTimer();
        if (this.tooltipPortal && this.tooltipPortal.parentNode) {
          this.tooltipPortal.parentNode.removeChild(this.tooltipPortal);
        }
        this.tooltipPortal = null;
        this.cachedArrowElement = null;
        this.isShowing = false;
      } catch (criticalError) {
        console.error('Критическая ошибка при очистке компонента Question:', criticalError);
      }
    }
  }
}

customElements.define('ttg-question', Question);
