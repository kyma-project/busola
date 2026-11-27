import http from 'node:http';
import https from 'node:https';
import { Buffer } from 'node:buffer';
import config from '../src/config/config.js';
import { resolveOrBlockPrivateIpAddress } from './network-utils.js';
import {
  PrivateIPUsedError,
  ResponseTooLargeError,
  TooManyRedirectsError,
  RequestTimeoutError,
  UnsupportedProtocolError,
} from './http-errors.js';
import { validateHost } from './validators.js';

export {
  ResponseTooLargeError,
  TooManyRedirectsError,
  RequestTimeoutError,
  UnsupportedProtocolError,
} from './http-errors.js';
export { validateHttps } from './validators.js';

const DEFAULT_MAX_REDIRECTS = 5;
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_RESPONSE_BYTES = 10 * 1024 * 1024;
const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);
const SUPPORTED_PROTOCOLS = new Set(['http:', 'https:']);

function runValidators(url, validators) {
  for (const validate of validators) {
    const result = validate(new URL(url.href));
    if (result && typeof result.then === 'function') {
      throw new TypeError('Async validators are not supported');
    }
    if (result === false) {
      throw new PrivateIPUsedError(`Request to ${url.href} was rejected`);
    }
  }
}

function requestOnce(url, { signal, validators, maxResponseBytes, lookup }) {
  return new Promise((resolve, reject) => {
    if (!SUPPORTED_PROTOCOLS.has(url.protocol)) {
      return reject(
        new UnsupportedProtocolError(`Unsupported protocol: ${url.protocol}`),
      );
    }
    try {
      runValidators(url, validators);
    } catch (error) {
      return reject(error);
    }

    const isHttps = url.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    let settled = false;
    function settle(fn, value) {
      if (settled) return;
      settled = true;
      fn(value);
    }

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      signal,
      lookup,
    };

    const request = requestModule.request(options, (response) => {
      const declared = Number(response.headers['content-length']);
      if (
        maxResponseBytes != null &&
        Number.isFinite(declared) &&
        declared > maxResponseBytes
      ) {
        response.destroy();
        return settle(reject, new ResponseTooLargeError('Response too large'));
      }

      const chunks = [];
      let total = 0;
      response.on('data', (chunk) => {
        total += chunk.length;
        if (maxResponseBytes != null && total > maxResponseBytes) {
          response.destroy();
          settle(reject, new ResponseTooLargeError('Response too large'));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => {
        settle(resolve, {
          status: response.statusCode,
          headers: response.headers,
          body: Buffer.concat(chunks).toString('utf8'),
        });
      });
      response.on('error', (error) => settle(reject, error));
    });

    request.on('error', (error) => settle(reject, error));
    request.end();
  });
}

export default async function request(
  url,
  {
    validators,
    maxRedirects = DEFAULT_MAX_REDIRECTS,
    maxResponseBytes = DEFAULT_MAX_RESPONSE_BYTES,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    lookup,
  } = {},
) {
  const allowPrivateIps =
    config.features?.ALLOW_PRIVATE_IPS?.isEnabled ?? false;

  const effectiveLookup = allowPrivateIps
    ? lookup
    : resolveOrBlockPrivateIpAddress;

  const baseValidators = allowPrivateIps ? [] : [validateHost];
  const effectiveValidators = [...baseValidators, ...(validators ?? [])];

  const controller = new AbortController();
  const deadlineTimer = setTimeout(() => {
    controller.abort(new RequestTimeoutError('Request timed out'));
  }, timeoutMs);

  let currentUrl = new URL(url);
  const initialProtocol = currentUrl.protocol;

  try {
    for (let hop = 0; ; hop++) {
      if (hop > maxRedirects) {
        throw new TooManyRedirectsError('Too many redirects');
      }

      let response;
      try {
        response = await requestOnce(currentUrl, {
          signal: controller.signal,
          validators: effectiveValidators,
          maxResponseBytes,
          allowPrivateIps,
          lookup: effectiveLookup,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          throw controller.signal.reason;
        }
        throw error;
      }

      if (
        REDIRECT_STATUS_CODES.has(response.status) &&
        response.headers.location
      ) {
        const nextUrl = new URL(response.headers.location, currentUrl);
        if (initialProtocol === 'https:' && nextUrl.protocol !== 'https:') {
          throw new PrivateIPUsedError(
            `Redirect downgraded from https to ${nextUrl.protocol}: ${nextUrl.href}`,
          );
        }
        currentUrl = nextUrl;
        continue;
      }

      return {
        status: response.status,
        headers: response.headers,
        body: response.body,
        finalUrl: currentUrl,
      };
    }
  } finally {
    clearTimeout(deadlineTimer);
  }
}
