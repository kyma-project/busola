import * as jp from 'jsonpath';

export function toYaml(issuer) {
  let spec = {
    requestsPerDayQuota: issuer.requestsPerDayQuota || undefined,
  };
  if (issuer.type === 'ca') {
    spec = {
      ...spec,
      ca: {
        privateKeySecretRef: issuer.privateKeySecretRef,
      },
    };
  } else if (issuer.type === 'acme') {
    const includeDomains = issuer.includeDomains.filter(domain => !!domain);
    const excludeDomains = issuer.excludeDomains.filter(domain => !!domain);
    const hasDomains = includeDomains.length || excludeDomains.length;
    const hasExternalAccount =
      issuer.externalAccountKeyId || issuer.externalAccountSecretRef.name;
    spec = {
      ...spec,
      acme: {
        server: issuer.server,
        email: issuer.email,
        autoRegistration: issuer.autoRegistration,
        privateKeySecretRef: !issuer.autoRegistration
          ? issuer.privateKeySecretRef
          : undefined,
        domains: hasDomains
          ? {
              include: includeDomains.length ? includeDomains : undefined,
              exclude: excludeDomains.length ? excludeDomains : undefined,
            }
          : undefined,
        skipDNSChallengeValidation:
          issuer.skipDNSChallengeValidation || undefined,
        externalAccountBinding: hasExternalAccount
          ? {
              keyID: issuer.externalAccountKeyId,
              keySecretRef: issuer.externalAccountSecretRef,
            }
          : undefined,
      },
    };
  }

  return {
    apiVersion: 'cert.gardener.cloud/v1alpha1',
    kind: 'Issuer',
    metadata: {
      name: issuer.name,
      namespace: issuer.namespace,
    },
    spec,
  };
}

export function fromYaml(yaml, prevIssuer) {
  let type;
  let privateKeySecretRef;
  if (jp.value(yaml, '$.spec.ca')) {
    type = 'ca';
    privateKeySecretRef = {
      name: jp.value(yaml, '$.spec.ca.privateKeySecretRef.name'),
      namespace: jp.value(yaml, '$.spec.ca.privateKeySecretRef.namespace'),
    };
  } else if (jp.value(yaml, '$.spec.acme')) {
    type = 'acme';
    privateKeySecretRef = {
      name: jp.value(yaml, '$.spec.acme.privateKeySecretRef.name'),
      namespace: jp.value(yaml, '$.spec.acme.privateKeySecretRef.namespace'),
    };
  }

  return {
    name: jp.value(yaml, '$.metadata.name') || '',
    namespace: jp.value(yaml, '$.metadata.namespace') || '',
    type,
    requestsPerDayQuota: jp.value(yaml, '$.spec.requestsPerDayQuota'),
    server: jp.value(yaml, '$.spec.acme.server') || '',
    email: jp.value(yaml, '$.spec.acme.email') || '',
    includeDomains: jp.value(yaml, '$.spec.acme.domains.include') || [],
    excludeDomains: jp.value(yaml, '$.spec.acme.domains.exclude') || [],
    skipDNSChallengeValidation:
      jp.value(yaml, '$.spec.acme.skipDNSChallengeValidation') || false,
    privateKeySecretRef,
  };
}

export function createTemplate(namespace) {
  return {
    name: '',
    namespace,
    type: undefined,
    server: '',
    email: '',
    autoRegistration: true,
    privateKeySecretRef: {
      name: '',
      namespace: '',
    },
    requestsPerDayQuota: 0,
    skipDNSChallengeValidation: false,
    includeDomains: [],
    excludeDomains: [],
    externalAccountKeyId: '',
    externalAccountSecretRef: {
      name: '',
      namespace: '',
    },
  };
}
