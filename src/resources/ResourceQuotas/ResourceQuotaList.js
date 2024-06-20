import React from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';
import { ResourceQuotaCreate } from './ResourceQuotaCreate';

export function ResourceQuotaList(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('resource-quotas.headers.limits.cpu'),
      value: quota =>
        quota.spec?.hard?.['limits.cpu'] || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('resource-quotas.headers.limits.memory'),
      value: quota =>
        quota.spec?.hard?.['limits.memory'] || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('resource-quotas.headers.requests.cpu'),
      value: quota =>
        quota.spec?.hard?.['requests.cpu'] ||
        quota.spec?.hard?.cpu ||
        EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('resource-quotas.headers.requests.memory'),
      value: quota =>
        quota.spec?.hard?.['requests.memory'] ||
        quota.spec?.hard?.memory ||
        EMPTY_TEXT_PLACEHOLDER,
    },
  ];
  return (
    <ResourcesList
      disableHiding={true}
      simpleEmptyListMessage={true}
      displayArrow={false}
      resourceTitle={t('resource-quotas.title')}
      customColumns={customColumns}
      {...props}
      createResourceForm={ResourceQuotaCreate}
    />
  );
}

export default ResourceQuotaList;
