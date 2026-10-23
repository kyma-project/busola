import { describe, it, expect, vi } from 'vitest';
import {
  extractValueColumns,
  createExtensibilityTemplate,
  createConfigmap,
  createConfigMapTemplate,
} from '../helpers';
import jsyaml from 'js-yaml';

vi.mock('components/Extensibility/migration', () => ({
  getLatestVersion: () => '0.5',
}));

// Minimal CRD fixture used across tests.
const makeCrd = (overrides = {}) => ({
  metadata: { name: 'widgets.example.com' },
  spec: {
    group: 'example.com',
    scope: 'Namespaced',
    names: { kind: 'Widget', plural: 'widgets' },
    versions: [
      {
        name: 'v1',
        storage: true,
        additionalPrinterColumns: [
          { jsonPath: '.spec.color', type: 'string', name: 'Color' },
        ],
        schema: {
          openAPIV3Schema: {
            properties: {
              spec: {
                properties: {
                  color: { type: 'string' },
                  replicas: { type: 'integer' },
                  config: { type: 'object' },
                  tags: { type: 'array' },
                },
                required: ['color'],
              },
            },
          },
        },
      },
    ],
  },
  ...overrides,
});

// ─── extractValueColumns ──────────────────────────────────────────────────────

describe('extractValueColumns', () => {
  it('excludes object and array type properties from first-level columns', () => {
    const columns = extractValueColumns(makeCrd());
    const names = columns.map((c) => c.name);
    expect(names).not.toContain('config');
    expect(names).not.toContain('tags');
  });

  it('includes scalar (string, integer) first-level spec properties', () => {
    const columns = extractValueColumns(makeCrd());
    const names = columns.map((c) => c.name);
    expect(names).toContain('color');
    expect(names).toContain('replicas');
  });

  it('marks all extracted columns as selected', () => {
    const columns = extractValueColumns(makeCrd());
    columns.forEach((col) => expect(col.isSelected).toBe(true));
  });

  it('marks required properties as required', () => {
    const columns = extractValueColumns(makeCrd());
    const colorCol = columns.find((c) => c.name === 'color');
    expect(colorCol?.required).toBe(true);
    const replicasCol = columns.find((c) => c.name === 'replicas');
    expect(replicasCol?.required).toBe(false);
  });

  it('prefixes first-level property paths with spec.', () => {
    const columns = extractValueColumns(makeCrd());
    const colorCol = columns.find((c) => c.name === 'color');
    expect(colorCol?.path).toBe('spec.color');
  });

  it('includes additionalPrinterColumns from the storage version', () => {
    const columns = extractValueColumns(makeCrd());
    const names = columns.map((c) => c.name);
    expect(names).toContain('Color');
  });

  it('strips the leading dot from additionalPrinterColumns jsonPath', () => {
    const columns = extractValueColumns(makeCrd());
    const colorPrinterCol = columns.find((c) => c.name === 'Color');
    expect(colorPrinterCol?.path).toBe('spec.color');
  });

  it('adds a Badge widget to columns whose name looks like a status field', () => {
    const crd = makeCrd({
      spec: {
        ...makeCrd().spec,
        versions: [
          {
            name: 'v1',
            storage: true,
            additionalPrinterColumns: [],
            schema: {
              openAPIV3Schema: {
                properties: {
                  spec: {
                    properties: {
                      status: { type: 'string' },
                      phase: { type: 'string' },
                      name: { type: 'string' },
                    },
                    required: [],
                  },
                },
              },
            },
          },
        ],
      },
    });
    const columns = extractValueColumns(crd);
    const statusCol = columns.find((c) => c.name === 'status');
    const phaseCol = columns.find((c) => c.name === 'phase');
    const nameCol = columns.find((c) => c.name === 'name');
    expect(statusCol?.widget).toBe('Badge');
    expect(phaseCol?.widget).toBe('Badge');
    expect(nameCol?.widget).toBeUndefined();
  });
});

// ─── createExtensibilityTemplate ─────────────────────────────────────────────

describe('createExtensibilityTemplate', () => {
  const t = (key) => key;

  it('sets general.resource fields from the CRD spec', () => {
    const { general } = createExtensibilityTemplate(makeCrd(), t);
    expect(general.resource.kind).toBe('Widget');
    expect(general.resource.group).toBe('example.com');
    expect(general.resource.version).toBe('v1');
  });

  it('sets scope to namespace for a Namespaced CRD', () => {
    const { general } = createExtensibilityTemplate(makeCrd(), t);
    expect(general.scope).toBe('namespace');
  });

  it('sets scope to cluster for a Cluster-scoped CRD', () => {
    const crd = makeCrd({ spec: { ...makeCrd().spec, scope: 'Cluster' } });
    const { general } = createExtensibilityTemplate(crd, t);
    expect(general.scope).toBe('cluster');
  });

  it('sets urlPath to the CRD plural name', () => {
    const { general } = createExtensibilityTemplate(makeCrd(), t);
    expect(general.urlPath).toBe('widgets');
  });

  it('populates form with scalar spec properties', () => {
    const { form } = createExtensibilityTemplate(makeCrd(), t);
    const paths = form.map((f) => f.path);
    expect(paths).toContain('spec.color');
    expect(paths).toContain('spec.replicas');
  });

  it('excludes object and array properties from form', () => {
    const { form } = createExtensibilityTemplate(makeCrd(), t);
    const paths = form.map((f) => f.path);
    expect(paths).not.toContain('spec.config');
    expect(paths).not.toContain('spec.tags');
  });

  it('creates a details section with header and body', () => {
    const { details } = createExtensibilityTemplate(makeCrd(), t);
    expect(details).toHaveProperty('header');
    expect(details).toHaveProperty('body');
    expect(Array.isArray(details.body)).toBe(true);
  });

  it('falls back to a creationTimestamp child when there are no value columns', () => {
    const crd = makeCrd({
      spec: {
        ...makeCrd().spec,
        versions: [
          {
            name: 'v1',
            storage: true,
            additionalPrinterColumns: [],
            schema: {
              openAPIV3Schema: {
                properties: {
                  spec: { properties: {}, required: [] },
                },
              },
            },
          },
        ],
      },
    });
    const { details } = createExtensibilityTemplate(crd, t);
    const summaryPanel = details.body[0];
    expect(summaryPanel.children[0].source).toBe('metadata.creationTimestamp');
  });
});

// ─── createConfigmap ──────────────────────────────────────────────────────────

describe('createConfigmap', () => {
  const buildData = () => ({
    general: { resource: { kind: 'Widget' } },
    list: [
      { name: 'Color', path: 'spec.color', isSelected: true },
      { name: 'Replicas', path: 'spec.replicas', isSelected: false },
    ],
    form: [
      { path: 'spec.color', required: true, isSelected: true },
      { path: 'spec.replicas', required: false, isSelected: false },
    ],
    details: {
      header: [],
      body: [
        {
          name: 'Summary',
          widget: 'Panel',
          children: [
            { name: 'Color', source: 'spec.color', isSelected: true },
            { name: 'Replicas', source: 'spec.replicas', isSelected: false },
          ],
        },
        { source: 'spec', widget: 'CodeViewer' },
      ],
    },
    translations: { en: {} },
  });

  it('creates a ConfigMap with kind v1', () => {
    const configMap = createConfigmap(makeCrd(), buildData());
    expect(configMap.kind).toBe('ConfigMap');
    expect(configMap.apiVersion).toBe('v1');
  });

  it('sets the ConfigMap name from the CRD metadata name', () => {
    const configMap = createConfigmap(makeCrd(), buildData());
    expect(configMap.metadata.name).toBe('widgets.example.com');
  });

  it('places the ConfigMap in kube-public namespace', () => {
    const configMap = createConfigmap(makeCrd(), buildData());
    expect(configMap.metadata.namespace).toBe('kube-public');
  });

  it('sets the busola extension label', () => {
    const configMap = createConfigmap(makeCrd(), buildData());
    expect(configMap.metadata.labels['busola.io/extension']).toBe('resource');
  });

  it('sets the extension version label', () => {
    const configMap = createConfigmap(makeCrd(), buildData());
    expect(configMap.metadata.labels['busola.io/extension-version']).toBe(
      '0.5',
    );
  });

  it('filters out non-selected list columns', () => {
    const configMap = createConfigmap(makeCrd(), buildData());
    const list = jsyaml.load(configMap.data.list);
    const names = list.map((c) => c.name);
    expect(names).toContain('Color');
    expect(names).not.toContain('Replicas');
  });

  it('filters out non-selected form fields', () => {
    const configMap = createConfigmap(makeCrd(), buildData());
    const form = jsyaml.load(configMap.data.form);
    const paths = form.map((f) => f.path);
    expect(paths).toContain('spec.color');
    expect(paths).not.toContain('spec.replicas');
  });

  it('serializes data sections as YAML strings', () => {
    const configMap = createConfigmap(makeCrd(), buildData());
    expect(typeof configMap.data.general).toBe('string');
    expect(typeof configMap.data.list).toBe('string');
    expect(typeof configMap.data.form).toBe('string');
  });
});

// ─── createConfigMapTemplate ──────────────────────────────────────────────────

describe('createConfigMapTemplate', () => {
  it('creates a ConfigMap skeleton with the given namespace', () => {
    const template = createConfigMapTemplate('kube-public');
    expect(template.kind).toBe('ConfigMap');
    expect(template.apiVersion).toBe('v1');
    expect(template.metadata.namespace).toBe('kube-public');
  });

  it('creates an empty data object', () => {
    const template = createConfigMapTemplate('my-ns');
    expect(template.data).toEqual({});
  });
});
