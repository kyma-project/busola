import React from 'react';
import { ComponentForList } from 'shared/getComponents';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

const ServiceAccountSecrets = serviceAccount => {
  const namespace = serviceAccount.metadata.namespace;
  const secretsUrl = `/api/v1/namespaces/${namespace}/secrets`;
  const filterBySecret = secret =>
    serviceAccount.secrets.find(
      ({ name: secretName }) => secret.metadata.name === secretName,
    );

  return (
    <ComponentForList
      name="secretsList"
      key="service-account-secrets"
      params={{
        hasDetailsView: true,
        fixedPath: true,
        resourceUrl: secretsUrl,
        resourceType: 'secrets',
        namespace,
        isCompact: true,
        showTitle: true,
        filter: filterBySecret,
      }}
    />
  );
};
const ServiceAccountImagePullSecrets = serviceAccount => {
  const namespace = serviceAccount.metadata.namespace;
  const serviceAccountsUrl = `/api/v1/namespaces/${namespace}/serviceaccounts/${serviceAccount.name}/imagePullSecrets`;

  const displayImagePullSecret = serviceAccount => {
    if (!serviceAccount.imagePullSecrets) return;
    console.log(serviceAccount.imagePullSecrets);
    return serviceAccount.imagePullSecrets.map(obj => obj.name);
  };
  return (
    <ComponentForList
      name="secrets"
      key="service-account-imagepullsecrets"
      params={{
        hasDetailsView: true,
        fixedPath: true,
        resourceUrl: serviceAccountsUrl,
        resourceType: 'imagePullSecrets',
        namespace,
        isCompact: true,
        showTitle: true,
        filter: displayImagePullSecret,
      }}
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
