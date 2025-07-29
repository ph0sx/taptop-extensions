import { html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { BaseGenerator, type GeneratorConfig } from '../base/BaseGenerator.js';
import {
  ReactiveValidationController,
  type ValidationRuleMap,
} from '../../controllers/ReactiveValidationController.js';
import lottieAutoplayStyles from './LottieAutoplayGenerator.styles.css';

// UI компоненты
import '../../ui/Generator/Generator.js';
import '../../ui/Input/Input.js';
import '../../ui/Button/Button.js';
import '../../ui/GeneratorSection/GeneratorSection.js';
import '../../ui/Question/Question.js';

// Типы для конфигурации
interface LottieRule {
  id: string;
  lottieUrl: string;
  targetClass: string;
}

// Конфигурация для BaseGenerator compatibility
interface LottieAutoplayFormData extends GeneratorConfig {
  rulesData: string; // Serialized rules for GeneratorConfig compatibility
}

// Внутренняя типизированная конфигурация для состояния компонента
interface LottieAutoplayConfig {
  rules: LottieRule[];
}

// Чистые типы без ID для генерации кода
type CleanLottieRule = Omit<LottieRule, 'id'>;

interface CleanLottieAutoplayConfig {
  rules: CleanLottieRule[];
}

@customElement('lottie-autoplay-generator')
export default class LottieAutoplayGenerator extends BaseGenerator {
  static styles = [...BaseGenerator.styles, unsafeCSS(lottieAutoplayStyles)];

  // Lit состояние
  @state() private accessor config: LottieAutoplayConfig = {
    rules: [
      {
        id: this.generateId(),
        lottieUrl: 'https://lottie.host/3b708674-ffd6-4a3b-90b4-4d926c311ff5/tRKFgr4YCB.lottie',
        targetClass: 'lottie-container-autoplay-1',
      },
    ],
  };

  // Реактивная валидация
  private validationController = new ReactiveValidationController<LottieAutoplayConfig>(this, {
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
    });

    return rules;
  }

  /**
   * Извлекает значение поля из состояния компонента
   */
  private extractFieldValue(state: LottieAutoplayConfig, fieldId: string): string {
    // Парсим ID поля чтобы понять к какому правилу он относится
    const urlMatch = fieldId.match(/^lottie-url-(.+)$/);
    const classMatch = fieldId.match(/^target-class-(.+)$/);

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

    return '';
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private updateConfig(newConfig: LottieAutoplayConfig): void {
    this.config = newConfig;
  }

  // Методы для управления правилами
  private addRule(): void {
    const newRule: LottieRule = {
      id: this.generateId(),
      lottieUrl: 'https://lottie.host/3b708674-ffd6-4a3b-90b4-4d926c311ff5/tRKFgr4YCB.lottie',
      targetClass: `lottie-container-autoplay-${this.config.rules.length + 1}`,
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
  private updateRule(id: string, field: keyof Omit<LottieRule, 'id'>, value: string): void {
    const updated = this.config.rules.map((rule) => {
      if (rule.id === id) {
        return { ...rule, [field]: value };
      }
      return rule;
    });
    this.updateConfig({ ...this.config, rules: updated });
  }

  // Рендер карточки правила
  private renderRuleCard(rule: LottieRule, index: number): TemplateResult {
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
              placeholder="https://example.com/animation.lottie"
              .value="${rule.lottieUrl}"
              required
              .error="${this.validationController.getFieldState(`lottie-url-${rule.id}`)?.error ??
              ''}"
              tooltip="Прямая ссылка на файл анимации"
              @update-value="${(e: CustomEvent) => {
                this.updateRule(rule.id, 'lottieUrl', e.detail.value);
              }}"
              @field-blur="${() => this.validationController.touchField(`lottie-url-${rule.id}`)}"
            >
            </ttg-input>
            <ttg-input
              id="target-class-${rule.id}"
              label="Класс (источник стилей) целевого элемента"
              placeholder="lottie-container-autoplay-1"
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
        </div>
      </div>
    `;
  }

  // Валидация и сбор данных
  protected collectData(): LottieAutoplayFormData | null {
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
  private removeIdsFromConfig(config: LottieAutoplayConfig): CleanLottieAutoplayConfig {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rules: config.rules.map(({ id: _id, ...rest }) => rest),
    };
  }

  protected generateCode(settings: LottieAutoplayFormData): string {
    // Parse back from serialized format
    const config: LottieAutoplayConfig = {
      rules: JSON.parse(settings.rulesData || '[]'),
    };

    // Удаляем ID поля
    const cleanConfig = this.removeIdsFromConfig(config);
    const configJson = JSON.stringify(cleanConfig.rules, null, 2);

    return `
<script type="module" defer>
  import { DotLottie } from "https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web/+esm";

  const lottieConfigs = ${configJson};

  const initLottieAnimation = (config) => {
    const lottieContainers = document.querySelectorAll("." + config.targetClass);
    if (lottieContainers.length === 0) {
        console.error('Taptop Lottie: контейнеры с классом .' + config.targetClass + ' не найдены.');
        return;
    }

    lottieContainers.forEach((lottieContainer, index) => {
      // Проверяем, не создана ли уже анимация в этом контейнере
      if (lottieContainer.querySelector('canvas')) return;
      
      const canvas = document.createElement('canvas');
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      lottieContainer.innerHTML = '';
      lottieContainer.appendChild(canvas);

      try {
          const animation = new DotLottie({
              canvas: canvas,
              src: config.lottieUrl,
              loop: true,
              autoplay: true
          });

          // Создаём уникальный обработчик resize для каждой анимации
          const resizeHandler = () => {
              canvas.width = lottieContainer.clientWidth;
              canvas.height = lottieContainer.clientHeight;
              animation.resize();
          };
          
          window.addEventListener('resize', resizeHandler);
          
          // Сохраняем ссылку на обработчик для возможной очистки
          canvas._resizeHandler = resizeHandler;

      } catch (error) {
          console.error('Taptop Lottie: ошибка загрузки анимации для ' + config.targetClass + ' (элемент ' + (index + 1) + ')', error);
      }
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    lottieConfigs.forEach(initLottieAnimation);
  });
</script>
`;
  }
}
