// Интерфейсы для Terser минификации
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

export interface MinifierOptions {
  dropConsole?: boolean;
  dropDebugger?: boolean;
  mangle?: boolean;
  comments?: boolean;
}

export class CodeMinifier {
  private static instance: CodeMinifier;
  private terserLoaded = false;

  private constructor() {}

  static getInstance(): CodeMinifier {
    if (!CodeMinifier.instance) {
      CodeMinifier.instance = new CodeMinifier();
    }
    return CodeMinifier.instance;
  }

  // Минификация кода через Terser
  async minify(code: string, options: MinifierOptions = {}): Promise<string> {
    try {
      // Загружаем Terser если нужно
      if (!this.terserLoaded) {
        await this.loadTerser();
      }

      // Проверяем, есть ли в коде комбинация CSS + JS
      if (this.hasStyleAndScript(code)) {
        return this.minifyStyleAndScript(code, options);
      }

      // Извлекаем JavaScript из <script> тегов с сохранением атрибутов
      const scriptRegex = /<script([^>]*?)>([\s\S]*?)<\/script>/gi;
      const match = scriptRegex.exec(code);

      if (match && match[2]) {
        const scriptAttributes = match[1].trim(); // Атрибуты script тега
        const jsCode = match[2].trim(); // JavaScript код

        const result = await window.Terser!.minify(jsCode, {
          compress: {
            drop_console: options.dropConsole ?? false,
            drop_debugger: options.dropDebugger ?? true,
            pure_funcs: [],
          },
          mangle: options.mangle ?? false,
          format: {
            comments: options.comments ?? false,
          },
        });

        // Сохраняем атрибуты script тега в минифицированном результате
        const minifiedCode = result.code || jsCode;

        // Если есть атрибуты, добавляем их, иначе проверяем на наличие import/export
        if (scriptAttributes) {
          return `<script${scriptAttributes ? ' ' + scriptAttributes : ''}>${minifiedCode}</script>`;
        } else if (this.hasModuleSyntax(minifiedCode)) {
          // Автоматически добавляем type="module" если обнаружен ES6 import/export
          return `<script type="module">${minifiedCode}</script>`;
        } else {
          return `<script>${minifiedCode}</script>`;
        }
      }

      return code;
    } catch (error) {
      console.warn('Terser минификация не удалась, используем fallback:', error);
      return this.fallbackMinify(code);
    }
  }

  // Проверка наличия ES6 module синтаксиса в коде
  private hasModuleSyntax(code: string): boolean {
    // Ищем import или export statements
    const modulePatterns = [
      /\bimport\s+/, // import statements
      /\bexport\s+/, // export statements
      /\bimport\s*\(/, // dynamic import()
      /\bfrom\s+['"`]/, // from 'module'
    ];

    return modulePatterns.some((pattern) => pattern.test(code));
  }

  // Проверка наличия комбинации CSS + JS
  private hasStyleAndScript(code: string): boolean {
    const hasStyle = /<style[^>]*>[\s\S]*?<\/style>/i.test(code);
    const hasScript = /<script[^>]*>[\s\S]*?<\/script>/i.test(code);
    return hasStyle && hasScript;
  }

  // Минификация комбинированного CSS + JS кода
  private async minifyStyleAndScript(code: string, options: MinifierOptions): Promise<string> {
    try {
      // Извлекаем CSS
      const styleRegex = /<style([^>]*?)>([\s\S]*?)<\/style>/gi;
      const scriptRegex = /<script([^>]*?)>([\s\S]*?)<\/script>/gi;

      let minifiedResult = '';

      // Обрабатываем CSS
      const styleMatch = styleRegex.exec(code);
      if (styleMatch && styleMatch[2]) {
        const styleAttributes = styleMatch[1].trim();
        const cssCode = styleMatch[2].trim();
        const minifiedCSS = this.minifyCSS(cssCode);

        minifiedResult += `<style${styleAttributes ? ' ' + styleAttributes : ''}>${minifiedCSS}</style>`;
      }

      // Обрабатываем JavaScript
      const scriptMatch = scriptRegex.exec(code);
      if (scriptMatch && scriptMatch[2]) {
        const scriptAttributes = scriptMatch[1].trim();
        const jsCode = scriptMatch[2].trim();

        const result = await window.Terser!.minify(jsCode, {
          compress: {
            drop_console: options.dropConsole ?? false,
            drop_debugger: options.dropDebugger ?? true,
            pure_funcs: [],
          },
          mangle: options.mangle ?? false,
          format: {
            comments: options.comments ?? false,
          },
        });

        const minifiedJS = result.code || jsCode;
        minifiedResult += `<script${scriptAttributes ? ' ' + scriptAttributes : ''}>${minifiedJS}</script>`;
      }

      return minifiedResult;
    } catch (error) {
      console.warn('Комбинированная минификация не удалась:', error);
      return this.fallbackMinifyStyleAndScript(code);
    }
  }

  // Простая минификация CSS
  private minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Удаляем комментарии
      .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
      .replace(/;\s+/g, ';') // Убираем пробелы после точки с запятой
      .replace(/{\s+/g, '{') // Убираем пробелы после открывающих скобок
      .replace(/\s+}/g, '}') // Убираем пробелы перед закрывающими скобками
      .replace(/,\s+/g, ',') // Убираем пробелы после запятых
      .replace(/:\s+/g, ':') // Убираем пробелы после двоеточий
      .replace(/\s*([>+~])\s*/g, '$1') // Убираем пробелы вокруг селекторов
      .trim();
  }

  // Fallback минификация для комбинированного кода
  private fallbackMinifyStyleAndScript(code: string): string {
    const styleRegex = /<style([^>]*?)>([\s\S]*?)<\/style>/gi;
    const scriptRegex = /<script([^>]*?)>([\s\S]*?)<\/script>/gi;

    let result = '';

    // Обрабатываем CSS
    const styleMatch = styleRegex.exec(code);
    if (styleMatch && styleMatch[2]) {
      const styleAttributes = styleMatch[1].trim();
      const cssCode = styleMatch[2].trim();
      const minifiedCSS = this.minifyCSS(cssCode);
      result += `<style${styleAttributes ? ' ' + styleAttributes : ''}>${minifiedCSS}</style>`;
    }

    // Обрабатываем JavaScript с fallback минификацией
    const scriptMatch = scriptRegex.exec(code);
    if (scriptMatch && scriptMatch[2]) {
      const scriptAttributes = scriptMatch[1].trim();
      const jsCode = scriptMatch[2].trim();

      const minifiedJs = jsCode
        .replace(/\/\*[\s\S]*?\*\//g, '') // Удаляем многострочные комментарии
        .replace(/\/\/.*$/gm, '') // Удаляем однострочные комментарии
        .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
        .replace(/;\s+/g, ';') // Убираем пробелы после точки с запятой
        .replace(/{\s+/g, '{') // Убираем пробелы после открывающих скобок
        .replace(/\s+}/g, '}') // Убираем пробелы перед закрывающими скобками
        .replace(/,\s+/g, ',') // Убираем пробелы после запятых
        .replace(/\s*([=+\-*/<>!&|]+)\s*/g, '$1') // Убираем пробелы вокруг операторов
        .trim();

      result += `<script${scriptAttributes ? ' ' + scriptAttributes : ''}>${minifiedJs}</script>`;
    }

    return result;
  }

  // Загрузка Terser из CDN
  private async loadTerser(): Promise<void> {
    if (window.Terser) {
      this.terserLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/terser@5/dist/bundle.min.js';
    document.head.appendChild(script);

    await new Promise((resolve, reject) => {
      script.onload = () => {
        this.terserLoaded = true;
        resolve(void 0);
      };
      script.onerror = reject;
    });
  }

  // Fallback минификация без Terser
  private fallbackMinify(code: string): string {
    // Проверяем, есть ли комбинация CSS + JS
    if (this.hasStyleAndScript(code)) {
      return this.fallbackMinifyStyleAndScript(code);
    }

    // Проверяем наличие script тегов
    const scriptRegex = /<script([^>]*?)>([\s\S]*?)<\/script>/gi;
    const match = scriptRegex.exec(code);

    if (match && match[2]) {
      const scriptAttributes = match[1].trim();
      const jsCode = match[2].trim();

      const minifiedJs = jsCode
        .replace(/\/\*[\s\S]*?\*\//g, '') // Удаляем многострочные комментарии
        .replace(/\/\/.*$/gm, '') // Удаляем однострочные комментарии
        .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
        .replace(/;\s+/g, ';') // Убираем пробелы после точки с запятой
        .replace(/{\s+/g, '{') // Убираем пробелы после открывающих скобок
        .replace(/\s+}/g, '}') // Убираем пробелы перед закрывающими скобками
        .replace(/,\s+/g, ',') // Убираем пробелы после запятых
        .replace(/\s*([=+\-*/<>!&|]+)\s*/g, '$1') // Убираем пробелы вокруг операторов
        .trim();

      // Сохраняем атрибуты в fallback версии
      if (scriptAttributes) {
        return `<script ${scriptAttributes}>${minifiedJs}</script>`;
      } else if (this.hasModuleSyntax(minifiedJs)) {
        return `<script type="module">${minifiedJs}</script>`;
      } else {
        return `<script>${minifiedJs}</script>`;
      }
    }

    // Если это не script тег, просто минифицируем как есть
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
