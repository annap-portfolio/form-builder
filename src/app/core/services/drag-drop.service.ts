import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '@models/field.model';
import { FormDefinition, FormElement } from '@models/form-definition.model';
import { Group } from '@models/group.model';
import { FormBuilderService } from './form-builder.service';

interface DropContext {
  formDefinition: FormDefinition;
  form: FormGroup;
  targetIndex: number;
  parentGroup?: Group;
  draggedElement: FormElement;
  target?: FormElement;
}

interface DropResult {
  success: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class DragDropService {
  private draggedElement: FormElement | null = null;

  constructor(private formBuilderService: FormBuilderService) {}

  /**
   * Starts dragging an element
   */
  startDrag(element: FormElement): void {
    this.draggedElement = element;
  }

  /**
   * Resets the drag state
   */
  resetDrag(): void {
    this.draggedElement = null;
  }

  /**
   * Handles dropping a field onto another element or position
   */
  dropField(formDefinition: FormDefinition, form: FormGroup, targetIndex: number, parentGroup?: Group): boolean {
    const context = this.createDropContext(formDefinition, form, targetIndex, parentGroup);
    if (!context) {
      this.resetDrag();
      return false;
    }

    const result = this.executeFieldDrop(context);
    this.resetDrag();
    return result.success;
  }

  /**
   * Handles dropping an element at a divider position (reordering)
   */
  dropDivider(formDefinition: FormDefinition, targetIndex: number, parentGroup?: Group): void {
    if (!this.draggedElement) return;

    const container = parentGroup || formDefinition;
    const fromIndex = this.findElementIndex(container, this.draggedElement.id);

    if (this.isValidMove(fromIndex, targetIndex)) {
      container.moveChild(fromIndex, targetIndex);
    }

    this.resetDrag();
  }

  private createDropContext(
    formDefinition: FormDefinition,
    form: FormGroup,
    targetIndex: number,
    parentGroup?: Group,
  ): DropContext | null {
    if (!this.draggedElement || targetIndex == null) {
      return null;
    }

    const container = parentGroup || formDefinition;
    const draggedIndex = this.findElementIndex(container, this.draggedElement.id);

    if (!this.isValidDraggedElement(draggedIndex, targetIndex)) {
      return null;
    }

    const target = this.getTargetElement(container, targetIndex);

    return {
      formDefinition,
      form,
      targetIndex,
      parentGroup,
      draggedElement: this.draggedElement,
      target,
    };
  }

  private executeFieldDrop(context: DropContext): DropResult {
    const { target, draggedElement } = context;

    if (!target) {
      return { success: false, message: 'Invalid target' };
    }

    // Groups cannot be dragged
    if (this.isGroup(draggedElement)) {
      return { success: false, message: 'Groups cannot be dragged' };
    }

    if (this.isGroup(target)) {
      return this.dropIntoGroup(context);
    }

    if (this.isField(target)) {
      return this.createGroupFromFields(context);
    }

    return { success: false, message: 'Unknown target type' };
  }

  private dropIntoGroup(context: DropContext): DropResult {
    const { formDefinition, form, parentGroup, draggedElement, target } = context;
    const targetGroup = target as Group;
    const draggedField = draggedElement as Field;

    // Remove from original location
    const sourceContainer = parentGroup || formDefinition;
    if (!sourceContainer.removeChildById(draggedField.id)) {
      return { success: false, message: 'Failed to remove from source' };
    }

    // Add to target group
    targetGroup.addChild(draggedField);

    this.moveControlToGroup(form, draggedField, targetGroup);

    return { success: true };
  }

  private createGroupFromFields(context: DropContext): DropResult {
    const { formDefinition, form, draggedElement, target } = context;
    const draggedField = draggedElement as Field;
    const targetField = target as Field;

    const newGroup = new Group({ label: 'New Group', children: [targetField, draggedField] });

    if (!formDefinition.replaceChild(targetField, newGroup)) {
      return { success: false, message: 'Failed to replace target with group' };
    }

    formDefinition.removeChildById(draggedField.id);
    this.createFormGroupForNewGroup(form, newGroup);

    return { success: true };
  }

  private moveControlToGroup(form: FormGroup, field: Field, targetGroup: Group): void {
    const groupForm = form.get(targetGroup.id) as FormGroup;

    if (!groupForm) {
      console.warn(`Group form control not found: ${targetGroup.id}`);
      return;
    }

    if (!groupForm.contains(field.id)) {
      const control = this.formBuilderService.createControl(field);
      groupForm.addControl(field.id, control);
    }

    // Remove from parent form if it exists there
    if (form.contains(field.id)) {
      form.removeControl(field.id);
    }
  }

  private createFormGroupForNewGroup(form: FormGroup, newGroup: Group): void {
    // Create form group for the new group
    const groupForm = this.formBuilderService.createGroup(newGroup);
    form.addControl(newGroup.id, groupForm);

    // Move existing controls into the new group and remove from parent
    newGroup.children.forEach((child) => {
      if (!groupForm.contains(child.id)) {
        const control = this.formBuilderService.createControl(child);
        groupForm.addControl(child.id, control);
      }

      if (form.contains(child.id)) {
        form.removeControl(child.id);
      }
    });
  }

  private findElementIndex(container: FormDefinition | Group, elementId: string): number {
    return container.children.findIndex((child) => child.id === elementId);
  }

  private getTargetElement(container: FormDefinition | Group, targetIndex: number): FormElement | undefined {
    if (container instanceof Group) {
      return container.children[targetIndex];
    }
    return container.getChildAt(targetIndex);
  }

  private isValidDraggedElement(draggedIndex: number, targetIndex: number): boolean {
    return draggedIndex !== -1 && draggedIndex !== targetIndex;
  }

  private isValidMove(fromIndex: number, targetIndex: number): boolean {
    return fromIndex !== -1 && fromIndex !== targetIndex;
  }

  private isGroup(element: FormElement): element is Group {
    return element instanceof Group;
  }

  private isField(element: FormElement): element is Field {
    return element instanceof Field;
  }
}
