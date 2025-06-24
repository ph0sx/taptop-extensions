export const template = `
  <ttg-generator>
    <ttg-generator-section title="Основные настройки">
      <ttg-input id="expiry-days" label="Срок хранения (дней)" type="number" tooltip="По умолчанию 30 дней" required min="1" max="365"></ttg-input>
      <ttg-input id="popup-class" label="Класс Pop-up виджета" type="text" tooltip="По умолчанию ttg-cookie-popup"></ttg-input>
    </ttg-generator-section>
    
    <ttg-generator-section title="Кнопки" bordered>
      <ttg-input id="consent-btn-class" label="Класс кнопки «Принять»" type="text"></ttg-input>
      <ttg-input id="reject-btn-class" label="Класс кнопки «Отклонить»" type="text"></ttg-input>
    </ttg-generator-section>
  </ttg-generator>
`;
