import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

export const ServiceBrokersList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('brokers.headers.url'),
      value: ({ spec }) => spec.url,
    },
    {
      header: t('common.headers.status'),
      value: ({ status }) => (
        <StatusBadge autoResolveType>{status.lastConditionState}</StatusBadge>
      ),
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
