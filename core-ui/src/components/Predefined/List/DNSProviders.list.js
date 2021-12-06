import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const DNSProvidersList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
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
        <StatusBadge
          autoResolveType
          additionalContent={dnsprovider.status?.message}
          noTooltip={dnsprovider.status?.state === 'Ready'}
        >
          {dnsprovider.status?.state || 'UNKNOWN'}
        </StatusBadge>
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
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      resourceName="DNS Providers"
      {...otherParams}
    />
  );
};
