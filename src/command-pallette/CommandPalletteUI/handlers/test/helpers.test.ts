import { describe, expect, it } from 'vitest';
import {
  autocompleteForResources,
  getSuggestionForSingleResource,
  findMatchingResourceType,
  findAllPossibleResourceTypes,
} from 'command-pallette/CommandPalletteUI/handlers/helpers';
import { K8sResource } from 'types';

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

describe('getSuggestionForSingleResource', () => {
  it('Typo in tokens, matched short type', () => {
    const ctx = {
      tokens: ['cred'],
      resources: [],
      resourceTypeNames: ['crd'],
    };
    const result = getSuggestionForSingleResource(ctx);

    expect(result).toBe('crd');
  });

  it('Random tokens, no suggestions', () => {
    const ctx = {
      tokens: ['random-tokens'],
      resourceTypeNames: ['crd'],
      resources: [],
    };

    const result = getSuggestionForSingleResource(ctx);

    expect(result).toBeNull();
  });

  it('Type and name, resource suggested', () => {
    const ctx = {
      tokens: ['crd', 'mycred'],
      resourceTypeNames: ['crd'],
      resources: [fixCRD('my-crd')],
    };

    const result = getSuggestionForSingleResource(ctx);

    expect(result).toBe('crd my-crd');
  });

  it('Type and name and multiple resources, resource suggested', () => {
    const ctx = {
      tokens: ['crd', 'mycred'],
      resourceTypeNames: ['crd'],
      resources: [fixCRD('my-crd'), fixCRD('other-crd')],
    };

    const result = getSuggestionForSingleResource(ctx);

    expect(result).toBe('crd my-crd');
  });

  it('Type and name, resource not suggested', () => {
    const ctx = {
      tokens: ['crd', 'some-random-string'],
      resourceTypeNames: ['crd'],
      resources: [fixCRD('my-crd')],
    };

    const result = getSuggestionForSingleResource(ctx);

    expect(result).toBeUndefined();
  });
});

describe('autocompleteForResources', () => {
  it('autocompleteForResources returns matched resource instance by alias', () => {
    const ctx = {
      tokens: ['al', '/', 'pi'],
      resources: [fixCRD('pipe')],
      resourceTypes: [
        {
          resourceType: 'metal',
          aliases: ['al', 'cu'],
        },
      ],
    };
    const results = autocompleteForResources(ctx);

    expect(results).toEqual(['al pipe ']);
  });

  it('autocompleteForResources returns matched resource instance', () => {
    const ctx = {
      tokens: ['any-resource', '/', 'pi'],
      resources: [fixCRD('pipe')],
      resourceTypes: [
        {
          resourceType: 'metal',
          aliases: ['al', 'cu'],
        },
      ],
    };
    const results = autocompleteForResources(ctx);

    expect(results).toEqual(['any-resource pipe ']);
  });

  it('autocompleteForResources returns results based on resource aliases', () => {
    const ctx = {
      tokens: ['c'],
      resources: [fixCRD('pipe')],
      resourceTypes: [
        {
          resourceType: 'metal',
          aliases: ['al', 'cu', 'metal'],
        },
      ],
    };
    const results = autocompleteForResources(ctx);

    expect(results).toEqual(['cu']);
  });

  it('autocompleteForResources returns nothing when there is not enoght tokens', () => {
    const ctx = {
      tokens: ['c', '/'],
      resources: [fixCRD('pipe')],
      resourceTypes: [
        {
          resourceType: 'metal',
          aliases: ['al', 'cu', 'metal'],
        },
      ],
    };
    const results = autocompleteForResources(ctx);

    expect(results).toHaveLength(0);
  });
});

describe('findMatchingResourceType', () => {
  it('findMatchingResourceType returns full resource name based on alias', () => {
    const resourceType = 'mr';
    const resources = [
      {
        resourceType: 'my-resource',
        aliases: ['mr'],
      },
    ];
    const result = findMatchingResourceType(resourceType, resources);

    expect(result).toEqual('my-resource');
  });

  it('findMatchingResourceType returns provided resource type when any alias does not match', () => {
    const resourceType = 'any-resource-type';
    const resources = [
      {
        resourceType: 'my-resource',
        aliases: ['mr'],
      },
    ];
    const result = findMatchingResourceType(resourceType, resources);

    expect(result).toEqual(resourceType);
  });
});

describe('findAllPossibleResourceTypes', () => {
  it('findAllPossibleResourceTypes returns full resource name based on part of alias', () => {
    const resourceType = 'm';
    const resources = [
      {
        resourceType: 'my-resource',
        aliases: ['mr', 'my-resource'],
      },
      {
        resourceType: 'my-bike',
        aliases: ['mb', 'my-bike'],
      },
      {
        resourceType: 'neighbour-resource',
        aliases: ['nr', 'neighbour-resource'],
      },
    ];
    const result = findAllPossibleResourceTypes(resourceType, resources);

    expect(result).toEqual(['my-resource', 'my-bike']);
  });

  it('findAllPossibleResourceTypes returns provided resource type when any alias does not match', () => {
    const resourceType = 'any-resource-type';
    const resources = [
      {
        resourceType: 'my-resource',
        aliases: ['mr'],
      },
    ];
    const result = findAllPossibleResourceTypes(resourceType, resources);

    expect(result).toEqual([resourceType]);
  });
});

//TODO: extractShortNames
