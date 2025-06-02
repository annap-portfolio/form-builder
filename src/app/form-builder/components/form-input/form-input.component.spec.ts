import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Field } from '@models/field.model';
import { InputType } from '@models/input-type.model';
import { FormInputComponent } from './form-input.component';

describe('FormInputComponent', () => {
  let component: FormInputComponent;
  let fixture: ComponentFixture<FormInputComponent>;
  let formGroup: FormGroup;
  let field: Field;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormInputComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputComponent);
    component = fixture.componentInstance;

    // Create a sample Field and FormGroup with control
    field = new Field(InputType.TEXT, 'Test Label');
    formGroup = new FormGroup({
      [field.id]: new FormControl('', Validators.required),
    });

    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('isInGroup', false);
    component.formGroup = formGroup;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return form control matching field id', () => {
    expect(component.control).toBe(formGroup.get(field.id));
  });

  it('should return false from showError if control is valid', () => {
    formGroup.get(field.id)?.setValue('valid value');
    formGroup.get(field.id)?.markAsTouched();
    fixture.detectChanges();

    expect(component.showError()).toBeFalse();
  });

  it('should return true from showError if control is invalid and touched', () => {
    formGroup.get(field.id)?.setValue('');
    formGroup.get(field.id)?.markAsTouched();
    fixture.detectChanges();

    expect(component.showError()).toBeTrue();
  });

  it('should return true from showError if control is invalid and dirty', () => {
    formGroup.get(field.id)?.setValue('');
    formGroup.get(field.id)?.markAsDirty();
    fixture.detectChanges();

    expect(component.showError()).toBeTrue();
  });

  it('should return false from showError if control is invalid but not touched or dirty', () => {
    formGroup.get(field.id)?.setValue('');
    // neither touched nor dirty
    fixture.detectChanges();

    expect(component.showError()).toBeFalse();
  });

  // Test that output events exist and are EventEmitters (basic check)
  it('should have output event emitters', () => {
    expect(component.openEditDialog).toBeDefined();
    expect(component.delete).toBeDefined();
    expect(component.ungroup).toBeDefined();
  });
});
