import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

export const ServiceEntriesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('serviceentries.headers.resolution'),
      value: se => se.spec.resolution,
    },
    {
      header: t('serviceentries.headers.location'),
      value: se => se.spec?.location || EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  const description = (
    <Trans i18nKey="serviceentries.description">
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
