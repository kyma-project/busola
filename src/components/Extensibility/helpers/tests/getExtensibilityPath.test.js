import { getExtensibilityPath } from '../getExtensibilityPath';

describe('getExtensibilityPath', () => {
  it('returns urlPath when provided', () => {
    expect(getExtensibilityPath({ urlPath: 'applicationconnectors' })).toBe(
      'applicationconnectors',
    );
  });

  it('returns urlPath taking precedence over resource.kind', () => {
    expect(
      getExtensibilityPath({ urlPath: 'potatoes', resource: { kind: 'Pod' } }),
    ).toBe('potatoes');
  });

  it('pluralizes resource.kind when urlPath is absent', () => {
    expect(getExtensibilityPath({ resource: { kind: 'Pod' } })).toBe('pods');
  });

  it('pluralizes multi-word resource.kind', () => {
    expect(getExtensibilityPath({ resource: { kind: 'ServiceAccount' } })).toBe(
      'serviceaccounts',
    );
  });

  it('lowercases the kind before pluralizing', () => {
    expect(getExtensibilityPath({ resource: { kind: 'NAMESPACE' } })).toBe(
      'namespaces',
    );
  });

  it('returns empty string when both urlPath and kind are absent', () => {
    expect(getExtensibilityPath({})).toBe('');
  });

  it('returns empty string when resource has no kind', () => {
    expect(getExtensibilityPath({ resource: {} })).toBe('');
  });

  it('returns empty string when called with no arguments', () => {
    expect(getExtensibilityPath()).toBe('');
  });

  it('returns pluralized kind when urlPath is undefined', () => {
    expect(
      getExtensibilityPath({
        urlPath: undefined,
        resource: { kind: 'Secret' },
      }),
    ).toBe('secrets');
  });
});
