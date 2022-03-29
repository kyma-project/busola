import React from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';
import { ResourceQuotasCreate } from '../Create/ResourceQuotas/ResourceQuotas.create';

const ResourceQuotasList = props => {
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
      createResourceForm={ResourceQuotasCreate}
      {...props}
    />
  );
};
export default ResourceQuotasList;
