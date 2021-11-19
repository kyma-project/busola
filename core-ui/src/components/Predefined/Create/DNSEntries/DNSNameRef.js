import React, { useEffect } from 'react';
import { useGetList } from 'react-shared';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

let memoizedProviders = null;
export function DNSNameRef({ required, domain, onChange }) {
  const { t } = useTranslation();
  const url = `/apis/dns.gardener.cloud/v1alpha1/dnsproviders`;
  const { data } = useGetList()(url);
  useEffect(() => {
    if (data) {
      memoizedProviders = data;
    }
  }, [data]);

  const providers = memoizedProviders || data;

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
      value={domain}
      defaultKey={domain}
      placeholder={t('dnsentries.placeholders.dns-name')}
      input={props => (
        <ResourceForm.ComboboxInput
          key="dns-name-select"
          options={includedDomains}
          selectionType="manual"
          {...props}
        />
      )}
    />
  );
}
