import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DragDropService } from '@core/services/drag-drop.service';
import { FormBuilderService } from '@core/services/form-builder.service';
import { Field } from '@models/field.model';
import { FormDefinition } from '@models/form-definition.model';
import { Group } from '@models/group.model';
import { InputType } from '@models/input-type.model';
import { FormBuilderComponent } from './form-builder.component';

describe('FormBuilderComponent', () => {
  let component: FormBuilderComponent;
  let fixture: ComponentFixture<FormBuilderComponent>;
  let formBuilderService: jasmine.SpyObj<FormBuilderService>;
  let dragDropService: jasmine.SpyObj<DragDropService>;

  beforeEach(async () => {
    const formBuilderSpy = jasmine.createSpyObj('FormBuilderService', ['buildForm']);
    const dragDropSpy = jasmine.createSpyObj('DragDropService', ['startDrag', 'dropField', 'dropDivider']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormBuilderComponent],
      providers: [
        { provide: FormBuilderService, useValue: formBuilderSpy },
        { provide: DragDropService, useValue: dragDropSpy },
      ],
    }).compileComponents();

    formBuilderService = TestBed.inject(FormBuilderService) as jasmine.SpyObj<FormBuilderService>;
    dragDropService = TestBed.inject(DragDropService) as jasmine.SpyObj<DragDropService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormBuilderComponent);
    component = fixture.componentInstance;

    formBuilderService.buildForm.and.returnValue(new FormGroup({}));

    const json = JSON.stringify(new FormDefinition());
    spyOn(localStorage, 'getItem').and.returnValue(json);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update screenWidth signal and isMobile computed on window resize', () => {
    spyOn(component['screenWidth'], 'set').and.callThrough();

    // Simulate window resize event
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
    expect(component['screenWidth'].set).toHaveBeenCalledWith(500);
    expect(component.isMobile()).toBeTrue();

    window.innerWidth = 1200;
    window.dispatchEvent(new Event('resize'));
    expect(component['screenWidth'].set).toHaveBeenCalledWith(1200);
    expect(component.isMobile()).toBeFalse();
  });

  it('should load formDefinition from localStorage on init', () => {
    formBuilderService.buildForm.and.returnValue(new FormGroup({}));
    fixture.detectChanges();

    expect(localStorage.getItem).toHaveBeenCalledWith('formBuilder');
    expect(formBuilderService.buildForm).toHaveBeenCalled();
    expect(component.form).toBeDefined();
  });

  it('should add new field and rebuild form on input selection', () => {
    formBuilderService.buildForm.and.returnValue(new FormGroup({}));
    fixture.detectChanges();

    const initialCount = component.formDefinition.children.length;

    component.onInputSelected(InputType.TEXT);

    expect(component.formDefinition.children.length).toBe(initialCount + 1);
    expect(formBuilderService.buildForm).toHaveBeenCalled();
  });

  it('should open edit dialog and set edited element', () => {
    const field = new Field(InputType.TEXT);
    component.onOpenFieldEditDialog(field);

    expect(component.isEditDialogVisible).toBeTrue();
    expect(component.editedElement()).toEqual(field);
  });

  it('should close edit dialog', () => {
    component.isEditDialogVisible = true;
    component.onClose();
    expect(component.isEditDialogVisible).toBeFalse();
  });

  it('should delete a top-level field and remove control', () => {
    const field = new Field(InputType.TEXT);
    component.formDefinition.addChild(field);

    component.form = new FormGroup({});
    component.form.addControl = jasmine.createSpy('addControl');
    component.form.removeControl = jasmine.createSpy('removeControl');

    component.onFormElementDelete(field);

    expect(component.formDefinition.children.find((c) => c.id === field.id)).toBeUndefined();
    expect(component.form.removeControl).toHaveBeenCalledWith(field.id);
  });

  it('should delete a group and remove control', () => {
    const group = new Group('Group 1');
    component.formDefinition.addChild(group);
    component.form = new FormGroup({});
    component.form.addControl(group.id, new FormGroup({}));

    component.form.removeControl = jasmine.createSpy('removeControl');

    component.onFormElementDelete(group);

    expect(component.formDefinition.children.find((c) => c.id === group.id)).toBeUndefined();
    expect(component.form.removeControl).toHaveBeenCalledWith(group.id);
  });

  it('should ungroup group and update form correctly', () => {
    const group = new Group('Group 1');
    const child = new Field(InputType.TEXT);
    group.addChild(child);
    component.formDefinition.addChild(group);

    const groupControl = new FormGroup({
      [child.id]: new FormControl(''),
    });

    component.form = new FormGroup({
      [group.id]: groupControl,
    });

    component.form.addControl = jasmine.createSpy('addControl');
    groupControl.removeControl = jasmine.createSpy('removeControl');
    component.form.removeControl = jasmine.createSpy('removeControl');

    component.onUngroupGroup(group);

    expect(group.children.length).toBe(0);
    expect(component.formDefinition.children.find((c) => c.id === group.id)).toBeUndefined();
    expect(component.form.removeControl).toHaveBeenCalledWith(group.id);
  });

  it('should update field value on element update', () => {
    const field = new Field(InputType.TEXT);
    component.formDefinition.addChild(field);

    const control = new FormControl('initial');
    component.form = new FormGroup({
      [field.id]: control,
    });

    field.value = 'updated';
    component.onElementUpdate(field);

    expect(control.value).toBe('updated');
  });

  it('should call dragDropService methods and save form', () => {
    dragDropService.dropField.and.returnValue(true);
    const field = new Field(InputType.TEXT);

    component.onDragStart(field);
    expect(dragDropService.startDrag).toHaveBeenCalledWith(field);

    component.onDropField(2);
    expect(dragDropService.dropField).toHaveBeenCalled();

    dragDropService.dropField.and.returnValue(false);
    component.onDropField(3);

    component.onDropDivider(4);
    expect(dragDropService.dropDivider).toHaveBeenCalledWith(component.formDefinition, 4, undefined);
  });

  it('should get FormGroup for a group element', () => {
    const group = new Group('Group 1');
    component.formDefinition.addChild(group);
    const fg = new FormGroup({});
    component.form = new FormGroup({
      [group.id]: fg,
    });

    expect(component.getFormGroup(group)).toBe(fg);
  });
});
