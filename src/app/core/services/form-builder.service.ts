import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormModel, Field, Group, ValidatorConfig, FormElement, InputType } from '../../models/form.model';

@Injectable({ providedIn: 'root' })
export class FormBuilderService {
  constructor(private fb: FormBuilder) {}

  buildForm(model: FormModel): FormGroup {
    const controls = this.buildControls(model.fields);
    return this.fb.group(controls);
  }

  private buildControls(elements: FormElement[]): Record<string, FormControl | FormGroup> {
    const controls: Record<string, FormControl | FormGroup> = {};

    for (const element of elements) {
      if (this.isGroup(element)) {
        controls[element.id] = this.buildGroup(element);
      } else {
        controls[element.id] = this.buildControl(element);
      }
    }

    return controls;
  }

  private buildGroup(group: Group): FormGroup {
    const childControls = this.buildControls(group.children);
    return this.fb.group(childControls);
  }

  private buildControl(field: Field): FormControl {
    const validators = this.mapValidators(field.validators);
    return this.fb.control(field.value ?? null, validators);
  }

  private mapValidators(configs: ValidatorConfig[]): any[] {
    return configs
      .map((cfg) => {
        switch (cfg.type) {
          case 'required':
            return Validators.required;
          case 'minLength':
            return Validators.minLength(cfg.value);
          case 'maxLength':
            return Validators.maxLength(cfg.value);
          case 'pattern':
            return Validators.pattern(cfg.value);
          default:
            return null;
        }
      })
      .filter(Boolean);
  }

  private isGroup(element: FormElement): element is Group {
    return element.type === InputType.GROUP;
  }

  private isField(element: FormElement): element is Field {
    return element.type !== InputType.GROUP;
  }
}
