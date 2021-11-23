import React, { useEffect } from 'react';
import { useGetList } from 'react-shared';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

let memoizedProviders = null;
export function DNSNameRef({ required, simple, advanced, ...props }) {
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
    <ResourceForm.Wrapper {...props}>
      <ResourceForm.FormField
        id="dns-name-ref"
        required={required}
        simple={simple}
        advanced={advanced}
        label={t('dnsentries.labels.dns-name')}
        propertyPath="$.spec.dnsName"
        input={Inputs.ComboboxInput}
        options={includedDomains}
        selectionType="manual"
        key="dns-name-select"
        placeholder={t('dnsentries.placeholders.dns-name')}
      />
    </ResourceForm.Wrapper>
  );
}
