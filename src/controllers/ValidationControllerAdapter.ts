/**
 * ValidationControllerAdapter - Адаптер для обратной совместимости
 * Позволяет использовать старый ValidationController API с новым ReactiveValidationController
 */

import type { ReactiveControllerHost } from 'lit';
import { ValidationController } from './ValidationController.js';
import {
  ReactiveValidationController,
  type ValidationRuleMap,
} from './ReactiveValidationController.js';
import type {
  ValidationFieldConfig,
  ValidationControllerConfig,
  ValidationFormState,
  ValidationFieldState,
  ValidationResult,
} from '../types/validation.js';

/**
 * Адаптер для миграции существующих генераторов на новую систему валидации
 * Предоставляет старый API, но использует ReactiveValidationController внутри
 */
export class ValidationControllerAdapter {
  private originalController: ValidationController;
  private reactiveController?: ReactiveValidationController;
  private fieldConfigs = new Map<string, ValidationFieldConfig>();
  private staticState = new Map<string, string>();

  constructor(host: ReactiveControllerHost, config?: ValidationControllerConfig) {
    this.originalController = new ValidationController(host, config);
  }

  /**
   * Включает реактивный режим для статических форм
   * Автоматически конвертирует зарегистрированные поля в реактивную систему
   */
  enableReactiveMode(): void {
    if (this.reactiveController) return;

    // Создаем ReactiveValidationController с адаптированными функциями
    this.reactiveController = new ReactiveValidationController(
      this.originalController['host'], // Доступ к приватному полю через bracket notation
      {
        getState: () => this.getStaticState(),
        getRules: () => this.generateRulesFromRegistered(),
        extractValue: (_, fieldId) => this.staticState.get(fieldId) || '',
        config: this.originalController['config'],
      },
    );
  }

  /**
   * Старый API - регистрирует поле для валидации
   */
  registerField(fieldConfig: ValidationFieldConfig, initialValue: string = ''): void {
    this.fieldConfigs.set(fieldConfig.id, fieldConfig);
    this.staticState.set(fieldConfig.id, initialValue);

    if (this.reactiveController) {
      // В реактивном режиме просто сохраняем конфигурацию
      // Валидация обновится автоматически при следующем рендере
    } else {
      // Используем оригинальный контроллер
      this.originalController.registerField(fieldConfig, initialValue);
    }
  }

  /**
   * Старый API - удаляет поле из валидации
   */
  unregisterField(fieldId: string): void {
    this.fieldConfigs.delete(fieldId);
    this.staticState.delete(fieldId);

    if (this.reactiveController) {
      // В реактивном режиме поле удалится автоматически
    } else {
      this.originalController.unregisterField(fieldId);
    }
  }

  /**
   * Старый API - обновляет значение поля
   */
  updateFieldValue(fieldId: string, value: string): void {
    this.staticState.set(fieldId, value);

    if (this.reactiveController) {
      this.reactiveController.updateFieldValue(fieldId, value);
    } else {
      this.originalController.updateFieldValue(fieldId, value);
    }
  }

  /**
   * Старый API - помечает поле как touched
   */
  touchField(fieldId: string): void {
    if (this.reactiveController) {
      this.reactiveController.touchField(fieldId);
    } else {
      this.originalController.touchField(fieldId);
    }
  }

  /**
   * Старый API - валидирует поле
   */
  async validateField(fieldId: string, value?: string): Promise<ValidationResult> {
    if (value !== undefined) {
      this.updateFieldValue(fieldId, value);
    }

    if (this.reactiveController) {
      return this.reactiveController.validateField(fieldId);
    } else {
      return this.originalController.validateField(fieldId, value);
    }
  }

  /**
   * Старый API - валидирует всю форму
   */
  async validateForm(): Promise<ValidationFormState> {
    if (this.reactiveController) {
      return this.reactiveController.validateForm();
    } else {
      return this.originalController.validateForm();
    }
  }

  /**
   * Старый API - принудительная валидация
   */
  async forceValidateForm(): Promise<ValidationFormState> {
    if (this.reactiveController) {
      return this.reactiveController.forceValidateForm();
    } else {
      return this.originalController.forceValidateForm();
    }
  }

  /**
   * Старый API - получает состояние поля
   */
  getFieldState(fieldId: string): ValidationFieldState | undefined {
    if (this.reactiveController) {
      return this.reactiveController.getFieldState(fieldId);
    } else {
      return this.originalController.getFieldState(fieldId);
    }
  }

  /**
   * Старый API - получает состояние формы
   */
  getFormState(): ValidationFormState {
    if (this.reactiveController) {
      return this.reactiveController.getFormState();
    } else {
      return this.originalController.getFormState();
    }
  }

  /**
   * Старый API - очищает ошибку поля
   */
  clearFieldError(fieldId: string): void {
    if (this.reactiveController) {
      this.reactiveController.clearFieldError(fieldId);
    } else {
      this.originalController.clearFieldError(fieldId);
    }
  }

  /**
   * Старый API - устанавливает ошибку поля
   */
  setFieldError(fieldId: string, error: string): void {
    if (this.reactiveController) {
      this.reactiveController.setFieldError(fieldId, error);
    } else {
      this.originalController.setFieldError(fieldId, error);
    }
  }

  /**
   * Генерирует правила валидации из зарегистрированных полей
   */
  private generateRulesFromRegistered(): ValidationRuleMap {
    const rules: ValidationRuleMap = {};

    for (const [fieldId, config] of this.fieldConfigs) {
      rules[fieldId] = config.rules;
    }

    return rules;
  }

  /**
   * Возвращает статическое состояние для реактивного контроллера
   */
  private getStaticState(): Map<string, string> {
    return this.staticState;
  }

  /**
   * Проверяет, используется ли реактивный режим
   */
  isReactiveMode(): boolean {
    return !!this.reactiveController;
  }

  /**
   * Получает количество зарегистрированных полей
   */
  getFieldsCount(): number {
    return this.fieldConfigs.size;
  }

  /**
   * Получает все зарегистрированные ID полей
   */
  getRegisteredFieldIds(): string[] {
    return Array.from(this.fieldConfigs.keys());
  }
}
