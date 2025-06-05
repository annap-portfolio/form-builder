export enum ValidatorType {
  REQUIRED = 'required',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  MIN = 'min',
  MAX = 'max',
}

export interface ValidatorDefinition {
  type: ValidatorType;
  value?: number;
}
