import React from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceAccountTokenStatus } from 'shared/components/ServiceAccountTokenStatus';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ServiceAccountCreate } from './ServiceAccountCreate';
import { Description } from 'shared/components/Description/Description';
import {
  serviceAccountDocsURL,
  serviceAccountI18nDescriptionKey,
} from 'resources/ServiceAccounts/index';

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
      description={
        <Description
          i18nKey={serviceAccountI18nDescriptionKey}
          url={serviceAccountDocsURL}
        />
      }
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
