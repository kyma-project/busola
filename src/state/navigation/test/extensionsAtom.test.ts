import { describe, it, expect, vi } from 'vitest';
import {
  isTheSameNameAndUrl,
  isTheSameId,
  convertYamlToObject,
} from '../extensionsAtom';

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
  it.each([
    {
      desc: 'same id',
      a: { general: { id: 'ext-001' } },
      b: { general: { id: 'ext-001' } },
      expected: true,
    },
    {
      desc: 'different ids',
      a: { general: { id: 'ext-001' } },
      b: { general: { id: 'ext-002' } },
      expected: false,
    },
    {
      desc: 'one missing general section',
      a: { general: { id: 'ext-001' } },
      b: {},
      expected: false,
    },
    {
      desc: 'both missing general.id',
      a: {},
      b: {},
      expected: true,
    },
  ])('returns $expected when $desc', ({ a, b, expected }) => {
    expect(isTheSameId(a as any, b as any)).toBe(expected);
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

  it('returns null without errors for empty YAML', () => {
    const warnSpy = vi.spyOn(console, 'warn');
    const result = convertYamlToObject('');
    expect(result).toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns null and warns for invalid YAML input', () => {
    const warnSpy = vi.spyOn(console, 'warn');
    const result = convertYamlToObject('{{{wrong-input:::');
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
