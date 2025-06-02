import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Field } from '@models/field.model';
import { InputType } from '@models/input-type.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FieldEditDialogComponent } from './field-edit-dialog.component';

describe('FieldEditDialogComponent', () => {
  let component: FieldEditDialogComponent;
  let fixture: ComponentFixture<FieldEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, DialogModule, InputTextModule, ButtonModule, FieldEditDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldEditDialogComponent);
    component = fixture.componentInstance;

    // Mock input element function - returns a Field object
    fixture.componentRef.setInput('element', new Field(InputType.TEXT, 'Initial Label'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise label on ngOnInit from element', () => {
    component.ngOnInit();
    expect(component.label).toBe('Initial Label');
  });

  it('should emit update and close events on onSave', () => {
    spyOn(component.update, 'emit');
    spyOn(component.close, 'emit');

    component.label = 'Updated Label';
    component.onSave();

    expect(component.update.emit).toHaveBeenCalledWith(jasmine.objectContaining({ label: 'Updated Label' }));
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should not emit update if element returns null', () => {
    fixture.componentRef.setInput('element', null);
    fixture.detectChanges();
    spyOn(component.update, 'emit');
    spyOn(component.close, 'emit');

    component.onSave();

    expect(component.update.emit).not.toHaveBeenCalled();
    expect(component.close.emit).not.toHaveBeenCalled();
  });

  it('should emit close event on onHide', () => {
    spyOn(component.close, 'emit');
    component.onHide();
    expect(component.close.emit).toHaveBeenCalled();
  });
});
