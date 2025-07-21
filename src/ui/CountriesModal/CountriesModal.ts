import baseStyles from '../../styles/base.css';
import countriesModalStyles from './CountriesModal.styles.css';
import { template } from './CountriesModal.template';
import '../Input/Input';

interface Country {
  name: string;
  code: string;
}

interface CountriesModalElements {
  overlay: HTMLElement | null;
  modal: HTMLElement | null;
  closeButtons: NodeListOf<HTMLElement>;
  searchInput: HTMLElement | null;
  tableBody: HTMLElement | null;
  tableRows: HTMLElement[];
}

export class CountriesModal extends HTMLElement {
  private elements: CountriesModalElements = {
    overlay: null,
    modal: null,
    closeButtons: [] as unknown as NodeListOf<HTMLElement>,
    searchInput: null,
    tableBody: null,
    tableRows: [],
  };

  private countries: Country[] = [
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

  private onCountrySelect: ((country: string) => void) | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `<style>${baseStyles}${countriesModalStyles}</style>${template}`;
    this.findElements();
    this.bindEvents();
    this.renderCountries();
  }

  private findElements(): void {
    this.elements.overlay = this.shadowRoot!.querySelector('.ttg-countries-modal-overlay');
    this.elements.modal = this.shadowRoot!.querySelector('.ttg-countries-modal');
    this.elements.closeButtons = this.shadowRoot!.querySelectorAll(
      '.ttg-countries-modal-close, .ttg-countries-modal-close-btn',
    );
    this.elements.searchInput = this.shadowRoot!.querySelector('.ttg-countries-modal-search-input');
    this.elements.tableBody = this.shadowRoot!.querySelector('.ttg-countries-modal-table-body');
  }

  private bindEvents(): void {
    // Close modal events
    this.elements.closeButtons.forEach((button) => {
      button.addEventListener('click', () => this.close());
    });

    // Close on overlay click
    this.elements.overlay?.addEventListener('click', (e) => {
      if (e.target === this.elements.overlay) {
        this.close();
      }
    });

    // Close on ESC key
    this.handleEscKey = this.handleEscKey.bind(this);
    document.addEventListener('keydown', this.handleEscKey);

    // Search functionality
    this.elements.searchInput?.addEventListener('change', () => {
      const searchTerm =
        (this.elements.searchInput as HTMLInputElement)?.value?.toLowerCase() || '';
      this.filterCountries(searchTerm);
    });

    // Also listen to input events for real-time search
    this.elements.searchInput?.addEventListener('input', () => {
      const searchTerm =
        (this.elements.searchInput as HTMLInputElement)?.value?.toLowerCase() || '';
      this.filterCountries(searchTerm);
    });

    // Stop propagation on modal click to prevent closing
    this.elements.modal?.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  private handleEscKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  private renderCountries(): void {
    if (!this.elements.tableBody) return;

    this.elements.tableBody.innerHTML = '';
    this.elements.tableRows = [];

    this.countries.forEach((country) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="country-name" data-country="${country.name}">${country.name}</td>
        <td>${country.code}</td>
      `;
      // Add click handler for country selection
      row.addEventListener('click', () => {
        this.selectCountry(country.name);
      });

      // Add hover styling
      row.style.cursor = 'pointer';
      if (this.elements.tableBody) {
        this.elements.tableBody.appendChild(row);
        this.elements.tableRows.push(row);
      }
    });
  }

  private filterCountries(searchTerm: string): void {
    this.elements.tableRows.forEach((row) => {
      const countryName = row.querySelector('.country-name')?.textContent?.toLowerCase() || '';
      const isVisible = countryName.includes(searchTerm);
      if (isVisible) {
        row.classList.remove('hidden');
      } else {
        row.classList.add('hidden');
      }
    });
  }

  private selectCountry(countryName: string): void {
    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent('country-select', {
        detail: { country: countryName },
        bubbles: true,
        composed: true,
      }),
    );

    // Call callback if provided
    if (this.onCountrySelect) {
      this.onCountrySelect(countryName);
    }

    this.close();
  }

  public setOnCountrySelect(callback: (country: string) => void): void {
    this.onCountrySelect = callback;
  }

  public show(): void {
    // Add to document body for proper layering
    document.body.appendChild(this);
    // Focus search input (ttg-input component)
    setTimeout(() => {
      if (this.elements.searchInput) {
        // For ttg-input component, we need to focus the internal input
        const internalInput = this.elements.searchInput.shadowRoot?.querySelector('input');
        if (internalInput) {
          internalInput.focus();
        }
      }
    }, 100);
  }

  public close(): void {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleEscKey);
    // Remove from DOM
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }

    // Dispatch close event
    this.dispatchEvent(
      new CustomEvent('modal-close', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Clean up when component is removed
  disconnectedCallback(): void {
    document.removeEventListener('keydown', this.handleEscKey);
  }
}

customElements.define('ttg-countries-modal', CountriesModal);
