import React from 'react';
import { ResourceStatus, ResourcesList } from 'react-shared';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-shared';
import { DNSProvidersCreate } from '../Create/DNSProviders/DNSProviders.create';

const DNSProvidersList = props => {
  const { t, i18n } = useTranslation();
  const customColumns = [
    {
      header: t('dnsproviders.headers.type'),
      value: dnsprovider => {
        return dnsprovider.spec.type;
      },
    },
    {
      header: t('dnsproviders.headers.status'),
      value: dnsprovider => (
        <ResourceStatus
          status={dnsprovider.status}
          resourceKind="dnsproviders"
          i18n={i18n}
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="dnsproviders.description">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/03-tutorials/00-api-exposure/apix-01-own-domain"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      resourceName="DNS Providers"
      createResourceForm={DNSProvidersCreate}
      {...props}
    />
  );
};

export default DNSProvidersList;
