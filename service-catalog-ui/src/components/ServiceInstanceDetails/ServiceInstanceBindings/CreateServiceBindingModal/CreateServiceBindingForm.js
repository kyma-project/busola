import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormItem, FormLabel, FormInput, Alert } from 'fundamental-react';
import { Checkbox } from 'react-shared';

import { SERVICE_BINDINGS_PANEL } from './constants';

const checkBoxInputProps = {
  style: {
    marginRight: '6px',
  },
};

export default function CreateServiceBindingForm({
  serviceInstance,
  usageKinds = [],
  serviceBindings,
  secrets,
  setPopupModalMessage = () => void 0,
  onChange,
  formElementRef,
  setValidity = () => void 0,
  isOpen = false,
}) {
  // const createServiceBindingUsageSet = useCreateServiceBindingUsage();
  console.log(secrets);
  const [selectedServiceInstance, setSelectedServiceInstance] = useState('');
  const [envPrefix, setEnvPrefix] = useState('');

  const [createCredentials, setCreateCredentials] = useState(true);
  const [existingCredentials, setExistingCredentials] = useState('');

  useEffect(() => {
    setValidity(false);
  }, [setValidity]);

  useEffect(() => {
    if (!selectedServiceInstance) {
      setEnvPrefix('');
      setCreateCredentials(true);
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServiceInstance]);

  useEffect(() => {
    if (!selectedServiceInstance) {
      setPopupModalMessage(
        SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .NO_SERVICE_INSTANCE_SELECTED,
      );
      setValidity(false);
      return;
    }

    if (!createCredentials && !existingCredentials) {
      setPopupModalMessage(
        SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .NO_SECRET_SELECTED,
      );
      setValidity(false);
      return;
    }

    setValidity(true);
  }, [
    selectedServiceInstance,
    createCredentials,
    existingCredentials,
    setValidity,
    setPopupModalMessage,
  ]);

  useEffect(() => {
    console.log('create credentials changed', createCredentials);
    setExistingCredentials('');
  }, [selectedServiceInstance, createCredentials]);

  async function handleFormSubmit(e) {
    e.preventDefault();
    const parameters = {
      // lambdaName: lambda.metadata.name,
      // namespace: lambda.metadata.namespace,
      serviceInstanceName: selectedServiceInstance,
      serviceBindingUsageParameters: envPrefix
        ? {
            envPrefix: {
              name: envPrefix,
            },
          }
        : undefined,
      createCredentials: createCredentials,
      existingCredentials: existingCredentials || undefined,
    };

    // await createServiceBindingUsageSet(parameters);
  }

  const serviceInstancesNames = serviceBindings.map(({ metadata }) => (
    <option value={metadata.name} key={metadata.name}>
      {metadata.name}
    </option>
  ));

  const noSecretsFound = (
    <Alert dismissible={false} type="information">
      {SERVICE_BINDINGS_PANEL.FORM.NO_SECRETS_FOUND}
    </Alert>
  );

  return (
    <form
      ref={formElementRef}
      style={{ width: '30em' }}
      onChange={onChange}
      onSubmit={handleFormSubmit}
    >
      <FormItem key="serviceInstanceName">
        <FormLabel htmlFor="serviceInstanceName">Service Instance</FormLabel>
        <select
          id="serviceInstanceName"
          value={selectedServiceInstance}
          onChange={e => setSelectedServiceInstance(e.target.value)}
          required
        >
          <option value=""></option>
          {serviceInstancesNames}
        </select>
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

      {selectedServiceInstance && (
        <>
          <FormItem key="createCredentials">
            <Checkbox
              name="createCredentials"
              value="Create new Secret"
              inputProps={checkBoxInputProps}
              initialChecked={true}
              onChange={(_, value) => setCreateCredentials(value)}
            />
          </FormItem>
          {console.log(createCredentials, secrets.length)}
          {!createCredentials && secrets.length ? (
            <FormItem key="existingCredentials">
              <FormLabel htmlFor="existingCredentials">Secrets</FormLabel>
              <select
                id="existingCredentials"
                value={existingCredentials}
                onChange={e => setExistingCredentials(e.target.value)}
                required
              >
                <option value=""></option>
                {secrets.map(s => (
                  <option value={s.metadata.name} key={s.metadata.uid}>
                    {s.metadata.name}
                  </option>
                ))}
              </select>
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
