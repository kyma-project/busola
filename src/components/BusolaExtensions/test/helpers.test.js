import { describe, it, expect, vi } from 'vitest';
import {
  extractValueColumns,
  createExtensibilityTemplate,
  createConfigmap,
  createConfigMapTemplate,
} from '../helpers';
import jsyaml from 'js-yaml';

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

describe('extractValueColumns', () => {
  it('extracts simpleValues columns from crd', () => {
    const columns = extractValueColumns(makeCrd());
    const names = columns.map((c) => c.name);
    expect(names).toContain('color');
    expect(names).toContain('replicas');
    expect(names).not.toContain('config');
    expect(names).not.toContain('tags');
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

  it('creates the expected ConfigMap from the CRD and extension data', () => {
    const result = createConfigmap(makeCrd(), buildData());

    const expectedCm = {
      kind: 'ConfigMap',
      apiVersion: 'v1',
      metadata: {
        name: 'widgets.example.com',
        namespace: 'kube-public',
        labels: {
          'app.kubernetes.io/name': 'widgets.example.com',
          'busola.io/extension': 'resource',
          'busola.io/extension-version': '0.5',
        },
      },
      data: {
        general: jsyaml.dump({ resource: { kind: 'Widget' } }, null, 2),
        list: jsyaml.dump([{ name: 'Color', source: 'spec.color' }], null, 2),
        form: jsyaml.dump([{ path: 'spec.color', required: true }], null, 2),
        details: jsyaml.dump(
          {
            header: [],
            body: [
              {
                name: 'Summary',
                widget: 'Panel',
                children: [{ name: 'Color' }],
              },
              { source: 'spec', widget: 'CodeViewer' },
            ],
          },
          null,
          2,
        ),
        translations: jsyaml.dump({ en: {} }, null, 2),
      },
    };

    expect(result).toEqual(expectedCm);
  });
});

describe('createConfigMapTemplate', () => {
  it('creates the expected ConfigMap skeleton for the given namespace', () => {
    const result = createConfigMapTemplate('kube-public');

    expect(result).toEqual({
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { namespace: 'kube-public' },
      data: {},
    });
  });
});
