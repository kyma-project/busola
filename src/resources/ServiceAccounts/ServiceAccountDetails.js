import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GenericSecrets } from './GenericSecrets';
import { ServiceAccountTokenStatus } from 'shared/components/ServiceAccountTokenStatus';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import ServiceAccountCreate from './ServiceAccountCreate';
import { Button } from '@ui5/webcomponents-react';
import { TokenRequestModal } from './TokenRequestModal/TokenRequestModal';
import { ResourceDescription } from 'resources/ServiceAccounts';

const ServiceAccountSecrets = serviceAccount => {
  const namespace = serviceAccount.metadata.namespace;
  const listKey = 'service-account-secrets';
  const title = 'Secrets';

  const filterBySecret = secret => {
    const annotations = Object.entries(secret.metadata.annotations ?? {});
    return annotations.find(
      ([key, value]) =>
        key === 'kubernetes.io/service-account.name' &&
        value === serviceAccount.metadata.name,
    );
  };

  return (
    <GenericSecrets
      key={listKey}
      namespace={namespace}
      filter={filterBySecret}
      listKey={listKey}
      title={title}
      allowKubeconfigDownload
      prefix={serviceAccount.metadata.name}
    />
  );
};

const ServiceAccountImagePullSecrets = serviceAccount => {
  const namespace = serviceAccount.metadata.namespace;
  const listKey = 'service-account-imagepullsecrets';
  const title = 'Image Pull Secrets';
  const filterBySecret = secret =>
    serviceAccount.imagePullSecrets.find(
      ({ name: secretName }) => secret.metadata.name === secretName,
    );

  return serviceAccount.imagePullSecrets ? (
    <GenericSecrets
      key={listKey}
      namespace={namespace}
      filter={filterBySecret}
      listKey={listKey}
      title={title}
      prefix={serviceAccount.metadata.name}
    />
  ) : null;
};

export default function ServiceAccountDetails(props) {
  const { t } = useTranslation();
  const [isTokenModalOpen, setTokenModalOpen] = useState(false);
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

  const headerActions = [
    <Button onClick={() => setTokenModalOpen(true)}>
      {t('service-accounts.token-request.generate')}
    </Button>,
  ];

  return (
    <>
      <ResourceDetails
        customComponents={[
          ServiceAccountSecrets,
          ServiceAccountImagePullSecrets,
        ]}
        customColumns={customColumns}
        createResourceForm={ServiceAccountCreate}
        description={ResourceDescription}
        headerActions={headerActions}
        {...props}
      />
      <TokenRequestModal
        isModalOpen={isTokenModalOpen}
        handleCloseModal={() => setTokenModalOpen(false)}
        namespace={props.namespace}
        serviceAccountName={props.resourceName}
      />
    </>
  );
}
