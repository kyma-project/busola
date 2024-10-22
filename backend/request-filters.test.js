import {
  invalidHeaderFilter,
  invalidRequestMethodFilter,
  localIpFilter,
  pathInvalidCharacterFilter,
  pathWhitelistFilter,
} from './request-filters';

describe('invalidRequestMethodFilter tests', () => {
  const successTestCases = [
    {
      description: 'should not throw an error for GET requests',
      req: { originalUrl: '/some-path', method: 'GET' },
    },
    {
      description:
        'should not throw an error for OPTIONS requests that include "proxy" in path',
      req: { originalUrl: '/proxy/some-path', method: 'OPTIONS' },
    },
    {
      description:
        'should not throw an error for HEAD requests that include "proxy" in path',
      req: { originalUrl: '/proxy/some-path', method: 'HEAD' },
    },
  ];

  const errorTestCases = [
    {
      description: 'should throw an error for TRACE requests',
      req: { originalUrl: '/some-path', method: 'TRACE' },
    },
    {
      description:
        'should throw an error for OPTIONS requests not including "proxy" in path',
      req: { originalUrl: '/some-path', method: 'OPTIONS' },
    },
    {
      description:
        'should throw an error for HEAD requests not including "proxy" in path',
      req: { originalUrl: '/some-path', method: 'HEAD' },
    },
  ];

  test.each(successTestCases)('$description', ({ req }) => {
    expect(() => invalidRequestMethodFilter(req)).not.toThrow();
  });

  test.each(errorTestCases)('$description', ({ req }) => {
    expect(() => invalidRequestMethodFilter(req)).toThrowError(
      'Invalid request method',
    );
  });
});

describe('invalidHeaderFilter tests', () => {
  const successTestCases = [
    {
      description:
        'should not throw an error if x-forwarded-for and forwarded headers are absent',
      req: {
        headers: {
          host: 'localhost',
          'user-agent': 'Mozilla/5.0',
        },
      },
    },
    {
      description: 'should not throw an error for no provided headers',
      req: {},
    },
  ];

  const errorTestCases = [
    {
      description: 'should throw an error if x-forwarded-for header is present',
      req: {
        headers: {
          'x-forwarded-for': '123.45.67.89',
        },
      },
    },
    {
      description: 'should throw an error if forwarded header is present',
      req: {
        headers: {
          forwarded: 'for=123.45.67.89;by=proxy',
        },
      },
    },
    {
      description:
        'should throw an error if both x-forwarded-for and forwarded headers are present',
      req: {
        headers: {
          'x-forwarded-for': '123.45.67.89',
          forwarded: 'for=123.45.67.89;by=proxy',
        },
      },
    },
  ];

  test.each(successTestCases)('$description', ({ req }) => {
    expect(() => invalidHeaderFilter(req)).not.toThrow();
  });

  test.each(errorTestCases)('$description', ({ req }) => {
    expect(() => invalidHeaderFilter(req)).toThrowError(
      'Request contains invalid headers.',
    );
  });
});

describe('pathInvalidCharacterFilter tests', () => {
  const successTestCases = [
    {
      description: 'should not throw an error for a valid characters',
      req: {
        originalUrl: '/valid/path-#&?-123',
      },
    },
    {
      description: 'should handle single encoded characters correctly',
      req: {
        originalUrl: '%2E', // encoded single dot "."
      },
    },
  ];

  const errorTestCases = [
    {
      description: 'should throw an error for a path containing ..',
      req: {
        originalUrl: '/valid/../invalid/path',
      },
      expectedError: 'Path contains invalid characters',
    },
    {
      description: 'should throw an error when path contains NULL character',
      req: { originalUrl: '/valid/path%00' },
      expectedError: 'Path contains invalid characters',
    },
    {
      description: 'should throw an error for an improperly encoded path',
      req: {
        originalUrl: '/invalid%path',
      },
      expectedError: 'Path contains invalid encoding',
    },
    {
      description: 'should throw an error for double encoded characters',
      req: {
        originalUrl: '/%252e%252e',
      },
      expectedError: 'Decoded path contains illegal % characters',
    },
  ];

  test.each(successTestCases)('$description', ({ req }) => {
    expect(() => pathInvalidCharacterFilter(req)).not.toThrow();
  });

  test.each(errorTestCases)('$description', ({ req, expectedError }) => {
    expect(() => pathInvalidCharacterFilter(req)).toThrowError(expectedError);
  });
});

describe('pathWhitelistFilter tests', () => {
  const successTestCases = [
    {
      description: 'should allow whitelisted paths',
      req: {
        originalUrl: '/backend/api/users',
      },
    },
    {
      description: 'should allow whitelisted root path',
      req: {
        originalUrl: '/backend/.well-known',
      },
    },
  ];

  const errorTestCases = [
    {
      description: 'should throw error for non-whitelisted path',
      req: {
        originalUrl: '/backend/notallowed',
      },
    },
    {
      description: 'should throw error for an empty path',
      req: {
        originalUrl: '/backend/',
      },
    },
    {
      description: 'should throw error for undefined paths',
      req: {
        originalUrl: '',
      },
    },
  ];

  test.each(successTestCases)('$description', ({ req }) => {
    expect(() => pathWhitelistFilter(req)).not.toThrow();
  });

  test.each(errorTestCases)('$description', ({ req }) => {
    expect(() => pathWhitelistFilter(req)).toThrowError(
      `Path ${req.originalUrl.replace(/^\/backend/, '')} is not whitelisted.`,
    );
  });
});

describe('localIpFilter tests', () => {
  const successTestCases = [
    {
      description: 'should allow a public IP address',
      headersData: {
        targetApiServer: {
          host: '203.0.113.1',
        },
      },
    },
    {
      description: 'should allow an external cluster address',
      headersData: {
        targetApiServer: {
          host: 'myservice.cluster.external',
        },
      },
    },
  ];

  const errorTestCases = [
    {
      description:
        'should throw an error for a local IP address in the 10.0.0.0/8 range',
      headersData: {
        targetApiServer: {
          host: '10.0.0.1',
        },
      },
    },
    {
      description:
        'should throw an error for a local IP address in the 172.16.0.0/12 range',
      headersData: {
        targetApiServer: {
          host: '172.16.0.1',
        },
      },
    },
    {
      description:
        'should throw an error for a local IP address in the 192.168.0.0/16 range',
      headersData: {
        targetApiServer: {
          host: '192.168.1.1',
        },
      },
    },
    {
      description:
        'should throw an error for a local IP address in the 169.254.0.0/16 range',
      headersData: {
        targetApiServer: {
          host: '169.254.1.1',
        },
      },
    },
    {
      description: 'should throw an error for a local cluster address',
      headersData: {
        targetApiServer: {
          host: 'myservice.cluster.local',
        },
      },
    },
  ];

  test.each(successTestCases)('$description', ({ headersData }) => {
    expect(() => localIpFilter({}, headersData)).not.toThrow();
  });

  test.each(errorTestCases)('$description', ({ headersData }) => {
    expect(() => localIpFilter({}, headersData)).toThrowError(
      'Local IP addresses are not allowed.',
    );
  });
});
