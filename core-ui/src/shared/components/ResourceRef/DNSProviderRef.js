import React from 'react';
import { useGetList } from 'react-shared';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

export function DNSProviderRef({ required, domain, onChange, ...props }) {
  const { t } = useTranslation();
  const url = `/apis/dns.gardener.cloud/v1alpha1/dnsproviders`;
  const { data: providers } = useGetList()(url);

  const domains = (providers || [])
    .map(resource => resource.spec.domains?.include)
    ?.flat();
  const includedDomains = domains.map(domain => ({
    key: domain,
    text: domain,
  }));

  return (
    <ResourceForm.FormField
      required={required}
      label={t('dnsentries.labels.dns-name')}
      propertyPath="$.spec.dnsName"
      setValue={onChange}
      defaultKey={domain}
      input={props => (
        <ResourceForm.Select options={includedDomains} {...props} />
      )}
    />
  );
}
