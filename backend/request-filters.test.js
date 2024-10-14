import {
  invalidHeaderFilter,
  invalidRequestMethodFilter,
  localIpFilter,
  pathInvalidCharacterFilter,
  pathWhitelistFilter,
} from './request-filters';

describe('invalidRequestMethodFilter', () => {
  it('should throw an error for TRACE requests', () => {
    const req = { originalUrl: '/some-path', method: 'TRACE' };

    expect(() => invalidRequestMethodFilter(req)).toThrowError(
      'Invalid request method',
    );
  });

  it('should throw an error for OPTIONS requests not including "proxy" in path', () => {
    const req = { originalUrl: '/some-path', method: 'OPTIONS' };

    expect(() => invalidRequestMethodFilter(req)).toThrowError(
      'Invalid request method',
    );
  });

  it('should not throw an error for OPTIONS requests that include "proxy" in path', () => {
    const req = { originalUrl: '/proxy/some-path', method: 'OPTIONS' };

    expect(() => invalidRequestMethodFilter(req)).not.toThrow();
  });

  it('should throw an error for HEAD requests not including "proxy" in path', () => {
    const req = { originalUrl: '/some-path', method: 'HEAD' };

    expect(() => invalidRequestMethodFilter(req)).toThrowError(
      'Invalid request method',
    );
  });

  it('should not throw an error for HEAD requests that include "proxy" in path', () => {
    const req = { originalUrl: '/proxy/some-path', method: 'HEAD' };

    expect(() => invalidRequestMethodFilter(req)).not.toThrow();
  });

  it('should not throw an error for GET requests', () => {
    const req = { originalUrl: '/some-path', method: 'GET' };

    expect(() => invalidRequestMethodFilter(req)).not.toThrow();
  });
});

describe('invalidHeaderFilter', () => {
  it('should throw an error if x-forwarded-for header is present', () => {
    const req = {
      headers: {
        'x-forwarded-for': '123.45.67.89',
      },
    };

    expect(() => invalidHeaderFilter(req)).toThrowError(
      'Request contains invalid headers.',
    );
  });

  it('should throw an error if forwarded header is present', () => {
    const req = {
      headers: {
        forwarded: 'for=123.45.67.89;by=proxy',
      },
    };

    expect(() => invalidHeaderFilter(req)).toThrowError(
      'Request contains invalid headers.',
    );
  });

  it('should throw an error if both x-forwarded-for and forwarded headers are present', () => {
    const req = {
      headers: {
        'x-forwarded-for': '123.45.67.89',
        forwarded: 'for=123.45.67.89;by=proxy',
      },
    };

    expect(() => invalidHeaderFilter(req)).toThrowError(
      'Request contains invalid headers.',
    );
  });

  it('should not throw an error if x-forwarded-for and forwarded headers are absent', () => {
    const req = {
      headers: {
        host: 'localhost',
        'user-agent': 'Mozilla/5.0',
      },
    };

    expect(() => invalidHeaderFilter(req)).not.toThrow();
  });
});

describe('pathInvalidCharacterFilter', () => {
  it('should not throw an error for a valid path', () => {
    const req = {
      originalUrl: '/valid/path-123',
    };

    expect(() => pathInvalidCharacterFilter(req)).not.toThrow();
  });

  it('should throw an error for a path with invalid characters', () => {
    const req = {
      originalUrl: '/invalid/path<with>brackets',
    };

    expect(() => pathInvalidCharacterFilter(req)).toThrowError(
      'Path contains invalid characters.',
    );
  });

  it('should throw an error for a path containing ..', () => {
    const req = {
      originalUrl: '/valid/../invalid/path',
    };

    expect(() => pathInvalidCharacterFilter(req)).toThrowError(
      'Path contains invalid characters.',
    );
  });

  it('should throw an error when path contains NULL character', () => {
    const req = { originalUrl: '/valid/path%00' }; // NULL character encoded as %00
    expect(() => {
      pathInvalidCharacterFilter(req);
    }).toThrow('Path contains non-printable or control characters.');
  });

  it('should throw an error for an improperly encoded path', () => {
    const req = {
      originalUrl: '/invalid%path',
    };

    expect(() => pathInvalidCharacterFilter(req)).toThrowError(
      'Invalid URL encoding in path.',
    );
  });

  it('should throw an error for double encoded characters', () => {
    const req = {
      originalUrl: '/%252e%252e',
    };

    expect(() => pathInvalidCharacterFilter(req)).toThrowError(
      'Path contains invalid encoding',
    );
  });

  it('should handle single encoded characters correctly', () => {
    const req = {
      originalUrl: '%2E', // encoded single dot "."
    };

    expect(() => pathInvalidCharacterFilter(req)).not.toThrow();
  });
});

describe('pathWhitelistFilter', () => {
  it('should allow whitelisted paths', () => {
    const req = {
      originalUrl: '/backend/api/users',
    };

    expect(() => pathWhitelistFilter(req)).not.toThrow();
  });

  it('should allow whitelisted root path', () => {
    const req = {
      originalUrl: '/backend/.well-known',
    };

    expect(() => pathWhitelistFilter(req)).not.toThrow();
  });

  it('should throw error for non-whitelisted path', () => {
    const req = {
      originalUrl: '/backend/notallowed',
    };

    expect(() => pathWhitelistFilter(req)).toThrow(
      'Path /notallowed is not whitelisted.',
    );
  });

  it('should throw error for an empty path', () => {
    const req = {
      originalUrl: '/backend/',
    };

    expect(() => pathWhitelistFilter(req)).toThrow(
      'Path / is not whitelisted.',
    );
  });

  it('should throw error for undefined paths', () => {
    const req = {
      originalUrl: '',
    };

    expect(() => pathWhitelistFilter(req)).toThrow('Path  is not whitelisted.');
  });
});

describe('localIpFilter', () => {
  it('should allow a public IP address', () => {
    const headersData = {
      targetApiServer: {
        host: '203.0.113.1',
      },
    };

    expect(() => localIpFilter({}, headersData)).not.toThrow();
  });

  it('should throw an error for a local IP address in the 10.0.0.0/8 range', () => {
    const headersData = {
      targetApiServer: {
        host: '10.0.0.1',
      },
    };

    expect(() => localIpFilter({}, headersData)).toThrow(
      'Local IP addresses are not allowed.',
    );
  });

  it('should throw an error for a local IP address in the 172.16.0.0/12 range', () => {
    const headersData = {
      targetApiServer: {
        host: '172.16.0.1',
      },
    };

    expect(() => localIpFilter({}, headersData)).toThrow(
      'Local IP addresses are not allowed.',
    );
  });

  it('should throw an error for a local IP address in the 192.168.0.0/16 range', () => {
    const headersData = {
      targetApiServer: {
        host: '192.168.1.1',
      },
    };

    expect(() => localIpFilter({}, headersData)).toThrow(
      'Local IP addresses are not allowed.',
    );
  });

  it('should throw an error for a local IP address in the 169.254.0.0/16 range', () => {
    const headersData = {
      targetApiServer: {
        host: '169.254.1.1',
      },
    };

    expect(() => localIpFilter({}, headersData)).toThrow(
      'Local IP addresses are not allowed.',
    );
  });

  it('should throw an error for a local cluster address', () => {
    const headersData = {
      targetApiServer: {
        host: 'myservice.cluster.local',
      },
    };

    expect(() => localIpFilter({}, headersData)).toThrow(
      'Local IP addresses are not allowed.',
    );
  });

  it('should allow an external cluster address', () => {
    const headersData = {
      targetApiServer: {
        host: 'myservice.cluster.external',
      },
    };

    expect(() => localIpFilter({}, headersData)).not.toThrow();
  });
});
