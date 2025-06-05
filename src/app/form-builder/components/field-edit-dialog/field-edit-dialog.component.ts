import { Component, Input, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Field } from '@models/field.model';
import { FormElement } from '@models/form-definition.model';
import { InputType } from '@models/input-type.model';
import { ValidatorDefinition, ValidatorType } from '@models/validator-definition.model';
import { isField, isGroup } from '@utils/form-element';
import clone from 'clone';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

interface ValidatorOption {
  name: ValidatorType;
  label: string;
  checked: boolean;
  value?: number;
  hasValueInput: boolean;
  applicableTypes: InputType[];
}

@Component({
  selector: 'app-field-edit-dialog',
  imports: [
    DialogModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    FontAwesomeModule,
    CheckboxModule,
    InputNumberModule,
  ],
  templateUrl: './field-edit-dialog.component.html',
  styleUrl: './field-edit-dialog.component.scss',
})
export class FieldEditDialogComponent implements OnInit {
  // Inputs & Outputs
  element = input.required<FormElement>();
  @Input() isVisible = false;
  close = output<void>();
  update = output<FormElement>();

  // Form data
  label = '';
  validators: ValidatorDefinition[] = [];

  // Validator configuration
  readonly validatorOptions: ValidatorOption[] = [
    {
      name: ValidatorType.REQUIRED,
      label: 'Required',
      checked: false,
      hasValueInput: false,
      applicableTypes: [
        InputType.TEXT,
        InputType.TEXTAREA,
        InputType.EMAIL,
        InputType.PASSWORD,
        InputType.NUMBER,
        InputType.DATE,
        InputType.CHECKBOX,
        InputType.RADIO,
      ],
    },
    {
      name: ValidatorType.MIN_LENGTH,
      label: 'Minimum length',
      checked: false,
      value: 1,
      hasValueInput: true,
      applicableTypes: [InputType.TEXT, InputType.TEXTAREA, InputType.EMAIL, InputType.PASSWORD],
    },
    {
      name: ValidatorType.MAX_LENGTH,
      label: 'Maximum length',
      checked: false,
      value: 100,
      hasValueInput: true,
      applicableTypes: [InputType.TEXT, InputType.TEXTAREA, InputType.EMAIL, InputType.PASSWORD],
    },
    {
      name: ValidatorType.MIN,
      label: 'Minimum value',
      checked: false,
      value: 0,
      hasValueInput: true,
      applicableTypes: [InputType.NUMBER, InputType.DATE],
    },
    {
      name: ValidatorType.MAX,
      label: 'Maximum value',
      checked: false,
      value: 100,
      hasValueInput: true,
      applicableTypes: [InputType.NUMBER, InputType.DATE],
    },
  ];

  // Utility functions (exported for template)
  readonly isGroup = isGroup;
  readonly isField = isField;

  ngOnInit(): void {
    this.initializeFormData();
    this.loadExistingValidators();
  }

  /**
   * Gets validators that are applicable to the current element type
   */
  getApplicableValidators(): ValidatorOption[] {
    if (!this.isField(this.element())) return [];

    const elementType = this.element().type;
    return this.validatorOptions.filter((validator) => validator.applicableTypes.includes(elementType));
  }

  /**
   * Handles validator checkbox changes
   */
  onValidatorToggle(validator: ValidatorOption): void {
    this.updateValidatorInArray(validator);

    if (!validator.checked) {
      this.resetValidatorValue(validator);
    }

    this.enforceConstraints();
  }

  /**
   * Handles changes to validator values (min/max length/value inputs)
   */
  onValidatorValueChange(validator: ValidatorOption): void {
    this.enforceConstraints();
    this.updateValidatorValueInArray(validator);
  }

  /**
   * Saves the form element with updated data
   */
  onSave(): void {
    const updatedElement = this.createUpdatedElement();
    this.update.emit(updatedElement);
    this.close.emit();
  }

  /**
   * Handles dialog close
   */
  onHide(): void {
    this.close.emit();
  }

  // Private helper methods

  private initializeFormData(): void {
    this.label = this.element().label ?? '';
    this.validators = this.isField(this.element()) ? [...(this.element() as Field).validators] : [];
  }

  private loadExistingValidators(): void {
    if (!this.isField(this.element())) return;

    const existingValidators = (this.element() as Field).validators;

    existingValidators.forEach((validator) => {
      const option = this.findValidatorOption(validator.type as ValidatorType);
      if (option) {
        option.checked = true;
        if (validator.value !== undefined) {
          option.value = validator.value;
        }
      }
    });
  }

  private findValidatorOption(type: ValidatorType): ValidatorOption | undefined {
    return this.validatorOptions.find((option) => option.name === type);
  }

  private updateValidatorInArray(validator: ValidatorOption): void {
    // Remove existing validator of this type
    this.validators = this.validators.filter((v) => v.type !== validator.name);

    // Add new validator if checked
    if (validator.checked) {
      const validatorDefinition: ValidatorDefinition = {
        type: validator.name,
        ...(validator.hasValueInput && validator.value !== undefined && { value: validator.value }),
      };

      this.validators.push(validatorDefinition);
    }
  }

  private updateValidatorValueInArray(validator: ValidatorOption): void {
    const existingValidator = this.validators.find((v) => v.type === validator.name);
    if (existingValidator && validator.value !== undefined) {
      existingValidator.value = validator.value;
    }
  }

  private resetValidatorValue(validator: ValidatorOption): void {
    if (!validator.hasValueInput) return;

    const defaultValues: Record<ValidatorType, number> = {
      required: 0,
      minLength: 1,
      maxLength: 100,
      min: 0,
      max: 100,
    };

    validator.value = defaultValues[validator.name];
  }

  private enforceConstraints(): void {
    this.enforceMinMaxLengthConstraints();
    this.enforceMinMaxValueConstraints();
  }

  private enforceMinMaxLengthConstraints(): void {
    const minValidator = this.findValidatorOption(ValidatorType.MIN_LENGTH);
    const maxValidator = this.findValidatorOption(ValidatorType.MAX_LENGTH);

    if (!minValidator?.checked || !maxValidator?.checked) return;

    const minValue = minValidator.value ?? 0;
    const maxValue = maxValidator.value ?? 0;

    if (minValue > maxValue) {
      maxValidator.value = minValue;
      this.updateValidatorValueInArray(maxValidator);
    }
  }

  private enforceMinMaxValueConstraints(): void {
    const minValidator = this.findValidatorOption(ValidatorType.MIN);
    const maxValidator = this.findValidatorOption(ValidatorType.MAX);

    if (!minValidator?.checked || !maxValidator?.checked) return;

    const minValue = minValidator.value ?? 0;
    const maxValue = maxValidator.value ?? 0;

    if (minValue > maxValue) {
      maxValidator.value = minValue;
      this.updateValidatorValueInArray(maxValidator);
    }
  }

  private createUpdatedElement(): FormElement {
    const clonedElement = clone(this.element());
    clonedElement.label = this.label;

    if (this.isField(clonedElement)) {
      (clonedElement as Field).validators = [...this.validators];
    }

    return clonedElement;
  }
}
