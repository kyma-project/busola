import { describe, it, expect, vi } from 'vitest';
import { prepareRules } from '../prepareRules';

const t = vi.fn((key) => key);

describe('prepareRules', () => {
  describe('output structure', () => {
    it('always returns name, labels, and annotations as the first three entries', () => {
      const result = prepareRules([], false, t);
      expect(result).toHaveLength(3);
      expect(result[0].path).toBe('metadata.name');
      expect(result[1].path).toBe('metadata.labels');
      expect(result[2].path).toBe('metadata.annotations');
    });

    it('appends non-predefined rules after the three default fields', () => {
      const custom = [{ path: 'spec.replicas' }, { path: 'spec.image' }];
      const result = prepareRules(custom, false, t);
      expect(result).toHaveLength(5);
      expect(result[3].path).toBe('spec.replicas');
      expect(result[4].path).toBe('spec.image');
    });

    it('does not duplicate predefined paths when they appear in schemaRules', () => {
      const rules = [
        { path: 'metadata.name', placeholder: 'my-name' },
        { path: 'spec.replicas' },
      ];
      const result = prepareRules(rules, false, t);
      const namePaths = result.filter((r) => r.path === 'metadata.name');
      expect(namePaths).toHaveLength(1);
      expect(result).toHaveLength(4);
    });
  });

  describe('default field shapes', () => {
    it('name field has widget Name, required true, and extraPaths', () => {
      const [nameField] = prepareRules([], false, t);
      expect(nameField.widget).toBe('Name');
      expect(nameField.required).toBe(true);
      expect(nameField.extraPaths).toContain(
        'metadata.labels["app.kubernetes.io/name"]',
      );
    });

    it('labels field has widget KeyValuePair and defaultExpanded false', () => {
      const [, labelsField] = prepareRules([], false, t);
      expect(labelsField.widget).toBe('KeyValuePair');
      expect(labelsField.defaultExpanded).toBe(false);
    });

    it('annotations field has widget KeyValuePair and defaultExpanded false', () => {
      const [, , annotationsField] = prepareRules([], false, t);
      expect(annotationsField.widget).toBe('KeyValuePair');
      expect(annotationsField.defaultExpanded).toBe(false);
    });

    it('name field inputInfo is populated via the t function', () => {
      const [nameField] = prepareRules([], false, t);
      expect(t).toHaveBeenCalledWith('common.tooltips.k8s-name-input');
      expect(nameField.inputInfo).toBe('common.tooltips.k8s-name-input');
    });
  });

  describe('disableOnEdit propagation', () => {
    it('passes disableOnEdit=true to the name field', () => {
      const [nameField] = prepareRules([], true, t);
      expect(nameField.disableOnEdit).toBe(true);
    });

    it('passes disableOnEdit=false to the name field', () => {
      const [nameField] = prepareRules([], false, t);
      expect(nameField.disableOnEdit).toBe(false);
    });
  });

  describe('schema rule merging', () => {
    it('schema rule properties override name field defaults', () => {
      const rules = [
        { path: 'metadata.name', widget: 'CustomWidget', required: false },
      ];
      const [nameField] = prepareRules(rules, false, t);
      expect(nameField.widget).toBe('CustomWidget');
      expect(nameField.required).toBe(false);
    });

    it('schema rule properties override labels field defaults', () => {
      const rules = [{ path: 'metadata.labels', defaultExpanded: true }];
      const [, labelsField] = prepareRules(rules, false, t);
      expect(labelsField.defaultExpanded).toBe(true);
    });

    it('schema rule properties override annotations field defaults', () => {
      const rules = [{ path: 'metadata.annotations', widget: 'Annotations' }];
      const [, , annotationsField] = prepareRules(rules, false, t);
      expect(annotationsField.widget).toBe('Annotations');
    });

    it('default properties are preserved when schema rule adds new ones', () => {
      const rules = [{ path: 'metadata.name', placeholder: 'Enter name' }];
      const [nameField] = prepareRules(rules, false, t);
      expect(nameField.widget).toBe('Name');
      expect(nameField.required).toBe(true);
      expect(nameField.placeholder).toBe('Enter name');
    });

    it('non-predefined rules are passed through unchanged', () => {
      const custom = {
        path: 'spec.replicas',
        widget: 'Number',
        required: false,
      };
      const result = prepareRules([custom], false, t);
      expect(result[3]).toEqual(custom);
    });
  });
});
