import { Component, Input, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormElement } from '@models/form-definition.model';
import { isGroup } from '@utils/form-element';
import clone from 'clone';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-field-edit-dialog',
  imports: [DialogModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './field-edit-dialog.component.html',
  styleUrl: './field-edit-dialog.component.scss',
})
export class FieldEditDialogComponent implements OnInit {
  element = input.required<FormElement>();
  @Input() isVisible = false;
  close = output<void>();
  update = output<FormElement>();

  label = '';
  isGroup = isGroup;

  ngOnInit() {
    this.label = this.element().label ?? '';
  }

  onSave(): void {
    const original = this.element();
    if (!original) return;

    const savedElement = clone(original);
    savedElement.label = this.label;

    this.update.emit(savedElement);
    this.close.emit();
  }

  onHide() {
    this.close.emit();
  }
}
