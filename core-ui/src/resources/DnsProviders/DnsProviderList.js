import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ResourceStatus } from 'shared/components/ResourceStatus/ResourceStatus';
import { Link } from 'shared/components/Link/Link';

import { DnsProviderCreate } from './DnsProviderCreate';

export function DnsProviderList(props) {
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
      createResourceForm={DnsProviderCreate}
      {...props}
    />
  );
}

export default DnsProviderList;
