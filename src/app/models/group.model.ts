import { Field } from './field.model';
import { FormElement } from './form-definition.model';
import { InputType } from './input-type.model';

export interface GroupConfig {
  id?: string;
  label: string;
  children: Field[];
}

export interface MoveResult {
  success: boolean;
  message?: string;
}

export class Group {
  readonly type = InputType.GROUP;
  id: string;
  label: string;
  private _children: Field[] = [];

  constructor(config: GroupConfig) {
    // New config-based constructor
    this.id = config.id || crypto.randomUUID();
    this.label = config.label;
    this._children = [...(config.children ?? [])];
  }

  /**
   * Gets a readonly copy of children array
   */
  get children(): readonly Field[] {
    return [...this._children];
  }

  /**
   * Adds a child field to the group
   */
  addChild(field: Field): void {
    if (!field) {
      throw new Error('Field cannot be null or undefined');
    }

    if (this.hasChild(field.id)) {
      throw new Error(`Field with id '${field.id}' already exists in group`);
    }

    this._children.push(field);
  }

  /**
   * Adds multiple children at once
   */
  addChildren(fields: Field[]): void {
    fields.forEach((field) => this.addChild(field));
  }

  /**
   * Removes a child by ID and returns whether it was found and removed
   */
  removeChildById(id: string): boolean {
    const initialLength = this._children.length;
    this._children = this._children.filter((child) => child.id !== id);
    return this._children.length < initialLength;
  }

  /**
   * Moves a child from one index to another
   */
  moveChild(fromIndex: number, toIndex: number): MoveResult {
    const validation = this.validateMoveIndices(fromIndex, toIndex);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const [element] = this._children.splice(fromIndex, 1);
    const adjustedIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    this._children.splice(adjustedIndex, 0, element);

    return { success: true };
  }

  /**
   * Gets a child field by ID
   */
  getChild(fieldId: string): Field | undefined {
    return this._children.find((field) => field.id === fieldId);
  }

  /**
   * Gets a child field by index
   */
  getChildAt(index: number): Field | undefined {
    return this._children[index];
  }

  /**
   * Checks if a child with the given ID exists
   */
  hasChild(fieldId: string): boolean {
    return this._children.some((field) => field.id === fieldId);
  }

  /**
   * Gets the index of a child field
   */
  getChildIndex(fieldId: string): number {
    return this._children.findIndex((field) => field.id === fieldId);
  }

  /**
   * Checks if the group is empty
   */
  isEmpty(): boolean {
    return this._children.length === 0;
  }

  /**
   * Gets the number of children
   */
  get childCount(): number {
    return this._children.length;
  }

  /**
   * Updates an existing child field
   */
  updateChild(updated: Field): boolean {
    const index = this.getChildIndex(updated.id);
    if (index === -1) return false;

    this._children[index] = updated;
    return true;
  }

  /**
   * Replaces a child element with a new field
   */
  replaceChild(oldElement: FormElement, newElement: Field): boolean {
    const index = this.getChildIndex(oldElement.id);
    if (index === -1) return false;

    this._children.splice(index, 1, newElement);
    return true;
  }

  /**
   * Finds a child by ID, including nested groups
   */
  findChildById(id: string): FormElement | undefined {
    for (const child of this._children) {
      if (child.id === id) {
        return child;
      }

      // If child is also a Group, search recursively
      if (this.isGroup(child)) {
        const nested = child.findChildById(id);
        if (nested) {
          return nested;
        }
      }
    }

    return undefined;
  }

  /**
   * Finds all children that match a predicate
   */
  findChildren(predicate: (field: Field) => boolean): Field[] {
    return this._children.filter(predicate);
  }

  /**
   * Executes a function for each child
   */
  forEachChild(callback: (field: Field, index: number) => void): void {
    this._children.forEach(callback);
  }

  /**
   * Creates a new group with filtered children
   */
  filter(predicate: (field: Field) => boolean): Group {
    const filteredChildren = this._children.filter(predicate);
    return new Group({
      label: this.label,
      children: filteredChildren,
    });
  }

  /**
   * Validates the group structure
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.label.trim()) {
      errors.push('Group label cannot be empty');
    }

    // Check for duplicate IDs
    const ids = new Set<string>();
    for (const child of this._children) {
      if (ids.has(child.id)) {
        errors.push(`Duplicate child ID found: ${child.id}`);
      }
      ids.add(child.id);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Converts to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      type: this.type,
      id: this.id,
      label: this.label,
      children: this._children.map((child) => child.toJSON()),
    };
  }

  /**
   * Creates a Group from JSON data
   */
  static fromJSON(data: any): Group {
    return new Group({
      id: data.id,
      label: data.label,
      children: data.children || [],
    });
  }

  private validateMoveIndices(fromIndex: number, toIndex: number): { valid: boolean; message?: string } {
    if (fromIndex === toIndex) {
      return { valid: false, message: 'Source and target indices are the same' };
    }

    if (fromIndex < 0 || fromIndex >= this._children.length) {
      return { valid: false, message: 'Source index is out of bounds' };
    }

    if (toIndex < 0 || toIndex > this._children.length) {
      return { valid: false, message: 'Target index is out of bounds' };
    }

    return { valid: true };
  }

  private isGroup(element: any): element is Group {
    return element && typeof element === 'object' && element.type === InputType.GROUP;
  }
}
