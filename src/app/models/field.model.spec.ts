import { Field } from './field.model';
import { InputType } from './input-type.model';
import { ValidatorConfig } from './form-definition.model';

describe('Field', () => {
  let validator: ValidatorConfig;

  beforeEach(() => {
    validator = { type: 'required', message: 'This field is required' };
  });

  it('should create a field with given values', () => {
    const field = new Field(InputType.TEXT, 'Custom Label', [validator], ['Option1'], 'Test Value');

    expect(field.type).toBe(InputType.TEXT);
    expect(field.label).toBe('Custom Label');
    expect(field.validators.length).toBe(1);
    expect(field.validators[0]).toEqual(validator);
    expect(field.options).toEqual(['Option1']);
    expect(field.value).toBe('Test Value');
    expect(field.id).toBeDefined();
  });

  it('should assign default label when none is provided', () => {
    const field = new Field(InputType.EMAIL);
    expect(field.label).toBe('Email Field');
  });

  it('should use the given ID if provided', () => {
    const field = new Field(InputType.TEXT, undefined, [], undefined, undefined, 'custom-id');
    expect(field.id).toBe('custom-id');
  });

  it('should clone the field with identical properties by default', () => {
    const field = new Field(InputType.TEXT, 'Original', [validator], ['A', 'B'], 'Value', 'original-id');
    const cloned = field.clone();

    expect(cloned).not.toBe(field); // different reference
    expect(cloned.type).toBe(field.type);
    expect(cloned.label).toBe(field.label);
    expect(cloned.id).toBe(field.id);
    expect(cloned.validators).toEqual(field.validators);
    expect(cloned.options).toEqual(field.options);
    expect(cloned.value).toBe(field.value);
  });

  it('should allow overriding properties in clone()', () => {
    const field = new Field(InputType.TEXT, 'Label', [validator], ['One'], 'Initial', 'original-id');

    const overridden = field.clone({
      label: 'New Label',
      value: 'New Value',
      id: 'new-id',
    });

    expect(overridden.label).toBe('New Label');
    expect(overridden.value).toBe('New Value');
    expect(overridden.id).toBe('new-id');
    expect(overridden.type).toBe(field.type); // unchanged
  });

  it('defaultLabelFor should capitalise and return label for known types', () => {
    expect(Field.defaultLabelFor(InputType.TEXT)).toBe('Text Field');
    expect(Field.defaultLabelFor(InputType.CHECKBOX)).toBe('Checkbox Field');
  });
});
