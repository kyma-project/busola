const localIpFilter = (_req, headersData) => {
  //https://stackoverflow.com/a/62925185, but without 127.0.0.1 range
  const localIpRegex = /\b(0?10\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|172\.0?1[6-9]\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|172\.0?2[0-9]\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|172\.0?3[01]\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|192\.168\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|169\.254\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|::1|[fF][cCdD][0-9a-fA-F]{2}(?:[:][0-9a-fA-F]{0,4}){0,7}|[fF][eE][89aAbB][0-9a-fA-F](?:[:][0-9a-fA-F]{0,4}){0,7})(?:\/([789]|1?[0-9]{2}))?\b/;

  const host = headersData.targetApiServer.host || '';

  if (localIpRegex.test(host) || host.endsWith('.cluster.local')) {
    throw Error('Local IP addresses are not allowed.');
  }
};

const pathWhitelistFilter = req => {
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

const pathInvalidCharacterFilter = req => {
  const encodedPath = req.originalUrl.replace(/^\/backend/, '');
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(encodedPath);
  } catch (err) {
    throw Error('Invalid URL encoding in path.');
  }

  // Allow alphanumeric, dashes, underscores, dots, slashes, colons, tildes, question marks, equals, and ampersands
  const validPathRegex = /^[a-zA-Z0-9/_\-.:~?&=]+$/;
  if (decodedPath.includes('..') || !validPathRegex.test(decodedPath)) {
    throw Error(`Path ${decodedPath} contains invalid characters.`);
  }
};

const invalidHeaderFilter = req => {
  const headers = req.headers;

  if ('x-forwarded-for' in headers || 'forwarded' in headers) {
    throw Error(`Request contains invalid headers.`);
  }
};

const invalidRequestMethodFilter = req => {
  const method = req.method;

  if (method === 'TRACE') {
    throw Error(`Invalid request method`);
  }
};

export const filters = [
  invalidRequestMethodFilter,
  localIpFilter,
  pathWhitelistFilter,
  pathInvalidCharacterFilter,
  invalidHeaderFilter,
];
