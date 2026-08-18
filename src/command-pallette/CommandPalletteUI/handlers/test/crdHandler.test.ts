import { describe, expect, it, vi } from 'vitest';

import { crdHandler } from 'command-pallette/CommandPalletteUI/handlers/crdHandler';
import { CommandPaletteContext } from 'command-pallette/CommandPalletteUI/types';
import { K8sResource } from 'types';
import { getSuggestionForSingleResource } from 'command-pallette/CommandPalletteUI/handlers/helpers';
import { TFunction } from 'i18next';

vi.mock('command-pallette/CommandPalletteUI/handlers/helpers', () => ({
  getSuggestionForSingleResource: vi.fn().mockReturnValue('crd'),
}));

function fixCRD(name: string): K8sResource {
  return {
    metadata: {
      name: name,
      uid: '',
      creationTimestamp: '',
      resourceVersion: '',
      labels: {},
    },
  };
}

const fakeTranslation: Record<string, string> = {
  'custom-resource-definitions.title': 'TEST',
};

const fakeT = ((key: string) => fakeTranslation[key] ?? key) as TFunction;

function fixContext({
  tokens,
  resourceCache = {},
}: {
  tokens: string[];
  resourceCache?: Record<string, K8sResource[]>;
}): CommandPaletteContext {
  // @ts-ignore
  return {
    resourceCache,
    t: fakeT,
    tokens,
  };
}
describe('getAutocompleteEntries', () => {
  it('AutoComplete with which should match fullname of crd', () => {
    const ctx = fixContext({ tokens: ['c'] });

    const result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(1);
    expect(result![0]).toBe('customresourcedefinitions ');
  });

  it('AutoComplete with which should match plural shortname of crd', () => {
    const ctx = fixContext({ tokens: ['cr'] });

    const result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(1);
    expect(result![0]).toBe('crds');
  });

  it('AutoComplete doesnt match anything', () => {
    const ctx = fixContext({ tokens: ['anything'] });

    const result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(0);
  });

  it('AutoComplete with 3 tokens', () => {
    const ctx = fixContext({
      tokens: ['crd', '/', 'xyz'],
      resourceCache: {
        customresourcedefinitions: [
          fixCRD('abcd'),
          fixCRD('xyzResource'),
          fixCRD('resoruceXyz'),
        ],
      },
    });
    const result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(1);
    expect(result![0]).toBe('crd xyzResource ');
  });

  it('AutoComplete with 2 tokens returns empty suggestion array', () => {
    const ctx = fixContext({
      tokens: ['crd', 'xyz'],
      resourceCache: {
        customresourcedefinitions: [
          fixCRD('abcd'),
          fixCRD('xyzResource'),
          fixCRD('resoruceXyz'),
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
        customresourcedefinitions: [fixCRD('test')],
      },
    });
    const result = crdHandler.getSuggestion(ctx);

    expect(result).toBe('crd');
    expect(mockSuggestionForSingleResource).toHaveBeenCalledOnce();
    expect(mockSuggestionForSingleResource).toHaveBeenCalledWith({
      tokens: ['cred'],
      resources: [fixCRD('test')],
      resourceTypeNames: expect.arrayContaining([
        'customresourcedefinitions',
        'crd',
        'crds',
      ]),
    });
  });
});

describe('get createResults', () => {
  it('One token', () => {
    const expectedTranslation = 'TEST';
    const ctx: CommandPaletteContext = fixContext({
      tokens: ['c'],
      resourceCache: {
        customresourcedefinitions: [],
      },
    });
    const result = crdHandler.createResults(ctx);

    expect(result).toHaveLength(1);

    const firstResult = result![0];
    expect(firstResult.aliases).toStrictEqual(['crds']);
    expect(firstResult.category).toEqual(
      `configuration.title > ${expectedTranslation}`,
    );
    expect(firstResult.query).toEqual('crds');
    expect(firstResult.label).toEqual(expectedTranslation);
  });

  it('type and name in tokens', () => {
    const expectedTranslation = 'TEST';
    const ctx: CommandPaletteContext = fixContext({
      tokens: ['crd', '/', 'custom'],
      resourceCache: {
        customresourcedefinitions: [fixCRD('custom')],
      },
    });
    const result = crdHandler.createResults(ctx);

    expect(result).toHaveLength(1);

    const firstResult = result![0];
    console.log(result);
    expect(firstResult.category).toEqual(
      `configuration.title > ${expectedTranslation}`,
    );
    expect(firstResult.query).toEqual('crds/custom');
    expect(firstResult.label).toEqual('custom');
    expect(firstResult.customActionText).toEqual(
      'command-palette.item-actions.navigate',
    );
  });

  it('type and delimeter in tokens', () => {
    const expectedTranslation = 'TEST';
    const ctx: CommandPaletteContext = fixContext({
      tokens: ['crd', '/'],
      resourceCache: {
        customresourcedefinitions: [fixCRD('custom'), fixCRD('custom2')],
      },
    });
    const result = crdHandler.createResults(ctx);

    expect(result).toHaveLength(2);

    const firstResult = result![0];
    expect(firstResult.category).toEqual(
      `configuration.title > ${expectedTranslation}`,
    );
    expect(firstResult.query).toEqual('crds/custom');
    expect(firstResult.label).toEqual('custom');
    expect(firstResult.customActionText).toEqual(
      'command-palette.item-actions.navigate',
    );

    const secondResult = result![1];
    expect(secondResult.category).toEqual(
      `configuration.title > ${expectedTranslation}`,
    );
    expect(secondResult.query).toEqual('crds/custom2');
    expect(secondResult.label).toEqual('custom2');
    expect(secondResult.customActionText).toEqual(
      'command-palette.item-actions.navigate',
    );
  });
});
