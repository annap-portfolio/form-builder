import { Group } from './group.model';
import { Field } from './field.model';
import { InputType } from './input-type.model';

describe('Group', () => {
  let field1: Field;
  let field2: Field;
  let group: Group;

  beforeEach(() => {
    field1 = new Field(InputType.TEXT);
    field2 = new Field(InputType.CHECKBOX);
    group = new Group('Test Group', [field1]);
  });

  it('should initialise with label and children', () => {
    expect(group.label).toBe('Test Group');
    expect(group.children.length).toBe(1);
    expect(group.children[0]).toBe(field1);
    expect(group.type).toBe(InputType.GROUP);
    expect(group.id).toBeDefined();
  });

  it('should add a child', () => {
    group.addChild(field2);
    expect(group.children.length).toBe(2);
    expect(group.children[1]).toBe(field2);
  });

  it('should remove a child by id', () => {
    group.addChild(field2);
    group.removeChild(field1.id);
    expect(group.children.length).toBe(1);
    expect(group.children[0]).toBe(field2);
  });

  it('should return child by id using getChild', () => {
    expect(group.getChild(field1.id)).toBe(field1);
    expect(group.getChild('nonexistent')).toBeUndefined();
  });

  it('should detect if group is empty', () => {
    expect(group.isEmpty()).toBeFalse();
    group.removeChild(field1.id);
    expect(group.isEmpty()).toBeTrue();
  });

  it('should update a child if it exists', () => {
    const updatedField = new Field(InputType.TEXT);
    updatedField.id = field1.id;
    updatedField.label = 'Updated label';

    const result = group.updateChild(updatedField);
    expect(result).toBeTrue();
    expect(group.getChild(field1.id)?.label).toBe('Updated label');
  });

  it('should return false when updating a non-existent child', () => {
    const nonExistent = new Field(InputType.TEXT);
    nonExistent.id = 'fake-id';

    const result = group.updateChild(nonExistent);
    expect(result).toBeFalse();
  });

  it('should find a child by id recursively', () => {
    const nestedField = new Field(InputType.EMAIL);
    const nestedGroup = new Group('Nested Group', [nestedField]);
    group.addChild(nestedGroup as any); // force insert as Field[] only

    const found = group.findChildById(nestedField.id);
    expect(found).toBe(nestedField);
  });

  it('should return undefined from findChildById if not found', () => {
    expect(group.findChildById('nope')).toBeUndefined();
  });

  it('should serialize to JSON correctly', () => {
    const json = group.toJSON();
    expect(json).toEqual(
      jasmine.objectContaining({
        type: InputType.GROUP,
        id: group.id,
        label: 'Test Group',
        children: group.children,
      }),
    );
  });
});
