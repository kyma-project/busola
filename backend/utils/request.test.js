import { afterEach, describe, expect, it, vi } from 'vitest';
import http from 'node:http';
import { once } from 'node:events';
import request, { TooManyRedirectsError } from './request.js';
import { PrivateIPUsedError } from './http-errors.js';

// use custom lookup function to control how requests works.
vi.mock('../src/config/config.js', () => ({
  default: { features: { ALLOW_PRIVATE_IPS: { isEnabled: true } } },
}));

function resolveLocal(options, callback) {
  const address = { address: '127.0.0.1', family: 4 };
  if (options && options.all) {
    callback(null, [address]);
  } else {
    callback(null, address.address, address.family);
  }
}

function lookupBlockingAfter(n) {
  let calls = 0;
  const lookup = (_hostname, options, callback) => {
    calls += 1;
    if (calls > n) {
      return callback(new PrivateIPUsedError(`blocked after ${n} calls`));
    }
    resolveLocal(options, callback);
  };
  lookup.getCalls = () => calls;
  return lookup;
}

describe('request — redirect SSRF', () => {
  let server;

  afterEach(async () => {
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      server = undefined;
    }
  });

  it('blocks a redirect whose target is localhost', async () => {
    const internalReached = { hit: false };
    server = http.createServer((req, res) => {
      if (req.url === '/start') {
        res.writeHead(302, { location: 'http://localhost/internal' });
      } else {
        internalReached.hit = true;
      }
      res.end();
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const port = server.address().port;

    const lookup = lookupBlockingAfter(0);

    await expect(
      request(`http://allowed.example:${port}/start`, { lookup }),
    ).rejects.toBeInstanceOf(PrivateIPUsedError);
    expect(internalReached.hit).toBe(false);
  });

  it('follows redirects and block internal IP call', async () => {
    const internalReached = { hit: false };
    server = http.createServer((req, res) => {
      if (req.url === '/start') {
        res.writeHead(302, { location: 'http://second.example/internal' });
        res.end();
      } else {
        internalReached.hit = true;
        res.end('REACHED INTERNAL');
      }
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const port = server.address().port;

    const lookup = lookupBlockingAfter(1);

    await expect(
      request(`http://first.example:${port}/start`, { lookup }),
    ).rejects.toBeInstanceOf(PrivateIPUsedError);
    expect(lookup.getCalls()).toBe(2);
    expect(internalReached.hit).toBe(false);
  });

  it('follows the redirects and reach the max redirects', async () => {
    const internalReached = { hit: false };
    server = http.createServer((req, res) => {
      if (req.url === '/start') {
        res.writeHead(302, { location: `http://${req.headers.host}/start` });
      } else {
        internalReached.hit = true;
      }
      res.end();
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const port = server.address().port;

    const lookup = lookupBlockingAfter(2);

    await expect(
      request(`http://first.example:${port}/start`, {
        lookup,
        maxRedirects: 2,
      }),
    ).rejects.toBeInstanceOf(TooManyRedirectsError);
    expect(lookup.getCalls()).toBe(1);
    expect(internalReached.hit).toBe(false);
  });
});
