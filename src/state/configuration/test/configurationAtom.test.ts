import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from 'jotai';

vi.mock('shared/utils/env', () => ({
  getConfigDir: vi.fn().mockResolvedValue(''),
}));

// Import after mocks are registered.
const { configurationAtom, getConfigs } = await import('../configurationAtom');

const makeFetch = (responses: Record<string, string>) =>
  vi.fn().mockImplementation((url: string) => {
    const key = Object.keys(responses).find((k) => url.includes(k));
    const body = key ? responses[key] : '';
    return Promise.resolve({ text: () => Promise.resolve(body) });
  });

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
        SNOW: { isEnabled: false },
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

describe('getConfigs', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', undefined);
  });

  it('returns merged config from defaultConfig and config.yaml', async () => {
    vi.stubGlobal(
      'fetch',
      makeFetch({
        'defaultConfig.yaml': 'config:\n  storageType: sessionStorage\n',
        'config.yaml': 'config:\n  storageType: localStorage\n',
      }),
    );

    const result = await getConfigs(undefined);

    expect(result?.storageType).toBe('localStorage');
  });

  it('keeps fields from defaultConfig when config.yaml does not override them', async () => {
    vi.stubGlobal(
      'fetch',
      makeFetch({
        'defaultConfig.yaml':
          'config:\n  storageType: sessionStorage\n  extra: keep\n',
        'config.yaml': 'config:\n  storageType: localStorage\n',
      }),
    );
    // cast to any because 'extra' is a runtime value that doesn't exist in the Configuration type definition.
    const result = (await getConfigs(undefined)) as any;

    expect(result?.extra).toBe('keep');
  });

  it('merges configmap values on top of defaultConfig and config.yaml', async () => {
    vi.stubGlobal(
      'fetch',
      makeFetch({
        'defaultConfig.yaml': 'config:\n  storageType: sessionStorage\n',
        'config.yaml': '',
      }),
    );
    const fetchFn = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          data: { config: 'config:\n  storageType: localStorage\n' },
        }),
    });

    const result = await getConfigs(fetchFn);

    expect(result?.storageType).toBe('localStorage');
  });

  it('calls fetchFn with the busola-config configmap URL', async () => {
    vi.stubGlobal(
      'fetch',
      makeFetch({
        'defaultConfig.yaml': 'config: {}\n',
        'config.yaml': '',
      }),
    );
    const fetchFn = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({}),
    });

    await getConfigs(fetchFn);

    expect(fetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        relativeUrl: '/api/v1/namespaces/kube-public/configmaps/busola-config',
      }),
    );
  });

  it('skips configmap when fetchFn is undefined', async () => {
    vi.stubGlobal(
      'fetch',
      makeFetch({
        'defaultConfig.yaml': 'config:\n  storageType: sessionStorage\n',
        'config.yaml': '',
      }),
    );

    const result = await getConfigs(undefined);

    expect(result?.storageType).toBe('sessionStorage');
  });

  it('continues without configmap when fetchFn throws', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      makeFetch({
        'defaultConfig.yaml': 'config:\n  storageType: sessionStorage\n',
        'config.yaml': '',
      }),
    );
    const fetchFn = vi.fn().mockRejectedValue(new Error('cluster unreachable'));

    const result = await getConfigs(fetchFn);

    expect(result?.storageType).toBe('sessionStorage');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('arrays from a later layer replace the base array entirely', async () => {
    vi.stubGlobal(
      'fetch',
      makeFetch({
        'defaultConfig.yaml':
          'config:\n  features:\n    HIDDEN_NAMESPACES:\n      isEnabled: true\n      namespaces: [a, b, c]\n',
        'config.yaml':
          'config:\n  features:\n    HIDDEN_NAMESPACES:\n      namespaces: [x]\n',
      }),
    );

    const result = await getConfigs(undefined);

    expect(result?.features?.HIDDEN_NAMESPACES?.namespaces).toEqual(['x']);
  });

  it('returns null and warns when the defaultConfig fetch fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network error')),
    );

    const result = await getConfigs(undefined);

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('falls back when config.yaml contains invalid YAML', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      makeFetch({
        'defaultConfig.yaml': 'config:\n  storageType: sessionStorage\n',
        'config.yaml': ': invalid: yaml: [\n',
      }),
    );

    const result = await getConfigs(undefined);

    expect(result?.storageType).toBe('sessionStorage');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
