import { vi } from 'vitest';

vi.mock('state/utils/getBackendInfo', () => ({
  getClusterConfig: () => ({ backendAddress: '/backend' }),
}));

import { suggestEdits } from './suggestEdits';

describe('suggestEdits', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ updated_yaml: 'spec:\n  replicas: 3' }),
    })) as unknown as typeof fetch;
  });

  it('posts to the backend proxy with the mapped request body', async () => {
    const result = await suggestEdits({
      userQuery: 'scale to 3 replicas',
      context: { line_start: 2, line_end: 2 },
      fullYaml: 'spec:\n  replicas: 1',
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe('/backend/ai-editor/suggest-edits');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({
      user_query: 'scale to 3 replicas',
      context: { line_start: 2, line_end: 2 },
      full_yaml: 'spec:\n  replicas: 1',
      additional_context: null,
    });
    expect(result).toBe('spec:\n  replicas: 3');
  });

  it('throws with the backend error message on a non-ok response', async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({ error: 'AI inline edit is not configured' }),
    })) as unknown as typeof fetch;

    await expect(
      suggestEdits({
        userQuery: 'x',
        context: { line_start: 1, line_end: 1 },
        fullYaml: 'a: 1',
      }),
    ).rejects.toThrow('AI inline edit is not configured');
  });

  it('throws when the response is missing updated_yaml', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    await expect(
      suggestEdits({
        userQuery: 'x',
        context: { line_start: 1, line_end: 1 },
        fullYaml: 'a: 1',
      }),
    ).rejects.toThrow('unexpected response');
  });
});
