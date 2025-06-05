export type ValidatorType = 'required' | 'minLength' | 'maxLength' | 'min' | 'max';

export interface ValidatorDefinition {
  type: ValidatorType;
  value?: number;
}
