export const template = `
  <div class="ttg-countries-modal-overlay">
    <div class="ttg-countries-modal">
      <div class="ttg-countries-modal-header">
        <h3 class="ttg-countries-modal-title">Список стран для GeoJS API</h3>
        <button class="ttg-countries-modal-close" type="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div class="ttg-countries-modal-content">
        <p class="ttg-countries-modal-description">
          Используйте полное название страны на английском языке. Ниже приведены примеры наиболее распространенных стран:
        </p>
        
        <div class="ttg-countries-modal-search">
          <ttg-input 
            label="Поиск" 
            placeholder="Поиск страны..." 
            class="ttg-countries-modal-search-input">
          </ttg-input>
        </div>
        
        <div class="ttg-countries-modal-table-container">
          <table class="ttg-countries-modal-table">
            <thead>
              <tr>
                <th>Полное название (использовать)</th>
                <th>Код ISO (НЕ использовать)</th>
              </tr>
            </thead>
            <tbody class="ttg-countries-modal-table-body">
              <!-- Countries will be populated here -->
            </tbody>
          </table>
        </div>
        
        <p class="ttg-countries-modal-note">
          <strong>Примечание:</strong> Для обозначения любой страны используйте символ "*". Нажмите на название страны, чтобы использовать его.
        </p>
      </div>
      
      <div class="ttg-countries-modal-footer">
        <button class="ttg-countries-modal-close-btn" type="button">
          Закрыть
        </button>
      </div>
    </div>
  </div>
`;
