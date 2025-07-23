import { BaseGenerator, type GeneratorConfig } from '../base/BaseGenerator';
import { initGlobalStyles } from '../../utils/global-styles';
import multilandingStyles from './MultilandingGenerator.styles.css';
import { template } from './MultilandingGenerator.template';
import '../../ui/CountriesModal/CountriesModal';

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
  private tabsComponent: HTMLElement | null = null;
  private tabContents: HTMLElement[] = [];
  private countriesModal: HTMLElement | null = null;
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
    this.tabsComponent = this.shadow.querySelector('ttg-tabs');
    this.tabContents = Array.from(this.shadow.querySelectorAll('.tab-content')) as HTMLElement[];

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
  }

  protected bindEvents(): void {
    super.bindEvents();

    // Обработчик для табов
    if (this.tabsComponent) {
      const tabChangeHandler = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.tabId) {
          this.switchTab(customEvent.detail.tabId);
        }
      };
      this.eventHandlers.set('tabs-change', tabChangeHandler);
      this.tabsComponent.addEventListener('tab-change', tabChangeHandler);
    }

    // Обработчик для главных кнопок добавления через event delegation
    const mainButtonHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      const button = target.closest('[data-action]') as HTMLElement;
      if (!button) return;

      e.preventDefault();
      e.stopPropagation();

      const action = button.dataset.action;

      switch (action) {
        case 'add-text-replacement':
          this.addTextReplacement();
          break;
        case 'add-block-rule':
          this.addBlockRule();
          break;
        case 'add-ip-rule':
          this.addIpRule();
          break;
      }
    };
    this.eventHandlers.set('main-buttons', mainButtonHandler);
    this.shadow.addEventListener('click', mainButtonHandler);

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
    // Сохраняем данные текущего таба перед переключением
    this.saveCurrentFormData();

    this.activeTab = tabId;

    // Убираем активное состояние со всех табов контента
    this.tabContents.forEach((content: HTMLElement) => content.classList.remove('active'));

    // Активируем нужный контент таба
    const activeContent = this.shadow.querySelector(`#${tabId}-tab`);
    if (activeContent) {
      activeContent.classList.add('active');
    }

    // Обновляем активный таб в компоненте табов (если нужно программно)
    if (this.tabsComponent && 'activeTab' in this.tabsComponent) {
      (this.tabsComponent as HTMLElement & { activeTab: string }).activeTab = tabId;
    }
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

    // Configure dropdowns after rendering
    setTimeout(() => this.configureBlockDropdowns(), 0);
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
      HTMLElement & {
        setOptions: (options: Array<{ value: string; text: string }>) => void;
        value: string;
      }
    >;

    const options = [
      { value: 'utm_source', text: 'utm_source' },
      { value: 'utm_medium', text: 'utm_medium' },
      { value: 'utm_campaign', text: 'utm_campaign' },
      { value: 'utm_content', text: 'utm_content' },
      { value: 'utm_term', text: 'utm_term' },
    ];

    dropdowns.forEach((dropdown) => {
      const parentIndex = parseInt(dropdown.dataset.parentIndex || '0');
      const ruleIndex = parseInt(dropdown.dataset.ruleIndex || '0');
      const currentValue =
        this.config.textReplacements[parentIndex]?.utmRules[ruleIndex]?.paramName || 'utm_content';

      dropdown.setOptions(options);
      dropdown.value = currentValue;
    });
  }

  private configureBlockDropdowns(): void {
    const dropdowns = this.shadow.querySelectorAll(
      'ttg-dropdown[data-block-field="paramName"]',
    ) as NodeListOf<
      HTMLElement & {
        setOptions: (options: Array<{ value: string; text: string }>) => void;
        value: string;
      }
    >;

    const options = [
      { value: 'utm_source', text: 'utm_source' },
      { value: 'utm_medium', text: 'utm_medium' },
      { value: 'utm_campaign', text: 'utm_campaign' },
      { value: 'utm_content', text: 'utm_content' },
      { value: 'utm_term', text: 'utm_term' },
    ];

    dropdowns.forEach((dropdown) => {
      const index = parseInt(dropdown.dataset.index || '0');
      const currentValue = this.config.blockVisibility[index]?.paramName || 'utm_content';

      dropdown.setOptions(options);
      dropdown.value = currentValue;
    });
  }

  private createTextReplacementCard(item: TextReplacement, index: number): HTMLElement {
    const section = document.createElement('ttg-generator-section');
    section.className = 'compact';
    section.innerHTML = `
      <div class="card">
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
              data-index="${index}"
              tooltip="Идентификатор замены (будет использоваться в шаблоне %%ключ%% на странице)">
            </ttg-input>
            <ttg-input 
              label="Текст по умолчанию" 
              placeholder="наши услуги" 
              value="${item.defaultValue}" 
              required
              data-field="defaultValue" 
              data-index="${index}"
              tooltip="Значение, которое будет подставлено, если не сработает ни одно UTM-правило">
            </ttg-input>
          </div>
        </div>
        <div class="sub-rules-section">
          ${item.utmRules.map((rule, ruleIndex) => this.createUtmRuleHtml(rule, index, ruleIndex)).join('')}
        </div>
        <div class="add-sub-rule-section">
          <ttg-button variant="tertiary" data-action="add-utm-rule" data-parent-index="${index}">
            Добавить UTM
          </ttg-button>
        </div>
      </div>
    `;

    this.bindCardEvents(section);
    return section;
  }

  private createUtmRuleHtml(
    rule: TextReplacement['utmRules'][0],
    parentIndex: number,
    ruleIndex: number,
  ): string {
    return `
      <div class="sub-rule-block" data-utm-index="${ruleIndex}">
        <div class="sub-rule-header">
          <div class="sub-rule-title">
            <div class="sub-rule-title-text">UTM</div>
            <div class="sub-rule-number">
              <div class="sub-rule-number-text">${ruleIndex + 1}</div>
            </div>
          </div>
          <button class="remove-btn" data-action="remove-utm-rule" data-parent-index="${parentIndex}" data-rule-index="${ruleIndex}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M14.9999 14.9999L10 10M10 10L5 5M10 10L15 5M10 10L5 15" stroke="#A9A9A9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="sub-rule-content">
          <ttg-dropdown 
            label="Параметр UTM" 
            required
            value="${rule.paramName}"
            data-utm-field="paramName" 
            data-parent-index="${parentIndex}" 
            data-rule-index="${ruleIndex}"
            tooltip="Метка в URL, которая помогает отслеживать, откуда пришёл пользователь (например, из рекламы, email-рассылки или соцсетей)."
            >
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
    const section = document.createElement('ttg-generator-section');
    section.className = 'compact';
    section.innerHTML = `
      <div class="card">
        <div class="rule-block">
          <div class="rule-header">
            <div class="rule-title">
              <div class="rule-title-text">Блок</div>
              <div class="rule-number">
                <div class="rule-number-text">${index + 1}</div>
              </div>
            </div>
            <button class="remove-btn" data-action="remove-block-rule" data-index="${index}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.9999 14.9999L10 10M10 10L5 5M10 10L15 5M10 10L5 15" stroke="#A9A9A9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="rule-main">
            <ttg-dropdown 
              label="Параметр URL" 
              required
              value="${rule.paramName}"
              data-block-field="paramName" 
              data-index="${index}">
            </ttg-dropdown>
            <ttg-input 
              label="Значение параметра" 
              placeholder="spring_sale" 
              value="${rule.paramValue}" 
              required
              data-block-field="paramValue" 
              data-index="${index}">
            </ttg-input>
          </div>
        </div>
        <div class="sub-rules-section">
          <div class="sub-rule-block">
            <div class="sub-rule-header">
              <div class="sub-rule-title">
                <div class="sub-rule-title-text">Настройка видимости</div>
              </div>
            </div>
            <div class="sub-rule-content">
              <ttg-input 
                label="Показать блоки (через запятую)" 
                placeholder="block1, block2" 
                value="${rule.showBlocks.join(', ')}" 
                data-block-field="showBlocks" 
                data-index="${index}">
              </ttg-input>
              <ttg-input 
                label="Скрыть блоки (через запятую)" 
                placeholder="block3, block4" 
                value="${rule.hideBlocks.join(', ')}" 
                data-block-field="hideBlocks" 
                data-index="${index}">
              </ttg-input>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindCardEvents(section);
    return section;
  }

  private createIpRuleCard(rule: IpRule, index: number): HTMLElement {
    const section = document.createElement('ttg-generator-section');
    section.className = 'compact';
    section.innerHTML = `
      <div class="card">
        <div class="rule-block">
          <div class="rule-header">
            <div class="rule-title">
              <div class="rule-title-text">Регион</div>
              <div class="rule-number">
                <div class="rule-number-text">${index + 1}</div>
              </div>
            </div>
            <button class="remove-btn" data-action="remove-ip-rule" data-index="${index}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.9999 14.9999L10 10M10 10L5 5M10 10L15 5M10 10L5 15" stroke="#A9A9A9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="rule-main">
            <ttg-input 
              label="Страна" 
              placeholder="Russia или * для любой" 
              value="${rule.country}" 
              required
              data-ip-field="country" 
              data-index="${index}"
              show-action-button
              action-tooltip="Показать список стран"
              class="country-input">
            </ttg-input>
            <ttg-input 
              label="Город" 
              placeholder="Moscow или * для любого" 
              value="${rule.city}" 
              data-ip-field="city" 
              data-index="${index}">
            </ttg-input>
            <ttg-input 
              label="Регион" 
              placeholder="* для любого" 
              value="${rule.region}" 
              data-ip-field="region" 
              data-index="${index}">
            </ttg-input>
          </div>
        </div>
        <div class="sub-rules-section">
          ${rule.textReplacements.map((rep, repIndex) => this.createIpTextReplacementHtml(rep, index, repIndex)).join('')}
        </div>
        <div class="add-sub-rule-section">
          <ttg-button variant="tertiary" data-action="add-ip-text-replacement" data-parent-index="${index}">
            Добавить замену текста
          </ttg-button>
        </div>
        <div class="sub-rules-section">
          <div class="sub-rule-block">
            <div class="sub-rule-header">
              <div class="sub-rule-title">
                <div class="sub-rule-title-text">Видимость блоков</div>
              </div>
            </div>
            <div class="sub-rule-content">
              <ttg-input 
                label="Показать блоки (через запятую)" 
                placeholder="block_ru" 
                value="${rule.showBlocks.join(', ')}" 
                data-ip-field="showBlocks" 
                data-index="${index}">
              </ttg-input>
              <ttg-input 
                label="Скрыть блоки (через запятую)" 
                placeholder="block_en" 
                value="${rule.hideBlocks.join(', ')}" 
                data-ip-field="hideBlocks" 
                data-index="${index}">
              </ttg-input>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindCardEvents(section);
    return section;
  }

  private createIpTextReplacementHtml(
    rep: IpRule['textReplacements'][0],
    parentIndex: number,
    repIndex: number,
  ): string {
    return `
      <div class="sub-rule-block" data-ip-text-index="${repIndex}">
        <div class="sub-rule-header">
          <div class="sub-rule-title">
            <div class="sub-rule-title-text">Замена</div>
            <div class="sub-rule-number">
              <div class="sub-rule-number-text">${repIndex + 1}</div>
            </div>
          </div>
          <button class="remove-btn" data-action="remove-ip-text-replacement" data-parent-index="${parentIndex}" data-rep-index="${repIndex}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M14.9999 14.9999L10 10M10 10L5 5M10 10L15 5M10 10L5 15" stroke="#A9A9A9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="sub-rule-content">
          <ttg-input 
            label="Ключ" 
            placeholder="region" 
            value="${rep.keyword}" 
            required
            data-ip-text-field="keyword" 
            data-parent-index="${parentIndex}" 
            data-rep-index="${repIndex}">
          </ttg-input>
          <ttg-input 
            label="Текст по умолчанию" 
            placeholder="в вашем регионе" 
            value="${rep.defaultValue}" 
            required
            data-ip-text-field="defaultValue" 
            data-parent-index="${parentIndex}" 
            data-rep-index="${repIndex}">
          </ttg-input>
          <ttg-input 
            label="Текст замены для IP-правила" 
            placeholder="в России" 
            value="${rep.replacementValue}" 
            required
            data-ip-text-field="replacementValue" 
            data-parent-index="${parentIndex}" 
            data-rep-index="${repIndex}">
          </ttg-input>
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

    // Обработка action-click событий для кнопок стран
    card.addEventListener('action-click', (e) => {
      const target = e.target as HTMLElement;
      // Check if this is a country input with action button
      if (target.classList.contains('country-input')) {
        this.showCountriesModal(target);
      }
    });

    // Обработка селектов UTM параметров и dropdown'ов
    card.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;

      // Обработка ttg-dropdown для UTM правил
      if (target.tagName === 'TTG-DROPDOWN' && target.dataset.utmField === 'paramName') {
        const parentIndex = parseInt(target.dataset.parentIndex || '0');
        const ruleIndex = parseInt(target.dataset.ruleIndex || '0');

        if (this.config.textReplacements[parentIndex]?.utmRules[ruleIndex]) {
          const rule = this.config.textReplacements[parentIndex].utmRules[ruleIndex];
          const dropdown = target as HTMLElement & { value: string };

          rule.paramName = dropdown.value;
        }
      }

      // Обработка ttg-dropdown для блоков
      if (target.tagName === 'TTG-DROPDOWN' && target.dataset.blockField === 'paramName') {
        const index = parseInt(target.dataset.index || '0');

        if (this.config.blockVisibility[index]) {
          const rule = this.config.blockVisibility[index];
          const dropdown = target as HTMLElement & { value: string };

          rule.paramName = dropdown.value;
        }
      }
    });
  }

  protected unbindEvents(): void {
    super.unbindEvents();

    // Cleanup countries modal if it exists
    if (this.countriesModal) {
      if ('close' in this.countriesModal && typeof this.countriesModal.close === 'function') {
        this.countriesModal.close();
      }
      this.countriesModal = null;
    }

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

    // Сохраняем данные из полей блоков
    this.shadow.querySelectorAll('[data-block-field]').forEach((element) => {
      const input = element as HTMLElement & { value: string };
      const index = parseInt(input.dataset.index || '0');
      const field = input.dataset.blockField;

      if (this.config.blockVisibility[index]) {
        const rule = this.config.blockVisibility[index];
        if (field === 'paramName') {
          rule.paramName = input.value;
        } else if (field === 'paramValue') {
          rule.paramValue = input.value;
        } else if (field === 'showBlocks') {
          rule.showBlocks = this.parseCommaList(input.value);
        } else if (field === 'hideBlocks') {
          rule.hideBlocks = this.parseCommaList(input.value);
        }
      }
    });

    // Сохраняем данные из IP полей
    this.shadow.querySelectorAll('[data-ip-field]').forEach((element) => {
      const input = element as HTMLElement & { value: string };
      const index = parseInt(input.dataset.index || '0');
      const field = input.dataset.ipField;

      if (this.config.ipRules[index]) {
        const rule = this.config.ipRules[index];
        if (field === 'country') {
          rule.country = input.value;
        } else if (field === 'city') {
          rule.city = input.value;
        } else if (field === 'region') {
          rule.region = input.value;
        } else if (field === 'showBlocks') {
          rule.showBlocks = this.parseCommaList(input.value);
        } else if (field === 'hideBlocks') {
          rule.hideBlocks = this.parseCommaList(input.value);
        }
      }
    });

    // Сохраняем данные из IP текстовых замен
    this.shadow.querySelectorAll('[data-ip-text-field]').forEach((element) => {
      const input = element as HTMLElement & { value: string };
      const parentIndex = parseInt(input.dataset.parentIndex || '0');
      const repIndex = parseInt(input.dataset.repIndex || '0');
      const field = input.dataset.ipTextField;

      if (this.config.ipRules[parentIndex]?.textReplacements[repIndex]) {
        const rep = this.config.ipRules[parentIndex].textReplacements[repIndex];
        if (field === 'keyword') {
          rep.keyword = input.value;
        } else if (field === 'defaultValue') {
          rep.defaultValue = input.value;
        } else if (field === 'replacementValue') {
          rep.replacementValue = input.value;
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

  private showCountriesModal(targetInput: HTMLElement): void {
    // Create new modal instance
    this.countriesModal = document.createElement('ttg-countries-modal') as HTMLElement;

    // Set up country selection handler
    const countrySelectHandler = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.country) {
        // Update the target input value
        if ('value' in targetInput && typeof (targetInput as HTMLInputElement).value === 'string') {
          (targetInput as HTMLInputElement).value = customEvent.detail.country;
          // Trigger change event to update the config
          targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    };

    // Set up close handler to clean up
    const closeHandler = () => {
      if (this.countriesModal) {
        this.countriesModal.removeEventListener('country-select', countrySelectHandler);
        this.countriesModal.removeEventListener('modal-close', closeHandler);
        this.countriesModal = null;
      }
    };

    // Add event listeners
    this.countriesModal.addEventListener('country-select', countrySelectHandler);
    this.countriesModal.addEventListener('modal-close', closeHandler);

    // Show the modal
    if ('show' in this.countriesModal && typeof this.countriesModal.show === 'function') {
      this.countriesModal.show();
    }
  }

  protected collectData(): MultilandingConfig | null {
    // Сохраняем текущие данные из формы
    this.saveCurrentFormData();

    // Валидация текстовых замен
    for (const replacement of this.config.textReplacements) {
      if (!replacement.keyword || !replacement.defaultValue) {
        alert('Заполните все обязательные поля в разделе "Замена текста"');
        return null;
      }

      for (const utmRule of replacement.utmRules) {
        if (!utmRule.paramName || !utmRule.paramValue || !utmRule.replacementValue) {
          alert('Заполните все поля UTM правил в разделе "Замена текста"');
          return null;
        }
      }
    }

    // Валидация правил блоков
    for (const rule of this.config.blockVisibility) {
      if (!rule.paramName || !rule.paramValue) {
        alert('Заполните все обязательные поля в разделе "Управление блоками"');
        return null;
      }
    }

    // Валидация IP правил
    for (const rule of this.config.ipRules) {
      if (!rule.country) {
        alert('Укажите страну в разделе "Правила по IP"');
        return null;
      }

      for (const textRep of rule.textReplacements) {
        if (!textRep.keyword || !textRep.defaultValue || !textRep.replacementValue) {
          alert('Заполните все поля текстовых замен в разделе "Правила по IP"');
          return null;
        }
      }
    }

    // Проверяем что есть хотя бы одно правило
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
    this.utmRulesApplied = false; // Track if UTM rules were applied

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
      // Применяем правила видимости блоков только если они не пустые и UTM правила не были применены
      if ((matched.showBlocks?.length || matched.hideBlocks?.length) && !this.utmRulesApplied) {
        this.applyVisibilityRules(matched.showBlocks, matched.hideBlocks);
      }
    } else {
      this.config.ipRules.forEach(rule => {
        rule.textReplacements?.forEach(rep => {
          this.replaceAll(rep.keyword, rep.defaultValue);
        });
      });
      // Применяем настройки по умолчанию только если UTM правила не были применены
      if (this.config.defaultBlockVisibility && !this.utmRulesApplied) {
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
    console.log('toggleBlocksVisibility called');
    console.log('UTM params:', this.utmParams);
    console.log('Block visibility rules:', this.config.blockVisibility);
    
    if (!this.config.blockVisibility?.length) return;
    let matched = null;
    for (const rule of this.config.blockVisibility) {
      const val = this.utmParams[rule.paramName];
      console.log('Checking rule: ' + rule.paramName + ' = ' + val + ', expected: ' + rule.paramValue);
      if (val && (val === rule.paramValue || rule.paramValue === "*")) {
        matched = rule;
        console.log('Rule matched!', matched);
        break;
      }
    }
    if (matched) {
      console.log('Applying matched rule visibility:', matched.showBlocks, matched.hideBlocks);
      this.utmRulesApplied = true; // Set flag when UTM rules are applied
      this.applyVisibilityRules(matched.showBlocks, matched.hideBlocks);
    } else if (this.config.defaultBlockVisibility) {
      console.log('Applying default visibility:', this.config.defaultBlockVisibility);
      const { showBlocks, hideBlocks } = this.config.defaultBlockVisibility;
      this.applyVisibilityRules(showBlocks, hideBlocks);
    }
  }

  applyVisibilityRules(showBlocks, hideBlocks) {
    console.log('applyVisibilityRules called with:', { showBlocks, hideBlocks });
    
    (hideBlocks||[]).forEach((id) => {
      const selector = '#' + id + ',.' + id + ',[data-block-id="' + id + '"]';
      const elements = document.querySelectorAll(selector);
      console.log('Hiding elements for id "' + id + '":', elements.length, 'elements found');
      elements.forEach(el => {
        el.style.setProperty('display', 'none', 'important');
        console.log('Hidden element:', el, 'display:', el.style.display);
      });
    });
    
    (showBlocks||[]).forEach((id) => {
      const selector = '#' + id + ',.' + id + ',[data-block-id="' + id + '"]';
      const elements = document.querySelectorAll(selector);
      console.log('Showing elements for id "' + id + '":', elements.length, 'elements found');
      elements.forEach(el => {
        el.style.setProperty('display', 'flex', 'important');
        console.log('Shown element:', el, 'display:', el.style.display);
      });
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
