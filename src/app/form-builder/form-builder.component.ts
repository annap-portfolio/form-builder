import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DragDropModule } from 'primeng/dragdrop';
import { TabsModule } from 'primeng/tabs';
import { FormBuilderService } from '../core/services/form-builder.service';
import { Field, FormElement, FormModel, Group, InputType } from '../models/form.model';
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
  ],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
})
export class FormBuilderComponent implements OnInit {
  private formBuilderService = inject(FormBuilderService);
  screenWidth = signal(window.innerWidth);
  isMobile = computed(() => this.screenWidth() < 992);

  formModel: FormModel = {
    fields: [],
  };

  form: FormGroup = this.formBuilderService.buildForm(this.formModel);

  isEditDialogVisible = false;
  editedField = signal<Field | null>(null);

  private draggedIndex: number | null = null;

  constructor() {
    window.addEventListener('resize', () => {
      this.screenWidth.set(window.innerWidth);
    });
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('formModel');
    if (saved) {
      this.formModel = JSON.parse(saved);
      this.form = this.formBuilderService.buildForm(this.formModel);
      console.log(this.form);
    }
  }

  onInputSelected(type: InputType): void {
    const newField: Field = {
      id: crypto.randomUUID(),
      type,
      label: `${type.charAt(0).toUpperCase()}${type.slice(1)} Field`,
      placeholder: `Enter ${type}`,
      validators: [],
    };

    this.formModel.fields.push(newField);

    // Rebuild form with updated model
    this.form = this.formBuilderService.buildForm(this.formModel);

    this.saveFormModel();
  }

  onOpenFieldEditDialog(field: FormElement): void {
    if (this.isField(field)) {
      this.isEditDialogVisible = true;
      this.editedField.set(field);
    }
  }

  onFieldDelete(field: FormElement, parentGroup: Group | undefined): void {
    if (!this.isField(field)) return;

    if (parentGroup) {
      // Field is inside a group
      const groupIndex = this.formModel.fields.findIndex((f) => f.id === parentGroup.id);
      if (groupIndex === -1) return;

      // Remove from group's children
      parentGroup.children = parentGroup.children.filter((child) => child.id !== field.id);

      // Remove control from group FormGroup
      const groupForm = this.form.get(parentGroup.id) as FormGroup;
      if (groupForm && groupForm.contains(field.id)) {
        groupForm.removeControl(field.id);
      }

      // If group is empty after deletion, remove it
      if (parentGroup.children.length === 0) {
        this.formModel.fields.splice(groupIndex, 1);
        this.form.removeControl(parentGroup.id);
      }
    } else {
      // Field is at top level
      this.formModel.fields = this.formModel.fields.filter((f) => f.id !== field.id);
      this.form.removeControl(field.id);
    }

    this.editedField.set(null);
    this.isEditDialogVisible = false;
    this.saveFormModel();
  }

  onFieldUngroup(field: FormElement, parentGroup: Group | undefined): void {
    if (!parentGroup || !this.isGroup(parentGroup)) return;

    const parentGroupIndex = this.formModel.fields.findIndex((el) => el.id === parentGroup.id);
    if (parentGroupIndex === -1) return;

    const fieldIndexInGroup = parentGroup.children.findIndex((child) => child.id === field.id);
    if (fieldIndexInGroup === -1) return;

    // Remove the field from the group's children
    parentGroup.children.splice(fieldIndexInGroup, 1);

    // Remove control from group FormGroup
    const groupControl = this.form.get(parentGroup.id) as FormGroup;
    if (groupControl && groupControl.contains(field.id)) {
      const control = groupControl.get(field.id);
      groupControl.removeControl(field.id);

      // Add control back to top-level form
      if (control) {
        this.form.addControl(field.id, control);
      }
    }

    // Insert the field back into the top-level fields array after the group
    this.formModel.fields.splice(parentGroupIndex + 1, 0, field);

    // If the group is now empty, remove it
    if (parentGroup.children.length === 0) {
      this.formModel.fields.splice(parentGroupIndex, 1);
      this.form.removeControl(parentGroup.id); // Also remove group FormGroup
    }

    this.saveFormModel();
  }

  onClose() {
    this.isEditDialogVisible = false;
  }

  onFieldChanged(updatedField: Field): void {
    const index = this.formModel.fields.findIndex((f) => f.id === updatedField.id);
    if (index > -1) {
      this.formModel.fields[index] = updatedField;

      // Update the form control as well, in case anything structural changes later
      if (this.form.contains(updatedField.id)) {
        this.form.get(updatedField.id)?.setValue(updatedField.value ?? null);
      }

      this.saveFormModel();
    }
  }

  onDragStart(index: number) {
    this.draggedIndex = index;
  }

  onDropField(targetIndex: number): void {
    if (this.draggedIndex == null || targetIndex == null || this.draggedIndex === targetIndex) return;

    const draggedElement = this.formModel.fields[this.draggedIndex];
    const targetElement = this.formModel.fields[targetIndex];

    // Cannot drag a group
    if (this.isGroup(draggedElement)) {
      this.resetDrag();
      return;
    }

    // Dropping a field onto an existing group -> add to group's children
    if (this.isField(draggedElement) && this.isGroup(targetElement)) {
      targetElement.children.push(draggedElement);

      // Remove from top-level
      this.formModel.fields.splice(this.draggedIndex, 1);

      // Register control in the form
      if (!this.form.contains(draggedElement.id)) {
        const control = this.formBuilderService.createControl(draggedElement);
        this.form.addControl(draggedElement.id, control);
      }

      this.resetDrag();
      this.saveFormModel();
      return;
    }

    // Dropping a field onto another field -> create a new group
    if (this.isField(targetElement) && this.isField(draggedElement)) {
      const newGroup: Group = {
        id: crypto.randomUUID(),
        type: InputType.GROUP,
        label: 'New Group',
        children: [targetElement, draggedElement],
      };

      this.formModel.fields[targetIndex] = newGroup;
      this.formModel.fields.splice(this.draggedIndex, 1);

      // Create a nested FormGroup for the new group
      const groupForm = this.formBuilderService.createGroup(newGroup);

      // Add the group to the top-level form under its ID
      this.form.addControl(newGroup.id, groupForm);

      this.resetDrag();
      this.saveFormModel();
    }
  }

  private resetDrag() {
    this.draggedIndex = null;
  }

  isField(element: FormElement): element is Field {
    if (!element) return false;
    return element.type !== InputType.GROUP;
  }

  isGroup(element: FormElement): element is Group {
    if (!element) return false;
    return element.type === InputType.GROUP;
  }

  onDropDivider(targetIndex: number): void {
    if (this.draggedIndex === null || this.draggedIndex === targetIndex) return;

    const field = this.formModel.fields[this.draggedIndex];

    // Remove from old position
    this.formModel.fields.splice(this.draggedIndex, 1);

    // Insert at new position
    const adjustedIndex = this.draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
    this.formModel.fields.splice(adjustedIndex, 0, field);

    this.draggedIndex = null;
    this.saveFormModel();
  }

  getFormGroup(group: Group): FormGroup | null {
    if (this.isGroup(group)) {
      return this.form.controls[group.id] as FormGroup;
    } else {
      return null;
    }
  }

  private saveFormModel(): void {
    localStorage.setItem('formModel', JSON.stringify(this.formModel));
  }
}
