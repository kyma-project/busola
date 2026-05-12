import { vi } from 'vitest';

// Mock config before imports to ensure default behavior
vi.mock('./config.js', () => ({
  default: {
    features: {
      ALLOW_PRIVATE_IPS: {
        isEnabled: false,
      },
    },
  },
}));

import {
  invalidRequestMethodFilter,
  localIpFilter,
  pathInvalidCharacterFilter,
  pathWhitelistFilter,
  portFilter,
} from './request-filters.js';

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
          hostname: '203.0.113.1',
        },
      },
    },
    {
      description: 'should allow an external cluster address',
      headersData: {
        targetApiServer: {
          hostname: 'myservice.cluster.external',
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
          hostname: '10.0.0.1',
        },
      },
    },
    {
      description:
        'should throw an error for a local IP address in the 172.16.0.0/12 range',
      headersData: {
        targetApiServer: {
          hostname: '172.16.0.1',
        },
      },
    },
    {
      description:
        'should throw an error for a local IP address in the 192.168.0.0/16 range',
      headersData: {
        targetApiServer: {
          hostname: '192.168.1.1',
        },
      },
    },
    {
      description:
        'should throw an error for a local IP address in the 169.254.0.0/16 range',
      headersData: {
        targetApiServer: {
          hostname: '169.254.1.1',
        },
      },
    },
    {
      description: 'should throw an error for a local cluster address',
      headersData: {
        targetApiServer: {
          hostname: 'myservice.cluster.local',
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

describe('localIpFilter with ALLOW_PRIVATE_IPS feature flag', () => {
  beforeEach(() => {
    // Reset modules to allow mocking
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should allow private IPs when feature flag is enabled', async () => {
    vi.doMock('./config.js', () => ({
      default: {
        features: {
          ALLOW_PRIVATE_IPS: {
            isEnabled: true,
          },
        },
      },
    }));

    const { localIpFilter } = await import('./request-filters.js');

    const headersData = {
      targetApiServer: {
        hostname: '172.18.0.4',
      },
    };

    expect(() => localIpFilter({}, headersData)).not.toThrow();
  });

  test('should block private IPs when feature flag is disabled', async () => {
    vi.doMock('./config.js', () => ({
      default: {
        features: {
          ALLOW_PRIVATE_IPS: {
            isEnabled: false,
          },
        },
      },
    }));

    const { localIpFilter } = await import('./request-filters.js');

    const headersData = {
      targetApiServer: {
        hostname: '172.18.0.4',
      },
    };

    expect(() => localIpFilter({}, headersData)).toThrowError(
      'Local IP addresses are not allowed.',
    );
  });

  test('should block private IPs when feature flag is missing (secure default)', async () => {
    vi.doMock('./config.js', () => ({
      default: {
        features: {},
      },
    }));

    const { localIpFilter } = await import('./request-filters.js');

    const headersData = {
      targetApiServer: {
        hostname: '192.168.1.1',
      },
    };

    expect(() => localIpFilter({}, headersData)).toThrowError(
      'Local IP addresses are not allowed.',
    );
  });

  test('should allow .cluster.local domains when feature flag is enabled', async () => {
    vi.doMock('./config.js', () => ({
      default: {
        features: {
          ALLOW_PRIVATE_IPS: {
            isEnabled: true,
          },
        },
      },
    }));

    const { localIpFilter } = await import('./request-filters.js');

    const headersData = {
      targetApiServer: {
        hostname: 'kubernetes.default.svc.cluster.local',
      },
    };

    expect(() => localIpFilter({}, headersData)).not.toThrow();
  });

  test('should block .cluster.local domains when feature flag is disabled', async () => {
    vi.doMock('./config.js', () => ({
      default: {
        features: {},
      },
    }));

    const { localIpFilter } = await import('./request-filters.js');

    const headersData = {
      targetApiServer: {
        hostname: 'kubernetes.default.svc.cluster.local',
      },
    };

    expect(() => localIpFilter({}, headersData)).toThrowError(
      'Local IP addresses are not allowed.',
    );
  });
});

describe('portFilter tests', () => {
  const successTestCases = [
    {
      description: 'should allow port 443 (standard HTTPS port)',
      headersData: { targetApiServer: { port: '443' } },
    },
    {
      description: 'should allow port 6443 (common Kubernetes API server port)',
      headersData: { targetApiServer: { port: '6443' } },
    },
    {
      description: 'should allow port 8443',
      headersData: { targetApiServer: { port: '8443' } },
    },
    {
      description: 'should allow port 80 (standard HTTP port)',
      headersData: { targetApiServer: { port: '80' } },
    },
    {
      description: 'should allow port 1 (minimum valid port)',
      headersData: { targetApiServer: { port: '1' } },
    },
    {
      description: 'should allow port 65535 (maximum valid port)',
      headersData: { targetApiServer: { port: '65535' } },
    },
    {
      description: 'should allow empty port (protocol default will be used)',
      headersData: { targetApiServer: { port: '' } },
    },
  ];

  const errorTestCases = [
    {
      description: 'should throw an error for port 0',
      headersData: { targetApiServer: { port: '0' } },
      expectedError: 'Port 0 is not a valid port number.',
    },
    {
      description: 'should throw an error for port 65536 (above max)',
      headersData: { targetApiServer: { port: '65536' } },
      expectedError: 'Port 65536 is not a valid port number.',
    },
    {
      description: 'should throw an error for a negative port',
      headersData: { targetApiServer: { port: '-1' } },
      expectedError: 'Port -1 is not a valid port number.',
    },
    {
      description: 'should throw an error for a non-numeric port',
      headersData: { targetApiServer: { port: 'abc' } },
      expectedError: 'Port abc is not a valid port number.',
    },
  ];

  test.each(successTestCases)('$description', ({ headersData }) => {
    expect(() => portFilter({}, headersData)).not.toThrow();
  });

  test.each(errorTestCases)(
    '$description',
    ({ headersData, expectedError }) => {
      expect(() => portFilter({}, headersData)).toThrowError(expectedError);
    },
  );
});
