import { isValidHost } from './network-utils.js';
import { PrivateIPUsedError } from './http-errors.js';

export function validateHttps(url) {
  if (url.protocol !== 'https:') {
    throw new PrivateIPUsedError(`Only https is allowed: ${url.href}`);
  }
}

export function validateHost(url) {
  if (!isValidHost(url.hostname)) {
    throw new PrivateIPUsedError(`Hostname ${url.hostname} is not allowed`);
  }
}

const GITHUB_ALLOWED_DOMAINS = [
  'githubusercontent.com',
  'github.com',
  'github.io',
];

export function validateGithub(url) {
  validateHttps(url);
  const isAllowedHost = GITHUB_ALLOWED_DOMAINS.some(
    (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`),
  );
  const isDefaultHttpPort = !url.port || url.port === '443';
  if (!isAllowedHost || !isDefaultHttpPort) {
    throw new PrivateIPUsedError(
      `URL ${url.href} is not an allowed GitHub URL`,
    );
  }
}
