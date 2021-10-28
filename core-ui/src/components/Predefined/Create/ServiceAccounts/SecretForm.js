import React from 'react';
import { useTranslation } from 'react-i18next';

import { FormFieldset } from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { SecretRef } from 'shared/components/ResourceRef/SecretRef';

export function SingleSecretForm({
  secret = {},
  secrets,
  setSecrets,
  index,
  namespace,
  defaultOpen = false,
}) {
  const { t } = useTranslation();

  const setSecret = ({ name, namespace }) => {
    if (name) {
      secret.name = name;
    }
    if (namespace) {
      secret.namespace = namespace;
    }
    setSecrets([...secrets]);
  };
  return (
    <FormFieldset>
      <SecretRef
        advanced
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
    </FormFieldset>
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
