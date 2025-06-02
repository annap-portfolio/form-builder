import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '@models/field.model';
import { FormDefinition } from '@models/form-definition.model';
import { Group } from '@models/group.model';
import { FormBuilderService } from './form-builder.service';

@Injectable({ providedIn: 'root' })
export class DragDropService {
  private draggedIndex: number | null = null;

  constructor(private formBuilderService: FormBuilderService) {}

  startDrag(index: number): void {
    this.draggedIndex = index;
  }

  resetDrag(): void {
    this.draggedIndex = null;
  }

  dropField(formDefinition: FormDefinition, form: FormGroup, targetIndex: number): boolean {
    if (this.draggedIndex == null || targetIndex == null || this.draggedIndex === targetIndex) {
      return false;
    }

    const dragged = formDefinition.getChildAt(this.draggedIndex);
    const target = formDefinition.getChildAt(targetIndex);

    // Prevent dragging a group
    if (dragged instanceof Group || !dragged || !target) {
      this.resetDrag();
      return false;
    }

    // Drop onto a group: move dragged field into group
    if (target instanceof Group) {
      target.addChild(dragged);
      formDefinition.removeChildById(dragged.id);

      const groupForm = form.get(target.id) as FormGroup;
      if (!groupForm.contains(dragged.id)) {
        const control = this.formBuilderService.createControl(dragged as Field);
        groupForm.addControl(dragged.id, control);
      }

      this.resetDrag();
      return true;
    }

    // Drop onto another field: create a group of both
    const newGroup = new Group('New Group', [target as Field, dragged as Field]);

    const replaced = formDefinition.replaceChild(target, newGroup);
    if (!replaced) {
      this.resetDrag();
      return false;
    }

    formDefinition.removeChildById(dragged.id);
    formDefinition.removeChildById(target.id);

    const groupForm = this.formBuilderService.createGroup(newGroup);
    form.addControl(newGroup.id, groupForm);

    for (const field of newGroup.children) {
      if (!groupForm.contains(field.id)) {
        const control = this.formBuilderService.createControl(field);
        groupForm.addControl(field.id, control);
      }

      // Remove from root if already exists
      if (form.contains(field.id)) {
        form.removeControl(field.id);
      }
    }

    this.resetDrag();
    return true;
  }

  dropDivider(formDefinition: FormDefinition, targetIndex: number) {
    if (this.draggedIndex === null || this.draggedIndex === targetIndex) return;
    formDefinition.moveChild(this.draggedIndex, targetIndex);

    this.resetDrag();
  }
}
