import baseStyles from '../../styles/base.css';

interface TerserMinifyResult {
  code?: string;
  error?: Error;
}

interface TerserInstance {
  minify: (
    code: string,
    options?: {
      compress?: {
        drop_console?: boolean;
        drop_debugger?: boolean;
        pure_funcs?: string[];
      };
      mangle?: boolean;
      format?: {
        comments?: boolean;
      };
    },
  ) => Promise<TerserMinifyResult>;
}

declare global {
  interface Window {
    Terser?: TerserInstance;
  }
}

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
  protected eventHandlers: Map<string, EventListener> = new Map();

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
    <style>${baseStyles}${styles}</style>
    ${template}
    `;
  }

  // Получение стилей и шаблона. Должны быть переопределены
  protected abstract getStyles(): string;
  protected abstract getTemplate(): string;

  //Ищем элементы
  protected findElements(): void {
    this.elements.genBtn = this.shadow.querySelector<HTMLElement>('#gen-btn');
    this.elements.generator = this.shadow.querySelector<HTMLElement>('ttg-generator');
    this.elements.codeOutput = this.shadow.querySelector<HTMLElement>('#code-output');
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
      this.showSuccessPopup();
    } catch (error) {
      console.error('Ошибка генерации кода: ', error);
    }
  }

  protected abstract collectData(): GeneratorConfig | null;
  protected abstract generateCode(settings: GeneratorConfig): string;

  protected async copyToClipboard(code: string): Promise<void> {
    const minified = await this.minifyCode(code);

    try {
      await navigator.clipboard.writeText(minified);
      console.warn('Код скопирован в буфер обмена');
    } catch {
      this.fallbackCopy(minified);
    }
  }

  //TODO: Минификацию и клипбоард вынести в утилиты?
  protected async minifyCode(code: string): Promise<string> {
    try {
      // Загружаем terser из CDN для браузера
      if (!window.Terser) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/terser@5/dist/bundle.min.js  ';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Извлекаем JavaScript код из <script> тэгов
      const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
      const match = scriptRegex.exec(code);

      if (match && match[1]) {
        // Минифицируем только JavaScript код
        const jsCode = match[1].trim();
        const result = await window.Terser!.minify(jsCode, {
          compress: {
            drop_console: false,
            drop_debugger: true,
            pure_funcs: [],
          },
          mangle: false,
          format: {
            comments: false,
          },
        });

        // Возвращаем код в тэгах script
        return `<script>${result.code || jsCode}</script>`;
      }

      return code;
    } catch (error) {
      console.warn('Terser minification failed, using fallback:', error);
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

  protected showSuccessPopup(): void {
    console.warn('BaseGenerator: Attempting to show success popup');
    // 1. Динамически ищем элементы КАЖДЫЙ раз при вызове
    const successPopup = document.querySelector<HTMLElement>('.pop-up-success');
    const popupAcceptBtn = document.querySelector<HTMLElement>('[data-popup-accept-btn]');
    const popupCloseBtn = document.querySelector<HTMLElement>('[data-popup-close-btn]');
    // Для улучшенного клика по оверлею (как в других компонентах)
    const popupContent = successPopup
      ? successPopup.querySelector<HTMLElement>('.pop-up__content')
      : null;

    // 2. Проверяем, найден ли основной элемент попапа
    if (!successPopup) {
      console.warn('BaseGenerator: Success popup element (.pop-up-success) not found in DOM.');
      // Fallback - показываем alert
      alert('Код скопирован в буфер обмена!');
      return;
    }

    // 3. Определяем функцию для скрытия попапа
    const hidePopupFunction = () => {
      successPopup.style.display = 'none';
      console.warn('BaseGenerator: Popup hidden');
    };

    // 4. Отвязываем предыдущие обработчики (если они были привязаны ранее)
    // Это важно, если функция вызывается несколько раз
    if (popupAcceptBtn) {
      popupAcceptBtn.removeEventListener('click', hidePopupFunction);
    }
    if (popupCloseBtn) {
      popupCloseBtn.removeEventListener('click', hidePopupFunction);
    }

    // 5. Привязываем НОВЫЕ обработчики событий
    if (popupAcceptBtn) {
      popupAcceptBtn.addEventListener('click', hidePopupFunction);
      console.warn('BaseGenerator: Accept button handler bound');
    } else {
      console.warn('BaseGenerator: Accept button [data-popup-accept-btn] not found');
    }

    if (popupCloseBtn) {
      popupCloseBtn.addEventListener('click', hidePopupFunction);
      console.warn('BaseGenerator: Close button handler bound');
    } else {
      console.warn('BaseGenerator: Close button [data-popup-close-btn] not found');
    }

    // 6. Улучшенный обработчик клика по overlay (как в других компонентах)
    const overlayClickHandler = (event: Event) => {
      console.warn('BaseGenerator: Overlay click detected', {
        target: (event.target as HTMLElement)?.className,
        currentTarget: (event.currentTarget as HTMLElement)?.className,
        popupContentExists: !!popupContent,
      });

      // Проверяем, существует ли элемент содержимого попапа
      if (popupContent) {
        // Проверяем, что клик был НЕ по элементу содержимого попапа и не по его потомкам
        if (!popupContent.contains(event.target as Node)) {
          console.warn('BaseGenerator: Click outside popup content - hiding popup');
          hidePopupFunction();
        } else {
          console.warn('BaseGenerator: Click inside popup content - keeping popup open');
        }
      } else {
        console.warn(
          'BaseGenerator: Popup content (.pop-up__content) not found inside .pop-up-success.',
        );
        // Fallback к старой логике, если структура нестандартная
        if (event.target === successPopup) {
          console.warn('BaseGenerator: Using fallback logic - hiding popup');
          hidePopupFunction();
        }
      }
    };

    // Отвязываем старый обработчик overlay, если он был (простой способ - отвязать по той же ссылке)
    successPopup.removeEventListener('click', overlayClickHandler); // Отвязываем, если был привязан ранее
    // Привязываем обработчик клика по всему попапу (оверлею)
    successPopup.addEventListener('click', overlayClickHandler);
    console.warn('BaseGenerator: Enhanced overlay click handler bound', {
      popupContentFound: !!popupContent,
    });

    // 7. Показываем попап
    successPopup.style.display = 'flex';
    console.warn('BaseGenerator: Popup shown');
  }

  protected hideSuccessPopup(): void {
    console.warn('hideSuccessPopup вызван');
    try {
      const successPopup = document.querySelector<HTMLElement>('.pop-up-success');

      if (successPopup) {
        successPopup.style.display = 'none';
      }
    } catch (error) {
      console.error('Ошибка в hideSuccessPopup:', error);
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
