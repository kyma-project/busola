import { describe, it, expect } from 'vitest';
import { createModulePartialPath, getExtensionUrlPath } from './support';

describe('getExtensionUrlPath', () => {
  it('returns the extension general.urlPath when it is defined', () => {
    // A community extension whose urlPath deliberately differs from
    // pluralize(kind) — this is the case that breaks detail navigation
    // (regression #10718): the renderer keys on urlPath, not the bare plural.
    const extension = {
      data: {
        general: JSON.stringify({
          resource: { kind: 'Foo' },
          urlPath: 'custom-foos',
        }),
      },
    };

    expect(getExtensionUrlPath(extension, 'Foo')).toBe('custom-foos');
  });

  it('falls back to pluralize(kind) when the extension has no urlPath', () => {
    const extension = {
      data: {
        general: JSON.stringify({ resource: { kind: 'Foo' } }),
      },
    };

    expect(getExtensionUrlPath(extension, 'Foo')).toBe('foos');
  });

  it('falls back to pluralize(kind) when the extension is missing/malformed', () => {
    expect(getExtensionUrlPath(undefined, 'Foo')).toBe('foos');
    expect(
      getExtensionUrlPath({ data: { general: '::not-yaml::' } }, 'Bar'),
    ).toBe('bars');
  });
});

describe('createModulePartialPath', () => {
  const resource = {
    kind: 'Foo',
    apiVersion: 'foo.example.com/v1',
    metadata: { name: 'foo-instance', namespace: 'foo-ns' },
  };

  it('uses the provided extension urlPath in the extension branch', () => {
    // The path segment must match what useGetCRbyPath resolves the extension
    // by (urlPath), not the bare plural. Cluster-scoped for this assertion.
    const path = createModulePartialPath(
      true,
      resource,
      undefined,
      false,
      'custom-foos',
    );

    expect(path).toBe('kymamodules/custom-foos/foo-instance');
  });

  it('falls back to pluralize(kind) when no extension urlPath is given', () => {
    const path = createModulePartialPath(true, resource, undefined, false);

    expect(path).toBe('kymamodules/foos/foo-instance');
  });

  it('uses the CRD name when there is no extension', () => {
    const path = createModulePartialPath(
      false,
      resource,
      { metadata: { name: 'foos.foo.example.com' } },
      false,
    );

    expect(path).toBe('kymamodules/foos.foo.example.com/foo-instance');
  });
});
