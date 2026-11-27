import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import getPromptSuggestions from './getPromptSuggestions';

const post = vi.fn();

const baseParams = {
  post,
  resourceType: 'Deployment',
  clusterUrl: 'https://api.cluster.example',
  certificateAuthorityData: 'ca-data',
  clusterAuth: { token: 'cluster-token' },
};

describe('getPromptSuggestions', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts the resource context and returns the suggestions', async () => {
    const response = {
      promptSuggestions: ['What is wrong?', 'How to scale it?'],
      conversationId: 'conversation-1',
    };
    post.mockResolvedValue(response);

    const result = await getPromptSuggestions({
      ...baseParams,
      namespace: 'default',
      groupVersion: 'apps/v1',
      resourceName: 'my-app',
    });

    expect(result).toEqual(response);
    expect(post).toHaveBeenCalledWith('/ai-chat/suggestions', {
      namespace: 'default',
      resourceType: 'Deployment',
      groupVersion: 'apps/v1',
      resourceName: 'my-app',
      clusterUrl: 'https://api.cluster.example',
      certificateAuthorityData: 'ca-data',
      clusterToken: 'cluster-token',
      clientCertificateData: undefined,
      clientKeyData: undefined,
    });
  });

  it('sends the client certificate pair for certificate auth', async () => {
    post.mockResolvedValue({ promptSuggestions: [], conversationId: 'c' });

    await getPromptSuggestions({
      ...baseParams,
      clusterAuth: { clientCertificateData: 'cert', clientKeyData: 'key' },
    });

    expect(post.mock.calls[0][1]).toMatchObject({
      clusterToken: undefined,
      clientCertificateData: 'cert',
      clientKeyData: 'key',
    });
  });

  it.each([
    ['an empty response', null],
    ['a non-object response', 'not an object'],
    ['a missing conversation id', { promptSuggestions: ['a'] }],
    [
      'suggestions that are not a list',
      { promptSuggestions: 'a', conversationId: 'c' },
    ],
    [
      'a conversation id that is not a string',
      { promptSuggestions: ['a'], conversationId: 1 },
    ],
  ])('returns false for %s', async (_, response) => {
    post.mockResolvedValue(response);

    expect(await getPromptSuggestions(baseParams)).toBe(false);
  });

  it('returns false when the request fails', async () => {
    post.mockRejectedValue(new Error('Network error'));

    expect(await getPromptSuggestions(baseParams)).toBe(false);
  });
});
