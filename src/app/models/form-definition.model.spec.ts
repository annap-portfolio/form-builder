import { FormDefinition, FormElement } from './form-definition.model';
import { Field } from './field.model';
import { Group } from './group.model';
import { InputType } from './input-type.model';

describe('FormDefinition', () => {
  let formDef: FormDefinition;
  let mockField: Field;
  let mockGroup: Group;

  beforeEach(() => {
    mockField = new Field({ id: 'field-1', label: 'Test Field', type: InputType.TEXT });

    mockGroup = new Group({ label: 'Test Group', children: [] });
    mockGroup.id = 'group-1';

    formDef = new FormDefinition();
  });

  describe('Constructor', () => {
    it('should create empty form definition by default', () => {
      expect(formDef.children).toEqual([]);
    });

    it('should initialize with provided fields', () => {
      const fields = [mockField, mockGroup];
      const form = new FormDefinition(fields);

      expect(form.children).toEqual(fields);
    });
  });

  describe('Child Management', () => {
    it('should add child element', () => {
      formDef.addChild(mockField);

      expect(formDef.children).toContain(mockField);
      expect(formDef.children.length).toBe(1);
    });

    it('should get child at specific index', () => {
      formDef.addChild(mockField);
      formDef.addChild(mockGroup);

      expect(formDef.getChildAt(0)).toBe(mockField);
      expect(formDef.getChildAt(1)).toBe(mockGroup);
      expect(formDef.getChildAt(2)).toBeUndefined();
    });

    it('should replace existing child', () => {
      const newField = new Field({ id: 'field-1', label: 'Test Field', type: InputType.EMAIL });

      formDef.addChild(mockField);
      const result = formDef.replaceChild(mockField, newField);

      expect(result).toBe(true);
      expect(formDef.children[0]).toBe(newField);
    });

    it('should return false when replacing non-existent child', () => {
      const newField = new Field({ id: 'non-existent', label: 'Test Field', type: InputType.EMAIL });

      const result = formDef.replaceChild(mockField, newField);

      expect(result).toBe(false);
    });

    it('should remove child by id', () => {
      formDef.addChild(mockField);
      formDef.addChild(mockGroup);

      const result = formDef.removeChildById('field-1');

      expect(result).toBe(true);
      expect(formDef.children).not.toContain(mockField);
      expect(formDef.children.length).toBe(1);
    });

    it('should return false when removing non-existent child', () => {
      const result = formDef.removeChildById('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('Element Finding and Updating', () => {
    it('should find child by id at root level', () => {
      formDef.addChild(mockField);

      const found = formDef.findChildById('field-1');

      expect(found).toBe(mockField);
    });

    it('should find child by id in nested groups', () => {
      const nestedField = new Field({ id: 'nested-field', label: 'Test Field', type: InputType.NUMBER });

      mockGroup.addChild(nestedField);
      formDef.addChild(mockGroup);

      const found = formDef.findChildById('nested-field');

      expect(found).toBe(nestedField);
    });

    it('should return undefined for non-existent id', () => {
      const found = formDef.findChildById('non-existent');

      expect(found).toBeUndefined();
    });

    it('should update existing field', () => {
      formDef.addChild(mockField);

      const updatedField = new Field({ id: 'field-1', label: 'Updated Label', type: InputType.TEXT });

      const result = formDef.updateElement(updatedField);

      expect(result).toBe(true);
      expect(mockField.label).toBe('Updated Label');
    });

    it('should update existing group', () => {
      formDef.addChild(mockGroup);

      const updatedGroup = new Group({ label: 'Updated Group', children: [] });
      updatedGroup.id = 'group-1';

      const result = formDef.updateElement(updatedGroup);

      expect(result).toBe(true);
      expect(mockGroup.label).toBe('Updated Group');
    });
  });

  describe('Move Operations', () => {
    beforeEach(() => {
      const field2 = new Field({ id: 'field-2', label: 'Test Field', type: InputType.EMAIL });

      formDef.addChild(mockField);
      formDef.addChild(mockGroup);
      formDef.addChild(field2);
    });

    it('should move child from lower to higher index', () => {
      const result = formDef.moveChild(0, 2);

      expect(result).toBe(true);
      expect(formDef.getChildAt(0)).toBe(mockGroup);
      expect(formDef.getChildAt(1)).toBe(mockField);
    });

    it('should move child from higher to lower index', () => {
      const result = formDef.moveChild(2, 0);

      expect(result).toBe(true);
      expect(formDef.getChildAt(0)?.id).toBe('field-2');
      expect(formDef.getChildAt(1)).toBe(mockField);
    });

    it('should return false for invalid move operations', () => {
      expect(formDef.moveChild(0, 0)).toBe(false); // same index
      expect(formDef.moveChild(-1, 1)).toBe(false); // negative from
      expect(formDef.moveChild(1, -1)).toBe(false); // negative to
      expect(formDef.moveChild(5, 1)).toBe(false); // from index out of bounds
      expect(formDef.moveChild(1, 5)).toBe(false); // to index out of bounds
    });
  });

  describe('Field Collection', () => {
    it('should get all fields including nested ones', () => {
      const nestedField = new Field({ id: 'nested-filed', type: InputType.NUMBER });

      mockGroup.addChild(nestedField);
      formDef.addChild(mockField);
      formDef.addChild(mockGroup);

      const fields = formDef.getAllFields();

      expect(fields).toContain(mockField);
      expect(fields).toContain(nestedField);
      expect(fields.length).toBe(2);
    });

    it('should get correct field count', () => {
      const nestedField = new Field({ type: InputType.NUMBER });
      mockGroup.addChild(nestedField);
      formDef.addChild(mockField);
      formDef.addChild(mockGroup);

      expect(formDef.getFieldCount()).toBe(2);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize to JSON', () => {
      formDef.addChild(mockField);

      const json = formDef.toJSON();
      const parsed = JSON.parse(json);

      expect(parsed.fields).toBeDefined();
      expect(parsed.fields.length).toBe(1);
      expect(parsed.fields[0].id).toBe('field-1');
    });

    it('should deserialize from JSON with fields property', () => {
      const json = JSON.stringify({
        fields: [{ id: 'field-1', type: InputType.TEXT, label: 'Test Field' }],
      });

      const form = FormDefinition.fromJSON(json);

      expect(form.children.length).toBe(1);
      expect(form.children[0].id).toBe('field-1');
    });

    it('should deserialize from JSON with children property', () => {
      const json = JSON.stringify({
        children: [{ id: 'field-1', type: InputType.TEXT, label: 'Test Field' }],
      });

      const form = FormDefinition.fromJSON(json);

      expect(form.children.length).toBe(1);
      expect(form.children[0].id).toBe('field-1');
    });

    it('should handle groups in JSON', () => {
      const json = JSON.stringify({
        fields: [
          {
            id: 'group-1',
            type: InputType.GROUP,
            label: 'Test Group',
            children: [{ id: 'field-1', type: InputType.TEXT, label: 'Nested Field' }],
          },
        ],
      });

      const form = FormDefinition.fromJSON(json);

      expect(form.children.length).toBe(1);
      expect(form.children[0]).toBeInstanceOf(Group);
      expect(form.getAllFields().length).toBe(1);
    });
  });
});
