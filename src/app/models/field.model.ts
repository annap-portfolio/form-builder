import { InputType } from './input-type.model';
import { ValidatorDefinition } from './validator-definition.model';
import { FormElement } from './form-definition.model';

export interface FieldConfig {
  id?: string;
  type: InputType;
  label?: string;
  validators?: ValidatorDefinition[];
  options?: string[];
  value?: any;
}

export interface FieldValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FieldOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export class Field {
  readonly id: string;
  readonly type: InputType;

  private _label: string;
  private _validators: ValidatorDefinition[];
  private _options?: FieldOption[];
  private _value?: any;

  constructor(config: FieldConfig) {
    // New config-based constructor
    this.id = config.id || crypto.randomUUID();
    this.type = config.type;
    this._label = config.label || Field.getDefaultLabel(config.type);
    this._validators = [...(config.validators || [])];
    this._options = config.options ? this.normalizeOptions(config.options) : undefined;
    this._value = config.value;
  }

  // Getters
  get label(): string {
    return this._label;
  }
  get validators(): ValidatorDefinition[] {
    return [...this._validators];
  }
  get options(): FieldOption[] | undefined {
    return this._options ? [...this._options] : undefined;
  }
  get value(): any {
    return this._value;
  }

  // Setters with validation
  set label(value: string) {
    if (!value || !value.trim()) {
      throw new Error('Label cannot be empty');
    }
    this._label = value.trim();
  }

  set value(value: any) {
    this._value = value;
  }

  set validators(value: ValidatorDefinition[]) {
    this._validators = value;
  }

  set options(value: FieldOption[]) {
    this._options = value;
  }

  /**
   * Adds a validator to the field
   */
  addValidator(validator: ValidatorDefinition): void {
    if (this.hasValidator(validator.type)) {
      throw new Error(`Validator '${validator.type}' already exists`);
    }
    this._validators.push({ ...validator });
  }

  /**
   * Removes a validator by type
   */
  removeValidator(type: string): boolean {
    const initialLength = this._validators.length;
    this._validators = this._validators.filter((v) => v.type !== type);
    return this._validators.length < initialLength;
  }

  /**
   * Updates an existing validator
   */
  updateValidator(type: string, updates: Partial<ValidatorDefinition>): boolean {
    const validator = this._validators.find((v) => v.type === type);
    if (!validator) return false;

    Object.assign(validator, updates);
    return true;
  }

  /**
   * Checks if a validator exists
   */
  hasValidator(type: string): boolean {
    return this._validators.some((v) => v.type === type);
  }

  /**
   * Clears all validators
   */
  clearValidators(): void {
    this._validators = [];
  }

  /**
   * Adds an option (for select, radio, checkbox fields)
   */
  addOption(option: string | FieldOption): void {
    if (!this.supportsOptions()) {
      throw new Error(`Field type '${this.type}' does not support options`);
    }

    if (!this._options) {
      this._options = [];
    }

    const normalizedOption = typeof option === 'string' ? { label: option, value: option } : { ...option };

    if (this._options.some((opt) => opt.value === normalizedOption.value)) {
      throw new Error(`Option with value '${normalizedOption.value}' already exists`);
    }

    this._options.push(normalizedOption);
  }

  /**
   * Removes an option by value
   */
  removeOption(value: any): boolean {
    if (!this._options) return false;

    const initialLength = this._options.length;
    this._options = this._options.filter((opt) => opt.value !== value);
    return this._options.length < initialLength;
  }

  /**
   * Updates an existing option
   */
  updateOption(value: any, updates: Partial<FieldOption>): boolean {
    if (!this._options) return false;

    const option = this._options.find((opt) => opt.value === value);
    if (!option) return false;

    Object.assign(option, updates);
    return true;
  }

  /**
   * Clears all options
   */
  clearOptions(): void {
    this._options = undefined;
  }

  /**
   * Checks if field supports options
   */
  supportsOptions(): boolean {
    return [InputType.RADIO, InputType.CHECKBOX].includes(this.type);
  }

  /**
   * Validates the field configuration
   */
  validate(): FieldValidationResult {
    const errors: string[] = [];

    // Validate label
    if (!this._label.trim()) {
      errors.push('Field label cannot be empty');
    }

    // Validate options if field supports them
    if (this.supportsOptions() && this._options) {
      const values = new Set();
      this._options.forEach((option, index) => {
        if (!option.label.trim()) {
          errors.push(`Option at index ${index} has empty label`);
        }
        if (values.has(option.value)) {
          errors.push(`Duplicate option value: ${option.value}`);
        }
        values.add(option.value);
      });
    }

    // Validate validators
    const validatorTypes = new Set();
    this._validators.forEach((validator, index) => {
      if (!validator.type.trim()) {
        errors.push(`Validator at index ${index} has empty type`);
      }
      if (validatorTypes.has(validator.type)) {
        errors.push(`Duplicate validator type: ${validator.type}`);
      }
      validatorTypes.add(validator.type);
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Converts to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      type: this.type,
      label: this._label,
      validators: this._validators,
      options: this._options,
      value: this._value,
    };
  }
  /**
   * Creates a Field from JSON data
   */
  static fromJSON(data: any): Field {
    return new Field({
      id: data.id,
      type: data.type,
      label: data.label,
      validators: data.validators || [],
      options: data.options || undefined,
    });
  }

  /**
   * Gets the default label for a field type
   */
  static getDefaultLabel(type: InputType): string {
    const typeLabels: Record<InputType, string> = {
      [InputType.TEXT]: 'Text Field',
      [InputType.PASSWORD]: 'Password Field',
      [InputType.NUMBER]: 'Number Field',
      [InputType.DATE]: 'Date Field',
      [InputType.TEXTAREA]: 'Text Area',
      [InputType.RADIO]: 'Radio Field',
      [InputType.CHECKBOX]: 'Checkbox Field',
      [InputType.GROUP]: 'Group',
    };

    return typeLabels[type] || 'Unknown Field';
  }

  private normalizeOptions(options: string[] | FieldOption[]): FieldOption[] {
    return options.map((option) => (typeof option === 'string' ? { label: option, value: option } : { ...option }));
  }
}
