import React from 'react';
import { ResourceStatus } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const DNSEntriesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t, i18n } = useTranslation();
  const customColumns = [
    {
      header: t('dnsentries.headers.status'),
      value: dnsentry => (
        <ResourceStatus
          status={dnsentry.status}
          resourceKind="dnsentries"
          i18n={i18n}
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="dnsentries.description">
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
      resourceName={t('dnsentries.title')}
      {...otherParams}
    />
  );
};
