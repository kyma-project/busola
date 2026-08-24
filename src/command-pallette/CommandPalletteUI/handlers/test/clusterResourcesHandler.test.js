import { describe, it } from 'vitest';
import { clusterResourceHandler } from 'command-pallette/CommandPalletteUI/handlers/clusterResourceHandler';

describe('getAutocompleteEntries', () => {
  it('getAutocompleteEntries returns resourceType', () => {
    const ctx = {
      tokens: ['persistentvolu'],
      resourceCache: {
        test: {},
      },
    };
    const results = clusterResourceHandler.getAutocompleteEntries(ctx);

    expect(results).toContainEqual('persistentvolumes');
  });

  it('getAutocompleteEntries returns type alias ', () => {
    const ctx = {
      tokens: ['p'],
      resourceCache: {
        test: {},
      },
    };
    const results = clusterResourceHandler.getAutocompleteEntries(ctx);

    expect(results).toEqual(
      expect.arrayContaining(['persistentvolumes'], ['pv'], ['priorityclass']),
    );
  });

  it('getAutocompleteEntries returns resource instance', () => {
    const ctx = {
      tokens: ['p'],
      resourceCache: {
        test: {},
      },
    };
    const results = clusterResourceHandler.getAutocompleteEntries(ctx);

    expect(results).toEqual(
      expect.arrayContaining(['persistentvolumes'], ['pv'], ['priorityclass']),
    );
  });
});
