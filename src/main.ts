// Инициализация глобальных CSS переменных
import { initGlobalStyles } from './utils/global-styles.js';

// Импорт всех компонентов
import './ui/Question/Question.js';
import './ui/Input/Input.js';
import './ui/Button/Button.js';
import './ui/Generator/Generator.js';
import './ui/GeneratorSection/GeneratorSection.js';
import './components/cookie/CookieGenerator.js';
import './components/multilanding/MultilandingGenerator.js';

// Инициализация при загрузке документа
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalStyles);
} else {
  initGlobalStyles();
}
