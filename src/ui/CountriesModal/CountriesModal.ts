import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import baseStyles from '../../styles/base.css';
import countriesModalStyles from './CountriesModal.styles.css';
import '../Input/Input';

interface Country {
  name: string;
  code: string;
}

interface CountrySelectDetail {
  country: string;
}

export class CountriesModal extends LitElement {
  static styles = [unsafeCSS(baseStyles), unsafeCSS(countriesModalStyles)];

  @property({ type: Boolean, reflect: true })
  accessor open = false;

  @state()
  private accessor searchTerm = '';

  @state()
  private accessor filteredCountries: Country[] = [];

  @state()
  private accessor selectedIndex = -1;

  @state()
  private accessor visibleStartIndex = 0;

  @query('.ttg-countries-modal-search-input')
  private searchInput?: HTMLElement;

  @query('.ttg-countries-modal-table-body')
  private tableBody?: HTMLElement;

  @query('.ttg-countries-modal-table-container')
  private tableContainer?: HTMLElement;

  private debounceTimer?: number;
  private onCountrySelect: ((country: string) => void) | null = null;
  private readonly itemHeight = 44; // Примерная высота строки в пикселях
  private readonly visibleItemsCount = 10; // Количество видимых элементов

  private readonly countries: Country[] = [
    // CIS Countries (Priority)
    { name: 'Russia', code: 'RU' },
    { name: 'Belarus', code: 'BY' },
    { name: 'Kazakhstan', code: 'KZ' },
    { name: 'Ukraine', code: 'UA' },
    { name: 'Armenia', code: 'AM' },
    { name: 'Azerbaijan', code: 'AZ' },
    { name: 'Moldova', code: 'MD' },
    { name: 'Uzbekistan', code: 'UZ' },
    { name: 'Tajikistan', code: 'TJ' },
    { name: 'Kyrgyzstan', code: 'KG' },
    { name: 'Turkmenistan', code: 'TM' },
    { name: 'Georgia', code: 'GE' },
    // Baltic States
    { name: 'Estonia', code: 'EE' },
    { name: 'Latvia', code: 'LV' },
    { name: 'Lithuania', code: 'LT' },
    // Major International Countries
    { name: 'United States', code: 'US' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'China', code: 'CN' },
    { name: 'Japan', code: 'JP' },
    { name: 'Canada', code: 'CA' },
    { name: 'Australia', code: 'AU' },
    { name: 'Brazil', code: 'BR' },
    { name: 'India', code: 'IN' },
    { name: 'Spain', code: 'ES' },
    { name: 'Italy', code: 'IT' },
    { name: 'Mexico', code: 'MX' },
    { name: 'South Korea', code: 'KR' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'Poland', code: 'PL' },
    { name: 'Turkey', code: 'TR' },
    { name: 'Czech Republic', code: 'CZ' },
    { name: 'Sweden', code: 'SE' },
    { name: 'Norway', code: 'NO' },
    { name: 'Finland', code: 'FI' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Austria', code: 'AT' },
    { name: 'Switzerland', code: 'CH' },
    { name: 'Portugal', code: 'PT' },
    { name: 'Greece', code: 'GR' },
    { name: 'Hungary', code: 'HU' },
    { name: 'Romania', code: 'RO' },
    { name: 'Bulgaria', code: 'BG' },
    { name: 'Croatia', code: 'HR' },
    { name: 'Serbia', code: 'RS' },
    { name: 'Slovenia', code: 'SI' },
    { name: 'Slovakia', code: 'SK' },
    { name: 'Israel', code: 'IL' },
    { name: 'South Africa', code: 'ZA' },
    { name: 'Argentina', code: 'AR' },
    { name: 'Chile', code: 'CL' },
    { name: 'Colombia', code: 'CO' },
    { name: 'Peru', code: 'PE' },
    { name: 'Thailand', code: 'TH' },
    { name: 'Vietnam', code: 'VN' },
    { name: 'Philippines', code: 'PH' },
    { name: 'Malaysia', code: 'MY' },
    { name: 'Singapore', code: 'SG' },
    { name: 'Indonesia', code: 'ID' },
    { name: 'Pakistan', code: 'PK' },
    { name: 'Bangladesh', code: 'BD' },
    { name: 'Egypt', code: 'EG' },
    { name: 'Nigeria', code: 'NG' },
    { name: 'Kenya', code: 'KE' },
    { name: 'Morocco', code: 'MA' },
    { name: 'Iran', code: 'IR' },
    { name: 'Iraq', code: 'IQ' },
    { name: 'Saudi Arabia', code: 'SA' },
    { name: 'United Arab Emirates', code: 'AE' },
    { name: 'Jordan', code: 'JO' },
    { name: 'Lebanon', code: 'LB' },
    { name: 'Kuwait', code: 'KW' },
    { name: 'Qatar', code: 'QA' },
    { name: 'Bahrain', code: 'BH' },
    { name: 'Oman', code: 'OM' },
  ];

  constructor() {
    super();
    this.filteredCountries = this.countries;
    this.addEventListener('keydown', this.handleKeyDown);
  }

  firstUpdated(): void {
    if (this.tableContainer) {
      this.tableContainer.addEventListener('scroll', this.handleScroll);
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this.handleEscKey);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.handleEscKey);
    if (this.tableContainer) {
      this.tableContainer.removeEventListener('scroll', this.handleScroll);
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  render(): TemplateResult {
    return html`
      <div class="ttg-countries-modal-overlay" @click="${this.handleOverlayClick}">
        <div class="ttg-countries-modal" @click="${this.stopPropagation}">
          <div class="ttg-countries-modal-header">
            <h3 class="ttg-countries-modal-title">Список стран для GeoJS API</h3>
            <button class="ttg-countries-modal-close" type="button" @click="${this.close}">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <div class="ttg-countries-modal-content">
            <p class="ttg-countries-modal-description">
              Используйте полное название страны на английском языке. Ниже приведены примеры
              наиболее распространенных стран:
            </p>

            <div class="ttg-countries-modal-search">
              <ttg-input
                label="Поиск"
                placeholder="Поиск страны..."
                class="ttg-countries-modal-search-input"
                .value="${this.searchTerm}"
                @change="${this.handleSearchChange}"
                @input="${this.handleSearchInput}"
              >
              </ttg-input>
            </div>

            <div class="ttg-countries-modal-table-container">
              <table class="ttg-countries-modal-table" role="table" aria-label="Список стран">
                <thead>
                  <tr>
                    <th>Полное название (использовать)</th>
                    <th>Код ISO (НЕ использовать)</th>
                  </tr>
                </thead>
                <tbody class="ttg-countries-modal-table-body" role="rowgroup">
                  ${this.renderVirtualizedCountryRows()}
                </tbody>
              </table>
            </div>

            <p class="ttg-countries-modal-note">
              <strong>Примечание:</strong> Для обозначения любой страны используйте символ "*".
              Нажмите на название страны, чтобы использовать его.
            </p>
          </div>

          <div class="ttg-countries-modal-footer">
            <button class="ttg-countries-modal-close-btn" type="button" @click="${this.close}">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private renderVirtualizedCountryRows(): TemplateResult[] {
    const totalHeight = this.filteredCountries.length * this.itemHeight;
    const visibleEndIndex = Math.min(
      this.visibleStartIndex + this.visibleItemsCount,
      this.filteredCountries.length,
    );

    const topSpacerHeight = this.visibleStartIndex * this.itemHeight;
    const bottomSpacerHeight = totalHeight - visibleEndIndex * this.itemHeight;

    const visibleItems = this.filteredCountries.slice(this.visibleStartIndex, visibleEndIndex);

    return [
      // Верхний спейсер для виртуализации
      topSpacerHeight > 0
        ? html`<tr style="height: ${topSpacerHeight}px;">
              <td colspan="2"></td>
            </tr>`
        : html``,

      // Видимые элементы
      ...visibleItems.map((country, localIndex) => {
        const globalIndex = this.visibleStartIndex + localIndex;
        return html`
          <tr
            class="${this.selectedIndex === globalIndex ? 'selected' : ''}"
            role="button"
            tabindex="0"
            aria-label="Выбрать страну ${country.name}"
            style="height: ${this.itemHeight}px;"
            @click="${() => this.selectCountry(country.name)}"
            @keydown="${(e: KeyboardEvent) => this.handleRowKeyDown(e, country.name)}"
          >
            <td class="country-name">${country.name}</td>
            <td>${country.code}</td>
          </tr>
        `;
      }),

      // Нижний спейсер для виртуализации
      bottomSpacerHeight > 0
        ? html`<tr style="height: ${bottomSpacerHeight}px;">
              <td colspan="2"></td>
            </tr>`
        : html``,
    ].filter((item) => item !== html``);
  }

  private handleEscKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open) {
      this.close();
    }
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.open) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCountries.length - 1);
        this.scrollToSelectedRow();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.scrollToSelectedRow();
        break;
      case 'Enter':
        if (this.selectedIndex >= 0 && this.filteredCountries[this.selectedIndex]) {
          this.selectCountry(this.filteredCountries[this.selectedIndex].name);
        }
        break;
    }
  };

  private handleRowKeyDown(event: KeyboardEvent, countryName: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectCountry(countryName);
    }
  }

  private handleOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  private stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  private handleSearchChange(event: CustomEvent): void {
    const input = event.target as HTMLElement & { value?: string };
    this.searchTerm = input.value || '';
    this.performSearch();
  }

  private handleSearchInput(event: Event): void {
    const input = event.target as HTMLElement & { value?: string };
    this.searchTerm = input.value || '';
    this.debouncedSearch();
  }

  private debouncedSearch(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = window.setTimeout(() => {
      this.performSearch();
    }, 300);
  }

  private performSearch(): void {
    const searchTerm = this.searchTerm.toLowerCase();
    this.filteredCountries = this.countries.filter((country) =>
      country.name.toLowerCase().includes(searchTerm),
    );
    this.selectedIndex = -1;
  }

  private handleScroll = (): void => {
    if (!this.tableContainer) return;

    const scrollTop = this.tableContainer.scrollTop;
    const newVisibleStartIndex = Math.floor(scrollTop / this.itemHeight);

    if (newVisibleStartIndex !== this.visibleStartIndex) {
      this.visibleStartIndex = newVisibleStartIndex;
    }
  };

  private scrollToSelectedRow(): void {
    if (!this.tableContainer || this.selectedIndex < 0) return;

    const selectedRowTop = this.selectedIndex * this.itemHeight;
    const containerHeight = this.tableContainer.clientHeight;
    const scrollTop = this.tableContainer.scrollTop;

    // Проверяем, видна ли выбранная строка
    if (selectedRowTop < scrollTop) {
      // Строка выше видимой области
      this.tableContainer.scrollTop = selectedRowTop;
    } else if (selectedRowTop + this.itemHeight > scrollTop + containerHeight) {
      // Строка ниже видимой области
      this.tableContainer.scrollTop = selectedRowTop - containerHeight + this.itemHeight;
    }
  }

  private selectCountry(countryName: string): void {
    this.dispatchEvent(
      new CustomEvent<CountrySelectDetail>('country-select', {
        detail: { country: countryName },
        bubbles: true,
        composed: true,
      }),
    );

    if (this.onCountrySelect) {
      this.onCountrySelect(countryName);
    }

    this.close();
  }

  public setOnCountrySelect(callback: (country: string) => void): void {
    this.onCountrySelect = callback;
  }

  public show(): void {
    document.body.appendChild(this);
    this.open = true;
    this.updateComplete.then(() => {
      if (this.searchInput) {
        const internalInput = this.searchInput.shadowRoot?.querySelector('input');
        if (internalInput) {
          internalInput.focus();
        }
      }
    });
  }

  public close(): void {
    this.open = false;
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }

    this.dispatchEvent(
      new CustomEvent('modal-close', {
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define('ttg-countries-modal', CountriesModal);
