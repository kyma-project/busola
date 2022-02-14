import React from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
export function VirtualServicesDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('service-entries.headers.resolution'),
      value: serviceEntry => serviceEntry.spec.resolution,
    },
    {
      header: t('service-entries.headers.location'),
      value: serviceEntry =>
        serviceEntry.spec?.location || EMPTY_TEXT_PLACEHOLDER,
    },
  ];
  return (
    <DefaultRenderer
      customComponents={[]}
      customColumns={[customColumns]}
      {...otherParams}
    ></DefaultRenderer>
  );
}
