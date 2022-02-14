import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-shared';

export const ServiceEntriesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('service-entries.headers.resolution'),
      value: serviceEntry => serviceEntry.spec.resolution,
    },
    {
      header: t('service-entries.headers.location'),
      value: serviceEntry => serviceEntry.spec.location,
    },
  ];

  const description = (
    <Trans i18nKey="service-entries.description">
      <Link
        className="fd-link"
        url="https://istio.io/latest/docs/reference/config/networking/service-entry/"
      />
    </Trans>
  );
  return (
    <DefaultRenderer
      description={description}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
