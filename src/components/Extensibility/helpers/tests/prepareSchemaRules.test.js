import { describe, it, expect } from 'vitest';
import { prepareSchemaRules } from '../prepareSchemaRules';

describe('prepareSchemaRules', () => {
  describe('return structure', () => {
    it('returns a root node with an empty path and a children array', () => {
      const result = prepareSchemaRules([]);
      expect(result).toEqual({ path: [], children: [] });
    });

    it('returns root with empty children when given an empty array', () => {
      expect(prepareSchemaRules([]).children).toHaveLength(0);
    });
  });

  describe('flat rules', () => {
    it('builds a nested tree for a dotted path', () => {
      const result = prepareSchemaRules([{ path: 'spec.replicas' }]);
      const spec = result.children.find((c) => c.path.join('.') === 'spec');
      expect(spec).toBeDefined();
      expect(spec.children[0].path).toEqual(['spec', 'replicas']);
    });

    it('places the rule metadata on the leaf node only', () => {
      const rule = { path: 'spec.replicas', widget: 'Number', required: true };
      const result = prepareSchemaRules([rule]);
      const spec = result.children[0];
      expect(spec.widget).toBeUndefined();
      const leaf = spec.children[0];
      expect(leaf.widget).toBe('Number');
      expect(leaf.required).toBe(true);
    });

    it('sets custom=false for path-based rules', () => {
      const result = prepareSchemaRules([{ path: 'spec.replicas' }]);
      const leaf = result.children[0].children[0];
      expect(leaf.custom).toBe(false);
    });

    it('sets custom=true when no path is provided', () => {
      const result = prepareSchemaRules([{ widget: 'Text' }]);
      expect(result.children[0].custom).toBe(true);
    });

    it('accepts an array path', () => {
      const result = prepareSchemaRules([{ path: ['spec', 'replicas'] }]);
      const leaf = result.children[0].children[0];
      expect(leaf.path).toEqual(['spec', 'replicas']);
    });

    it('normalises bracket notation to [] segments', () => {
      const result = prepareSchemaRules([{ path: 'spec.items[].name' }]);
      const spec = result.children[0];
      const items = spec.children[0];
      expect(items.path).toEqual(['spec', 'items']);
      const arrayNode = items.children[0];
      expect(arrayNode.path).toEqual(['spec', 'items', '[]']);
      const name = arrayNode.children[0];
      expect(name.path).toEqual(['spec', 'items', '[]', 'name']);
    });

    it('every node carries an itemVars array', () => {
      const result = prepareSchemaRules([{ path: 'a.b' }]);
      const a = result.children[0];
      const b = a.children[0];
      expect(Array.isArray(a.itemVars)).toBe(true);
      expect(Array.isArray(b.itemVars)).toBe(true);
    });
  });

  describe('path sharing between sibling rules', () => {
    it('shares intermediate nodes when two rules have a common prefix', () => {
      const result = prepareSchemaRules([
        { path: 'spec.replicas' },
        { path: 'spec.image' },
      ]);
      expect(result.children).toHaveLength(1);
      const spec = result.children[0];
      expect(spec.children).toHaveLength(2);
    });

    it('does not share nodes across different top-level segments', () => {
      const result = prepareSchemaRules([
        { path: 'spec.replicas' },
        { path: 'metadata.name' },
      ]);
      expect(result.children).toHaveLength(2);
    });
  });

  describe('custom / var / widget rules (no path)', () => {
    it('names a pathless node custom0, custom1, etc.', () => {
      const result = prepareSchemaRules([
        { widget: 'Text' },
        { widget: 'Number' },
      ]);
      expect(result.children[0].path).toEqual(['custom0']);
      expect(result.children[1].path).toEqual(['custom1']);
    });

    it('uses $varName as the path segment when var is provided', () => {
      const result = prepareSchemaRules([{ var: 'myVar' }]);
      expect(result.children[0].path).toEqual(['$myVar']);
    });

    it('uses []/customN path for GenericList widget children without a path', () => {
      const parent = {
        path: 'spec.items',
        widget: 'GenericList',
        children: [{ widget: 'Text' }],
      };
      const result = prepareSchemaRules([parent]);
      // result.children[0] = spec, .children[0] = items, .children[0] = [] node
      const itemsNode = result.children[0].children[0];
      const arrayNode = itemsNode.children[0];
      expect(arrayNode.path).toEqual(['spec', 'items', '[]']);
      const child = arrayNode.children[0];
      expect(child.path).toEqual(['spec', 'items', '[]', 'custom0']);
    });
  });

  describe('nested children', () => {
    it('processes ruleDef.children recursively', () => {
      const rule = {
        path: 'spec',
        children: [{ path: 'replicas' }, { path: 'image' }],
      };
      const result = prepareSchemaRules([rule]);
      // children hang directly off the spec node (path: ['spec'])
      const spec = result.children[0];
      expect(spec.path).toEqual(['spec']);
      expect(spec.children).toHaveLength(2);
      expect(spec.children[0].path).toEqual(['spec', 'replicas']);
      expect(spec.children[1].path).toEqual(['spec', 'image']);
    });
  });

  describe('itemVars propagation', () => {
    it('propagates itemVars from an array node to its children', () => {
      const rule = {
        path: 'spec.items[]',
        var: 'item',
        children: [{ path: 'name' }],
      };
      const result = prepareSchemaRules([rule]);
      const spec = result.children[0];
      const items = spec.children[0];
      const arrayNode = items.children.find((c) => c.path.includes('[]'));
      expect(arrayNode).toBeDefined();
      expect(arrayNode.itemVars).toContain('item');
    });
  });

  describe('filter option', () => {
    it('excludes rule defs that do not match the filter', () => {
      const rules = [
        { path: 'spec.replicas', widget: 'Number' },
        { path: 'spec.image', widget: 'Text' },
      ];
      const result = prepareSchemaRules(rules, (r) => r.widget === 'Number');
      const spec = result.children[0];
      expect(spec.children).toHaveLength(1);
      expect(spec.children[0].path).toEqual(['spec', 'replicas']);
    });

    it('keeps all rules when filter always returns true (default)', () => {
      const rules = [{ path: 'a' }, { path: 'b' }];
      const result = prepareSchemaRules(rules);
      expect(result.children).toHaveLength(2);
    });

    it('returns a root with empty children when all rules are filtered out', () => {
      const rules = [{ path: 'spec.replicas' }];
      const result = prepareSchemaRules(rules, () => false);
      expect(result.children).toHaveLength(0);
    });

    it('returns root with empty children when an empty array is passed', () => {
      const result = prepareSchemaRules([]);
      expect(result.children).toHaveLength(0);
    });
  });
});
