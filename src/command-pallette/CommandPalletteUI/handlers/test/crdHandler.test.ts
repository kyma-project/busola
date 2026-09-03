import { describe, expect, it, vi } from 'vitest';

import { crdHandler } from 'command-pallette/CommandPalletteUI/handlers/crdHandler';
import {
  CommandPaletteContext,
  LOADING_INDICATOR,
  Result,
} from 'command-pallette/CommandPalletteUI/types';
import { K8sResource } from 'types';
import { getSuggestionForSingleResource } from 'command-pallette/CommandPalletteUI/handlers/helpers';
import { TFunction } from 'i18next';
import { fixK8sResource } from 'command-pallette/CommandPalletteUI/handlers/test/fixtures';

vi.mock('command-pallette/CommandPalletteUI/handlers/helpers', () => ({
  getSuggestionForSingleResource: vi.fn().mockReturnValue('crd'),
}));

const expectedCRDTitleTranslation = 'TEST';
const fakeTranslation: Record<string, string> = {
  'custom-resource-definitions.title': expectedCRDTitleTranslation,
};

const fakeT = ((key: string) => fakeTranslation[key] ?? key) as TFunction;

function fixContext({
  tokens,
  resourceCache = {},
  fetch = (_: string) => new Promise(() => undefined),
  updateResourceCache = (_: string, __: K8sResource[]) => {},
}: {
  tokens: string[];
  resourceCache?: Record<string, K8sResource[]>;
  fetch?: (a: string) => Promise<any>;
  updateResourceCache?: (key: string, value: K8sResource[]) => void;
}): CommandPaletteContext {
  // @ts-expect-error Other fields are not needed
  return {
    resourceCache,
    t: fakeT,
    updateResourceCache,
    tokens,
    fetch,
  };
}

function expectLinkToListToHaveCorrectFixedProps(linkToList: Result) {
  expect(linkToList.aliases).toStrictEqual(['crds']);
  expect(linkToList.category).toEqual(
    `configuration.title > ${expectedCRDTitleTranslation}`,
  );
  expect(linkToList.query).toEqual('crds');
  expect(linkToList.label).toEqual(expectedCRDTitleTranslation);
}

function expectCustomLinkToListHaveProperProps(result: Result, name: string) {
  expect(result.category).toEqual(
    `configuration.title > ${expectedCRDTitleTranslation}`,
  );
  expect(result.query).toEqual(`crds/${name}`);
  expect(result.label).toEqual(name);
  expect(result.customActionText).toEqual(
    'command-palette.item-actions.navigate',
  );
}

describe('getAutocompleteEntries', () => {
  it('AutoComplete given one token returns matched fullname', () => {
    const ctx = fixContext({ tokens: ['c'] });

    const result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(1);
    expect(result![0]).toBe('customresourcedefinitions ');
  });

  it('AutoComplete given one token returns plural shortname of crd', () => {
    const ctx = fixContext({ tokens: ['cr'] });

    const result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(1);
    expect(result![0]).toBe('crds');
  });

  it('AutoComplete given random token returns empty result', () => {
    const ctx = fixContext({ tokens: ['anything'] });

    const result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(0);
  });

  it('AutoComplete given 3 tokens returns matched customresourcedefinition', () => {
    const ctx = fixContext({
      tokens: ['crd', '/', 'xyz'],
      resourceCache: {
        customresourcedefinitions: [
          fixK8sResource('abcd'),
          fixK8sResource('xyzResource'),
          fixK8sResource('resoruceXyz'),
        ],
      },
    });
    const result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(1);
    expect(result![0]).toBe('crd xyzResource ');
  });

  it('AutoComplete given 3 tokens and emptyResourceCache returns empty result', () => {
    const ctx = fixContext({
      tokens: ['crd', '/', 'xyz'],
      resourceCache: {},
    });
    const result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(0);
  });

  it('AutoComplete given 2 tokens returns empty result', () => {
    const ctx = fixContext({
      tokens: ['crd', 'xyz'],
      resourceCache: {
        customresourcedefinitions: [
          fixK8sResource('abcd'),
          fixK8sResource('xyzResource'),
          fixK8sResource('resourceXyz'),
        ],
      },
    });

    const result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(0);
  });
});

describe('getSuggestion', () => {
  it('Check if helper is called with proper arguments', () => {
    const mockSuggestionForSingleResource = vi.mocked(
      getSuggestionForSingleResource,
    );

    const ctx = fixContext({
      tokens: ['cred'],
      resourceCache: {
        customresourcedefinitions: [fixK8sResource('test')],
      },
    });
    const result = crdHandler.getSuggestion(ctx);

    expect(result).toBe('crd');
    expect(mockSuggestionForSingleResource).toHaveBeenCalledOnce();
    expect(mockSuggestionForSingleResource).toHaveBeenCalledWith({
      tokens: ['cred'],
      resources: [fixK8sResource('test')],
      resourceTypeNames: expect.arrayContaining([
        'customresourcedefinitions',
        'crd',
        'crds',
      ]),
    });
  });
});

describe('createResults', () => {
  it('createResults given one token returns fixed results with linkToList', () => {
    const ctx: CommandPaletteContext = fixContext({
      tokens: ['c'],
      resourceCache: {
        customresourcedefinitions: [],
      },
    });
    const result = crdHandler.createResults(ctx);

    expect(result).toHaveLength(1);

    const firstResult = result![0];
    expectLinkToListToHaveCorrectFixedProps(firstResult);
  });

  it('createResults given type and name in tokens returns matched result', () => {
    const ctx: CommandPaletteContext = fixContext({
      tokens: ['crd', '/', 'custom'],
      resourceCache: {
        customresourcedefinitions: [fixK8sResource('custom')],
      },
    });
    const result = crdHandler.createResults(ctx);

    expect(result).toHaveLength(1);

    const firstResult = result![0];
    expectCustomLinkToListHaveProperProps(firstResult, 'custom');
  });

  it('createResults given type and delimeter in tokens returns matched 2 elements', () => {
    const ctx: CommandPaletteContext = fixContext({
      tokens: ['crd', '/'],
      resourceCache: {
        customresourcedefinitions: [
          fixK8sResource('custom'),
          fixK8sResource('custom2'),
        ],
      },
    });
    const result = crdHandler.createResults(ctx);

    expect(result).toHaveLength(2);

    const firstResult = result![0];
    expectCustomLinkToListHaveProperProps(firstResult, 'custom');

    const secondResult = result![1];
    expectCustomLinkToListHaveProperProps(secondResult, 'custom2');
  });

  it('createResults given one unrelated token type returns nothing', () => {
    const ctx: CommandPaletteContext = fixContext({
      tokens: ['unrelated-type'],
      resourceCache: {
        customresourcedefinitions: [],
      },
    });
    const result = crdHandler.createResults(ctx);

    expect(result).toHaveLength(0);
  });

  it('createResults given one unrelated token name returns nothing', () => {
    const ctx: CommandPaletteContext = fixContext({
      tokens: ['crd', '/', 'unrelated-resource-name'],
      resourceCache: {
        customresourcedefinitions: [fixK8sResource('crd1')],
      },
    });
    const result = crdHandler.createResults(ctx);

    expect(result).toHaveLength(0);
  });

  it('createResults given empty cache returns loading status', () => {
    const ctx: CommandPaletteContext = fixContext({
      tokens: ['crd', '/', 'unrelated-resource-name'],
      resourceCache: {},
    });
    const result = crdHandler.createResults(ctx);

    expect(result).toHaveLength(2);

    const linkToList = result![0];
    expectLinkToListToHaveCorrectFixedProps(linkToList);
    const loadingIndicator = result![1];
    expect(loadingIndicator).toEqual({
      type: LOADING_INDICATOR,
    });
  });
});

describe('fetchCRDs', () => {
  it('Fetch CRDs and update cache', async () => {
    const cache = new Map<string, K8sResource[]>();
    const updateResourceCache = (key: string, value: K8sResource[]) => {
      cache.set(key, value);
    };
    const ctx: CommandPaletteContext = fixContext({
      tokens: ['crd', '/'],
      resourceCache: {
        customresourcedefinitions: [
          fixK8sResource('custom'),
          fixK8sResource('custom2'),
        ],
      },
      updateResourceCache,
      fetch: vi.fn((url: string) => {
        expect(url).toContain(
          '/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
        );
        return new Promise((resolve) =>
          resolve({
            json: () => {
              return new Promise((resolve) =>
                resolve({
                  items: [fixK8sResource('test')],
                }),
              );
            },
          }),
        );
      }),
    });

    await crdHandler.fetchResources(ctx);

    expect(ctx.fetch).toHaveResolved();
    expect(cache).toHaveLength(1);
    expect(cache.get('customresourcedefinitions')).toEqual([
      fixK8sResource('test'),
    ]);
  });

  it('Fetch CRDs do not fetch not related resources ', async () => {
    const ctx: CommandPaletteContext = fixContext({
      tokens: ['random-crd'],
      resourceCache: {
        customresourcedefinitions: [
          fixK8sResource('custom'),
          fixK8sResource('custom2'),
        ],
      },
      fetch: vi.fn((_: string) => {
        expect.fail('Fetch should not be called');
      }),
    });

    await crdHandler.fetchResources(ctx);
  });

  it('Fetch CRDs fails and cache not updated', async () => {
    const consoleMock = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const cache = new Map<string, K8sResource[]>();
    const updateResourceCache = (key: string, value: K8sResource[]) => {
      cache.set(key, value);
    };
    const ctx: CommandPaletteContext = fixContext({
      tokens: ['crd', '/'],
      resourceCache: {
        customresourcedefinitions: [
          fixK8sResource('custom'),
          fixK8sResource('custom2'),
        ],
      },
      updateResourceCache,
      fetch: vi.fn((_: string) => {
        return new Promise((_, reject) => reject(new Error('testing error')));
      }),
    });

    await crdHandler.fetchResources(ctx);

    await expect(ctx.fetch).rejects.toThrow();
    expect(cache).toHaveLength(0);
    expect(consoleMock).toHaveBeenCalledWith(
      'Failed to fetch CRDs:',
      new Error('testing error'),
    );
    consoleMock.mockRestore();
  });
});
