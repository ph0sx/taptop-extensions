// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, {
  plugins: { prettier: prettierPlugin },
  rules: {
    // Prettier берёт на себя «формат». Ошибка = неотформатировано.
    'prettier/prettier': 'error',
    '@typescript-eslint/consistent-type-imports': 'warn',
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
  languageOptions: {
    parserOptions: { project: './tsconfig.json' }, // typed-lint
  },
  ignores: ['dist', 'node_modules'],
});
