export interface GeneratorConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface GeneratorElements {
  [key: string]: HTMLElement | null;
}

export abstract class BaseGenerator extends HTMLElement {
  //Объявления полей
  protected shadow: ShadowRoot;
  protected config: GeneratorConfig = {};
  protected elements: GeneratorElements = {};
  private initialized: boolean = false;
  private eventHandlers: Map<string, EventListener> = new Map();

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' }); //Создает ссылку на экземпляр ShadowRoot для элемента
  }

  /* МЕТОДЫ ЖИЗНЕННОГО ЦИКЛА ВЕБ-КОМПОНЕНТА */

  //LIFECYCLE: Вызывается когда кастомный элемент вставляется в DOM
  connectedCallback(): void {
    if (!this.initialized) {
      this.init();
      this.initialized = true;
    }
  }

  //LIFECYCLE: Вызывается когда кастомный элемент удаляется из DOM
  disconnectedCallback(): void {
    this.destroy();
  }

  protected init(): void {
    this.render();
    this.findElements();
    this.setInitialState();
    this.bindEvents();
  }

  protected render(): void {
    const styles = this.getStyles();
    const template = this.getTemplate();
    this.shadow.innerHTML = `
    <style>${styles}</style>
    ${template}
    `;
  }

  // Получение стилей и шаблона. Должны быть переопределены
  protected abstract getStyles(): string;
  protected abstract getTemplate(): string;

  //Ищем элементы
  protected findElements(): void {
    //сюда кнопку генерации
    //сюды элементы модалки
    //сюды всё базовое короче
    this.elements.genBtn = this.shadow.querySelector<HTMLElement>('#gen-btn');
    this.elements.generator = this.shadow.querySelector<HTMLElement>('ttg-generator');
    this.elements.codeOutput = this.shadow.querySelector<HTMLElement>('#code-output');
    /*this.elements.generateButton = this.shadow.querySelector('.generate-button');
    this.elements.modal = this.shadow.querySelector('.modal');
    this.elements.modalCloseButtons = this.shadow.querySelectorAll('.modal-close');
    this.elements.codeOutput = this.shadow.querySelector('.code-output'); */
  }

  //Навешиваем обработчики
  protected bindEvents(): void {
    //Обрабочик для кнопки генерации через ttg-generator событие
    if (this.elements.generator) {
      const handler = () => this.generateAndCopyCode();
      this.eventHandlers.set('generate', handler);
      this.elements.generator.addEventListener('generate', handler);
    }

    //Обрабочик для кнопки генерации напрямую (fallback)
    if (this.elements.genBtn) {
      const handler = () => this.generateAndCopyCode();
      this.eventHandlers.set('generate-direct', handler);
      this.elements.genBtn.addEventListener('click', handler);
    }
  }

  // Устанавливает начальное состояние для элементов. Должно быть переопределено
  protected setInitialState(): void {}

  protected async generateAndCopyCode(): Promise<void> {
    try {
      const settings = this.collectData();
      if (!settings) return;

      const code = this.generateCode(settings);

      if (this.elements.codeOutput) {
        this.elements.codeOutput.textContent = code;
      }

      await this.copyToClipboard(code);
    } catch (error) {
      console.error('Ошибка генерации кода: ', error);
    }
  }

  protected abstract collectData(): GeneratorConfig | null;
  protected abstract generateCode(settings: GeneratorConfig): string;

  protected async copyToClipboard(code: string): Promise<void> {
    const minified = this.minifyCode(code);

    try {
      await navigator.clipboard.writeText(minified);
      // eslint-disable-next-line no-console
      console.log('Код скопирован в буфер обмена');
    } catch {
      this.fallbackCopy(minified);
    }
  }

  //TODO: Минификацию и клипбоард вынести в утилиты?
  protected minifyCode(code: string): string {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/\s+/g, ' ')
      .replace(/;\s+/g, ';')
      .replace(/{\s+/g, '{')
      .replace(/\s+}/g, '}')
      .replace(/,\s+/g, ',')
      .replace(/\s*([=+\-*/<>!&|]+)\s*/g, '$1')
      .trim();
  }

  // Для старых браузеров
  private fallbackCopy(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    try {
      textarea.select();
      const successCopied = document.execCommand('copy');

      if (!successCopied) {
        throw new Error('Не удалось скопировать код в буфер обмена');
      }
    } finally {
      document.body.removeChild(textarea);
    }
  }

  // Отвязываем обработчики
  protected unbindEvents(): void {
    if (this.elements.generator && this.eventHandlers.has('generate')) {
      this.elements.generator.removeEventListener('generate', this.eventHandlers.get('generate')!);
    }

    if (this.elements.genBtn && this.eventHandlers.has('generate-direct')) {
      this.elements.genBtn.removeEventListener('click', this.eventHandlers.get('generate-direct')!);
    }

    this.eventHandlers.clear();
  }

  protected destroy(): void {
    this.unbindEvents();
    this.initialized = false;
  }
}
