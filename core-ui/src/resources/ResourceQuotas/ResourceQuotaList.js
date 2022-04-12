import React from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';
import { ResourceQuotaCreate } from './ResourceQuotaCreate';

export function ResourceQuotaList(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('resource-quotas.headers.limits'),
      value: quota =>
        (quota.spec?.hard && quota.spec?.hard['limits.memory']) ||
        EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('resource-quotas.headers.requests'),
      value: quota =>
        (quota.spec?.hard && quota.spec?.hard['requests.memory']) ||
        EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return (
    <ResourcesList
      resourceName={t('resource-quotas.title')}
      customColumns={customColumns}
      createResourceForm={ResourceQuotaCreate}
      {...props}
    />
  );
}
export default ResourceQuotaList;
