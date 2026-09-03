import { describe, expect, it } from 'vitest';
import {
  autocompleteForResources,
  findAllPossibleResourceTypes,
  findMatchingResourceType,
  getSuggestionForSingleResource,
} from 'command-pallette/CommandPalletteUI/handlers/helpers';
import { fixK8sResource } from 'command-pallette/CommandPalletteUI/handlers/test/fixtures';

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
      resources: [fixK8sResource('my-crd')],
    };

    const result = getSuggestionForSingleResource(ctx);

    expect(result).toBe('crd my-crd');
  });

  it('Type and name and multiple resources, resource suggested', () => {
    const ctx = {
      tokens: ['crd', 'mycred'],
      resourceTypeNames: ['crd'],
      resources: [fixK8sResource('my-crd'), fixK8sResource('other-crd')],
    };

    const result = getSuggestionForSingleResource(ctx);

    expect(result).toBe('crd my-crd');
  });

  it('Type and name, resource not suggested', () => {
    const ctx = {
      tokens: ['crd', 'some-random-string'],
      resourceTypeNames: ['crd'],
      resources: [fixK8sResource('my-crd')],
    };

    const result = getSuggestionForSingleResource(ctx);

    expect(result).toBeUndefined();
  });
});

describe('autocompleteForResources', () => {
  it('autocompleteForResources returns matched resource instance', () => {
    const ctx = {
      tokens: ['al', '/', 'pi'],
      resources: [fixK8sResource('pipe')],
      resourceTypes: [
        {
          resourceType: 'any-resource',
          aliases: ['ab', 'xy'],
        },
      ],
    };
    const results = autocompleteForResources(ctx);

    expect(results).toEqual(['al pipe ']);
  });

  it('autocompleteForResources returns resource type based on resource aliases', () => {
    const ctx = {
      tokens: ['c'],
      resources: [fixK8sResource('pipe')],
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

  it('autocompleteForResources returns nothing when there is not enough tokens', () => {
    const ctx = {
      tokens: ['c', '/'],
      resources: [fixK8sResource('pipe')],
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
