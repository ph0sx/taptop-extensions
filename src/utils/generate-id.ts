/**
 * Генерирует уникальный ID для элементов
 * @param prefix - префикс для ID (по умолчанию 'ttg')
 * @returns уникальный ID строка
 */
export function generateUniqueId(prefix = 'ttg'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}
