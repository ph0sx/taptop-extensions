// src/components/cookie/CookieGenerator.template.ts

export const template = `
<div class="generator-form">
  <div class="form-group">
    <label for="expiry-days">Срок хранения (дней)</label>
    <input type="number" id="expiry-days" class="form-control">
  </div>
  <div class="form-group">
    <label for="popup-class">Класс Pop-up виджета</label>
    <input type="text" id="popup-class" class="form-control">
  </div>
  <div class="form-group">
    <label for="consent-btn-class">Класс кнопки «Принять»</label>
    <input type="text" id="consent-btn-class" class="form-control">
  </div>
  <div class="form-group">
    <label for="reject-btn-class">Класс кнопки «Отклонить»</label>
    <input type="text" id="reject-btn-class" class="form-control">
  </div>
</div>

<button class="gen-btn">Сгенерировать и скопировать код</button>

<div class="output-area">
    <h3>Сгенерированный код:</h3>
    <pre><code class="code-output">Нажмите кнопку, чтобы сгенерировать код...</code></pre>
</div>
`;
