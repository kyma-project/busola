import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';
import { GenericSecrets } from './GenericSecrets';

const ServiceAccountSecrets = serviceAccount => {
  const namespace = serviceAccount.metadata.namespace;
  const listKey = 'service-account-secrets';
  const title = 'secretsList';
  const filterBySecret = secret =>
    serviceAccount.secrets.find(
      ({ name: secretName }) => secret.metadata.name === secretName,
    );

  return (
    <GenericSecrets
      namespace={namespace}
      filter={filterBySecret}
      listKey={listKey}
      title={title}
    />
  );
};
const ServiceAccountImagePullSecrets = serviceAccount => {
  const namespace = serviceAccount.metadata.namespace;
  const listKey = 'service-account-imagepullsecrets';
  const title = 'imagePullSecretsList';
  const filterBySecret = secret =>
    serviceAccount.imagePullSecrets.find(
      ({ name: secretName }) => secret.metadata.name === secretName,
    );

  return (
    <GenericSecrets
      namespace={namespace}
      filter={filterBySecret}
      listKey={listKey}
      title={title}
    />
  );
};

export const ServiceAccountsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('service-accounts.list.headers.auto-mount-token'),
      value: value => {
        return (
          <StatusBadge type="info">
            {value.automountServiceAccountToken ? 'enabled' : 'disabled'}
          </StatusBadge>
        );
      },
    },
  ];
  return (
    <DefaultRenderer
      customComponents={[ServiceAccountSecrets, ServiceAccountImagePullSecrets]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
