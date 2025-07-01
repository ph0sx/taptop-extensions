import '../../ui/Generator/Generator';
import '../../ui/GeneratorSection/GeneratorSection';
import '../../ui/Input/Input';
import '../../ui/Tab/Tab';
import '../../ui/Dropdown/Dropdown';

export const template = `
  <ttg-generator>
    <!-- Табы -->
    <div class="tabs">
      <ttg-tab active data-tab="text">Замена текста</ttg-tab>
      <ttg-tab data-tab="blocks">Управление блоками</ttg-tab>
      <ttg-tab data-tab="ip">Правила по IP</ttg-tab>
    </div>

    <!-- Содержимое табов -->
    <div class="tab-content active" id="text-tab">
      <ttg-generator-section>
        <div id="text-replacements-container" class="cards-container">
          <!-- Динамически добавляемые карточки для замены текста -->
        </div>
        
        <button id="add-text-replacement" class="add-card-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5V19M5 12H19"></path>
          </svg>
          <span>Добавить замену текста</span>
        </button>
      </ttg-generator-section>
    </div>

    <div class="tab-content" id="blocks-tab">
      <ttg-generator-section label="Управление блоками">
        <div class="settings-card">
          <h4 class="settings-title">Настройки по умолчанию</h4>
          <p class="helper-text">Эти блоки будут показаны/скрыты, если не сработает ни одно из правил UTM.</p>
          
          <div class="form-row">
            <div class="form-group">
              <ttg-input 
                id="default-show-blocks" 
                label="Показать блоки (через запятую)" 
                placeholder="block1, block2">
              </ttg-input>
            </div>
            <div class="form-group">
              <ttg-input 
                id="default-hide-blocks" 
                label="Скрыть блоки (через запятую)" 
                placeholder="block3, block4">
              </ttg-input>
            </div>
          </div>
        </div>
        
        <div id="block-visibility-container" class="cards-container">
          <!-- Динамически добавляемые правила видимости блоков -->
        </div>
        
        <button id="add-block-rule" class="add-card-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5V19M5 12H19"></path>
          </svg>
          <span>Добавить правило видимости</span>
        </button>
      </ttg-generator-section>
    </div>

    <div class="tab-content" id="ip-tab">
      <ttg-generator-section label="Правила по IP">
        <div id="ip-rules-container" class="cards-container">
          <!-- Динамически добавляемые правила для IP -->
        </div>
        
        <button id="add-ip-rule" class="add-card-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5V19M5 12H19"></path>
          </svg>
          <span>Добавить IP правило</span>
        </button>
      </ttg-generator-section>
    </div>
  </ttg-generator>
`;
