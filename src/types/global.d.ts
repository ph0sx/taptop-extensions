declare module '*.css' {
  const content: string;
  export default content;
}

interface TerserOptions {
  compress?: {
    drop_console?: boolean;
    drop_debugger?: boolean;
    pure_funcs?: string[];
  };
  mangle?: boolean;
  format?: {
    comments?: boolean;
  };
}

interface TerserResult {
  code?: string;
  error?: Error;
}

declare global {
  interface Window {
    Terser?: {
      minify: (code: string, options?: TerserOptions) => Promise<TerserResult>;
    };
  }
}
