/**
 * ReactiveValidationController - Реактивный контроллер валидации для динамических форм
 * Автоматически синхронизируется с состоянием компонента и не требует ручного управления полями
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type {
  ValidationResult,
  ValidationRuleConfig,
  ValidationFieldState,
  ValidationFormState,
  ValidationControllerConfig,
} from '../types/validation.js';

/**
 * Карта правил валидации - ключ это ID поля, значение это массив правил
 */
export type ValidationRuleMap = Record<string, readonly ValidationRuleConfig[]>;

/**
 * Функция для генерации правил валидации на основе текущего состояния
 */
export type ValidationRuleGenerator<TState = unknown> = (state: TState) => ValidationRuleMap;

/**
 * Функция для извлечения значений полей из состояния
 */
export type StateValueExtractor<TState = unknown> = (state: TState, fieldId: string) => string;

/**
 * Реактивный контроллер валидации
 */
export class ReactiveValidationController<TState = unknown> implements ReactiveController {
  private host: ReactiveControllerHost;
  private config: Required<ValidationControllerConfig>;
  private fields = new Map<string, ValidationFieldState>();
  private touchedFields = new Set<string>();
  private debounceTimers = new Map<string, number>();

  // Функции для работы с состоянием
  private getState: () => TState;
  private getRules: ValidationRuleGenerator<TState>;
  private extractValue: StateValueExtractor<TState>;

  constructor(
    host: ReactiveControllerHost,
    options: {
      getState: () => TState;
      getRules: ValidationRuleGenerator<TState>;
      extractValue: StateValueExtractor<TState>;
      config?: ValidationControllerConfig;
    },
  ) {
    this.host = host;
    this.getState = options.getState;
    this.getRules = options.getRules;
    this.extractValue = options.extractValue;

    this.config = {
      autoValidate: true,
      validateOnBlur: true,
      validateOnInput: false,
      debounceMs: 300,
      showErrorsImmediately: false,
      ...options.config,
    };

    this.host.addController(this);
  }

  hostConnected(): void {
    // Контроллер готов к работе
  }

  hostDisconnected(): void {
    this.clearDebounceTimers();
  }

  hostUpdate(): void {
    // Синхронизируемся с состоянием компонента при каждом обновлении
    this.syncWithCurrentState();
  }

  /**
   * Синхронизирует валидацию с текущим состоянием компонента
   */
  private syncWithCurrentState(): void {
    const currentState = this.getState();
    const currentRules = this.getRules(currentState);

    // Получаем текущие поля из правил
    const currentFieldIds = new Set(Object.keys(currentRules));
    const existingFieldIds = new Set(this.fields.keys());

    // Удаляем поля, которых больше нет в правилах
    for (const fieldId of existingFieldIds) {
      if (!currentFieldIds.has(fieldId)) {
        this.removeField(fieldId);
      }
    }

    // Добавляем или обновляем поля
    for (const fieldId of currentFieldIds) {
      const currentValue = this.extractValue(currentState, fieldId);
      const existingField = this.fields.get(fieldId);

      if (!existingField) {
        // Новое поле - создаем начальное состояние
        this.fields.set(fieldId, {
          id: fieldId,
          value: currentValue,
          error: '',
          isValid: true,
          isTouched: this.touchedFields.has(fieldId),
          isValidating: false,
        });
      } else if (existingField.value !== currentValue) {
        // Значение изменилось - обновляем и валидируем если нужно
        this.updateFieldValue(fieldId, currentValue);
      }
    }
  }

  /**
   * Обновляет значение поля и запускает валидацию при необходимости
   */
  updateFieldValue(fieldId: string, value: string): void {
    const existingField = this.fields.get(fieldId);
    if (!existingField) return;

    this.updateFieldState(fieldId, { ...existingField, value });

    if (this.config.validateOnInput || (existingField.isTouched && this.config.autoValidate)) {
      this.scheduleValidation(fieldId);
    }
  }

  /**
   * Помечает поле как touched и запускает валидацию
   */
  touchField(fieldId: string): void {
    this.touchedFields.add(fieldId);

    const existingField = this.fields.get(fieldId);
    if (!existingField) return;

    this.updateFieldState(fieldId, { ...existingField, isTouched: true });

    if (this.config.validateOnBlur) {
      this.scheduleValidation(fieldId);
    }
  }

  /**
   * Валидирует конкретное поле
   */
  async validateField(fieldId: string): Promise<ValidationResult> {
    const fieldState = this.fields.get(fieldId);
    if (!fieldState) {
      return { isValid: true, error: '' };
    }

    const currentState = this.getState();
    const rules = this.getRules(currentState)[fieldId];
    if (!rules || rules.length === 0) {
      return { isValid: true, error: '' };
    }

    const value = fieldState.value;

    // Помечаем как валидирующееся
    this.updateFieldState(fieldId, { ...fieldState, isValidating: true });

    // Проходим по всем правилам
    for (const rule of rules) {
      const result = await this.applyValidationRule(rule, value);
      if (!result.isValid) {
        this.updateFieldState(fieldId, {
          ...fieldState,
          error: result.error,
          isValid: false,
          isValidating: false,
        });
        return result;
      }
    }

    // Все правила прошли успешно
    this.updateFieldState(fieldId, {
      ...fieldState,
      error: '',
      isValid: true,
      isValidating: false,
    });

    return { isValid: true, error: '' };
  }

  /**
   * Валидирует всю форму
   */
  async validateForm(): Promise<ValidationFormState> {
    const fieldIds = Array.from(this.fields.keys());
    const validationPromises = fieldIds.map((fieldId) => this.validateField(fieldId));

    await Promise.all(validationPromises);
    return this.getFormState();
  }

  /**
   * Принудительная валидация всех полей с пометкой как touched
   */
  async forceValidateForm(): Promise<ValidationFormState> {
    // Помечаем все поля как touched
    for (const fieldId of this.fields.keys()) {
      this.touchField(fieldId);
    }

    return this.validateForm();
  }

  /**
   * Получает состояние конкретного поля
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
   * Очищает ошибку поля
   */
  clearFieldError(fieldId: string): void {
    const fieldState = this.fields.get(fieldId);
    if (!fieldState) return;

    this.updateFieldState(fieldId, {
      ...fieldState,
      error: '',
      isValid: true,
    });
  }

  /**
   * Устанавливает ошибку поля вручную
   */
  setFieldError(fieldId: string, error: string): void {
    const fieldState = this.fields.get(fieldId);
    if (!fieldState) return;

    this.updateFieldState(fieldId, {
      ...fieldState,
      error,
      isValid: false,
    });
  }

  /**
   * Удаляет поле из валидации
   */
  private removeField(fieldId: string): void {
    this.fields.delete(fieldId);
    this.touchedFields.delete(fieldId);
    this.clearDebounceTimer(fieldId);
  }

  /**
   * Обновляет состояние поля и уведомляет хост
   */
  private updateFieldState(fieldId: string, newState: ValidationFieldState): void {
    this.fields.set(fieldId, newState);
    this.host.requestUpdate();
    this.dispatchFieldValidationEvent(fieldId, newState);
    this.dispatchFormValidationEvent();
  }

  /**
   * Планирует валидацию с debounce
   */
  private scheduleValidation(fieldId: string): void {
    this.clearDebounceTimer(fieldId);

    const timerId = window.setTimeout(() => {
      this.validateField(fieldId);
      this.debounceTimers.delete(fieldId);
    }, this.config.debounceMs);

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

      case 'pattern':
        return this.validatePattern(trimmedValue, rule.message, rule.options);

      case 'min':
        return this.validateMin(trimmedValue, rule.message, rule.options);

      case 'max':
        return this.validateMax(trimmedValue, rule.message, rule.options);

      case 'custom':
        return rule.options?.customValidator?.(trimmedValue) || { isValid: true, error: '' };

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
   * Валидация по паттерну
   */
  private validatePattern(
    value: string,
    message?: string,
    options?: { pattern?: RegExp | string },
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
   * Валидация минимального значения
   */
  private validateMin(
    value: string,
    message?: string,
    options?: { min?: number | string },
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
    options?: { max?: number | string },
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
}
