import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  FormItem,
  FormLabel,
  FormInput,
  MessageStrip,
} from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { useCreateServiceBindingUsage, Checkbox, Dropdown } from 'react-shared';
import { SERVICE_BINDINGS_PANEL } from 'components/Lambdas/constants';
import { CONFIG } from 'components/Lambdas/config';

const checkBoxInputProps = {
  style: {
    marginRight: '6px',
  },
};

export default function CreateServiceBindingForm({
  lambda,
  availableServiceInstances = [],
  serviceBindings,
  setPopupModalMessage = () => void 0,
  onChange,
  formElementRef,
  setCustomValid = () => void 0,
}) {
  const createServiceBindingUsageSet = useCreateServiceBindingUsage();
  const { i18n } = useTranslation();

  const [existingInstanceName, setExistingInstanceName] = useState(
    availableServiceInstances[0].metadata.name,
  );
  const [existingSecretName, setExistingSecretName] = useState(null);
  const [envPrefix, setEnvPrefix] = useState('');
  const [createCredentials, setCreateCredentials] = useState(true);
  const [secrets, setSecrets] = useState([]);
  useEffect(() => {
    setCustomValid(false);
  }, [setCustomValid]);

  useEffect(() => {
    if (!existingInstanceName || !serviceBindings?.length) {
      setEnvPrefix('');
      setCreateCredentials(true);
      setSecrets([]);
      return;
    }
    console.log(availableServiceInstances);
    const bindingsForThisInstance = serviceBindings.filter(b => {
      return b?.spec?.instanceRef.name === existingInstanceName;
    });

    setSecrets(bindingsForThisInstance.map(b => b?.spec?.secretName));
    setExistingSecretName(bindingsForThisInstance[0]?.spec?.secretName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingInstanceName, availableServiceInstances]);

  useEffect(() => {
    if (!existingInstanceName) {
      setPopupModalMessage(
        SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .NO_SERVICE_INSTANCE_SELECTED,
      );
      setCustomValid(false);
      return;
    }

    if (!createCredentials && !existingSecretName) {
      setPopupModalMessage(
        SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .NO_SECRET_SELECTED,
      );
      setCustomValid(false);
      return;
    }

    setCustomValid(true);
  }, [
    existingInstanceName,
    createCredentials,
    existingSecretName,
    setCustomValid,
    setPopupModalMessage,
  ]);

  async function handleFormSubmit(e) {
    e.preventDefault();
    const parameters = {
      namespace: lambda.metadata.namespace,
      serviceInstanceName: existingInstanceName,
      serviceBindingUsageParameters: envPrefix
        ? {
            envPrefix: {
              name: envPrefix,
            },
          }
        : undefined,
      usedBy: { name: lambda.metadata.name, kind: CONFIG.functionUsageKind },
      existingSecretName:
        (!createCredentials && existingSecretName) || undefined,
    };

    await createServiceBindingUsageSet(parameters);
  }

  const serviceInstancesOptions = availableServiceInstances?.map(
    ({ metadata }) => ({
      key: metadata.name,
      text: metadata.name,
    }),
  );
  const secretsOptions = secrets?.map(secret => ({
    key: secret,
    text: secret,
  }));

  const noSecretsFound = (
    <MessageStrip dismissible={false} type="information">
      {SERVICE_BINDINGS_PANEL.FORM.NO_SECRETS_FOUND}
    </MessageStrip>
  );

  return (
    <form
      ref={formElementRef}
      style={{ width: '30em' }}
      onChange={onChange}
      onSubmit={handleFormSubmit}
      noValidate
    >
      <FormItem key="serviceInstanceName">
        <Dropdown
          label="Service Instance"
          id="serviceInstanceName"
          options={serviceInstancesOptions}
          onSelect={(_, selected) => {
            setExistingInstanceName(selected.key);
          }}
          selectedKey={existingInstanceName}
          i18n={i18n}
        />
      </FormItem>

      <FormItem key="envPrefix">
        <FormLabel htmlFor="envPrefix">Prefix for injected variables</FormLabel>
        <FormInput
          id="envPrefix"
          placeholder="Set a prefix for variables (optional)"
          type="text"
          value={envPrefix}
          onChange={e => setEnvPrefix(e.target.value)}
        />
      </FormItem>

      {existingInstanceName && (
        <>
          <FormItem key="createCredentials">
            <Checkbox
              name="createCredentials"
              value="Create new Secret"
              inputProps={checkBoxInputProps}
              initialChecked={true}
              onChange={(_, value) => setCreateCredentials(value)}
            >
              Create new Secret
            </Checkbox>
          </FormItem>
          {!createCredentials && secrets.length ? (
            <FormItem key="existingSecretName">
              <Dropdown
                label="Secrets"
                id="existingSecretName"
                options={secretsOptions}
                onSelect={(_, selected) => {
                  setExistingSecretName(selected.key);
                }}
                selectedKey={existingSecretName}
                i18n={i18n}
              />
            </FormItem>
          ) : null}
          {!createCredentials && !secrets.length ? noSecretsFound : null}
        </>
      )}
    </form>
  );
}

CreateServiceBindingForm.propTypes = {
  onChange: PropTypes.func,
  onCompleted: PropTypes.func,
  onError: PropTypes.func,
  formElementRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
};
