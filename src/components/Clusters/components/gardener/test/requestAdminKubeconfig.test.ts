import { describe, it, expect, vi, afterEach } from 'vitest';
import { requestAdminKubeconfig } from '../requestAdminKubeconfig';

afterEach(() => vi.restoreAllMocks());

describe('requestAdminKubeconfig', () => {
  it('POSTs AdminKubeconfigRequest and returns the decoded kubeconfig + expiry', async () => {
    const mintedYaml = 'apiVersion: v1\nkind: Config\ncurrent-context: c\n';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: {
          kubeconfig: btoa(mintedYaml),
          expirationTimestamp: '2026-10-08T12:00:00Z',
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await requestAdminKubeconfig({
      backendAddress: '/backend',
      gardenServer: 'https://garden.example',
      token: 'tok',
      namespace: 'garden-proj',
      shootName: 'myshoot',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      '/backend/apis/core.gardener.cloud/v1beta1/namespaces/garden-proj/shoots/myshoot/adminkubeconfig',
    );
    expect(init.method).toBe('POST');
    expect(init.headers['X-Cluster-Url']).toBe('https://garden.example');
    expect(init.headers['X-K8s-Authorization']).toBe('Bearer tok');
    expect(JSON.parse(init.body)).toMatchObject({
      apiVersion: 'authentication.gardener.cloud/v1alpha1',
      kind: 'AdminKubeconfigRequest',
      spec: { expirationSeconds: 10800 },
    });
    expect((result.kubeconfig as any)['current-context']).toBe('c');
    expect(result.expirationTimestamp).toBe('2026-10-08T12:00:00Z');
  });

  it('uses Kubernetes Status message from response body on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({
          message: 'shoots.core.gardener.cloud "x" is forbidden: token expired',
        }),
      }),
    );
    await expect(
      requestAdminKubeconfig({
        backendAddress: '/backend',
        gardenServer: 'g',
        token: 't',
        namespace: 'n',
        shootName: 's',
      }),
    ).rejects.toThrow(
      'shoots.core.gardener.cloud "x" is forbidden: token expired',
    );
  });

  it('falls back to statusText when response body has no message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => {
          throw new SyntaxError('empty body');
        },
      }),
    );
    await expect(
      requestAdminKubeconfig({
        backendAddress: '/backend',
        gardenServer: 'g',
        token: 't',
        namespace: 'n',
        shootName: 's',
      }),
    ).rejects.toThrow('Forbidden');
  });

  it('falls back to HTTP status code when statusText is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: '',
        json: async () => {
          throw new SyntaxError('empty body');
        },
      }),
    );
    await expect(
      requestAdminKubeconfig({
        backendAddress: '/backend',
        gardenServer: 'g',
        token: 't',
        namespace: 'n',
        shootName: 's',
      }),
    ).rejects.toThrow('HTTP 403');
  });
});
