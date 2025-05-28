import { Component, Input, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Field } from '../../../models/form.model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-field-edit-dialog',
  imports: [DialogModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './field-edit-dialog.component.html',
  styleUrl: './field-edit-dialog.component.scss',
})
export class FieldEditDialogComponent implements OnInit {
  field = input<Field>();
  @Input() isVisible = false;
  close = output<void>();
  fieldChanged = output<Field>();

  label = '';
  placeholder = '';

  ngOnInit() {
    console.log(this.field());
    this.label = this.field()?.label ?? '';
    this.placeholder = this.field()?.placeholder ?? '';
  }

  onSave(): void {
    const f = this.field();
    if (!f) return;

    this.fieldChanged.emit({
      ...f,
      label: this.label,
      placeholder: this.placeholder,
    });
    this.close.emit();
  }

  onHide() {
    this.close.emit();
  }
}
