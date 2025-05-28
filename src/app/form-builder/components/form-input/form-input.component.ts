import { CommonModule } from '@angular/common';
import { Component, Input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Field, InputType } from '../../../models/form.model';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-form-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    MultiSelectModule,
    PasswordModule,
    TextareaModule,
    DatePickerModule,
    ButtonModule,
    FontAwesomeModule,
  ],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.scss',
})
export class FormInputComponent {
  @Input() field!: Field;
  @Input() form!: FormGroup;
  openEditDialog = output<void>();
  delete = output<void>();

  readonly InputType = InputType;
  readonly faPencil = faPencil;
  readonly faTrash = faTrash;

  get control() {
    return this.form.get(this.field.id);
  }

  showError(): boolean {
    return !!this.control?.invalid && (this.control?.touched || this.control?.dirty);
  }
}
