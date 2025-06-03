import { Injectable } from '@angular/core';
import { FormDefinition } from '@models/form-definition.model';
import { Field } from '@models/field.model';
import { Group } from '@models/group.model';
import { FormElement, ValidatorConfig } from '@models/form-definition.model';
import { InputType } from '@models/input-type.model';

@Injectable({ providedIn: 'root' })
export class CodeGeneratorService {
  generateTypescriptCode(formDefinition: FormDefinition): string {
    const children = [...formDefinition.children];
    const formControls = this.generateControls(children);

    return `this.form = this.fb.group({\n${formControls}\n});`;
  }

  private generateControls(elements: FormElement[], indent = 2): string {
    const pad = ' '.repeat(indent);
    return elements
      .map((el) => {
        if (el instanceof Field) {
          const validators = this.generateValidators(el.validators);
          return `${pad}${el.id}: [${this.stringifyValue(el.value)}, ${validators}],`;
        } else if (el instanceof Group) {
          const groupControls = this.generateControls(el.children, indent + 2);
          return `${pad}${el.id}: this.fb.group({\n${groupControls}\n${pad}}),`;
        }
        return '';
      })
      .join('\n');
  }

  private generateValidators(validators: ValidatorConfig[]): string {
    if (!validators.length) return '[]';

    const validatorFns = validators
      .map((v) => {
        switch (v.type) {
          case 'required':
            return 'Validators.required';
          case 'minLength':
            return `Validators.minLength(${v.value})`;
          case 'maxLength':
            return `Validators.maxLength(${v.value})`;
          case 'pattern':
            return `Validators.pattern(${JSON.stringify(v.value)})`;
          default:
            return '';
        }
      })
      .filter(Boolean);

    return `[${validatorFns.join(', ')}]`;
  }

  private stringifyValue(value: any): string {
    if (typeof value === 'string') return `'${value}'`;
    if (typeof value === 'boolean' || typeof value === 'number') return `${value}`;
    if (Array.isArray(value)) return JSON.stringify(value);
    return 'null';
  }

  generateHTMLTemplate(formDefinition: FormDefinition): string {
    const children = [...formDefinition.children];
    return this.generateTemplateControls(children);
  }

  private generateTemplateControls(elements: FormElement[], indent = 2): string {
    const pad = ' '.repeat(indent);

    return elements
      .map((el) => {
        if (el instanceof Field) {
          return this.generateFieldTemplate(el, pad);
        } else if (el instanceof Group) {
          const childrenHtml = this.generateTemplateControls(el.children, indent + 2);
          return `${pad}<div formGroupName="${el.id}">\n${childrenHtml}\n${pad}</div>`;
        }
        return '';
      })
      .join('\n');
  }

  private generateFieldTemplate(field: Field, pad: string): string {
    const label = `${pad}<label for="${field.id}">\n${pad}${pad}${field.label}\n${pad}</label>`;
    const control = (() => {
      switch (field.type) {
        case InputType.TEXT:
        case InputType.EMAIL:
        case InputType.PASSWORD:
        case InputType.DATE:
        case InputType.NUMBER:
          return `${pad}<input\n${pad}${pad}id="${field.id}"\n${pad}${pad}formControlName="${field.id}"\n${pad}${pad}type="${field.type}" />`;
        case InputType.TEXTAREA:
          return `${pad}<textarea\n${pad}${pad}id="${field.id}"\n${pad}${pad}formControlName="${field.id}">\n${pad}</textarea>`;
        case InputType.CHECKBOX:
          return `${pad}<input\n${pad}${pad}id="${field.id}"\n${pad}${pad}formControlName="${field.id}"\n${pad}${pad}type="checkbox" />`;
        case InputType.RADIO:
          return `${pad}<!-- radio options here -->`;
        default:
          return `${pad}<!-- unknown input type -->`;
      }
    })();

    return `${label}\n${control}`;
  }
}
