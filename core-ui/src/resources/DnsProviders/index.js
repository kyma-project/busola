import React from 'react';

export const resourceType = 'DnsProviders';
export const namespaced = true;
export const resourceI18Key = 'dnsproviders.title';

export const List = React.lazy(() => import('./DnsProviderList'));
export const Details = React.lazy(() => import('./DnsProviderDetails'));

export const secrets = (t, { features } = {}) => {
  if (!features?.CUSTOM_DOMAINS?.isEnabled) {
    return [];
  }
  return [
    {
      title: 'Amazon Route53',
      name: 'amazon-route53',
      data: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    },
    {
      title: 'GoogleCloud DNS',
      name: 'google-cloud-dns',
      data: ['serviceaccount.json'],
    },
    {
      title: 'AliCloud DNS',
      name: 'ali-cloud-dns',
      data: ['ACCESS_KEY_ID', 'SECRET_ACCESS_KEY'],
    },
    {
      title: 'Azure DNS',
      name: 'azure-dns',
      data: [
        'AZURE_SUBSCRIPTION_ID',
        'AZURE_TENANT_ID',
        'AZURE_CLIENT_ID',
        'AZURE_CLIENT_SECRET',
      ],
    },
    {
      title: 'OpenStack Designate',
      name: 'openstack-designate',
      data: [
        'OS_AUTH_URL',
        'OS_DOMAIN_NAME',
        'OS_PROJECT_NAME',
        'OS_USERNAME',
        'OS_PASSWORD',
        'OS_PROJECT_ID',
        'OS_REGION_NAME',
        'OS_TENANT_NAME',
        'OS_APPLICATION_CREDENTIAL_ID',
        'OS_APPLICATION_CREDENTIAL_NAME',
        'OS_APPLICATION_CREDENTIAL_SECRET',
        'OS_DOMAIN_ID',
        'OS_USER_DOMAIN_NAME',
        'OS_USER_DOMAIN_ID',
      ],
    },
    {
      title: 'Cloudflare DNS',
      name: 'cloudflare-dns',
      data: ['CLOUDFLARE_API_TOKEN'],
    },
    {
      title: 'Infoblox',
      name: 'infoblox',
      data: ['USERNAME', 'PASSWORD'],
    },
    {
      title: 'Netlify DNS',
      name: 'netlify-dns',
      data: ['NETLIFY_AUTH_TOKEN'],
    },
  ];
};
