import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Field } from '@models/field.model';
import { FormDefinition, FormElement, ValidatorConfig } from '@models/form-definition.model';
import { Group } from '@models/group.model';
import { InputType } from '@models/input-type.model';

@Injectable({ providedIn: 'root' })
export class FormBuilderService {
  constructor(private fb: FormBuilder) {}

  buildForm(form: FormDefinition): FormGroup {
    const controls = this.buildControls([...form.children]);
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

  /**
   * Creates a FormControl based on a Field's configuration.
   */
  createControl(field: Field): FormControl {
    const validators = this.mapValidators(field.validators || []);
    return this.fb.control(field.value ?? null, validators);
  }

  /**
   * Creates a FormGroup from a Group element, recursively adding children.
   */
  createGroup(group: Group): FormGroup {
    const controls: { [key: string]: FormControl } = {};

    for (const child of group.children) {
      controls[child.id] = this.createControl(child);
    }

    return this.fb.group(controls);
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
