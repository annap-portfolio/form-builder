import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormModel, Field, Group, ValidatorConfig } from '../../models/form.model';

@Injectable({ providedIn: 'root' })
export class FormBuilderService {
  constructor(private fb: FormBuilder) {}

  buildForm(model: FormModel): FormGroup {
    const controls: Record<string, any> = {};

    model.fields.forEach((field) => {
      if ('children' in field) {
        // controls[field.id] = this.buildGroup(field);
      } else {
        controls[field.id] = this.buildControl(field);
      }
    });

    return this.fb.group(controls);
  }

  buildControl(field: Field): FormControl {
    const validators = this.mapValidators(field.validators);
    return this.fb.control(field.value ?? null, validators);
  }

  private buildGroup(group: Group): FormGroup {
    const groupControls = group.children.reduce((acc, field) => {
      acc[field.id] = this.buildControl(field);
      return acc;
    }, {} as Record<string, FormControl>);

    return this.fb.group(groupControls);
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
}
