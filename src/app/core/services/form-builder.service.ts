import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Field } from '@models/field.model';
import { FormDefinition, FormElement } from '@models/form-definition.model';
import { Group } from '@models/group.model';
import { ValidatorDefinition } from '@models/validator-definition.model';
import { isGroup } from '@utils/form-element';
import clone from 'clone';

type FormControlsMap = Record<string, FormControl | FormGroup>;

@Injectable({ providedIn: 'root' })
export class FormBuilderService {
  constructor(private fb: FormBuilder) {}

  /**
   * Builds a FormGroup from a FormDefinition
   */
  buildForm(form: FormDefinition): FormGroup {
    const formChildren = clone(form.children);
    const controls = this.buildControls([...formChildren]);
    return this.fb.group(controls);
  }

  /**
   * Creates a FormControl from a Field configuration
   */
  createControl(field: Field): FormControl {
    const fieldValidators = [...field.validators];
    const validators = this.mapValidators(fieldValidators || []);
    return this.fb.control(field.value ?? null, validators);
  }

  /**
   * Creates a FormGroup from a Group configuration
   */
  createGroup(group: Group): FormGroup {
    const controls = group.children.reduce(
      (acc, child) => {
        acc[child.id] = this.createControl(child);
        return acc;
      },
      {} as Record<string, FormControl>,
    );

    return this.fb.group(controls);
  }

  private buildControls(elements: FormElement[]): FormControlsMap {
    return elements.reduce((controls, element) => {
      controls[element.id] = isGroup(element) ? this.buildGroup(element) : this.buildControl(element);
      return controls;
    }, {} as FormControlsMap);
  }

  private buildGroup(group: Group): FormGroup {
    const childControls = this.buildControls([...group.children]);
    return this.fb.group(childControls);
  }

  private buildControl(field: Field): FormControl {
    const fieldValidators = [...field.validators];
    const validators = this.mapValidators(fieldValidators || []);
    return this.fb.control(field.value ?? null, validators);
  }

  private mapValidators(validatorConfigs: ValidatorDefinition[]): ValidatorFn[] {
    const validatorMap: Record<string, (config: ValidatorDefinition) => ValidatorFn | null> = {
      required: () => Validators.required,
      minLength: (cfg) => Validators.minLength(cfg.value ?? 0),
      maxLength: (cfg) => Validators.maxLength(cfg.value ?? 100),
      min: (cfg) => Validators.min(cfg.value ?? 0),
      max: (cfg) => Validators.max(cfg.value ?? 100),
    };

    return validatorConfigs
      .map((config) => validatorMap[config.type]?.(config))
      .filter((validator): validator is ValidatorFn => validator !== null && validator !== undefined);
  }
}
