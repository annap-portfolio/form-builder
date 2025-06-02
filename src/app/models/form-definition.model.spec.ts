import { FormDefinition } from './form-definition.model';
import { Field } from './field.model';
import { Group } from './group.model';
import { InputType } from './input-type.model';

describe('FormDefinition', () => {
  let formDef: FormDefinition;

  beforeEach(() => {
    formDef = new FormDefinition();
  });

  it('should initialise with no children', () => {
    expect(formDef.children.length).toBe(0);
  });

  it('should add a child', () => {
    const field = new Field(InputType.TEXT);
    formDef.addChild(field);
    expect(formDef.children.length).toBe(1);
    expect(formDef.children[0]).toBe(field);
  });

  it('should remove a child by ID', () => {
    const field = new Field(InputType.TEXT);
    formDef.addChild(field);
    formDef.removeChildById(field.id);
    expect(formDef.children.length).toBe(0);
  });

  it('should replace a child', () => {
    const field1 = new Field(InputType.TEXT);
    const field2 = new Field(InputType.NUMBER);
    formDef.addChild(field1);
    const replaced = formDef.replaceChild(field1, field2);
    expect(replaced).toBeTrue();
    expect(formDef.children[1]).toBe(field2);
  });

  it('should not replace if child not found', () => {
    const field1 = new Field(InputType.TEXT);
    const field2 = new Field(InputType.NUMBER);
    const replaced = formDef.replaceChild(field1, field2);
    expect(replaced).toBeFalse();
  });

  it('should update a top-level field', () => {
    const field = new Field(InputType.TEXT);
    field.label = 'Original';
    formDef.addChild(field);

    const updated = new Field(InputType.TEXT);
    updated.id = field.id;
    updated.label = 'Updated';

    const result = formDef.updateField(updated);
    expect(result).toBeTrue();
    expect(formDef.children[0]['label']).toBe('Updated');
  });

  it('should update a nested field in a group', () => {
    const field = new Field(InputType.TEXT);
    const group = new Group('Group 1', [field]);
    formDef.addChild(group);

    const updated = new Field(InputType.TEXT);
    updated.id = field.id;
    updated.label = 'Updated';

    const result = formDef.updateField(updated);
    expect(result).toBeTrue();
    expect((formDef.children[0] as Group).children[0]['label']).toBe('Updated');
  });

  it('should find a field by ID', () => {
    const field = new Field(InputType.TEXT);
    formDef.addChild(field);
    const found = formDef.findChildById(field.id);
    expect(found).toBe(field);
  });

  it('should find a nested field by ID', () => {
    const field = new Field(InputType.TEXT);
    const group = new Group('Nested Group', [field]);
    formDef.addChild(group);

    const found = formDef.findChildById(field.id);
    expect(found).toBe(field);
  });

  it('should move a child correctly', () => {
    const field1 = new Field(InputType.TEXT);
    const field2 = new Field(InputType.NUMBER);
    const field3 = new Field(InputType.CHECKBOX);

    formDef = new FormDefinition([field1, field2, field3]);
    const moved = formDef.moveChild(0, 2);
    expect(moved).toBeTrue();
    expect(formDef.children[1]).toBe(field1);
  });

  it('should not move if indices are invalid', () => {
    const field1 = new Field(InputType.TEXT);
    formDef.addChild(field1);
    expect(formDef.moveChild(-1, 0)).toBeFalse();
    expect(formDef.moveChild(0, -1)).toBeFalse();
  });

  it('should serialise and deserialise correctly', () => {
    const field = new Field(InputType.TEXT);
    field.label = 'Name';
    const group = new Group('Info', [field]);

    formDef = new FormDefinition([group]);

    const json = formDef.toJSON();
    const restored = FormDefinition.fromJSON(json);

    expect(restored.children.length).toBe(1);
    const restoredGroup = restored.children[0] as Group;
    expect(restoredGroup.label).toBe('Info');
    expect(restoredGroup.children.length).toBe(1);
    expect(restoredGroup.children[0] instanceof Field).toBeTrue();
    expect(restoredGroup.children[0].label).toBe('Name');
  });

  it('should return the child at a given valid index', () => {
    const field1 = new Field(InputType.TEXT);
    const field2 = new Field(InputType.NUMBER);
    formDef = new FormDefinition([field1, field2]);

    expect(formDef.getChildAt(0)).toBe(field1);
    expect(formDef.getChildAt(1)).toBe(field2);
  });
});
