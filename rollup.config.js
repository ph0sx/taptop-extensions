import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';

// Общая конфигурация для плагинов
const commonPlugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
    // Специфические настройки для @simonwep/pickr
    exportConditions: ['import', 'module', 'default'],
  }),
  commonjs({
    // Специальная обработка для @simonwep/pickr
    include: ['node_modules/@simonwep/pickr/**'],
  }),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
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

// Функция для создания сборки генератора
const createGeneratorBuild = (input, output) => ({
  input,
  output: {
    file: output,
    format: 'es',
    inlineDynamicImports: true,
  },
  plugins: commonPlugins,
});

// Основная сборка со всеми компонентами
const mainBuild = {
  input: 'src/entries/main.ts',
  output: {
    file: 'dist/index.js',
    format: 'iife',
    inlineDynamicImports: true,
  },
  plugins: commonPlugins,
};

// Отдельные генераторы в ESM формате для оптимальной загрузки
const cookieGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-cookie-generator.ts',
  'dist/cookie-generator.js',
);
const multilandingGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-multilanding-generator.ts',
  'dist/multilanding-generator.js',
);
const lottieAutoplayGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-lottie-autoplay-generator.ts',
  'dist/lottie-autoplay-generator.js',
);
const lottieScrollGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-lottie-scroll-generator.ts',
  'dist/lottie-scroll-generator.js',
);
const lottieScrollStickyGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-lottie-scroll-sticky-generator.ts',
  'dist/lottie-scroll-sticky-generator.js',
);
const fadeInTextGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-fade-in-text-generator.ts',
  'dist/fade-in-text-generator.js',
);
const fadeInScrollTextGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-fade-in-scroll-text-generator.ts',
  'dist/fade-in-scroll-text-generator.js',
);
const fadeOutTextGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-fade-out-text-generator.ts',
  'dist/fade-out-text-generator.js',
);
const blurTextGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-blur-text-generator.ts',
  'dist/blur-text-generator.js',
);
const blurTextScrollGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-blur-text-scroll-generator.ts',
  'dist/blur-text-scroll-generator.js',
);
const stairsTextGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-stairs-text-generator.ts',
  'dist/stairs-text-generator.js',
);
const floatingTextGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-floating-text-generator.ts',
  'dist/floating-text-generator.js',
);
const colorTransitionTextGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-color-transition-text-generator.ts',
  'dist/color-transition-text-generator.js',
);
const colorScrollTextGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-color-scroll-text-generator.ts',
  'dist/color-scroll-text-generator.js',
);
const doubleColorFlowTextGeneratorBuild = createGeneratorBuild(
  'src/entries/entry-double-color-flow-text-generator.ts',
  'dist/double-color-flow-text-generator.js',
);

export default [
  mainBuild,
  cookieGeneratorBuild,
  multilandingGeneratorBuild,
  lottieAutoplayGeneratorBuild,
  lottieScrollGeneratorBuild,
  lottieScrollStickyGeneratorBuild,
  fadeInTextGeneratorBuild,
  fadeInScrollTextGeneratorBuild,
  fadeOutTextGeneratorBuild,
  blurTextGeneratorBuild,
  blurTextScrollGeneratorBuild,
  stairsTextGeneratorBuild,
  floatingTextGeneratorBuild,
  colorTransitionTextGeneratorBuild,
  colorScrollTextGeneratorBuild,
  doubleColorFlowTextGeneratorBuild,
];
