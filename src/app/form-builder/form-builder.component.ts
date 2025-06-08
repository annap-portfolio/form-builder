import { CommonModule } from '@angular/common';
import { Component, inject, input, Input, OnInit, output, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { Observable } from 'rxjs';
import { FieldEditDialogComponent } from './components/field-edit-dialog/field-edit-dialog.component';
import { FormInputComponent } from './components/form-input/form-input.component';

@Component({
  selector: 'app-form-builder',
  imports: [
    CommonModule,
    ButtonModule,
    ReactiveFormsModule,
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
  isMobile = input.required<boolean>();
  @Input() addedFieldType: Observable<InputType> | null = null;
  change = output<FormDefinition | null>();

  private formBuilderService = inject(FormBuilderService);
  private dragDropService = inject(DragDropService);

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

  ngOnInit() {
    if (this.addedFieldType) {
      this.addedFieldType.subscribe((type) => this.onInputSelected(type));
    }

    const savedJson = localStorage.getItem('formBuilder');
    if (savedJson) {
      this.formDefinition = FormDefinition.fromJSON(savedJson);
      this.form = this.formBuilderService.buildForm(this.formDefinition);

      this.saveFormModel();
    }
  }

  /**
   * Creates a new form field based on the selected input type.
   */
  onInputSelected(type: InputType) {
    const newField = new Field({ type });

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

  /**
   * Removes all elements from a group and deletes the group.
   */
  onUngroupGroup(group: FormElement): void {
    if (!isGroup(group)) return;

    const typedGroup = group as Group;
    const groupControl = this.form.get(group.id) as FormGroup;

    // Loop backwards so splice order doesn't matter
    for (let i = typedGroup.children.length - 1; i >= 0; i--) {
      const child = typedGroup.children[i];

      typedGroup.removeChildById(child.id);

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

  /**
   * Moves a field out of its parent group and places it at the top level.
   */
  onFieldUngroup(field: FormElement, parentGroup: Group | undefined) {
    if (!parentGroup || !isGroup(parentGroup)) return;

    // Remove the field from the group
    parentGroup.removeChildById(field.id);

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

  onElementUpdate(updatedField: FormElement) {
    const updated = this.formDefinition.updateElement(updatedField);
    if (!updated) return;

    this.saveFormModel();
  }

  onDragStart(element: FormElement) {
    this.dragDropService.startDrag(element);
  }

  onDropField(targetIndex: number) {
    const updated = this.dragDropService.dropField(this.formDefinition, this.form, targetIndex);
    if (updated) {
      this.saveFormModel();
    }
  }

  onDropDivider(targetIndex: number, parentGroup?: Group) {
    this.dragDropService.dropDivider(this.formDefinition, targetIndex, parentGroup);
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
      parentGroup.removeChildById(field.id);

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
    if (this.formDefinition.isEmpty()) {
      this.change.emit(null);
      localStorage.removeItem('formBuilder');
    } else {
      this.change.emit(this.formDefinition);
      localStorage.setItem('formBuilder', this.formDefinition.toJSON());
    }
  }
}
