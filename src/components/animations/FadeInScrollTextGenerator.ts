import { html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { BaseGenerator, type GeneratorConfig } from '../base/BaseGenerator.js';
import {
  ReactiveValidationController,
  type ValidationRuleMap,
} from '../../controllers/ReactiveValidationController.js';
import fadeInScrollTextStyles from './FadeInScrollTextGenerator.styles.css';

// UI компоненты
import '../../ui/Generator/Generator.js';
import '../../ui/Input/Input.js';
import '../../ui/Button/Button.js';
import '../../ui/GeneratorSection/GeneratorSection.js';
import '../../ui/Question/Question.js';

// Типы для конфигурации
interface FadeInScrollTextRule {
  id: string;
  animationIdentifier: string;
  animationSpeed: string; // "0.1s"
  animationStart: number; // 0-1 (0.6)
  animationEnd: number; // 0-1 (0.4)
}

// Конфигурация для BaseGenerator compatibility
interface FadeInScrollTextFormData extends GeneratorConfig {
  rulesData: string; // Serialized rules for GeneratorConfig compatibility
}

// Внутренняя типизированная конфигурация для состояния компонента
interface FadeInScrollTextConfig {
  rules: FadeInScrollTextRule[];
}

// Чистые типы без ID для генерации кода
type CleanFadeInScrollTextRule = Omit<FadeInScrollTextRule, 'id'>;

interface CleanFadeInScrollTextConfig {
  rules: CleanFadeInScrollTextRule[];
}

@customElement('fade-in-scroll-text-generator')
export default class FadeInScrollTextGenerator extends BaseGenerator {
  static styles = [...BaseGenerator.styles, unsafeCSS(fadeInScrollTextStyles)];

  // Lit состояние
  @state() private accessor config: FadeInScrollTextConfig = {
    rules: [
      {
        id: this.generateId(),
        animationIdentifier: 'js-text-animation-fade-in-scroll-1',
        animationSpeed: '0.1s',
        animationStart: 0.6,
        animationEnd: 0.4,
      },
    ],
  };

  // Реактивная валидация
  private validationController = new ReactiveValidationController<FadeInScrollTextConfig>(this, {
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
          message: 'Формат должен быть числом с единицами времени (например: 0.1s или 100ms)',
          options: { pattern: /^\d+(\.\d+)?(s|ms)$/ },
        },
      ];

      // Правила для начала анимации
      rules[`animation-start-${rule.id}`] = [
        {
          type: 'pattern',
          message: 'Значение должно быть числом от 0 до 1',
          options: { pattern: /^(0|1|0\.\d+)$/ },
        },
      ];

      // Правила для конца анимации
      rules[`animation-end-${rule.id}`] = [
        {
          type: 'pattern',
          message: 'Значение должно быть числом от 0 до 1',
          options: { pattern: /^(0|1|0\.\d+)$/ },
        },
      ];
    });

    return rules;
  }

  /**
   * Извлекает значение поля из состояния компонента
   */
  private extractFieldValue(state: FadeInScrollTextConfig, fieldId: string): string {
    // Парсим ID поля чтобы понять к какому правилу он относится
    const identifierMatch = fieldId.match(/^animation-identifier-(.+)$/);
    const speedMatch = fieldId.match(/^animation-speed-(.+)$/);
    const startMatch = fieldId.match(/^animation-start-(.+)$/);
    const endMatch = fieldId.match(/^animation-end-(.+)$/);

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

    if (startMatch) {
      const ruleId = startMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.animationStart.toString() || '0.6';
    }

    if (endMatch) {
      const ruleId = endMatch[1];
      const rule = state.rules.find((r) => r.id === ruleId);
      return rule?.animationEnd.toString() || '0.4';
    }

    return '';
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private updateConfig(newConfig: FadeInScrollTextConfig): void {
    this.config = newConfig;
  }

  // Методы для управления правилами
  private addRule(): void {
    const newRule: FadeInScrollTextRule = {
      id: this.generateId(),
      animationIdentifier: `js-text-animation-fade-in-scroll-${this.config.rules.length + 1}`,
      animationSpeed: '0.1s',
      animationStart: 0.6,
      animationEnd: 0.4,
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
    field: keyof Omit<FadeInScrollTextRule, 'id'>,
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
  private renderRuleCard(rule: FadeInScrollTextRule, index: number): TemplateResult {
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
              placeholder="js-text-animation-fade-in-scroll"
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
            <ttg-input
              id="animation-speed-${rule.id}"
              label="Скорость анимации"
              placeholder="0.1s"
              .value="${rule.animationSpeed}"
              required
              .error="${this.validationController.getFieldState(`animation-speed-${rule.id}`)
                ?.error ?? ''}"
              tooltip="Скорость перехода прозрачности каждого символа. Рекомендуется 0.1s для данной анимации"
              @update-value="${(e: CustomEvent) => {
                this.updateRule(rule.id, 'animationSpeed', e.detail.value);
              }}"
              @field-blur="${() =>
                this.validationController.touchField(`animation-speed-${rule.id}`)}"
            >
            </ttg-input>
            <ttg-input
              id="animation-start-${rule.id}"
              label="Начало анимации"
              placeholder="0.6"
              .value="${rule.animationStart.toString()}"
              .error="${this.validationController.getFieldState(`animation-start-${rule.id}`)
                ?.error ?? ''}"
              tooltip="Начало анимации задаётся в процентах от высоты окна — это расстояние от верхнего края экрана до точки, где должна запуститься анимация (0.6 = 60% от высоты экрана)"
              @update-value="${(e: CustomEvent) => {
                const value = parseFloat(e.detail.value) || 0.6;
                this.updateRule(rule.id, 'animationStart', Math.min(Math.max(value, 0), 1));
              }}"
              @field-blur="${() =>
                this.validationController.touchField(`animation-start-${rule.id}`)}"
            >
            </ttg-input>
            <ttg-input
              id="animation-end-${rule.id}"
              label="Конец анимации"
              placeholder="0.4"
              .value="${rule.animationEnd.toString()}"
              .error="${this.validationController.getFieldState(`animation-end-${rule.id}`)
                ?.error ?? ''}"
              tooltip="Конец анимации задаётся в процентах от высоты окна — это расстояние от верхнего края экрана до точки, в которой анимация должна завершиться (0.4 = 40% от высоты экрана)"
              @update-value="${(e: CustomEvent) => {
                const value = parseFloat(e.detail.value) || 0.4;
                this.updateRule(rule.id, 'animationEnd', Math.min(Math.max(value, 0), 1));
              }}"
              @field-blur="${() =>
                this.validationController.touchField(`animation-end-${rule.id}`)}"
            >
            </ttg-input>
          </div>
        </div>
      </div>
    `;
  }

  // Валидация и сбор данных
  protected collectData(): FadeInScrollTextFormData | null {
    // Используем ReactiveValidationController для валидации
    const formState = this.validationController.getFormState();
    if (!formState.isValid) {
      // Принудительная валидация для показа ошибок
      this.validationController.forceValidateForm();
      return null;
    }

    // Дополнительная валидация: начало анимации должно быть больше конца
    for (const rule of this.config.rules) {
      if (rule.animationStart <= rule.animationEnd) {
        alert('Начало анимации должно быть больше конца анимации');
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
  private removeIdsFromConfig(config: FadeInScrollTextConfig): CleanFadeInScrollTextConfig {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rules: config.rules.map(({ id: _id, ...rest }) => rest),
    };
  }

  protected generateCode(settings: FadeInScrollTextFormData): string {
    // Parse back from serialized format
    const config: FadeInScrollTextConfig = {
      rules: JSON.parse(settings.rulesData || '[]'),
    };

    // Удаляем ID поля
    const cleanConfig = this.removeIdsFromConfig(config);

    if (!cleanConfig.rules || cleanConfig.rules.length === 0) return '';

    // Генерируем стили для всех правил
    const stylesParts = ['<style>', '  html,', '  body {', '    scroll-behavior: smooth;', '  }'];
    const scriptsParts: string[] = [];

    cleanConfig.rules.forEach((rule, index) => {
      const { animationSpeed, animationIdentifier, animationStart, animationEnd } = rule;

      // CSS стили для правила
      const ruleStyles = [
        `  /* Правило ${index + 1}: ${animationIdentifier} */`,
        `  p[class*='${animationIdentifier}'] span,`,
        `  div[class*='${animationIdentifier}'] span,`,
        `  span[class*='${animationIdentifier}'] {`,
        `    opacity: 0;`,
        `    display: inline-block !important;`,
        `  }`,
      ];

      if (index === 0) {
        ruleStyles.push(
          '',
          '  .space-char {',
          '    display: inline-block;',
          '    width: 0.27em;',
          '  }',
        );
      }

      ruleStyles.push(
        '',
        `  .${animationIdentifier}-child {`,
        `    transition: all ${animationSpeed} linear;`,
        `  }`,
      );

      stylesParts.push(ruleStyles.join('\n'));

      // JavaScript код для правила
      scriptsParts.push(`    (function() {
      // Правило ${index + 1}: ${animationIdentifier}
      const animationSpeed = '${animationSpeed}';
      const inputAnimationIdentifier = '${animationIdentifier}';
      const animationStart = ${animationStart};
      const animationEnd = ${animationEnd};

      const animationIdentifier = inputAnimationIdentifier;
      const textElements = document.querySelectorAll('[class*="' + animationIdentifier + '"]');
      const getChildClassName = (className) => {
        const animationClassName = className.split(' ').find((cls) => cls === animationIdentifier);
        if (!animationClassName) return '';
        return animationClassName + '-child';
      };

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
        {
          threshold: 0,
        }
      );

      function animateElement(element) {
        const className = element.className;
        if (!className) return;

        if (!originalTexts.has(element)) {
          originalTexts.set(element, element.innerHTML.trim());
        }

        const originalContent = element.cloneNode(true);
        element.innerHTML = '';

        createAndAnimateCharacters();

        function createAndAnimateCharacters() {
          const childClassName = getChildClassName(className);

          const charElements = [];

          const walker = document.createTreeWalker(originalContent, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);

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
            element.appendChild(charSpan);
            charElements.push(charSpan);
          });

          requestAnimationFrame(() => {
            element.style.visibility = 'visible';
          });
        }
      }

      function updateScrollAnimations() {
        document.querySelectorAll('.' + animationIdentifier).forEach((paragraph) => {
          const chars = Array.from(paragraph.querySelectorAll('span'));
          const rect = paragraph.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          const start = windowHeight * animationStart;
          const end = windowHeight * animationEnd;

          if ((window.scrollY === 0 && rect.top >= 0) || rect.top > start) {
            chars.forEach((char) => {
              char.style.opacity = '0';
            });
            return;
          }

          if (rect.top + rect.height < end) {
            chars.forEach((char) => {
              char.style.opacity = '1';
            });
            return;
          }

          const progress = 1 - (rect.top - end) / (start - end);
          chars.forEach((char, i) => {
            const charProgress = i / chars.length;
            char.style.opacity = progress > charProgress ? '1' : '0';
          });
        });
      }

      window.addEventListener('scroll', updateScrollAnimations);
      window.addEventListener('resize', updateScrollAnimations);
      updateScrollAnimations();

      textElements.forEach((element) => {
        observer.observe(element);
      });
      })();
`);
    });

    stylesParts.push('</style>');

    const styles = stylesParts.join('\n');
    const scripts = `<script type="module">
  document.addEventListener('DOMContentLoaded', () => {
${scriptsParts.join('\n\n')}
  });
</script>`;

    return `${styles}\n\n${scripts}`;
  }
}
