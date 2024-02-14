import React from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceAccountTokenStatus } from 'shared/components/ServiceAccountTokenStatus';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ServiceAccountCreate } from './ServiceAccountCreate';
import { description } from './ServiceAccountDescription';

export function ServiceAccountList(props) {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('service-accounts.headers.auto-mount-token'),
      value: value => (
        <ServiceAccountTokenStatus
          automount={value.automountServiceAccountToken}
        />
      ),
    },
  ];

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      resourceTitle={t('service-accounts.title')}
      {...props}
      createResourceForm={ServiceAccountCreate}
      emptyListProps={{
        subtitleText: t('service-accounts.description'),
        url:
          'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/',
      }}
    />
  );
}

export default ServiceAccountList;
