import { Field } from './field.model';
import { FormElement } from './form-definition.model';
import { InputType } from './input-type.model';

export class Group {
  readonly type = InputType.GROUP;
  id: string;
  label: string;
  children: Field[];

  constructor(label: string, children: Field[] = []) {
    this.id = crypto.randomUUID();
    this.label = label;
    this.children = children;
  }

  addChild(field: Field): void {
    this.children.push(field);
  }

  removeChild(id: string): void {
    this.children = this.children.filter((child) => child.id !== id);
  }

  getChild(fieldId: string): Field | undefined {
    return this.children.find((f) => f.id === fieldId);
  }

  isEmpty(): boolean {
    return this.children.length === 0;
  }

  updateChild(updated: Field): boolean {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].id === updated.id) {
        Object.assign(this.children[i], updated);
        return true;
      }
    }
    return false;
  }

  findChildById(id: string): FormElement | undefined {
    for (const child of this.children) {
      if (child.id === id) {
        return child;
      }

      if (child instanceof Group) {
        const nested = child.findChildById(id);
        if (nested) {
          return nested;
        }
      }
    }

    return undefined;
  }

  toJSON(): any {
    return {
      type: this.type,
      id: this.id,
      label: this.label,
      children: this.children,
    };
  }
}
