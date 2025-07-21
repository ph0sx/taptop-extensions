import '../../ui/Generator/Generator';
import '../../ui/GeneratorSection/GeneratorSection';
import '../../ui/Input/Input';

export const template = `
  <ttg-generator>
    <ttg-generator-section label="Основные настройки">
      <ttg-input id="expiry-days" label="Срок хранения (дней)" type="number" tooltip="Количество дней, в течение которых будет сохраняться согласие пользователя на использование cookie" required min="1" max="365"></ttg-input>
    </ttg-generator-section>
  </ttg-generator>
`;
