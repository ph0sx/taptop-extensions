import '../../ui/Generator/Generator';
import '../../ui/GeneratorSection/GeneratorSection';
import '../../ui/Input/Input';
import '../../ui/Tab/Tab';
import '../../ui/Tabs/Tabs';
import '../../ui/Dropdown/Dropdown';
import '../../ui/Button/Button';

export const template = `
  <ttg-generator>
    <!-- Табы -->
    <ttg-tabs>
      <ttg-tab active data-tab="text">Замена текста</ttg-tab>
      <ttg-tab data-tab="blocks">Управление блоками</ttg-tab>
      <ttg-tab data-tab="ip">Правила по IP</ttg-tab>
    </ttg-tabs>

    <!-- Содержимое табов -->
    <div class="tab-content active" id="text-tab">
      <div id="text-replacements-container" class="cards-container">
        <!-- Динамически добавляемые карточки для замены текста -->
      </div>
      <div class="add-button-container">
        <ttg-button variant="secondary" data-action="add-text-replacement">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5V19M5 12H19"></path>
          </svg>
          <span>Добавить замену текста</span>
        </ttg-button>
      </div>
    </div>

    <div class="tab-content" id="blocks-tab">
      <ttg-generator-section class="compact">
      <div class="card">
        <div class="rule-block">
          <div class="rule-header">
            <div class="rule-title">
              <div class="sub-rule-title-text">Настройки по умолчанию</div>
              <ttg-question></ttg-question>
            </div>
        </div>
        <div class="rule-main">
            <ttg-input 
          id="default-show-blocks" 
          label="Показать блоки (через запятую)" 
          placeholder="block1, block2">
        </ttg-input>
        <ttg-input 
          id="default-hide-blocks" 
          label="Скрыть блоки (через запятую)" 
          placeholder="block3, block4">
        </ttg-input>
        </div>
        </div>
        </div>
      </ttg-generator-section>
      
      <div id="block-visibility-container" class="cards-container">
        <!-- Динамически добавляемые правила видимости блоков -->
      </div>
      
      <div class="add-button-container">
        <ttg-button variant="secondary" data-action="add-block-rule">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5V19M5 12H19"></path>
          </svg>
          <span>Добавить правило видимости</span>
        </ttg-button>
      </div>
    </div>

    <div class="tab-content" id="ip-tab">
      <div id="ip-rules-container" class="cards-container">
        <!-- Динамически добавляемые правила для IP -->
      </div>
      
      <div class="add-button-container">
        <ttg-button variant="secondary" data-action="add-ip-rule">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5V19M5 12H19"></path>
          </svg>
          <span>Добавить IP правило</span>
        </ttg-button>
      </div>
    </div>
  </ttg-generator>
`;
