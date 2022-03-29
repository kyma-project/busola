import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, ResourcesList } from 'react-shared';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { ServiceEntriesCreate } from '../Create/ServiceEntries/ServiceEntries.create';

const ServiceEntriesList = props => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('service-entries.headers.resolution'),
      value: se => se.spec.resolution,
    },
    {
      header: t('service-entries.headers.location'),
      value: se => se.spec?.location || EMPTY_TEXT_PLACEHOLDER,
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
    <ResourcesList
      description={description}
      customColumns={customColumns}
      createResourceForm={ServiceEntriesCreate}
      {...props}
    />
  );
};
export default ServiceEntriesList;
