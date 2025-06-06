import { Injectable } from '@angular/core';
import { Field } from '@models/field.model';
import { FormDefinition, FormElement } from '@models/form-definition.model';
import { Group } from '@models/group.model';
import { InputType } from '@models/input-type.model';
import { ValidatorDefinition } from '@models/validator-definition.model';
import { isField, isGroup } from '@utils/form-element';

interface TemplateGenerator {
  generate(field: Field, padding: string): string;
}

@Injectable({ providedIn: 'root' })
export class CodeGeneratorService {
  private readonly validatorMap = new Map<string, (value?: any) => string>([
    ['required', () => 'Validators.required'],
    ['minLength', (value) => `Validators.minLength(${value})`],
    ['maxLength', (value) => `Validators.maxLength(${value})`],
    ['min', (value) => `Validators.min(${value})`],
    ['max', (value) => `Validators.max(${value})`],
  ]);

  private readonly templateGenerators = new Map<InputType, TemplateGenerator>([
    [InputType.TEXT, { generate: (field, pad) => this.generateInputTemplate(field, pad, 'text') }],
    [InputType.PASSWORD, { generate: (field, pad) => this.generateInputTemplate(field, pad, 'password') }],
    [InputType.DATE, { generate: (field, pad) => this.generateInputTemplate(field, pad, 'date') }],
    [InputType.NUMBER, { generate: (field, pad) => this.generateInputTemplate(field, pad, 'number') }],
    [InputType.TEXTAREA, { generate: (field, pad) => this.generateTextareaTemplate(field, pad) }],
    [InputType.CHECKBOX, { generate: (field, pad) => this.generateCheckboxTemplate(field, pad) }],
    [InputType.RADIO, { generate: (field, pad) => this.generateRadioTemplate(field, pad) }],
  ]);

  /**
   * Generates TypeScript FormBuilder code from form definition
   */
  generateTypescriptCode(formDefinition: FormDefinition): string {
    if (formDefinition.children) {
      const formControls = this.generateControls([...formDefinition.children]);
      return `this.form = this.fb.group({\n${formControls}\n});`;
    } else return '';
  }

  /**
   * Generates HTML template code from form definition
   */
  generateHTMLTemplate(formDefinition: FormDefinition): string {
    if (formDefinition.children) {
      return this.generateTemplateControls([...formDefinition.children]);
    } else return '';
  }

  private generateControls(elements: FormElement[], indent = 2): string {
    const padding = this.createPadding(indent);

    return elements
      .map((element) => {
        if (isField(element)) {
          return this.generateFieldControl(element, padding, indent);
        } else if (isGroup(element)) {
          return this.generateGroupControl(element, padding, indent);
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  private generateFieldControl(field: Field, padding: string, indent: number): string {
    const value = field.type === InputType.CHECKBOX ? `[]` : this.stringifyValue(field.value);
    const fieldValidators = [...field.validators];
    const validators = this.generateValidators(fieldValidators || [], indent);

    return `${padding}${field.id}: [${value}, ${validators}],`;
  }

  private generateGroupControl(group: Group, padding: string, indent: number): string {
    const groupChildren = [...group.children];
    const groupControls = this.generateControls(groupChildren, indent + 2);
    return `${padding}${group.id}: this.fb.group({\n${groupControls}\n${padding}}),`;
  }

  private generateValidators(validators: ValidatorDefinition[], indent: number): string {
    if (!validators.length) return '[]';

    const validatorFns = validators
      .map((validator) => this.validatorMap.get(validator.type)?.(validator.value))
      .filter(Boolean);

    const padding = this.createPadding(indent);
    const innerPadding = this.createPadding(indent + 2);

    return validatorFns.length ? `[\n${innerPadding}${validatorFns.join(`, \n${innerPadding}`)}\n${padding}]` : '[]';
  }

  private stringifyValue(value: unknown): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') return `'${this.escapeString(value)}'`;
    if (typeof value === 'boolean' || typeof value === 'number') return String(value);
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return 'null';
  }

  private escapeString(str: string): string {
    return str.replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  }

  private generateTemplateControls(elements: FormElement[], indent = 2): string {
    const padding = this.createPadding(0);

    return elements
      .map((element) => {
        if (isField(element)) {
          return this.generateFieldTemplate(element, padding);
        } else if (isGroup(element)) {
          return this.generateGroupTemplate(element, padding, indent);
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  private generateFieldTemplate(field: Field, padding: string): string {
    const label = this.generateLabelTemplate(field, padding);
    const control = this.generateControlTemplate(field, padding);
    return `${label}\n${control}`;
  }

  private generateGroupTemplate(group: Group, padding: string, indent: number): string {
    const groupChildren = [...group.children];
    const childrenHtml = this.generateTemplateControls(groupChildren, indent + 2);
    return `${padding}<div formGroupName="${group.id}">\n${childrenHtml}\n${padding}</div>`;
  }

  private generateLabelTemplate(field: Field, padding: string): string {
    const innerPadding = this.createPadding(padding.length + 2);
    return `${padding}<label for="${field.id}">\n${innerPadding}${field.label}\n${padding}</label>`;
  }

  private generateControlTemplate(field: Field, padding: string): string {
    const generator = this.templateGenerators.get(field.type);
    return generator?.generate(field, padding) || `${padding}<!-- unknown input type: ${field.type} -->`;
  }

  private generateInputTemplate(field: Field, padding: string, type: string): string {
    const innerPadding = this.createPadding(padding.length + 2);
    return [
      `${padding}<input`,
      `${innerPadding}id="${field.id}"`,
      `${innerPadding}formControlName="${field.id}"`,
      `${innerPadding}type="${type}" />`,
    ].join('\n');
  }

  private generateTextareaTemplate(field: Field, padding: string): string {
    const innerPadding = this.createPadding(padding.length + 2);
    return [
      `${padding}<textarea`,
      `${innerPadding}id="${field.id}"`,
      `${innerPadding}formControlName="${field.id}">`,
      `${padding}</textarea>`,
    ].join('\n');
  }

  private generateCheckboxTemplate(field: Field, padding: string): string {
    if (!field.options || field.options.length === 0) {
      return `${padding}<!-- No checkbox options provided -->`;
    }

    const innerPadding = this.createPadding(padding.length + 2);
    const optionPadding = this.createPadding(padding.length + 4);

    return field.options
      .map((option) => {
        return [
          `${padding}<div>`,
          `${innerPadding}<input`,
          `${optionPadding}type="checkbox"`,
          `${optionPadding}id="${field.id}_${option.value}"`,
          `${optionPadding}name="${field.id}"`,
          `${optionPadding}value="${option.value}"`,
          `${optionPadding}formControlName="${field.id}" />`,
          `${innerPadding}<label for="${field.id}_${option.value}">`,
          `${optionPadding}${option.label}`,
          `${innerPadding}</label>`,
          `${padding}</div>`,
        ].join('\n');
      })
      .join('\n');
  }

  private generateRadioTemplate(field: Field, padding: string): string {
    if (!field.options || field.options.length === 0) {
      return `${padding}<!-- No radio options provided -->`;
    }

    const innerPadding = this.createPadding(padding.length + 2);
    const optionPadding = this.createPadding(padding.length + 4);

    return field.options
      .map((option) => {
        return [
          `${padding}<div>`,
          `${innerPadding}<input`,
          `${optionPadding}type="radio"`,
          `${optionPadding}id="${field.id}_${option.value}"`,
          `${optionPadding}name="${field.id}"`,
          `${optionPadding}value="${option.value}"`,
          `${optionPadding}formControlName="${field.id}" />`,
          `${innerPadding}<label for="${field.id}_${option.value}">`,
          `${optionPadding}${option.label}`,
          `${innerPadding}</label>`,
          `${padding}</div>`,
        ].join('\n');
      })
      .join('\n');
  }

  private createPadding(indent: number): string {
    return ' '.repeat(indent);
  }
}
