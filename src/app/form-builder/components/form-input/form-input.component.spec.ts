import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Field } from '@models/field.model';
import { InputType } from '@models/input-type.model';
import { FormInputComponent } from './form-input.component';

describe('FormInputComponent', () => {
  let component: FormInputComponent;
  let fixture: ComponentFixture<FormInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormInputComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputComponent);
    component = fixture.componentInstance;

    // Mock inputs
    fixture.componentRef.setInput('field', new Field({ id: 'field1', type: InputType.TEXT }));
    component.formGroup = new FormGroup({
      field1: new FormControl('', [Validators.required]),
    });

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should return the correct form control from control getter', () => {
    const control = component.control;
    expect(control).toBeTruthy();
    expect(control?.value).toBe('');
  });

  describe('showError', () => {
    it('should return false when control is valid and untouched', () => {
      const control = component.control!;
      control.setValue('valid value');
      control.markAsUntouched();
      fixture.detectChanges();

      expect(component.showError()).toBeFalse();
    });

    it('should return false when control is invalid but untouched and not dirty', () => {
      const control = component.control!;
      control.setValue('');
      control.markAsUntouched();
      control.markAsPristine();
      fixture.detectChanges();

      expect(component.showError()).toBeFalse();
    });

    it('should return true when control is invalid and touched', () => {
      const control = component.control!;
      control.setValue('');
      control.markAsTouched();
      fixture.detectChanges();

      expect(component.showError()).toBeTrue();
    });

    it('should return true when control is invalid and dirty', () => {
      const control = component.control!;
      control.setValue('');
      control.markAsDirty();
      fixture.detectChanges();

      expect(component.showError()).toBeTrue();
    });
  });

  it('should have correct FontAwesome icon references', () => {
    expect(component.faPencil).toBeDefined();
    expect(component.faTrash).toBeDefined();
    expect(component.faGripVertical).toBeDefined();
    expect(component.faLinkSlash).toBeDefined();
  });

  it('should emit openEditDialog event when triggered', () => {
    spyOn(component.openEditDialog, 'emit');
    component.openEditDialog.emit();
    expect(component.openEditDialog.emit).toHaveBeenCalled();
  });

  it('should emit delete event when triggered', () => {
    spyOn(component.delete, 'emit');
    component.delete.emit();
    expect(component.delete.emit).toHaveBeenCalled();
  });

  it('should emit ungroup event when triggered', () => {
    spyOn(component.ungroup, 'emit');
    component.ungroup.emit();
    expect(component.ungroup.emit).toHaveBeenCalled();
  });
});
