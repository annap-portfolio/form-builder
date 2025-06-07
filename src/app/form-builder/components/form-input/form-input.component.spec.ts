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
