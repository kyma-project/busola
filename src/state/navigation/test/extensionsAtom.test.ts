import { describe, it, expect, vi } from 'vitest';
import {
  isTheSameNameAndUrl,
  isTheSameId,
  convertYamlToObject,
} from '../extensionsAtom';

// ─── isTheSameNameAndUrl ──────────────────────────────────────────────────────

describe('isTheSameNameAndUrl', () => {
  it('returns true when both name and urlPath are identical', () => {
    const a = { general: { name: 'Widgets', urlPath: 'widgets' } };
    const b = { general: { name: 'Widgets', urlPath: 'widgets' } };
    expect(isTheSameNameAndUrl(a, b)).toBe(true);
  });

  it('returns false when names differ', () => {
    const a = { general: { name: 'Widgets', urlPath: 'widgets' } };
    const b = { general: { name: 'Gadgets', urlPath: 'widgets' } };
    expect(isTheSameNameAndUrl(a, b)).toBe(false);
  });

  it('returns false when urlPaths differ', () => {
    const a = { general: { name: 'Widgets', urlPath: 'widgets' } };
    const b = { general: { name: 'Widgets', urlPath: 'gadgets' } };
    expect(isTheSameNameAndUrl(a, b)).toBe(false);
  });

  it('returns false when one extension has no general section', () => {
    const a = { general: { name: 'Widgets', urlPath: 'widgets' } };
    const b = {};
    expect(isTheSameNameAndUrl(a, b)).toBe(false);
  });

  it('returns true for two empty objects (both general.name and urlPath are undefined)', () => {
    expect(isTheSameNameAndUrl({}, {})).toBe(true);
  });
});

// ─── isTheSameId ─────────────────────────────────────────────────────────────

describe('isTheSameId', () => {
  it('returns true when both extensions share the same id', () => {
    const a = { general: { id: 'ext-001' } };
    const b = { general: { id: 'ext-001' } };
    expect(isTheSameId(a, b)).toBe(true);
  });

  it('returns false when ids differ', () => {
    const a = { general: { id: 'ext-001' } };
    const b = { general: { id: 'ext-002' } };
    expect(isTheSameId(a, b)).toBe(false);
  });

  it('returns false when one extension has no general section', () => {
    const a = { general: { id: 'ext-001' } };
    const b = {};
    expect(isTheSameId(a, b)).toBe(false);
  });

  it('returns true for two objects without a general.id (both undefined)', () => {
    expect(isTheSameId({}, {})).toBe(true);
  });
});

// ─── convertYamlToObject ─────────────────────────────────────────────────────

describe('convertYamlToObject', () => {
  it('parses a valid YAML string into an object', () => {
    const yaml = 'key: value\ncount: 42';
    expect(convertYamlToObject(yaml)).toEqual({ key: 'value', count: 42 });
  });

  it('parses a YAML string representing a nested object', () => {
    const yaml = 'resource:\n  kind: Widget\n  group: example.com';
    expect(convertYamlToObject(yaml)).toEqual({
      resource: { kind: 'Widget', group: 'example.com' },
    });
  });

  it('returns null and warns for invalid YAML', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = convertYamlToObject('{invalid: yaml: :}');
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns null for an empty string (js-yaml loads empty string as undefined, treated as null)', () => {
    const result = convertYamlToObject('');
    // js-yaml.load('') returns null; convertYamlToObject wraps that as-is
    expect(result === null || result === undefined).toBe(true);
  });

  it('parses a YAML string that represents a list', () => {
    const yaml = '- a\n- b\n- c';
    const result = convertYamlToObject(yaml);
    expect(result).toEqual(['a', 'b', 'c']);
  });
});
