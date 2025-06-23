export const template = `
<div class="ttg-generator">
  <!-- Header -->
  <div class="ttg-generator-header">
    <div class="ttg-generator-icon"></div>
    <h2 class="ttg-generator-title">Генератор</h2>
  </div>
  
  <!-- Sections Container -->
  <div class="ttg-generator-sections">
   <slot></slot>
  </div>
  
  <!-- Generate Button -->
  <div class="ttg-generator-button-container">
    <ttg-button >Сгенерировать код</ttg-button>
  </div>
</div>
`;
