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
  // Утилита для retry с экспоненциальной задержкой
  const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        console.warn(\`Taptop Lottie: Попытка \${attempt}/\${maxRetries} не удалась:\`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(\`Не удалось выполнить операцию после \${maxRetries} попыток: \${error.message}\`);
        }
        
        // Экспоненциальная задержка: 1s, 2s, 4s...
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  };

  // Проверка доступности URL
  const validateUrl = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      return true;
    } catch (error) {
      throw new Error(\`URL недоступен: \${error.message}\`);
    }
  };

  // Загружаем необходимые библиотеки с retry
  const loadScripts = async () => {
    const scripts = [
      'https://unpkg.com/@lottiefiles/lottie-player@2.0.4/dist/lottie-player.js',
      'https://unpkg.com/@lottiefiles/lottie-interactivity@1.6.2/dist/lottie-interactivity.min.js'
    ];
    
    for (const src of scripts) {
      if (!document.querySelector(\`script[src="\${src}"]\`)) {
        await retryWithBackoff(async () => {
          const script = document.createElement('script');
          script.src = src;
          
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(\`Таймаут загрузки скрипта: \${src}\`));
            }, 10000);
            
            script.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            
            script.onerror = () => {
              clearTimeout(timeout);
              reject(new Error(\`Ошибка загрузки скрипта: \${src}\`));
            };
            
            document.head.appendChild(script);
          });
        });
      }
    }
    
    // Ждём гарантированную инициализацию библиотек
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Проверяем доступность библиотек
    if (typeof LottieInteractivity === 'undefined') {
      throw new Error('LottieInteractivity не загружена');
    }
  };

  // Конфигурации анимаций
  const lottieConfigs = ${configJson};

  // Инициализация анимации с валидацией URL
  const initLottieScrollAnimation = async (config) => {
    const containers = document.querySelectorAll('.' + config.targetClass);
    
    if (containers.length === 0) {
      console.warn(\`Taptop Lottie: Элементы с классом "\${config.targetClass}" не найдены\`);
      return;
    }
    
    // Валидация URL анимации
    try {
      console.log(\`Taptop Lottie: Проверяем доступность \${config.lottieUrl}\`);
      await retryWithBackoff(() => validateUrl(config.lottieUrl), 2, 500);
      console.log(\`Taptop Lottie: URL \${config.lottieUrl} доступен\`);
    } catch (error) {
      console.error(\`Taptop Lottie: Анимация \${config.targetClass} пропущена - \${error.message}\`);
      
      // Показываем сообщение пользователю в контейнерах
      containers.forEach(container => {
        if (!container.querySelector('.lottie-error-message')) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'lottie-error-message';
          errorDiv.style.cssText = 'padding: 20px; text-align: center; color: #666; font-size: 14px; background: #f5f5f5; border-radius: 8px;';
          errorDiv.textContent = 'Анимация временно недоступна';
          container.appendChild(errorDiv);
        }
      });
      return;
    }
    
    containers.forEach(async (container, index) => {
      try {
        // Проверяем, не создан ли уже плеер
        if (container.querySelector('lottie-player')) return;
        
        // Создаём уникальный ID для плеера
        const playerId = 'lottie-scroll-' + config.targetClass + '-' + index + '-' + Date.now();
        
        console.log(\`Taptop Lottie: Создаём плеер \${playerId} для \${config.lottieUrl}\`);
        
        // Создаём плеер
        const player = document.createElement('lottie-player');
        player.id = playerId;
        player.src = config.lottieUrl;
        player.style.width = '100%';
        player.style.height = '100%';
        player.setAttribute('background', 'transparent');
        
        // Обработка ошибок загрузки плеера
        player.addEventListener('error', (e) => {
          console.error(\`Taptop Lottie: Ошибка загрузки плеера \${playerId}:\`, e);
          const errorDiv = document.createElement('div');
          errorDiv.style.cssText = 'padding: 20px; text-align: center; color: #ff6b6b; font-size: 14px;';
          errorDiv.textContent = 'Ошибка загрузки анимации';
          container.appendChild(errorDiv);
        });
        
        container.appendChild(player);
        
        // Настраиваем интерактивность после загрузки плеера
        player.addEventListener('ready', () => {
          try {
            console.log(\`Taptop Lottie: Плеер \${playerId} готов, настраиваем интерактивность\`);
            
            // Получаем количество кадров для обработки 'last'
            const lottieInstance = player.getLottie();
            if (!lottieInstance) {
              throw new Error('Не удалось получить экземпляр Lottie');
            }
            
            const totalFrames = lottieInstance.totalFrames;
            const endFrame = config.endFrame === 'last' ? totalFrames - 1 : config.endFrame;
            
            console.log(\`Taptop Lottie: Настраиваем скролл для \${playerId}, кадры: \${config.startFrame}-\${endFrame}, скролл: \${config.startScroll}-\${config.endScroll}\`);
            
            LottieInteractivity.create({
              mode: "scroll",
              player: '#' + playerId,
              actions: [{
                visibility: [config.startScroll, config.endScroll],
                type: "seek",
                frames: [config.startFrame, endFrame]
              }]
            });
            
            console.log(\`Taptop Lottie: Интерактивность настроена для \${playerId}\`);
          } catch (error) {
            console.error(\`Taptop Lottie: Ошибка настройки интерактивности для \${config.targetClass}:\`, error);
          }
        });
        
        // Таймаут для обнаружения зависших загрузок
        setTimeout(() => {
          if (!player.getLottie()) {
            console.warn(\`Taptop Lottie: Таймаут загрузки для \${playerId}\`);
          }
        }, 15000);
        
      } catch (error) {
        console.error(\`Taptop Lottie: Критическая ошибка при создании плеера для \${config.targetClass}:\`, error);
      }
    });
  };

  // Основная функция инициализации
  const init = async () => {
    console.log('Taptop Lottie Scroll: Начинаем инициализацию');
    
    try {
      // Загружаем библиотеки с полным error handling
      console.log('Taptop Lottie Scroll: Загружаем библиотеки...');
      await loadScripts();
      console.log('Taptop Lottie Scroll: Библиотеки загружены успешно');
      
      // Проверяем количество конфигураций
      console.log(\`Taptop Lottie Scroll: Найдено \${lottieConfigs.length} конфигураций анимаций\`);
      
      if (lottieConfigs.length === 0) {
        console.warn('Taptop Lottie Scroll: Нет конфигураций для инициализации');
        return;
      }
      
      // Инициализируем каждую конфигурацию последовательно для избежания race conditions
      for (let i = 0; i < lottieConfigs.length; i++) {
        const config = lottieConfigs[i];
        console.log(\`Taptop Lottie Scroll: Инициализируем конфигурацию \${i + 1}/\${lottieConfigs.length} (\${config.targetClass})\`);
        
        try {
          await initLottieScrollAnimation(config);
          console.log(\`Taptop Lottie Scroll: Конфигурация \${config.targetClass} инициализирована успешно\`);
        } catch (configError) {
          console.error(\`Taptop Lottie Scroll: Ошибка инициализации конфигурации \${config.targetClass}:\`, configError);
          // Не прерываем обработку остальных конфигураций
        }
        
        // Небольшая задержка между инициализациями
        if (i < lottieConfigs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log('Taptop Lottie Scroll: Инициализация завершена');
      
    } catch (error) {
      console.error('Taptop Lottie Scroll: Критическая ошибка инициализации:', error);
      
      // Дополнительная диагностика
      console.error('Taptop Lottie Scroll: Диагностика:', {
        'DOM ready': document.readyState,
        'LottieInteractivity available': typeof LottieInteractivity !== 'undefined',
        'lottie-player defined': typeof customElements.get('lottie-player') !== 'undefined',
        'Config count': lottieConfigs.length
      });
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
