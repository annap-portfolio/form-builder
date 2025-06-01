export interface ValidatorConfig {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message?: string;
}

export interface Field {
  id: string;
  type: InputType;
  label: string;
  validators: ValidatorConfig[];
  placeholder?: string;
  options?: string[];
  value?: any;
}

export interface Group {
  type: InputType.GROUP;
  id: string;
  label: string;
  children: Field[];
}

export type FormElement = Field | Group;

export interface FormModel {
  fields: FormElement[];
}

export enum InputType {
  GROUP = 'group',
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  EMAIL = 'email',
  PASSWORD = 'password',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
}
