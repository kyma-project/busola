import { describe, expect, it, vi } from 'vitest';

import { crdHandler } from 'command-pallette/CommandPalletteUI/handlers/crdHandler';
import { CommandPaletteContext } from 'command-pallette/CommandPalletteUI/types';
import { K8sResource } from 'types';
import { getSuggestionForSingleResource } from 'command-pallette/CommandPalletteUI/handlers/helpers';
import { TFunction } from 'i18next';
import { ActiveClusterState } from 'state/clusterAtom';
import { ClustersState } from 'state/clustersAtom';

vi.mock('command-pallette/CommandPalletteUI/handlers/helpers', () => ({
  getSuggestionForSingleResource: vi.fn().mockReturnValue('crd'),
}));

function fakeCrd(name: string): K8sResource {
  return {
    metadata: {
      name: name,
      uid: '',
      creationTimestamp: '',
      resourceVersion: '',
      labels: undefined,
    },
  };
}
const fakeT = ((key: string) =>
  ({
    'custom-resource-definitions.title': 'TEST',
  })[key] ?? key) as TFunction;

function fixContext({
  tokens,
  resourceCache = {},
}: {
  tokens: string[];
  resourceCache?: Record<string, K8sResource[]>;
}): CommandPaletteContext {
  return {
    activeClusterName: undefined,
    clusterNames: [],
    clusterNodes: [],
    clustersInfo: {
      currentCluster: undefined,
      clusters: null,
      setCurrentCluster: function (args_0: ActiveClusterState): void {
        throw new Error('Function not implemented.');
      },
      setClusters: function (
        args_0: ClustersState | ((prev: ClustersState) => ClustersState),
      ): void {
        throw new Error('Function not implemented.');
      },
      removeCluster: () => null,
      navigate: undefined,
    },
    fetch(relativeUrl: string): Promise<any> {
      return Promise.resolve(undefined);
    },
    hiddenNamespaces: [],
    namespace: '',
    namespaceNodes: [],
    navigate(_: string): void {},
    query: '',
    resourceCache,
    setOpenSettingsModal(open: boolean): void {},
    setShowYamlUpload(show: boolean): void {},
    showHiddenNamespaces: false,
    t: fakeT,
    updateResourceCache(key: string, resources: K8sResource[]): void {},
    tokens,
  };
}
describe('getAutocompleteEntries', () => {
  it('AutoComplete with which should match fullname of crd', () => {
    const ctx = fixContext({ tokens: ['c'] });

    let result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('customresourcedefinitions ');
  });

  it('AutoComplete with which should match plural shortname of crd', () => {
    const ctx = fixContext({ tokens: ['cr'] });

    let result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('crds');
  });

  it('AutoComplete doesnt match anything', () => {
    const ctx = fixContext({ tokens: ['anything'] });

    let result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(0);
  });

  it('AutoComplete with 3 tokens', () => {
    const ctx = fixContext({
      tokens: ['crd', '/', 'xyz'],
      resourceCache: {
        customresourcedefinitions: [
          fakeCrd('abcd'),
          fakeCrd('xyzResource'),
          fakeCrd('resoruceXyz'),
        ],
      },
    });
    let result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('crd xyzResource ');
  });

  it('AutoComplete with 2 tokens returns empty suggestion array', () => {
    const ctx = fixContext({
      tokens: ['crd', 'xyz'],
      resourceCache: {
        customresourcedefinitions: [
          fakeCrd('abcd'),
          fakeCrd('xyzResource'),
          fakeCrd('resoruceXyz'),
        ],
      },
    });

    let result = crdHandler.getAutocompleteEntries(ctx);

    expect(result).toHaveLength(0);
  });
});

describe('getSuggestion', () => {
  it('Check if helper is called with proper arguments', () => {
    const mockSuggestionForSingleResource = vi.mocked(
      getSuggestionForSingleResource,
    );

    const ctx: CommandPaletteContext = {
      tokens: ['cred'],
      t: fakeT,
      resourceCache: {
        customresourcedefinitions: [fakeCrd('test')],
      },
    };
    let result = crdHandler.getSuggestion(ctx);

    expect(result).toBe('crd');
    expect(mockSuggestionForSingleResource).toHaveBeenCalledOnce();
    expect(mockSuggestionForSingleResource).toHaveBeenCalledWith({
      tokens: ['cred'],
      resources: [fakeCrd('test')],
      resourceTypeNames: expect.arrayContaining([
        'customresourcedefinitions',
        'crd',
        'crds',
      ]),
    });
  });
});

describe('get createResults', () => {
  it('test', () => {
    const ctx: CommandPaletteContext = {
      tokens: ['c'],
      t: fakeT,
      resourceCache: {
        customresourcedefinitions: [],
      },
    };
    let result = crdHandler.createResults(ctx);
    console.log(result);
  });
});
