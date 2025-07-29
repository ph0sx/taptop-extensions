/**
 * ValidationController - Reactive Controller для централизованной валидации
 * Интегрируется с Lit компонентами и предоставляет единый API для валидации
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type {
  ValidationResult,
  ValidationRuleConfig,
  ValidationRuleOptions,
  ValidationFieldConfig,
  ValidationFieldState,
  ValidationFormState,
  ValidationControllerConfig,
  FormDataCollector,
} from '../types/validation.js';

/**
 * ValidationController - центральный контроллер для валидации форм
 */
export class ValidationController implements ReactiveController, FormDataCollector {
  private host: ReactiveControllerHost;
  private config: ValidationControllerConfig;
  private fields = new Map<string, ValidationFieldState>();
  private fieldConfigs = new Map<string, ValidationFieldConfig>();
  private debounceTimers = new Map<string, number>();

  constructor(host: ReactiveControllerHost, config: ValidationControllerConfig = {}) {
    this.host = host;
    this.config = {
      autoValidate: true,
      validateOnBlur: true,
      validateOnInput: false,
      debounceMs: 300,
      showErrorsImmediately: false,
      ...config,
    };
    this.host.addController(this);
  }

  hostConnected(): void {
    // Контроллер больше не управляет событиями напрямую
  }

  hostDisconnected(): void {
    this.clearDebounceTimers();
  }

  /**
   * Регистрирует поле для валидации
   */
  registerField(fieldConfig: ValidationFieldConfig, initialValue: string = ''): void {
    this.fieldConfigs.set(fieldConfig.id, fieldConfig);
    this.fields.set(fieldConfig.id, {
      id: fieldConfig.id,
      value: initialValue,
      error: '',
      isValid: true, // Считаем все поля валидными при регистрации до первой проверки
      isTouched: false,
      isValidating: false,
    });
    this.host.requestUpdate();
  }

  /**
   * Удаляет поле из валидации
   */
  unregisterField(fieldId: string): void {
    this.fieldConfigs.delete(fieldId);
    this.fields.delete(fieldId);
    this.clearDebounceTimer(fieldId);
    this.host.requestUpdate();
  }

  /**
   * Валидирует отдельное поле
   */
  async validateField(fieldId: string, value: string = ''): Promise<ValidationResult> {
    const fieldConfig = this.fieldConfigs.get(fieldId);
    if (!fieldConfig) {
      return { isValid: true, error: '' };
    }

    const currentState = this.fields.get(fieldId);
    if (!currentState) {
      return { isValid: true, error: '' };
    }

    // Обновляем состояние - начинаем валидацию
    this.updateFieldState(fieldId, {
      ...currentState,
      value,
      isValidating: true,
    });

    // Проходим по всем правилам валидации
    for (const rule of fieldConfig.rules) {
      const result = await this.applyValidationRule(rule, value);
      if (!result.isValid) {
        this.updateFieldState(fieldId, {
          ...currentState,
          value,
          error: result.error,
          isValid: false,
          isValidating: false,
        });
        return result;
      }
    }

    // Все правила прошли успешно
    this.updateFieldState(fieldId, {
      ...currentState,
      value,
      error: '',
      isValid: true,
      isValidating: false,
    });

    return { isValid: true, error: '' };
  }

  /**
   * Валидирует все поля формы
   */
  async validateForm(): Promise<ValidationFormState> {
    const validationPromises = Array.from(this.fieldConfigs.keys()).map(async (fieldId) => {
      const currentState = this.fields.get(fieldId);
      if (currentState) {
        return this.validateField(fieldId, currentState.value);
      }
      return { isValid: true, error: '' };
    });

    await Promise.all(validationPromises);
    return this.getFormState();
  }

  /**
   * Принудительная валидация с пометкой всех полей как touched
   */
  async forceValidateForm(): Promise<ValidationFormState> {
    // Помечаем все поля как touched
    for (const [fieldId, state] of this.fields) {
      this.updateFieldState(fieldId, {
        ...state,
        isTouched: true,
      });
    }

    return this.validateForm();
  }

  /**
   * Получает текущее состояние поля
   */
  getFieldState(fieldId: string): ValidationFieldState | undefined {
    return this.fields.get(fieldId);
  }

  /**
   * Получает общее состояние формы
   */
  getFormState(): ValidationFormState {
    const fieldsArray = Array.from(this.fields.values());
    const validFields = fieldsArray.filter((field) => field.isValid);
    const touchedFields = fieldsArray.filter((field) => field.isTouched);
    const hasErrors = fieldsArray.some((field) => field.error !== '');

    return {
      isValid: fieldsArray.length > 0 && validFields.length === fieldsArray.length,
      hasErrors,
      fields: new Map(this.fields),
      touchedFieldsCount: touchedFields.length,
      validFieldsCount: validFields.length,
    };
  }

  /**
   * Обновляет значение поля и запускает валидацию если настроено
   */
  updateFieldValue(fieldId: string, value: string): void {
    const currentState = this.fields.get(fieldId);
    if (!currentState) return;

    // Просто обновляем значение
    this.updateFieldState(fieldId, { ...currentState, value });

    const fieldConfig = this.fieldConfigs.get(fieldId);
    const shouldValidate = fieldConfig?.validateOnInput ?? this.config.validateOnInput;

    if (shouldValidate) {
      this.scheduleValidation(fieldId, value);
    }
  }

  /**
   * Помечает поле как touched и запускает валидацию при потере фокуса
   */
  touchField(fieldId: string): void {
    const currentState = this.fields.get(fieldId);
    if (!currentState) return;

    // Если поле уже было затронуто, ничего не делаем
    if (currentState.isTouched) return;

    this.updateFieldState(fieldId, { ...currentState, isTouched: true });

    const fieldConfig = this.fieldConfigs.get(fieldId);
    const shouldValidate = fieldConfig?.validateOnBlur ?? this.config.validateOnBlur;

    if (shouldValidate) {
      this.scheduleValidation(fieldId, currentState.value);
    }
  }

  /**
   * Очищает ошибку поля
   */
  clearFieldError(fieldId: string): void {
    const currentState = this.fields.get(fieldId);
    if (!currentState) return;

    this.updateFieldState(fieldId, {
      ...currentState,
      error: '',
      isValid: true,
    });
  }

  /**
   * Устанавливает ошибку поля вручную
   */
  setFieldError(fieldId: string, error: string): void {
    const currentState = this.fields.get(fieldId);
    if (!currentState) return;

    this.updateFieldState(fieldId, {
      ...currentState,
      error,
      isValid: false,
    });
  }

  /**
   * Реализация FormDataCollector - собирает данные формы
   */
  collectFormData(): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    for (const [fieldId, state] of this.fields) {
      if (state.value !== '') {
        data[fieldId] = this.sanitizeValue(state.value);
      }
    }

    return data;
  }

  /**
   * Проверяет, пуста ли форма
   */
  isEmpty(): boolean {
    return Array.from(this.fields.values()).every((field) => field.value === '');
  }

  /**
   * Получает количество заполненных полей
   */
  getFilledFieldsCount(): number {
    return Array.from(this.fields.values()).filter((field) => field.value !== '').length;
  }

  /**
   * Применяет правило валидации к значению
   */
  private async applyValidationRule(
    rule: ValidationRuleConfig,
    value: string,
  ): Promise<ValidationResult> {
    const trimmedValue = value.trim();

    switch (rule.type) {
      case 'required':
        return this.validateRequired(trimmedValue, rule.message);

      case 'number':
        return this.validateNumber(trimmedValue, rule.message);

      case 'date':
        return this.validateDate(trimmedValue, rule.message, rule.options);

      case 'time':
        return this.validateTime(trimmedValue, rule.message, rule.options);

      case 'min':
        return this.validateMin(trimmedValue, rule.message, rule.options);

      case 'max':
        return this.validateMax(trimmedValue, rule.message, rule.options);

      case 'pattern':
        return this.validatePattern(trimmedValue, rule.message, rule.options);

      case 'custom':
        return this.validateCustom(trimmedValue, rule.options);

      default:
        return { isValid: true, error: '' };
    }
  }

  /**
   * Валидация обязательного поля
   */
  private validateRequired(value: string, message?: string): ValidationResult {
    if (!value) {
      return {
        isValid: false,
        error: message || 'Это поле обязательно для заполнения',
      };
    }
    return { isValid: true, error: '' };
  }

  /**
   * Валидация числового поля
   */
  private validateNumber(value: string, message?: string): ValidationResult {
    if (!value) return { isValid: true, error: '' };

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: message || 'Введите корректное число',
      };
    }

    return { isValid: true, error: '' };
  }

  /**
   * Валидация даты
   */
  private validateDate(
    value: string,
    message?: string,
    options?: ValidationRuleOptions,
  ): ValidationResult {
    if (!value) return { isValid: true, error: '' };

    const dateValue = new Date(value);
    if (isNaN(dateValue.getTime())) {
      return {
        isValid: false,
        error: message || 'Введите корректную дату',
      };
    }

    if (options?.min && value < options.min) {
      return {
        isValid: false,
        error: message || `Дата должна быть не раньше ${options.min}`,
      };
    }

    if (options?.max && value > options.max) {
      return {
        isValid: false,
        error: message || `Дата должна быть не позже ${options.max}`,
      };
    }

    return { isValid: true, error: '' };
  }

  /**
   * Валидация времени
   */
  private validateTime(
    value: string,
    message?: string,
    options?: ValidationRuleOptions,
  ): ValidationResult {
    if (!value) return { isValid: true, error: '' };

    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(value)) {
      return {
        isValid: false,
        error: message || 'Введите корректное время в формате ЧЧ:ММ',
      };
    }

    if (options?.min && value < options.min) {
      return {
        isValid: false,
        error: message || `Время должно быть не раньше ${options.min}`,
      };
    }

    if (options?.max && value > options.max) {
      return {
        isValid: false,
        error: message || `Время должно быть не позже ${options.max}`,
      };
    }

    return { isValid: true, error: '' };
  }

  /**
   * Валидация минимального значения
   */
  private validateMin(
    value: string,
    message?: string,
    options?: ValidationRuleOptions,
  ): ValidationResult {
    if (!value || !options?.min) return { isValid: true, error: '' };

    const numValue = parseFloat(value);
    const minValue = typeof options.min === 'string' ? parseFloat(options.min) : options.min;

    if (!isNaN(numValue) && !isNaN(minValue) && numValue < minValue) {
      return {
        isValid: false,
        error: message || `Значение должно быть не менее ${options.min}`,
      };
    }

    return { isValid: true, error: '' };
  }

  /**
   * Валидация максимального значения
   */
  private validateMax(
    value: string,
    message?: string,
    options?: ValidationRuleOptions,
  ): ValidationResult {
    if (!value || !options?.max) return { isValid: true, error: '' };

    const numValue = parseFloat(value);
    const maxValue = typeof options.max === 'string' ? parseFloat(options.max) : options.max;

    if (!isNaN(numValue) && !isNaN(maxValue) && numValue > maxValue) {
      return {
        isValid: false,
        error: message || `Значение должно быть не более ${options.max}`,
      };
    }

    return { isValid: true, error: '' };
  }

  /**
   * Валидация по паттерну
   */
  private validatePattern(
    value: string,
    message?: string,
    options?: ValidationRuleOptions,
  ): ValidationResult {
    if (!value || !options?.pattern) return { isValid: true, error: '' };

    const pattern =
      typeof options.pattern === 'string' ? new RegExp(options.pattern) : options.pattern;

    if (!pattern.test(value)) {
      return {
        isValid: false,
        error: message || 'Значение не соответствует требуемому формату',
      };
    }

    return { isValid: true, error: '' };
  }

  /**
   * Кастомная валидация
   */
  private validateCustom(value: string, options?: ValidationRuleOptions): ValidationResult {
    if (!options?.customValidator) {
      return { isValid: true, error: '' };
    }

    return options.customValidator(value);
  }

  /**
   * Обновляет состояние поля и уведомляет хост
   */
  private updateFieldState(fieldId: string, newState: ValidationFieldState): void {
    this.fields.set(fieldId, newState);
    this.host.requestUpdate(); // Уведомляем хост о необходимости перерисовки
    this.dispatchFieldValidationEvent(fieldId, newState);
    this.dispatchFormValidationEvent();
  }

  /**
   * Планирует валидацию с debounce
   */
  private scheduleValidation(fieldId: string, value: string): void {
    this.clearDebounceTimer(fieldId);

    const fieldConfig = this.fieldConfigs.get(fieldId);
    const debounceMs = fieldConfig?.debounceMs ?? this.config.debounceMs ?? 300;

    const timerId = window.setTimeout(() => {
      this.validateField(fieldId, value);
      this.debounceTimers.delete(fieldId);
    }, debounceMs);

    this.debounceTimers.set(fieldId, timerId);
  }

  /**
   * Очищает таймер debounce для поля
   */
  private clearDebounceTimer(fieldId: string): void {
    const timerId = this.debounceTimers.get(fieldId);
    if (timerId) {
      clearTimeout(timerId);
      this.debounceTimers.delete(fieldId);
    }
  }

  /**
   * Очищает все таймеры debounce
   */
  private clearDebounceTimers(): void {
    for (const timerId of this.debounceTimers.values()) {
      clearTimeout(timerId);
    }
    this.debounceTimers.clear();
  }

  /**
   * Отправляет событие изменения валидации поля
   */
  private dispatchFieldValidationEvent(fieldId: string, state: ValidationFieldState): void {
    if (this.host instanceof HTMLElement) {
      this.host.dispatchEvent(
        new CustomEvent('field-validation-change', {
          detail: { fieldId, state },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  /**
   * Отправляет событие изменения валидации формы
   */
  private dispatchFormValidationEvent(): void {
    if (this.host instanceof HTMLElement) {
      this.host.dispatchEvent(
        new CustomEvent('form-validation-change', {
          detail: { formState: this.getFormState() },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  /**
   * Санитизирует значение для данных формы
   */
  private sanitizeValue(value: string): unknown {
    const trimmed = value.trim();

    // Попытка конвертации в число
    const numValue = parseFloat(trimmed);
    if (!isNaN(numValue) && trimmed === numValue.toString()) {
      return numValue;
    }

    // Возвращаем как строку
    return trimmed === '' ? undefined : trimmed;
  }
}
