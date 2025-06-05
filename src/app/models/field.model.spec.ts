import { Field, FieldConfig, FieldValidationResult, FieldOption } from './field.model';
import { InputType } from './input-type.model';
import { ValidatorDefinition, ValidatorType } from './validator-definition.model';

describe('Field', () => {
  let field: Field;
  let mockValidator: ValidatorDefinition;

  beforeEach(() => {
    mockValidator = {
      type: ValidatorType.REQUIRED,
    };

    const config: FieldConfig = {
      type: InputType.TEXT,
      label: 'Test Field',
    };
    field = new Field(config);
  });

  describe('Constructor', () => {
    it('should create field with config', () => {
      const config: FieldConfig = {
        id: 'custom-id',
        type: InputType.EMAIL,
        label: 'Email Field',
        validators: [mockValidator],
        value: 'test@example.com',
      };

      const customField = new Field(config);

      expect(customField.id).toBe('custom-id');
      expect(customField.type).toBe(InputType.EMAIL);
      expect(customField.label).toBe('Email Field');
      expect(customField.validators).toContain(mockValidator);
      expect(customField.value).toBe('test@example.com');
    });

    it('should generate UUID when no id provided', () => {
      const config: FieldConfig = {
        type: InputType.TEXT,
      };

      const autoIdField = new Field(config);

      expect(autoIdField.id).toBeDefined();
      expect(autoIdField.id.length).toBeGreaterThan(0);
    });

    it('should use default label when none provided', () => {
      const config: FieldConfig = {
        type: InputType.EMAIL,
      };

      const defaultLabelField = new Field(config);

      expect(defaultLabelField.label).toBe('Email Field');
    });

    it('should normalize string options to FieldOption objects', () => {
      const config: FieldConfig = {
        type: InputType.RADIO,
        options: ['Option 1', 'Option 2'],
      };

      const radioField = new Field(config);

      expect(radioField.options).toEqual([
        { label: 'Option 1', value: 'Option 1' },
        { label: 'Option 2', value: 'Option 2' },
      ]);
    });
  });

  describe('Getters and Setters', () => {
    it('should get and set label', () => {
      field.label = 'Updated Label';

      expect(field.label).toBe('Updated Label');
    });

    it('should throw error for empty label', () => {
      expect(() => {
        field.label = '';
      }).toThrow(new Error('Label cannot be empty'));

      expect(() => {
        field.label = '   ';
      }).toThrow(new Error('Label cannot be empty'));
    });

    it('should trim label when setting', () => {
      field.label = '  Trimmed Label  ';

      expect(field.label).toBe('Trimmed Label');
    });

    it('should get and set value', () => {
      field.value = 'test value';

      expect(field.value).toBe('test value');
    });

    it('should return readonly copies of validators and options', () => {
      const config: FieldConfig = {
        type: InputType.RADIO,
        validators: [mockValidator],
        options: ['Option 1'],
      };
      const radioField = new Field(config);

      const validators = radioField.validators;
      const options = radioField.options;

      expect(validators).not.toBe((radioField as any)._validators);
      expect(options).not.toBe((radioField as any)._options);
    });
  });

  describe('Validator Management', () => {
    it('should add validator', () => {
      field.addValidator(mockValidator);

      expect(field.validators).toContain(mockValidator);
      expect(field.hasValidator('required')).toBe(true);
    });

    it('should throw error when adding duplicate validator', () => {
      field.addValidator(mockValidator);

      expect(() => {
        field.addValidator(mockValidator);
      }).toThrow(new Error(`Validator 'required' already exists`));
    });

    it('should remove validator by type', () => {
      field.addValidator(mockValidator);

      const result = field.removeValidator('required');

      expect(result).toBe(true);
      expect(field.hasValidator('required')).toBe(false);
    });

    it('should return false when removing non-existent validator', () => {
      const result = field.removeValidator('non-existent');

      expect(result).toBe(false);
    });

    it('should clear all validators', () => {
      field.addValidator(mockValidator);
      field.clearValidators();

      expect(field.validators).toEqual([]);
    });
  });

  describe('Option Management', () => {
    let radioField: Field;

    beforeEach(() => {
      const config: FieldConfig = {
        type: InputType.RADIO,
        label: 'Radio Field',
      };
      radioField = new Field(config);
    });

    it('should add string option', () => {
      radioField.addOption('Option 1');

      expect(radioField.options).toEqual([{ label: 'Option 1', value: 'Option 1' }]);
    });

    it('should add FieldOption object', () => {
      const option: FieldOption = {
        label: 'Custom Option',
        value: 'custom_value',
        disabled: true,
      };

      radioField.addOption(option);

      expect(radioField.options).toContain(option);
    });

    it('should throw error when adding option to unsupported field type', () => {
      expect(() => {
        field.addOption('Option 1');
      }).toThrow(new Error(`Field type '${InputType.TEXT}' does not support options`));
    });

    it('should throw error when adding duplicate option', () => {
      radioField.addOption('Option 1');

      expect(() => {
        radioField.addOption('Option 1');
      }).toThrow(new Error(`Option with value 'Option 1' already exists`));
    });

    it('should remove option by value', () => {
      radioField.addOption('Option 1');
      radioField.addOption('Option 2');

      const result = radioField.removeOption('Option 1');

      expect(result).toBe(true);
      expect(radioField.options?.length).toBe(1);
      expect(radioField.options?.[0].value).toBe('Option 2');
    });

    it('should return false when removing non-existent option', () => {
      const result = radioField.removeOption('non-existent');

      expect(result).toBe(false);
    });

    it('should update existing option', () => {
      radioField.addOption('Option 1');

      const result = radioField.updateOption('Option 1', {
        label: 'Updated Option',
        disabled: true,
      });

      expect(result).toBe(true);
      const option = radioField.options?.find((opt) => opt.value === 'Option 1');
      expect(option?.label).toBe('Updated Option');
      expect(option?.disabled).toBe(true);
    });

    it('should return false when updating non-existent option', () => {
      const result = radioField.updateOption('non-existent', { label: 'New Label' });

      expect(result).toBe(false);
    });

    it('should clear all options', () => {
      radioField.addOption('Option 1');
      radioField.clearOptions();

      expect(radioField.options).toBeUndefined();
    });

    it('should check if field supports options', () => {
      expect(radioField.supportsOptions()).toBe(true);
      expect(field.supportsOptions()).toBe(false);

      const checkboxField = new Field({ type: InputType.CHECKBOX });
      expect(checkboxField.supportsOptions()).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate valid field', () => {
      const result = field.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should catch empty label', () => {
      (field as any)._label = '';

      const result = field.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field label cannot be empty');
    });

    // it('should validate options for fields that support them', () => {
    //   const radioField = new Field({
    //     type: InputType.RADIO,
    //     options: [
    //       { label: '', value: 'empty_label' },
    //       { label: 'Option 1', value: 'duplicate' },
    //       { label: 'Option 2', value: 'duplicate' }
    //     ]
    //   });

    //   const result = radioField.validate();

    //   expect(result.valid).toBe(false);
    //   expect(result.errors).toContain('Option at index 0 has empty label');
    //   expect(result.errors).toContain('Duplicate option value: duplicate');
    // });

    // it('should validate validators', () => {
    //   const invalidValidators: ValidatorDefinition[] = [
    //     { type: '', message: 'Empty type' },
    //     { type: 'required', message: 'First required' },
    //     { type: 'required', message: 'Duplicate required' }
    //   ];

    //   field.validators = invalidValidators;

    //   const result = field.validate();

    //   expect(result.valid).toBe(false);
    //   expect(result.errors).toContain('Validator at index 0 has empty type');
    //   expect(result.errors).toContain('Duplicate validator type: required');
    // });
  });

  describe('JSON Serialization', () => {
    it('should convert to JSON', () => {
      field.addValidator(mockValidator);
      field.value = 'test value';

      const json = field.toJSON();

      expect(json['id']).toBe(field.id);
      expect(json['type']).toBe(field.type);
      expect(json['label']).toBe(field.label);
      expect(json['validators']).toEqual(field.validators);
      expect(json['value']).toBe('test value');
    });

    it('should create field from JSON', () => {
      const jsonData = {
        id: 'json-field',
        type: InputType.EMAIL,
        label: 'JSON Field',
        validators: [mockValidator],
        options: [{ label: 'Option 1', value: 'option1' }],
      };

      const fromJsonField = Field.fromJSON(jsonData);

      expect(fromJsonField.id).toBe('json-field');
      expect(fromJsonField.type).toBe(InputType.EMAIL);
      expect(fromJsonField.label).toBe('JSON Field');
      expect(fromJsonField.validators).toEqual([mockValidator]);
    });

    it('should handle missing properties in JSON', () => {
      const minimalData = {
        type: InputType.TEXT,
      };

      const fromJsonField = Field.fromJSON(minimalData);

      expect(fromJsonField.validators).toEqual([]);
      expect(fromJsonField.options).toBeUndefined();
    });
  });
});
