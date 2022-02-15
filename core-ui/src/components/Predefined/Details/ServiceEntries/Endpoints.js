import React from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER, GenericList, Labels } from 'react-shared';

export const Endpoints = ({ serviceentry }) => {
  const { t, i18n } = useTranslation();

  const headerRenderer = _ => [
    t('service-entries.headers.endpoints.address'),
    t('service-entries.headers.ports.title'),
    t('common.headers.labels'),
    t('service-entries.headers.endpoints.network'),
    t('service-entries.headers.endpoints.locality'),
    t('service-entries.headers.endpoints.weight'),
    t('service-accounts.name_singular'),
  ];
  const endpoints = serviceentry?.spec?.endpoints;

  const rowRenderer = endpoint => [
    endpoint?.address,
    <Labels labels={endpoint.ports} />,
    <Labels labels={endpoint.labels} />,
    endpoint?.network || EMPTY_TEXT_PLACEHOLDER,
    endpoint?.locality || EMPTY_TEXT_PLACEHOLDER,
    endpoint?.weight || EMPTY_TEXT_PLACEHOLDER,
    endpoint?.serviceAccount || EMPTY_TEXT_PLACEHOLDER,
  ];

  return (
    <GenericList
      key="service-entries-endpoints"
      title={t('service-entries.headers.endpoints.title')}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={endpoints || []}
      i18n={i18n}
      showSearchField={false}
    />
  );
};
