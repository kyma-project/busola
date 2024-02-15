import React from 'react';
import { useTranslation } from 'react-i18next';

import { SecretList } from 'resources/Secrets/SecretList';
import { useDownloadKubeconfigWithToken } from './useDownloadKubeconfigWithToken';

export const GenericSecrets = ({
  namespace,
  filter,
  title,
  allowKubeconfigDownload,
  prefix,
}) => {
  const { t } = useTranslation();
  const downloadKubeconfig = useDownloadKubeconfigWithToken();

  const downloadSecretKubeconfig = secret => {
    if (secret.type !== 'kubernetes.io/service-account-token') return;
    const name = secret.metadata.name;
    const serviceAccountToken = atob(secret.data.token);
    downloadKubeconfig(name, serviceAccountToken);
  };

  const secretsUrl = `/api/v1/namespaces/${namespace}/secrets`;

  const customListActions = allowKubeconfigDownload && [
    {
      name: t('service-accounts.headers.download-kubeconfig'),
      icon: 'download',
      disabledHandler: secret =>
        secret.type !== 'kubernetes.io/service-account-token',
      handler: downloadSecretKubeconfig,
      tooltip: t('service-accounts.headers.download-kubeconfig'),
    },
  ];

  return (
    <SecretList
      {...{
        disableHiding: true,
        name: title,
        hasDetailsView: true,
        resourceUrl: secretsUrl,
        resourceType: 'secrets',
        namespace,
        isCompact: true,
        showTitle: true,
        filter,
        customListActions,
        title,
        readOnly: true,
        createFormProps: { prefix },
      }}
    />
  );
};
