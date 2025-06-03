import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '@models/field.model';
import { FormDefinition, FormElement } from '@models/form-definition.model';
import { Group } from '@models/group.model';
import { FormBuilderService } from './form-builder.service';

@Injectable({ providedIn: 'root' })
export class DragDropService {
  private draggedElement: FormElement | null = null;

  constructor(private formBuilderService: FormBuilderService) {}

  startDrag(element: FormElement): void {
    this.draggedElement = element;
  }

  resetDrag(): void {
    this.draggedElement = null;
  }

  dropField(formDefinition: FormDefinition, form: FormGroup, targetIndex: number, parentGroup?: Group): boolean {
    // If there’s no dragged element, or targetIndex is invalid, bail out
    if (!this.draggedElement || targetIndex == null) {
      return false;
    }

    // Find the dragged element’s index in the correct list
    let fromIndex: number;
    if (parentGroup) {
      fromIndex = parentGroup.children.findIndex((c) => c.id === this.draggedElement!.id);
    } else {
      fromIndex = formDefinition.children.findIndex((c) => c.id === this.draggedElement!.id);
    }
    if (fromIndex === -1 || fromIndex === targetIndex) {
      this.resetDrag();
      return false;
    }

    // “dragged” and “target” now by index from the top‐level definition (if no parentGroup),
    // or from the parentGroup.children (if dropping inside a group)
    const dragged = this.draggedElement;
    let target: FormElement | undefined;
    if (parentGroup) {
      target = parentGroup.children[targetIndex];
    } else {
      target = formDefinition.getChildAt(targetIndex);
    }

    // If the dragged element is a Group, we do not allow it
    if (dragged instanceof Group) {
      this.resetDrag();
      return false;
    }

    if (!target) {
      this.resetDrag();
      return false;
    }

    // --- Case A: dropping onto an existing Group (inside that group) ---
    if (target instanceof Group) {
      // remove dragged from its original location first
      if (parentGroup) {
        parentGroup.removeChildById(dragged.id);
      } else {
        formDefinition.removeChildById(dragged.id);
      }

      // add it as a child of target group
      (target as Group).addChild(dragged);

      // ensure the FormControl moves into the group’s FormGroup
      const groupForm = form.get(target.id) as FormGroup;
      if (groupForm && !groupForm.contains(dragged.id)) {
        const control = this.formBuilderService.createControl(dragged as Field);
        groupForm.addControl(dragged.id, control);
      }

      this.resetDrag();
      return true;
    }

    // --- Case B: dropping onto another Field at the same level → create a new group ---
    if (target instanceof Field) {
      // Build a new group containing the two fields
      const newGroup = new Group('New Group', [target as Field, dragged as Field]);

      // Replace the “target” field in the form definition with this newGroup
      const replaced = formDefinition.replaceChild(target, newGroup);
      if (!replaced) {
        this.resetDrag();
        return false;
      }

      // Remove both original fields from top‐level
      formDefinition.removeChildById(dragged.id);
      formDefinition.removeChildById(target.id);

      // Create a nested FormGroup for the new group
      const groupForm = this.formBuilderService.createGroup(newGroup);
      form.addControl(newGroup.id, groupForm);

      // Move each child’s FormControl into that nested group, and remove from top‐level
      for (const child of newGroup.children) {
        if (!groupForm.contains(child.id)) {
          const control = this.formBuilderService.createControl(child);
          groupForm.addControl(child.id, control);
        }
        if (form.contains(child.id)) {
          form.removeControl(child.id);
        }
      }

      this.resetDrag();
      return true;
    }

    this.resetDrag();
    return false;
  }

  dropDivider(formDefinition: FormDefinition, targetIndex: number, parentGroup?: Group): void {
    if (!this.draggedElement) return;

    if (parentGroup) {
      const fromIndex = parentGroup.children.findIndex((c) => c.id === this.draggedElement!.id);
      if (fromIndex === -1 || fromIndex === targetIndex) return;

      parentGroup.moveChild(fromIndex, targetIndex);
    } else {
      const fromIndex = formDefinition.children.findIndex((c) => c.id === this.draggedElement!.id);
      if (fromIndex === -1 || fromIndex === targetIndex) return;

      formDefinition.moveChild(fromIndex, targetIndex);
    }

    this.resetDrag();
  }
}
