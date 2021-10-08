import * as components from '../';

const secretDefs = Object.values(components)
  .filter(component => component.secrets)
  .map(component => component.secrets)
  .flat();
console.log('secretDefs', secretDefs);

export function getSecretDef(type) {
  return secretDefs.find(secret => secret.type === type);
}

export function getSecretTypes() {
  const types = secretDefs
    .map(secret => secret.type)
    .filter(type => type !== 'Opaque');
  return Array.from(new Set(types));
}

export function readFromFile() {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) resolve(null);
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = e =>
        resolve({ name: file.name, content: e.target.result });
    });
    input.click();
  });
}

export const mapObjectValues = (fn, obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  );

export function createSecretTemplate(namespaceId) {
  return {
    type: 'Opaque',
    metadata: {
      name: '',
      namespace: namespaceId,
      labels: {},
      annotations: {},
    },
    data: {},
  };
}

export function createPresets(namespaceId, t) {
  return [
    {
      name: t('secrets.create-modal.presets.default'),
      value: createSecretTemplate(namespaceId),
    },
    ...secretDefs.map(({ title, name, type, data, ...value }) => ({
      name: title || name || type,
      value: {
        ...createSecretTemplate(namespaceId),
        ...value,
        name,
        type,
        data: data?.reduce((acc, key) => ({ ...acc, [key]: '' }), {}),
      },
    })),
  ];
  /*
  return DNSExist
    ? [
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
      ]
    : [
        {
          name: translate('secrets.create-modal.presets.default'),
          value: createSecretTemplate(namespaceId),
        },
      ];
  */
}
