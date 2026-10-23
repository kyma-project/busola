import { describe, it, expect, vi } from 'vitest';
import {
  isTheSameNameAndUrl,
  isTheSameId,
  convertYamlToObject,
} from '../extensionsAtom';

vi.mock('components/Extensibility/contexts/DataSources', () => ({}));

describe('isTheSameNameAndUrl', () => {
  it('returns true when name and urlPath both match', () => {
    const a = { general: { name: 'ext-a', urlPath: '/a' } } as any;
    const b = { general: { name: 'ext-a', urlPath: '/a' } } as any;
    expect(isTheSameNameAndUrl(a, b)).toBe(true);
  });

  it('returns false when names differ', () => {
    const a = { general: { name: 'ext-a', urlPath: '/a' } } as any;
    const b = { general: { name: 'ext-b', urlPath: '/a' } } as any;
    expect(isTheSameNameAndUrl(a, b)).toBe(false);
  });

  it('returns false when urlPaths differ', () => {
    const a = { general: { name: 'ext-a', urlPath: '/a' } } as any;
    const b = { general: { name: 'ext-a', urlPath: '/b' } } as any;
    expect(isTheSameNameAndUrl(a, b)).toBe(false);
  });

  it('returns true when both name and urlPath are undefined', () => {
    expect(
      isTheSameNameAndUrl({ general: {} } as any, { general: {} } as any),
    ).toBe(true);
  });

  it('returns true when general is missing on both', () => {
    expect(isTheSameNameAndUrl({} as any, {} as any)).toBe(true);
  });
});

describe('isTheSameId', () => {
  it('returns true when ids match', () => {
    const a = { general: { id: 'abc-123' } } as any;
    const b = { general: { id: 'abc-123' } } as any;
    expect(isTheSameId(a, b)).toBe(true);
  });

  it('returns false when ids differ', () => {
    const a = { general: { id: 'abc-123' } } as any;
    const b = { general: { id: 'xyz-456' } } as any;
    expect(isTheSameId(a, b)).toBe(false);
  });

  it('returns true when both ids are undefined', () => {
    expect(isTheSameId({ general: {} } as any, { general: {} } as any)).toBe(
      true,
    );
  });

  it('returns true when general is missing on both', () => {
    expect(isTheSameId({} as any, {} as any)).toBe(true);
  });
});

describe('convertYamlToObject', () => {
  it('parses a valid YAML string to an object', () => {
    const yaml = 'name: my-extension\nversion: "1.0"';
    const result = convertYamlToObject(yaml);
    expect(result).toEqual({ name: 'my-extension', version: '1.0' });
  });

  it('parses YAML with nested keys', () => {
    const yaml = 'general:\n  name: ext\n  urlPath: /ext';
    const result = convertYamlToObject(yaml);
    expect(result).toEqual({ general: { name: 'ext', urlPath: '/ext' } });
  });

  it('parses a YAML list as an object (json mode)', () => {
    const yaml = '- a\n- b';
    const result = convertYamlToObject(yaml);
    expect(result).toEqual(['a', 'b']);
  });

  it('returns null for invalid YAML', () => {
    const invalid = 'key: [unclosed';
    const result = convertYamlToObject(invalid);
    expect(result).toBeNull();
  });

  it('returns undefined for an empty string (valid YAML, no document)', () => {
    const result = convertYamlToObject('');
    expect(result).toBeUndefined();
  });

  it('parses a JSON string (yaml is a superset of JSON)', () => {
    const json = '{"key": "value"}';
    const result = convertYamlToObject(json);
    expect(result).toEqual({ key: 'value' });
  });
});
