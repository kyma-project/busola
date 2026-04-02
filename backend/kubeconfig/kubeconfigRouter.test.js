import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';

// We test the route handlers by importing the module with mocked fs
const mockFiles = ['cluster-a.yaml', 'cluster-b.yaml', 'notayaml.txt'];
const MOCK_DIR = path.resolve('./config/kubeconfigs');

const mockFsState = {
  dirExists: true,
  files: mockFiles,
  fileContents: {
    [path.join(MOCK_DIR, 'cluster-a.yaml')]: 'apiVersion: v1\nkind: Config\n',
    [path.join(MOCK_DIR, 'cluster-b.yaml')]:
      'apiVersion: v1\nkind: Config\nclusters: []\n',
  },
};

vi.mock('fs', () => ({
  default: {
    existsSync: (p) => {
      if (p === MOCK_DIR) return mockFsState.dirExists;
      return Object.keys(mockFsState.fileContents).includes(p);
    },
    readdirSync: () => mockFsState.files,
    readFileSync: (p) => {
      if (mockFsState.fileContents[p]) return mockFsState.fileContents[p];
      throw new Error(`ENOENT: no such file or directory, open '${p}'`);
    },
  },
  existsSync: (p) => {
    if (p === MOCK_DIR) return mockFsState.dirExists;
    return Object.keys(mockFsState.fileContents).includes(p);
  },
  readdirSync: () => mockFsState.files,
  readFileSync: (p) => {
    if (mockFsState.fileContents[p]) return mockFsState.fileContents[p];
    throw new Error(`ENOENT: no such file or directory, open '${p}'`);
  },
}));

// Helper to create mock req/res
function makeReq(params = {}) {
  return { params };
}

function makeRes() {
  const res = {
    _status: 200,
    _body: null,
    _headers: {},
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      this._body = body;
      return this;
    },
    send(body) {
      this._body = body;
      return this;
    },
    setHeader(key, value) {
      this._headers[key] = value;
      return this;
    },
  };
  return res;
}

// Import handlers directly
const { default: router } = await import('./kubeconfigRouter.js');

// Extract route handlers from the router's stack
function getHandler(method, path) {
  for (const layer of router.stack) {
    if (
      layer.route &&
      layer.route.path === path &&
      layer.route.methods[method.toLowerCase()]
    ) {
      return layer.route.stack[0].handle;
    }
  }
  throw new Error(`No handler found for ${method} ${path}`);
}

describe('kubeconfigRouter', () => {
  describe('GET / — list kubeconfigs', () => {
    it('returns list of kubeconfig IDs without .yaml extension', () => {
      const handler = getHandler('GET', '/');
      const req = makeReq();
      const res = makeRes();
      handler(req, res);
      expect(res._body).toEqual(['cluster-a', 'cluster-b']);
    });

    it('returns empty array when directory does not exist', () => {
      mockFsState.dirExists = false;
      const handler = getHandler('GET', '/');
      const req = makeReq();
      const res = makeRes();
      handler(req, res);
      expect(res._body).toEqual([]);
      mockFsState.dirExists = true;
    });
  });

  describe('GET /:id — serve kubeconfig', () => {
    it('serves a kubeconfig file by ID without .yaml extension', () => {
      const handler = getHandler('GET', '/:id');
      const req = makeReq({ id: 'cluster-a' });
      const res = makeRes();
      handler(req, res);
      expect(res._status).toBe(200);
      expect(res._body).toBe('apiVersion: v1\nkind: Config\n');
      expect(res._headers['Content-Type']).toBe('text/yaml');
    });

    it('serves a kubeconfig file when .yaml is already included in ID', () => {
      const handler = getHandler('GET', '/:id');
      const req = makeReq({ id: 'cluster-a.yaml' });
      const res = makeRes();
      handler(req, res);
      expect(res._status).toBe(200);
      expect(res._body).toBe('apiVersion: v1\nkind: Config\n');
    });

    it('returns 404 when kubeconfig does not exist', () => {
      const handler = getHandler('GET', '/:id');
      const req = makeReq({ id: 'nonexistent' });
      const res = makeRes();
      handler(req, res);
      expect(res._status).toBe(404);
      expect(res._body).toHaveProperty('Error');
    });

    it('returns 400 for invalid IDs with path traversal', () => {
      const handler = getHandler('GET', '/:id');
      const req = makeReq({ id: '../etc/passwd' });
      const res = makeRes();
      handler(req, res);
      expect(res._status).toBe(400);
      expect(res._body).toHaveProperty('Error');
    });

    it('returns 400 for IDs with special characters', () => {
      const handler = getHandler('GET', '/:id');
      const req = makeReq({ id: 'cluster/../../secret' });
      const res = makeRes();
      handler(req, res);
      expect(res._status).toBe(400);
    });
  });
});
