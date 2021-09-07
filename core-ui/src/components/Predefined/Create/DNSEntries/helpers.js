import * as jp from 'jsonpath';

export function dnsEntryToYaml(dnsEntry) {
  return {
    apiVersion: 'dns.gardener.cloud/v1alpha1',
    kind: 'DNSEntry',
    metadata: {
      name: dnsEntry.name,
      namespace: dnsEntry.namespace,
      labels: dnsEntry.labels,
      annotations: dnsEntry.annotations,
    },
    spec: {
      dnsName: dnsEntry.dnsName,
      targets: dnsEntry.targets,
      text: dnsEntry.text,
      ttl: dnsEntry.ttl,
    },
  };
}

export function yamlToDNSEntry(yaml) {
  return {
    name: jp.value(yaml, '$.metadata.name') || '',
    namespace: jp.value(yaml, '$.metadata.namespace') || '',
    labels: jp.value(yaml, '$.metadata.labels') || {},
    annotations: jp.value(yaml, '$.metadata.annotations') || {},
    dnsName: jp.value(yaml, '$.spec.dnsName') || '',
    targets: jp.value(yaml, '$.spec.targets') || [],
    text: jp.value(yaml, '$.spec.text') || [],
    ttl: jp.value(yaml, '$.spec.ttl') || 600,
  };
}

export function createDNSEntryTemplate(namespaceId) {
  return {
    name: '',
    namespace: namespaceId,
    labels: {},
    annotations: {},
    dnsName: '',
    targets: [],
    text: [],
    ttl: 600,
  };
}
