import { useTranslation } from 'react-i18next';

import { SecretList } from 'resources/Secrets/SecretList';
import { useDownloadKubeconfigWithToken } from './useDownloadKubeconfigWithToken';

type GenericSecretsProps = {
  namespace: string;
  filter?: (secret: Record<string, any>) => boolean;
  title: string;
  allowKubeconfigDownload?: boolean;
  prefix?: string;
};

export const GenericSecrets = ({
  namespace,
  filter,
  title,
  allowKubeconfigDownload,
  prefix,
}: GenericSecretsProps) => {
  const { t } = useTranslation();
  const downloadKubeconfig = useDownloadKubeconfigWithToken();

  const downloadSecretKubeconfig = (secret: Record<string, any>) => {
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
      disabledHandler: (secret: Record<string, any>) =>
        secret.type !== 'kubernetes.io/service-account-token',
      handler: downloadSecretKubeconfig,
      tooltip: t('service-accounts.headers.download-kubeconfig'),
    },
  ];

  return (
    <SecretList
      {...{
        displayArrow: false,
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
        disableCreate: true,
        createFormProps: { prefix },
      }}
    />
  );
};
