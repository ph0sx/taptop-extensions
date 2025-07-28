import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';
import resolve from '@rollup/plugin-node-resolve';

// Общая конфигурация для плагинов
const commonPlugins = [
  resolve({ browser: true }),
  postcss({
    extract: false,
    inject: false,
    to: 'string',
    plugins: [
      cssnano({
        preset: 'default',
      }),
    ],
  }),
  typescript(),
  terser({
    compress: {
      drop_console: false,
      drop_debugger: true,
      pure_funcs: [],
      passes: 2,
    },
    mangle: {
      toplevel: true,
    },
    format: {
      comments: false,
    },
  }),
];

// Основная сборка со всеми компонентами
const mainBuild = {
  input: 'src/entries/main.ts',
  output: {
    file: 'dist/index.js',
    format: 'iife',
  },
  plugins: commonPlugins,
};

// Отдельные генераторы в ESM формате для оптимальной загрузки
const cookieGeneratorBuild = {
  input: 'src/entries/entry‑cookie‑generator.ts',
  output: {
    file: 'dist/cookie-generator.js',
    format: 'es',
  },

  plugins: commonPlugins,
};

const multilandingGeneratorBuild = {
  input: 'src/entries/entry-multilanding-generator.ts',
  output: {
    file: 'dist/multilanding-generator.js',
    format: 'es',
  },

  plugins: commonPlugins,
};

export default [mainBuild, cookieGeneratorBuild, multilandingGeneratorBuild];
