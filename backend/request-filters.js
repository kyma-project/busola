export const localIpFilter = (_req, headersData) => {
  //https://stackoverflow.com/a/62925185, but without 127.0.0.1 range
  const localIpRegex = /\b(0?10\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|172\.0?1[6-9]\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|172\.0?2[0-9]\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|172\.0?3[01]\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|192\.168\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|169\.254\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|::1|[fF][cCdD][0-9a-fA-F]{2}(?:[:][0-9a-fA-F]{0,4}){0,7}|[fF][eE][89aAbB][0-9a-fA-F](?:[:][0-9a-fA-F]{0,4}){0,7})(?:\/([789]|1?[0-9]{2}))?\b/;

  const host = headersData.targetApiServer.host || '';

  if (localIpRegex.test(host) || host.endsWith('.cluster.local')) {
    throw Error('Local IP addresses are not allowed.');
  }
};

export const pathWhitelistFilter = req => {
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

  if (!whitelist.some(e => path.startsWith(e))) {
    throw Error(`Path ${path} is not whitelisted.`);
  }
};

export const pathInvalidCharacterFilter = req => {
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

export const invalidRequestMethodFilter = req => {
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
