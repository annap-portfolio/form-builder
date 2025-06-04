import { Field } from './field.model';
import { Group } from './group.model';
import { InputType } from './input-type.model';

export interface ValidatorConfig {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message?: string;
}

export type FormElement = Field | Group;

export class FormDefinition {
  private _children: FormElement[] = [];

  constructor(fields?: FormElement[]) {
    this._children = fields ?? [];
  }

  get children(): ReadonlyArray<FormElement> {
    return this._children;
  }

  getChildAt(index: number): FormElement | undefined {
    return this.children[index];
  }

  addChild(element: FormElement) {
    this._children.push(element);
  }

  replaceChild(oldElement: FormElement, newElement: FormElement): boolean {
    const index = this.children.findIndex((el) => el.id === oldElement.id);
    if (index === -1) return false;

    this._children.splice(index + 1, 0, newElement);
    return true;
  }

  removeChildById(id: string): void {
    this._children = this.children.filter((f) => f.id !== id);
  }

  updateElement(updated: FormElement): boolean {
    for (let i = 0; i < this.children.length; i++) {
      const element = this.children[i];

      // Direct match at root level
      if (element.id === updated.id) {
        if (element instanceof Field && updated instanceof Field) {
          Object.assign(element, updated);
          return true;
        }

        if (element instanceof Group && updated instanceof Group) {
          element.label = updated.label; // Only allow label updates for groups
          return true;
        }
      }

      // Recurse into nested groups
      if (element instanceof Group && updated instanceof Field) {
        if (element.updateChild(updated)) {
          return true;
        }
      }
    }

    return false;
  }

  findChildById(id: string): FormElement | undefined {
    for (const element of this.children) {
      if (element.id === id) {
        return element;
      }

      if (element instanceof Group) {
        const found = element.findChildById(id);
        if (found) {
          return found;
        }
      }
    }

    return undefined;
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

    const [element] = this._children.splice(fromIndex, 1);
    const adjustedIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    this._children.splice(adjustedIndex, 0, element);

    return true;
  }

  static fromJSON(json: string): FormDefinition {
    const parsed = JSON.parse(json);

    const parseElement = (raw: any): FormElement => {
      if (raw.type === InputType.GROUP) {
        const parsedChildren = (raw.children ?? []).map(parseElement);
        const group = new Group(raw.label, parsedChildren);
        group.id = raw.id; // apply additional props as needed
        return group;
      } else {
        const field = new Field(raw.type);
        Object.assign(field, raw); // safe for Field since it has no nested structure
        return field;
      }
    };

    const children = (parsed.fields ?? parsed.children ?? []).map(parseElement);
    return new FormDefinition(children);
  }

  toJSON(): string {
    return JSON.stringify({ fields: this.children });
  }
}
