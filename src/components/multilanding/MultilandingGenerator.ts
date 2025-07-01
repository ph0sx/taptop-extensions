import { BaseGenerator, type GeneratorConfig } from '../base/BaseGenerator';
import { initGlobalStyles } from '../../utils/global-styles';
import multilandingStyles from './MultilandingGenerator.styles.css';
import { template } from './MultilandingGenerator.template';

interface TextReplacement {
  keyword: string;
  defaultValue: string;
  utmRules: Array<{
    paramName: string;
    paramValue: string;
    replacementValue: string;
  }>;
}

interface BlockVisibilityRule {
  paramName: string;
  paramValue: string;
  showBlocks: string[];
  hideBlocks: string[];
}

interface IpRule {
  country: string;
  city: string;
  region: string;
  textReplacements: Array<{
    keyword: string;
    defaultValue: string;
    replacementValue: string;
  }>;
  showBlocks: string[];
  hideBlocks: string[];
}

interface MultilandingConfig extends GeneratorConfig {
  textReplacements: TextReplacement[];
  blockVisibility: BlockVisibilityRule[];
  defaultBlockVisibility: {
    showBlocks: string[];
    hideBlocks: string[];
  };
  ipRules: IpRule[];
}

export default class MultilandingGenerator extends BaseGenerator {
  private tabButtons: HTMLElement[] = [];
  private tabContents: HTMLElement[] = [];
  protected config: MultilandingConfig = {
    textReplacements: [
      {
        keyword: 'service',
        defaultValue: 'наши услуги',
        utmRules: [
          {
            paramName: 'utm_content',
            paramValue: 'design',
            replacementValue: 'услуги дизайна',
          },
        ],
      },
    ],
    blockVisibility: [
      {
        paramName: 'utm_campaign',
        paramValue: 'sale',
        showBlocks: ['block1'],
        hideBlocks: ['block2'],
      },
    ],
    defaultBlockVisibility: {
      showBlocks: [],
      hideBlocks: [],
    },
    ipRules: [
      {
        country: 'Russia',
        city: '*',
        region: '*',
        textReplacements: [
          {
            keyword: 'region',
            defaultValue: 'в вашем регионе',
            replacementValue: 'в России',
          },
        ],
        showBlocks: [],
        hideBlocks: [],
      },
    ],
  };

  private activeTab: string = 'text';

  constructor() {
    super();
    // Инициализируем глобальные стили при создании компонента
    initGlobalStyles();
  }

  protected getStyles(): string {
    return multilandingStyles;
  }

  protected getTemplate(): string {
    return template;
  }

  protected findElements(): void {
    super.findElements();

    // Табы
    this.tabButtons = Array.from(this.shadow.querySelectorAll('ttg-tab')) as HTMLElement[];
    this.tabContents = Array.from(this.shadow.querySelectorAll('.ml-tab-content')) as HTMLElement[];

    // Контейнеры для правил
    this.elements.textReplacementsContainer = this.shadow.querySelector(
      '#text-replacements-container',
    );
    this.elements.blockVisibilityContainer = this.shadow.querySelector(
      '#block-visibility-container',
    );
    this.elements.ipRulesContainer = this.shadow.querySelector('#ip-rules-container');

    // Поля настроек по умолчанию
    this.elements.defaultShowBlocks = this.shadow.querySelector('#default-show-blocks');
    this.elements.defaultHideBlocks = this.shadow.querySelector('#default-hide-blocks');

    // Кнопки добавления
    this.elements.addTextReplacementBtn = this.shadow.querySelector('#add-text-replacement');
    this.elements.addBlockRuleBtn = this.shadow.querySelector('#add-block-rule');
    this.elements.addIpRuleBtn = this.shadow.querySelector('#add-ip-rule');
  }

  protected bindEvents(): void {
    super.bindEvents();

    // Обработчики для табов
    this.tabButtons.forEach((button: HTMLElement) => {
      const handler = () => this.switchTab(button.dataset.tab || 'text');
      this.eventHandlers.set(`tab-${button.dataset.tab}`, handler);
      button.addEventListener('click', handler);
    });

    // Обработчики для кнопок добавления правил
    if (this.elements.addTextReplacementBtn) {
      const handler = () => this.addTextReplacement();
      this.eventHandlers.set('add-text-replacement', handler);
      this.elements.addTextReplacementBtn.addEventListener('click', handler);
    }

    if (this.elements.addBlockRuleBtn) {
      const handler = () => this.addBlockRule();
      this.eventHandlers.set('add-block-rule', handler);
      this.elements.addBlockRuleBtn.addEventListener('click', handler);
    }

    if (this.elements.addIpRuleBtn) {
      const handler = () => this.addIpRule();
      this.eventHandlers.set('add-ip-rule', handler);
      this.elements.addIpRuleBtn.addEventListener('click', handler);
    }

    // Обработчики для полей настроек по умолчанию (ttg-input components)
    if (this.elements.defaultShowBlocks) {
      const handler = (e: Event) => {
        const target = e.target as HTMLElement & { value: string };
        this.config.defaultBlockVisibility.showBlocks = this.parseCommaList(target.value);
      };
      this.eventHandlers.set('default-show-blocks', handler);
      this.elements.defaultShowBlocks.addEventListener('change', handler);
    }

    if (this.elements.defaultHideBlocks) {
      const handler = (e: Event) => {
        const target = e.target as HTMLElement & { value: string };
        this.config.defaultBlockVisibility.hideBlocks = this.parseCommaList(target.value);
      };
      this.eventHandlers.set('default-hide-blocks', handler);
      this.elements.defaultHideBlocks.addEventListener('change', handler);
    }
  }

  protected setInitialState(): void {
    // Устанавливаем значения полей по умолчанию для ttg-input components
    if (this.elements.defaultShowBlocks) {
      (this.elements.defaultShowBlocks as HTMLElement & { value: string }).value =
        this.config.defaultBlockVisibility.showBlocks.join(', ');
    }
    if (this.elements.defaultHideBlocks) {
      (this.elements.defaultHideBlocks as HTMLElement & { value: string }).value =
        this.config.defaultBlockVisibility.hideBlocks.join(', ');
    }

    // Рендерим все секции
    this.renderTextReplacements();
    this.renderBlockVisibility();
    this.renderIpRules();

    // Активируем первый таб
    this.switchTab(this.activeTab);
  }

  private switchTab(tabId: string): void {
    this.activeTab = tabId;

    // Убираем активное состояние со всех табов
    this.tabButtons.forEach((btn: HTMLElement) => {
      btn.removeAttribute('active');
    });
    this.tabContents.forEach((content: HTMLElement) => content.classList.remove('active'));

    // Активируем нужный таб
    const activeButton = this.shadow.querySelector(`ttg-tab[data-tab="${tabId}"]`);
    const activeContent = this.shadow.querySelector(`#${tabId}-tab`);

    if (activeButton) activeButton.setAttribute('active', '');
    if (activeContent) activeContent.classList.add('active');
  }

  private addTextReplacement(): void {
    this.config.textReplacements.push({
      keyword: '',
      defaultValue: '',
      utmRules: [
        {
          paramName: 'utm_content',
          paramValue: '',
          replacementValue: '',
        },
      ],
    });
    this.renderTextReplacements();
  }

  private addBlockRule(): void {
    this.config.blockVisibility.push({
      paramName: 'utm_content',
      paramValue: '',
      showBlocks: [],
      hideBlocks: [],
    });
    this.renderBlockVisibility();
  }

  private addIpRule(): void {
    this.config.ipRules.push({
      country: '',
      city: '*',
      region: '*',
      textReplacements: [],
      showBlocks: [],
      hideBlocks: [],
    });
    this.renderIpRules();
  }

  private renderTextReplacements(): void {
    const container = this.elements.textReplacementsContainer;
    if (!container) return;

    container.innerHTML = '';

    this.config.textReplacements.forEach((item, index) => {
      const card = this.createTextReplacementCard(item, index);
      container.appendChild(card);
    });

    // Configure dropdowns after rendering
    setTimeout(() => this.configureDropdowns(), 0);
  }

  private renderBlockVisibility(): void {
    const container = this.elements.blockVisibilityContainer;
    if (!container) return;

    container.innerHTML = '';

    this.config.blockVisibility.forEach((rule, index) => {
      const card = this.createBlockRuleCard(rule, index);
      container.appendChild(card);
    });
  }

  private renderIpRules(): void {
    const container = this.elements.ipRulesContainer;
    if (!container) return;

    container.innerHTML = '';

    this.config.ipRules.forEach((rule, index) => {
      const card = this.createIpRuleCard(rule, index);
      container.appendChild(card);
    });
  }

  private configureDropdowns(): void {
    const dropdowns = this.shadow.querySelectorAll(
      'ttg-dropdown[data-utm-field="paramName"]',
    ) as NodeListOf<
      HTMLElement & { setOptions: (options: Array<{ value: string; text: string }>) => void }
    >;

    const options = [
      { value: 'utm_source', text: 'utm_source' },
      { value: 'utm_medium', text: 'utm_medium' },
      { value: 'utm_campaign', text: 'utm_campaign' },
      { value: 'utm_content', text: 'utm_content' },
      { value: 'utm_term', text: 'utm_term' },
      { value: 'custom', text: 'Своя метка' },
    ];

    dropdowns.forEach((dropdown) => {
      dropdown.setOptions(options);
    });
  }

  private createTextReplacementCard(item: TextReplacement, index: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
    <div class="rule-block">
      <div class="rule-header">
        <div class="rule-title">
          <div class="rule-title-text">Правило</div>
          <div class="rule-number">
            <div class="rule-number-text">${index + 1}</div>
          </div>
        </div>
        <button class="remove-btn" data-action="remove-text-replacement" data-index="${index}">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M14.9999 14.9999L10 10M10 10L5 5M10 10L15 5M10 10L5 15" stroke="#A9A9A9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="rule-main">
        <ttg-input 
          label="Ключ" 
          placeholder="service" 
          value="${item.keyword}" 
          required
          data-field="keyword" 
          data-index="${index}">
        </ttg-input>
        <ttg-input 
          label="Текст по умолчанию" 
          placeholder="наши услуги" 
          value="${item.defaultValue}" 
          required
          data-field="defaultValue" 
          data-index="${index}">
        </ttg-input>
      </div>
    </div>
      <div class="utm-section">
          ${item.utmRules.map((rule, ruleIndex) => this.createUtmRuleHtml(rule, index, ruleIndex)).join('')}
      </div>
      <div class="add-utm-section">
        <button class="add-utm-btn" data-action="add-utm-rule" data-parent-index="${index}">
          <div class="add-utm-text">Добавить UTM</div>
        </button>
      </div>
    `;

    this.bindCardEvents(card);
    return card;
  }

  private createUtmRuleHtml(
    rule: TextReplacement['utmRules'][0],
    parentIndex: number,
    ruleIndex: number,
  ): string {
    return `
      <div class="utm-block" data-utm-index="${ruleIndex}">
        <div class="utm-header">
          <div class="utm-title">
            <div class="utm-title-text">UTM</div>
            <div class="utm-number">
              <div class="utm-number-text">${ruleIndex + 1}</div>
            </div>
          </div>
          <button class="remove-btn" data-action="remove-utm-rule" data-parent-index="${parentIndex}" data-rule-index="${ruleIndex}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M14.9999 14.9999L10 10M10 10L5 5M10 10L15 5M10 10L5 15" stroke="#A9A9A9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="utm-content">
          <ttg-dropdown 
            label="Параметр UTM" 
            required
            value="${rule.paramName}"
            data-utm-field="paramName" 
            data-parent-index="${parentIndex}" 
            data-rule-index="${ruleIndex}">
          </ttg-dropdown>
          <ttg-input 
            label="Значение параметра" 
            placeholder="design" 
            value="${rule.paramValue}" 
            required
            data-utm-field="paramValue" 
            data-parent-index="${parentIndex}" 
            data-rule-index="${ruleIndex}">
          </ttg-input>
          <ttg-input 
            label="Текст замены" 
            placeholder="услуги дизайна" 
            value="${rule.replacementValue}" 
            required
            data-utm-field="replacementValue" 
            data-parent-index="${parentIndex}" 
            data-rule-index="${ruleIndex}">
          </ttg-input>
        </div>
      </div>
    `;
  }

  private createBlockRuleCard(rule: BlockVisibilityRule, index: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'ml-card';
    card.innerHTML = `
      <div class="ml-card-header">
        <div class="ml-card-title">Блок <span class="ml-rule-index">${index + 1}</span></div>
        <button class="ml-remove-btn" data-action="remove-block-rule" data-index="${index}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="ml-card-body">
        <div class="ml-form-row">
          <div class="ml-form-group">
            <label>Параметр URL</label>
            <select class="ml-select" data-block-field="paramName" data-index="${index}">
              <option value="utm_source" ${rule.paramName === 'utm_source' ? 'selected' : ''}>utm_source</option>
              <option value="utm_medium" ${rule.paramName === 'utm_medium' ? 'selected' : ''}>utm_medium</option>
              <option value="utm_campaign" ${rule.paramName === 'utm_campaign' ? 'selected' : ''}>utm_campaign</option>
              <option value="utm_content" ${rule.paramName === 'utm_content' ? 'selected' : ''}>utm_content</option>
              <option value="utm_term" ${rule.paramName === 'utm_term' ? 'selected' : ''}>utm_term</option>
            </select>
          </div>
          <div class="ml-form-group">
            <label>Значение параметра</label>
            <input type="text" class="ml-input" value="${rule.paramValue}" data-block-field="paramValue" data-index="${index}">
          </div>
        </div>
        <div class="ml-section-divider">
          <span>Настройка видимости</span>
        </div>
        <div class="ml-form-row">
          <div class="ml-form-group">
            <label>Показать блоки (через запятую)</label>
            <input type="text" class="ml-input" value="${rule.showBlocks.join(', ')}" data-block-field="showBlocks" data-index="${index}">
          </div>
          <div class="ml-form-group">
            <label>Скрыть блоки (через запятую)</label>
            <input type="text" class="ml-input" value="${rule.hideBlocks.join(', ')}" data-block-field="hideBlocks" data-index="${index}">
          </div>
        </div>
      </div>
    `;

    this.bindCardEvents(card);
    return card;
  }

  private createIpRuleCard(rule: IpRule, index: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'ml-card';
    card.innerHTML = `
      <div class="ml-card-header">
        <div class="ml-card-title">Регион <span class="ml-rule-index">${index + 1}</span></div>
        <button class="ml-remove-btn" data-action="remove-ip-rule" data-index="${index}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="ml-card-body">
        <div class="ml-form-row">
          <div class="ml-form-group">
            <label>Страна</label>
            <input type="text" class="ml-input" value="${rule.country}" data-ip-field="country" data-index="${index}" placeholder="Russia или * для любой">
            <p class="ml-helper-text">Название страны на английском (Russia, Belarus)</p>
          </div>
          <div class="ml-form-group">
            <label>Город</label>
            <input type="text" class="ml-input" value="${rule.city}" data-ip-field="city" data-index="${index}" placeholder="Moscow или * для любого">
            <p class="ml-helper-text">Название города на английском или * для любого</p>
          </div>
          <div class="ml-form-group">
            <label>Регион</label>
            <input type="text" class="ml-input" value="${rule.region}" data-ip-field="region" data-index="${index}" placeholder="* для любого">
            <p class="ml-helper-text">Название региона на английском или * для любого</p>
          </div>
        </div>
        <div class="ml-section-divider">
          <span>Замены текста</span>
        </div>
        <div class="ml-ip-text-container" data-parent-index="${index}">
          ${rule.textReplacements.map((rep, repIndex) => this.createIpTextReplacementHtml(rep, index, repIndex)).join('')}
        </div>
        <button class="ml-add-ip-text-btn" data-action="add-ip-text-replacement" data-parent-index="${index}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5V19M5 12H19"></path>
          </svg>
          Добавить замену текста
        </button>
        <div class="ml-section-divider">
          <span>Настройка видимости</span>
        </div>
        <div class="ml-form-row">
          <div class="ml-form-group">
            <label>Показать блоки (через запятую)</label>
            <input type="text" class="ml-input" value="${rule.showBlocks.join(', ')}" data-ip-field="showBlocks" data-index="${index}">
          </div>
          <div class="ml-form-group">
            <label>Скрыть блоки (через запятую)</label>
            <input type="text" class="ml-input" value="${rule.hideBlocks.join(', ')}" data-ip-field="hideBlocks" data-index="${index}">
          </div>
        </div>
      </div>
    `;

    this.bindCardEvents(card);
    return card;
  }

  private createIpTextReplacementHtml(
    rep: IpRule['textReplacements'][0],
    parentIndex: number,
    repIndex: number,
  ): string {
    return `
      <div class="ml-ip-text-rule">
        <div class="ml-utm-rule-header">
          <span class="ml-utm-badge">Замена <span class="ml-utm-index">${repIndex + 1}</span></span>
          <button class="ml-remove-btn" data-action="remove-ip-text-replacement" data-parent-index="${parentIndex}" data-rep-index="${repIndex}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="ml-form-row">
          <div class="ml-form-group">
            <label>Ключ</label>
            <input type="text" class="ml-input" value="${rep.keyword}" data-ip-text-field="keyword" data-parent-index="${parentIndex}" data-rep-index="${repIndex}">
          </div>
          <div class="ml-form-group">
            <label>Текст по умолчанию</label>
            <input type="text" class="ml-input" value="${rep.defaultValue}" data-ip-text-field="defaultValue" data-parent-index="${parentIndex}" data-rep-index="${repIndex}">
          </div>
          <div class="ml-form-group">
            <label>Текст замены для IP-правила</label>
            <input type="text" class="ml-input" value="${rep.replacementValue}" data-ip-text-field="replacementValue" data-parent-index="${parentIndex}" data-rep-index="${repIndex}">
          </div>
        </div>
      </div>
    `;
  }

  private bindCardEvents(card: HTMLElement): void {
    // Обработчик удаления и других действий
    card.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('[data-action]') as HTMLElement;
      if (!button) return;

      e.preventDefault();
      e.stopPropagation();

      const action = button.dataset.action;
      const index = parseInt(button.dataset.index || '0');
      const parentIndex = parseInt(button.dataset.parentIndex || '0');
      const ruleIndex = parseInt(button.dataset.ruleIndex || '0');
      const repIndex = parseInt(button.dataset.repIndex || '0');

      switch (action) {
        case 'remove-text-replacement':
          this.config.textReplacements.splice(index, 1);
          this.renderTextReplacements();
          break;
        case 'remove-block-rule':
          this.config.blockVisibility.splice(index, 1);
          this.renderBlockVisibility();
          break;
        case 'remove-ip-rule':
          this.config.ipRules.splice(index, 1);
          this.renderIpRules();
          break;
        case 'add-utm-rule':
          // Сохраняем текущие данные перед добавлением нового правила
          this.saveCurrentFormData();
          this.config.textReplacements[parentIndex].utmRules.push({
            paramName: 'utm_content',
            paramValue: '',
            replacementValue: '',
          });
          this.renderTextReplacements();
          break;
        case 'remove-utm-rule':
          // Сохраняем текущие данные перед удалением правила
          this.saveCurrentFormData();
          this.config.textReplacements[parentIndex].utmRules.splice(ruleIndex, 1);
          this.renderTextReplacements();
          break;
        case 'add-ip-text-replacement':
          this.config.ipRules[parentIndex].textReplacements.push({
            keyword: '',
            defaultValue: '',
            replacementValue: '',
          });
          this.renderIpRules();
          break;
        case 'remove-ip-text-replacement':
          this.config.ipRules[parentIndex].textReplacements.splice(repIndex, 1);
          this.renderIpRules();
          break;
      }
    });

    // Обработчики изменения полей для ttg-input и ttg-dropdown
    card.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;

      // Обработка полей текстовых замен (ttg-input компоненты)
      if (target.dataset.field && target.dataset.index !== undefined) {
        const index = parseInt(target.dataset.index);
        const field = target.dataset.field as keyof TextReplacement;
        if (this.config.textReplacements[index]) {
          const replacement = this.config.textReplacements[index];
          const inputElement = target as HTMLElement & { value: string };
          if (field === 'keyword') {
            replacement.keyword = inputElement.value;
          } else if (field === 'defaultValue') {
            replacement.defaultValue = inputElement.value;
          }
        }
      }

      // Обработка UTM полей (ttg-input и ttg-dropdown компоненты)
      if (
        target.dataset.utmField &&
        target.dataset.parentIndex !== undefined &&
        target.dataset.ruleIndex !== undefined
      ) {
        const parentIndex = parseInt(target.dataset.parentIndex);
        const ruleIndex = parseInt(target.dataset.ruleIndex);
        const field = target.dataset.utmField;

        if (this.config.textReplacements[parentIndex]?.utmRules[ruleIndex]) {
          const rule = this.config.textReplacements[parentIndex].utmRules[ruleIndex];
          const inputElement = target as HTMLElement & { value: string };
          if (field === 'customParamName') {
            rule.paramName = inputElement.value;
          } else if (field === 'paramName') {
            rule.paramName = inputElement.value;
          } else if (field === 'paramValue') {
            rule.paramValue = inputElement.value;
          } else if (field === 'replacementValue') {
            rule.replacementValue = inputElement.value;
          }
        }
      }

      // Обработка полей блоков
      if (target.dataset.blockField && target.dataset.index !== undefined) {
        const index = parseInt(target.dataset.index);
        const field = target.dataset.blockField;
        if (this.config.blockVisibility[index]) {
          const rule = this.config.blockVisibility[index];
          const inputElement = target as HTMLElement & { value: string };
          if (field === 'showBlocks') {
            rule.showBlocks = this.parseCommaList(inputElement.value);
          } else if (field === 'hideBlocks') {
            rule.hideBlocks = this.parseCommaList(inputElement.value);
          } else if (field === 'paramName') {
            rule.paramName = inputElement.value;
          } else if (field === 'paramValue') {
            rule.paramValue = inputElement.value;
          }
        }
      }

      // Обработка IP полей
      if (target.dataset.ipField && target.dataset.index !== undefined) {
        const index = parseInt(target.dataset.index);
        const field = target.dataset.ipField;
        if (this.config.ipRules[index]) {
          const rule = this.config.ipRules[index];
          const inputElement = target as HTMLElement & { value: string };
          if (field === 'showBlocks') {
            rule.showBlocks = this.parseCommaList(inputElement.value);
          } else if (field === 'hideBlocks') {
            rule.hideBlocks = this.parseCommaList(inputElement.value);
          } else if (field === 'country') {
            rule.country = inputElement.value;
          } else if (field === 'city') {
            rule.city = inputElement.value;
          } else if (field === 'region') {
            rule.region = inputElement.value;
          }
        }
      }

      // Обработка полей IP текстовых замен
      if (
        target.dataset.ipTextField &&
        target.dataset.parentIndex !== undefined &&
        target.dataset.repIndex !== undefined
      ) {
        const parentIndex = parseInt(target.dataset.parentIndex);
        const repIndex = parseInt(target.dataset.repIndex);
        const field = target.dataset.ipTextField;

        if (this.config.ipRules[parentIndex]?.textReplacements[repIndex]) {
          const rep = this.config.ipRules[parentIndex].textReplacements[repIndex];
          const inputElement = target as HTMLElement & { value: string };
          if (field === 'keyword') {
            rep.keyword = inputElement.value;
          } else if (field === 'defaultValue') {
            rep.defaultValue = inputElement.value;
          } else if (field === 'replacementValue') {
            rep.replacementValue = inputElement.value;
          }
        }
      }
    });

    // Обработка селектов UTM параметров и dropdown'ов
    card.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;

      // Обработка ttg-dropdown
      if (target.tagName === 'TTG-DROPDOWN' && target.dataset.utmField === 'paramName') {
        const parentIndex = parseInt(target.dataset.parentIndex || '0');
        const ruleIndex = parseInt(target.dataset.ruleIndex || '0');

        if (this.config.textReplacements[parentIndex]?.utmRules[ruleIndex]) {
          const rule = this.config.textReplacements[parentIndex].utmRules[ruleIndex];
          const dropdown = target as HTMLElement & { value: string };

          if (dropdown.value === 'custom') {
            rule.paramName = 'my_param';
            // Показываем кастомное поле - пока не реализовано
          } else {
            rule.paramName = dropdown.value;
          }
        }
      }
    });
  }

  protected unbindEvents(): void {
    super.unbindEvents();

    // Очищаем специальные обработчики мультилендинга
    // Они уже очищены в super.unbindEvents() поскольку вызывается eventHandlers.clear()
  }

  private parseCommaList(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private saveCurrentFormData(): void {
    // Сохраняем данные из ttg-input элементов для текстовых замен
    this.shadow.querySelectorAll('ttg-input[data-field]').forEach((input) => {
      const element = input as HTMLElement & { value: string };
      const index = parseInt(element.dataset.index || '0');
      const field = element.dataset.field;

      if (this.config.textReplacements[index]) {
        const replacement = this.config.textReplacements[index];
        if (field === 'keyword') {
          replacement.keyword = element.value;
        } else if (field === 'defaultValue') {
          replacement.defaultValue = element.value;
        }
      }
    });

    // Сохраняем данные из UTM полей
    this.shadow.querySelectorAll('[data-utm-field]').forEach((element) => {
      const input = element as HTMLElement & { value: string };
      const parentIndex = parseInt(input.dataset.parentIndex || '0');
      const ruleIndex = parseInt(input.dataset.ruleIndex || '0');
      const field = input.dataset.utmField;

      if (this.config.textReplacements[parentIndex]?.utmRules[ruleIndex]) {
        const rule = this.config.textReplacements[parentIndex].utmRules[ruleIndex];
        if (field === 'paramName') {
          rule.paramName = input.value;
        } else if (field === 'paramValue') {
          rule.paramValue = input.value;
        } else if (field === 'replacementValue') {
          rule.replacementValue = input.value;
        }
      }
    });
  }

  private collectCustomParameters(): string[] {
    const customParams = new Set<string>();

    // Собираем кастомные параметры из текстовых замен
    this.config.textReplacements.forEach((replacement) => {
      replacement.utmRules.forEach((rule) => {
        if (rule.paramName && !rule.paramName.startsWith('utm_')) {
          customParams.add(rule.paramName);
        }
      });
    });

    // Собираем кастомные параметры из правил блоков
    this.config.blockVisibility.forEach((rule) => {
      if (rule.paramName && !rule.paramName.startsWith('utm_')) {
        customParams.add(rule.paramName);
      }
    });

    return Array.from(customParams);
  }

  protected collectData(): MultilandingConfig | null {
    // Простая валидация
    const hasValidRules =
      this.config.textReplacements.length > 0 ||
      this.config.blockVisibility.length > 0 ||
      this.config.ipRules.length > 0;

    if (!hasValidRules) {
      alert('Добавьте хотя бы одно правило для генерации кода');
      return null;
    }

    return structuredClone(this.config);
  }

  protected generateCode(settings: MultilandingConfig): string {
    // Добавляем кастомные параметры в конфигурацию
    const configWithCustomParams = {
      ...settings,
      additionalParams: this.collectCustomParameters(),
    };

    const configJson = JSON.stringify(configWithCustomParams, null, 2);

    return `<!-- Расширение - UTM/IP  -->
<script>
document.documentElement.style.visibility = 'hidden';

class TaptopContentChanger {
  constructor(config) {
    this.config = config || { textReplacements: [], blockVisibility: [], ipRules: [] };
    this.utmParams = this.getUTMParams();
    this.ipInfo = null;

    this.replaceText();
    this.toggleBlocksVisibility();

    if (this.config.ipRules?.length) {
      this.detectLocation().finally(() => {
        this.applyIPRules();
        document.documentElement.style.visibility = '';
      });
    } else {
      document.documentElement.style.visibility = '';
    }
  }

  getUTMParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const utm = {};
    ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach(p => {
      if (urlParams.has(p)) utm[p] = urlParams.get(p);
    });
    if (this.config.additionalParams?.length) {
      this.config.additionalParams.forEach((p) => {
        if (urlParams.has(p)) utm[p] = urlParams.get(p);
      });
    }
    return utm;
  }

  async detectLocation() {
    try {
      const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
      const data = await res.json();
      if (data?.country) {
        this.ipInfo = {
          country_name: data.country,
          country_code: data.country_code,
          country_code3: data.country_code3,
          region: data.region,
          city: data.city
        };
      }
    } catch(e){
      console.error("Geo detect error:", e);
    }
  }

  applyIPRules() {
    if (!this.ipInfo || !this.config.ipRules?.length) return;
    const { country_name, country_code, country_code3, region, city } = this.ipInfo;
    
    const norm = {
      country: (country_name || '').toLowerCase().trim(),
      code: (country_code || '').toLowerCase().trim(),
      code3: (country_code3 || '').toLowerCase().trim(),
      region: (region || '').toLowerCase().trim(),
      city: (city || '').toLowerCase().trim(),
    };
    
    const matched = this.config.ipRules.find(rule => {
      const c = (rule.country || '').toLowerCase().trim();
      const ci = (rule.city || '').toLowerCase().trim();
      const r = (rule.region || '').toLowerCase().trim();
      const countryOk = c === "*" || c === norm.country || c === norm.code || c === norm.code3;
      const cityOk = ci === "*" || ci === norm.city;
      const regionOk = r === "*" || r === norm.region;
      return countryOk && cityOk && regionOk;
    });
    
    if (matched) {
      matched.textReplacements?.forEach(rep => {
        this.replaceAll(rep.keyword, rep.replacementValue);
      });
      this.applyVisibilityRules(matched.showBlocks, matched.hideBlocks);
    } else {
      this.config.ipRules.forEach(rule => {
        rule.textReplacements?.forEach(rep => {
          this.replaceAll(rep.keyword, rep.defaultValue);
        });
      });
      if (this.config.defaultBlockVisibility) {
        const { showBlocks, hideBlocks } = this.config.defaultBlockVisibility;
        this.applyVisibilityRules(showBlocks, hideBlocks);
      }
    }
  }

  replaceText() {
    this.config.textReplacements?.forEach((rule) => {
      let replacementValue = rule.defaultValue;
      const matched = rule.utmRules?.find((utmRule) => {
        const val = this.utmParams[utmRule.paramName];
        return val && (val === utmRule.paramValue || utmRule.paramValue === "*");
      });
      if (matched) replacementValue = matched.replacementValue;
      this.replaceAll(rule.keyword, replacementValue);
    });
  }

  replaceAll(keyword, newValue) {
    if (!keyword) return;
    const pattern = new RegExp(\`%%\${keyword}%%\`, "g");
    const elements = [];
    const search = (node) => {
      if (!node) return;
      if (node.nodeType === Node.TEXT_NODE) {
        if (pattern.test(node.textContent)) {
          const p = node.parentElement;
          if (p && !elements.includes(p)) elements.push(p);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (pattern.test(node.innerHTML) && !elements.includes(node)) {
          elements.push(node);
        }
        node.childNodes.forEach(search);
      }
    };
    search(document.body);
    elements.forEach((el) => {
      el.innerHTML = el.innerHTML.replace(pattern, newValue);
    });
  }

  toggleBlocksVisibility() {
    if (!this.config.blockVisibility?.length) return;
    let matched = null;
    for (const rule of this.config.blockVisibility) {
      const val = this.utmParams[rule.paramName];
      if (val && (val === rule.paramValue || rule.paramValue === "*")) {
        matched = rule;
        break;
      }
    }
    if (matched) {
      this.applyVisibilityRules(matched.showBlocks, matched.hideBlocks);
    } else if (this.config.defaultBlockVisibility) {
      const { showBlocks, hideBlocks } = this.config.defaultBlockVisibility;
      this.applyVisibilityRules(showBlocks, hideBlocks);
    }
  }

  applyVisibilityRules(showBlocks, hideBlocks) {
    (hideBlocks||[]).forEach((id) => {
      document.querySelectorAll(\`#\${id},.\${id},[data-block-id="\${id}"]\`)
        .forEach(el => el.style.display = "none");
    });
    (showBlocks||[]).forEach((id) => {
      document.querySelectorAll(\`#\${id},.\${id},[data-block-id="\${id}"]\`)
        .forEach(el => el.style.display = "");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const contentChanger = new TaptopContentChanger(${configJson});
});
</script>`;
  }
}

customElements.define('multilanding-generator', MultilandingGenerator);
