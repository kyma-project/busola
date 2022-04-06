import React from 'react';
import { useTranslation } from 'react-i18next';

import { SecretList } from 'resources/Secrets/SecretList';

import { useDownloadSecretKubeconfig } from './useDownloadSecretKubeconfig';

export const GenericSecrets = ({
  namespace,
  filter,
  title,
  allowKubeconfigDownload,
}) => {
  const { t, i18n } = useTranslation();
  const downloadKubeconfig = useDownloadSecretKubeconfig();

  const secretsUrl = `/api/v1/namespaces/${namespace}/secrets`;

  const customListActions = allowKubeconfigDownload && [
    {
      name: t('service-accounts.headers.download-kubeconfig'),
      icon: 'download',
      disabledHandler: secret =>
        secret.type !== 'kubernetes.io/service-account-token',
      handler: downloadKubeconfig,
      tooltip: t('service-accounts.headers.download-kubeconfig'),
    },
  ];

  return (
    <SecretList
      {...{
        name: title,
        hasDetailsView: true,
        fixedPath: true,
        resourceUrl: secretsUrl,
        resourceType: 'secrets',
        namespace,
        isCompact: true,
        showTitle: true,
        filter,
        customListActions,
        title,
        readOnly: true,
        i18n,
      }}
    />
  );
};
