import { html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { BaseGenerator, type GeneratorConfig } from '../base/BaseGenerator.js';
import {
  ReactiveValidationController,
  type ValidationRuleMap,
} from '../../controllers/ReactiveValidationController.js';
import fadeOutTextStyles from './FadeOutTextGenerator.styles.css';

// UI компоненты
import '../../ui/Generator/Generator.js';
import '../../ui/Input/Input.js';
import '../../ui/Button/Button.js';
import '../../ui/GeneratorSection/GeneratorSection.js';
import '../../ui/Question/Question.js';
import '../../ui/CheckboxGroup/CheckboxGroup.js';
import '../../ui/CheckboxItem/CheckboxItem.js';

// Типы для конфигурации
interface FadeOutTextRule {
  id: string;
  animationIdentifier: string;
  animationSpeed: string; // "0.3s"
  animationDelay: number; // 0.03
  delayBeforeStart: string; // "0s"
  slowdownEffect: boolean;
  endSlowdownEffect: boolean;
}

// Конфигурация для BaseGenerator compatibility
interface FadeOutTextFormData extends GeneratorConfig {
  rulesData: string; // Serialized rules for GeneratorConfig compatibility
}

// Внутренняя типизированная конфигурация для состояния компонента
interface FadeOutTextConfig {
  rules: FadeOutTextRule[];
}

// Чистые типы без ID для генерации кода
type CleanFadeOutTextRule = Omit<FadeOutTextRule, 'id'>;

interface CleanFadeOutTextConfig {
  rules: CleanFadeOutTextRule[];
}

@customElement('fade-out-text-generator')
export default class FadeOutTextGenerator extends BaseGenerator {
  static styles = [...BaseGenerator.styles, unsafeCSS(fadeOutTextStyles)];

  // Lit состояние
  @state() private accessor config: FadeOutTextConfig = {
    rules: [
      {
        id: this.generateId(),
        animationIdentifier: 'js-text-animation-fade-out-1',
        animationSpeed: '0.3s',
        animationDelay: 0.03,
        delayBeforeStart: '0s',
        slowdownEffect: false,
        endSlowdownEffect: false,
      },
    ],
  };

  // Реактивная валидация
  private validationController = new ReactiveValidationController<FadeOutTextConfig>(this, {
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
      // Правила для класса элемента
      rules[`animation-identifier-${rule.id}`] = [
        { type: 'required', message: 'Класс элемента обязателен' },
        {
          type: 'pattern',
          message: 'Класс содержит недопустимые символы',
          options: { pattern: /^[a-zA-Z0-9_-]+$/ },
        },
      ];

      // Правила для скорости анимации
      rules[`animation-speed-${rule.id}`] = [
        { type: 'required', message: 'Скорость анимации обязательна' },
        {
          type: 'pattern',
          message: 'Формат должен быть числом с единицами времени (например: 0.3s или 300ms)',
          options: { pattern: /^\d+(\.\d+)?(s|ms)$/ },
        },
      ];

      // Правила для задержки между символами
      rules[`animation-delay-${rule.id}`] = [
        { type: 'required', message: 'Задержка между символами обязательна' },
        {
          type: 'pattern',
          message: 'Значение должно быть числом от 0 до 1',
          options: { pattern: /^(0|1|0\.\d+)$/ },
        },
      ];

      // Правила для задержки перед началом
      rules[`delay-before-start-${rule.id}`] = [
        {
          type: 'pattern',
          message: 'Формат должен быть числом с единицами времени (например: 0s или 500ms)',
          options: { pattern: /^\d+(\.\d+)?(s|ms)$/ },
        },
      ];
    });

    return rules;
  }

  /**
   * Извлекает значение поля из состояния компонента
   */
  private extractFieldValue(state: FadeOutTextConfig, fieldId: string): string {
    // Парсим ID поля чтобы понять к какому правилу он относится
    const identifierMatch = fieldId.match(/^animation-identifier-(.+)$/);
    const speedMatch = fieldId.match(/^animation-speed-(.+)$/);
    const delayMatch = fieldId.match(/^animation-delay-(.+)$/);
    const delayBeforeStartMatch = fieldId.match(/^delay-before-start-(.+)$/);

    if (identifierMatch) {
      const ruleId = identifierMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.animationIdentifier || '';
    }

    if (speedMatch) {
      const ruleId = speedMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.animationSpeed || '';
    }

    if (delayMatch) {
      const ruleId = delayMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.animationDelay.toString() || '0.03';
    }

    if (delayBeforeStartMatch) {
      const ruleId = delayBeforeStartMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.delayBeforeStart || '0s';
    }

    return '';
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private updateConfig(newConfig: FadeOutTextConfig): void {
    this.config = newConfig;
  }

  // Методы для управления правилами
  private addRule(): void {
    const newRule: FadeOutTextRule = {
      id: this.generateId(),
      animationIdentifier: `js-text-animation-fade-out-${this.config.rules.length + 1}`,
      animationSpeed: '0.3s',
      animationDelay: 0.03,
      delayBeforeStart: '0s',
      slowdownEffect: false,
      endSlowdownEffect: false,
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
    field: keyof Omit<FadeOutTextRule, 'id'>,
    value: string | number | boolean,
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
  private renderRuleCard(rule: FadeOutTextRule, index: number): TemplateResult {
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
            ${
              canRemove
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
                : ''
            }
          </div>
          <div class="rule-main">
            <ttg-input
              id="animation-identifier-${rule.id}"
              label="Класс (источник стилей) целевого элемента"
              placeholder="js-text-animation-fade-out"
              .value="${rule.animationIdentifier}"
              required
              .error="${
                this.validationController.getFieldState(`animation-identifier-${rule.id}`)?.error ??
                ''
              }"
              tooltip="УНИКАЛЬНЫЙ класс, который вы присвоили текстовому элементу в редакторе Taptop"
              @update-value="${(e: CustomEvent) => {
                this.updateRule(rule.id, 'animationIdentifier', e.detail.value);
              }}"
              @field-blur="${() =>
                this.validationController.touchField(`animation-identifier-${rule.id}`)}"
            >
            </ttg-input>
            <ttg-input
              id="animation-speed-${rule.id}"
              label="Скорость анимации"
              placeholder="0.3s"
              .value="${rule.animationSpeed}"
              required
              .error="${
                this.validationController.getFieldState(`animation-speed-${rule.id}`)?.error ?? ''
              }"
              tooltip="Общая длительность анимации исчезновения каждого символа. Рекомендуется 0.3s"
              @update-value="${(e: CustomEvent) => {
                this.updateRule(rule.id, 'animationSpeed', e.detail.value);
              }}"
              @field-blur="${() =>
                this.validationController.touchField(`animation-speed-${rule.id}`)}"
            >
            </ttg-input>
            <ttg-input
              id="animation-delay-${rule.id}"
              type="number"
              label="Задержка между символами"
              placeholder="0.03"
              .value="${rule.animationDelay.toString()}"
              required
              min="0"
              max="1"
              .error="${
                this.validationController.getFieldState(`animation-delay-${rule.id}`)?.error ?? ''
              }"
              tooltip="Время паузы перед исчезновением следующего символа. Рекомендуется 0.03"
              @update-value="${(e: CustomEvent) => {
                const value = parseFloat(e.detail.value) || 0.03;
                this.updateRule(rule.id, 'animationDelay', Math.min(Math.max(value, 0), 1));
              }}"
              @field-blur="${() =>
                this.validationController.touchField(`animation-delay-${rule.id}`)}"
            >
            </ttg-input>
          </div>

          <details class="advanced-settings">
            <summary class="advanced-settings-toggle">Дополнительные настройки</summary>
            <div class="advanced-settings-content">
              <ttg-input
                id="delay-before-start-${rule.id}"
                label="Задержка перед началом"
                placeholder="0s"
                .value="${rule.delayBeforeStart}"
                .error="${
                  this.validationController.getFieldState(`delay-before-start-${rule.id}`)?.error ??
                  ''
                }"
                tooltip="Пауза перед запуском всей анимации"
                @update-value="${(e: CustomEvent) => {
                  this.updateRule(rule.id, 'delayBeforeStart', e.detail.value);
                }}"
                @field-blur="${() =>
                  this.validationController.touchField(`delay-before-start-${rule.id}`)}"
              >
              </ttg-input>

              <ttg-checkbox-group label="Эффекты замедления" orientation="vertical">
                <ttg-checkbox-item
                  label="Эффект замедления в середине"
                  value="slowdownEffect"
                  ?checked="${rule.slowdownEffect}"
                  @change="${(e: CustomEvent) => {
                    this.updateRule(rule.id, 'slowdownEffect', e.detail.checked);
                  }}"
                ></ttg-checkbox-item>
                <ttg-checkbox-item
                  label="Эффект замедления в конце"
                  value="endSlowdownEffect"
                  ?checked="${rule.endSlowdownEffect}"
                  @change="${(e: CustomEvent) => {
                    this.updateRule(rule.id, 'endSlowdownEffect', e.detail.checked);
                  }}"
                ></ttg-checkbox-item>
              </ttg-checkbox-group>
            </div>
          </details>
        </div>
        </div>
      </div>
    `;
  }

  // Валидация и сбор данных
  protected collectData(): FadeOutTextFormData | null {
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
  private removeIdsFromConfig(config: FadeOutTextConfig): CleanFadeOutTextConfig {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rules: config.rules.map(({ id: _id, ...rest }) => rest),
    };
  }

  protected generateCode(settings: FadeOutTextFormData): string {
    // Parse back from serialized format
    const config: FadeOutTextConfig = {
      rules: JSON.parse(settings.rulesData || '[]'),
    };

    // Удаляем ID поля
    const cleanConfig = this.removeIdsFromConfig(config);

    if (!cleanConfig.rules || cleanConfig.rules.length === 0) return '';

    // Генерируем стили для всех правил
    const stylesParts = ['<style>'];
    const scriptsParts: string[] = [];

    cleanConfig.rules.forEach((rule, index) => {
      const {
        animationSpeed,
        animationIdentifier,
        slowdownEffect,
        endSlowdownEffect,
        animationDelay,
        delayBeforeStart,
      } = rule;

      // CSS стили для правила
      const ruleStyles = [
        `  /* Правило ${index + 1}: ${animationIdentifier} */
  .${animationIdentifier} {
    visibility: hidden;  
    display: inline-block !important;
  }`,
      ];

      if (index === 0) {
        ruleStyles.push(`  .space-char {
    display: inline-block;
    width: 0.27em;
  }`);
      }

      ruleStyles.push(`  @keyframes parent-${animationIdentifier} {
    0% { opacity: 0; }
    99% { opacity: 0; }
    100% { opacity: 1; }
  }

  .${animationIdentifier}-child {
    display: inline-block;
    opacity: 1;
    animation: ${animationIdentifier} ${animationSpeed} forwards;
    transition: opacity ${animationSpeed} linear;
  }

  @keyframes ${animationIdentifier} {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }`);

      stylesParts.push(ruleStyles.join('\n\n'));

      // JavaScript код для правила
      scriptsParts.push(`    // Правило ${index + 1}: ${animationIdentifier}
    const animationSpeed${index + 1} = '${animationSpeed}';
    const animationIdentifier${index + 1} = '${animationIdentifier}';
    const slowdownEffect${index + 1} = ${slowdownEffect};
    const endSlowdownEffect${index + 1} = ${endSlowdownEffect};
    const inputAnimationDelay${index + 1} = ${animationDelay};
    const delayBeforeStart${index + 1} = '${delayBeforeStart}';

    const textElements${index + 1} = document.querySelectorAll('.' + animationIdentifier${index + 1});
    const originalTexts${index + 1} = new Map();
    const animatedElements${index + 1} = new Map();

    const observer${index + 1} = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!animatedElements${index + 1}.get(entry.target)) {
              animateElement${index + 1}(entry.target);
              animatedElements${index + 1}.set(entry.target, true);
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    function animateElement${index + 1}(element) {
      if (!originalTexts${index + 1}.has(element)) {
        originalTexts${index + 1}.set(element, element.innerHTML.trim());
      }

      const originalContent = element.cloneNode(true);
      element.innerHTML = '';

      if (delayBeforeStart${index + 1} !== '0s') {
        element.style.animation = 'parent-' + animationIdentifier${index + 1} + ' ' + delayBeforeStart${index + 1} + ' forwards';
        element.addEventListener(
          'animationend',
          function () {
            createAndAnimateCharacters${index + 1}();
          },
          { once: true }
        );
      } else {
        createAndAnimateCharacters${index + 1}();
      }

      function createAndAnimateCharacters${index + 1}() {
        const childClassName = animationIdentifier${index + 1} + '-child';
        const animationDelay = inputAnimationDelay${index + 1};
        let delay = 0;

        const walker = document.createTreeWalker(
          originalContent,
          NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
          null,
          false
        );

        const nodes = [];
        let node;
        while ((node = walker.nextNode())) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            let textContent = node.textContent;
            if (nodes.length === 0) {
              textContent = textContent.trimStart();
            }
            const chars = textContent.split('');
            chars.forEach((char) => nodes.push(char));
          } else if (node.tagName === 'BR') {
            nodes.push('BR');
          }
        }

        nodes.forEach((item, index) => {
          if (item === 'BR') {
            const brElement = document.createElement('br');
            element.appendChild(brElement);
            return;
          }

          const charSpan = document.createElement('span');
          charSpan.className = childClassName;

          if (item === ' ') {
            charSpan.classList.add('space-char');
          }

          charSpan.textContent = item;

          const position = index / (nodes.length - 1 || 1);
          let totalSlowdownFactor = 0;

          if (slowdownEffect${index + 1}) {
            if (position < 0.33) {
              // Обычная скорость в начале
            } else if (position < 0.5) {
              const normalizedPos = (position - 0.33) / (0.5 - 0.33);
              totalSlowdownFactor += Math.pow(normalizedPos, 2) * 5;
            } else if (position < 0.7) {
              const normalizedPos = 1 - (position - 0.5) / (0.7 - 0.5);
              totalSlowdownFactor += Math.pow(normalizedPos, 2) * 5;
            }
          }

          if (endSlowdownEffect${index + 1} && position >= 0.6) {
            const normalizedEndPos = (position - 0.6) / (1 - 0.6);
            totalSlowdownFactor += Math.pow(normalizedEndPos, 2) * 3;
          }

          delay += animationDelay * (1 + totalSlowdownFactor);
          charSpan.style.animationDelay = delay + 's';
          element.appendChild(charSpan);
        });

        requestAnimationFrame(() => {
          element.style.visibility = 'visible';
        });
      }
    }

    textElements${index + 1}.forEach((element) => {
      observer${index + 1}.observe(element);
    });`);
    });

    stylesParts.push('</style>');

    const styles = stylesParts.join('\n\n');
    const scripts = `<script type="module">
  document.addEventListener('DOMContentLoaded', () => {
${scriptsParts.join('\n\n')}
  });
</script>`;

    return `${styles}\n\n${scripts}`;
  }
}
