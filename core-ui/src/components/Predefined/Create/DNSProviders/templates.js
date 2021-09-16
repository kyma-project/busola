export function createDNSProviderTemplate(namespace) {
  return {
    apiVersion: 'dns.gardener.cloud/v1alpha1',
    kind: 'DNSProvider',
    metadata: {
      name: '',
      namespace,
      labels: {},
      annotations: {},
    },
    spec: {
      domains: {
        include: [],
        exclude: [],
      },
      secretRef: {
        name: '',
        namespace,
      },
      type: '',
    },
  };
}
