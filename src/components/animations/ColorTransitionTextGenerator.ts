import { html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { BaseGenerator, type GeneratorConfig } from '../base/BaseGenerator.js';
import {
  ReactiveValidationController,
  type ValidationRuleMap,
} from '../../controllers/ReactiveValidationController.js';
import colorTransitionTextStyles from './ColorTransitionTextGenerator.styles.css';

// UI компоненты
import '../../ui/Generator/Generator.js';
import '../../ui/Input/Input.js';
import '../../ui/Button/Button.js';
import '../../ui/GeneratorSection/GeneratorSection.js';
import '../../ui/Question/Question.js';
import '../../ui/CheckboxGroup/CheckboxGroup.js';
import '../../ui/CheckboxItem/CheckboxItem.js';
import '../../ui/ColorPicker/ColorPicker.js';

// Типы для конфигурации
interface ColorTransitionRule {
  id: string;
  animationIdentifier: string;
  animationSpeed: string; // "0.3s"
  colorFrom: string; // "#7f7f7f"
  colorTo: string; // "#664ee8"
  slowdownEffect: boolean;
  endSlowdownEffect: boolean;
  animationDelay: number; // 0-1
  delayBeforeStart: string; // "0s"
}

// Конфигурация для BaseGenerator compatibility
interface ColorTransitionFormData extends GeneratorConfig {
  rulesData: string; // Serialized rules for GeneratorConfig compatibility
}

// Внутренняя типизированная конфигурация для состояния компонента
interface ColorTransitionConfig {
  rules: ColorTransitionRule[];
}

// Чистые типы без ID для генерации кода
type CleanColorTransitionRule = Omit<ColorTransitionRule, 'id'>;

interface CleanColorTransitionConfig {
  rules: CleanColorTransitionRule[];
}

@customElement('color-transition-text-generator')
export default class ColorTransitionTextGenerator extends BaseGenerator {
  static styles = [...BaseGenerator.styles, unsafeCSS(colorTransitionTextStyles)];

  // Lit состояние
  @state() private accessor config: ColorTransitionConfig = {
    rules: [
      {
        id: this.generateId(),
        animationIdentifier: 'js-text-animation-color-1',
        animationSpeed: '0.3s',
        colorFrom: '#7F7F7F',
        colorTo: '#664EE8',
        slowdownEffect: false,
        endSlowdownEffect: false,
        animationDelay: 0.05,
        delayBeforeStart: '0s',
      },
    ],
  };

  // Реактивная валидация
  private validationController = new ReactiveValidationController<ColorTransitionConfig>(this, {
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

      // Правила для начального цвета
      rules[`color-from-${rule.id}`] = [
        { type: 'required', message: 'Начальный цвет обязателен' },
        {
          type: 'pattern',
          message: 'Цвет должен быть в формате HEX (#RRGGBB)',
          options: { pattern: /^#[0-9A-Fa-f]{8}$/ },
        },
      ];

      // Правила для конечного цвета
      rules[`color-to-${rule.id}`] = [
        { type: 'required', message: 'Конечный цвет обязателен' },
        {
          type: 'pattern',
          message: 'Цвет должен быть в формате HEX (#RRGGBB)',
          options: { pattern: /^#[0-9A-Fa-f]{8}$/ },
        },
      ];

      // Правила для задержки между символами
      rules[`animation-delay-${rule.id}`] = [
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
  private extractFieldValue(state: ColorTransitionConfig, fieldId: string): string {
    // Парсим ID поля чтобы понять к какому правилу он относится
    const identifierMatch = fieldId.match(/^animation-identifier-(.+)$/);
    const speedMatch = fieldId.match(/^animation-speed-(.+)$/);
    const colorFromMatch = fieldId.match(/^color-from-(.+)$/);
    const colorToMatch = fieldId.match(/^color-to-(.+)$/);
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

    if (colorFromMatch) {
      const ruleId = colorFromMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.colorFrom || '';
    }

    if (colorToMatch) {
      const ruleId = colorToMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.colorTo || '';
    }

    if (delayMatch) {
      const ruleId = delayMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.animationDelay.toString() || '0.05';
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

  private updateConfig(newConfig: ColorTransitionConfig): void {
    this.config = newConfig;
  }

  // Методы для управления правилами
  private addRule(): void {
    const newRule: ColorTransitionRule = {
      id: this.generateId(),
      animationIdentifier: `js-text-animation-color-${this.config.rules.length + 1}`,
      animationSpeed: '0.3s',
      colorFrom: '#7F7F7F',
      colorTo: '#664EE8',
      slowdownEffect: false,
      endSlowdownEffect: false,
      animationDelay: 0.05,
      delayBeforeStart: '0s',
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
    field: keyof Omit<ColorTransitionRule, 'id'>,
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
  private renderRuleCard(rule: ColorTransitionRule, index: number): TemplateResult {
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
              id="animation-identifier-${rule.id}"
              label="Класс (источник стилей) целевого элемента"
              placeholder="js-text-animation-color"
              .value="${rule.animationIdentifier}"
              required
              .error="${this.validationController.getFieldState(`animation-identifier-${rule.id}`)
                ?.error ?? ''}"
              tooltip="УНИКАЛЬНЫЙ класс, который вы присвоили текстовому элементу в редакторе Taptop"
              @update-value="${(e: CustomEvent) => {
                this.updateRule(rule.id, 'animationIdentifier', e.detail.value);
              }}"
              @field-blur="${() =>
                this.validationController.touchField(`animation-identifier-${rule.id}`)}"
            >
            </ttg-input>

            <ttg-color-picker
              id="color-from-${rule.id}"
              label="Начальный цвет"
              .value="${rule.colorFrom}"
              required
              .error="${this.validationController.getFieldState(`color-from-${rule.id}`)?.error ??
              ''}"
              tooltip="Цвет текста в начале анимации в формате HEX"
              @update-value="${(e: CustomEvent) => {
                this.updateRule(rule.id, 'colorFrom', e.detail.value);
              }}"
              @field-blur="${() => this.validationController.touchField(`color-from-${rule.id}`)}"
            >
            </ttg-color-picker>

            <ttg-color-picker
              id="color-to-${rule.id}"
              label="Конечный цвет"
              .value="${rule.colorTo}"
              required
              .error="${this.validationController.getFieldState(`color-to-${rule.id}`)?.error ??
              ''}"
              tooltip="Цвет текста в конце анимации в формате HEX"
              @update-value="${(e: CustomEvent) => {
                this.updateRule(rule.id, 'colorTo', e.detail.value);
              }}"
              @field-blur="${() => this.validationController.touchField(`color-to-${rule.id}`)}"
            >
            </ttg-color-picker>

            <ttg-input
              id="animation-speed-${rule.id}"
              label="Скорость анимации"
              placeholder="0.3s"
              .value="${rule.animationSpeed}"
              required
              .error="${this.validationController.getFieldState(`animation-speed-${rule.id}`)
                ?.error ?? ''}"
              tooltip="Общая длительность цветового перехода. Рекомендуется 0.3s"
              @update-value="${(e: CustomEvent) => {
                this.updateRule(rule.id, 'animationSpeed', e.detail.value);
              }}"
              @field-blur="${() =>
                this.validationController.touchField(`animation-speed-${rule.id}`)}"
            >
            </ttg-input>

            <ttg-input
              id="animation-delay-${rule.id}"
              label="Задержка между символами"
              placeholder="0.05"
              type="number"
              min="0"
              max="1"
              step="0.01"
              .value="${rule.animationDelay.toString()}"
              .error="${this.validationController.getFieldState(`animation-delay-${rule.id}`)
                ?.error ?? ''}"
              tooltip="Время паузы перед изменением цвета следующего символа. Рекомендуется 0.05"
              @update-value="${(e: CustomEvent) => {
                const value = parseFloat(e.detail.value) || 0.05;
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
                .error="${this.validationController.getFieldState(`delay-before-start-${rule.id}`)
                  ?.error ?? ''}"
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
                  label="Плавное затухание скорости анимации к концу текста"
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
    `;
  }

  // Валидация и сбор данных
  protected collectData(): ColorTransitionFormData | null {
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
  private removeIdsFromConfig(config: ColorTransitionConfig): CleanColorTransitionConfig {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rules: config.rules.map(({ id: _id, ...rest }) => rest),
    };
  }

  protected generateCode(settings: ColorTransitionFormData): string {
    // Parse back from serialized format
    const config: ColorTransitionConfig = {
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
        colorFrom,
        colorTo,
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
    color: ${colorFrom};
    animation: ${animationIdentifier} ${animationSpeed} forwards;
    transition: all ${animationSpeed} linear;
  }

  @keyframes ${animationIdentifier} {
    from { color: ${colorFrom}; }
    to { color: ${colorTo}; }
  }`);

      stylesParts.push(ruleStyles.join('\n\n'));

      // JavaScript код для правила
      scriptsParts.push(`    // Правило ${index + 1}: ${animationIdentifier}
    (function() {
      const animationSpeed = '${animationSpeed}';
      const colorFrom = '${colorFrom}';
      const colorTo = '${colorTo}';
      const animationIdentifier = '${animationIdentifier}';
      const slowdownEffect = ${slowdownEffect};
      const endSlowdownEffect = ${endSlowdownEffect};
      const inputAnimationDelay = ${animationDelay};
      const delayBeforeStart = '${delayBeforeStart}';

      const textElements = document.querySelectorAll('.' + animationIdentifier);
      const originalTexts = new Map();
      const animatedElements = new Map();

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!animatedElements.get(entry.target)) {
                animateElement(entry.target);
                animatedElements.set(entry.target, true);
              }
            }
          });
        },
        { threshold: 0.25 }
      );

      function animateElement(element) {
        if (!originalTexts.has(element)) {
          originalTexts.set(element, element.innerHTML.trim());
        }

        const originalContent = element.cloneNode(true);
        element.innerHTML = '';

        if (delayBeforeStart !== '0s') {
          element.style.animation = 'parent-' + animationIdentifier + ' ' + delayBeforeStart + ' forwards';
          element.addEventListener(
            'animationend',
            function () {
              createAndAnimateCharacters();
            },
            { once: true }
          );
        } else {
          createAndAnimateCharacters();
        }

        function createAndAnimateCharacters() {
          const childClassName = animationIdentifier + '-child';
          const animationDalay = inputAnimationDelay;
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

            if (slowdownEffect) {
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

            if (endSlowdownEffect && position >= 0.6) {
              const normalizedEndPos = (position - 0.6) / (1 - 0.6);
              totalSlowdownFactor += Math.pow(normalizedEndPos, 2) * 3;
            }

            delay += animationDalay * (1 + totalSlowdownFactor);
            charSpan.style.animationDelay = delay + 's';
            element.appendChild(charSpan);
          });

          requestAnimationFrame(() => {
            element.style.visibility = 'visible';
          });
        }
      }

      textElements.forEach((element) => {
        observer.observe(element);
      });
    })();`);
    });

    stylesParts.push('</style>');

    const styles = stylesParts.join('\n\n');
    const scripts = `<script>
  document.addEventListener('DOMContentLoaded', () => {
${scriptsParts.join('\n\n')}
  });
</script>`;

    return `${styles}\n\n${scripts}`;
  }
}
