import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from 'jotai';

vi.mock('shared/utils/env', () => ({
  getConfigDir: vi.fn().mockResolvedValue(''),
}));

// Import after mocks are registered.
const { configurationAtom } = await import('../configurationAtom');
const { mergeWith, isArray } = await import('lodash');

describe('configurationAtom', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  it('has an empty object as the default value', () => {
    expect(store.get(configurationAtom)).toEqual({});
  });

  it('is not null by default', () => {
    expect(store.get(configurationAtom)).not.toBeNull();
  });

  it('can be set to a configuration with features', () => {
    const config = {
      features: {
        EXTENSIBILITY: { isEnabled: true },
        TERMINAL: { isEnabled: false },
      },
    } as any;

    store.set(configurationAtom, config);

    expect(store.get(configurationAtom)).toEqual(config);
  });

  it('can be set to null', () => {
    store.set(configurationAtom, null);
    expect(store.get(configurationAtom)).toBeNull();
  });

  it('can be set to a configuration with storageType', () => {
    store.set(configurationAtom, { storageType: 'localStorage' });
    expect(store.get(configurationAtom)).toEqual({
      storageType: 'localStorage',
    });
  });

  it('overwrites the previous value on each set', () => {
    store.set(configurationAtom, { storageType: 'localStorage' });
    store.set(configurationAtom, { storageType: 'sessionStorage' });
    expect(store.get(configurationAtom)).toEqual({
      storageType: 'sessionStorage',
    });
  });

  it('notifies subscribers on change', () => {
    const subscriber = vi.fn();
    store.sub(configurationAtom, subscriber);

    store.set(configurationAtom, { storageType: 'localStorage' });

    expect(subscriber).toHaveBeenCalledTimes(1);
  });

  it('each store instance has an independent default value', () => {
    const storeA = createStore();
    const storeB = createStore();

    storeA.set(configurationAtom, { storageType: 'localStorage' });

    expect(storeB.get(configurationAtom)).toEqual({});
  });
});

describe('configuration merge contract (lodash mergeWith array override)', () => {
  // getConfigs uses mergeWith with a merger that replaces arrays entirely
  // rather than merging them index-by-index. These tests pin that rule.
  const arrayOverwriteCustomizer = (obj: any, src: any) => {
    if (isArray(obj)) return src;
  };

  it('shallow-merges plain object properties from multiple layers', () => {
    const defaultCfg = { storageType: 'sessionStorage', extra: 'keep' };
    const configYaml = { storageType: 'localStorage' };
    const configMap = {};

    const result = mergeWith(
      defaultCfg,
      configYaml,
      configMap,
      arrayOverwriteCustomizer,
    );

    expect(result.storageType).toBe('localStorage');
    expect(result.extra).toBe('keep');
  });

  it('later layers win for scalar values', () => {
    const base = { storageType: 'sessionStorage' };
    const override = { storageType: 'localStorage' };

    const result = mergeWith(base, override, arrayOverwriteCustomizer);

    expect(result.storageType).toBe('localStorage');
  });

  it('replaces arrays entirely instead of merging index-by-index', () => {
    const base = { items: ['a', 'b', 'c'] };
    const override = { items: ['x'] };

    const result = mergeWith(base, override, arrayOverwriteCustomizer);

    // Without the customizer lodash would produce ['x', 'b', 'c'].
    expect(result.items).toEqual(['x']);
  });

  it('keeps the base array when the override does not specify that key', () => {
    const base = { items: ['a', 'b'] };
    const override = {};

    const result = mergeWith(base, override, arrayOverwriteCustomizer);

    expect(result.items).toEqual(['a', 'b']);
  });

  it('nested objects are deep-merged', () => {
    const base = {
      features: { EXTENSIBILITY: { isEnabled: true, extra: 'keep' } },
    };
    const override = { features: { EXTENSIBILITY: { isEnabled: false } } };

    const result = mergeWith(base, override, arrayOverwriteCustomizer) as any;

    expect(result.features.EXTENSIBILITY.isEnabled).toBe(false);
    expect(result.features.EXTENSIBILITY.extra).toBe('keep');
  });

  it('later layer adds new keys without dropping existing ones', () => {
    const base = { storageType: 'sessionStorage' } as any;
    const override = { newKey: 'hello' };

    const result = mergeWith(base, override, arrayOverwriteCustomizer);

    expect(result.storageType).toBe('sessionStorage');
    expect(result.newKey).toBe('hello');
  });
});
