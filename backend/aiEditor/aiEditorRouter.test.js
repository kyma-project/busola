import { vi } from 'vitest';

vi.mock('../utils/network-utils.js', () => ({
  isValidHost: vi.fn(() => true),
  isPrivateAddressCached: vi.fn(async () => false),
}));

vi.mock('../src/config/config.js', () => ({
  default: {
    features: {
      AI_INLINE_EDIT: {
        config: { apiBaseUrl: 'https://ai.example.com' },
      },
      ALLOW_PRIVATE_IPS: { isEnabled: false },
    },
  },
}));

vi.mock('stream/promises', () => {
  const pipeline = vi.fn(async () => {});
  return { pipeline, default: { pipeline } };
});

import { handleSuggestEdits, handleInsights } from './aiEditorRouter.js';
import config from '../src/config/config.js';
import { isValidHost } from '../utils/network-utils.js';
import { pipeline } from 'stream/promises';

function makeRes() {
  const res = { headersSent: false };
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.setHeader = vi.fn();
  res.write = vi.fn();
  res.end = vi.fn(() => {
    res.writableEnded = true;
  });
  return res;
}

function makeReq(body) {
  return { body, log: { warn: vi.fn() }, id: 'req-1' };
}

function makeSSEStream(tokens) {
  const lines =
    tokens.map((t) => `data: ${JSON.stringify({ token: t })}\n\n`).join('') +
    'event: done\ndata: {}\n\n';
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(lines));
      controller.close();
    },
  });
}

const validBody = {
  user_query: 'scale to 3 replicas',
  context: { line_start: 1, line_end: 2 },
  full_yaml: 'spec:\n  replicas: 1',
};

describe('aiEditorRouter / handleSuggestEdits', () => {
  beforeEach(() => {
    config.features.AI_INLINE_EDIT.config.apiBaseUrl = 'https://ai.example.com';
    isValidHost.mockReturnValue(true);
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ updated_yaml: 'spec:\n  replicas: 3' }),
    }));
  });

  it('forwards to <base>/v1/suggest-edits and returns updated_yaml', async () => {
    const res = makeRes();
    await handleSuggestEdits(makeReq(validBody), res);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url.toString()).toBe('https://ai.example.com/v1/suggest-edits');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({
      user_query: 'scale to 3 replicas',
      context: { line_start: 1, line_end: 2 },
      full_yaml: 'spec:\n  replicas: 1',
      additional_context: null,
    });
    expect(res.json).toHaveBeenCalledWith({
      updated_yaml: 'spec:\n  replicas: 3',
    });
  });

  it('returns 400 when user_query is missing', async () => {
    const res = makeRes();
    await handleSuggestEdits(makeReq({ full_yaml: 'a: 1' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns 400 when full_yaml is missing', async () => {
    const res = makeRes();
    await handleSuggestEdits(makeReq({ user_query: 'do something' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns 503 when no backend URL is configured', async () => {
    config.features.AI_INLINE_EDIT.config.apiBaseUrl = '';
    const res = makeRes();
    await handleSuggestEdits(makeReq(validBody), res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects a disallowed (private/invalid) upstream host without fetching', async () => {
    isValidHost.mockReturnValue(false);
    const res = makeRes();
    await handleSuggestEdits(makeReq(validBody), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('mirrors the upstream status when the backend responds with an error', async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 429,
      json: async () => ({}),
    }));
    const res = makeRes();
    await handleSuggestEdits(makeReq(validBody), res);

    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('returns 502 when the backend response is missing updated_yaml', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ unexpected: true }),
    }));
    const res = makeRes();
    await handleSuggestEdits(makeReq(validBody), res);

    expect(res.status).toHaveBeenCalledWith(502);
  });
});

const validInsightsBody = {
  resource_kind: 'Deployment',
  resource_name: 'my-app',
  resource_api_version: 'apps/v1',
  namespace: 'default',
  clusterUrl: 'https://cluster.example',
  certificateAuthorityData: 'ca-data',
  clusterToken: 'token-abc',
};

describe('aiEditorRouter / handleInsights', () => {
  beforeEach(() => {
    config.features.AI_INLINE_EDIT.config.apiBaseUrl = 'https://ai.example.com';
    isValidHost.mockReturnValue(true);
    pipeline.mockClear();
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: makeSSEStream(['looks ', 'healthy']),
    }));
  });

  it('forwards to <base>/api/v2/insights with SSE Accept header and x-cluster-* headers from body', async () => {
    const res = makeRes();
    await handleInsights(makeReq(validInsightsBody), res);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url.toString()).toBe('https://ai.example.com/api/v2/insights');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Accept']).toBe('text/event-stream');
    expect(opts.headers['X-Cluster-Url']).toBe('https://cluster.example');
    expect(opts.headers['X-Cluster-Certificate-Authority-Data']).toBe(
      'ca-data',
    );
    expect(opts.headers['X-K8s-Authorization']).toBe('token-abc');
    expect(JSON.parse(opts.body)).toEqual({
      resource_kind: 'Deployment',
      resource_name: 'my-app',
      resource_api_version: 'apps/v1',
      namespace: 'default',
    });
  });

  it('sets SSE response headers and pipes the body via pipeline()', async () => {
    const res = makeRes();
    await handleInsights(makeReq(validInsightsBody), res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/event-stream',
    );
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
    expect(res.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
    expect(pipeline).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
  });

  it('uses client certificate headers when no token is supplied', async () => {
    const res = makeRes();
    await handleInsights(
      makeReq({
        ...validInsightsBody,
        clusterToken: undefined,
        clientCertificateData: 'cert',
        clientKeyData: 'key',
      }),
      res,
    );

    const [, opts] = global.fetch.mock.calls[0];
    expect(opts.headers['X-Client-Certificate-Data']).toBe('cert');
    expect(opts.headers['X-Client-Key-Data']).toBe('key');
    expect(opts.headers['X-K8s-Authorization']).toBeUndefined();
  });

  it('returns 400 when resource_kind is missing', async () => {
    const res = makeRes();
    await handleInsights(
      makeReq({ ...validInsightsBody, resource_kind: '' }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns 503 when no backend URL is configured', async () => {
    config.features.AI_INLINE_EDIT.config.apiBaseUrl = '';
    const res = makeRes();
    await handleInsights(makeReq(validInsightsBody), res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects a disallowed upstream host without fetching', async () => {
    isValidHost.mockReturnValue(false);
    const res = makeRes();
    await handleInsights(makeReq(validInsightsBody), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('mirrors the upstream status when the backend responds with an error', async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 502,
      json: async () => ({}),
    }));
    const res = makeRes();
    await handleInsights(makeReq(validInsightsBody), res);

    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('defaults optional fields to empty strings when not provided', async () => {
    const res = makeRes();
    await handleInsights(
      makeReq({
        resource_kind: 'Namespace',
        clusterUrl: 'https://cluster.example',
        certificateAuthorityData: 'ca-data',
        clusterToken: 'token-abc',
      }),
      res,
    );

    const [, opts] = global.fetch.mock.calls[0];
    expect(JSON.parse(opts.body)).toEqual({
      resource_kind: 'Namespace',
      resource_name: '',
      resource_api_version: '',
      namespace: '',
    });
  });
});
