import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormBuilderService } from '../core/services/form-builder.service';
import { Field, FormModel, InputType } from '../models/form.model';
import { FieldEditDialogComponent } from './components/field-edit-dialog/field-edit-dialog.component';
import { FormInputComponent } from './components/form-input/form-input.component';
import { InputSelectorComponent } from './components/input-selector/input-selector.component';
import { TabsModule } from 'primeng/tabs';

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
    this.form.addControl(newField.id, this.formBuilderService.buildControl(newField));
    this.saveFormModel();
  }

  onOpenFieldEditDialog(field: Field): void {
    this.isEditDialogVisible = true;
    this.editedField.set(field);
  }

  onFieldDelete(field: Field): void {
    this.formModel.fields = this.formModel.fields.filter((f) => f.id !== field.id);
    this.form.removeControl(field.id);

    this.editedField.set(null);
    this.isEditDialogVisible = false;

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

  private saveFormModel(): void {
    localStorage.setItem('formModel', JSON.stringify(this.formModel));
  }
}
