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

      // Извлекаем JavaScript из <script> тегов
      const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
      const match = scriptRegex.exec(code);

      if (match && match[1]) {
        const jsCode = match[1].trim();
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

        return `<script>${result.code || jsCode}</script>`;
      }

      return code;
    } catch (error) {
      console.warn('Terser минификация не удалась, используем fallback:', error);
      return this.fallbackMinify(code);
    }
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
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Удаляем многострочные комментарии
      .replace(/\/\/.*$/gm, '') // Удаляем однострочные комментарии
      .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
      .replace(/;\s+/g, ';') // Убираем пробелы после точки с запятой
      .replace(/{\s+/g, '{') // Убираем пробелы после открывающих скобок
      .replace(/\s+}/g, '}') // Убираем пробелы перед закрывающими скобками
      .replace(/,\s+/g, ',') // Убираем пробелы после запятых
      .replace(/\s*([=+\-*/<>!&|]+)\s*/g, '$1') // Убираем пробелы вокруг операторов
      .trim();
  }
}
