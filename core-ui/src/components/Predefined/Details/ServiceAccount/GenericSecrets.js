import React from 'react';
import { ComponentForList } from 'shared/getComponents';
import { useTranslation } from 'react-i18next';
import { useDownloadSecretKubeconfig } from './useDownloadSecretKubeconfig';

export const GenericSecrets = ({
  namespace,
  listKey,
  filter,
  title,
  allowKubeconfigDownload,
}) => {
  const { t } = useTranslation();
  const downloadKubeconfig = useDownloadSecretKubeconfig();

  const secretsUrl = `/api/v1/namespaces/${namespace}/secrets`;

  const customListActions = allowKubeconfigDownload && [
    {
      name: t('service-accounts.headers.download-kubeconfig'),
      icon: 'download',
      disabledHandler: secret =>
        secret.type !== 'kubernetes.io/service-account-token',
      handler: downloadKubeconfig,
    },
  ];
  return (
    <ComponentForList
      name={title}
      key={listKey}
      params={{
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
      }}
    />
  );
};
