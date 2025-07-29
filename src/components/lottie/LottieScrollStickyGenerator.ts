import { html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { BaseGenerator, type GeneratorConfig } from '../base/BaseGenerator.js';
import {
  ReactiveValidationController,
  type ValidationRuleMap,
} from '../../controllers/ReactiveValidationController.js';
import lottieScrollStickyStyles from './LottieScrollStickyGenerator.styles.css';

// UI компоненты
import '../../ui/Generator/Generator.js';
import '../../ui/Input/Input.js';
import '../../ui/Button/Button.js';
import '../../ui/GeneratorSection/GeneratorSection.js';
import '../../ui/Question/Question.js';

// Типы для конфигурации
interface LottieScrollStickyRule {
  id: string;
  lottieUrl: string;
  targetClass: string;
  startFrame: number;
  endFrame: number | 'last';
}

// Конфигурация для BaseGenerator compatibility
interface LottieScrollStickyFormData extends GeneratorConfig {
  rulesData: string; // Serialized rules for GeneratorConfig compatibility
}

// Внутренняя типизированная конфигурация для состояния компонента
interface LottieScrollStickyConfig {
  rules: LottieScrollStickyRule[];
}

// Чистые типы без ID для генерации кода
type CleanLottieScrollStickyRule = Omit<LottieScrollStickyRule, 'id'>;

interface CleanLottieScrollStickyConfig {
  rules: CleanLottieScrollStickyRule[];
}

@customElement('lottie-scroll-sticky-generator')
export default class LottieScrollStickyGenerator extends BaseGenerator {
  static styles = [...BaseGenerator.styles, unsafeCSS(lottieScrollStickyStyles)];

  // Lit состояние
  @state() private accessor config: LottieScrollStickyConfig = {
    rules: [
      {
        id: this.generateId(),
        lottieUrl: 'https://assets5.lottiefiles.com/packages/lf20_FISfBK.json',
        targetClass: 'lottie-container-scroll-sticky-1',
        startFrame: 0,
        endFrame: 'last',
      },
    ],
  };

  // Реактивная валидация
  private validationController = new ReactiveValidationController<LottieScrollStickyConfig>(this, {
    getState: () => this.config,
    getRules: () => this.getValidationRules(),
    extractValue: (state, fieldId) => this.extractFieldValue(state, fieldId),
  });

  private get isFormValid(): boolean {
    return this.validationController.getFormState().isValid;
  }

  firstUpdated(): void {
    super.firstUpdated();
  }

  protected renderContent(): TemplateResult {
    return html`
      <ttg-generator ?form-valid="${this.isFormValid}">
        <ttg-generator-section>
          <div class="cards-container">
            ${repeat(
              this.config.rules,
              (rule) => rule.id,
              (rule, index) => this.renderRuleCard(rule, index + 1),
            )}
          </div>
        </ttg-generator-section>
        <div class="add-button-container">
          <ttg-button variant="secondary" @click="${this.addRule}">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 5V19M5 12H19"></path>
            </svg>
            <span>Добавить анимацию</span>
          </ttg-button>
        </div>
      </ttg-generator>
    `;
  }

  /**
   * Реализация абстрактного метода - генерирует правила валидации на основе текущего состояния
   */
  protected getValidationRules(): ValidationRuleMap {
    const rules: ValidationRuleMap = {};

    this.config.rules.forEach((rule) => {
      // Правила для URL анимации
      rules[`lottie-url-${rule.id}`] = [{ type: 'required', message: 'URL анимации обязателен' }];

      // Правила для класса элемента
      rules[`target-class-${rule.id}`] = [
        { type: 'required', message: 'Класс элемента обязателен' },
        {
          type: 'pattern',
          message: 'Класс содержит недопустимые символы',
          options: { pattern: /^[a-zA-Z0-9_-]+$/ },
        },
      ];

      // Правила для начального кадра
      rules[`start-frame-${rule.id}`] = [
        {
          type: 'pattern',
          message: 'Начальный кадр должен быть числом',
          options: { pattern: /^\d+$/ },
        },
      ];

      // Правила для конечного кадра
      rules[`end-frame-${rule.id}`] = [
        {
          type: 'pattern',
          message: 'Конечный кадр должен быть числом или "last"',
          options: { pattern: /^(\d+|last)$/ },
        },
      ];
    });

    return rules;
  }

  /**
   * Извлекает значение поля из состояния компонента
   */
  private extractFieldValue(state: LottieScrollStickyConfig, fieldId: string): string {
    // Парсим ID поля чтобы понять к какому правилу он относится
    const urlMatch = fieldId.match(/^lottie-url-(.+)$/);
    const classMatch = fieldId.match(/^target-class-(.+)$/);
    const startFrameMatch = fieldId.match(/^start-frame-(.+)$/);
    const endFrameMatch = fieldId.match(/^end-frame-(.+)$/);

    if (urlMatch) {
      const ruleId = urlMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.lottieUrl || '';
    }

    if (classMatch) {
      const ruleId = classMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.targetClass || '';
    }

    if (startFrameMatch) {
      const ruleId = startFrameMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.startFrame.toString() || '0';
    }

    if (endFrameMatch) {
      const ruleId = endFrameMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.endFrame.toString() || 'last';
    }

    return '';
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private updateConfig(newConfig: LottieScrollStickyConfig): void {
    this.config = newConfig;
  }

  // Методы для управления правилами
  private addRule(): void {
    const newRule: LottieScrollStickyRule = {
      id: this.generateId(),
      lottieUrl: 'https://assets5.lottiefiles.com/packages/lf20_FISfBK.json',
      targetClass: `lottie-container-scroll-sticky-${this.config.rules.length + 1}`,
      startFrame: 0,
      endFrame: 'last',
    };

    this.updateConfig({
      ...this.config,
      rules: [...this.config.rules, newRule],
    });
  }

  private removeRule(id: string): void {
    // Предотвращаем удаление последнего правила
    if (this.config.rules.length <= 1) {
      return;
    }

    this.updateConfig({
      ...this.config,
      rules: this.config.rules.filter((rule) => rule.id !== id),
    });
  }

  // Обновление полей правила
  private updateRule(
    id: string,
    field: keyof Omit<LottieScrollStickyRule, 'id'>,
    value: string | number,
  ): void {
    const updated = this.config.rules.map((rule) => {
      if (rule.id === id) {
        return { ...rule, [field]: value };
      }
      return rule;
    });
    this.updateConfig({ ...this.config, rules: updated });
  }

  // Рендер карточки правила
  private renderRuleCard(rule: LottieScrollStickyRule, index: number): TemplateResult {
    const canRemove = this.config.rules.length > 1;

    return html`
      <div class="card">
        <div class="rule-block">
          <div class="rule-header">
            <div class="rule-title">
              <div class="rule-title-text">Анимация</div>
              <div class="rule-number">
                <div class="rule-number-text">${index}</div>
              </div>
            </div>
            ${canRemove
              ? html`
                  <button
                    class="remove-btn"
                    @click="${() => this.removeRule(rule.id)}"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M14.9999 14.9999L10 10M10 10L5 5M10 10L15 5M10 10L5 15"
                        stroke="#A9A9A9"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                `
              : ''}
          </div>
          <div class="rule-main">
            <ttg-input
              id="lottie-url-${rule.id}"
              label="URL анимации (.json/.lottie)"
              placeholder="https://example.com/animation.json"
              .value="${rule.lottieUrl}"
              required
              .error="${this.validationController.getFieldState(`lottie-url-${rule.id}`)?.error ??
              ''}"
              tooltip="Прямая ссылка на файл Lottie анимации"
              @update-value="${(e: CustomEvent) => {
                this.updateRule(rule.id, 'lottieUrl', e.detail.value);
              }}"
              @field-blur="${() => this.validationController.touchField(`lottie-url-${rule.id}`)}"
            >
            </ttg-input>
            <ttg-input
              id="target-class-${rule.id}"
              label="Класс (источник стилей) целевого элемента"
              placeholder="lottie-container-scroll-sticky"
              .value="${rule.targetClass}"
              required
              .error="${this.validationController.getFieldState(`target-class-${rule.id}`)?.error ??
              ''}"
              tooltip="УНИКАЛЬНЫЙ класс, который вы присвоили элементу Div Block в редакторе Taptop."
              @update-value="${(e: CustomEvent) => {
                this.updateRule(rule.id, 'targetClass', e.detail.value);
              }}"
              @field-blur="${() => this.validationController.touchField(`target-class-${rule.id}`)}"
            >
            </ttg-input>
          </div>

          <details class="advanced-settings">
            <summary class="advanced-settings-toggle">Дополнительные настройки</summary>
            <div class="advanced-settings-content">
              <ttg-input
                id="start-frame-${rule.id}"
                label="Начальный кадр"
                placeholder="0"
                .value="${rule.startFrame.toString()}"
                .error="${this.validationController.getFieldState(`start-frame-${rule.id}`)
                  ?.error ?? ''}"
                tooltip="Кадр, с которого начнётся анимация (по умолчанию: 0)"
                @update-value="${(e: CustomEvent) => {
                  const value = parseInt(e.detail.value) || 0;
                  this.updateRule(rule.id, 'startFrame', value);
                }}"
                @field-blur="${() =>
                  this.validationController.touchField(`start-frame-${rule.id}`)}"
              >
              </ttg-input>
              <ttg-input
                id="end-frame-${rule.id}"
                label="Конечный кадр"
                placeholder="last"
                .value="${rule.endFrame.toString()}"
                .error="${this.validationController.getFieldState(`end-frame-${rule.id}`)?.error ??
                ''}"
                tooltip="Кадр, на котором закончится анимация. Введите 'last' для последнего кадра"
                @update-value="${(e: CustomEvent) => {
                  const value = e.detail.value;
                  this.updateRule(
                    rule.id,
                    'endFrame',
                    value === 'last' ? 'last' : parseInt(value) || 0,
                  );
                }}"
                @field-blur="${() => this.validationController.touchField(`end-frame-${rule.id}`)}"
              >
              </ttg-input>
            </div>
          </details>
        </div>
      </div>
    `;
  }

  // Валидация и сбор данных
  protected collectData(): LottieScrollStickyFormData | null {
    // Используем ReactiveValidationController для валидации
    const formState = this.validationController.getFormState();
    if (!formState.isValid) {
      // Принудительная валидация для показа ошибок
      this.validationController.forceValidateForm();
      return null;
    }

    // Проверяем, что есть хотя бы одно правило
    if (this.config.rules.length === 0) {
      alert('Добавьте хотя бы одну анимацию для генерации кода');
      return null;
    }

    // Convert internal config to GeneratorConfig-compatible format
    return {
      rulesData: JSON.stringify(this.config.rules),
    };
  }

  // Удаляем ID поля из конфигурации для генерации чистого объекта
  private removeIdsFromConfig(config: LottieScrollStickyConfig): CleanLottieScrollStickyConfig {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rules: config.rules.map(({ id: _id, ...rest }) => rest),
    };
  }

  protected generateCode(settings: LottieScrollStickyFormData): string {
    // Parse back from serialized format
    const config: LottieScrollStickyConfig = {
      rules: JSON.parse(settings.rulesData || '[]'),
    };

    // Удаляем ID поля
    const cleanConfig = this.removeIdsFromConfig(config);
    const configJson = JSON.stringify(
      cleanConfig.rules.map((rule) => ({
        url: rule.lottieUrl,
        targetClass: rule.targetClass,
        startFrame: rule.startFrame,
        endFrame: rule.endFrame,
        startScroll: 0,
        endScroll: 1,
      })),
      null,
      2,
    );

    return `
<script type="module" defer>
  // Загружаем необходимые библиотеки
  const loadScripts = async () => {
    const scripts = [
      'https://unpkg.com/@lottiefiles/lottie-player@2.0.4/dist/lottie-player.js',
      'https://unpkg.com/@lottiefiles/lottie-interactivity@1.6.2/dist/lottie-interactivity.min.js',
    ];
    
    for (const src of scripts) {
      if (!document.querySelector(\`script[src="\${src}"]\`)) {
        const script = document.createElement('script');
        script.src = src;
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
    }
  };

  // Конфигурации анимаций
  const lottieConfigs = ${configJson};

  // Инициализация sticky анимации
  const initLottieScrollAnimation = (config) => {
    const containers = document.querySelectorAll('.' + config.targetClass);
    
    containers.forEach((container, index) => {
      // Проверяем, не создан ли уже плеер
      if (container.querySelector('lottie-player')) return;
      
      // Создаём уникальный ID для плеера
      const playerId = 'lottie-scroll-' + config.targetClass + '-' + index + '-' + Date.now();
      
      // Создаём плеер
      const player = document.createElement('lottie-player');
      player.id = playerId;
      player.src = config.url;
      player.style.width = '100%';
      player.style.height = '100%';
      player.setAttribute('background', 'transparent');
      
      container.appendChild(player);
      
      let isActive = false;
      
      // Настраиваем sticky анимацию после загрузки плеера
      player.addEventListener('ready', () => {
        try {
          // Получаем количество кадров для обработки 'last'
          const totalFrames = player.getLottie().totalFrames;
          const endFrame = config.endFrame === 'last' ? totalFrames - 1 : config.endFrame;
          
          // Функция проверки активации анимации
          const checkActivation = () => {
            const rect = container.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            const visibleTop = Math.max(rect.top, 0);
            const visibleBottom = Math.min(rect.bottom, windowHeight);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visibilityRatio = visibleHeight / rect.height;
            
            if (visibilityRatio >= 0.3) {
              if (!isActive) {
                player.seek(config.startFrame);
                isActive = true;
              }
            } else {
              if (isActive) {
                isActive = false;
                player.seek(config.startFrame);
              }
            }
          };
          
          // Обработчик скролла
          window.addEventListener('scroll', () => {
            checkActivation();
            
            if (!isActive) return;
            
            const rect = container.getBoundingClientRect();
            const parentRect = container.parentElement.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            let progress = 0;
            
            // Проверяем, является ли родитель sticky
            if (getComputedStyle(container.parentElement).position === 'sticky') {
              const scrollY = window.scrollY;
              
              // Ищем родительский контейнер с высотой больше viewport
              let parentContainer = container.parentElement;
              while (parentContainer && parentContainer !== document.body) {
                const containerHeight = parentContainer.offsetHeight;
                const viewportHeight = window.innerHeight;
                
                if (containerHeight > viewportHeight) {
                  break;
                }
                parentContainer = parentContainer.parentElement;
              }
              
              if (!parentContainer || parentContainer === document.body) {
                parentContainer = document.body;
              }
              
              const parentContainerRect = parentContainer.getBoundingClientRect();
              const parentContainerTop = scrollY + parentContainerRect.top;
              const parentContainerHeight = parentContainer.offsetHeight;
              
              const scrollStart = parentContainerTop;
              const scrollEnd = parentContainerTop + parentContainerHeight - windowHeight;
              const scrollProgress = (scrollY - scrollStart) / (scrollEnd - scrollStart);
              progress = Math.max(0, Math.min(1, scrollProgress));
            }
            
            // Рассчитываем кадр на основе прогресса
            const frame = Math.round(config.startFrame + (endFrame - config.startFrame) * progress);
            player.seek(frame);
          });
          
          // Проверяем активацию при загрузке
          checkActivation();
          
        } catch (error) {
          console.error('Taptop Lottie Scroll Sticky: ошибка настройки анимации для ' + config.targetClass, error);
        }
      });
    });
  };

  // Основная функция инициализации
  const init = async () => {
    try {
      await loadScripts();
      
      // Небольшая задержка для гарантии загрузки библиотек
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Инициализируем каждую конфигурацию
      lottieConfigs.forEach(initLottieScrollAnimation);
    } catch (error) {
      console.error('Taptop Lottie Scroll Sticky: ошибка инициализации', error);
    }
  };

  // Запускаем после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
</script>
`;
  }
}
