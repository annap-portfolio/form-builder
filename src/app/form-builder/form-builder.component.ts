import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DragDropService } from '@core/services/drag-drop.service';
import { FormBuilderService } from '@core/services/form-builder.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLinkSlash, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Field } from '@models/field.model';
import { FormDefinition, FormElement } from '@models/form-definition.model';
import { Group } from '@models/group.model';
import { InputType } from '@models/input-type.model';
import { isField, isGroup } from '@utils/form-element';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DragDropModule } from 'primeng/dragdrop';
import { TabsModule } from 'primeng/tabs';
import { FieldEditDialogComponent } from './components/field-edit-dialog/field-edit-dialog.component';
import { FormInputComponent } from './components/form-input/form-input.component';
import { InputSelectorComponent } from './components/input-selector/input-selector.component';

@Component({
  selector: 'app-form-builder',
  imports: [
    CommonModule,
    ButtonModule,
    ReactiveFormsModule,
    InputSelectorComponent,
    FormInputComponent,
    FieldEditDialogComponent,
    DialogModule,
    TabsModule,
    DragDropModule,
    FontAwesomeModule,
  ],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
})
export class FormBuilderComponent implements OnInit {
  private formBuilderService = inject(FormBuilderService);
  private dragDropService = inject(DragDropService);

  screenWidth = signal(window.innerWidth);
  isMobile = computed(() => this.screenWidth() < 992);

  formDefinition = new FormDefinition();
  form: FormGroup = this.formBuilderService.buildForm(this.formDefinition);

  isEditDialogVisible = false;
  editedElement = signal<FormElement | null>(null);

  // Icons
  faTrash = faTrash;
  faPencil = faPencil;
  faLinkSlash = faLinkSlash;

  // Exposed functions
  isGroup = isGroup;
  isField = isField;

  constructor() {
    window.addEventListener('resize', () => {
      this.screenWidth.set(window.innerWidth);
    });
  }

  ngOnInit() {
    const savedJson = localStorage.getItem('formBuilder');
    if (savedJson) {
      this.formDefinition = FormDefinition.fromJSON(savedJson);
      this.form = this.formBuilderService.buildForm(this.formDefinition);
    }
  }

  onInputSelected(type: InputType) {
    const newField = new Field(type);

    this.formDefinition.addChild(newField);
    this.form = this.formBuilderService.buildForm(this.formDefinition);

    this.saveFormModel();
  }

  onOpenFieldEditDialog(field: FormElement) {
    this.isEditDialogVisible = true;
    this.editedElement.set(field);
  }

  onFormElementDelete(element: FormElement, parentGroup?: Group) {
    if (isGroup(element)) {
      this.deleteGroup(element);
    } else if (isField(element)) {
      this.deleteField(element, parentGroup);
    }
    this.saveFormModel();
  }

  ungroupGroup(group: FormElement): void {
    if (!isGroup(group)) return;

    const typedGroup = group as Group;
    const groupControl = this.form.get(group.id) as FormGroup;

    // Loop backwards so splice order doesn't matter
    for (let i = typedGroup.children.length - 1; i >= 0; i--) {
      const child = typedGroup.children[i];

      typedGroup.removeChild(child.id);

      const control = groupControl?.get(child.id);
      if (control) {
        groupControl.removeControl(child.id);
        this.form.addControl(child.id, control);
      }

      this.formDefinition.replaceChild(group, child);
    }

    this.formDefinition.removeChildById(group.id);
    this.form.removeControl(group.id);

    this.saveFormModel();
  }

  onFieldUngroup(field: FormElement, parentGroup: Group | undefined) {
    if (!parentGroup || !isGroup(parentGroup)) return;

    // Remove the field from the group
    parentGroup.removeChild(field.id);

    // Remove control from group FormGroup
    const groupControl = this.form.get(parentGroup.id) as FormGroup;
    if (groupControl?.contains(field.id)) {
      const control = groupControl.get(field.id);
      groupControl.removeControl(field.id);

      // Add control back to top-level form
      if (control) {
        this.form.addControl(field.id, control);
      }
    }

    // Insert the field back into the top-level fields array after the group
    this.formDefinition.replaceChild(parentGroup, field);

    // Remove the group if it's now empty
    if (parentGroup.isEmpty()) {
      this.formDefinition.removeChildById(parentGroup.id);
      this.form.removeControl(parentGroup.id);
    }

    this.saveFormModel();
  }

  onClose() {
    this.isEditDialogVisible = false;
  }

  onElementUpdate(updatedField: Field) {
    const updated = this.formDefinition.updateField(updatedField);
    if (!updated) return;

    const control = this.findControlById(updatedField.id);
    if (control) {
      control.setValue(updatedField.value ?? null);
    }

    this.saveFormModel();
  }

  onDragStart(index: number) {
    this.dragDropService.startDrag(index);
  }

  onDropField(targetIndex: number) {
    const updated = this.dragDropService.dropField(this.formDefinition, this.form, targetIndex);
    if (updated) {
      this.saveFormModel();
    }
  }

  onDropDivider(targetIndex: number) {
    this.dragDropService.dropDivider(this.formDefinition, targetIndex);
    this.saveFormModel();
  }

  getFormGroup(group: Group): FormGroup | null {
    if (isGroup(group)) {
      return this.form.controls[group.id] as FormGroup;
    } else {
      return null;
    }
  }

  private deleteGroup(group: Group) {
    this.formDefinition.removeChildById(group.id);
    if (this.form?.contains(group.id)) {
      this.form.removeControl(group.id);
    }
    this.saveFormModel();
  }

  private deleteField(field: Field, parentGroup: Group | undefined) {
    if (parentGroup) {
      // Remove from group
      parentGroup.removeChild(field.id);

      const groupControl = this.form.get(parentGroup.id) as FormGroup;
      if (groupControl?.contains(field.id)) {
        groupControl.removeControl(field.id);
      }

      if (parentGroup.isEmpty()) {
        this.formDefinition.removeChildById(parentGroup.id);
        this.form.removeControl(parentGroup.id);
      }
    } else {
      // Remove top-level field
      this.formDefinition.removeChildById(field.id);
      this.form.removeControl(field.id);
    }

    this.editedElement.set(null);
    this.isEditDialogVisible = false;
    this.saveFormModel();
  }

  private saveFormModel() {
    localStorage.setItem('formBuilder', this.formDefinition.toJSON());
  }

  private findControlById(id: string): FormControl | null {
    if (this.form.contains(id)) {
      return this.form.get(id) as FormControl;
    }

    for (const element of this.formDefinition.children) {
      if (element instanceof Group) {
        const groupControl = this.form.get(element.id) as FormGroup;
        if (groupControl?.contains(id)) {
          return groupControl.get(id) as FormControl;
        }
      }
    }

    return null;
  }
}
