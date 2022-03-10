import { FormItem, MessageStrip } from 'fundamental-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { randomNameGenerator, K8sNameInput, useGetList } from 'react-shared';

export function CreateServiceBindingForm({
  onChange,
  formElementRef,
  handleFormSubmit,
  namespace,
  setCustomValid,
}) {
  const { i18n } = useTranslation();
  const [name, setName] = useState(randomNameGenerator());

  const [secretName, setSecretName] = useState(name);
  const [secretExist, setSecretExist] = useState(false);

  const { data: secrets } = useGetList()(
    `/api/v1/namespaces/${namespace}/secrets`,
    {
      pollingInterval: 7000,
    },
  );

  const validateSecretName = dd => {
    const secretExist = (secrets || []).some(
      secret => secret.metadata.name === dd,
    );
    setSecretExist(secretExist);
    setCustomValid(!secretExist);
  };

  useEffect(() => {
    validateSecretName(secretName);
  }, [secretName, setCustomValid]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      ref={formElementRef}
      style={{ width: '30em' }}
      onChange={onChange}
      onSubmit={e => {
        e.preventDefault();
        handleFormSubmit(name, secretName);
      }}
      noValidate
    >
      <FormItem>
        <K8sNameInput
          onChange={e => setName(e.target.value)}
          kind="Service Binding"
          i18n={i18n}
          value={name}
        />
      </FormItem>

      <FormItem>
        <K8sNameInput
          onChange={e => {
            setSecretName(e.target.value);
          }}
          label="Secret Name"
          kind="Secret"
          i18n={i18n}
          value={secretName}
          required={false}
        />
      </FormItem>

      {secretExist && (
        <MessageStrip className="fd-margin-top--tiny" type="error">
          Secret with this name already exists.
        </MessageStrip>
      )}
    </form>
  );
}
