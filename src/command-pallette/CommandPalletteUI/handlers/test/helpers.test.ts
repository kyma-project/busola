import { describe, expect, it } from 'vitest';
import { getSuggestionForSingleResource } from 'command-pallette/CommandPalletteUI/handlers/helpers';
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
    let result = getSuggestionForSingleResource(ctx);

    expect(result).toBe('crd');
  });

  it('Random tokens, no suggetions', () => {
    const ctx = {
      tokens: ['random-toekns'],
      resourceTypeNames: ['crd'],
      resources: [],
    };

    let result = getSuggestionForSingleResource(ctx);

    expect(result).toBeNull();
  });

  it('Type and name, resource suggested', () => {
    const ctx = {
      tokens: ['crd', 'mycred'],
      resourceTypeNames: ['crd'],
      resources: [fixCRD('my-crd')],
    };

    let result = getSuggestionForSingleResource(ctx);

    expect(result).toBe('crd my-crd');
  });

  it('Type and name and multiple resources, resource suggested', () => {
    const ctx = {
      tokens: ['crd', 'mycred'],
      resourceTypeNames: ['crd'],
      resources: [fixCRD('my-crd'), fixCRD('other-crd')],
    };

    let result = getSuggestionForSingleResource(ctx);

    expect(result).toBe('crd my-crd');
  });

  it('Type and name, resource not suggested', () => {
    const ctx = {
      tokens: ['crd', 'some-random-string'],
      resourceTypeNames: ['crd'],
      resources: [fixCRD('my-crd')],
    };

    let result = getSuggestionForSingleResource(ctx);

    expect(result).toBeUndefined();
  });
});
