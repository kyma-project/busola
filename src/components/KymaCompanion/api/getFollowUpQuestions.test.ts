import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import getFollowUpQuestions from './getFollowUpQuestions';

const fetchMock = vi.fn();
const handleFollowUpQuestions = vi.fn();
const handleFollowUpError = vi.fn();

const baseParams = {
  sessionID: 'session-1',
  handleFollowUpQuestions,
  handleFollowUpError,
  clusterUrl: 'https://api.cluster.example',
  certificateAuthorityData: 'ca-data',
};

const respondWith = (body: unknown) =>
  fetchMock.mockResolvedValue({ json: async () => body });

const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body);

describe('getFollowUpQuestions', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects without calling the backend when no credentials are given', async () => {
    await expect(getFollowUpQuestions(baseParams)).rejects.toThrow(
      'Missing authentication credentials',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects when only half of the client certificate pair is given', async () => {
    await expect(
      getFollowUpQuestions({ ...baseParams, clientCertificateData: 'cert' }),
    ).rejects.toThrow('Missing authentication credentials');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the session with token auth and passes the questions on', async () => {
    respondWith({
      promptSuggestions: ['Why is it failing?', 'How to fix it?'],
    });

    await getFollowUpQuestions({ ...baseParams, token: 'cluster-token' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/backend/ai-chat/followup');
    expect(init.method).toBe('POST');
    expect(sentBody()).toEqual({
      clusterUrl: 'https://api.cluster.example',
      certificateAuthorityData: 'ca-data',
      sessionId: 'session-1',
      clusterToken: 'cluster-token',
    });
    expect(handleFollowUpQuestions).toHaveBeenCalledWith([
      'Why is it failing?',
      'How to fix it?',
    ]);
    expect(handleFollowUpError).not.toHaveBeenCalled();
  });

  it('accepts a client certificate pair instead of a token', async () => {
    respondWith({ promptSuggestions: ['Next?'] });

    await getFollowUpQuestions({
      ...baseParams,
      clientCertificateData: 'cert',
      clientKeyData: 'key',
    });

    expect(sentBody()).toMatchObject({
      clientCertificateData: 'cert',
      clientKeyData: 'key',
    });
    expect(sentBody()).not.toHaveProperty('clusterToken');
    expect(handleFollowUpQuestions).toHaveBeenCalledWith(['Next?']);
  });

  it('sends an empty session id when none is given', async () => {
    respondWith({ promptSuggestions: [] });

    await getFollowUpQuestions({
      ...baseParams,
      sessionID: undefined,
      token: 'cluster-token',
    });

    expect(sentBody().sessionId).toBe('');
  });

  it('reports an error when the response has no questions', async () => {
    respondWith({ error: 'something else' });

    await getFollowUpQuestions({ ...baseParams, token: 'cluster-token' });

    expect(handleFollowUpError).toHaveBeenCalledTimes(1);
    expect(handleFollowUpQuestions).not.toHaveBeenCalled();
  });

  it('reports an error when the request fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(
      getFollowUpQuestions({ ...baseParams, token: 'cluster-token' }),
    ).resolves.toBeUndefined();

    expect(handleFollowUpError).toHaveBeenCalledTimes(1);
    expect(handleFollowUpQuestions).not.toHaveBeenCalled();
  });
});
