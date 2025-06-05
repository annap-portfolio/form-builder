import { Group, GroupConfig, MoveResult } from './group.model';
import { Field } from './field.model';
import { InputType } from './input-type.model';

describe('Group', () => {
  let group: Group;
  let mockField1: Field;
  let mockField2: Field;
  let mockField3: Field;

  beforeEach(() => {
    mockField1 = new Field({ id: 'field-1', label: 'Field 1', type: InputType.TEXT });
    mockField2 = new Field({ id: 'field-2', label: 'Field 2', type: InputType.EMAIL });
    mockField3 = new Field({ id: 'field-3', label: 'Field 3', type: InputType.NUMBER });

    const config: GroupConfig = {
      label: 'Test Group',
      children: [],
    };
    group = new Group(config);
  });

  describe('Constructor', () => {
    it('should create group with config', () => {
      const config: GroupConfig = {
        id: 'custom-id',
        label: 'Custom Group',
        children: [mockField1],
      };

      const customGroup = new Group(config);

      expect(customGroup.id).toBe('custom-id');
      expect(customGroup.label).toBe('Custom Group');
      expect(customGroup.children).toContain(mockField1);
      expect(customGroup.type).toBe(InputType.GROUP);
    });

    it('should generate UUID when no id provided', () => {
      const config: GroupConfig = {
        label: 'Auto ID Group',
        children: [],
      };

      const autoIdGroup = new Group(config);

      expect(autoIdGroup.id).toBeDefined();
      expect(autoIdGroup.id.length).toBeGreaterThan(0);
    });
  });

  describe('Child Management', () => {
    it('should add child field', () => {
      group.addChild(mockField1);

      expect(group.children).toContain(mockField1);
      expect(group.childCount).toBe(1);
    });

    it('should add multiple children at once', () => {
      group.addChildren([mockField1, mockField2]);

      expect(group.childCount).toBe(2);
      expect(group.children).toContain(mockField1);
      expect(group.children).toContain(mockField2);
    });

    it('should remove child by id', () => {
      group.addChild(mockField1);
      group.addChild(mockField2);

      const result = group.removeChildById('field-1');

      expect(result).toBe(true);
      expect(group.children).not.toContain(mockField1);
      expect(group.childCount).toBe(1);
    });

    it('should return false when removing non-existent child', () => {
      const result = group.removeChildById('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('Child Access', () => {
    beforeEach(() => {
      group.addChildren([mockField1, mockField2, mockField3]);
    });

    it('should get child by id', () => {
      const found = group.getChild('field-2');

      expect(found).toBe(mockField2);
    });

    it('should return undefined for non-existent child', () => {
      const found = group.getChild('non-existent');

      expect(found).toBeUndefined();
    });

    it('should get child by index', () => {
      expect(group.getChildAt(0)).toBe(mockField1);
      expect(group.getChildAt(1)).toBe(mockField2);
      expect(group.getChildAt(5)).toBeUndefined();
    });

    it('should check if child exists', () => {
      expect(group.hasChild('field-1')).toBe(true);
      expect(group.hasChild('non-existent')).toBe(false);
    });

    it('should get child index', () => {
      expect(group.getChildIndex('field-2')).toBe(1);
      expect(group.getChildIndex('non-existent')).toBe(-1);
    });

    it('should check if group is empty', () => {
      expect(group.isEmpty()).toBe(false);

      const emptyGroup = new Group({ label: 'Empty', children: [] });
      expect(emptyGroup.isEmpty()).toBe(true);
    });
  });

  describe('Child Updates', () => {
    beforeEach(() => {
      group.addChild(mockField1);
    });

    it('should update existing child', () => {
      const updatedField = new Field({ id: 'field-1', label: 'Updated Field', type: InputType.TEXT });

      const result = group.updateChild(updatedField);

      expect(result).toBe(true);
      expect(group.getChild('field-1')).toBe(updatedField);
    });

    it('should return false when updating non-existent child', () => {
      const nonExistentField = new Field({ id: 'non-existent', type: InputType.TEXT });

      const result = group.updateChild(nonExistentField);

      expect(result).toBe(false);
    });

    it('should replace existing child', () => {
      const replacementField = new Field({ id: 'replacement', type: InputType.EMAIL });

      const result = group.replaceChild(mockField1, replacementField);

      expect(result).toBe(true);
      expect(group.getChild('replacement')).toBe(replacementField);
      expect(group.getChild('field-1')).toBeUndefined();
    });
  });

  describe('Move Operations', () => {
    beforeEach(() => {
      group.addChildren([mockField1, mockField2, mockField3]);
    });

    it('should move child from lower to higher index', () => {
      const result = group.moveChild(0, 2);

      expect(result.success).toBe(true);
      expect(group.getChildAt(0)).toBe(mockField2);
      expect(group.getChildAt(1)).toBe(mockField1);
      expect(group.getChildAt(2)).toBe(mockField3);
    });

    it('should move child from higher to lower index', () => {
      const result = group.moveChild(2, 0);

      expect(result.success).toBe(true);
      expect(group.getChildAt(0)).toBe(mockField3);
      expect(group.getChildAt(1)).toBe(mockField1);
      expect(group.getChildAt(2)).toBe(mockField2);
    });

    it('should return error for same index move', () => {
      const result = group.moveChild(1, 1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Source and target indices are the same');
    });

    it('should return error for out of bounds indices', () => {
      expect(group.moveChild(-1, 1).success).toBe(false);
      expect(group.moveChild(5, 1).success).toBe(false);
      expect(group.moveChild(1, -1).success).toBe(false);
      expect(group.moveChild(1, 5).success).toBe(false);
    });
  });

  describe('Search and Filter Operations', () => {
    beforeEach(() => {
      mockField1.label = 'Text Field';
      mockField2.label = 'Email Field';
      group.addChildren([mockField1, mockField2]);
    });

    it('should find children by predicate', () => {
      const textFields = group.findChildren((field) => field.type === InputType.TEXT);

      expect(textFields).toContain(mockField1);
      expect(textFields).not.toContain(mockField2);
    });

    it('should create filtered group', () => {
      const filteredGroup = group.filter((field) => field.type === InputType.TEXT);

      expect(filteredGroup.childCount).toBe(1);
      expect(filteredGroup.children).toContain(mockField1);
      expect(filteredGroup.label).toBe(group.label);
    });
  });

  describe('Validation', () => {
    it('should validate valid group', () => {
      group.addChild(mockField1);

      const validation = group.validate();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should catch empty label', () => {
      const emptyLabelGroup = new Group({ label: '   ', children: [] });

      const validation = emptyLabelGroup.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Group label cannot be empty');
    });

    it('should catch duplicate child IDs in validation', () => {
      // This test simulates what would happen if duplicate IDs somehow got in
      // (though normal addChild prevents this)
      const duplicateField = new Field({ id: 'field-1', type: InputType.TEXT });

      group.addChild(mockField1);
      // Bypass normal addChild validation by directly manipulating internal array
      (group as any)._children.push(duplicateField);

      const validation = group.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Duplicate child ID found: field-1');
    });
  });

  describe('JSON Serialization', () => {
    beforeEach(() => {
      // Mock toJSON method on fields
      spyOn(mockField1, 'toJSON').and.returnValue({ id: 'field-1', type: InputType.TEXT });
      group.addChild(mockField1);
    });

    it('should convert to JSON', () => {
      const json = group.toJSON();

      expect(json['type']).toBe(InputType.GROUP);
      expect(json['id']).toBe(group.id);
      expect(json['label']).toBe(group.label);
      expect(json['children'].length).toBe(1);
      expect(mockField1.toJSON).toHaveBeenCalled();
    });

    it('should create group from JSON', () => {
      const jsonData = {
        id: 'json-group',
        label: 'JSON Group',
        children: [mockField1, mockField2],
      };

      const fromJsonGroup = Group.fromJSON(jsonData);

      expect(fromJsonGroup.id).toBe('json-group');
      expect(fromJsonGroup.label).toBe('JSON Group');
      expect(fromJsonGroup.children).toEqual([mockField1, mockField2]);
    });

    it('should handle missing children in JSON', () => {
      const jsonData = {
        id: 'minimal-group',
        label: 'Minimal Group',
      };

      const fromJsonGroup = Group.fromJSON(jsonData);

      expect(fromJsonGroup.children).toEqual([]);
    });
  });
});
