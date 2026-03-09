import { buildK8sRequestPath } from './handler.js';

describe('buildK8sRequestPath', () => {
  test('should use only the request path when targetApiServer has no path', () => {
    const targetApiServer = new URL('https://api.example.com');
    expect(
      buildK8sRequestPath(targetApiServer, '/backend/api/v1/namespaces'),
    ).toBe('/api/v1/namespaces');
  });

  test('should prepend targetApiServer path to the request path', () => {
    const targetApiServer = new URL(
      'https://tenant.prod03.apimanagement.eu10.hana.ondemand.com/monsoon3',
    );
    expect(
      buildK8sRequestPath(targetApiServer, '/backend/api/v1/namespaces'),
    ).toBe('/monsoon3/api/v1/namespaces');
  });

  test('should handle targetApiServer path with trailing slash', () => {
    const targetApiServer = new URL('https://api.example.com/subpath/');
    expect(
      buildK8sRequestPath(targetApiServer, '/backend/apis/apps/v1/deployments'),
    ).toBe('/subpath/apis/apps/v1/deployments');
  });

  test('should handle multi-segment targetApiServer path', () => {
    const targetApiServer = new URL('https://api.example.com/level1/level2');
    expect(buildK8sRequestPath(targetApiServer, '/backend/api/v1/pods')).toBe(
      '/level1/level2/api/v1/pods',
    );
  });

  test('should handle request URL without /backend prefix', () => {
    const targetApiServer = new URL('https://api.example.com/subpath');
    expect(buildK8sRequestPath(targetApiServer, '/api/v1/nodes')).toBe(
      '/subpath/api/v1/nodes',
    );
  });

  test('should handle root path targetApiServer with explicit slash', () => {
    const targetApiServer = new URL('https://api.example.com/');
    expect(
      buildK8sRequestPath(targetApiServer, '/backend/api/v1/namespaces'),
    ).toBe('/api/v1/namespaces');
  });
});
