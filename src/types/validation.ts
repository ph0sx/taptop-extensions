/**
 * Типы для централизованной системы валидации
 * Используются ValidationController и всеми валидируемыми компонентами
 */

/**
 * Результат валидации поля
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly error: string;
}

/**
 * Конфигурация правила валидации
 */
export interface ValidationRuleConfig {
  readonly type: ValidationRuleType;
  readonly message?: string;
  readonly options?: ValidationRuleOptions;
}

/**
 * Типы правил валидации
 */
export type ValidationRuleType =
  | 'required'
  | 'number'
  | 'date'
  | 'time'
  | 'min'
  | 'max'
  | 'pattern'
  | 'custom';

/**
 * Опции для правил валидации
 */
export interface ValidationRuleOptions {
  readonly min?: number | string;
  readonly max?: number | string;
  readonly pattern?: RegExp | string;
  readonly customValidator?: (value: string) => ValidationResult;
}

/**
 * Конфигурация поля для валидации
 */
export interface ValidationFieldConfig {
  readonly id: string;
  readonly rules: readonly ValidationRuleConfig[];
  readonly validateOnBlur?: boolean;
  readonly validateOnInput?: boolean;
  readonly debounceMs?: number;
}

/**
 * Состояние валидации поля
 */
export interface ValidationFieldState {
  readonly id: string;
  readonly value: string;
  readonly error: string;
  readonly isValid: boolean;
  readonly isTouched: boolean;
  readonly isValidating: boolean;
}

/**
 * Общее состояние валидации формы
 */
export interface ValidationFormState {
  readonly isValid: boolean;
  readonly hasErrors: boolean;
  readonly fields: ReadonlyMap<string, ValidationFieldState>;
  readonly touchedFieldsCount: number;
  readonly validFieldsCount: number;
}

/**
 * События валидации
 */
export interface ValidationEvents {
  'field-validation-change': CustomEvent<{
    fieldId: string;
    state: ValidationFieldState;
  }>;
  'form-validation-change': CustomEvent<{
    formState: ValidationFormState;
  }>;
  'validation-error': CustomEvent<{
    fieldId: string;
    error: string;
  }>;
}

/**
 * Интерфейс для валидируемых элементов
 */
export interface ValidatableElement extends HTMLElement {
  readonly id: string;
  readonly value: string | string[];
  readonly isValid?: boolean;
  readonly hasError?: boolean;
  validate?(): boolean;
  setError?(error: string): void;
  clearError?(): void;
}

/**
 * Конфигурация ValidationController
 */
export interface ValidationControllerConfig {
  readonly autoValidate?: boolean;
  readonly validateOnBlur?: boolean;
  readonly validateOnInput?: boolean;
  readonly debounceMs?: number;
  readonly showErrorsImmediately?: boolean;
}

/**
 * Интерфейс для сбора данных формы
 */
export interface FormDataCollector {
  collectFormData(): Record<string, unknown>;
  isEmpty(): boolean;
  getFilledFieldsCount(): number;
}
