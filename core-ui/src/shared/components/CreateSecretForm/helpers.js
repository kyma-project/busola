import * as jp from 'jsonpath';

import { base64Encode } from 'shared/helpers';

export const mapObjectValues = (fn, obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  );

export function secretToYaml({ secret, isEncoded }) {
  return {
    apiVersion: 'v1',
    kind: 'Secret',
    type: secret.type,
    metadata: {
      name: secret.name,
      namespace: secret.namespace,
      labels: secret.labels,
      annotations: secret.annotations,
    },
    data: isEncoded ? secret.data : mapObjectValues(base64Encode, secret.data),
  };
}

export function yamlToSecret(yaml) {
  return {
    name: jp.value(yaml, '$.metadata.name') || '',
    namespace: jp.value(yaml, '$.metadata.namespace') || '',
    type: jp.value(yaml, '$.type') || '',
    labels: jp.value(yaml, '$.metadata.labels') || {},
    annotations: jp.value(yaml, '$.metadata.annotations') || {},
    data: jp.value(yaml, '$.data') || '',
  };
}

export function createSecretTemplate(namespaceId) {
  return {
    name: '',
    namespace: namespaceId,
    type: 'Opaque',
    labels: {},
    annotations: {},
    data: {},
  };
}

export function createPresets(namespaceId, translate) {
  return [
    {
      name: translate('secrets.create-modal.presets.default'),
      value: createSecretTemplate(namespaceId),
    },
    {
      name: 'Amazon Route53',
      value: {
        name: 'amazon-route53',
        namespace: namespaceId,
        type: 'Opaque',
        labels: {},
        annotations: {},
        data: {
          AWS_ACCESS_KEY_ID: '',
          AWS_SECRET_ACCESS_KEY: '',
        },
      },
    },
    {
      name: 'GoogleCloud DNS',
      value: {
        name: 'google-cloud-dns',
        namespace: namespaceId,
        type: 'Opaque',
        labels: {},
        annotations: {},
        data: {
          'serviceaccount.json': '',
        },
      },
    },
    {
      name: 'AliCloud DNS',
      value: {
        name: 'ali-cloud-dns',
        namespace: namespaceId,
        type: 'Opaque',
        labels: {},
        annotations: {},
        data: {
          ACCESS_KEY_ID: '',
          SECRET_ACCESS_KEY: '',
        },
      },
    },
    {
      name: 'Azure DNS',
      value: {
        name: 'azure-dns',
        namespace: namespaceId,
        type: 'Opaque',
        labels: {},
        annotations: {},
        data: {
          AZURE_SUBSCRIPTION_ID: '',
          AZURE_TENANT_ID: '',
          AZURE_CLIENT_ID: '',
          AZURE_CLIENT_SECRET: '',
        },
      },
    },
    {
      name: 'OpenStack Designate',
      value: {
        name: 'openstack-designate',
        namespace: namespaceId,
        type: 'Opaque',
        labels: {},
        annotations: {},
        data: {
          OS_AUTH_URL: '',
          OS_DOMAIN_NAME: '',
          OS_PROJECT_NAME: '',
          OS_USERNAME: '',
          OS_PASSWORD: '',
          OS_PROJECT_ID: '',
          OS_REGION_NAME: '',
          OS_TENANT_NAME: '',
          OS_APPLICATION_CREDENTIAL_ID: '',
          OS_APPLICATION_CREDENTIAL_NAME: '',
          OS_APPLICATION_CREDENTIAL_SECRET: '',
          OS_DOMAIN_ID: '',
          OS_USER_DOMAIN_NAME: '',
          OS_USER_DOMAIN_ID: '',
        },
      },
    },
    {
      name: 'Cloudflare DNS',
      value: {
        name: 'cloudflare-dns',
        namespace: namespaceId,
        type: 'Opaque',
        labels: {},
        annotations: {},
        data: {
          CLOUDFLARE_API_TOKEN: '',
        },
      },
    },
    {
      name: 'Infoblox',
      value: {
        name: 'infoblox',
        namespace: namespaceId,
        type: 'Opaque',
        labels: {},
        annotations: {},
        data: {
          USERNAME: '',
          PASSWORD: '',
        },
      },
    },
    {
      name: 'Netlify DNS',
      value: {
        name: 'netlify-dns',
        namespace: namespaceId,
        type: 'Opaque',
        labels: {},
        annotations: {},
        data: {
          NETLIFY_AUTH_TOKEN: '',
        },
      },
    },
  ];
}
