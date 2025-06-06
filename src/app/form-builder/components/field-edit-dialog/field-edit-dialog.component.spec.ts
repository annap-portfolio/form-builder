import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Field } from '@models/field.model';
import { Group } from '@models/group.model';
import { InputType } from '@models/input-type.model';
import { ValidatorDefinition, ValidatorType } from '@models/validator-definition.model';
import { isField, isGroup } from '@utils/form-element';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { FieldEditDialogComponent } from './field-edit-dialog.component';

describe('FieldEditDialogComponent', () => {
  let component: FieldEditDialogComponent;
  let fixture: ComponentFixture<FieldEditDialogComponent>;

  // Mock data
  let mockField: Field;
  let mockGroup: Group;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FieldEditDialogComponent,
        DialogModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        FontAwesomeModule,
        CheckboxModule,
        InputNumberModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FieldEditDialogComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    mockField = new Field({
      id: 'test-field',
      label: 'Test Field',
      type: InputType.TEXT,
      validators: [{ type: ValidatorType.REQUIRED }, { type: ValidatorType.MIN_LENGTH, value: 5 }],
    });

    mockGroup = new Group({
      id: 'test-group',
      label: 'Test Group',
      children: [],
    });
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize validator options correctly', () => {
      expect(component.validatorOptions.length).toBe(5);
      expect(component.validatorOptions[0].name).toBe(ValidatorType.REQUIRED);
      expect(component.validatorOptions[1].name).toBe(ValidatorType.MIN_LENGTH);
      expect(component.validatorOptions[2].name).toBe(ValidatorType.MAX_LENGTH);
      expect(component.validatorOptions[3].name).toBe(ValidatorType.MIN);
      expect(component.validatorOptions[4].name).toBe(ValidatorType.MAX);
    });

    it('should have correct default values for validator options', () => {
      const minLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MIN_LENGTH);
      const maxLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MAX_LENGTH);

      expect(minLengthValidator?.value).toBe(1);
      expect(maxLengthValidator?.value).toBe(100);
      expect(minLengthValidator?.hasValueInput).toBe(true);
      expect(maxLengthValidator?.hasValueInput).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should initialize form data for a field element', () => {
      fixture.componentRef.setInput('element', mockField);

      component.ngOnInit();

      expect(component.label).toBe('Test Field');
      expect(component.validators.length).toBe(2);
    });

    it('should initialize form data for a group element', () => {
      fixture.componentRef.setInput('element', mockGroup);

      component.ngOnInit();

      expect(component.label).toBe('Test Group');
      expect(component.validators.length).toBe(0);
    });

    it('should load existing validators correctly', () => {
      fixture.componentRef.setInput('element', mockField);

      component.ngOnInit();

      const requiredValidator = component.validatorOptions.find((v) => v.name === ValidatorType.REQUIRED);
      const minLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MIN_LENGTH);

      expect(requiredValidator?.checked).toBe(true);
      expect(minLengthValidator?.checked).toBe(true);
      expect(minLengthValidator?.value).toBe(5);
    });

    it('should handle field with no label', () => {
      const fieldWithoutLabel = { ...mockField, label: undefined };
      fixture.componentRef.setInput('element', fieldWithoutLabel);

      component.ngOnInit();

      expect(component.label).toBe('');
    });
  });

  describe('getApplicableValidators', () => {
    it('should return applicable validators for TEXT input type', () => {
      const textField = new Field({ type: InputType.TEXT });
      fixture.componentRef.setInput('element', textField);

      const applicableValidators = component.getApplicableValidators();

      expect(applicableValidators.length).toBe(3); // REQUIRED, MIN_LENGTH, MAX_LENGTH
      expect(applicableValidators.some((v) => v.name === ValidatorType.REQUIRED)).toBe(true);
      expect(applicableValidators.some((v) => v.name === ValidatorType.MIN_LENGTH)).toBe(true);
      expect(applicableValidators.some((v) => v.name === ValidatorType.MAX_LENGTH)).toBe(true);
    });

    it('should return applicable validators for NUMBER input type', () => {
      const numberField = new Field({ type: InputType.NUMBER });
      fixture.componentRef.setInput('element', numberField);

      component.ngOnInit();

      const applicableValidators = component.getApplicableValidators();

      expect(applicableValidators.length).toBe(3); // REQUIRED, MIN, MAX
      expect(applicableValidators.some((v) => v.name === ValidatorType.REQUIRED)).toBe(true);
      expect(applicableValidators.some((v) => v.name === ValidatorType.MIN)).toBe(true);
      expect(applicableValidators.some((v) => v.name === ValidatorType.MAX)).toBe(true);
    });

    it('should return empty array for non-field elements', () => {
      fixture.componentRef.setInput('element', mockGroup);

      const applicableValidators = component.getApplicableValidators();

      expect(applicableValidators.length).toBe(0);
    });
  });

  describe('shouldShowLengthValidators', () => {
    it('should return true for text input types', () => {
      const textField = new Field({ type: InputType.TEXT });
      fixture.componentRef.setInput('element', textField);

      component.ngOnInit();

      expect(component.getApplicableValidators().length).toBe(3);
    });

    it('should return false for number input type', () => {
      const numberField = { ...mockField, type: InputType.NUMBER };
      fixture.componentRef.setInput('element', numberField);

      component.ngOnInit();

      expect(component.getApplicableValidators().length).toBe(0);
    });

    it('should return false for group elements', () => {
      fixture.componentRef.setInput('element', mockGroup);

      expect(component.getApplicableValidators().length).toBe(0);
    });
  });

  describe('onValidatorToggle', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('element', mockField);
      component.ngOnInit();
    });

    it('should add validator when toggled on', () => {
      const maxLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MAX_LENGTH)!;
      maxLengthValidator.checked = true;

      component.onValidatorToggle(maxLengthValidator);

      expect(component.validators.some((v) => v.type === ValidatorType.MAX_LENGTH)).toBe(true);
    });

    it('should remove validator when toggled off', () => {
      const requiredValidator = component.validatorOptions.find((v) => v.name === ValidatorType.REQUIRED)!;
      requiredValidator.checked = false;

      component.onValidatorToggle(requiredValidator);

      expect(component.validators.some((v) => v.type === ValidatorType.REQUIRED)).toBe(false);
    });

    it('should reset validator value when toggled off', () => {
      const minLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MIN_LENGTH)!;
      minLengthValidator.value = 10;
      minLengthValidator.checked = false;

      component.onValidatorToggle(minLengthValidator);

      expect(minLengthValidator.value).toBe(1); // Default value
    });

    it('should include value for validators with value input', () => {
      const maxValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MAX)!;
      maxValidator.checked = true;
      maxValidator.value = 50;

      component.onValidatorToggle(maxValidator);

      const addedValidator = component.validators.find((v) => v.type === ValidatorType.MAX);
      expect(addedValidator?.value).toBe(50);
    });

    it('should enforce constraints after toggling', () => {
      const minLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MIN_LENGTH)!;
      const maxLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MAX_LENGTH)!;

      minLengthValidator.checked = true;
      minLengthValidator.value = 50;
      maxLengthValidator.checked = true;
      maxLengthValidator.value = 10;

      component.onValidatorToggle(minLengthValidator);

      expect(maxLengthValidator.value).toBe(50); // Should be adjusted to match min
    });
  });

  describe('onValidatorValueChange', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('element', mockField);
      component.ngOnInit();
    });

    it('should update validator value in array', () => {
      const minLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MIN_LENGTH)!;
      minLengthValidator.value = 10;

      component.onValidatorValueChange(minLengthValidator);

      const existingValidator = component.validators.find((v) => v.type === ValidatorType.MIN_LENGTH);
      expect(existingValidator?.value).toBe(10);
    });

    it('should enforce constraints when value changes', () => {
      const minLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MIN_LENGTH)!;
      const maxLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MAX_LENGTH)!;

      // Set up both validators as checked
      minLengthValidator.checked = true;
      maxLengthValidator.checked = true;
      component.onValidatorToggle(minLengthValidator);
      component.onValidatorToggle(maxLengthValidator);

      // Change min to be greater than max
      minLengthValidator.value = 150;
      component.onValidatorValueChange(minLengthValidator);

      expect(maxLengthValidator.value).toBe(150); // Should be adjusted
    });
  });

  describe('onSave', () => {
    it('should emit update and close events', () => {
      fixture.componentRef.setInput('element', mockField);
      component.ngOnInit();
      component.label = 'Updated Label';

      spyOn(component.update, 'emit');
      spyOn(component.close, 'emit');

      component.onSave();

      expect(component.update.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          label: 'Updated Label',
        }),
      );
      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should create updated element with new validators', () => {
      fixture.componentRef.setInput('element', mockField);
      component.ngOnInit();

      // Add a new validator
      const maxLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MAX_LENGTH)!;
      maxLengthValidator.checked = true;
      component.onValidatorToggle(maxLengthValidator);

      spyOn(component.update, 'emit');

      component.onSave();

      const emittedElement = (component.update.emit as jasmine.Spy).calls.argsFor(0)[0];
      expect(emittedElement.validators).toContain(
        jasmine.objectContaining({
          type: ValidatorType.MAX_LENGTH,
        }),
      );
    });
  });

  describe('onHide', () => {
    it('should emit close event', () => {
      spyOn(component.close, 'emit');

      component.onHide();

      expect(component.close.emit).toHaveBeenCalled();
    });
  });

  describe('Constraint Enforcement', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('element', mockField);
      component.ngOnInit();
    });

    it('should enforce min/max length constraints', () => {
      const minLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MIN_LENGTH)!;
      const maxLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MAX_LENGTH)!;

      minLengthValidator.checked = true;
      maxLengthValidator.checked = true;
      minLengthValidator.value = 50;
      maxLengthValidator.value = 10;

      component.onValidatorToggle(minLengthValidator);
      component.onValidatorToggle(maxLengthValidator);

      expect(maxLengthValidator.value).toBe(50);
    });

    it('should enforce min/max value constraints', () => {
      const numberField = { ...mockField, type: InputType.NUMBER };
      fixture.componentRef.setInput('element', numberField);
      component.ngOnInit();

      const minValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MIN)!;
      const maxValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MAX)!;

      minValidator.checked = true;
      maxValidator.checked = true;
      minValidator.value = 80;
      maxValidator.value = 20;

      component.onValidatorToggle(minValidator);
      component.onValidatorToggle(maxValidator);

      expect(maxValidator.value).toBe(80);
    });

    it('should not enforce constraints when only one validator is checked', () => {
      const minLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MIN_LENGTH)!;
      const maxLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MAX_LENGTH)!;

      minLengthValidator.checked = true;
      maxLengthValidator.checked = false;
      minLengthValidator.value = 50;
      maxLengthValidator.value = 10;

      component.onValidatorToggle(minLengthValidator);

      expect(maxLengthValidator.value).toBe(10); // Should remain unchanged
    });
  });

  describe('Utility Functions', () => {
    it('should expose isField and isGroup functions', () => {
      expect(component.isField).toBe(isField);
      expect(component.isGroup).toBe(isGroup);
    });
  });

  describe('Private Helper Methods', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('element', mockField);
      component.ngOnInit();
    });

    it('should find validator option by type', () => {
      const requiredOption = (component as any).findValidatorOption(ValidatorType.REQUIRED);
      expect(requiredOption).toBeDefined();
      expect(requiredOption.name).toBe(ValidatorType.REQUIRED);
    });

    it('should return undefined for non-existent validator type', () => {
      const nonExistentOption = (component as any).findValidatorOption('NON_EXISTENT' as ValidatorType);
      expect(nonExistentOption).toBeUndefined();
    });

    it('should reset validator value to default', () => {
      const minLengthValidator = component.validatorOptions.find((v) => v.name === ValidatorType.MIN_LENGTH)!;
      minLengthValidator.value = 50;

      (component as any).resetValidatorValue(minLengthValidator);

      expect(minLengthValidator.value).toBe(1);
    });

    it('should not reset validator value for validators without value input', () => {
      const requiredValidator = component.validatorOptions.find((v) => v.name === ValidatorType.REQUIRED)!;
      const originalValue = requiredValidator.value;

      (component as any).resetValidatorValue(requiredValidator);

      expect(requiredValidator.value).toBe(originalValue);
    });

    it('should create updated element with cloned data', () => {
      component.label = 'New Label';
      const originalElement = component.element();

      const updatedElement = (component as any).createUpdatedElement();

      expect(updatedElement).not.toBe(originalElement); // Should be a clone
      expect(updatedElement.label).toBe('New Label');
    });
  });
});
