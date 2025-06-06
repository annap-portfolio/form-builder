import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, Input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGripVertical, faLinkSlash, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Field } from '@models/field.model';
import { InputType } from '@models/input-type.model';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

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
    RadioButtonModule,
    CheckboxModule,
  ],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormInputComponent {
  field = input.required<Field>();
  isInGroup = input<boolean>();
  @Input() formGroup!: FormGroup;
  openEditDialog = output<void>();
  delete = output<void>();
  ungroup = output<void>();

  // Utilities exported for template
  readonly InputType = InputType;

  // Icons
  readonly faPencil = faPencil;
  readonly faTrash = faTrash;
  readonly faGripVertical = faGripVertical;
  readonly faLinkSlash = faLinkSlash;

  get control() {
    return this.formGroup.get(this.field().id);
  }

  showError(): boolean {
    return !!this.control?.invalid && (this.control?.touched || this.control?.dirty);
  }
}
