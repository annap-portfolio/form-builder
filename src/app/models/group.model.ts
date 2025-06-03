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

  removeChildById(id: string): void {
    this.children = this.children.filter((child) => child.id !== id);
  }

  moveChild(fromIndex: number, toIndex: number): boolean {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= this.children.length ||
      toIndex > this.children.length
    ) {
      return false;
    }

    const [element] = this.children.splice(fromIndex, 1);
    const adjustedIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    this.children.splice(adjustedIndex, 0, element);

    return true;
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

  replaceChild(oldElement: FormElement, newElement: Field): boolean {
    const index = this.children.findIndex((el) => el.id === oldElement.id);
    if (index === -1) return false;

    this.children.splice(index + 1, 0, newElement);
    return true;
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
