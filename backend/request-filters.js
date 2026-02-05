import net from 'net';
import { isPrivateIp } from './utils/network-utils';

export const localIpFilter = (_req, headersData) => {
  const host = headersData.targetApiServer.host || '';

  if (host.endsWith('.cluster.local')) {
    throw Error('Local IP addresses are not allowed.');
  }

  if (net.isIP(host)) {
    if (isPrivateIp(host)) {
      throw Error('Local IP addresses are not allowed.');
    }
  }
};

export const pathWhitelistFilter = (req) => {
  const path = req.originalUrl.replace(/^\/backend/, '');

  // list comes from "/" call to API server
  const whitelist = [
    '/.well-known',
    '/api',
    '/apis',
    '/healthz',
    '/livez',
    '/logs',
    '/metrics',
    '/openapi',
    '/openid',
    '/readyz',
    '/version',
  ];

  if (!whitelist.some((e) => path.startsWith(e))) {
    throw Error(`Path ${path} is not whitelisted.`);
  }
};

export const pathInvalidCharacterFilter = (req) => {
  const encodedPath = req.originalUrl;
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(encodedPath);
  } catch (err) {
    throw Error('Path contains invalid encoding', { cause: err });
  }

  // Check if the decoded path still contains encoded characters (i.e., '%' symbol)
  if (decodedPath.includes('%')) {
    throw Error('Decoded path contains illegal % characters');
  }

  // Check if the decoded path contains any non-printable or control characters
  // eslint-disable-next-line no-control-regex
  const controlCharRegex = /[\x00-\x1F\x7F]/;
  if (controlCharRegex.test(decodedPath) || decodedPath.includes('..')) {
    throw Error('Path contains invalid characters');
  }
};

export const invalidRequestMethodFilter = (req) => {
  const path = req.originalUrl;
  const method = req.method;

  if (
    method === 'TRACE' ||
    (['OPTIONS', 'HEAD'].includes(method) && !path.includes('proxy'))
  ) {
    throw Error(`Invalid request method`);
  }
};

export const filters = [
  invalidRequestMethodFilter,
  localIpFilter,
  pathWhitelistFilter,
  pathInvalidCharacterFilter,
];
