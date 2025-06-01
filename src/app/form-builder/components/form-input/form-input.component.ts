import { CommonModule } from '@angular/common';
import { Component, input, Input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGripVertical, faLinkSlash, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { FormElement, InputType } from '../../../models/form.model';

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
  @Input() field!: FormElement;
  @Input() formGroup!: FormGroup;
  isInGroup = input<boolean>();
  openEditDialog = output<void>();
  delete = output<void>();
  ungroup = output<void>();

  readonly InputType = InputType;
  readonly faPencil = faPencil;
  readonly faTrash = faTrash;
  readonly faGripVertical = faGripVertical;
  readonly faLinkSlash = faLinkSlash;

  get control() {
    return this.formGroup.get(this.field.id);
  }

  showError(): boolean {
    return !!this.control?.invalid && (this.control?.touched || this.control?.dirty);
  }
}
