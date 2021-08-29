import * as jp from 'jsonpath';

export function issuerToYaml(issuer) {
  let spec = {
    requestsPerDayQuota: issuer.requestsPerDayQuota || undefined,
  };
  if (issuer.type === 'ca') {
    spec = {
      ...spec,
      ca: {
        privateKeySecretRef: {
          name: issuer.privateKeyName,
          namespace: issuer.privateKeyNamespace,
        },
      },
    };
  } else if (issuer.type === 'acme') {
    const hasDomains = issuer.includeDomains || issuer.excludeDomains;
    const hasExternalAccount =
      issuer.externalAccountKeyId ||
      issuer.externalAccountSecretName ||
      issuer.externalAccountSecretNamespace;
    spec = {
      ...spec,
      acme: {
        server: issuer.server,
        email: issuer.email,
        autoRegistration: issuer.autoRegistration,
        privateKeySecretRef: issuer.autoRegistration
          ? undefined
          : {
              name: issuer.privateKeyName,
              namespace: issuer.privateKeyNamespace,
            },
        domains: hasDomains
          ? {
              include: issuer.includeDomains || undefined,
              exclude: issuer.excludeDomains || undefined,
            }
          : undefined,
        skipDNSChallengeValidation:
          issuer.skipDNSChallengeValidation || undefined,
        externalAccountBinding: hasExternalAccount
          ? {
              keyID: issuer.externalAccountKeyId,
              keySecretRef: {
                name: issuer.externalAccountSecretName,
                namespace: issuer.externalAccountSecretNamespace,
              },
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
export function yamlToIssuer(yaml, prevIssuer) {
  let type = jp.value(yaml, '$.spec.ca')
    ? 'ca'
    : jp.value(yaml, '$.spec.acme')
    ? 'acme'
    : undefined;

  return {
    name: jp.value(yaml, '$.metadata.name') || '',
    namespace: jp.value(yaml, '$.metadata.namespace') || '',
    type,
    requestsPerDayQuota: jp.value(yaml, '$.spec.requestsPerDayQuota'),
    server: jp.value(yaml, '$.spec.acme.server') || '',
    email: jp.value(yaml, '$.spec.acme.email') || '',
    includeDomains: jp.value(yaml, '$.spec.acme.domains.include') || '',
    excludeDomains: jp.value(yaml, '$.spec.acme.domains.exclude') || '',
    skipDNSChallengeValidation:
      jp.value(yaml, '$.spec.acme.skipDNSChallengeValidation') || false,
    privateKeyName:
      (type === 'ca'
        ? jp.value(yaml, '$.spec.ca.privateKeySecretRef.name')
        : type === 'acme'
        ? jp.value(yaml, '$.spec.acme.privateKeySecretRef.name')
        : '') || '',
    privateKeyNamespace:
      (type === 'ca'
        ? jp.value(yaml, '$.spec.ca.privateKeySecretRef.namespace')
        : type === 'acme'
        ? jp.value(yaml, '$.spec.acme.privateKeySecretRef.namespace')
        : '') || '',
  };
}

export function createIssuerTemplate(namespace) {
  return {
    name: '',
    namespace,
    type: undefined,
    server: '',
    email: '',
    autoRegistration: true,
    privateKeyName: '',
    privateKeyNamespace: '',
    requestsPerDayQuota: 0,
    skipDNSChallengeValidation: false,
    includeDomains: '',
    excludeDomains: '',
    externalAccountKeyId: '',
    externalAccountSecretName: '',
    externalAccountSecretNamespace: '',
  };
}

export function createPresets(namespace, t) {
  return [
    {
      name: t('issuers.create.presets.default'),
      value: createIssuerTemplate(namespace),
    },
    {
      name: t('issuers.create.presets.ca'),
      value: {
        ...createIssuerTemplate(namespace),
        type: 'ca',
      },
    },
    {
      name: t('issuers.create.presets.acme'),
      value: {
        ...createIssuerTemplate(namespace),
        type: 'acme',
      },
    },
  ];
}
