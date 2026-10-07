import { describe, it, expect, vi, afterEach } from 'vitest';
import { requestAdminKubeconfig } from '../requestAdminKubeconfig';

afterEach(() => vi.restoreAllMocks());

describe('requestAdminKubeconfig', () => {
  it('POSTs AdminKubeconfigRequest and decodes status.kubeconfig', async () => {
    const mintedYaml = 'apiVersion: v1\nkind: Config\ncurrent-context: c\n';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: { kubeconfig: btoa(mintedYaml) } }),
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
    expect((result as any)['current-context']).toBe('c');
  });

  it('throws statusText on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, statusText: 'Forbidden' }),
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
});
