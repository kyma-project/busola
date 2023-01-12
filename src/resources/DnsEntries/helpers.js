export function createDNSEntryTemplate(namespaceId) {
  return {
    apiVersion: 'dns.gardener.cloud/v1alpha1',
    kind: 'DNSEntry',
    metadata: {
      name: '',
      namespace: namespaceId,
      labels: {},
      annotations: {},
    },
    spec: {
      dnsName: '',
      targets: [],
      text: [],
      ttl: 600,
    },
  };
}

export function createDNSEntryTemplateForGardener(namespaceId) {
  const dnsEntry = createDNSEntryTemplate(namespaceId);
  dnsEntry.metadata.annotations = { 'dns.gardener.cloud/class': 'garden' };
  return dnsEntry;
}
