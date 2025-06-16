// src/components/cookie/CookieGenerator.template.ts

export const template = `
<div class="generator-form">
  <ttg-input id="expiry-days" label="Срок хранения (дней)" type="number" required></ttg-input>
  <ttg-input id="popup-class" label="Класс Pop-up виджета" type="text"></ttg-input>
  <ttg-input id="consent-btn-class" label="Класс кнопки «Принять»" type="text"></ttg-input>
  <ttg-input id="reject-btn-class" label="Класс кнопки «Отклонить»" type="text"></ttg-input>
</div>

<button class="gen-btn">Сгенерировать и скопировать код</button>

<div class="output-area">
    <h3>Сгенерированный код:</h3>
    <pre><code class="code-output">...</code></pre>
</div>
`;
