import { describe, it, expect } from 'vitest';
import { cleanResource } from './immutableConverter';

describe('cleanResource', () => {
  describe('removes empty strings not in template', () => {
    it('removes empty string properties not in template', () => {
      const resource = { a: '' };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({});
    });

    it('removes nested empty string properties not in template', () => {
      const resource = { a: { b: '' } };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({});
    });

    it('keeps siblings when removing empty strings', () => {
      const resource = { a: { b: '', c: 'value' } };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({
        a: { c: 'value' },
      });
    });

    it('removes deeply nested empty strings and cleans up parent objects', () => {
      const resource = { a: { b: { c: { d: '' } } } };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({});
    });
  });

  describe('preserves template fields even when empty', () => {
    it('preserves empty string if in template', () => {
      const resource = { a: '' };
      const template = { a: '' };
      expect(cleanResource(resource, template)).toEqual({ a: '' });
    });

    it('preserves empty object if in template', () => {
      const resource = { a: {} };
      const template = { a: {} };
      expect(cleanResource(resource, template)).toEqual({ a: {} });
    });

    it('preserves nested empty values if in template', () => {
      const resource = {
        metadata: {
          name: '',
          labels: {},
          annotations: {},
        },
      };
      const template = {
        metadata: {
          name: '',
          labels: {},
          annotations: {},
        },
      };
      expect(cleanResource(resource, template)).toEqual({
        metadata: {
          name: '',
          labels: {},
          annotations: {},
        },
      });
    });

    it('preserves template fields but removes non-template empty fields', () => {
      const resource = {
        metadata: {
          name: '',
          labels: {},
        },
        spec: {
          userAddedField: '',
        },
      };
      const template = {
        metadata: {
          name: '',
          labels: {},
        },
      };
      expect(cleanResource(resource, template)).toEqual({
        metadata: {
          name: '',
          labels: {},
        },
      });
    });
  });

  describe('preserves meaningful values', () => {
    it('preserves null', () => {
      const resource = { a: null };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({ a: null });
    });

    it('preserves zero', () => {
      const resource = { a: 0 };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({ a: 0 });
    });

    it('preserves false', () => {
      const resource = { a: false };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({ a: false });
    });

    it('preserves empty arrays', () => {
      const resource = { a: [] };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({ a: [] });
    });

    it('preserves non-empty strings', () => {
      const resource = { a: 'value' };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({ a: 'value' });
    });

    it('preserves numbers', () => {
      const resource = { a: 42 };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({ a: 42 });
    });

    it('preserves true', () => {
      const resource = { a: true };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({ a: true });
    });
  });

  describe('handles arrays', () => {
    it('cleans objects inside arrays that are not in template', () => {
      const resource = { items: [{ a: '' }, { b: 'value' }] };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({
        items: [{}, { b: 'value' }],
      });
    });

    it('preserves arrays with primitive values', () => {
      const resource = { items: [1, 2, 3] };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({
        items: [1, 2, 3],
      });
    });

    it('preserves nested arrays', () => {
      const resource = {
        a: [
          [1, 2],
          [3, 4],
        ],
      };
      const template = {};
      expect(cleanResource(resource, template)).toEqual({
        a: [
          [1, 2],
          [3, 4],
        ],
      });
    });
  });

  describe('complex scenarios', () => {
    it('handles the bug report scenario - nested FormGroup with cleared field', () => {
      const resource = {
        apiVersion: 'example-api-version',
        kind: 'Destination',
        metadata: {
          name: 'example',
        },
        spec: {
          destinationRef: {
            name: 'my-destination',
          },
          fragmentRef: {
            name: '',
          },
        },
      };

      const template = {
        apiVersion: 'example-api-version',
        kind: 'Destination',
        metadata: {
          name: '',
        },
        spec: {},
      };

      const expected = {
        apiVersion: 'example-api-version',
        kind: 'Destination',
        metadata: {
          name: 'example',
        },
        spec: {
          destinationRef: {
            name: 'my-destination',
          },
        },
      };

      expect(cleanResource(resource, template)).toEqual(expected);
    });

    it('handles HPA scenario - preserves template structure', () => {
      const resource = {
        apiVersion: 'autoscaling/v2',
        kind: 'HorizontalPodAutoscaler',
        metadata: {
          name: '',
          labels: {},
          annotations: {},
          namespace: 'default',
        },
        spec: {},
      };

      const template = {
        apiVersion: 'autoscaling/v2',
        kind: 'HorizontalPodAutoscaler',
        metadata: {
          name: '',
          labels: {},
          annotations: {},
          namespace: 'default',
        },
        spec: {},
      };

      // Should preserve everything since it matches the template
      expect(cleanResource(resource, template)).toEqual(template);
    });

    it('handles mixed content with template and non-template fields', () => {
      const resource = {
        metadata: {
          name: 'test',
          labels: {
            app: '',
            version: 'v1',
          },
          annotations: {
            userAdded: '',
          },
        },
        spec: {
          replicas: 0,
          enabled: false,
          config: null,
          items: [],
          userAddedField: '',
        },
      };

      const template = {
        metadata: {
          name: '',
          labels: {},
          annotations: {},
        },
        spec: {},
      };

      const expected = {
        metadata: {
          name: 'test',
          labels: {
            version: 'v1',
          },
          annotations: {},
        },
        spec: {
          replicas: 0,
          enabled: false,
          config: null,
          items: [],
        },
      };

      expect(cleanResource(resource, template)).toEqual(expected);
    });
  });

  describe('edge cases', () => {
    it('handles null input', () => {
      expect(cleanResource(null, {})).toEqual(null);
    });

    it('handles undefined input', () => {
      expect(cleanResource(undefined, {})).toEqual(undefined);
    });

    it('handles primitive string input', () => {
      expect(cleanResource('value', {})).toEqual('value');
    });

    it('handles empty string input not in template', () => {
      expect(cleanResource('', {})).toEqual('');
    });

    it('handles number input', () => {
      expect(cleanResource(42, {})).toEqual(42);
    });

    it('handles empty object input with empty template', () => {
      expect(cleanResource({}, {})).toEqual({});
    });

    it('handles undefined template', () => {
      const resource = { a: '', b: 'value' };
      expect(cleanResource(resource, undefined)).toEqual({ b: 'value' });
    });

    it('handles null template', () => {
      const resource = { a: '', b: 'value' };
      expect(cleanResource(resource, null)).toEqual({ b: 'value' });
    });
  });
});
