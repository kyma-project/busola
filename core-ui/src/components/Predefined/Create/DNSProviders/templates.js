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

export const createDNSProviderTemplateForGardener = namespace => {
  const dnsProvider = createDNSProviderTemplate(namespace);
  dnsProvider.metadata.annotations = { 'dns.gardener.cloud/class': 'garden' };
  return dnsProvider;
};
