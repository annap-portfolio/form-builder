import { Field } from '../models/field.model';
import { Group } from '../models/group.model';
import { FormElement } from '../models/form-definition.model';

export function isGroup(element: FormElement): element is Group {
  return element instanceof Group;
}

export function isField(element: FormElement): element is Field {
  return element instanceof Field;
}
