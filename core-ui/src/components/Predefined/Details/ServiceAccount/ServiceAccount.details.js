import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericSecrets } from './GenericSecrets';
import { ServiceAccountTokenStatus } from 'shared/components/ServiceAccountTokenStatus';

const ServiceAccountSecrets = serviceAccount => {
  const namespace = serviceAccount.metadata.namespace;
  const listKey = 'service-account-secrets';
  const title = 'secretsList';
  const filterBySecret = secret =>
    serviceAccount.secrets.find(
      ({ name: secretName }) => secret.metadata.name === secretName,
    );

  return serviceAccount.secrets ? (
    <GenericSecrets
      namespace={namespace}
      filter={filterBySecret}
      listKey={listKey}
      title={title}
      allowKubeconfigDownload
    />
  ) : null;
};

const ServiceAccountImagePullSecrets = serviceAccount => {
  const namespace = serviceAccount.metadata.namespace;
  const listKey = 'service-account-imagepullsecrets';
  const title = 'imagePullSecretsList';
  const filterBySecret = secret =>
    serviceAccount.imagePullSecrets.find(
      ({ name: secretName }) => secret.metadata.name === secretName,
    );

  return serviceAccount.imagePullSecrets ? (
    <GenericSecrets
      namespace={namespace}
      filter={filterBySecret}
      listKey={listKey}
      title={title}
    />
  ) : null;
};

export const ServiceAccountsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('service-accounts.list.headers.auto-mount-token'),
      value: value => (
        <ServiceAccountTokenStatus
          token={value.automountServiceAccountToken}
        ></ServiceAccountTokenStatus>
      ),
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
