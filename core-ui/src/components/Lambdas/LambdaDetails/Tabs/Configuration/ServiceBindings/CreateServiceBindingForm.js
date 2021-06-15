import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  FormItem,
  FormLabel,
  FormInput,
  MessageStrip,
} from 'fundamental-react';

import { useCreateServiceBindingUsage, Checkbox } from 'react-shared';
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
  refetchServiceInstances = () => void 0,
  onChange,
  formElementRef,
  setValidity = () => void 0,
  isOpen = false,
}) {
  const createServiceBindingUsageSet = useCreateServiceBindingUsage();

  const [selectedServiceInstance, setSelectedServiceInstance] = useState('');
  const [envPrefix, setEnvPrefix] = useState('');

  const [createCredentials, setCreateCredentials] = useState(true);
  const [existingCredentials, setExistingCredentials] = useState('');
  const [secrets, setSecrets] = useState([]);

  useEffect(() => {
    setValidity(false);
  }, [setValidity]);

  useEffect(() => {
    if (isOpen) {
      refetchServiceInstances();
    }
  }, [isOpen, refetchServiceInstances]);

  useEffect(() => {
    if (!selectedServiceInstance) {
      setEnvPrefix('');
      setCreateCredentials(true);
      setSecrets([]);
      return;
    }
    const bindingsForThisInstance = serviceBindings.filter(
      b => b.spec.instanceRef.name === selectedServiceInstance,
    );
    setSecrets(bindingsForThisInstance.map(b => b.spec.secretName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServiceInstance, availableServiceInstances]);

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
    setExistingCredentials('');
  }, [selectedServiceInstance, createCredentials]);

  async function handleFormSubmit(e) {
    e.preventDefault();
    const parameters = {
      namespace: lambda.metadata.namespace,
      serviceInstanceName: selectedServiceInstance,
      serviceBindingUsageParameters: envPrefix
        ? {
            envPrefix: {
              name: envPrefix,
            },
          }
        : undefined,
      usedBy: { name: lambda.metadata.name, kind: CONFIG.functionUsageKind },
      existingCredentials: existingCredentials || undefined,
    };

    await createServiceBindingUsageSet(parameters);
  }

  const serviceInstancesNames = availableServiceInstances.map(
    ({ metadata }) => (
      <option value={metadata.name} key={metadata.name}>
        {metadata.name}
      </option>
    ),
  );

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
    >
      <FormItem key="serviceInstanceName">
        <FormLabel htmlFor="serviceInstanceName">Service Instance</FormLabel>
        <select
          id="serviceInstanceName"
          className="fd-form-select"
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
            >
              Create new Secret
            </Checkbox>
          </FormItem>
          {!createCredentials && secrets.length ? (
            <FormItem key="existingCredentials">
              <FormLabel htmlFor="existingCredentials">Secrets</FormLabel>
              <select
                id="existingCredentials"
                className="fd-form-select"
                value={existingCredentials}
                onChange={e => setExistingCredentials(e.target.value)}
                required
              >
                <option value=""></option>
                {secrets.map(s => (
                  <option value={s} key={s}>
                    {s}
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
