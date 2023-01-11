import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import { SecretRef } from 'shared/components/ResourceRef/SecretRef';

export function SingleSecretForm({
  secret = {},
  secrets,
  setSecrets,
  index,
  namespace,
}) {
  const { t } = useTranslation();

  const setSecret = ({ name, namespace }) => {
    secret.name = name;
    secret.namespace = namespace;

    setSecrets([...secrets]);
  };

  return (
    <ResourceForm.Wrapper>
      <SecretRef
        title={t('service-accounts.headers.secret')}
        tooltipContent={t('service-accounts.create-modal.tooltips.secrets')}
        fieldSelector="type=kubernetes.io/service-account-token"
        value={{
          name: secret.name || '',
          namespace: secret.namespace || '',
        }}
        setValue={setSecret}
        index={index}
        currentNamespace={namespace}
        noSection={true}
      />
    </ResourceForm.Wrapper>
  );
}

export function SingleSecretInput({
  value: secrets,
  setValue: setSecrets,
  namespace,
}) {
  const { t } = useTranslation();
  return (
    <ResourceForm.CollapsibleSection
      title={t('service-accounts.headers.secret')}
      defaultOpen
      tooltipContent={t('service-accounts.create-modal.tooltips.secrets')}
    >
      <SingleSecretForm
        secret={secrets?.[0]}
        secrets={secrets}
        setSecrets={setSecrets}
        index={0}
        namespace={namespace}
        defaultOpen={true}
      />
    </ResourceForm.CollapsibleSection>
  );
}
