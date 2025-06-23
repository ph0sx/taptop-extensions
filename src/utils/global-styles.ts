import { variables } from '../styles/vars.styles.js';

/**
 * Инициализация глобальных CSS переменных
 * Добавляет стили в <head> документа для доступности переменных везде
 */
export function initGlobalStyles(): void {
  // Проверяем, не добавлены ли стили уже
  if (document.querySelector('#ttg-global-vars')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'ttg-global-vars';
  style.textContent = variables;

  document.head.appendChild(style);
}
