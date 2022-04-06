import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Link } from 'shared/components/Link/Link';

import { ServiceEntryCreate } from './ServiceEntryCreate';

export function ServiceEntryList(props) {
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
      createResourceForm={ServiceEntryCreate}
      {...props}
    />
  );
}
export default ServiceEntryList;
