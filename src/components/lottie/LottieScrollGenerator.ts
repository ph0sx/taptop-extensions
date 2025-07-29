import { html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { BaseGenerator, type GeneratorConfig } from '../base/BaseGenerator.js';
import {
  ReactiveValidationController,
  type ValidationRuleMap,
} from '../../controllers/ReactiveValidationController.js';
import lottieScrollStyles from './LottieScrollGenerator.styles.css';

// UI компоненты
import '../../ui/Generator/Generator.js';
import '../../ui/Input/Input.js';
import '../../ui/Button/Button.js';
import '../../ui/GeneratorSection/GeneratorSection.js';
import '../../ui/Question/Question.js';

// Типы для конфигурации
interface LottieScrollRule {
  id: string;
  lottieUrl: string;
  targetClass: string;
  startFrame: number;
  endFrame: number | 'last';
  startScroll: number; // 0-1
  endScroll: number; // 0-1
}

// Конфигурация для BaseGenerator compatibility
interface LottieScrollFormData extends GeneratorConfig {
  rulesData: string; // Serialized rules for GeneratorConfig compatibility
}

// Внутренняя типизированная конфигурация для состояния компонента
interface LottieScrollConfig {
  rules: LottieScrollRule[];
}

// Чистые типы без ID для генерации кода
type CleanLottieScrollRule = Omit<LottieScrollRule, 'id'>;

interface CleanLottieScrollConfig {
  rules: CleanLottieScrollRule[];
}

@customElement('lottie-scroll-generator')
export default class LottieScrollGenerator extends BaseGenerator {
  static styles = [...BaseGenerator.styles, unsafeCSS(lottieScrollStyles)];

  // Lit состояние
  @state() private accessor config: LottieScrollConfig = {
    rules: [
      {
        id: this.generateId(),
        lottieUrl: 'https://assets5.lottiefiles.com/packages/lf20_FISfBK.json',
        targetClass: 'lottie-container-scroll-1',
        startFrame: 0,
        endFrame: 'last',
        startScroll: 0,
        endScroll: 1.0,
      },
    ],
  };

  // Реактивная валидация
  private validationController = new ReactiveValidationController<LottieScrollConfig>(this, {
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

      // Правила для начала скролла
      rules[`start-scroll-${rule.id}`] = [
        {
          type: 'pattern',
          message: 'Значение должно быть от 0 до 1',
          options: { pattern: /^(0|1|0\.\d+)$/ },
        },
      ];

      // Правила для конца скролла
      rules[`end-scroll-${rule.id}`] = [
        {
          type: 'pattern',
          message: 'Значение должно быть от 0 до 1',
          options: { pattern: /^(0|1|0\.\d+)$/ },
        },
      ];
    });

    return rules;
  }

  /**
   * Извлекает значение поля из состояния компонента
   */
  private extractFieldValue(state: LottieScrollConfig, fieldId: string): string {
    // Парсим ID поля чтобы понять к какому правилу он относится
    const urlMatch = fieldId.match(/^lottie-url-(.+)$/);
    const classMatch = fieldId.match(/^target-class-(.+)$/);
    const startFrameMatch = fieldId.match(/^start-frame-(.+)$/);
    const endFrameMatch = fieldId.match(/^end-frame-(.+)$/);
    const startScrollMatch = fieldId.match(/^start-scroll-(.+)$/);
    const endScrollMatch = fieldId.match(/^end-scroll-(.+)$/);

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

    if (startScrollMatch) {
      const ruleId = startScrollMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.startScroll.toString() || '0';
    }

    if (endScrollMatch) {
      const ruleId = endScrollMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.endScroll.toString() || '1';
    }

    return '';
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private updateConfig(newConfig: LottieScrollConfig): void {
    this.config = newConfig;
  }

  // Методы для управления правилами
  private addRule(): void {
    const newRule: LottieScrollRule = {
      id: this.generateId(),
      lottieUrl: 'https://assets5.lottiefiles.com/packages/lf20_FISfBK.json',
      targetClass: `lottie-container-scroll-${this.config.rules.length + 1}`,
      startFrame: 0,
      endFrame: 'last',
      startScroll: 0,
      endScroll: 1.0,
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
    field: keyof Omit<LottieScrollRule, 'id'>,
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
  private renderRuleCard(rule: LottieScrollRule, index: number): TemplateResult {
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
              placeholder="lottie-container-scroll"
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
              <ttg-input
                id="start-scroll-${rule.id}"
                label="Начало зоны скролла"
                placeholder="0"
                .value="${rule.startScroll.toString()}"
                .error="${this.validationController.getFieldState(`start-scroll-${rule.id}`)
                  ?.error ?? ''}"
                tooltip="Где начинается анимация относительно viewport (0 = верх экрана, 1 = низ экрана)"
                @update-value="${(e: CustomEvent) => {
                  const value = parseFloat(e.detail.value) || 0;
                  this.updateRule(rule.id, 'startScroll', Math.min(Math.max(value, 0), 1));
                }}"
                @field-blur="${() =>
                  this.validationController.touchField(`start-scroll-${rule.id}`)}"
              >
              </ttg-input>
              <ttg-input
                id="end-scroll-${rule.id}"
                label="Конец зоны скролла"
                placeholder="1.0"
                .value="${rule.endScroll.toString()}"
                .error="${this.validationController.getFieldState(`end-scroll-${rule.id}`)?.error ??
                ''}"
                tooltip="Где заканчивается анимация относительно viewport (0 = верх экрана, 1 = низ экрана)"
                @update-value="${(e: CustomEvent) => {
                  const value = parseFloat(e.detail.value) || 1;
                  this.updateRule(rule.id, 'endScroll', Math.min(Math.max(value, 0), 1));
                }}"
                @field-blur="${() => this.validationController.touchField(`end-scroll-${rule.id}`)}"
              >
              </ttg-input>
            </div>
          </details>
        </div>
      </div>
    `;
  }

  // Валидация и сбор данных
  protected collectData(): LottieScrollFormData | null {
    // Используем ReactiveValidationController для валидации
    const formState = this.validationController.getFormState();
    if (!formState.isValid) {
      // Принудительная валидация для показа ошибок
      this.validationController.forceValidateForm();
      return null;
    }

    // Дополнительная валидация диапазонов скролла
    for (const rule of this.config.rules) {
      if (rule.startScroll >= rule.endScroll) {
        alert('Начало скролла должно быть меньше конца скролла');
        return null;
      }
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
  private removeIdsFromConfig(config: LottieScrollConfig): CleanLottieScrollConfig {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rules: config.rules.map(({ id: _id, ...rest }) => rest),
    };
  }

  protected generateCode(settings: LottieScrollFormData): string {
    // Parse back from serialized format
    const config: LottieScrollConfig = {
      rules: JSON.parse(settings.rulesData || '[]'),
    };

    // Удаляем ID поля
    const cleanConfig = this.removeIdsFromConfig(config);
    const configJson = JSON.stringify(cleanConfig.rules, null, 2);

    return `
<script type="module" defer>
  // Загружаем необходимые библиотеки
  const loadScripts = async () => {
    const scripts = [
      'https://unpkg.com/@lottiefiles/lottie-player@2.0.4/dist/lottie-player.js',
      'https://unpkg.com/@lottiefiles/lottie-interactivity@1.6.2/dist/lottie-interactivity.min.js'
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

  // Инициализация анимации
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
      player.src = config.lottieUrl;
      player.style.width = '100%';
      player.style.height = '100%';
      player.setAttribute('background', 'transparent');
      
      container.appendChild(player);
      
      // Настраиваем интерактивность после загрузки плеера
      player.addEventListener('ready', () => {
        try {
          // Получаем количество кадров для обработки 'last'
          const totalFrames = player.getLottie().totalFrames;
          const endFrame = config.endFrame === 'last' ? totalFrames - 1 : config.endFrame;
          
          LottieInteractivity.create({
            mode: "scroll",
            player: '#' + playerId,
            actions: [{
              visibility: [config.startScroll, config.endScroll],
              type: "seek",
              frames: [config.startFrame, endFrame]
            }]
          });
        } catch (error) {
          console.error('Taptop Lottie Scroll: ошибка настройки интерактивности для ' + config.targetClass, error);
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
      console.error('Taptop Lottie Scroll: ошибка инициализации', error);
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
