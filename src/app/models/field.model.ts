import { ValidatorConfig } from './form-definition.model';
import { InputType } from './input-type.model';

export class Field {
  public id: string;
  type: InputType;
  label: string;
  validators: ValidatorConfig[];
  options?: string[];
  value?: any;

  constructor(
    type: InputType,
    label?: string,
    validators: ValidatorConfig[] = [],
    options?: string[],
    value?: any,
    id?: string,
  ) {
    this.id = id ?? crypto.randomUUID();
    this.type = type;
    this.label = label ?? Field.defaultLabelFor(type);
    this.validators = validators;
    this.options = options;
    this.value = value;
  }

  clone(overrides: Partial<Field> = {}): Field {
    return new Field(
      overrides.type ?? this.type,
      overrides.label ?? this.label,
      overrides.validators ?? [...this.validators],
      overrides.options ?? (this.options ? [...this.options] : undefined),
      overrides.value ?? this.value,
      overrides.id ?? this.id,
    );
  }

  static defaultLabelFor(type: InputType): string {
    const name = type.charAt(0).toUpperCase() + type.slice(1);
    return `${name} Field`;
  }
}
