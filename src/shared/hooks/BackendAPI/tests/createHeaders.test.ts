import { createAuthHeaders, createHeaders } from '../createHeaders';

const cluster = {
  currentContext: {
    cluster: {
      cluster: {
        server: 'https://api.my-cluster.example.com',
        'certificate-authority-data': 'ca-data-abc',
      },
    },
  },
};

describe('createAuthHeaders', () => {
  it('builds a bearer header from a token', () => {
    expect(createAuthHeaders({ token: 'my-token' })).toEqual({
      'X-K8s-Authorization': 'Bearer my-token',
    });
  });

  it('builds client-certificate headers when no token is present', () => {
    const headers = createAuthHeaders({
      'client-certificate-data': 'cert',
      'client-key-data': 'key',
    });

    expect(headers).toEqual({
      'X-Client-Certificate-Data': 'cert',
      'X-Client-Key-Data': 'key',
    });
  });

  it('throws when there is no auth data', () => {
    expect(() => createAuthHeaders(null)).toThrow(
      'No available data to authenticate the request.',
    );
  });
});

describe('createHeaders', () => {
  it('merges auth, SSO, cluster URL and CA data', () => {
    const headers = createHeaders({ token: 'my-token' }, cluster, {
      id_token: 'sso-token',
    });

    expect(headers).toEqual({
      'X-K8s-Authorization': 'Bearer my-token',
      Authorization: 'Bearer sso-token',
      'X-Cluster-Url': 'https://api.my-cluster.example.com',
      'X-Cluster-Certificate-Authority-Data': 'ca-data-abc',
    });
  });

  it('omits the SSO header when there is no SSO data', () => {
    const headers = createHeaders({ token: 'my-token' }, cluster, null);

    expect(headers).not.toHaveProperty('Authorization');
    expect(headers).toMatchObject({
      'X-K8s-Authorization': 'Bearer my-token',
      'X-Cluster-Url': 'https://api.my-cluster.example.com',
    });
  });

  it('leaves cluster headers undefined when no cluster is set', () => {
    const headers = createHeaders({ token: 'my-token' }, null, null);

    expect(headers['X-Cluster-Url']).toBeUndefined();
    expect(headers['X-Cluster-Certificate-Authority-Data']).toBeUndefined();
  });
});
