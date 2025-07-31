import { LitElement, html, type TemplateResult, unsafeCSS } from 'lit';
import { state, query } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import { CodeMinifier, type MinifierOptions } from '../../services/CodeMinifier.js';
import { ClipboardService } from '../../services/ClipboardService.js';
import { NotificationManager } from '../../services/NotificationManager.js';
import type { ValidationRuleMap } from '../../controllers/ReactiveValidationController.js';

export type GeneratorConfig = Record<string, string | number | boolean | Date | null | undefined>;

export abstract class BaseGenerator extends LitElement {
  // Базовые стили
  static styles = [unsafeCSS(baseStyles)];

  // Состояние генерации
  @state()
  protected isGenerating = false;

  // DOM элементы
  @query('ttg-generator')
  protected generatorElement?: HTMLElement;

  @query('#gen-btn')
  protected genBtn?: HTMLElement;

  @query('#code-output')
  protected codeOutput?: HTMLElement;

  // Утилитные сервисы
  protected codeMinifier = CodeMinifier.getInstance();
  protected clipboardService = ClipboardService.getInstance();
  protected notificationManager = NotificationManager.getInstance();

  // Основной рендер
  render(): TemplateResult {
    return html`${this.renderContent()}`;
  }

  // Абстрактные методы для наследников
  protected abstract renderContent(): TemplateResult;
  protected abstract collectData(): GeneratorConfig | null;
  protected abstract generateCode(settings: GeneratorConfig): string;

  // Новый абстрактный метод для реактивной валидации
  protected abstract getValidationRules(): ValidationRuleMap;

  // Метод для извлечения значения поля из состояния (переопределяется в наследниках)
  protected getFieldValue(fieldId: string): string {
    const element = this.shadowRoot?.getElementById(fieldId) as HTMLInputElement;
    return element?.value || '';
  }

  // Инициализация после первого рендера
  firstUpdated(): void {
    this.bindEvents();
  }

  // Привязка событий
  protected bindEvents(): void {
    if (this.generatorElement) {
      this.generatorElement.addEventListener('generate', () => this.generateAndCopyCode());
    }

    if (this.genBtn) {
      this.genBtn.addEventListener('click', () => this.generateAndCopyCode());
    }
  }

  // Основной процесс генерации
  protected async generateAndCopyCode(): Promise<void> {
    if (this.isGenerating) return;

    try {
      this.isGenerating = true;

      const settings = this.collectData();
      if (!settings) return;

      const code = this.generateCode(settings);

      if (this.codeOutput) {
        this.codeOutput.innerHTML = code;
      }

      const minified = await this.codeMinifier.minify(code, this.getMinifierOptions());
      await this.clipboardService.copy(minified);
      this.notificationManager.showSuccess();
    } catch (error) {
      console.error('Ошибка генерации кода:', error);
    } finally {
      this.isGenerating = false;
    }
  }

  // Опции минификации (можно переопределить в наследниках)
  protected getMinifierOptions(): MinifierOptions {
    return {
      dropConsole: false,
      dropDebugger: true,
      mangle: false,
      comments: false,
    };
  }
}
