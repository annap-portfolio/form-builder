import { Field } from './field.model';
import { Group } from './group.model';
import { InputType } from './input-type.model';

export type FormElement = Field | Group;

export class FormDefinition {
  private readonly _children: FormElement[] = [];

  constructor(fields?: FormElement[]) {
    this._children = fields ?? [];
  }

  get children(): ReadonlyArray<FormElement> {
    return this._children;
  }

  getChildAt(index: number): FormElement | undefined {
    return this._children[index];
  }

  addChild(element: FormElement): void {
    this._children.push(element);
  }

  replaceChild(oldElement: FormElement, newElement: FormElement): boolean {
    const index = this._findElementIndex(oldElement.id);
    if (index === -1) return false;

    this._children[index] = newElement;
    return true;
  }

  removeChildById(id: string): boolean {
    const index = this._findElementIndex(id);
    if (index === -1) return false;

    this._children.splice(index, 1);
    return true;
  }

  updateElement(updated: FormElement): boolean {
    return this._updateElementRecursive(this._children, updated);
  }

  findChildById(id: string): FormElement | undefined {
    return this._findElementRecursive(this._children, id);
  }

  moveChild(fromIndex: number, toIndex: number): boolean {
    if (!this._isValidMoveOperation(fromIndex, toIndex)) {
      return false;
    }

    const [element] = this._children.splice(fromIndex, 1);
    const adjustedIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    this._children.splice(adjustedIndex, 0, element);

    return true;
  }

  getAllFields(): Field[] {
    return this._collectFields(this._children);
  }

  getFieldCount(): number {
    return this.getAllFields().length;
  }

  toJSON(): string {
    return JSON.stringify({ fields: this._children }, null, 2);
  }

  static fromJSON(json: string): FormDefinition {
    try {
      const parsed = JSON.parse(json);
      const children = (parsed.fields ?? parsed.children ?? []).map(FormDefinition._parseElement);
      return new FormDefinition(children);
    } catch (error) {
      throw new Error(`Failed to parse FormDefinition from JSON: ${error}`);
    }
  }

  // Private helper methods
  private _findElementIndex(id: string): number {
    return this._children.findIndex((el) => el.id === id);
  }

  private _updateElementRecursive(elements: FormElement[], updated: FormElement): boolean {
    for (const element of elements) {
      if (element.id === updated.id) {
        return this._updateMatchingElement(element, updated);
      }

      if (element instanceof Group) {
        if (this._updateElementRecursive(element.children as FormElement[], updated)) {
          return true;
        }
      }
    }

    return false;
  }

  private _updateMatchingElement(existing: FormElement, updated: FormElement): boolean {
    if (existing instanceof Field && updated instanceof Field) {
      Object.assign(existing, updated);
      return true;
    }

    if (existing instanceof Group && updated instanceof Group) {
      existing.label = updated.label;
      return true;
    }

    return false;
  }

  private _findElementRecursive(elements: FormElement[], id: string): FormElement | undefined {
    for (const element of elements) {
      if (element.id === id) {
        return element;
      }

      if (element instanceof Group) {
        const found = this._findElementRecursive(element.children as FormElement[], id);
        if (found) return found;
      }
    }

    return undefined;
  }

  private _isValidMoveOperation(fromIndex: number, toIndex: number): boolean {
    return (
      fromIndex !== toIndex &&
      fromIndex >= 0 &&
      toIndex >= 0 &&
      fromIndex < this._children.length &&
      toIndex <= this._children.length
    );
  }

  private _collectFields(elements: FormElement[]): Field[] {
    const fields: Field[] = [];

    for (const element of elements) {
      if (element instanceof Field) {
        fields.push(element);
      } else if (element instanceof Group) {
        fields.push(...this._collectFields(element.children as FormElement[]));
      }
    }

    return fields;
  }

  private static _parseElement(raw: any): FormElement {
    console.log(raw);
    if (raw.type === InputType.GROUP) {
      const parsedChildren = (raw.children ?? []).map(FormDefinition._parseElement);
      console.log(parsedChildren);
      const group = new Group({ label: raw.label, children: parsedChildren });
      group.id = raw.id;
      return group;
    }

    const field = new Field(raw.type);
    Object.assign(field, raw);
    console.log(field);
    return field;
  }
}
